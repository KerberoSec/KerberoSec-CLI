# Passive Reconnaissance

### Passive vs Active Recon

Reconnaissance is the first step in [The Unified Kill Chain](https://www.unifiedkillchain.com/)

**Passive Recon**

Relies on publicly available knowledge, no direct contact.

- Looking up DNS records of a domain from a public DNS server

- Checking job ads related to the target website

- Reading news articles about the target company

**Active Recon**

Direct engagement with the target.

- Connecting to one of the company servers; HTTP, FTP and SMTP

- Calling the company in an attempt to get information

- Entering the company premises pretending to be a repairman

### Whois

Whois servers listen on TCP port 43

Whois lists various pieces of interesting information: The registrant's name and contact 
information, admin and tech contacts for the domain and domain name servers to query if we 
have any DNS records.

Can lead to discovery of new attack surfaces e.g admin's email server, DNS servers owned by 
target etc.

### nslookup and dig

`nslookup` finds the IP address of a given domain name.

[Public DNS servers](https://duckduckgo.com/?q=public+dns)

nslookup options 

| Query type |   Result           |
|------------|--------------------| 
| A          | IPv4 address       |
| AAAA       | IPv6 address       |
| CNAME      | Canonical name     |
| MX         | Mail Servers       |
| SOA        | Start of Authority |
| TXT        | TXT Records        |

`nslookup -type=A <DOMAIN-NAME> <DNS-SERVER-IP>`

Use `dig` to perform more advanced DNS queries

`dig @<DNS-SERVER-IP> <DOMAIN-NAME> <TYPE>`

### DNSDumpster

[DNSDumpster](https://dnsdumpster.com/) allows mapping of subdomains and relevant 
information through DNS queries

### Shodan.io

[Shodan query fundamentals](https://help.shodan.io/the-basics/search-query-fundamentals)

**Autonomous System Numbers**

An ASN is a global identifier of a range of IP addresses. Large companies will likely have 
their own ASN for all the IP addresses they own.

[ASN lookup tool](https://www.ultratools.com/tools/asnInfo)

**Filters**

[Filter list](https://www.shodan.io/search/filters)

**Shodan Dorking**

has_screenshot:true encrypted attention

Uses optical character recognition and remote desktop to find machines compromised by 
ransomware on the internet.

screenshot.label:ics

vuln:CVE-2014-0160 Internet connected machines vulenrable to heartbleed. 

Solar Winds Supply Chain Attack by using Favicons:

http.favicon.hash:-1776962843

https://github.com/topics/shodan-dorks

**Browser Extension**

Shodan.io browser extension gives results for the current webpage
