# LeakMeAk

**Category:** Reversing  ·  **Flag:** `ASIS{haaducrcplmekhylrozcxyxzuizs}`

## Challenge Description

> *In LeakMeAk, even the flag has trust issues.*

A small stripped 64-bit Linux PIE (`leakmeak.elf`) that checks a flag, plus a remote service.
The goal is to find the one flag that makes it print `Access Granted! Correct Flag.`

## Initial Analysis

`file` reports a stripped, dynamically-linked 64-bit PIE. `strings` reveals the interface
(`Enter Flag:`, `%127s`, `Access Denied!`, `ASIS{`, `Access Granted! Correct Flag.`), so it
reads one whitespace-free string: a pure reversing problem, no memory corruption.

Near the start of `main` there are three easy checks:

1. `strlen(input) == 0x22` → the flag is 34 bytes.
2. First five bytes must be `ASIS{`.
3. Last byte must be `}`.

That leaves 28 unknown bytes, processed as **seven four-byte chunks**.

## Vulnerability / Core Concept

For one chunk with bytes `a,b,c,d`, the verifier packs them big-endian:
`packed = (a<<24)|(b<<16)|(c<<8)|d`, and maintains an eight-byte table starting
`[5, 21, 10, 14, 0, 0, 0, 0]`. The low 3 bits of `b,c,d` index the table; the low 2 bits of `a`
choose a new value `q` written into `table[b&7]`. Each chunk produces a word:

```python
mix  = (q << 24) ^ (u << 16) ^ (v << 8) ^ ib      # u=table[c&7], v=table[d&7], ib=b&7
word = (packed * 0x9e3779b9) ^ mix                # mod 2^32
```

An entry counts as "active" when `(x & 3) == 1` (values 5 and 21). Between chunks the verifier
enforces conflict rules (5 and 21 "don't trust" each other) and per-slot usage counters.

**The two exploitable layers:**

- **The seven final words are pinned by a solvable system.** After all chunks, the words are
  checked in a cycle against `.rodata` constants:
  `(ror(word[i%7], 13) + word[i-1]) ^ keys[i-1] == targets[i-1]`. Z3 solves these bit-vector
  equations instantly, giving the exact seven words. (The binary also hashes them to
  `0xddaacf25` / `0x376a3d36`, confirming consistency.)
- **The multiply is invertible.** `0x9e3779b9` is odd, so it has an inverse mod 2^32
  (`0x144cbc89`). Once `q,u,v,ib` are guessed, the packed characters are recovered directly:
  `packed = ((word ^ mix) * inverse) & 0xffffffff`: no brute force over 95^4 printable inputs.

## Exploitation

`solve.py` runs a depth-first search per chunk: for each small guess of the table indexes and
`a`'s low bits it inverts the multiply, unpacks `a,b,c,d`, and keeps the result only if all
bytes are printable, the guessed indexes/branch match, and the table/conflict/counter checks
pass. The surviving-prefix counts collapse quickly:

```text
round 0: 1   round 1: 2   round 2: 2   round 3: 4
round 4: 2   round 5: 1   round 6: 1
```

Two final table requirements (`real(table[0])` and `(table[1] & 3) == 2`) prune the rest,
leaving one 28-byte body: `haaducrcplmekhylrozcxyxzuizs`.

Verification against the binary (and the remote service):

```bash
printf '%s\n' 'ASIS{haaducrcplmekhylrozcxyxzuizs}' | ./leakmeak.elf
# Enter Flag: Access Granted! Correct Flag.
```

## Flag

`ASIS{haaducrcplmekhylrozcxyxzuizs}`

## Key Takeaways

- A verifier dressed up as a complicated state machine often has a small solvable core: pin the
  intermediate words with Z3, then reverse each word into characters.
- An odd multiplicative constant mod 2^32 is invertible: reverse the arithmetic instead of
  brute-forcing four printable bytes at a time.
- Once the reversible arithmetic is separated out, the "trust issues" table checks are just a
  handful of tiny constraints for a depth-first search.
