## Level 4: Level 5

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

---

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips
(none)

----

## Analysis 

This level requires identifying which file contains readable text among many files filled with binary data. Instead of opening each file manually, the main idea is to **use the `file` command** to quickly check which file is human-readable. Once the readable one is found, we simply display its contents.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

ls

Step 2: Move to inhere directory 

cd inhere

Step 3: Identify which file is human-readable
Instead of using `cat` on every file (which will print messy binary characters), use the `file` command to identify the readable one:

file ./*

Step 4: Read the readable file
Use `cat` to read it:

cat ./-file07

<img width="459" height="301" alt="image" src="https://github.com/user-attachments/assets/d57cde8c-cc3d-4895-a062-363ea5011b15" />

The password will appear clearly.

Step 5: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit5@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

----

## Password

4oQ---------UQw

----

## Reflection 

This level teaches the importance of choosing the right tool: manually opening each file with `cat` wastes time and produces unreadable output. The `file` command quickly identifies the nature of each file, making it easy to locate readable text among binary files. This reinforces the habit of analyzing a problem before acting, which becomes increasingly valuable in later challenges.

