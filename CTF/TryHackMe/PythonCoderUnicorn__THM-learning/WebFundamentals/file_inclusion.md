
# file inclusion 

essential knowledge to exploit file inclusion vulnerabilities, including Local File Inclusion (LFI), Remote File Inclusion (RFI), and directory traversal.

- `protocol` + `domain name` + `file name` + `query ?` + `parameters`

- http:// webapp.thm/  get.php ? file= userCV.pdf

user requests access files from from webserver
user sends HTTP request 

web applications, such as PHP that are poorly written and implemented.
- vulnerabilities is the input validation, in which the user inputs are not sanitized or validated
- When the input is not validated, the user can pass any input to the function, causing the vulnerability.

RISK  
- data leaks
- leaked credentials
- attacker writes file to server
- remote control access 

## LOCAL FILE INCLUSION VULNERABILITY 

PATH TRAVERSAL 
"dot dot slash" attacks
directory traversal, attacker can read OS resources (local files on app)

exploits this vulnerability by manipulating and abusing the web application's URL to locate and access files or directories stored outside the application's root directory

Often poor input validation or filtering is the cause of the vulnerability.

- PHP `file_get_contents` to read the content of a file

- `http://webapp .thm/get_php?file= ../../../etc/passwd` hacker sees the passwd

PHP functions include, `require`, `include_once`, and `require_once` 
often contribute to vulnerable web applications

EN or AR option
```
<?PHP 
	include($_GET["lang"]);
?>
```
- webapp.thm/index.php?lang=EN.php
- webapp.thm/index.php?lang=AR.php

now we input directory path
- webapp.thm/index.php?lang=`/etc/passwd`.php

> return to this module or read it on other platform

## Remote File Inclusion: RFI

Remote File Inclusion (RFI) is a technique to include remote files and into a vulnerable application
improperly sanitizing user input, allowing an attacker to inject an external URL into include function. One requirement for RFI is that the allow_url_fopen option needs to be on.

RISK
- sensitive info disclosure
- cross site scripting
- denial of service 

