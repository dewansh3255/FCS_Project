import urllib.request
import json
import time

url_reg = "http://localhost:8000/api/auth/register/" 
payload = {
    # Using the EXACT SAME username that was successfully generated above:
    "username": "cachetest_1775920431", 
    "email": f"test_{int(time.time())}@abc.com",
    "password": "password",
    "phone_number": f"{int(time.time())}"
}

req1 = urllib.request.Request(url_reg, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req1) as response:
        print("Success:", json.loads(response.read().decode()))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.read().decode())
