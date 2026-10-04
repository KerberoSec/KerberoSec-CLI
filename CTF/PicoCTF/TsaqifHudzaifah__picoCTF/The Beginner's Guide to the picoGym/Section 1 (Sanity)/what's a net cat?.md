<p align="center">
  <img src="https://play.picoctf.org/api/media/picoCTF_p_logo_4c_3_NoYG1qU_3zBp50s.png" alt="picoCTF Logo" width="200"/>
</p>

# Beginner's Guide Challenge: what's a net cat?

🔗 [Challenge Link](https://play.picoctf.org/playlists/18?m=148)

---

### 📌 Challenge Overview

- **Name:** what's a net cat?
- **Difficulty:** Easy  
- **Category:** General Skills  
- **Author:**  Sanjay C / Danny Tunitis

---

## 📝 Description

> *Using netcat (nc) is going to be pretty important. <br>
Can you connect to jupiter.challenges.picoctf.org at port 64287 to get the flag?*

---

## 💡 Hints

1. Review the netcat (nc) man page: [https://linux.die.net/man/1/nc](https://linux.die.net/man/1/nc)

---

## 🛠️ Solution

### 🔹 Step 1: Open a Terminal
Ensure you have access to a shell/terminal. If you're using Windows and don't have netcat installed, consider using [WebShell](https://webshell.picoctf.org) or WSL (Windows Subsystem for Linux).

---

### 🔹 Step 2: Run the netcat Command

Use the following command format:

```bash
nc <hostname> <port>
```
For this challenge, you would enter:
```bash
nc jupiter.challenges.picoctf.org 64287
```

---

### 🔹 Step 3: Receive the Flag
Once you run the command, the remote server sends back a response, where it usually contains the flag.
Example output:
> *You're on your way to becoming the net cat master <br>
picoCTF{nEtCat_Mast3ry_284be8f7}*

--- 

🧠 What I have Learned
* How to use nc (netcat) to connect to remote servers
* Working with TCP port communication
* Understanding how basic command-line tools can be used in cybersecurity
