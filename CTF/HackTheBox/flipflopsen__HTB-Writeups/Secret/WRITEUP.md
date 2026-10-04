# Secret

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.120 |
| **Status** | Retired |

## Overview
Secret is an easy Linux machine centered on a custom Node.js authentication API whose source code is published on the site itself. The published source turns out to be a Git repository; digging through old commits reveals the JWT signing secret, which is used to forge an admin token. The forged token grants access to a vulnerable `/api/logs` endpoint that is susceptible to OS command injection, providing the initial foothold. Privilege escalation revolves around a locally installed C utility that is exploited/debugged (via `valgrind`) to move laterally to root.

## Reconnaissance
```
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3
80/tcp   open  http    nginx 1.18.0 (Ubuntu) - "DUMB Docs"
3000/tcp open  http    Node.js (Express middleware) - "DUMB Docs"
```
Port 80 hosted documentation ("DUMB Docs") for a custom authentication API, and port 3000 served the actual API described in that documentation.

## Enumeration
The documentation linked to the project's source code, downloadable as an archive (kept locally under `Files\Web\files.zip`, since removed: see below). Extracting it showed the working directory was a full `git` repository. Walking the commit history (`git log -p`) surfaced an old `.env` file that had since been removed from the current tree:
```
DB_CONNECT = 'mongodb://127.0.0.1:27017/auth-web'
TOKEN_SECRET = gXr67TtoQL8TShUc8XYsK2HvsBYfyQSFCFZe4MQp7gRpFuMkKjcM72CNQN4fMfbZEKx4i7YiWuNAkmuTcdEriCMm9vPAYkhpwPTiuVwVhvwE
```
This `TOKEN_SECRET` is the HMAC key used to sign the API's JWTs.

## Foothold
A normal user account was registered via `/api/user/register`, and a valid JWT was obtained by logging in. Using `jwt_tool` (or any HS256-capable JWT signer) with the recovered secret, the token's `name` claim was tampered from the registered username to `theadmin`:
```
python3 jwt_tool.py -I -S hs256 -pc 'name' -pv 'theadmin' -p 'gXr67TtoQL8TShUc8XYsK2HvsBYfyQSFCFZe4MQp7gRpFuMkKjcM72CNQN4fMfbZEKx4i7YiWuNAkmuTcdEriCMm9vPAYkhpwPTiuVwVhvwE'
```
The forged, correctly-signed token was then sent to the `/api/logs` endpoint (restricted to `theadmin` in the application logic):
```
GET /api/logs HTTP/1.1
Host: secret.htb:3000
auth-token: <forged-token>
Content-Type: application/json

{"name":"theadmin"}
```
The `name` parameter used to build the log-reading command was not sanitized, allowing OS command injection through this field. A working shell was obtained and upgraded with:
```
python3 -c 'import pty;pty.spawn("/bin/bash")'
```
A helper script, `shellybelly.sh` (kept under `files/`), contains generic reverse-shell one-liners (Python/Perl/nc/PHP/Ruby/Lua) that were staged for use once command execution was confirmed.

## Privilege Escalation
On the host, a SUID/utility binary at `/opt/count` (source recovered as `code.c`, kept under `files/`) was found. The program reads a path, reports character/word/line or directory statistics, and optionally writes results to an attacker-chosen file: the `fopen(path, "a")` append-write on a user-supplied path is the interesting primitive. The program was analyzed locally with `valgrind` (see `valgrind.log`, kept under `files/`) to understand its memory/heap behaviour and confirm the arbitrary/append file write primitive before reproducing it against a privileged target file to escalate.

## Lessons Learned
- Publishing "the source code" of an application is dangerous if the `.git` folder ships with it: history can retain long-removed secrets.
- JWT signing secrets must never be committed to version control, even historically; rotating the secret does not help if old commits remain reachable.
- Custom system utilities that build shell commands or file paths from user input need the same input-validation scrutiny as web endpoints.

## Tools & References
- `jwt_tool`, `git log`/`git show`, `valgrind`, basic Python/Bash reverse shells
- `files.zip` (28.8 MB archive containing the downloaded/extracted application source): omitted; the two extracted trees it contained are described below.
- `Files\Web\Git-Extracted\` (~24,000 files: the full extracted `.git` history of the API source): omitted from the repository (large cloned repository data); the relevant leaked secret is documented above.
- `Files\Web\local-web\` (~8,400 files: a full local clone of the Node.js application, including `node_modules`): omitted; a third-party dependency tree, not original writeup content.
- `count` (compiled ELF binary at `/opt/count`): omitted; compiled binary, its source is preserved as `files/code.c`.
- `dump.zip` (21.8 KB, zipped core dump artifacts from debugging `/opt/count`) and `_opt_count.1000.crash` (an Apport crash-report text file capturing the process's memory mappings): both omitted from the repository; the relevant memory-safety findings from analyzing the binary are captured in `files/valgrind.log`.
