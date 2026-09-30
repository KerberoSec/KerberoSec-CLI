# Bandit Level 21 → 22

## Objective

Investigate a scheduled task that periodically executes a script and determine how the task is used to obtain the credential for the Bandit Level 22 account.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit21 |
| Target Account | bandit22 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Scheduled-task and script analysis |

## Investigation Approach

The challenge focused on Linux scheduled tasks and the security implications of scripts executed automatically by the system.

The investigation involved:

1. Accessing the Bandit Level 21 environment.
2. Inspecting the system cron configuration.
3. Identifying the scheduled task associated with the Bandit account.
4. Examining the script executed by the scheduled task.
5. Understanding which account and files were involved in the scheduled execution.
6. Following the authorized execution path to obtain the next-level credential.
7. Keeping the credential out of the public repository.

## Techniques and Commands

The investigation involved:

- Linux cron
- Scheduled-task analysis
- File inspection
- Shell-script analysis
- File permissions
- User/execution-context analysis
- Secure credential handling

The investigation workflow was:

1. Inspect the system's scheduled-task configuration.
2. Identify the cron job relevant to the challenge.
3. Determine which command or script the scheduled task executes.
4. Inspect the referenced script and its ownership and permissions.
5. Analyze the script's execution behavior and referenced resources.
6. Determine how the scheduled execution produces the required challenge result.
7. Validate the result without exposing the credential.
8. Keep sensitive challenge data outside the public repository.

Representative sanitized investigation commands include:

```bash
ls -la /etc/cron.d/
cat /etc/cron.d/<relevant-job>
ls -la /usr/bin/<relevant-script>
cat /usr/bin/<relevant-script>
```

The exact challenge filenames and sensitive credential output are intentionally omitted from the public documentation.

## Security Concepts

### Cron

Cron is a Linux scheduling mechanism used to execute commands or scripts automatically at specified times.

Scheduled tasks are important security-monitoring artifacts because they can provide persistence or execute administrative operations without direct user interaction.

### Scheduled Scripts

A cron job may execute a shell script or another program.

Security analysts should examine:

- Script ownership
- File permissions
- Executed commands
- Referenced files
- User context
- Output destinations

Unexpected modifications to scheduled scripts can create security risks.

### File Permissions

The security of a scheduled task depends partly on who can modify the files and scripts involved.

Scripts executed automatically should have appropriate ownership and permissions so unauthorized users cannot alter their behavior.

### Credential Security

Credentials obtained during a controlled security exercise should be treated as sensitive information.

Challenge passwords were not included in this repository.

## SOC / Blue Team Relevance

Cron analysis is relevant to defensive security because scheduled tasks can be abused for persistence and automated execution.

A SOC analyst investigating a Linux host may review:

- `/etc/cron.d/`
- `/etc/crontab`
- User crontabs
- Scheduled scripts
- File ownership and permissions
- Recent changes to scheduled-task configuration

Useful investigation questions include:

- What scheduled tasks exist?
- Which user executes them?
- What scripts do they launch?
- Can an unprivileged user modify those scripts?
- What files or commands do the scripts access?

## MITRE ATT&CK Relevance

This exercise provides defensive learning related to:

- **T1053: Scheduled Task/Job**
- **T1053.003: Scheduled Task/Job: Cron**

These mappings are provided for security-learning purposes and do not imply that the Bandit challenge itself represents a real-world intrusion.

## Evidence / Screenshot Reference

Recommended sanitized evidence:

- `evidence/screenshots/bandit-21-cron-configuration.png`
- `evidence/screenshots/bandit-21-script-analysis.png`
- `evidence/screenshots/bandit-21-permissions.png`
- `evidence/screenshots/bandit-21-result-redacted.png`

Screenshots must not contain passwords, tokens, private keys, or other sensitive credentials.

## Credential Handling

No Bandit password is intentionally stored in this repository.

Challenge credentials should remain outside the public project directory or be redacted before screenshots and documentation are committed.

## Learning Outcome

This level strengthened practical understanding of Linux cron, scheduled-task analysis, shell scripts, file permissions, automated execution, credential handling, and defensive monitoring of persistence-related mechanisms.

## Lessons Learned

This exercise reinforced several practical Linux security and monitoring concepts:

- Scheduled tasks are important security artifacts that should be reviewed during host investigations.
- Cron jobs should be evaluated together with the scripts, commands, ownership, and permissions they reference.
- Automatically executed scripts can create security risks when unauthorized users can modify them.
- Execution context is important when determining the potential impact of a scheduled task.
- Unexpected scheduled-task changes can provide useful indicators of persistence or unauthorized activity.
- Sensitive credentials obtained during authorized testing should be excluded from public documentation.

## Limitations

This exercise was performed in the controlled OverTheWire Bandit training
environment and therefore does not reproduce the complexity of a production
enterprise environment.

Limitations include:

- Synthetic or intentionally constructed challenge conditions.
- Limited system and network scope.
- No production authentication infrastructure.
- No enterprise SIEM, EDR, identity platform, or centralized logging.
- No real organizational incident-response process.
- Challenge objectives may simplify real-world investigative scenarios.
- Results should not be interpreted as evidence of production security
  capability by themselves.

The primary value of the exercise is the development of transferable Linux,
command-line investigation, analytical reasoning, evidence-handling, and
security-documentation skills.

## Ethical Use

This documentation is based on authorized activity within the OverTheWire Bandit training environment.

The techniques described should only be used against systems for which explicit authorization has been provided.

## Training Outcome

Successfully completed the Bandit Level 21 → 22 objective.

The exercise strengthened practical understanding of:

- Linux cron jobs
- Scheduled command execution
- Cron configuration analysis
- Script execution context
- File permissions and ownership
- Automated credential handling
- Defensive monitoring of scheduled tasks

**Status: Completed**
