# Challenge 6: Elliptic Curve Backdoor

## Description
A custom elliptic curve implementation is used for a "more efficient" signature scheme. However, the curve parameters contain a hidden backdoor that allows anyone who knows the secret to forge signatures.

## Vulnerability
The elliptic curve uses specially crafted parameters that appear random but contain a mathematical relationship that can be exploited. This is similar to the Dual_EC_DRBG backdoor.

## Your Task
1. Analyze the custom curve parameters
2. Find the mathematical backdoor
3. Extract the backdoor secret
4. Forge signatures without private keys

## Files
- `src/lib.rs` - The vulnerable curve implementation
- `tests/exploit.rs` - Your exploit test (complete this)
- `tests/solution.rs` - Solution reference

## Hints
- Look for relationships between curve parameters
- Small subgroup attacks are common
- The curve order might be composite
- Check if the generator has a special property

## Real-World Context
- Dual_EC_DRBG NSA backdoor
- Weak curves in various protocols
- Academic research on curve backdoors

## Difficulty: Advanced 