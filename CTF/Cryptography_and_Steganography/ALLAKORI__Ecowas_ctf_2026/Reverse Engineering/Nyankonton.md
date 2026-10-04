# 🐱 Nyancat: Reverse Engineering Writeup

<p align="center">
  <b>ECOWAS CTF</b> • Reverse Engineering • Medium
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Category-Reverse-blue">
  <img src="https://img.shields.io/badge/Platform-Mach--O%20ARM64-orange">
  <img src="https://img.shields.io/badge/Tools-r2%20%7C%20Python-green">
</p>

---

## 📜 Description

> *"The portal closes in 24 moves… guide Nyancat to the right path."*

We are given a binary `nyancat`.

---

## 📂 Initial Analysis

```bash
file nyancat
```

```text
Mach-O 64-bit arm64 executable
```

### ⚠️ Observations

* Mach-O → macOS binary
* ARM64 architecture
* ❌ Cannot execute on Kali (Linux x86_64)
* ✅ Static analysis required

---

## 🔍 Strings Analysis

```bash
strings nyancat
```

Key outputs:

```text
moves: %2d / %d    W/S = up/down
Nyancat soars into the void. The portal stays closed.
*** NYANKONTON: JOJO's PORTAL ***
```

### 💡 Insight

* Game-like logic
* User provides moves
* Win / Fail states

➡️ The flag is **not directly visible → hidden logic**

---

## 🧠 Reverse Engineering

### 🔹 Function Discovery

```bash
r2 -q -A nyancat
afl
```

Relevant functions:

* `main`
* `_draw`
* `_poll_key`

➡️ Core logic inside `main`

---

## 🎮 Input Handling

```asm
mov w8, 0x55  ; 'U'
mov w8, 0x44  ; 'D'
```

### 💡 Mapping

| Input | Internal |
| ----- | -------- |
| W     | U        |
| S     | D        |

Moves stored in:

```c
char g_moves[24];
```

---

## 🔢 Move Count

```asm
cmp x8, 0x18
```

👉 `0x18 = 24`

```c
for (i = 0; i < 24; i++)
```

---

## 🔐 Validation Logic

```asm
ldrb w12, [x11, x8]
eor x12, x20, x12
extr x12, x12, x20, 0x33
mul x12, x12, x9
eor x20, x12, x10
```

### 💡 Interpretation

```c
state = init;

for (i = 0; i < 24; i++) {
    state = transform(state, moves[i]);
}
```

---

## ⚖️ Final Check

```asm
cmp x20, x19
b.ne fail
```

```c
if (state != expected)
    fail;
else
    success;
```

---

## 🏆 Success Path

```asm
puts("*** NYANKONTON: JOJO's PORTAL ***")
```

➡️ Correct moves trigger success

---

## 🔓 Flag Decryption

### 🔥 Critical Pattern

```asm
ldrb w9, [x23, x20]
ldrb w8, [x8]
eor  w0, w8, w9
putchar(w0)
```

### 💡 Meaning

```c
flag[i] = ciphertext[i] ^ keystream[i];
```

➡️ Flag is **XOR-encrypted inside binary**

---

## 📦 Extract Ciphertext

```asm
adrp x23, 0x100003000
add  x23, x23, 0xf68
```

👉 Address:

```text
0x100003f68
```

Dump:

```bash
r2 -q -A -c 'px 48 @ 0x100003f68' nyancat
```

---

## 🔑 Key Generation

### Initial State

```asm
mov  x19, 0x6cfc
movk x19, 0xa46a, lsl 16
movk x19, 0xbb2,  lsl 32
movk x19, 0xc5b,  lsl 48
```

```c
state = 0x0c5b0bb2a46a6cfc;
```

---

### Multiplier

```asm
mov  x21, 0x7c15
movk x21, 0x7f4a, lsl 16
movk x21, 0x79b9, lsl 32
movk x21, 0x9e37, lsl 48
```

```c
mulconst = 0x9e3779b97f4a7c15;
```

---

## ⚙️ Decryption Algorithm

```c
state = initial;

for (i = 0; i < 48; i++) {
    if (i % 8 == 0) {
        keyblock = state.to_bytes(8, "little");
        state = ror(state, 0x39) * mulconst;
    }

    flag[i] = ciphertext[i] ^ keyblock[i % 8];
}
```

---

## 🐍 Python Solver

```python
ct = bytes.fromhex(
    "b90f05d3d3781858"
    "384551531496fc46"
    "dde80bbda48e0186"
    "48283e0852037603"
    "200de4f0db61c35f"
    "e6e07228699a896d"
)

state = 0x0c5b0bb2a46a6cfc
mulconst = 0x9e3779b97f4a7c15

def ror(x, r):
    return ((x >> r) | (x << (64 - r))) & ((1 << 64) - 1)

out = bytearray()

for i, b in enumerate(ct):
    if i % 8 == 0:
        keyblock = state.to_bytes(8, "little")
        state = (ror(state, 0x39) * mulconst) & ((1 << 64) - 1)
    out.append(b ^ keyblock[i % 8])

print(out.decode())
```

---

## 🏁 Flag

```text
EcowasCTF{ny4n_ny4n_w4rp_p0rt4l_f0und_@t_last!!}
```

---

## 💡 Key Takeaways

* Recognize **XOR + putchar → decryption**
* `adrp + add` → memory address construction
* `mov + movk` → 64-bit constant reconstruction
* Focus on:

  * input
  * validation
  * success path

---

## 🛠️ Tools Used

* `file`
* `strings`
* `radare2`
* Python

---

## 🔥 Final Thought

> When a binary prints characters one by one after a check,
> it’s rarely printing… it’s **decrypting the flag**.

---
