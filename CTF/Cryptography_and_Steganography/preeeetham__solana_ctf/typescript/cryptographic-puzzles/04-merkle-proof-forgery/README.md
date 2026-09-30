# Challenge 4: Merkle Proof Forgery

## Description
An airdrop contract uses a Merkle tree to distribute tokens to whitelisted addresses. However, the Merkle proof verification has a critical flaw that allows attackers to forge proofs and claim tokens they shouldn't have access to.

## Vulnerability
The Merkle tree implementation doesn't properly validate the order of hashes when combining nodes, allowing an attacker to manipulate the proof path.

## Your Task
1. Understand how Merkle proofs work
2. Find the vulnerability in the proof verification
3. Forge a valid proof for an address not in the whitelist
4. Claim tokens using the forged proof

## Files
- `vulnerable_airdrop.ts` - The vulnerable airdrop contract
- `exploit.ts` - Your exploit code (complete this)
- `solution.ts` - Solution reference

## Hints
- Merkle proofs rely on the order of hash concatenation
- Hash(A, B) ≠ Hash(B, A) in most cases
- The contract might not enforce consistent ordering
- Think about second preimage attacks

## Real-World Context
This vulnerability has appeared in:
- Multiple airdrop contracts
- NFT allowlist implementations
- Governance voting systems

## Difficulty: Intermediate 