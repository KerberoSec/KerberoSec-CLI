# Lesh

**Category:** Reversing  ·  **Flag:** `ASIS{BorrowM3y0urEyess_!!!!}`

## Challenge Description

> We got an incomplete Lesh shellcode, try to run and catch the flag!

A single archive containing `lesh.hex`: one long line of hexadecimal, no executable, no source,
no instructions. It turns out to be **32-bit Windows shellcode** stuffed with junk instructions,
long delays, misleading strings, and deliberately broken control flow. The real flag lives on
the stack only briefly before another part of the shellcode overwrites it, so *when* you inspect
memory matters as much as *where*.

## Initial Analysis

Decode the hex to raw bytes and inspect:

```bash
xxd -r -p lesh.hex > lesh.bin   # 7,182 bytes, no PE header
ndisasm -b 32 lesh.bin | less
```

The prologue walks Windows process structures via `fs:[0x30]` to resolve APIs without an import
table: classic shellcode. The first API it resolves is `Sleep`.

## Vulnerability / Core Concept

The shellcode has three obstacles and a decoy chain:

1. **A 61-hour nap.** `push 0x0d34dc0d; call edi` (edi = Sleep) sleeps ~61 hours. Bypass by
   hooking the process's `Sleep` export to return immediately: the shellcode resolves the same
   export and calls the harmless replacement.
2. **The "incomplete" infinite loop** at offset `0x2a4`: `eb fe` (`jmp 0x2a4`). NOP it out
   (`90 90`). Two more conditional jumps steer the damaged code down dead paths; patch them too:
   `0x1257: 75 5A → 90 90` and `0x135b: 75 5A → 90 90`. These patches only force execution
   through mutation blocks already present: they do not manufacture the flag.
3. **A decoy flag that mutates into the real one.** If you stop at the first crash, the stack
   holds `ASIS{BorrowwwYourEyess!!!!!}`: convincing but **intermediate**. The useful path then
   applies five single-byte edits:

   | Offset | Operation | Effect |
   |---:|---|---|
   | `0x1259` | subtract `0x2a` | `w` → `M` |
   | `0x125f` | subtract `0x44` | `w` → `3` |
   | `0x135d` | add `0x20`      | `Y` → `y` |
   | `0x141f` | subtract `0x3f` | `o` → `0` |
   | `0x15c7` | add `0x3e`      | `!` → `_` |

   producing the progression `Borroww...` → `BorrowM3y0urEyess_...`. Immediately after (offset
   `0x16a1`) the shellcode overwrites the stack with a fake `ASIS{I_Cant_Be_Flag...` string and
   at the end builds `SAW FLAG???` for `FatalAppExitA`. The safe capture point is ~offset `0x1600`:
   after all five real mutations, before the decoy overwrite.

## Exploitation

`catch_true.c` is a tiny 32-bit Windows loader that: installs a vectored exception handler,
hooks `Sleep`, loads `lesh.bin` into RWX memory, applies the three control-flow patches, plants
an `INT3` (`0xcc`) breakpoint at offset `0x1600`, and scans the nearby stack for `ASIS{` when the
breakpoint fires.

```c
p[0x2a4] = p[0x2a5] = 0x90;   // kill the eb fe loop
p[0x1257] = p[0x1258] = 0x90; // steer past dead path 1
p[0x135b] = p[0x135c] = 0x90; // steer past dead path 2
p[0x1600] = 0xcc;             // breakpoint after all mutations
```

Build and run under Wine:

```bash
i686-w64-mingw32-gcc -O2 -o catch_true.exe catch_true.c
WINEDEBUG=-all wine catch_true.exe
# Caught exception 80000003 at EIP=...1600 ...
# Flag: ASIS{BorrowM3y0urEyess_!!!!}
```

> Note: the intermediate stack value `ASIS{BorrowwwYourEyess!!!!!}` is what appears at the first
> crash; the loader's later breakpoint reads the fully-mutated string. See the mutation table
> above for how one becomes the other.

## Flag

`ASIS{BorrowM3y0urEyess_!!!!}`: the fully-mutated string. (`ASIS{BorrowwwYourEyess!!!!!}` is only the intermediate decoy seen at the first crash.)

## Key Takeaways

- Don't trust the first flag-shaped string on the stack: shellcode can plant a believable decoy,
  mutate it, then bury it.
- Bypass long `Sleep` calls by hooking the export rather than waiting; the shellcode resolves the
  same function you replace.
- Placing an `INT3` at the right offset plus a vectored exception handler is a clean way to
  snapshot volatile memory at exactly the right moment.
