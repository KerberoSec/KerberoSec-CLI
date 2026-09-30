# **Sleuthkit Apprentice: 200 pts**

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

The title suggests Sleuthkit, a disk drive forensics tool. You can use that to solve this challenge (and the other disk image challenges), but I prefer the classic terminal way, so here it is:

---

## Solution

Get the file and extract it:

```console
$ wget https://artifacts.picoctf.net/c/332/disk.flag.img.gz
$ gunzip disk.flag.img.gz
```

Check the details:

```console
$ fdisk -l disk.flag.img
Disk disk.flag.img: 300 MiB, 314572800 bytes, 614400 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x7389e82d

Device         Boot  Start    End Sectors  Size Id Type
disk.flag.img1 *      2048 206847  204800  100M 83 Linux
disk.flag.img2      206848 360447  153600   75M 82 Linux swap / Solaris
disk.flag.img3      360448 614399  253952  124M 83 Linux
```

Mount the partition at the correct offset:

```console
$ sudo mount -o loop,offset=$((512 * 360448)) disk.flag.img ./mnt
```

Look inside:

```console
$ cd mnt
$ ls -l
total 39
drwxr-xr-x  2 root root  3072 Sep 29 18:06 bin
drwxr-xr-x  2 root root  1024 Sep 29 15:57 boot
drwxr-xr-x  2 root root  1024 Sep 29 15:57 dev
drwxr-xr-x 27 root root  3072 Sep 29 18:06 etc
drwxr-xr-x  2 root root  1024 Sep 29 15:57 home
drwxr-xr-x  9 root root  1024 Sep 29 15:57 lib
drwx------  2 root root 12288 Sep 29 15:57 lost+found
drwxr-xr-x  5 root root  1024 Sep 29 15:57 media
drwxr-xr-x  2 root root  1024 Sep 29 15:57 mnt
drwxr-xr-x  2 root root  1024 Sep 29 15:57 opt
drwxr-xr-x  2 root root  1024 Sep 29 15:57 proc
drwx------  3 root root  1024 Sep 29 18:07 root
drwxr-xr-x  2 root root  1024 Sep 29 15:57 run
drwxr-xr-x  2 root root  5120 Sep 29 15:57 sbin
drwxr-xr-x  2 root root  1024 Sep 29 15:57 srv
drwxr-xr-x  2 root root  1024 Sep 29 18:06 swap
drwxr-xr-x  2 root root  1024 Sep 29 15:57 sys
drwxrwxrwt  4 root root  1024 Sep 29 18:06 tmp
drwxr-xr-x  8 root root  1024 Sep 29 15:57 usr
drwxr-xr-x 11 root root  1024 Sep 29 18:06 var
$ sudo chmod 777 root
$ cd root
$ ls
my_folder
```

There is a folder...

```console
$ cd my_folder
$ ls
flag.uni.txt
```

Open the file:

```console
$ cat flag.uni.txt
picoCTF{by73_5urf3r_2f22df38}
```

---

## Flag

> `picoCTF{by73_5urf3r_2f22df38}`
