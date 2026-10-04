# Linux Privilege Escalation & Security Investigation Notes

## Purpose

This note consolidates privilege-boundary and privilege-escalation concepts
encountered during the OverTheWire Bandit training.

The objective is to explain how Linux privilege boundaries work, how security
analysts can investigate them, and why improperly configured execution
permissions can create security risk.

These techniques are documented for authorized cybersecurity training,
defensive administration, and security investigation.

## What Is Privilege Escalation?

Privilege escalation occurs when a process, user, or attacker obtains
permissions beyond those originally granted.

Two broad categories are:

- Vertical privilege escalation: obtaining higher privileges.
- Horizontal privilege escalation: accessing another user's resources
  without necessarily obtaining higher system privileges.

On Linux systems, privilege boundaries are commonly associated with:

- User identities
- Group membership
- File ownership
- File permissions
- SUID programs
- SGID programs
- Sudo configuration
- Scheduled tasks
- Services
- Writable files
- Executable search paths
- Environment configuration

## Linux Identity Model

Linux processes operate with user and group identities.

Useful commands include:

```bash
id
whoami
groups
```

These commands help establish:

Current username
User ID
Primary group
Supplementary groups
Effective identity information

Identity verification should be one of the first steps during a privilege
investigation.

Real UID and Effective UID

Linux processes can have different identity attributes.

The real user ID identifies the user that initiated a process.

The effective user ID determines which permissions are used for many access
checks.

This distinction becomes particularly important when investigating SUID
executables.

An analyst should understand the difference between:

Real UID
   |
   v
Original process identity

Effective UID
   |
   v
Identity used for privilege checks

The effective identity can therefore influence what resources a process
can access.

File Permissions

Linux file permissions determine which users and groups can:

Read
Write
Execute

A typical permission display may look like:

-rwxr-xr-x

The permission groups represent:

Owner | Group | Others

For example:

rwx | r-x | r-x

means:

Owner: read, write, execute
Group: read, execute
Others: read, execute

Permissions should always be interpreted together with ownership.

Useful commands include:

ls -la
stat filename
SUID

The Set User ID (SUID) permission allows an executable to run with the
effective user identity of the file owner.

A common example is an executable owned by root with SUID enabled.

This can create a privilege boundary that requires careful security review.

SUID files can be searched on an authorized Linux system with:

find / -perm -4000 -type f 2>/dev/null

The purpose of this investigation is to identify privileged executables
that may require additional review.

Not every SUID executable is vulnerable.

The important questions are:

Who owns the executable?
Why is SUID required?
What does the program execute?
Does it invoke other programs?
Does it process user-controlled input?
Does it rely on writable files?
Is its configuration secure?
Is the installed version trusted?
SUID Investigation

A structured SUID investigation can follow:

Enumerate SUID files.
Identify ownership.
Identify the executable purpose.
Inspect permissions.
Review dependencies and execution behavior.
Determine whether untrusted input can influence execution.
Assess the resulting privilege boundary.
Document evidence.

Useful commands include:

ls -l /path/to/program
file /path/to/program
stat /path/to/program

The objective is not simply to find SUID binaries but to determine whether
their privilege boundary is secure.

Sudo and Privileged Commands

Sudo allows authorized users to execute commands with elevated privileges.

Configuration should follow least privilege.

A security review may consider:

Which users can use sudo?
Which commands are permitted?
Are wildcards used?
Can permitted programs execute arbitrary commands?
Are environment variables restricted?
Are command paths controlled?

On an authorized system, sudo configuration may be reviewed with:

sudo -l

This command displays the commands the current user is permitted to execute
through sudo, subject to the system configuration.

Sudo permissions should be interpreted carefully because a permitted program
may have capabilities beyond its apparent primary function.

Scheduled Tasks

Scheduled execution can create privilege boundaries.

Linux systems may use:

Cron
Systemd timers
Other task schedulers

A security investigation should examine:

Which account executes the task?
Which script or binary is executed?
Who can modify it?
Which directories are writable?
Are relative paths used?
Does the task process untrusted input?

A privileged scheduled task that executes a writable script represents a
potential security weakness.

Cron Investigation

Authorized investigation may include reviewing cron configuration:

cat /etc/crontab
ls -la /etc/cron.d
ls -la /etc/cron.daily
ls -la /etc/cron.hourly

The key security question is:

Can a lower-privileged user influence something that will later execute with
higher privileges?

This is an important privilege-boundary concept.

Writable Files and Directories

Write permissions can become security-relevant when a higher-privileged
process consumes the modified resource.

Examples include:

Writable scripts
Writable configuration files
Writable service definitions
Writable executable directories
Writable libraries
Writable scheduled-task files

A useful investigation considers the relationship:

Lower privilege user
        |
        v
Writable resource
        |
        v
Privileged process
        |
        v
Security impact

Write access alone does not necessarily create a vulnerability.

The execution context and trust relationship must also be established.

PATH and Command Resolution

Programs may execute commands using a search path rather than an absolute
path.

The PATH environment variable can be inspected with:

echo "$PATH"

An insecure execution design may allow a program to resolve an unexpected
executable before the intended trusted program.

Security reviews should therefore consider:

Absolute vs relative command paths
PATH inheritance
Writable directories in PATH
Privileged execution contexts
Environment-variable handling

Privileged programs should avoid trusting attacker-controlled execution
environments.

Restricted Shells

Some training environments intentionally restrict available commands or
shell behavior.

Investigation should begin by identifying:

echo "$SHELL"
echo "$PATH"
id
whoami

The analyst can then determine:

Which commands are available
Which shell is active
Whether command parsing is restricted
Whether alternate execution paths exist
Whether the restriction changes the security boundary

Restricted-shell analysis is useful for understanding command execution and
defense-in-depth.

Privilege Escalation Investigation Workflow

A disciplined investigation can follow:

Identify User
      |
      v
Enumerate Groups
      |
      v
Review Permissions
      |
      v
Identify Privileged Execution
      |
      v
Analyze SUID / Sudo / Cron / Services
      |
      v
Identify Trust Boundaries
      |
      v
Assess Security Impact
      |
      v
Document Evidence

This approach reduces the risk of making assumptions before sufficient
evidence has been collected.

Evidence Collection

Privilege-boundary investigations may document:

Current user
User and group IDs
File ownership
File permissions
SUID/SGID status
Sudo permissions
Scheduled-task configuration
Service ownership
Writable resources
Relevant command output
Execution context
Security impact

Sensitive credentials and authentication material should never be published.

Sensitive values should be represented as:

[REDACTED]
Defensive / SOC Relevance

Privilege escalation is highly relevant to SOC and Blue Team operations.

Analysts may investigate:

Unexpected root processes
New privileged accounts
Suspicious sudo activity
Changes to SUID files
Unauthorized scheduled tasks
Modified system services
Unexpected executable permissions
Suspicious child processes
Changes to privileged configuration files

Useful telemetry may include:

Authentication logs
Process creation events
File-integrity monitoring
Audit logs
Sudo logs
Service logs
Endpoint detection telemetry
Detection Opportunities

Defenders can monitor for suspicious privilege-boundary changes.

Examples include:

SUID Changes

Unexpected creation or modification of SUID executables can indicate
privilege-boundary abuse.

Sudo Activity

Unexpected use of administrative commands can provide an investigation
signal, particularly when correlated with unusual authentication activity.

Scheduled Task Changes

Changes to cron jobs or systemd timers can indicate persistence or
privilege-abuse activity.

Privileged Process Creation

A process running with elevated privileges should be correlated with:

Parent process
Executable path
User identity
Command line
Timestamp
Preceding authentication events

Detection should focus on behavior and context rather than treating every
privileged process as malicious.

Least Privilege

Least privilege means granting users and processes only the permissions
required to perform their intended functions.

Security benefits include:

Reduced attack surface
Reduced impact of compromised accounts
Smaller privilege boundaries
Easier investigation
Reduced lateral and vertical movement opportunities

Privilege configuration should therefore be reviewed regularly.

Common Defensive Controls

Organizations can reduce privilege-escalation risk through:

Least-privilege access
Strong authentication
Controlled sudo policies
File-integrity monitoring
Secure service configuration
Restricted administrative access
Regular permission reviews
Patch management
Application allowlisting
Process monitoring
Centralized logging
Endpoint detection and response
Bandit Training Relevance

The Bandit exercises demonstrated several privilege-boundary concepts,
including:

SUID executable identification
Real UID vs effective UID
Restricted shell behavior
Scheduled execution
File permissions
Writable resources
Privileged execution
Command-resolution behavior

These exercises provide foundational knowledge for understanding how Linux
privilege boundaries can be investigated and monitored.

Security Concepts
Privilege Boundary

A privilege boundary separates processes or users with different levels of
authority.

Least Privilege

Accounts and processes should receive only the permissions they require.

SUID

SUID changes the effective execution identity of an executable to the
identity of its owner.

Trust Boundary

A trust boundary exists where data, commands, or resources cross between
different levels of authority.

Defense in Depth

Multiple independent security controls reduce the likelihood that one
misconfiguration results in complete compromise.

Lessons Learned

The Bandit exercises demonstrated that privilege escalation investigation
should begin with understanding identity, permissions, ownership, and
execution context.

A reliable workflow is:

Observe → Identify Identity → Enumerate Privileges → Analyze Trust
Boundaries → Test Safely → Assess Impact → Document

The key lesson is that a suspicious permission or privileged executable is
only meaningful when its execution context and trust relationships are
understood.

Ethical Use

Privilege-escalation techniques should only be used against systems owned by
the user or for which explicit authorization has been provided.

This note is intended for authorized cybersecurity training, controlled
laboratories, defensive administration, and security investigation.
