
##  Level 7: Level 8

Tags: 
#Bandit 

---

## Level Goal
The password for the next level is stored in the file data.txt next to the word millionth

---

## Commands

Commands you may need to solve this level

man, grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

---

## Tips
(none)

---

## Analysis

This level is simple compared to the previous ones. The file already contains the password; we just need to locate the specific **line** where the word _millionth_ appears. Instead of scrolling through thousands of lines manually, we use the `grep` command to search the text efficiently and extract the exact line with the password.

---

## Methodology
**Step 1:** **Check the available file**

List the contents of the directory:

`ls`

Output:
data.txt

**Step 2:** **Search inside the file for the keyword**

Use `grep` to directly locate the line containing the word **millionth**:

`grep "millionth" data.txt
`

<img width="433" height="66" alt="image" src="https://github.com/user-attachments/assets/f4ded736-57e5-4caa-8547-918e147a0067" />

**Step 3:** Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit8@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

dfw----------eEc

---

## Reflection

This level reinforces how useful grep is for navigating large files. Instead of manually searching or scrolling, a single command filters out exactly what you need. It’s a small but important step toward mastering text-processing tools in Linux: skills that become essential in later Bandit levels and real-world security work.

---

