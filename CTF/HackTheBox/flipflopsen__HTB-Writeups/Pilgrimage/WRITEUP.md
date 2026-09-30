# Pilgrimage

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.219 |
| **Status** | Retired |

## Overview
Pilgrimage is an Easy Linux machine hosting an image-shrinking web application. An exposed `.git` directory leaks the full application source, revealing that it shells out to a bundled, outdated `magick` (ImageMagick) binary. That binary is vulnerable to **CVE-2022-44268**, an arbitrary file read triggered by embedding a crafted `tEXt` chunk in a PNG that is processed by ImageMagick during resize: the resulting "resized" image secretly contains the requested file's contents encoded in hex. This is used to read `/etc/passwd` and, more importantly, the application's SQLite database, yielding a plaintext password reused for SSH. Root is obtained by abusing a root-run `malwarescan.sh` cron job that scans uploaded images with a vulnerable version of `binwalk`, which itself is vulnerable to RCE.

## Reconnaissance
Nmap identified SSH and an nginx-fronted web application:

```
22/tcp open  ssh   OpenSSH 8.4p1 Debian 5+deb11u1
80/tcp open  http  nginx 1.18.0
| http-title: Pilgrimage - Shrink Your Images
| http-git: Git repository found! (10.10.11.219:80/.git/)
```

## Enumeration
The nginx `http-git` script confirmed a publicly accessible `.git` folder. Using `git-dumper`, the full application repository (PHP source and a bundled `magick` binary) was retrieved. Reviewing the code showed the app uses the local `magick` binary: a build of ImageMagick: to shrink uploaded images, and that this specific build was vulnerable to **CVE-2022-44268**.

## Foothold
Exploiting CVE-2022-44268 requires uploading a PNG containing a crafted `tEXt` chunk that names the file to be read; when the server "shrinks" the image, ImageMagick embeds the target file's contents (hex-encoded) into the output PNG's metadata instead of just resizing it. A small Rust proof-of-concept (kept in `files/exploit-CVE-2022-44268.rs`, adapted from the public [emo-crab/CVE-2022-44268 PoC](https://github.com/voidfyoo/CVE-2022-44268)) was used to build the malicious PNGs, one targeting `/etc/passwd` and another targeting `/var/db/pilgrimage`:

```
convert (hex from PNG output) -> ascii
```

Decoding the returned hex from `/var/db/pilgrimage` (the application's SQLite DB) revealed the user `emily` with password `abigchonkyboi123`, which was valid for SSH:

```
emily:abigchonkyboi123
```

## Privilege Escalation
On the box, `sudo -l` and file enumeration showed a root-owned shell script, `/usr/sbin/malwarescan.sh`, running periodically (via cron) that scans newly uploaded images in `/var/www/pilgrimage.htb/shrunk/` using `binwalk`. The installed `binwalk` version (2.3.2) is vulnerable to an OS command injection triggered by carving a malicious embedded file (see [ExploitDB #51249](https://www.exploit-db.com/exploits/51249)). Dropping a crafted image containing a binwalk-triggered payload into the scanned directory caused `malwarescan.sh` to execute it as root, yielding a root shell.

## Lessons Learned
- Exposed `.git` directories on production web servers are a critical information disclosure risk: they can leak entire application source and bundled binaries.
- Vendoring outdated third-party binaries (ImageMagick) inside an application deployment perpetuates known CVEs.
- File-carving/analysis tools such as `binwalk` that are run automatically against attacker-controlled input (and with elevated privileges) must be kept patched.

## Tools & References
- git-dumper, ImageMagick (`convert`), custom Rust PoC, SSH
- **CVE-2022-44268** (ImageMagick arbitrary file read via PNG `tEXt` chunk): PoC source kept at `files/exploit-CVE-2022-44268.rs`.
- Public binwalk RCE: [ExploitDB #51249](https://www.exploit-db.com/exploits/51249)
- Omitted from repository for hygiene:
  - `exploitation/CVE-2022-44268/.git/` and `target/`: the cloned exploit PoC repository and its compiled Rust binary (`cve-2022-44268`, ~7 MB); only the small `src/main.rs` source was kept.
  - `exploitation/CVE-2022-44268/screens/`: four PNG screenshots (up to ~650 KB) demonstrating the PoC in action; not needed to understand the exploit.
  - `files/git/`: the full `git-dumper` output of the target application, including its own `.git` history/pack files and a bundled 27 MB `magick` (ImageMagick) binary. The application PHP source is described above; the binary itself is the vulnerable ImageMagick build referenced by CVE-2022-44268.
