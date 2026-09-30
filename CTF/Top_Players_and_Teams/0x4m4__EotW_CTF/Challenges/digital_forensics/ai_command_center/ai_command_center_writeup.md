---
title: "AI Command Center: EotW CTF SS CASE IT 2025 Forensics Writeup"
date: "2025-05-27"
description: "Deep disk forensics analysis of an AI regime command center server: uncovering hidden partitions and encrypted secrets"
tags: ["ctf", "forensics", "disk-analysis", "sleuth-kit", "file-carving", "encryption", "ss-case-it-2025"]
---

# AI Command Center: EotW CTF SS CASE IT 2025 Forensics Writeup

## Challenge Overview

In a daring infiltration operation, our resistance operatives have successfully breached one of the AI regime's most secure command centers. During the raid, they managed to extract a complete disk image from a critical database server before the facility's security systems could respond. This disk image potentially contains vital intelligence about the regime's operations, including access credentials, operational databases, and encrypted communications.

The forensic analysis of this disk image represents our best opportunity to understand the regime's infrastructure and potentially discover backdoors or vulnerabilities we can exploit in future operations.

**Challenge Details:**
- **Name:** AI Command Center
- **Category:** Forensics
- **Difficulty:** Hard
- **Points:** 300
- **Flag Format:** `sscit{...}`

## The Mission Brief

Intelligence suggests that the captured disk image contains multiple partitions with varying levels of security. The regime's paranoid security protocols mean that sensitive information is likely scattered across different partitions, with some data encrypted and others potentially deleted but recoverable through forensic techniques.

Our digital forensics team has identified several potential locations where critical access tokens might be hidden:
- System configuration files
- Database entries
- Deleted files requiring recovery
- Encrypted content needing decryption
- Backup files and logs

The mission is clear: perform a comprehensive forensic analysis of the disk image to locate the access token that will grant us deeper access to the regime's network infrastructure.

## Initial Reconnaissance

Upon receiving the disk image file `ai_server_disk.img`, I began with a systematic forensic approach:

### File Analysis
```bash
# Basic file information
file ai_server_disk.img
# Output: ai_server_disk.img: DOS/MBR boot sector

# Check file size
ls -lh ai_server_disk.img
# Output: -rw-r--r-- 1 user user 20M May 27 10:00 ai_server_disk.img

# Calculate hash for integrity verification
sha256sum ai_server_disk.img
```

### Disk Structure Analysis

Using The Sleuth Kit (TSK) to analyze the disk structure:

```bash
# Identify partition layout
mmls ai_server_disk.img
```

This revealed a multi-partition disk structure:
```
DOS Partition Table
Offset Sector: 0
Units are in 512-byte sectors

      Slot      Start        End          Length       Description
000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)
001:  -------   0000000000   0000002047   0000002048   Unallocated
002:  000:000   0000002048   0000012287   0000010240   Linux (0x83)
003:  000:001   0000012288   0000022527   0000010240   Linux (0x83)
004:  000:002   0000022528   0000040959   0000018432   Linux (0x83)
```

The analysis revealed three Linux partitions, suggesting a complex storage structure typical of secure server environments.

## Forensic Investigation

### Partition 1 Analysis (Offset 2048)

Starting with the first partition, I used `fls` to explore the file system:

```bash
# List files in the first partition
fls -o 2048 ai_server_disk.img
```

This revealed a standard Linux file system structure with several interesting directories:
- `/etc/` - System configuration files
- `/bin/` - System binaries
- `/var/` - Variable data including logs
- `/home/` - User directories

#### System Configuration Analysis

```bash
# Examine crontab for scheduled tasks
icat -o 2048 ai_server_disk.img [CRONTAB_INODE] > crontab.txt
cat crontab.txt
```

The crontab file contained suspicious entries:
```bash
# AI Regime Automated Tasks
0 */6 * * * /bin/backdoor.sh > /dev/null 2>&1
30 2 * * * /bin/cleanup_logs.sh
# Access token backup: sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}
```

**First flag location discovered!** The access token was hidden as a comment in the crontab file.

#### Binary Analysis

```bash
# Extract the backdoor script
icat -o 2048 ai_server_disk.img [BACKDOOR_INODE] > backdoor.sh
cat backdoor.sh
```

The backdoor script revealed:
```bash
#!/bin/bash
# AI Regime Backdoor Access Script
# Maintenance access for surveillance units

echo "Initializing backdoor access..."
ACCESS_TOKEN="sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}"
echo "Access granted with token: $ACCESS_TOKEN"

# Connect to command center
curl -H "Authorization: Bearer $ACCESS_TOKEN" https://command.ai-regime.net/api/status
```

**Second flag location confirmed!** The same access token was embedded in the backdoor script.

### Partition 2 Analysis (Offset 12288)

Moving to the second partition:

```bash
# Explore second partition
fls -o 12288 ai_server_disk.img
```

This partition contained database files and configuration data:

#### Database Analysis

```bash
# Extract database file
icat -o 12288 ai_server_disk.img [DB_INODE] > users.db

# Analyze SQLite database
sqlite3 users.db
.tables
.schema users
SELECT * FROM users WHERE role='admin';
```

The database query revealed:
```sql
id|username|password_hash|role|access_token
1|admin|$2b$12$...|admin|sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}
2|surveillance_unit_a7|$2b$12$...|operator|limited_access_token
```

**Third flag location found!** The admin user's access token contained our target flag.

#### Configuration Files

```bash
# Extract API configuration
icat -o 12288 ai_server_disk.img [CONFIG_INODE] > api.conf
cat api.conf
```

The API configuration file contained:
```ini
[security]
master_key = regime_secure_2025
access_key = sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}
encryption_enabled = true

[database]
host = localhost
port = 5432
```

**Fourth flag location confirmed!** The access key in the configuration matched our target.

#### Backup Files

```bash
# Extract backup credentials
icat -o 12288 ai_server_disk.img [BACKUP_INODE] > credentials.bak
cat credentials.bak
```

The backup file revealed:
```
AI REGIME BACKUP CREDENTIALS
Generated: 2025-05-27 10:00:00

Primary Access Token: sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}
Backup Access Token: backup_token_2025
Emergency Override: emergency_access_code
```

**Fifth flag location discovered!** The primary access token in the backup file matched our target.

### Deleted File Recovery

Using file carving techniques to recover deleted files:

```bash
# Use foremost for file carving
foremost -t txt -i ai_server_disk.img -o recovered_files

# Check recovered files
find recovered_files -name "*.txt" -exec grep -l "sscit{" {} \;
```

The file carving operation recovered a deleted file `backdoor_access.txt`:
```
DELETED FILE RECOVERY
Original path: /config/backdoor_access.txt

AI REGIME BACKDOOR ACCESS CONFIGURATION
This file was scheduled for deletion but contains critical access information.

Backdoor Access Token: sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}
Last Modified: 2025-05-27 09:45:00
Status: ACTIVE
```

**Sixth flag location recovered!** The deleted file contained the same access token.

### Partition 3 Analysis (Offset 22528)

The third partition contained encrypted content:

```bash
# Explore third partition
fls -o 22528 ai_server_disk.img
```

#### Encrypted File Analysis

```bash
# Extract encrypted file
icat -o 22528 ai_server_disk.img [ENCRYPTED_INODE] > secure_access.enc

# Attempt decryption with common passwords
openssl enc -d -aes-256-cbc -pbkdf2 -in secure_access.enc -out decrypted.txt -pass pass:resistance
```

The decryption was successful using the password "resistance":
```
AI REGIME ENCRYPTED ACCESS FILE
Classification: TOP SECRET

This file contains the master access token for emergency situations.
The token provides full administrative access to all regime systems.

Master Access Token: sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}

WARNING: This token grants unrestricted access. Use only in emergency situations.
```

**Seventh flag location decrypted!** The encrypted file contained the master access token.

## Complete Forensic Analysis Script

Here's a comprehensive script for automated analysis:

```bash
#!/bin/bash

echo "=== AI Command Center Forensic Analysis ==="
echo "Analyzing captured disk image from regime command center..."

DISK_IMAGE="ai_server_disk.img"
OUTPUT_DIR="forensic_analysis"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Verify disk image integrity
echo "Calculating disk image hash..."
sha256sum "$DISK_IMAGE" > "$OUTPUT_DIR/disk_hash.txt"

# Analyze partition structure
echo "Analyzing partition structure..."
mmls "$DISK_IMAGE" > "$OUTPUT_DIR/partition_layout.txt"

# Function to extract and analyze files from a partition
analyze_partition() {
    local offset=$1
    local partition_name=$2
    
    echo "Analyzing $partition_name (offset: $offset)..."
    
    # List files in partition
    fls -o "$offset" "$DISK_IMAGE" > "$OUTPUT_DIR/${partition_name}_files.txt"
    
    # Extract interesting files based on common locations
    while IFS= read -r line; do
        if [[ $line == *"crontab"* ]] || [[ $line == *"backdoor"* ]] || [[ $line == *"config"* ]]; then
            inode=$(echo "$line" | awk '{print $2}' | tr -d ':')
            filename=$(echo "$line" | awk '{print $3}')
            
            if [[ $inode =~ ^[0-9]+$ ]]; then
                echo "Extracting $filename (inode: $inode)..."
                icat -o "$offset" "$DISK_IMAGE" "$inode" > "$OUTPUT_DIR/${partition_name}_${filename}"
                
                # Search for flag in extracted file
                if grep -q "sscit{" "$OUTPUT_DIR/${partition_name}_${filename}" 2>/dev/null; then
                    echo "*** FLAG FOUND in $filename ***"
                    grep "sscit{" "$OUTPUT_DIR/${partition_name}_${filename}"
                fi
            fi
        fi
    done < "$OUTPUT_DIR/${partition_name}_files.txt"
}

# Analyze each partition
analyze_partition 2048 "partition1"
analyze_partition 12288 "partition2"
analyze_partition 22528 "partition3"

# File carving for deleted files
echo "Performing file carving to recover deleted files..."
foremost -t txt -i "$DISK_IMAGE" -o "$OUTPUT_DIR/carved_files" 2>/dev/null

# Search carved files for flags
if [ -d "$OUTPUT_DIR/carved_files" ]; then
    find "$OUTPUT_DIR/carved_files" -type f -exec grep -l "sscit{" {} \; 2>/dev/null | while read -r file; do
        echo "*** FLAG FOUND in carved file: $file ***"
        grep "sscit{" "$file"
    done
fi

# Attempt to decrypt encrypted files
echo "Attempting to decrypt encrypted files..."
find "$OUTPUT_DIR" -name "*.enc" -o -name "*encrypted*" | while read -r enc_file; do
    echo "Trying to decrypt: $enc_file"
    
    # Try common passwords
    for password in "resistance" "admin" "password" "regime" "ai2025"; do
        if openssl enc -d -aes-256-cbc -pbkdf2 -in "$enc_file" -out "${enc_file}.decrypted" -pass "pass:$password" 2>/dev/null; then
            echo "Successfully decrypted $enc_file with password: $password"
            
            if grep -q "sscit{" "${enc_file}.decrypted" 2>/dev/null; then
                echo "*** FLAG FOUND in decrypted file ***"
                grep "sscit{" "${enc_file}.decrypted"
            fi
            break
        fi
    done
done

echo "Forensic analysis complete. Check $OUTPUT_DIR for extracted files."
```

## Advanced Forensic Techniques

### Timeline Analysis

```bash
# Create timeline of file system activity
fls -m / -o 2048 ai_server_disk.img > partition1_timeline.txt
fls -m / -o 12288 ai_server_disk.img > partition2_timeline.txt
fls -m / -o 22528 ai_server_disk.img > partition3_timeline.txt

# Sort by modification time
sort -k 4 partition1_timeline.txt > partition1_sorted.txt
```

### Metadata Analysis

```bash
# Extract detailed metadata
istat -o 2048 ai_server_disk.img [INODE_NUMBER]

# Analyze file slack space
blkstat -o 2048 ai_server_disk.img [BLOCK_NUMBER]
```

### String Analysis

```bash
# Extract all strings from the disk image
strings ai_server_disk.img > all_strings.txt

# Search for potential flags or credentials
grep -E "sscit\{.*\}" all_strings.txt
grep -i "password\|token\|key\|access" all_strings.txt
```

## Security Analysis and Lessons Learned

### Forensic Artifacts Discovered

1. **Multiple Storage Locations:** The flag was intentionally stored in multiple locations, demonstrating redundancy in the regime's security systems
2. **Poor Operational Security:** Sensitive tokens were stored in plaintext in multiple configuration files
3. **Inadequate Deletion:** Deleted files were recoverable using standard forensic techniques
4. **Weak Encryption:** The encrypted file used a predictable password related to the resistance theme
5. **Logging Failures:** No evidence of proper audit logging or access monitoring

### Attack Vectors Identified

1. **Configuration File Exposure:** Critical tokens stored in readable configuration files
2. **Backup Security:** Backup files contained unencrypted sensitive information
3. **Script Security:** Hardcoded credentials in executable scripts
4. **Database Security:** Admin credentials stored with insufficient protection
5. **Encryption Weaknesses:** Predictable passwords and poor key management

## Prevention and Mitigation

### For Blue Team Defense

```bash
# Implement secure deletion
shred -vfz -n 3 sensitive_file.txt

# Use proper encryption with strong keys
openssl rand -base64 32 > encryption.key
openssl enc -aes-256-cbc -pbkdf2 -in plaintext.txt -out encrypted.txt -pass file:encryption.key

# Implement file integrity monitoring
aide --init
aide --check

# Secure configuration management
chmod 600 sensitive_config.conf
chown root:root sensitive_config.conf
```

### Security Recommendations

1. **Credential Management:** Use dedicated secret management systems
2. **Encryption Standards:** Implement strong encryption with proper key rotation
3. **Secure Deletion:** Use cryptographic erasure for sensitive data
4. **Access Controls:** Implement proper file permissions and access controls
5. **Audit Logging:** Maintain comprehensive audit trails
6. **Regular Security Reviews:** Conduct periodic security assessments

## Conclusion

The forensic analysis of the AI Command Center disk image revealed a treasure trove of intelligence about the regime's security practices. Through systematic analysis of multiple partitions, file recovery techniques, and decryption efforts, we successfully located the access token `sscit{h1dd3n_p4rt1t10ns_r3v34l_s3cr3t_d00rs}` in seven different locations across the disk image.

This challenge demonstrated several critical forensic skills:

1. **Disk Image Analysis:** Understanding partition structures and file systems
2. **File System Forensics:** Extracting and analyzing files from disk images
3. **Data Recovery:** Recovering deleted files using carving techniques
4. **Cryptanalysis:** Decrypting encrypted content with password attacks
5. **Comprehensive Investigation:** Examining multiple data sources for complete intelligence

The multiple flag locations taught an important lesson: thorough forensic analysis requires examining every possible data source. The regime's poor security practices: storing sensitive tokens in multiple plaintext locations: provided numerous attack vectors that a skilled forensic analyst could exploit.

This intelligence breakthrough brings us one step closer to dismantling the AI regime's oppressive surveillance network. Every recovered credential, every decrypted file, and every forensic artifact contributes to our ultimate goal of digital liberation.

The resistance continues, one disk sector at a time.

---

*This writeup is part of my CTF journey documenting the techniques and methodologies used in cybersecurity competitions. For more writeups and cybersecurity content, visit [0x4m4.com](https://0x4m4.com)* 