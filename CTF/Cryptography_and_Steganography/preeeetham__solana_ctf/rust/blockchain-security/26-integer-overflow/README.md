# Challenge 26: Integer Overflow Treasury Drain

## Description
A DAO treasury contract has a critical integer overflow vulnerability in its withdrawal mechanism. The contract uses unchecked arithmetic operations that can be exploited to drain the entire treasury.

## Vulnerability
The contract performs arithmetic operations without overflow checks. In Rust, debug mode would catch this, but in release mode (which Solana uses), arithmetic operations wrap around silently.

## Your Task
1. Identify the integer overflow vulnerability
2. Craft inputs that cause an overflow
3. Exploit the overflow to drain the treasury
4. Bypass the withdrawal limits

## Files
- `src/lib.rs` - The vulnerable treasury program
- `tests/exploit.rs` - Your exploit test (complete this)
- `tests/solution.rs` - Solution reference

## Contract Details
- Treasury capacity: 1,000,000 SOL
- Daily withdrawal limit: 100 SOL per user
- Governance threshold: 66% of votes

## Hints
- Look for unchecked arithmetic operations
- Consider what happens when subtracting from 0
- Think about how balances are calculated
- Remember that Solana programs run in release mode

## Real-World Context
This vulnerability pattern has been found in multiple real protocols:
- YAM Finance (2020): Integer overflow in rebase mechanism
- Beauty Chain (BEC): Integer overflow allowed unlimited token creation
- Multiple Solana protocols with unchecked math

## Difficulty: Advanced 