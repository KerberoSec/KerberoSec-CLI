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

> Download this disk image and find the flag.

---

## Solution

Get the disk image and extract it:

```console
$ wget https://artifacts.picoctf.net/c/238/disk.flag.img.gz
$ gunzip disk.flag.img.gz
```

Let's see what's inside:

```console
$ fdisk -l disk.flag.img
Disk disk.flag.img: 400 MiB, 419430400 bytes, 819200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xb11a86e3

Device         Boot  Start    End Sectors  Size Id Type
disk.flag.img1 *      2048 206847  204800  100M 83 Linux
disk.flag.img2      206848 411647  204800  100M 82 Linux swap / Solaris
disk.flag.img3      411648 819199  407552  199M 83 Linux
```

The first partition is a boot directory, which is probably not what we want. Mounting the second partition raises an error. Let's mount the third one. Each sector size is 512 bytes, so the offset will be 512 \* 411648 = 210763776.

```console
$ sudo mount -o loop,offset=210763776 disk.flag.img ./mnt
$ cd mnt
$ ls -l
total 39
drwxr-xr-x  2 root root  3072 Oct  6 18:31 bin
drwxr-xr-x  2 root root  1024 Oct  6 18:20 boot
drwxr-xr-x  2 root root  1024 Oct  6 18:20 dev
drwxr-xr-x 27 root root  3072 Oct  6 18:31 etc
drwxr-xr-x  2 root root  1024 Oct  6 18:20 home
drwxr-xr-x  9 root root  1024 Oct  6 18:20 lib
drwx------  2 root root 12288 Oct  6 18:20 lost+found
drwxr-xr-x  5 root root  1024 Oct  6 18:20 media
drwxr-xr-x  2 root root  1024 Oct  6 18:20 mnt
drwxr-xr-x  2 root root  1024 Oct  6 18:20 opt
drwxr-xr-x  2 root root  1024 Oct  6 18:20 proc
drwx------  2 root root  1024 Oct  6 18:32 root
drwxr-xr-x  2 root root  1024 Oct  6 18:20 run
drwxr-xr-x  2 root root  5120 Oct  6 18:20 sbin
drwxr-xr-x  2 root root  1024 Oct  6 18:20 srv
drwxr-xr-x  2 root root  1024 Oct  6 18:30 swap
drwxr-xr-x  2 root root  1024 Oct  6 18:20 sys
drwxrwxrwt  4 root root  1024 Oct  6 18:30 tmp
drwxr-xr-x  8 root root  1024 Oct  6 18:20 usr
drwxr-xr-x 11 root root  1024 Oct  6 18:30 var
```

`/root` was the last modified folder, so let's check in there. First, we need permissions:

```console
$ sudo chmod 777 root
$ cd root
$ ls
flag.txt.enc
```

Hmm...that's it? Let's see if there are any hidden files:

```console
$ ls -al
total 4
drwxrwxr-x  2 root root 1024 Oct  6 18:32 .
drwxr-xr-x 22 root root 1024 Oct  6 18:30 ..
-rw-------  1 root root  202 Oct  6 18:33 .ash_history
-rw-r--r--  1 root root   64 Oct  6 18:32 flag.txt.enc
```

There is a `.ash_history` file, which contains the history of shell commands. Let's see what the user did. Again, we need permissions first.

```console
$ sudo chmod 664 .ash_history
$ cat .ash_history
touch flag.txt
nano flag.txt
apk get nano
apk --help
apk add nano
nano flag.txt
openssl
openssl aes256 -salt -in flag.txt -out flag.txt.enc -k unbreakablepassword1234567
shred -u flag.txt
ls -al
halt
```

So they took a file `flag.txt`, encrypted it with `openssl aes256` with a password, and put the output in `flag.txt.enc`, the file we have right now. All we have to do is decrypt it:

```console
$ openssl aes256 -d -in flag.txt.enc -out flag.txt
enter aes-256-cbc decryption password: unbreakablepassword1234567
$ cat flag.txt
picoCTF{h4un71ng_p457_1d02081e}
```

If you get an error after decryption, open the file anyways; it should have still worked.

---

## Flag

> `picoCTF{h4un71ng_p457_1d02081e}`
