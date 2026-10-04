## Level 0: Level 1

Tags: 
#Bandit

---

## Level Goal

The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.

----

## Commands

Commands you may need to solve this level

ls , cd , cat , file , du , find

---

## Tips

TIP: Create a file for notes and passwords on your local machine!

Passwords for levels are not saved automatically. If you do not save them yourself, you will need to start over from bandit0.

Passwords also occasionally change. It is recommended to take notes on how to solve each challenge. As levels get more challenging, detailed notes are useful to return to where you left off, reference for later problems, or help others after you’ve completed the challenge.

-----

## Analysis 
The goal of this level is to practice basic file navigation and reading file contents inside a Linux environment. The password for the next level is stored in a simple file called readme located in the user’s home directory. Since this is a beginner level, the challenge focuses on ensuring you understand how to:
- List files in the current directory
- Read a file’s contents
- Identify where passwords for each level are stored
- Use that password to log in to the next account via SSH
This level introduces essential Linux commands that will be used throughout the entire Bandit wargame.

----

## Methodology 

Step 1: List files in the home directory
Check what files are available:

ls

Step 2: Display the contents of the file
Use the cat command to read what’s inside:

<img width="669" height="173" alt="image" src="https://github.com/user-attachments/assets/150da679-03c7-4f04-bf41-8681fc65dbcf" />

Step 3: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit1@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

----

## Password

ZjL---------5If

----

## Reflection 
This level reinforces the basic skills required for navigating a Linux machine. You learn how to inspect the directory you're in, read files, and retrieve essential information. Although simple, these commands form the foundation of every upcoming Bandit level. Being able to confidently move through directories and read file contents is crucial for progressing through more complex challenges ahead. Keeping organized notes also becomes more important as the levels grow in difficulty.

