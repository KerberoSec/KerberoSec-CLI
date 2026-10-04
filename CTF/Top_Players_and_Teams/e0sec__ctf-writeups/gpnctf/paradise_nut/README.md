# Paradise Nut (pnut-sh / wok-tossed-risotto)

| Field | Details |
|-------|---------|
| **Challenge** | Paradise Nut |
| **CTF** | GPN CTF 2024 |
| **Category** | Pwn / Misc |
| **Flag** | `GPNCTF{liBC_GETS()_fanS_k3ep_on_W1nnIng!_Isn'7_It_c0nv3NI3nt_7HAt_REPLY_i5_NoT_bL4cKliS73D?}` |

---

## Overview

Given a shell-based C compiler (`pnut-sh.sh`) and a wrapper (`chal.sh`). Send one line of C: it compiles and runs, output returned. Goal: read `/flag`.

`pnut-sh` is a C compiler written in POSIX sh that transpiles C to shell.

---

## Constraints

Several standard C constructs are unsupported:

- Stack arrays → `local array/struct value type is not supported`
- Address-of operator `&` → `comp_rvalue_go: unexpected operator`
- `FILE*` into `int` risks pointer truncation on 64-bit

---

## Failed Attempts

- `fopen + fgetc`: `FILE*` truncation risk in 32-bit int
- `read(f, &c, 1)`: address-of `&` rejected by compiler
- `char buf[256]`: stack array rejected by compiler

---

## Solve

An uninitialized `int* p` lives in a valid shell variable. `read()` writes into it and `*p` reads it back: no address-of needed, no arrays, no `FILE*`:

```c
int main() {
    int *p;
    int f = open("/flag", 0);
    while (read(f, p, 1) > 0) putchar(*p);
}
```

Uses only `open()`, `read()`, and `putchar()`: all syscall-level with no struct pointers: fits cleanly within pnut-sh's constraints. Reads the flag byte by byte and prints each character.

---

## Flag

```
GPNCTF{liBC_GETS()_fanS_k3ep_on_W1nnIng!_Isn'7_It_c0nv3NI3nt_7HAt_REPLY_i5_NoT_bL4cKliS73D?}
```
