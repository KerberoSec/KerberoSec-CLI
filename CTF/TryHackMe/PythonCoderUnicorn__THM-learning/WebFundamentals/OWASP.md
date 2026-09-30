
# OWASP TOP 10

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging & Monitoring Failures
10. Server-Side Request Forgery (SSRF)

## Broken Access Control 

If a website visitor can access protected pages they are not meant to see, then the access controls are broken.

broken access control allows attackers to bypass authorisation

**IDOR** or Insecure Direct Object Reference refers to an access control vulnerability where you can access resources you wouldn't ordinarily be able to see

- `https:/bank.thm/account?id=111111` change id=222222

## Cryptographic Failures

A cryptographic failure refers to any vulnerability arising from the misuse (or lack of use) of cryptographic algorithms for protecting sensitive information.

"Man in The Middle Attacks", whereby the attacker would force user connections through a device they control.  take advantage of weak encryption on any transmitted data to access the intercepted information

vulnerabilities can be found in web apps that can be exploited without advanced networking knowledge.

databases can also be stored as files. These are referred to as "flat-file" databases, as they are stored as a single file on the computer.

- what happens if the database is stored underneath the root directory of the website?

- download it and explore

- SQLite database, SQLite3

### Example

you have downloaded the database

- `ls -l`   example.db
- `file example.db`

access it
- `sqlite3 <database name>`
- `sqlite3 example.db`

- `.tables`

see the table info
- `PRAGMA table_info(customers)`
- `select * from customers` dumps te info from table

4 columns: custID, custName, creditCard, password

- password is a hash

- row: `0|Joy Paulson|4916 9012 2231 7905|5f4dcc3b5aa765d61d8327deb882cf99 `

- online tool to crack hashes: https://crackstation.net/

- paste in `5f4dcc3b5aa765d61d8327deb882cf99` ==> password is 'password'

- `http:/x.x.x.x:81`
- login tab > inspect code > note /assets

- click on webapp.db  > downloads file

```
ls -l
file webapp.db
.tables
select * from users

```

- hash: `6eea9b7ef19179a06954edd0f6c05ceb`
- cracked hash: `qwertyuiop`
- flag: `thm{Yzc2YjdkMjE5N2VjMzNhOTENjdiMjdl}`

## Injection 

These flaws occur because the application interprets user-controlled input as commands or parameters

- SQL inection
- command injection

The main defence for preventing injection attacks is ensuring that user-controlled input is not interpreted as queries or commands

- Using an allow list: when input is sent to the server, this input is compared to a list of safe inputs or characters. If the input is marked as safe, then it is processed. Otherwise, it is rejected, and the application throws an error.

- Stripping input: If the input contains dangerous characters, these are removed before processing.

## COMMAND INJECTION

Command Injection occurs when server-side code (like PHP) in a web application makes a call to a function that interacts with the server's console directly. 

MooCorp has started developing a web-based application for cow ASCII art with customisable text

- `http:/x.x.x.x:84`

```{PHP}
<?php
    if (isset($_GET["mooing"])) {
        $mooing = $_GET["mooing"];
        $cow = 'default';

        if(isset($_GET["cow"]))
            $cow = $_GET["cow"];
        
        passthru("perl /usr/bin/cowsay -f $cow $mooing");
    }
?>
```

The passthru function simply executes a command in the operating system's console and sends the output back to the user's browser.

text input: `$(whoami)`, `$(id)`, `$(ifconfig)`, `$(uname -a)`, `$(ps -ef)`

- `$( cat /etc/passwd)`
- `$( cat /etc/alpine-release)`

## Insecure login 

the whole application (or a part of it) is flawed from the start

password reset example:

- ROYGBIV (Red, Orange, Yellow, Green, Blue, Indigo, and Violet) is a safe place to start

- green

```
password reset
joseph:t9yqICzMjANHB3
```

- flag: `THM{Not_3ven_c4tz_c0uld_sav3_U!}`

## Secuirty Misconfiguration 

security could have been appropriately configured but was not. Even if you download the latest up-to-date software, poor configurations could make your installation vulnerable.

Security misconfigurations include:

- Poorly configured permissions on cloud services, like S3 buckets.
- Having unnecessary features enabled, like services, pages, accounts or privileges.
- Default accounts with unchanged passwords.
- Error messages that are overly detailed and allow attackers to find out more about the system.
- Not using HTTP security headers.

### Debugging Interfaces

A common security misconfiguration concerns the exposure of debugging features in production software

Attackers could abuse some of those debug functionalities if somehow, the developers forgot to disable them before publishing their applications.

- `http:/x.x.x.x:86`
- `http:/x.x.x.x:86/console`  /console is part of a Python programe Werkzeug

python console is shown
- `import os; print(os.popen("ls-l").read())`

- database file: `todo.db`

- get the contents of `app.py`, `import os; print(os.popen("cat app.py").read())`

- flag: `THM{Just_a_tiny_misconfiguration}`

## Vulnerable and Outdated Components

let's say that a company hasn't updated their version of WordPress for a few years, and using a tool such as WPScan, you find that it's version 4.6.

WordPress 4.6 is vulnerable to an unauthenticated remote code execution(RCE) exploit
you can find an exploit already made on [Exploit-DB](https://www.exploit-db.com/exploits/41962)

Example:

web server: nostromo 1.9.6
Exploit-db: nostromo 1.9.6 > download script 47837.py

```
terminal: python 47837.py
          cve2019_16278.py

          python2 47837.py 127.0.0.1 80 id
```

It is also worth noting that it may not always be this easy. Sometimes you will just be given a version number, like in this case, but other times you may need to dig through the HTML source or even take a lucky guess on an exploit script. But realistically, if it is a known vulnerability, there's probably a way to discover what version the application is running.

- `http:/x.x.x.x:84`
- look for bookstore exploit

## ID and Auth failures

Authentication and session management constitute core components of modern web applications. Authentication allows users to gain access to web applications by verifying their identities

The most common form of authentication is using a username and password mechanism.

The server would then provide the users' browser with a session cookie if they are correct

A session cookie is needed because web servers use HTTP(S) to communicate, which is stateless. Attaching session cookies means the server will know who is sending what data. The server can then keep track of users' actions. 

Some common flaws in authentication mechanisms include the following:

- Brute force attacks: If a web application uses usernames and passwords, an attacker can try to launch brute force attacks that allow them to guess the username and passwords using multiple authentication attempts. 
- weak credentials
- weak session cookies: Session cookies are how the server keeps track of users. If session cookies contain predictable values, attackers can set their own session cookies and access users' accounts. 

## DEFENCE

- avoid password-guessing attacks, ensure the application enforces a strong password policy. 
-  avoid brute force attacks, ensure that the application enforces an automatic lockout after a certain number of attempts.
-  Implement Multi-Factor Authentication. 

developers forget to sanitise the input(username & password) given by the user in the code of their application

- username: darren then try " darren" == success
- password: pass123

- flag: `fe86079416a21a3c99937fea8874b667`

- do again for arthur, flag: `d9ac0f7db4fda460ac3edeb75d75e16e`

## Software & Data integrity failures

Integrity is essential in cybersecurity as we care about maintaining important data free from unwanted or malicious modifications

a file download, check its integrity with hashes

1. download WinSCP-5.21.5-Setup.exe , hashes next to download button
2. terminal: `md5sum WinSCP-5.21.5-Setup.exe`
3. compare the hashes

website has import of jquery, hacker hacks into official jQuery repo and changes contents to inject code, now the website is malicious

Modern browsers allow you to specify a hash along the library's URL so that the library code is executed only if the hash of the downloaded file matches the expected value. This security mechanism is called Subresource Integrity (SRI),

- https://www.srihash.org/

- proper way to import library

```{HTML}
<script src="https://code.jquery.com/jquery-3.6.1.min.js" 
  integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous">
</script>
```

flag: sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=

## COOKIES

Cookies are key-value pairs that a web application will store on the user's browser and that will be automatically repeated on each request to the website that issued them.

JSON Web Tokens (JWT).

JWTs are very simple tokens that allow you to store key-value pairs on a token that provides integrity as part of the token.

```{}
[header]          [payload]               [signature]
{                 {                       sljjuajnlaxjs^$2ń....
  "typ":"JWT",      "username":"guest",     
  "alg":"HS256"     "exp":16868686
}                 }
```

JWT implements a signature to validate the integrity of the payload data. The vulnerable libraries allowed attackers to bypass the signature validation by changing the two following things in a JWT:

- modify the headers, 'alg' set to none
- remove signature part

```
[header]        [payload]
{               {
  "typ":"JWT",    "username":"admin",
  "alg":"none"    ""exp": 76798687
}               }
```

- `x.x.x.x:8089`
- guest:guest 
- developer tools > storage > cookies > http:

- now modify the JWT to make you admin

- copy the Value (doubel click, copy and paste in nano)

- https://appdevtools.com/base64-encoder-decoder  decode

```
Header
--string--
{"typ":"JWT","alg":"HS256}
Payload
--string--
{"username":"admin", "exp":1}
```

