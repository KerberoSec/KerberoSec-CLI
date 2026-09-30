# Module 3: Network and System Security

> **Portfolio scope:** Detailed engineering notes for secure architecture, system hardening, Active Directory, network devices, secure protocols, virtualization, containers, cloud security, auditing, and monitoring.

## Module coverage

This module covered the largest technical surface in the Security Engineer path:

- secure network architecture;
- Linux hardening;
- Windows hardening;
- Active Directory hardening;
- network-device hardening;
- secure network protocols;
- virtualization and containers;
- introductory cloud security;
- auditing and monitoring.

The unifying objective is to minimize implicit trust, reduce attack surface, constrain privilege, and produce telemetry that allows the organization to detect and investigate abnormal behavior.

---

## 1. Secure network architecture

### Zones and trust boundaries

A flat network gives a compromised endpoint unnecessary reach. Segmentation separates assets by sensitivity and function, for example:

- user workstations;
- production application servers;
- database services;
- identity infrastructure;
- management interfaces;
- development and test environments;
- backup systems;
- security tooling;
- internet-facing services;
- third-party or guest access.

Segmentation is effective only when traffic is explicitly controlled and reviewed. Merely placing systems in separate VLANs without filtering between them is not a complete security boundary.

### Policy design

A firewall rule should document:

- source identity or network;
- destination;
- protocol and port;
- business purpose;
- owner;
- expiration or review date;
- logging requirement.

The default posture should deny traffic that is not required. Rules such as `any -> any` or broad management access should be treated as exceptions and investigated.

### North-south and east-west controls

- **North-south traffic:** entering or leaving the environment, commonly through internet gateways, remote access, and partner connections.
- **East-west traffic:** movement between internal workloads.

Modern attacks often exploit east-west trust after initial access. Internal firewalls, host firewalls, identity-aware proxies, and service-to-service authentication can reduce lateral movement.

### Management plane

Administrative interfaces should not be exposed on normal user or internet-facing networks. Recommended controls include:

- dedicated management network or access proxy;
- MFA and separate privileged identities;
- encrypted management protocols;
- allow-listed source devices;
- session logging;
- emergency access controls;
- configuration backups and change tracking.

### Egress controls

Outbound filtering can disrupt command-and-control, data exfiltration, and unauthorized software retrieval. Egress policy should consider DNS, web proxies, package repositories, cloud APIs, and direct IP connections. Blocking all outbound traffic is not always practical, but unconstrained egress should not be the default for sensitive servers.

---

## 2. Linux system hardening

Hardening starts with a supported, minimal installation and a defined baseline.

### Inventory listening services

```bash
sudo ss -tulpn
sudo systemctl --type=service --state=running
sudo systemctl list-unit-files --state=enabled
```

Each listening service should have a documented owner and purpose. Unneeded services should be disabled rather than merely ignored.

```bash
sudo systemctl disable --now <service>
```

### Patch and package hygiene

Use supported repositories, remove obsolete packages, and automate update reporting. Production patching should have testing, rollback, and maintenance procedures.

```bash
# Debian/Ubuntu lab example
sudo apt update
apt list --upgradable

# RHEL-like lab example
sudo dnf check-update
```

### SSH hardening

Typical controls include:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowGroups ssh-users
X11Forwarding no
```

Changes should be tested before terminating the current administrative session to avoid lockout. Keys require lifecycle management: unique user keys, protected private keys, removal on offboarding, and rotation after suspected exposure.

### File permissions and privilege

Review world-writable files, SUID/SGID binaries, sudo rules, capabilities, and sensitive configuration.

```bash
find / -xdev -type f -perm -0002 -ls 2>/dev/null
find / -xdev -perm -4000 -type f -ls 2>/dev/null
getcap -r / 2>/dev/null
sudo -l
```

These commands are useful for authorized assessment and hardening review. Findings require context: some SUID binaries are expected, but custom or writable executables deserve investigation.

### Host firewall

A server should expose only required ports. Example using `ufw` in a lab:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 10.20.30.0/24 to any port 22 proto tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

### Logging and audit

Important Linux evidence includes:

- authentication events;
- sudo use;
- service starts and failures;
- package changes;
- kernel messages;
- process execution where audit rules permit;
- file-integrity events;
- network and DNS activity from supporting telemetry.

Time synchronization is critical for correlation.

---

## 3. Windows endpoint and server hardening

### Reduce exposed services

Review installed roles, services, SMB exposure, remote administration, local firewall rules, and legacy protocols. Disable SMBv1 and other obsolete services where compatibility permits.

Example inspection commands:

```powershell
Get-NetTCPConnection -State Listen | Sort-Object LocalPort
Get-Service | Where-Object Status -eq 'Running'
Get-NetFirewallProfile
Get-SmbServerConfiguration
```

### Local administrator control

Local administrator passwords should be unique and rotated, such as through Windows LAPS. Shared local administrator credentials create a straightforward lateral-movement path.

### Credential protection

Controls may include:

- Credential Guard where supported;
- disabling WDigest credential caching;
- protecting LSASS;
- restricting debug and impersonation privileges;
- preventing privileged users from signing into lower-trust systems;
- using Remote Credential Guard or equivalent protected administration patterns.

### PowerShell and scripting controls

PowerShell is an administrative tool and a common attacker capability. The goal is not to disable it blindly, but to control and monitor use:

- script block logging;
- module logging;
- transcription where appropriate;
- constrained language for untrusted contexts;
- code signing and application control;
- central collection of relevant event logs.

### Event-log areas

Useful Windows evidence includes:

- Security log authentication and privilege events;
- PowerShell operational logs;
- Windows Defender and EDR telemetry;
- service installation;
- scheduled tasks;
- process creation with command-line context;
- firewall events;
- group and policy changes.

Logging must be sized and centralized so important events are not overwritten before collection.

---

## 4. Active Directory hardening

Active Directory concentrates identity and privilege. Security objectives include protecting domain controllers, privileged credentials, directory configuration, and authentication protocols.

### Tiered administration

A practical model separates:

- directory/domain administration;
- server administration;
- workstation administration.

Highly privileged accounts should not authenticate to standard workstations or browse the internet. Privileged access workstations reduce exposure to credential theft.

### Privileged groups and delegation

Regularly review:

- Domain Admins, Enterprise Admins, Administrators;
- delegated OU permissions;
- Group Policy modification rights;
- service accounts and SPNs;
- accounts trusted for delegation;
- password-reset and replication permissions;
- stale or nested group memberships.

Useful PowerShell examples in an authorized administrative environment:

```powershell
Get-ADGroupMember 'Domain Admins' -Recursive
Get-ADUser -Filter * -Properties PasswordNeverExpires,LastLogonDate |
  Where-Object PasswordNeverExpires -eq $true
Get-ADComputer -Filter * -Properties LastLogonDate |
  Sort-Object LastLogonDate
```

### Authentication protocols

Reduce NTLM where possible, prefer Kerberos, and monitor downgrade or fallback behavior. LDAP signing and channel binding, SMB signing, and secure DNS configuration help protect integrity and credentials.

### Service accounts

Use group Managed Service Accounts where supported. Avoid interactive logon, broad group membership, weak or non-expiring static passwords, and reuse across services.

### Domain-controller protection

Domain controllers should:

- run only required roles;
- receive prioritized patching;
- have restricted network access;
- use protected backup and recovery procedures;
- generate centralized security logs;
- be administered only from controlled systems;
- have physical and virtualization-host protections.

---

## 5. Network-device hardening

Routers, switches, firewalls, wireless controllers, and load balancers are infrastructure computers and require full lifecycle management.

Controls include:

- unique named administrator accounts;
- centralized AAA using RADIUS or TACACS+ where appropriate;
- MFA through the management access path;
- SSH instead of Telnet;
- SNMPv3 instead of community-string-based SNMPv1/v2c;
- separate management interfaces or VRFs;
- configuration versioning and backups;
- secure NTP and syslog;
- firmware maintenance;
- control-plane policing;
- disabling unused services and discovery protocols where not needed;
- restricting management by source address.

Example Cisco-style concepts, not a universal configuration:

```text
no ip http server
ip ssh version 2
service password-encryption
logging host 10.20.40.10
ntp server 10.20.40.20
```

Vendor-specific secure configuration guides and tested rollback procedures should govern real changes.

---

## 6. Secure protocols

Legacy protocols often expose credentials or data in cleartext or lack modern integrity protections.

Preferred replacements include:

| Insecure/legacy | Safer alternative |
|---|---|
| Telnet | SSH |
| FTP | SFTP or FTPS with correct validation |
| HTTP admin page | HTTPS with strong TLS configuration |
| SNMPv1/v2c | SNMPv3 authentication and privacy |
| LDAP simple bind without TLS | LDAPS or StartTLS with certificate validation |
| Unauthenticated syslog | Protected transport, authenticated collector, or secure agent |

Encryption without certificate or host-key validation is vulnerable to interception. Protocol deployment must validate the peer, not only encrypt bytes.

---

## 7. Virtualization and containers

### Virtualization risks

- hypervisor or management-plane compromise;
- insecure snapshots containing secrets;
- virtual-network misconfiguration;
- overprivileged administrators;
- insufficient separation of production and test workloads;
- exposed management APIs;
- unpatched guest tools and templates.

The management plane should receive higher protection than individual guests because it can control many systems.

### Container image security

Use minimal, trusted, pinned images. A secure build pipeline should:

- pull from approved registries;
- scan dependencies and OS packages;
- generate an SBOM;
- sign artifacts;
- prevent secrets from entering image layers;
- rebuild when the base image changes;
- block critical policy violations.

### Runtime hardening

- run as non-root;
- use a read-only root filesystem when possible;
- drop Linux capabilities;
- apply seccomp/AppArmor/SELinux profiles;
- limit CPU and memory;
- restrict network egress;
- avoid mounting the container runtime socket;
- store secrets outside images;
- isolate namespaces and workloads by sensitivity.

Example container options for a lab:

```bash
docker run --read-only --cap-drop=ALL --security-opt=no-new-privileges \
  --memory=256m --cpus=1.0 example/image:version
```

These flags do not automatically make an application secure; they reduce runtime privilege and blast radius.

---

## 8. Cloud security and shared responsibility

Cloud providers secure the underlying platform, while customers remain responsible for many identity, configuration, data, and workload controls. The exact boundary varies by IaaS, PaaS, and SaaS.

Common cloud risks include:

- public storage or databases;
- overbroad IAM roles;
- long-lived access keys;
- missing control-plane logs;
- permissive security groups;
- unencrypted or poorly managed secrets;
- unmanaged assets across subscriptions/accounts;
- insecure CI/CD identities;
- configuration drift;
- weak separation between production and development.

A secure multi-account or multi-subscription design separates environments and centralizes identity, logging, guardrails, and billing visibility. Organization-level policy can prevent dangerous configurations rather than only detect them after deployment.

### Cloud evidence

- identity and role-assumption logs;
- control-plane API logs;
- network-flow logs;
- storage-access logs;
- key-management events;
- configuration-state history;
- workload and container telemetry;
- alerts for public exposure and privilege changes.

---

## 9. Auditing and monitoring

### Logging architecture

A useful event should answer:

- who or what performed the action;
- what action was attempted;
- which resource was affected;
- whether it succeeded;
- when it occurred in a synchronized time standard;
- where it originated;
- which request, process, or session links related events.

Logs should be centralized, access-controlled, integrity-protected, retained appropriately, and monitored for collection failure.

### Detection examples

- new privileged group membership;
- authentication from an unusual device or location;
- disabled security tooling;
- unexpected service installation;
- public cloud-policy change;
- mass file modification;
- DNS requests to newly observed domains;
- use of administrative protocols between user workstations;
- repeated denied access to sensitive objects;
- deletion or truncation of audit logs.

### Baselines and drift

A configuration baseline is only valuable when deviations are visible. Infrastructure as code, desired-state configuration, policy as code, and recurring compliance scans can make drift measurable.

---

## 10. Example hardening validation plan

For an internet-facing Linux API server:

1. verify only ports 443 and restricted management access are exposed;
2. enumerate enabled services and remove unused packages;
3. inspect SSH configuration and authorized keys;
4. confirm the service runs as a dedicated non-root account;
5. check filesystem permissions on code, configuration, and secrets;
6. test host firewall and upstream segmentation;
7. review TLS certificate and protocol configuration;
8. confirm logs reach the central platform and contain request identifiers;
9. simulate a failed login, privilege attempt, and service restart and confirm detection;
10. restore a test backup and measure recovery;
11. compare the host against the approved baseline;
12. document exceptions, owners, and expiration dates.

---

## Common failure modes

- creating VLANs without enforcing inter-zone policy;
- exposing management interfaces to user networks;
- using shared administrator accounts;
- disabling a service but leaving it enabled at boot;
- collecting logs without alerting on collection failure;
- relying only on perimeter controls;
- protecting production servers while ignoring identity and virtualization management planes;
- scanning container images but running them as privileged root;
- treating cloud provider defaults as a complete security baseline;
- hardening once without detecting drift.

---

## Portfolio takeaway

I learned to evaluate network and system security as an architecture rather than a checklist. The most effective design limits pathways between trust zones, constrains administrative privilege, hardens each control plane, and generates correlated evidence across identity, endpoint, network, application, container, and cloud layers.

## References

- TryHackMe Security Engineer path: https://tryhackme.com/path/outline/security-engineer-training
- CIS Benchmarks: https://www.cisecurity.org/cis-benchmarks
- Microsoft security baselines: https://learn.microsoft.com/windows/security/operating-system-security/device-management/windows-security-configuration-framework/windows-security-baselines
- NIST SP 800-190, Application Container Security Guide: https://csrc.nist.gov/pubs/sp/800/190/final
- NIST SP 800-207, Zero Trust Architecture: https://csrc.nist.gov/pubs/sp/800/207/final
