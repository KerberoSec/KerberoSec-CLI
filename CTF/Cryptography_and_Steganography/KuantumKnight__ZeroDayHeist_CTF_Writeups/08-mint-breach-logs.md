# 08: Mint Breach Logs: Gokul_A

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Forensics |
| **Points** | 400 |
| **Difficulty** | Medium |
| **Solved At** | June 6, 2026: 4:49 AM |
| **File** | `security.log` |

---

## Description

> The Royal Mint's Security Operations Center collected logs throughout the heist. Thousands of events were recorded, including employee activity, authentication attempts, and web requests. Investigators believe the attackers left behind a hidden clue inside the logs.

A log analysis challenge: thousands of lines of noise, one hidden signal.

---

## Approach

### Step 1: Understand the Log Structure

Opening the log file reveals thousands of entries in this format:

```
2025-10-31 INFO User employee1 authenticated successfully
2025-10-31 INFO User employee2 authenticated successfully
2025-10-31 INFO User employee3 authenticated successfully
...
```

The vast majority are routine `INFO` level employee authentication events: pure noise. Manually reviewing every line would take hours.

### Step 2: Filter for Anomalies

Instead of reviewing everything, use smart filtering:

```bash
# Look for non-INFO entries
$ grep -v "INFO" security.log

# Specifically look for WARNING or ERROR
$ grep -E "WARNING|ERROR|CRITICAL" security.log

# Check the end of the file (attackers often append)
$ tail -50 security.log

# Count unique event types
$ awk '{print $2}' security.log | sort | uniq -c
```

The `tail` command reveals a suspicious final entry:

```
2025-10-31 WARNING Suspicious Request GET /admin-backup?token=3664363936653734356636633666363737333566373236353736363536313663356637343732373537343638
```

This stands out immediately:
- It's a `WARNING` (all others were `INFO`)
- It hits `/admin-backup`: a sensitive endpoint
- The `token` parameter is a long hex string

### Step 3: First Hex Decode

Extract the token and decode from hex:

```bash
$ echo "3664363936653734356636633666363737333566373236353736363536313663356637343732373537343638" | xxd -r -p
6d696e745f6c6f67735f72657665616c5f7472757468
```

The output is **still hex**: double encoding confirmed.

### Step 4: Second Hex Decode

```bash
$ echo "6d696e745f6c6f67735f72657665616c5f7472757468" | xxd -r -p
mint_logs_reveal_truth
```

Plaintext revealed: `mint_logs_reveal_truth`

### Step 5: Construct the Flag

```
0Day-Heist{mint_logs_reveal_truth}
```

---

## Decoding Chain Visualised

```
Token in log (hex-encoded hex):
3664363936653734...

    │ xxd -r -p (hex decode)
    ▼

6d696e745f6c6f67735f72657665616c5f7472757468

    │ xxd -r -p (hex decode again)
    ▼

mint_logs_reveal_truth

    │ wrap in flag format
    ▼

0Day-Heist{mint_logs_reveal_truth}
```

---

## One-liner Solution

Once you spot the token, the entire decode chain can run as a pipeline:

```bash
$ echo "3664363936653734356636633666363737333566373236353736363536313663356637343732373537343638" \
  | xxd -r -p \
  | xxd -r -p
mint_logs_reveal_truth
```

Or in Python:

```python
token = "3664363936653734356636633666363737333566373236353736363536313663356637343732373537343638"
layer1 = bytes.fromhex(token).decode()   # → hex string
layer2 = bytes.fromhex(layer1).decode()  # → plaintext
print(layer2)  # mint_logs_reveal_truth
```

---

## Why Double Hex Encoding?

The outer hex encoding (hex of a hex string) is commonly used in:
- Web security bypasses (WAF evasion)
- Log injection attacks (hiding malicious payloads in logs)
- CTF challenges to add a decode step that's easy to miss

The inner hex string (`6d696e745f6c6f67...`) encodes the final ASCII flag. The outer layer (`3664363936...`) encodes the inner hex string's ASCII representation. It's recursive and easy to overlook.

---

## Tools Used

| Tool | Purpose |
|---|---|
| `grep` / `tail` | Log filtering and anomaly detection |
| `xxd -r -p` | Hex decoding |
| Python `bytes.fromhex()` | Alternative decode method |

---

## What I Learned

1. **`tail` before `grep`**: in CTF log challenges, the interesting entry is almost always at the end of the file.
2. **Double encoding is common**: always try a second decode pass if the first output still looks encoded.
3. **WARNING/ERROR level entries are always worth investigating**: if a log is mostly `INFO`, any deviation is intentional signal.
4. **HTTP query parameters in logs are goldmines**: `?token=`, `?data=`, `?payload=` are classic CTF hiding spots.

---

## Flag

```
0Day-Heist{mint_logs_reveal_truth}
```
