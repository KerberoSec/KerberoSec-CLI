# Pancake

**Category:** Crypto  ·  **Difficulty:** Hard  ·  **Flag:** `ASIS{paNc4kE_v3_Lo5t_!t5_n4mE_8Ut___n0T___iTs_89uG!}`

## Challenge Description

> 🥞 Pancake Stack: *"Chef Crypto served a batch of extra-fluffy key derivation
> layers, claiming they are mathematically unbreakable. But rumors say something went
> wrong during the baking process..."* A state-of-the-art cipher suite is leaking
> keystreams under mysterious circumstances.

We are given the generator source `src/pancake.py` and a single JSON
instance [`src/challenge.json`](src/challenge.json). The challenge is a tall stack of AES,
finite-field, and SHAKE-256 key-derivation layers, but two small design mistakes topple
the whole thing.

## Initial Analysis

The instance's public fields:

| Field | Meaning |
|---|---|
| `d`  | Number of discarded bits (`32`) |
| `a`  | SHA-256 hint for the secret 32-bit seed |
| `n`  | Two public 96-bit values `n1`, `n2` |
| `h`  | Public associated data, `AUTH-METADATA-2026` |
| `m`  | Known plaintext: 128 zero bytes |
| `y`  | AES-GCM ciphertext + tag for the flag |
| `z`  | AES-GCM ciphertext + tag for a sealed ticket |

Key public values:

```text
d  = 32
a  = 9b23e5ef8f84336dec9159ccb3159ed5d081c64d0bca09615967eaacb7bc13cf
n1 = 847764ce50d13f6453a2704b
n2 = 431263c0382fe1a1106a9e2d
```

The flag ciphertext `y.c` is 52 bytes; `m` gives 128 bytes of known plaintext: more than
enough keystream to recover the whole flag.

## Vulnerability / Core Concept

**Bug 1: 32-bit seed behind SHA-256.** The first key derives from a 4-byte seed:

```python
seed_to_hint(seed) = sha256(b"K1-SEED-HINT" + seed.to_bytes(4,"big"))
seed_to_k1(seed)   = sha256(b"K1-SEED"      + seed.to_bytes(4,"big"))
```

The domain separators are public, so recovering `seed` from `a` is a `2^32` preimage
search: trivial on a GPU. A hash cannot manufacture entropy the input never had. The
recovered value is `seed = 0x22c4d3ef`, giving `k1`.

**Bug 2: truncated AES output.** `diffuse_state` keeps only the upper 96 bits of an AES
block:

```python
j = extract_upper(e.encrypt(format_block(n2, 0)))   # j = AES_k1(n2 || 0^32) >> 32
```

Everything downstream depends only on `n1` and this truncated `j`. So any `alt` with

```
upper96(AES_k1(alt || 0^32)) == upper96(AES_k1(n2 || 0^32))
```

produces an identical `diffuse_state`. This is **not** an AES break: the two full blocks
differ in exactly the 32 bits the KDF deliberately throws away. We find such an `alt`
with a second `2^32` search (decrypt `target || suffix` for every 32-bit suffix, accept
when the plaintext ends in four zero bytes):

```text
alt = a5720dc7719f529e8e9cb565
```

**Consequence: nonce reuse.** The generator seals a known-plaintext sample under `alt`
and encrypts the flag under `n2`:

```python
sample = encrypt_authenticated(k1, k2, n1, alt, ad, bytes(128))
ticket = seal_sample(k1, n1, alt, {...})
public["y"] = encrypt_authenticated(k1, k2, n1, n2, ad, flag)
```

Because the collision makes both `state` tuples equal, `derive_keys` returns the same
AES-GCM key `ek`, nonce `iv`, and AAD prefix for both encryptions: even though `k2` is
never recovered. GCM is CTR mode underneath, so identical key/nonce reuse the keystream:
`KS = C ⊕ P`. The sample's plaintext is all zeros, so its ciphertext *is* the keystream.

## Exploitation

The full solver is `solve.py`. The two expensive searches are baked in as
verified constants (the solver re-checks them before use):

```python
SEED = 0x22C4D3EF
ALT  = 0xA5720DC7719F529E8E9CB565
```

Steps:

1. Verify `sha256(b"K1-SEED-HINT" + seed) == a`, derive `k1`.
2. Verify the truncated-AES collision: `upper96(AES_k1(alt||0^32)) == upper96(AES_k1(n2||0^32))`.
3. Derive the sealed-ticket key (depends only on `k1`, `n1`, `alt`: not `k2`) and
   `decrypt_and_verify` the ticket `z`. The recovered ticket contains the 128-byte known
   sample ciphertext.
4. Recover the keystream and XOR out the flag:

```python
keystream       = xor_bytes(known_ciphertext, known_plaintext)   # m is zero bytes
flag            = xor_bytes(flag_ciphertext, keystream)
```

Run:

```bash
python3 solve.py src/challenge.json
# ASIS{paNc4kE_v3_Lo5t_!t5_n4mE_8Ut___n0T___iTs_89uG!}
```

The two `2^32` searches were offloaded to a GPU host. Bug 1 was run with Hashcat mode
1400 using a `?b` byte mask (the four unknown bytes are arbitrary binary):

```bash
hashcat -m 1400 -a 3 hint.txt 'K1-SEED-HINT?b?b?b?b' --hex-plain
# -> $HEX[4b312d534545442d48494e5422c4d3ef]   (ends in 22 c4 d3 ef)
```

Bug 2's AES-decryption collision search is provided as optimized C in the challenge
source (`C_SEARCH_SOURCE`).

## Flag

`ASIS{paNc4kE_v3_Lo5t_!t5_n4mE_8Ut___n0T___iTs_89uG!}`

## Key Takeaways

- A hash cannot create entropy: SHA-256 over a 32-bit seed is a `2^32` search.
- Truncation changes the security level: keeping only 96 of 128 output bits let the
  missing 32 bits be searched to force a KDF-state collision.
- KDF complexity does not fix equal *inputs*; the many AES/GF/SHAKE layers all became
  identical once the truncated state collided.
- Never reuse an AES-GCM key/nonce pair: GCM is CTR mode, and reuse leaks `C1 ⊕ C2`.
- Known **zero** plaintext is worst-case: its ciphertext is the raw keystream.
