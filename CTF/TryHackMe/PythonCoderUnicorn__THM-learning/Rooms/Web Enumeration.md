- https://tryhackme.com/room/webenumerationv2

#Enumeration  #Nikto #Gobuster #WPscan 

## Manual Enumeration

- webpage source code
- finding assets
- comments

## Gobuster 

```
sudo apt install gobuster

-t  --threads   concurrent threads, default is 10,  -t 64  (faster)
-v  --verbose
-z  --no-progress
-q  --quiet     don't print banner
-o  --output    write to file
```

### dir mode 

 Often, directory structures of websites and web-apps follow a certain convention, making them susceptible to brute-forcing using wordlists. At the end of this room, you'll run Gobuster on _[Blog](https://tryhackme.com/room/blog)_ which uses WordPress, a very common _Content Management System_ (CMS). WordPress uses a very specific directory structure for its websites.

enumerate website directories 

```
ip='x.x.x.x'

gobuster dir -w http://$ip  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

Apache on Linux:   /var/www/html

http://$p/products
```

other flags
```
-c  --cookies             cookies to use for requests
-x  --extensions          file extensions to search for
-H  --headers             HTTP headers -H 'Header1:value'
-k  --no-tls-validation   skip TLS verification
-n  --no-status           don't print status codes
-P  --password            password for basic auth
-s  --status-codes        positive status codes
-b                        negative status codes
-U  --username            username for basic auth
```

```
gobuster dir -u http://$ip/folder  -w
/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 
-x .html,.css,.js
```

> [!info] If  HTTPS is enabled you will see an error "Your connection is not private" "expired.badssl.com" . Solution: use the `-k` flag

### dns mode 

Gobuster to brute-force subdomains. During a penetration test (or <span style="color:#a0f958">capture the flag</span>), it's important to check sub-domains of your target's top domain. Just because something is patched in the regular domain, does not mean it is patched in the sub-domain. There may be a vulnerability for you to exploit in one of these sub-domains.

```
gobuster dns -d website.com -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```

other flags
```
-c  --show-cname     shows CNAME records
-i  --show-ips       show IP addresses
-r  --resolver       use custom DNS server server.com or server.com:port
```

### vhost mode

Virtual hosts are different websites on the same machine. In some instances, they can appear to look like sub-domains, but don't be deceived! Virtual Hosts are IP based and are running on the same server. This is not usually apparent to the end-user. On an engagement, it may be worthwhile to just run Gobuster in this mode to see if it comes up with anything. 

You never know, it might just find something! While participating in rooms on TryHackMe, virtual hosts would be a good way to hide a completely different website if nothing turned up on your main port 80/443 scan.

```
gobuster vhost -u http://example.com -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```

### Wordlists

Kali Linux default lists

```
- /usr/share/wordlists/dirbuster/directory-list-2.3-*.txt
- /usr/share/wordlists/dirbuster/directory-list-1.0.txt
- /usr/share/wordlists/dirb/big.txt
- /usr/share/wordlists/dirb/common.txt
- /usr/share/wordlists/dirb/small.txt
- /usr/share/wordlists/dirb/extensions_common.txt - Useful for when fuzzing for files!
```

non-standard lists
- `sudo apt install seclists` 

### Practice Gobuster

```
echo "IP webenum.thm" >> /etc/hosts
echo "IP mysubdomain.webenum.thm" >> /etc/hosts

gobuster dir -u http://$ip -w ~/Tools/wordlists/dirbuster/directory-list-2.3-medium.txt -k

gobuster dir -u http://$ip/Changes -w ~/Tools/wordlists/dirbuster/directory-list-2.3-medium.txt -x html,js,conf,txt,php -t 64
```

```
Run a directory scan on the host. Other than the standard css, images and js directories, what other directories are available?
           
/public                            
/Changes              
/VIDEO   

Run a directory scan on the host. In the "Changes" directory, what file extensions exist?

/changes.conf
/bootstrap.js

There's a flag out there that can be found by directory scanning! Find it!

scan /VIDEO/
/flag.php

/VIDEO/flag.php
thm{n1c3_w0rk}

There are some virtual hosts running on this server. What are they?

gobuster vhost -u http://webenum.thm -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt 

--- returns
learning.webenum.thm
products.webenum.thm

http://products.webenum.thm/flag.txt

thm{gobuster_is_fun}
```

## WPScan

The WPScan framework is capable of enumerating & researching a few security vulnerability categories present in WordPress sites: including: but not limited to:

- Sensitive Information Disclosure (Plugin & Theme installation versions for disclosed vulnerabilities or CVE's)
- Path Discovery (Looking for misconfigured file permissions i.e. wp-config.php)
- Weak Password Policies (Password bruteforcing)
- Presence of Default Installation (Looking for default files)
- Testing Web Application Firewalls (Common WAF plugins)

```
sudo apt install wpscan
wpscan --update
```

### enumerating for installed themes

- WPScan has a few methods of determining the active theme on a running WordPress installation.

```
# plug-ins
wpscan --url http://cnmatics.playground/ --enumerate p

# users
wpscan --url http://cmnatics.playground/ --enumerate u

# vuln plugins
wpscan --url http://cmnatics.playground/ --enumerate vp

# password attack
wpscan : -url http://cmnatics.playground : -passwords rockyou.txt : -usernames cmnatic
```

```
What would be the full URL for the theme "twentynineteen" installed on the WordPress site: "http://cmnatics.playground"

http://cmnatics.playground/wp-content/themes/twentynineteen 

What argument would we provide to enumerate a WordPress site?

enumerate

What is the name of the other aggressiveness profile that we can use in our WPScan command? This is more likely to bypass a Web Application Firewall (WAF)

--plugins-detection aggressive | passive
- passive

---

` echo "10.10.106.248 wpscan.thm" >> /etc/hosts `

`wpscan --url http://wpscan.thm --enumerate t`

  
Enumerate the site, what is the name of the theme that is detected as running?
- `twentynineteen` 
- version 2.0 (out of date)

Enumerate the site, what is the name of the plugin that WPScan has found?
- hint= You may have to use different aggressive profiles!
- ` wpscan --url http://wpscan.thm --enumerate p`
- `nextgen-gallery`

Enumerate the site, what username can WPScan find?
- ` wpscan --url http://wpscan.thm --enumerate u `
- ` Phreakazoid `

  
Construct a WPScan command to brute-force the site with this username, using the `rockyou` wordlist as the password list. What is the password to this user?

- hint= If this password attack takes longer than 5 minutes, you are using the wrong username / password list or URL.

- ` wpscan --url http://wpscan.thm --passwords /usr/share/wordlists/rockyou.txt --usernames Phreakazoid `
- `linkinpark`

## Nikto 

Nikto is capable of performing an assessment on all types of webservers (and isn't application-specific such as WPScan.). Nikto can be used to discover possible vulnerabilities including:

- Sensitive files
- Outdated servers and programs (i.e. [vulnerable web server installs](https://httpd.apache.org/security/vulnerabilities_24.html))
- Common server and software misconfigurations (Directory indexing, cgi scripts, x-ss protections)

comes pre-installed on  Kali Linux and Parrot
- ` sudo apt update && sudo apt install nikto `

basic scanning 
- get headers, files, directories
- `nikto -h vuln_ip`
- shows Apache Tomcat is used `/examples/servlets/index.html` 
- shows HTTP PUT and DELETE can be used

scan multiple ports
- `nikto -h x.x.x.x -p 80,8000,8080`

plugins
- ` --list-plugins` 
- ` nikto -h x.x.x.x -Plugin apacheuser | cgi | robots | dir_traversal`

Verbose `-Display 1 | 2 | E (errors only)`

Vuln searching
- ` -Tuning <value> `
- 
```
file upload        0  search for upload file on web server (rev shell)
misconfig file     2  search common files on web server (sensitive info)
info disclosure    3  gather info on web server/app or any info
injection          4  search for possible XSS or HTML injections
command exec       8  search for anything allows OS command execution
SQL injection      9  look for app urls vuln to SQLi

```

saving your findings `-Output -f `
- text file
- HTML report
- ` nikto -h http://x.x.x.x -o report.html`

`-p 80,8080`
`-display 2` to show all cookies 

---

  
What is the name & version of the web server that  Nikto has determined running on **port 80?**
- hint= Provide the full answer from the output
-  ` nikto -h 10.10.5.243 -p 80 `
- ` apache/2.4.7`

There is another web server running on another port. What is the name & version of this web server?
- hint= Ensure you have waited 5 minutes for the Instance to fully deploy
- ` nikto -h 10.10.5.243 -p 80,8000,8080 `
- ` Apache-Coyote/1.1 `

What is the name of the Cookie that this JBoss server gives?
- hint= You may have to play around with how Nikto outputs the scan results to you! The answer is looking for the name of the cookie: not the value
- `JSESSIONID`

---
- https://arth0s.medium.com/tryhackme-web-enumeration-write-up-cf60aca9e80c
- 

