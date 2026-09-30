# SmallSubgroup

**Category:** Diffie-Hellman: Small Subgroup Attack

## Vulnerability
The server's Diffie-Hellman implementation was vulnerable to a small subgroup attack. An attacker can send a crafted public key that forces the shared secret to a small, predictable value.

## Approach
Brute-forced all values 1-1000 as the potential shared secret. Derived AES key as `SHA256(str(shared))[:16]` and attempted AES-ECB decryption. `shared=1` produced the flag.

## Key Insight
If the server does not validate that the client's public key is in the correct subgroup, an attacker can send 1 as their public key: forcing `shared = 1^server_private mod p = 1` for any server private key.

## Solve Script
See `solve.py`

## Mitigation
- Always validate public keys are in the correct subgroup before use
- Use modern ECDH with validated curves instead of plain DH
