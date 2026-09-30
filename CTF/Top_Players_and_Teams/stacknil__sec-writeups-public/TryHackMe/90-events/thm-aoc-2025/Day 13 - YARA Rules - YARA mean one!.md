---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, yara]
source: TryHackMe: Advent of Cyber 2025 Day 13
platform: tryhackme
room: Advent of Cyber 2025 Day 13: YARA Rules: YARA mean one!
slug: aoc-2025-day-13-yara-rules-yara-mean-one
path: TryHackMe/90-events/thm-aoc-2025/Day 13: YARA Rules: YARA mean one!.md
topic: 90-events
domain: [blueteam]
skills: [yara, detection]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 13: YARA Rules: YARA mean one

## Summary

McSkidy sent a folder of images that *look* benign, but some contain hidden message fragments. Your job is to write a **YARA rule** that matches:

* a fixed keyword prefix: `TBFC:`
* followed by **one or more** alphanumeric ASCII characters (`[A-Za-z0-9]+`)

Then run YARA on the target directory, collect all code words, sort by the image index, and reconstruct the message.

---

## Key Concepts

### 1. Mental model (what YARA actually does)

A YARA rule is a **declarative detector**:

* **strings:** what to look for (text / hex / regex)
* **condition:** when to raise a match (boolean logic over strings + file properties)
* **meta (optional but recommended):** bookkeeping for humans

Think of it as: *"If these indicators appear together, treat the file as suspicious / relevant."*

---

### 2. Rule anatomy

A minimal rule:

```yara
1| rule dummy
2| {
3|   condition:
4|     false
5| }
```

A practical rule for TBFC images:

```yara
1| rule TBFC_Simple_Message_Extract
2| {
3|   meta:
4|     author = "TBFC Blue Team"
5|     description = "Extract TBFC:<codeword> fragments from Easter images"
6|     date = "2025-12-13"
7|
8|   strings:
9|     // Regex string: TBFC: + one-or-more ASCII alnum
10|     $tbfc_msg = /TBFC:[A-Za-z0-9]+/ ascii
11|
12|   condition:
13|     $tbfc_msg
14| }
```

Why regex here? Because the suffix is unknown, but constrained.

---

### 3. Strings: choosing the right type

#### 3.1 Text strings ("literal")

Use when the token is stable.

```yara
1| $k = "TBFC:" ascii
```

#### 3.2 Hex strings

Use when you need byte-level signatures (headers, shellcode fragments, magic bytes).

```yara
1| $mz = { 4D 5A }  // "MZ" header for PE
```

#### 3.3 Regex strings

Use for patterns with controlled variability (URLs, command-lines, prefixes + variable payload).

```yara
1| $p = /TBFC:[A-Za-z0-9]+/ ascii
```

Operational warning: regex can become expensive or noisy if too broad.

---

### 4. Modifiers: hardening against trivial evasion

Common modifiers you’ll actually use:

* `nocase`: case-insensitive matching (good for human words)
* `wide`: UTF-16-like interleaving (`B\x00o\x00r...`), common in Windows binaries
* `ascii`: explicitly match ASCII (default unless `wide` is used, but explicit is fine)
* `xor`, `base64`, `base64wide`: useful when malware stores encoded strings
* `fullword`: match whole words (avoid partial hits)

Example patterns:

```yara
1| $a = "Christmas" nocase
2| $b = "Borland" wide ascii
3| $c = "Malhare" xor
4| $d = "SOC-mas" base64
```

Practical note: `nocase` cannot be combined with some modifiers (e.g., `xor` / `base64` families). If you see YARA complain, split into two strings.

---

### 5. Conditions: controlling precision vs recall

#### 5.1 Single indicator

```yara
1| condition:
2|   $tbfc_msg
```

#### 5.2 Any / all

```yara
1| condition:
2|   any of them
```

```yara
1| condition:
2|   all of them
```

#### 5.3 Boolean logic

```yara
1| condition:
2|   ($s1 or $s2) and not $benign
```

#### 5.4 Add file constraints (reduce false positives)

```yara
1| condition:
2|   $tbfc_msg and filesize < 10MB
```

---

### 6. Running YARA (CLI workflow)

Assume:

* rule file saved as: `/home/ubuntu/TBFC_Simple_Message_Extract.yar`
* target directory: `/home/ubuntu/Downloads/easter`

#### 6.1 Scan a directory recursively

```bash
1| yara -r /home/ubuntu/TBFC_Simple_Message_Extract.yar /home/ubuntu/Downloads/easter
```

#### 6.2 Also print matching strings (what you want for extraction)

```bash
1| yara -r -s /home/ubuntu/TBFC_Simple_Message_Extract.yar /home/ubuntu/Downloads/easter
```

Interpretation:

* output shows which files matched
* with `-s`, YARA prints the matching fragment (your `TBFC:<codeword>`)

---

### 7. Solving the room questions (method)

#### Q1: How many images contain the string TBFC?

Run:

```bash
1| yara -r /home/ubuntu/TBFC_Simple_Message_Extract.yar /home/ubuntu/Downloads/easter
```

Count unique image paths in the output.

#### Q2: What regex matches `TBFC:` + alnum?

Answer (regex body):

```text
TBFC:[A-Za-z0-9]+
```

In YARA regex literal form:

```text
/TBFC:[A-Za-z0-9]+/
```

#### Q3: What message was sent?

Workflow:

1. Run with `-s` to dump `TBFC:<codeword>` per file
2. Sort by image number (e.g., `easter10.jpg`, `easter16.jpg`, ...)
3. Strip prefix `TBFC:`
4. Concatenate code words in order

Example reconstruction pattern:

```text
easter10.jpg -> TBFC:Find
easter16.jpg -> TBFC:me
easter25.jpg -> TBFC:in
easter46.jpg -> TBFC:HopSec
easter52.jpg -> TBFC:Island

Message: Find me in HopSec Island
```

---

### 8. Pitfalls (things that waste time)

* **Wrong CLI argument order:** `yara [options] RULES_FILE TARGET`
* Forgetting to pass a target path after the rules file
* Writing an over-broad regex (explodes matches)
* Mixing incompatible modifiers (split strings instead)
* Assuming `wide` means full UTF-16 support for non-ASCII text (it doesn’t)

---

### 9. What to practice next

* Add `filesize` constraints to reduce noise.
* Add a second string (e.g., filetype markers) and switch between `any of them` vs `all of them`.
* Learn hex wildcards (`??`, `A?`) and jumps (`[4-6]`) for robust binary signatures.

---

## Glossary (EN → 中文)

* **rule**：规则
* **meta**：元数据（规则说明信息）
* **strings**：字符串/特征定义
* **condition**：触发条件（布尔逻辑）
* **modifier**：修饰符（改变匹配行为）
* **regex / regular expression**：正则表达式
* **wide**：宽字符匹配（近似 UTF-16LE 双字节交错）
* **IOC (Indicator of Compromise)**：入侵指标
