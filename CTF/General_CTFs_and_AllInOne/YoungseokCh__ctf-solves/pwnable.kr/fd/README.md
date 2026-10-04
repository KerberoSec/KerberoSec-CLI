# fd

## Linux Standard File Discripters
* 0 : Standard Input
* 1 : Standard Output
* 2 : Standard Error

To use standard input, `int fd = atoi( argv[1] ) - 0x1234;` should be assigned to zero, which means `argv[1]` is 4660.

Now it reads to buffer using `read(fd, buf, 32)`, and the buffer should be `LETMEWIN\n` to pass strcmp.
```
fd@pwnable:~$ ./fd 4660
LETMEWIN
good job :)
mommy! I think I know what a file descriptor is!!
```
The flag is `mommy! I think I know what a file descriptor is!!`.