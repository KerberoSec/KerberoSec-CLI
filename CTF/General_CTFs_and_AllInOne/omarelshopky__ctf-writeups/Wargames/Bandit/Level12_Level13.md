# Bandit Level 12 --> Level 13
## Level Goal

The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work using mkdir. For example: mkdir /tmp/myname123. Then copy the datafile using cp, and rename it using mv (read the manpages!)

## Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd, mkdir, cp, mv, file

## Solution
ls command show file in home directory "data.txt" contain hexdump
```console
bandit12@bandit:~$ ls
data.txt
```

Make "banlev12" dir in tmp folder then copy data.txt to it
```console
bandit12@bandit:~$ mkdir /tmp/banlev12
bandit12@bandit:~$ cp data.txt /tmp/banlev12
bandit12@bandit:~$ cd /tmp/banlev12
bandit12@bandit:/tmp/banlev12$
```

Using file command we see that it is ASCII file so we need to convert to binary form in new file
```console
bandit12@bandit:/tmp/banlev12$ file data.txt
data.txt: ASCII text
bandit12@bandit:/tmp/banlev12$ xxd -r data.txt newdata
```

Again use file command implies that newdata file is gzip commpressed data
```console
bandit12@bandit:/tmp/banlev12$ file newdata
newdata: gzip compressed data, was "data2.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
```

Lets add .gz file extension and decompress it, that produce newdata file
```console
bandit12@bandit:/tmp/banlev12$ mv newdata.gzip newdata.gz
bandit12@bandit:/tmp/banlev12$ gzip -d newdata.gz
bandit12@bandit:/tmp/banlev12$ ls
data.txt  newdata
```

Again use file command implies that newdata file is bzip2 commpressed data
```console
bandit12@bandit:/tmp/banlev12$ file newdata
newdata: bzip2 compressed data, block size = 900k
```

Lets add .bz2 file extension and decompress it, that produce newdata file
```console
bandit12@bandit:/tmp/banlev12$ mv newdata newdata.bz2
bandit12@bandit:/tmp/banlev12$ bzip2 -d newdata.bz2
bandit12@bandit:/tmp/banlev12$ ls
data.txt  newdata
```

Again use file command implies that newdata file is gzip commpressed data
```console
bandit12@bandit:/tmp/banlev12$ file newdata
newdata: gzip compressed data, was "data4.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
```

Add .gz file extension and decompress it, that produce newdata file
```console
bandit12@bandit:/tmp/banlev12$ mv newdata newdata.gz
bandit12@bandit:/tmp/banlev12$ gzip -d newdata.gz
bandit12@bandit:/tmp/banlev12$ ls
data.txt  newdata
```

Again use file command implies that newdata file is tar archive
```console
bandit12@bandit:/tmp/banlev12$ file newdata
newdata: POSIX tar archive (GNU)
```

Add .tar file extension and decompress it, that produce data5.bin file
```console
bandit12@bandit:/tmp/banlev12$ mv newdata newdata.tar
bandit12@bandit:/tmp/banlev12$ tar -xvf newdata.tar
data5.bin
```

Again use file command implies that data5.bin file is tar archive and decompress it
```console
bandit12@bandit:/tmp/banlev12$ file data5.bin
data5.bin: POSIX tar archive (GNU)
bandit12@bandit:/tmp/banlev12$ tar -xvf data5.bin
data6.bin
```
data6.bin file is tar archive, decompress it
```console
bandit12@bandit:/tmp/banlev12$ file data6.bin
data6.bin: bzip2 compressed data, block size = 900k
bandit12@bandit:/tmp/banlev12$ mv data6.bin data.bz2
bandit12@bandit:/tmp/banlev12$ bzip2 -d data.bz2
bandit12@bandit:/tmp/banlev12$ ls
data  data5.bin  data.txt  newdata.tar
```
Do that until you reach to password
```console
bandit12@bandit:/tmp/banlev12$ file data
data: POSIX tar archive (GNU)
bandit12@bandit:/tmp/banlev12$ tar -xvf data
data8.bin
bandit12@bandit:/tmp/banlev12$ file data8.bin
data8.bin: gzip compressed data, was "data9.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
bandit12@bandit:/tmp/banlev12$ mv data8.bin data9.gz
bandit12@bandit:/tmp/banlev12$ gzip -d data9.gz
bandit12@bandit:/tmp/banlev12$ ls
data  data5.bin  data9  data.txt  newdata.tar
bandit12@bandit:/tmp/banlev12$ file data9
data9: ASCII text
bandit12@bandit:/tmp/banlev12$ cat data9
The password is 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
```
## Password
> 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL

  
