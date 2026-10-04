# Revenant Buddy

**Category:** Pwn  ·  **Flag:** `ASIS{8bf2fd2a3f7eecec5f5fab1861e51c579975ba45}`

## Challenge Description

The server accepts a tiny custom program, checks that it is "safe" with a
verifier, then runs it in a virtual machine with eight registers. One register
holds a secret random 64-bit capability; to read the flag the submitted program
must prove it knows both that value and a hash-like transform of it. The archive
contains two stripped, statically linked 64-bit x86 executables:

```text
revenant-supervisor   # network-facing setup, spawns a worker per client
revenant-worker       # protocol, verifier, and virtual machine
```

Useful strings in `revenant-worker`: `RB/2 release=%s words=%u regs=%u`,
`INFO`, `RUN `, `QUIT`, `ERR program`, `ERR capability`, `flag`, `OK %s`,
`OK halted`. Banner:

```text
RB/2 release=fe753d7fdd51acc3b3a23109 words=64 regs=8
```

Both binaries are PIE/NX/RELRO with canaries, but that is a distraction: the
bug is in the VM's verifier logic.

## Initial Analysis

`RUN <hex>` parsing requires valid hex, an even length, a size multiple of 4,
and at most 64 four-byte words. The submitted bytes are **not** the VM words
directly: each little-endian 32-bit word passes through a reversible
obfuscation layer:

```python
decoded = rol32(raw ^ mask[i] ^ xor_table[i], (i % 29) + 1)
decoded ^= 0x7824F328
```

`mask[i]` is built from three bytes of a 256-byte table at file offset `0x93A60`;
`xor_table` starts at `0x93B60`. Since rotate/XOR/table lookups are reversible,
encoding any word is easy:

```python
raw = ror32(decoded ^ 0x7824F328, (i % 29) + 1)
raw ^= mask[i] ^ xor_table[i]
```

The first decoded word must be the program marker `0xefc6ab35`; the rest are VM
instructions. The VM has registers `r0..r7`; at start `r0..r6 = 0` and
`r7 = random 64-bit capability` (from `/dev/urandom`). Relevant opcodes:

- **`0xD9`**: `reg[dst] = ((immediate + 1) * reg[left]) ^ reg[right]`. With
  `left = r0` (zero) the multiply vanishes → a **copy**: `reg[dst] = reg[right]`.
- **`0x8D`**: `reg[dst] = mix(reg[src])`, a MurmurHash-style finalizer.
- **`0x9E`**: capability check: `reg[first] == capability` and
  `reg[second] == mix(capability)`; failure returns `ERR capability`.
- **`0xDC`**: halt; reaching it after a successful check reads and returns the flag.

## Vulnerability / Core Concept

A verifier runs before execution, tracking a "type" per register alongside its
value. Initial states are embedded as `[0, 1, 1, 1, 1, 1, 1, 2]`: `r0` empty,
`r1..r6` ordinary, `r7` protected capability.

The mistake is the verifier's rule for `0xD9`: it allows a protected/mixed
capability as the right-hand input but **marks the destination ordinary**, never
propagating the protected type. That is **capability laundering**: copy a
protected value with `0xD9`, the verifier labels the copy ordinary, and the
ordinary-only capability check then passes using the secretly protected value.
The random secret never has to be leaked or guessed; it is simply moved around
while fooling the verifier about its type.

## Exploitation

Full script in `solve.py` (`HOST`/`PORT` redacted; it reads the obfuscation
tables from the supplied `revenant-worker` and re-encodes the words). The decoded
program is one header plus five instructions:

```text
0xefc6ab35    program marker
0x000239d9    D9: r1 = 2*r0 XOR r7   -> capability      (verifier: ordinary)
0x00003a8d    8D: r2 = mix(r7)       -> mix(capability) (verifier: protected)
0x000213d9    D9: r3 = 2*r0 XOR r2   -> mix(capability)  (verifier: ordinary)
0x0000199e    9E: check r1 == cap and r3 == mix(cap)
0x000000dc    DC: halt
```

The two `0xD9` copies launder `r7` into `r1` and `mix(r7)` into `r3`, both marked
ordinary, so `0x9E` sees two "ordinary" registers whose runtime values are
exactly `capability` and `mix(capability)`. The encoder counters start at
`3, 17, 91` and advance by `47, 29, 11` per word to index the mask table.

Encoded payload:

```text
4285cfe9c40257076ac2e0b0dafabec8ad3e5f973bcb81d3
```

Sending it:

```text
$ python3 solve.py <HOST> <PORT>
RB/2 release=fe753d7fdd51acc3b3a23109 words=64 regs=8
OK ASIS{8bf2fd2a3f7eecec5f5fab1861e51c579975ba45}
```

> Note: the file offsets `0x93A60` / `0x93B60` are specific to this
> `revenant-worker` build, not universal.

## Flag

`ASIS{8bf2fd2a3f7eecec5f5fab1861e51c579975ba45}`

## Key Takeaways

- The secret never needs to leave the VM: the exploit computes with it directly.
- A verifier must model the executor **exactly**. Here the verifier's idea of
  what `0xD9` does (produce an ordinary value) differs from what it really does
  (copy whatever is in the source, including a protected capability).
- A perfectly memory-safe checker is still exploitable when its abstract model of
  the program diverges from the program's real behavior.
