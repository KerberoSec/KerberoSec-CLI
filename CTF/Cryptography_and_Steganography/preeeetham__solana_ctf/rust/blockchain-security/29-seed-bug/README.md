# Challenge 29: Seed Canonicalization Bug

## Description
PDA generation has flaws due to non-canonical seed handling.

## Vulnerability
Multiple seed representations can generate the same PDA, enabling collisions.

## Your Task
1. Analyze the vulnerable code
2. Identify the security flaw
3. Develop an exploit
4. Demonstrate the impact

## Files
- `vulnerable_program` - The vulnerable implementation
- `exploit` - Your exploit code (complete this)
- `solution` - Solution reference

## Real-World Context
This type of vulnerability has been found in production Solana protocols and has led to significant losses.

## Difficulty: Intermediate
