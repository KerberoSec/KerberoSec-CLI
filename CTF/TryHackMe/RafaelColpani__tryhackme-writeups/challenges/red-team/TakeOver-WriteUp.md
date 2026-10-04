# TakeOver

**Platform:** TryHackMe  
**Room:** TakeOver  
**Category:** Web, Subdomain Enumeration  
**Tools Used:** Nmap, Gobuster, FFUF, cURL, Web Browser  
**Date:** 2026-01-07

---

## 1. Description

> **Room Briefing:**
> 
> Hello there,
> 
> I am the CEO and one of the co-founders of futurevera.thm. In Futurevera, we believe that the future is in space. We do a lot of space research and write blogs about it.
> 
> Recently blackhat hackers approached us saying they could takeover and are asking us for a big ransom. Please help us to find what they can takeover.
> 
> Our website is located at futurevera.thm.
> 
> **Hint:** Don't forget to add the MACHINE_IP in `/etc/hosts` for `futurevera.thm`.

The goal of this room is to enumerate the target and find a subdomain that can be taken over.

---

# 2. Reconnaissance

## 2.1 Port Scanning

I started with an Nmap scan to identify the open ports and the services running on the target.

```bash
sudo nmap -sS -sV -p- TARGET-IP
```

The scan showed the following open ports:

|Port|Service|Description|
|---|---|---|
|22/tcp|SSH|OpenSSH|
|80/tcp|HTTP|Apache|
|443/tcp|HTTPS|Apache|

The most interesting services were ports **80** and **443**, because they were running a web server.

---

# 3. Web Enumeration

After the Nmap scan, I accessed the website using a web browser.

The room also tells us to add the target IP and domain to `/etc/hosts`.

For example:

```text
futurevera.thm
```

This allows the system to resolve `futurevera.thm` to the target machine.

---

## 3.1 Directory Enumeration with Gobuster

I first tried to find hidden directories using Gobuster:

```bash
gobuster dir -u http://TARGET-IP -w wordlist.txt
```

However, the scan did not return anything useful.

Because Gobuster did not give me relevant results, I decided to try another enumeration tool.

---

# 4. Subdomain Enumeration

I then used **FFUF** to look for possible subdomains.

The idea was to test different names against the target and identify valid responses.

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -H "Host: FUZZ.futurevera.thm" -u https://TARGET-IP/ -fs 4605
```

The scan helped identify two interesting subdomains:

- `blog.futurevera.thm`  
- `support.futurevera.thm`

These were interesting because the room is specifically about finding something that could potentially be taken over.

---

## 4.1 Adding the Subdomains to `/etc/hosts`

Since these domains were not automatically resolving, I added them to `/etc/hosts`.

```text
futurevera.thm
blog.futurevera.thm
support.futurevera.thm
```

After that, I was able to access the discovered subdomains through the browser.

---

# 5. Investigating the Subdomains

I checked both the **Blog** and **Support** subdomains.

At first, I did not find anything obvious that would lead directly to the flag.

While investigating the HTTPS website, I noticed something interesting in the **SSL/TLS certificate**.

The certificate contained DNS information related to the support subdomain.

This was an important clue because certificates can contain domain names and other information about the infrastructure.

---

# 6. Finding the Flag

After finding the DNS name in the certificate, I decided to make a request directly to that hostname using cURL.

```bash
curl -i [DNS-NAME]
```

The response contained the flag.

Therefore, the final path was:

```text
Nmap
  ↓
Web Enumeration
  ↓
FFUF
  ↓
blog.futurevera.thm
support.futurevera.thm
  ↓
/etc/hosts
  ↓
SSL Certificate
  ↓
DNS Name
  ↓
cURL
  ↓
FLAG
```

---

# 7. Conclusion

The main lesson from this room was that **subdomain enumeration is important when testing web applications**.

The main website itself did not immediately reveal the answer. By enumerating the application and looking at information exposed by the SSL certificate, it was possible to discover another DNS name.

The important steps were:

- Scan the target with Nmap.
    
- Identify the HTTP and HTTPS services.
    
- Enumerate the web application.
    
- Use FFUF to find additional subdomains.
    
- Add the discovered domains to `/etc/hosts`.
    
- Inspect the SSL certificate.
    
- Identify the additional DNS name.
    
- Use cURL to access the discovered host.
    
- Retrieve the flag.
    

## What I Learned

From this room, I learned that information such as **SSL certificates and DNS names can help during reconnaissance**.

I also learned that when one enumeration technique does not provide useful results, it is worth trying another approach instead of stopping the investigation.

---

# 8. Tools Used

|Tool|Purpose|
|---|---|
|Nmap|Port and service enumeration|
|Gobuster|Directory enumeration|
|FFUF|Subdomain/web enumeration|
|Web Browser|Website and certificate investigation|
|cURL|Sending HTTP requests|

## Important Commands

### Nmap

```bash
sudo nmap -sS -sV -p- TARGET-IP
```

### Gobuster

```bash
gobuster dir -u http://TARGET-IP -w wordlist.txt
```

### FFUF

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -H "Host: FUZZ.futurevera.thm" -u https://TARGET-IP/ -fs 4605
```

### cURL

```bash
curl -i [DNS-NAME]
```