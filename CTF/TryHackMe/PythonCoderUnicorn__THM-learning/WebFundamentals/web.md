
# web funadmentals

review web app for security issues

- view source
- inspector
- debugger
- network

`https://x.x.x.x.p.thmlabs.com/`

```
/news
/news/article?id=1
/contact
/customers                redirects to customers/login
/customers/login
/customer/signup
/customers/reset
/customers                dashboard
/customers/ticket/new     textbox & file upload
/customers/account
/customers/logout
```

- flag 1 = look at source code comments  `/new-home-beta`
- flag 2 = check external asset files `https://x.x.x.x.p.thmlabs.com/assets/flag.txt`

- flag: `THM{CHANGE_DEFAULT_CREDENTIALS}`

```
<div class="premium-customer-blocker">
change the CSS value to {display: none}

rapid flash of red on screen, use debugger to investigate
```

- flag: `THM{HEADER_FLAG}`

ways of discovering content on a website
- manually
- automated
- OSINT

The `robots.txt` file is a document that tells search engines which pages they are and aren't allowed to show on their search engine results or ban specific search engines from crawling the website altogether

favicon when not setup provides clue on the framework
- https://wiki.owasp.org/index.php/OWASP_favicon_database

- go to website link
- see a favicon
- in terminal: `curl https://static-labs.tryhackme.cloud/sites/favicon/images/favicon.ico | md5sum`

- `f276b19aabcb4ae8cda4d22625c6735f:cgiirc`

- `sitemay.xml`   file that lists what should be listed on the web

### HTTP headers 

request to web server returns various HTTP headers
can have info on which software and programming language

- `curl http://x.x.x.x -v`

- server: nginx/1.18.0 (ubuntu)

- framework stack
- OSINT google dorks

## OSINT  wappalyzer 

Wappalyzer (https://www.wappalyzer.com/) is an online tool and browser extension that helps identify what technologies a website uses, such as frameworks, Content Management Systems (CMS), payment processors and much more, and it can even find version numbers as well.

The Wayback Machine (https://archive.org/web/) is a historical archive of websites

github & git 

### S3 buckets 

S3 Buckets are a storage service provided by Amazon AWS, allowing people to save files and even static website content in the cloud accessible over HTTP and HTTPS.

permissions are incorrectly set and inadvertently allow access to files
format of the S3 buckets is:
-  `http(s)://{name}.s3.amazonaws.com where {name} `

One common automation method is by using the company name followed by common terms such as: `{name}-assets`
- `{name}-www` 
- `{name}-public`  
- `{name}-private` etc 

### automated discovery 

Automated discovery is the process of using tools to discover content rather than doing it manually.

Automated discovery is the process of using tools to discover content rather than doing it manually.

This process is made possible by using a resource called wordlists.

Wordlists are just text files that contain a long list of commonly used words

THM AttackBox is https://github.com/danielmiessler/SecLists which Daniel Miessler curates.

automation tools:
- ffuf
- dirb
- gobuster

- `ffuf -w /usr/share/wordlists/SecLists/Disocvery/Web-Content/common.txt -u http://x.x.x.x/FUZZ`

- `dirb http://x.x.x.x/ /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`

- `gobuster dir --url http://x.x.x.x/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`

## Subdomain Enumeration

Subdomain enumeration is the process of finding valid subdomains for a domain, but why do we do this? We do this to expand our attack surface to try and discover more potential points of vulnerability.

three different subdomain enumeration methods: 
- Brute Force
- OSINT
- Virtual Host 

SSL/TLC CERTIFICATES

SSL/TLS (Secure Sockets Layer/Transport Layer Security) certificate is created for a domain by a CA (Certificate Authority). certificate transparency  logs which aims to 
stop malicious certificates from being used

discover subdomains belonging to a domain
- https://crt.sh 
- https://ui.ctsearch.entrust.com/ui/ctsearchui 

crt.sh , tryhackme.com , find entry logged at 2020-12-26 and domain
- store.tryhackme.com

OSINT seach engine:

- `-site:www.domain.com site:*.domain.com` 
- returns only subdomains that belong to domain.com

- site:www.tryhackme.com  site:*.tryhackme.com
- blog.tryhackme.com

DNS bruteforce  enumeration
- use tools `dnsrecon`   
- subdomain discovery `sublist3r`

## VIRTUAL HOSTS

Some subdomains aren't always hosted in publically accessible DNS results

the DNS record could be kept on a private DNS server or recorded on the developer's machines in their `/etc/hosts` file or `c:\windows\system32\drivers\etc\hosts`

wordlist of subdomains
- `ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/namelist.txt -H "Host: FUZZ.acmeitsupport.thm" -u http://x.x.x.x`

- the same as above but add `-fs 2395` at the end

