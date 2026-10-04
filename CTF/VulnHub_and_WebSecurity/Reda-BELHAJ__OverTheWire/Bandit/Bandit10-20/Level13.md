# Bandit Level 13
## Part I
Enter the following command in your Terminal :  
```bash
    mkdir /tmp/reda
    cp data.txt /tmp/reda
    cd /tmp/reda
    xxd -r data.txt >> res
    # Convert hexdump into binary
```
```bash
    file res
    # res: gzip compressed data
    mv res res.gz
    gzip -d res.gz
```
```bash
    file res
    # res: bzip2 compressed data, block size = 900k
    mv res res.bz2
    bzip2 -d res.bz2
```
```bash
    file res
    # res: gzip compressed data, was "data4.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
    mv res res.gz
    gzip -d res.gz
```
```bash
    file res
    # res: POSIX tar archive (GNU)
    mv res res.tar
    tar xvf res.tar
    # data5.bin
```
```bash
    file data5.bin
    # data5.bin: POSIX tar archive (GNU)
    mv data5.bin data5.tar
    tar xvf data5.tar
    # data6.bin
```
```bash
    file data6.bin
    # data6.bin: bzip2 compressed data, block size = 900k
    mv data6.bin data6.bz2
    bzip2 -d data6.bz2
```
```bash
    file data6
    # data6: POSIX tar archive (GNU)
    mv data6 data6.tar
    tar xvf data6.tar
    # data8.bin
```
```bash
    file data8.bin
    # data8.bin: gzip compressed data, was "data9.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
    mv data8.bin data8.gz
    gzip -d data8.gz
    file data8
    # data8: ASCII text
    cat data8
    # The password is 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit13* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level13.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit13
	# OR ssh bandit13@bandit.labs.overthewire.org -p 2220
	# password: 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
```
2. Enter the password as shown in the comment of bash.
