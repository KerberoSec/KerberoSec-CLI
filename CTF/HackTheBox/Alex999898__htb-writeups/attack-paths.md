---
layout: default
title: Attack Paths
nav_order: 8
description: "Visual attack path flowcharts for popular HTB machines: from reconnaissance to root"
permalink: /attack-paths/
---

# Attack Path Diagrams
{: .fs-9 }

Visual flowcharts mapping the complete attack chain for 30 popular Hack The Box machines, from initial reconnaissance to root/SYSTEM.
{: .fs-6 .fw-300 }

---

## How to Read These Diagrams

Each diagram traces the full exploitation path for a machine using a top-down flowchart. The color coding indicates the phase of the attack:

- **Green nodes**: Reconnaissance and enumeration
- **Orange nodes**: Initial access / foothold
- **Blue nodes**: Post-exploitation and lateral movement
- **Red nodes**: Privilege escalation
- **Purple nodes**: Root or SYSTEM achieved

Nodes include specific tools, CVEs, credentials, and techniques used at each step. Arrows show the logical progression from one phase to the next.

---

## Easy Machines

### Lame

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["Samba 3.0.20 Detected"]:::recon
    C["CVE-2007-2447: username map script RCE"]:::access
    D["Reverse Shell as Root"]:::root

    A --> B
    B --> C
    C --> D
```

### Blue

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["SMB Vuln Scan: MS17-010 Detected"]:::recon
    C["EternalBlue Exploit via Metasploit"]:::access
    D["SYSTEM Shell"]:::root

    A --> B
    B --> C
    C --> D
```

### Jerry

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap: Port 8080 Open"]:::recon
    B["Tomcat Manager Found"]:::recon
    C["Default Creds: tomcat / s3cret"]:::access
    D["WAR File Deploy: Reverse Shell"]:::access
    E["SYSTEM Shell - Tomcat Runs as SYSTEM"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
```

### Active

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["SMB Shares Enum: Replication Share"]:::recon
    C["Groups.xml Found: GPP cPassword"]:::access
    D["gpp-decrypt: SVC_TGS Credentials"]:::access
    E["Kerberoasting: Administrator TGS Hash"]:::privesc
    F["Hashcat Crack Admin Hash"]:::privesc
    G["PSExec: SYSTEM Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Forest

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["RPC User Enumeration: rpcclient"]:::recon
    C["AS-REP Roast: svc-alfresco Has No Preauth"]:::access
    D["Hashcat Crack: svc-alfresco Password"]:::access
    E["WinRM Shell as svc-alfresco"]:::post
    F["BloodHound: Exchange Windows Permissions Path"]:::post
    G["Add svc-alfresco to Exchange Windows Permissions"]:::privesc
    H["DCSync Attack: Administrator NTLM Hash"]:::privesc
    I["PSExec: Administrator Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Sauna

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Web Enumeration: Employee Names"]:::recon
    B["Username Wordlist: fsmith, hsmith, etc."]:::recon
    C["AS-REP Roast: fsmith Has No Preauth"]:::access
    D["Hashcat Crack: fsmith Password"]:::access
    E["WinRM Shell as fsmith"]:::post
    F["WinPEAS: AutoLogon Creds svc_loanmgr"]:::post
    G["WinRM as svc_loanmgr"]:::privesc
    H["DCSync Attack: Administrator NTLM Hash"]:::privesc
    I["PSExec: Administrator Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Shocker

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["Gobuster: /cgi-bin/ Directory Found"]:::recon
    C["Gobuster: /cgi-bin/user.sh Found"]:::recon
    D["CVE-2014-6271: Shellshock via User-Agent"]:::access
    E["Reverse Shell as www-data"]:::access
    F["sudo -l: perl Has NOPASSWD"]:::privesc
    G["sudo perl -e exec /bin/bash: Root Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Valentine

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["Nmap Script: Heartbleed CVE-2014-0160"]:::recon
    C["Heartbleed Exploit: Memory Leak"]:::access
    D["Base64 SSH Key Extracted from Memory"]:::access
    E["SSH as hype User"]:::post
    F["Enumerate Running Processes"]:::post
    G["tmux Session Running as Root"]:::privesc
    H["Attach to tmux: Root Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

### Cap

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Web Application Enumeration"]:::recon
    B["IDOR on /data/0 Endpoint"]:::recon
    C["PCAP File Download"]:::access
    D["Wireshark: FTP Creds in Cleartext"]:::access
    E["SSH as nathan"]:::post
    F["LinPEAS: Python3 cap_setuid Capability"]:::privesc
    G["Python3 os.setuid 0 + /bin/bash: Root"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Knife

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["HTTP Headers: PHP/8.1.0-dev"]:::recon
    C["Backdoor: User-Agentt Header RCE"]:::access
    D["Reverse Shell as james"]:::access
    E["sudo -l: knife Has NOPASSWD"]:::privesc
    F["sudo knife exec -E: Root Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
```

---

## Medium Machines

### Cronos

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["DNS Zone Transfer: dig axfr"]:::recon
    C["admin.cronos.htb Discovered"]:::recon
    D["SQLi Authentication Bypass"]:::access
    E["Command Injection on Admin Panel"]:::access
    F["Reverse Shell as www-data"]:::access
    G["Cron: Laravel artisan Runs as Root"]:::privesc
    H["Overwrite artisan with PHP Reverse Shell"]:::privesc
    I["Root Shell via Cron Execution"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Jeeves

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["Jenkins on Port 50000"]:::recon
    C["Script Console: Groovy RCE"]:::access
    D["Reverse Shell as kohsuke"]:::access
    E["Enumerate: KeePass Database CEH.kdbx"]:::post
    F["Crack CEH.kdbx: Recover NTLM Hash"]:::privesc
    G["PSExec with NTLM Hash: SYSTEM"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Monteverde

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["RPC User Enumeration"]:::recon
    B["Username List Gathered"]:::recon
    C["Password Spray: SABatchJobs:SABatchJobs"]:::access
    D["SMB Enum: azure.xml Found"]:::access
    E["azure.xml Contains mhope Password"]:::post
    F["WinRM Shell as mhope"]:::post
    G["Azure AD Connect Exploit"]:::privesc
    H["DCSync: Administrator Credentials"]:::privesc
    I["Administrator Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Cascade

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["LDAP Enumeration"]:::recon
    B["Base64 Password in AD Attribute"]:::recon
    C["Decode: r.thompson Credentials"]:::access
    D["SMB: TightVNC Registry Config"]:::access
    E["Decrypt VNC Password: s.smith Credentials"]:::post
    F["SMB: .NET Binary Found"]:::post
    G["Reverse .NET Binary: ArkSvc Password"]:::post
    H["AD Recycle Bin: TempAdmin Object"]:::privesc
    I["TempAdmin Password Reuse: Administrator"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Escape

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["SMB Guest Access: Public Share"]:::recon
    B["PDF with SQL Server Credentials"]:::recon
    C["MSSQL Login: xp_dirtree to Attacker"]:::access
    D["NTLMv2 Hash Captured: sql_svc"]:::access
    E["Hashcat Crack: sql_svc Password"]:::post
    F["WinRM Shell as sql_svc"]:::post
    G["Certify: ESC1 Vulnerable Template"]:::privesc
    H["Request Admin Certificate"]:::privesc
    I["Rubeus: SYSTEM via Certificate Auth"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Intelligence

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["PDF Metadata: Username Extraction"]:::recon
    B["Username Wordlist Built from PDFs"]:::recon
    C["Password Spray: NewIntelligenceCorpUser9876"]:::access
    D["Tiffany.Molina Authenticated"]:::access
    E["DNS Record Pointing to Attacker IP"]:::post
    F["GMSA Password Read: Delegated Account"]:::post
    G["Constrained Delegation Abuse"]:::privesc
    H["S4U2Self / S4U2Proxy: Admin Ticket"]:::privesc
    I["Administrator Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Poison

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["LFI via listfiles.php"]:::recon
    C["pwdbackup.txt: Base64 Encoded x13"]:::access
    D["Decode 13 Times: charix Password"]:::access
    E["SSH as charix"]:::post
    F["VNC Secret File Found"]:::post
    G["Port Forward: VNC on Localhost"]:::privesc
    H["VNC Connect with Secret: Root Desktop"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

---

## Hard Machines

### Reel

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["SMTP User Enumeration"]:::recon
    C["Phishing: Malicious RTF CVE-2017-0199"]:::access
    D["Reverse Shell as tom"]:::access
    E["ACL Enumeration: WriteOwner on claire"]:::post
    F["Take Ownership of claire Account"]:::privesc
    G["claire Owns Backup_Admins Group"]:::privesc
    H["Add claire to Backup_Admins"]:::privesc
    I["Admin Access via Backup_Admins"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Sizzle

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["FTP Anonymous: Writable Share"]:::recon
    C["Upload SCF File to Capture NTLM"]:::access
    D["Responder: amanda NTLMv2 Hash"]:::access
    E["Hashcat Crack: amanda Password"]:::post
    F["ADCS: Request Client Certificate"]:::post
    G["WinRM via Certificate Auth"]:::post
    H["Kerberoast: mrlky TGS Hash"]:::privesc
    I["Hashcat Crack: mrlky Password"]:::privesc
    J["DCSync: Administrator NTLM Hash"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
```

### Blackfield

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Kerbrute: User Enumeration"]:::recon
    B["AS-REP Roast: support Account"]:::recon
    C["Hashcat Crack: support Password"]:::access
    D["BloodHound: ForceChangePassword on audit2020"]:::access
    E["RPC: Change audit2020 Password"]:::post
    F["SMB: Backup Share Access"]:::post
    G["NTDS.dit / lsass Dump: svc_backup Hash"]:::post
    H["WinRM as svc_backup"]:::privesc
    I["Backup Operators: DCSync / NTDS Extract"]:::privesc
    J["Administrator Hash: Domain Admin"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
```

### Object

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap: Jenkins on 8080"]:::recon
    B["Jenkins Token Extraction"]:::recon
    C["API Enumerate AD Users: oliver"]:::access
    D["oliver Shell"]:::access
    E["GenericWrite on smith"]:::post
    F["Targeted Kerberoast: smith TGS"]:::post
    G["smith Shell"]:::post
    H["GenericWrite on maria"]:::privesc
    I["maria Shell"]:::privesc
    J["WriteOwner on Domain Admins"]:::privesc
    K["Add maria to Domain Admins"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
```

### Cerberus

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["Icinga Web Application Found"]:::recon
    C["SSRF on Icinga Web"]:::access
    D["CVE-2022-24716: Arbitrary File Read"]:::access
    E["DC Credentials Extracted"]:::post
    F["ADCS Enumeration: ESC7 Vulnerable"]:::privesc
    G["ESC7 Exploit: Cross-Domain Certificate"]:::privesc
    H["Admin on Both Domains"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

### Rebound

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["AS-REP Roast Enumeration"]:::recon
    B["jjones: No Preauth Required"]:::recon
    C["Hashcat Crack: jjones Password"]:::access
    D["Kerberoast: ServiceMgmt TGS Hash"]:::access
    E["RBCD Abuse: Configure Delegation"]:::post
    F["S4U Attack: winrm_svc Ticket"]:::post
    G["WinRM as winrm_svc"]:::post
    H["ReadGMSAPassword: delegator$ Account"]:::privesc
    I["Constrained Delegation: S4U2Proxy"]:::privesc
    J["DC Admin Shell"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
```

---

## Insane Machines

### Sink

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["HAProxy + Gunicorn Detected"]:::recon
    C["HTTP Request Smuggling: CL.TE"]:::access
    D["Session Hijack: Admin Cookie Stolen"]:::access
    E["Gitea Repositories: AWS Keys Found"]:::post
    F["AWS Secrets Manager Enumeration"]:::post
    G["Secrets Retrieved: Encrypted Blobs"]:::privesc
    H["AWS KMS Decrypt: Root Credentials"]:::privesc
    I["SSH as Root"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Fulcrum

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Nmap Full Port Scan"]:::recon
    B["API Endpoint Discovered"]:::recon
    C["XXE on API: Internal File Read"]:::access
    D["SSRF: Reach Internal Services"]:::access
    E["PowerShell Web Access Found"]:::post
    F["Pivot Through Network 1"]:::post
    G["Pivot Through Network 2"]:::post
    H["Pivot Through Network 3"]:::post
    I["LDAP Credentials Extracted"]:::privesc
    J["Domain Controller Compromise"]:::privesc
    K["Forest Root Compromise"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
```

---

## ProLab Overviews

### Dante ProLab

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["Internet Facing Recon"]:::recon
    B["NIX01: Web Application Exploit"]:::access
    C["Foothold on NIX01"]:::access
    D["Pivot to Subnet 1"]:::post
    E["Credential Reuse Across Hosts"]:::post
    F["SQL01 Compromised"]:::post
    G["Pivot to Subnet 2"]:::privesc
    H["DC01: Domain Controller"]:::privesc
    I["Domain Admin Achieved"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### Offshore ProLab

```mermaid
graph TD
    classDef recon fill:#2d5016,stroke:#9fef00,color:#fff
    classDef access fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef post fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef privesc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef root fill:#3d1a5c,stroke:#b366ff,color:#fff

    A["DMZ Recon and Enumeration"]:::recon
    B["DMZ Web Shell: Initial Foothold"]:::access
    C["Domain 1: Kerberoast Attack"]:::access
    D["Lateral Movement to Domain 2"]:::post
    E["ADCS Abuse in Domain 2"]:::post
    F["Trust Exploitation: Cross-Domain"]:::privesc
    G["Domain 3 Compromised"]:::privesc
    H["Domain 4: Full Forest Admin"]:::root

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

---

## Attack Pattern Summary

The machines above demonstrate recurring attack patterns in HTB and real-world environments:

| Pattern | Machines | Key Takeaway |
|:--------|:---------|:-------------|
| AS-REP Roasting | Forest, Sauna, Blackfield, Rebound | Disable accounts without Kerberos pre-auth or monitor for 4768 events |
| Kerberoasting | Active, Sizzle, Rebound, Offshore | Use long, random service account passwords and AES-only encryption |
| DCSync | Forest, Sauna, Monteverde, Blackfield, Sizzle | Restrict Replicating Directory Changes rights to DCs only |
| ADCS Abuse (ESC1/ESC7) | Escape, Cerberus, Offshore | Audit certificate templates with Certify or Certipy regularly |
| ACL Abuse Chains | Forest, Object, Reel | Use BloodHound to map and remediate dangerous ACL paths |
| Credential Reuse | Cascade, Dante | Enforce unique passwords per service account |
| Default Credentials | Jerry, Jeeves | Never deploy services with default or weak credentials |
| Known CVE Exploitation | Lame, Blue, Shocker, Valentine, Reel, Cerberus | Patch management is the first line of defense |
| HTTP Request Smuggling | Sink | Use consistent HTTP parsers and disable connection reuse between tiers |
| Multi-Network Pivoting | Fulcrum, Dante, Offshore | Segment networks and monitor lateral traffic between zones |
