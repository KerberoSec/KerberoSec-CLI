# Collector

**Category:** Reversing  ·  **Flag:** `ASIS{e6a680925dfd79e36}`

## Challenge Description

`collector` is a stripped, statically-linked x86-64 ELF that models a small garbage-collected
heap. We must supply a 17-character hex candidate whose JSON output exactly matches
`target.json`. Supporting files:

```text
collector          the checker / oracle
heap.snap          target heap snapshot
target.json        the values our candidate must reproduce
calibration.snap   a smaller example snapshot
calibration.json   three example candidate/output pairs
flag.enc           a separate JSON envelope (red herring: never opened by the checker)
```

Usage is `collector SNAPSHOT CANDIDATE`; a valid run prints one JSON object with a route lock,
six 16-bit observations, and a trace tag.

## Initial Analysis

Reversing `main` shows the 17-hex candidate is split into two independent roles:

```text
d || w0 || w1 || w2 || w3
^     four groups of four hex digits
route nibble
```

The four words are packed little-endian by **word**:
`P = w0 | (w1<<16) | (w2<<32) | (w3<<48)`. The first nibble `d` controls heap reachability;
`P` is the unknown input to a small substitution-permutation network. Keeping these separate
is the whole trick.

## Vulnerability / Core Concept

**Two decoupled sub-problems, both cheaply solvable.**

**1. The route nibble is leaked by decoys.** The snapshot header holds eight root indices
`[12, 63, 108, 15, 93, 5, 40, 19]`. For bit `i` of `d`,
`selected[i] = roots[2*i + ((d>>i)&1)]`. The route lock depends on this selection but not on
`P`, so holding the last 16 digits at zero and trying all 16 nibbles reproduces `target.json`'s
`route_decoys` array: all except one value:

```bash
for d in 0 1 2 3 4 5 6 7 8 9 a b c d e f; do
    ./collector heap.snap "${d}0000000000000000"
done
```

The missing decoy is the target route lock `2812c86f`, uniquely fixing `d = e` (binary `1110`,
selecting root slots 0,3,5,7 → heap nodes 12,15,5,19).

**2. The garbage collector folds heap state into a 64-bit accumulator.** `heap.snap` (magic
`COLMEM01`, v4, 112 node records) is traced from the four selected roots through three rounds of
mark → ephemeron activation → compaction. The mark step folds each first-visited node's metadata
and payload: plus compaction info: into a rolling 64-bit state (the literal challenge hint:
traced heap data survives compaction to affect the checker). For route `e` this yields
`S = 0x396aae1849b77602`, cross-checked by
`route_lock = low32(splitmix((S ^ 0xd4e12c77a59b3f06) + G)) == 0x2812c86f`.

**3. The observation function is an invertible SplitMix/SPN.** With `S` known, the initial key
`K2 = splitmix((S ^ 0x43c6ef372fe94d81) + G)` gives `x = P ^ K2`. Three rounds apply a
state-dependent key, a nibble S-box `[c,5,6,b,9,0,a,d,3,e,f,8,4,7,1,2]`, and a bit permutation
(`bit i → (16*i) mod 63`, bit 63 fixed). Each round emits two linear combinations of the 16-bit
limbs as observations; `target.json` supplies all six: `28342, 26590, 14799, 26263, 27497, 3524`.
Everything is known except the 64-bit `P`.

## Exploitation

Rather than hand-invert six partial 16-bit outputs, `solve_z3.py` models `P` as a 64-bit Z3
bit-vector, translates the SplitMix/S-box/permutation operations literally, and constrains the
six observations. It then excludes the first model and re-solves to prove uniqueness:

```text
sat
P = 9e36dfd709256a68
words = [6a68, 0925, dfd7, 9e36]
unique? unsat
```

`solve.py` is a plain-Python reference of the same observation function that reproduces the route
lock and all six observations for the recovered `P`. Writing `P` back in the parser's word order
and prefixing the route nibble gives `e || 6a68 || 0925 || dfd7 || 9e36 = e6a680925dfd79e36`.

Final verification against the binary:

```bash
$ ./collector heap.snap e6a680925dfd79e36
{"route_lock":"2812c86f","observations":[28342,26590,14799,26263,27497,3524],"trace_tag":"f4d95def451aaf17"}
```

Every field, including the trace tag, matches `target.json`.

## Flag

`ASIS{e6a680925dfd79e36}`

## Key Takeaways

- Split a compound input into independent roles early: one nibble drove reachability, the rest
  drove an SPN, and each half was easy alone.
- Decoy arrays in the expected output can leak a value by elimination (fifteen decoys → the one
  missing route lock is the target).
- SplitMix64 finalizers and nibble S-box/bit-permutation networks are bijective; a Z3 bit-vector
  model recovers the preimage and a second `unsat` proves it is unique.
- `flag.enc` was a deliberate red herring: a syscall trace shows the checker never opens it.
