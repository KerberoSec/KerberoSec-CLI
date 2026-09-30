# RIFFHACK Escrow Terminal: Writeup

**Category:** Binary Exploitation · **Difficulty:** Medium **Flag:** `bitctf{{35cr0w_n0735_wr173_th3_ch3ck}}`

## TL;DR

The "review buyer note" menu option renders the note with `printf(note, …)`: the note is the format string. Positional argument `%3$` always points at the live `active_vault` pointer. After using "sync dispute cache" to mark a second vault struct as trusted, a single `%hn` write repoints `active_vault` to it, and "finalize escrow" hands over the flag.

## Recon

The download is a `Mach-O arm64` binary. Strings and a static disassembly reveal the menu, a `/flag.txt` reader, and the relevant primitives:

- Imports include `___strcpy_chk`, `printf`, `strtoul`, `fopen/fread`, `calloc`.
- Interesting cstrings: `active vault label: %s`, `approval latch: 0x%04x`, `escrow held. active vault is not trusted.`, `/flag.txt`, `escrow released:`.

## Program model

`setup()` allocates two 40-byte (`0x28`) vault structs via `calloc(2, 0x28)` and stores globals in `.bss`:

|addr|meaning|
|---|---|
|`bss+0x00`|`active_vault` pointer → struct #1|
|`bss+0x08`|`vault_base` (heap base)|
|`bss+0x10`|`G_choice`, randomized 0-4 each run|

Each struct:

|offset|field|
|---|---|
|`+0x00`|`u16 approval_latch`|
|`+0x02`|`u16 mirror_latch`|
|`+0x04`|`u32 deal_id` = `0x7791`|
|`+0x08`|`char label[0x20]`|

### The release gate (option 5)

```
release if  active_vault->approval == 0x51ff
       and  active_vault->mirror   == approval ^ deal_id ^ 0x2a5a
```

With `approval = 0x51ff` and `deal_id = 0x7791`:

```
0x51ff ^ 0x7791 ^ 0x2a5a = 0x0c34
```

### The hint (option 4)

"Sync dispute cache" writes `approval = 0x51ff` and the matching mirror **on struct #2** (`vault_base + 0x28`), but `active_vault` still points at struct #1, so finalize keeps failing. We need to make struct #2 the _active_ one.

## The bug (option 3)

`render_note(note)` does `printf(note, …)` with attacker-controlled `note`. The variadic argument order always starts:

```
%1$ = width      (user int)         %4$ = &bss[2]
%2$ = 'R'        (0x52)             %5$ = &bss[4]
%3$ = &bss[0]    <-- low bytes of active_vault pointer
%6$..%14$ = nine shuffled pointers (order depends on G_choice)
```

Four of `%6$..%14$` are heap pointers: `vault_base + {0x07, 0x13, 0x21, 0x2d}`.

### Note validator

A note is rejected only if a `%` is followed (within 18 chars) by `n` as the **first** letter, and it must satisfy `strlen < 0x60`. Because the first letter after `%` in `%3$hn` is `h`, the write specifier passes cleanly. Positional specifiers are also ABI-independent, so the same payload works on the arm64 download and the (x86-64) remote.

## Exploit chain

1. **Option 4**: sync dispute cache → struct #2 becomes trusted.
2. **Leak** `vault_base`: review a note of `%6$p.%7$p.…%14$p`; the four heap pointers cluster within `0x30`, so `vault_base = min(cluster) − 7`.
3. **Repoint**: review `%2$<W>c%3$hn` where `W = (vault_base + 0x28) & 0xffff`. This prints `W` characters then `%hn` writes `W` into the low 16 bits of `active_vault`, moving it from struct #1 to the trusted struct #2. (Reconnect on the ~0.04% case where the low 16 bits would carry.)
4. **Option 5**: finalize sees a trusted active vault and prints the flag.

## Key payloads

```python
leak  = '.'.join('%%%d$p' % i for i in range(6, 15))
write = '%%2$%dc%%3$hn' % ((vault_base + 0x28) & 0xffff)
```

## Lessons

- `printf(user_input)` is the entire bug; the menu structure just shapes which pointers land in the argument list.
- You don't need an arbitrary-address write: one in-bounds pointer in the arg list (`&active_vault`) plus a 2-byte `%hn` is enough to swap a "trusted" object under the gate.
- Positional format specifiers keep a payload portable across calling conventions, which matters when you reverse an arm64 binary but exploit an x86-64 server.
