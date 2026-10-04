# Fawn
### Task 1
- What does the 3-letter acronym FTP stand for?
```
File Transfer Protocol
```
### Task 2
- What communication model does FTP use, architecturally speaking?
```
Client-Server Model
```
### Task 3
- What is the name of one popular GUI FTP program?
```
Filezilla
```
### Task 4
- Which port is the FTP service active on usually?
```
21 TCP
```
### Task 5
- What acronym is used for the secure version of FTP?
```
SFTP
```
### Task 6
- What is the command we can use to test our connection to the target?
```
ping
```
### Task 7
- From your scans, what version is FTP running on the target?
```
vsftpd 3.0.3
```
### SUBMIT FLAG
```
root# nmap -v -A 10.129.245.251
root# ftp 10.129.245.251
the password is Anonymous
root# get flag.txt
root# cat flag.txt
```
