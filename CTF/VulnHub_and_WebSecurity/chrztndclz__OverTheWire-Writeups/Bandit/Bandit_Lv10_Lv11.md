
##  Level 10: Level 11

Tags:

---

## Level Goal

The password for the next level is stored in the file data.txt, which contains base64 encoded data

---

## Commands

Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

---

## Tips

Helpful Reading Material

[Base64 on Wikipedia](https://en.wikipedia.org/wiki/Base64)

---

## Analysis
The file `data.txt` doesn’t store the password directly: instead, it contains text encoded in **base64**, a common way to represent binary data using ASCII characters. To reveal the actual password, the encoded string must be decoded using the `base64` command.

---

## Methodology
**Step 1:** **Step 1: Check available files**

`ls`

Output:
`data.txt`

**Step 2:** **View the contents of the file**

`cat data.txt`

You will notice that the text looks like base64 (letters, numbers, `+`, `/`, `=`).

**Step 3:** **Decode the base64 string**

Use the base64 decoder to extract the real password:

`base64 -d data.txt`

This prints the decoded, human-readable password.

<img width="689" height="104" alt="image" src="https://github.com/user-attachments/assets/6d96e77c-17fe-40f4-a2d1-a97b9c5e6fd7" />

Step 4: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit11@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

dtR---------qRr

---

## Reflection

This level reinforces how often encoded data appears in security challenges. Recognizing base64 and knowing how to decode it is a fundamental skill in CTFs, scripting, and even real-world penetration testing. The process is simple once you know what to look for, and tools like the `base64` command make decoding straightforward.

---

