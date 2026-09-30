# 02: Double Encode- AMRRISH ROSHAN

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Cryptography |
| **Points** | 250 |
| **Difficulty** | Easy |
| **Solved At** | June 6, 2026: 2:32 AM |

---

## Description

> The data has been encoded for safe transmission. Decode it to find the flag.

A cryptography challenge involving multiple layers of encoding stacked on top of each other. The challenge title is a direct hint: "Double Encode" means the data has gone through an encoding step twice.

---

## Approach

### Step 1: Identify the Encoding

The provided ciphertext was examined visually. Common encoding schemes to check first:

| Encoding | Tells |
|---|---|
| Base64 | Alphanumeric + `+/=`, length divisible by 4 |
| Hex | Only `0-9a-f` characters, even length |
| ROT13 | Only letters, same length as input |
| URL encoding | `%xx` patterns |
| Binary | Only `0` and `1` |

The first layer was identified by its character set and structure.

### Step 2: First Decode

The first decoding step was applied. The resulting output was not plaintext: it still appeared encoded (wrong character set, suspicious patterns, wrong length). This is the "double encode" signal.

```
Input (Layer 2)  →  [Decode]  →  Output (Layer 1, still encoded)
```

### Step 3: Second Decode

The second decoding pass was applied to the intermediate result:

```
Output (Layer 1)  →  [Decode]  →  Plaintext flag
```

The final decoded output revealed the flag.

### Step 4: Construct the Flag

```
0ddayhiest{crypt0_is_fun}
```

---

## Key Concepts

### Recognising Double Encoding

When you decode something and the result still "looks wrong": non-printable characters, unexpected character sets, or a pattern that doesn't resolve to English text: assume another layer is present.

Common double-encoding stacks in CTFs:

```
Hex → Hex          (hex-encoded hex)
Base64 → Base64    (base64 of base64)
Hex → Base64       (hex-encoded base64)
Base64 → Hex       (base64 of hex string)
ROT13 → Base64     (ROT13 applied after base64)
```

### CyberChef Workflow

CyberChef's **Magic** operation can auto-detect encoding layers. For manual analysis:

1. Paste input into CyberChef
2. Apply first detected operation
3. Check output: if still encoded, add another operation
4. Repeat until plaintext is visible

---

## Tools Used

- `CyberChef`: multi-layer decode chain
- `xxd`: hex inspection
- `base64` (CLI): quick decode check

---

## What I Learned

Never assume a challenge has only one encoding layer just because the title says "encode" (singular). In CTFs, `double encode` = two layers, but `encode` alone can mean anything from 1 to 5+ layers.

**Lesson:** When decoded output looks garbled, don't stop: keep peeling layers.

---

## Flag

```
0ddayhiest{crypt0_is_fun}
```
