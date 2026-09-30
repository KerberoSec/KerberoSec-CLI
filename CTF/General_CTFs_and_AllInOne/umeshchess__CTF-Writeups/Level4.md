# Leviathan Level 4 → 5

## Objective
Find the password for leviathan5

## Approach
Found a `.trash` hidden directory containing a `bin` binary.
Running it output a long binary string.
Used Python3 one-liner to convert binary to ASCII: revealed the password.

## Commands Used
```bash
ls -la
cd .trash
ls -la
./bin
./bin | python3 -c 'import sys; print("".join(chr(int(b, 2)) for b in sys.stdin.read().split()))'
```

## What I Learned
- Binary output from programs can encode ASCII text
- Python3 one-liners are powerful for quick decoding
- Hidden directories like `.trash` often contain important binaries
- Always explore hidden directories thoroughly
