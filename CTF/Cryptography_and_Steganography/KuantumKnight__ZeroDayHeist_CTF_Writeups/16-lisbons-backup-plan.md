# 16: Lisbon's Backup Plan

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field          | Value                                |
| -------------- | ------------------------------------ |
| **Category**   | Reverse Engineering                  |
| **Points**     | 400                                  |
| **Difficulty** | Medium-Hard                          |
| **Solved At**  | June 6, 2026                         |
| **File**       | `lisbon_backup.exe` (UPX-packed PE)  |

---

## Description

> Lisbon maintained a backup escape route. Authorities recovered a suspicious executable from a damaged laptop. The binary was protected to resist reverse engineering.

---

## Background

Two layers of protection were applied:

1. **UPX packing**: the binary is compressed; attempting to disassemble the packed version yields mostly stub code
2. **Dead code / unreferenced function**: the flag is hidden inside a function never called by `main()`

---

## Approach

### Step 1: Detect and Unpack UPX

Running `file` or `strings` on the binary reveals UPX magic bytes. Always test before unpacking:

```
$ upx -t lisbon_backup.exe
testing lisbon_backup.exe [OK]

$ upx -d lisbon_backup.exe -o lisbon_unpacked.exe
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2024
...
Unpacked 1 file.
```

Now we have a clean, uncompressed PE to analyze.

### Step 2: Enumerate Functions with radare2

```
$ r2 -Aqc 'afl' lisbon_unpacked.exe

0x140001000  sym.main
0x140001080  sym.backup_protocol    ← interesting name
0x1400010f0  sym.__main
...
```

`backup_protocol` stands out immediately. The naming convention is too on-the-nose to ignore.

### Step 3: Analyze main(): Confirm the Dead Code

Disassembling `main()`:

```
[main]
  call puts("Backup Plan Activated")
  call puts("Route verification pending...")
  xor eax, eax
  ret
```

`main()` **never calls `backup_protocol()`**. It only prints two lines and exits. The real payload is in the unreferenced function.

### Step 4: Analyze backup_protocol(): XOR-Obfuscated Flag

Inside `backup_protocol()`, encoded bytes are loaded into a stack buffer via a series of `mov` instructions. A loop then XOR-decodes them:

```c
// Pseudocode from Ghidra decompilation
void backup_protocol() {
    char buf[] = { 0x1a, 'n', 'K', 'S', 0x07, 'b', 'O', 'C',
                   'Y', '^', 'Q', 'F', 'C', 'Y', 'H', 'E',
                   'D', 'u', 'L', 'E', '_', 'D', 'N', 'u',
                   '^', 'B', 'O', 'u', 'Y', 'O', 'I', 'X',
                   'X', 'O', '^', 'W' };

    for (int i = 0; i < sizeof(buf); i++)
        putchar(buf[i] ^ 0x2A);
}
```

Replicating in Python:

```python
s = b'\x1anKS\x07bOCY^QFCYHEDuLE_DNu^BOuYOIXXO^W'
print(''.join(chr(c ^ 0x2a) for c in s))
# → 0Day-Heist{lisbon_found_the_secrret}
```

Note the intentional double-`r` in `secrret`: this is the flag as-is.

---

## Attack Chain Summary

```
lisbon_backup.exe (UPX packed)
  │
  ├─► upx -t / upx -d → lisbon_unpacked.exe
  │
  ├─► r2 afl → sym.backup_protocol identified
  │
  ├─► main() analysis → backup_protocol() never called (dead code)
  │
  └─► backup_protocol() → XOR 0x2A decode
        └─► 0Day-Heist{lisbon_found_the_secrret}
```

---

## Tools Used

| Tool      | Purpose                                        |
| --------- | ---------------------------------------------- |
| `upx`     | Packer detection and unpacking (`-t`, `-d`)    |
| `radare2` | Function enumeration (`afl`), disassembly      |
| `Ghidra`  | Decompilation of `backup_protocol()`           |
| `python3` | XOR decode of flag buffer                      |

---

## Key Insight

UPX packing + unreferenced function with XOR-obfuscated data. The flag was **never reachable through normal execution**: it required finding the dead function through static analysis.

This is a classic RE pattern: packing to deter automated analysis, then hiding the secret in code that `main()` never touches.

---

## What I Learned

1. **Always unpack before analyzing**: disassembling a UPX stub wastes time. `upx -t` first, then `-d`.
2. **`afl` (analyze function list) is essential**: it surfaces interesting function names like `backup_protocol` that immediately demand attention.
3. **Dead code is CTF gold**: if a function exists but nothing calls it, that's almost always where the flag lives.
4. **XOR 0x2A** appeared in challenges 15, 16, and 17: a deliberate pattern by the challenge author.

---

## Flag

```
0Day-Heist{lisbon_found_the_secrret}
```
