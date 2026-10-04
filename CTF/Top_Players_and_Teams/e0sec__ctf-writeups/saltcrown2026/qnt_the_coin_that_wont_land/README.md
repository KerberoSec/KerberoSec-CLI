# The Coin That Won't Land

| Field | Details |
|-------|---------|
| **Challenge** | The Coin That Won't Land |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Quantum (Bit Commitment / Oathbinding Court) |
| **Flag** | `HTB{epr_0ath_0p3ns_b0th_w4ys_68e2f5a8d596f78dffca21e106ebd619}` |

---

## Overview

A themed HTTP/JSON API ("the Oathbinding Court") built on top of a small
quantum circuit backend. You submit a "vow" as 8 two-qubit circuits per round,
keep one qubit of each pair (`a`), and the "Warden" seals the other (`b`). The
court then challenges you with a random basis, and you must "open" your vow by
predicting what the Warden will measure on `b`. Do this correctly for all 32
rounds and the flag is returned.

This is a textbook **quantum bit commitment** scheme, and quantum bit
commitment is provably impossible to make binding: the challenge is really
just asking you to demonstrate the standard cheating attack.

---

## The API

```
POST /api/new                                    → {token, strands, rounds}
POST /api/commit {token, slots:[<strand> x 8]}    → {challenge: 0|1, round}
POST /api/peek   {token, basis: "Z"|"X"}          → {a_outcomes: [...]}
POST /api/open   {token, values:[0/1 x 8]}        → {round_held, passes, ...}
GET  /api/oath                                    → protocol description
```

`/api/oath` describes the system: each round commits 8 strands, a strand is a
2-qubit circuit over qubits `a` and `b` applied to `|00⟩`. You keep `a`, the
Warden keeps (seals) `b`. Allowed gates: single-qubit `I X Y Z H S SDG` on `a`
or `b`, plus `CX` with control/target among `a`, `b`. The challenge bit `c`
returned by `/api/commit` selects the basis the Warden will measure `b` in
when you open: `c=0 → Z`, `c=1 → X`. The oath only holds if every one of the 8
strand values matches. All 32 rounds must hold to be believed.

---

## The exploit: quantum bit commitment is impossible

Any quantum bit-commitment scheme is **information-theoretically insecure**
(Mayers 1997, Lo-Chau 1997). A committer who is supposed to fix a value before
seeing the challenge can instead delay that choice by entangling their kept
qubit with the sealed one, and only "collapse" to a definite value once the
challenge basis is known: steering the outcome retroactively.

Concretely: prepare each strand as a **Bell state**
`|Φ+⟩ = (|00⟩ + |11⟩)/√2` instead of committing to a real bit:

```python
strand = [["H", "a"], ["CX", "a", "b"]]
```

A Bell pair is perfectly correlated **in every measurement basis**, not just
Z. So after the court reveals its challenge `c`, measure your own `a` qubit
(via `/api/peek`) in the *same* basis the Warden will use on `b` (Z if `c=0`,
X if `c=1`). Whatever you observe is guaranteed to match what the Warden
measures: you never had to decide the bit in advance, and you can never be
caught.

```python
import requests

BASE = "http://<ip>:<port>"
s = requests.Session()

data = s.post(f"{BASE}/api/new").json()
token, strands, rounds = data["token"], data["strands"], data["rounds"]

circuit = [["H", "a"], ["CX", "a", "b"]]

for _ in range(rounds):
    slots = [circuit for _ in range(strands)]
    commit = s.post(f"{BASE}/api/commit", json={"token": token, "slots": slots}).json()

    basis = "Z" if commit["challenge"] == 0 else "X"
    peek = s.post(f"{BASE}/api/peek", json={"token": token, "basis": basis}).json()

    opened = s.post(f"{BASE}/api/open", json={"token": token, "values": peek["a_outcomes"]}).json()
    print(opened)   # round_held: True, every round
```

The final `open` call of round 32 returns the flag directly:

```json
{"flag": "HTB{epr_0ath_0p3ns_b0th_w4ys_68e2f5a8d596f78dffca21e106ebd619}",
 "passes": 32, "round_held": true, "rounds_done": 32, "total": 32}
```

---

## Takeaways

**Quantum bit commitment cannot be made binding**, full stop: no number of
rounds or strands fixes it, because the impossibility (Mayers 1997, Lo-Chau
1997) is unconditional, not a matter of insufficient parameters. Any protocol
that asks a prover to "commit now, reveal later" using only quantum states is
inherently attackable this way.

**The Bell-pair attack generalizes trivially.** Because `|Φ+⟩` is symmetric
under applying the same single-qubit basis change to both halves, it stays
maximally correlated in *any* orthonormal basis, not just Z/X. So the same two
gates (`H` then `CX`) defeat any commitment scheme that only ever challenges
with a single-qubit basis measurement, regardless of how many bases it claims
to support.

**Probe the API before implementing anything clever.** `/api/oath` handed us
the entire protocol in prose, including the exact challenge encoding
(`c=0 → Z`, `c=1 → X`) and the allowed gate set: no guessing required. When a
challenge exposes a docs endpoint, read it first; it usually saves you from
reverse-engineering behavior that's already documented.
