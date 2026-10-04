### Room: RootMe
### URL: https://tryhackme.com/r/room/rrootme
### Type: WebApp: Malicious File upload

**Overview**
RootMe is an easy difficulty CTF challenge on TryHackMe. This machine has a file upload vulnerability that allows users to upload files onto the web server. Exploiting this vulnerability, we can gain a reverse shell on the target machine. During the initial exploitation, I used a reverse shell written in PHP. After gaining access, I performed privilege escalation on an executable Python binary.

**Reconnaissance**
* Running Nmap scan
    I used the following Nmap command to perform an initial scan on the target machine:
    
    ``` bash
    nmap -Pn -sC -sV ip-add
    ```

    This command skips the ping check (-Pn), performs version detection (-sV), and runs default scripts (-sC) to gather detailed information about open ports and services on the target machine.

![Nmap Scan Output](https://i.imgur.com/gpmE5Co.png)

    In the above scan, we find that ports 22 and 80 are open. This indicates that a web application named HackIT is hosted on port 80, running on Apache/2.4.29. The web server is an Ubuntu machine.

* Directory Enumeration
    You can use whatever tool of your arsenel, but the followthrough specied to use gobuster, so I will use gobuster. (will be using dirbuster's medium wordlist)
    
    ``` bash
    gobuster dir -u http://10.10.109.243 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
    ```

![Gobuster Scan Output](https://i.imgur.com/ynnb9ew.png)

    Ahaaaa! We've discovered an /upload directory. The /panel directory also looks promising and warrants further inspection.

* Using curl
    I have performed curl to check what options are enabled on both /uploads and /panel.

    I have nothing suspicous on /uploads but.....

![Curl Output for panel](https://i.imgur.com/quW6OMj.png)

    There is option to upload file on /panel

**Exploitation**

* Upload File

    So, lets upload a php payload onto /panel. The webshell I have choosen is
    
    ```bash
    /usr/share/webshells/php/php-reverse-shell.php
    ```

![Failed payload upload](https://i.imgur.com/n199mPa.png)

    When I tried to upload the webshell, It throws an error. It clearly indicated the Content Security Policy( CSP) is set. 

    The server allowed me to upload a png and jpg extension files but we can't execute them in future.

    I have also tried to upload the files by tricking names but nothing seems to work.

    So, it time we fireup the OG, Burpsuite!!

![BurpSuite scan](https://i.imgur.com/V6CJttP.png)

    Using Burp, we can see the server allows us to upload a .php5 extension file, which we can execute and easily get a reverse shell.

* Prepare webshell

    Now, we know we can upload a webshell with .php5 extension, so lets edit couple of paramters in payload.

![Payload prepration](https://i.imgur.com/sZnX6uK.png)

    In the ip, enter the IP Address of your local machine, to which webshell can call back to and edit the port number you want to listen on to.

* Getting a reverse shell

    Upload the webshell to /panel.

    Run Netcat:

    ``` bash
    nc -nvlp 1234
    ```

    Go to /uploads/ and click onto the uploaded webshell.

![Getting Shell](https://i.imgur.com/Q46nDQ8.png)

    And there you have it!!!

    Run find user.txt file command, what this will do is find the user.txt file in / directory and throws all the errors in /dev/null rather than showing on console:

    ``` bash
    find -name user.txt 2>/dev/null
    ```

**Privelage Escalation**

* Search for Files with SUID permission, which looks weird

    Run the command:

    ``` bash
    find -perm /4000 2>/dev/null
    ```

    what this will do is to seach for files with SUID permission and output all the errors to /dev/null. (Check TryHackMe hint....)

    I found /usr/bin/python as weird file because normal linux system doesnt have it. That means it worth a follow through.

* Search GTFOBins

    Search for python with SUID bin set and run the command given with /usr/bin in front.

![GTFOBins output](https://i.imgur.com/NIbhkOY.png)

* Find the root.txt

    Run command:

    ```bash 
    find -name root.txt 2>/dev/null
    ```

    

**There you have it!!!!**

