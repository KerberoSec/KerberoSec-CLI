# Bandit Level 22 → 23

## Objective

Analyze a scheduled cron task and the script it executes to understand how a dynamically generated filename is derived and how the resulting file is used to obtain the Bandit Level 23 credential.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit22 |
| Target Account | bandit23 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Scheduled-task and script analysis |

## Investigation Approach

The challenge focused on analyzing an automated Linux task and understanding the relationship between a cron configuration, the executed script, and a dynamically generated output filename.

The investigation focused on:

1. Accessing the Bandit Level 22 environment.
2. Inspecting the cron configuration associated with the account.
3. Identifying the script executed by the scheduled task.
4. Reviewing the script logic and variables used to construct its output filename.
5. Identifying the hashing operation used by the script.
6. Reproducing the filename-generation logic in the authorized training environment.
7. Inspecting the resulting file and treating its contents as sensitive credential material.
8. Keeping the credential outside the public repository.

## Techniques and Commands

The investigation involved:

- Linux cron analysis
- Scheduled-task investigation
- Shell-script analysis
- Variable and command substitution
- MD5 hashing
- File inspection
- Execution-context analysis
- Secure credential handling

The investigation workflow was:

1. Inspect the scheduled-task configuration relevant to the challenge.
2. Identify the script executed by the scheduled task.
3. Inspect the script's ownership, permissions, and command logic.
4. Trace the variables and command substitutions used by the script.
5. Determine the input used by the hashing operation.
6. Reproduce the deterministic hash calculation in the authorized training environment.
7. Identify the resulting output artifact without exposing the credential.
8. Validate the challenge result and keep sensitive data outside the public repository.

Representative sanitized investigation commands include:

```bash
cat /etc/cron.d/<relevant-job>
cat /usr/bin/<relevant-script>
md5sum <sanitized-input>
```

The exact script name, generated filename, input value, and credential output are intentionally omitted from the public documentation.

## Security Concepts

### Cron-Based Execution

Cron allows commands and scripts to execute automatically according to a configured schedule.

From a defensive perspective, cron configuration should be reviewed when investigating unexpected automated activity or possible persistence.

### Script Analysis

The scheduled script is an important security artifact.

Analysts should examine:

- Script ownership
- File permissions
- Environment variables
- Command substitution
- Hashing operations
- Input sources
- Output files
- User execution context

Understanding the complete execution chain is often more important than looking at the cron entry alone.

### Hash-Based Filenames

The challenge demonstrates how a script can use a hash function to derive a filename.

Hashing can be useful for deterministic identifiers, but security analysts should understand exactly what data is being hashed and whether the resulting value is being used as a security boundary.

### Credential Security

Credentials obtained during a controlled security exercise should be treated as sensitive information.

Challenge credentials were not included in this repository.

## SOC / Blue Team Relevance

Cron and scheduled-script analysis can help analysts investigate:

- Persistence mechanisms
- Unauthorized scheduled tasks
- Modified administrative scripts
- Suspicious command execution
- Unexpected file creation
- Automated credential access

A useful investigation workflow is:

**Cron configuration → Executed script → Execution context → Command logic → Output artifact**

This approach helps establish how an automated process operates and what security-relevant artifacts it produces.

## MITRE ATT&CK Relevance

This exercise provides defensive learning related to:

- **T1053: Scheduled Task/Job**
- **T1053.003: Scheduled Task/Job: Cron**
- **T1059.004: Command and Scripting Interpreter: Unix Shell**

These mappings are provided for security-learning purposes and do not imply that the Bandit challenge itself represents a real-world intrusion.

## Evidence / Screenshot Reference

Recommended sanitized evidence:

- `evidence/screenshots/bandit-22-cron-configuration.png`
- `evidence/screenshots/bandit-22-script-analysis.png`
- `evidence/screenshots/bandit-22-hash-calculation.png`
- `evidence/screenshots/bandit-22-result-redacted.png`

Screenshots must not contain passwords, tokens, private keys, or other sensitive credentials.

Because the original Level 22 command history was not available during documentation recovery, these filenames represent recommended evidence rather than proof that the screenshots currently exist.

## Credential Handling

No Bandit password is intentionally stored in this repository.

Challenge credentials should remain outside the public project directory or be redacted before documentation and screenshots are committed.

## Learning Outcome

This level strengthened practical understanding of Linux cron, scheduled-task investigation, shell-script analysis, hashing operations, dynamic filenames, automated execution, and secure credential handling.

## Lessons Learned

This exercise reinforced several practical Linux security and monitoring concepts:

- Scheduled tasks should be investigated together with the scripts and commands they execute.
- Analysts should trace variables and command substitutions to understand automated execution behavior.
- Hash-based filename generation can create deterministic artifacts that are useful during investigation.
- File ownership, permissions, execution context, and output files should be evaluated as part of the same execution chain.
- Unexpected scheduled scripts or automated file creation can provide useful indicators of persistence or unauthorized activity.
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

Successfully completed the Bandit Level 22 → 23 objective.

The exercise strengthened practical understanding of:

- Linux cron jobs
- Scheduled shell scripts
- Script and command analysis
- Predictable file-generation behavior
- Hash-based filename generation
- File permissions
- Automated process investigation
- SOC detection opportunities involving scheduled execution

**Status: Completed**
