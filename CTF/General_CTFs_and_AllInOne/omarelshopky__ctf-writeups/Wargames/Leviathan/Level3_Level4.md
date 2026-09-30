# Leviathan Level 3 --> Level 4
There is no information for this level, intentionally. 

## Solution 
See files in home directory, there is setuid executable
```bash
leviathan3@leviathan:~$ ls
level3
leviathan3@leviathan:~$ file level3 
level3: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=ed9f6a6d1c89cf1f3f2eff370de4fb1669774fd5, not stripped
```

Try this setuid
```console
leviathan3@leviathan:~$ ./level3
Enter the password> Ahdiemoo1j
bzzzzzzzzap. WRONG

```
```console
leviathan3@leviathan:~$ ltrace ./level3
__libc_start_main(0x8048618, 1, 0xffffd794, 0x80486d0 <unfinished ...>
strcmp("h0no33", "kakaka")                               = -1
printf("Enter the password> ")                           = 20
fgets(Enter the password> Ahdiemoo1j
"Ahdiemoo1j\n", 256, 0xf7fc55a0)                   = 0xffffd5a0
strcmp("Ahdiemoo1j\n", "snlprintf\n")                    = -1
puts("bzzzzzzzzap. WRONG"bzzzzzzzzap. WRONG
)                               = 19
+++ exited (status 0) +++
```

It takes a password compare it with snlprintf so lets try
```console
leviathan3@leviathan:~$ ./level3 
Enter the password> snlprintf         
[You've got shell]!
$ 
```

Now we play as leviathan4 user , get the password
```console
$ whoami
leviathan4
$ cat /etc/leviathan*/leviathan4
vuH0coox6m
```

## Password
> vuH0coox6m

