# **Operation Orchid: 400 pts**

### Key points

- Disk images
- Shell history

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Download this disk image, find the key and log into the remote machine.
> Remote machine: `ssh -i key_file -p 54341 ctf-player@saturn.picoctf.net`

---

## Solution

Get the disk image and extract it:

```console
$ wget https://artifacts.picoctf.net/c/378/disk.img.gz
$ gunzip disk.img.gz
```

Let's see what's inside:

```console
$ fdisk -l disk.img
Disk disk.img: 230 MiB, 241172480 bytes, 471040 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x0b0051d0

Device     Boot  Start    End Sectors  Size Id Type
disk.img1  *      2048 206847  204800  100M 83 Linux
disk.img2       206848 471039  264192  129M 83 Linux
```

The first partition is a boot directory, which is probably not what we want. Let's mount the second one. The offset is 512 \* 206848 = 105906176.

```console
$ sudo mount -o loop,offset=105906176 disk.img ./mnt
$ cd mnt
$ ls -l
total 38
drwxr-xr-x  2 root root  3072 Oct  6 14:28 bin
drwxr-xr-x  2 root root  1024 Oct  6 14:28 boot
drwxr-xr-x  2 root root  1024 Oct  6 14:28 dev
drwxr-xr-x 27 root root  3072 Oct  6 14:29 etc
drwxr-xr-x  2 root root  1024 Oct  6 14:28 home
drwxr-xr-x  9 root root  1024 Oct  6 14:28 lib
drwx------  2 root root 12288 Oct  6 14:28 lost+found
drwxr-xr-x  5 root root  1024 Oct  6 14:28 media
drwxr-xr-x  2 root root  1024 Oct  6 14:28 mnt
drwxr-xr-x  2 root root  1024 Oct  6 14:28 opt
drwxr-xr-x  2 root root  1024 Oct  6 14:28 proc
drwx------  3 root root  1024 Oct  6 14:30 root
drwxr-xr-x  2 root root  1024 Oct  6 14:28 run
drwxr-xr-x  2 root root  5120 Oct  6 14:28 sbin
drwxr-xr-x  2 root root  1024 Oct  6 14:28 srv
drwxr-xr-x  2 root root  1024 Oct  6 14:28 sys
drwxrwxrwt  4 root root  1024 Oct  6 14:29 tmp
drwxr-xr-x  8 root root  1024 Oct  6 14:28 usr
drwxr-xr-x 11 root root  1024 Oct  6 14:29 var
```

`/root` was the last modified folder, so let's check in there. First, we need permissions:

```console
$ sudo chmod 777 root
$ cd root
$ ls

```

...nothing? Surely there must be hidden files then:

```console
$ ls -al
total 4
drwxrwxrwx  3 root root 1024 Oct  6 14:30 .
drwxr-xr-x 21 root root 1024 Oct  6 14:28 ..
-rw-------  1 root root   36 Oct  6 14:31 .ash_history
drwx------  2 root root 1024 Oct  6 14:30 .ssh
```

There is a hidden `.ash_history` file, which contains the history of shell commands. There is also a hidden folder, `.ssh`. Let's see what the user did. Again, we need permissions first.

```console
$ sudo chmod 664 .ash_history
$ cat .ash_history
ssh-keygen -t ed25519
ls .ssh/
halt
```

The generated a key using `ssh-keygen`, then went into the `.ssh/` folder and listed the files in there. Let's see what's in `.ssh/`:

```console
$ sudo chmod 777 .ssh
$ cd .ssh
$ ls -l
total 2
-rw------- 1 root root 411 Oct  6 14:30 id_ed25519
-rw-r--r-- 1 root root  96 Oct  6 14:30 id_ed25519.pub
```

There are two files, a private key and a public key.

```console
$ cat id_ed25519
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBgrXe4bKNhOzkCLWOmk4zDMimW9RVZngX51Y8h3BmKLAAAAJgxpYKDMaWC
gwAAAAtzc2gtZWQyNTUxOQAAACBgrXe4bKNhOzkCLWOmk4zDMimW9RVZngX51Y8h3BmKLA
AAAECItu0F8DIjWxTp+KeMDvX1lQwYtUvP2SfSVOfMOChxYGCtd7hso2E7OQItY6aTjMMy
KZb1FVmeBfnVjyHcGYosAAAADnJvb3RAbG9jYWxob3N0AQIDBAUGBw==
-----END OPENSSH PRIVATE KEY-----
$ cat id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGCtd7hso2E7OQItY6aTjMMyKZb1FVmeBfnVjyHcGYos root@localhost
```

Let's send the private key to the remote machine:

```console
$ ssh -i id_ed25519 -p 54341 ctf-player@saturn.picoctf.net
Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.13.0-1017-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
ctf-player@challenge:~$ ls
flag.txt
ctf-player@challenge:~$ cat flag.txt
picoCTF{k3y_5l3u7h_75b85d71}
```

It logged us onto a remote machine, where we find a `flag.txt` file that contains the flag.

---

## Flag

> `picoCTF{k3y_5l3u7h_75b85d71}`
