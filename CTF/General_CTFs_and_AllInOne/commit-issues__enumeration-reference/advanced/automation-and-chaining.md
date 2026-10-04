# ⚙️ Automation & Chaining Tools Together
## 📋 Contents

- [The Chaining Concept](#-the-chaining-concept)
- [Basic Chaining: Pipes and Redirects](#-basic-chaining--pipes-and-redirects)
- [Extract Open Ports from nmap and Feed to Tools](#-extract-open-ports-from-nmap-and-feed-to-tools)
- [Chain Subdomain Discovery into Live Host Check](#-chain-subdomain-discovery-into-live-host-check)
- [Full Enumeration Chain: CTF Workflow](#-full-enumeration-chain--ctf-workflow)
- [httpx: Check Which Hosts Have Web Servers](#️-httpx--check-which-hosts-have-web-servers)
- [Tool Output Formats: Feeding One Into Another](#-tool-output-formats--feeding-one-into-another)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

Running tools one at a time manually is fine when you're learning. But once you understand what each tool does and why, the next level is chaining them together: using the output of one tool as the input for the next, automating the repetitive parts, and building workflows that cover your entire enumeration methodology without you having to babysit every step.

This is how professionals work. Not faster clicking: smarter sequencing.

---

## 🧠 The Chaining Concept

Every enumeration tool produces output. That output is data. Data is input for the next tool.
```
nmap finds open ports
        ↓
gobuster targets the web server on port 80
        ↓
ffuf fuzzes the API endpoints gobuster found
        ↓
arjun finds hidden parameters on those endpoints
        ↓
sqlmap tests those parameters for injection
```

Each tool hands off to the next. The output of step 1 defines what step 2 does. You're building a pipeline: not running random commands and hoping something sticks.

---

## 🔗 Basic Chaining: Pipes and Redirects

The most fundamental chaining technique is using the terminal's built-in pipe (`|`) and redirect (`>`) operators.
```bash
# Pipe: send output of one command directly into another
nmap -sV <target> | grep "open"

# Redirect: save output to a file
nmap -sV <target> > nmap-output.txt

# Append: add to existing file without overwriting
echo "10.10.10.1" >> targets.txt

# Pipe into grep to filter
gobuster dir -u http://<target> -w wordlist.txt | grep "Status: 200"

# Chain multiple commands: run second only if first succeeds
nmap -sV <target> && gobuster dir -u http://<target> -w wordlist.txt

# Run second command regardless of first result
nmap -sV <target> ; gobuster dir -u http://<target> -w wordlist.txt
```

---

## ⚡ Extract Open Ports from nmap and Feed to Tools

One of the most useful chains: run a fast port scan, extract the open ports, then run a targeted deep scan on only those ports.
```bash
# Step 1: fast full port scan, save grepable output
nmap -p- --min-rate 5000 -oG ports.gnmap <target>

# Step 2: extract open ports into a variable
ports=$(grep "open" ports.gnmap | grep -oP '\d+/open' | cut -d'/' -f1 | tr '\n' ',' | sed 's/,$//')

# Step 3: confirm what you got
echo $ports
# Output: 22,80,443,8080

# Step 4: deep scan only open ports
nmap -sV -sC -p $ports -oN deep-scan.txt <target>
```

---

## 🌐 Chain Subdomain Discovery into Live Host Check

Find subdomains, then automatically check which ones are actually responding.
```bash
# Step 1: find subdomains with amass
amass enum -passive -d example.com -o amass-subs.txt

# Step 2: resolve which ones are live with dnsx
cat amass-subs.txt | dnsx -a -silent > live-subs.txt

# Step 3: check which live subdomains have web servers
cat live-subs.txt | httpx -silent > live-web.txt

# Step 4: run gobuster against every live web subdomain
while read url; do
  gobuster dir -u $url \
    -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
    -t 30 \
    -o gobuster-$(echo $url | sed 's/[^a-zA-Z0-9]/_/g').txt
done < live-web.txt
```

---

## 🔄 Full Enumeration Chain: CTF Workflow

This is a complete enumeration pipeline for a CTF box. Run it in order and you'll have thorough coverage across every common attack surface.
```bash
#!/bin/bash
# Usage: ./enum.sh <target-ip> <domain>
# Example: ./enum.sh 10.10.10.1 example.htb

TARGET=$1
DOMAIN=$2
OUTDIR="./enum-$TARGET"
mkdir -p $OUTDIR

echo "[*] Starting enumeration of $TARGET"

# Step 1: fast port scan
echo "[*] Running fast port scan..."
nmap -p- --min-rate 5000 -oG $OUTDIR/ports.gnmap $TARGET
PORTS=$(grep "open" $OUTDIR/ports.gnmap | grep -oP '\d+/open' | cut -d'/' -f1 | tr '\n' ',' | sed 's/,$//')
echo "[+] Open ports: $PORTS"

# Step 2: deep scan on open ports
echo "[*] Running deep scan on open ports..."
nmap -sV -sC -p $PORTS -oN $OUTDIR/deep-scan.txt $TARGET

# Step 3: web enumeration if port 80 or 443 open
if echo $PORTS | grep -qE "(^|,)(80|443|8080|8443)(,|$)"; then
  echo "[*] Web server detected: running gobuster..."
  gobuster dir \
    -u http://$TARGET \
    -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
    -x php,html,txt,bak \
    -t 50 \
    -o $OUTDIR/gobuster-dir.txt

  echo "[*] Running vhost fuzzing..."
  ffuf \
    -u http://$TARGET \
    -H "Host: FUZZ.$DOMAIN" \
    -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
    -fs $(curl -s http://$TARGET | wc -c) \
    -o $OUTDIR/vhosts.txt \
    -of md \
    -t 50
fi

# Step 4: SMB enumeration if port 445 open
if echo $PORTS | grep -q "445"; then
  echo "[*] SMB detected: running enum4linux-ng..."
  enum4linux-ng -A $TARGET -oY $OUTDIR/smb-enum
fi

# Step 5: DNS enumeration if port 53 open
if echo $PORTS | grep -q "53"; then
  echo "[*] DNS detected: attempting zone transfer..."
  dig axfr @$TARGET $DOMAIN > $OUTDIR/zone-transfer.txt
fi

# Step 6: SNMP check
echo "[*] Checking SNMP..."
nmap -sU -p 161 $TARGET | grep "open" && \
  snmpwalk -v2c -c public $TARGET > $OUTDIR/snmp-walk.txt

echo "[+] Enumeration complete. Results in $OUTDIR/"
```

**Save this as `enum.sh`, make it executable, and run it:**
```bash
chmod +x enum.sh
./enum.sh 10.10.10.1 example.htb
```

---

## 🛠️ httpx: Check Which Hosts Have Web Servers

`httpx` is a fast HTTP toolkit that checks which hosts/URLs are actually running web servers. Essential for filtering large lists down to targets worth enumerating.

**Install:**
```bash
# Linux
sudo apt install httpx

# macOS
brew install httpx

# Windows
# Download from: https://github.com/projectdiscovery/httpx/releases
```
```bash
# Check a list of subdomains for live web servers
cat subdomains.txt | httpx -silent

# Get status codes
cat subdomains.txt | httpx -silent -status-code

# Get titles: useful for quickly identifying what each site is
cat subdomains.txt | httpx -silent -title

# Get full info
cat subdomains.txt | httpx -silent -status-code -title -tech-detect

# Save results
cat subdomains.txt | httpx -silent -o live-hosts.txt
```

---

## 📋 Tool Output Formats: Feeding One Into Another

Different tools output in different formats. Here's how to extract what you need:
```bash
# Extract IPs from nmap output
grep -oP '\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b' nmap-output.txt

# Extract open ports from nmap grepable output
grep "open" scan.gnmap | grep -oP '\d+/open' | cut -d'/' -f1

# Extract hostnames from gobuster output
grep "Status: 200" gobuster-output.txt | awk '{print $1}'

# Extract found subdomains from amass output
cat amass-output.txt | sort -u

# Extract URLs from ffuf JSON output
cat ffuf-output.json | python3 -c "import sys,json; [print(x['url']) for x in json.load(sys.stdin)['results']]"
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Automation scripts | Use freely | Use, but document every command run |
| Aggressive timing | T4, high threads | T2-T3, lower threads |
| Full auto pipeline | Great for speed | Run in stages: review output at each step |
| Save all output | Good habit | Required: everything goes in the report |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*