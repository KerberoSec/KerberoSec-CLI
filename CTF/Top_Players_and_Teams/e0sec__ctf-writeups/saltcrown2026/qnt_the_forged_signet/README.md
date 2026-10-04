# The Forged Signet

| Field | Details |
|-------|---------|
| **Challenge** | The Forged Signet |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Quantum |
| **Flag** | `HTB{th3_f1rst_m4rk_1s_4_h1dd3n_x0r_p3r10d_bec6b1c9b3f37cf299f3a921a74d2a72}` |

---

## Overview

A themed HTTP/JSON front-end ("the Resonance Oracle") wraps a 64-qubit
verifier `f` that promises `f(x) = f(x ⊕ s)` for a secret non-zero 64-bit
string `s`, the "First Mark". This is **Simon's problem**: a function with a
hidden XOR period, exactly the promise Simon's algorithm is built to break
exponentially faster than any classical approach. Recover `s` and submit it
to forge the seal.

---

## The API

```
GET  /api/oracle                        → datasheet: n, promise, circuit, endpoints
POST /api/run   {layer, shots}           → measured input bitstrings
POST /api/forge {s}                      → {forged: bool, flag?}
```

`/api/oracle` spells out the circuit: `H^n . U_f . measure&discard(output) . L
. measure(input)`, with `n = 64` and `L` a single-qubit layer you choose
(applied to every qubit before the input register is measured). Using `L =
H` reproduces the textbook Simon's-algorithm circuit exactly.

---

## The attack: Simon's algorithm, classically post-processed

Each `/api/run` call with `layer: "H"` prepares an equal superposition of all
`x`, evaluates `f`, discards the output register, and re-applies Hadamards to
the input register before measuring. Because `f(x)` and `f(x ⊕ s)` are
indistinguishable to the oracle, the two branches interfere and every
measured bitstring `y` is guaranteed to satisfy:

```
y · s = 0   (mod 2)
```

So each shot doesn't hand over `s`: it hands over one linear constraint on
`s`. Collect enough independent constraints and solve.

```python
import socket, json

HOST, PORT = "<ip>", "<port>"

def http(method, path, body=None):
    s = socket.create_connection((HOST, PORT), timeout=15)
    s.settimeout(15)
    if body is not None:
        b = json.dumps(body).encode()
        req = (f"{method} {path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n"
               f"content-type: application/json\r\ncontent-length: {len(b)}\r\n\r\n").encode() + b
    else:
        req = f"{method} {path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n".encode()
    s.sendall(req)
    data = b""
    while chunk := s.recv(65536):
        data += chunk
    s.close()
    header, _, body = data.partition(b"\r\n\r\n")
    return header.decode(), body

_, oracle = http("GET", "/api/oracle")
n = json.loads(oracle)["n"]                       # 64

_, run = http("POST", "/api/run", {"layer": "H", "shots": 256})
samples = json.loads(run)["samples"]

rows = list(dict.fromkeys(int(s, 2) for s in samples if int(s, 2) != 0))
```

**Gaussian elimination over GF(2)** turns the 256 sampled rows into row-echelon
form (XOR instead of subtraction):

```python
mat, pivots, row_idx = rows[:], {}, 0
for col in range(n - 1, -1, -1):
    sel = next((i for i in range(row_idx, len(mat)) if (mat[i] >> col) & 1), None)
    if sel is None:
        continue
    mat[row_idx], mat[sel] = mat[sel], mat[row_idx]
    piv = mat[row_idx]
    for i in range(len(mat)):
        if i != row_idx and (mat[i] >> col) & 1:
            mat[i] ^= piv
    pivots[col] = row_idx
    row_idx += 1

print(row_idx)   # rank == 63
```

With 256 shots the rank comes out to **63**: one short of the full 64
dimensions, which is expected: `s` itself always satisfies every equation
(`s · s` = parity of shared 1-bits = even = 0), and so does `0`. That leaves a
1-dimensional null space with exactly two points, `0` and `s`. Back-substitute
with the one free column set to `1` to pull out the non-zero solution:

```python
free = [c for c in range(n) if c not in pivots][0]
s_val = 1 << free
for col, ridx in pivots.items():
    row = mat[ridx]
    if bin((row & ~(1 << col)) & s_val).count("1") % 2:
        s_val |= (1 << col)

s = bin(s_val)[2:].zfill(n)
assert all(bin(r & s_val).count("1") % 2 == 0 for r in rows)   # orthogonal to every sample
```

Since the oracle promises `s ≠ 0`, the non-zero point in that null space has
to be the answer. Submit it:

```python
_, forge = http("POST", "/api/forge", {"s": s})
print(json.loads(forge))
```

```json
{"flag": "HTB{th3_f1rst_m4rk_1s_4_h1dd3n_x0r_p3r10d_bec6b1c9b3f37cf299f3a921a74d2a72}", "forged": true}
```

---

## Takeaways

**Simon's problem is the simplest illustration of quantum speed-up over an
exact-period search.** Classically, finding a collision `f(x) = f(x ⊕ s)`
needs on the order of `2^(n/2)` queries (birthday bound); Simon's algorithm
needs only `O(n)` queries plus classical linear algebra, because every
quantum query returns a full linear equation about `s` instead of a single
data point.

**The oracle never leaks `s` directly: it leaks constraints on it.** The
`layer` parameter existing at all (letting you pick `H`, `I`, or any other
single-qubit gate) is a hint that the intended solution is literally "run the
textbook circuit"; no exotic gate choice was needed, just enough shots to hit
`rank = n - 1`.

**A GF(2) null space of dimension 1 has exactly two points, `0` and the
target.** That's what makes the last free variable trivial to fix: there's no
ambiguity to resolve beyond excluding the trivial all-zero solution, which the
challenge's own promise (`s` non-zero) rules out.
