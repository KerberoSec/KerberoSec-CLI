## HV19.21 Happy Christmas 256

Santa has improved since the last Cryptmas and now he uses harder algorithms to secure the flag.

This is his public key:

```
X: 0xc58966d17da18c7f019c881e187c608fcb5010ef36fba4a199e7b382a088072f
Y: 0xd91b949eaf992c464d3e0d09c45b173b121d53097a9d47c25220c0b4beb943c
```

To make sure this is safe, he used the NIST P-256 standard.

But we are lucky and an Elve is our friend. We were able to gather some details from our whistleblower:

Santa used a password and SHA256 for the private key (d)
- His password was leaked 10 years ago
- The password is length is the square root of 256
- The flag is encrypted with AES256
- The key for AES is derived with pbkdf2_hmac, salt: "TwoHundredFiftySix", iterations: 256 * 256 * 256

Phew: Santa seems to know his business: or can you still recover this flag?

```
Hy97Xwv97vpwGn21finVvZj5pK/BvBjscf6vffm1po0=
```

### Solution
For this challenge, we need to find santas password and recover the flag. As the challenge description already mentions, the flag is encrypted with AES256 and a special key derivation method. Without knowing the password, this is impossible to break within the given timeframe. However, we have some more information.

1. Santas password was leaked 10 years ago and is 11 characters long: As rockyou.txt came out approximately 10 years ago, my first guess was to check all 11 character entries of rockyou. 
2. Santa uses the SHA256 of the SAME password, as his private key (`d`) of his ECC key
3. We also know santas public ECC key (`x` & `y`)

Using this information, we could be able to find the correct password. To find the correct entry of rockyou.txt, we try to construct valid ECC keys using the SHA256 of each of the 11-character long entries as private key. If one of them is valid, we found santas password and only need to perform the AES decryption using the same password.

I automated the whole process, using the following python script:

```python
#!/usr/bin/python3

from Crypto.PublicKey import ECC
from Crypto.Cipher import AES
import hashlib
import base64

potential_passwords = []

with open ('./rockyou.txt') as f:
    passwords = f.readlines()
    potential_passwords = list(filter(lambda x: len(x.strip()) == 16, passwords))

print("Found %d potential passwords" % len(potential_passwords))

santas_password = ""

for password in potential_passwords:
    x = 0xc58966d17da18c7f019c881e187c608fcb5010ef36fba4a199e7b382a088072f
    y = 0xd91b949eaf992c464d3e0d09c45b173b121d53097a9d47c25220c0b4beb943c
    d = hashlib.sha256(password.strip().encode('utf-8')).hexdigest()
    try:
        private_key = ECC.construct(curve='NIST P-256', d=int(d,16), point_x =x, point_y =y)
        santas_password = password.strip()
        break
    except:
        continue

print("Found santas password: %s" % santas_password)

encrypted_flag = "Hy97Xwv97vpwGn21finVvZj5pK/BvBjscf6vffm1po0="

def decrypt(encrypted, key, salt, rounds):
    encrypted_bytes = base64.decodebytes(encrypted.encode('utf-8'))
    key = hashlib.pbkdf2_hmac('sha256', key.encode('utf-8'), salt, rounds)
    cipher = AES.new(key, AES.MODE_ECB)
    decrypted = cipher.decrypt(encrypted_bytes)
    return decrypted

flag = decrypt(encrypted_flag, santas_password, b'TwoHundredFiftySix', 256 * 256 * 256)
print(flag)
```

Santas password is: `santacomesatxmas`

In theory, we would be also to find the password by directly trying the AES-decryption with all 11-character long entries of rockyou.txt, but due to the huge number of rounds in the key derivation step, this would take significantly longer.

**Flag:** HV19{sry_n0_crypt0mat_th1s_year}