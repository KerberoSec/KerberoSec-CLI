# 🔐 Network Services & Common Ports

A quick reference guide to **common network services, ports, protocols, encryption, and secure alternatives**.

---

## 📡 Common Network Services

| 🔧 Service     |              🔢 Port | 📝 Description                                                                                                             |
| -------------- | -------------------: | -------------------------------------------------------------------------------------------------------------------------- |
| 📁 **FTP**     |                 `21` | File Transfer Protocol. Transfers files in **cleartext** by default.                                                       |
| 🔐 **SFTP**    |                 `22` | SSH File Transfer Protocol. Encrypts the entire connection using **SSH**.                                                  |
| 🔒 **FTPS**    |         `990` / `21` | FTP secured with **TLS encryption**. `990` is commonly used for implicit TLS; `21` can be used with explicit TLS/STARTTLS. |
| 📧 **SMTP**    | `25` / `465` / `587` | Simple Mail Transfer Protocol used for sending email. Encryption and authentication depend on the port and configuration.  |
| 📥 **POP3**    |        `110` / `995` | Post Office Protocol v3 used to retrieve email.                                                                            |
| 📬 **IMAP**    |        `143` / `993` | Internet Message Access Protocol used to access and synchronize email.                                                     |
| 🌐 **HTTP**    |                 `80` | Hypertext Transfer Protocol. Web traffic is normally transmitted in **cleartext**.                                         |
| 🌐🔒 **HTTPS** |                `443` | HTTP secured using **TLS encryption**.                                                                                     |
| 💻 **Telnet**  |                 `23` | Remote access protocol. Transmits data, including credentials, in **cleartext**.                                           |
| 🔑 **SSH**     |                 `22` | Secure remote administration and encrypted communications.                                                                 |

---

## 📁 FTP, SFTP & FTPS

### 📂 FTP: File Transfer Protocol

**Port:** `21`

FTP transfers data without encryption by default.

> ⚠️ **Security:** Credentials and transferred data can potentially be intercepted.

### 🔐 SFTP: SSH File Transfer Protocol

**Port:** `22`

SFTP operates over **SSH** and encrypts the connection.

**Security:** 🟢 Encrypted

> ✅ SFTP is generally preferred over traditional FTP when secure file transfer is required.

### 🔒 FTPS: FTP Secure

**Ports:**

* `990`: Implicit TLS
* `21`: Explicit TLS / STARTTLS

FTPS adds **TLS encryption** to the FTP protocol.

**Security:** 🟢 Encrypted

> ℹ️ FTPS and SFTP are different protocols. FTPS is FTP secured with TLS, while SFTP operates over SSH.

---

# 📧 SMTP: Simple Mail Transfer Protocol

SMTP is primarily used for **sending email**.

|  Port | 🔐 Security       | 📌 Purpose                                                                       |
| ----: | ----------------- | -------------------------------------------------------------------------------- |
|  `25` | Optional STARTTLS | Server-to-server email communication (**MTA → MTA**)                             |
| `587` | STARTTLS          | Email submission (**MUA → MSA**). Recommended for authenticated email submission |
| `465` | Implicit TLS      | SMTP over TLS. TLS encryption starts immediately                                 |

### Port `25`

Port `25` is traditionally used for **server-to-server SMTP communication**.

* Primarily MTA → MTA
* Encryption can be negotiated using `STARTTLS`
* Often blocked/restricted for residential connections to reduce spam

⚠️ **Security:** Depends on whether STARTTLS is successfully negotiated.

### Port `587`: Submission

Port `587` is commonly used by email clients to submit messages to their mail server.

* Intended for **mail submission**
* Typically requires authentication
* TLS is commonly negotiated using `STARTTLS`

✅ **Recommended for normal authenticated email submission.**

### Port `465`: SMTPS

Port `465` uses **implicit TLS**.

The TLS connection is established immediately when the client connects.

🔒 **Security:** Encrypted from the beginning.

---

# 📥 POP3: Post Office Protocol v3

POP3 is used to retrieve email from a mail server.

|  Port | 🔐 Security             | Description   |
| ----: | ----------------------- | ------------- |
| `110` | ⚠️ Cleartext / STARTTLS | Standard POP3 |
| `995` | 🟢 Implicit TLS         | POP3S         |

### Port `110`

The default POP3 port.

* Communication is initially unencrypted
* Some servers support upgrading the connection using `STLS`

⚠️ **Security:** Potentially cleartext unless TLS is negotiated.

### Port `995`

Used for **POP3S**.

TLS encryption begins immediately when the connection is established.

🔒 **Security:** Encrypted

---

# 📬 IMAP: Internet Message Access Protocol

IMAP allows users to access and synchronize email stored on a mail server.

|  Port | 🔐 Security             | Description   |
| ----: | ----------------------- | ------------- |
| `143` | ⚠️ Cleartext / STARTTLS | Standard IMAP |
| `993` | 🟢 Implicit TLS         | IMAPS         |

### Port `143`

Default IMAP port.

Many servers support upgrading the connection using `STARTTLS`.

⚠️ **Security:** Depends on TLS negotiation.

### Port `993`

Used for **IMAPS**.

TLS encryption begins immediately when the connection is established.

🔒 **Security:** Encrypted

---

# 🌐 HTTP & HTTPS

| Protocol |  Port | 🔐 Security      | Secure Alternative |
| -------- | ----: | ---------------- | ------------------ |
| 🌐 HTTP  |  `80` | 🔴 Cleartext     | HTTPS              |
| 🔒 HTTPS | `443` | 🟢 TLS Encrypted |: |

### HTTP: Port `80`

HTTP normally transmits web traffic without encryption.

⚠️ Sensitive information such as credentials should not be transmitted over plain HTTP.

### HTTPS: Port `443`

HTTPS uses **TLS** to protect HTTP communications.

🔒 Provides:

* Confidentiality
* Integrity
* Server authentication

---

# 💻 Telnet vs SSH

| Protocol  | Port | 🔐 Security  | Recommended? |
| --------- | ---: | ------------ | ------------ |
| ⚠️ Telnet | `23` | 🔴 Cleartext | ❌ No         |
| 🔐 SSH    | `22` | 🟢 Encrypted | ✅ Yes        |

### Telnet: Port `23`

Telnet provides remote terminal access but does **not encrypt traffic**.

Credentials and commands can potentially be intercepted.

### SSH: Port `22`

SSH provides encrypted remote access.

Common uses include:

* 🖥️ Remote administration
* 📁 Secure file transfer
* 🔑 Secure authentication
* 🔀 Port forwarding/tunnelling

---

# 🛡️ Cleartext vs Secure Protocols

| Protocol      | TCP Port | Application    | 🔐 Data Security | 🔒 Secure Alternative |   Secure Port |
| ------------- | -------: | -------------- | ---------------- | --------------------- | ------------: |
| 📁 **FTP**    |     `21` | File Transfer  | 🔴 Cleartext     | FTPS / SFTP           |  `990` / `22` |
| 🌐 **HTTP**   |     `80` | World Wide Web | 🔴 Cleartext     | HTTPS                 |         `443` |
| 📬 **IMAP**   |    `143` | Email          | 🔴 Cleartext*    | IMAPS                 |         `993` |
| 📥 **POP3**   |    `110` | Email          | 🔴 Cleartext*    | POP3S                 |         `995` |
| 📧 **SMTP**   |     `25` | Email          | 🔴 Cleartext*    | SMTPS / STARTTLS      | `465` / `587` |
| 💻 **Telnet** |     `23` | Remote Access  | 🔴 Cleartext     | SSH                   |          `22` |
| 🔐 **SSH**    |     `22` | Remote Access  | 🟢 Encrypted     |: |          `22` |
| 🔒 **HTTPS**  |    `443` | World Wide Web | 🟢 TLS Encrypted |: |         `443` |
| 🔐 **SFTP**   |     `22` | File Transfer  | 🟢 SSH Encrypted |: |          `22` |

> ***** IMAP, POP3, and SMTP can support TLS upgrades such as `STARTTLS`; the security depends on server/client configuration and successful TLS negotiation.

---

# 🧠 Quick Memory Guide

```text
┌─────────────────────────────────────────────┐
│           COMMON NETWORK PORTS              │
├─────────────────────────────────────────────┤
│ FTP       → 21                              │
│ SSH/SFTP  → 22                              │
│ Telnet    → 23                              │
│ SMTP      → 25 / 465 / 587                  │
│ DNS       → 53                              │
│ HTTP      → 80                              │
│ POP3      → 110 / 995                       │
│ IMAP      → 143 / 993                       │
│ HTTPS     → 443                             │
└─────────────────────────────────────────────┘
```

## ⚡ Most Important Ports to Remember

| 🔢 Port | 🔧 Service      | 🧠 Remember                    |
| ------: | --------------- | ------------------------------ |
|    `21` | FTP             | File Transfer                  |
|    `22` | SSH / SFTP      | Secure Remote Access           |
|    `23` | Telnet          | Insecure Remote Access         |
|    `25` | SMTP            | Mail Server-to-Server          |
|    `53` | DNS             | Domain Name Resolution         |
|    `80` | HTTP            | Web                            |
|   `110` | POP3            | Email Retrieval                |
|   `143` | IMAP            | Email Access                   |
|   `443` | HTTPS           | Secure Web                     |
|   `465` | SMTPS           | SMTP + Implicit TLS            |
|   `587` | SMTP Submission | Authenticated Email Submission |
|   `993` | IMAPS           | Secure IMAP                    |
|   `995` | POP3S           | Secure POP3                    |

---

## 🔐 Security Rule of Thumb

> **If a protocol sends credentials or sensitive data in cleartext, look for its encrypted alternative.**

```text
❌ FTP       → ✅ SFTP / FTPS
❌ HTTP      → ✅ HTTPS
❌ Telnet    → ✅ SSH
❌ POP3      → ✅ POP3S
❌ IMAP      → ✅ IMAPS
❌ SMTP      → ✅ SMTP + STARTTLS / SMTPS
```

---

### 📚 Related Topics

* 🔐 TCP/IP Networking
* 🌐 Network Protocols
* 🛡️ Network Security
* 🔑 Authentication & Encryption
* 📡 OSI Model
* 🕵️ Network Reconnaissance
* 🔎 Nmap Port Scanning
