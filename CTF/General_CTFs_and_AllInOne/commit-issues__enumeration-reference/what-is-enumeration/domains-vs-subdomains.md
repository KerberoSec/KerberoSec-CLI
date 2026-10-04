# 🌐 Domains, Subdomains & Virtual Hosts

Understanding the difference between these three things is essential before you run a single enumeration tool. Miss a subdomain and you miss the entire attack surface hiding behind it.

---

## 🏠 What is a Domain?

A domain is the main address of a website or service. It's what you type into a browser, including the / extra page name. Like yankees.com/schedule
```
example.com
google.com
hackthebox.com
```

Think of a domain like a street address. `example.com` is the building. Everything else: the floors, the offices, the back rooms: lives under it.

---

## 🚪 What is a Subdomain?

A subdomain is a subdivision of the main domain. It sits to the left of the main domain name, separated by a dot.
```
mail.example.com        ← mail server
admin.example.com       ← admin panel
dev.example.com         ← development environment
staging.example.com     ← staging server
api.example.com         ← API endpoint
vpn.example.com         ← VPN portal
```

Using the building analogy: if `example.com` is the building, subdomains are the individual floors or wings. Each one can run completely different software, have different security configurations, and expose completely different attack surfaces.

---

## 💎 Why Subdomains Are Gold

Most people enumerate the main domain and stop there. The interesting stuff is almost always hiding on a subdomain.

**Why subdomains get overlooked:**
- Developers spin up `dev.` or `staging.` environments and forget to lock them down
- Old subdomains get abandoned but never deleted: still live, still vulnerable
- Internal tools get accidentally exposed on public subdomains
- Admin panels get tucked away on obscure subdomains thinking "no one will find it"

**What you commonly find on subdomains:**
- Login portals running outdated software
- Development environments with debug mode enabled
- Exposed API endpoints with no authentication
- Internal dashboards accidentally made public
- Old versions of the main site still running vulnerable CMS versions

---

## 🔄 Virtual Hosts: The Hidden Layer

Virtual hosts (vhosts) are different from subdomains but often confused with them.

**Subdomains** are resolved via DNS: they have their own DNS record pointing to an IP address.

**Virtual hosts** are configured on the web server itself: multiple websites running on the same IP address, distinguished only by the HTTP `Host` header in the request.

This means a vhost might not show up in DNS enumeration at all. You have to fuzz for it directly.
```
# Same IP address: different content based on Host header
Host: example.com        → main website
Host: admin.example.com  → admin panel (no DNS record: vhost only)
Host: internal.example.com → internal tool (completely hidden)
```

> 💡 **Why this matters in CTF and real engagements:** You can run a full subdomain enumeration and find nothing: then run a vhost fuzz against the same IP and find three hidden applications. Always do both.

---
## 🗺️ How to Add Discovered Hosts to /etc/hosts

### Why you need to do this

When you find a subdomain or vhost through enumeration, your browser and tools can't reach it by hostname unless they know the IP address. Public subdomains get resolved automatically through DNS. But internal hostnames, HTB box subdomains, and vhosts that don't have public DNS records: your machine has no idea where they live.

That's where `/etc/hosts` comes in.

`/etc/hosts` is a local file on your machine that maps hostnames to IP addresses before DNS even gets involved. When you add an entry to it, your machine stops asking DNS servers for that hostname and just uses the IP you gave it directly. Think of it as your own personal DNS override: it works instantly, no DNS server required.

**Real example:** You find `admin.example.com` in a zone transfer pointing to `10.0.0.10`. That IP is internal: no public DNS record exists. Without adding it to `/etc/hosts`, browsing to `http://admin.example.com` just fails. After adding it, your machine knows exactly where to go.

This is how you access subdomains and vhosts on HTB boxes and internal engagements that don't have public DNS records. You found the hostname, you know the IP: now you just need to connect them on your own machine.

---

### How to edit /etc/hosts

**On Linux and macOS:**
```bash
# Edit your hosts file
sudo nano /etc/hosts

# Add a line at the bottom: one IP can have multiple hostnames
10.10.10.1    example.com
10.10.10.1    admin.example.com
10.10.10.1    dev.example.com
```

**On Windows:**
```
# Open Notepad as Administrator
# Open this file: C:\Windows\System32\drivers\etc\hosts
# Add the same format at the bottom
10.10.10.1    example.com
10.10.10.1    admin.example.com
10.10.10.1    dev.example.com
```

> 💡 **HTB Pro Tip:** When you find a hostname anywhere: nmap output, web response headers, zone transfer, SSL certificate: add it to `/etc/hosts` immediately. Many HTB boxes serve completely different content depending on whether you access by IP or by hostname. Missing this loses you the box.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*