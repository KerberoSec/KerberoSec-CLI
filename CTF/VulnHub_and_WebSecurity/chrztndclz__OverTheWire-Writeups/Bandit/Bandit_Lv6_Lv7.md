
##  Level 6: Level 7

Tags:
#Bandit 

---

## Level Goal
The password for the next level is stored somewhere on the server and has all of the following properties:

    owned by user bandit7
    owned by group bandit6
    33 bytes in size

---

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find , grep

---

## Tips
(none)

---

## Analysis

Unlike previous levels where the file was inside a known directory, this time the file can be **anywhere on the entire system**. Because of that, manual searching isn’t practical. Instead, you use the `find` command to scan the filesystem using specific filters: owner name, group name, and file size. This lets you narrow the search down to exactly the one file that contains the password.

---

## Methodology
**Step 1:** **Use `find` to search the whole system with precise filters**  
We look for a file with exactly the required properties:

find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null

Explanation:

- `/` → search from the root directory
- `-type f` → only files
- `-user bandit7` → owned by user bandit7
- `-group bandit6` → owned by group bandit6
- `-size 33c` → exactly 33 bytes
- `2>/dev/null` → hide permission errors

Output: 
/var/lib/dpkg/info/bandit7.password

**Step 2:** Read the file to view the password

cat /var/lib/dpkg/info/bandit7.password

<img width="832" height="52" alt="image" src="https://github.com/user-attachments/assets/270f6ee5-1dd1-4dbe-b33a-60b48daefa07" />

**Step 3:**  Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit7@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

mor---------Aaj

---

## Reflection

This level shows how powerful the `find` command is when dealing with large directory structures. By combining ownership and size filters, you can locate a single file hidden across the entire filesystem. Filtering out permission errors with `2>/dev/null` makes the search cleaner and easier to read. It’s a good reminder that understanding command-line tools often solves problems that seem overwhelming at first.

---

