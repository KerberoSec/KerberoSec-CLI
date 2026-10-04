# Anonymous

Ports:
21/tcp FTP vsftpd v3.0.3
22/tcp ssh OpenSSH 7.6p1
139/tcp open  netbios-ssn Samba smbd 3.X: 4.X
445/tcp open  netbios-p   Samba smbd 4.7.6-Ubuntu

### Enumeration

**FTP**

anonymous file access, read and write. `backup.sh` performs regular clean up of temp files allowing rce

**SMB**

dog pictures

### Exploitation

replace the echo command with a bash reverse shell and catch with netcat

upload linpeas.sh via ftp and execute to find a binary with SUID bit set

exploit the binary to gain root
