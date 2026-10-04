# Paper

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.143 |
| **Status** | Retired |

## Overview
Paper is an Easy Linux machine running a CentOS Apache server on ports 80/443. Per HTB's official machine description, the front-facing site is a default Apache test page, but the HTTP response headers disclose a hidden virtual host running a vulnerable WordPress instance (CVE-2019-17671), which exposes draft-post content that leads to an internal Rocket.Chat-based employee chat system. A chat bot in that system can be queried to leak a user password, and the host's `sudo` version: vulnerable to CVE-2021-3560: is then used to escalate to root.

**Note:** the locally preserved notes for this machine were minimal (empty notes file, only `nmap` output and a `feroxbuster` resume-state file were retained). The summary above reflects HTB's official machine description; the sections below are limited to what the local evidence actually supports, to avoid fabricating command-level detail that wasn't captured at the time.

## Reconnaissance
```
22/tcp  open  ssh      OpenSSH 8.0
80/tcp  open  http     Apache httpd 2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9 - default CentOS test page
443/tcp open  ssl/http Apache httpd 2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
                       cert CN=localhost.localdomain
```
A `TRACE` method was also flagged as potentially risky by nmap's `http-methods` script on both the HTTP and HTTPS listeners.

A `feroxbuster` content-discovery scan against `http://paper.htb/` was captured mid-run; it only surfaced the stock Apache manual (`/manual/...`) before being interrupted, and an `x-backend-server: office.paper` response header was visible in the captured responses: consistent with HTB's description of a hidden vhost being disclosed via HTTP headers.

## Enumeration
No further local enumeration artifacts (WordPress version confirmation, Rocket.Chat interaction, or bot-query transcripts) were preserved from the original engagement. Based on the officially documented path, the `office.paper` vhost hosts a WordPress blog vulnerable to CVE-2019-17671 (an access-control flaw allowing unauthenticated users to view draft posts), which discloses a link to an internal Rocket.Chat deployment.

## Foothold
Per the official description, credentials for a local user are obtained by interacting with a Rocket.Chat bot that can be queried for sensitive information, and those credentials are then used for SSH access. No local transcript of this interaction survived in the archived notes.

## Privilege Escalation
The host's `sudo` package version is documented as vulnerable to **CVE-2021-3560** (a Polkit/`accountsservice` privilege-escalation flaw: the same class of vulnerability independently exploited on the Pandora machine in this archive), allowing escalation from the SSH-level user to root.

## Lessons Learned
- HTTP response headers (e.g. `X-Backend-Server`) can leak internal hostnames that are never linked from the visible site: always diff headers across vhosts.
- Draft/unpublished CMS content is not automatically private; broken access controls (CVE-2019-17671) can expose it to any authenticated (or in some WordPress REST API cases, unauthenticated) user.
- This entry is a reminder to capture full command transcripts during an engagement: the original notes file was left empty, so several steps here could only be reconstructed from HTB's official summary rather than verified locally.

## Tools & References
- `feroxbuster`: content discovery tool used against `http://paper.htb/` (resume-state file removed; it only contained default Apache manual pages with no unique findings).
- CVE-2019-17671: WordPress draft-post disclosure vulnerability.
- CVE-2021-3560: Polkit/`accountsservice` privilege escalation (see also the Pandora writeup in this archive for a worked exploitation example).
- Rocket.Chat: internal employee chat platform referenced in HTB's official machine description as the source of the leaked SSH credential.
