
##  Level 14 to Level 15

Tags:
#Bandit 

---

## Level Goal

The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost.

---

## Commands

Commands you may need to solve this level

ssh, telnet, nc, openssl, s_client, nmap

---

## Tips

Helpful Reading Material

[How the Internet works in 5 minutes (YouTube) (Not completely accurate, but good enough for beginners)](https://www.youtube.com/watch?v=7_LPdttKXPc)
[IP Addresses](https://computer.howstuffworks.com/web-server5.htm)
[IP Address on Wikipedia](https://en.wikipedia.org/wiki/IP_address)
[Localhost on Wikipedia](https://en.wikipedia.org/wiki/Localhost)
[Ports](https://computer.howstuffworks.com/web-server8.htm)
[Port (computer networking) on Wikipedia](https://en.wikipedia.org/wiki/Port_(computer_networking))

---

## Analysis

This level introduces basic network communication over TCP ports. The Bandit server is listening on **port 30000** on `localhost`, and the challenge is to submit the **current level’s password** to this port. The level teaches the use of tools like `nc` (netcat) or `telnet` to interact with network services, reinforcing the concepts of ports, sockets, and how clients can send/receive data from servers.

---

## Methodology
**Step 1:** Make sure you are logged in as bandit14 and know the password from Level 14.

**Step 2:** Connect to localhost on port 30000 using netcat:

echo "MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS" | nc localhost 30000

- `echo "<password>"` sends the password to the port
- `nc localhost 30000` connects to the service listening on that port

<img width="796" height="47" alt="image" src="https://github.com/user-attachments/assets/1c8072f1-367a-4f5f-8f18-ab777de0830d" />

**Step 3:** Copy the password and log in to the next level

Use SSH again, replacing the username with the next level:

ssh bandit15@bandit.labs.overthewire.org -p 2220

When asked, paste the password you found.

---

## Password

8xC--------JQo

---

## Reflection

This level reinforced the basics of TCP communication and how services listen on specific ports. It also demonstrated practical use of tools like `nc` to interact with a network service, which is a fundamental skill in networking and penetration testing. Understanding how to send and receive data over a socket is key for both CTF challenges and real-world network troubleshooting.

---

