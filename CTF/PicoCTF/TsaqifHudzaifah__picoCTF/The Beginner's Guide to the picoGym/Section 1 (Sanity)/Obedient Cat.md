<p align="center">
  <img src="https://play.picoctf.org/api/media/picoCTF_p_logo_4c_3_NoYG1qU_3zBp50s.png" alt="picoCTF Logo" width="200"/>
</p>

# Beginner's Guide Challenge: Obedient Cat

🔗 [Challenge Link](https://play.picoctf.org/playlists/18?m=146)

---

### 📌 Challenge Overview

- **Name:** Obedient Cat  
- **Difficulty:** Easy  
- **Category:** General Skills  
- **Author:** syreal

---

## 📝 Description

> *This file has a flag in plain sight (aka "in-the-clear"). Download flag.*

You're given a file that contains the flag: no obfuscation, no tricks: it's just there, visible as plaintext. Your task is simply to retrieve and display the contents of the file using basic command-line tools.

---

## 💡 Hints

1. Commands you should type into the Terminal will be prefixed with a `$`. Only copy what's after the dollar sign.
2. To download the file: <br>
   ```
   $ wget https://mercury.picoctf.net/static/704f877da185904ec3992e7255a15c6c/flag
   ```
4. You might find this command useful: <br>
   ```
   $ man cat
   ```

---
   
## 🛠️ Solution

### 🔹Step 1: Open Your Terminal    
Open the terminal on your operating system (Windows, Linux, macOS, or use the shell in your CTF platform).

---

### 🔹Step 2: Copy the Download Link  
Use the following link provided in the challenge to download the file: <br>
https://mercury.picoctf.net/static/704f877da185904ec3992e7255a15c6c/flag

---

### 🔹Step 3: Download the File  
In the terminal, type the following command to download the file:
```  
wget https://mercury.picoctf.net/static/704f877da185904ec3992e7255a15c6c/flag
```

---

### 🔹Step 4: Read the File  
To view the contents of the file, use the cat command:
```
cat flag
```

This will display the contents of the file, which includes the flag for the challenge: <br>
``` "picoCTF{s4n1ty_v3r1f13d_1a94e0f9}" ```

---

## 🧠 What I have Learned
* How to use `wget` to download files from a URL
* How to use `cat` to view file contents in the terminal
