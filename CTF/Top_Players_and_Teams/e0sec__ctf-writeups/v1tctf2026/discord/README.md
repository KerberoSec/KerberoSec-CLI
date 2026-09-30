# Discord Flag: V1t CTF 2026

**Category:** Duck  
**Flag:** `v1t{duckc0rd}`

## Description

A screenshot was provided showing tiles labeled **DISCORD FLAG**, each tile containing a hexadecimal value. The challenge hinted at Discord.

## Solution

### Step 1: Join the Discord server

The challenge provided an invite link to the V1t CTF 2026 Discord server. Upon joining, the `#announcements` channel was visible.

### Step 2: Read the channel topic

The flag was hidden in plain sight in the **channel topic** of `#announcements`. Clicking the topic bar revealed the full content: a sequence of blue letter/number tiles spelling out:

```
DISCORD 🦆 FLAG 🦆 76 31 74 7B 64 75 63 6B 63 30 72 26 47 7D
```

Laid out across two rows:
```
76 31 74 7B  64 75 63 6B 63
30 72 26 47 7D
```

### Step 3: Decode hex to ASCII

Converting each byte:

| Hex | ASCII |
|-----|-------|
| 76  | v     |
| 31  | 1     |
| 74  | t     |
| 7B  | {     |
| 64  | d     |
| 75  | u     |
| 63  | c     |
| 6B  | k     |
| 63  | c     |
| 30  | 0     |
| 72  | r     |
| 64  | d     |
| 7D  | }     |

Quick Python one-liner:

```python
bytes.fromhex("763174 7B6475636B63307264 7D").decode()
# 'v1t{duckc0rd}'
```

## Flag

```
v1t{duckc0rd}
```
