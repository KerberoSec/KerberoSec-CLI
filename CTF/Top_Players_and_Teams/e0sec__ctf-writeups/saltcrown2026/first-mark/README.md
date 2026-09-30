# First Mark

| Field | Details |
|-------|---------|
| **Challenge** | First Mark |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Reverse Engineering |
| **Flag** | `HTB{cut_f0r_th3_P1NT}` |

---

## Overview

> He left four of its instructions undocumented on purpose... So he etched four runes into the spaces the old makers marked "for the kings to come," gave them no key, and let the stone keep its own counsel.

The challenge ships a single stripped, statically-linked ELF: `first-mark.elf`.

```
ELF 32-bit LSB executable, UCB RISC-V, soft-float ABI, version 1 (SYSV), statically linked, stripped
```

`.riscv.attributes` reports `rv32i2p1_m2p0_zmmul1p0`: plain RV32I plus multiply-only M. The binary reads a line of input, runs it through a 16-round transform, and either prints `ACCEPTED: The First Mark was cut in steel.` or produces nothing at all. The flavor text is doing real work here: it tells you the binary's core operations are **custom, undocumented RISC-V instructions** ("runes") living in the reserved `custom-0`/`custom-1` opcode space, and that only one of the four is explained: deliberately, forcing you to derive the rest from context rather than a spec.

---

## Static layout

Disassembling with `riscv64-elf-objdump -d` (a 32-bit RISC-V toolchain works fine even cross-arch on Apple Silicon, since this is pure static analysis):

```
20000000 <.text>: startup / BSS zeroing / .rodata->RAM copy, then jal to main
20000060: print_string(a0)          # UART busy-loop at MMIO 0x10000000
20000094: main()                    # prints banner, reads input into 0x80000000, calls check()
200000d0: check(a0)                 # the interesting function
```

`check()` loops 16 times over the input buffer, indexing three lookup tables in `.rodata` and chaining four custom opcodes per byte:

```
20000110: add  t0, s0, s1        ; t0 = input + i
20000114: lbu  a0, 0(t0)         ; a0 = input[i]
20000118: add  t0, s2, s1
2000011c: lbu  a1, 0(t0)         ; a1 = table1[i]
20000120: andi a1, a1, 7         ; a1 &= 7
20000124: .insn 0x00b5050b       ; RUNE 1  (custom-0, funct3=0)  a0 = f1(a0, a1)
20000128: add  t0, s3, s1
2000012c: lbu  a1, 0(t0)         ; a1 = table2[i]
20000130: .insn 0x00b5150b       ; RUNE 2  (custom-0, funct3=1)  a0 = f2(a0, a1)
20000134: .insn 0x00c5052b       ; RUNE 3  (custom-1, funct7=0)  a0 = f3(a0, a2)   -- a2 = "state"
20000138: mv   a2, a0            ; state = a0
2000013c: add  t0, s4, s1
20000140: lbu  a3, 0(t0)         ; a3 = table3[i]  (target byte)
20000144: .insn 0x02d5002b       ; RUNE 4  (custom-1, funct7=1)  assert/attest(a0, a3)
20000148: addi s1, s1, 1
2000014c: blt  s1, 16, loop
```

Decoding the raw words (`opcode`/`rd`/`funct3`/`rs1`/`rs2`/`funct7`) confirms opcode `0x0B` (custom-0) hosts runes 1-2 via `funct3`, and opcode `0x2B` (custom-1) hosts runes 3-4 via `funct7`. Rune 4 writes `rd = x0`: it produces no architectural result, consistent with the lore's "true, or nothing at all": on mismatch the stone traps/halts rather than branching, which is also why `check()`'s caller unconditionally prints the ACCEPTED banner: it never even inspects a return value.

Three 16-byte tables sit in `.rodata` right after the banner strings:

```python
table1 = [0x03,0x07,0x01,0x05,0x02,0x06,0x04,0x00]*2   # &7 -> rotate amounts 3,7,1,5,2,6,4,0 (repeated)
table2 = [0x03,0x02,0x03,0x02,0x05,0x07,0x02,0x03,0x05,0x07,0x02,0x03,0x05,0x07,0x02,0x03]
table3 = bytes.fromhex("117a35907e88b059797f566a3a10e905")   # target/ciphertext
```

---

## The one given clue (Rune 3)

The challenge hands over Rune 3 explicitly, in prose, as "the closest [Veylen] ever came to leaving a key":

```
out   = a0 ^ state ^ carry
carry = old_a0 & state          # uses the pre-update state
state = out                     # becomes next round's state
```
with `state` initialized to `0xA5` and `carry` initialized to `0`.

Because Rune 4 forces each round's output to equal `table3[i]` (or the stone goes silent), the `state`/`carry` sequence is **fully determined** from `table3` alone: independent of what Runes 1 and 2 actually do. That decouples the problem: reverse Rune 3 first to recover the 16 intermediate bytes fed into it, then separately recover Runes 1/2.

```python
state, carry = 0xA5, 0
before_rune3 = []
for out in table3:
    a0 = out ^ state ^ carry          # XOR is self-inverse
    before_rune3.append(a0)
    carry = a0 & state
    state = out
```

---

## Recovering Runes 1 and 2 ("from the company they keep")

With no spec and no live oracle, Runes 1 and 2 had to be inferred from the shape of their inputs:

- **Rune 1**'s second operand is explicitly masked `&7` in the code right before the custom instruction: a strong tell that it's a **bit-rotate amount** (0-7 makes no sense as a raw XOR/ADD key, but is exactly the domain of an 8-bit rotate). Combined with `table1`'s content (`3,7,1,5,2,6,4,0`: every rotate amount 0-7, no repeats within each half) this reads as **`ROR8(a0, table1[i] & 7)`**.
- **Rune 2**'s operand (`table2`) is *not* masked, yet every value in it (`2,3,5,7`) is small: these are the classic small **GF(2⁸) multipliers** used in AES-style MixColumns-adjacent constructions. This was the piece that took the most iterating: naive guesses (rotate/XOR/ADD/SUB combinations) for Rune 2 all failed to invert to a printable string, because GF(256) multiplication (with reduction polynomial `0x1b`) isn't linear the way those ops are, so it wasn't in the initial search space at all. Once GF-multiply was tried, everything fell into place.

```python
def gf_mul(a, b):
    res = 0
    for _ in range(8):
        if b & 1:
            res ^= a
        hi = a & 0x80
        a = (a << 1) & 0xff
        if hi:
            a ^= 0x1b
        b >>= 1
    return res
```

Since the input space per byte is only 256 values, Runes 1+2 don't need a hand-derived inverse: brute-force each candidate input byte through the forward chain and keep the one that matches:

```python
def ror8(x, n):
    n &= 7
    return ((x >> n) | (x << (8 - n))) & 0xff if n else x

rot = [3,7,1,5,2,6,4,0,3,7,1,5,2,6,4,0]
mul = [3,2,3,2,5,7,2,3,5,7,2,3,5,7,2,3]

answer = []
for i, wanted in enumerate(before_rune3):
    for c in range(256):
        if gf_mul(ror8(c, rot[i]), mul[i]) == wanted:
            answer.append(c)
            break
```

---

## Full solver

```python
target = bytes.fromhex("117a35907e88b059797f566a3a10e905")
rot = [3,7,1,5,2,6,4,0,3,7,1,5,2,6,4,0]
mul = [3,2,3,2,5,7,2,3,5,7,2,3,5,7,2,3]

def ror8(x, n):
    n &= 7
    return ((x >> n) | (x << (8 - n))) & 0xff if n else x

def gf_mul(a, b):
    res = 0
    for _ in range(8):
        if b & 1:
            res ^= a
        hi = a & 0x80
        a = (a << 1) & 0xff
        if hi:
            a ^= 0x1b
        b >>= 1
    return res

# Reverse Rune 3 first: the state/carry chain only depends on `target`
state, carry = 0xA5, 0
before_rune3 = []
for out in target:
    a0 = out ^ state ^ carry
    before_rune3.append(a0)
    carry = a0 & state
    state = out

# Recover the byte that survives Rune 1 (rotate) + Rune 2 (GF mul) via brute force
answer = []
for i, wanted in enumerate(before_rune3):
    for c in range(256):
        if gf_mul(ror8(c, rot[i]), mul[i]) == wanted:
            answer.append(c)
            break

token = bytes(answer).decode()
print(f"HTB{{{token}}}")   # HTB{cut_f0r_th3_P1NT}
```

```text
$ python3 solve.py
HTB{cut_f0r_th3_P1NT}
```

---

## Lessons learned

- When a binary hides behavior behind genuinely undocumented custom opcodes, the operand *shapes* are the real spec: a value pre-masked to 0-7 right before the instruction all but announces a rotate; small untransformed constants in a set like `{2,3,5,7}` point at GF(256) multipliers, not linear ops.
- A stateful step (Rune 3) that feeds forward into a hard equality check against a known target collapses the "guess the stateful op" problem into "invert a known chain": reverse it first, since it pins down every subsequent round regardless of what the other operations turn out to be.
- Don't declare an op space (rotate/XOR/ADD/SUB) exhaustive just because it covers the "obvious" candidates: GF(256) multiplication is a common building block in exactly this kind of challenge and is easy to overlook if you're only testing linear operations.
- With a 256-value byte domain and a handful of known-plaintext-style constraints, brute-forcing the last mile per byte is simpler and less error-prone than deriving a closed-form inverse (e.g. a discrete-log-style inverse for GF multiplication).
