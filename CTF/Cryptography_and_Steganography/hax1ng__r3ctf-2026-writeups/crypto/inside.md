# Inside

**Category:** Crypto | **Difficulty:** Hard | **Flag:** `r3ctf{To-3Nd-uP_Wh3RE_WE_arE-mEAnt-TO-Be122139}`

## TL;DR

The server wants us to prove knowledge of an RLWE secret without actually giving us the secret. The proof system lets us freely choose the statements being proved, so we craft them so every statement is the group identity, making a zero-witness trivial proof valid. One statement stubbornly stays nonzero due to public data, so we cancel it with the free commitment slot and then run an honest proof for the one sub-statement we do have a witness for.

## What We're Given

Three source files and a live service at `challenge.ctf2026.r3kapig.com:32312`:

- **`sigma.py`**: A Maurer Sigma protocol implementation over secp256k1 (the same curve Bitcoin uses). Provides `CurveHomomorphism` and `MaurerProof`.
- **`rlwe.py`**: Ring Learning With Errors (RLWE) key generation and a proof system that composes three Sigma statements to prove knowledge of an RLWE secret.
- **`task.py`**: The server: generates a CRS and an RLWE instance, then asks us to submit a valid proof. If the proof verifies, it prints the flag.

The challenge flavor text calls it "Crashed PoLwE": a portmanteau of "Proof of knowledge" and "RLWE", and the name "Inside" is a hint: we need to find the hole *inside* the proof system.

The server flow is:
1. Solve a proof-of-work (find a 4-char prefix such that `sha256(prefix + suffix)` equals a target).
2. `[C]`: Get the Common Reference String: `crs[i] = τ^i · G` for i=0..255. The secret `τ` is immediately deleted.
3. `[R]`: Get an RLWE instance `st = (a, b)`. The witness `(s, e, k)` is discarded.
4. `[P]`: Submit `aux` and `proof`. If they verify, get the flag.

The catch: we never learn `(s, e, k)`. We're supposed to be proving knowledge of something we were never given.

## Initial Recon

The challenge title and flavor text immediately suggest looking for a soundness gap in the zero-knowledge proof system. Soundness is the property that says "you can't convince an honest verifier of a false statement": in other words, you can't fake a proof without the actual witness.

Let's understand the moving parts first.

**RLWE in one sentence:** RLWE (Ring Learning With Errors) is a hard lattice problem. You pick secret `s` and tiny error `e` in a polynomial ring, compute `b = a·s + e (mod x^n+1, mod qq)`, and publish `(a, b)`. Recovering `s` from `(a, b)` is believed to be hard even for quantum computers.

**The proof system's goal:** Given public `(a, b)` and CRS, prove you know `(s, e, k)` satisfying `a·s + e = b + k·qq`: i.e., prove you know the RLWE secret without revealing it.

**Sigma protocols (Maurer proofs) in one sentence:** A Sigma protocol is a 3-move interactive proof: commit → challenge → respond. The Fiat-Shamir transform makes it non-interactive by computing the challenge as a hash of the commitment. The key equation being checked is:

```
φ(z) == R + c·Y
```

where `φ` is a linear map (the homomorphism), `Y` is the statement being proved, `R` is the commitment, `c` is the hash-derived challenge, and `z` is the response. An honest prover with witness `x` satisfying `φ(x) = Y` can always satisfy this equation.

**What `encode()` does:** It takes `aux` (auxiliary points we provide) and `crs`, and builds three statement pairs `(φ0, Y0)`, `(φ1, Y1)`, `(φ2, Y2)`. The structure encodes the RLWE relation: each `φi` is a `CurveHomomorphism` (a matrix of elliptic curve points), and the `Yi` are the corresponding statement vectors.

Reading `verify()` in `rlwe.py`:

```python
def verify(self, crs, aux, proof):
    try:
        sts = self.encode(aux, crs)
        assert len(sts) == len(proof)
        return all(
            MaurerProof(st=st).verify(proof)
            for st, proof in zip(sts, proof)
        )
    except:
        return False
```

And `MaurerProof.verify()`:

```python
def verify(self, proof):
    phi, Y = self.st
    R, z = proof
    c = self.oracle(str(R).encode() + str(Y).encode() + str(phi).encode())
    return all(Zi == Ri + c*Yi for Zi, Ri, Yi in zip(phi(z), R, Y))
```

At first glance this looks reasonable. But then it hit us: **the verifier calls `encode(aux, crs)` using the `aux` that WE submitted.** The statements `(φ, Y)` are built from our input. We control `Y`. We control `φ`. And `verify()` just checks the algebraic equation: it never checks whether `aux` was constructed correctly from a legitimate RLWE witness.

This is the hole.

## The Vulnerability / Trick

This is a classic **Fiat-Shamir soundness failure** caused by allowing the prover to influence the statement.

**The key insight:** In a Sigma protocol, if the statement `Y` is the group identity `O` (the "zero" of elliptic curve arithmetic), then the verification equation becomes:

```
φ(z) == R + c·O == R + O == R
```

So you just need `φ(z) == R` for any `z`. The trivially satisfying choice: pick `z = [0, 0, ..., 0]` (all zeros). Then `φ(z) = [O, O, ..., O]`. Set `R = [O, O, ..., O]`. Now `φ(z) = R` trivially, and it verifies with no witness at all.

So the plan is: get `Y0`, `Y1`, `Y2` all equal to the all-`O` vector. Then all three sub-proofs are trivial zero-witness forgeries.

**Making Y1 all-O:** Looking at `encode()`, `Y1` entries are just `aux[1][i][j]`. Set `aux[1] = [[O, O]] * 256`. Done. `Y1` is all `O`.

**Making Y2 into something we have a witness for:** `Y2[i] = aux[2][i]`. The map `φ2` is diagonal: `φ2(z)[i] = z[i] · crs[i]`. If we set `aux[2][i] = m_i · crs[i]` for some integers `m_i` we choose, then `Y2[i] = m_i · crs[i]` and we know the witness `x2 = [m_i]`. We can run an honest Maurer proof for this one. The catch is choosing `m_i` wisely: that's what kills `Y0`.

**Making Y0 all-O: the tricky part:** With `aux[0] = [[O, O]] * 256` (zeroing all the direct `Y0` contributions), `Y0` simplifies to just one remaining term at index 0:

```
Y0[0] = T = qq·Kx + Bx - Ex + sum(Ax)
```

where:
- `Ax[i] = sum(a[j] · crs[(i+j) % n] for j in range(n))`: depends on public `a`
- `Bx = sum(b[i] · crs[i] for i in range(n))`: depends on public `b`
- `Ex = sum(2^0 · aux[1][i][0] + 2^1 · aux[1][i][1] - crs[i]) = -sum(crs[i])` (since aux[1]=O)
- `Kx = sum(aux[2][i] for i in range(n))`: this is under our control via `aux[2]`

Substituting the `aux[1] = O` simplification, `Ex = -S` where `S = sum(crs)`, so `T` reduces to:

```
T = qq·Kx + Bx + (1 + A_sum)·S
```

where `A_sum = sum(a)` (just the sum of all polynomial coefficients, a public integer).

This is nonzero in general because `Bx` and `S` are determined by the public `b` and `crs`. We cannot just hope it's zero.

But we control `Kx = sum(aux[2][i]) = sum(m_i · crs[i])`. We need `T = O`, i.e.:

```
qq · Kx = -(Bx + (1 + A_sum)·S)
qq · sum(m_i · crs[i]) = -sum((b[i] + 1 + A_sum) · crs[i])
```

This holds **coefficient-wise** if we set:

```
m_i = -(b[i] + 1 + A_sum) · qq^{-1}  (mod q)
```

where `q` is the secp256k1 curve order (the scalar field size, ~256-bit prime), and `qq = 3329` (the RLWE modulus). We compute `qq^{-1} mod q` once with `inverse_mod(qq, q)`. This is just modular arithmetic on scalars: no knowledge of `τ` required. The equation holds because each `crs[i] = τ^i · G` is a fixed public point, and scalar multiplication distributes:

```
qq · (sum m_i · crs[i]) == sum (qq · m_i) · crs[i]
                        == sum -(b[i] + 1 + A_sum) · crs[i]
                        == -(Bx + (1 + A_sum)·S)
```

Which makes `T = O`. So `Y0` is all `O`. 

**Summary of the forgery:**
- `aux[0] = [[O, O]] * 256` → `Y0[j≥1] = O`
- `aux[1] = [[O, O]] * 256` → `Y1 = O` entirely
- `aux[2][i] = m_i · crs[i]` with `m_i = -(b[i] + 1 + A_sum) · qq^{-1} mod q` → `Y0[0] = O`
- `Y2[i] = m_i · crs[i]` is nonzero, but we know witness `x2 = [m_i]`, so honest proof works

**Proof construction:**
- `proof0 = ([O]*1025, [0]*512)`: trivial (Y0 all O, φ0 has 1025 outputs, 512 inputs)
- `proof1 = ([O]*1024, [0]*512)`: trivial (Y1 all O, φ1 has 1024 outputs, 512 inputs)
- `proof2 = MaurerProof(st=(φ2, Y2), wit=m).prove()`: honest proof, known witness

The output dimensions (1025 and 1024) come from how `encode()` stacks the sub-statements: `φ0` proves 4 things per coefficient × 256 coefficients + 1 top-level = 1025 outputs, with 2 bits × 256 coefficients = 512 inputs.

There's one more subtle point: we **reuse the challenge's own `sigma.py` and `rlwe.py`** to build `Y` and run `MaurerProof.prove()`. This is crucial. The Fiat-Shamir oracle is `sha256(str(R) + str(Y) + str(φ))`, and Sage's `str()` of EC points and `CurveHomomorphism` objects produces a very specific format. If we tried to reimplement this in pure Python, even a single extra space in the string representation would give a different challenge `c` and the proof would fail. By importing the same code, byte-identical oracle output is guaranteed.

## Building the Exploit

The full exploit runs on kracken (our GPU compute node) because it needs SageMath for the elliptic curve arithmetic. Here's the key logic, step by step.

**Step 1: Solve the PoW**

The server requires a 4-char brute-force: find `prefix` over `[a-zA-Z0-9]` such that `sha256(prefix + suffix) == target`. The search space is about 62^4 ≈ 14.7 million. We parallelize across the 16 cores using `multiprocessing` with the `fork` start method (Python 3.14 defaults to `forkserver` which breaks under `sage-run`: that cost us one debugging session):

```python
_CTX = mp.get_context('fork')

def solve_pow(suffix, target):
    with _CTX.Pool(16, initializer=_init, initargs=(suffix, target)) as p:
        for res in p.imap_unordered(_worker, list(CHARSET)):
            if res:
                p.terminate()
                return res
```

Each worker takes one value for the first character and exhausts all combinations for the remaining three. Finishes in under 1 second.

**Step 2: Get CRS and RLWE instance**

Parse the CRS and statement from the server's output using `ast.literal_eval`: the server prints Sage tuples, and Python's `literal_eval` handles them safely:

```python
crs_raw = ast.literal_eval(line.split('crs = ',1)[1].strip())
crs = [O if t == 0 else E(t) for t in crs_raw]
a, b = list(st_raw[0]), list(st_raw[1])
```

**Step 3: Compute the cancellation scalars**

This is the heart of the attack:

```python
A_sum = sum(int(x) for x in a)
inv_qq = int(inverse_mod(qq, q))       # qq^{-1} mod q, computed once
m = [(-(int(b[i]) + 1 + A_sum) * inv_qq) % q for i in range(n)]
aux2_pts = [Integer(m[i]) * crs[i] for i in range(n)]
```

`A_sum` is just the integer sum of all 256 RLWE `a` coefficients (they're in range `[-1664, 1664]`, so the sum is a small integer). Then we compute `m[i]` mod `q` (the big ~256-bit curve order) for each of the 256 polynomial positions.

**Step 4: Encode and check**

We call the challenge's own `RLWEProof.encode()` to build the statements and assert everything cancelled:

```python
rp = RLWEProof((a, b))
sts = rp.encode(aux_pts, crs)
(phi0, Y0), (phi1, Y1), (phi2, Y2) = sts
assert all(P == O for P in Y0), "Y0 not all O!"
assert all(P == O for P in Y1), "Y1 not all O!"
```

**Step 5: Build the proofs**

```python
proof0 = ([O] * phi0.m, [0] * phi0.n)   # trivial: Y=O, z=0, R=O
proof1 = ([O] * phi1.m, [0] * phi1.n)   # trivial: Y=O, z=0, R=O
x2 = [Integer(mi) for mi in m]
proof2 = MaurerProof(st=sts[2], wit=x2).prove()  # honest, known witness
```

**Step 6: Local self-check before sending**

We verify locally using the exact same verifier code:

```python
ok = RLWEProof((a, b)).verify(crs, aux_pts, proofs)
assert ok, "local verify FAILED"
```

This is cheap insurance: if it fails here, we haven't wasted a server session.

**Step 7: Serialize and send**

The tricky part: the server uses `ast.literal_eval` to parse our input, so we need to send Python literal syntax. EC points go as `(x, y)` tuples (integers), and the identity `O` goes as `0`:

```python
def t2t(P):
    t = point2tuple(P)
    if t == 0: return 0
    return (int(t[0]), int(t[1]))

aux_send = [
    [[0, 0] for _ in range(n)],      # aux[0]: O encoded as (0,0)
    [[0, 0] for _ in range(n)],      # aux[1]: O encoded as (0,0)
    [t2t(P) for P in aux2_pts],       # aux[2]: actual points
]
proof_send = [(list(map(t2t, R)), [int(z) for z in Z]) for (R, Z) in proofs]
```

Then we set a **900-second socket timeout** and wait. The server's `verify()` has to evaluate `φ0(z)` where `φ0` is a 1025×512 matrix of elliptic curve points. Even though `z = [0]*512` (all zeros, so the result is all `O`), Sage still has to iterate through the whole matrix. On the server side this takes 1-2 minutes. Our first attempt used a 60-second timeout and the socket dropped mid-computation: silent failure, empty response. The fix was simply cranking the timeout to 900s.

## Running It

```
[*] PoW suffix=b2YVSbFmZXfdGYGf target=aead770a2439b33b...
[+] PoW prefix=Qnyj in 0.8s
[+] got crs, len=256
[+] got st, len(a)=256 len(b)=256
[+] Y0, Y1 confirmed all O
[+] LOCAL verify() == True
==== SERVER RESPONSE ====
Congratulations!
r3ctf{To-3Nd-uP_Wh3RE_WE_arE-mEAnt-TO-Be122139}
Hope you enjoy!

[FLAG] r3ctf{To-3Nd-uP_Wh3RE_WE_arE-mEAnt-TO-Be122139}
```

PoW: 0.8 seconds. Server verify: roughly 1-2 minutes of waiting. Flag: priceless.

The server's "Hope you enjoy!" message after the flag feels like the challenge author knew exactly how painful the soundness analysis would be and is being warmly sarcastic about it.

## Key Takeaways

**The core lesson: Fiat-Shamir soundness requires a fixed statement.** Sigma protocols are only sound when the statement `Y` is committed to before the challenge is computed. If the prover gets to choose `Y`, they can always set `Y = O` (the identity), which makes `φ(z) = R + c·O = R` verify trivially for `z = 0, R = [O]`. This is not a subtle flaw: it's a fundamental violation of the soundness property. In a real system, `Y` would be a fixed public statement agreed upon before the protocol starts, not something derived from prover-controlled input.

**The CRS doesn't save you from a bad protocol structure.** The server uses a proper "structured reference string" `crs[i] = τ^i · G` with `τ` deleted, which gives the honest RLWE proof its binding property. But none of that matters if the verifier lets the prover redefine what's being proved.

**Coefficient-wise cancellation over a scalar field.** The cancellation `m_i = -(b[i] + 1 + A_sum) · qq^{-1} mod q` works because the equation `qq · (sum m_i · crs[i]) = -sum (b[i]+1+A_sum) · crs[i]` holds by scalar linearity of elliptic curve multiplication. The key insight is that `crs[i] = τ^i · G` with unknown `τ` doesn't prevent this: we're cancelling at the scalar level, not at the point level, and we don't need to know `τ`.

**Reuse the challenge's serialization code, don't reimplement it.** The Fiat-Shamir hash `sha256(str(R) + str(Y) + str(φ))` depends on Sage's specific string representation of EC points and homomorphisms. By importing `sigma.py` and `rlwe.py` directly in our exploit, we guarantee byte-identical oracle computation. Any reimplementation risk is a footgun.

**Practical gotchas worth remembering:**
- `sage-run` under SSH doesn't execute under `if __name__ == '__main__':` guards: call your `main()` at the top level.
- Python 3.14+ defaults to `forkserver` multiprocessing, which breaks under `sage-run`. Use `mp.get_context('fork')` explicitly.
- Server-side verification of large homomorphisms can be very slow even for trivial inputs (all-zero `z` still triggers full matrix evaluation). Budget socket timeouts accordingly: 60 seconds was not enough; 900 seconds was.

**Further reading:**
- [Maurer's unified framework for Sigma protocols](https://eprint.iacr.org/2009/277.pdf): the theoretical foundation for what `sigma.py` implements.
- [The Fiat-Shamir heuristic](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic): how interactive Sigma proofs become non-interactive using a hash oracle.
- RLWE and its use in lattice-based cryptography (CRYSTALS-Kyber/CRYSTALS-Dilithium are real-world examples of this general structure).
