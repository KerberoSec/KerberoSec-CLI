
# 🛡️ Linux Data Analysis & Text Processing Lab 

[![Bash](https://img.shields.io/badge/Language-Bash-4EAA25?logo=gnu-bash&logoColor=white)](https://www.gnu.org/software/bash/)
[![Security](https://img.shields.io/badge/Domain-Cybersecurity-red)](#)
[![Lab](https://img.shields.io/badge/Lab-NX201-blue)](https://cyberiumarena.com)

## 📖 Project Overview
This repository contains my solutions for the **Cyberium Arena Module 1 Lab**. The core objective of this assignment is to demonstrate proficiency in Linux command-line environments, specifically focusing on large-scale data extraction, forensic text analysis, and the application of Regular Expressions (Regex).

The lab is split into two distinct datasets:
1.  **`passwords.lst`**: A security dataset containing credentials and emails.
2.  **`file.txt`**: A general text corpus used for pattern matching and transformation tasks.

---

## 🛠️ Skills & Tools Demonstrated
* **Text Processing:** `grep`, `sed`, `awk`, `wc`
* **Data Manipulation:** `sort`, `uniq`, `head`, `tail`
* **Regex Patterns:** Anchors (`^`, `$`), Non-whitespace (`\S`), Wildcards (`.`), Quantifiers (`*`, `+`)
* **System Forensics:** Recursive directory searching and line-specific extraction.

---

## 🚀 Lab Questions & Technical Solutions

### 📂 Phase 1: Security Log Analysis (`passwords.lst`)
*The dataset is structured in two columns: `[Password] [Email]`*

| # | Task | Command Methodology |
|:---:|:---|:---|
| 01 | Total line count | `wc -l passwords.lst` |
| 02 | Lines containing 'gmail' | `grep "gmail" passwords.lst \| wc -l` |
| 03 | Identify most common password | `awk '{print $1}' passwords.lst \| sort \| uniq -c \| sort -nr \| head -1` |
| 04 | Domain repeating exactly 99 times | `awk -F"@" '{print $2}' passwords.lst \| sort \| uniq -c \| grep "99"` |
| 05 | Count lines containing '@' | `grep "@" passwords.lst \| wc -l` |
| 06 | Inverse: Lines without '@' | `grep -v "@" passwords.lst \| wc -l` |
| 07 | Passwords (Col 1) containing '@' | `awk '{print $1}' passwords.lst \| grep "@" \| wc -l` |
| 08 | Passwords containing '!' | `awk '{print $1}' passwords.lst \| grep "!" \| wc -l` |
| 09 | Passwords containing '.' | `awk '{print $1}' passwords.lst \| grep "\." \| wc -l` |
| 10 | Emails (Col 2) containing '2' | `awk '{print $2}' passwords.lst \| grep "2" \| wc -l` |
| 11 | First line index for password with '.' | `grep -n "^\S*\." passwords.lst \| head -1` |

### 📂 Phase 2: Text Forensics (`file.txt`)
*Analysis of a general text file and system-wide strings.*

| # | Task | Command Methodology |
|:---:|:---|:---|
| 12 | Total line count | `wc -l file.txt` |
| 13 | Total word count | `wc -w file.txt` |
| 14 | Case-insensitive search ('secret') | `grep -i "secret" file.txt \| wc -l` |
| 15 | Character swap 'e' ➔ 'x' | `sed 's/e/x/g' file.txt > new.txt && grep "xx" new.txt \| wc -l` |
| 16 | Character count of Line 97 | `sed -n '97p' file.txt \| wc -m` |
| 17 | Content retrieval of Line 111 | `sed -n '111p' file.txt` |
| 18 | Count of non-blank lines | `grep -v "^$" file.txt \| wc -l` |
| 19 | Recursive system string search | `grep -iRn 'Darrenvandervaate' ~` |
| 20 | Frequency of word 'human' | `grep -o "human" file.txt \| wc -l` |

---

## 🧠 Regular Expression Cheat Sheet
This lab utilized the following Regex symbols to refine data extraction:
- `.` : Matches any character.
- `^` / `$` : Matches start/end of a line.
- `\S` : Matches any non-whitespace character (essential for isolating columns).
- `[ ]` : Character classes.
- `-iRn` : Case-insensitive (`i`), Recursive (`R`), and Line Numbering (`n`).

---

## 📂 Installation
1.  **Clone this repository:**
    ```bash[
    git clone https://github.com/MoriartyPuth/Linux-Data-Analysis-Lab
    ```
2.  **Dataset Links:**
    * [passwords.lst](https://cyberiumarena.com/lab/nx201/passwords.lst)
    * [file.txt](https://cyberiumarena.com/lab/nx201/file.txt)

---
*Disclaimer: This repository is for educational purposes as part of the Cyberium Arena Cybersecurity curriculum.*
