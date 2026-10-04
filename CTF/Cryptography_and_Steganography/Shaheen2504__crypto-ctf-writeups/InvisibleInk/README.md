# InvisibleInk

**Category:** Whitespace Steganography

## Vulnerability
Hidden data encoded in whitespace characters: spaces represented 0 bits, tabs represented 1 bits. The pattern was embedded in alternating lines of a text file.

## Approach
1. Read every other line of the file
2. Extracted bits from whitespace characters (space=0, tab=1)
3. Reversed the bit string before converting to ASCII
4. Recovered the flag character by character

## Key Insight
Whitespace steganography hides data invisibly in plain text files: the content looks normal but carries hidden binary data in its spacing.

## Solve Script
See `solve.py`
