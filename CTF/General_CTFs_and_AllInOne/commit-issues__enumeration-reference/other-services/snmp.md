# 📡 SNMP Enumeration

SNMP is one of the most overlooked protocols in enumeration, and one of the most rewarding when you find it misconfigured. Most beginners skip it entirely because it runs on UDP and doesn't show up as obviously as TCP services. That's exactly why it's worth checking. The information it exposes can be extraordinary.

---

## 🧠 What is SNMP: Plain English

SNMP stands for Simple Network Management Protocol. It's a protocol designed to let network administrators monitor and manage network devices remotely: routers, switches, printers, servers, firewalls, and more.

Think of it like a building management system. A facilities manager can sit at one desk and check the status of every piece of equipment in the building: which HVAC units are running, which elevators are operational, which lights are on. They don't have to physically walk to each device. SNMP does the same thing for network devices: it lets one person monitor thousands of devices from a central location.

Every SNMP-managed device has an **OID tree**: a massive structured database of information about that device. This includes:

- Running processes
- Installed software
- Network interfaces and IP addresses
- Routing tables
- User accounts
- System uptime
- Hardware information
- Open ports and connections
- And much more depending on the device

**The security problem:** SNMP version 1 and 2c use a **community string** as the only authentication mechanism. A community string is essentially just a password, and the default community string on virtually every device is `public` for read access and `private` for write access. Most administrators never change these defaults.

If you can query SNMP with the default community string, you get access to that entire OID tree: a complete inventory of everything running on the device.

**Ports:**
- `161` UDP: SNMP queries (this is what you scan)
- `162` UDP: SNMP traps (device-initiated alerts to management server)

> ⚠️ **SNMP runs on UDP**: nmap's default scan is TCP. You must specifically scan UDP port 161 or you'll miss it entirely. Many beginners skip UDP scanning and wonder why they can't find the path forward on certain boxes.

---

## 📋 SNMP Versions: Know the Difference

| Version | Authentication | Encryption | Notes |
|---|---|---|---|
| **SNMPv1** | Community string only | None | Oldest: everything in plain text |
| **SNMPv2c** | Community string only | None | Most common: still no encryption |
| **SNMPv3** | Username + password | Yes | Secure: much harder to exploit |

In practice you'll encounter SNMPv1 and v2c most often. SNMPv3 is significantly harder to attack without credentials.

---

## 🔑 Community Strings: The Key to Everything

A community string is the password that controls access to SNMP data. There are two types:

- **Read-only (RO)**: lets you query the device for information
- **Read-write (RW)**: lets you query AND modify device configuration

**Default community strings that work on the majority of unpatched devices:**

| String | Access Level |
|---|---|
| `public` | Read-only: try this first |
| `private` | Read-write: try this second |
| `manager` | Read-only: common on older devices |
| `admin` | Read-write: common on network equipment |
| `cisco` | Read-only: Cisco devices |
| `community` | Read-only: generic default |

If the defaults don't work, try brute forcing with a wordlist: community strings are often simple words or company names.

---

## 📦 Installation

**Linux (Kali: most tools pre-installed):**
```bash
sudo apt install snmp snmpwalk snmp-mibs-downloader onesixtyone
```

**macOS:**
```bash
brew install net-snmp
brew install onesixtyone
```

**Windows:**
- Download Net-SNMP from https://www.net-snmp.org/download.html
- Download onesixtyone from https://github.com/trailofbits/onesixtyone

---

## 🔍 Step 1: Discover SNMP with nmap
```bash
# Scan UDP port 161: SNMP
nmap -sU -p 161 <target>

# With version detection
nmap -sU -sV -p 161 <target>

# Run SNMP-specific scripts
nmap -sU -p 161 --script snmp-info,snmp-sysdescr <target>

# Scan entire subnet for SNMP
nmap -sU -p 161 192.168.1.0/24
```

> 💡 UDP scans are slower than TCP: be patient. Add `--min-rate 1000` to speed it up on lab networks.

---

## 🔑 Step 2: Brute Force Community Strings with onesixtyone

Before you can query SNMP you need a valid community string. onesixtyone is a fast SNMP community string brute forcer.
```bash
# Try default community strings
onesixtyone <target> public
onesixtyone <target> private

# Brute force with a wordlist
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt <target>

# Scan multiple targets
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt -i targets.txt

# Save output
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt <target> > snmp-communities.txt
```

A successful result looks like:
```
10.10.10.1 [public] Linux example 4.15.0 #1 SMP
```

That `[public]` means the community string `public` worked and you now have read access.

---

## 📊 Step 3: Enumerate Everything with snmpwalk

Once you have a valid community string, `snmpwalk` queries the entire OID tree and dumps everything the device exposes.
```bash
# Full walk: dumps everything (can be very long)
snmpwalk -v2c -c public <target>

# Save full output to file
snmpwalk -v2c -c public <target> > snmpwalk-full.txt

# Walk a specific OID branch
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.2

# Use SNMPv1
snmpwalk -v1 -c public <target>

# Use SNMPv3 with credentials
snmpwalk -v3 -u username -A password -a MD5 -X privpass -x DES <target>
```

---

## 🎯 Targeted OID Queries: The Good Stuff

Instead of dumping everything, you can query specific OID branches to get exactly what you want. These are the most valuable ones:
```bash
# Running processes: shows everything currently running
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.2

# Installed software: full list of installed programs
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.6.3.1.2

# Open TCP ports: what's listening
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.6.13.1.3

# Network interfaces: IP addresses and MAC addresses
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.2.2.1.2

# System information: hostname, OS, uptime
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1

# User accounts: local users on the system
snmpwalk -v2c -c public <target> 1.3.6.1.4.1.77.1.2.25

# Storage information: disk usage
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.2.3.1.4
```

---

## 🛠️ snmpbulkwalk: Faster Alternative

`snmpbulkwalk` works like snmpwalk but uses SNMP bulk requests: significantly faster on large OID trees.
```bash
# Full bulk walk
snmpbulkwalk -v2c -c public <target>

# Specific OID
snmpbulkwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.2
```

---

## 🔎 What to Look For in SNMP Output

**Running processes: gold mine:**
```
iso.3.6.1.2.1.25.4.2.1.2.1 = STRING: "bash"
iso.3.6.1.2.1.25.4.2.1.2.2 = STRING: "python3 /opt/backup.py --password SuperSecret123"
```
Commands run with arguments sometimes expose credentials directly in process listings.

**Installed software:**
```
iso.3.6.1.2.1.25.6.3.1.2.1 = STRING: "OpenSSH 7.2p1"
iso.3.6.1.2.1.25.6.3.1.2.2 = STRING: "Apache 2.4.18"
```
Every version number is a potential CVE search.

**User accounts:**
```
iso.3.6.1.4.1.77.1.2.25.1.1.5 = STRING: "administrator"
iso.3.6.1.4.1.77.1.2.25.1.1.6 = STRING: "john.smith"
```
Valid usernames for password spraying against other services.

**Network interfaces:**
```
iso.3.6.1.2.1.2.2.1.2.1 = STRING: "eth0"
iso.3.6.1.2.1.2.2.1.2.2 = STRING: "eth1"
```
Multiple interfaces reveal the device sits on multiple network segments: useful for internal network mapping.

---

## 🔄 Recommended SNMP Enumeration Workflow
```bash
# Step 1: confirm SNMP is running
nmap -sU -p 161 <target>

# Step 2: brute force community string
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt <target>

# Step 3: full walk and save output
snmpwalk -v2c -c public <target> > snmpwalk-full.txt

# Step 4: check the high value OIDs specifically
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.2   # processes
snmpwalk -v2c -c public <target> 1.3.6.1.4.1.77.1.2.25     # users
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.6.3.1.2    # software
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.6.13.1.3      # open ports

# Step 5: grep for interesting strings in full output
grep -i "password\|pass\|credential\|secret\|key" snmpwalk-full.txt
grep -i "admin\|root\|user" snmpwalk-full.txt
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Default community strings | Try immediately | Try immediately: document if found |
| Full snmpwalk | Run it: save everything | Run it: everything is a potential finding |
| Credentials in processes | Exploit immediately | Critical finding: document fully |
| Write access (private string) | Modify config if it helps | High severity finding: document, do not modify |
| SNMPv1/v2c running | Expected in CTF | Medium finding: recommend upgrade to v3 |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*