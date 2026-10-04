# Pit

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.241 |
| **Status** | Retired |

## Overview
Pit is a Medium CentOS 8 Linux machine that centers on SNMP enumeration. The default `public` SNMP community string leaks system and filesystem information that points to a SeedDMS document management system running behind an internal Apache instance (proxied on port 9090 via Cockpit/`dms-pit.htb`). SeedDMS is vulnerable to an authenticated RCE (related to CVE-2019-12744-class flaws) because `.htaccess` protections meant for Apache are ineffective on nginx, exposing a PHP file-write primitive. This is used to get a shell, and further enumeration of LDAP and root's crontab/SSH configuration leads to full root access.

## Reconnaissance
Nmap TCP scan showed SSH and an HTTPS admin panel (Cockpit) on port 9090 with a certificate naming `dms-pit.htb`:

```
22/tcp   open  ssh
9090/tcp open  zeus-admin  (ssl-cert CN=dms-pit.htb)
```

A UDP scan revealed SNMP (v1/v3) with the default `public` community string:

```
161/udp open  snmp  SNMPv1 server; net-snmp SNMPv3 server (public)
```

## Enumeration
`snmpwalk -v1 -c public 10.10.10.241 -m ALL` returned OS/version details (`Linux pit.htb 4.18.0-240.22.1.el8_3.x86_64`, CentOS 8) and, notably, SELinux login mappings revealing a user, `michelle`, mapped to the unconfined SELinux context. Adding `dms-pit.htb` to `/etc/hosts` and browsing to it revealed a SeedDMS instance at `/seeddms51x/seeddms`, reachable with `michelle:michelle`.

Reviewing SeedDMS's document storage path (`/var/www/html/seeddms51x/seeddms`) and its `.htaccess` (kept at `files/htaccess`) showed that the application relies on Apache directory restrictions (blocking direct execution of files under `data/`) that do not carry over when the site is served through nginx: allowing direct requests to uploaded/cached PHP files under `data/<id>/...`.

## Foothold
A crafted request against the unprotected data path executed arbitrary commands via a small PHP webshell (`dumb.php`, kept at `files/dumb.php`) that was uploaded through SeedDMS and then invoked directly:

```
GET /seeddms51x/data/1048576/33/1.php?cmd=cat%20/var/www/html/seeddms51x/conf/settings.xml HTTP/1.1
Host: dms-pit.htb
```

Reading `settings.xml` exposed the SeedDMS SQLite credentials:

```
dbDriver="sqlite" dbUser="seeddms" dbPass="seeddms"
```

Chaining the webshell RCE with the recovered SeedDMS session ultimately yielded a foothold, and reuse of a recovered password (`seeddms:ied^ieY6xoquu`) against `michelle`'s SSH account on port 9090's underlying host succeeded:

```
michelle:ied^ieY6xoquu -> SSH to pit.htb
```

## Privilege Escalation
As `michelle`, `sudo -l`-style enumeration and file review of `/root/.ssh/` and cron configuration showed a script (`checklul.sh`) intended for adding an SSH public key to `/root/.ssh/authorized_keys`. Using this persistence/privesc primitive (the key insertion script, kept at `files/checklul.sh`), an attacker-controlled public key was appended to root's `authorized_keys`, granting a direct root SSH login.

## Lessons Learned
- Default SNMP community strings (`public`) leak significant host and user information and should always be disabled or restricted.
- Security controls implemented purely at the web-server-config layer (Apache `.htaccess`) do not transfer when the application is proxied through a different server (nginx): access control must be enforced by the application itself.
- Credential reuse across services (SeedDMS DB password reused for a Unix account) remains one of the most common privilege-escalation vectors.

## Tools & References
- snmpwalk, ffuf/gobuster, custom PHP webshell (`files/dumb.php`)
- SeedDMS vulnerability class related to **CVE-2019-12744**
- Omitted from repository for hygiene:
  - `CHANGELOG`: the upstream SeedDMS project changelog (~99 KB), unrelated to the attack narrative; refer to the [SeedDMS project](https://www.seeddms.org/) for version history.
  - `htaccess` root copy: default SeedDMS Apache rules; summarized above, original removed to reduce clutter.
