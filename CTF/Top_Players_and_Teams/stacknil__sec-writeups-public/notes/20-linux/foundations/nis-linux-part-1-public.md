---
status: done
created: 2026-04-28
updated: 2026-04-28
date: 2026-04-28
platform: tryhackme
room: NIS: Linux Part I
slug: nis-linux-part-1-public
path: notes/20-linux/foundations/nis-linux-part-1-public.md
topic: 20-linux
domain: [linux, foundations]
skills: [shell-basics, file-io, files-perms, http, extractors]
artifacts: [concept-notes, cookbook, room-notes]
type: resource-note
---

# NIS: Linux Part I

## Summary

* This room is a **Linux command-line reinforcement room**. It revisits beginner commands that become high-value in labs, shells, reverse shells, and basic troubleshooting.
* The practical theme is not memorise every flag, but **know which tool class solves which problem**: listing, reading, searching, filtering, permissions, hex inspection, encoding, and fetching remote content.
* A small command set can already cover a surprising amount of ground: `ls`, `cat`/`head`/`tail`/`tac`, `find`, `grep`, `chmod`, `echo`, `xargs`, `xxd`/`hexeditor`, `curl`, `wget`, `tar`, `gzip`, `7z`, and `binwalk`.
* Good Linux fluency comes from understanding **composition**: pipes, redirection, wildcard expansion, permission checks, and chaining simple tools together.
* For public notes, the most useful output is a **task-oriented cheat sheet**, not room-specific answers that depend on a live VM state.

```mermaid
flowchart LR
    A[List files] --> B[Read content]
    B --> C[Search / Filter]
    C --> D[Change permissions]
    D --> E[Inspect binary / encoded data]
    E --> F[Fetch remote content]
```

---

## 1. Core Mental Model

Linux CLI work becomes easier when you stop thinking in terms of one magic command and instead think in terms of **tool roles**.

| Tool role | Representative commands | What they solve |
| --- | --- | --- |
| Listing | `ls` | What files are here? |
| Reading | `cat`, `head`, `tail`, `tac` | What is inside this file? |
| Searching | `find`, `grep` | Where is the file / text I need? |
| Permissions | `chmod`, `sudo -l` | What can be executed and by whom? |
| Byte-level inspection | `xxd`, `hexeditor` | What does the file look like in hex / binary view? |
| Encoding / decoding | `base64` | Is content encoded or staged through pipes? |
| Fetching | `curl`, `wget` | Can I retrieve or inspect remote content? |
| Archiving / compression | `tar`, `gzip`, `7z` | How do I package, unpack, or decompress files? |
| Embedded-file analysis | `binwalk` | Is there another file system, archive, or payload hidden inside this file? |
| Batch argument passing | `xargs` | How do I apply one command to many inputs? |

That mindset is more reusable than memorising isolated syntax.

---

## 2. Command Families

### 2.1 `ls` - listing and basic visibility

Use `ls` when you want to understand directory contents and file metadata.

Common patterns:

```bash
ls
ls -a
ls -A
ls -l
ls -lh
ls --recursive
```

High-value concepts:

* `-a` includes hidden files
* `-A` includes hidden files but excludes `.` and `..`
* `-l` exposes metadata such as permissions and ownership
* `-h` makes size output human-readable when combined with long listing
* recursive listing is useful, but can become noisy quickly

### 2.2 `cat`, `tac`, `head`, `tail` - reading file content flexibly

`cat` is the obvious file-reading tool, but it is not the only one and is not always present in constrained shells.

Useful alternatives:

```bash
cat file.txt
head file.txt
head -n 20 file.txt
tail file.txt
tail -n 20 file.txt
tac file.txt
```

High-value concepts:

* `head` is useful for large files, logs, configs, and banners
* `tail` is useful for recent lines and monitoring output
* `tac` is a practical fallback when `cat` is restricted
* in real shells, the best file-reading command is often the one you still have available

### 2.3 `xxd` and `base64` - reading beyond plain text

Sometimes content is not clean ASCII or is encoded before delivery.

Examples:

```bash
xxd file.bin
base64 file.txt
base64 encoded.txt --decode
```

Use cases:

* identify binary structure
* inspect file signatures / magic numbers
* decode base64-wrapped payloads or staged text
* bridge plain-text shell constraints when data is encoded in transit

### 2.4 `find` - locating files and permission edge cases

`find` is one of the highest-value discovery commands in Linux.

Examples:

```bash
find . -name "*.txt"
find / -type f -name "*.bak"
find / -type f \( -perm -4000 -o -perm -2000 \) -exec ls -l {} \;
```

High-value concepts:

* `-type f` limits search to files
* wildcard patterns make it useful for extension hunting
* permission filters are useful in enumeration, especially for SUID / SGID discovery
* `-exec` lets you act on each result immediately

### 2.5 `grep` - text filtering and quick pattern search

`grep` is the quickest route from too much text to just the lines I care about.

Examples:

```bash
grep "if" script.py
grep "hack" file*
grep -n "password" config.txt
grep -r "token" .
```

High-value concepts:

* `-n` adds line numbers
* `-r` recurses through directories
* wildcard matching across similarly named files is a fast comparison trick
* grep is usually more valuable as a *filter* than as a standalone command

### 2.6 `sudo -l` - privilege visibility

`sudo` is not just for running commands as root. In enumeration, `sudo -l` is the key question:

```bash
sudo -l
```

What it tells you:

* whether the current user can run privileged commands
* whether a password is required
* which binaries are explicitly allowed
* whether environment preservation or unusual sudoers entries are present

This is one of the first commands worth checking in basic privilege enumeration.

### 2.7 `chmod` - permission control

`chmod` changes mode bits on files and directories.

Examples:

```bash
chmod 777 file
chmod 600 id_rsa
chmod u=rwx,g=rx,o=rw myfile
```

High-value concepts:

* symbolic mode is more readable for learning
* numeric mode is faster once internalised
* `600` on private key material is a very common operational requirement
* world-writable permissions (`777`) are usually a red flag outside toy examples

### 2.8 `echo` - output, redirection, and shell composition

`echo` is simple, but it becomes powerful when paired with redirection or substitution.

Examples:

```bash
echo "Hello"
echo "text" > file.txt
echo "$(whoami)"
```

High-value concepts:

* `>` overwrites a file
* `>>` appends to a file
* command substitution lets you surface output inline
* in shell work, `echo` is often the quickest way to create test data or verify expansion behaviour

### 2.9 `xargs` - turn input into arguments

`xargs` bridges pipelines and command execution.

Example:

```bash
find /tmp -name test -type f -print | xargs /bin/rm -f
```

High-value concepts:

* it reads from standard input and turns items into arguments
* it is powerful but fragile with whitespace-heavy filenames unless paired with null-safe patterns like `find -print0` and `xargs -0`
* it is useful when you need to apply the same action to many results quickly

### 2.10 `hexeditor` / `xxd` - binary inspection workflow

Hex tools matter when plain text tools are no longer enough.

Use them for:

* altered file signatures
* hidden data in non-text files
* binary patching in lab contexts
* troubleshooting malformed or tampered files

### 2.11 `curl` and `wget` - remote content retrieval

`curl` is usually best for **interactive inspection and protocol-aware requests**. `wget` is usually best for **straightforward downloads**.

Examples:

```bash
curl http://example.com
curl -I -s https://example.com
curl -o page.html https://example.com/login
wget http://example.com/file.zip
wget -b http://example.com/file.zip
```

High-value concepts:

* `curl` is excellent for headers, APIs, debugging, and ad hoc requests
* `wget` is excellent for unattended downloading
* `curl -I -s` is a quick way to inspect only HTTP headers
* `wget -O` writes to a specific filename, while plain `wget URL` usually keeps the remote name

### 2.12 `tar` - archive packaging and extraction

`tar` groups files into an archive and can later list or extract them. On Linux, it is one of the most common archive-handling tools. GNU tar documents `-x/--extract` for extraction and `-f/--file` for specifying the archive name. ([gnu.org](https://www.gnu.org/software/tar/manual/html_section/extract.html))

Examples:

```bash
tar -xf archive.tar
tar -tf archive.tar
tar -cf archive.tar dir/
```

High-value concepts:

* `-x` extracts
* `-f` tells tar the archive filename follows
* `-t` lists archive contents without extracting
* `tar` is an archive format/tool, not compression by itself; compression is often layered on top with gzip or other methods

### 2.13 `gzip` - single-file compression and decompression

GNU gzip is designed for file compression and decompression, and `-d/--decompress` is the normal decompression path. ([gnu.org](https://www.gnu.org/s/gzip/manual/html_node/index.html))

Examples:

```bash
gzip file.txt
gzip -d file.txt.gz
gzip -k file.txt
gzip -l file.txt.gz
```

High-value concepts:

* `.gz` usually indicates gzip-compressed content
* `gzip -d` decompresses
* gzip commonly works on single files; tar+gzip (`.tar.gz`) is the classic Linux combination when archiving directories
* `-k` keeps the original file, which is useful during analysis or labs

### 2.14 `7z` - broad archive support

7-Zip's command-line `x` command extracts files with full paths, and the official docs explicitly show `7z x archive.zip` as the basic extraction pattern. The 7-Zip project also documents broad format support and notes that modern Linux users may encounter either native 7-Zip for Linux or older `p7zip` packaging. ([7-zip.opensource.jp](https://7-zip.opensource.jp/chm/cmdline/commands/extract_full.htm))

Examples:

```bash
7z x file.zip
7z l file.zip
7z a archive.7z dir/
```

High-value concepts:

* `x` extracts with directory structure preserved
* `l` lists archive contents
* `a` adds files to an archive
* `7z` is especially useful when you hit less common formats or when `tar`/`gzip` alone are not enough

### 2.15 `binwalk` - embedded content and firmware-style analysis

Binwalk is designed to identify, and optionally extract, files and data embedded inside other files; its main reputation comes from firmware analysis, but the same idea is useful in CTFs and stego-adjacent file inspection. ([github.com](https://github.com/ReFirmLabs/binwalk/blob/master/README.md))

Examples:

```bash
binwalk firmware.bin
binwalk -e firmware.bin
binwalk -Me firmware.bin
```

High-value concepts:

* plain `binwalk file` scans for known signatures
* `-e` extracts recognized embedded content
* recursive extraction is the usual next step when nested archives or file systems are present
* `binwalk` is often the fastest way to answer is there another file hidden inside this one

---

## 3. Composition Patterns That Matter

### 3.1 Pipe data between tools

```bash
echo "Hello" | base64
cat access.log | grep "error"
find . -name "*.txt" | xargs grep "password"
```

### 3.2 Redirect output into files

```bash
echo "notes" > notes.txt
echo "more" >> notes.txt
curl -o index.html https://example.com
```

### 3.3 Move between text and bytes

```bash
base64 payload.txt --decode
xxd file.bin
```

The room is really teaching one larger idea: **small tools become much stronger when chained**.

---

## 4. Public Task Notes

This room includes several environment-dependent questions, such as counting files in a specific home directory. Those answers are not stable outside the live room instance, so they are intentionally not recorded in this public note.

The stable, reusable lessons are the command patterns themselves.

---

## 5. Pattern Cards

### Pattern Card 1: File Discovery First

**Problem**
You do not know where the file is.

**Best first tool**
`find`

**Lesson**
Do not guess paths when you can enumerate them.

### Pattern Card 2: Read Just Enough

**Problem**
The file is large or noisy.

**Best first tools**
`head`, `tail`, sometimes `grep`

**Lesson**
You rarely need the whole file before you know what matters.

### Pattern Card 3: Text Is Not Always Plain Text

**Problem**
The content looks broken, encoded, or binary.

**Best first tools**
`base64`, `xxd`, `hexeditor`

**Lesson**
Switch representations before assuming the file is useless.

### Pattern Card 4: Permissions Explain Behaviour

**Problem**
A file cannot be used or a key is rejected.

**Best first tools**
`ls -l`, `chmod`, `sudo -l`

**Lesson**
Many Linux problems are permission problems before they are logic problems.

### Pattern Card 5: One Result, Many Actions

**Problem**
You need to run the same command on many items.

**Best first tools**
`find` + `xargs`

**Lesson**
Pipelines are how shell work scales.

---

## 6. Practical Security / Lab Takeaways

* `find` plus permission filters is useful for identifying SUID / SGID binaries during enumeration.
* `sudo -l` is one of the highest-value early checks in Linux privilege investigation.
* `chmod 600` on private keys is not trivia; it matters operationally.
* `grep`, `head`, and `tail` are often faster and safer than opening large files in an editor.
* `curl -I -s` is a compact way to inspect remote headers without downloading full content.
* `tar` plus `gzip` is the default mental model for many Linux archives: archive first, compress second.
* `7z` is the broad-compatibility fallback when archive formats vary across labs and systems.
* `binwalk` is one of the fastest first-pass tools for firmware images, packed blobs, and files with hidden embedded data.
* Binary-awareness (`xxd`, `hexeditor`) matters in CTFs, malware triage, and file-format debugging.

---

## 7. Public Cheat Sheet

```bash
# list files
ls -la
ls -lh
ls --recursive

# read content
cat file.txt
head -n 20 file.txt
tail -n 20 file.txt
tac file.txt

# search
find / -type f -name "*.bak"
grep -rn "password" .

# permissions
sudo -l
chmod 600 id_rsa

# bytes / encoding
xxd file.bin
base64 secret.txt --decode

# fetch
curl -I -s https://example.com
wget http://example.com/file.zip

# archives / compression
tar -xf archive.tar
gzip -d file.gz
7z x file.zip

# embedded content discovery
binwalk firmware.bin
binwalk -e firmware.bin
```

---

## 8. Takeaways

* Linux command fluency is mostly about **recognising the right tool family quickly**.
* Beginner rooms become much more valuable when rewritten as **operator workflows**, not isolated Q&A.
* The most transferable lesson here is composition: **list -> locate -> read -> filter -> inspect -> fetch**.
* You do not need dozens of commands to be effective. You need a small reliable set and a good sense of when to chain them.

---

## 9. CN-EN Glossary

| English | 中文 |
| --- | --- |
| Coreutils | GNU 基础命令工具集 |
| Hidden file | 隐藏文件 |
| Long listing | 长列表格式 |
| Recursive | 递归 |
| Human-readable size | 人类可读大小 |
| SUID / SGID | SUID / SGID 特殊权限位 |
| Redirection | 重定向 |
| Pipe | 管道 |
| Standard input / output | 标准输入 / 标准输出 |
| Wildcard | 通配符 |
| Hex dump | 十六进制转储 |
| File signature / magic number | 文件签名 / 魔数 |
| Enumeration | 枚举 |
| Command substitution | 命令替换 |
| Archive | 归档文件 |
| Compression | 压缩 |
| Decompression | 解压 / 解压缩 |
| Firmware analysis | 固件分析 |
| Embedded file carving | 嵌入文件提取 / carving |

---

## 10. Further Reading

* GNU Coreutils manual
* GNU Grep manual
* man7 `xargs(1)`
* curl documentation / man page
* GNU Wget manual
* GNU tar manual
* GNU gzip manual
* 7-Zip command-line documentation
* Binwalk README / Kali tool page
* Ubuntu / Debian manpages for `hexedit` or `hexeditor`
