# 🔐 (Problem Set 2) "what's a net cat?" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **6/8/2026**

<img width="641" height="196" alt="Screenshot 2026-06-08 205023" src="https://github.com/user-attachments/assets/c88b0c7c-ae26-4ec0-8d99-a6361ef32868" />

---
### 💡 Solution:

First, we are given a "launch instance" button. Click it.

> What is an instance? A challenge instance is just a private copy started just for you to work on.

Once you started the instance, you should get something like this: 
`Using netcat (nc) is going to be pretty important. Can you connect to fickle-tempest.picoctf.net at port 60684 to get the flag?`

So what is netcat? 

Netcat is a powerful command-line utility used for creating TCP/UDP connections, sending data, receiving data, and act as a simple client or server.

> It's essentially a very simple network communication tool.

Many CTF challenges run a custom program on a server. Instead of visiting a website, you're expected to connect directly to the service.

The netcat command is: `nc [hostname] [port]`

EX: `nc [hostname] [port]`

> `example.com` is the host name.
> `1234` is the port number.

1. Resolves example.com to an IP address.
2. Opens a TCP connection to port 1234.
3. Displays anything the server sends.
4. Sends anything you type back to the server.

For this case, we have (for me, yours would be different) the hostname: `fickle-tempest.picoctf.net` and the port number: `60684`

<img width="500" height="100" alt="Screenshot 2026-06-08 205638" src="https://github.com/user-attachments/assets/5d9d4d33-fd9b-4509-8d3c-5fcc81d45d04" />

After doing the netcat command (to connect to the service) above, press ENTER.

<img width="500" height="100" alt="Screenshot 2026-06-08 205710" src="https://github.com/user-attachments/assets/d1e8ec39-c2c6-4887-96f8-8c2ead40f753" />

Once connected to the service, we are given the flag! 

> Basically after connecting to the server using `nc [hostname] [port]`, your computer performs a TCP handshake (The "Transmission Control Protocol" three-way handshake is the fundamental process used to establish a reliable, connection-oriented session between a client and a server before any actual data is transferred. It ensures that both devices are synchronized and ready to communicate) with the ctf service. After that handshake succeeds, the connection is established and data can flow in both directions. 

So the **final flag** (for me) is: `picoCTF{nEtCat_Mast3ry_aC66D475}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.
