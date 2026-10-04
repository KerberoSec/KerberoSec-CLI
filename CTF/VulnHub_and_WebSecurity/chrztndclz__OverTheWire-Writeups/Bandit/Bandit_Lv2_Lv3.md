## Level 2: Level 3

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in a file called --spaces in this filename-- located in the home directory

---

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips

Helpful Reading Material

[Google Search for “spaces in filename”](https://www.google.com/search?q=spaces+in+filename)

---

## Analysis 

This level is about reading a file whose name includes **both dashes and spaces**, which makes it tricky to open using normal commands. Commands like `cat` may misinterpret the leading dashes as options, and filenames with spaces must be handled correctly to avoid errors. The goal is simply to read the file properly so we can retrieve the password for the next level.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

ls

Step 2: Read the file safely
This filename has **two problems**:

1. **Leading dashes** → Programs may interpret them as command options.
2. **Spaces** → The shell will treat each word as a separate argument unless we group them.

To handle both issues:

- Use `./` to tell the shell it’s a file, not an option.
- Wrap the filename in quotes so the spaces are treated as part of one name.

<img width="430" height="55" alt="image" src="https://github.com/user-attachments/assets/378e21d7-afe8-43f6-84e2-ff4be6f42bc5" />

This will display the password for the next level.

Step 3: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit3@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

MNk---------Smx

---

## Reflection 

This level teaches how to work with filenames that contain special characters and spaces: something that can be confusing at first. Learning how to escape filenames, use quotes, and force the shell to interpret names correctly is an essential skill for navigating real Linux systems. This challenge reinforces the idea that the terminal is very literal, and small details like spaces or dashes can change how commands behave. Mastering these basics will make later Bandit levels feel much more manageable.
