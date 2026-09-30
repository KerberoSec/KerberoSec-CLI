# TryHackMe Signed Messages Writeup

---

## first login with username **`admin`** found jwt :

```
eyJ1c2VybmFtZSI6ImFkbWluIn0.aZI7hQ.XVoyiE0Op8_5khGbrviBX6QTsag
```

> ### This token had 3 parts (header.payload.signature), but the payload was garbage (just 4 random bytes), suggesting something was off.

## gobuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.67.176.167:5000
```

<img width="1045" height="534" alt="image" src="https://github.com/user-attachments/assets/688f1174-b164-4e12-bda1-c7a6840e37ee" />

### You found a secret endpoint: http://10.67.176.167:5000/debug

#### The debug logs revealed something crucial:

```
[2026-02-06 14:23:15] Development mode: ENABLED
[2026-02-06 14:23:15] Using deterministic key generation
[2026-02-06 14:23:15] Seed pattern: {username}_lovenote_2026_valentine

[DEBUG] Seed converted to bytes for cryptographic processing
[DEBUG] Seed hashed using SHA256 to produce large numeric material

[DEBUG] Prime derivation step 1:
[DEBUG] Converting SHA256(seed) into a large integer
[DEBUG] Checking consecutive integers until a valid prime is reached
[DEBUG] Prime p selected

[DEBUG] Prime derivation step 2:
[DEBUG] Modifying seed with PKI-related constant (SHA256(seed + b"pki"))
[DEBUG] Hashing modified seed with SHA256
[DEBUG] Converting hash into a large integer
[DEBUG] Checking consecutive integers until a valid prime is reached
[DEBUG] Prime q selected
```

<img width="1494" height="845" alt="image" src="https://github.com/user-attachments/assets/90ca7bce-2bc3-456b-af76-3d4a2bc755fe" />

### What is Deterministic Key Generation?

Normally, RSA keys should be generated using random prime numbers. This system instead generates primes deterministically from a seed based on the username.

The algorithm shown in logs:

1.  Take seed = `{username}_lovenote_2026_valentine`

2.  Calculate p = next_prime(SHA256(seed))

3.  Calculate q = next_prime(SHA256(seed + "pki"))

4.  Use these to create RSA key (n = p×q, e=65537)

### Why is this vulnerable?

Because the key generation is predictable! Anyone who knows:

-   The seed pattern (`{username}_lovenote_2026_valentine`)

-   The algorithm (next prime after SHA256 hash)

Can regenerate the private key for ANY user!

---

### The app claimed "RSA-2048 digital signatures" but when you registered, you got a key that was actually only 509 bits:

```
openssl rsa -in mykey.pem -text -noout
RSA Private-Key: (509 bit, 2 primes)
```

### This is cryptographically weak but wasn't the main vulnerability: the deterministic generation was.

Reconstructing Admin's Private Key
----------------------------------

You wrote a script to generate admin's key using the pattern:

```
import hashlib
from sympy import nextprime

seed = b"admin_lovenote_2026_valentine"

h1 = int(hashlib.sha256(seed).hexdigest(), 16)
p = nextprime(h1)

h2 = int(hashlib.sha256(seed + b"pki").hexdigest(), 16)
q = nextprime(h2)

n = p * q
e = 65537
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)  # This is the private exponent!
```

The PSS Signature Challenge
---------------------------

With small RSA keys (509 bits), standard PSS (Probabilistic Signature Scheme) padding has a challenge: you need to calculate the maximum salt length correctly.

The script you received handled this:

python

def forge_signature(key, message):
    h = SHA256.new(message.encode('utf-8'))

    # Calculate max salt based on key size
    modBits = key.size_in_bits()  # 509 bits
    emLen = (modBits: 1 + 7) // 8  # Encoding length in bytes
    maxSalt = emLen: h.digest_size: 2  # Max salt bytes

    # Sign with correct salt length
    signer = pss.new(key, salt_bytes=maxSalt)
    signature = signer.sign(h)

This ensures the signature is formatted correctly for the small key size.

 The Exploit Path
--------------------

1.  Information Gathering: Found debug endpoint with key generation details

2.  Key Reconstruction: Used the seed pattern to generate admin's private key

3.  Signature Forgery: Used the correct PSS parameters to sign admin's welcome message

4.  Verification: Submitted the forged signature to `/verify` endpoint

5.  Flag Obtained: The server accepted it as authentic and gave the flag

 Why This Works: The Math
-----------------------------

The security of digital signatures relies on the fact that only the holder of the private key can create valid signatures. By reverse-engineering how the private key was generated, you effectively became the holder of admin's private key.

The deterministic generation means:

text

private_key_admin = f("admin")  # f is the deterministic function
private_key_bob = f("bob")      # Same function, different username

So knowing f for one user means you know it for ALL users!

```python
# Save this as solve.py and run it
import hashlib
from sympy import nextprime
from Crypto.PublicKey import RSA
from Crypto.Signature import pss
from Crypto.Hash import SHA256

# --- [ CONFIGURATION ] ---
TARGET_USER = "admin"
# Ensure this is byte-perfect from the page source
TARGET_MESSAGE = "Welcome to LoveNote! Send encrypted love messages this Valentine's Day. Your communications are secured with industry-standard RSA-2048 digital signatures."

def generate_admin_key():
    print(f"[*] Generating 512-bit key for: {TARGET_USER}")
    seed_str = f"{TARGET_USER}_lovenote_2026_valentine"
    seed_bytes = seed_str.encode('utf-8')
    
    # Derive P
    sha256_p = hashlib.sha256(seed_bytes).hexdigest()
    p = nextprime(int(sha256_p, 16))
    
    # Derive Q
    sha256_q = hashlib.sha256(seed_bytes + b"pki").hexdigest()
    q = nextprime(int(sha256_q, 16))
    
    # Construct Key
    n = p * q
    e = 65537
    phi = (p - 1) * (q - 1)
    d = pow(e, -1, phi)
    
    print(f"[*] p = {p}")
    print(f"[*] q = {q}")
    print(f"[*] n = {n}")
    
    return RSA.construct((n, e, d))

def forge_signature(key, message):
    h = SHA256.new(message.encode('utf-8'))
    
    # Calculate max salt based on key size
    modBits = key.size_in_bits()
    emLen = (modBits - 1 + 7) // 8 
    maxSalt = emLen - h.digest_size - 2
    
    print(f"[*] Key Size: {modBits} bits")
    print(f"[*] EM Length: {emLen} bytes")
    print(f"[*] Calculated Max Salt: {maxSalt} bytes")
    
    if maxSalt < 0:
        raise ValueError("Key is too small even for 0 salt!")

    # Sign using the calculated max salt
    signer = pss.new(key, salt_bytes=maxSalt)
    signature = signer.sign(h)
    
    return signature.hex()

# --- [ EXECUTION ] ---
try:
    admin_key = generate_admin_key()
    signature = forge_signature(admin_key, TARGET_MESSAGE)
    
    print("\n" + "="*60)
    print(" >>> FINAL ADMIN SIGNATURE <<< ")
    print("="*60)
    print(signature)
    print("="*60)
    print("\nNow you need to:")
    print("1. Go to the verification page/endpoint")
    print("2. Select user: admin")
    print("3. Paste this signature")
    print("4. Submit to get the flag")

except Exception as e:
    print(f"[!] Error: {e}")
```

<img width="1332" height="478" alt="image" src="https://github.com/user-attachments/assets/15a86edc-de28-4c97-96c7-2f27517748da" />

```
============================================================
 >>> FINAL ADMIN SIGNATURE <<< 
============================================================
0196d6747476ab2d7a4b588ede930f5513e38f23523b7475f0319c802b0a72efdb315ba8c28ffcb4e2f1dc29f5de0b99d7972be3c3234c9a6d54298eace30618
============================================================

```

<img width="1187" height="857" alt="image" src="https://github.com/user-attachments/assets/61305e4b-c407-48ec-8987-eece30d8e0a0" />

