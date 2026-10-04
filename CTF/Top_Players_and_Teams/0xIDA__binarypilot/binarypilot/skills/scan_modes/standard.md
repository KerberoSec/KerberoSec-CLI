---
name: standard
description: Balanced CTF solve: systematic methodology with full challenge coverage
---

# Standard Solve Mode

Structured methodology. Thorough coverage without exhaustively trying every bypass on the last idea.

## Approach

Understand the challenge before solving. Spawn a small specialist team per phase.

## Phase 1: Understand (delegate)

**Challenge with attachments**

- Extract and statically inspect every attachment: file, strings, binwalk, decompile/disassemble hot paths, sslsplit/network capture any protocols
- Map architecture: entry points, input parsers, trust boundaries, flag storage location
- Review any provided source for obvious flag handling or input validation logic

**Instance-only**

- Map the instance: ports, services, fingerprints, endpoint tree, auth surfaces
- Fingerprint technologies/versions valuable for the category
- Capture representative traffic via the proxy to understand request/response patterns

## Phase 2: Vector analysis

Identify 1-3 plausible solve vectors by category:

- **Web**: auth bypass, injection, ssrf, idor, business logic, JWT, deserialization
- **Crypto**: known-plaintext, small-e/coprime RSA, CBC/bitflip, weak RNG, custom cipher reversal
- **Pwn**: classic stack/heap overflow, format string, ret2*, use-after-free
- **Rev**: string decoding, XOR/single-byte ciphers, anti-debug bypass, keygen
- **Forensics**: file carving, stego, protocol reassembly, deleted-data recovery
- **Misc**: file-format quirks, encoding chains, logic puzzles

## Phase 3: Solve

One subagent per plausible vector. Each delivers: working exploit/solver, candidate flag, confidence note.

## Phase 4: Verify, submit, write

Independent verification of the candidate; platform submit; writeup; stop instance; finish.
