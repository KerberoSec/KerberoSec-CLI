---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, linux, shell]
source: TryHackMe: Linux Shells
platform: tryhackme
room: Linux Shells
slug: linux-shells
path: TryHackMe/00-foundations/command-line/linux-shells.md
topic: 00-foundations
domain: [foundations, linux]
skills: [enum, logs, bash-scripting]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Linux Shells

## Summary

A *shell* is the user-facing interface that mediates between you and the operating system. In practice, most security workflows use a **command-line interface (CLI)** shell because it is fast, scriptable, and precise. This note captures:

* What “shell” means vs what “CLI” means.
* Minimal command set needed to navigate and inspect files.
* How to identify/switch shells (bash/fish/zsh).
* Bash scripting primitives: **shebang**, variables, loops, conditionals, permissions.
* A practical pattern: scan log files for a keyword using a script.

---

## Key Concepts

### Mental model

#### Shell vs CLI

* **Shell**: the *facilitator* between user and OS (broad concept). A GUI can be seen as a “shell” too.
* **CLI**: one concrete interaction mode provided by a shell (typed commands, text IO).

A useful diagram:

```text
User  →  Shell (CLI/GUI)  →  OS services (kernel + system calls)  →  hardware
```

---

### Task 2: Interacting with a shell (core commands)

#### 1) Where am I?

```bash
1  pwd
```

* Prints current working directory (CWD).

#### 2) Move around

```bash
1  cd <dir>
2  cd ..
3  cd ~
```

* `..` = parent directory, `~` = home.

#### 3) What’s here?

```bash
1  ls
2  ls -la
```

* `-l` long listing; `-a` includes dotfiles.

#### 4) Read a file

```bash
1  cat <file>
2  less <file>
```

* Prefer `less` for large files.

#### 5) Search inside a file

```bash
1  grep "PATTERN" <file>
2  grep -n "PATTERN" <file>      # show line numbers
3  grep -q "PATTERN" <file>      # quiet: only exit status
```

* `grep` is the “minimum viable search tool” for shell-based triage.

**Answers (room-level)**

* Default shell in most Linux distros: `bash`
* List directory contents: `ls`
* Search within a file: `grep`

---

### Task 3: Types of shells (bash / fish / zsh)

#### Identify the current shell

```bash
1  echo "$SHELL"
```

#### List installed shells

```bash
1  cat /etc/shells
```

#### Switch shells (temporary)

```bash
1  zsh
2  fish
```

* This switch typically lasts for the session.

#### Change default shell (persistent)

```bash
1  chsh -s /usr/bin/zsh
```

* Requires logout/login (or a new terminal) to take effect.

#### Feature summary (practical reading)

* **Bash (Bourne Again Shell)**

  * Default on most systems; strongest compatibility.
  * Tab completion + command history.
  * Script ecosystem is huge.
* **Fish (Friendly Interactive Shell)**

  * Usability-first: autosuggestions, syntax highlighting, spell correction.
  * Great for interactive use; scripts are less portable across systems.
* **Zsh (Z Shell)**

  * Power-user shell with strong completion and customization.
  * Often paired with frameworks (e.g., *oh-my-zsh*) for plugins/themes.

**Room-level Q/A**

* Syntax highlighting out-of-the-box: `fish`
* No auto spell correction: `bash`
* Show command history: `history`

---

### Task 4: Shell scripting building blocks

#### 1) Shebang

The first line tells the OS which interpreter should execute the script.

```bash
1  #!/bin/bash
```

#### 2) Make script executable

```bash
1  chmod +x script.sh
```

#### 3) Run a script in the current directory

```bash
1  ./script.sh
```

* `./` matters because the current directory is usually **not** in `PATH`.

#### 4) Variables + input (`read`)

```bash
1  #!/bin/bash
2  echo "What's your name?"
3  read name
4  echo "Welcome, $name"
```

#### 5) Loops

```bash
1  #!/bin/bash
2  for i in {1..10}; do
3    echo "$i"
4  done
```

#### 6) Conditionals

```bash
1  #!/bin/bash
2  echo "Enter your name:"
3  read name
4  if [ "$name" = "Stewart" ]; then
5    echo "Authorized"
6  else
7    echo "Denied"
8  fi
```

#### 7) Comments

```bash
1  # This is a comment. It is ignored by the interpreter.
```

**Room-level Q/A**

* Shebang in bash script: `#!/bin/bash`
* Command to grant executable permission: `chmod +x`
* Construct for iterative tasks: loops

---

### Task 5: “Locker script” pattern (variables + loop + conditional)

#### What the script demonstrates

* Collect multiple inputs using a loop.
* Validate all required fields using logical AND (`&&`).
* Print “success” only when all conditions match.

#### Readable refactor (same idea, more direct)

```bash
1  #!/bin/bash
2  read -p "Username: " username
3  read -p "Company: " company
4  read -p "PIN: " pin
5
6  if [ "$username" = "<EXPECTED_USER>" ] && \
7     [ "$company"  = "<EXPECTED_COMPANY>" ] && \
8     [ "$pin"      = "<EXPECTED_PIN>" ]; then
9    echo "Authentication Successful"
10 else
11   echo "Authentication Denied"
12 fi
```

**What to learn**

* Quotes prevent word-splitting errors.
* Keep validation logic explicit; avoid “clever” scripts in security contexts.

---

### Task 6: Practical exercise: scan logs for a keyword

#### Goal

Search for a target keyword (e.g., `thm-flag01-script`) across `*.log` files inside a directory (e.g., `/var/log`).

#### Script skeleton (robust version)

```bash
1  #!/usr/bin/env bash
2  set -euo pipefail
3
4  DIRECTORY="/var/log"
5  FLAG="thm-flag01-script"
6
7  echo "[i] Searching '$FLAG' in '$DIRECTORY' ..."
8
9  for file in "$DIRECTORY"/*.log; do
10   if grep -q "$FLAG" "$file"; then
11     echo "[+] Found in: $file"
12     echo "--- context ---"
13     grep -n "$FLAG" "$file"
14     exit 0
15   fi
16 done
17
18 echo "[-] Not found"
19 exit 1
```

#### Common pitfalls

* **Unquoted variables**: break on spaces or glob expansion.
* **Accidental spaces in patterns**: `grep "FLAG "` ≠ `grep "FLAG"`.
* **Permissions**: `/var/log` often requires `sudo`.
* **Wrong glob**: `*.log` vs `*.dolog` suggests checking the actual target file extension.

---

### Pitfalls & operational notes

* Prefer `less` over `cat` for large outputs.
* Prefer *exit codes* + `grep -q` for scripting logic.
* Avoid storing secrets in scripts; treat scripts as potentially shareable artifacts.
* If you need portability: use POSIX `sh` style where possible; fish scripting is not bash-compatible.

---

## Related Tools

* `less`, `head`, `tail -f` (file viewing)
* `find`, `xargs` (file discovery pipelines)
* `sed`, `awk` (text transforms)
* `ShellCheck` (static analysis for shell scripts)

---

## Further Reading

* Bash reference and scripting patterns
* Fish documentation (interactive features)
* Zsh manual (completion + configuration)
* `man chmod`, `man grep`, `man bash`

---

## Glossary (EN → 中文)

* Shell：壳层 / 命令解释器（用户与操作系统之间的接口）
* CLI (Command-Line Interface)：命令行界面
* GUI (Graphical User Interface)：图形用户界面
* Shebang：脚本解释器声明（`#!...`）
* Interpreter：解释器
* Variable：变量
* Loop：循环
* Conditional statement：条件语句
* Permission / execute bit：权限 / 可执行位（x）
* PATH：环境变量（可执行文件搜索路径）
* Grep：文本模式搜索工具
