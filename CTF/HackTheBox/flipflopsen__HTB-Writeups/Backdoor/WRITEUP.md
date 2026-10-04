# Backdoor

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.125 |
| **Status** | Retired |

## Overview
Backdoor is an easy Linux machine hosting a WordPress blog. An installed plugin is vulnerable to directory traversal, which is used to read files under `/proc` and fingerprint a `gdbserver` instance listening on a non-standard port. A public exploit for `gdbserver` provides remote code execution as the `user` account. Post-exploitation process enumeration then reveals a root-owned `screen` session that can be reattached to, granting full root access.

## Reconnaissance
Two nmap scans are present: an initial scan and a follow-up scan of the discovered high port.

```
22/tcp   open  ssh   OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http  Apache httpd 2.4.41 (Ubuntu)
|_http-generator: WordPress 5.8.1
|_http-title: Backdoor: Real-Life
```

`nmap/port1337` documents the later-discovered `gdbserver` listener at `10.10.11.125:1337`, found via the traversal vulnerability described below.

## Enumeration
The site runs WordPress 5.8.1 with a "Real-Life" theme and at least one installed plugin. That plugin was found to be vulnerable to a directory traversal issue, letting arbitrary files be read from the server, including files under Linux's `/proc/<pid>/` pseudo-filesystem (e.g. `/proc/808/cmdline`). Reading process command lines this way revealed a suspicious recurring process:

```
/bin/sh -c while true; do su user -c "cd /home/user; gdbserver --once 0.0.0.0:1337 /bin/true;"; done
```

This shows the box continuously (re)starting a `gdbserver` instance bound to all interfaces on port 1337, running as the `user` account: a well-known misconfiguration since `gdbserver` has no authentication and can be abused for remote code execution once discovered.

The WordPress `wp-config.php` (also readable through the same traversal bug) leaked working database credentials:
```
DB_USER: wordpressuser
DB_PASSWORD: MQYBJSaD#DxG6qbm
```
(useful for confirming database access, though the RCE path below did not require them).

## Foothold
With `gdbserver` exposed on port 1337, `gdb` was used locally to connect as a remote debugging client and abuse gdbserver's ability to execute an arbitrary uploaded binary:

```
target extended-remote 10.10.11.125:1337
remote put rev.elf rev.elf
set remote exec-file /home/user/rev.elf
run
```
(command history preserved in the session's gdb history). The uploaded `rev.elf` was a small shellcode-style ELF binary that spawns `/bin/sh` connected back to the attacker, and a PHP-based reverse shell (`rev.php`, in the style of the classic pentestmonkey `php-reverse-shell`) was also on hand as an alternate stager. Running the uploaded binary through `gdbserver` executed it as the `user` account, providing an interactive shell on the box.

## Privilege Escalation
Once on the box as `user`, process enumeration (`ps aux` / similar) revealed a `screen` session running with root privileges. Because GNU Screen sessions can be reattached to by any user with permission to the session's socket (or when running with a shared/predictable session as here), the running root `screen` session was attached to directly:

```
screen -x <session>
```

This dropped straight into an already-authenticated root shell inside the existing screen session, completing the privilege escalation without needing to exploit any additional binaries.

## Lessons Learned
- Never expose `gdbserver` (or any debug/remote-execution service) on a network-reachable interface: it has no authentication and is equivalent to remote code execution.
- Path/directory traversal in third-party CMS plugins can leak far more than web files; Linux's `/proc` filesystem exposes live process command lines and can reveal internal service misconfigurations.
- Long-running root `screen`/`tmux` sessions left detached (rather than terminated) are an easy privilege-escalation vector if their sockets are reachable by lower-privileged users.

## Tools & References
- `nmap` for initial and follow-up port scanning.
- Directory traversal in a WordPress plugin to read `/proc/<pid>/cmdline` and `wp-config.php`.
- `gdb`/`gdbserver` remote debugging abuse for RCE: see public writeups on "gdbserver unauthenticated RCE".
- `rev.elf` (small precompiled ELF shellcode stager used to trigger the reverse shell through gdbserver) and `rev.php`: kept under `files/` as they are small and directly referenced above.
- `.gdb_history` (the interactive GDB command history from the exploitation session): kept under `files/gdb_history.txt` for reference.
- `lul` (an empty, 0-byte scratch file with no content) and `nqjn83SU.rss` (a default WordPress RSS feed dump with no unique evidence): omitted as non-substantive clutter.
