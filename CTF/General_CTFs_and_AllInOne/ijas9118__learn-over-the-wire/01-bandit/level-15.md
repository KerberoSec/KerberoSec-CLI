# Bandit Level 15 → Level 16

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-15-blue?style=flat-square)

The password for Level 16 is retrieved by submitting the current password to port **30001** on **localhost** using **SSL/TLS encryption**.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl15) ssh bandit15@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Connecting via SSL/TLS
Unlike the previous level, standard Netcat (`nc`) cannot communicate with encrypted ports. Use the OpenSSL **`s_client`** utility to establish a secure connection.

```bash
# Connect to the local SSL/TLS service
openssl s_client -connect localhost:30001
```

#### 2. Ignoring Certificate Warnings
Upon connection, you will see details about the server's certificate. Because it's a self-signed ("SnakeOil") certificate, you'll receive a `verify error`. This is normal for this level; you are still connected.

#### 3. Submitting the Current Password
Once the handshake is complete and you see `---` (end of connection details), paste your Level 15 password and press `Enter`.

```text
8xCjnmgo... (your current level 15 password)
```

#### 4. Receiving the Password
The server will validate your input and respond with the password for Level 16.

```text
Correct!
kSkvUpMQ... (this is the password for level 16)
```

#### 5. Exiting and Storing
Read the output password, exit the session, and save your progress.

```bash
# Force exit if the connection stays open (Ctrl+C)
exit

# Save the password for Level 16
echo "PASSWORD" > passwords/bandit/lvl16
```

### Understanding OpenSSL `s_client`

OpenSSL is the industry standard for handling SSL/TLS protocols. The `s_client` command specifically allows you to test or interact with remote servers that require an encrypted handshake before sending data.

#### Key Concepts:
*   **Encrypted Handshake**: Unlike Netcat where data flows in plain text immediately, `s_client` negotiates a secure key exchange first.
*   **Self-Signed Certificates**: Errors like `num=18:self-signed certificate` mean the server's identity hasn't been verified by a trusted authority (like Let's Encrypt).
*   **Interactive Stream**: Once the handshake is finished, you can type directly into the encrypted stream just like you would with Netcat.

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `openssl` | `s_client` | A toolkit for TLS/SSL. `s_client` acts as a generic client for encrypted connections. |
| `-connect` | `host:port` | **Switch**: Specifies the target address and port for the connection. |

> [!IMPORTANT]
> Standard Netcat (`nc`) is "blind" to encryption. If you try to use it on port 30001, the server will send raw encrypted binary that your terminal cannot parse.

> [!TIP]
> If you get stuck on protocol control messages (like `RENEGOTIATING`), remember that the server is still listening. Just paste your password and hit enter once.

> [!CAUTION]
> If you see `Verify return code: 18`, you are still connected. The connection is secure from eavesdropping, even if the certificate is unverified.
