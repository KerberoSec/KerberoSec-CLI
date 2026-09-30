### Room: Blue
### URL: https://tryhackme.com/r/room/blue
### Type: Windows, RCE, SMB, MS17-010 (EternalBlue)

**Overview**
Blue is an easy difficulty CTF challenge on TryHackMe. The answer is literally right there in it's name, BLUE a.k.a EternalBlue. EternalBlue is a very popular exploit allows attacker to run arbitrary code on remote machine targetting SMB service running on port 445. When exploited, EternalBlue gives command shell that can be converted into meterpreter shell.

**Reconnaissance**

* Remember this machine doesn't reply icmp echos, so ping is useless.

* Running Nmap scan

I used the following Nmap command to perform an initial scan on the target machine, we found out that port 135, 139, 445 is open:
    
``` bash
nmap ip-add
```
    We conclude:
    1. It's a windows machine.
    2. SMB is running.

    So let's confirm shall we?

![Nmap Scan Output 1](https://i.imgur.com/yT2DbUT.png)

Followed by a service version detection (-sV) and runnig default script (-sC) on the target machine. In the scan, we found that indeed smb is running. Also 3389 is open, so rdp (leaks out so interesting info)

``` bash
nmap -Pn -sC -sV ip-add
```

![Nmap Scan Output 2_1](https://i.imgur.com/uYWm8un.png)

![Nmap Scan Output 2_2](https://i.imgur.com/xlq2yIO.png)

Now, we need to find if the smb version running is vunerable to EternalBlue. For that, I run an nmap script `smb-vuln-ms17-010` on port 445.

``` bash
nmap -Pn -p445 --script smb-vuln-ms17-010
```
Initial recon complete!

![Nmap Scan Output 3](https://i.imgur.com/KbmV5Rk.png)

**Exploitation**

* Exploiting ms17-010, we are goinng to use metasploit for this.

    Open metasploit.
    
    ```bash
    msfconsole

    ```

    Seach for ms17-010 and use explit `ms17_010_eternalblue`.

    ```bash
    search ms17-010
    use 0
    ```
![msfconsole](https://i.imgur.com/u6104wN.png)

    This exploit tragets memory of target machine and works on quite low level. So, due to nature of this exploit, executing this can result in system crashes. Example shown below.

![systemcrash](https://i.imgur.com/7eEUCy9.png)

    Successfully running exploit, you will get command shell, we need to convert it to a meterpreter shell.

![smb_1](https://i.imgur.com/RaOYckE.png) 

* Command shell to meterpreter shell.

    Obtaining a meterpreter shell involves steps. Refer [link](https://infosecwriteups.com/metasploit-upgrade-normal-shell-to-meterpreter-shell-2f09be895646)

![meterpreter](https://i.imgur.com/muE2lbM.png)

* Getting user hash and cracking password (optional, you can skip this step)

    Use hashdump to perform credential dump.

![hashdump](https://i.imgur.com/UvrFXHl.png)

* To crack the password, use john or hashcat. I'm using hashcat.

    ```bash
    hashcat -m 1000 -a 0 hash_file passwd_list
    ```

    `remember to store hash into a text file and download rockyou.txt`

![hashcat_1](https://i.imgur.com/g42vUME.png)

![hashcat_2](https://i.imgur.com/fmY70lb.png)

* Acquiring flags

    To find flags, use meterpreter shell that we acquired.

``` bash
search -f flag1.txt
```

``` bash
cat filenmae
```

![flag3](https://i.imgur.com/tPy9cix.png)

**There you have it!!!!**

