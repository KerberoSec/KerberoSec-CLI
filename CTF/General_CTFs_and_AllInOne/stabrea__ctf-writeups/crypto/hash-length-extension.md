# Hash Length Extension Attack

| Field | Value |
|-------|-------|
| **Category** | Cryptography |
| **Difficulty** | Hard |
| **Points** | 350 |
| **Flag** | `CTF{h4sh_l3ngth_3xt3nd3d}` |
| **Tools** | hash_extender, Python, HashPump |

## Challenge Description

> "Our API uses a MAC to verify request integrity. The server computes `MD5(secret || message)` and checks it against the provided signature. You know one valid message-signature pair. Can you forge a request to access the admin endpoint?"
>
> Valid pair: `message = "user=guest"`, `signature = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"`
>
> Target: Forge a valid signature for a message containing `&admin=true`.

## Analysis

The server uses `H(secret || message)` as a MAC (Message Authentication Code). This construction is fundamentally broken for hash functions built on the Merkle-Damgard construction (MD5, SHA-1, SHA-256) due to the length extension property.

### Merkle-Damgard and Internal State

Merkle-Damgard hash functions process input in fixed-size blocks, maintaining an internal state that is updated with each block. Critically, the final hash output IS the internal state after processing the last block. This means:

1. Given `H(secret || message)`, we know the internal state after processing `secret || message`.
2. We can resume hashing from that state, appending additional data.
3. The result is `H(secret || message || padding || extension)`: a valid hash without knowing the secret.

The only unknown is the length of the secret (needed to compute the correct padding), but we can brute-force this since secrets are typically short (8-32 bytes).

## Exploitation

### Using hash_extender

The `hash_extender` tool automates the attack:

```bash
hash_extender \
  --data "user=guest" \
  --secret-min 8 \
  --secret-max 32 \
  --signature "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6" \
  --format md5 \
  --append "&admin=true" \
  --out-data-format hex
```

This outputs candidate messages and signatures for each possible secret length. Each candidate includes the original message, the MD5 padding bytes, and the appended data.

### Sending Forged Requests

I scripted the brute-force over secret lengths:

```python
import requests
import binascii

# Candidates from hash_extender (secret length 8-32)
candidates = [
    # (forged_message_hex, forged_signature)
    ("757365723d677565737480000000000000000000000000000000000000000000"
     "000000000000000000000000000000009000000000000000"
     "2661646d696e3d74727565",
     "e4f8b2c1d9a0f3e5b7c8d2a1e6f4c3b5"),
    # ... more candidates for different secret lengths
]

for msg_hex, sig in candidates:
    msg = binascii.unhexlify(msg_hex)
    r = requests.get(
        "http://challenge.ctf.local:7070/api/verify",
        params={"message": msg, "signature": sig}
    )
    if "CTF{" in r.text:
        print(f"Secret length found! Flag: {r.text}")
        break
```

At secret length 16, the server accepted the forged MAC and returned: `CTF{h4sh_l3ngth_3xt3nd3d}`

### Understanding the Forged Message

The forged message in bytes is:

```
user=guest                           <- original message
\x80\x00\x00...\x00                  <- MD5 padding (pad to block boundary)
\x90\x00\x00\x00\x00\x00\x00\x00    <- original length in bits (little-endian)
&admin=true                          <- our appended data
```

The server computes `MD5(secret || forged_message)` and gets the same hash we computed: without us ever knowing the secret.

## Underlying Vulnerability

The `H(secret || message)` construction leaks the hash function's internal state through its output. An attacker who knows `H(secret || m1)` can compute `H(secret || m1 || padding || m2)` for any `m2`, producing a valid MAC for a message they control.

This is not a flaw in MD5 specifically: it affects any Merkle-Damgard hash: MD5, SHA-1, SHA-256, SHA-512. The construction itself is the problem.

## Defense and Mitigation

**HMAC** is the correct construction for keyed message authentication:

```
HMAC(K, m) = H((K ^ opad) || H((K ^ ipad) || m))
```

HMAC nests two hash computations with different key derivations, making length extension impossible:

```python
import hmac
import hashlib

secret = b"server_secret_key"
message = b"user=guest"

mac = hmac.new(secret, message, hashlib.sha256).hexdigest()
```

Additional defenses:

- **Never use H(key || message)** as a MAC. This is the single most important takeaway.
- **Use HMAC** from a standard library: do not implement it yourself.
- **Consider modern alternatives**: BLAKE2, KMAC, or Poly1305 are purpose-built MAC algorithms that do not suffer from length extension.
- **SHA-3 (Keccak)** uses a sponge construction instead of Merkle-Damgard and is inherently resistant to length extension, though HMAC is still the recommended practice.

## References

- [Everything You Need to Know About Hash Length Extension Attacks](https://blog.skullsecurity.org/2012/everything-you-need-to-know-about-hash-length-extension-attacks)
- [hash_extender Tool](https://github.com/iagox86/hash_extender)
- [RFC 2104: HMAC](https://datatracker.ietf.org/doc/html/rfc2104)
