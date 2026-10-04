
##  Level 8: Level 9

Tags:
#Bandit 

---

## Level Goal

The password for the next level is stored in the file data.txt and is the only line of text that occurs only once

---

## Commands

Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

---

## Tips

Helpful Reading Material

[Piping and Redirection](https://ryanstutorials.net/linuxtutorial/piping.php)

---

## Analysis
The file `data.txt` contains many repeated lines, and only **one unique line** appears exactly once. Manually searching would be inefficient, so we use a combination of `sort` and `uniq` to filter the content.

- `sort` groups identical lines together.
- `uniq -u` outputs only lines that occur once.

This allows us to isolate the password quickly.

---

## Methodology

**Step 1:** **Inspect the directory**
Check what files are available:

ls

Output:
data.txt

**Step 2:** **Identify the unique line**

Use sorting + unique filtering to find the line that appears once:

sort data.txt | uniq -u

Explanation:

- `sort` places identical lines next to each other
- `uniq -u` prints only lines that occur _once_

The output is the password.

<img width="422" height="63" alt="image" src="https://github.com/user-attachments/assets/7afe2eaf-80ad-4592-aec1-19afbedde321" />

**Step 3:** Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit9@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

4CK--------0JM

---

## Reflection

This level highlights the power of combining simple commands through pipes. Instead of manually scanning thousands of lines, `sort` and `uniq` work together to isolate exactly what you need. Understanding these text-processing tools is essential for handling data efficiently in Linux and becomes even more valuable in later Bandit challenges.

---

