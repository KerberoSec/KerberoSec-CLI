---
title: Linux Privilege Escalation
date: 2023-12-27 
categories: [Notes, Linux, Privilege Escalation]
tags: [linux,privilege escalation,manual checks,enumeration,]
comments: false
---

![Linux](https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/b78bf35b-d636-4498-9b11-3f4dcc49741c/d9kviti-c2158834-7da8-4a6d-8f99-919b63451ae6.png/v1/fill/w_1192,h_670,q_70,strp/touchterminal_by_superfahd_d9kviti-pre.jpg){: .center-image }

# Manual Checks

A list of useful commands to perform manual privilege escalation on `Linux` operating system.

## System Information

> OS info

```bash
(cat /proc/version || uname -a ) 2>/dev/null
```

```bash
cat /etc/os-release 2>/dev/null
```

> Path

```bash
echo $PATH
```

> Env info

```bash
(env || set) 2>/dev/null
```

> CPU info

```bash
lscpu
```

> System stats

```bash
(df -h || lsblk)
```

## Kernel Exploit

```bash
cat /proc/version
```

```bash
uname -a
```

```bash
searchsploit "Linux Kernel"
```

## Drives

> Check what is mounted and unmounted

```bash
ls /dev 2>/dev/null | grep -i "sd"
```

```bash
cat /etc/fstab 2>/dev/null | grep -v "^#" | grep -Pv "\W*\#" 2>/dev/null
```

> Check if credentials are in fstab
```bash
grep -E "(user|username|login|pass|password|pw|credentials)[=:]" /etc/fstab /etc/mtab 2>/dev/null
```

## Processes

```bash
ps aux
```

```bash
ps -ef
```

```bash
top -n 1
```

## Network

> Hostname, hosts

```bash
cat /etc/hostname /etc/hosts /etc/resolv.conf
```

> Interfaces

```bash
cat /etc/networks
```

```bash
(ifconfig || ip a)
```

> Neighbours

```bash
(arp -e || arp -a)
```

```bash
(route || ip n)
```

> IPtables rules

```bash
(timeout 1 iptables -L 2>/dev/null; cat /etc/iptables/* | grep -v "^#" | grep -Pv "\W*\#" 2>/dev/null)
```

> Files used by network services

```bash
lsof -i
```

## SUDO and SUID

> Check commands you can execute with sudo

```bash
sudo -l
```

> Find all SUID binaries

```bash
find / -perm -4000 2>/dev/null
```

## Open Ports

```bash
(netstat -punta || ss --ntpu)
```

```bash
(netstat -punta || ss --ntpu) | grep "127.0"
```

## Users

> Info about me

```bash
id || (whoami && groups) 2>/dev/null
```

> List all users

```bash
cat /etc/passwd | cut -d: -f1
```

> List users with console

```bash
cat /etc/passwd | grep "sh$"
```

> List superusers

```bash
awk -F: '($3 == "0") {print}' /etc/passwd
```

> Currently logged users

```bash
w
```

> Login history

```bash
last | tail
```

> Last log of each user

```bash
lastlog
```

> List all users and their groups

```bash
for i in $(cut -d":" -f1 /etc/passwd 2>/dev/null);do id $i;done 2>/dev/null | sort
```

## Password Policy

```bash
grep "^PASS_MAX_DAYS\|^PASS_MIN_DAYS\|^PASS_WARN_AGE\|^ENCRYPT_METHOD" /etc/login.defs
```
