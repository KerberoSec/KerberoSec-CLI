
# Easy RE Challenge: BDSec CTF 2026

**Category:** Reverse Engineering **Points:** 80 **Author:** NomanProdhan **Flag:** `BDSEC{e4SY_r3v3rS3_eNg1N33r1nG_cH4LL4ng3}`

---

## the vibe

"An easy RE challenge for you. Crack it." Cool, cool. It's mostly easy, except the author left three fake flags lying around to eat your submission attempts. Rude. Fun though.

## first look

```
$ file e4sy_RE.bdsec
ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

**Not stripped.** Love that for us. `nm` gives up the goods immediately:

```
00000000000023c0 r expected.0
00000000000023e0 r expected.1
0000000000002400 r expected.2
0000000000002420 r expected.3
0000000000002450 r key_part_b.4
0000000000002458 r key_part_a.5
00000000000010e0 T main
```

Four `expected` buffers. Four. For one flag. That's already the whole plot spoiled: there are gonna be decoys.

Running it just gives you an ASCII banner, a "lucky number," and a prompt. The lucky number comes from `srand(time() ^ clock())` and is never used for anything. Pure vibes-based misdirection, ignore it.

## the actual structure

Pop open `main` and the shape is dead simple:

1. `fgets` your input
2. `strcspn` to chop the newline
3. branch on the **length** of what you typed
4. run a length-specific transform, compare to a length-specific `expected` buffer

The length checks:

```asm
cmp    rcx,0x29    ; 41 → real deal
cmp    rcx,0x1d    ; 29
cmp    rcx,0x1a    ; 26
cmp    rcx,0x18    ; 24
```

Anything else → "Incorrect flag." So it's really four mini-challenges welded together.

And the tell for which one matters is in the success paths. Three of them land on:

```
[+] Congratulations! You found a flag!
[+] Nice reversing work. Keep exploring the binary...
```

while the 41-byte branch lands on:

```
[+] Excellent work, reverse engineer!
[+] Submit the flag to the CTF platform to receive your points.
```

"Keep exploring the binary" is the game telling you to your face that you found a decoy.

## a note on the disassembly

GCC vectorized big chunks of this, so you'll see walls of `movdqa` / `psrldq` / `por` that look scary and are doing absolutely nothing interesting. Two patterns to recognize and then mentally delete:

- **The `psrldq` staircase** (shift by 8, 4, 2, 1 with `por` between) is a horizontal OR-reduce. It's just accumulating "did any byte differ" into one register. That's a memcmp, that's it.
- **`paddb` + `psrlw`/`pand` + `por`** is a rotate done 16 bytes at a time. In the 29-byte branch, the SIMD block handles bytes 0-15 and the scalar loop right below handles 16-28 with identical math. You can read the scalar loop and just assume the SIMD block agrees. (It does: the constant table at `0x2480` is `0x21 + 3*i`, and the scalar loop starts its counter at `0x51`, which is `0x21 + 3*16`. Checks out.)

Once you throw those away, each branch is like six real instructions.

## branch 1: length 24

Running accumulator, each output feeds the next:

```
a = 0x6b
for i in 0..23:
    a = rol8((a + (in[i] ^ (0x55 + 0x11*i))) & 0xff, 3)
    out[i] = a
```

Chained, but trivially invertible backwards since you know the previous `a`: it's just the previous output byte.

→ `CFLAG{y0u_f0uNd_4_d3c0Y}`

Author is not being subtle.

## branch 2: length 26

Here's where the index permutation shows up:

```
out[(5*i) % 26] = ror8(in[i] ^ (0x3d + 7*i), (i % 5) + 1)
```

The `(5*i) % 26` scatter is done with a magic-number division (`0x4ec4ec4ec4ec4ec5`, shift 3) instead of an actual `div`. Compilers do this constantly, don't let it spook you: it's `/ 26`.

→ `BFLAG{r3v3rS1ng_1s_4n_4rT}`

## branch 3: length 29

Simplest of the lot, no permutation at all:

```
out[i] = rol8((in[i] + (0x21 + 3*i)) & 0xff, 2) ^ 0xa7
```

→ `AFLAG{n1c3_trY_bUt_n0_p01nTs}`

Three fakes down. `CFLAG`, `BFLAG`, `AFLAG`: all one letter off from `BDSEC`, all of them would burn an attempt.

## branch 4: the real one, length 41

Same ideas, just stacked:

```
out[(13*i) % 41] = rol8(in[i] ^ key_a[i&7] ^ key_b[i&7], (i%7) + 1)
                   + (((11*i) & 0xff) ^ 0x23)
```

Where the keys are two 8-byte tables that get XORed together and cycled:

```
key_part_a @ 0x2458 : 23 05 79 1b 6c c1 84 0f
key_part_b @ 0x2450 : 5b 75 b4 7b cb 5d 73 e6
```

The `(13*i) % 41` scatter is a permutation and not a lossy mess because **13 and 41 are coprime**: every input index maps to a unique output slot. Which means every step here is reversible, and there's zero brute forcing needed.

Invert it top to bottom: subtract the counter term, rotate right instead of left, XOR the keys back off.

## solve script

```python
d = open('e4sy_RE.bdsec','rb').read()
rd = lambda a, n: d[a:a+n]          # vaddr == file offset for .rodata here

exp3 = rd(0x2420, 41)
ka   = rd(0x2458, 8)
kb   = rd(0x2450, 8)

M = 0xff
ror = lambda v, r: ((v >> (r & 7)) | (v << (8 - (r & 7)))) & M if r & 7 else v

out = [0] * 41
for i in range(41):
    v = (exp3[(13*i) % 41] - (((11*i) & M) ^ 0x23)) & M
    out[i] = ror(v, (i % 7) + 1) ^ ka[i & 7] ^ kb[i & 7]

print(bytes(out).decode())
```

One thing worth checking before you index into the file: `.rodata` sits at vaddr `0x2000` with file offset `0x2000`, so raw file offsets work directly. `readelf -S` to confirm, don't just assume it.

## confirming it

Don't submit on vibes, the binary will tell you:

```
$ echo 'BDSEC{e4SY_r3v3rS3_eNg1N33r1nG_cH4LL4ng3}' | ./e4sy_RE.bdsec
[+] Excellent work, reverse engineer!
[+] Submit the flag to the CTF platform to receive your points.
```

That's the good message, not the "keep exploring" one. Ship it.

## flag

```
BDSEC{e4SY_r3v3rS3_eNg1N33r1nG_cH4LL4ng3}
```

## takeaways

- `nm` on an unstripped binary is free reconnaissance. Four `expected` symbols told the whole story before I read a single instruction.
- **Read the success messages carefully.** The decoys all print something congratulatory-but-hedged. That distinction was the entire anti-decoy mechanism and it's sitting right there in `strings`.
- Multiply-by-a-magic-constant is division. `0x4924924924924925` → `/7`, `0xc7ce0c7ce0c7ce0d` + `shr 5` → `/41`, `0xcccccccccccccccd` → `/5`. Once you clock the pattern the loops read like C.
- When you see `out[(k*i) % n]` with `gcd(k, n) == 1`, that's a permutation, which means it's invertible, which means no brute force. Check the gcd before you start writing a solver you don't need.
- Anything that looks random but never touches the comparison (hi, lucky number) is set dressing.

