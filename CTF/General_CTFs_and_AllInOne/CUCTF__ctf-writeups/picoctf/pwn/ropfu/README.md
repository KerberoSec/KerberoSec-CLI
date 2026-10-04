# ropfu

## Summary

This challenge provides a Linux CLI program with a stack buffer overflow
vulnerability that is exploited by executing shellcode on the executable
stack. The exploit uses a single ROP gadget to jump into the stack.

**Artifacts:**
* chall/vuln: vulnerable executable program provided by challenge authors
* chall/vuln.c: vulnerable program source code provided by challenge authors
* solve.py: exploit script that executes `/bin/sh` shellcode in the vulnerable
  process
* gadgets.txt: ROP gadgets in `chall/vuln` found by the `ROPgadget` utility
* Dockerfile: container image file configured with the vulnerable program and
  debugging environments to analyze the program and develop the exploit

## Context

The `ropfu` challenge authors provide a domain and port to connect to the
challenge. They also provide a copy of the compiled challenge binary
(`chall/vuln`) and the source code used to produce the binary (`chall/vuln.c`).

`vuln` is a 32-bit x86 Linux userspace program. It runs as a CLI program and
reads input from `stdin` and prints to `stdout`.

The program functions only to prompt the user to enter a line of text,
receive that text, and then exit:

```
$ ./chall/vuln
How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!
hello
```

The binary is statically compiled without standard exploit mitigations applied:
the stack is *executable* and position independent executable (PIE) settings
are *disabled*. Despite `checksec` reporting that stack canaries are enabled,
later inspection of the vulnerable function shows that *stack canaries are not
checked*.

```
$ file chall/vuln
chall/vuln: ELF 32-bit LSB executable, Intel 80386, version 1 (GNU/Linux), statically linked, BuildID[sha1]=232215a502491a549a155b1a790de97f0c433482, for GNU/Linux 3.2.0, not stripped

$ checksec chall/vuln
[*] '/home/andreas/ctf/picoctf/pwn/ropfu/chall/vuln'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x8048000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No

$ readelf -l chall/vuln
<snip>
Program Headers:
  Type           Offset   VirtAddr   PhysAddr   FileSiz MemSiz  Flg Align
  LOAD           0x000000 0x08048000 0x08048000 0x001e8 0x001e8 R   0x1000
  LOAD           0x001000 0x08049000 0x08049000 0x6a950 0x6a950 R E 0x1000
  LOAD           0x06c000 0x080b4000 0x080b4000 0x2e42d 0x2e42d R   0x1000
  LOAD           0x09a6a0 0x080e36a0 0x080e36a0 0x02c18 0x03950 RW  0x1000
  NOTE           0x000134 0x08048134 0x08048134 0x00044 0x00044 R   0x4
  TLS            0x09a6a0 0x080e36a0 0x080e36a0 0x00010 0x00030 R   0x4
  GNU_STACK      0x000000 0x00000000 0x00000000 0x00000 0x00000 RWE 0x10
  GNU_RELRO      0x09a6a0 0x080e36a0 0x080e36a0 0x01960 0x01960 R   0x1
<snip>
```

## Vulnerability

The `vuln` program contains a stack buffer overwrite vulnerability in the `vuln`
function.

`vuln.c` line 12 contains a call to libc `gets` to read user input from `stdin`:

```
void vuln() {
  char buf[16];
  printf("How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!\n");
  return gets(buf);
}
```

The [`gets` manual page](https://man7.org/linux/man-pages/man3/gets.3.html)
warns of the security problems of the `gets` libc function:

> Never use this function.
>
> gets() reads a line from stdin into the buffer pointed to by s
> until either a terminating newline or EOF, which it replaces with
> a null byte ('\0').  No check for buffer overrun is performed

Therefore, an attacker can overwrite the 16 byte stack-allocated `buf` buffer to
write to addresses beyond the buffer. Because `gets` reads until a newline or
EOF, the number of bytes written can be almost arbitrarily large, likely
limited only by the size of the stack segment in memory.

The vulnerability can be confirmed by providing any input of 29 bytes (not
containing newline characters) and observing the program crash.

```
$ ./chall/vuln
How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!
aaaaaaaaaaaaaaaaaaaaaaaaaaaa
Segmentation fault (core dumped)
```

## Exploitation

**Exploit overview**: the exploit uses a local stack buffer overflow to achieve
arbitrary code execution by jumping to attacker-controlled data written to the
executable stack.

**Exploit mitigation considerations**:
* the `vuln` function does not check for a correct stack canary; therefore,
  overwriting the saved return address on the stack is not protected.
* the stack is executable; therefore, any data that the attacker writes to the
  stack can be executed if the `eip` register points to it.
* PIE is disabled; therefore, the addresses of all executable instructions in
  the text segments of the compiled program are fixed and known prior to
  execution. These instruction addresses can be used for gadgets without a
  memory leak.

**Input constraints**: [`\n`]
* The `gets` function reads until a newline character or EOF. Therefore, the
  exploit input cannot contain any newline characters.

**Exploit description**: the `solve.py` exploit sends a single input that both 1)
writes the shellcode into executable process memory and 2) gains control of the
instruction pointer to execute the shellcode.

The saved return address is located on the stack 28 bytes after the start of
the `buf` buffer, where start of the user input is written. Therefore, when the
`vuln` function returns with a `ret` instruction @0x08049dc0, `eip` is set to
bytes 28-32 of the input. We confirm this by sending an input containing 28
bytes of padding followed by the value `0xdeadbeef` (little-ending encoded) to
observe the program crash due to the `eip` register containing the value
`0xdeadbeef`.

```
0                                28         32
[---------------padding---------][efbeaddde]
```

Ideally, we would return directly to the data we wrote to the stack in the
`buf` buffer. However, the address of the stack buffer is not known
_a priori_ due to stack address randomization. To overcome this, we observe
that at the point in program execution immediately before executing the `ret`
instruction in `vuln` (@0x08049dc0), the `eax` register is set to the address
of the `buf` buffer where our inputs are written. Therefore, we can use ROP
gadgets to set `eip` indirectly to the address in `eax`. Fortunately, the
binary contains a `jmp eax` gadget:

```
eax
 |
 V
 0                               28        32
 [--------------padding---------][@JMP-EAX]
```

Now, the vulnerable program will return program execution to the `jmp eax`
gadget and set `eip` to the address of `buf` where our padding values are.
Therefore, we could place our shellcode at the beginning of the input:

```
eax
 |
 V
 0                               28        32
 [shellcode][---padding---------][@JMP-EAX]
```

However, 28 bytes is not a lot of space; the pwntools x86 Linux `/bin/sh`
shellcode is 42 bytes long and will not fit in the padding space. Rather than
trying to minimize the shellcode to squeeze it in, we instead place a single
`jmp` instruction at the beginning of the input that jumps forward 32 bytes (a
trampoline), and then place the full shellcode _after_ the gadget, where we
have no limitation on the size of the shellcode. The only remaining constraint
is that the input cannot contain any newline characters.

```
eax
 |
 V
 0           2                    28        32
 [jmp $+0x20][---padding---------][@JMP-EAX][----shellcode----]
  |                                          ^
  |                                          |
  --------------------------------------------
```

Executing the vulnerable program with this input results in the execution of
a `/bin/sh` shell to read the flag. See the `solve.py` script for proof of
concept.

**Exploit primitives used**:
1. Local stack buffer overwrite to overwrite saved return address
2. Overwrite saved return address to control instruction pointer
3. Control instruction pointer to execute arbitrary code

## Remediation

To patch the vulnerability, the `gets` function call should be replaced with a
size-sensitive function call like `fgets`, and restricted to only read as many
bytes as are allocated:

```
void vuln() {
  char buf[16];
  printf("How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!\n");
  return fgets(buf, sizeof buf, stdin);
}
```

Compiling the program with standard exploit mitigations would make the
vulnerability more difficult to exploit:
* a stack canary would prevent turning the local overwrite into instruction
  pointer control.
* PIE would prevent the use of program instructions as ROP gadgets.
* a non-executable stack would prevent the execution of shellcode written to
  the stack.

None of the above mitigations would guarantee that the vulnerability is not
exploitable, but they would have made exploitation more challenging.

We could search programs for more vulnerabilities of this type by conducting a
simple regex search for calls to the `gets` library function.

## Configuration Notes

Use container for development:

```
docker build -t pico-ropfu -f Dockerfile
docker run --rm -it -p $(pwd):/ctf pico-ropfu /bin/bash
```

Execute solution script against local target in container:

```
$ python3 solve.py
<snip>
[+] Starting local process '/ctf/chall/vuln': pid 88
[*] Switching to interactive mode
$ cat chall/flag.txt
THIS_IS_THE_FLAGTHIS_IS_THE_FLAGTHIS_IS_THE_FLAGTHIS_IS_THE_FLAG
```

Execute solution script and start GDB for debugging target locally in
container:

```
# Must start tmux session before script executes.
tmux

python3 solve.py GDB
```

Execute solution script against remote target (ensure that the instance is
running in the picoCTF dashboard and that the URL and port are updated in the
script):

```
python3 solve.py REMOTE
<snip>
$ cat flag.txt
```
