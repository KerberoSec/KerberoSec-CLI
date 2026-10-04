# Module 8: Shells and Privilege Escalation

> **Portfolio scope:** Detailed lab methodology for shell handling, Linux privilege escalation, and Windows privilege escalation. Commands are intended only for authorized TryHackMe-style lab machines.

## Module coverage

This module covered:

- reverse and bind shells;
- shell stabilization and transport;
- systematic Linux privilege-escalation enumeration;
- systematic Windows privilege-escalation enumeration;
- configuration and credential weaknesses;
- controlled proof and cleanup.

The central lesson is that privilege escalation is an enumeration problem. Most paths come from excessive permissions, insecure services, exposed credentials, or unsafe trust relationships rather than a single universal exploit.

---

# Part I: Shell fundamentals

## 1. Reverse and bind shells

### Reverse shell

The target initiates a connection to the tester-controlled listener.

```text
Target -> Tester listener
```

Advantages:

- often works through inbound firewall restrictions;
- listener can be controlled by the tester.

Limitations:

- target must reach the listener;
- egress filtering may block it;
- NAT/VPN interface selection matters;
- connection may be detected.

### Bind shell

The target listens on a port and the tester connects.

```text
Tester -> Target listening port
```

Limitations:

- inbound filtering may block access;
- exposes a service on the target;
- can be reached by others if not restricted;
- may violate engagement rules.

Use only lab-provided shell techniques and approved ports.

---

## 2. Netcat and Socat concepts

A simple listener in a lab:

```bash
rlwrap nc -lvnp 4444
```

The exact Netcat implementation and options vary.

Socat can create richer transports and PTYs. Example listener concept:

```bash
socat TCP-LISTEN:4444,reuseaddr,fork FILE:`tty`,raw,echo=0
```

Review commands before use and restrict them to lab systems. Encrypted Socat channels require certificate generation and careful option handling.

---

## 3. Stabilizing a Linux shell

A basic shell may lack line editing, job control, or a proper terminal.

Common lab sequence:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

Then suspend locally, adjust terminal, and return as appropriate:

```text
Ctrl-Z
stty raw -echo; fg
reset
```

Finally inspect terminal size and set rows/columns if needed:

```bash
stty size
stty rows <rows> cols <cols>
```

This process is environment-dependent and can break the session. Record the initial access method so it can be re-established safely.

---

# Part II: Linux privilege escalation

## 4. Establish the current context

```bash
id
whoami
hostname
uname -a
cat /etc/os-release
pwd
```

Record:

- current user and groups;
- hostname and OS;
- kernel and architecture;
- current directory;
- environment type: host, container, or restricted shell.

Do not jump directly to kernel exploits. Start with configuration and privilege relationships.

---

## 5. Sudo permissions

```bash
sudo -l
```

Review:

- commands allowed;
- whether a password is required;
- allowed target user;
- wildcard arguments;
- environment preservation;
- scripts or binaries writable by the current user.

Risk patterns:

- editor, pager, interpreter, or archive utility allowed as root;
- command with user-controlled file or path;
- wildcard expansion;
- writable script executed through sudo;
- environment variables affecting privileged execution.

Remediation:

- grant exact commands and arguments;
- use root-owned scripts with fixed paths;
- avoid general interpreters/editors;
- reset environment;
- review sudo logs.

---

## 6. SUID and SGID binaries

```bash
find / -xdev -perm -4000 -type f -ls 2>/dev/null
find / -xdev -perm -2000 -type f -ls 2>/dev/null
```

SUID executes with the file owner’s effective UID; SGID can execute with group privilege.

Investigate:

- unusual custom binaries;
- writable executable or library paths;
- unsafe command calls;
- environment or PATH dependence;
- known intended behavior that permits shell escape.

Expected system SUID files are not automatically vulnerabilities. The issue depends on behavior and permissions.

---

## 7. Linux capabilities

```bash
getcap -r / 2>/dev/null
```

Capabilities split root privilege into units. High-risk examples include capabilities that permit:

- changing UID;
- raw network access;
- DAC bypass;
- process tracing;
- system administration.

A scripting language or general-purpose binary with powerful capabilities can enable escalation.

Remediation:

- remove unnecessary capabilities;
- use a narrowly scoped helper;
- restrict executable ownership and integrity;
- monitor capability changes.

---

## 8. Scheduled tasks and cron

```bash
cat /etc/crontab
ls -la /etc/cron.*
systemctl list-timers --all
```

Look for:

- root jobs executing writable scripts;
- relative command paths;
- writable directories in PATH;
- wildcard use;
- predictable temporary files;
- backup scripts processing attacker-controlled filenames.

A safe proof in a lab should demonstrate that a controlled marker can be created by the privileged job rather than replacing system files.

Remediation:

- root ownership and non-writable scripts;
- absolute command paths;
- fixed safe PATH;
- secure temporary files;
- remove unsafe wildcard processing;
- monitor scheduled-task changes.

---

## 9. Services and writable files

```bash
systemctl list-units --type=service --state=running
ps auxf
```

Investigate:

- service executable paths;
- unit files;
- environment files;
- writable configuration;
- plugins and libraries;
- service account privileges;
- restart permission.

```bash
systemctl cat <service>
ls -l <service-binary> <config-path>
```

A writable binary used by a root service is high risk if the attacker can trigger a restart or wait for normal restart.

---

## 10. PATH and environment hijacking

Unsafe privileged scripts may call commands without absolute paths.

Inspect:

```bash
echo "$PATH"
strings <custom-binary> | less
```

Questions:

- Does a privileged process execute `tar`, `cp`, or another command by name?
- Is a user-writable directory earlier in PATH?
- Is the environment preserved through sudo?

Remediation: use absolute paths and a controlled environment.

---

## 11. Credentials and sensitive files

Search carefully and avoid collecting unnecessary data.

Potential locations:

- application configuration;
- shell history;
- backups;
- environment files;
- SSH keys;
- database connection strings;
- scripts;
- mounted shares;
- cloud metadata or credentials.

Targeted lab examples:

```bash
find /home /opt /var/www -type f \( -name '*.conf' -o -name '*.env' -o -name '*.bak' \) 2>/dev/null
find /home -name 'id_rsa' -o -name 'id_ed25519' 2>/dev/null
```

Do not perform uncontrolled recursive searches across large production filesystems. Treat discovered credentials as sensitive evidence.

---

## 12. NFS and shared filesystems

Review mounts and exports:

```bash
mount
cat /etc/fstab
showmount -e <authorized-nfs-server>
```

Unsafe export options, UID mapping, or writable scripts can create escalation paths. Exact behavior depends on server configuration and filesystem ownership.

---

## 13. Containers and groups

Group membership can imply powerful access:

```bash
id
getent group docker
ls -l /var/run/docker.sock
```

Access to a container runtime socket can effectively grant host-level control in many configurations. Similar risk may exist with virtualization, backup, disk, or log-management groups.

Remediation:

- restrict group membership;
- protect runtime sockets;
- rootless or isolated administration where feasible;
- monitor privileged container creation.

---

## 14. Kernel exploits

Kernel exploitation should be a later option because it can crash the host or create instability.

Before considering it:

- confirm exact kernel and vendor patch level;
- review backports;
- verify architecture;
- understand exploit reliability and side effects;
- obtain explicit permission;
- use a disposable lab snapshot;
- define rollback.

Configuration-based escalation is generally safer to validate.

---

# Part III: Windows privilege escalation

## 15. Establish context

```cmd
whoami
whoami /all
hostname
systeminfo
```

PowerShell:

```powershell
Get-ComputerInfo
Get-LocalUser
Get-LocalGroupMember Administrators
```

Record:

- current user and groups;
- integrity level and privileges;
- OS/build;
- domain membership;
- architecture;
- security products;
- installed updates where available.

---

## 16. Token privileges

```cmd
whoami /priv
```

Privileges such as impersonation, assigning tokens, backup, restore, debug, or loading drivers can be security-sensitive. Exploitability depends on the process context, service configuration, and OS protections.

Do not assume a listed privilege is enabled or directly exploitable. Research the exact context and use a safe lab proof.

---

## 17. Service misconfiguration

Enumerate services:

```powershell
Get-CimInstance Win32_Service |
  Select-Object Name,StartName,State,PathName
```

Investigate:

- unquoted paths containing spaces;
- writable service binary;
- writable service directory;
- weak service-control permissions;
- modifiable registry configuration;
- high-privileged service account;
- ability to restart the service.

### Unquoted service path

A path such as:

```text
C:\Program Files\Example Service\service.exe
```

without quotes may cause Windows to search alternative executable paths. Exploitation also requires a writable candidate directory and service restart conditions.

### Permission review

Use approved tools such as `sc.exe`, PowerShell ACL inspection, or Sysinternals AccessChk in the lab.

Remediation:

- quote executable paths;
- restrict file and service permissions;
- use least-privileged service accounts;
- monitor service changes.

---

## 18. Scheduled tasks

```cmd
schtasks /query /fo LIST /v
```

PowerShell:

```powershell
Get-ScheduledTask
```

Look for:

- high-privileged tasks executing writable scripts;
- writable executables or directories;
- insecure arguments;
- credentials or secrets in task configuration;
- ability to run or modify the task.

---

## 19. Registry and installer policy

Review sensitive policy and autorun locations in the lab. One known misconfiguration is allowing Windows Installer packages to run with elevated privilege through unsafe policy combinations.

Do not report a registry value alone without confirming both required conditions and actual exploitability.

Other areas:

- service configuration;
- autoruns;
- stored credentials;
- PowerShell history;
- application configuration;
- unattended installation files.

---

## 20. DLL search-order and binary loading

A privileged application may load a missing DLL from a writable location.

Validation requires:

- identifying the exact missing library;
- confirming search order;
- confirming writable directory;
- determining trigger and privilege;
- using a harmless lab DLL if permitted;
- avoiding system instability.

Remediation:

- secure directories;
- use absolute library paths;
- correct application packaging;
- enable application control and monitoring.

---

## 21. Credentials

Potential sources:

- configuration files;
- unattended installation files;
- PowerShell history;
- saved credentials;
- browser or application stores;
- network shares;
- deployment scripts;
- environment variables.

Lab inspection examples:

```cmd
cmdkey /list
```

```powershell
Get-ChildItem Env:
Get-PSReadLineOption
```

Avoid dumping or cracking credentials unless specifically required. A finding can often be proven by demonstrating readable secret material without using it further.

---

## 22. Installed software and patch level

```powershell
Get-CimInstance Win32_Product  # Can be slow and cause repair actions; avoid casually.
```

Prefer registry-based inventory or approved management data rather than `Win32_Product` in production.

Review:

- vulnerable privileged applications;
- outdated drivers;
- management agents;
- local services;
- patch status;
- vendor advisories and backports.

Kernel or driver exploits are high-risk and should be a last resort in a disposable lab.

---

## 23. Automated enumeration tools

Tools such as LinPEAS, WinPEAS, PowerUp, Seatbelt, or similar can accelerate discovery but generate large output and may trigger security controls.

Before use:

- review source and release;
- verify hash;
- understand checks performed;
- obtain permission;
- use the least invasive options;
- manually validate every candidate;
- remove uploaded tools.

Automated output is not a confirmed finding.

---

## 24. Prioritization methodology

Evaluate candidates in this order:

1. direct delegated privilege (`sudo`, service control, token privilege);
2. writable privileged scripts/binaries/configuration;
3. exposed credentials and trust relationships;
4. scheduled tasks and services;
5. dangerous group memberships;
6. application-specific weaknesses;
7. kernel/driver exploits last.

For each candidate, ask:

- Can I control the input?
- Will a higher-privileged process consume it?
- Can I trigger that process?
- What is the safest proof?
- What artifact will be created?
- How will I clean up?

---

## 25. Reporting example

> A root-owned cron job executed `/opt/backup/run.sh` every minute. The script was writable by the `backup` group, which included the low-privileged application user. This allowed group members to modify commands executed as root. In the lab, the issue was validated by adding a temporary command that created a root-owned marker file; no interactive root shell or persistence was created. Remediation is to make the script and parent directory root-owned and non-writable, restrict group membership, use absolute command paths, and monitor cron configuration changes.

This explains control, trigger, privilege, proof, and remediation.

---

## Common mistakes

- running kernel exploits first;
- using automated scripts without understanding output;
- treating every SUID file or Windows privilege as exploitable;
- ignoring trigger conditions;
- overlooking writable parent directories;
- collecting unnecessary credentials;
- creating persistent privileged access when a marker is sufficient;
- failing to record artifacts;
- not removing tools and test files;
- confusing container root with host root.

---

## Portfolio takeaway

I learned to perform privilege escalation as a structured trust analysis: current identity, delegated permissions, privileged execution paths, writable inputs, credentials, scheduled processes, and operating-system vulnerabilities. The safest proof demonstrates the privilege boundary with minimal change and includes complete cleanup.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- TryHackMe Linux Privilege Escalation: https://tryhackme.com/room/linprivesc
- Microsoft Windows security documentation: https://learn.microsoft.com/windows/security/
- GTFOBins (authorized reference for Unix binary behavior): https://gtfobins.github.io/
- LOLBAS (authorized reference for Windows binaries): https://lolbas-project.github.io/
