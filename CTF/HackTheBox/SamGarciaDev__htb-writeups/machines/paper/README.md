## Enumeration

I start off by listing open TCP ports:

```bash
$ nmap -p- --open -sS -n -vvv -Pn paper.htb -oG allPorts

Host: paper.htb ()   Ports: 22/open/tcp//ssh///, 80/open/tcp//http///, 443/open/tcp//https///
```

Just the usual 22 (ssh), 80 (http) and 443 (https) ports. Let's try to list the service and version running on them:

```bash
$ nmap -p22,80,443 -sC -sV paper.htb -oN targeted

PORT    STATE SERVICE  VERSION
| ssh-hostkey: 
|   2048 10:05:ea:50:56:a6:00:cb:1c:9c:93:df:5f:83:e0:64 (RSA)
|   256 58:8c:82:1c:c6:63:2a:83:87:5c:2f:2b:4f:4d:c3:79 (ECDSA)
|_  256 31:78:af:d1:3b:c4:2e:9d:60:4e:eb:5d:03:ec:a0:22 (ED25519)
80/tcp  open  http     Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: HTTP Server Test Page powered by CentOS
443/tcp open  ssl/http Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
|_ssl-date: TLS randomness does not represent time
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
|_http-title: HTTP Server Test Page powered by CentOS
| http-methods: 
|_  Potentially risky methods: TRACE
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=Unspecified/countryName=US
| Subject Alternative Name: DNS:localhost.localdomain
| Not valid before: 2021-07-03T08:52:34
|_Not valid after:  2022-07-08T10:32:34
| tls-alpn: 
|_  http/1.1
```

Nothing that stands out. Visiting the website, I didn't notice anything out of the ordinary, just a CentOS HTTP default page.

Let's try to enumerate some more. I try to list subdirectories, but nothing comes up, apart from **manual**, which isn't of use.

```bash
wfuzz -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -u 'http://paper.htb/FUZZ' --hc 404 -c
```

Next I try to list open UDP ports:

```bash
$ nmap -sU -n -vvv paper.htb -oG udpPorts

PORT     STATE         SERVICE  VERSION
5353/udp open|filtered zeroconf
```

Only port 5353/udp shows up, running a service called **zeroconf** which doesn't seem vulnerable.

Finally, I try to enumerate subdomains, alas, nothing comes up.

```bash
wfuzz -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -u 'http://paper.htb' -H "Host: FUZZ.paper.htb" --hc 403 -c
```

With no more tools in my arsenal, I try inspecting the source code on the HTTP page.

That's when I find the **'X-Backend-Server: office.paper'** header on the response.
If we add that URL to our **/etc/hosts/**, we can access the newly found site on our browser.

