import requests
import pyotp
import urllib3
import time
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Start Registration Step 1
print("Running Step 1 (Register)")
url_reg = "https://localhost/api/auth/register/" # Or 8000
payload = {
    "username": f"cachetest_{int(time.time())}",
    "email": f"test_{int(time.time())}@abc.com",
    "password": "password",
    "phone_number": f"{int(time.time())}"
}
res_reg = requests.post(url_reg, json=payload, verify=False)
try:
    print(res_reg.json())
    data = res_reg.json()
    session_id = data.get("session_id")
    qr_uri = data.get("qr_uri")
    print(f"Session ID: {session_id}")
    
    # Extract secret from qr_uri
    secret = pyotp.parse_uri(qr_uri).secret
    otp_code = pyotp.TOTP(secret).now()
    print(f"Generated Code: {otp_code}")

    # Start Step 2
    print("Running Step 2 (Verify)")
    url_vrf = "https://localhost/api/auth/totp/verify/"
    payload_vrf = {
        "session_id": session_id,
        "code": otp_code
    }
    res_vrf = requests.post(url_vrf, json=payload_vrf, verify=False)
    print(res_vrf.json())

except Exception as e:
    print("Failed", e)
