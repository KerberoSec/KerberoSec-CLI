# Bandit Level 22 -> 23

## Goal

Analyze a cron job script that creates filenames based on usernames.

## Key Concept

Understanding bash scripts and command substitution.

## Solution

Read the cron job and script:

```bash
cat /etc/cron.d/cronjob_bandit23
cat /usr/bin/cronjob_bandit23.sh
```

The script creates a filename using an MD5 hash of a string. Replicate the logic for bandit23:

```bash
echo "I am user bandit23" | md5sum | cut -d ' ' -f 1
```

This outputs the filename. Read it:

```bash
cat /tmp/<hash_output>
```

## Why This Works

The script runs as bandit23 and writes its password to a file named after an MD5 hash. By understanding the naming scheme, we can predict and read the file.
