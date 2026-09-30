1. in RSA, we know that:
`e * d ≡ 1 (mod φ(N))`

- this implies:
`e * d - 1 = k * φ(N)`

- since `p` and `q` are 128-bit primes, `φ(N)` is approximately 256 bits. `e * d - 1` is slightly larger, meaning `k` is a small integer that divides `e * d - 1`.

- factorize the value `(e * d - 1)`.
- find prime factors. use these factors to reconstruct `p-1` and `q-1`.
- ensure `(p-1) + 1` and `(q-1) + 1` are both prime.
- once `N = p * q` is found, decrypt the `sealed_message` using `pow(c, d, N)`.

2. get the sealed_message put it on variable `c` <br>get the forever_key put it on variable `d`
3. run `basta.py`