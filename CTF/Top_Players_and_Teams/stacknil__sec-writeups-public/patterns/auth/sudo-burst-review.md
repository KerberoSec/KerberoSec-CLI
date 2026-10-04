---
maturity: reviewed
last_reviewed: 2026-07-05
---

# Sudo Burst Review

## Signal

What evidence appears?

A user runs many `sudo` commands in a short period, especially after a fresh
login, privilege change, or suspicious authentication event.

Common evidence:

* multiple `sudo` command events clustered together
* repeated password prompts or authentication failures
* commands touching accounts, SSH keys, logs, services, packages, or cron
* `sudo -l` followed by privileged command execution
* activity from an unusual source, host, or time of day

## Why it matters

What risk does it suggest?

The pattern may indicate privilege discovery, post-compromise enumeration,
hands-on-keyboard activity, or an operator trying to convert user access into
administrative control.

## False-positive contexts

When can it be benign?

* system administration during maintenance
* package installation or upgrade work
* incident response collection by an authorized defender
* a developer debugging local service permissions
* configuration management running under a human account

## Evidence limits

What must be present before making a claim?

At minimum, show the user, host, command list, command timing, authentication
result, session source, and any preceding login or account-change event.

Do not claim malicious privilege escalation from `sudo` volume alone. The claim
needs command context, unusual timing, suspicious sequence, or follow-on system
changes.

## Defensive next step

What should a defender check next?

Review the full session timeline around the burst. Confirm whether the commands
changed persistence, credentials, services, logs, network tools, or sensitive
files, and compare the behaviour against the user's normal administrative role.

## Related implementation

[LogLens](https://github.com/stacknil/LogLens)

## Supporting notes

* [Logs Fundamentals](../../notes/80-blue-team/logs-fundamentals.md)
* [Incident Response Fundamentals](../../notes/80-blue-team/incident-response-fundamentals.md)
