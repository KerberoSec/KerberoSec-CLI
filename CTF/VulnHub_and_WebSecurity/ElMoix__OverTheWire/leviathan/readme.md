# OVERTHEWIRE GAMES: LEVIATHAN

## Data for the levels can be found in the homedirectories. You can look at /etc/leviathan_pass for the various level passwords.

### ssh leviathan0@leviathan.labs.overthewire.org -p 2223 (leviathan0)
```
> leviathan0@gibson:~/.backup$ cat bookmarks.html | grep "leviathan"
    <DT><A HREF="http://leviathan.labs.overthewire.org/passwordus.html | This will be fixed later, the password for leviathan1 is PPIfmI1qsA" ADD_DATE="1155384634" LAST_CHARSET="ISO-8859-1" ID="rdf:#$2wIU71">password to leviathan1</A>
```
### ssh leviathan1@leviathan.labs.overthewire.org -p 2223 (PPIfmI1qsA)
```
> leviathan1@gibson:~$ ls -lisa
    526580 16 -r-sr-x---  1 leviathan2 leviathan1 15072 Feb 21 22:02 check

> leviathan1@gibson:~$ file check 
    check: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=aab009a1eb3940df51c668d1c35dc9cdc1191805, for GNU/Linux 3.2.0, not stripped

> leviathan1@gibson:~$ ./check 
    password: moix
    Wrong password, Good Bye ...

> leviathan1@gibson:~$ ltrace ./check 
    __libc_start_main(0x80491e6, 1, 0xffffd5f4, 0 <unfinished ...>
    printf("password: ")                                                                                                                               = 10
    getchar(0xf7fbe4a0, 0xf7fd6f80, 0x786573, 0x646f67password: moix
    )                                                                                                = 49
    getchar(0xf7fbe4a0, 0xf7fd6f31, 0x786573, 0x646f67)                                                                                                = 50
    getchar(0xf7fbe4a0, 0xf7fd3231, 0x786573, 0x646f67)                                                                                                = 51
    strcmp("moi", "sex")                                                                                                                               = -1
    puts("Wrong password, Good Bye ..."Wrong password, Good Bye ...
    )                                                                                                               = 29
    +++ exited (status 0) +++

> leviathan1@gibson:~$ ./check 
    password: sex
    $ id
    uid=12002(leviathan2) gid=12001(leviathan1) groups=12001(leviathan1)
    
    > leviathan2@gibson:/home/leviathan2$ cat /etc/leviathan_pass/leviathan2 
    mEh5PNl10e
```
### ssh leviathan2@leviathan.labs.overthewire.org -p 2223 (mEh5PNl10e)
```
> leviathan2@gibson:~$ ls -lisa
    526582 16 -r-sr-x---  1 leviathan3 leviathan2 15060 Feb 21 22:02 printfile

> leviathan2@gibson:~$ file printfile 
printfile: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=32c7e041842883e05808ab99c763a0fc1849b84e, for GNU/Linux 3.2.0, not stripped

> leviathan2@gibson:~$ ./printfile 
    *** File Printer ***
    Usage: ./printfile filename
> leviathan2@gibson:~$ ./printfile /etc/leviathan_pass/leviatha3
    You cant have that file...
> leviathan2@gibson:~$ ./printfile "a a.txt"
    You cant have that file...
> leviathan2@gibson:/tmp/moix$ mkdir /tmp/moix/ && touch /tmp/moix/moix.txt
> leviathan2@gibson:~$ cd /tmp/moix
> leviathan2@gibson:/tmp/moix$ ltrace ~/printfile moix.txt 
    __libc_start_main(0x80491e6, 2, 0xffffd5a4, 0 <unfinished ...>
    access("moix.txt", 4)                                                                                                                              = 0
    snprintf("/bin/cat moix.txt", 511, "/bin/cat %s", "moix.txt")                                                                                      = 17
    geteuid()                                                                                                                                          = 12002
    geteuid()                                                                                                                                          = 12002
    setreuid(12002, 12002)                                                                                                                             = 0
    system("/bin/cat moix.txt" <no return ...>
    --- SIGCHLD (Child exited) ---
    <... system resumed> )                                                                                                                             = 0
    +++ exited (status 0) +++

> leviathan2@gibson:/tmp/moix$ touch "by pass.txt"
> leviathan2@gibson:/tmp/moix$ ~/printfile by\ pass.txt 
    /bin/cat: by: No such file or directory
    /bin/cat: pass.txt: No such file or directory
> leviathan2@gibson:/tmp/moix$ ln -s /etc/leviathan_pass/leviathan3 by
> leviathan2@gibson:/tmp/moix$ ls -la
    lrwxrwxrwx    1 leviathan2 leviathan2     30 Apr  1 12:42 by -> /etc/leviathan_pass/leviathan3
> leviathan2@gibson:/tmp/moix$ ~/printfile by\ pass.txt 
    Q0G8j4sakn
    /bin/cat: pass.txt: No such file or directory
```
### ssh leviathan3@leviathan.labs.overthewire.org -p 2223 (Q0G8j4sakn)
```
> leviathan3@gibson:~$ ls -lisa
    526584 20 -r-sr-x---  1 leviathan4 leviathan3 18072 Feb 21 22:02 level3
> leviathan3@gibson:~$ file level3 
    level3: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=8e23aebeb7072ef40e46bf2bfe6cb18d7b811c2e, for GNU/Linux 3.2.0, with debug_info, not stripped
> leviathan3@gibson:~$ ./level3 
    Enter the password> 1234
    bzzzzzzzzap. WRONG

> leviathan3@gibson:~$ ltrace ./level3 
    __libc_start_main(0x80492bf, 1, 0xffffd5f4, 0 <unfinished ...>
    strcmp("h0no33", "kakaka")                                                                                                                         = -1
    printf("Enter the password> ")                                                                                                                     = 20
    fgets(Enter the password> 1234
    "1234\n", 256, 0xf7fab620)                                                                                                                   = 0xffffd3cc
    strcmp("1234\n", "snlprintf\n")                                                                                                                    = -1
    puts("bzzzzzzzzap. WRONG"bzzzzzzzzap. WRONG
    )                                                                                                                         = 19
    +++ exited (status 0) +++

> leviathan3@gibson:~$ ltrace ./level3 
    __libc_start_main(0x80492bf, 1, 0xffffd5f4, 0 <unfinished ...>
    strcmp("h0no33", "kakaka")                                                                                                                         = -1
    printf("Enter the password> ")                                                                                                                     = 20
    fgets(Enter the password> snlprintf
    "snlprintf\n", 256, 0xf7fab620)                                                                                                              = 0xffffd3cc
    strcmp("snlprintf\n", "snlprintf\n")                                                                                                               = 0
    puts("[You've got shell]!"[You've got shell]!
    )                                                                                                                        = 20
    geteuid()                                                                                                                                          = 12003
    geteuid()                                                                                                                                          = 12003
    setreuid(12003, 12003)                                                                                                                             = 0
    system("/bin/sh"$ 

> leviathan3@gibson:~$ ./level3 
    Enter the password> snlprintf
    [You've got shell]!
    > $ whoami
        leviathan4
    > $ id
        uid=12004(leviathan4) gid=12003(leviathan3) groups=12003(leviathan3)

> leviathan4@gibson:~$ cat /etc/leviathan_pass/leviathan4 
    AgvropI4OA
```
### ssh leviathan4@leviathan.labs.overthewire.org -p 2223 (AgvropI4OA)
```
> leviathan4@gibson:~$ ls -lisa
    526586 4 dr-xr-x---  2 root leviathan4 4096 Feb 21 22:02 .trash
> leviathan4@gibson:~/.trash$ ls -lisa
    526587 16 -r-sr-x--- 1 leviathan5 leviathan4 14928 Feb 21 22:02 bin
> leviathan4@gibson:~/.trash$ file bin
bin: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=27f52c687c97c02841058c6b6ae07efe97f23226, for GNU/Linux 3.2.0, not stripped
> leviathan4@gibson:~/.trash$ ./bin 
01000101 01001011 01001011 01101100 01010100 01000110 00110001 01011000 01110001 01110011 00001010 

Via online methods we convert Binary to text: EKKlTF1Xqs
```
### ssh leviathan5@leviathan.labs.overthewire.org -p 2223 (EKKlTF1Xqs)
```
> leviathan5@gibson:~$ ls -lisa
    526589 16 -r-sr-x---  1 leviathan6 leviathan5 15132 Feb 21 22:02 leviathan5
> leviathan5@gibson:~$ file leviathan5 
    leviathan5: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=83b35709d62a0f67c8590bce094c269179e87087, for GNU/Linux 3.2.0, not stripped
> leviathan5@gibson:~$ touch /tmp/file.log
> leviathan5@gibson:~$ ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
> leviathan5@gibson:~$ ./leviathan5 
    YZ55XPVk2l
```
### ssh leviathan6@leviathan.labs.overthewire.org -p 2223 (YZ55XPVk2l)
```
> leviathan6@gibson:~$ ls -lisa
> leviathan6@gibson:~$ file leviathan6 
    leviathan6: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=b946d7a1e1d2e52404c75c7a5410c61151b63bce, for GNU/Linux 3.2.0, not stripped
> leviathan6@gibson:~$ ./leviathan6 
    usage: ./leviathan6 <4 digit code>
> leviathan6@gibson:~$ ./leviathan6 1234
    Wrong
> leviathan6@gibson:~$ mkdir /tmp/moix2
> leviathan6@gibson:/tmp/moix2$ vim bf.sh
> leviathan6@gibson:/tmp/moix2$ cat bf.sh
    #!/bin/bash

    for i in {0000..9999}
    do
    ~/leviathan6 $i
    done
> leviathan6@gibson:/tmp/moix2$ chmod +x bf.sh 

> leviathan6@gibson:/tmp/moix2$ ./bf.sh 

After +-10 seconds...

$ whoami
    leviathan7
$ id
    uid=12007(leviathan7) gid=12006(leviathan6) groups=12006(leviathan6)
> leviathan7@gibson:/tmp/moix2$ cat /etc/leviathan_pass/leviathan7 
    8GpZ5f8Hze
```
### ssh leviathan7@leviathan.labs.overthewire.org -p 2223 (8GpZ5f8Hze)
```
> leviathan7@gibson:~$ cat CONGRATULATIONS 
    Well Done, you seem to have used a *nix system before, now try something more serious.
    (Please don't post writeups, solutions or spoilers about the games on the web. Thank you!)
```