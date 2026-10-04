# 🖥️ Virtual Host Fuzzing
## 📋 Contents

- [What is a Virtual Host: Plain English](#-what-is-a-virtual-host--plain-english)
- [Why Companies Accidentally Expose Vhosts](#-why-companies-accidentally-expose-vhosts)
- [Tools for Vhost Fuzzing](#-tools-for-vhost-fuzzing)
- [gobuster vhost Mode](#-gobuster-vhost-mode)
- [ffuf vhost Fuzzing](#-ffuf-vhost-fuzzing)
- [Finding the Filter Value](#-finding-the-filter-value)
- [HTTPS Targets](#-https-targets)
- [What To Do When You Find a Vhost](#-what-to-do-when-you-find-a-vhost)
- [Full Vhost Discovery Workflow](#-full-vhost-discovery-workflow)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

Virtual host fuzzing is one of the most important techniques in web enumeration that beginners consistently skip. You can run a full subdomain enumeration, find nothing interesting, and completely miss three hidden web applications running on the exact same IP address: because they're configured as virtual hosts, not DNS subdomains. This file explains what virtual hosts are, why they're different, and how to find them.

---

## 🧠 What is a Virtual Host: Plain English

A virtual host (vhost) is a way to run multiple websites on a single server using a single IP address. The web server uses the `Host` header in the HTTP request to decide which website to serve.

Think of it like an apartment building. The building has one street address (one IP address). But inside there are 50 different apartments (50 different websites). When a package arrives (an HTTP request), the mailroom looks at the apartment number on the label (the Host header) and delivers it to the right unit.

**The key difference from subdomains:**

A subdomain (`dev.example.com`) has its own DNS record that resolves to an IP address. Anyone can discover it through DNS enumeration.

A virtual host may have NO DNS record at all. The web server just knows "if someone asks for `internal.example.com`, show them this application." Without knowing to ask for that hostname, you'll never find it through DNS enumeration. It's invisible to the outside world: unless you fuzz for it.
```
# DNS subdomain: discoverable through DNS queries
dev.example.com → A record → 10.10.10.1

# Virtual host: no DNS record, only web server config
Host: internal.example.com → web server routes to internal app
# There is no DNS record for internal.example.com
# Standard subdomain enumeration finds nothing
# Vhost fuzzing finds it
```

---

## 🎯 Why Companies Accidentally Expose Vhosts

Virtual hosts are frequently used for:
- **Development environments**: `dev.`, `test.`, `staging.` running on the same server as production
- **Internal tools**: admin panels, monitoring dashboards, internal APIs
- **Legacy applications**: old versions of the site still running but no longer linked anywhere
- **Client portals**: separate applications for different clients on shared infrastructure

The misconfiguration pattern is always the same: a developer spins up an application on a vhost thinking "it has no DNS record so no one can find it." But the web server will happily respond to anyone who sends the right Host header: you just have to know to ask.

---

## 📦 Tools for Vhost Fuzzing

Both gobuster and ffuf handle vhost fuzzing. The approach is slightly different for each.

---

## 🔍 gobuster vhost Mode
```bash
# Basic vhost scan
gobuster vhost \
  -u http://<target-ip> \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# With domain appended: gobuster adds .example.com to each wordlist entry
gobuster vhost \
  -u http://<target-ip> \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  --append-domain \
  -t 50

# Filter false positives by response length
gobuster vhost \
  -u http://<target-ip> \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  --append-domain \
  --exclude-length 280 \
  -t 50 \
  -o gobuster-vhosts.txt
```

> 💡 **`--append-domain` is important**: without it gobuster sends `Host: dev` instead of `Host: dev.example.com`. Many web servers only respond to fully qualified hostnames. Always use this flag when you know the base domain.

---

## ⚡ ffuf vhost Fuzzing

ffuf fuzzes vhosts by placing `FUZZ` inside the `Host` header directly: giving you full control over the format.
```bash
# Basic vhost fuzzing
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Filter false positives: run without filter first to get default size
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_response_size>

# Filter by word count instead of size
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fw <default_word_count>

# Save output
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_response_size> \
  -o ffuf-vhosts.txt \
  -of md
```

---

## 🔧 Finding the Filter Value

Before you can filter false positives you need to know what the default response looks like: what the server returns when you ask for a vhost that doesn't exist.
```bash
# Step 1: run a quick scan without any filter
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -t 10

# Step 2: look at the output
# Almost every result will show the same size: that's your false positive size
# Example output:
# dev                     [Status: 200, Size: 612, Words: 45, Lines: 12]
# staging                 [Status: 200, Size: 612, Words: 45, Lines: 12]
# admin                   [Status: 200, Size: 612, Words: 45, Lines: 12]
# internal                [Status: 200, Size: 4521, Words: 342, Lines: 89]  ← DIFFERENT
# test                    [Status: 200, Size: 612, Words: 45, Lines: 12]

# Step 3: the outlier is your finding
# Filter everything matching size 612
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs 612
```

---

## 🌐 HTTPS Targets

If the target is running HTTPS with a self-signed certificate add `-k` to skip certificate verification:
```bash
# gobuster
gobuster vhost \
  -u https://<target-ip> \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  --append-domain \
  -k

# ffuf
ffuf \
  -u https://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_size> \
  -k
```

---

## 📋 What To Do When You Find a Vhost
```bash
# Step 1: add it to /etc/hosts
echo "<target-ip> internal.example.com" >> /etc/hosts

# Step 2: visit it in your browser
# Open: http://internal.example.com

# Step 3: enumerate it like any other web target
gobuster dir \
  -u http://internal.example.com \
  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
  -x php,html,txt \
  -t 50

# Step 4: check for more vhosts on the same application
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.internal.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_size>
```

---

## 🔄 Full Vhost Discovery Workflow
```bash
# Step 1: confirm the base domain
# Check nmap output, web response headers, SSL certificate
nmap -sV -p 80,443 <target-ip>
curl -I http://<target-ip>

# Step 2: get the default response size
curl -s http://<target-ip> | wc -c

# Step 3: run vhost fuzzing
ffuf \
  -u http://<target-ip> \
  -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_size> \
  -t 50 \
  -o vhost-results.txt

# Step 4: add all found vhosts to /etc/hosts
echo "<target-ip> internal.example.com admin.example.com dev.example.com" >> /etc/hosts

# Step 5: enumerate each discovered vhost
for vhost in internal.example.com admin.example.com dev.example.com; do
  gobuster dir -u http://$vhost \
    -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
    -t 50 -o gobuster-$vhost.txt
done
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Always run vhost fuzzing | Yes: after initial web enum | Yes: standard methodology |
| Filter false positives | Essential | Essential |
| HTTPS with self-signed cert | Use `-k` | Use `-k`: document cert details |
| Found internal tool | Enumerate it fully | Document access: high finding |
| Found dev/staging environment | Exploit it | High finding: often less secure than prod |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*