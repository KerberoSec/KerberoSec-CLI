# **Responder**

> https://app.hackthebox.com/machines/Responder

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/c8719832-dbf4-46e5-80fa-21d718d955d4" />

## **Table of Contents**

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Web Page](#web-page)
* [Local File Inclusion](#local-file-inclusion)
* [Remote File Inclusion](#remote-file-inclusion)
* [Administrator Access](#administrator-access)
* [Conclusion](#conclusion)

## **About**

Responder was a Windows machine demonstrating Local File Inclusion (LFI) / Remote File Inclusion (RFI). The primary vulnerability involved unsanitized file inclusion parameters that enabled SMB-based NTLMv2 hash capture and allowed Administrator access to the machine.

## **References**

* [Responder](https://github.com/SpiderLabs/Responder)
* [Impacket SMB Server](https://github.com/fortra/impacket/blob/master/examples/smbserver.py)
* [Local File Inclusion: OWASP](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion)
* [Remote File Inclusion: OWASP](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.2-Testing_for_Remote_File_Inclusion)
* [PHP Include Function Documentation](https://www.php.net/manual/en/function.include.php)
* [File Inclusion/Path Traversal: HackTricks](https://book.hacktricks.wiki/en/pentesting-web/file-inclusion/index.html)

## **Reconnaissance**

Nmap scan revealed port 80 (HTTP) and 5985 (WinRM).

<img width="1316" height="390" alt="0" src="https://github.com/user-attachments/assets/8c055f0a-70ae-46cc-aec1-9e28691ce0e5" />

Trying to load the IP address directly on the browser redirected to **unika.htb**. It was added to the local `/etc/hosts` file to resolve the hostname properly.

## **Web Page**

**UNIKA**: *"Excellent web designs, let's make the web beautiful together!"*

The page is built with PHP, Bootstrap, jQuery and animate.css. Mostly static, it features fancy web design, a photo gallery, a contact form and other additional boilerplate information that you typically find on a landing page.

<img width="804" height="435" alt="1" src="https://github.com/user-attachments/assets/be719f18-794f-4975-8876-2273f4bc717c" />

The website also has the feature of changing languages, which they implemented like this: `http://unika.htb/index.php?page=french.html`, `http://unika.htb/index.php?page=german.html` with _index.php_ being the default English one.

## **Local File Inclusion**

At this point it was obvious that the webpage was loading different HTML files with the `?page=` parameter, but could this be vulnerable to File Inclusion?

In this case, yes, there was no sanitization or filtering whatsoever, and it was possible to read local files as evidenced by the screenshot.

<img width="1538" height="600" alt="2" src="https://github.com/user-attachments/assets/d3ecf30d-c0b9-47df-b9bf-f0531830a5b6" />

At first I tested the possibility of RFI using HTTP, trying to make a request to my machine at `http://10.10.14.47:8081/test.html`, but as it failed, it also confirmed to me that the page was indeed using the `include()` function in PHP.

<img width="1424" height="241" alt="3" src="https://github.com/user-attachments/assets/d82b26b6-d077-4822-8f4f-f7d05c29db2f" />

The error message:

**Warning**: _include(): http:// wrapper is disabled in the server configuration by allow_url_include=0 in **C:\xampp\htdocs\index.php** on line 11_

This error indicates that PHP's `allow_url_include` directive is disabled, preventing the `include()` function from loading remote files via HTTP/HTTPS. The server configuration blocks HTTP-based remote file inclusion but still allows local file inclusion. However, SMB-based file inclusion remains possible as it uses the UNC path format rather than HTTP wrappers.

## **Remote File Inclusion**

The next step was to verify that I could trigger an SMB request using this File Inclusion vulnerability.

I created a local `test.html` file and used [impacket-smbserver](https://github.com/fortra/impacket/blob/master/examples/smbserver.py) to spawn an SMB server on my Kali machine and trigger a request to it via the `?page=` parameter.

The web page connected to my SMB server and loaded `test.html` as intended.

<img width="1919" height="827" alt="4" src="https://github.com/user-attachments/assets/00b60eea-68b9-45f9-98a9-5da03d1607da" />

This machine name is a hint to use [Responder](https://github.com/SpiderLabs/Responder) as a way of gaining initial access, but since I was using [impacket-smbserver](https://github.com/fortra/impacket/blob/master/examples/smbserver.py) I could already see the NTLMv2 hash as *unika.htb* reached to my share to load `test.html`.

<img width="1898" height="763" alt="5" src="https://github.com/user-attachments/assets/2d1818fb-b184-492c-96a2-68fab43cf633" />

## **Administrator Access**

The RFI via SMB was critical because it allowed me to capture the NTLMv2 hash for the `Administrator` user. The hash was quickly cracked using the *rockyou.txt* wordlist and the plaintext password was `badminton`.

<img width="887" height="309" alt="6" src="https://github.com/user-attachments/assets/f626679a-2b6f-4950-a506-f5e83f30b510" />

With the obtained credentials I was able to enter the machine with elevated privileges.

I first listed the local users and noticed an *Enabled* user named `mike`, the flag was located under `C:\Users\mike\Desktop\flag.txt`.

<img width="1590" height="633" alt="7" src="https://github.com/user-attachments/assets/22976756-6667-4866-989e-40882bef558e" />

## **Conclusion**

The Responder machine demonstrated a complete attack path from Local File Inclusion to administrative access. The primary vulnerabilities included unsanitized file inclusion parameters enabling both LFI and RFI exploitation, weak password policies allowing rapid hash cracking, and forced SMB authentication leading to credential exposure. The compromise was possible due to inadequate input validation combined with predictable credential choices, emphasizing the importance of proper parameter sanitization and robust authentication mechanisms.
