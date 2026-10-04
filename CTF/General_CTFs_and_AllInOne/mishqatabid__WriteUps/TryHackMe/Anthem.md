```
Machine: Anthem
Platform: TryHackMe
Difficulty: Easy
```

## WALKTHROUGH:
The machine can be found [here](https://tryhackme.com/r/room/anthem)

### Web Analysis:
Let start with the Nmap Vulnerability Scan using following command `sudo nmap -sV -sC -vv --script vuln $IP`.

```console
┌──(kali㉿kali)-[~]
└─$ nmap -sV -vv --script vuln 10.10.117.31
Starting Nmap 7.94 ( https://nmap.org ) at 2024-07-06 12:58 EDT
NSE: Loaded 150 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 12:58
Completed NSE at 12:58, 10.02s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 12:58
Completed NSE at 12:58, 0.00s elapsed
Initiating Ping Scan at 12:58
Scanning 10.10.117.31 [2 ports]
Completed Ping Scan at 12:58, 0.41s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 12:58
Completed Parallel DNS resolution of 1 host. at 12:58, 0.00s elapsed
Initiating Connect Scan at 12:58
Scanning 10.10.117.31 [1000 ports]
Discovered open port 3389/tcp on 10.10.117.31
Discovered open port 80/tcp on 10.10.117.31
Completed Connect Scan at 12:58, 22.50s elapsed (1000 total ports)
Initiating Service scan at 12:58
Scanning 2 services on 10.10.117.31
Completed Service scan at 12:58, 8.92s elapsed (2 services on 1 host)
NSE: Script scanning 10.10.117.31.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 12:58
NSE: [firewall-bypass 10.10.117.31] lacks privileges.
NSE Timing: About 97.44% done; ETC: 12:59 (0:00:01 remaining)
NSE Timing: About 98.17% done; ETC: 13:00 (0:00:01 remaining)
NSE Timing: About 98.53% done; ETC: 13:00 (0:00:01 remaining)
NSE Timing: About 98.53% done; ETC: 13:01 (0:00:02 remaining)
NSE Timing: About 99.63% done; ETC: 13:01 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:02 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:02 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:03 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:03 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:04 (0:00:01 remaining)
NSE Timing: About 99.63% done; ETC: 13:04 (0:00:01 remaining)
Completed NSE at 13:04, 341.16s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 13:04
NSE: [tls-ticketbleed 10.10.117.31:3389] Not running due to lack of privileges.
Completed NSE at 13:04, 15.41s elapsed
Nmap scan report for 10.10.117.31
Host is up, received syn-ack (0.45s latency).
Scanned at 2024-07-06 12:58:27 EDT for 388s
Not shown: 998 filtered tcp ports (no-response)
PORT     STATE SERVICE       REASON  VERSION
80/tcp   open  http          syn-ack Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-litespeed-sourcecode-download: Request with null byte did not work. This web server might not be vulnerable
|_http-jsonp-detection: Couldn't find any JSONP endpoints.
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.117.31
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://10.10.117.31:80/
|     Form id: 
|     Form action: /search
|     
|     Path: http://10.10.117.31:80/categories
|     Form id: 
|     Form action: /search
|     
|     Path: http://10.10.117.31:80/archive/a-cheers-to-our-it-department/
|     Form id: 
|     Form action: /search
|     
|     Path: http://10.10.117.31:80/search
|     Form id: 
|     Form action: /search
|     
|     Path: http://10.10.117.31:80/archive/we-are-hiring/
|     Form id: 
|     Form action: /search
|     
|     Path: http://10.10.117.31:80/tags
|     Form id: 
|_    Form action: /search
|_http-wordpress-users: [Error] Wordpress installation was not found. We couldn't find wp-login.php
| http-enum: 
|   /blog/: Blog
|   /rss/: RSS or Atom feed
|   /robots.txt: Robots file
|   /categories/viewcategory.aspx: MS Sharepoint
|_  /categories/allcategories.aspx: MS Sharepoint
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
3389/tcp open  ms-wbt-server syn-ack Microsoft Terminal Services
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 13:04
Completed NSE at 13:04, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 13:04
Completed NSE at 13:04, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 399.15 seconds
```

The scan gives the answer to 2nd and 3rd questions.
Port 80 is open which shoes that there is a webpage. Upon accessing it, domain is shown in the front. 

![Screenshot 2024-07-07 171237](https://github.com/mishqatabid/WriteUps/assets/145700715/5867b6a4-cac0-44eb-a2bc-c0f006bef302)

_Q. 4: What is a possible password in one of the pages web crawlers check for?_

Analyzing the nmap scan results, we came across a directory of `/robots.txt`

```console
| http-enum: 
|   /blog/: Blog
|   /rss/: RSS or Atom feed
|   /robots.txt: Robots file
|   /categories/viewcategory.aspx: MS Sharepoint
|_  /categories/allcategories.aspx: MS Sharepoint
```

Now Let's access the `robots.txt` from the browser `http://10.10.117.31/robots.txt` 

![1](https://github.com/mishqatabid/WriteUps/assets/145700715/d7c385e6-4c70-4ba2-a34e-b2dcf7b9e84e)

The directory shows the further directories and the `password` at the top i.e. `UmbracoIsTheBest!`

As we saw the `robots.txt`, the CMS used by the website is `umbraco`.

In the website, there are 2 blogs written by user Jane Doe. In second one, there was a poem written. I searched it on Google and came across a nursery rhyme. There, the name was visible that was of Admin.

![5](https://github.com/mishqatabid/WriteUps/assets/145700715/14b12582-88da-4d8a-b3ff-24e0d49ca58b)

In the other article, an email was given. Using its format and the name of the admin, I got to know the email address of admin.

![7](https://github.com/mishqatabid/WriteUps/assets/145700715/4307fa33-b6c5-4f99-b72c-cded73616bf4)

**Admin Email:** `SG@anthem.com`

### Spot the Flags:

I was able to get 3 of  the flags by analyzing the source code of the html pages.

_**Flag 1:**_ `THM{L0L_WH0_US3S_M3T4}`

![2](https://github.com/mishqatabid/WriteUps/assets/145700715/25af384b-8d8d-41df-9ff2-ed31ac1e49ed)

_**Flag2:**_ `THM{G!T_G00D}`

![4](https://github.com/mishqatabid/WriteUps/assets/145700715/eea5c484-8288-4160-aedd-05f54a5eb0c5)

_**Flag 4:**_ `THM{AN0TH3R_M3TA}`

![3](https://github.com/mishqatabid/WriteUps/assets/145700715/13940687-11e9-40fc-9df3-dd56d4bbe3f5)

Now to find the final flag, I opened the profile of the author of the blog. The flag was written on that page.

_**Flag 3:**_ `THM{L0L_WH0_D15}`

![6](https://github.com/mishqatabid/WriteUps/assets/145700715/cb1fb366-a0fa-4e72-8104-a4c4e72817cf)

### Final Stage:

Now let's get into the box using the information that I have collected. I accessed the windows with SG as user using rdesktop command. Then provided password found earlier.

```console
rdesktop $IP
```

**User:** SG
**Password:** UmbracoIsTheBest!

![9](https://github.com/mishqatabid/WriteUps/assets/145700715/08fa756a-845a-4ce5-bd69-7ab46ae7233f)

There is a `user.txt` present. Upon opening it we get the flag.

**User Flag:** `THM{N00T_NO0T}`

For admin password, I changed the view setting to display `hidden files/directories`, and it displayed the `backup folder` that contains `restore.txt` but it requires privelege access to open. So. I changed the security permissions and gave read & write access, and got the password.

![8](https://github.com/mishqatabid/WriteUps/assets/145700715/acc46e15-1224-4233-a598-927a85236bcc)

**Admin Password:** `ChangeMeBaby1MoreTime`

Now login into to windows using the admin password.

![10](https://github.com/mishqatabid/WriteUps/assets/145700715/614c03bb-563f-4041-b281-0e435ff072a6)

After escalating privileges, I got the `root.txt` file and retrieved the final flag.

![11](https://github.com/mishqatabid/WriteUps/assets/145700715/3a8a66c1-d0db-4da1-9912-f8381d6ee126)

**Root Flag:** `THM{Y0U_4R3_1337}`

---
## Happy Hacking ;)
---

