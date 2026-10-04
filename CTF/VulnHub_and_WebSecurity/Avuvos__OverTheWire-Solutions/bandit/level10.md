# Bandit Level 10 -> 11

## Goal

Decode the base64-encoded password in `data.txt`.

## Key Concept

Base64 encoding and decoding.

## Solution

```bash
base64 -d data.txt
```

## Why This Works

Base64 is a common encoding scheme that represents binary data as ASCII text. The `-d` flag decodes the encoded content back to its original form.
