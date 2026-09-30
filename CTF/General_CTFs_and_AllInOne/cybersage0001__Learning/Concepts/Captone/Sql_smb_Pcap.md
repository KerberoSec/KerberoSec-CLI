# 🔐 Final Capstone Activity: Complete Penetration Testing Hands-On Practice

> A hands-on cybersecurity capstone covering reconnaissance, SQL injection, password cracking, web server enumeration, SMB share exploitation, and Wireshark PCAP analysis.

---

## 📌 Overview

This Final Capstone Activity simulated a complete penetration testing engagement in an authorized cybersecurity lab environment.

The objective was to start with reconnaissance, identify vulnerable services and applications, exploit the discovered weaknesses, locate flag files, and finally recommend remediation methods.

The assessment covered four different security scenarios:

1. **SQL Injection**
2. **Web Server Directory Listing**
3. **Anonymous SMB Shares**
4. **Clear-Text HTTP Traffic Analysis**

The lab environment included the following networks:

```text
10.6.6.0/24
172.17.0.0/24
```

---

# 🎯 Objectives

The objectives of this capstone were to:

* Perform network reconnaissance
* Identify open ports and running services
* Discover vulnerable web applications
* Exploit SQL injection in an authorized lab
* Retrieve and crack a password hash
* Enumerate web directories
* Identify directory listing vulnerabilities
* Discover anonymous SMB shares
* Access and download files from SMB shares
* Analyze HTTP traffic using Wireshark
* Locate sensitive information transmitted in clear text
* Recommend remediation for every discovered vulnerability

---

# 🛠️ Tools Used

| Tool             | Purpose                                 |
| ---------------- | --------------------------------------- |
| Nmap             | Network and port scanning               |
| DVWA             | Vulnerable web application              |
| John the Ripper  | Password hash cracking                  |
| RockYou Wordlist | Dictionary attack                       |
| SSH              | Remote system access                    |
| DIRB             | Web directory enumeration               |
| Enum4linux       | SMB enumeration                         |
| SMBClient        | Accessing SMB shares                    |
| Wireshark        | PCAP and packet analysis                |
| Web Browser      | Manual directory and file investigation |
| Kali Linux       | Penetration testing environment         |

---

# 🗺️ Overall Methodology

The complete assessment followed this general workflow:

```text
                     ┌──────────────────┐
                     │ Reconnaissance   │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Port Scanning    │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Service          │
                     │ Enumeration      │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Vulnerability    │
                     │ Discovery        │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Controlled       │
                     │ Exploitation     │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Flag / Evidence  │
                     │ Collection       │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Remediation      │
                     └──────────────────┘
```

---

# 🧪 Challenge 1: SQL Injection

## Objective

The objective was to exploit a vulnerable SQL input form, retrieve Gordon Brown's password hash, crack the password, log into another system, and locate the Challenge 1 flag.

---

## Step 1: Access the Vulnerable Application

Target:

```text
10.6.6.100
```

Login credentials:

```text
Username: admin
Password: password
```

After logging in:

1. Navigate to **DVWA Security**
2. Set the security level to:

```text
Low
```

3. Click **Submit**

---

## Step 2: Identify the Vulnerable SQL Input

The SQL Injection page contained a User ID input.

A UNION-based SQL injection was used to retrieve information from the application's database.

The results revealed multiple user records, including:

```text
First name: Gordon
Surname: Brown
```

and the associated password hash.

### Key Finding

The application allowed user-controlled input to influence the SQL query.

This is a classic SQL injection vulnerability.

---

## Step 3: Crack Gordon Brown's Password

The retrieved hash was saved locally.

John the Ripper was then used with the RockYou wordlist.

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

### Result

```text
Password: abc123
```

---

## Step 4: Access the Remote System

Using the recovered credentials:

```bash
ssh gordonb@172.17.0.2
```

After logging in:

```bash
ls
```

The following file was discovered:

```text
hkxisx.txt
```

The file was opened using:

```bash
cat hkxisx.txt
```

### 🚩 Challenge 1 Result

```text
Congratulations!
You found the flag for Challenge 1!
The code for this challenge is 4E9f12.
```

### Flag

```text
4E9f12
```

---

## 🔍 Challenge 1 Workflow

```text
SQL Injection
     │
     ▼
Retrieve User Records
     │
     ▼
Find Gordon Brown's Hash
     │
     ▼
Crack Hash with John
     │
     ▼
Password: abc123
     │
     ▼
SSH to 172.17.0.2
     │
     ▼
Locate hkxisx.txt
     │
     ▼
Flag: 4E9f12
```

---

## 🛡️ SQL Injection Remediation

1. Use parameterized queries / prepared statements.
2. Validate all user input.
3. Use allow-list validation.
4. Filter unnecessary or unexpected input.
5. Escape user input where appropriate.

### Additional Recommendations

* Apply the principle of least privilege to database accounts.
* Avoid displaying database errors to users.
* Use secure coding practices.
* Perform regular application security testing.

---

# 🌐 Challenge 2: Web Server Directory Listing

## Objective

The objective was to identify directories on the web server that allowed directory listing and locate a flag file.

Target:

```text
http://10.6.6.100
```

---

## Step 1: Perform Directory Enumeration

DIRB was used to enumerate directories.

```bash
dirb http://10.6.6.100 -w /usr/share/wordlists/dirb/common.txt
```

### Interesting Results

```text
/config/
/docs/
```

Both directories could be accessed through a web browser.

---

## Step 2: Investigate the Directory Listings

I manually navigated to:

```text
http://10.6.6.100/docs/
```

The server displayed an index of files.

Files included:

```text
DVWA_v1.3.pdf
help.html
user_form.html
```

The flag file was:

```text
user_form.html
```

---

## Step 3: Open the Flag File

URL:

```text
http://10.6.6.100/docs/user_form.html
```

### 🚩 Challenge 2 Result

```text
Great work!

You found the flag file for Challenge 2!

The code for this flag is 18xf9-4z
```

### Results Summary

| Finding              | Result                 |
| -------------------- | ---------------------- |
| Accessible directory | `/config/`             |
| Accessible directory | `/docs/`               |
| Flag file            | `user_form.html`       |
| Flag location        | `/docs/user_form.html` |
| Challenge 2 flag     | `18xf9-4z`             |

---

## 🛡️ Directory Listing Remediation

### 1. Disable Directory Indexing

Configure the web server so directory contents cannot be automatically displayed.

### 2. Use Default Index Files

Use files such as:

```text
index.html
index.php
```

where appropriate.

### Additional Recommendations

* Store sensitive files outside the web root.
* Apply proper file permissions.
* Restrict access using authentication and authorization.
* Regularly scan web servers for exposed files and directories.

---

# 📁 Challenge 3: Exploiting Open SMB Shares

## Objective

The objective was to identify an SMB server, enumerate its shares, identify anonymous access, and retrieve the Challenge 3 flag file.

---

## Step 1: Identify an SMB Target

Nmap was used to scan the network.

An interesting host was:

```text
10.6.6.23
```

Relevant open ports:

```text
139/tcp
445/tcp
```

These ports indicated that the system was likely running SMB services.

---

## Step 2: Enumerate SMB Shares

SMB enumeration was performed against the target.

Shares discovered:

```text
homes
workfiles
print$
```

The following shares allowed anonymous access:

```text
workfiles
print$
```

---

## Step 3: Access the SMB Share

I connected to the `print$` share:

```bash
smbclient //10.6.6.23/print$
```

The connection was successful without requiring valid user credentials.

Inside SMBClient:

```text
ls
cd OTHER
ls
```

The following file was discovered:

```text
taxes.txt
```

The file was downloaded:

```text
get taxes.txt
```

After exiting SMBClient:

```bash
cat taxes.txt
```

### 🚩 Challenge 3 Result

```text
Congratulations!
You found the flag for Challenge 3!
The code for this challenge is A9!15wa2.
```

### Results Summary

| Finding          | Result            |
| ---------------- | ----------------- |
| SMB Target       | `10.6.6.23`       |
| Open SMB Ports   | `139`, `445`      |
| Accessible Share | `print$`          |
| Flag File        | `OTHER/taxes.txt` |
| Challenge 3 Flag | `A9!15wa2`        |

---

## 🔍 SMB Enumeration Workflow

```text
Nmap Scan
    │
    ▼
Host 10.6.6.23
    │
    ▼
Ports 139 and 445 Open
    │
    ▼
Enumerate SMB Shares
    │
    ▼
Anonymous Access Found
    │
    ▼
Access print$
    │
    ▼
Navigate to OTHER/
    │
    ▼
Download taxes.txt
    │
    ▼
Flag: A9!15wa2
```

---

## 🛡️ SMB Remediation

1. Disable anonymous access to SMB shares.
2. Restrict SMB access to trusted internal systems only.

### Additional Recommendations

* Keep systems patched and updated.
* Use strong authentication.
* Apply least-privilege permissions.
* Remove unused shares.
* Enable SMB signing where appropriate.
* Use firewall rules to restrict ports `139` and `445`.
* Segment sensitive systems from general network access.

---

# 📡 Challenge 4: Wireshark PCAP Analysis

## Objective

The objective was to analyze the `SA.pcap` capture file and identify the target system and the location of a file containing the Challenge 4 flag.

The PCAP file was located in the Kali user's `OTHER` directory.

---

## Step 1: Open the PCAP File

The capture file was opened in Wireshark.

To focus on web traffic, I used the display filter:

```text
http
```

The HTTP packets revealed communication with:

```text
10.6.6.14
```

---

## Step 2: Analyze Revealed HTTP Paths

The capture revealed several paths, including:

```text
/data
/styles
/passwords
/icons.txt
```

The `/data` directory was particularly interesting.

---

## Step 3: Investigate the Target

Using a browser, I navigated to:

```text
http://10.6.6.14/data/
```

The directory contained:

```text
accounts.xml
```

The full URL was:

```text
http://10.6.6.14/data/accounts.xml
```

The XML file contained account-related information.

### 🚩 Challenge 4 Results

| Finding          | Result               |
| ---------------- | -------------------- |
| Target IP        | `10.6.6.14`          |
| Flag Directory   | `/data/`             |
| Flag File        | `accounts.xml`       |
| Full URL         | `/data/accounts.xml` |
| Challenge 4 Flag | `zz90014x`           |

---

## 🛡️ Clear-Text Traffic Remediation

### 1. Use HTTPS / TLS

Sensitive information should never be transmitted over plain HTTP.

Use:

```text
HTTPS
```

instead of:

```text
HTTP
```

### 2. Use a VPN for Untrusted Networks

A VPN can provide an additional encrypted communication channel.

### Additional Recommendations

* Encrypt sensitive data in transit.
* Encrypt sensitive files at rest.
* Avoid storing sensitive information in web-accessible directories.
* Require authentication for sensitive resources.
* Use strong authorization controls.
* Avoid transmitting credentials in clear text.

---

# 📊 Final Results Summary

| Challenge | Vulnerability           | Target                      | Flag Location          | Flag       |
| --------- | ----------------------- | --------------------------- | ---------------------- | ---------- |
| 1         | SQL Injection           | `10.6.6.100` / `172.17.0.2` | `hkxisx.txt`           | `4E9f12`   |
| 2         | Directory Listing       | `10.6.6.100`                | `/docs/user_form.html` | `18xf9-4z` |
| 3         | Anonymous SMB Access    | `10.6.6.23`                 | `OTHER/taxes.txt`      | `A9!15wa2` |
| 4         | Clear-Text HTTP Traffic | `10.6.6.14`                 | `/data/accounts.xml`   | `zz90014x` |

---

# 📚 What I Learned

This capstone helped me connect multiple cybersecurity concepts into one practical penetration testing workflow.

## Key Takeaways

### 🔹 Reconnaissance is the foundation

Scanning and enumeration provide the information needed to decide what to investigate next.

### 🔹 Small misconfigurations can create serious exposure

Examples from this lab included:

* Directory listing
* Anonymous SMB access
* Sensitive files in accessible directories
* Clear-text HTTP traffic

### 🔹 Weak passwords are still dangerous

A password hash does not guarantee security when the original password is weak and easily guessable.

### 🔹 Encryption protects data in transit

HTTP traffic can expose sensitive information to anyone capable of observing network traffic.

### 🔹 Exploitation is only one part of penetration testing

A complete assessment also includes:

```text
Discovery
→ Validation
→ Impact Analysis
→ Evidence Collection
→ Remediation
```

---

# 🧠 Skills Practiced

* Network Reconnaissance
* Nmap Scanning
* Port Enumeration
* Service Enumeration
* SQL Injection
* Database Enumeration
* Password Hash Cracking
* John the Ripper
* Wordlist Attacks
* SSH
* Web Directory Enumeration
* DIRB
* URL Manipulation
* SMB Enumeration
* Enum4linux
* SMBClient
* Anonymous Share Testing
* File Retrieval
* Wireshark
* PCAP Analysis
* HTTP Analysis
* Vulnerability Validation
* Security Remediation

---

# 🛡️ Defensive Recommendations Summary

| Vulnerability       | Recommended Defense                                     |
| ------------------- | ------------------------------------------------------- |
| SQL Injection       | Prepared statements and strict input validation         |
| Weak Passwords      | Strong password policies and MFA                        |
| Directory Listing   | Disable auto-indexing and protect sensitive directories |
| Anonymous SMB       | Disable guest access and require authentication         |
| Exposed SMB Ports   | Firewall and network segmentation                       |
| Clear-Text HTTP     | Use HTTPS/TLS                                           |
| Sensitive Web Files | Store outside web root and enforce access controls      |

---

# 🏁 Conclusion

This Final Capstone Activity provided a practical experience of how a penetration test can move from reconnaissance to exploitation and finally to remediation.

The four challenges demonstrated how different weaknesses can expose sensitive information:

```text
SQL Injection
      +
Directory Listing
      +
Anonymous SMB Access
      +
Clear-Text HTTP Traffic
      =
Increased Security Risk
```

The most valuable lesson from this lab was understanding that cybersecurity is not about using a single tool or finding a single vulnerability.

It is about following a structured methodology:

```text
Observe → Enumerate → Analyze → Validate → Document → Remediate
```

This hands-on practice strengthened my understanding of both offensive techniques and defensive security controls.

---

# ⚠️ Disclaimer

This project was performed entirely in an authorized educational lab environment.

The techniques documented here are intended for cybersecurity learning, authorized penetration testing, and defensive security research only.

Do not attempt to access, scan, exploit, or modify systems without explicit permission.

---

## 📸 Screenshots

Suggested screenshot organization for this repository:

---

⭐ If you found this project useful, feel free to explore my other hands-on cybersecurity labs and practice write-ups.
