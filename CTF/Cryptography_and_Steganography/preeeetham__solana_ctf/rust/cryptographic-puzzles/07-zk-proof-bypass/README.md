# Challenge 7: Zero-Knowledge Proof Bypass

## Description
A ZK-SNARK verifier has a critical flaw in its implementation that allows proofs of false statements.

## Vulnerability
The verifier doesn't properly validate all proof components, allowing crafted proofs to pass verification.

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

## Difficulty: Advanced
