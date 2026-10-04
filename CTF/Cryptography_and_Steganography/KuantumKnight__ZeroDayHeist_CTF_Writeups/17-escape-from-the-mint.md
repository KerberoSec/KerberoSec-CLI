# 17: Escape From The Mint-AMRRISH ROSHAN

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| **Category**   | Reverse Engineering                        |
| **Points**     | 500                                        |
| **Difficulty** | Hard                                       |
| **Solved At**  | June 6, 2026                               |
| **File**       | `escape_from_the_mint.exe` (x86-64 PE32+)  |

---

## Description

> Authorities recovered a suspicious executable from a command server abandoned during the escape. The program validates a secret code before revealing the final route. Multiple protection mechanisms were layered together.

---

## Background

This is the final and hardest Reverse Engineering challenge in the CTF. Three layers of misdirection are layered on top of a straightforward XOR decode:

1. **`VirtualProtect` calls**: suggests self-modifying or runtime-decrypted code
2. **Input validation routine**: implies the flag is only accessible at runtime with the correct input
3. **XOR-encrypted flag buffer**: the actual hiding mechanism, recoverable statically

The challenge is designed to make you waste time on dynamic analysis when static analysis is sufficient.

---

## Approach

### Step 1: Static Analysis: Interesting Strings

```
$ strings escape_from_the_mint.exe

escape_from_the_mint.c
reveal_flag
VirtualProtect           ← self-modifying code hint (misdirection)
Enter escape code:
MINT_20
Access denied.
```

Key observations:
- `VirtualProtect` in imports → the binary might modify its own code pages at runtime. This is a **red herring** here, but worth noting.
- `reveal_flag` function name → there is a dedicated flag-reveal routine. Find it.
- `MINT_20` prefix → the input validation expects a code starting with this string (also a decoy).

### Step 2: Disassemble and Analyze Functions

Loading into radare2 and running `afl`:

```
sym.main
sym.validate_code      ← handles "MINT_20..." input
sym.reveal_flag        ← this is what we want
sym.xor_decode         ← helper, called by reveal_flag
```

`main()` calls `validate_code()`. Only if validation passes does it call `reveal_flag()`. But `reveal_flag()` is a standalone function, and its XOR buffer can be decoded without ever satisfying the validator.

### Step 3: Locate and Decode the XOR Buffer in reveal_flag()

Inside `reveal_flag()`, encoded bytes are loaded into a stack buffer using `movabs` instructions (a common pattern for embedding byte arrays inline in x86-64):

```asm
; Inside reveal_flag():
movabs rax, 0x59_4f_4b_4f_54_6e_61_1a
mov    QWORD PTR [rbp-0x30], rax
...
; (continues for full buffer length)
```

A loop then XOR-decodes and prints each byte:

```c
// Ghidra decompilation
void reveal_flag() {
    char buf[] = { /* encoded bytes */ };
    for (int i = 0; i < sizeof(buf); i++) {
        buf[i] ^= 0x2A;
        putchar(buf[i]);
    }
    putchar('\n');
}
```

Extracting the encoded buffer from the disassembly and decoding:

```python
# Encoded bytes extracted via radare2 pxr / hexdump at the stack setup
encoded = bytes([...])   # extracted from binary
print(''.join(chr(b ^ 0x2a) for b in encoded))
# → 0Day-Heist{perfect_escape_executed}
```

The XOR key is **0x2A**: consistent with challenges 15 and 16. At this point in the CTF, this key should be your first guess.

### Step 4: Input Validation: A Decoy

For completeness, the `validate_code()` function checked for a code matching the pattern `MINT_20[...specific suffix...]`. This was a deliberate distraction: the flag was fully recoverable through `reveal_flag()` alone without ever satisfying the validator.

The `VirtualProtect` call was similarly benign in practice: it simply made the stack executable: no runtime decryption of code was actually needed to reach the flag.

---

## Attack Chain Summary

```
escape_from_the_mint.exe
  │
  ├─► strings → VirtualProtect, reveal_flag, MINT_20 (decoys noted)
  │
  ├─► r2 afl → sym.reveal_flag identified
  │
  ├─► Ghidra decompilation → XOR loop with key 0x2A
  │
  └─► Python XOR decode of stack buffer
        └─► 0Day-Heist{perfect_escape_executed}
```

---

## Tools Used

| Tool      | Purpose                                              |
| --------- | ---------------------------------------------------- |
| `strings` | Initial recon: identify function names, hints       |
| `radare2` | Function enumeration, buffer extraction from `.text` |
| `Ghidra`  | Decompilation of `reveal_flag()` and XOR loop        |
| `python3` | XOR decode of flag buffer                            |

---

## Key Insight

The challenge used `VirtualProtect` calls, runtime code-modification hints, and input validation logic as **misdirection**. The flag was in an XOR-encrypted buffer inside `reveal_flag()`, recoverable through pure static analysis: no dynamic execution, no debugging, no correct password required.

**When a CTF binary screams "dynamic analysis" at you, try static first.** The complexity is often the decoy.

---

## What I Learned

1. **`VirtualProtect` ≠ self-modifying code**: importing it doesn't mean the binary actually repurposes code pages in a meaningful way. Always verify before going dynamic.
2. **Name your targets**: `reveal_flag` in `afl` output is an immediate priority. Function naming is free OSINT.
3. **XOR 0x2A appeared in all three final RE challenges**: pattern recognition across a CTF's challenge set is a meta-skill.
4. **Static analysis first, always**: dynamic execution costs setup time and can trigger anti-debug traps. If you can recover the flag statically, do it.

---

## Final Note

This was the last challenge of ZeroDay Heist 2026 and the hardest RE of the set. The layered misdirection (packer-style strings + `VirtualProtect` + validator decoy) was well-designed for its 500-point slot. The core technique: XOR 0x2A static decode: was intentionally consistent with challenges 15 and 16, rewarding players who noticed the pattern.

---

## Flag

```
0Day-Heist{perfect_escape_executed}
```
