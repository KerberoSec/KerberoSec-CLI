# Bandit Level 14 -> 15

## Goal

Submit the current level's password to port 30000 on localhost.

## Key Concept

Network communication with `netcat` (nc).

## Solution

```bash
nc localhost 30000
```

Then paste the current level's password and press Enter.

Or in one command:

```bash
echo "<password_level_14>" | nc localhost 30000
```

## Why This Works

Netcat is a versatile networking tool that can read/write data across network connections. Port 30000 has a service that validates passwords and returns the next level's password.
