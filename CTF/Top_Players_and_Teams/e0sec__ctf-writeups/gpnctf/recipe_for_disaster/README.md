# Recipe for Disaster

| Field | Details |
|-------|---------|
| **Challenge** | Recipe for Disaster |
| **CTF** | GPN CTF 2024 |
| **Category** | Pwn |
| **Vulnerability** | `gets()` stack buffer overflow |
| **Flag** | `GPNCTF{W4It, wI7H tHe5E Pr1C35, ov3RfL0ws SHOuLd NO7 83 possI81E...}` |

---

## Overview

A C binary food ordering CLI. The goal is to trigger `print_coupon()`, which reads `/flag`. It is called when `total < 0` in `verify_total()`.

---

## Vulnerability

The order struct layout is:

```
[ item[32] ][ note[32] ][ price(int) ]
```

The chef note is read with `gets()`: no bounds check. Writing 32 bytes past `note[]` overflows into `price`, allowing it to be replaced with any negative value. When `total` goes negative, the coupon (flag) is printed.

---

## Exploit

```python
payload = b'A' * 32 + b'\xff\xff\xff\xff'  # -1 in little-endian
```

Steps:
1. Order any item
2. Send payload as the chef note
3. Finish order (`0`)
4. Receipt shows `$-1`, total becomes `-1` → coupon printed

---

## Fix

Replace:
```c
gets(cur->note);
```
With:
```c
fgets(cur->note, sizeof(cur->note), stdin);
```

`gets()` was removed from C11 for exactly this reason.

---

## Flag

```
GPNCTF{W4It, wI7H tHe5E Pr1C35, ov3RfL0ws SHOuLd NO7 83 possI81E...}
```
