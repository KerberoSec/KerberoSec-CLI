---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Crypto: The Last Dance

This challange was for the stream cyphers.

In the `soruce.py` there are multiple points to look for:

1. ChaCha20 is used for encryption
2. key is reused
3. IV (nonce) is reused

Since ChaCha20 is a stream cypher based on XOR, this gives a rather straighhtforward hits what to do. The key is in this equation: `ciphertext1 XOR ciphertext2 = plaintext1 XOR plaintext2` See https://cryptosmith.com/2008/05/31/stream-reuse/ for details

And in fact you got two cyphertext (message and flag) and one plaintext (message).

So, you have to try one-by-one, comparing the equation.

```
c1 = bytes.fromhex("7aa34395a258f5893e3db1822139b8c1f04cfab9d757b9b9cca57e1df33d093f07c7f06e06bb6293676f9060a838ea138b6bc9")
c2 = bytes.fromhex("7d8273ceb459e4d4386df4e32e1aecc1aa7aaafda50cb982f6c62623cf6b29693d86b15457aa76ac7e2eef6cf814ae3a8d39c7")

# Just the part of a message for a length
p1 = b"Our counter agencies have intercepted your messages"

def byte_xor(x1 , x2):
    return bytes(a ^ b for a, b in zip(x1, x2))

p2 = b""

for i in range(1,len(c2)+1):
    # Compute the pattern for processed range
    pattern = byte_xor(c1[:i], c2[:i])
    # Loop the relevant ascii codes
    for ch in range(32, 127):
        current = ch.to_bytes()
        test_pattern = byte_xor(p1[:i], p2+current)
        if pattern == test_pattern:
            # Match found, saving byte and moving on...
            p2 = p2+current
            break

print(p2)
```

And thats it