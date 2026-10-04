## Level 1: Level 2

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in a file called: located in the home directory

----

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips

Helpful Reading Material

[Google Search for “dashed filename"](https://www.google.com/search?q=dashed+filename)
[Advanced Bash-scripting Guide: Chapter 3: Special Characters](https://linux.die.net/abs-guide/special-chars.html)

-----

## Analysis 
This level is about reading a file named **`-`** in the home directory. The challenge comes from the filename itself, because a dash is normally treated as an option by commands. So instead of just using `cat -`, we need to reference the file in a way that tells the system it’s a regular file. Once we do that, we can read the password and use it to log in to the next level.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

ls

Step 2: Read the file safely
Since `-` is interpreted as an option/flag in many commands, we cannot run `cat command` on its own

This would cause `cat` to wait for user input instead of reading the file.

instead we use `./` this prevents the dash from being misinterpreted.

<img width="207" height="66" alt="image" src="https://github.com/user-attachments/assets/7b079d58-7950-4d1d-9f29-dda4a69ee90b" />

This forces the program to see the dash as a normal filename and allows the file to be read correctly.

Step 3: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit2@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

----

## Password

263--------mFx

----

## Reflection 

This level highlights an important lesson in Linux: **not all filenames are simple**. Some files may contain special characters that require careful handling. Learning how to reference files like `-`, `*`, or filenames beginning with spaces is essential for real-world terminal navigation and cybersecurity tasks. Understanding why `./-` works strengthens your awareness of how the shell interprets commands and arguments: a skill that becomes increasingly important in later Bandit levels and other wargames.
