### Room: Intermediate Nmap
### URL: https://tryhackme.com/r/room/intermediatenmap
### Type: CTF Challenge, Nmap, Netcat, SSH

**Overview**
`Intermediate Nmap` is an easy difficulty CTF challenge on TryHackMe. This machine require nmap, netcat skills to gain the machine login username and password further ssh to capture the flag.

**Reconnaissance**
* Running Nmap scan
    I used the following Nmap command to perform an initial scan on the target machine:
    
    ``` bash
    nmap ip-add
    ```

![Nmap Scan Output_1](https://i.imgur.com/NuGgCyM.png)

    In the above scan, we find that ports 22, 2222, 31337 are open.

Lets dig in deep.

``` bash
    nmap -sC -sV -Pn ip-add
```

    This command skips the ping check (-Pn), performs version detection (-sV), and runs default scripts (-sC) to gather detailed information about open ports and services on the target machine.

    Observations:
    
    1. Port 22 running ssh.
    2. Port 2222 also running ssh (EthernetIp-1).
    3. Port 31337 running Elite service, what is it??

    Port 31337 is running Back Orifice: remote administration tool (often Trojan horse) (unofficial).
    So basically there is already a RAT (Remote Access Trojan running on port 31337)

refer [link](https://www.speedguide.net/port.php?port=31337#:~:text=This%20port%20number%20means%20%22elite,most%20notable%20being%20Back%20Orifice.)

So lets listen using Netcat, shall we???

![Nmap Scan Output_2](https://i.imgur.com/WGjgtE7.png)

**Exploit**

* Netcat 
    Listen on remote machine's port 31337 using netcat command
    
    ``` bash
    nc ip-addr 31337
    ```

![Netcat output](https://i.imgur.com/JT3mKA9.png)

    Ahaaaa! We've username and password to SSH to. Nmap also give us using the default script but this challenge wants us to use netcat, so why not!!

* SSH login:

``` bash
ssh ubuntu @ip-add
```

![SSH_login_success](https://i.imgur.com/uMeBb0t.png)

    And there you have it!!!

    1. The shell was very restricted, it was allowing us to use limited commands.
    2. Manually trying many commands, finally tried cd.. (traversing to parent directlly)
    3. Commands started working, refer screenshot below.

![user flag](https://i.imgur.com/9ZDRyvy.png)

    

**There you have it!!!!**

