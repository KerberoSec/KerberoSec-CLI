# 14: Tokyo's Locker

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field          | Value                              |
| -------------- | ---------------------------------- |
| **Category**   | Reverse Engineering                |
| **Points**     | 200                                |
| **Difficulty** | Easy                               |
| **Solved At**  | June 6, 2026                       |
| **File**       | `Tokyo_locker.exe` (x86-64 PE32+)  |

---

## Description

> Before entering the Royal Mint, Tokyo secured a weapons locker. Investigators recovered the locker software and need to reverse the program to unlock it.

---

## Approach

### Step 1: Binary Recon

Always start with `file` to confirm architecture and format before loading into any tool.

```
$ file Tokyo_locker.exe
Tokyo_locker.exe: PE32+ executable (console) x86-64, for MS Windows
                  Compiled with GCC 15-win32 (MinGW toolchain)
```

An x86-64 Windows console binary: straightforward static analysis territory.

### Step 2: Static String Extraction with radare2

The fastest first move against any binary: dump all strings from the data sections.

```
r2> iz    # list strings in data sections

vaddr=0x140013000  "Tokyo's Locker"
vaddr=0x140013018  "Enter Password:"
vaddr=0x140013030  "\nAccess Granted"
vaddr=0x140013038  "0Day-Heist{tokyo_opened_the_locker}"   ← FLAG
vaddr=0x140013060  "\nAccess Denied"
```

The flag was stored as a **plaintext literal** in the `.rdata` section. No obfuscation was applied to the flag string itself: it exists independently of the password-check logic.

### Step 3: Understand the Program Flow (for context)

```
main() pseudocode:
  1. puts("Tokyo's Locker")
  2. puts("Enter Password:")
  3. scanf("%49s", user_input)
  4. decode(user_input)          → transforms input
  5. strcmp(decoded, stored_key) → compare against expected key
  6. match  → print flag
     no match → "Access Denied"
```

The flag string at `0x140013038` is printed on success, but it was also readable directly from the binary without ever executing or cracking the password: a common beginner-to-intermediate RE oversight by challenge authors.

---

## Attack Chain Summary

```
Tokyo_locker.exe
  │
  ├─► file → PE32+ x86-64 Windows binary
  │
  └─► r2 iz → .rdata strings dump
                └─► flag found in plaintext at 0x140013038
```

---

## Tools Used

| Tool      | Purpose                                  |
| --------- | ---------------------------------------- |
| `file`    | Binary format identification             |
| `radare2` | Static string extraction (`iz` command)  |

---

## Key Insight

The flag was stored as a **plaintext literal separate from the password check**. A single `iz` pass in radare2 was sufficient: no dynamic analysis, no password cracking, no emulation required.

When a binary has a "correct password → print flag" structure, always check if the flag string itself is hardcoded in the data section before spending time on the validation logic.

---

## What I Learned

1. **`iz` is your first move**: always dump data-section strings before disassembling anything.
2. **Flag storage ≠ flag protection**: printing a flag on success doesn't mean the flag is hidden. It may still be in plaintext in `.rdata`.
3. **MinGW binaries are RE-friendly**: GCC-compiled Windows binaries typically have minimal obfuscation and clean symbol names.

---

## Flag

```
0Day-Heist{tokyo_opened_the_locker}
```
