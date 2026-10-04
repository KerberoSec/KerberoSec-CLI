---
type: resource-note
status: done
created: 2025-12-04
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, linux, cli]
source: TryHackMe: Advent of Cyber 2025 Day 1
platform: tryhackme
room: Advent of Cyber 2025 Day 01: Linux CLI: Shells & Bells
slug: aoc-2025-day-01-linux-cli-shells-and-bells
path: TryHackMe/90-events/thm-aoc-2025/Day 01: Linux CLI: Shells Bells.md
topic: 90-events
domain: [linux]
skills: [shell-basics, logs, bash-scripting]
artifacts: [concept-notes, lab-notes]
sanitized: true
description: Quick notes on basic Linux CLI usage from the Advent of Cyber room.
---

# Advent of Cyber 2025 Day 01: Linux CLI: Shells & Bells

## Summary

* Most servers expose **no GUI**; you interact via **terminal / shell (命令行终端)**.
* CLI is enough to:

  * Navigate files
  * Inspect logs
  * Run tools & scripts
  * Administer the system (especially as `root`).
* Getting comfortable with CLI is mandatory for security / ops work.

```text
GUI   → nice for humans
CLI   → precise, scriptable, works over SSH, easier to automate
```

---

## Key Concepts

### 2. Basic CLI workflow

#### 2.1 First commands

| Command              | Meaning                         | Notes                               |
| -------------------- | ------------------------------- | ----------------------------------- |
| `echo "Hello World"` | Print text to terminal          | Quick sanity check that shell works |
| `ls`                 | List files in current directory | Like “show me this folder”          |
| `cat README.txt`     | Show file contents              | For small/medium text files         |
| `pwd`                | Print working directory         | Where am I? (当前路径)                  |

Concept: **current working directory (CWD)**: most commands operate relative to this.

#### 2.2 Navigating with `cd`

* `cd Guides` → move into a subdirectory `Guides`.
* `cd /var/log` → go to an **absolute path**.
* `cd ..` → go **up** one level.
* `cd` (alone) → go back to your **home directory**.

```text
/home/mcskidy           # home
/home/mcskidy/Guides    # after: cd Guides
```

---

### 3. Hidden files & `ls -la`

Linux hides files that start with a dot `.` (dotfiles).

* Examples: `.guide.txt`, `.bash_history`, `.config/`.
* Used for:

  * System / app configuration
  * Attackers hiding tools or data
  * In the room: McSkidy hiding a **guide** from attackers

Key command:

* `ls -la`

  * `-l` → long listing (permissions, owner, size, timestamps)
  * `-a` → show **all** files including hidden ones

Then read:

* `cat .guide.txt` → note the leading dot.

---

### 4. Logs & `grep`

Security-relevant logs usually live under `/var/log/`.

* Example auth log: `/var/log/auth.log` (authentication events).
* Logs can be huge → don’t scroll with `cat` → **filter** with `grep`.

#### 4.1 `grep` basics

`grep "Failed password" auth.log`

* Searches for the phrase **Failed password** inside `auth.log`.
* Typical use-cases:

  * Failed SSH logins
  * Suspicious usernames or IPs

Concept: **string matching**: only lines containing the given text are printed.

#### 4.2 Pipeline pattern

For big log analysis you often chain tools:

```text
cat auth.log \
  | grep "Failed password" \
  | grep "socmas" \
  > failed_socmas.txt
```

* `|` (pipe) passes output from one command to the next.
* `>` redirects final output into a file instead of the screen.

ASCII structure:

```text
[auth.log] --cat--> --grep--> --grep--> --redirect--> [failed_socmas.txt]
```

---

### 5. Finding files with `find`

`find` walks directory trees and applies filters.

Example from the room:

```bash
find /home/socmas -name '*egg*'
```

* Start at `/home/socmas`.
* `-name '*egg*'` → match any file/dir whose name contains `egg`.
* Returns full paths, e.g. `/home/socmas/2025/eggstrike.sh`.

Notes:

* `*` is a **wildcard (通配符)**: “any characters here”.
* `find` has many other filters: `-type f`, `-mtime`, `-size`, etc.

---

### 6. Shell scripts (`.sh`)

Files ending with `.sh` typically contain **Bash** or POSIX shell commands.

Room example: `eggstrike.sh`:

```bash
# Eggstrike v0.3
# © 2025, Sir Carrotbane, HopSec
cat wishlist.txt | sort | uniq > /tmp/dump.txt
rm wishlist.txt && echo "Christmas is fading..."
mv eastmas.txt wishlist.txt && echo "EASTMAS is invading!"
```

#### 6.1 Interpreting the script

1. **Comments**: lines starting with `#` → ignored by the shell.
2. `cat wishlist.txt | sort | uniq > /tmp/dump.txt`

   * Print `wishlist.txt` → sort lines → remove duplicates → save **unique wishes** to `/tmp/dump.txt`.
3. `rm wishlist.txt && echo "Christmas is fading..."`

   * Remove the original wishlist.
   * `&&` means: run `echo` **only if** `rm` succeeded.
4. `mv eastmas.txt wishlist.txt && echo "EASTMAS is invading!"`

   * Replace original wishlist with `eastmas.txt`.

Security angle: this script **exfiltrates** data (copies wishes to `/tmp/dump.txt`) and **tamper**s with business data (replaces wishlist).

#### 6.2 Key shell operators cheat sheet

| Symbol | Name            | Effect                                                   |                                                |
| ------ | --------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `      | `               | pipe (管道)                                                | send output of left command into right command |
| `>`    | redirect        | overwrite file with output                               |                                                |
| `>>`   | append redirect | append output to file                                    |                                                |
| `&&`   | AND operator    | run second command only if first succeeded (exit code 0) |                                                |

---

### 7. System information commands

A few generic utilities you saw or that naturally follow:

| Command   | Purpose                                             |
| --------- | --------------------------------------------------- |
| `uptime`  | How long the system has been running; load averages |
| `ip addr` | Show network interfaces and IP addresses            |
| `ps aux`  | List all running processes                          |
| `whoami`  | Print current user name                             |

These are read‑only by default and safe to use as a normal user.

---

### 8. Users, root, and `/etc/shadow`

#### 8.1 Normal users vs root

* **Normal user** (e.g. `mcskidy`): limited permissions, cannot touch system-critical files.
* **root user**: superuser (超级用户) with full control.

Check current user:

```bash
whoami
```

Switch to root (if you have sudo rights):

```bash
sudo su
# ... later
exit   # go back to previous user
```

#### 8.2 `/etc/shadow`

* Contains **hashed passwords** and metadata for local accounts.
* Only root can read it; normal user gets `Permission denied`.

Example:

```bash
cat /etc/shadow
# cat: /etc/shadow: Permission denied  (for normal user)
```

Security intuition:

* If an attacker becomes root, they can steal hashes from `/etc/shadow` and attempt offline cracking.

---

### 9. Bash history

Bash records commands to a hidden file per user:

* `~/.bash_history` for regular users
* `/root/.bash_history` for root

You can inspect history via:

```bash
history            # numbered list of previous commands
cat ~/.bash_history
```

In the room, root’s history showed suspicious `curl` commands sending data to HopSec domains: classic **post-exploitation evidence**.

## Takeaways

* History is useful for **forensics** and for your own learning.

* Attackers sometimes clear or edit history to hide tracks (e.g. `history -c`).

---

## 10. Mini glossary (EN → zh-CN)

* **Shell / terminal**: 交互式命令行环境
* **CLI (Command-Line Interface)**: 命令行界面
* **Log file**: 日志文件
* **Hidden file / dotfile**: 隐藏文件（以 `.` 开头）
* **Pipe**: 管道，将一个命令的输出接到下一个命令
* **Redirect**: 重定向输出到文件
* **Root user**: 根用户，系统最高权限
* **Shell script**: shell 脚本，可批量自动执行命令
* **Forensics**: 取证分析

---

## 11. Practice checklist

When you land on a new Linux box, practice the following muscle‑memory sequence:

1. `whoami` / `id`: Who am I? Which groups?

2. `pwd`: Where am I?
3. `ls` / `ls -la`: What’s here (including hidden)?

4. `cat README*` / `cat *.txt`: Any notes?

5. `cd /var/log && ls`: What logs exist?

6. `grep "Failed password" auth.log`: Any obvious brute‑force?

7. `find ~ -maxdepth 3 -type f -name '*sh'`: Any scripts around?

8. `history | tail`: What did previous user do?

Repeat until these become reflexes; they are the foundation for later privilege escalation & incident response work.
