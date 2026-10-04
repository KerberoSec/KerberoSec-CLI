### Room: SimpleCTF
### URL: https://tryhackme.com/r/room/easyctf
### Type: WebApp: FTP_Anon_login, SSH_BruteForce

**Overview**
SimpleCTF is an easy difficulty CTF challenge on TryHackMe. This machine has FTP anonymous login misconfigration that allows attacker to login without ID and password. Exploiting this vulnerability, we can get an FTP shell on the target machine. During the initial exploitation, found a file for user mitch. Then I proceeded to perform SSH bruteforce on user mitch. After gaining access, I performed privilege escalation on an vim.

**Reconnaissance**
* Running Nmap scan

I used the following Nmap command to perform an initial scan on the target machine and found 3 port open, 21, 80, 2222:
    
``` bash
nmap ip-add
```

![Nmap Scan Output 1](https://i.imgur.com/Q8t1Jpb.png)

Then I performed the following command to check what service is running on port 2222. The command performs version detection (-sV) on port number 2222 (-p 2222).

``` bash
nmap -sV -p 2222 ip-add
```

![Nmap Scan Output 2](https://i.imgur.com/zJap6Df.png)

Followed by a service version detection (-sV) and runnig default script (-sC) on the target ports 1- 1000. In the scan, we found that ports 21 and 80 are open. We also found `ftp_anon`: Anonymous login allowed.

``` bash
nmap -Pn -sC -sV -p 1-1000 ip-add
```

![Nmap Scan Output 3](https://i.imgur.com/6iJljzw.png)

**Exploitation**

* FTP Anonymous login

    So, lets login anonymously, shall we??
    
    ```bash
    ftp ip-addr
    ```
![FTP Anon Login](https://i.imgur.com/HK8fIxk.png)

    Ok, we gained an ftp shell but this shell has a bug as wherver I was entering any command it was entering in Passive Mode.

![FTP Error](https://i.imgur.com/8jwkt7B.png)    

    I almost gave up on this trail, but in the end, check youtube.

    I found the resolve to the issue. 

    Enter passive command in the ftp shell.

![FTP Error fix](https://i.imgur.com/5OASiMU.png)   

* FTP shell enumeration

    Roaming the directories in ftp shell, I found a text file ForMitch.txt

![FTP server interaction](https://i.imgur.com/VrORPth.png)

    This text file is very interesting, and give us hints about our further hunt. I'm attaching a screenshot, have a look yourself.

![ForMitch](https://i.imgur.com/Xf3ZfY3.png)

    ForMitch.txt clearly states 
    1. There is a user name mitch.
    2. mitch got a weak passowrd, which means BRUTEFORCE!!!!

* SSH bruteforce

    To bruteforce ssh, I have used ssh_login auxiiary on metasploit.

![SSH_login](https://i.imgur.com/Lnu05eh.png)

![SSH_login_2](https://i.imgur.com/1mv1Nss.png)

![SSH_login_3](https://i.imgur.com/NlzcNEv.png)

SSH login:

``` bash
ssh mitch @ip-add -p 2222
```

![SSH_login_success](https://i.imgur.com/9hujNy8.png)

    And there you have it!!!

    Run find user.txt file command, what this will do is find the user.txt file in / directory and throws all the errors in /dev/null rather than showing on console:

``` bash
find -name user.txt 2>/dev/null
```

![user flag](https://i.imgur.com/w0LUj8c.png)

* Traverse other user in home directory

    To find another user, just traverse back the directory, run ls command and you will have the answer.

``` bash
cd ..
```

``` bash
ls
```

![Another user](https://i.imgur.com/tWHxClG.png)

**Privelage Escalation**

* Let's check for any commands that are allowed to run by sudo ( This is first thing I try while performing privelege escaltion ).

    Run the command:

    ``` bash
    sudo -l
    ```

    We can run vim in sudo mode via mitch, no password required.

![vim_no_pass](https://i.imgur.com/dA1er9x.png)

* Search GTFOBins

    Search for vim and run the command given vim -c ':!/bin/sh'.

    ``` bash
    sudo vim -c ':!/bin/sh'
    ```

![inside root](https://i.imgur.com/Vw3r9Ls.png)

* Find the root.txt

    Run command:

    ```bash 
    find -name root.txt 2>/dev/null
    ```

![final_ans](https://i.imgur.com/vVAHcGb.png)

    

**There you have it!!!!**

