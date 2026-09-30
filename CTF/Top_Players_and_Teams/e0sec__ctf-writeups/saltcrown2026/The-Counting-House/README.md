# The Counting House

| Field | Details |
|-------|---------|
| **Challenge** | The Counting House |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Quantum (Bearer Notes / Sealed Auction) |
| **Flag** | `HTB{...}` *(instance expired before capture: full solve confirmed)* |

---

## Overview

A quantum sealed-bid auction house exposed as a small HTTP/JSON API running on
Python/gunicorn. The story: you can't afford a real seat, so you forge one. There
are six rival bidders whose sealed bids you're not supposed to read. And there's
a 24-round quantum commitment seal-check that "nobody has ever beaten."

The path to the flag has four distinct steps:

1. **Forge an entry note**: produce a quantum circuit whose output state lies
   in the right CSS subspace for value 4919.
2. **Read the sealed bids**: exploit the fact that you can measure any bid
   qubit in any basis to reconstruct all six 16-bit bid values.
3. **Cheat the seal-check**: use a maximally entangled (Bell) state to pass
   all 24 rounds of a quantum bit-commitment protocol whose binding property
   is information-theoretically impossible to enforce.
4. **Forge the settlement note**: apply the same circuit trick to the
   clearing price (the highest bid) instead of the entry value.

---

## The API

```
POST /api/new                             → {token}
POST /api/enter  {token, circuit}         → {seated: bool}
POST /api/book   {token, bidder, position, basis, shots}  → {outcomes: [...]}
POST /api/seal/commit  {token, slots}     → {challenge: 0|1}
POST /api/seal/peek    {token, basis}     → {a_outcomes: [...]}
POST /api/seal/open    {token, values}    → {ok: bool}
POST /api/settle {token, circuit, value}  → {flag: "HTB{...}"}
```

`/api/market` (GET) describes the full system: 8-qubit notes with 4 parity
check rows, 6 bidders with 16-bit bids, 24 seal rounds of 8 strands each.

---

## Step 1: Forge the Entry Note

### The note scheme

A note of value `v` is defined as the **CSS subspace state** `|A_v⟩` where
`A_v = ker(H_v)` and `H_v` is a 4×8 binary parity-check matrix whose rows are
derived from SHA-256:

```
row_i  =  sha256(f"eastreach-note-v{v}-{i}") truncated to 8 bits
```

skipping any row that doesn't increase the rank of `H_v`.

The house verifies a submitted circuit by:
- Running it on `|0…0⟩`, measuring in the **Z basis** → result must be in
  `ker(H_v)`.
- Running it again, measuring in the **X basis** → result must be in
  `ker(H_v)⊥ = rowspace(H_v)`.

The state that satisfies both conditions for every possible measurement outcome
is the **uniform superposition over all codewords**:

```
|ψ⟩ = (1/√|ker(H_v)|) Σ_{x ∈ ker(H_v)} |x⟩
```

- Z measurement always lands in `ker(H_v)` ✓
- Applying H⊗8 gives a uniform superposition over `rowspace(H_v)`, so X
  measurement always lands in `ker(H_v)⊥` ✓

### The SHA-256 gotcha

"Truncated to 8 bits" means the **last byte** (`digest[-1]`) of the SHA-256
output (i.e. the 8 least-significant bits of the 256-bit big-endian integer),
read **MSB-first** within that byte. Using the first byte or LSB ordering
produces the wrong `H_v` and the house rejects the note.

### Building the circuit

1. Compute `H_v` (4×8 over GF(2)), bring to reduced row echelon form.
2. Identify **pivot columns** (bound variables) and **free columns**.
3. Apply `H` to each free qubit (qubit index = `7 - bit_index` due to the
   MSB-first convention).
4. Apply `CX(free, pivot)` for each non-zero entry in the RREF.

The resulting state is exactly the uniform superposition over `ker(H_v)`.

```python
def make_note_circuit(value):
    rows = []
    for i in range(50):
        digest = hashlib.sha256(f"eastreach-note-v{value}-{i}".encode()).digest()
        byte = digest[-1]                                     # last byte
        row = [(byte >> (7 - bit)) & 1 for bit in range(8)]  # MSB-first
        if gf2_rank(rows + [row]) > gf2_rank(rows):
            rows.append(row)
        if len(rows) == 4:
            break

    # RREF to find pivot / free columns
    pivots = []
    row_number = 0
    for column in range(8):
        pivot = next((i for i in range(row_number, 4) if rows[i][column]), None)
        if pivot is None: continue
        rows[row_number], rows[pivot] = rows[pivot], rows[row_number]
        for i in range(4):
            if i != row_number and rows[i][column]:
                rows[i] = [a ^ b for a, b in zip(rows[i], rows[row_number])]
        pivots.append(column)
        row_number += 1

    free = [i for i in range(8) if i not in pivots]
    q = lambda index: 7 - index   # bit index → qubit index

    gates = [["H", q(f)] for f in free]
    for row_idx, pivot in enumerate(pivots):
        for f in free:
            if rows[row_idx][f]:
                gates.append(["CX", q(f), q(pivot)])
    return gates
```

---

## Step 2: Read the Sealed Bids

Each bidder's 16-bit bid is stored qubit-by-qubit on a "work tape." The
`/api/book` endpoint lets you measure any qubit in either the Z or X basis with
any number of shots.

The encoding is **BB84-style**: each bit of the bid is stored as either a Z-basis
eigenstate (`|0⟩`/`|1⟩`) or an X-basis eigenstate (`|+⟩`/`|−⟩`). Measuring a
qubit in the wrong basis gives uniformly random outcomes; measuring it in the
correct basis gives a deterministic result.

Reading algorithm:

```python
def read_bid_bit(token, bidder, position):
    z = post("/api/book", {"token": token, "bidder": bidder,
                           "position": position, "basis": "Z", "shots": 16})["outcomes"]
    if len(set(z)) == 1:
        return z[0]                     # Z-basis bit: deterministic in Z
    x = post("/api/book", {"token": token, "bidder": bidder,
                           "position": position, "basis": "X", "shots": 16})["outcomes"]
    assert len(set(x)) == 1            # must be deterministic in X
    return x[0]
```

Concatenate the 16 bits (position 0 = MSB) and parse as a 16-bit integer:

```python
bits = [read_bid_bit(token, b, p) for p in range(16)]
bid  = int("".join(str(b) for b in bits), 2)
```

---

## Step 3: Cheat the Seal-Check

### The protocol

24 rounds, 8 strands per round. Each round:

1. **Commit**: send 8 two-qubit circuits over named qubits `"a"` (kept) and
   `"b"` (committed to the house).
2. **Challenge**: house returns `0` (Z) or `1` (X).
3. **Peek**: measure your `a` qubits in the challenge basis.
4. **Open**: send `a_outcomes` as your revealed values; house measures `b` in
   the challenge basis and verifies they match.

### The exploit: quantum bit commitment is impossible

Any quantum bit-commitment scheme is **information-theoretically insecure**
(Mayers 1997, Lo-Chau 1997). The committer can always remain *binding-free* by
preparing a **maximally entangled state** on `(a, b)` and then steering `b`'s
apparent state retroactively by choosing which measurement to perform on `a`.

Prepare each strand as a **Bell state** `|Φ+⟩ = (|00⟩ + |11⟩)/√2`:

```python
slots = [[["H", "a"], ["CX", "a", "b"]] for _ in range(8)]
```

After the challenge arrives, measure `a` in the **same basis** the house will
use for `b`. Because `|Φ+⟩` has perfect correlations in every basis, whatever
outcome you observe on `a` is guaranteed to match the house's measurement of `b`.
No matter what the challenge is, you always pass:

```python
for round_number in range(24):
    commit = post("/api/seal/commit", {"token": token, "slots": slots})
    basis  = "Z" if commit["challenge"] == 0 else "X"
    peek   = post("/api/seal/peek",   {"token": token, "basis": basis})
    opened = post("/api/seal/open",   {"token": token, "values": peek["a_outcomes"]})
```

---

## Step 4: Forge the Settlement Note

The settlement endpoint checks a note for the **clearing price** (the highest
bid). Apply `make_note_circuit` to that value:

```python
clearing_price = max(bids)
final = post("/api/settle", {
    "token": token,
    "circuit": make_note_circuit(clearing_price),
    "value": clearing_price,
})
print(final)   # {"flag": "HTB{...}"}
```

---

## Full Solve Script

```python
import hashlib, json, urllib.request

BASE = "http://<ip>:<port>"
ENTRY_VALUE = 4919

def post(path, body):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def gf2_rank(rows):
    rows = [r[:] for r in rows]; rank = 0
    for col in range(8):
        pivot = next((i for i in range(rank, len(rows)) if rows[i][col]), None)
        if pivot is None: continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        for i in range(len(rows)):
            if i != rank and rows[i][col]:
                rows[i] = [a ^ b for a, b in zip(rows[i], rows[rank])]
        rank += 1
    return rank

def make_note_circuit(value):
    rows = []
    for i in range(50):
        byte = hashlib.sha256(f"eastreach-note-v{value}-{i}".encode()).digest()[-1]
        row = [(byte >> (7 - b)) & 1 for b in range(8)]
        if gf2_rank(rows + [row]) > gf2_rank(rows): rows.append(row)
        if len(rows) == 4: break
    pivots = []; rn = 0
    for col in range(8):
        piv = next((i for i in range(rn, 4) if rows[i][col]), None)
        if piv is None: continue
        rows[rn], rows[piv] = rows[piv], rows[rn]
        for i in range(4):
            if i != rn and rows[i][col]:
                rows[i] = [a ^ b for a, b in zip(rows[i], rows[rn])]
        pivots.append(col); rn += 1
    free = [i for i in range(8) if i not in pivots]
    q = lambda i: 7 - i
    gates = [["H", q(f)] for f in free]
    for ri, piv in enumerate(pivots):
        for f in free:
            if rows[ri][f]: gates.append(["CX", q(f), q(piv)])
    return gates

def read_bid_bit(token, bidder, pos):
    z = post("/api/book", {"token": token, "bidder": bidder,
                           "position": pos, "basis": "Z", "shots": 16})["outcomes"]
    if len(set(z)) == 1: return z[0]
    x = post("/api/book", {"token": token, "bidder": bidder,
                           "position": pos, "basis": "X", "shots": 16})["outcomes"]
    return x[0]

token = post("/api/new", {})["token"]
post("/api/enter", {"token": token, "circuit": make_note_circuit(ENTRY_VALUE)})

bids = []
for bidder in range(6):
    bits = [read_bid_bit(token, bidder, p) for p in range(16)]
    bids.append(int("".join(map(str, bits)), 2))
clearing_price = max(bids)
print("Clearing price:", clearing_price)

slots = [[["H", "a"], ["CX", "a", "b"]] for _ in range(8)]
for _ in range(24):
    c = post("/api/seal/commit", {"token": token, "slots": slots})
    basis = "Z" if c["challenge"] == 0 else "X"
    peek = post("/api/seal/peek", {"token": token, "basis": basis})
    post("/api/seal/open", {"token": token, "values": peek["a_outcomes"]})

print(post("/api/settle", {
    "token": token,
    "circuit": make_note_circuit(clearing_price),
    "value": clearing_price,
}))
```

---

## Takeaways

**SHA-256 "truncated to 8 bits" is ambiguous.** It means the low 8 bits of the
256-bit hash (= last byte of the digest), read MSB-first. Using the first byte
or LSB ordering produces a different matrix and the note check silently fails
(`seated: false`) with no error. When a binary protocol says "truncate to N
bits," always enumerate all reasonable interpretations systematically.

**Quantum sealed bids aren't sealed.** Each bid qubit is prepared in either the
Z or X basis. Since you're allowed to choose your measurement basis per qubit,
you can always reconstruct the full bid: try Z first; if random, try X. The
"sealed" property only holds if the adversary doesn't know which basis each bit
uses, but you can figure it out by trying both.

**Quantum bit commitment is information-theoretically impossible.** The
seal-check is a textbook example of a protocol that sounds binding but isn't.
Bell states give perfect correlations in *every* basis, so a committer who
prepares `|Φ+⟩` per strand can always produce a valid opening regardless of
the challenge. No amount of rounds or strands fixes this: the impossibility is
unconditional (Mayers 1997, Lo-Chau 1997).

**CSS subspace states can be prepared for any linear code.** The note scheme is
really just asking for the uniform superposition over a linear code's codeword
set. RREF over GF(2) gives you the generator circuit directly: H gates on free
variables, CNOT chains to set the pivot variables.

**Probe the API before you implement.** Without source code, every error message
is documentation. Calling each endpoint with intentionally wrong inputs early
(before the instance expires) reveals format conventions: like qubit labels
being strings `"a"/"b"` vs integers, or the challenge field being `0/1` vs
`"Z"/"X"`: far faster than reasoning about them from prose descriptions alone.
