---
title: "TryHackMe: Metasploit: Meterpreter"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Take a deep dive into Meterpreter, and see how in-memory payloads can be used for post-exploitation."
---

## Answers
What is the computer name?

**ACME-TEST**

What is the target domain?

**FLASH**

What is the name of the share likely created by the user?

**speedster**

What is the NTLM hash of the jchambers user?

**69596c7aa1e8daee17f8e78870e25a5c**

What is the cleartext password of the jchambers user?

**Trustno1**

Where is the "secrets.txt"  file located? (Full path of the file)

**c:\Program Files (x86)\Windows Multimedia Platform\secrets.txt**

What is the Twitter password revealed in the "secrets.txt" file?

**KDSvbsw3849!**

Where is the "realsecret.txt" file located? (Full path of the file)

**c:\inetpub\wwwroot\realsecret.txt**

What is the real secret?

**The Flash is the fastest man alive**

## Things You Should Know

### **1. Introduction to Meterpreter**

* Meterpreter is an **advanced payload** in Metasploit that runs **in-memory** on the target.
* It allows **post-exploitation tasks** without leaving files on the target system.
* Supports multiple **platforms**: Windows, Linux, macOS, Android, iOS, PHP, Python, Java.

---

### **2. Meterpreter Flavors**

* **Payload types**:

  * **Staged**: Sent in two parts (small stager first, then full payload).
  * **Inline/Single**: Sent in one step.
* **Choosing a payload** depends on:

  1. **Target OS**: Windows, Linux, macOS, etc.
  2. **Available components**: Python, PHP, Java installed on the target.
  3. **Network constraints**: TCP, HTTPS, IPv4/IPv6 access.
* Use `msfvenom --list payloads | grep meterpreter` to see available Meterpreter versions.
* Some exploits (like **MS17-010 EternalBlue**) have default Meterpreter payloads, but you can use `show payloads` to find compatible alternatives.

---

### **3. Meterpreter Commands**

#### **Help & Categories**

* `help` or `?` lists commands, which fall into categories:

  1. **Core commands**: manage sessions, load extensions, background scripts.
  2. **File system commands**: browse, upload/download, search, edit files.
  3. **Networking commands**: view interfaces, connections, ARP table, port forwarding.
  4. **System commands**: execute programs, view processes, get user info, migrate, reboot/shutdown, shell.
  5. **Other commands**: webcam, microphone, keylogging, screenshots, privilege escalation, password dumping.

---

#### **Common Core Commands**

* `getuid`: Shows the user Meterpreter is running as (privilege level).
* `ps`: Lists running processes and their PIDs.
* `migrate <PID>`: Move Meterpreter to another process for stability or keylogging.
* `sessions`: Switch between multiple Meterpreter sessions.
* `background`: Send current session to the background.
* `exit`: Close the session.

---

#### **File & Search Commands**

* `ls` / `cd` / `pwd`: Navigate filesystem.
* `search -f <filename>`: Find files (e.g., flags, configs).
* `upload` / `download`: Transfer files to/from target.
* `edit`: Modify files directly.

---

#### **Networking Commands**

* `ifconfig`: Show network interfaces.
* `netstat`: List active network connections.
* `route`: View or modify routing table.
* `portfwd`: Forward local ports to target services.

---

#### **System & Post-Exploitation**

* `hashdump`: Dumps Windows SAM database (NTLM password hashes). Can be used for **Pass-the-Hash attacks**.
* `shell`: Opens a system shell on the target. Return with CTRL+Z.
* `clearev`: Clear event logs.
* `getsystem`: Attempt privilege escalation to SYSTEM.
* `keyscan_start/stop/dump`: Record and view keystrokes.
* `screenshare`, `screenshot`, `webcam_snap`, `webcam_stream`, `record_mic`: Capture desktop, webcam, or audio.

---

#### **Post-Exploitation Notes**

* Migrating to the right process is key for **stability and privilege management**.
* Use `getuid` and `ps` first to plan actions.
* Hashes, files, and credentials gathered can aid in lateral movement and further exploitation.
* Commands available may vary depending on target OS, Meterpreter version, and installed components.

---

#### **Key Tips**

* Always start with `help` to see available commands for your Meterpreter version.
* Use `search` to locate sensitive files quickly.
* Be cautious when migrating to lower-privileged processes to avoid losing SYSTEM access.
* Meterpreter is stealthy and flexible, perfect for **post-exploitation** in CTFs or pentesting labs.
