# Module 7: Metasploit

> **Portfolio scope:** Technical notes on the Metasploit Framework, module selection, payloads, sessions, Meterpreter, evidence, and safe validation. Use is restricted to authorized lab targets.

## Module coverage

The legacy module covered:

- Metasploit architecture;
- `msfconsole`;
- exploit, auxiliary, and post modules;
- payload selection;
- module options;
- sessions;
- Meterpreter;
- safe workflow and cleanup.

The main lesson is that Metasploit automates steps, but it does not replace vulnerability research. A tester must understand the target, prerequisites, exploit behavior, and side effects before executing a module.

---

## 1. Framework concepts

### Module types

- **Exploit:** triggers a vulnerability.
- **Auxiliary:** scanning, enumeration, fuzzing, login testing, or supporting action.
- **Payload:** code executed after exploitation.
- **Post:** operates through an existing session for approved post-exploitation tasks.
- **Encoder/NOP:** lower-level payload transformation components; not a guarantee of evasion.
- **Evasion:** specialized functionality intended to avoid defensive controls and generally requires explicit scope.

### Payload forms

- **Single:** self-contained payload.
- **Staged:** small stager retrieves a larger stage.
- **Inline/stageless:** complete payload delivered at once.

Naming often indicates platform, architecture, and transport, for example conceptually:

```text
windows/x64/meterpreter/reverse_tcp
linux/x64/shell_reverse_tcp
```

Payload availability depends on module compatibility.

### Reverse versus bind

- **Reverse:** target connects back to the tester listener.
- **Bind:** target listens and tester connects to it.

Reverse connections often work better through inbound filtering, but require permitted egress and a reachable listener. Bind payloads expose a target port and may be blocked by host/network firewalls.

---

## 2. Database and workspace setup

Metasploit can store hosts, services, vulnerabilities, loot, and notes.

Typical lab startup:

```bash
sudo systemctl start postgresql
msfdb status
msfconsole
```

Inside `msfconsole`:

```text
workspace -a thm-lab
workspace thm-lab
```

Separate workspaces reduce evidence mixing between assessments.

Useful database commands:

```text
hosts
services
vulns
notes
loot
```

Imported Nmap XML can populate the database:

```text
db_import evidence/scan.xml
services -p 445
```

Exact setup varies by distribution.

---

## 3. Module search and selection

### Search

```text
search type:exploit platform:windows smb
search cve:YYYY-NNNN
search name:<product>
```

### Inspect module

```text
info exploit/path/to/module
use exploit/path/to/module
show options
show advanced
show targets
show payloads
```

Read:

- description;
- references;
- disclosure date;
- reliability/rank;
- target versions;
- required options;
- side effects;
- supported payloads.

A module’s high rank does not prove the local target is vulnerable.

### Configure

```text
set RHOSTS 10.10.50.25
set RPORT 445
set LHOST <authorized-lab-interface>
set LPORT 4444
set payload <compatible-payload>
show options
```

Confirm that `LHOST` is reachable from the target lab network. Do not use a public listener unless the engagement explicitly requires and authorizes it.

### Check

```text
check
```

When implemented, `check` attempts to determine vulnerability without full exploitation. Review how the module performs the check; it may still send a triggering request.

---

## 4. Exploitation workflow

A disciplined sequence:

1. independently identify service and version;
2. review vendor advisory and CVE;
3. confirm prerequisites and configuration;
4. read module code/documentation;
5. define safe proof objective;
6. configure exact target and payload;
7. verify listener/network path;
8. run `check` if appropriate;
9. exploit once, monitor output and target health;
10. record session, identity, and evidence;
11. avoid unnecessary post-exploitation;
12. clean up and close the session.

Run:

```text
run
```

or:

```text
exploit
```

Background execution:

```text
run -j
jobs
```

Use jobs carefully to avoid duplicate exploitation.

---

## 5. Session management

```text
sessions
sessions -i 1
sessions -k 1
```

Record:

- session ID;
- target IP/host;
- payload;
- user/privilege;
- start time;
- proof performed;
- files/processes created;
- cleanup.

A session is evidence of code execution or access, but the report should still explain the vulnerability and impact.

---

## 6. Shell versus Meterpreter

### Command shell

A basic shell executes operating-system commands. It may be unstable or lack job control and terminal features.

### Meterpreter

Meterpreter is an advanced payload integrated with Metasploit. Capabilities vary by platform and payload. It can support:

- system information;
- file operations;
- process listing;
- network information;
- routing and port forwarding;
- screenshots or keylogging in some contexts;
- privilege and token operations;
- extension loading.

Many of these capabilities are invasive and should not be used unless required by the assessment objective.

Useful low-impact lab commands:

```text
sysinfo
getuid
pwd
ls
ipconfig
route
ps
```

### Shell interaction

```text
shell
```

Return to Meterpreter with the appropriate shell exit behavior. Avoid terminating the underlying session accidentally.

---

## 7. Payload selection

Questions:

- target OS and architecture;
- module compatibility;
- available network path;
- endpoint controls;
- staged versus stageless restrictions;
- required functionality;
- stability;
- scope limitations.

Choose the least capable payload that proves the objective. A basic command shell may be sufficient; advanced Meterpreter functionality can increase operational risk and detection.

### Handler

For an approved payload generated separately in a lab, a handler can receive the connection:

```text
use exploit/multi/handler
set payload <payload-name>
set LHOST <lab-interface>
set LPORT 4444
run
```

Generating or delivering payloads outside an authorized lab is not appropriate.

---

## 8. Auxiliary modules

Auxiliary modules may perform:

- service scanning;
- version detection;
- protocol enumeration;
- login testing;
- fuzzing;
- denial-of-service.

Example structure:

```text
use auxiliary/scanner/<protocol>/<module>
set RHOSTS 10.10.50.0/24
set THREADS 5
show options
run
```

Control threads and scope. Credential testing and DoS modules require explicit approval.

### Verify results

Metasploit scanner output may contain false positives or ambiguous results. Confirm using the native protocol or independent tool.

---

## 9. Post modules

Post modules operate through a session. Examples include inventory, credential collection, or configuration checks.

Before using a post module:

- read module documentation and source;
- determine files, registry keys, processes, or network actions involved;
- confirm scope permits the action;
- define evidence need;
- plan cleanup.

A post module should not be run merely because it is available.

---

## 10. Routing and pivoting concepts

A session may provide access to an internal network not directly reachable from the tester. Metasploit can route module traffic through a session.

Conceptual workflow:

```text
route add 10.20.0.0 255.255.255.0 <session-id>
route print
```

Or use automatic route discovery where appropriate after review.

Pivoting expands scope risk. Confirm that the internal network is authorized before scanning or accessing it. Limit scans and avoid broad discovery through fragile sessions.

---

## 11. Evidence and reproducibility

Capture:

- service/version evidence;
- advisory/CVE;
- module name and version;
- configured options with secrets redacted;
- `check` result;
- exact time;
- session type and identity;
- harmless proof;
- cleanup;
- relevant defender alerts.

Example finding evidence:

```text
Module: exploit/example/module
Target: 10.10.50.25:8080
Precondition: unauthenticated access to vulnerable endpoint
Check: reported vulnerable; manually confirmed version and endpoint
Proof: session opened as service account `appsvc`; only `getuid` and `sysinfo` executed
Cleanup: session closed; no files uploaded by tester
```

---

## 12. Cleanup

Potential artifacts:

- uploaded executables;
- temporary files;
- new processes;
- services;
- scheduled tasks;
- modified configuration;
- created users;
- listening ports;
- logs generated by testing.

Document which artifacts were created by the module. Verify removal and inform the client of anything that could not be removed safely.

---

## 13. Defender perspective

Metasploit activity may produce:

- exploit-specific network signatures;
- unusual process trees;
- reverse connections;
- memory-injected payload behavior;
- service crashes;
- PowerShell or command-line events;
- new files or services;
- antivirus/EDR alerts.

A purple-team assessment can compare expected and actual detection:

- Was the exploit attempt logged?
- Was the session detected?
- Did the alert identify the target and source?
- Could responders isolate the host?
- Were post-exploitation actions visible?

---

## 14. Common mistakes

- selecting a module from version text alone;
- ignoring target architecture;
- using the wrong `LHOST` interface;
- choosing an unnecessarily advanced payload;
- running post modules without reviewing side effects;
- assuming `check` is always safe or definitive;
- exploiting repeatedly when one proof is enough;
- failing to save configuration and evidence;
- pivoting into unauthorized networks;
- leaving sessions or artifacts behind.

---

## Portfolio takeaway

I learned to use Metasploit as a controlled validation framework rather than a one-click exploitation tool. The correct workflow begins with independent research, verifies prerequisites, minimizes payload capability, records exact evidence, and includes cleanup and defender visibility.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- Rapid7 Metasploit documentation: https://docs.rapid7.com/metasploit/
- Metasploit module documentation: https://docs.rapid7.com/metasploit/modules/
- Metasploit payload documentation: https://docs.rapid7.com/metasploit/working-with-payloads/
