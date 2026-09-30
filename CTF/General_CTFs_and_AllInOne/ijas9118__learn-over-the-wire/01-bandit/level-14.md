# Bandit Level 14 → Level 15

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-14-blue?style=flat-square)

The password for Level 15 can be retrieved by submitting the password of the current level to port **30000** on **localhost**.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl14) ssh bandit14@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Connecting with Netcat
To communicate with a listener on a specific port, use `nc` (Netcat).

```bash
# Connect to the local service on port 30000
nc localhost 30000
```

#### 2. Submitting the Current Password
Once the connection is established, the server waits for your input. Paste your Level 14 password and hit `Enter`.

```text
MU4VWe... (your current level 14 password)
```

#### 3. Receiving the Clue
If the submitted password is correct, the server will reply with the password for Level 15.

```text
Correct!
8xCjnmgo... (this is the password for level 15)
```

#### 4. Exiting and Storing
Read the output, press `Ctrl+C` to close the connection, and save your progress locally.

```bash
exit

# Save the password for Level 15
echo "PASSWORD" > passwords/bandit/lvl15
```

### Understanding Netcat (`nc`)

Often called the **"Swiss Army Knife of Networking,"** Netcat is a command-line utility that reads and writes data across network connections using TCP or UDP. 

#### Why use it?
- **Port Checking**: Verify if a specific port on a server is open.
- **Data Transfer**: Send raw files or data streams between machines.
- **Direct Interaction**: Communicate manually with network services (like HTTP, SMTP, or custom Bandit listeners) by typing directly into the protocol's input stream.
- **Simple Servers**: Easily set up a temporary listener to receive data.

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `nc` | `[host] [port]` | **Netcat**: Opens a TCP connection (by default) to the specified address. |
| `man` | `nc` | Opens the manual page for Netcat with all available switches. |

> [!IMPORTANT]
> **localhost** (127.0.0.1) refers to your own machine. In this level, you are communicating with a process running on the same server you've logged into.

> [!TIP]
> If a service requires an immediate response upon connection, you can pipe your password into netcat directly: `echo "PASSWORD" | nc localhost 30000`.

> [!CAUTION]
> Netcat transmits data in **plain text**. It is not intended for secure communications unless used within an encrypted tunnel like SSH.
