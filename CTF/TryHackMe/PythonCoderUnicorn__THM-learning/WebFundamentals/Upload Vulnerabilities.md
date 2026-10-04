
#Subscribers  

this room is rated as "easy"

https://tryhackme.com/r/room/uploadvulns

https://infosecwriteups.com/upload-vulnerabilities-tryhackme-writeup-f6fba1dad902

```
gobuster dir -u http://jewel.uploadvulns.thm -w /usr/shar/wordlists/dirb/big.txt | tee gobuster-root-big

/Content
/ADMIN
/Admin
/assets/
/modules
/content
 

browser wappalyzer extension

burp suite intercept
nodejs xpress 

gobuster dir -u http://jewel.uploadvulns.thm -w UploadVulnsWordlist.txt -t 250 -x jpg

http://jewel.uploadvulns.thm/admin

find a rev shell payload for nodejs
invalid file type

burp suite intercept options

mv shell.php shell.jpg

```

## task 4 

```
What is the name of the image file which can be overwritten?

mountains.jpg

Overwrite the image. What is the flag you receive?

THM{OTBiODQ3YmNjYWZhM2UyMmYzZDNiZjI5}

```

## task 5

```
Run a Gobuster scan on the website using the syntax from the screenshot above. What directory looks like it might be used for uploads?

/resources

Get either a web shell or a reverse shell on the machine.  
What's the flag in the /var/www/ directory of the server?

THM{YWFhY2U3ZGI4N2QxNmQzZjk0YjgzZDZk}

```

## task 6

```
What is the traditionally predominant server-side scripting language?
php

When validating by file extension, what would you call a list of accepted extensions (whereby the server rejects any extension not in the list)?

whitelist

**[Research]** What MIME type would you expect to see when uploading a CSV file?

text/csv

```

## task 7

```
What is the flag in /var/www/?

 THM{NDllZDQxNjJjOTE0YWNhZGY3YjljNmE2}
```

## task 8

```
What is the flag in /var/www/?

THM{MGEyYzJiYmI3ODIyM2FlNTNkNjZjYjFl}
```

## task 9 

```
What is the flag in /var/www/?

THM{MWY5ZGU4NzE0ZDlhNjE1NGM4ZThjZDJh}
```

## task 11 

```

Hack the machine and grab the flag from /var/www/

THM{NzRlYTUwNTIzODMwMWZhMzBiY2JlZWU2}

```

