# Boiler CTF

Ports:

21/tcp FTP vsftpd v3.0.3
80/tcp HTTP Apache httpd v2.4.18
10000/tcp HTTP MiniServ 1.930 Webmin
55007/tcp SSH OpenSSH 7.2p2 4ubuntu2.8

OS:

likely Ubuntu

Notes:

- Use multiple wordlists when enumerating directories!! `dirb/common`!!

### Enumeration

**FTP**

Contains a hidden file `.info.txt` -> Caesar cipher troll

**joomla v 3.9.12**

`/_files ` contains a string `VjJodmNITnBaU0JrWVdsemVRbz0K` -> base64 troll

`/_test` contains a vulnerable extension called sar2html which is vulnearble to RCE

### Exploitaition

exploit sar2html with [plot RCE](https://www.exploit-db.com/exploits/49344)

credentials found in log.txt

credentials found in backup.sh

linpeas shows SUID bit set on find allowing privesc to root access
