

# Intro Research 

https://tryhackme.com/room/introtoresearch

Without a doubt, the ability to research effectively is the most important quality for a hacker to have. By its very nature, hacking requires a vast knowledge base: because how are you supposed to break into something if you don't know how it works? The thing is: no one knows everything.

As your experience level increases, you will find that the things you're researching scale in their difficulty accordingly; however, in the field of information security, there will never come a point where you don't need to look things up.

the following topics:

• An example of a research question
• Vulnerability Searching tools
• Linux Manual Pages

## Task 2

Let's say you've downloaded a JPEG image from a remote server. You suspect that there's something hidden inside it, but how can you get it out?
How about we start by searching for “hiding things inside images” in Google.
The results show the word "steganography" which is more of what we are after learning. Next we want to search how to extract file from a jpeg using steganography. 

- find a GitHub link for list of tools for Steganography https://0xrick.github.io/lists/stego/

- `sudo apt install steghide` 
- extract embedded data from a file `steghide extract -sf file`

Methodology:

1. start with question
2. search for answer to question
3. parse through answers to get understanding

Question: _In the Burp Suite Program that ships with Kali Linux, what mode would you use to manually send a request (often repeating a captured request numerous times)?_

- hint: Search for "manually send request burp suite"
- repeater

Question: _What hash format are modern Windows login passwords stored in?_

- Search for "hashing algorithm for windows"
- NTLM

Question: _What are automated tasks called in Linux?_

- Search for "automated tasks Linux"
- cron jobs

Question: _What number base could you use as a shorthand for base 2 (binary)?_

- Octal (base 8) is not the correct answer.
- base 16

Question: _If a password hash starts with $6$, what format is it (Unix variant)?_

- ______cry__
- sha512crypt

## Task 3

Often in hacking you'll come across software that might be open to exploitation. For example, Content Management Systems (such as Wordpress, FuelCMS, Ghost, etc) are frequently used to make setting up a website easier, and many of these are vulnerable to various attacks. So where would we look if we wanted to exploit specific software?

The answer to that question lies in websites such as:

- ExploitDB, often actually contains exploits that can be downloaded and used straight out of the box
- NVD
- CVE Mitre

NVD keeps track of CVEs (Common Vulnerabilities and Exposures): whether or not there is an exploit publicly available: so it's a really good place to look if you're researching vulnerabilities in a specific piece of software.

- CVE `CVE-YEAR-ID_NUM`

Kali comes pre-installed with a tool called "searchsploit" which allows you to search ExploitDB from your own machine. This is offline, and works using a downloaded version of the database, meaning that you already have all of the exploits already on your Kali Linux!

1. website, it has software type shown CMS (ex: FuelCMS)
2. search for software on ExploitDB `searchsploit fuel cms`
3. look at the CVE info   (ex: 2018-16763)

_CVE numbers are when discovered (or the year after confirmation)_

Question: _What is the CVE for the 2020 Cross-Site Scripting (XSS) vulnerability found in WPForms?_

- CVE-2020-10385

Question: _There was a Local Privilege Escalation vulnerability found in the Debian version of Apache Tomcat, back in 2016. What's the CVE for this vulnerability?_

- CVE-2016-1240

Question: _What is the very first CVE found in the VLC media player?_

- CVE-2007-0017

Question: _If you wanted to exploit a 2020 buffer overflow in the sudo program, which CVE would you use?_

- CVE-2019-18634

Question: _SCP is a tool used to copy files from one computer to another. What switch would you use to copy an entire directory?_

- man scp
- `-r`

Question: _fdisk is a command used to view and alter the partitioning scheme used on your hard drive. What switch would you use to list the current partitions?_

- man fdisk
- `-l`

Question: _nano is an easy-to-use text editor for Linux. What switch would you use to make a backup when opening a file with nano?_

- man nano
- `-b`

Question: _Netcat is a basic tool used to manually send and receive network requests. What command would you use to start netcat in listen mode, using port 12345?_

- `nc -l -p 12345`
