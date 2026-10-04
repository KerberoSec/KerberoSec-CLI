---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, windows, cmd]
source: TryHackMe: Windows Command Line
platform: tryhackme
room: Windows Command Line
slug: windows-command-line
path: TryHackMe/00-foundations/command-line/windows-command-line.md
topic: 00-foundations
domain: [foundations, windows]
skills: [cmd-basics, triage]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Windows Command Line (cmd.exe)

> Scope: beginner-level Windows **Command Prompt** (cmd.exe) usage as covered in the TryHackMe “Windows Command Line” room.

## Summary

A command-line interface (CLI) is a text-based way to control a system. Compared with a graphical user interface (GUI), a CLI can be:

* Faster for repetitive tasks (keyboard-driven)
* Lighter on resources (useful on servers and low-spec VMs)
* Easier to automate (batch scripts)
* Easier for remote management (SSH into a host, no full desktop needed)

In this room, the focus is practical: **system info**, **network troubleshooting**, **file/disk navigation**, and **process management**.

---

## Key Concepts

### 1) Path and command discovery

* Windows resolves commands from directories in the **PATH** environment variable.
* Quick inspection: `set` (prints environment variables, including `Path=...`).
* For command help:

  * `command /?` (common pattern)
  * `help command` (also common)

### 2) Paging long output (piping)

* Some commands produce too much output for one screen.
* Use **pipes** to feed output into a pager:

```bat
systeminfo | more
```

ASCII mental model:

```
[Command A stdout] ---> (|) ---> [Command B stdin]
```

### 3) Race conditions vs CLI (a meta connection)

Even though this room is “basic Windows CLI”, the security meta-skill is the same as in more advanced topics:

* Observe the system’s behavior
* Reduce actions to repeatable, automatable steps
* Scale up from one command to many (batching / scripting)

---

### Task 1: CLI vs GUI basics

#### Default command-line interpreter

* **cmd.exe** is the classic default Command Prompt interpreter.

Practical note:

* Modern Windows also has **PowerShell** and **Windows Terminal**, but `cmd.exe` remains widely used (especially for legacy scripts).

---

### Task 2: Basic system information

#### Quick OS version

```bat
ver
```

#### Rich system inventory

```bat
systeminfo
systeminfo | more
```

Typical fields you care about:

* Host name
* OS name/version/build
* CPU and memory
* Domain/workgroup context (in real environments)

#### Screen hygiene

```bat
cls
```

---

### Task 3: Network troubleshooting

#### Local network configuration

Basic:

```bat
ipconfig
```

Detailed:

```bat
ipconfig /all
```

What to extract quickly:

* IPv4 address
* Subnet mask
* Default gateway
* DNS servers
* Physical address (MAC)

#### Connectivity test

```bat
ping example.com
```

Interpretation:

* Replies → target reachable
* 100% loss → either target unreachable, ICMP blocked, or network path issues

#### Path tracing

```bat
tracert example.com
```

Use it when:

* Ping fails but you want to see where packets stop
* Latency spikes and you want to spot the “bad hop”

#### DNS lookup

```bat
nslookup example.com
nslookup example.com 1.1.1.1
```

Use it when:

* A domain “doesn’t work” and you suspect DNS
* You need the IP behind a hostname

#### Connection visibility

Minimal (established only):

```bat
netstat
```

Common “investigation mode” pattern:

```bat
netstat -abon
```

* `-a` all connections + listening ports
* `-b` show binary (program) responsible
* `-o` show PID
* `-n` numerical addresses/ports

Security angle:

* This is a quick way to map **services → ports → processes**.

---

### Task 4: File and disk management

#### Where am I?

```bat
cd
```

#### List directory contents

```bat
dir
```

Useful flags:

```bat
dir /a

dir /s
```

#### Tree view

```bat
tree
```

#### Navigation

```bat
cd Documents
cd ..
cd C:\Users\USER\Desktop
```

#### Create and remove directories

```bat
mkdir hello
rmdir hello
```

#### View text files

```bat
type flag.txt

type bigfile.txt | more
```

#### Copy / move / delete

```bat
copy test.txt test2.txt
move test2.txt ..

rem delete a file
 del test2.txt
rem or
 erase test2.txt
```

#### Wildcards

```bat
copy *.md C:\Markdown
```

Pitfall:

* Wildcards are powerful. A careless `del *` is a fast way to ruin your day.

---

### Task 5: Task and process management

#### List processes

```bat
tasklist
```

#### Filter processes (critical skill)

```bat
tasklist /FI "imagename eq sshd.exe"
```

Common filters you’ll actually use:

* `imagename eq <name>.exe`
* `pid eq <number>`

#### Kill by PID

```bat
taskkill /PID 1516
```

Operational note:

* Prefer killing the exact PID you intend.
* In real systems, killing the wrong process can drop sessions, corrupt state, or break services.

---

### Task 6: Useful extras (beyond the room)

These are common “admin hygiene” commands:

```bat
chkdsk

driverquery

sfc /scannow
```

#### Shutdown / restart

```bat
shutdown /s
shutdown /r
shutdown /a
```

---

### Quick command map

| Goal                 | Command(s)                    | Why you’d use it                  |
| -------------------- | ----------------------------- | --------------------------------- |
| OS version           | `ver`                         | Fast identification               |
| System inventory     | `systeminfo`                  | Full host overview                |
| Network config       | `ipconfig`, `ipconfig /all`   | IP/DNS/GW/MAC                     |
| Reachability         | `ping`                        | Is the host reachable?            |
| Route debugging      | `tracert`                     | Where does it fail?               |
| DNS check            | `nslookup`                    | Name ↔ IP diagnosis               |
| Port/process mapping | `netstat -abon`               | Listening ports + owning programs |
| Browse files         | `cd`, `dir`, `tree`           | Navigate and inspect              |
| Read text            | `type`, `more`                | View file contents                |
| Copy/move/delete     | `copy`, `move`, `del`/`erase` | Basic file ops                    |
| Process list/kill    | `tasklist`, `taskkill`        | Process control                   |
| Restart/abort        | `shutdown /r`, `shutdown /a`  | Maintenance workflows             |

---

### Pitfalls and mental checklists

#### When a command “does nothing”

* Are you in the right directory? (`cd`, `dir`)
* Is the tool in PATH? (`set`, or run with full path)
* Do you need admin rights? (common with networking/process inspection)

#### When networking tests “fail”

* Ping can be blocked by firewall rules; failure ≠ always “offline”.

* Prefer a layered approach:

```
ipconfig -> ping gateway -> ping target -> tracert -> nslookup -> netstat
```

---

## Takeaways

* CLI skills are not about memorizing commands; they are about building a **repeatable workflow**.
* The highest leverage tools in this room are:
  * Output control: `| more`, `/ ?`, `help`
  * Network triage: `ipconfig /all`, `ping`, `tracert`, `nslookup`, `netstat -abon`
  * Process triage: `tasklist /FI ...`, `taskkill /PID ...`

---

## Chinese glossary (small)

* Command Prompt：命令提示符（cmd.exe）
* CLI (Command-Line Interface)：命令行界面
* GUI (Graphical User Interface)：图形界面
* PATH：可执行文件搜索路径（环境变量）
* Pipe：管道（把一个命令输出送到另一个命令）
* PID (Process ID)：进程号
* Gateway：默认网关
* DNS：域名系统
* MAC address：物理地址

---

## Further reading (official docs)

```text
Microsoft Learn: Windows Commands reference:
- ping
- shutdown
( systeminfo, ipconfig, netstat, tasklist, taskkill, dir, cd, mkdir, rmdir, copy, move, type, more)

```
