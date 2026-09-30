---
title: "TryHackMe: Linux Fundamentals Part 2"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Continue your learning Linux journey with part two. You will be learning how to log in to a Linux machine using SSH, how to advance your commands, file system interaction."
---

## Answers

What directional arrow key would we use to navigate down the manual page?

**down**

What flag would we use to display the output in a "human-readable" way?

**-h**

How would you create the file named "newnote"?

**touch newnote**

On the deployable machine, what is the file type of "unknown1" in "tryhackme's" home directory?

**ASCII text**

How would we move the file "myfile" to the directory "myfolder"

**mv myfile myfolder**

What are the contents of this file?

**THM{FILESYSTEM}**

On the deployable machine, who is the owner of "important"?

**user2**

What would the command be to switch to the user "user2"?

**su user2**

Output the contents of "important", what is the flag?

**THM{SU_USER2}**

What is the directory path that would we expect logs to be stored in?

**/var/log**

What root directory is similar to how RAM on a computer works?

**/tmp**

Name the home directory of the root user 

**/root**

## Things You Should Know

Linux Fundamentals Part 2 builds on basic Linux usage, focusing on **SSH access, advanced command options, filesystem interaction, permissions, and understanding core directories**. This part prepares you for real-world Linux administration and cybersecurity tasks.

---

### **1. Accessing Linux via SSH**

* SSH (Secure Shell) allows secure remote login to a Linux machine.

```bash
ssh username@MACHINE_IP
```

* Essential for connecting to remote labs, servers, and attack boxes.

---

### **2. Flags & Switches**

* Many Linux commands have **flags (short: -x, long: --option)** to modify behavior.
* Example: `ls -a` shows all files, including hidden ones (`.` prefix).
* Use `--help` to see available options:

```bash
ls --help
```

* **man pages** provide detailed documentation:

```bash
man ls
```

* Navigation in man pages: arrow keys (down/up), `q` to quit.

* Example flag:

```bash
ls -lh   # human-readable sizes
```

---

### **3. Filesystem Interaction**

#### **Creating Files and Directories**

* `touch filename` → create an empty file.
* `mkdir foldername` → create a directory.

#### **Removing Files and Directories**

* `rm filename` → delete a file.
* `rm -R foldername` → delete a folder recursively.

#### **Copying and Moving**

* `cp source destination` → copy files or directories.
* `mv source destination` → move or rename files or directories.

#### **File Type**

* `file filename` → identify the type of a file (e.g., text, binary).

---

### **4. Permissions 101**

#### **Understanding Access**

* Every file/directory has permissions for **Owner, Group, Others**.
* Permissions: `r` = read, `w` = write, `x` = execute.
* View permissions: `ls -l` or `ls -lh`.

#### **Numeric Representation**

* Read = 4, Write = 2, Execute = 1.
* Combine values for each group:

  * Example: `rwxr-xr-x` → 755.

#### **Switching Users**

* `su username` → switch user (requires password).
* `su -l username` → login shell, inherits environment of the new user.

---

### **5. Common Root Directories**

| Directory | Purpose                                                          |
| --------- | ---------------------------------------------------------------- |
| `/etc`    | System configuration files (e.g., `passwd`, `shadow`, `sudoers`) |
| `/var`    | Variable data (logs, databases, application data)                |
| `/root`   | Home directory of root user                                      |
| `/tmp`    | Temporary files; cleared on reboot; writable by all users        |

#### **Key Notes**

* Logs are usually in `/var/log`.
* `/tmp` is similar to RAM: volatile storage for temporary data.
* `/root` is the superuser’s personal directory.

---

### **Key Commands to Remember**

```bash
ls -l      # list files with detailed info
touch      # create file
mkdir      # create directory
rm        # remove file
rm -R     # remove directory recursively
cp        # copy file/folder
mv        # move/rename file/folder
file      # check file type
su        # switch user
chmod     # change permissions
```

---

### **Overall Takeaways**

* Linux Part 2 teaches **how to navigate and manipulate the filesystem**, understand **permissions and ownership**, and **connect via SSH**.
* Mastery of these commands lays the foundation for **advanced administration, scripting, and security tasks** in Linux.
