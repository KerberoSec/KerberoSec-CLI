# OpenAdmin

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.171 |
| **Status** | Retired |

## Overview
OpenAdmin is an Easy Linux machine built around an outdated OpenNetAdmin (ONA) installation. Exploiting a known unauthenticated RCE in ONA provides a foothold, and database credentials found in its configuration are reused to move laterally to a low-privileged user. That user has access to a restricted internal PHP application which discloses a second user's SSH private key, and a sudo misconfiguration is finally exploited for root.

## Reconnaissance
```
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
80/tcp open  http    Apache httpd 2.4.29 (Ubuntu) - default page
```
`gobuster` directory brute-forcing against port 80 revealed several hidden paths:
```
/music                (Status: 301)
/artwork              (Status: 301)
/server-status        (Status: 403)
/sierra               (Status: 301)  -> WordPress site
```

## Enumeration
Deeper enumeration under `/music` uncovered an OpenNetAdmin instance (v18.1.1). This version is affected by a public, unauthenticated remote-code-execution vulnerability in its `xajax` AJAX endpoint (the request handler passes the `ip` parameter unsanitized into a shell command).

## Foothold
`files/exploit.py` (public PoC by @amriunix) automates the injection:

```bash
python3 exploit.py exploit http://10.10.10.171/ona
```
It POSTs a crafted `xajax=window_submit` request with a `tooltips`/`ip=>;<cmd>;echo "END"` payload to `ona/index.php`, returning command output between `BEGIN`/`END` markers. `files/47691.sh` implements the same idea as an interactive pseudo-shell loop using `curl`. Reading ONA's database configuration file disclosed credentials, and reusing a variant of them (`jimmy:n1nj4W4rri0R!`) provided SSH access as the `jimmy` user.

## Privilege Escalation
As `jimmy`, an internal-only vhost (mirrored locally under `files/internal/`) hosted a login-restricted PHP panel (`index.php`) that authenticates via a SHA-512 hash check, and `main.php`: reachable only after login: directly discloses another user's SSH private key:

```php
$output = shell_exec('cat /home/joanna/.ssh/id_rsa');
echo "<pre>$output</pre>";
```
The recovered (passphrase-protected) private key for `joanna` was cracked/unlocked with `ssh2john`/`john` using the password hint "ninja", and combined with the plaintext credential `joanna:bloodninjas` found alongside it, SSH access as `joanna` was obtained.

## Privilege Escalation (root)
`sudo -l` as `joanna` showed a NOPASSWD entry allowing her to run `nano` as `root` against a specific file. Since `nano` has no restricted mode, it can be used to spawn a root shell directly from its built-in shell-execution shortcut, immediately granting full root access.

## Lessons Learned
- Unauthenticated RCE in unmaintained internal tools (OpenNetAdmin) is a common initial-access vector: such tools should never be internet-facing without patching.
- Credential reuse between a CMS's database config and actual user/SSH accounts is a frequent lateral-movement path.
- Disclosing a private key through an internal "trusted" web panel defeats the purpose of key-based auth: sensitive file reads must never be exposed through application logic.
- Sudo rules that whitelist full-featured editors (like `nano`, `vim`) are effectively unrestricted root access via GTFOBins-style shell escapes.

## Tools & References
- `files/exploit.py`: OpenNetAdmin 18.1.1 unauthenticated RCE PoC (by @amriunix).
- `files/47691.sh`: interactive `curl`-based shell wrapper around the same ONA RCE endpoint.
- `files/internal/index.php`, `files/internal/main.php`, `files/internal/logout.php`: mirrored copies of the internal panel pages that disclosed the `joanna` SSH key.
- `joanna_ssh_key.enc`: the encrypted `id_rsa` private key recovered via the internal panel: omitted from the repository as private key material; it is described above and was cracked with `john`/`ssh2john`.
- GTFOBins (`nano`): used to escalate from `joanna` to `root` through the sudo misconfiguration.
