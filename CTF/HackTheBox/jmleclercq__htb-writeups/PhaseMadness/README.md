<div align="center">

# Phase Madness

### A quantum measurement-leak writeup

![Category](https://img.shields.io/badge/category-Quantum-blue)
![Difficulty](https://img.shields.io/badge/difficulty-Easy-brightgreen)
![Tool](https://img.shields.io/badge/tool-Python%20%2B%20Qiskit-orange)
![Vuln](https://img.shields.io/badge/vuln-measurement%20oracle-red)
![Flag](https://img.shields.io/badge/flag-redacted-lightgrey)

</div>

---

> [!NOTE]
> **TL;DR**: Each flag byte is encoded as a single-qubit rotation angle (`RX` for bytes at index `i%3==0`, `RY` for `i%3==1`, `H`+`RZ` for `i%3==2`), and the service is a *measurement oracle* that lets you append arbitrary `RX`/`RY`/`RZ` gates before a 100,000-shot measurement. One well-chosen measurement per qubit recovers the byte: `P(|1⟩) = sin²(byte/2)` for the `RX`/`RY` bytes, and `P(|1⟩) = cos²(byte/2)` once you append a `RY:90` rotation for the `RZ` bytes. Because the flag is printable ASCII (bytes < 128°), the inverse trig is **unique**: no brute force needed, no flag included in this writeup.

Tagged Easy and it plays like one: no entanglement, no multi-qubit gates, no basis obfuscation. The "secret" is just a rotation angle, and the server happily lets you rotate the measurement basis before collapsing the qubit.

**Goal**: recover the 79 bytes of the flag from the measurement statistics.

## Table of Contents

- [Reading the source first](#reading-the-source-first)
- [The target script](#the-target-script)
- [The bug, in one line](#the-bug-in-one-line)
- [Exploit](#exploit)
  - [Sanity-checking it locally first](#sanity-checking-it-locally-first)
  - [Talking to the live instance](#talking-to-the-live-instance)
- [Checking it actually worked](#checking-it-actually-worked)
- [Root cause & fix](#why-this-happens--how-youd-fix-it)

---

## Reading the source first

The server just reads `flag.txt` and builds one qubit per byte:

```python
class PhaseEncoder:
    def __init__(self, data: bytes):
        self.base_circuit = QuantumCircuit(len(data), 1)

        for i in range(0, len(data), 3):
            self.base_circuit.rx(self.degrees_to_radians(data[i]), i)
            if i + 1 < len(data):
                self.base_circuit.ry(self.degrees_to_radians(data[i + 1]), i + 1)
            if i + 2 < len(data):
                self.base_circuit.h(i + 2)
                self.base_circuit.rz(self.degrees_to_radians(data[i + 2]), i + 2)
        ...
```

The qubit index equals the byte index, and the gates repeat with period 3:

| Qubit index | Gates applied | What the byte becomes |
|---|---|---|
| `i % 3 == 0` | `RX(byte·π/180)` | a rotation around the X axis |
| `i % 3 == 1` | `RY(byte·π/180)` | a rotation around the Y axis |
| `i % 3 == 2` | `H`, then `RZ(byte·π/180)` | a **phase** on the `\|+\rangle` state |

Then comes the part that makes this solvable at all: the oracle:

```python
def complete_circuit_and_measure(self, qubit, instructions):
    ...
    circuit = self.base_circuit.copy()
    for instr in instructions.split(";"):
        gate, params = ...
        if   gate == "RX": circuit.rx(phase, params[1])
        elif gate == "RY": circuit.ry(phase, params[1])
        elif gate == "RZ": circuit.rz(phase, params[1])
    return self.measure(circuit, qubit)
```

It runs 100,000 shots and hands back the counts. You pick a qubit, you may append any number of single-qubit rotations, and it tells you the outcome frequencies. In other words: a free *basis-change oracle* on a state that is 100% separable.

> [!TIP]
> Note the awkward `h(i + 2)` + `rz(...)` for the third byte of each group: a pure `RZ` has *no effect* on the outcome of a computational-basis measurement: it only changes the relative phase. That's the whole "hard" part of this challenge: turning that phase back into a measurable amplitude.

## The target script

The rest is plumbing. The interesting decisions are in the `__init__` encoding above and in the instruction parser below it:

| Piece | What it does | Why it matters |
|---|---|---|
| `base_circuit` | one qubit per flag byte | qubit *index == byte index*, no entanglement |
| `rx/ry(byte)` | amplitude rotation by `byte` degrees | leaks straight into `P(\|1⟩)` |
| `h + rz(byte)` | phase rotation of `\|+\rangle` | invisible to a plain measurement |
| `complete_circuit_and_measure()` | appends your `RX/RY/RZ` then measures | the actual oracle: rotates the basis for you |
| `shots = 100_000` | sampling noise ≈ 0.16% | more than enough precision to round to a byte |

Two details worth knowing before exploiting it:

1. **The empty-instruction branch mutates the circuit.** `if len(instructions) == 0: return self.measure(self.base_circuit, qubit)` passes the *persistent* `base_circuit`, and `measure()` does `circuit.measure(qubit, 0)` on it. On a long-lived connection this corrupts `base_circuit` and makes later measurements inconsistent: which is exactly the intermittently-wrong results I got when I reused one connection. The clean workaround: **one fresh connection per query**, or use `RZ:0,<q>` as the identity probe instead of sending nothing.
2. **The out-of-range path tells you the flag length.** Asking for an index ≥ `num_qubits` prints `Index <q> out of range for size <N>`, so the flag is simply 79 bytes.

## The bug, in one line

The state is fully separable and the service exposes a *chosen-basis measurement oracle*. A rotation angle stored in an amplitude (`RX`/`RY`) is read off directly; a phase stored in `RZ` is read off by appending a `RY:90` that converts phase into amplitude. There is nothing quantum about the secrecy here: it's a classical angle leak dressed up as qubits.

**Classification:** this is an information-disclosure / reversible-encoding issue ([CWE-200](https://cwe.mitre.org/data/definitions/200.html)): the "cipher" is just an injective map from bytes to single-qubit states, and the player is given a measurement oracle that inverts it trivially. Same family as the classic "encoder with an oracle" CTF pattern: if you let the attacker choose extra gates, the RZ phase stops being hidden.

Which means you don't need quantum advantage or any state tomography: the probability distributions are enough.

## Exploit

### The math, before any code

For a byte `b`, all angles are `b` degrees.

**Bytes `i%3==0` (RX).** `RX(θ)|0⟩ = cos(θ/2)|0⟩ − i·sin(θ/2)|1⟩`, so a base measurement gives:

```
P(|1⟩) = sin²(θ/2)   ⇒   byte = 2·asin(√P(|1⟩)) in degrees
```

**Bytes `i%3==1` (RY).** `RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩`: identical formula.

**Bytes `i%3==2` (H then RZ).** The state is `RZ(θ)|+⟩ = (|0⟩ + e^{iθ}|1⟩)/√2`. Measuring it in the computational basis is always 50/50: no information. But appending `RY:90` first:

```
RY(90)·RZ(θ)|+⟩  =  (1−e^{iθ})/2 |0⟩ + (1+e^{iθ})/2 |1⟩
⇒  P(|1⟩) = cos²(θ/2)   ⇒   byte = 2·acos(√P(|1⟩)) in degrees
```

**Why this is unique.** The flag is printable ASCII (bytes 32-126). The half-angle `byte/2` therefore sits in `[16°, 63°]`, strictly inside `[0°, 90°]`, where both `sin` and `cos` are monotonic. The inverse is unique: no brute force, no ambiguity between `b` and `360−b`. That's the "Easy" part.

### Sanity-checking it locally first

I reproduced the exact encoder locally with Qiskit and the real recovery formulas, on a throwaway flag:

```bash
pip install qiskit qiskit-aer
```

<details>
<summary><code>local_check.py</code>: click to expand</summary>

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import Aer
from math import pi, asin, acos, sqrt, degrees

def deg(x):
    return x * (pi / 180)

def encode(data: bytes):
    c = QuantumCircuit(len(data), 1)
    for i in range(0, len(data), 3):
        c.rx(deg(data[i]), i)
        if i + 1 < len(data):
            c.ry(deg(data[i + 1]), i + 1)
        if i + 2 < len(data):
            c.h(i + 2)
            c.rz(deg(data[i + 2]), i + 2)
    return c

def p1(circ, qubit, extra=()):
    c = circ.copy()
    for gate, phase, q in extra:
        if   gate == "RX": c.rx(deg(phase), q)
        elif gate == "RY": c.ry(deg(phase), q)
        elif gate == "RZ": c.rz(deg(phase), q)
    c.measure(qubit, 0)
    res = Aer.get_backend("qasm_simulator").run(
        transpile(c, Aer.get_backend("qasm_simulator")), shots=1_000_000).result()
    counts = res.get_counts()
    return counts.get("1", 0) / sum(counts.values())

def recover_rx(p): return round(2 * degrees(asin(sqrt(p)))) % 256
def recover_rz(p): return round(2 * degrees(acos(sqrt(p)))) % 256

test = b"HTB{test_flag_123}"
circ = encode(test)
data = bytearray()
for q in range(len(test)):
    if q % 3 == 2:
        data.append(recover_rz(p1(circ, q, extra=[("RY", 90, q)])))
    else:
        data.append(recover_rx(p1(circ, q)))
print("plaintext :", test)
print("recovered :", bytes(data))
print("match     :", bytes(data) == test)
```

</details>

```console
$ python3 local_check.py
plaintext : b'HTB{test_flag_123}'
recovered : b'HTB{test_flag_123}'
match     : True
```

Formulas confirmed on the simulator (with `shots=1_000_000` locally, so the sanity check isn't flaky) before touching the live service.

### Talking to the live instance

The service is a plain TCP socket speaking a tiny line protocol: `qubit index`, then `instructions`, then a JSON counts dict. No web wrapper here.

```console
$ nc 154.57.164.72 30659
Specify the qubit index you want to measure : 0
Specify the instructions : 
{"1": 34304, "0": 65696}
```

First get the length by triggering the out-of-range path, then measure each qubit exactly once (fresh connection per query, to dodge the `base_circuit` mutation quirk):

```python
import socket, re, math

def measure_once(q, instructions):
    with socket.create_connection(("154.57.164.72", 30659), timeout=10) as s:
        s.sendall(f"{q}\n".encode())
        s.sendall((instructions + "\n").encode())
        buf = b""
        while b"}" not in buf:
            buf += s.recv(65536)
        return eval(re.search(rb"\{[0-9,: \"']*\}", buf).group(0))

# flag length from the out-of-range error (one-off, read the raw line)
with socket.create_connection(("154.57.164.72", 30659), timeout=10) as s:
    s.sendall(b"200\n\n")
    buf = b""
    while b"\n" not in buf:
        buf += s.recv(65536)
    print(buf.decode().splitlines()[-2])   # Index 200 out of range for size 79

flag = bytearray()
for q in range(79):
    if q % 3 == 2:                     # RZ byte: rotate the basis first
        counts = measure_once(q, f"RY:90,{q}")
        p = counts.get("1", 0) / sum(counts.values())
        flag.append(round(2 * math.degrees(math.acos(math.sqrt(p)))))
    else:                              # RX / RY byte: measure straight
        counts = measure_once(q, "")
        p = counts.get("1", 0) / sum(counts.values())
        flag.append(round(2 * math.degrees(math.asin(math.sqrt(p)))))
    print(f"{q:2d} -> {flag[-1]:3d}  {chr(flag[-1])!r}")
```

Sample of the real measured probabilities:

| Qubit | Type | Query | `P(|1⟩)` | Decoded byte |
|---|---|---|---|---|
| 0 | `RX` | base | 0.3443 | `72` → `H` |
| 1 | `RY` | base | 0.4466 | `84` → `T` |
| 2 | `RZ` | `RY:90,2` | 0.7049 | `66` → `B` |
| 3 | `RX` | base | 0.7723 | `123` → `{` |
| 4 | `RY` | base | 0.2127 | `55` → `7` |

## Checking it actually worked

```console
$ python3 solver.py
 0 ->  72  'H'
 1 ->  84  'T'
 2 ->  66  'B'
 ...
78 -> 125  '}'
```

The 79 recovered bytes spell out, in leetspeak, a Hamlet parody: **`HTB{<leetspeak of "to phase bruteforcing or not to phase bruteforcing... that's the question...">}`**: every printable byte decoded cleanly on the first shot, no correction pass needed. (Flag deliberately redacted here.)

## Why this happens / how you'd fix it

The root issue is architectural: the flag bytes are mapped to *measurable* single-qubit states, and the service doubles as a measurement oracle. Rotations around `X`/`Y` put the byte straight into `P(|1⟩)`, and even the supposedly-hidden `RZ` phase becomes readable the moment you can append a basis-changing rotation before measuring. Any secrecy that a single separated qubit can hold is destroyed by one `RY:90`.

A fix would look something like:

```diff
     if len(instructions) == 0:
-        return self.measure(self.base_circuit, qubit)   # mutates base_circuit
+        circuit = self.base_circuit.copy()
+        return self.measure(circuit, qubit)
```

…and more fundamentally, don't let the player choose the gates before measurement. If the byte must stay hidden, pick a *random* single-qubit unitary per connection (one-time-pad style) so the oracle no longer leaks the raw angle, or encode the flag into a genuinely entangled state with non-separable amplitudes, where measuring one qubit gives you nothing about the others. The lesson generalizes beyond quantum: any system that answers "what's the amplitude/phase of my state" with an oracle is one basis change away from giving up its secret.

---

<div align="center">

`python` · `qiskit` · `quantum-computing` · `measurement-oracle` · `ctf-writeup`

*Writeup for personal/educational purposes. No flag is included above: solve it yourself.*

</div>
