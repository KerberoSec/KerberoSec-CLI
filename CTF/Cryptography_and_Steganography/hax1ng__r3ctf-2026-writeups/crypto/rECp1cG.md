# rECp1cG Writeup

> Casual version: the challenge gave us a walk on an elliptic curve, but each
> x-coordinate was blurred by about 451 bits.  We used the known curve-addition
> formulas to turn those fuzzy coordinates into polynomial equations, used a
> lattice/Coppersmith-style trick to get many “almost magic” equations that hold
> over the integers, then used a 2-adic beam search to recover the hidden error.
> Once we knew one exact point, getting the starting point and decrypting the flag
> was straightforward.

Final flag from the dynamic instance I solved:

```text
r3ctf{3cHNP_ls_s0Oooooo_E2-f0r_thEmAN_U_4rE-c0PpERsmiTh_masteraaaaa0}
```

---

## What the service does

The challenge generates a random elliptic curve over a 1024-bit prime field:

```text
E: y^2 = x^3 + a*x + b mod p
```

It also picks:

- a random starting point `P0`
- a random step point `G`
- 21 consecutive points

```text
P_i = P0 + iG        for i = 0..20
```

The service does **not** print the real x-coordinates.  Instead it prints noisy
versions:

```text
states[i] = x(P_i) - r_i
```

where each unknown error `r_i` is small-ish:

```text
|r_i| <= Delta
Delta = 2^451
```

The goal is to submit the exact `P0.x`.  If we submit the right x-coordinate,
the server gives us `key_tag` and `ct`; then we can recreate the encryption key
and decrypt the flag.

The timeout is 888 seconds, so the solve has to be automated and reasonably fast.

---

## The important observation

For elliptic curves, if we know a point `Q` and have some unknown point `P`,
there is a relation using only x-coordinates:

```text
(x(P+Q) + x(P-Q)) * (x(P) - x(Q))^2
=
2 * (x(P) + x(Q)) * (x(P)*x(Q) + a) + 4b       mod p
```

This is very useful because the service gives us a bunch of consecutive points.

I used the middle printed state, index `10`, as the center:

```text
P_10
```

For each distance `m = 1..10`, the two neighboring points are:

```text
P_10+m = P_10 + mG
P_10-m = P_10 - mG
```

Since `mG` is known, the identity gives one modular polynomial equation for each
symmetric pair.

The unknowns are the hidden errors:

```text
x  = r_10
 y_m = r_10+m + r_10-m
```

So we get 10 equations in 11 small unknowns:

```text
r_10, y_1, y_2, ..., y_10
```

The bounds are small compared to `p`:

```text
|r_10| <= 2^451
|y_m| <= 2^452
```

“Small” is relative here: 451 bits is huge for brute force, but small compared
to a 1024-bit modulus.

---

## Turning modular equations into integer equations

At this point we have polynomial equations that are true modulo `p`, and the
roots are small.  This is exactly the kind of situation where Coppersmith-style
lattice methods are useful.

The implementation built an XHS22-style lattice from the 10 modular equations.
The parameters that worked were:

```text
center = 10
n      = 10
D      = 2
t      = 1
```

The lattice had size roughly:

```text
464 x 464
```

The rough process was:

1. Build the 10 polynomial equations from the elliptic-curve identity.
2. Generate shifted/multiplied versions of them modulo powers of `p`.
3. Scale every monomial by the bound of its variable, so “small root” means
   “short vector”.
4. Run lattice reduction with `flatter`.
5. Convert reduced rows back into polynomial relations.

The key command style was:

```bash
flatter -rhf 1.08
```

This was the expensive part.  On the CTF VM it could take too long if the CPU was
busy.  I offloaded the live solve to `kracken`, where one reduction took about
8.5 minutes.

---

## The annoying part: not every reduced row is useful

In a perfect textbook Coppersmith solve, the reduced lattice gives equations that
are guaranteed to vanish over the integers at the true small root.

Here it was messier.

Many reduced rows were only “almost” useful.  They vanished modulo `p^2`, but not
necessarily over the integers.  If we used bad rows blindly, Hensel lifting would
die after a few bits.

Earlier experiments found that some row indices transferred well between local
instances, but the robust dynamic solver used a better approach: keep all rows
and search for a stable 2-adic branch.

---

## 2-adic beam search, in plain English

Instead of immediately trying to solve all equations exactly, I solved them bit
by bit modulo powers of two:

```text
mod 2
mod 4
mod 8
mod 16
...
```

Why powers of two?  Because the hidden errors are just integers, and if we can
recover enough low bits, we can lift the solution until it covers the full
451-bit bound.

The solver used a beam search:

1. Try all `2^11 = 2048` possible parity patterns for the 11 unknowns.
2. Score each pattern by how many reduced polynomial rows it satisfies modulo 2.
3. Keep many promising states, not just the top one.
4. Extend each state by one more bit.
5. Re-score by counting how many rows still survive.
6. Repeat.

Good instances have a very obvious stable branch: the true root keeps satisfying
a large set of rows while random wrong branches quickly lose rows.

Bad instances do not separate cleanly, so the script aborts and asks the server
for a new dynamic instance.

Example from the successful run:

```text
level 3 top score: 150
level 4 top score: 142
level 5 top score: 141
level 6 top score: 140
```

That was strong enough to validate early.  The script then took the active rows
from that branch and did normal Hensel lifting to 454 bits.

---

## Recovering `P0`

The 2-adic solve gives us the center error:

```text
r_10
```

So we recover the exact middle x-coordinate:

```text
x(P_10) = states[10] + r_10
```

An elliptic-curve x-coordinate has two possible y-coordinates.  Since the prime
was chosen as `p % 4 == 3`, square roots are easy:

```python
y = pow(rhs, (p + 1)//4, p)
```

So we try both:

```text
(x, y)
(x, -y mod p)
```

For each candidate `P_10`, subtract `10G`:

```text
P0 = P_10 - 10G
```

Then validate by regenerating all 21 points and checking that each x-coordinate
is within `Delta` of the printed `states[i]`.

Only one sign passes.

---

## Decrypting the flag

Once the correct `P0.x` is submitted, the server prints:

```text
# ok
key_tag = '...'
ct = '...'
```

The challenge key is:

```python
material = a || b || G.x || G.y || P0.x || P0.y
key = sha256(material + b"|" + key_tag).digest()
```

Then the ciphertext is XORed with a SHA-256 stream generated from that key.
Recreate the stream, XOR it with `ct`, and the flag pops out.

---

## Final solver flow

The final dynamic solver was `solve_live_beamfast.py` using `beam_fast.py`:

1. Connect to the service.
2. Parse `p, a, b, Delta, G, states`.
3. Build the XHS22 lattice.
4. Reduce it with `flatter -rhf 1.08`.
5. Reconstruct reduced polynomial rows.
6. Run the all-row 2-adic beam search.
7. If the instance is weak, abort and retry with a fresh instance.
8. If a stable branch appears, Hensel-lift it to 454 bits.
9. Recover `P0` and submit `P0.x`.
10. Decrypt the returned ciphertext.

Command used for the successful dynamic run:

```bash
HOST=challenge.ctf2026.r3kapig.com \
PORT=30592 \
OMP_NUM_THREADS=18 \
PATH=/home/haxor/rECp1cG_solve/bin:/home/haxor/ctfbin:$PATH \
LD_LIBRARY_PATH=/home/haxor/rECp1cG_solve/lib:/home/haxor/ctfbin:/home/haxor/miniforge3/envs/sage/lib \
BEAM_VALIDATE_MIN_TOP=50 \
BEAM_ABORT_MIN_TOP=40 \
python3 -u solve_live_beamfast.py
```

The first live attempt was weak and aborted.  The second instance had a strong
beam branch and solved in about 573 seconds.

---

## Takeaways

- This is an elliptic-curve hidden number problem with very large errors.
- The obvious small-known-fraction attack from the referenced paper is not enough
  directly because `Delta = 2^451` is huge.
- Pairing points symmetrically around the middle gives clean x-only equations.
- A 464-dimensional Coppersmith-style lattice gives many useful polynomial rows.
- The practical trick was not just lattice reduction; it was selecting the right
  rows dynamically with a 2-adic beam search.
- Since the challenge is dynamic, retrying weak instances is part of the solve.

