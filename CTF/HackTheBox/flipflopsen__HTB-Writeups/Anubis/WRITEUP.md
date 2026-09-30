# Anubis

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows |
| **Difficulty** | Insane |
| **IP Address** | 10.10.11.102 |
| **Status** | Retired |

## Overview
Anubis is an insane-difficulty Windows/Active Directory machine centered on the `windcorp.htb` domain. Initial access is obtained through a code-injection flaw in a public-facing ASP web application (`www.windcorp.htb`), which grants a shell inside a Windows container. From there, pivoting into the internal network exposes a second web application (`softwareportal.windcorp.htb`) that processes certificate signing requests against the domain's PKI, which: combined with a writable certificate template: can be abused to obtain domain credentials and ultimately escalate to Domain Administrator via Active Directory Certificate Services (ADCS) misuse.

## Reconnaissance
`nmap -sC -sV -A -Pn -vvv -oN nmap/initial 10.10.11.102` showed a minimal external footprint typical of a segmented AD environment:

```
135/tcp open  msrpc         Microsoft Windows RPC
443/tcp open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
445/tcp open  microsoft-ds?
593/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
```

The TLS certificate on 443 listed `commonName=www.windcorp.htb`, confirming the domain name for `/etc/hosts` mapping. Only a narrow set of ports were reachable from outside, consistent with the box's containerized front-end / internal-network design.

## Enumeration
Browsing `https://www.windcorp.htb` revealed a corporate site referencing staff members (Matt Brandon, John Larson, Sara Wilsson, and others: useful for later username guessing) and a working **Contact Us** form built on classic ASP (`save.asp` → `preview.asp`). Directory brute-forcing (gobuster) found:

```
/test.asp             (Status: 200)
/assets               (Status: 301)
/forms                (Status: 301)
/services.asp         (Status: 200)
/preview.asp          (Status: 200)
/save.asp             (Status: 302) --> /preview.asp
```

Submitting the contact form (`GET /save.asp?fname=...&email=...&subject=...&message=...`) causes `preview.asp` to render the submitted fields back to the user without proper sanitization: a classic reflected/ASP code-injection sink.

## Foothold
The `message` (and related) form field(s) were abused to inject and execute ASP code on `preview.asp`. A public ASP web shell (`cmd.asp`, from the [tennc/webshell](https://github.com/tennc/webshell) collection: see `fuzzdb-webshell/asp/cmd.asp`) was uploaded through this injection point to obtain command execution. A Meterpreter stager (previously `meter.exe`/`shell.exe` in this folder) was then transferred to the box and executed to catch a full reverse shell via a Metasploit handler, landing as a low-privileged account (`iisadmin`) inside a Windows container.

## Privilege Escalation
Post-exploitation enumeration inside the container revealed:
- Local SAM hashes (`hashdump`) for local accounts only (`iisadmin`, `Administrator`, etc.): no domain credentials, confirming the foothold was inside an isolated container, not the real host.
- Network routes/ARP entries showing an internal gateway/host at `172.23.48.1` (identified as `earth.windcorp.htb`), reachable only from inside the container, with SMB/HTTP/NetBIOS open.

Using the compromised shell as a pivot (`portfwd add -l 8081 -p 80 -r 172.23.48.1`), the internal site `softwareportal.windcorp.htb` was reached through `http://127.0.0.1:8081`. This internal portal accepts PKCS#10 Certificate Signing Requests and submits them to the domain's Active Directory Certificate Services. A CSR was crafted (see recovered request for `CN=softwareportal.windcorp.htb`, RSA 2048-bit) and submitted through the portal; because the underlying certificate template was misconfigured (enrollee-suppliable subject/SAN, a common ADCS ESC1-style weakness), a certificate could be requested for an arbitrary principal. Combined with the portal's willingness to reach attacker-controlled endpoints, this flow can be leveraged (per HTB's official machine synopsis) to coerce authentication back to a Responder-style listener and capture usable domain credentials, and/or to mint a certificate usable for authentication as a privileged domain account: ultimately yielding Domain Administrator.

*Note: the local notes captured the CSR generation and the pivot/port-forward mechanics in detail but not a full transcript of the final Responder-capture and certificate-authentication steps; that final stage is described here per the machine's official (post-retirement) technique summary rather than invented from scratch.*

## Lessons Learned
- Reflected input in legacy ASP applications can lead directly to server-side code execution: always encode/sanitize user input before echoing it into dynamic pages.
- Segmented/containerized front-ends still need hardening: local credential dumps and internal network reachability from a "sandboxed" web container defeat the purpose of the isolation.
- Enrollee-suppliable-subject certificate templates in ADCS are a serious, frequently overlooked AD privilege-escalation vector (see the "Certified Pre-Owned" ADCS research, ESC1: ESC8 classes).

## Tools & References
- `nmap`, `gobuster` for recon/enumeration.
- ASP web shell: [tennc/webshell `cmd.asp`](https://github.com/tennc/webshell/blob/master/fuzzdb-webshell/asp/cmd.asp).
- Metasploit / Meterpreter for the reverse shell handler.
- `rpcdump.py` (Impacket) for RPC interface enumeration.
- `meter.exe` and `shell.exe` (compiled Meterpreter/reverse-shell stagers used to pop the initial container shell): omitted from the repository as compiled binaries; their role is described above.
- Public reference: SpecterOps "Certified Pre-Owned" whitepaper on ADCS abuse (ESC1 misconfiguration class).
