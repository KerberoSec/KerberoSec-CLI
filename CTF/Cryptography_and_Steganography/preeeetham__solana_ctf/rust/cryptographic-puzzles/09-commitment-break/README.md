# Challenge 9: Commitment Scheme Break

## Description
A commitment scheme allows users to commit to values and reveal them later. However, the implementation allows opening commitments to different values.

## Vulnerability
Weak binding property in the commitment scheme allows creating ambiguous commitments.

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
