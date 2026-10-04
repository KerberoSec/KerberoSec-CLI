# Protocols and Servers

### Telnet

Remote admin tool, data is sent in cleartext. Usually on port 23, can be used to 
connect to other services for banner grabbing.

### HTTP

HyperText Transfer Protocol, cleartext communication. Service usually accessible on port 80.

Use `telnet <TARGET-IP> <HTTP-PORT>` to connect with telnet and communitcate with the 
server. Use `GET / HTTP/1.1` followed by `host: telnet` and hit enter twice to send the get 
request for the root page to the server. `host:` can be anything but it must be populated 
and the path can change to refelect differnet pages of the web server. 

### FTP
 
File Transfer Protocol, cleartext communication. Service usually accessible on port 21.

Use `telnet <TARGET-IP> <FTP-PORT>` to connect, providing `USER` and `PASS` if required.
To use file transfer connect with `ftp <TARGET-IP> <FTP-PORT>`.

### SMTP

Simple Mail Transfer Protocol, cleartext communication. Usually on port 25, SMTP is used to 
communicate with Mail Transfer Agent (MTA) servers.

Access with `telnet <TARGET-IP> <SMTP-PORT>`, enter `helo telnet`, `mail from:`, `rcpt to`,
`data` then `Enter . Enter` when finished to send.

### POP3

Post Office Protocol version 3, cleartext communication. Service usually on port 110, POP3
is used to download the email messages from the Mail Delivery Agent (MDA) server. The mail 
client (MUA) connects to the POP3 server (MDA) and authenticates, then downloads the new 
messages.

Use `telnet <TARGET-IP> <POP3-PORT>`, enter `USER` and `PASS` then `STAT`, [RFC 1939](https://datatracker.ietf.org/doc/html/rfc1939), to get a response of the number of emails in the 
inbox and the size of the inbox in bytes. `LIST` provides a list of new messages on the 
server and `RETR 1` retrieves the first email in the list.

### IMAP

Internet Message Access Protocol, cleartext communication. Service usually on port 143, IMAP
is more sophisticated then POP3, allowing synchronization of email across multiple devices.

Use `telnet <TARGET-IP> <IMAP-PORT>`, enter `<RANDOM-STRING> LOGIN <USERNAME> <PASSWORD>`
(IMAP requires commands be preceded by a random string for ID purposes). List mail folders 
with `LIST "" "*"`, then check inbox with `EXAMINE INBOX`.
