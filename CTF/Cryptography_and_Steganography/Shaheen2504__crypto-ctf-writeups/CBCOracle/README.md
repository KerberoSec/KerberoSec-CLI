# CBCOracle

**Category:** AES-CBC: Padding Oracle Attack

## Vulnerability
The server returned "VALID" or "INVALID" based on PKCS7 padding after decryption: a classic padding oracle. This leaks enough information to decrypt the ciphertext block by block without the key.

## Approach
For each block, modified the previous ciphertext block byte by byte (right to left) to find valid padding. Used the intermediate values XORed with the original ciphertext bytes to recover the full plaintext.

## Key Insight
A padding oracle turns a yes/no response into a full decryption oracle. For each byte position, only 256 guesses are needed: making full decryption feasible with ~3000 server queries per block.

## Solve Script
See `solve.py`

## Mitigation
- Use authenticated encryption (AES-GCM): it detects tampering before decryption
- Never reveal padding error details to clients
- Use `hmac.compare_digest` for constant-time validation
