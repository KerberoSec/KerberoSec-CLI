# Challenge 27: Reentrancy in Token Program

## Description
A custom token program is vulnerable to reentrancy attacks during transfers.

## Vulnerability
External calls before state updates enable reentrancy exploitation.

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
