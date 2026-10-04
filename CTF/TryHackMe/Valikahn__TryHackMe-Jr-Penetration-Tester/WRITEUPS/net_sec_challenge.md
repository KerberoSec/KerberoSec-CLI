# Net Sec Challenge

*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Net Sec Challenge](https://tryhackme.com/room/netsecchallenge)*

> [!IMPORTANT]
>
> **Working write-up notice:** This was a working and verified write-up at the time of writing on **16 July 2026**.
>
> **Spoiler warning:** This write-up documents the methodology and attack chain, although credentials, exact challenge-specific values and flag codes are not shown.
>
> **Please note:** The IP addresses used during the lab were dynamically allocated by TryHackMe. The assessment was performed from my own Kali Linux VM using OpenVPN to connect to the TryHackMe VPN.
>
> The following placeholders are used throughout:
>
>: `<TARGET_IP>` represents the IP address allocated to the target machine.
>: `<TUN0_IP>` represents the IP address assigned to the Kali Linux `tun0` interface.
>: `<REDACTED>` represents credentials, non-standard ports, service versions, header values, exact scan results or other challenge giveaways.
>: `THM{....}` represents a redacted TryHackMe flag.
>
> **Licence:** Unless otherwise stated, all write-ups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
>
> Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

Net Sec Challenge is a practical network-security assessment designed to test the core techniques introduced throughout the Network Security module.

Unlike a longer compromise-and-escalation room, the objective was not to obtain a shell or escalate privileges. Instead, the challenge focused on disciplined service discovery, banner inspection, password auditing, file retrieval and covert Nmap scanning.

The successful workflow involved:

1. Confirming the target address, VPN route and `tun0` interface.
2. Adding the room hostname to `/etc/hosts`.
3. Performing a complete TCP port scan rather than relying on Nmap's default top 1,000 ports.
4. Counting the exposed TCP services and identifying uncommon high-numbered ports.
5. Inspecting the HTTP response header on port 80.
6. Reading the SSH service banner for an embedded flag.
7. Identifying an FTP service on a non-standard port.
8. Auditing the supplied FTP usernames with Hydra.
9. Authenticating to FTP and retrieving the challenge file.
10. Completing the port `<REDACTED>` IDS-evasion exercise with a sufficiently covert Nmap scan.

Confirmed lab details used during the walkthrough:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK/
Local hostname: net-sec.thm
```

The target was added to the Kali VM's local hosts file:

```bash
echo "<TARGET_IP> net-sec.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed with:

```bash
getent hosts net-sec.thm
```

VPN routing and the tunnel address were also checked:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

The expected route showed traffic leaving through `tun0` and using `<TUN0_IP>` as the source address:

```text
<TARGET_IP> via <REDACTED> dev tun0 src <TUN0_IP>
```

This confirmed that traffic to the target was routed through `tun0` using `<TUN0_IP>`.

> [!TIP]
>
> When using your own Kali Linux VM, the `/etc/hosts` file is especially important in TryHackMe challenges. Many rooms depend on hostname-based routing, virtual hosts, redirects, cookies or application logic that may not behave correctly when the expected hostname is missing.
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
sudo sed -i '/net-sec\.thm/d' /etc/hosts
```

The correct mapping can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The principal tools and utilities used during the challenge were:

- `ip` for confirming VPN routing and the `tun0` address.
- `getent` for validating local hostname resolution.
- `nmap` for full TCP discovery, service detection, banner inspection and covert scanning.
- `rustscan` for rapidly identifying open TCP ports before passing the results to Nmap for service detection and default script scanning.
- `telnet` for manually connecting to services and reading plaintext banners.
- `hydra` for auditing the two supplied FTP usernames.
- The standard FTP client for authenticating, listing files and downloading the challenge file.
- Firefox for interacting with the web-based IDS-evasion exercise.
- `cat` for reading the downloaded flag file.
- `ssh-keyscan` as an additional method of confirming the SSH banner.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README.

The `Tools Commonly Used` section contains links to tools used throughout the pathway.

## Initial Enumeration

### Complete TCP Port Discovery

A complete TCP SYN scan was performed and saved to a normal-format output file:

```bash
nmap -p- -T4 -vv net-sec.thm -oN netsec-all-ports.txt
```

The important option was:

```text
-p-
```

Without it, Nmap would scan only its default top 1,000 TCP ports. That would miss the challenge's deliberately placed services on uncommon high-numbered ports.

The scan identified several exposed services, including:

```text
22/tcp          open  ssh
80/tcp          open  http
139/tcp         open  netbios-ssn
445/tcp         open  microsoft-ds
<REDACTED>/tcp  open  http
<REDACTED>/tcp  open  <REDACTED>
<REDACTED>/tcp  open  ftp
```

The exact high-numbered ports and total count are intentionally redacted because they directly answer challenge questions.

### Targeted Service Detection

Once the open ports were known, version detection and default scripts were run only against the discovered services:

```bash
nmap -sC -sV -Pn -p22,80,139,445,<REDACTED>,<REDACTED>,<REDACTED> net-sec.thm
```

This produced richer service information while avoiding another unnecessary full-range scan.

The results identified:

- An SSH service with a customised banner.
- An HTTP service on port 80 with a customised `Server` header.
- Samba services on ports 139 and 445.
- A Node.js Express application on a high-numbered HTTP port.
- An FTP service running on a non-standard port.
- One additional high-numbered service that did not provide an immediately useful banner.

### Supplementary RustScan Enumeration

> [!NOTE]
> This section is not required to complete the challenge. It is included as supplementary material to show that another tool can gather the same information, sometimes in a single command.
>
> Although the room stated that all questions could be completed using Nmap, Telnet and Hydra, RustScan was also used as a supplementary enumeration tool.
>
> RustScan performs fast TCP port discovery and can automatically pass the identified ports to Nmap for more detailed service enumeration. This made it useful for confirming the results of the original full-port Nmap scan.

The following command can be executed:

```bash
rustscan -a net-sec.thm --ulimit 5000 -- -sC -sV -Pn -oA rustscan_output
```

The options used were:

- -a net-sec.thm specified the target hostname.
- --ulimit 5000 increased the number of file descriptors available to RustScan, allowing it to handle more simultaneous connections.
- -- separated the RustScan options from the arguments passed directly to Nmap.
- -sC ran Nmap's default script set against the discovered ports.
- -sV enabled service and version detection.
- -Pn skipped host discovery and treated the target as online.
- -oA rustscan_output saved the Nmap results in normal, XML and grepable formats.

RustScan identified the same exposed TCP ports as the earlier full-range Nmap scan:

```text
Open <TARGET_IP>:22
Open <TARGET_IP>:80
Open <TARGET_IP>:139
Open <TARGET_IP>:445
Open <TARGET_IP>:<REDACTED>
Open <TARGET_IP>:<REDACTED>
Open <TARGET_IP>:<REDACTED>
```

After discovering the ports, RustScan launched Nmap against only those services. The resulting scan identified:

- SSH on port 22.
- HTTP on port 80.
- Samba on ports 139 and 445.
- A Node.js Express web application on a high-numbered port.
- An additional unidentified service on a high-numbered port.
- An FTP service running on a non-standard port.
- Challenge-specific values within the HTTP and SSH banners.

The RustScan results independently confirmed the original Nmap findings and provided detailed service information without requiring another manual scan of all 65,535 TCP ports.

Again, RustScan was not necessary to solve the room, but it served as a useful secondary validation tool. The original Nmap scan remained important because the room was specifically designed to assess the network-enumeration techniques taught in the module.

Your actual RustScan output confirmed all seven open TCP ports and passed them to Nmap for `-sC` and `-sV` analysis. :contentReference[oaicite:0]{index=0}

### HTTP Header Inspection

The web service on port 80 was queried with Nmap's HTTP server-header script:

```bash
nmap -p80 --script=http-server-header net-sec.thm
```

The response exposed a challenge-specific value in the `Server` header:

```text
http-server-header: <REDACTED>
```

This demonstrated why HTTP headers should always be reviewed. A page can appear almost empty while the response metadata reveals the required information.

### SSH Banner Inspection

The SSH banner was visible before authentication. Nmap service detection showed a customised identification string:

```text
SSH-2.0-OpenSSH_<REDACTED> THM{....}
```

The result was independently confirmed with:

```bash
ssh-keyscan net-sec.thm
```

The flag was embedded directly in the pre-authentication SSH header:

```text
THM{....}
```

No SSH login or exploitation was required.

### FTP Banner Inspection

The non-standard FTP service was inspected manually with Telnet:

```bash
telnet net-sec.thm <REDACTED>
```

The server returned a plaintext welcome banner containing its product and version:

```text
220 (<REDACTED>)
```

This confirmed both that the port was running FTP and the exact software version required by the challenge.

## Exploits

### FTP Password Auditing

The room supplied two usernames obtained through its fictional social-engineering scenario:

```text
eddie
quinn
```

Hydra was used to audit the first account against the RockYou wordlist:

```bash
hydra -l eddie \
  -P /usr/share/wordlists/rockyou.txt \
  net-sec.thm ftp -s <REDACTED>
```

A valid credential was identified:

```text
login: eddie
password: <REDACTED>
```

The second account was then tested:

```bash
hydra -l quinn \
  -P /usr/share/wordlists/rockyou.txt \
  net-sec.thm ftp -s <REDACTED>
```

Hydra found another valid credential:

```text
login: quinn
password: <REDACTED>
```

The exact passwords are intentionally omitted.

This was an authorised password audit against the dedicated TryHackMe target. Hydra should not be used against accounts or systems without explicit permission.

### FTP Authentication and File Retrieval

The relevant credentials were used to connect to the FTP service:

```bash
ftp net-sec.thm <REDACTED>
```

After authenticating, the available files were listed:

```text
ls
```

The challenge file was downloaded:

```text
get ftp_flag.txt
```

The local copy was then read:

```bash
cat ftp_flag.txt
```

The file contained the required flag:

```text
THM{....}
```

### Covert Nmap Scanning Challenge

Browsing to the high-numbered HTTP service presented an IDS-evasion exercise:

```text
http://net-sec.thm:<REDACTED>/
```

The page tracked the likelihood that the scan would be detected. Aggressive or noisy scan settings increased the detection score, so the objective was to gather sufficient information while reducing the scan's visibility.

A stealthier SYN-based approach was used rather than an aggressive default-script and version scan. Depending on the state of the packet counter, an appropriately restrained command can take the following form:

```bash
nmap -sS -T2 -f -p- <TARGET_IP>
```

The options serve different purposes:

- `-sS` performs a TCP SYN scan without completing the full TCP handshake.
- `-T2` slows the scan to reduce the rate of suspicious traffic.
- `-f` fragments probe packets, although fragmentation is not a universal IDS bypass and should not be treated as magic.
- `-p-` ensures that the complete TCP range is still examined.

The exact successful scan sequence may vary depending on the challenge's packet counter and whether it has been reset. After a sufficiently covert scan, the web page displayed:

```text
Exercise Complete! Task answer: THM{....}
```

The completed attempt recorded a low detection probability and revealed the final flag without exposing it in this public write-up.

## Full Attack Chain Recap

### 1. VPN and Hostname Preparation

The target and `tun0` addresses were confirmed. The room hostname was mapped to `<TARGET_IP>` in `/etc/hosts`, ensuring consistent hostname resolution.

### 2. Full TCP Enumeration

Nmap scanned all 65,535 TCP ports. This revealed the ordinary services as well as several challenge services outside the default top 1,000 ports.

### 3. Port Analysis

The scan output was used to determine the number of open TCP ports, the highest open port below 10,000 and the separate service located above the challenge's stated threshold.

The exact answers are redacted:

```text
Highest open port below 10,000: <REDACTED>
Open port above the stated threshold: <REDACTED>
Total open TCP ports: <REDACTED>
```

### 4. HTTP Header Enumeration

Nmap's `http-server-header` script retrieved the customised service value from port 80:

```text
<REDACTED>
```

### 5. SSH Banner Enumeration

The SSH pre-authentication header contained a flag:

```text
THM{....}
```

This was obtained without submitting any credentials.

### 6. FTP Service Identification

A high-numbered port returned an FTP banner. Telnet and Nmap identified the product and version:

```text
<REDACTED>
```

### 7. Credential Auditing

Hydra tested the supplied usernames against RockYou and recovered valid FTP passwords for both accounts:

```text
eddie:<REDACTED>
quinn:<REDACTED>
```

### 8. FTP File Access

The relevant FTP account contained a downloadable text file. Reading it locally revealed:

```text
THM{....}
```

### 9. IDS-Evasion Exercise

The second web application monitored scanning behaviour. A restrained Nmap scan kept the detection probability sufficiently low to complete the exercise.

### 10. Final Objective

The IDS-evasion page returned the final room flag:

```text
THM{....}
```

This completed the Net Sec Challenge.

## Key Lessons

Net Sec Challenge reinforced several practical network-security lessons:

- Confirm VPN routing and hostname resolution before beginning enumeration.
- Keep `/etc/hosts` clear and limited to active lab entries.
- Nmap's default scan does not cover every TCP port.
- Full-range scans are essential when a challenge hints at uncommon services.
- Separate port discovery from deeper service enumeration to avoid unnecessary traffic.
- Response headers can reveal information that is absent from the visible web page.
- SSH banners are exposed before authentication and should not contain sensitive information.
- Telnet remains useful for manually inspecting plaintext service banners.
- Services running on non-standard ports are not automatically hidden or secure.
- Usernames combined with weak passwords can allow rapid compromise through dictionary attacks.
- Context-specific username information can make password auditing considerably more effective.
- FTP commonly exposes sensitive files in plaintext and should be treated cautiously.
- Fast and aggressive scanning is not always the best choice.
- Scan timing, probe selection and the number of enabled scripts all affect detectability.
- A low detection score does not make a scan invisible; it only means the exercise's threshold was not exceeded.
- Public write-ups should explain the process while withholding credentials, exact answers and live flags.

The central lesson was straightforward: good network enumeration is less about firing every option at the target and more about selecting the right scan for the question being answered.

## Remediation Notes

### Network Exposure

- Disable services that are not operationally required.
- Restrict administrative and file-transfer services with host firewalls or network access controls.
- Bind internal services only to the interfaces that genuinely require access.
- Review high-numbered ports as carefully as standard ports.
- Maintain an accurate inventory of listening services and their business purpose.
- Alert on unexpected changes to exposed ports.

### Service Banner Hardening

- Remove challenge-style, internal or sensitive values from service banners.
- Configure HTTP servers to minimise unnecessary version and product disclosure.
- Avoid custom SSH banners that reveal operational information.
- Review protocol welcome messages for hostnames, software versions and internal comments.
- Do not assume that moving a service to a non-standard port protects it from discovery.
- Patch exposed services and verify their supported configuration regularly.

### FTP Security

- Replace plaintext FTP with SFTP or another encrypted transfer mechanism.
- Disable password-based FTP access where it is not required.
- Apply strong, unique passwords and prevent reuse.
- Restrict each account to the minimum directory access required.
- Remove sensitive files from user-accessible transfer directories.
- Log and alert on repeated authentication failures.
- Rate-limit login attempts or introduce temporary account lockouts.
- Review whether each FTP account remains necessary.

### Credential Security

- Block weak and commonly breached passwords.
- Use sufficiently long passphrases rather than predictable dictionary words.
- Apply multi-factor authentication where the protocol supports it.
- Rotate credentials exposed through testing or operational mistakes.
- Monitor authentication logs for password spraying and dictionary attacks.
- Avoid publishing or leaking valid usernames unnecessarily.
- Use centralised secrets management where service credentials must be retained.

### Detection and Monitoring

- Establish baselines for normal connection rates and port usage.
- Alert on sequential or distributed connection attempts across many ports.
- Correlate incomplete TCP handshakes, unusual packet fragmentation and slow scans over longer time windows.
- Do not rely solely on rate-based detection because deliberate scans may be spread out.
- Use network IDS rules alongside host-based telemetry and firewall logs.
- Retain enough historical data to detect low-and-slow reconnaissance.
- Test detection controls regularly in an authorised environment.

### Operational Hygiene

- Remove stale TryHackMe mappings from `/etc/hosts` after completing a room.
- Keep each lab's scan output and downloaded evidence in a separate working directory.
- Save important scans with `-oN`, `-oX` or `-oA` so findings can be reviewed later.
- Record the target address, hostname and `tun0` address before starting.
- Validate important findings with a second method where practical.
- Use only the scan intensity required for the immediate objective.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
