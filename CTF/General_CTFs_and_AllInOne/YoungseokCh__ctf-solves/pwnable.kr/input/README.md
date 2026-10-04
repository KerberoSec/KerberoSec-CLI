# input
> Mom? how can I pass my input to a computer program?
> 
> ssh input2@pwnable.kr -p2222 (pw:guest)

```
$scp -P 2222 input2@pwnable.kr:~/input .
$scp -P 2222 input2@pwnable.kr:~/input.c .
```

## Stage 1: argv
```c
if(argc != 100) return 0;
if(strcmp(argv['A'],"\x00")) return 0;
if(strcmp(argv['B'],"\x20\x0a\x0d")) return 0;
printf("Stage 1 clear!\n");
```
First, `argc` should be 100, so it requires 100 inputs including the name of binary. `argv['A']` is 65th element and `argv['B']` is 66th element the input array. Now the solver code is straightforward:
```python
from pwn import *

input_path = './input'                  # For local environment
# input_path = '/home/input2/input'     # For running on provided pwnable.kr server

argvs = ["" for i in range(0,100)]
argvs[ord('A')] = '\x00'
argvs[ord('B')] = '\x20\x0a\x0d'

p = process(executable = 'input', argv = argvs)
```

Running it gives me the message `Stage 1 clear!`.

## Stage 2: stdio
```c
// stdio
char buf[4];
read(0, buf, 4);
if(memcmp(buf, "\x00\x0a\x00\xff", 4)) return 0;
read(2, buf, 4);
if(memcmp(buf, "\x00\x0a\x02\xff", 4)) return 0;
printf("Stage 2 clear!\n");
```

First, write `"\x00\x0a\x00\xff"` to stdin, which is easy work.
```python
p.send(b"\x00\x0a\x00\xff")
```

After that, we need to write `"\x00\x0a\x02\xff"` to the stderr. I tried with `sys.stderr.write`, but it failed.
```python
import sys
sys.stderr.write(b'\\x00\\x0a\\x02\\xff')
```
The idea was redirecting stderr to an existing file at the start of running the program. In bash,
```bash
./input 2> stderr.txt
```
can be possible. However, we are using pwntools process, so I created a custom pipe and linked stderr to it.

```python
from pwn import *
import os
import time

context.log_level='debug'

input_path = './input'                  # For local environment
# input_path = '/home/input2/input'     # For running on provided pwnable.kr server

argvs = ["" for i in range(0,100)]
argvs[ord('A')] = '\x00'
argvs[ord('B')] = '\x20\x0a\x0d'

stderr,stderw = os.pipe()

p = process(executable = input_path, argv = argvs, stderr=stderr)

p.recvuntil("Stage 1 clear!\n")
print("Stage 1 clear!")

p.send(b"\x00\x0a\x00\xff")
os.write(stderw, b"\x00\x0a\x02\xff")

p.recvuntil("Stage 2 clear!\n")
print("Stage 2 clear!")
```

## Stage 3: Environment Variable

```c
if(strcmp("\xca\xfe\xba\xbe", getenv("\xde\xad\xbe\xef"))) return 0;
printf("Stage 3 clear!\n");
```

Set environment varible of "\xde\xad\xbe\xef" as "\xca\xfe\xba\xbe". First I tried:
```python
os.environ["\xde\xad\xbe\xef"] = "\xca\xfe\xba\xbe"
```
However it didn't worked. I think it was the problem of handling bytes and strings. With setting environment variable with pwntools process input, this stage was cleared.

```python
p = process(executable = input_path, argv = argvs, stderr=stderr, env={b"\xde\xad\xbe\xef":b"\xca\xfe\xba\xbe"})
# ...
p.recvuntil("Stage 3 clear!\n")
print("Stage 3 clear!")
```

## Stage 4: File

```c
FILE* fp = fopen("\x0a", "r");
if(!fp) return 0;
if( fread(buf, 4, 1, fp)!=1 ) return 0;
if( memcmp(buf, "\x00\x00\x00\x00", 4) ) return 0;
fclose(fp);
printf("Stage 4 clear!\n");
```

We need to write "\x00\x00\x00\x00" on the file named "\x0a".
```python
with open("\x0a","w+") as f:
    f.write(b"\x00\x00\x00\x00")

p.recvuntil("Stage 4 clear!\n")
print("Stage 4 clear!")
```
`Stage 4 clear!`

## Stage 5: Network

```c
// network
int sd, cd;
struct sockaddr_in saddr, caddr;
sd = socket(AF_INET, SOCK_STREAM, 0);
if(sd == -1){
        printf("socket error, tell admin\n");
        return 0;
}
saddr.sin_family = AF_INET;
saddr.sin_addr.s_addr = INADDR_ANY;
saddr.sin_port = htons( atoi(argv['C']) );
if(bind(sd, (struct sockaddr*)&saddr, sizeof(saddr)) < 0){
        printf("bind error, use another port\n");
        return 1;
}
listen(sd, 1);
int c = sizeof(struct sockaddr_in);
cd = accept(sd, (struct sockaddr *)&caddr, (socklen_t*)&c);
if(cd < 0){
        printf("accept error, tell admin\n");
        return 0;
}
if( recv(cd, buf, 4, 0) != 4 ) return 0;
if(memcmp(buf, "\xde\xad\xbe\xef", 4)) return 0;
printf("Stage 5 clear!\n");
```

I googled some c socket networking articles for solving this stage. I realized that above code is just opening port `argv['C']` on localhost and waiting for input `"\xde\xad\xbe\xef"`.

```python
argvs[ord('C')] = '64123'
# ...
print(p.poll())     # wait for opening sockets. It should print None if successful.
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('localhost', 64123))

sock.send(b"\xde\xad\xbe\xef")
```

64123 is just arbitrary port number. You may change it within the port range.

## Full code

```python
from pwn import *
import os

context.log_level='debug'

# input_path = './input'                  # For local environment
input_path = '/home/input2/input'     # For running on provided pwnable.kr server

argvs = ["" for i in range(0,100)]
argvs[ord('A')] = '\x00'
argvs[ord('B')] = '\x20\x0a\x0d'
argvs[ord('C')] = '64123'

stderr,stderw = os.pipe()

p = process(executable = input_path, argv = argvs, stderr=stderr, env={b"\xde\xad\xbe\xef":b"\xca\xfe\xba\xbe"})

p.recvuntil("Stage 1 clear!\n")
print("Stage 1 clear!")

p.send(b"\x00\x0a\x00\xff")
os.write(stderw, b"\x00\x0a\x02\xff")

p.recvuntil("Stage 2 clear!\n")
print("Stage 2 clear!")

p.recvuntil("Stage 3 clear!\n")
print("Stage 3 clear!")

with open("\x0a","w+") as f:
    f.write(b"\x00\x00\x00\x00")

p.recvuntil("Stage 4 clear!\n")
print("Stage 4 clear!")

print(p.poll())     # wait for opening sockets. It should print None if successful.
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('localhost', 64123))

sock.send(b"\xde\xad\xbe\xef")

p.recvuntil("Stage 5 clear!\n")
print(p.recvall())
```

## Running on the Remote!

On pwnable.kr server, read and write permission is enabled in `/etc/{any directory name}`. So we can write and run python code in it.

Also, be aware of the fact the `flag` must exist in your local path `.`.
```c
// here's your flag
system("/bin/cat flag");
```

Creating the symbolic link to the original flag would be neat.
```bash
ln -s /home/input2/flag ./flag
```

```
$ cd /etc
$ mkdir input2_solver_a23fd3da8552
$ cd input2_solver_a23fd3da8552
$ ln -s /home/input2/flag ./flag
$ vim solver.py                         # copy and paste the solver code.
$ python solver.py
[+] Starting local process '/home/input2/input' argv=['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ' \n\r', '64123', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']  env={'\xde\xad\xbe\xef': '\xca\xfe\xba\xbe'} : pid 424595
[DEBUG] Received 0x92 bytes:
    'Welcome to pwnable.kr\n'
    "Let's see if you know how to give input to program\n"
    'Just give me correct inputs then you will get the flag :)\n'
    'Stage 1 clear!\n'
Stage 1 clear!
[DEBUG] Sent 0x4 bytes:
    00000000  00 0a 00 ff                                         │····││
    00000004
[DEBUG] Received 0x2d bytes:
    'Stage 2 clear!\n'
    'Stage 3 clear!\n'
    'Stage 4 clear!\n'
Stage 2 clear!
Stage 3 clear!
Stage 4 clear!
None
[DEBUG] Received 0xf bytes:
    'Stage 5 clear!\n'
[+] Receiving all data: Done (55B)
[*] Process '/home/input2/input' stopped with exit code 0 (pid 424595)
[DEBUG] Received 0x37 bytes:
    'Mommy! I learned how to pass various input in Linux :)\n'
Mommy! I learned how to pass various input in Linux :)
```

The flag is `Mommy! I learned how to pass various input in Linux :)`.
