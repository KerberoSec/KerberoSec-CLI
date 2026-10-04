---
type: resource-note
status: done
created: 2026-02-23
updated: 2026-03-11
tags: [security-writeup, tryhackme, john-the-ripper, crypto]
source: "TryHackMe: John the Ripper: The Basics"
platform: tryhackme
room: "John the Ripper: The Basics"
slug: john-the-ripper-the-basics
path: TryHackMe/50-crypto/john-the-ripper-the-basics.md
topic: 50-crypto
domain: [authentication, crypto]
skills: [hash-cracking, hash-recognition, wordlists, jtr-workflows, archive-cracking, ssh-key-cracking]
artifacts: [lab-notes, pattern-card, cookbook]
sanitized: true
---

# John the Ripper: The Basics

## Summary

* John the Ripper (JtR) is an offline password cracking toolkit: it does not “reverse” hashes; it guesses inputs and compares digests.
* The workflow is consistent across targets: identify format → convert (if needed) → choose attack mode (wordlist/single/rules) → run → validate → record.
* Jumbo John is the practical default because it includes helper converters such as `unshadow`, `zip2john`, `rar2john`, and `ssh2john`.
* In real engagements, cracking is optional: sometimes you can use alternative routes (e.g., pass-the-hash). In labs, cracking is used to learn formats and workflows.
* Safe-writing note: this document avoids flags and exact cracked secrets; commands use placeholders.

## Key Concepts

### 1.1 Hash cracking mental model (offline guessing)

* Hash functions are one-way in practice: you cannot “decrypt a hash”.
* Cracking works by generating candidate passwords (from a dictionary, rules, or brute-force), hashing them with the same format/parameters, and checking for a match.

### 1.2 Modes you’ll actually use

* Wordlist mode: fast, scalable, depends on wordlist quality.
* Single crack mode (`--single`): “word mangling” based on username/GECOS metadata.
* Rules (`--rules` / `--rule=`): systematic mutation of wordlist entries.

### 1.3 Why formats matter

* JtR can auto-detect, but mis-detection is common.
* Correct `--format` is often the difference between “no hashes loaded” vs a working run.
* Many “plain” digests are named as `raw-<algo>` in JtR (example: `raw-md5`, `raw-sha1`, `raw-sha256`).

### 1.4 Wordlists

* A dictionary attack is only as good as its candidate set.
* `rockyou.txt` is a standard baseline for learning.
* SecLists is a common source for specialized lists.

## Pattern Cards

### 2.1 Universal cracking workflow card

* Step A: Identify

  * Determine hash family/format from context (OS/app/file type) + tooling.
* Step B: Convert (if needed)

  * Use converter: `unshadow`, `zip2john`, `rar2john`, `ssh2john`.
* Step C: Choose attack

  * `--wordlist=...` first.
  * `--single` when you have usernames / GECOS / hints.
  * `--rule=<RuleName>` when password policy is predictable.
* Step D: Run + Validate

  * Use `john --show <hashfile>` to print recovered credentials.
  * Sanity-check: can you actually unlock/decrypt/auth with the recovered secret?

### 2.2 “No hashes loaded” triage card

* Wrong `--format` (most common).
* Bad input file format (missing username prefix for `--single`, wrong converter output).
* Unsupported hash type in your build (core John vs Jumbo John).

### 2.3 “Auto-detect failed” recovery card

* List formats, grep your candidate:

  * `john --list=formats | grep -iF "<keyword>"`
* Try the most generic first (`raw-*`) before exotic wrappers.
* Use context:

  * Web app DB: often MD5/SHA1/SHA256 (legacy), sometimes bcrypt.
  * Windows SAM/NTDS: NT hash / NTLM.
  * Linux shadow: `$id$...` prefixes imply specific schemes.

### 2.4 Safe-writing/public-note card

* Do not publish flags, full recovered passwords, or step-by-step outputs.
* Use placeholders: `<HASH>`, `PASSWORD_REDACTED`, `TARGET_IP`, `USER_A`.
* Publish methodology + mitigations instead.

## Command Cookbook

### 3.1 Baseline: wordlist cracking

```bash
# simplest
john --wordlist=/usr/share/wordlists/rockyou.txt /path/to/file.txt

# show recovered results
john --show /path/to/file.txt
```

### 3.2 Format-specific cracking

```bash
# list supported formats
john --list=formats

# search formats
john --list=formats | grep -iF "md5"

# specify format explicitly
john --format=<FORMAT> --wordlist=/usr/share/wordlists/rockyou.txt /path/to/file.txt

# typical raw digests
john --format=raw-md5    --wordlist=/usr/share/wordlists/rockyou.txt /path/to/file.txt
john --format=raw-sha1   --wordlist=/usr/share/wordlists/rockyou.txt /path/to/file.txt
john --format=raw-sha256 --wordlist=/usr/share/wordlists/rockyou.txt /path/to/file.txt
```

### 3.3 Windows authentication hashes (NT hash / NTLM)

```bash
# crack NT hashes dumped from SAM/NTDS (lab-only unless authorized)
john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt ntlm.txt
john --show ntlm.txt
```

### 3.4 Linux `/etc/shadow` cracking with `unshadow`

```bash
# combine passwd + shadow into John-friendly format
unshadow local_passwd local_shadow > unshadowed.txt

# crack (format often auto-detected); if needed specify (example)
john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt
# or
john --format=sha512crypt --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt

john --show unshadowed.txt
```

### 3.5 Single crack mode (word mangling)

Input requirement: prepend username to hash.

```text
# before
<HASH>

# after
joker:<HASH>
```

Run:

```bash
john --single --format=<FORMAT> /path/to/file.txt
john --show /path/to/file.txt
```

### 3.6 Custom rules (high-level)

* Rules live in `john.conf` (path varies by install; common locations include `/etc/john/john.conf` or `/opt/john/john.conf`).
* Create a rule block:

```text
[List.Rules:THMRules]
# Example idea: capitalize + append digit + append symbol
cAz"[0-9][!$%@]"
```

Use:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --rule=THMRules /path/to/file.txt
```

### 3.7 Cracking password-protected ZIP archives

```bash
# convert zip → hash representation
zip2john secure.zip > zip_hash.txt

# crack
john --wordlist=/usr/share/wordlists/rockyou.txt zip_hash.txt
john --show zip_hash.txt

# validate (example)
unzip -P "PASSWORD_REDACTED" secure.zip
```

### 3.8 Cracking password-protected RAR archives

```bash
rar2john secure.rar > rar_hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt rar_hash.txt
john --show rar_hash.txt

# validate (tooling varies)
unrar x -p"PASSWORD_REDACTED" secure.rar
```

### 3.9 Cracking encrypted SSH private keys (`id_rsa`)

```bash
# converter varies by environment
ssh2john id_rsa > id_rsa_hash.txt
# or
python3 /opt/john/ssh2john.py id_rsa > id_rsa_hash.txt

# crack
john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa_hash.txt
john --show id_rsa_hash.txt

# validate (lab-only)
chmod 600 id_rsa
ssh -i id_rsa USER_A@TARGET_IP
```

### 3.10 Operational tips

```bash
# show status while running
john --status

# if you interrupted a run
john --restore

# keep runs separated
john --session=<NAME> --wordlist=... /path/to/file.txt
```

(Exact session/pot behavior can differ by build. If something surprises you, check `john --help` and your local docs.)

## Evidence

* This note is based on the room narrative and a walkthrough transcript provided by the user.
* If you later add screenshots, store under `assets/` and remove flags/secrets.

## Defensive Notes (what this teaches on blue team)

* Password storage:

  * Never store plaintext.
  * Never use fast, unsalted hashes (MD5/SHA1/SHA256) for passwords.
  * Use dedicated password hashing schemes (Argon2id/bcrypt/scrypt/PBKDF2) with unique salt and tuned cost.
* Windows:

  * Protect credential material (SAM/NTDS/LSASS); monitor for dumping tools.
  * Enforce strong password policies and MFA where possible.
* Linux:

  * Protect `/etc/shadow` permissions; adopt modern hashing defaults (distro-dependent).
* User behavior:

  * Predictable “complexity patterns” (CapFirst + Digit + Symbol) are exploitable; encourage passphrases and MFA.

## Takeaways

* JtR is less about “clever cracking” and more about disciplined workflow: correct format + correct input + good candidate generation.
* Converters are the hidden superpower: many targets are cracked by first translating them into John-readable hash representations.
* Single mode and rules exist to exploit human predictability; use them when you have context (username/GECOS/policy).

## References

* Openwall / John the Ripper official documentation and wiki pages.
* Jumbo John build/install docs.
* SecLists repository (wordlists).
* TryHackMe room page: John the Ripper: The Basics.

## CN: EN Glossary (mini)

* John the Ripper (JtR): John the Ripper 哈希破解工具
* Jumbo John: Jumbo 版 John（包含更多转换工具）
* Hash: 哈希/摘要
* Hash format: 哈希格式
* Wordlist / dictionary: 字典/口令表
* Dictionary attack: 字典攻击
* Brute force: 暴力破解
* Single crack mode: 单一模式/单词变形模式
* Word mangling rules: 单词变形规则
* GECOS field: GECOS 字段（用户信息字段）
* NT hash / NTLM: Windows NT 哈希/NTLM
* SAM: Security Account Manager（安全账户管理器）
* `/etc/passwd` and `/etc/shadow`: Linux 账户文件与口令哈希文件
* unshadow: 合并 passwd+shadow 的工具
* zip2john / rar2john / ssh2john: 将 ZIP/RAR/SSH key 转换为 John 可处理格式的工具
