# 🖥️ SMB Enumeration
## 📋 Contents

- [What is SMB: Plain English](#-what-is-smb--plain-english)
- [Why SMB is Always Worth Enumerating](#-why-smb-is-always-worth-enumerating)
- [The Tools](#️-the-tools)
- [Recommended SMB Enumeration Workflow](#-recommended-smb-enumeration-workflow)
- [What To Do When You Find Something](#-what-to-do-when-you-find-something)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

SMB is one of the highest-value targets you'll encounter. It has the longest history of critical vulnerabilities of any common service, it runs on almost every Windows machine, and it's frequently misconfigured. If you see port 139 or 445 open: stop everything and enumerate it properly.

---

## 🧠 What is SMB: Plain English

SMB stands for Server Message Block. It's a network file sharing protocol: the technology that lets computers on the same network share files, folders, and printers with each other without emailing everything back and forth.

Think of it like a shared drive in an office. When someone puts a file in the "Finance" folder on the server and everyone in the office can access it from their own computer: that's SMB doing the work behind the scenes.

SMB has been built into Windows since the early 1990s. It's everywhere: corporate networks, home networks, hospitals, schools. That ubiquity combined with a long history of serious vulnerabilities makes it one of the first things you check during enumeration.

**Ports:**
- `139`: SMB over NetBIOS (older)
- `445`: SMB over TCP (modern: this is the one you'll see most)

---

## 💎 Why SMB is Always Worth Enumerating

**The vulnerability history alone makes it worth checking:**
- **EternalBlue (MS17-010)**: leaked NSA exploit that powered WannaCry ransomware. Took down hospitals, banks, and government systems worldwide in 2017. Still shows up on unpatched systems.
- **MS08-067**: critical RCE vulnerability. Exploited by the Conficker worm. Still present on very old unpatched systems.
- **PrintNightmare (CVE-2021-1675)**: privilege escalation via Windows Print Spooler over SMB.

**Beyond vulnerabilities, SMB commonly exposes:**
- File shares with no authentication required (null sessions)
- File shares with weak or default credentials
- Sensitive files left on accessible shares: backups, configs, scripts, credentials
- Username enumeration: you can often list all users on the system
- Password policies: tells you if accounts lock out (affects brute force decisions)
- OS version and domain information: feeds directly into CVE research

---

## 🛠️ The Tools

### enum4linux-ng: Your First Run

`enum4linux-ng` is the modern rewrite of the original `enum4linux`. It pulls everything from an SMB target in one command: users, groups, shares, password policy, OS info, and more. This is your starting point on every SMB target.

**Install:**
- Kali Linux: `sudo apt install enum4linux-ng`
- Linux: `sudo apt install enum4linux-ng`
- macOS: `pip3 install enum4linux-ng --break-system-packages`
- Windows: `pip install enum4linux-ng`

Official documentation: https://github.com/cddmp/enum4linux-ng
```bash
# Full enumeration: run this first on every SMB target
enum4linux-ng -A <target>

# Users only
enum4linux-ng -U <target>

# Shares only
enum4linux-ng -S <target>

# With credentials
enum4linux-ng -A -u username -p password <target>

# Save output
enum4linux-ng -A <target> -oY enum4linux-output
```

**What to look for in the output:**
- `Shares` section: any share you can access, especially ones with `READ` or `WRITE` access
- `Users` section: valid usernames for password spraying or brute forcing
- `Password Policy` section: minimum length, lockout threshold (if lockout is enabled, be careful with brute force)
- `OS Info`: exact Windows version for CVE research

---

### netexec: The Swiss Army Knife

`netexec` is the actively maintained successor to CrackMapExec. It's more powerful, supports more protocols, and is what you'll want to learn if you're serious about Windows enumeration and post-exploitation.

**Install:**
- Kali Linux: `sudo apt install netexec`
- Linux: `sudo apt install netexec`
- macOS: `pip3 install netexec --break-system-packages`
- Windows: `pip install netexec`

Official documentation: https://github.com/Pennyw0rth/NetExec
```bash
# Basic SMB enumeration
netexec smb <target>

# Enumerate shares: no credentials
netexec smb <target> --shares

# Enumerate shares: with credentials
netexec smb <target> -u username -p password --shares

# Enumerate users
netexec smb <target> -u username -p password --users

# Check for null session
netexec smb <target> -u '' -p ''

# Password spraying: one password against many users
netexec smb <target> -u users.txt -p 'Password123' --continue-on-success

# Check if credentials work across a subnet
netexec smb 192.168.1.0/24 -u username -p password
```

---

### smbclient: Browse Shares Directly

`smbclient` is a built-in tool that lets you browse and interact with SMB shares like an FTP client. Once you've identified accessible shares with enum4linux-ng or netexec, use smbclient to get inside them.

**Install:**
- Kali/Linux: Pre-installed, or `sudo apt install smbclient`
- macOS: `brew install samba`
- Windows: Use `net use` or install from https://www.samba.org
```bash
# List all shares: anonymous/null session
smbclient -L //<target>/ -N

# List shares with credentials
smbclient -L //<target>/ -U username

# Connect to a specific share: anonymous
smbclient //<target>/ShareName -N

# Connect with credentials
smbclient //<target>/ShareName -U username

# Once inside a share: basic commands
smb: \> ls                    # list files
smb: \> get filename.txt      # download a file
smb: \> get -r FolderName     # download entire folder recursively
smb: \> put localfile.txt     # upload a file
smb: \> cd FolderName         # change directory
```

---

### crackmapexec: Still Widely Used

CrackMapExec (CME) is being replaced by netexec but you'll see it constantly in CTF writeups and penetration testing resources. The syntax is nearly identical to netexec.

**Install:**
- Kali Linux: `sudo apt install crackmapexec`
- Linux: `sudo apt install crackmapexec`
- macOS: `pip3 install crackmapexec --break-system-packages`
- Windows: `pip install crackmapexec`

Official documentation: https://github.com/byt3bl33d3r/CrackMapExec
```bash
# Basic enumeration
crackmapexec smb <target>

# Enumerate shares
crackmapexec smb <target> --shares

# Check null session
crackmapexec smb <target> -u '' -p ''

# With credentials
crackmapexec smb <target> -u username -p password --shares
```

---

## 🔄 Recommended SMB Enumeration Workflow
```bash
# Step 1: full automated enumeration
enum4linux-ng -A <target>

# Step 2: check for null session access
netexec smb <target> -u '' -p ''
smbclient -L //<target>/ -N

# Step 3: if null session works, browse every share
smbclient //<target>/ShareName -N

# Step 4: download everything accessible
smb: \> get -r .

# Step 5: check for EternalBlue
nmap --script smb-vuln-ms17-010 -p 445 <target>

# Step 6: if you have credentials, go deeper
netexec smb <target> -u username -p password --shares --users
```

---

## 🔍 What To Do When You Find Something

**Accessible share with no credentials:**
- Connect with smbclient and browse everything
- Download all readable files: configs, scripts, backups are highest value
- Look for password files, SSH keys, database configs, anything with credentials

**Username list from enumeration:**
- Use for password spraying: try one common password against all users
- Common passwords to try: `Welcome1`, `Password123`, `CompanyName1`, `Season+Year`
- Check the password policy first: if lockout is enabled after 3 attempts, be very careful

**OS version identified:**
- Search for CVEs specific to that version
- Check for EternalBlue on older Windows versions
- Run `nmap --script smb-vuln*` for automated vulnerability checking

**Write access to a share:**
- In CTF: you can often upload a malicious file that gets executed
- In real engagements: this is a High severity finding on its own

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*