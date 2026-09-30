# ASIS Arch

**Category:** Reversing  ·  **Flag:** `ASIS{M1ddL3_3nd14n_N1bbL35_M4k3_Q3MU_D122y!}`

## Challenge Description

We are given a tiny custom CPU emulator (`qemu-asisarch`) and a ROM (`challenge.rom`)
built for that made-up processor. Despite the intimidating "QEMU" name, the host binary
is a ~14 KB stripped x86-64 ELF, not a real QEMU build. Running it prompts:

```text
=== ASISARCH Secure Enclave v2.0 ===
Enter flag:
```

A wrong flag yields `[-] Access Denied. Invalid flag.` The goal is to reverse both the
custom instruction encoding and the flag checker running inside the emulated CPU.

## Initial Analysis

`file` shows `qemu-asisarch` is a small stripped PIE and `challenge.rom` is raw data.
`strings` on the emulator leaks interpreter-style errors (`illegal instruction`,
`PC out of bounds`, `ROM checksum mismatch`, `guest cycle limit exceeded`): a small
opcode-dispatch loop.

The ROM header begins with magic `AARQ`, version byte `2`, header size `0x20`, a payload
length, and a custom rolling checksum (seed `0x31415926`, stored value `0x8e70`). Everything
after offset `0x20` is copied to guest memory at address `0x0000`, where execution starts.

Disassembling the host with `objdump -d -Mintel` exposes the VM state layout: 64 KiB of
guest memory, eight 16-bit registers `r0..r7`, a 16-bit SP (initial `0xfff0`) and PC, a
64-bit cycle counter (limit 10,000,000), and fixed 4-byte instructions.

## Vulnerability / Core Concept

The instruction encoding is deliberately **PC-dependent**: the four instruction bytes are
scrambled differently at every program counter, which is why a hex editor shows no
recognizable opcodes. For each instruction:

```python
key = (((pc ^ 0x9e37) * 0x1039) + 0x79b9) & 0xffff
mix = rol16(key, 5)
# top two bits of key pick one of four byte permutations
permutations = [(0,1,2,3), (2,0,3,1), (3,2,1,0), (1,3,0,2)]
```

Opcode, destination register, and operand are then derived with more PC-mixed arithmetic.
A subtle trap: the destination register is scrambled **twice** through
`f(x) = ((x*5) ^ 3) & 7`: applying it once makes the emulator diverge and loop.

Recovering the 256-entry jump table yields 26 real opcodes (`mov_i`, `add_i`, `xor_r`,
`ldb`/`stb`, `jmp`/`jz`/`jnz`, `push`/`pop`/`call`/`ret`, `in`/`out`, `sbox`, `halt`, …).
There is no flags register. The only unusual op is `sbox`, which substitutes both bytes of
a register through a 256-byte permutation stored at guest address `0x2160` (so it is cleanly
invertible).

The verifier itself is straight-line: it reads a 44-byte input (length check against `0x2c`),
treats it as 22 little-endian 16-bit words, and runs **ten fully unrolled rounds**. Each round
is three stages:

- **A**: S-box each word and XOR a round constant baked into the code.
- **B**: in-place forward addition chain: `w[i] += w[i-1] + 0x5a5a` (with `w[0] += w[21]`).
- **C**: rotation/XOR diffusion using `F(x) = x ^ rol16(x,5) ^ rol16(x,11)`, with a
  per-round rotation amount 1..10.

The final check XORs each transformed word with a hidden target (stored as XOR pairs in a
misaligned table at `0x7cdb`) and accepts when the sum of all 22 differences is zero mod 2^16.

## Exploitation

Because every stage is invertible, no brute force is needed: set every transformed word equal
to its target and undo the ten rounds from round 9 down to round 0. The key detail is that
stages B and C are in-place, so their inverses must process word stores in **reverse order**
(21 → 0). Stage A is undone by removing the round constant then applying the inverse S-box.

- `solve.py`: a faithful reimplementation of the PC-dependent decoder and the full ISA. It
  reproduces the original emulator's output byte-for-byte (verified with `ASIS{test}`).
- `recover.py`: uses that decoder to read the round constants and target table directly out
  of the unrolled guest code, then inverts all ten rounds to recover the flag.

Running the recovered flag back through the original binary:

```bash
printf '%s\n' 'ASIS{M1ddL3_3nd14n_N1bbL35_M4k3_Q3MU_D122y!}' \
  | ./qemu-asisarch -M asisboard -kernel challenge.rom -nographic
# [+] Access Granted! Flag verified.
```

## Flag

`ASIS{M1ddL3_3nd14n_N1bbL35_M4k3_Q3MU_D122y!}`

## Key Takeaways

- A custom "CPU" whose instruction fields are permuted per-PC looks unreadable but is just a
  decoder to rebuild. Reimplement it and diff against the real emulator for confidence.
- Watch for double-applied register scramblers: a single application silently breaks the VM.
- An add/rotate/XOR round function built entirely from invertible operations can be reversed
  exactly; recover the target state and walk the rounds backward instead of guessing.
- The leetspeak flag ("Middle endian nibbles make QEMU dizzy!") is a hint at the encoding.
