# Bandit Level 15 -> 16

## Goal

Submit the password to port 30001 using SSL/TLS encryption.

## Key Concept

SSL/TLS encrypted connections with `openssl`.

## Solution

```bash
openssl s_client -connect localhost:30001
```

After the connection is established, paste the current password and press Enter.

## Why This Works

Unlike plain netcat, this port requires encrypted communication. The `openssl s_client` command establishes a TLS connection, allowing secure data transmission.
