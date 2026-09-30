# Challenge 1: Weak Randomness Oracle

## Description
A DeFi protocol uses on-chain randomness for determining lottery winners. The protocol claims their randomness is "unpredictable", but is it really?

## Vulnerability
The contract uses block hash and slot information to generate random numbers, making it predictable for attackers who can calculate future values.

## Your Task
1. Analyze the vulnerable lottery contract
2. Predict the winning number for the next round
3. Write an exploit to consistently win the lottery

## Files
- `vulnerable_lottery.ts` - The vulnerable lottery program
- `exploit.ts` - Your exploit code (complete this)
- `solution.ts` - Solution reference

## Hints
- Solana's recent blockhashes are deterministic
- Clock sysvar provides predictable slot information
- Consider how validators can manipulate timing

## Difficulty: Intermediate 