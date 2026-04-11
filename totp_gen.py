import sys
import pyotp

if len(sys.argv) < 2:
    print("Provide secret")
    sys.exit(1)

totp = pyotp.TOTP(sys.argv[1])
print(totp.now())
