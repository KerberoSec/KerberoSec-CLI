# Static

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.246 |
| **Status** | Retired |

## Overview
Static exposes an EtherNet/IP-flavoured web application on port 8080 that is protected by a login form and a TOTP-based second factor. Default credentials get past the first factor, but the OTP secret has to be recovered from a corrupted database backup found in a hidden, `robots.txt`-disclosed directory. Once authenticated, an OpenVPN profile grants access to an internal Docker network, where an Xdebug-enabled PHP host and a PHP-FPM RCE (CVE-2019-11043) chain together to reach a shell, and further pivoting through an internal PKI server leads to a custom SUID-abuse privilege escalation to root.

## Reconnaissance
An initial `nmap` scan (`nmap/initial`) showed SSH on the default port 22, a second SSH instance on 2222, and an HTTP proxy on 8080:

```
22/tcp   open  ssh
2222/tcp open  ssh (second host key)
8080/tcp open  http-proxy   Apache/2.4.38 (Debian)
```

`robots.txt` on port 8080 disclosed two disallowed paths:

```
Disallow: /vpn/
Disallow: /.ftp_uploads/
```

`/vpn/` presented a login portal, and `/.ftp_uploads/` exposed a `db.sql.gz` backup and a `Warning.txt` file, both directly downloadable.

## Enumeration
The downloaded `db.sql.gz` was corrupted (as `Warning.txt` warned: *"Binary files are being corrupted during transfer, check if recoverable"*). Repairing it required two open-source recovery utilities cloned from GitHub: `yonjar/fixgz` and `gzrecover`: to reconstruct the archive and inflate it. The recovered SQL dump contained the `users` table for the `/vpn/` portal:

```sql
INSERT INTO users (id, username, password, totp)
VALUES (null, 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'orxxi4c7orxwwzlo');
```

The password hash cracked to `admin`, and the `totp` field is a Base32 TOTP seed compatible with the `lfkeitel/phptotp` library found bundled in the `/vpn/` source. Generating a valid OTP code from the seed authenticated fully to the VPN portal, which offered a downloadable `web.ovpn` profile connecting into an internal `172.20.0.0/24` Docker network.

Scanning the internal web host (`nmap/subnet`) revealed an `Apache 2.4.29` server with an `info.php` file (Xdebug remote debugging enabled) and a `/vpn/` directory containing `database.php` with hard-coded MySQL credentials (`root:2108@C00l`) for a `static` database on a separate `172.20.0.11` MariaDB host.

## Foothold
`info.php` confirmed Xdebug was reachable. Using `activate_xdebug.py` and `xdebug_shell.py` (see `Files/`) it is possible to trigger the Xdebug debugger protocol and get arbitrary PHP `eval`/`shell_exec` on the internal web container as `www-data`.

With code execution confirmed, the box was also vulnerable to the PHP-FPM/Xdebug related **CVE-2019-11043** (query-string/`PHP_VALUE` memory-corruption RCE). `Files/phpfpm_cve-2019-11043.py` automates detection and exploitation of this bug against `index.php` to obtain command execution without needing a live Xdebug session, and `Files/xdebug_cve-2019-11043_confirm.py` was used to validate the vulnerability against the target's debugger port.

From the compromised web container, the retrieved MySQL credentials were used to query the `static` MariaDB instance directly:

```
mysql -u root -p2108@C00l -h 172.20.0.11
```

An SSH private key (`id_rsa_www-data`, removed from the repo) obtained via the container was then used to pivot deeper:

```
ssh -i id_rsa_www-data -L 1336:192.168.254.3:80 www-data@10.10.10.246 -p 2222
```

This tunnel exposed a third host (an internal PKI server on `192.168.254.3`) reachable only from the web container. `Files/payload_delivery.py` was used to trigger a reverse-shell payload against this forwarded port via the earlier PHP-FPM primitive, landing a shell as `www-data` on the PKI host.

## Privilege Escalation
On the PKI host, `www-data` could run `/usr/bin/ersatool` (source recovered at `/usr/src/ersatool.c`, kept in `Files/ersatool.c`), a custom binary that shells out to `openssl` using a relative/`PATH`-dependent lookup. Monitoring processes with `pspy64` (public tool, not kept in the repository) revealed the tool's invocation pattern.

The escalation path:
1. Create a fake `openssl` script in `/tmp` (`Files/fake_openssl_privesc.sh`) that sets the SUID bit on `/bin/bash`:
   ```bash
   #!/bin/bash
   chmod u+s /bin/bash
   ```
2. Make it executable and prepend `/tmp` to `PATH`.
3. Run `ersatool`, choose the `create` action so it shells out to what it believes is `openssl`: actually the malicious script in `/tmp`.
4. Once `/bin/bash` is SUID, run `/bin/bash -p` to obtain a root shell.

## Lessons Learned
- Corrupted/truncated backup files can still leak credentials once repaired with standard recovery tools (`gzrecover`, custom gzip-fixers).
- TOTP seeds stored in application databases defeat the purpose of 2FA if the database itself is exposed.
- Debug interfaces (Xdebug) and unpatched PHP-FPM builds are a reliable RCE combination even on otherwise hardened internal hosts.
- Relative-path/`PATH`-trusting SUID or privileged helper binaries remain a classic Linux privilege-escalation vector.

## Tools & References
- `gzrecover` / `yonjar/fixgz`: public GitHub tools used to repair the corrupted `db.sql.gz` archive; cloned copies (including `.git` history and compiled binaries) were removed from this repository for hygiene.
- `pspy64`: public process-monitoring tool used to observe the `ersatool` invocation; the binary was omitted from the repository.
- `id_rsa_www-data`: SSH private key recovered from the web container, used to pivot to the PKI host; omitted from the repository.
- `nc`, compiled `a.out`/`.exe`/`.o` build artifacts from the recovery tools: omitted (compiled binaries, not source).
- OpenVPN profiles (`pki.ovpn`, `pub.ovpn`, `vpn.ovpn`, `web.ovpn`): omitted; personal VPN connection profiles, not part of the writeup narrative.
- CVE-2019-11043 (PHP-FPM RCE via Xdebug/`PHP_VALUE` query-string abuse).
