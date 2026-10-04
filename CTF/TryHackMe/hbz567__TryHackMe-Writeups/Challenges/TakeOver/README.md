# CTF Write-up: TakeOver

## Room Details

**Room URL:** [TakeOver](https://tryhackme.com/room/takeover)

**Difficulty**: Easy

**Description**: This challenge revolves around subdomain enumeration.

**Core Concepts:** Subdomain Enumeration, SSL/TLS Certificate Investigation, Subdomain Takeover

### **📝 Challenge Overview**

Futurevera, a space research startup, has been targeted by blackhat hackers demanding a ransom after claiming they successfully took over part of the company's infrastructure. Our task is to enumerate their web presence and find exactly what asset is vulnerable to a takeover.

**Target Domain:** `futurevera.thm`

## Reconnaissance & Initial Scanning

We begin by mapping the open ports on the target machine using Nmap.

`sudo nmap 10.114.172.167 -sV` 

<img width="1201" height="411" alt="image" src="https://github.com/user-attachments/assets/129e8efd-0964-4e8e-8bd8-29b090fd88ec" />

The scan revealed three open ports:

- **Port 22:** SSH
- **Port 80:** HTTP
- **Port 443:** HTTPS

Before interacting with the web server, we must map the target IP to the domain by editing our `/etc/hosts` file using nano text editor:

<img width="694" height="257" alt="image 1" src="https://github.com/user-attachments/assets/4c760efc-960f-4bf9-ad0b-e0ab67560ba6" />

Visiting `https://futurevera.thm/` presents an SSL certificate error. Connecting via HTTP simply redirects back to HTTPS.

<img width="1920" height="847" alt="image 2" src="https://github.com/user-attachments/assets/9dd0ecdc-a9f5-4f61-99b4-0a853a1a4a5c" />

Click `Advanced` then `Accept the Risk and Continue` to add an Exception to visit the website. The main page source code yields no immediate clues.

<img width="1920" height="807" alt="image 3" src="https://github.com/user-attachments/assets/4fe33605-7c27-42bb-8f41-24ef7e05cc4d" />

## Subdomain Enumeration

Given the challenge description, subdomain enumeration is our primary vector. We use `gobuster` in `vhost` mode to discover hidden subdomains via the Host header.

**Attempt 1: Enumerating via HTTP**

`gobuster vhost -u http://futurevera.thm -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain -t 100` 

<img width="1920" height="690" alt="image 4" src="https://github.com/user-attachments/assets/6ce33cce-d3a9-4af5-8828-56ee3aa17117" />

This reveals `portal.futurevera.thm` (Status: 200).

After adding it to `/etc/hosts`, visiting it via HTTP loads a web page as follows:

<img width="1920" height="666" alt="image 5" src="https://github.com/user-attachments/assets/767ba2fc-4c75-4d06-9042-347520705d4a" />

Interesting.. But not quite useful.

### **Attempt 2: Enumerating via HTTPS (Bypassing SSL)**

Running the same scan over HTTPS fails initially due to certificate validation errors.

<img width="1920" height="793" alt="image 6" src="https://github.com/user-attachments/assets/abd4bd73-7558-426d-905d-742e0f6ea2e6" />

By appending the `-k` flag to `gobuster`, we instruct it to skip TLS verification:

`gobuster vhost -u https://futurevera.thm -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain -t 100 -k`

<img width="1920" height="721" alt="image 7" src="https://github.com/user-attachments/assets/0a7b4d63-caff-4fb0-84c8-db939496e997" />

This yields two new subdomains:

- `blog.futurevera.thm`
- `support.futurevera.thm`

## Exploitation via Certificate Inspection

We add `support.futurevera.thm` to our `/etc/hosts` file and navigate to it. Like the others, it throws an SSL warning.

<img width="1920" height="795" alt="image 8" src="https://github.com/user-attachments/assets/1576b65a-344c-4af0-9ec5-5200adbf2443" />

Instead of just bypassing the warning, we inspect the certificate details. Looking at the **Subject Alternative Names (SAN)** extension reveals a highly specific, hidden DNS name:
👉 `secrethelpdesk934752.support.futurevera.thm`

<img width="675" height="631" alt="image 9" src="https://github.com/user-attachments/assets/8ed3f31a-b090-448e-a0d2-84fe99b4ca8f" />

We add this newly discovered subdomain to `/etc/hosts`.

- Visiting via **HTTPS** serves the default homepage.
- Visiting via **HTTP** triggers an AWS S3 bucket error!

The browser displays an error, revealing the endpoint URL:

`https://flag{HIDDEN}.s3-website-us-west-3.amazonaws.com/`

This indicates a **Subdomain Takeover** vulnerability. The DNS record points to an S3 bucket that no longer exists. The CTF cleverly embeds the flag right inside the bucket endpoint name!

## Key Learnings and Takeaways

1. **Always Check the SAN:** SSL/TLS certificates are a goldmine for reconnaissance. The Subject Alternative Name (SAN) field often leaks internal, staging, or forgotten subdomains that brute-forcing might miss.
2. **Protocol Matters in Vhost Fuzzing:** Web servers handle HTTP (Port 80) and HTTPS (Port 443) differently. If directory or vhost enumeration fails on HTTP, always repeat the process on HTTPS.
3. **Master Your Tools:** Knowing how to bypass SSL verification (`k` flag in Gobuster) is essential when testing internal or poorly configured lab environments.
4. **The Mechanics of Subdomain Takeovers:** When an organization points a DNS record (like a CNAME) to a third-party service (AWS S3, GitHub Pages, Heroku) but later deletes the service without removing the DNS record, it leaves them vulnerable. Attackers can register that exact resource name with the cloud provider and hijack the subdomain.
