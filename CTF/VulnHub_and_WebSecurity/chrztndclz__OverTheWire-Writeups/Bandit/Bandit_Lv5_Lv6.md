## Level 5: Level 6

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

    human-readable
    1033 bytes in size
    not executable

---

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips
(none)

----

## Analysis 

The goal is to search through multiple nested directories inside inhere and identify a specific file with three unique attributes: readable text, exactly 1033 bytes, and not executable. Rather than checking files manually, the find command helps us filter out only the file that matches all these conditions efficiently.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

`ls`

Step 2: Move to inhere directory 

`cd inhere`

Step 3: Search for the file using find
Use a single command that filters files by type, size, and permissions:

`find . -type f -size 1033c ! -executable`

Output: 
`./maybehere07/.file2`

Step 4: Move to maybehere07 directory

`cd maybehere07`

Step 5: Read the human‑readable file

`cat ./.file2`

This reveals the password for the next level.

<img width="776" height="292" alt="image" src="https://github.com/user-attachments/assets/da9be2ad-f6fb-49aa-8542-0ef5252b768f" />

Step 5: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit6@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

----

## Password

HWa--------6EG

----

## Reflection 

This level reinforces the power of the find command when searching through complex directory structures. Instead of checking files one by one, combining conditions like size and permissions helps filter results quickly and accurately. It also highlights how useful it is to understand file attributes, especially when solving wargame levels that hide clues in nested or oddly structured directories.
