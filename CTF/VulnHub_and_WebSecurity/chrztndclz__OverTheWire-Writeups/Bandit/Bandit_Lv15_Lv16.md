
##  Level 15 to Level 16

Tags:
#Bandit 

---

## Level Goal

The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL/TLS encryption.

Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.

---

## Commands

Commands you may need to solve this level

ssh, telnet, nc, ncat, socat, openssl, s_client, nmap, netstat, ss

---

## Tips

Helpful Reading Material

[Secure Socket Layer/Transport Layer Security on Wikipedia](https://en.wikipedia.org/wiki/Transport_Layer_Security)
[OpenSSL Cookbook: Testing with OpenSSL](https://www.feistyduck.com/library/openssl-cookbook/online/testing-with-openssl/index.html)

---

## Analysis

This level is similar to the previous one but adds a key difference: the service listening on **port 30001** uses **SSL/TLS encryption**. A normal `nc` connection won’t work because the server expects encrypted communication. This level teaches how to establish secure socket connections using `openssl s_client`, which acts like an SSL/TLS-capable netcat.

---

## Methodology
**Step 1:** Make sure you are logged in as bandit15 and know the password from Level 15.

**Step 2:** Connect to port 30001 using OpenSSL:

openssl s_client -connect localhost:30001

<img width="778" height="386" alt="image" src="https://github.com/user-attachments/assets/8decda84-ea0a-479c-90a9-26312c4e3b83" />

**Step 3:** When the SSL connection is established, paste the password from Level 15 and press **Enter**.

<img width="526" height="197" alt="image" src="https://github.com/user-attachments/assets/fffc3ae8-673b-4d37-9f4d-4213bf01b368" />

**Step 4:** Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit16@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

kSk---------0Dx

---

## Reflection

This challenge demonstrated how secure connections differ from plain TCP and introduced practical use of `openssl s_client` for testing SSL/TLS services. Understanding encrypted sockets is essential for debugging secure applications and performing security assessments.

---

