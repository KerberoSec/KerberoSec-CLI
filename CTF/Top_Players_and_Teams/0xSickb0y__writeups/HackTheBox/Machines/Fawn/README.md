# Fawn

> https://app.hackthebox.com/starting-point?tier=0

![CAPA](https://github.com/user-attachments/assets/09a5e6d9-5fae-4d61-9ee6-eb0a5751a5d2)

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [FTP Access](#ftp-access)
* [Conclusion](#conclusion)

## About

Fawn was a beginner-level UNIX machine that served as an introduction to the FTP protocol. The challenge centered on identifying an exposed FTP service with anonymous login enabled and retrieving a flag file from the public directory.

The File Transfer Protocol (FTP) is a standard network protocol used for transferring files between a client and server. By default, it transmits data in plaintext, including credentials, making it insecure for modern environments unless replaced or secured by alternatives such as SFTP or FTPS.

## References

* [FTP Protocol](https://en.wikipedia.org/wiki/File_Transfer_Protocol)
* [SFTP Protocol](https://www.geeksforgeeks.org/sftp-file-transfer-protocol/)

## Reconnaissance

The port scan revealed that the target was running an FTP service on port 21, specifically vsftpd version 3.0.3. OS detection identified the host as a UNIX system.

Nmap's default scripts indicated that anonymous login was enabled and listed a file named `flag.txt` in the FTP directory.

![image](https://github.com/user-attachments/assets/a90a6186-ad10-47fa-abc5-6dbfdddad349)

## FTP Access

Using anonymous authentication, a connection was established to the FTP service. The file `flag.txt` was accessible and successfully downloaded, completing the objective for this box.

![image-1](https://github.com/user-attachments/assets/8051976e-b2dc-4f1a-b162-88080ec5001a)

## Conclusion

Fawn demonstrated a common misconfiguration where anonymous FTP access is left enabled, exposing internal files to the public. While simple, the challenge emphasized the importance of disabling insecure or unnecessary services, especially in externally exposed environments.
