# RIFFHACK: Coupon Malleability

**Category:** Cryptography · **Difficulty:** Medium **Flag:** `bitctf{{cbc_c0up0n5_n33d_m4c5}}`

## TL;DR

An AES-CBC "receipt" with no MAC/AEAD is malleable. By XOR-flipping bytes in the IV and in ciphertext block C2, we turned `grp=retail`→`grp=vendor` and `tier=trial`→`tier=admin` without the key, and the unauthenticated parser accepted the forgery.

## Recon

The target on `138.197.14.233:1337` looks like HTTP but is a **raw TCP line service**: a plain `urllib` request died with `BadStatusLine: :: RIFFHACK RECEIPT DESK ::` because the server answered with its banner instead of an HTTP status line. It prints a menu, prompts for `receipt_nonce`, then `receipt_blob`, then a verdict.

Given material:

```
receipt_nonce = 47c03be4b9dd4162a5e90f8c5527d130          (16-byte IV)
receipt_blob  = AT7WU7O2…BZKA==  -> 64 bytes = 4 AES blocks (CBC)
leak: parser saw grp=retail and tier=trial before encryption
gate: vendor/admin receipts only
```

The nonce is the IV. No tag, no MAC, no GCM → the ciphertext is malleable.

## The vulnerability: CBC malleability

CBC decryption is:

```
P_k = Dec(C_k) XOR C_{k-1}        (C_0 = IV)
```

Flipping a byte of `C_{k-1}` flips the **same** byte of `P_k`, with no key needed, but it also turns `P_{k-1}` into unpredictable garbage. Practically, treating `IV ‖ CT` as one 80-byte array, flipping byte _i_ (for _i_ = 0..63) flips plaintext byte _i_:

- _i_ in **0-15** → edits the **IV** → clean, no collateral damage.
- _i_ in **16-63** → edits a **ciphertext** byte → flips `P[i]` but garbles the 16-byte block _before_ it.

Both target swaps are length-preserving, so padding and field offsets stay intact:

```
retail -> vendor   delta = 04 00 1a 05 06 1e
trial  -> admin    delta = 15 16 04 08 02
```

## Why the obvious single flip fails

Flipping only `grp` (clean, via IV) or only `tier` left the verdict at `[x] receipt rejected` for **every** offset. So the gate is `grp=vendor` **AND** `tier=admin`, not either-or. That's the crux: fixing one field garbles the block before it, so if both fields shared adjacent blocks, fixing `tier` would destroy the `vendor` you just wrote: unsolvable. The challenge is solvable only because of how the fields are laid out.

## Finding the layout (server as oracle)

The offsets of `retail`/`trial` in the plaintext are unknown, and the gate gives no per-field signal (everything rejects until _both_ are right). So sweep every non-overlapping offset pair, apply both deltas, submit, and stop when the verdict stops saying "reject." The win came at **`retail@4`, `trial@37`**:

```
block 0 [ 0:16]  grp=retail…    retail @ offset 4   -> bent via IV[4:10]   (CLEAN)
block 1 [16:32]  <don't-care>                        -> SACRIFICED (garbled)
block 2 [32:48]  tier=trial…    trial  @ offset 37  -> bent via C2[5:10]   (garbles block 1)
block 3 [48:64]  filler + PKCS#7 padding
```

`grp` lives in block 0, fixable straight through the **IV** with zero collateral. `tier` lives in block 2, fixed by bending **C2**, whose only side effect is scrambling block 1: a field the gate doesn't check. The harmless throwaway block sitting _between_ the two policy fields is precisely what makes a clean double-forgery possible. (A common wrong guess was that `grp=retail;tier=` packed into a single 16-byte block; it doesn't, and that arrangement would have been impossible to forge.)

## Forged payload

```
receipt_nonce = 47c03be4bddd5b67a3f70f8c5527d130
receipt_blob  = AT7WU7O2/Oj+QY/SrVLv2OCXh8Jd7JNWToeCw0BSYOiWi4iZGgoaBqjDQZw5UCs0pszMZrP26BqavD/DBFBZKA==

[+] receipt accepted :: bitctf{{cbc_c0up0n5_n33d_m4c5}}
```

The changed IV bytes are exactly `IV[4:10] ^= 04001a05061e`; the changed blob bytes are exactly `C2[5:10] ^= 1516040802`. Everything else is untouched.

## Lesson

Encryption hides bytes; it does not protect them. Without integrity (an HMAC, or an AEAD mode like AES-GCM that authenticates IV + ciphertext), an attacker can make targeted, predictable plaintext edits and a trusting parser will accept them. The fix is to authenticate: encrypt-then-MAC or use AEAD: which is what the flag says out loud.
