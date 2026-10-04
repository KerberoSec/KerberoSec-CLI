
##  Level 11: Level 12

Tags:
#Bandit 

---

## Level Goal

The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions

---

## Commands

Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

---

## Tips

Helpful Reading Material

[Rot13 on Wikipedia](https://en.wikipedia.org/wiki/ROT13)

---

## Analysis

The password is not stored in plain text. It has been encoded using **ROT13**, a simple Caesar cipher that shifts each letter by 13 positions in the alphabet.  
Decoding it restores the original letters, revealing the password. This is a classic text encoding often used for obfuscation.

---

## Methodology

**Step 1:** **Inspect the file**

`ls`

Output:
`data.txt`

**Step 2:** **View the encoded contents**

`cat data.txt`

The text consists of letters that appear scrambled. This is ROT13 encoding.

**Step 3:** **Decode using `tr`**

Use the `tr` command to rotate letters back by 13 positions:

`cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'`

This prints the **decoded password**. 

<img width="605" height="114" alt="image" src="https://github.com/user-attachments/assets/3c442524-7b85-4b58-8e6a-916d4286341c" />

Step 4: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit12@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

7x1--------Q4

---

## Reflection

This level teaches the importance of recognizing simple ciphers in CTFs and security challenges. While ROT13 is trivial to break, it reinforces the concept of **text transformations** and the use of command-line tools like `tr` to automate decoding. Understanding such basic ciphers is a foundation for tackling more advanced encryption and obfuscation in later challenges.

---

