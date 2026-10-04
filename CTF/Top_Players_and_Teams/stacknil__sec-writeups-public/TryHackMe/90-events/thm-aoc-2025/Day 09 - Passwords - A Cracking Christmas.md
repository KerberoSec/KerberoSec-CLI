---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, passwords]
source: TryHackMe: Advent of Cyber 2025 Day 9
platform: tryhackme
room: Advent of Cyber 2025 Day 09: Passwords: A Cracking Christmas
slug: aoc-2025-day-09-passwords-a-cracking-christmas
path: TryHackMe/90-events/thm-aoc-2025/Day 09: Passwords: A Cracking Christmas.md
topic: 90-events
domain: [crypto]
skills: [password-cracking, hash-recognition]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 09: Passwords: A Cracking Christmas

## Summary

---

## Key Concepts

### 1. Story setup

* Time between **Easter** and **Christmas** is destabilised.
* Best Festival Company (TBFC) systems show **encrypted data** traces.
* Sir Carrotbane discovers locked **PDF** and **ZIP** files: `North Pole Asset List`.
* Goal: crack weak passwords on these files, reveal contents, and understand
  how defenders can **detect** such activity.

---

### 2. Password‑based encryption recap

* Files like **PDF** and **ZIP** can be encrypted with a **password-derived key**.
* Crypto primitives may be strong (AES, etc.), but **security ≈ password strength**.
* Key points:

  * Short / common passwords → easy to guess offline.
  * Long, random, unique passwords → exponentially harder to crack.
  * Different formats use different schemes:

    * PDFs: various revisions, key derivation, permissions.
    * ZIPs: legacy ZipCrypto vs modern WinZip AES (PBKDF2‑SHA1 etc.).
* Encryption protects **confidentiality only**:

  * Attacker who gets the encrypted file can attempt **offline guessing**
    without lockouts or SIEM alerts on authentication systems.

---

### 3. Common attack types

#### 3.1 Dictionary attacks

* Use a **wordlist** (dictionary) of likely passwords and test each in turn.
* Wordlists are often built from:

  * Leaked credential dumps (e.g. `rockyou.txt`).
  * Common patterns (names+years, keyboard walks, simple substitutions).
* Very effective because many users still choose weak, common passwords.

#### 3.2 Brute‑force & mask attacks

* **Brute force**: try all combinations in a given charset & length until success.

  * Guaranteed to succeed, but cost grows **exponentially**.
* **Mask attack**: constrained brute force with a **pattern** such as:

  * `?l?l?l?d?d` = 3 lowercase letters + 2 digits.
* Mask attacks are used when we have partial knowledge of password structure,
  shrinking the search space vs pure brute force.

#### 3.3 Practical cracking tips (attacker mindset)

* Start with **general wordlists** (fast wins), then move to:

  * Targeted lists (company names, project names, seasonal words, etc.).
* If that fails, use **masks / incremental** attacks on plausible lengths.
* Use **GPU‑accelerated tools** (e.g. hashcat) when algorithms allow.
* Always balance: **time vs. keyspace vs. success probability**.

---

### 4. Hands‑on: cracking the lab files

Files are on the **Desktop** of the TryHackMe AttackBox.

#### 4.1 Recon: confirm file types

```bash
cd ~/Desktop
ls
file flag.pdf
file flag.zip
```

* Confirms:

  * `flag.pdf` → encrypted PDF.
  * `flag.zip` → password‑protected ZIP archive (WinZip AES, PBKDF2‑SHA1).

#### 4.2 Cracking the PDF with `pdfcrack`

1. Run dictionary attack with `rockyou.txt` wordlist:

   ```bash
   pdfcrack -f flag.pdf -w /usr/share/wordlists/rockyou.txt
   ```

2. Tool parses PDF encryption metadata (version, length, etc.), then:

   * Iterates over each candidate word.
   * Derives a key from the candidate.
   * Tries to decrypt part of the PDF and checks whether it validates.
3. When successful, it prints the recovered **user password**.

You then open the PDF viewer (e.g. `evince flag.pdf`) and enter the
recovered password to see the **THM flag** inside.

#### 4.3 Cracking the ZIP with `zip2john` + `john`

**Stage 1: extract crackable hash**

```bash
zip2john flag.zip > ziphash.txt
```

* `zip2john` pulls the encrypted ZIP metadata and formats it into a
  single "hash" line that John understands.

**Stage 2: dictionary attack with John the Ripper**

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt ziphash.txt
```

* John loads the hash, runs through `rockyou.txt`, derives the key for each
  candidate, and checks whether it decrypts the ZIP test vector.
* On success, John prints the **ZIP password**.

**Stage 3: decrypt & read the flag**

```bash
unzip flag.zip   # enter recovered password when prompted
cat flag.txt     # inside is the THM flag for the ZIP part
```

---

### 5. Detection: what defenders can see

#### 5.1 Process & command‑line telemetry

* Look for creation of cracking tools and helper binaries, e.g.:

  * `john`, `hashcat`, `pdfcrack`, `fcrackzip`, `zip2john`, `pdf2john.pl`, `7z`, `qpdf`.
* Suspicious command‑line patterns:

  * `--wordlist`, `-w`, `--mask`, `-a 3`, `-m` (Hashcat mode selection).
  * References to well‑known wordlists (e.g. `rockyou.txt`, `SecLists`).
* Windows: **Sysmon Event ID 1** for process creation with full command line.
* Linux: `auditd` rules on `execve`, or EDR sensors tracking binaries+arguments.

#### 5.2 GPU & resource artefacts

* GPU cracking is noisy:

  * Long‑running `hashcat` / `john` processes in `nvidia-smi`.
  * High, steady GPU utilisation & power; fan curve spikes.
  * Libraries loaded: `nvcuda.dll`, `libcuda.so`, `OpenCL.dll`, etc.

#### 5.3 Network hints

* Offline cracking itself is network‑silent, but provisioning is not:

  * Large downloads named `rockyou.txt` or clones of wordlist repositories.
  * Package installs: `apt install john hashcat`, tool updates, GPU drivers.

#### 5.4 File access patterns

* Repeated reads of:

  * Specific encrypted files.
  * Massive wordlists.
* Presence of tool artifacts:

  * John: `~/.john/john.pot`, `john.rec`.
  * Hashcat: `~/.hashcat/hashcat.potfile`.

---

### 6. Incident response playbook (defender)

1. **Triage & contain**

   * Isolate the host if cracking appears unauthorized.
   * In lab/training environments, tag and suppress as expected activity.

2. **Collect evidence**

   * Process list, memory samples, `nvidia-smi` output.
   * Open file handles, copies of encrypted files, wordlists, hash files.
   * Shell history and working directories.

3. **Scope & impact**

   * Identify which encrypted files were successfully decrypted.
   * Look for follow‑on activity: lateral movement, data exfiltration.

4. **Remediate**

   * Rotate affected passwords and keys.
   * Enforce **MFA** and strong password policies.
   * Remove unauthorized cracking tools from production endpoints.

5. **Learn & harden**

   * Educate users about strong passphrases & password managers.
   * Ensure sensitive archives use modern, strong encryption modes and
     high‑iteration KDFs.
   * Put cracking tools into dedicated sandboxes for red‑team / training use only.

---

## Takeaways

* Encryption is only as strong as the **password and KDF parameters** behind it.
* **Dictionary attacks** are devastating against weak human‑chosen passwords.
* Defensive visibility comes from **process + resource + network + file** telemetry.
* Strong, unique passwords plus good monitoring significantly raise the bar
  against offline password‑cracking attacks.
