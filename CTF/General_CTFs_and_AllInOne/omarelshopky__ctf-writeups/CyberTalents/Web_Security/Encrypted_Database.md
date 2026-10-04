# Challenge Name:
 [*Encrypted Database*](https://cybertalents.com/challenges/web/encrypted-database)
 
# Challenge Description
The company hired an inexperienced developer, but he told them he hided the database and have it encrypted so the website is totally secure, can you prove that he is wrong ??

Link: [http://34.77.37.110//encrypted-database/](http://34.77.37.110//encrypted-database/)

## Answer
* View Page Source tells us that there are two directories pages/ contain content of the pages and secret-admin/
* Go to [secret-admin folder](http://34.77.37.110//encrypted-database/secret-admin/) and View Page Source
* There is hidden input field contain reference to a database
```
<input type="hidden" name="db" value="hidden-database/db.json" />
```
* Open [the database](http://34.77.37.110//encrypted-database/secret-admin/hidden-database/db.json) there is only one row with flag seam to be in hash format
```
{"flag":"ab003765f3424bf8e2c8d1d69762d72c"}
```
* Find its type using hash-identifier
```
 HASH: ab003765f3424bf8e2c8d1d69762d72c

Possible Hashs:
[+] MD5
[+] Domain Cached Credentials - MD4(MD4(($pass)).(strtolower($username)))
```
* Crack it online using this (tool)[https://crackstation.net/]
* You got the Flag!!

 ## The Flag
 > badboy
