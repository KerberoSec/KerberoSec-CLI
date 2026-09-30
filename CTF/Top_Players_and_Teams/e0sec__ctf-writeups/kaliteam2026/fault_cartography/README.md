# Fault Cartography: Kali Team CTF 26 writeup

**Category:** Reverse Engineering
**Flag:** `KaliTeam{faults_draw_the_only_honest_path}`

## Challenge

Two files: `faultline` (a stripped x86-64 PIE ELF) and `faultline.map` (a
6222-byte binary blob). Running the binary with no arguments does nothing;
running it with the map file as an argument prints `lost` and exits 1. The
prompt:

> Every road on the map is syntactically valid. Only one route crashes in the
> right order, and the destination remembers the exact sequence of faults.

## Setup: running/debugging an x86-64 Linux binary on Apple Silicon

The challenge binary is `x86_64` ELF, and my host is macOS/arm64. Docker's
`--platform linux/amd64` binfmt path can *execute* the binary (via the
kernel's QEMU binfmt_misc registration), but `ptrace()` inside that path is
broken: `gdb` fails with `Couldn't get registers: Input/output error`.

The fix: run `qemu-x86_64` (the *user-mode* emulator) directly inside a
native **arm64** container, pointed at a copy of the x86-64 dynamic
linker/libc via `-L <rootdir>`, and use its built-in GDB stub (`-g <port>`)
instead of relying on ptrace:

```bash
qemu-x86_64 -L /amd64root -g 1234 ./faultline faultline.map
```

Then `gdb-multiarch -ex 'target remote localhost:1234'` gets a fully working
remote-debugging session: breakpoints, memory read/write, register access: without ptrace ever entering the picture. This was the key enabler for
everything that follows.

One more wrinkle: the binary installs `sigaction` handlers for `SIGILL`,
`SIGFPE`, and `SIGSEGV` and deliberately crashes itself as part of its
normal operation (see below). By default GDB intercepts and stops on those
signals. Fix: `handle SIGSEGV/SIGILL/SIGFPE nostop noprint pass` so they're
forwarded to the guest's own handler, same as an undebugged run.

Also: single-stepping (`stepi`) *through* the actual faulting instruction
does not work under this qemu-gdbstub setup: it just kills the process.
Only `continue` correctly delivers the signal to the registered handler.
Useful for step-tracing, but only between fault points.

## Reversing the map format

`faultline.map` is a header (78 bytes) + 256 × 24-byte "road" records:

```
offset 0x00  magic "FLT2"
offset 0x04  u16 version (2)
offset 0x06  u16 fieldA        -> number of rounds to walk (104)
offset 0x08  u16 pathlen       -> required argv[1] length (42)
offset 0x0a  u16 format (0x30)
offset 0x0c  u8  b_c
offset 0x0d  u8  b_d
offset 0x0e  u64 seed
offset 0x16  48 bytes of encrypted "target" secret
offset 0x46  u64 header checksum
offset 0x4e  256 × 24-byte encrypted road records
```

A `splitmix64`-style finalizer over `seed ^ 0x1bd11bdaa9fc1a22` produces a
**session key**. Each 24-byte road record is itself encrypted with a
wyhash/splitmix-flavored 3-block keyed hash (session key + the road's own
grid index folded in), decrypting to:

```
F0        fault type required this round (0/1/2 -> SIGILL/SIGFPE/SIGSEGV)
F1        sub-opcode selector
F2..F4    operands (all effectively used mod 6, driving 6 state "slots")
F5        2-bit walk direction (N/E/S/W)
F6-F7     extra 16-bit operand
K (8B)    XOR/add key material
Q (8B)    unused by the solve (decoded but not read back)
```

## The VM

- A **16×16 grid** of roads (256 = 16×16). Starting cell `(X0, Y0)` is
  derived from nibbles of `seed` XORed with `b_c`/`b_d`.
- A **6-slot × 64-bit state array**, initialized as the raw bytes of
  `argv[1]` (42 bytes, zero-padded to 48): confirmed by memory-dumping
  right after the `memcpy`.
- That raw state is immediately **whitened** by a splitmix-style keystream
  (6 blocks, keyed by `seed`) before any road processing touches it.
- For `fieldA` = 104 rounds: decode the road at the current cell, then
  **deliberately trigger the exact fault type (`F0`) the road specifies**
  via `ud2` / null-pointer write / integer divide-by-zero. The registered
  signal handler (`sigaction`, `SA_ONSTACK`) catches it, applies one of six
  op variants to the 6-slot state (selected by `F0`/`F1`: additive, XOR,
  multiplicative-by-odd-constant, a 2-slot swap/mix, or a full 6-slot
  rotation: all individually invertible), then `siglongjmp`s back. The
  walk then advances 1 cell in the road's stored direction and repeats.
- After 104 rounds, the final 6-slot state must exactly equal a 48-byte
  **target** value decoded from the header's embedded ciphertext (a
  separate splitmix-block cipher, keyed by a value read off the stack at
  that point in the function: empirically confirmed to be
  constant/input-independent by comparing across different dummy inputs).

Crucially: **which road is visited, and which operation is applied, depends
only on the map file** (grid position + decoded road fields): never on the
state's actual values. So the whole 104-round transform is a **fixed,
input-independent, invertible function** of the 48-byte initial state.
Only the initial `argv[1]` bytes are unknown.

## Solving

1. Dynamically validated every stage against the running binary in small
   pieces (per-road decode, single ops, the whitening step, the full
   104-round chain) by writing GDB scripts that plant a known state via
   `inferior.write_memory`, run to completion, and diff against a
   pure-Python re-implementation: this caught several transcription bugs
   from reading `objdump` output by hand (e.g. a `movzx eax,ah` /
   `movzx eax,al` idiom that looked like it extracted a division
   *quotient* but actually re-extracted the *remainder*, and a completely
   missed pre-round "whitening" pass).
2. Once the Python re-implementation matched the real binary bit-for-bit
   across all 104 rounds, I inverted every primitive (XOR, add,
   odd-multiply mod 2⁶⁴, rotate, permutation) in reverse round order,
   starting from the decoded 48-byte target, to recover the required
   whitened initial state, then inverted the whitening keystream to get
   the raw required `argv[1]` bytes.
3. Result: `KaliTeam{faults_draw_the_only_honest_path}` (42 bytes, no
   embedded NUL, exactly matching `pathlen`).
4. Verified against the real binary under `qemu-x86_64`:
   ```
   $ qemu-x86_64 -L /amd64root ./faultline 'KaliTeam{faults_draw_the_only_honest_path}'
   the map remembers you
   ```

## Files

- `solve.py`: the full re-implementation + inverter that
  produces the flag.
- [`scripts/`](scripts/): the GDB/Python scripts used to dynamically
  verify each stage against the real binary via the qemu gdbstub.
- [`dis.txt`](dis.txt): full `objdump -d` disassembly of `faultline`.

## Lessons learned

- **ptrace under cross-arch Docker emulation is unreliable: use
  `qemu-user`'s own gdbstub instead.** `-g <port>` sidesteps the whole
  ptrace-through-QEMU problem and gives a fully working remote-debugging
  session.
- **Don't trust a single hand-transcribed read of disassembly for a VM
  with dozens of op variants.** Validate against the real, running binary
  in small pieces: plant known state, run one round, diff. This is what
  actually caught the bugs (a mis-read division remainder/quotient, and an
  entirely missed whitening pass) that a static-only reading would have
  silently gotten wrong.
- **A "random walk that deliberately crashes" is still just a fixed,
  invertible function once you notice control flow never depends on
  runtime data values.** The fault types and operations are baked into the
  map file, not chosen by the state, so the whole 104-round transform
  reduces to composing and inverting simple bijections (XOR, add, odd
  multiply mod 2⁶⁴, rotate, permutation), no brute force or SMT solver
  needed once that was understood (Z3 was tried first but was too slow in
  practice for the full symbolic 104-round chain).

---
*Written with substantial AI assistance in analysis and writing.*
