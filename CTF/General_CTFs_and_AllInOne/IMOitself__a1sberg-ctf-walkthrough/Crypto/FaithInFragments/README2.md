In RSA, we know that:
`e * d ≡ 1 (mod φ(N))`

This implies:
`e * d - 1 = k * φ(N)`

Since `p` and `q` are 128-bit primes, `φ(N)` is approximately 256 bits. `e * d - 1` is slightly larger, meaning `k` is a small integer that divides `e * d - 1`.

### The Strategy
1. **Factorize** the value `(e * d - 1)`.
2. **Find Prime Factors**: Use these factors to reconstruct `p-1` and `q-1`.
3. **Verify Primes**: Ensure `(p-1) + 1` and `(q-1) + 1` are both prime.
4. **Decrypt**: Once `N = p * q` is found, decrypt the `sealed_message` using `pow(c, d, N)`.