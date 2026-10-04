
##  Level 9: Level 10

Tags:
#Bandit 

---

## Level Goal

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

---

## Commands

Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

---

## Tips
(none)

---

## Analysis

The file `data.txt` contains a lot of random binary data, so using normal tools like `cat` will not help. To extract readable text from noisy or binary files, the command `strings` is ideal. Since the password is specifically **after some '=' characters**, we can filter for lines containing `=` and look for the one that contains a meaningful password-like string.

---

## Methodology
**Step 1:** **Step 1: Check available files**

`ls`

Output:
`data.txt`

**Step 2:** **Extract the human-readable strings**

Use the `strings` command to pull readable text out of the binary file:

`strings data.txt`

This outputs all printable characters.

<img width="372" height="408" alt="image" src="https://github.com/user-attachments/assets/f3a51a58-fba2-4885-a6c8-3ec5836c6ca8" />

**Step 3:** **Filter for lines containing '='**

Since the password appears after several `=`, filter using grep:

`strings data.txt | grep "="`

From the filtered output, find the line where the readable text (the password) appears after the `=====` sequence.

<img width="452" height="270" alt="image" src="https://github.com/user-attachments/assets/c61b445a-90be-4a30-9a06-bf9edc144d08" />

**Step 4:** Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit10@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

FGU---------iqey

---

## Reflection

This level demonstrates how to handle files that contain mixed or binary data. The `strings` command becomes essential for extracting human-readable information without clutter. Combining `strings` with `grep` shows the power of filtering, allowing you to target only the lines that match specific patterns. This is a practical skill often used in CTFs, malware analysis, and digital forensics.

---

