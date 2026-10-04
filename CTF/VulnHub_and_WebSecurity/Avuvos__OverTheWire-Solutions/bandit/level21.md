# Bandit Level 21 -> 22

## Goal

Examine a cron job to find the password.

## Key Concept

Cron jobs and scheduled task analysis.

## Solution

Check the cron job configuration:

```bash
cat /etc/cron.d/cronjob_bandit22
```

Read the script it executes:

```bash
cat /usr/bin/cronjob_bandit22.sh
```

The script writes the password to a temp file. Read it:

```bash
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

## Why This Works

Cron jobs run scripts automatically at scheduled times. By reading the script, we can see where it stores output and access it directly.
