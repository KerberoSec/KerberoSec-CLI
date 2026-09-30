# Bandit Level 16 -> 17

## Goal

Find a port between 31000-32000 that speaks SSL and returns credentials.

## Key Concept

Port scanning with `nmap`.

## Solution

Scan the port range:

```bash
nmap -p 31000-32000 localhost
```

For each open port, test with SSL:

```bash
openssl s_client -connect localhost:<port>
```

Submit the current password to find the correct service. The correct port returns an SSH private key.

Save the key and use it:

```bash
chmod 600 /tmp/key
ssh -i /tmp/key bandit17@localhost -p 2220
```

## Why This Works

- `nmap` discovers open ports
- Only one port speaks SSL and returns useful data
- The returned key provides access to the next level
