# Smooth Cipher: Solution Walkthrough

## The Challenge

We're given two files:
- **`sosmooth.py`**: the encryption script (source code)
- **`output.txt`**: the encrypted output (`n` and `c` in hex)

The script encrypts a secret flag using: `c = 3^SECRET mod n`

This is a **Discrete Logarithm Problem (DLP)**: given `c`, `3`, and `n`, find `SECRET`.

Normally, this is impossibly hard for large numbers. But the primes used here are **not random**: they're *smooth*, and that's the fatal weakness.

---

## Understanding the Vulnerability

### What are "smooth" primes?

A number is called **B-smooth** if all of its prime factors are ≤ B.

Looking at `generate_smooth_prime()` in the source code:
- It builds `p - 1` as a product of small primes (16-17 bits each)
- Then adds 1 to make `p` itself prime
- Result: `p` is prime, but `p - 1` is made entirely of tiny factors

This is like building a vault door out of cardboard: it *looks* strong, but the materials are weak.

### Why does smoothness break things?

Two reasons:

1. **Factoring `n` becomes easy**: Pollard's p-1 algorithm can factor `n = p × q` when `p - 1` has only small factors. It exploits the fact that if you know all the small factors of `p - 1`, you can compute a value that reveals `p`.

2. **Solving the discrete log becomes easy**: The Pohlig-Hellman algorithm can solve `3^x ≡ c (mod p)` efficiently when `p - 1` is smooth. Instead of one giant problem, it breaks it into many tiny sub-problems (one per small factor of `p - 1`).

---

## The Solution: Step by Step

### Step 1: Factor `n` using Pollard's p-1

Since `p - 1` is smooth (all factors ≤ 17 bits ≈ 131072), Pollard's p-1 cracks `n` almost instantly.

**How it works (simplified):**
1. Start with `a = 2`
2. For every prime `q` up to our bound B: compute `a = a^q mod n`
3. After processing all small primes: check `gcd(a - 1, n)`
4. If `p - 1` divides the exponent we used (which it will, since all its factors are small), then `a^(p-1) ≡ 1 (mod p)`, so `p` divides `a - 1`, and the GCD gives us `p`

**Result:** We get `p` and `q = n / p` in about **1 second**.

### Step 2: Factor `p - 1` and `q - 1`

Since `p - 1` and `q - 1` are products of small primes, simple trial division (dividing by every prime up to 2^18) factors them completely.

- `p - 1` had ~62 distinct small prime factors
- `q - 1` had ~63 distinct small prime factors
- Largest factor: only ~17 bits

### Step 3: Solve the Discrete Log with Pohlig-Hellman

Now we solve `3^SECRET ≡ c (mod p)` and `3^SECRET ≡ c (mod q)` separately.

**Pohlig-Hellman (simplified):**

Instead of solving one impossible problem in a group of size `p - 1` (~1024 bits), we:

1. **Break it into sub-problems**: one for each small prime factor of `p - 1`
2. **Solve each sub-problem**: using Baby-Step Giant-Step (BSGS), which is fast for small groups (~16 bits = only ~256 steps each)
3. **Combine the answers**: using the Chinese Remainder Theorem (CRT)

It's like cracking a combination lock one digit at a time instead of trying all combinations at once.

**Result:** ~62 tiny sub-problems solved in **~2 seconds** each for `p` and `q`.

### Step 4: Combine with CRT

We now have:
- `SECRET mod (p-1)`: from solving mod `p`
- `SECRET mod (q-1)`: from solving mod `q`

The Chinese Remainder Theorem combines these into `SECRET mod lcm(p-1, q-1)`, which gives us the full secret.

## Summary

| Step | What | Time |
|------|------|------|
| 1. Factor `n` | Pollard's p-1 (exploits smooth `p-1`) | ~1s |
| 2. Factor `p-1`, `q-1` | Trial division up to 2^18 | instant |
| 3. Discrete log | Pohlig-Hellman + BSGS on ~60 tiny subgroups | ~2s per prime |
| 4. Combine | Chinese Remainder Theorem | instant |
| 5. Decode | Hex → ASCII | instant |
| **Total** | | **~5 seconds** |

## Key Takeaway

The whole attack works because `p - 1` is **smooth** (made of small primes). In real cryptography, primes are chosen so that `p - 1` has at least one very large prime factor (called a **safe prime**, where `p = 2q + 1` for another prime `q`). This makes both Pollard's p-1 and Pohlig-Hellman useless.

The challenge name says it all: "So Smooth": the smoothness of the primes is what makes everything fall apart.
