# CryptoLock

**Category:** AES-CBC: Weak RNG Seed Recovery

## Vulnerability
A ransomware-style challenge where AES-256-CBC key was generated using Python's `random` module seeded with `int(time.time())`. The seed was recoverable from the encrypted file's modification timestamp.

## Approach
1. Extracted the exact seed from the file modification timestamp using `stat`
2. Reseeded `random` with that timestamp value
3. Reconstructed the 32-byte AES key by regenerating the same random sequence
4. Decrypted the file using AES-256-CBC with fixed IV `0x42 * 16`
5. Extracted the flag from the decrypted DOCX XML

## Key Insight
`random` in Python is not cryptographically secure. Its seed (system time) is predictable and often recoverable from file metadata.

## Solve Script
See `solve.py`

## Mitigation
- Use `os.urandom()` or `secrets` module for cryptographic key generation
- Never use `random` for security-sensitive operations
