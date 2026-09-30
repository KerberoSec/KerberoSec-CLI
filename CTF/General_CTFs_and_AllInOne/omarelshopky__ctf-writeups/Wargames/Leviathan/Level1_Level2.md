# Leviathan Level 1 --> Level 2
There is no information for this level, intentionally. 

## Solution
See files in home directory, there is setuid executable
```bash
leviathan1@leviathan:~$ ls
check
leviathan1@leviathan:~$ file check
check: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=c735f6f3a3a94adcad8407cc0fda40496fd765dd, not stripped
```
Try this setuid
```console
leviathan1@leviathan:~$ ./check
password: rioGegei8m
Wrong password, Good Bye ...
```
It takes password we don't know so lets do some reverse engineering  
```console
leviathan1@leviathan:~$ ltrace ./check
__libc_start_main(0x804853b, 1, 0xffffd784, 0x8048610 <unfinished ...>
printf("password: ")                                     = 10
getchar(1, 0, 0x65766f6c, 0x646f6700password: omar
)                    = 111
getchar(1, 0, 0x65766f6c, 0x646f6700)                    = 109
getchar(1, 0, 0x65766f6c, 0x646f6700)                    = 97
strcmp("oma", "sex")                                     = -1
puts("Wrong password, Good Bye ..."Wrong password, Good Bye ...
)                     = 29
+++ exited (status 0) +++
```

So it compare our input with "sex", know try this pass
```console
leviathan1@leviathan:~$ ./check
password: sex
$ whoami
leviathan2
```

Now we ,lay as leviatahn2 user, get the pass now
```console
$ cat /etc/leviathan_pass/leviathan2
ougahZi8Ta
```

## Password
> ougahZi8Ta

