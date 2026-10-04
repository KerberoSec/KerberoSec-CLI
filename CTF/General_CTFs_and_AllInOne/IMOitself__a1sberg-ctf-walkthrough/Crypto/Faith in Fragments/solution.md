# Solve: Faith in Fragments

## What the challenge gives you

When you connect to the server (`nc 178.128.110.55 7253`), you get:

```
sealed_message: <some big number>
forever_key: <some big number>
Prove you know my heart
>>
```

You also have the source code `proof_of_love.py`.

## Reading the source code

The source uses RSA with romantic variable names. Translating them:

| Code name | What it actually is |
|---|---|
| `heart_a`, `heart_b` | Two secret prime numbers `p` and `q` (128-bit each) |
| `our_world` | The modulus `n = p × q` |
| `promise = 65537` | The public exponent `e` |
| `forever` | The private exponent `d` |
| `sealed_love` | The ciphertext: the encrypted message |
| `my_faith` | A random 16-character alphanumeric string: the secret you need to find |

The server **encrypts** a random string using RSA, then gives you:
- `sealed_message` = the encrypted text (ciphertext `c`)
- `forever_key` = the private key `d`

It does **NOT** give you the modulus `n`.

You need to type back the original random string to get the flag.

## The problem

Normally in RSA, if you have `d` (the private key), decrypting is just:

```
plaintext = pow(ciphertext, d, n)
```

But here **`n` is missing**. You can't decrypt without it.

## How to solve it

### Step 1: Use the math relationship between `e` and `d`

In RSA, `e` and `d` are linked by:

```
e × d ≡ 1 (mod φ(n))
```

Which means:

```
e × d − 1 = k × φ(n)
```

for some integer `k`. You know `e` (it's 65537 from the source) and `d` (the server gives it to you). So you can compute `e × d − 1`. You just don't know `k`.

### Step 2: Figure out what `k` can be

Since both primes are 128-bit, `φ(n)` is about 256 bits. And `e × d − 1` is about 270 bits. So:

```
k ≈ (e × d − 1) / φ(n) ≈ 2^270 / 2^256 ≈ 2^14
```

That means `k` is somewhere in the thousands, and it must be less than `e` (65537). Also, `k` must evenly divide `e × d − 1`.

### Step 3: Factor `e × d − 1`

Use a math library (like sympy) to find all the prime factors of `e × d − 1`. This number is around 270 bits, which is factorable in seconds with modern tools.

Once you have the factorization, you can list every divisor of `e × d − 1` that is under 65537. These are your candidate `k` values.

### Step 4: Find the right `k` and recover `n`

For each candidate `k`:

1. Compute `φ(n) = (e × d − 1) / k`
2. Check that `φ(n)` is about 255-256 bits (since the primes are 128-bit)
3. If it is, you know the factorization of `φ(n)` (because you already factored `e × d − 1` and just divided out `k`)

Now `φ(n) = (p−1) × (q−1)`. Both `p−1` and `q−1` are around 128 bits. You need to split the prime factors of `φ(n)` into two groups: one group multiplies to `p−1`, the other to `q−1`.

### Step 5: Split the factors

Try all possible ways to divide the prime factors into two groups. For each split:

1. Multiply one group → call it `A`
2. The other group's product is `B = φ(n) / A`
3. Check: is `A + 1` prime? Is `B + 1` prime?
4. If both are prime, you found `p = A + 1` and `q = B + 1`
5. Compute `n = p × q`

### Step 6: Decrypt and send

With `n` recovered:

```
plaintext_number = pow(ciphertext, d, n)
```

Convert that number to bytes, decode as ASCII, and you get a 16-character string. Send it back to the server.

## Summary

1. `e` is in the source code, `d` and `c` come from the server
2. `n` is hidden: that's the whole challenge
3. Compute `e × d − 1`, factor it, try small divisors as `k`
4. For the right `k`, split `φ(n)`'s factors into `(p−1)` and `(q−1)`
5. Rebuild `n = p × q`, decrypt, send the plaintext, get the flag
