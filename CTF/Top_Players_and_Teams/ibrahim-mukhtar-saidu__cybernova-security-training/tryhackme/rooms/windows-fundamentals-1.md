# TryHackMe Room: Windows Fundamentals 1

## Overview

- **Platform:** TryHackMe
- **Room:** Windows Fundamentals 1
- **Difficulty:** Easy
- **Category:** Windows / Operating System Fundamentals
- **Status:** Completed
- **Environment:** Authorized TryHackMe laboratory
- **Primary Platform:** Microsoft Windows

## Objective

The objective of this room was to build foundational knowledge of Microsoft
Windows and introduce important operating-system and security concepts.

The room covered:

- Windows editions and security capabilities
- The Windows graphical user interface
- File systems and NTFS
- The Windows `System32` directory
- Local user accounts, groups, and permissions
- User Account Control (UAC)
- Control Panel and Windows security settings
- Task Manager and process-management fundamentals

## Environment

The work was performed within the authorized TryHackMe Windows laboratory
environment.

No passwords, flags, authentication tokens, private keys, or other sensitive
authentication material are included in this report.

## Initial Observations

Windows provides several built-in components that are important from both
administrative and security perspectives.

The room introduced the relationship between:

- User accounts and groups
- File-system permissions
- Administrative privileges
- User Account Control (UAC)
- System configuration
- Running processes
- Windows security controls

Understanding these components is important for both endpoint administration
and SOC investigations.

---

# Task 1: Introduction to Windows

## Objective

This task introduced the Windows environment used throughout the room.

## Activity

The authorized TryHackMe Windows virtual machine was started and used as the
laboratory environment for the remaining tasks.

No answer was required for this task.

## Security Relevance

Basic familiarity with the Windows desktop is important for SOC analysts
because endpoint investigations frequently involve Windows hosts.

---

# Task 2: Windows Editions

## Objective

This task examined different Windows editions and the security capabilities
available in them.

## Finding

The security feature identified as available in Windows Pro but not Windows
Home in the same way was:

`BitLocker`

## Security Relevance

BitLocker provides full-volume encryption that helps protect stored data if
a device is lost or stolen.

For organizations, endpoint encryption is an important control for protecting
data at rest.

---

# Task 3: The Desktop (GUI)

## Objective

This task introduced important components of the Windows graphical interface
and their configuration options.

## Findings

### Search Box

The relevant configuration option was:

`Hidden`

### Task View

The relevant configuration option was:

`Show Task View Button`

### Notification Area

The Windows component identified alongside the Clock, Volume, and Network
icons was:

`Action Center`

## Security Relevance

The Windows desktop provides access to administrative and security functions.
Understanding the normal interface helps an analyst recognize unexpected
configuration changes during endpoint investigations.

---

# Task 4: File System

## Objective

This task introduced the Windows file system and the NTFS file system.

## Finding

NTFS stands for:

`New Technology File System`

## Security Relevance

Understanding the Windows file system is important when investigating file
access, permissions, system artifacts, and potentially suspicious changes on
an endpoint.

---

# Task 5: Windows\System32

## Objective

This task examined the Windows `System32` directory and its importance to the
operating system.

## Finding

The Windows environment variable representing the Windows installation
directory is:

`%windir%`

## Security Relevance

`System32` contains important Windows system components. Unauthorized
modification or deletion of files within system directories can affect system
stability and security.

---

# Task 6: User Accounts, Profiles, and Permissions

## Objective

This task examined Windows local user accounts, groups, permissions, and
built-in accounts.

## Findings

The additional local user account identified in the laboratory was:

`tryhackmebilly`

The account was a member of:

`Remote Desktop Users, Users`

The built-in account identified for guest access was:

`Guest`

The Guest account status was:

`Account is disabled`

## Security Relevance

User accounts and group memberships directly affect access to Windows
resources.

Membership in privileged or remote-access groups should be monitored because
compromised accounts can potentially be abused to access systems or resources.

Disabled accounts also help reduce unnecessary access when an account is no
longer required.

---

# Task 7: User Account Control (UAC)

## Objective

This task introduced User Account Control and its role in controlling
administrative actions.

## Finding

UAC stands for:

`User Account Control`

## Security Relevance

UAC provides an additional privilege-control layer when applications or users
attempt to perform administrative actions.

It can help reduce unauthorized changes by requiring elevation for operations
that need administrative privileges.

---

# Task 8: Control Panel

## Objective

This task examined Windows Control Panel and its available configuration
settings.

## Finding

When viewing the Control Panel using small icons, the requested final setting
was:

`Windows Defender Firewall`

## Security Relevance

The Windows firewall is an important endpoint security control that can help
restrict unwanted network communication.

Firewall configuration should be monitored because unauthorized changes can
weaken endpoint protection.

---

# Task 9: Task Manager

## Objective

This task introduced Windows Task Manager and its role in viewing and
managing running processes and system activity.

## Finding

The keyboard shortcut used to open Task Manager was:

`Ctrl + Shift + Esc`

## Security Relevance

Task Manager provides useful endpoint visibility into processes, applications,
resource usage, and other system activity.

During an investigation, unusual processes or unexpected resource consumption
can provide useful leads for further analysis.

---

# Task 10: Terminate the Windows Machine

## Objective

This task concluded the laboratory exercise.

## Activity

The TryHackMe Windows laboratory machine was terminated after completing the
room.

No answer was required for this task.

---

# Investigation Methodology

The room was approached as a structured Windows endpoint familiarization
exercise:

1. Identify the major Windows interface components.
2. Understand the underlying file-system structure.
3. Examine local accounts and group membership.
4. Understand administrative privileges and UAC.
5. Review security-related Control Panel settings.
6. Understand basic process-management functionality.
7. Relate these components to defensive endpoint monitoring.

---

# Findings

## Finding 1: Administrative Privileges Increase Security Risk

- **Severity:** Informational
- **Observation:** Windows distinguishes between Administrator and Standard
  User accounts.
- **Analysis:** Administrative accounts have greater authority to change system
  configuration and access protected resources.
- **Security Impact:** Excessive administrative privileges can increase the
  impact of a compromised account.

## Finding 2: Account and Group Membership Requires Monitoring

- **Severity:** Informational
- **Observation:** The laboratory contained the `tryhackmebilly` account,
  which belonged to the `Remote Desktop Users` and `Users` groups.
- **Analysis:** Group membership determines which resources and capabilities
  an account can access.
- **Security Impact:** Unexpected membership changes can indicate unauthorized
  privilege or access changes.

## Finding 3: Disabled Accounts Reduce Unnecessary Access

- **Severity:** Informational
- **Observation:** The built-in `Guest` account was disabled.
- **Analysis:** Disabling accounts that are not required reduces unnecessary
  authentication paths.
- **Security Impact:** Proper account lifecycle management reduces the attack
  surface of an endpoint.

## Finding 4: UAC Provides a Privilege-Control Layer

- **Severity:** Informational
- **Observation:** Windows uses User Account Control to manage elevation of
  administrative actions.
- **Analysis:** UAC helps prevent applications and users from silently
  performing operations that require elevated privileges.
- **Security Impact:** Proper privilege separation can limit unauthorized
  system changes.

## Finding 5: Task Manager Provides Endpoint Visibility

- **Severity:** Informational
- **Observation:** Task Manager provides visibility into running processes,
  applications, and system resource usage.
- **Analysis:** Process visibility is useful when investigating unusual
  endpoint activity.
- **Security Impact:** Unexpected processes or resource consumption can provide
  indicators for further investigation.

---

# MITRE ATT&CK Relevance

This room focused on Windows fundamentals rather than demonstrating a specific
adversary technique.

Therefore, no MITRE ATT&CK technique is claimed as directly observed.

The concepts covered are nevertheless relevant to defensive analysis of
account usage, privilege management, endpoint activity, and system
configuration.

Avoiding unsupported ATT&CK mappings helps keep this report technically
accurate.

---

# Defensive / SOC Relevance

The Windows fundamentals covered in this room are directly relevant to
endpoint monitoring and SOC investigations.

A SOC analyst may investigate:

- Unexpected account creation or account changes
- Suspicious group membership changes
- Unauthorized administrative activity
- Unexpected use of remote-access groups
- Changes to firewall configuration
- Suspicious processes
- Attempts to bypass or weaken security controls
- Changes to important Windows system files

## Detection Opportunities

Useful Windows telemetry for these investigations can include:

- Windows Security Event Logs
- Account creation and account modification events
- Group membership changes
- Successful and failed authentication events
- Process creation telemetry
- Windows Defender and firewall events
- Endpoint Detection and Response (EDR) telemetry
- PowerShell and command-line logging where enabled

Examples of defensive monitoring include:

1. Alert on unexpected creation of local administrator accounts.
2. Monitor changes to privileged or remote-access groups.
3. Investigate repeated failed authentication attempts.
4. Monitor unusual process creation and parent-child process relationships.
5. Detect unauthorized changes to Windows firewall configuration.
6. Monitor attempts to disable or weaken security controls.

## Recommended Defensive Controls

Organizations should consider:

- Applying least privilege to user accounts.
- Avoiding unnecessary administrator privileges.
- Disabling unused accounts.
- Reviewing privileged and remote-access group membership regularly.
- Enabling appropriate Windows security logging.
- Centralizing endpoint logs in a SIEM.
- Using EDR for process and endpoint visibility.
- Maintaining Windows Defender and firewall protections.
- Applying security updates and patches.
- Monitoring important Windows system directories.

---

# Lessons Learned

- Windows user accounts and groups are fundamental to access control.
- NTFS is an important component of Windows file and permission management.
- Administrative privileges should be limited according to least-privilege
  principles.
- UAC provides an additional control layer for administrative operations.
- Windows Defender Firewall is an important endpoint network-security control.
- Task Manager provides useful basic visibility into endpoint processes and
  resource usage.
- Understanding normal Windows behavior provides a foundation for identifying
  suspicious endpoint activity.

---

# Evidence Handling

No screenshots were retained from this room.

This report therefore does not claim to contain screenshot-based evidence or
fabricated visual evidence.

The documented findings are based on the completed TryHackMe laboratory tasks
and the observations recorded during the exercise.

Sensitive challenge information, including passwords, flags, tokens, and
private keys, has intentionally been excluded.

---

# Evidence

**Evidence status:** No screenshots retained.

No sensitive authentication material or challenge flags are included in this
repository report.

---

# Ethical Scope

All activity documented in this report was performed within the authorized
TryHackMe laboratory environment.

The techniques and concepts described must only be used against systems for
which explicit authorization has been provided.

---

# Conclusion

Windows Fundamentals 1 provided a practical introduction to core Windows
operating-system concepts that are relevant to cybersecurity and SOC work.

The exercise covered Windows editions, the graphical interface, NTFS,
System32, user accounts, groups, permissions, UAC, Windows Defender Firewall,
and Task Manager.

These fundamentals provide a foundation for understanding Windows endpoint
telemetry and investigating suspicious account, process, privilege, and
configuration activity in a defensive security environment.
