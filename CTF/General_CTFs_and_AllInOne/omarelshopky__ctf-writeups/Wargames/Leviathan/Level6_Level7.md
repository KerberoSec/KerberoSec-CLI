# Leviathan Level 6 --> Level 7
There is no information for this level, intentionally. 

## Solution 
See files in home directory, there is setuid file
```bash
leviathan6@leviathan:~$ ls
leviathan6
leviathan6@leviathan:~$ file leviathan6 
leviathan6: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=30bfe37691e013d638a271635abbb3ade6b5d20b, not stripped
```

Lets see how its work 
```console
leviathan6@leviathan:~$ ./leviathan6 
usage: ./leviathan6 <4 digit code>
leviathan6@leviathan:~$ ltrace ./leviathan6 4515
__libc_start_main(0x804853b, 2, 0xffffd774, 0x80485e0 <unfinished ...>
atoi(0xffffd8a8, 0, 0xf7e40890, 0x804862b)               = 4515
puts("Wrong"Wrong
)                                            = 6
+++ exited (status 0) +++
```

It takes code from 4 digits but we don't know so using brute force script we will try all available codes
```console
leviathan6@leviathan:~$ mkdir /tmp/levia6
leviathan6@leviathan:~$ cd /tmp/levia6
leviathan6@leviathan:/tmp/levia6$ nano script.sh
```
```bash
#!/bin/bash
for i in {0000..9999}
  do
    ~/leviathan6 "$i"
  done
```

Change script mode to make it executable then run
```console
leviathan6@leviathan:/tmp/levia6$ chmod +x script.sh
leviathan6@leviathan:/tmp/levia6$ ./script.sh
```

Now we are  login as leviathan7 get the pass 
```console
$ whoami
leviathan7
$ cat /etc/leviathan_pass/leviathan7
ahy7MaeBo9
```

## Password
> ahy7MaeBo9

