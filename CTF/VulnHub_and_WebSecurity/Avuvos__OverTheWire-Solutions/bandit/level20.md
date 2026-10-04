# Bandit Level 20 -> 21

## Goal

Use the setuid binary `suconnect` which connects to a port and compares input.

## Key Concept

Network daemons and background processes.

## Solution

Open two terminal sessions or use background processes.

Terminal 1: Start a listener:

```bash
nc -l -p 4444
```

Terminal 2: Run the setuid binary:

```bash
./suconnect 4444
```

In Terminal 1, type the current password and press Enter. The binary validates it and returns the next password.

Single terminal approach:

```bash
echo "<password_level_20>" | nc -l -p 4444 &
./suconnect 4444
```

## Why This Works

The `suconnect` binary connects to the specified port, reads data, and compares it to the current password. If correct, it sends back the next level's password.
