# Leviathan Level 4 --> Level 5
There is no information for this level, intentionally. 

## Solution 
See files in home directory, there is nothing so show hidden files
```bash
leviathan4@leviathan:~$ ls
leviathan4@leviathan:~$ ls -a
.  ..  .bash_logout  .bashrc  .profile  .trash
```

Lets see its content
```console
leviathan4@leviathan:~$ cd .trash
leviathan4@leviathan:~/.trash$ ls
bin
```

It is setuid file contain some binary
```console
leviathan4@leviathan:~/.trash$ file bin
bin: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=00ce1aa55b0e691470f61baff0ee59a6c33fcb50, not stripped
leviathan4@leviathan:~/.trash$ ./bin
01010100 01101001 01110100 01101000 00110100 01100011 01101111 01101011 01100101 01101001 00001010 
```

Lets convert to ASCII
```console
leviathan5@leviathan:~$ echo "0101010001101001011101000110100000110100011000110110111101101011011001010110100100001010" | perl -lpe '$_=pack"B*",$_'
Tith4cokei
```

## Password
> Tith4cokei

