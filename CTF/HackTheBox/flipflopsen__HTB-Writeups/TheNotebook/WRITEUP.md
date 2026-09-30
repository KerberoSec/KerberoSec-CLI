# TheNotebook

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.230 |
| **Status** | Retired |

## Overview
TheNotebook is a note-keeping web application ("The Notebook: Your Note Keeper") secured with a JWT-based authentication scheme. The signing key referenced in the JWT header is fetched from a URL that the application trusts implicitly, which allows an attacker to redirect that URL to an attacker-controlled key pair and forge an administrator token. Admin access unlocks a file-upload feature that is abused for PHP remote code execution, after which a locally exposed Docker socket and CVE-2019-5736 (a `runc`/`docker exec` container-escape) are used to break out of a development container and reach root on the host.

## Reconnaissance
`nmap -sC -sV` (`nmap/initial`) found:
```
22/tcp    open     ssh   OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
80/tcp    open     http  nginx 1.14.0 (Ubuntu): "The Notebook - Your Note Keeper"
10010/tcp filtered rxapi
```

## Enumeration
Registering an account (`lulz:lulz@lulz.com:lol123`) and inspecting the session cookie in Burp Suite revealed a JWT with the following header and payload:
```json
// header
{ "typ": "JWT", "alg": "RS256", "kid": "http://localhost:7070/privKey.key" }
// payload
{ "username": "lul", "email": "lul@lul.com", "admin_cap": false }
```
The `kid` (Key ID) claim is a URL that the backend fetches to retrieve the RSA public key used to verify the token's signature. Since this URL points to an attacker-influenceable location (`localhost:7070`, reachable from the app server), it is possible to:
1. Generate a fresh RSA key pair.
2. Host the public key at a URL the app will fetch (a local Python HTTP server on port 7070, serving `privKey.key`).
3. Craft a new JWT payload with `admin_cap: true`, sign it with the attacker-generated private key, and set `kid` to the attacker-controlled public key URL.

## Foothold
Using the forged JWT (signed with the attacker's own key, whose matching public key is fetched and trusted by the server via the `kid` header), the session cookie was swapped in the browser, granting administrator access (`admin_cap: true`).

The admin panel exposed a file upload feature. Uploading a PHP web shell through this feature and browsing to it achieved remote code execution as the web-server user. Enumerating the filesystem uncovered a `/tmp` directory containing the home directory contents of a user `noah`, including a readable `id_rsa`/`id_rsa.pub` key pair, which was used to SSH in directly as `noah` (user flag: `2d8a0f9c0d7529f39e0a62f098e5fef3`).

## Privilege Escalation
`sudo -l` as `noah` showed:
```
(ALL) NOPASSWD: /usr/bin/docker exec -it webapp-dev01*
```
This effectively grants shell access inside the `webapp-dev01` container, but not a container escape by itself. The container's Docker/`runc` version was vulnerable to **CVE-2019-5736**, a `runc` binary-overwrite vulnerability that lets a process inside a container overwrite the host's `runc` binary the next time it is invoked, achieving host-level code execution as root.

Exploitation (using the public PoC, `Frichetten/CVE-2019-5736-PoC`, referenced but not stored in this repository):
1. Modify the PoC's reverse-shell payload line to point to the attacker's listener, then `go build main.go`.
2. Serve the resulting `main` binary over HTTP and start a `nc` listener.
3. Open two terminals as `noah`. In the first, prepare (but do not yet run) `sudo /usr/bin/docker exec -it webapp-dev01 /bin/bash`; in the second, prepare `/usr/bin/docker exec -it webapp-dev01 /bin/sh`.
4. Run the first command to get a shell inside the container, `wget` the compiled `main` PoC binary, `chmod +x` it, and execute it: this overwrites the host's `runc` binary and waits for another `docker exec` invocation.
5. Immediately trigger the second `docker exec` command from the other terminal; this invocation runs through the now-poisoned `runc`, executing the attacker payload as root **on the host**, yielding a root shell.

## Lessons Learned
- Trusting an externally supplied `kid`/JWKS URL for JWT signature verification is a critical vulnerability: it allows attackers to supply their own signing key.
- World-readable home directories/temp files (`/tmp` containing another user's SSH keys) are a common and severe misconfiguration.
- Even narrowly scoped `sudo` rules that only allow `docker exec` on a specific container can be leveraged into full host compromise if the container runtime is vulnerable (CVE-2019-5736).

## Tools & References
- `id_rsa`, `id_rsa.pub`, `privKey.key`: SSH/JWT key material recovered/generated during the engagement; omitted from the repository (private key hygiene).
- `CVE-2019-5736` PoC (`Frichetten/CVE-2019-5736-PoC`, `main`, `main.go`, `46369.zip`): cloned/compiled third-party PoC used for the `runc` container-escape; omitted from the repository (compiled binary + upstream PoC archive). Reference: https://github.com/Frichetten/CVE-2019-5736-PoC
- JWT tooling (jwt.io, custom Python HTTP server) used to forge the administrator token.
