# Bandit Level 13 -> 14

## Goal

Use an SSH private key to log into the next level.

## Key Concept

SSH key-based authentication.

## Solution

Use the private key to connect:

```bash
ssh -i sshkey.private bandit14@localhost -p 2220
```

Once logged in as bandit14, read the password:

```bash
cat /etc/bandit_pass/bandit14
```

## Why This Works

SSH supports key-based authentication as an alternative to passwords. The `-i` flag specifies the identity file (private key). The server validates it against the corresponding public key.
