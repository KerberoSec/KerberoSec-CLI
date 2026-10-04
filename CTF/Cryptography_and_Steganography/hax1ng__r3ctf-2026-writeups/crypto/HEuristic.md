# HEuristic Writeup

Challenge: **HEuristic**  
CTF: **R3CTF 2026**  
Category: Crypto / Homomorphic Encryption  
Flag: `r3ctf{H3Uri5tlC-delTa-Is_HIdd3n_ln_fUI1y_HOMOMOrpHlc-ENcryption_schemes0}`

---

## TL;DR

The server uses Microsoft SEAL / CKKS-style encryption. It secretly chooses a value called `delta`, and our goal is to recover it.

The important bug is that the service lets us encrypt chosen plaintexts, then decrypt ciphertexts, and the decryption leaks the first 96 plaintext coefficients with only a small amount of random noise added.

So if we choose plaintext coefficients carefully, every leaked coefficient becomes a noisy equation involving the same secret `delta`.

After collecting 96 noisy equations, we shrink the possible range for `delta` until only one value is left. Then we submit that value and get the flag.

---

## What the server does

The service starts by setting up CKKS encryption parameters:

```cpp
parms.set_poly_modulus_degree(4096);
parms.set_coeff_modulus(CoeffModulus::Create(4096, {48, 48, 48, 48, 48}));
```

This gives a large modulus `q`, printed to us at startup:

```text
q = 6277101715473810179849235372514429772715831797744269418497
```

Then the server randomly chooses the secret value:

```cpp
delta = random_below(q - 1, rng) + 1;
```

Our goal is to submit the exact `delta`.

The menu gives us three useful options:

```text
1. encrypt
2. decrypt
3. submit
```

---

## The important encryption behavior

When we ask the server to encrypt a vector of coefficients, each coefficient `m` gets multiplied by the secret `delta` modulo `q`:

```cpp
plain[i + j * coeff_count] = multiply_mod(coeff_rns[i][j], delta_rns[j], moduli[j]);
```

Conceptually, this means the plaintext inside the ciphertext contains:

```text
m * delta mod q
```

So if we control `m`, we get to create multiples of `delta`.

There is one restriction. The server refuses coefficients too close to zero modulo `q`:

```cpp
cpp_int abs_coeff = reduced > q / 2 ? q - reduced : reduced;
if (abs_coeff < q / 8) {
    throw std::invalid_argument("bad plaintext");
}
```

So we cannot directly use tiny values like `1`, `2`, `3`, etc. as plaintext coefficients.

---

## The decryption leak

When we submit a ciphertext to decrypt, the server decrypts it and prints the first 96 coefficients.

For each of those 96 coefficients, it adds or subtracts random noise:

```cpp
cpp_int noise_bound = cpp_int(5) << 185;
...
cpp_int noise = random_below(noise_bound, noise_rng);
...
value = coeffs[i] + noise;
// or
value = coeffs[i] - noise;
```

So the leak is not exact. For each visible coefficient we receive something like:

```text
leak_i = real_i +/- noise mod q
```

where:

```text
noise < 5 * 2^185
```

That sounds like a lot, but `q` is about 192 bits, so the noise is still small enough compared to `q` for us to recover the secret with enough equations.

The server hides all coefficients after index 95:

```cpp
if (i < 96) {
    cout << noisy_value;
} else {
    cout << '*';
}
```

So we get exactly 96 useful leaks.

---

## Turning the leak into equations

If we encrypt a coefficient `m_i`, the real decrypted value is:

```text
m_i * delta mod q
```

The server gives us:

```text
z_i = m_i * delta + small_noise mod q
```

We want equations that look like:

```text
c_i * delta + small_noise mod q
```

with nice increasing multipliers `c_i`.

The plaintext restriction prevents us from directly choosing small `c_i`, but we can use a trick.

Choose an odd number `c_i`, and set:

```text
m_i = (q + c_i) / 2
```

Because `q` is odd and `c_i` is odd, this is an integer.

Then:

```text
2 * m_i = q + c_i
```

Modulo `q`, that means:

```text
2 * m_i = c_i mod q
```

So after decrypting and doubling the leak:

```text
2 * z_i = c_i * delta + small_noise mod q
```

The noise also doubles, but that is fine.

---

## Choosing the multipliers

I used rapidly growing multipliers:

```python
c_0 = 1
c_i = 4^i + 1
```

These are all odd.

Then the plaintext coefficients are:

```python
m_i = (q + c_i) // 2
```

These pass the server's plaintext check because they are near `q / 2`, not near zero.

This is the key trick: we smuggle in small-ish modular multipliers while still giving the server plaintexts that look safely far from zero.

---

## Recovering `delta` with interval shrinking

For each leak, after doubling, we have:

```text
w_i = 2 * z_i mod q
```

and:

```text
w_i = c_i * delta + error_i mod q
```

with:

```text
|error_i| <= E
```

where I used:

```python
E = 2 * (5 << 185) + (1 << 180)
```

The extra `2^180` is just a safety margin for encryption/decryption noise.

For each equation, possible values of `delta` must satisfy:

```text
|c_i * delta - w_i - k*q| <= E
```

for some integer `k`.

This inequality gives intervals of possible `delta` values.

We start with the full range:

```text
0 <= delta < q
```

Then for each leaked coefficient, we intersect the current possible intervals with the new constraint.

Each equation cuts the candidate range down more and more. With the `4^i + 1` multipliers, the candidate interval shrinks very quickly.

On the remote server, the verbose solver output ended like this:

```text
[90] c_bits=181 intervals=    1 total_bits= 10
[91] c_bits=183 intervals=    1 total_bits=  8
[92] c_bits=185 intervals=    1 total_bits=  6
[93] c_bits=187 intervals=    1 total_bits=  1
```

At that point only one possible integer was left, so that integer had to be `delta`.

---

## Solver

The full solver I used is in `solve.py`. The important parts are below.

Generate the special plaintexts:

```python
def make_multipliers(q):
    cs = []
    for i in range(96):
        c = 1 if i == 0 else (1 << (2 * i)) + 1
        cs.append(c)

    coeffs = [(q + c) // 2 for c in cs]
    return cs, coeffs
```

Intersect possible `delta` intervals:

```python
def ceil_div(a, b):
    return -((-a) // b)

def intersect(intervals, c, w, q):
    out = []
    for L, H in intervals:
        k_min = ceil_div(c * L - w - E, q)
        k_max = (c * H - w + E) // q

        for k in range(k_min, k_max + 1):
            lo = ceil_div(w + k * q - E, c)
            hi = (w + k * q + E) // c

            lo = max(lo, L)
            hi = min(hi, H)

            if lo <= hi:
                out.append((lo, hi))

    out.sort()

    merged = []
    for lo, hi in out:
        if merged and lo <= merged[-1][1] + 1:
            merged[-1] = (merged[-1][0], max(merged[-1][1], hi))
        else:
            merged.append((lo, hi))

    return merged
```

Recover the secret:

```python
def recover_delta(q, cs, zs):
    ws = [(2 * z) % q for z in zs]
    intervals = [(0, q - 1)]

    for c, w in zip(cs, ws):
        intervals = intersect(intervals, c, w, q)
        total = sum(hi - lo + 1 for lo, hi in intervals)

        if total == 1:
            return intervals[0][0]

    raise RuntimeError("delta was not unique")
```

---

## Running it

Against the remote server:

```bash
./solve.py --remote challenge.ctf2026.r3kapig.com 30601 -v
```

The solver recovered:

```text
delta = 1293983450339106322225342296444885214767999012266407962444
```

Then it submitted that value and got the flag:

```text
r3ctf{H3Uri5tlC-delTa-Is_HIdd3n_ln_fUI1y_HOMOMOrpHlc-ENcryption_schemes0}
```

---

## Why this worked

The crypto library itself was not really broken here. The issue was the way the challenge wrapped it.

The server accidentally gave us a noisy linear oracle for a secret value:

```text
chosen_multiplier * delta + noise mod q
```

One noisy equation is not enough. But 96 carefully chosen equations are plenty.

The plaintext validation tried to prevent small plaintexts, but the `(q + c) / 2` trick bypassed the spirit of that check. We still gave the server large-looking plaintext values, while mathematically getting small useful multipliers after doubling the leaks.

In short:

1. Choose plaintexts that encode useful multiples of `delta`.
2. Ask the server to encrypt them.
3. Feed the ciphertext back to the decrypt oracle.
4. Read 96 noisy leaked coefficients.
5. Convert each leak into an interval constraint on `delta`.
6. Intersect all constraints.
7. Submit the only remaining candidate.

---

## Final flag

```text
r3ctf{H3Uri5tlC-delTa-Is_HIdd3n_ln_fUI1y_HOMOMOrpHlc-ENcryption_schemes0}
```
