import re

with open('frontend/src/services/api.ts', 'r') as f:
    content = f.read()

# The wrapper code
wrapper_code = """
export const API_BASE_URL = ""; // Base URL for Django API

let isRefreshing = false;
let refreshSubscribers: ((isSuccessful: boolean) => void)[] = [];

const subscribeTokenRefresh = (cb: (isSuccessful: boolean) => void) => {
    refreshSubscribers.push(cb);
}

const onRereshed = (success: boolean) => {
    refreshSubscribers.forEach(cb => cb(success));
    refreshSubscribers = [];
}

export const secureFetch = async (url: string | URL | globalThis.Request, options: RequestInit = {}): Promise<Response> => {
    options.credentials = options.credentials || "include";
    let response = await fetch(url, options);

    const urlStr = url.toString();
    const tokenPaths = ['/login/', '/register/', '/totp/', '/token/refresh/'];
    if (response.status === 401 && !tokenPaths.some(p => urlStr.includes(p))) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (refreshResponse.ok) {
                    onRereshed(true);
                    response = await fetch(url, options);
                } else {
                    onRereshed(false);
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
            } catch (err) {
                onRereshed(false);
            } finally {
                isRefreshing = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((success) => {
                    if (success) {
                        resolve(fetch(url, options));
                    } else {
                        reject(new Error('Token refresh failed'));
                    }
                });
            });
        }
    }
    return response;
};
"""

# Replace the base URL line with the wrapper code
content = re.sub(r'export const API_BASE_URL = "";(.*?\n)?.*Base URL for Django API\n?', wrapper_code, content, count=1)

# Only replace fetch calls that are not in the wrapper itself
# A simple way: find all fetch calls and replace them, except the ones inside the wrapper.
wrapper_end_idx = content.find('export const uploadKeys')

head = content[:wrapper_end_idx]
tail = content[wrapper_end_idx:]

tail = tail.replace('await fetch(', 'await secureFetch(')

with open('frontend/src/services/api.ts', 'w') as f:
    f.write(head + tail)

