# 09: Last Radio Signal

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Memory Forensics |
| **Points** | 800 |
| **Difficulty** | Hard |
| **Solved At** | June 6, 2026: 3:05 AM |
| **File** | `memory.raw` |

---

## Description

> A radio transmission was intercepted during the operation. The signal was encoded before transmission. A Windows memory dump was captured during the event. Find the flag.

The highest-point forensics challenge in the CTF. A Windows memory dump containing a hidden, encoded radio transmission. The description's phrase **"encoded before transmission"** is the key hint.

---

## Approach

### Step 1: Initial Triage of the Memory Dump

For any memory dump challenge, the fastest first step is `strings`. Volatility is powerful, but strings is instantaneous and often reveals the flag without further analysis.

```bash
# Quick scan for radio/transmission references
$ strings memory.raw | grep -i "radio"
$ strings memory.raw | grep -i "transmission"
$ strings memory.raw | grep -i "TX"

# Check for known flag format prefixes
$ strings memory.raw | grep -i "0Day\|ZeroDayHeist\|Heist\|CTF{"
```

These searches help locate the area of the dump where the relevant process or data lives.

**Finding:** Process name `radio_service.exe` with PID `2048` was identified in the strings output.

### Step 2: Context Search Around the Process

```bash
$ strings memory.raw | grep -A 10 -B 10 "radio_service"
```

Located encoded transmission labelled **TX9981**:

```
TX9981: MERheS1IZWlzdHt0cmFuc21pc3Npb25faW50ZXJjZXB0ZWR9
```

This string was associated with the radio_service process context.

### Step 3: Identify the Encoding

The string `MERheS1IZWlzdHt0cmFuc21pc3Npb25faW50ZXJjZXB0ZWR9` has the hallmarks of **Base64**:

- Character set: `A-Z`, `a-z`, `0-9`, `+`, `/`, `=`
- Length: 60 characters (multiple of 4 ✓)
- No special characters outside Base64 alphabet

The challenge description confirmed this: **"encoded before transmission"** = Base64 encoding.

### Step 4: Decode Base64

```bash
$ echo "MERheS1IZWlzdHt0cmFuc21pc3Npb25faW50ZXJjZXB0ZWR9" | base64 -d
0Day-Heist{transmission_intercepted}
```

Clean decode, no garbage bytes, valid flag format. Done.

---

## Full Volatility Workflow (for completeness)

The challenge was solvable with just `strings`, but here's how you'd approach it with Volatility3 for a more thorough analysis:

```bash
# 1. Identify OS and profile
$ vol3 -f memory.raw windows.info

# 2. List running processes
$ vol3 -f memory.raw windows.pslist

# 3. Find radio_service.exe (PID 2048)
$ vol3 -f memory.raw windows.pslist | grep radio

# 4. Dump the process memory
$ vol3 -f memory.raw windows.memmap --pid 2048 --dump

# 5. Search dumped memory for encoded strings
$ strings pid.2048.dmp | grep -E "^[A-Za-z0-9+/]{40,}={0,2}$"

# 6. Decode
$ echo "[base64_string]" | base64 -d
```

### Alternative: memdump + grep

```bash
$ vol3 -f memory.raw windows.dumpfiles --pid 2048
$ strings output.dmp | grep -i "TX"
```

---

## Decoding Chain

```
memory.raw
  │
  ├─► strings extraction
  │     └─► radio_service.exe (PID 2048)
  │           └─► TX9981 payload (Base64 encoded)
  │
  └─► base64 -d
        └─► 0Day-Heist{transmission_intercepted}
```

---

## Base64 Verification

You can verify the encoding manually:

```python
import base64

encoded = "MERheS1IZWlzdHt0cmFuc21pc3Npb25faW50ZXJjZXB0ZWR9"
decoded = base64.b64decode(encoded).decode('utf-8')
print(decoded)
# 0Day-Heist{transmission_intercepted}

# Verify by re-encoding
print(base64.b64encode(decoded.encode()).decode())
# MERheS1IZWlzdHt0cmFuc21pc3Npb25faW50ZXJjZXB0ZWR9
```

---

## Tools Used

| Tool | Purpose |
|---|---|
| `strings` | Fast dump triage |
| `grep` | Pattern filtering |
| `base64` | Decode the transmission |
| `Volatility3` | Process listing, OS detection (optional) |

---

## What I Learned

1. **`strings` is underrated for memory forensics**: in CTFs, the flag is often extractable with just `strings | grep`. Run it first before firing up Volatility.
2. **Challenge descriptions contain encoding hints**: "encoded before transmission" = Base64. Read descriptions carefully.
3. **Know your encoding signatures**: Base64's character set and length-divisibility-by-4 rule make it instantly recognisable.
4. **800 points ≠ complicated solution**: the difficulty here was knowing where to look (memory forensics context), not the decoding step itself.

---

## Flag

```
0Day-Heist{transmission_intercepted}
```
