# CanRSAbeBroken

**Category:** RSA: Small Prime Factor

## Vulnerability
The RSA modulus N had a very small prime factor (p=23), making it trivially factorable by trial division.

## Approach
1. Connected to server, obtained N, e=65537, and ciphertext
2. Found p by trial division from 2 upward: p=23 found immediately
3. Computed `q = N / p`, then `phi = (p-1)(q-1)`
4. Recovered private key `d = modular_inverse(e, phi)`
5. Decrypted: `m = pow(c, d, N)`

## Key Insight
RSA security depends entirely on N being hard to factor. Using a small prime factor completely breaks it in milliseconds.

## Solve Script
See `solve.py`

## Mitigation
- Use proper RSA key generation: primes must be large (2048-bit minimum)
- Never generate primes with trial division or small values
