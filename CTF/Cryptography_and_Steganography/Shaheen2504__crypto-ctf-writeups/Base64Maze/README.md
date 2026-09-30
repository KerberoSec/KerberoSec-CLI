# Base64Maze

**Category:** Multi-Layer Encoding

## Vulnerability
The flag was encoded through 4 successive layers (binary, base32, hex, base64) in an unknown order: 24 possible permutations total.

## Approach
Wrote a script to try all 24 permutations of the 4 decoding methods. Only the correct order (binary → base32 → hex → base64) decoded cleanly all the way through to produce the flag.

## Solve Script
See `solve.py`

## Note
This is an encoding challenge rather than encryption: encoding is reversible without a key and provides no security.
