# Bandit Level 23 → 24

## Objective

Analyze a cron-executed script and understand how automated execution can be used to process files within a controlled Linux environment.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit23 |
| Target Account | bandit24 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Scheduled-task and script analysis |

## Investigation Approach

The investigation focused on:

1. Inspecting the cron configuration.
2. Identifying the script executed automatically.
3. Reviewing the script's execution logic.
4. Understanding file ownership and permissions.
5. Determining how the scheduled process handles user-controlled files.
6. Observing the resulting credential retrieval mechanism.
7. Keeping challenge credentials outside the repository.

## Techniques and Commands

The investigation involved:

- Linux cron analysis
- Scheduled-task investigation
- Shell-script analysis
- File ownership and permission inspection
- Writable-directory analysis
- User and process-context analysis
- Temporary-file handling
- Automated file processing
- Secure credential handling

The investigation workflow was:

1. Inspect the scheduled-task configuration relevant to the challenge.
2. Identify the script executed by the scheduled task.
3. Review the script's ownership, permissions, and execution logic.
4. Determine which directories and files the automated process accesses.
5. Analyze whether user-controlled files can influence the scheduled process.
6. Trace the execution flow and resulting file-processing behavior.
7. Validate the challenge result within the authorized training environment.
8. Keep credentials and other sensitive challenge data outside the public repository.

Representative sanitized investigation commands include:

```bash
ls -la /etc/cron.d/
cat /etc/cron.d/<relevant-job>
ls -la /usr/bin/<relevant-script>
cat /usr/bin/<relevant-script>
find <authorized-directory> -maxdepth 1 -type f -ls
```

The exact challenge-specific script name, filenames, commands, and credential output are intentionally omitted from the public documentation.

## Security Concepts

- Linux cron
- Shell scripting
- File permissions
- Automated execution
- Temporary files
- User and process context
- Credential handling

## SOC / Blue Team Relevance

Scheduled scripts should be monitored for:

- Unexpected command execution
- Suspicious file processing
- Writable directories used by privileged processes
- Unusual cron activity
- Unexpected child processes
- Changes to scheduled scripts

## MITRE ATT&CK Relevance

- **T1053.003: Scheduled Task/Job: Cron**
- **T1059.004: Command and Scripting Interpreter: Unix Shell**

## Evidence / Screenshot Reference

Recommended sanitized evidence:

- `evidence/screenshots/bandit-23-cron-analysis.png`
- `evidence/screenshots/bandit-23-script-analysis.png`
- `evidence/screenshots/bandit-23-result-redacted.png`

Screenshots must not contain passwords, tokens, private keys, or other sensitive challenge credentials.

## Credential Handling

Bandit credentials are intentionally excluded from the public repository.

Challenge credentials should remain outside the repository or be redacted before documentation is committed.

## Lessons Learned

This exercise reinforced several practical Linux security and monitoring concepts:

- Scheduled tasks should be investigated together with the scripts and commands they execute.
- Analysts should evaluate file ownership and permissions when automated processes access user-controlled locations.
- Writable directories can become security-sensitive when privileged or automated processes operate within them.
- Script execution context is important when assessing the security impact of automated file processing.
- Temporary-file handling should be reviewed carefully because unsafe permissions or ownership can create security risks.
- Unexpected cron activity, file processing, or child-process creation can provide useful SOC investigation signals.
- Sensitive credentials obtained during authorized testing should be excluded from public documentation.

## Training Outcome

This level strengthened practical understanding of Linux cron, shell scripting, file permissions, automated execution, temporary-file handling, process context, and defensive monitoring of scheduled activity.

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
