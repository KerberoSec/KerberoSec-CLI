# 🔄 DNS Zone Transfers

A DNS zone transfer is one of the most valuable misconfigurations you can find during enumeration. When it works, it hands you the entire DNS map of a domain in one request: every subdomain, every server, every IP address, all at once.

---

## 🧠 What is a Zone Transfer: Plain English

A DNS zone is the complete collection of DNS records for a domain. Zone transfers (technically called AXFR requests) are a mechanism designed to let secondary DNS servers sync their records from the primary DNS server: like a backup system for DNS data.

Think of it like a master copy of a company's internal directory. The primary server has it. Secondary servers need copies of it to function. The transfer mechanism exists so they can request that copy.

The problem: some DNS servers are misconfigured to allow **anyone** to request that copy: not just authorized secondary servers. When that happens, you can ask for the entire zone and get back every DNS record the company has.

This is considered a critical misconfiguration in professional engagements because it completely eliminates the need for subdomain brute forcing: you just get everything handed to you.

---

## 🎯 What You Get When It Works

A successful zone transfer returns every DNS record in the zone:
```
example.com.          A      93.184.216.34
www.example.com.      A      93.184.216.34
mail.example.com.     A      10.0.0.5
admin.example.com.    A      10.0.0.10
dev.example.com.      A      10.0.0.15
staging.example.com.  A      10.0.0.20
vpn.example.com.      A      10.0.0.25
internal.example.com. A      192.168.1.100
```

In one request you've mapped the entire infrastructure: public and internal hostnames, IP addresses, and server roles.

---

## 🔍 How to Attempt a Zone Transfer

**Step 1: Find the nameservers for the domain:**
```bash
# Using dig
dig example.com NS +short

# Using nslookup
nslookup -type=NS example.com
```

This gives you the nameserver hostnames: something like `ns1.example.com` and `ns2.example.com`.

**Step 2: Attempt the zone transfer against each nameserver:**
```bash
# Using dig: AXFR request
dig axfr @ns1.example.com example.com
dig axfr @ns2.example.com example.com

# Using nslookup
nslookup
> server ns1.example.com
> set type=AXFR
> example.com

# Using dnsrecon
dnsrecon -d example.com -t axfr

# Using fierce
fierce --domain example.com
```

**Step 3: Read the output:**

If the zone transfer is **denied** (most common):
```
; Transfer failed.
```

If the zone transfer **succeeds**:
```
; <<>> DiG 9.16.1 <<>> axfr @ns1.example.com example.com
example.com.        3600  IN  SOA   ns1.example.com. admin.example.com. ...
example.com.        3600  IN  NS    ns1.example.com.
example.com.        3600  IN  NS    ns2.example.com.
www.example.com.    3600  IN  A     93.184.216.34
mail.example.com.   3600  IN  A     10.0.0.5
admin.example.com.  3600  IN  A     10.0.0.10
...
```
**Reading the output: what each column means:**
```
admin.example.com.    3600    IN    A    10.0.0.10
        ↑               ↑      ↑    ↑        ↑
    hostname           TTL   class type    value
```

- **Hostname**: the subdomain or server name that exists
- **TTL**: how long this record is cached (in seconds): not important right now
- **IN**: Internet class, always IN, ignore it
- **Type**: the record type (A = IPv4 address, NS = nameserver, MX = mail server)
- **Value**: what it points to: usually an IP address

The ones you care about most are `A` records: they map a hostname directly to an IP address. Any `A` record pointing to an internal IP range (10.x.x.x, 172.16.x.x, 192.168.x.x) means that server is internal: it's not supposed to be publicly visible, which makes it more interesting.

**So you found `admin.example.com` pointing to `10.0.0.10`: now what?**

That IP is internal. Your browser and your tools don't know how to reach `admin.example.com` because there's no public DNS record for it: it was never meant to be found. But you found it anyway through the zone transfer.

To actually visit it or run tools against it, you need to tell your own machine where it lives. That's where `/etc/hosts` comes in.

> 💡 Need to understand `/etc/hosts` and why we edit it? See [Domains, Subdomains & Virtual Hosts](../what-is-enumeration/domains-vs-subdomains.md) for the full explanation.
---

## 📋 What To Do When It Works

1. **Save the output immediately:**
```bash
dig axfr @ns1.example.com example.com > zone-transfer.txt
```

2. **Extract all hostnames:**
```bash
grep -oP '[\w.-]+\.example\.com' zone-transfer.txt | sort -u
```

3. **Add all discovered hosts to `/etc/hosts`** if you're on an HTB or internal engagement

4. **Note internal IP ranges**: any RFC1918 addresses (10.x.x.x, 172.16.x.x, 192.168.x.x) reveal internal network structure

5. **In a professional engagement**: this is a Critical finding. Document it fully with the full output as evidence.

---

## 🌐 HTB Context

Zone transfers appear on HTB boxes fairly regularly: especially boxes focused on DNS enumeration. The typical workflow:
```bash
# You find a domain in your nmap output or web response
# Step 1: find nameservers
dig example.htb NS +short

# Step 2: attempt transfer
dig axfr @<nameserver-ip> example.htb

# Step 3: add everything found to /etc/hosts
echo "10.10.10.1 admin.example.htb dev.example.htb" >> /etc/hosts

# Step 4: enumerate each discovered subdomain
gobuster dir -u http://admin.example.htb -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

---

## 🔒 Why This is a Critical Finding in Real Engagements

Zone transfers expose the entire internal DNS structure of an organization: including hostnames that were never meant to be public. Internal server names, staging environments, VPN endpoints, and administrative interfaces that security teams assumed were hidden are all revealed in a single request.

The fix is simple: restrict zone transfers to authorized IP addresses only. But the misconfiguration is surprisingly common even in large organizations.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*