---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, linux, ssh]
source: TryHackMe: Linux Fundamentals Part 2
platform: tryhackme
room: Linux Fundamentals Part 2
slug: linux-fundamentals-part-2
path: TryHackMe/20-linux/linux-fundamentals/partII.md
topic: 20-linux
domain: [linux]
skills: [ssh, files-perms, services]
artifacts: [concept-notes, lab-notes]
sanitized: true
---

# Linux Fundamentals Part 2

Room: **TryHackMe: Linux Fundamentals Part 2**
Focus: SSH basics, command flags, filesystem interaction, permissions, and common Linux directories.

---

## Summary

### 1.1 What is SSH?

* **SSH (Secure Shell)** = encrypted remote terminal protocol.
* Provides **confidentiality + integrity + authentication** between:

  * your local machine (client)
  * a remote Linux host (server)
* All keystrokes and command outputs travel through an **encrypted tunnel**.

```text
[My Computer] ==( encrypted SSH over Internet )==> [Linux Server]
```

Typical use cases:

* Administering remote servers (update packages, check logs, edit configs).
* Connecting to CTF / lab machines (e.g., TryHackMe boxes).

### 1.2 Basic SSH syntax

```bash
ssh USERNAME@TARGET_IP
# example from the room
ssh tryhackme@10.10.x.x
```

Process:

1. Client connects to `TARGET_IP` on TCP **port 22** by default.
2. You see a **host key** prompt the first time:

   * Type `yes` to trust and store the server’s key in `~/.ssh/known_hosts`.
3. Enter the **password** for `USERNAME` when prompted.
4. You get a shell on the remote machine.

### 1.3 Using TryHackMe AttackBox vs. your own terminal

* **AttackBox** is a pre‑configured Kali‑like VM running in the browser.
* You open a local terminal *inside* the AttackBox and SSH from there.
* In real life you would SSH from:

  * your own Linux / macOS terminal, or
  * WSL / PuTTY / MobaXterm on Windows.

Key idea: regardless of where the client runs, the **SSH command syntax is the same**.

---

## Key Concepts

### 2. Command Flags & Switches

#### 2.1 Concept

* Most Linux commands support **options** (also called *flags* / *switches*).
* General pattern:

```bash
command -s --long-option ARGUMENTS
```

* Single dash `-x` → short flag.
* Double dash `--long-option` → long, more descriptive form.

Without flags, a command uses its **default behaviour**.

#### 2.2 Example: `ls`

```bash
ls          # list non-hidden entries in current directory
ls -a       # include hidden entries (starting with .)
ls -l       # long listing: permissions, owner, size, time
ls -la      # combine -l and -a
```

Hidden files:

* Names beginning with `.` (dot), e.g. `.bashrc`, `.hidden_folder/`.
* Often contain **config** or system data; not shown by plain `ls`.

#### 2.3 Built‑in help

Most commands provide quick help:

```bash
<command> --help   # common, more verbose
<command> -h       # sometimes available, but not guaranteed
```

Example:

```bash
ls --help
```

Shows available flags, a brief description, and sometimes usage examples.

#### 2.4 `man`: manual pages

`man` gives you the full manual entry for a command or library.

```bash
man ls
man ssh
```

Navigation inside `man`:

* **Arrow keys / PageUp / PageDown / Space** → move.
* **/**`pattern` → search forward.
* **n** → next match, **N** → previous.
* **q** → quit.

Use `man` when:

* You meet a new command.
* You need details of obscure flags (e.g. `ls -lh`, `find -maxdepth`, etc.).

---

### 3. Filesystem Interaction (continued)

Key idea: Linux filesystem = a **tree** of directories starting at `/` (root).

#### 3.1 Creating files and directories

##### `touch`: create or update a file

```bash
touch newnote       # create empty file "newnote"
```

* If the file does not exist → create **empty** file.
* If it exists → update its **timestamp**.
* To put content into it, use something like:

```bash
echo "hello" > newnote
nano newnote
```

##### `mkdir`: create a directory

```bash
mkdir mydir              # make a directory in current path
mkdir -p a/b/c           # create nested directories if needed
```

#### 3.2 Deleting files and directories: `rm`

```bash
rm file.txt              # delete a file
rm -r dir_name           # delete directory *recursively*
rm -rf dir_name          # recursive + force (no prompts)
```

> ⚠️ **Danger**: `rm -rf` is irreversible. One typo can destroy large parts of the system. Double‑check paths.

#### 3.3 Copying: `cp`

```bash
cp old new               # copy file
cp file.txt backup/file.txt
cp -r dir1 dir2          # copy directory and its contents
```

* First argument: **source**.
* Second argument: **destination** (file name or directory).

#### 3.4 Moving / renaming: `mv`

```bash
mv file.txt /tmp/        # move file into /tmp
mv oldname newname       # rename in place
mv dir1 dir2/            # move directory under dir2/
```

`mv` does **not** duplicate content; it changes the directory entry. Good for:

* reorganising folders
* renaming files or directories

#### 3.5 Determining type: `file`

Extensions (.txt, .png, .sh) are only hints; Linux doesn’t require them.

```bash
file unknown1
# example output: unknown1: ASCII text
```

`file` inspects the file’s **magic bytes** and prints a description:

* ASCII text
* PNG image
* ELF 64-bit LSB executable, etc.

Useful in CTFs and forensic work when files have no or fake extensions.

---

### 4. Permissions 101

#### 4.1 Reading `ls -l`

Example line from `ls -l`:

```text
-rw-r----- 1 user2 group2  512 Oct 10 12:00 important
```

Breakdown of the 10‑character permission string:

```text
-rw-r-----
^          = type ("-" file, "d" directory, "l" symlink, etc.)
 rw-       = owner permissions
 r--       = group permissions
 ---       = others (world) permissions
```

* **r** = read
* **w** = write (modify / delete)
* **x** = execute (run file; or *enter* directory)
* **-** = permission absent

So for the above:

* Owner (`user2`): `rw-` → can read + write, **not** execute.
* Group (`group2`): `r--` → read only.
* Others: `---` → no permissions.

#### 4.2 Permissions on directories vs. files

* On **files**:

  * `r` → can read content.
  * `w` → can modify/overwrite/delete the file.
  * `x` → can execute the file as a program/script.
* On **directories**:

  * `r` → can list directory entries.
  * `w` → can create or delete entries in that directory.
  * `x` → can `cd` into it and access items by name.

#### 4.3 Users and groups

* Every file has:

  * an **owner user** (e.g. `user2`)
  * an **owner group** (e.g. `user2`, `www-data`, `developers`)
* When a new user is created, a **same‑named primary group** is usually created as well.
* Access decision order:

  1. If you are the **owner**, use owner bits.
  2. Else, if you are in the **group**, use group bits.
  3. Else, use **others** bits.

#### 4.4 Switching user: `su`

`su` = **substitute user** (often remembered as “switch user”).

```bash
su user2           # switch to user2 (ask for user2's password)
su -l user2       # login shell for user2, with its environment & home
```

* Without `-l`, you keep your current working directory and some environment.
* With `-l` (or `-`), you simulate a real login:

  * working directory becomes user’s home (e.g. `/home/user2`)
  * environment variables, PATH, shell init scripts are loaded.

Root vs non‑root:

* If you are **root** (or using `sudo su`), you can `su` into other users **without** their password.
* Ordinary users must know the **target user’s password**.

> In the room, you had to switch to `user2` with
> `su user2` and use password `user2` to read `important`.

---

### 5. Common Directories on a Linux System

#### 5.1 `/etc`

* Pronounced like “etsy”.
* Contains system‑wide **configuration files**.
* Important examples:

  * `/etc/passwd`: list of users and basic info (historically passwords, now only hashes placeholders).
  * `/etc/shadow`: password hashes; **root‑only** readable.
  * `/etc/sudoers`: who can run commands via `sudo`.
* As an attacker / defender, this tree is crucial for understanding system config.

#### 5.2 `/var`

* Short for **variable data**.
* Contains data that changes often:

  * `/var/log/`: log files for services (SSH, web server, system, etc.).
  * `/var/spool/`: mail, print jobs, etc.
  * Sometimes databases, caches, queues.

#### 5.3 `/root`

* **Home directory of the root user**.
* Not the same as `/` and not under `/home`.
* Root’s personal files, scripts, and config live here.

#### 5.4 `/tmp`

* Short for **temporary**.
* World‑writable (any user can create files) but cleared on reboot.
* Great for:

  * temporary downloads
  * enumeration scripts in a CTF
* Bad for:

  * long‑term notes or data you don’t want to lose; it will disappear.

---

### 6. Mini Cheat‑Sheet

```bash
# SSH
ssh user@ip                # connect to remote host

# Help & manuals
<cmd> --help               # quick help
man <cmd>                  # full manual page

# Files & directories
touch file                 # create empty file
mkdir dir                  # create directory
rm file                    # remove file
rm -r dir                  # remove directory recursively
cp src dst                 # copy file
cp -r src_dir dst_dir      # copy directory
mv old new                 # move or rename
file something             # detect file type

# Permissions / users
ls -l                      # long listing with permissions
su user2                   # switch user (needs user2 password)
su -l user2                # login shell as user2
```

---

### 7. Chinese Glossary / 中文术语小表

* **SSH (Secure Shell)**: 安全外壳协议，用于加密远程登录。
* **flag / switch**: 命令行开关或参数，用 `-` / `--` 引出。
* **man page**: manual 手册页，在本机查看命令文档。
* **permission (r/w/x)**: 权限：读 (read)、写 (write)、执行 (execute)。
* **owner / group / others**: 文件拥有者 / 所属用户组 / 其他所有用户。
* **root user**: 超级用户，拥有系统的最终控制权。
* **/etc**: 全局配置目录（例如 `/etc/passwd`, `/etc/shadow`, `/etc/sudoers`）。
* **/var/log**: 日志目录，记录系统与服务行为。
* **/tmp**: 临时文件目录，重启后被清空，默认所有用户可写。

---

### 8. What to Practise After This Room

1. Spin up any Linux VM and:

   * create / copy / move / delete some test files and directories;
   * play with `ls` flags, `file`, and `man`.
2. Create a new user, switch to it with `su`, and compare:

   * home directory
   * permission differences.
3. Explore `/etc`, `/var/log`, `/root`, `/tmp`:

   * just use `ls`, `cat` and `less` (read‑only) to build intuition.

These basics are the foundation for later topics: shell scripting, privilege escalation, and service hardening.
