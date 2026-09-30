# sherlocked

**Category:** XOR Cipher: Known Plaintext Attack

## Vulnerability
The flag was encrypted with a repeating 8-byte XOR key. Since the flag format `FLAG{...}` is known, the key can be recovered directly.

## Approach
- XORed the first 7 ciphertext bytes with the known prefix `FLAG{` to recover key bytes 0-6
- Recovered the 8th key byte by XORing the last ciphertext byte with the known suffix `}`
- Decrypted the full ciphertext by repeating the 8-byte key cyclically

## Key Insight
XOR with a known plaintext directly reveals the key: this is why XOR alone is never secure without a truly random one-time pad.

## Solve Script
See `solve.py`

## Mitigation
- Never use repeating XOR as encryption
- Use authenticated encryption (AES-GCM) instead
