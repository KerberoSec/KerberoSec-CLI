TryHackMe | DNS in Detail | Writeup
---
TryHackMe: DNS in Detail: Writeup
[DNS in Detail](https://tryhackme.com/room/dnsindetail) is a room created by [adamtlangley](https://tryhackme.com/p/adamtlangley).

Answers/Flags :
---
### What is DNS?

| Question | Answer |
|----------|---------|
|What does DNS Stand for?|Domain Name System|

### Domain Hierarchy

| Question | Answer |
|----------|---------|
|What is the maximum length of a subdomain?|63|
|Which of the following characters cannot be used in a subdomain ( 3 b _: )?|_ |
|What is the maximum length of a domain name?|253|
|What type of TLD is .co.uk?|ccTLD|

### Record Types

| Question | Answer |
|----------|---------|
|What type of record would be used to advise where to send email?|MX|
|What type of record handles IPv6 addresses?|AAAA|

### Making A Request 

| Question | Answer |
|----------|---------|
|What field specifies how long a DNS record should be cached for?|TTL|
|What type of DNS Server is usually provided by your ISP?|Recursive|
|What type of server holds all the records for a domain?|authoritative|

### Practical

| Question | Answer |
|----------|---------|
|What is the CNAME of shop.website.thm?|shops.myshopify.com|
|What is the value of the TXT record of website.thm|THM{7012BBA60997F35A9516C2E16D2944FF}|
|What is the numerical priority value for the MX record?|30|
|What is the IP address for the A record of www.website.thm?|10.10.10.10|

Walkthrough
---

### What is the CNAME of shop.website.thm?

```sh
user@thm:~$ nslookup --type=CNAME shop.website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
shop.website.thm canonical name = shops.myshopify.com
```

### What is the value of the TXT record of website.thm?

```sh
user@thm:~$ nslookup --type=TXT website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
website.thm text = "THM{7012BBA60997F35A9516C2E16D2944FF}"
```

### What is the numerical priority value for the MX record?

```sh
user@thm:~$ nslookup --type=MX website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
website.thm mail exchanger = 30 alt4.aspmx.l.google.com
```

### What is the IP address for the A record of www.website.thm?

```sh
user@thm:~$ nslookup --type=A www.website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: www.website.thm
Address: 10.10.10.10
```
Credits : Oxe
