# Tactics: Hack The Box Writeup

![Difficulty: Starting Point](https://img.shields.io/badge/Difficulty-Starting%20Point-green) ![OS: Windows](https://img.shields.io/badge/OS-Windows-blue) ![Category: Network](https://img.shields.io/badge/Category-Network-orange)

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | Tactics |
| Difficulty | Starting Point |
| Platform | Hack The Box |
| Operating System | Windows |
| IP Address | 10.129.x.x |
| Category | Network / SMB |

---

## Overview

Tactics is a Starting Point machine on Hack The Box designed to introduce fundamental concepts in Windows enumeration, SMB (Server Message Block) services, and remote command execution. This machine demonstrates critical security failures in Windows network configurations, particularly focusing on SMB exposure and administrative share access. The lab provides hands-on experience with essential offensive security tools including Nmap, smbclient, and Impacket's psexec.

**Learning Objectives:**
- Understanding Windows firewall behavior and ICMP filtering
- Performing effective network service enumeration
- Working with SMB protocol and network shares
- Identifying and exploiting administrative shares
- Gaining remote shell access via Impacket tools

---

## Challenge Context

In enterprise Windows environments, SMB is a critical protocol used for file sharing, printer access, and inter-process communication. However, misconfigured SMB services can become a significant security vulnerability. This machine simulates a scenario where SMB has been improperly configured, allowing unauthorized access to administrative shares and ultimately leading to full system compromise.

Understanding how to identify, enumerate, and exploit such misconfigurations is essential for both penetration testers and system administrators who need to secure their networks against similar attacks.

---

## Enumeration

### Initial Network Scan

The first step in any penetration test is to identify what services are running on the target. However, Windows systems often have ICMP (ping) disabled by default through the Windows Firewall, which can interfere with Nmap's default host discovery process.

#### Host Discovery Bypass

**Question:** Why does Nmap need a specific flag for this Windows target?

**Answer:** Windows Firewall blocks ICMP echo requests by default. Without special configuration, Nmap will mark the host as "down" and skip port scanning entirely.

**Solution:** Use the `-Pn` flag to disable ping-based host discovery.

```bash
nmap -Pn 10.129.x.x
```

**What does `-Pn` do?**
- Treats all hosts as online
- Skips the ping sweep phase
- Proceeds directly to port scanning
- Essential when ICMP is blocked

### Service Enumeration

With host discovery disabled, we can now perform a comprehensive port scan to identify running services.

```bash
nmap -Pn -sV -sC -p- 10.129.x.x
```

**Nmap flags explained:**
- `-Pn` - Skip host discovery
- `-sV` - Version detection for services
- `-sC` - Run default scripts
- `-p-` - Scan all 65535 ports

#### Scan Results

**Question:** What network protocol is commonly used for file sharing in Windows environments?

**Answer:** SMB (Server Message Block)

**Question:** What port does SMB typically run on?

**Answer:** TCP port 445

**Common SMB-related ports:**
- **Port 139**: SMB over NetBIOS
- **Port 445**: SMB over TCP (modern, direct)

The scan reveals that the target is running SMB services, which is a promising attack vector for Windows systems.

---

## SMB Analysis

### Understanding SMB

**Server Message Block (SMB)** is a network protocol that enables:
- File and folder sharing
- Printer sharing  
- Inter-process communication (IPC)
- Remote procedure calls (RPC)

**Security Implications:**
- Often misconfigured in enterprise environments
- Can expose sensitive files and directories
- May allow null or guest authentication
- Administrative shares provide system-level access

### Enumerating SMB Shares

The next step is to list what shares are available on the target system.

**Question:** What tool can we use to enumerate SMB shares from Linux?

**Answer:** `smbclient`

**Question:** What flag does smbclient use to list available shares?

**Answer:** `-L` (List)

```bash
smbclient -L //10.129.x.x -N
```

**Command breakdown:**
- `-L` - List available shares
- `//10.129.x.x` - Target host
- `-N` - No password (null session)

#### Understanding Share Types

**Common Windows Shares:**

1. **Default Shares** (created automatically):
   - `C$` - Entire C: drive
   - `ADMIN$` - Windows directory
   - `IPC$` - Inter-process communication

2. **User Shares** (custom created):
   - File sharing folders
   - Department directories
   - Project folders

**Question:** What special character indicates an administrative share?

**Answer:** The dollar sign `$`

Administrative shares are hidden shares created by Windows that provide administrative access to system resources. They don't appear in normal network browsing but can be accessed directly if you know their names.

### Accessing Administrative Shares

**Question:** Which administrative share provides access to the entire file system?

**Answer:** `C$`

The `C$` share is particularly dangerous as it provides complete access to the primary drive, including system files, user directories, and sensitive data.

#### Connecting to C$

```bash
smbclient //10.129.x.x/C$ -N
```

If successful, you'll be presented with an SMB prompt:

```
smb: \>
```

---

## File Interaction

Once connected to an SMB share, you can interact with the remote file system using familiar commands.

### Common SMB Commands

```bash
smb: \> ls                    # List files and directories
smb: \> cd Users              # Change directory
smb: \> pwd                   # Print working directory
smb: \> get filename.txt      # Download a file
smb: \> put localfile.txt     # Upload a file
smb: \> help                  # Show available commands
```

**Question:** What command downloads files from an SMB share?

**Answer:** `get`

### File Retrieval Example

```bash
smb: \> cd Users\Administrator\Desktop
smb: \Users\Administrator\Desktop\> ls
smb: \Users\Administrator\Desktop\> get flag.txt
getting file \Users\Administrator\Desktop\flag.txt of size 34 as flag.txt
```

**Why is file retrieval important?**
- Exfiltrate sensitive data
- Gather intelligence about the system
- Find credentials stored in files
- Locate configuration files with passwords

---

## Exploitation

### Remote Command Execution with Impacket

While file access is valuable, the ultimate goal in penetration testing is often to obtain an interactive shell that allows command execution.

**Question:** What tool from the Impacket suite can we use to get a remote shell?

**Answer:** `psexec.py`

### Understanding Impacket's psexec

**Impacket** is a collection of Python classes for working with network protocols. The `psexec.py` script mimics the functionality of Microsoft's PsExec tool, which allows remote command execution.

**How psexec.py works:**
1. Connects to the target via SMB
2. Uploads a service binary to `ADMIN$`
3. Creates and starts a Windows service
4. The service executes commands and returns output
5. Provides an interactive shell experience

### Execution

```bash
psexec.py administrator@10.129.x.x
```

**Alternative syntax:**
```bash
impacket-psexec administrator@10.129.x.x
```

**If authentication is required:**
```bash
psexec.py administrator:password@10.129.x.x
```

**Successful execution results in:**
```
C:\Windows\system32>
```

You now have a SYSTEM-level shell on the target machine!

### Post-Exploitation

With shell access, you can:

```cmd
C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> hostname
TACTICS

C:\Windows\system32> ipconfig
[Network configuration details]

C:\Windows\system32> cd C:\Users\Administrator\Desktop

C:\Users\Administrator\Desktop> type flag.txt
HTB{flag_content_here}
```

---

## Attack Chain Summary

```
1. Network Scan (-Pn bypass)
         ↓
2. Service Identification (SMB on 445)
         ↓
3. Share Enumeration (smbclient -L)
         ↓
4. Administrative Share Access (C$)
         ↓
5. File Retrieval (get command)
         ↓
6. Remote Shell (psexec.py)
         ↓
7. SYSTEM Access Achieved
```

---

## Key Concepts Learned

### Technical Skills
- **ICMP Filtering**: Understanding why `-Pn` is necessary for Windows targets
- **SMB Protocol**: How file sharing works in Windows networks
- **Administrative Shares**: The danger of exposed `$` shares
- **Null Sessions**: Accessing SMB without credentials
- **Impacket Tools**: Using psexec.py for remote execution

### Security Implications
- Default Windows configurations can be exploited
- Administrative shares should be restricted
- Firewall rules must consider multiple attack vectors
- Network segmentation is critical
- Credential security prevents lateral movement

### Tools Mastered
- **Nmap**: Network scanning and service enumeration
- **smbclient**: SMB share enumeration and file access
- **Impacket psexec**: Remote command execution

---

## Mitigation Strategies

To defend against attacks demonstrated in this lab:

### Network Level
1. **Firewall Configuration**
   - Block SMB (ports 139, 445) at network perimeter
   - Implement network segmentation
   - Use VLANs to isolate sensitive systems

2. **Access Controls**
   - Disable administrative shares when not needed
   - Implement strict authentication requirements
   - Use SMB signing to prevent man-in-the-middle attacks

### System Level
3. **Authentication**
   - Disable null sessions
   - Enforce strong password policies
   - Implement multi-factor authentication

4. **Monitoring**
   - Log SMB access attempts
   - Alert on administrative share access
   - Monitor for psexec-like activity

### Best Practices
5. **Least Privilege**
   - Limit administrative access
   - Use Just-In-Time (JIT) administration
   - Regular access reviews

6. **Patching**
   - Keep Windows updated
   - Patch SMB vulnerabilities promptly
   - Disable SMBv1 (deprecated and vulnerable)

---

## Questions & Answers

| Question | Answer |
|----------|--------|
| What Nmap flag disables host discovery? | `-Pn` |
| What protocol is used for Windows file sharing? | SMB |
| What port does SMB run on? | 445 |
| What smbclient flag lists shares? | `-L` |
| What character indicates administrative shares? | `$` |
| What share provides access to the C: drive? | `C$` |
| What command downloads files via SMB? | `get` |
| What Impacket tool provides remote shell access? | `psexec.py` |

---

## Final Status

- ✅ **Enumeration:** Complete
- ✅ **SMB Access:** Successful
- ✅ **File Retrieval:** Achieved
- ✅ **Shell Access:** Obtained
- ✅ **User Flag:** Captured
- ✅ **Root Flag:** Owned

---

## References & Resources

**Official Documentation:**
- [Nmap Reference Guide](https://nmap.org/book/man.html)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)
- [Microsoft SMB Documentation](https://docs.microsoft.com/en-us/windows/win32/fileio/microsoft-smb-protocol-and-cifs-protocol-overview)

**Further Reading:**
- [SMB Security Best Practices](https://docs.microsoft.com/en-us/windows-server/storage/file-server/smb-security)
- [Windows Administrative Shares Explained](https://docs.microsoft.com/en-us/troubleshoot/windows-server/networking/inter-process-communication-share-null-session)
- [Impacket Tool Suite Overview](https://www.secureauth.com/labs/open-source-tools/impacket/)

---

## Conclusion

The Tactics machine provides an excellent introduction to Windows network security concepts. Through this lab, we've learned how a seemingly simple misconfiguration: exposed administrative shares: can lead to complete system compromise. 

The attack chain demonstrated here is realistic and commonly encountered in real-world penetration tests. Many organizations still have legacy systems or misconfigurations that allow this type of access. Understanding both the offensive techniques and defensive countermeasures is essential for cybersecurity professionals.

**Key Takeaways:**
- Always consider ICMP filtering when scanning Windows targets
- SMB enumeration is a critical skill in Windows pentesting
- Administrative shares represent a significant attack surface
- Proper configuration and network segmentation are essential defenses
- Tools like Impacket make exploitation accessible but highlight the need for robust security

**GitHub:** [https://github.com/gresium](https://github.com/gresium)  
**LinkedIn:** [Connect with me](https://linkedin.com/in/gresahisa)

---

*This writeup is for educational purposes only. Always obtain proper authorization before conducting security assessments.*
