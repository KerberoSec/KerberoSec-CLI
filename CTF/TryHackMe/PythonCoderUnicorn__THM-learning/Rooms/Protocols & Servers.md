- https://tryhackme.com/room/protocolsandservers

#Networking 
## Telnet 

The Telnet protocol is an application layer protocol used to connect to a virtual terminal of another computer. Using Telnet, a user can log into another computer and access its terminal (console) to run programs, start batch processes, and perform system administration tasks remotely.

- `telnet <IP>`
- port 23, `telnetd` Telnet server
- username & password
- access remote system's terminal `name@machine:~$`
- all communication is NOT encrypted
- wireshark captures all data, use SSH instead

## HTTP

Hypertext Transfer Protocol used for web pages

GET `IP/index.html`
response `index.html`
GET `IP/images/logo.jpg`
response `logo.jpg`

all data is not encrypted

using telnet to get a file from web server
- `telnet <IP>`
- `GET /index.html IP/1.1` or use `GET / HTTP/1.1`
- `host: telnet` hit enter 2x

---
- `telnet 10.10.166.117 80`
- `GET /flag.thm`
- ` THM{e3eb0a1df437f3f97a64aca5952c8ea0} `
---

## FTP

File transfer protocol. FTP also sends and receives data as cleartext; therefore, we can use Telnet (or Netcat) to communicate with an FTP server and act as an FTP client

connect to FTP server via telnet client
- `ftp <IP>`
- port 21
- `USER <name>`
- `PASS <passwd>`
- STAT = info
- SYST shows system type
- PASV passive mode (data sent on port 1023) (active mode sends data to port 20)
- TYPE A  for ascii mode
- TYPE I for binary
- QUIT

FTP to download a text file
- signed in you see `ftp>`
- `ls`
- `ascii`
- `get FILENAME `
- exit 

FTP is not secure but FileZilla , vsftpd. uFTP software exists

---
- `ftp 10.10.166.117`
- `frank`
- `D2xc9CgD`
- `ls`
- `ascii`
- `get ftp_flag.thm`
- exit
- ls
- `cat ftp_flag.thm`
- ` THM{364db6ad0e3ddfe7bf0b1870fb06fbdf} `
---

## SMTP

Simple Mail Transfer Protocol, email on the internet. 

Email over the internet requires:
- mail submission agent (MSA)
- mail transfer agent (MTA)
- mail delivery agent (MDA)
- mail user agent (MUA)

MUA {computer} --> MSA {server} --> MTA {cloud} --> MTA/MDA {server} --> MUA {computer}

1. you (MUA) send postal mail
2. post office worker (MSA) checks the mail for any issues before local post office (MTA) accepts it
3. local post office checks the mail destination & sends it to other post office 
4. other post office delivers mail to recipient mailbox (MDA)
5. the recipient (MUA) gets notified about mail

to talk to MTA and MDA need protocols
- SMTP
- post office protocol version 3 (POP3) or Internet Message Access Protocol (IMAP)

SMTP is not encrypted
- port 25
- can use telnet

`telnet 10.10.166.117 25`
`helo hostname`
`mail from: `
`rcpt to: `
`data` then type message
`.`
`quit`

- ` THM{5b31ddfc0c11d81eba776e983c35e9b5} `

## POP3 

Post Office Protocol version 3 (POP3) is a protocol used to download the email messages from a Mail Delivery Agent (MDA) server.

The mail client connects to the POP3 server, authenticates, downloads the new email messages before (optionally) deleting them.

MUA > SMTP > MSA/MTA > SMTP {cloud} > MDA > POP3 | IMAP > MUA

- port 110 `telnet 10.10.166.117 110`
- USER frank
- `PASS D2xc9CgD`
- STAT   > `+OK 1 179`
- LIST lists new message
- `RETR 1` gets 1st message in list

- `+ok 0 0 `
- `0`
- quit

## IMAP

Internet Message Access Protocol (IMAP) is more sophisticated than POP3. IMAP makes it possible to keep your email synchronized across multiple devices (and mail clients).

- `telnet 10.10.166.117 143`
- `LOGIN username password`
- IMAP needs som random string to keep track of changes
- `LIST "" "*" `
- `EXAMINE INBOX`
- `LOGOUT`
- 

