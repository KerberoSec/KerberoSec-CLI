# Challenge 2: Ed25519 Signature Malleability

## Description
A decentralized exchange uses Ed25519 signatures for order validation. However, the implementation has a critical flaw that allows signature malleability attacks.

## Vulnerability
Ed25519 signatures in Solana can be malleable if not properly validated. An attacker can create a different valid signature for the same message without knowing the private key.

## Your Task
1. Understand how Ed25519 signature malleability works
2. Create a malleable signature from a given valid signature
3. Exploit the DEX to double-spend an order

## Files
- `vulnerable_dex.ts` - The vulnerable DEX implementation
- `exploit.ts` - Your exploit code (complete this)
- `solution.ts` - Solution reference

## Hints
- Ed25519 signatures have a mathematical property that allows malleability
- The signature (R, S) can be transformed to (R, -S mod L)
- The DEX doesn't properly check for canonical signatures

## Difficulty: Advanced 