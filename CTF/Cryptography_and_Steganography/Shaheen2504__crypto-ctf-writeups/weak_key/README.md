# weak_key

**Category:** DES Weak Keys

## Vulnerability
DES has 4 known weak keys that produce identical subkeys in every round. This means encrypting twice with a weak key returns the original plaintext: the encryption is self-inverse.

## Approach
Tried all 4 known DES weak keys against the ciphertext in ECB mode. The key `e0e0e0e0f1f1f1f1` successfully decrypted it.

## The 4 DES Weak Keys
- `0101010101010101`
- `fefefefefefefefe`
- `1f1f1f1f0e0e0e0e`
- `e0e0e0e0f1f1f1f1`

## Solve Script
See `solve.py`

## Mitigation
- Never use DES: it is broken
- Use AES-256 instead
