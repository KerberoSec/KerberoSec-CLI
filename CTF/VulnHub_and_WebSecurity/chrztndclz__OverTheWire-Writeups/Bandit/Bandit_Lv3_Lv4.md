## Level 3: Level 4

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in a hidden file in the inhere directory.

----

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips
(none)

-----

## Analysis 

This level focuses on exploring directories and identifying **hidden files** in Linux. Hidden files don’t appear with a normal `ls` command, so the main task is to look deeper using the correct option and then read the file containing the password.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

ls

Step 2: Move to inhere directory 

cd inhere

Step 3: Find the hidden files
If you run `ls` here, it looks empty. That's because the file is hidden.

Use the **-a** option to show all files (including those starting with a dot):

ls -a 

Step 4: Read the file safety 
Use `cat` to display its contents.  
The `./` helps avoid confusion with unusual filenames.

cat ./...Hiding-From-You

<img width="592" height="81" alt="image" src="https://github.com/user-attachments/assets/0fd99a12-482b-4d37-b8fe-ea39e625226b" />

Step 5: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit4@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

----

## Password

2Wmr---------3NJ

----

## Reflection 

This level highlights the importance of understanding how Linux handles hidden files. A normal `ls` doesn’t show everything, so using `ls -a` becomes essential when nothing appears at first glance. It teaches you to look beyond obvious files and to be aware that filenames can include unusual characters, requiring careful handling when using commands like `cat`.

