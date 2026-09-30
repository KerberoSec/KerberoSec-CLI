# TryHackMe: TakeOver
<p align="center">
  
  <br>
  Room link : https://tryhackme.com/room/takeover<br>
  Difficulty : Easy<br>
  My Time : 40 min<br>
</p>

## Summary

- [1. Innitial Environment Setup](#1-Innitial-Environment-Setup)
- [2. Connectivity Check](#2-Connectivity-Check)
- [3. Web Exploration & Rabbit-Hole](#3-Web-Exploration-&-Rabbit-Hole)
- [4. Fuzzing for Subdomains](#4-Fuzzing-for-Subdomains)
- [5. SSL Certificate Inspection](#5-SSL-Certificate-Inspection)
- [6. Capturing the flag](#6-Capturing-the-flag)
- [7. Conclusion](#7-Conclusion)

## 1. Innitial Environment Setup

At first I mapped the target IP addres to the domain futurevera.thm within my /etc/hosts
<pre>
┌──(exequze㉿kalimach)-[~]
└─$ sudo bash -c 'echo "10.80.182.83    futurevera.thm" >> /etc/hosts'  
</pre>

Alternatively you can do sudo -s and then just the echo command.

## 2. Connectivity Check

I started with a simple ping to confirm the host was alive, followed by a standard Nmap scan

<pre>
┌──(exequze㉿kalimach)-[~]
└─$ ping 10.80.182.83
PING 10.80.182.83 (10.80.182.83) 56(84) bytes of data.
64 bytes from 10.80.182.83: icmp_seq=1 ttl=62 time=45.4 ms
64 bytes from 10.80.182.83: icmp_seq=3 ttl=62 time=43.6 ms
^C
--- 10.80.182.83 ping statistics ---
3 packets transmitted, 2 received, 33.3333% packet loss, time 2093ms
rtt min/avg/max/mdev = 43.626/44.488/45.351/0.862 ms
</pre>
33,3% packet loss, because I am too impatient and hit Ctrl + C.

<pre>
┌──(exequze㉿kalimach)-[~]
└─$ nmap 10.80.182.83
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-17 07:30 +0100
Nmap scan report for 10.80.182.83
Host is up (0.048s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

Nmap done: 1 IP address (1 host up) scanned in 2.77 seconds
</pre>
As we can see, Ports 22, 80 and 443 are open.

## 3. Web Exploration & Rabbit-Hole

I initially explored the main website and dove deep into the source code. I'll admit: I got pretty lost there. After realizing the source code wasn't giving up any secrets, I remembered the description of the task "This challenge revolves around subdomain enumeration." So well I did that.

## 4. Fuzzing for Subdomains 

I used ffuf to look for virtual hosts (At this point I looked at a writeup to see how to properly do subdomain enumeration). My first pass was over HTTP:
<pre>
┌──(exequze㉿kalimach)-[~]
└─$ ffuf -u http://10.80.182.83 -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -H "Host: FUZZ.futurevera.thm" -fs 0

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 : Method           : GET
 : URL              : http://10.80.182.83
 : Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt
 : Header           : Host: FUZZ.futurevera.thm
 : Follow redirects : false
 : Calibration      : false
 : Timeout          : 10
 : Threads          : 40
 : Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 : Filter           : Response size: 0
________________________________________________

portal                  [Status: 200, Size: 69, Words: 9, Lines: 2, Duration: 45ms]
Portal                  [Status: 200, Size: 69, Words: 9, Lines: 2, Duration: 48ms]
payroll                 [Status: 200, Size: 70, Words: 9, Lines: 2, Duration: 52ms]
PORTAL                  [Status: 200, Size: 69, Words: 9, Lines: 2, Duration: 46ms]
: Progress: [63088/63088] : Job [1/1] : 536 req/sec : Duration: [0:01:22] : Errors: 0 : 
</pre>

Results: Found portal and payroll, but after a quick look, they didn't seem to lead anywhere interesting.

Since port 443 was open, I ran ffuf again, this time targeting HTTPS. 
<pre>
┌──(exequze㉿kalimach)-[~]
└─$ ffuf -u https://10.80.182.83 -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -H "Host: FUZZ.futurevera.thm" -fs 4605 
        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 : Method           : GET
 : URL              : https://10.80.182.83
 : Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt
 : Header           : Host: FUZZ.futurevera.thm
 : Follow redirects : false
 : Calibration      : false
 : Timeout          : 10
 : Threads          : 40
 : Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 : Filter           : Response size: 4605
________________________________________________

blog                    [Status: 200, Size: 3838, Words: 1326, Lines: 81, Duration: 43ms]
support                 [Status: 200, Size: 1522, Words: 367, Lines: 34, Duration: 43ms]
Blog                    [Status: 200, Size: 3838, Words: 1326, Lines: 81, Duration: 45ms]
Support                 [Status: 200, Size: 1522, Words: 367, Lines: 34, Duration: 45ms]
SUPPORT                 [Status: 200, Size: 1522, Words: 367, Lines: 34, Duration: 46ms]
BLOG                    [Status: 200, Size: 3838, Words: 1326, Lines: 81, Duration: 46ms]
: Progress: [63088/63088] : Job [1/1] : 671 req/sec : Duration: [0:01:19] : Errors: 0 : 
</pre>
This result is from the second time running, because I filtered out the default response size only on the second one. 

## 5. SSL Certificate Inspection 

After adding blog.futurevera.thm and support.futurevera.thm to /etc/hosts, the blog turned out to be another dead end. However, I decided to check the SSL for the support site. There I found:
<pre>
Subject Alt Names
DNS Name	secretxxxxxxxxxxxxxx.support.futurevera.thm
</pre>

## 6. Capturing the flag

I added this long subdomain to my /etc/hosts file and navigated to it via Web. The server immediately redirected me to an external AWS S3 bucktet URL.
<pre>
https://flag{********************************}.s3-website-us-west-3.amazonaws.com/
</pre>

## 7. ConclusionEnvironment

This was my first CTF and it was very interesting, took longer then expected but helped me a lot. 

