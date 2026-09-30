## Level 0 

Tags:

---

## Level Goal

The goal of this level is for you to log into the game using SSH. The host to which you need to connect is bandit.labs.overthewire.org, on port 2220. The username is bandit0 and the password is bandit0. Once logged in, go to the Level 1 page to find out how to beat Level 1.

---

## Commands

Commands you may need to solve this level

ssh

---

## Tips

Helpful Reading Material

[Secure Shell (SSH) on Wikipedia](https://en.wikipedia.org/wiki/Secure_Shell)

[How to use SSH with a non-standard port on It’s FOSS](https://itsfoss.com/ssh-to-port/)

[How to use SSH with ssh-keys on wikiHow](https://www.wikihow.com/Use-SSH)

---

## Analysis

This level is simply about establishing your first connection to the Bandit server. The challenge introduces how to use SSH, how to specify a username, and how to connect using a non-default port. No file inspection or problem-solving is involved yet, your task is only to log in successfully using the provided credentials:

- Host: bandit.labs.overthewire.org
- Port: 2220
- Username: bandit0
- Password: bandit0

This level ensures you understand the basic structure of an SSH command and prepares you for navigating the remote environment in the upcoming levels.

---

## Methodology 

Step 1: Use SSH to connect to the server
Run the SSH command with the required port (-p 2220) and username:

ssh bandit0@bandit.labs.overthewire.org -p 2220

Step 2: Enter the password
When prompted, enter the password:

bandit0

Step 3: Verify successful login
Once logged in, you should see a welcome message from OverTheWire and gain access to the Bandit0 shell environment. At this point, you have completed Level 0 and can move on to the Level 1 instructions.

<img width="591" height="794" alt="image" src="https://github.com/user-attachments/assets/7f75dc41-0011-4102-9600-42265aa07220" />

---

## Reflection 

This level reinforced the basics of connecting to a remote machine using SSH. Although simple, it introduces important concepts like specifying a username and connecting through a non-standard port. Understanding this early step is crucial since every subsequent Bandit level depends on accessing the next account through SSH. This initial login also builds confidence in navigating terminal-based authentication, which is a fundamental skill in cybersecurity and Linux environments.
