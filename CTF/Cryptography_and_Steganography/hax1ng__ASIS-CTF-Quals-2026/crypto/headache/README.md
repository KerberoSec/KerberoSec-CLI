# Headache

**Category:** Crypto  ·  **Flag:** `ASIS{c0uPleD_n0nL1n3Ar_Dynam!c5_R3c0vEry_v1A_p0l3s_&_l34st_squ4r3s!!}`

## Challenge Description

> *Headache is a haunted math blender. Crack its secret matrices, forge tags, get flag.*

A remote oracle (see `server.py`): we submit a small matrix and receive a
floating-point "tag". Each round uses fresh secret matrices; after querying the oracle we
must predict the tags of six random matrices, and this repeats for seven rounds. The
connection is gated by a 20-bit SHA-256 proof of work.

## Initial Analysis

The constants:

```python
NUM_CHANNELS = 3
DIM = 4
NUM_ROUNDS = 7
TOLERANCE = 1e-6
```

Each of three channels `c` has a secret `4×4` matrix `A_c` and a secret 4-vector `b_c`,
all entries drawn uniformly from `[0.5, 2.0]`. For an input sequence with rows `x_i` and
last row `z`, the server computes per-channel "energies" `e_{c,i} = x_i^T A_c z`, turns
them into softmax weights `w_{c,i} = exp(e_{c,i})` (with a max-subtraction stability
trick that does not change the average), and returns a sum of three weighted averages of
the observables `o_{c,i} = x_i^T b_c`:

```
F(X) = Σ_c  ( Σ_i exp(x_i^T A_c z)·(x_i^T b_c) ) / ( Σ_i exp(x_i^T A_c z) )
```

There are only `3·(4·4 + 4) = 60` unknown floating-point secrets, and we control every
row of `X`. The physics vocabulary ("Hamiltonian coupling tensors", "partition function")
is decoration.

## Vulnerability / Core Concept

The oracle exposes exact, noise-free evaluations of a small, smooth model with reused
parameters within a round, and lets us choose inputs. The trick is a **two-row query**
that collapses the softmax to a sigmoid.

Query matrices of the form

```
X = [ z + d ,  z ]          (last row is z, as required)
```

For one channel the two scores differ only by `d^T A_c z`, and a two-item softmax weight
is exactly the logistic sigmoid `σ(t) = 1/(1+e^{-t})`. The whole response simplifies to:

```
F([z+d, z]) = z·Σ_c b_c  +  Σ_c σ(d^T A_c z)·(d^T b_c)
```

Every response is now a known closed form in our chosen `d`, `z` with only the 60 secret
entries unknown. Collecting hundreds of `(d, z, tag)` triples gives an overdetermined,
smooth nonlinear system that a numerical optimizer recovers exactly (residuals ~`1e-14`,
far under the `1e-6` tolerance). The three channels can be permuted freely: we only need
an equivalent model, not the server's original ordering.

## Exploitation

The full solver is `solve.py`. Per round it collects `NQ = 320` two-row
queries and fits the 60 parameters with `scipy.optimize.least_squares`, using the known
`[0.5, 2.0]` bounds and retrying from random starts until the max residual is tiny:

```python
t = np.einsum('ni,cij,nj->nc', d, A, z)
s = 1 / (1 + np.exp(-t))
u = d @ b.T
pred = np.sum(s * u, axis=1) + z @ b.sum(axis=0)   # fit pred - y
```

Once `A_c`, `b_c` are recovered, challenge sequences of any length are evaluated with the
server's original softmax formula (`evaluate()` in `solve.py`).

**Practical note: pipelining.** The server sleeps 0.03 s per query. Sending one query and
waiting for its reply lets network round-trip latency dominate and the connection dropped
mid-run. The fix is to pipeline all 320 `eval` lines at once, then read 320 replies:

```python
co.f.write(('\n'.join(lines) + '\n').encode())
for i in range(NQ):
    y[i] = co.json()['tag']
```

Run: `python3 solve.py <host> <port>`. A successful round:

```text
[*] recovering round 7
  fit try 1: cost=2.68e-28, max residual=5.33e-15, nfev=23
{'status': 'ok', 'flag': '...', 'message': 'All rounds authenticated! (max_err=8.88e-16)'}
```

## Flag

`ASIS{c0uPleD_n0nL1n3Ar_Dynam!c5_R3c0vEry_v1A_p0l3s_&_l34st_squ4r3s!!}`

## Key Takeaways

- Chosen inputs that reduce a softmax over many items to a **two-item sigmoid** turn a
  scary construction into ordinary curve fitting.
- Exact, noise-free evaluations of a small parameter set + chosen inputs + known bounds =
  a solvable overdetermined nonlinear least-squares problem.
- Pipeline oracle queries when the server adds a per-query delay; otherwise round-trip
  latency, not the delay, kills you.
