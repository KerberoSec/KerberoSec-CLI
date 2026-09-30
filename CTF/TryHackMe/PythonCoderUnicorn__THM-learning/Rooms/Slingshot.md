- https://tryhackme.com/room/slingshot
- https://www.youtube.com/watch?v=HrmxL-Pwcns

#BlueTeam  #logs 

- What vulnerabilities did the attacker exploit on the web server?
- What user accounts were compromised?
- What data was exfiltrated from the server?

```
http://10.10.250.133

elastic : raCK0W**BLlW66oNlKAk

```

suspicious activity started on July 26, 2023

```
What was the attacker's IP?

!remote address 10.0.2.76
10.0.2.15

---
http.method
http.url
request.headers.User-Agent
---
  
What was the first scanner that the attacker ran against the web server?

nmap scripting engine

  
What was the User Agent of the directory enumeration tool that the attacker used on the web server?

filter: gobuster
Mozilla/5.0 gobuster

  
In total, how many requested resources on the web server did the attacker fail to find?

response.status:404

1867

What is the flag under the interesting directory the attacker found?

response.status:200 AND flag

/backups/?flag=a76637b62ea99acda12f5859313f539a

  
What login page did the attacker discover using the directory enumeration tool?

response.status:200 and request.headers.User-Agent:"Mozilla/4.0 (Hydra)"

/admin-login.php

  
What was the user agent of the brute-force tool that the attacker used on the admin panel?

Mozilla/4.0 (Hydra)

  
What username:password combination did the attacker use to gain access to the admin page?

message > 'Authorization'
GET /admin-login.php
YWRtaW46dGh4MTEzOA==  > cyberchef > from base64

admin : thx1138

  
What flag was included in the file that the attacker uploaded from the admin directory?

response.status:2000 and http.url:/admin

http.method:POST    41 hits
http.method:POST and upload 
	/admin/upload.php?action=upload
	easy-simple-php-webshell.php
	THM{ecb012e53a58818cbd17a924769ec447}

What was the first command the attacker ran on the web shell?

http.url:/uploads/
http.url:"/uploads/easy-simple-php-webshell.php?cmd=whoami"

What file location on the web server did the attacker extract database credentials from using Local File Inclusion?

response.status:2000 and http.url:/admin

etc/phpmyadmin/config-db.php

  
What directory did the attacker use to access the database manager?

http.url:"/phpMyAdmin.php"

/phpMyAdmin

  
What was the name of the database that the attacker exported?

http.url:/php
	/phpmyadmin/db_structure.php?server=1&db=customer_credit_cards
	customer_credit_cards

What flag does the attacker insert into the database?

PUT request

http.url:/phpmyadmin and http.method:POST

/phpmyadmin/tbl_replace.php

http.method:POST and insert
	sql_query=INSERT+INFO....

cyberchef > url decode
VALUES
	c6aa3215a7d519eeb40a660f3b76e64c

```

