# Challenge 3: PDA Seed Collision

## Description
A decentralized vault system uses Program Derived Addresses (PDAs) to manage user vaults. However, the seed construction has a critical flaw that allows an attacker to create colliding PDAs and steal funds from other users' vaults.

## Vulnerability
The vault uses a weak seed construction that concatenates user-provided data without proper separation. This allows an attacker to craft inputs that generate the same PDA as another user's vault.

## Your Task
1. Analyze the PDA generation mechanism
2. Find a collision with an existing vault
3. Exploit the collision to drain the victim's funds
4. Demonstrate how to prevent such collisions

## Files
- `vulnerable_vault.ts` - The vulnerable vault program
- `exploit.ts` - Your exploit code (complete this)
- `solution.ts` - Solution reference

## Hints
- PDAs are generated using seeds that get hashed together
- Without proper separators, "ab" + "c" = "a" + "bc"
- The findProgramAddress function uses SHA256 under the hood
- Think about how string concatenation works with user input

## Real-World Context
PDA collisions have been found in several Solana protocols:
- Wormhole had a vulnerability related to account substitution
- Several NFT marketplaces had metadata collision issues
- Gaming protocols with predictable vault addresses

## Difficulty: Intermediate 