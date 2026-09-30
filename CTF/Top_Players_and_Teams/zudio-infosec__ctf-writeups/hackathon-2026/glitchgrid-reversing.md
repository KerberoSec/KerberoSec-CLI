# 🧩 Cyberhackathon.pk: GlitchGrid (Reverse Engineering)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon ([cyberhackathon.pk](https://cyberhackathon.pk/)) |
| Category | Reverse Engineering |
| Points | 250 |
| Difficulty | Medium |
| Tools Used | file, strings, objdump, readelf, Python 3 |

---

## 🧩 Description

A stripped 64-bit ELF binary, `glitchgrid`. Running it prints an
encrypted flag plus a hint, then asks for input:

```
   [GLITCHGRID]  v1.0
   a 5x4 memory grid was found after the glitch.
   encrypted flag: 06336e17050f565d4a060f150b5d5500040f1304
   hint: the columns are scrambled, one cell is corrupted.
```

The flag was said to be stored in a 5×4 grid (20 bytes), then
encrypted, with one cell corrupted by a "glitch."

---

## 🔍 Reconnaissance

**Step 1: Identify the binary**

```
$ file glitchgrid
glitchgrid: ELF 64-bit LSB pie executable, x86-64, ... stripped
```

Stripped, so no symbol names to lean on: straight to strings and
disassembly.

**Step 2: Pull strings**

```
$ strings -n 6 glitchgrid
...
gl1tch
Correct! The grid stabilizes: %s
```

The string `gl1tch` sitting in `.rodata` next to the success message
was the first real clue: it turned out to be a keystream, not just
flavor text.

---

## ⚔️ Attack Process

**Step 1: Disassemble the only non-libc function**

`objdump -d -M intel` showed the program reads a line via `fgets`,
strips the newline, and requires the input be exactly 20 bytes
(`strlen == 0x14`): matching the 5×4 grid.

**Step 2: Spot the glitch**

```asm
xor byte [rsp+0x2d], 0x13
```

This XORs one byte of the copied input buffer: offset `0xD` (13)
into the 20-byte grid. That's "the glitch" from the hint, applied to
whatever gets encrypted.

**Step 3: Decode the column scramble**

A nested loop (outer × 5, inner × 4) reads the grid **column by
column**, but the column order comes from a lookup table instead of
`0,1,2,3,4`. Dumping `.rodata` with `readelf -x .rodata` at that
table's address gave:

```
COLMAP = [2, 0, 4, 1, 3]
```

**Step 4: Decode the keystream**

Each output byte gets XOR'd with a byte from a second table,
indexed by `j mod 6`. That table turned out to be the `gl1tch`
string itself (6 bytes): explaining the earlier `imul`/`shr`
sequence, which is just the classic unsigned-division-by-6 trick.

**Step 5: Confirm the comparison target**

`memcmp` compares the computed 20-byte result against a buffer in
`.rodata` that was byte-for-byte identical to the printed "encrypted
flag" hex string.

Putting it together, for grid stored row-major as 4 rows × 5
columns (stride 5):

```
output[j] = grid[COLMAP[j // 4] + 5*(j % 4)]  XOR  SBOX[j % 6]
```

**Step 6: Invert it**

Every step is a bijection (permutation + XOR), so no brute force was
needed: just run the cipher backwards in Python:

```python
target = bytes.fromhex("06336e17050f565d4a060f150b5d5500040f1304")
SBOX   = b"gl1tch"
COLMAP = [2, 0, 4, 1, 3]

grid = [0] * 20
for j in range(20):
    outer_i, k = j // 4, j % 4
    p = COLMAP[outer_i] + 5 * k
    grid[p] = target[j] ^ SBOX[j % 6]

grid = bytearray(grid)
grid[13] ^= 0x13          # undo the glitch
print(bytes(grid))
```

**Step 7: Verify against the live binary**

```
$ echo "flag{g1_g***d_g*****h}" | ./glitchgrid
Correct! The grid stabilizes: flag{g1_g***d_g*****h}
```

---

## 🚩 Flag
```
flag{g1_g***d_g*****h}
```

---

## 💡 Lessons Learned

- A stripped binary still leaks huge hints through `.rodata`: strings and constants sitting next to a compare/keystream are
  worth checking before diving deep into the disassembly
- Permutation + XOR "encryption" is always reversible once the
  permutation and key material are recovered: no need to brute
  force what you can invert algebraically
- The `imul r8 / shr 0x22` pattern is a compiler-generated
  reciprocal-multiplication trick for unsigned division by a
  constant (here, 6): worth recognizing on sight instead of
  re-deriving it from scratch every time
- Always verify a recovered flag against the actual binary before
  submitting: confirms the logic end-to-end, not just on paper

---

## 🛠️ Tools Used

- **file / strings**: quick binary triage
- **objdump -d -M intel**: disassembly of the stripped function
- **readelf -x .rodata**: precise byte-level dump of the lookup
  tables and comparison target
- **Python 3**: inverting the cipher and validating the recovered
  flag

---

*Solved live during the Cybersecurity Hackathon at cyberhackathon.pk*
