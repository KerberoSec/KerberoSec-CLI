# Anonforce Write-up: Easy

## Nmap

```
nmap -sV -sC <ip> -p-
```

Open ports:
- ftp: 21. vsftpd 3.0.3, anonymous login allowed
- ssh: 22. OpenSSH 7.2p2 Ubuntu

## FTP: Anonymous login

```
ftp <ip>
```

Looking around on the filesystem, I found the first flag in Melodias's home directory.

There was also the unusual directory **/notread** where I found 2 interesting files:
- *backup.pgp*
- *private.asc*

The former is a backup file and the latter is a private pgp key which can be used to decrypt it. But it appears the key also requires a passphrase, so we need to crack it.

## GPG & hash crack

```
gpg2john private.asc > johnkey
john --wordlist=rockyou.txt johnkey
```
This quickly cracked the passphrase **xbox360**.

Now we can import the key and decrypt the backup file!
```
gpg --import private.asc
gpg -d backup.pgp
```

This revealed a backup of /etc/shadow with some password hashes for root and melodias. Using hash-identifier, I can see root's is a SHA-256 hash, so let's crack that too.

```
john --wordlist=rockyou.txt hash
```

Which gave us the final credentials **root : REDACTED**. This allowed us to ssh onto the system as the root user and collect the final flag :)
