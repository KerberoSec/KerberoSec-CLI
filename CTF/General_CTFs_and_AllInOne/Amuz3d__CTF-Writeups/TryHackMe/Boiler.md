# CTF: Boiler (TryHackMe)

## Metadata

- **Target:** 10.64.180.158
    
- **Difficulty:** Medium
    
- **Date:** 2026-03-19
    
- **Key Skills/Tools:** SUID Exploitation (find), sar2html RCE (CVE-2019-15107), Anonymous FTP, ROT13, Information Disclosure.
    

---

## Reconnaissance

A full service scan revealed several entry points, including a legacy FTP service and multiple web interfaces.

Bash

```
nmap -A -T4 10.64.180.158
```

**Results:**

- **Port 21:** FTP (vsftpd 3.0.3): Anonymous login allowed.
    
- **Port 80:** HTTP (Apache 2.4.18).
    
- **Port 10000:** Webmin (MiniServ 1.930).
    

### The FTP Rabbit Hole

Logging in as `anonymous` allowed the retrieval of a hidden file: `.info.txt`.

> **Rabbit Hole Alert:** The file contained a ROT13 encoded string: `Whfg jnagrq gb frr vs lbh svaq vg. Yby. Erzrzore: Rahzrengvba vf gur xrl!`.
> 
> **Decoded:** "Just wanted to see if you find it. Lol. Remember: Enumeration is the key!"
> 
> This confirmed that the FTP vector was a distraction designed to encourage further web enumeration.

---

## Foothold

Directory brute-forcing eventually led to `/joomla/_test/index.php`, which was hosting **sar2html**.

### 1. Exploitation (sar2html RCE)

Using `searchsploit`, the exploit **49344.py** was identified. This allows for command execution via the `plot` parameter in the URL.

### 2. Information Disclosure

Enumerating the filesystem via the web shell revealed a `log.txt` file containing internal SSH logs.

Plaintext

```
Accepted password for basterd from 10.1.1.1 port 49824 ssh2 #pass: superduperp@$$
```

**Credentials Harvested:** `basterd:superduperp@$$`

---

## Lateral Movement

The SSH service was found running on port **55007**. After logging in as `basterd`, a backup script was found in the home directory.

> **Rabbit Hole Alert:** `backup.sh` contained a commented-out password: `#superduperp@$$no1knows`.

This second set of credentials allowed for a successful pivot to the user `stoner`.

Bash

```
su stoner
# Password: superduperp@$$no1knows
```

---

## Privilege Escalation

With access as `stoner`, a search for SUID binaries was conducted.

### 1. The Fake Sudo Entry

> **Rabbit Hole Alert:** Running `sudo -l` showed a NOPASSWD entry for `/NotThisTime/MessinWithYa`. This is a non-existent path and another deliberate rabbit hole.

### 2. SUID Exploitation (find)

The binary `/usr/bin/find` was found to have the SUID bit set.

**Attempted Shell Spawn:** The standard method to spawn a root shell failed on this specific environment:

Bash

```
/usr/bin/find . -exec /bin/bash -p \; -quit
# Result: Did not work/failed to drop into root shell.
```

**Successful Workaround:** Instead of a direct shell, the `find` binary was used to modify the permissions of the `/root` directory directly, allowing `stoner` to read the flag.

Bash

```
find . -exec chmod 777 /root \;
cd /root
cat root.txt
```

---

## Flags

- **User (.secret):** `You made it till here, well done.`
    
- **Root (root.txt):** `It wasn't that hard, was it?`
