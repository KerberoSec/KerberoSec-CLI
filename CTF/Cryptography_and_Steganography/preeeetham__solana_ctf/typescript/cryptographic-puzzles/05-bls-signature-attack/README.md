# Challenge 5: BLS Signature Aggregation Attack

## Description
A multi-signature wallet uses BLS signature aggregation to save on verification costs. However, the implementation has a vulnerability that allows an attacker to forge aggregate signatures.

## Vulnerability
The BLS signature scheme implementation doesn't properly validate individual signatures before aggregation, allowing rogue key attacks where an attacker can create signatures that appear to be from multiple parties.

## Your Task
1. Understand BLS signature aggregation
2. Identify the rogue key attack vulnerability
3. Create a malicious key that allows signature forgery
4. Forge an aggregate signature to steal funds

## Files
- `vulnerable_multisig.ts` - The vulnerable multi-signature wallet
- `exploit.ts` - Your exploit code (complete this)
- `solution.ts` - Solution reference

## Hints
- BLS allows combining multiple signatures into one
- Rogue key attacks involve creating special public keys
- The aggregation formula: agg_sig = sig1 + sig2 + ... + sign
- Think about how you can control the aggregate

## Real-World Context
- Used in Ethereum 2.0 validator signatures
- Various threshold signature schemes
- Distributed validator technology

## Difficulty: Advanced 