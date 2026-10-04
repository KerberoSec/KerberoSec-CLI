<h1 align='center'>[THM] Relevant</h1>

<br>

## Client details:-

- Machine: `Relevant`
- URL: `relevant.thm`
- IP: `10.10.240.89`

- _Scope of work:_
	- find __user.txt__ (gain sys shell) & __root.txt__ (privesc)
	- report any/all vulnerabilities found doing so

<br><hr><br>

## Penetration Test:-
> find step-by-step pentest notes [here](./notes.md)

### Reconnaissance & Scanning:

- Nmap scan [[results](./nmap.log)]
	- cmd: `nmap -p- 10.10.184.24` > `nmap -sC -sV -A -p 80,135,139,445,3389,49663,49667,49669 -o nmap.log 10.10.184.24`

- OS detected: `Windows Server 2016 Standard Evaluation 14393 (Windows Server 2016 Standard Evaluation 6.3)`

- SMB client: connected without login
	- cmd: `smbclient -L 10.10.240.89 -U guest`
	- found file with __sensitive data__ on `nt4wrksv` _shared foldar_ > `passwords.txt`
		- user1: `Bob`   pwd1:`!P@$$W0rD!123`
		- user2: `Bill`  pwd2:`Juw4nnaM4n420696969!$$$`

- Gobuster scan [[results](./gobuster.log)]
	- cmd: `gobuster dir -u http://10.10.191.233:49663 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster.log`

- Got reverse shell
	- uploaded reverse shell created with _msfvenom_ via _smb_
	- accesses/executed the `.aspx` file from web
		- can access _shared foldar_ (same as smb's) via p49663
	- setup listener `nc -lnvp 443`

- Got __user.txt__ = `THM{fdk4ka34vk346ksxfr21tg789ktf45}`

- Got __root.txt__ = `THM{1fk5kf469devly1gl320zafgl345pv}`

