*[Image: Mr Robot CTF Cover Image]*
# Mr Robot CTF Writeup

## NMAP Scan
```
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-06 18:36 GMT
Nmap scan report for 10.10.229.104
Host is up (0.030s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT    STATE  SERVICE VERSION
22/tcp  closed ssh
80/tcp  open   http
443/tcp open   https
```

Visiting the webpage on port 80, we see what seems to be an interactive 'terminal' that allows you to run a set few commands. These commands display different webpages all relating to the Mr Robot series.

## Gobuster Scan
```
http://10.10.229.104/0/
http://10.10.229.104/admin
http://10.10.229.104/login
http://10.10.229.104/license
http://10.10.229.104/robots.txt
```

Browsing to **/robots.txt** shows two files:
```
fsocity.dic
key-1-of-3.txt
```
**fsocity.dic** seems to be some kind of wordlist, but I didn't end up using it.
**key-1-of-3.txt** is the first flag that we need for the CTF.

If we view the **/license** page we can see some text saying `what you do just pull code from Rapid9 or some s@#% since when did you become a script kitty?`. Scrolling down the page a bit there is some text `looking for a password...`. If we continue scrolling down, there seems to be some Base64 encoded text.

Decoding the Base64 seems to reveal a username and password:
```
elliot:[REDACTED]
```

## Foothold
Now we have some credentials, it's time to test them on the **/login** page...
SUCCESS! We have access to the admin dashboard! It seems to be a Wordpress site.
Wordpress runs on PHP, this means we can upload a PHP webshell or a PHP reverse shell.

We can go to the themes editor page, click on `404.php` and replace the PHP code with a PHP reverse shell.
I like to use the PHP reverse shell made by `pentestmonkey` on GitHub, you can find it [here](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php)

Just remember to change the IP and Port in the reverse shell, to your listener IP and Port, when you replace the code in `404.php`

Now, we can start a listener using the command: `nc -nvlp <port>`

Once the listener is started, we can go back to the theme editor and click `Update` to update the `404.php` template. Now the file has been updated, we can browse to **/wp-admin/404.php** to activate the reverse shell.

We check the listener, and now have a shell on the machine!

## Privilege Escalation (robot)
Changing directory into `/home` we can see two files present:
```
key-2-of-3.txt
password.raw-md5
```

Trying to read `key-2-of-3.txt` returns a **Permission denied** because the file is owned by the user **robot**. However, the other file `password.raw-md5` is readable, and it shows an MD5 hashed password for **robot**.

We can use JohnTheRipper or Hashcat to crack the hash, which returns:
`robot:[REDACTED]`

Now we change user to **robot**, `su robot`, enter the password and we are now **robot**!

## Privilege Escalation (root)
We can now read the `key-2-of-3.txt` file to get the second flag we need for the CTF.

Running `sudo -l` returns that we cannot run sudo as **robot**, so instead we run a command to find all of the SUID binaries that we can run: `find / -perm -4000 2>/dev/null`. You can do the same by running linpeas, which would return much more information, but for this purpose we just need to find the SUID binaries.

It returns a list of SUID bianries on the system, but one of them stands out above the others `/usr/local/bin/nmap`. NMAP is not usually an SUID binary that you would see on Linux systems. Checking [GTFOBins](https://gtfobins.github.io/gtfobins/nmap/) we can see that we can abuse this binary to spawn a shell as root!

We can run the commands:
```
/usr/local/bin/nmap --interactive
!sh
```
That's it! We now have a root shell!
Change directory to `/root` and read the final flag file needed for the CTF `cat key-3-of-3.txt`
Now we are done!

TryHackMe Mr Robot CTF: [https://tryhackme.com/room/mrrobot](https://tryhackme.com/room/mrrobot)
