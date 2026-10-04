
# 🧠 Phase Noise: Reverse Engineering Writeup

## 🏷️ Challenge Information

- **Category:** Reverse Engineering
- **Binary:** `phase_noise`
- **Architecture:** Mach-O 64-bit ARM64
- **Flag:** `EcowasCTF{vm_lifted_nibbles_are_louder_than_strings}`

---

## 🔍 Initial Analysis

After extracting the challenge archive:

```bash
unzip phase_noise.zip
file phase_noise
````

We get:

```text
phase_noise: Mach-O 64-bit arm64 executable, flags:<NOUNDEFS|DYLDLINK|TWOLEVEL|PIE>
```

The binary is a macOS ARM64 executable. Since running it directly on Kali is not practical, I focused on static analysis.

I first checked the strings:

```bash
strings phase_noise
```

Interesting strings appeared:

```text
passphrase:
accepted
rejected
```

So the binary is clearly asking for a passphrase and validating it internally.

---

## 🧠 Disassembly

I dumped the `main` function using `radare2`:

```bash
r2 -Aqc 's main; pdf' phase_noise
```

The program does the following:

1. Prints `passphrase:`
2. Reads input with `fgets`
3. Removes the newline using `strcspn`
4. Runs a custom validation loop
5. Prints either `accepted` or `rejected`

The input reading part is visible here:

```asm
fputs("passphrase: ", stdout)
fflush(stdout)
fgets(input, 0x80, stdin)
strcspn(input, "\n")
```

---

## 🔥 Core Validation Logic

The most important part is the loop that validates the input byte by byte.

The loop uses:

* the input character
* the current index
* several evolving internal states
* a hardcoded table inside the binary

This part shows that the loop processes input bytes:

```asm
cmp x8, x0
b.hs 0x100003dd0
ldrb w4, [x19, x8]
```

Here:

* `x8` is the current index
* `x0` is the input length
* `w4` receives the current input byte

If the index is beyond the input length, the code does not read from the input. Instead, it uses:

```asm
add w4, w8, 0x40
```

So the checker always runs until a fixed length, but uses either the user input byte or a fallback byte.

Another important instruction is:

```asm
cmp x8, 0x34
```

`0x34` is decimal `52`, which means the expected passphrase length is 52 characters.

---

## 🧩 Extracting the Hardcoded Table

The checker uses a table located around `0x100003f72`.

I dumped it with:

```bash
r2 -Aqc 'px 0x100 @ 0x100003f72' phase_noise
```

Output:

```text
0x100003f72  317a 8b34 f07e 86d0 2174 d380 d536 a94c  1z.4.~..!t...6.L
0x100003f82  a93a 0b8c afbe 16b1 27e2 2304 f994 174e  .:......'.#....N
0x100003f92  3596 d3a4 0906 6f66 a9cb c381 a9b6 fb50  5.....of.......P
0x100003fa2  39ea 93ec
```

The first 52 bytes are used as the target validation table.

---

## 🚨 Critical Check

Inside the loop, this instruction is very important:

```asm
orr w11, w6, w11
```

This means the program accumulates validation errors.

If any transformed byte is not zero, `w11` becomes non-zero.

So for the input to be accepted:

```c
w11 == 0
```

In other words, every transformed byte must match perfectly.

---

## 🧠 Final Condition

At the end of the loop, the binary does:

```asm
mov w9, 0x9c27
movk w9, 0x8991, lsl 16
sub w9, w9, w4
cmp w9, w8
ccmp w11, 0, 0, eq
csel x0, rejected, accepted, ne
```

The final validation depends on:

1. The transformed bytes producing zero error
2. A final length/state condition

Since the loop ends at `0x34`, the correct input length is 52.

---

## ⚙️ Rebuilding the Checker

I reconstructed the transformation logic from the ARM64 instructions.

The important table values were:

```python
tbl1 = bytes.fromhex(
    "6d2bf0913ca758de04bb7219e5408acd"
)

tbl2 = bytes.fromhex(
    "317a8b34f07e86d02174d380d536a94c"
    "a93a0b8cafbe16b127e22304f994174e"
    "3596d3a409066f66a9cbc381a9b6fb50"
    "39ea93ec"
)
```

The first table is used with an index modulo `0x10`.

The second table is the encrypted/expected validation bytes.

---

## 🧪 Solver Script

The checker is stateful, but each byte can still be solved by bruteforcing printable characters while updating the internal state exactly like the binary.

Here is the solver used:

```python
#!/usr/bin/env python3

def u32(x):
    return x & 0xffffffff

def u8(x):
    return x & 0xff

def ror32(x, n):
    x &= 0xffffffff
    return ((x >> n) | (x << (32 - n))) & 0xffffffff

tbl1 = bytes.fromhex(
    "6d2bf0913ca758de04bb7219e5408acd"
)

tbl2 = bytes.fromhex(
    "317a8b34f07e86d02174d380d536a94c"
    "a93a0b8cafbe16b127e22304f994174e"
    "3596d3a409066f66a9cbc381a9b6fb50"
    "39ea93ec"
)

charset = (
    b"abcdefghijklmnopqrstuvwxyz"
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    b"0123456789"
    b"{}_!@#$%^&*()-+=[]:;,.?/|~"
)

target_len = 0x34

def step(i, ch, state):
    w9, w10, w11, w12, w13, w14 = state

    w4 = ch

    w5 = u32(w4 ^ w14)
    w6 = u8(w5)

    w7 = u8(i)
    w7 = u32(w7 * 0x25)
    w7 = u32(w7 >> 8)

    w20 = u32(i - w7)
    w20 = u32(w20 & 0xfe)

    w7 = u32(w7 + (w20 >> 1))
    w7 = u32(i + (w7 >> 2))

    w20 = u32(w7 + 1)
    w7 = u32(7 & (~w7))

    w6 = u32(w6 >> w7)

    w7 = u32(w20 & 7)
    w5_shift = u32(w5 << w7)

    w5 = u32(w5_shift | w6)

    w6 = u32(w9 + w5)
    x6 = w6 & 0xf

    w6 = tbl1[x6]

    w5 = u32(w6 + u8(w5))
    w5 = u32(w10 + w5)
    w5 = u32(w13 ^ w5)

    w6 = tbl2[i]
    w6 = u32(w6 ^ w5)
    w6 = u8(w6)

    w11 = u32(w11 | w6)

    old_w4 = w4
    w6_tmp = u32((old_w4 << 5) - old_w4)
    w14 = u32(w6_tmp + w14)
    w14 = u32(w14 + w5)

    w5_tmp = u32(i + w14)

    # ubfx w14, w5, 5, 3
    # bfi  w14, w5, 3, 0x1d
    low = (w5_tmp >> 5) & 0x7
    high_insert = (w5_tmp & ((1 << 29) - 1)) << 3
    w14 = u32(low | high_insert)

    w4_tmp = u32(i + u8(old_w4))
    w4_tmp = u32(w4_tmp * 0x045d9f3b)

    w12 = u32(w4_tmp ^ w12)
    w4_tmp = ror32(w12, 0x19)

    w12 = u32(i + w4_tmp)
    w12 = u32(w12 + 0x9e3779b9)

    w13 = u32(w13 + 0x1d)
    w10 = u32(w10 + 0x11)
    w9 = u32(w9 + 0xd)

    return (w9, w10, w11, w12, w13, w14), w6

def solve():
    state = (
        0,              # w9
        0,              # w10
        0,              # w11
        0x31415926,     # w12
        0x5d,           # w13
        0xa7            # w14
    )

    flag = b""

    for i in range(target_len):
        found = None

        for ch in charset:
            new_state, err = step(i, ch, state)

            if err == 0:
                found = ch
                state = new_state
                flag += bytes([ch])
                print(f"[+] pos {i:02d}: {chr(ch)} -> {flag.decode(errors='replace')}")
                break

        if found is None:
            print(f"[-] No valid character found at position {i}")
            break

    print()
    print("[+] Recovered passphrase:")
    print(flag.decode())

if __name__ == "__main__":
    solve()
```

---

## 🏁 Solver Output

Running the solver:

```bash
python3 solve_phase_noise.py
```

Recovered:

```text
EcowasCTF{vm_lifted_nibbles_are_louder_than_strings}
```

---

## ✅ Verification

Using the recovered passphrase:

```bash
printf 'EcowasCTF{vm_lifted_nibbles_are_louder_than_strings}\n' | ./phase_noise
```

Output:

```text
accepted
```

---

## 💡 Key Takeaways

This challenge was not a simple string comparison.

The validation used:

* a Mach-O ARM64 binary
* hidden lookup tables
* stateful byte-by-byte transformations
* XOR, shifts, rotations, multiplication, and masking
* an OR-based error accumulator

The key observation was:

```asm
orr w11, w6, w11
```

This revealed that every byte must independently produce zero after transformation.

From there, the checker could be reconstructed and solved byte by byte.

---

## 🏴 Flag

```text
EcowasCTF{vm_lifted_nibbles_are_louder_than_strings}
```

```
```
