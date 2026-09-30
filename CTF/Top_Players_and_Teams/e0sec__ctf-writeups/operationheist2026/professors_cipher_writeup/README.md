# The Professor's Cipher: CTF Writeup

**Challenge:** The Professor's Cipher  
**Category:** Cryptography  
**Points:** 50  
**Flag:** `K4P{th3_pr0f3ss0r_n3v3r_r3us3s_k3ys}`

---

## Challenge Description

> El Profesor built the crew a voice that no one outside could hear. Every word we ever sent each other was wrapped in his noise: a private language he swore could never be unraveled. He repeated it like a prayer: *trust the math, trust me.* The night the vault moved, the channel got busy. Two messages went out on the same line, seconds apart, while everyone was shouting at once. We pulled both bursts off the tap. One is routine. The other carries the authorization that moves the reserve. The Professor was almost never wrong. **Almost.**

We're given two files:

- `encrypt.py`: the crew's encryption tooling ("Dali" wrapper)
- `transmission.txt`: two intercepted ciphertexts captured on the same channel, 41 seconds apart

---

## Understanding the Cipher

The `encrypt.py` file reveals the full encryption scheme.

**Key derivation** (`derive_seed`): A passphrase is folded into a 32-bit integer using a rolling hash (`state * 33 + byte`), seeded at `0x1A2B3C4D`.

**Keystream generation** (`dali_stream`): A linear congruential generator (LCG) steps the state forward each iteration:

```
state = (1664525 * state + 1013904223) mod 2^32
output_byte = (state >> 24) ^ (state >> 16)  &  0xFF
```

**Encryption** (`wrap`): The plaintext is XOR'd byte-by-byte against the keystream: a stream cipher. The result is returned as hex.

This is effectively a one-time pad, which is theoretically unbreakable, but only if the keystream is never reused.

The crew handbook (recovered, noted in `transmission.txt`) even states the rule explicitly:

> *Rotate the passphrase for EVERY message. Reuse is the only thing that can break us. Never reuse. Never.*

---

## Spotting the Vulnerability

Two transmissions were captured on **the same channel index** (`COLD/idx-0x1F`) just **41 seconds apart**, both from `node-DALI`. The analyst's note flags it immediately:

> *The operator was moving fast. They got sloppy.: A.S.*

When two messages are encrypted with the **same keystream** `K`, we have:

```
C_A = P_A ⊕ K
C_B = P_B ⊕ K
```

XOR-ing the two ciphertexts cancels the keystream entirely:

```
C_A ⊕ C_B = P_A ⊕ P_B
```

This is the **two-time pad** attack: one of the oldest and most reliable breaks in cryptography.

---

## The Attack

### Step 1: XOR the ciphertexts

```python
ct_a = bytes.fromhex("1fc5d51464e9ae7c...")
ct_b = bytes.fromhex("11c0c40e1ff6d363...")

xored = bytes(a ^ b for a, b in zip(ct_a, ct_b))
# xored = P_A ⊕ P_B
```

### Step 2: Crib dragging

The challenge description notes that every transmission opens with a **standing channel header**. The demo message in `encrypt.py` gives away the format:

```
OPERATION:HEIST|CLASSIFICATION:EYES-ONLY|STATUS:EXAMPLE
```

Guessing that Transmission A opens with `OPERATION:` (10 bytes) and XOR-ing it against `xored[0:10]` immediately produces a candidate for the first 10 bytes of Transmission B:

```python
crib = b"OPERATION:"
candidate_B_prefix = bytes(x ^ c for x, c in zip(xored, crib))
# → b"AUTH:K4P{t"
```

`K4P{`: that's the flag format. We've confirmed the crib and have the start of the flag.

### Step 3: Extend the known plaintext

Knowing more of the typical message structure, we extend the guess for Transmission A:

```
OPERATION:HEIST|CLASSIFICATION:EYES-ONLY|STATUS:GO|
```

XOR-ing all 50 bytes against `xored` yields Transmission B in full:

```
AUTH:K4P{th3_pr0f3ss0r_n3v3r_r3us3s_k3ys}|RESERVE:...
```

The full authorization message, and the flag: are recovered.

---

## Why It Works

The security of a stream cipher rests entirely on keystream uniqueness. XOR encryption with a repeated key provides **zero additional security** beyond XOR itself: two ciphertexts XOR'd together produce the XOR of the two plaintexts, and natural language (or structured plaintext with known headers) is trivially recoverable from that.

The Professor's cipher wasn't broken by a weakness in the LCG or the hash: it was broken by a **procedural failure**. The math was fine. The operator wasn't.

---

## Key Takeaways

- **Stream ciphers must never reuse a keystream.** The moment the same key is used twice, both messages are compromised.
- **Crib dragging** is effective whenever plaintext has predictable structure: protocol headers, greetings, fixed formats.
- **The two-time pad attack requires no knowledge of the key.** The key is irrelevant once you have `P_A ⊕ P_B`.
- Known-plaintext assumptions are amplified by format conventions. The crew's own handbook: "every transmission opens with the standing channel header": handed the attacker a free crib.

---

## Flag

```
K4P{th3_pr0f3ss0r_n3v3r_r3us3s_k3ys}
```
