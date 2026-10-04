# CustomCipherService

**Category:** Diffie-Hellman + XOR

## Vulnerability
Custom cipher combining Diffie-Hellman key exchange (with small, known parameters) and XOR with a known key string. Both components were fully reversible with the given parameters.

## Approach
1. Recovered DH shared key: `shared = g^(ab) mod p = 79` (parameters a=94, b=26, p=101, g=37 were given)
2. Reversed the pad step: divided each cipher value by `(shared_key × 123)` to get ASCII values
3. Reversed the XOR step: XORed with key `"netsec"` then reversed the string

## Solve Script
See `solve.py`

## Mitigation
- Never use small DH parameters: p=101 is trivially broken
- Use standardised DH groups (RFC 3526) with 2048-bit minimum primes
