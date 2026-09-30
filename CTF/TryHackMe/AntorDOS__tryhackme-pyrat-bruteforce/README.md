# TryHackMe Pyrat: Command & Password Bruteforce Scripts

This repository contains my custom Python scripts used while solving the Pyrat machine on TryHackMe.

The goal was to interact with a custom socket service and brute force hidden commands and admin credentials.

---

## 📌 Target Information

* Platform: TryHackMe
* Machine: Pyrat
* Service Port: 8000
* Protocol: TCP Socket

---

## ⚡ Command Bruteforce

The service returns an error when an unknown command is used:

```
name 'COMMAND' is not defined
```

The script sends commands from a wordlist and detects valid commands when the response changes.

Example usage:

```
python3 cmd-brute.py
./cmd-brute.py
```
Edit This Script Wordlists to /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt

---

## 🔑 Password Bruteforce

After discovering the  command, the service asks for a password.

The script sends passwords from a wordlist and detects a successful login when the response differs from the normal error message.

Example usage:

```
python3 pswd-brute.py
./pswd-brute.py
```
Edit This Script Wordlists to /usr/share/wordlists/rockyou.txt

---

## ⚠️ Disclaimer

These scripts were created **only for educational purposes** while solving a legal CTF challenge on TryHackMe.

Do not use them against systems without permission.

---

## 👨‍💻 Author

Jahid Hasan
