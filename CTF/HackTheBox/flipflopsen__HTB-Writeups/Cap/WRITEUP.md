# Cap

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.245 |
| **Status** | Retired |

## Overview
Cap is an easy Linux machine hosting a "Security Dashboard" web application that lets authenticated staff capture and download network traffic snapshots. An Insecure Direct Object Reference (IDOR) in how these captures are referenced allows any capture to be downloaded by simply changing an ID in the URL, exposing an earlier capture (`data/0`) that contains another user's plaintext FTP/SSH credentials. Those credentials provide an SSH foothold, and a Linux capability assigned to a Python 3 binary is then abused to escalate directly to root.

## Reconnaissance
`nmap` against 10.10.10.245 found:

```
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
|_http-title: Security Dashboard
```

FTP anonymous login was disabled, so the web application on port 80 (a "Security Dashboard") became the focus.

## Enumeration
The dashboard's "Network Status" view leaked internal traffic details, including a DNS query pair (`127.0.0.1:48704 -> 127.0.0.53:53` and `10.10.10.245:53036 -> 1.1.1.1:53`), confirming the box performs live packet capturing for its dashboard feature. A "Security Snapshot" feature linked to `cap.htb/data/5`, i.e. the fifth capture the application generated. Since this identifier is a simple sequential integer with no access control tied to the requesting session, changing it to an earlier value (`cap.htb/data/0`) served the very first capture ever taken on the box: an IDOR vulnerability.

## Foothold
Downloading and opening the `data/0` capture (a `.pcap` file, previously kept as `0.pcap`/`4.pcap`/`5.pcap`/`6.pcap` in this folder) in Wireshark revealed an FTP login in cleartext:

```
Request arg: Buck3tH4TF0RM3!
user: nathan
```

giving the credential pair `nathan:Buck3tH4TF0RM3!`. These credentials were valid over SSH, providing an initial low-privileged shell as `nathan`.

## Privilege Escalation
Checking for Linux capabilities on binaries (`getcap -r / 2>/dev/null`) revealed that the system's Python 3 interpreter had the `cap_setuid` capability assigned. A binary with `cap_setuid+ep` can change its effective UID at will, so Python was used directly to escalate:

```bash
./python -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

This spawned a root-owned bash shell, completing the privilege escalation.

## Lessons Learned
- Sequential, unauthenticated resource identifiers (`/data/<n>`) are a classic IDOR vector: always bind object access to the authenticated user/session, not to a guessable numeric ID.
- Network captures frequently contain cleartext credentials; capturing/storing traffic (even for legitimate "security dashboard" purposes) must be access-controlled as carefully as any other sensitive data store.
- Linux file capabilities (e.g. `cap_setuid` on an interpreter binary) are just as dangerous as SUID root binaries and should be audited with the same rigor (`getcap -r /`).

## Tools & References
- `nmap` for service discovery.
- Wireshark / `tcpdump` for reading the leaked `.pcap` capture and recovering the FTP credentials.
- `getcap`/`setcap` awareness for identifying and abusing the `cap_setuid` capability on the Python 3 binary.
- `0.pcap`, `4.pcap`, `5.pcap`, `6.pcap` (the IDOR-downloaded network capture files, several hundred KB: 1.3MB each): omitted from the repository as raw packet captures; the specific credential leak they contained is reproduced above.
- `user.txt` (the user-level flag) and `motd.legal-displayed` (an empty system marker file): omitted as loot/non-substantive artifacts.
- `config.yml` (an unrelated local LXD/LXC client configuration snippet found alongside the notes, not part of the Cap attack chain): omitted as out-of-scope clutter.
