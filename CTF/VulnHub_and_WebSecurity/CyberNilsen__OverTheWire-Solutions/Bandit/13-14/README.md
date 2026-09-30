# 🔐 Bandit Level 13 → Level 14

## 🎯 Goal

The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Note: localhost is a hostname that refers to the machine you are working on.

---

## 🧪 Steps Taken

1. **List the files in the home directory**

```bash
bandit13@bandit:~$ ls
sshkey.private
```

2. **Copy the private key to your local machine**

Open the file with `cat sshkey.private`, copy its contents, and paste it into a new file on your own computer (e.g., `bandit14.private`).

3. **Set proper permissions on your local machine**

```bash
chmod 600 bandit14.private
```

4. **Log in to Bandit14 using the private key**

```bash
ssh -i bandit14.private bandit14@bandit.labs.overthewire.org -p 2220
```

✅ This successfully logs you into the next level.
