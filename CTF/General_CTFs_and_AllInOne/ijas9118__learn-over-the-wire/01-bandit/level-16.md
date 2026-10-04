# Bandit Level 16 → Level 17

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-16-blue?style=flat-square)

The credentials for Level 17 are retrieved by submitting the current password to a specific SSL/TLS port in the range **31000 to 32000** on **localhost**. 

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl16) ssh bandit16@bandit.labs.overthewire.org -p 2220
```

### Retrieving the RSA Key

#### 1. Port Scanning for Services
There are two common ways to discover open ports: a manual Bash loop or using specialized tools like **`nmap`**.

**Option A: Manual Bash Loop (Using `nc`)**
This is a core Unix approach that iterates through every port in the provided range and uses `nc -z` to check if a connection can be established.

```bash
for p in {31000..32000}; do nc -z localhost $p 2>/dev/null && echo "Port $p open"; done
```

*   **`-z`**: Scan mode (zero-I/O). Only check if the port is open without sending data.
*   **`2>/dev/null`**: Silence error messages for closed ports.

**Option B: Using Nmap (Industry Standard)**
To find which ports are open and what services they represent, use **`nmap`**. It is much more efficient than manual loops or separate `nc` probes.

```bash
# Scan the port range and detect service versions
nmap localhost -p 31000-32000 -sV
```

### Why use `nmap` instead of manual checking?

While the `nc` loop identifies **open** ports, it cannot tell you **what** is running on them. You would then have to manually check every single open port using `openssl s_client` to see if it supports SSL/TLS. 

**Nmap Advantages:**
*   **Speed**: Highly optimized for large ranges.
*   **Service Detection (`-sV`)**: Automatically probes ports to determine if they are encrypted (SSL/TLS) or just "echo" servers.
*   **Automation**: Combines discovery and service identification into a single command.

**Significant Results from Nmap:**
*   **Port 31518**: `ssl/echo` (Simply echoes back whatever you send).
*   **Port 31790**: `ssl/unknown` (This is our target).

#### 2. Connecting to the Payload Server
Connect to the `ssl/unknown` port using `openssl`.

```bash
# Use -quiet to suppress the full handshake output
openssl s_client -connect localhost:31790 -quiet
```

#### 3. Submitting the Password
Once connected, paste your Level 16 password and press `Enter`. The server will respond with an **RSA Private Key**.

```text
kSkvUp... (your current level 16 password)
Correct!
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### Understanding Nmap (`nmap`)

Nmap is a powerful network discovery and security auditing tool. In this level, it helps distinguish between "dumb" echo servers and the actual encrypted service we need.

| Flag | Meaning | Why use it? |
| :--- | :--- | :--- |
| `-p` | **Port Range** | Scan thousands of ports in a single command. |
| `-sV` | **Service/Version Detection** | Probes open ports to find out what software/protocol is running (e.g., detecting SSL). |

#### 4. Managing the Private Key
The payload is a **Private Key**, not a text password. It must be saved and secured carefully.

```bash
# On the Bandit server
mktemp -d              # Create a writeable directory in /tmp
cd /tmp/tmp.XXXXX
vim private_key        # Paste the key here and save
chmod 600 private_key  # MANDATORY: Secure the key permissions
```

#### 5. Local Transfer and Login
Download the key to your local machine and use it to log in as `bandit17`.

```bash
# From your LOCAL terminal
scp -P 2220 bandit16@bandit.labs.overthewire.org:/tmp/tmp.XXXXX/private_key .
ssh -i private_key bandit17@bandit.labs.overthewire.org -p 2220
```

#### 6. Final Password Extraction
Once logged into Level 17, locate the password file.

```bash
cat /etc/bandit_pass/bandit17
exit

# Save the password for Level 17
echo "PASSWORD" > passwords/bandit/lvl17
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `nmap` | `-sV` | **Network Mapper**: Probes ports to determine version/service information. |
| `openssl` | `-quiet` | **SSL/TLS Client**: Suppresses standard handshake info for a cleaner stream. |
| `mktemp` | `-d` | Creates a temporary workspace. |
| `chmod` | `600` | Restricts access to the current owner (required for SSH keys). |

> [!IMPORTANT]
> Some servers on this level just "echo" your password back to you. Use `nmap -sV` to avoid wasting time on mirror services.

> [!TIP]
> If `nmap` is not available, you can use a bash loop with `nc -z`, but you will still need `openssl` or `nmap` to verify SSL/TLS support.

> [!CAUTION]
> Private keys starting with `-----BEGIN RSA PRIVATE KEY-----` must be handled exactly like passwords. Never expose them or leave them in public directories.
