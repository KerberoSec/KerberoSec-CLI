# Digestive

Platform: Cryptohack

## Description

> Digestive

`play at:` [digestive](https://web.cryptohack.org/digestive)

Challenge files:
`source.py`:

```python
import hashlib
import json
import string
from ecdsa import SigningKey

SK = SigningKey.generate() # uses NIST192p
VK = SK.verifying_key

class HashFunc:
    def __init__(self, data):
        self.data = data

    def digest(self):
        # return hashlib.sha256(data).digest()
        return self.data

@chal.route('/digestive/sign/<username>/')
def sign(username):
    sanitized_username = "".join(a for a in username if a in string.ascii_lowercase)
    msg = json.dumps({"admin": False, "username": sanitized_username})
    signature = SK.sign(
        msg.encode(),
        hashfunc=HashFunc,
    )

    # remember to remove the backslashes from the double-encoded JSON
    return {"msg": msg, "signature": signature.hex()}

@chal.route('/digestive/verify/<msg>/<signature>/')
def verify(msg, signature):
    try:
        VK.verify(
            bytes.fromhex(signature),
            msg.encode(),
            hashfunc=HashFunc,
        )
    except:
        return {"error": "Signature verification failed"}

    verified_input = json.loads(msg)
    if "admin" in verified_input and verified_input["admin"] == True:
        return {"flag": FLAG}
    else:
        return {"error": f"{verified_input['username']} is not an admin"}
```

## Solution

According to <https://stackoverflow.com/questions/67543512/ecdsa-signing-verifiying-appears-to-be-only-considering-the-first-32-bytes-of-th>, ecdsa only considering the first 32 bytes of the data. This is because ecdsa assume that hash of the data that will be signed. In this case, the data is not hased, so we can modify the data after the first 32 bytes.
We need to change the `"admin": false` to `"admin": true`. It can be done according to <https://stackoverflow.com/questions/5306741/do-json-keys-need-to-be-unique#:~:text=There%20is%20no%20%22error%22%20if,is%20going%20to%20be%20used> by adding the same key after the first 32 bytes.

`test.py`:

```python
import json
from ecdsa.keys import SigningKey, _truncate_and_convert_digest
from ecdsa._compat import normalise_bytes
import requests

SK = SigningKey.generate()  # uses NIST192p
VK = SK.verifying_key

def sign(username):
    r = requests.get(f"https://web.cryptohack.org/digestive/sign/{username}/")
    return json.loads(r.text)

def verify(msg, signature):
    r = requests.get(f"https://web.cryptohack.org/digestive/verify/{msg}/{signature}/")
    return r.text

username = "jack"
data = sign(username)
print(data)
msg1 = data["msg"]
print('msg', msg1)
signature = data["signature"]
digest1 = normalise_bytes(msg1.encode())

msg2 = "{\"admin\": false, \"username\": \"jack\", \"admin\": true}"
print('msg', msg2)
digest2 = normalise_bytes(msg2.encode())

if _truncate_and_convert_digest(digest1, SK.curve, True) == _truncate_and_convert_digest(digest2, SK.curve, True):
    print(verify(msg2, signature))
else:
    print('Digest1 and Digest2 are different ')
```

**flag:** `flag`
