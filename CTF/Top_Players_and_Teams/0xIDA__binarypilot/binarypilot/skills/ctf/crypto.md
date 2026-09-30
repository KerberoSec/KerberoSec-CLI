---
name: crypto
description: CTF cryptography challenges: RSA, AES/block ciphers, classical ciphers, oracles, hashes, weak RNG
---

# Crypto CTF

Identify the primitive first (from challenge text, attachments, or behavioral probing), then attack it. Do NOT brute-force high-entropy secrets; look for the structural flaw.

## Triage (first 5 minutes)

- Read the description and any attachments fully before touching tools.
- file/strings on attachments. If numbers: print them with `python3 -c "print(open('x').read())"`: don't hexdump by reflex.
- If a script/server: map input/output behavior with a few purposeful probes; note padding, separators, error messages.
- hashid / name-that-hash on hash-like strings.
- Check the flag format you need to reconstruct (FlagY{...} on FlagYard, HTB{...} on HTB).

## Attacks by class

**RSA**
- Small e (e=3): direct m^e ≤ n → integer eth root; Håstad broadcast when same m encrypted with multiple n, Coppersmith when partial message known. Tools: sage, custom python with `gmpy2` / `sympy`.
- Common factors between multiple n: `gcd(n1,n2)` recovers p. Batch over all provided n.
- Low private exponent (Wiener): continued-fraction attack. Tool: `RsaCtfTool -k <pubkey>` (pip) / custom CF.
- Factordb.com check first for any n that looks small or reused: `curl https://factordb.com/api?query=<n>`.
- Prime reuse across attempts, close primes (`p≈q` → Fermat factorization), non-standard padding.

**Block ciphers (AES/DES)**
- ECB: cut-and-paste / block rearrangement; ECB byte-at-a-time (unknown suffix) when you have an encryption oracle.
- CBC: padding oracle (`Paddoracle` / custom), IV=key reuse, bit-flipping when plaintext structure is known.
- CTR/stream: reused keystream = XOR of ciphertexts, crib-dragging with known/guessed plaintext.

**Classical / encoding chains**
- Caesar/Vigenère/Affine/Substitution: frequency analysis (`quipqiup` web, `ciphey` pip).
- Base chains: base64/32/16/85, uuencode, morse, hex, rot13: `ciphey <string>` automates identification.
- Brainfuck/Ook/JSFuck etc.: direct interpreters.

**LCG / weak PRNG**
- Recover modulus/state from consecutive outputs: see `randcrack` (Python) or Berlekamp-Massey + LLL for truncated outputs.
- Python `random`: state recovery via 624 consecutive 32-bit outputs (`kmyk/mersenne-twister-predictor`).
- `time.time()` seeded PRNG: bracket the call window, try each candidate seed.

**Hashes / length extension**
- MD5/SHA1/SHA256(secret || msg) + padding: `hashpump` / `hash_extender`: classic for "signed token" challenges.
- Cracking: password-style hashes → john/wordlists (rockyou), hashcat CPU mode in the sandbox.

**XOR**
- Single-byte XOR: xortool / frequency analysis.
- Multi-byte/repeating-XOR: hamming-distance keysize (cryptopals 1.6) → transposition + frequency.
- Known-plaintext: XOR ciphertext with known plaintext to recover keystream.

**Custom / broken constructions**
- Look for: homegrown padding, meaningless operations that cancel, secret reused as both key and IV, salts that don't matter.
- Model it in Python/SMT (z3) when it's invertible or constraint-satisfiable: encode operations symbolically, query for a preimage.

## Deep dives (load on demand)

`load_skill(skills=["crypto-rsa"])`, `crypto-classic`, `crypto-modern`, `crypto-prng`, `crypto-advanced-math` (LLL/Coppersmith/Pohlig-Hellman), `crypto-ecc`, `crypto-exotic` (braid/group schemes), `crypto-zkp`, `crypto-historical` (Lorenz/Enigma-era).

## Discipline

- Work in `/workspace/challenge-files` / `/workspace/solve`. Save your scripts: they're the writeup.
- Print candidate flags exactly (no extra newlines or decoration layer) and regex-check format before submission.
- If an attack needs a library you don't have: `pip install <pkg>` first, don't reinvent.
