<!-- TOC -->

- [Protocols and Servers](#protocols-and-servers)
    - [Sniffing Attack](#sniffing-attack)
    - [Man-in-the-Middle MITM Attack](#man-in-the-middle-mitm-attack)
    - [Transport Layer Security TLS](#transport-layer-security-tls)
    - [Password Attack](#password-attack)

<!-- /TOC -->

# Protocols and Servers

[Protocols and Servers Room](https://tryhackme.com/room/protocolsandservers)

[Protocols and Servers 2 Room](https://tryhackme.com/room/protocolsandservers2)

Learn about common protocols such as HTTP, FTP, POP3, SMTP and IMAP, along with related insecurities.

| Protocol | TCP Port | Application(s) | Data Security |
| :----: | :----: | :----: | :----: |
| FTP | 21 | File Transfer | Cleartext |
| HTTP | 80 | Worldwide Web | Cleartext |
| IMAP | 143 | Email (MDA) | Cleartext |
| POP3 | 110 | Email (MDA) | Cleartext |
| SMTP | 25 | Email (MTA) | Cleartext |
| Telnet | 23 | Remote Access | Cleartext |

## Sniffing Attack

- `tcpdump` is a free open source command-line interface (CLI) program that has been ported to work on many operating systems.
- **Wireshark** is a free open source graphical user interface (GUI) program available for several operating systems, including Linux, macOS and MS Windows.
- `tshark` is a CLI alternative to Wireshark.

## Man-in-the-Middle (MITM) Attack

- [Ettercap](https://www.ettercap-project.org/)
- [Bettercap](https://www.bettercap.org/)

## Transport Layer Security (TLS)

| Protocol | Default Port | Secured Protocol | Default Port with TLS |
| :----: | :----: | :----: | :----: |
| HTTP | 80 | HTTPS | 443 |
| FTP | 21 | FTPS | 990 |
| SMTP | 25 | SMTPS | 465 |
| POP3 | 110 | POP3S | 995 |
| IMAP | 143 | IMAPS | 993 |

## Password Attack

- [THC Hydra](https://github.com/vanhauser-thc/thc-hydra)

Syntax:

```bash
hydra -l <username> -P <wordlist.txt> <server> <service>
```

| Option | Explanation |
| :----: | :----: |
| `-l <username>` | Provide the login name |
| `-P <WordList.txt>` | Specify the password list to use |
| `<server> <service>` | Set the server address and service to attack |
| `-s <PORT>` | Use in case of non-default service port number |
| `-V` or `-vV` | Show the username and password combinations being tried |
| `-d` | Display debugging output if the verbose output is not helping |
| `-t <num>` | Number of parallel connections to the target |

Mitigation against such attacks can be sophisticated and depends on the target system. A few of the approaches include:

- Password Policy: Enforces minimum complexity constraints on the passwords set by the user.
- Account Lockout: Locks the account after a certain number of failed attempts.
- Throttling Authentication Attempts: Delays the response to a login attempt. A couple of seconds of delay is tolerable for someone who knows the password, but they can severely hinder automated tools.
- Using CAPTCHA: Requires solving a question difficult for machines. It works well if the login page is via a graphical user interface (GUI). (Note that CAPTCHA stands for Completely Automated Public Turing test to tell Computers and Humans Apart.)
- Requiring the use of a public certificate for authentication. This approach works well with SSH, for instance.
- Two-Factor Authentication: Ask the user to provide a code available via other means, such as email, smartphone app or SMS.
- There are many other approaches that are more sophisticated or might require some established knowledge about the user, such as IP-based geolocation.
