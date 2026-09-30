
##  Level 13: Level 14

Tags:
#Bandit 

---

## Level Goal

The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Look at the commands that logged you into previous bandit levels, and find out how to use the key for this level.

---

## Commands

Commands you may need to solve this level

ssh, scp, umask, chmod, cat, nc, install

---

## Tips

Helpful Reading Material

[SSH/OpenSSH/Keys](https://help.ubuntu.com/community/SSH/OpenSSH/Keys)

---

## Analysis

This level focuses on using an SSH private key for authentication instead of a password. The challenge is simply to correctly apply the private key to log in as **bandit14**, then read the password file once inside. It reinforces how SSH keys replace password-based login and highlights the need for correct file permissions before using a private key.

---

## Methodology
**Step 1:** From bandit13’s home directory, locate the private key file `sshkey.private`.

**Step 2:** Access the private key using strings command
`strings sshkey.private`

<img width="660" height="600" alt="image" src="https://github.com/user-attachments/assets/64e6fa15-788e-41ed-ab5c-956e0bacf030" />

**Step 3:** Copy the key to your local machine
scp -P 2220 bandit13@bandit.labs.overthewire.org:~/sshkey.private .

**Step 4:** Set proper key permissions locally
chmod 600 sshkey.private

**Step 5:** Loggin using the sshkey.private file using this command: 
ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220

**Step 6:** Once log in, run this command to gain the password 
cat /etc/bandit_pass/bandit14

Step 6: Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit14@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

MU4---------vS

---

## Reflection

This level provided a quick but meaningful introduction to key-based SSH access. It strengthened understanding of how private keys work, why permissions matter, and how secure authentication is handled in real systems

---

