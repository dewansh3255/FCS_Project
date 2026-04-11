import urllib.request
import json
import pyotp
import time

url_reg = "http://localhost:8000/api/auth/register/" 
payload = {
    "username": f"cachetest_{int(time.time())}",
    "email": f"test_{int(time.time())}@abc.com",
    "password": "password",
    "phone_number": f"{int(time.time())}"
}

req1 = urllib.request.Request(url_reg, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req1) as response:
        data = json.loads(response.read().decode())
        print("Step 1 Success:", data)
        session_id = data.get("session_id")
        qr_uri = data.get("qr_uri")
        
        secret = pyotp.parse_uri(qr_uri).secret
        otp_code = pyotp.TOTP(secret).now()
        print("Generated Code:", otp_code)
        
        url_vrf = "http://localhost:8000/api/auth/totp/verify/"
        payload_vrf = {"session_id": session_id, "code": otp_code}
        req2 = urllib.request.Request(url_vrf, data=json.dumps(payload_vrf).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req2) as res2:
            print("Step 2 Success:", json.loads(res2.read().decode()))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.read().decode())
except Exception as e:
    print("Failed", e)
