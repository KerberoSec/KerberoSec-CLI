- https://tryhackme.com/room/ffuf

#Enumeration 

Kali & Parrot have ffuf installed , same with SecLists

## Basics

`ffuf -h`
- `-u` url
- `-w` wordlist
- `FUZZ` where wordlists entries will be injected
- `-c`
- `-v`

`ffuf -u http://10.10.176.46/FUZZ -w /usr/share/seclists/Discovery/Web-Content/big.txt `

AttackBox
- ` ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/big.txt -c -v`

Status 200 = `/favicon.ico` and `/robots.txt`

## Finding pages & directories 

One approach you could take would be to start enumerating with a generic list of files such as raft-medium-files-lowercase.txt.

AttackBox
- - ` ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-files-lowercase.txt -c -v`
- not efficient 

assume that `index.<extension>` is the default on most websites
- 39 index extensions in the file `SecLists/Discovery/Web-Content/web-extensions.txt`

1.
` ffuf -u http://10.10.176.46/indexFUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-files-lowercase.txt -c -v   `

2.
` ffuf -u http://10.10.176.46/indexFUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/web-extensions.txt -c -v  `

3.
`ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -e .php, .txt `

What text file did you find?
- robots.txt

What two file extensions were found for the index page?
- php, phps

What page has a size of 4840?
- about.php

How many directories are there?
- look for Status 200
- 4

## using filters

HTTP status code 403 = forbidden response
filter this out with `-fc 403`

` ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-files-lowercase.txt -fc 403  -v -c `

just match and print out status 200s

`ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-files-lowercase.txt -mc 200 -v -c `

match status 500 for internal server requests

filter out 0 file sizes `-fs 0`

RegEx to match all files that start with . 
` ffuf -u http://10.10.176.46/FUZZ -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-files-lowercase.txt -fr '/\..*' -c -v `

After applying the `fc` filter, how many results were returned?
- 11

After applying the `mc` filter, how many results were returned?
- 6

Which valuable file would have been hidden if you used `-fc 403` instead of `-fr?`
- `wp-forum.phps`

## Fuzzing parameters

fuzzing: ` http://10.10.139.14/sqli-labs/Less-1/ `

What would you do when you find a page or API endpoint but don't know which parameters are accepted? You fuzz!

Discovering a vulnerable parameter could lead to file inclusion, path disclosure, XSS, SQL injection, or even command injection. Since ffuf allows you to put the keyword anywhere we can use it to fuzz for parameters.

1.
```
ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?FUZZ=1' -c -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/burp-parameter-names.txt -fw 39

ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?FUZZ=1' -c -w ~/Tools/wordlists/SecLists/Discovery/Web-Content/raft-medium-words-lowercase.txt -fw 39
```

2. 5 different ways to generate numbers 0-255 `-w-` 
```
ruby -e '(0..255).each{|i| puts i}' | ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?id=FUZZ' -c -w - -fw 33

ruby -e 'puts (0..255).to_a' | ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?id=FUZZ' -c -w - -fw 33

for i in {0..255}; do echo $i; done | ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?id=FUZZ' -c -w - -fw 33

seq 0 255 | ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?id=FUZZ' -c -w - -fw 33

cook '[0-255]' | ffuf -u 'http://10.10.139.14/sqli-labs/Less-1/?id=FUZZ' -c -w - -fw 33
```

brute force passwords on authentication page

```
ffuf -u http://10.10.139.14/sqli-labs/Less-11/ -c -w /usr/share/seclists/Passwords/Leaked-Databases/hak5.txt -X POST -d 'uname=Dummy&passwd=FUZZ&submit=Submit' -fs 1435 -H 'Content-Type: application/x-www-form-urlencoded'
```
- POST method `-X` data `-d` FUZZ is in place of password
- headers are also specified

` ~/Tools/wordlists/SecLists/Discovery/Web-Content/ `

## finding vhosts & subdomains

ffuf may not be as efficient as specialized tools when it comes to subdomain enumeration but it's possible to do.

```
ffuf -u http://FUZZ.mydomain.com -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

Some subdomains might not be resolvable by the DNS server you're using and are only resolvable from within the target's local network by their private DNS servers. So some virtual hosts (vhosts) may exist with private subdomains so the previous command doesn't find them. To try finding private subdomains we'll have to use the Host HTTP header as these requests might be accepted by the web server.  
**Note**: [virtual hosts](https://httpd.apache.org/docs/2.4/en/vhosts/examples.html) (vhosts) is the name used by Apache httpd but for Nginx the right term is [Server Blocks](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/).

```
ffuf -u http://FUZZ.mydomain.com -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0  

ffuf -u http://mydomain.com -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H 'Host: FUZZ.mydomain.com' -fs 0
```
For example, it is possible that you can't find a sub-domain with direct subdomain enumeration (1st command) but that you can find it with vhost enumeration (2nd command).

## proxifying ffuf traffic

Whether it' for [network pivoting](https://blog.raw.pm/en/state-of-the-art-of-network-pivoting-in-2019/) or for using BurpSuite plugins you can send all the ffuf traffic through a web proxy (HTTP or SOCKS5).

```
ffuf -u http://10.10.83.118/ -c -w /usr/share/seclists/Discovery/Web-Content/common.txt -x http://127.0.0.1:8080
```

It's also possible to send only matches to your proxy for replaying:
```
ffuf -u http://10.10.83.118/ -c -w /usr/share/seclists/Discovery/Web-Content/common.txt -replay-proxy http://127.0.0.1:8080
```

## options

---
- https://nehrunayak.medium.com/tryhackme-ffuf-194871e2e247

