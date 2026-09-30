# CTF Writeup: Weasel (THM)

##This CTF was retired from THM so I needed to go off Jesusgavancho's writeup of this. I would have loved to get to do it myself.
Credit where it is due:
https://github.com/jesusgavancho/TryHackMe_and_HackTheBox/blob/master/Weasel.md

**Target IP:** `10.10.153.67` ($target)

---

## Metadata

- **CTF Name:** Weasel
    
- **Platform:** TryHackMe
    
- **Date:** 2026-10-05
    
- **Tools Used:** rustscan, nmap, smbmap, crackmapexec, smbclient, evil-winrm, winpeas, PowerUp
    
- **Key Skills/Tools:** SMB Enumeration, Jupyter Notebook Exploitation, SSH Private Key usage, AlwaysInstallElevated Privilege Escalation.
    

---

## Reconnaissance & Enumeration

### 1. Port Scanning

Initial scanning was performed using `rustscan` followed by a detailed `nmap` service scan.

**Command:**

Bash

```
$ rustscan -a 10.10.153.67 --ulimit 5500 -b 65535 -- -A -Pn
```

**Key Results:**

- **22/tcp:** OpenSSH for_Windows_7.7
    
- **139/445:** SMB
    
- **5985/tcp:** WinRM
    
- **8888/tcp:** Jupyter Notebook (Tornado httpd 6.0.3)
    

### 2. SMB Enumeration

The target allows guest/anonymous access to certain shares.

**Command:**

Bash

```
$ smbmap -u anonymous -H 10.10.153.67
```

**Shares Identified:**

- `datasci-team`: READ, WRITE permissions.
    
- `IPC$`: READ ONLY access.
    

Using `smbclient` to explore the `datasci-team` share revealed a sensitive file: `\misc\jupyter-token.txt`.

**Token Found:** `067470c5ddsadc54153ghfjd817d15b5d5f5341e56b0dsad78a`

---

## Foothold

### 1. Jupyter Notebook Access

Logging into the Jupyter instance at `http://$target:8888` using the discovered token allowed for command execution. Opening a new terminal through the Jupyter interface provided access as the `dev-datasci` user.

### 2. SSH Key Recovery

Inside the `dev-datasci` home directory, an OpenSSH private key was found: `dev-datasci-lowpriv_id_ed25519`.

**Key Content:**

Plaintext

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBUoe5ZSezzC65UZhWt4dbvxKor+dNggEhudzK+JSs+YwAAAKjQ358n0N+f
...
-----END OPENSSH PRIVATE KEY-----
```

This key was used to gain a stable SSH shell as `dev-datasci-lowpriv`.

---

## Privilege Escalation

### 1. Local Enumeration

Running `winPEAS` and `PowerUp.ps1` revealed a common Windows misconfiguration.

**Vulnerability Found:** `AlwaysInstallElevated` is set to `1` in both `HKLM` and `HKCU`.

### 2. Exploiting AlwaysInstallElevated

When these registry keys are set, any user can install a Windows Installer (`.msi`) file with SYSTEM privileges.

**Autologon Credentials Found:**

- **DefaultUserName:** `dev-datasci-lowpriv`
    
- **DefaultPassword:** `wUqnKWqzha*W!PWrPRWi!M8faUn`
    

---

## Flags

- **User Flag:** `THM{w3as3ls_@nd_pyth0ns}`
    
- **Root Flag:** `THM{YWFjZTM1Mj...}`
