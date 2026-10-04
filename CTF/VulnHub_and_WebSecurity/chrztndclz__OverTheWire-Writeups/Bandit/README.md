# **SSH Information**

Host: bandit.labs.overthewire.org

Port: 2220

---

# Bandit

Bandit is a beginner-friendly OverTheWire wargame designed to teach the essential skills needed before tackling more advanced security challenges. You start at Level 0, solve the task, and each completed level provides the information required to access the next one.

---

# How the Game Works

- The game is divided into levels, starting at Level 0.
- Every level has its own page explaining:
    - How to connect to that level
    - What the goal is
    - What is needed to move to the next level
- All level pages are listed in the website’s left sidebar.

You will often encounter situations where you’re unsure what to do: this is normal and part of the learning process. Bandit is designed to help you learn by exploring, experimenting, and reading new information.

---

# Tips for Beginners

If you’re stuck or unsure how to continue, try the following:

1.Check the manual:
Use man <command> (e.g., man ls) to understand how a command works.

- / to search
- n or N to move between search results
- q to quit

2. Check built-in help:
If the command has no man page, it might be a shell built-in. Try:
help <command> (e.g., help cd)

3. Search online:
A search engine (Google recommended) can quickly clarify commands, errors, or unfamiliar concepts.

4. Ask the community:
If you’re still stuck, you can join the OverTheWire chat for help.

---

# Getting Started

You’re ready to begin: start with Level 0 using the link on the left side of the Bandit page.
Good luck and have fun learning!

---

# VM Users: SSH Connection Note

If you’re using a virtual machine and get a “broken pipe” error while connecting via SSH:
- Add the line IPQoS throughput to /etc/ssh/ssh_config.
- If that does not fix the issue, switch your VM’s network adapter from NAT mode to Bridged mode.
