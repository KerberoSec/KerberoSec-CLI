# Encrypted Activation

**Category:** Crypto (FHE) | **Difficulty:** Hard | **Flag:** `r3ctf{TfHE-f8s_cAn-D0_4nYtHInG-Ob8e0ef63b}`

## TL;DR

The server hands you the *public evaluation keys* of a homemade **TFHE** fully-homomorphic
encryption scheme and asks you to look up values in a table, but the table input `x` arrives
**encrypted** and you have to send back the answer **still encrypted**, without ever knowing the
secret key. The intended solve is to do exactly what FHE is designed for: **evaluate the lookup
table homomorphically** using *programmable bootstrapping*. The one genuinely clever bit is
noticing that a chunk of the bootstrap key doubles as a **"packing key"**, which lets you build a
cheap *tree* of bootstraps instead of an astronomically expensive one. The flag literally spells
it out: *"TFHE-FBS (functional bootstrapping) can do anything."*

## What We're Given

A zip with:

- `task.py`: the server. Each connection runs **16 rounds**. Every round it picks a random
  `x` in `[0, 1024)`, splits it into **5 base-4 digits**, encrypts each digit, and sends them to
  you. You must reply with 5 ciphertexts that decrypt to the 5 base-4 digits of `lut[x]`. Get all
  16 rounds right → it prints the flag. One wrong answer → game over.
- `fhe_core.py`: a small, from-scratch TFHE implementation (the crypto primitives).
- `lut`: a public 1024-entry lookup table (it's just a random permutation of `0..1023`).
- `setup/bsk.bin.original` and `setup/ksk.bin.original`: the **public evaluation keys** for the
  *remote* secret (a bootstrap key and a key-switch key).
- **No** client/secret key. That's the whole point: you never get to see it.

There's also a hard **120-second timeout** per connection (`signal.alarm(120)`), which turns out
to matter a lot.

### A 60-second crash course on TFHE

You don't need to be a cryptographer to follow this, so here's the mental model:

- A **ciphertext** is a big vector of random-looking numbers `a` plus one number `b`, such that
  `b - <a, s>` (a dot product with the secret key `s`) equals your message times a big scaling
  factor `Δ`, plus a tiny bit of random **noise**. Decrypting = compute `b - <a,s>`, round off the
  noise, read the message.
- You can **add** ciphertexts and get the sum of the messages "for free". But that's it: addition
  is easy, everything else is hard.
- **Bootstrapping** is the magic trick that makes FHE work. It takes an encrypted number and, using
  the public **bootstrap key (BSK)**, evaluates *any function you bake into a "test polynomial"* on
  the hidden value: outputting a fresh encryption of the result. This is called **programmable
  bootstrapping (PBS)**. It's how you compute a lookup table on encrypted data.
- The catch: a single PBS can only resolve a *small* value reliably (here, about 8 distinct levels),
  and it only works on a "level-0" ciphertext, so you also need a **key-switch key (KSK)** to
  convert between the two ciphertext types. Both keys are public and both were handed to us.

So the challenge is basically screaming "please evaluate this table homomorphically." The reason
they give you the keys and specifically forbid cheating (more on that below) is that this is the
*intended* path.

## Initial Recon (and a big rabbit hole)

First instinct on a crypto challenge that leaks a bunch of ciphertexts: **can we just recover the
secret key?** The evaluation keys are literally hundreds of thousands of encryptions under the
secret key. And the noise these keys use is *absurdly* small (`α = 2^-52` for a 1024-dimension key: real TFHE would never do that), which smells like a deliberate weakness.

So I went down the lattice road: extract clean LWE samples from the key-switch key, feed them to the
LWE estimator... and got a splash of cold water. Even the cleanest leak comes out to needing lattice
reduction with block size **β ≈ 100** (roughly `2^60` operations). That's the kind of thing that
takes a cluster a week: not a weekend CTF. Key recovery is a **dead end**.

Two things then convinced me the intended path is homomorphic evaluation:

1. The server's answer-checking code has two suspicious guards:
   ```python
   if len(c.a) != 1024:               bad   # must be a real level-1 ciphertext
   zero_cnt = sum(1 for v in c.a if v == 0)
   if zero_cnt > 16:                  bad   # can't be mostly zeros
   if len(set(c.a)) == 1:             bad   # can't be all-equal
   ```
   Those exist **specifically to block trivial forgeries.** You *can* cheaply forge a ciphertext for
   a digit you already know (grab an encryption of zero from the key material, add `Δ·digit`), but
   these checks reject the obvious lazy versions, and even a valid forgery still requires you to
   *know* the answer digit, which means knowing `x`, which means decrypting, which means the key.
   Round and round.
2. The low noise isn't there to leak the key: it's there so that a long chain of homomorphic
   operations stays numerically clean enough to still decrypt correctly at the end.

Verdict: build the homomorphic evaluator.

## The Vulnerability / Trick

Here's the problem with "just evaluate the table." A single PBS reliably distinguishes only ~8
levels, but the table index `x` is a **10-bit** number (1024 entries). You can't feed all 10 bits
into one bootstrap. So you have to split `x` into small digits and combine partial results, and the
naive way to combine encrypted partial results (a big tree of "if this bit, pick A, else B"
multiplexers) explodes into *thousands* of bootstraps. Way too slow for 120 seconds.

**The clever part**: the thing that makes this challenge solvable: is a technique called
**tree-based bootstrapping**, which needs a special extra key called a *packing key* (it lets you
stuff several level-1 ciphertexts into the *coefficients* of one polynomial so you can select among
them with a single rotation instead of a mux tree). Normally you don't have a packing key... but:

> **The bootstrap key already contains one.** Look at how `gen_bsk` builds the BSK: for each secret
> bit `s0_i` it stores several GLWE ciphertexts, and one of them (the `part == k` component) encrypts
> exactly `s0_i · 2^45` under the level-1 key `s1`. A collection of `GLWE_s1(s0_i · gadget)` for all
> `i` is *precisely* a private packing key for turning level-0 ciphertexts into level-1 polynomials.

That's the "aha." I verified it directly: pack a handful of known values into chosen coefficients of
one polynomial, decrypt it under the secret: the values land exactly where they should, with only a
tiny bit of noise. Packing key: acquired, for free, out of a key we were already given.

### Why base-8

How finely can one bootstrap resolve its input? After converting a ciphertext down to the
1024-slot "rotation" space the bootstrap works in, there's an unavoidable rounding noise with
standard deviation ≈ 5 (it's `sqrt(hamming_weight(s0)/12)`). Measuring it over 600 samples: it never
strayed more than 17 away. To be safe you want each distinct value to occupy ≥ ~64 slots →
**8 values per bootstrap** is the reliable sweet spot. So we rewrite the 10-bit index in
**mixed-radix base-8**: three base-8 digits and one leftover bit (`8·8·8·2 = 1024`).

### The circuit (about 742 bootstraps per round)

1. **Form the base-8 digits** `e0,e1,e2` (base-8) and `e3` (a single bit) from the five incoming
   base-4 digits, using 7 bootstraps to re-encode + a few free additions. (E.g.
   `e0 = d0 + 4·(d1 & 1)`, and so on: clean, no carries.)
2. **Candidates:** bootstrap `e0` through the table. For every possible value of the *higher* digits
   `(e1,e2,e3)`: 128 combinations, and every one of the 5 output digits, bake the right slice of
   `lut` into a public test polynomial. That's **640 bootstraps**, but they all rotate by the same
   `e0`, so they share the expensive inner loop and batch beautifully.
3. **Select with the packing key.** Pack the 8 candidates for a given digit into one polynomial
   (spread each into a little "box" so the rounding noise can't miss it), then bootstrap by the
   *select* digit `e1`: the rotation lands on the correct candidate and extracts it. Repeat to fold
   away `e2`, then `e3`. About 95 bootstraps total for all the selects.
4. What's left is 5 level-1 ciphertexts that decrypt (under the remote secret we never saw) to the
   5 base-4 digits of `lut[x]`. Ship them.

Every bootstrap resets the noise, so a deep tree doesn't accumulate garbage: the only thing that
matters is speed.

## Building the Exploit

I wrote the crypto primitives in Python/NumPy first (`fhe_eval.py`) and validated each step by
decrypting with the *local* test key: one PBS re-encodes a digit correctly, the packing lands in the
right coefficients, and a full tree evaluates the table correctly for a sample `x`. Two bugs ate
several hours and are worth remembering:

- **Signed gadget decomposition.** The bootstrap's inner "decompose" step must round the *signed*
  value. My first version rounded the unsigned 64-bit number, which flips values sitting just below
  `+Q/2` to the wrong sign: a `~2^64`-sized error on roughly one coefficient per bootstrap. That's
  invisible most of the time and catastrophic occasionally (output noise `2^61` instead of `2^52`).
  Fix: decompose `(int64)v` with an arithmetic shift.
- **The stock polynomial multiply assumed non-negative inputs.** `fhe_core.poly_mul` packs
  coefficients into one giant integer (a cute Kronecker trick), but a negative decomposed
  coefficient becomes a huge 128-bit number and bleeds into the neighbor. I wrote my own
  small-times-64-bit negacyclic multiply that splits the operand into lo/hi halves and stays exact
  mod `2^64`.

Once it was *correct*, it was *slow*: ~1.4 s per bootstrap in NumPy, and we need ~12,000 of them per
connection. So the heavy math moved to C (`br2.c` → `libbr2.so`, called via `ctypes`):

- Negacyclic multiply mod `2^64` via **NTT** (number-theoretic transform) using **CRT of two
  ~31-bit primes** and **Montgomery reduction**: all integer, all exact.
- Layout the batch of bootstraps with the batch index *innermost* so the compiler auto-vectorizes
  the Montgomery butterflies over the batch (AVX2), and split the work across cores with OpenMP.
- Key-switching and packing also went into C so nothing heavy stays in Python.

The C output was checked **bit-for-bit** against the NumPy reference, then the whole pipeline was
validated: **16/16 rounds correct** locally.

## Running It

The last hurdle was pure comedy. My designated compute box (a 20-core server with a GPU) was
**saturated**: load average 33, busy with *other* challenges' lattice cracking, so it ground out
25 ms/bootstrap and the solve took ~270 s. Way over the 120 s limit. I nearly wrote a whole CUDA
kernel for the idle GPU.

Then I benchmarked my **local laptop** (the Kali VM, only lightly loaded): **7 ms/bootstrap.** The
entire 16-round solve finished in **112.9 s locally**: under the wire. Sometimes the right move
isn't the fancy machine, it's the one that isn't busy.

One important detail: the solver's setup (parsing the 22 MB bootstrap key, precomputing NTT tables)
happens **before** opening the socket, so it doesn't count against the server's 120-second clock.
From connect to flag we only spend the ~114 s of actual round compute.

```
$ python3 solve.py --host challenge.ctf2026.r3kapig.com --port 32434 \
      --bsk extracted/setup/bsk.bin.original --ksk extracted/setup/ksk.bin.original
[init] 0.5s
[round 1] 7.3s
[round 2] 7.2s
...
[round 16] 6.7s
SERVER: r3ctf{TfHE-f8s_cAn-D0_4nYtHInG-Ob8e0ef63b}
```

`solve.py` is the full orchestrator; `fhe_eval.py` has the primitives; `br2.c` is the fast core.

## Key Takeaways

- **Read the guards.** The anti-forgery checks in the answer validator were the tell that the
  intended solve produces *genuine* homomorphic ciphertexts, not clever fakes.
- **Weird parameters have a reason, but not always the obvious one.** The tiny noise looked like a
  key-recovery invite; it was actually there to keep a long homomorphic circuit decryptable.
- **Look for hidden structure in the keys you're given.** The winning move was realizing the
  bootstrap key already *is* a packing key, which is what makes tree bootstrapping (and therefore the
  whole solve) fast enough.
- **Bootstrapping resolution drives the whole design.** Because one PBS only cleanly resolves ~8
  levels, the natural decomposition is base-8, and everything followed from that.
- **Correctness in a slow language first, speed in C second.** Validating every primitive by
  decryption caught two subtle bugs that would've been miserable to debug in optimized C.
- **The flag was the confirmation:** *TFHE functional bootstrapping can do anything*: including
  obliviously evaluating an arbitrary 1024-entry lookup table with nothing but the public keys.
