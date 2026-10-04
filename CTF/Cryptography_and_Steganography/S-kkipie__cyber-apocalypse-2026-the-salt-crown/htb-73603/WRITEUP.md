# Ancient Artifacts: HTB Crypto (ch 73603)

**Flag:** `HTB{zl1b_func710n5_r34lly_5houldn7_b3_us3d_1n_cryp70!}`

## Challenge

`server.py` (remote `154.57.164.82:31380`, 30s alarm):

```python
def apply_rune(rune, *nums):
    return rune("".join(str(num) for num in nums).encode())

num = secrets.randbits(128)
h = apply_rune(zlib.adler32, num)          # h = adler32(str(num)), num SECRET

my_salt = secrets.randbits(128)
your_salt = int(input("your salt: ")); assert your_salt.bit_length() >= 128
salted = apply_rune(zlib.adler32, my_salt, num, your_salt)   # adler32(str(my_salt)+str(num)+str(your_salt))
print(my_salt, salted)

# loop: give distinct numbers your_num with adler32(str(your_num)) == h
# then:
assert apply_rune(zlib.crc32, *nums) == h                    # crc32(concat) == h
assert reduce(xor, [crc32(str(n)) for n in nums]) == h       # XOR of per-number crc32 == h
print(flag)
```

We never learn `num` or `h` directly. Two sub-problems:
1. Recover `h` from the salted adler32.
2. Produce numbers satisfying three checks at once.

## Key reductions

**One number is enough (k=1).** If we find a single integer `n` with
`adler32(str(n)) == h` AND `crc32(str(n)) == h`, then give it once and stop:
- loop assert: `adler32(str(n))==h` ✓
- `crc32(concat=[n]) == h` ✓
- `XOR([crc32(str(n))]) == crc32(str(n)) == h` ✓

**Length limit.** The server does `int(input())`. CPython refuses `int(str)` over
4300 digits (`ValueError`), so `n` must be ≤ 4300 digits.

## Step 1: recover h (adler32_combine inversion)

`adler32(X||Y)` is computable from `adler32(X)`, `adler32(Y)`, `len(Y)` via
`adler32_combine`. It is invertible for either operand. With `M=str(my_salt)`,
`N=str(num)`, `Y=str(your_salt)` all except `N` known:

- `step1 = adler(M||N) = inv_a1(adler(Y), salted, len(Y))`
- `h = adler(N) = inv_a2(adler(M), step1, len(N))`

`len(N)` (digit count of a 128-bit int, ~39) is the only unknown. Recover the
a-part of `h` (independent of `len(N)`), then brute force `len(N)=1..45` and keep
the candidate whose implied `(a,b)` is a *feasible* adler for a real `len(N)`-digit
decimal string. For a 128-bit `num` the adler components never wrap mod 65521, so
feasibility (digit-sum range + weighted-sum range) pins `len(N)` uniquely.
Verified 3000/3000 with a single candidate.

## Step 2: build n with adler32(str(n)) = crc32(str(n)) = h

adler over bytes `b_i = 48 + d_i` (decimal digits `d_i`), length `L`:
```
a = 1 + 48L + Σ d_i                 (mod 65521)
b = L + 48·L(L+1)/2 + Σ (L-i)·d_i   (mod 65521)
```

**Adler solve (baseline).** Pick `L∈[4050,4300]` so the required total digit-sum
residue `SA=(h_a-1-48L) mod 65521` sits just above the fixed part. Then:
- fix `d0=1` (no leading zero) and 64 CRC "gadgets" (see below),
- a **WS-group** of 6 digits at weights `1,10,100,1000,3000,4000` can represent any
  exact target value in `[0,65520]` → solves the `b` congruence,
- a **DS-group** tail block solves the `a` congruence (total digit sum),
- coupling is only through digit-sums (≤ ~54), resolved by a tiny `sW` search.

**CRC control via adler-neutral gadgets.** A gadget = 3 consecutive digits.
Pattern A `(5,5,5)` ↔ Pattern B `(6,3,6)`. The delta `(+1,-2,+1)` keeps both
`Σd` and `Σ(L-i)d_i` unchanged (positions are an arithmetic progression in weight),
so toggling a gadget **preserves adler exactly**. Because CRC-32 is affine over
GF(2), each gadget toggle XORs a *constant* delta into `crc32`. Compute the 64
deltas, then Gaussian-eliminate over GF(2) to pick the gadget subset whose XOR
equals `h ^ crc32(baseline)`. Toggle them → `crc32(str(n)) == h`, adler untouched.

Result: `n` ≈ 4115 digits, `adler32==crc32==h`. Verified 300/300 on random `h`.

## Step 3: protocol

Connect, send a ≥128-bit `your_salt`, read `my_salt`/`salted`, recover `h`,
build `n`, send `1`, `n`, `2`, read flag. Whole build takes ~0.01s, well within 30s.

```
$ python3 exploit.py 154.57.164.82 31380
[+] recovered h=2535262129  built n (4115 digits) in 0.01s
HTB{zl1b_func710n5_r34lly_5houldn7_b3_us3d_1n_cryp70!}
```

## Files
- `construct.py`: adler+crc single-number builder (`construct(h)`), self-tests 300 random h.
- `recover.py`: `recover_h(my_salt, your_salt, salted)` via combine inversion, self-tests 3000.
- `exploit.py`: end-to-end (`run_local` mock / `run_remote host port`).

## Takeaway
adler32/crc32 are checksums, not hashes: both are affine and composable
(`combine`), so preimages and multi-constraint collisions are constructible with
linear algebra. Exactly what the flag says.
