```
__________                                .__                 ___________.____   ___________
\______   \ _______  __ ___________  _____|__| ____    ____   \_   _____/|    |  \_   _____/
 |       _// __ \  \/ // __ \_  __ \/  ___/  |/    \  / ___\   |    __)_ |    |   |    __)  
 |    |   \  ___/\   /\  ___/|  | \/\___ \|  |   |  \/ /_/  >  |        \|    |___|     \   
 |____|_  /\___  >\_/  \___  >__|  /____  >__|___|  /\___  /  /_______  /|_______ \___  /   
        \/     \/          \/           \/        \//_____/           \/         \/   \/    
```
In this THM room aimed at beginners, we aim to practice our reverse engineering skills. 
[^1]

Crackme 1
-----------------------------------------------------------------------------------------
**Let's start with a basic warmup, can you run the binary?**

It is of high importance to never run any untrusted binaries in our own workstation.
Instead, we can use the virtual attacking machine provided by TryHackMe, to run the 
binary file there. After transferring the downloaded binary file to the attacking machine
with the website tool *Send Anywhere* [^2], we can execute the binary after setting the
permissions to executable with `chmod +x crackme1` and then run it with `./crackme1`.
This directly returns the flag for this task and seems pretty straightforward.

Crackme 2
-----------------------------------------------------------------------------------------
**What is the super secret password?**

Once again, we begin by executing the `./crackme2` binary as before but this time, we are
prompted with a super secret password. Instead of trying the super obvious password
"super_secret_password", we open *Ghidra* and investigate the main method. Therefore, we
find out that the input is compared to the string value of the password.

**What is the flag?**

Now, we can provide the found password and thus get the solution with the flag to this
task.

Crackme 3
-----------------------------------------------------------------------------------------
**Use basic reverse engineering skills to obtain the flag.**

Our weapon of choice, is once again Ghidra, where we search for the entry point and 
discover the function `FUN_080484f4` to be likely the main method. In there, we can see,
that the input is compared to the *Base64*-encoded string value of
`ZjByX3kwdXJfNWVjMG5kX2xlNTVvbl91bmJhc2U2NF80bGxfN2gzXzdoMW5nNQ==`. After using
`base64 -d` we thus get the flag.

Crackme 4
-----------------------------------------------------------------------------------------
**Analyze and find the password for the binary?**

After attempting to execute this binary, we are given the hint, that the password string
is hidden and that `strcmp` is used. Further, we have a look at the hint and find out,
that dynamic analysis with *IDA* or `radare2` should be used for this task. At first, we
get familiar with `radare2 -d crackme4` debugging using the `aaa` command to analyze the
code fully and proceed to look at the main method with `pdf @ main`. In here, we can 
verify that the first command-line argument is passed to the function `compare_pwd`.

```assembly
0x00400746  mov rax, qword [var_10h]
0x0040074a  add rax, 8
0x0040074e  mov rax, qword [rax]
0x00400751  mov rdi, rax
0x00400754  call sym.compare_pwd
```
Next, we want to analyze `compare_pwd` with `pdf @ sym.compare_pwd` and see that the
function constructs an encoded string using the following three variables.

```assembly
0x00400695  movabs rax, 0x7b175614497b5d49 ; 'I]{I\x14V\x17{'
0x0040069f  mov qword [var_20h], rax
0x004006a3  movabs rax, 0x547b175651474157 ; 'WAGQV\x17{T'
0x004006ad  mov qword [var_18h], rax
0x004006b1  mov word [var_10h], 0x4053 ; 'S@'
```
Because, the binary is written in *x86-64* which we found out with `info` or `file`,
we know that the bytes in memory are assorted using little-endian format as follows.

> 49 5d 7b 49 14 56 17 7b
> 57 41 47 51 56 17 7b 54
> 53 40 00

The function subsequently passes this buffer to `get_pwd` through the following three
lines.
```assembly
0x004006bb  lea rax, [var_20h]
0x004006bf  mov rdi, rax
0x004006c2  call sym.get_pwd
```
Looking at `get_pwd` with `pdf @ sym.get_pwd` we find out that each byte in the buffer
is *XOR*ed with 36 as follows.
```assembly
0x00400658  movzx eax, byte [rax]
0x0040065b  xor   eax, 0x24 ; 36
0x0040065e  mov   byte [rdx], al
```
This way, we can now reconstruct the entire buffer to the secret password with
`49 XOR 24 = 6D = 'm'` and the other bytes. Alternatively, we can confirm this with
`strcmp` since `compare_pwd` calls `sym.imp.strcmp` directly. By setting a breakpoint
immediately before `strcmp` after providing a password with `db 0x4006d5` we know that
`rdi` is the first argument to `strcmp`, i.e. the generated password and `rsi` the second
one, i.e. the user input. Finally, we can run `psz @ rdi` to directly print the expected
password at runtime. From the *Official Radare2 Book* [^3] we further collected more
commands that are of use when reverse engineering binaries dynamically and statically
in `radare2`.
```
> aaa          # analyse the program (r2 -A)
> afl          # list all functions (try aflt, aflm)
> px 32        # print 32 byte hexdump current block
> s sym.main   # seek to main (using flag name)
> f~foo        # filter flags matching 'foo' (internal |grep)
> iS;is        # list sections and symbols (rabin2 -Ss)
> pdf; agf     # disassembly and ascii-art function graph
> oo+;w hello  # reopen in read-write and write a string
> ?*~...       # interactive filter in all command help
```

Crackme 5
-----------------------------------------------------------------------------------------
**What will be the input of the file to get the output `Good game`?**

First, we start by running the binary without any further input but are prompted *Always
dig deeper* instead of the expected *Good game* output. So, we start IDA or Radare2 with
`radare2 -d crackme5` and start analyzing the binary with the command `aaa`. Next, we
want to list all the functions with `afl` and thus discover the main entry point which
should be further investigated with `s main`. Now, we can print the assembled code with
`pdf` and immediately get suspicios of a hard-coded string.
```assembly
0x00400791  mov byte [var_30h], 0x4f ; 'O' ; 79
0x00400795  mov byte [var_2fh], 0x66 ; 'f' ; 102
0x00400799  mov byte [var_2eh], 0x64 ; 'd' ; 100
0x0040079d  mov byte [var_2dh], 0x6c ; 'l' ; 108
0x004007a1  mov byte [var_2ch], 0x44 ; 'D' ; 68
0x004007a5  mov byte [var_2bh], 0x53 ; 'S' ; 83
0x004007a9  mov byte [var_2ah], 0x41 ; 'A' ; 65
0x004007ad  mov byte [var_29h], 0x7c ; '|' ; 124
0x004007b1  mov byte [var_28h], 0x33 ; '3' ; 51
0x004007b5  mov byte [var_27h], 0x74 ; 't' ; 116
0x004007b9  mov byte [var_26h], 0x58 ; 'X' ; 88
0x004007bd  mov byte [var_25h], 0x62 ; 'b' ; 98
0x004007c1  mov byte [var_24h], 0x33 ; '3' ; 51
0x004007c5  mov byte [var_23h], 0x32 ; '2' ; 50
0x004007c9  mov byte [var_22h], 0x7e ; '~' ; 126
0x004007cd  mov byte [var_21h], 0x58 ; 'X' ; 88
0x004007d1  mov byte [var_20h], 0x33 ; '3' ; 51
0x004007d5  mov byte [var_1fh], 0x74 ; 't' ; 116
0x004007d9  mov byte [var_1eh], 0x58 ; 'X' ; 88
0x004007dd  mov byte [var_1dh], 0x40 ; '@' ; elf_phdr
0x004007e1  mov byte [var_1ch], 0x73 ; 's' ; 115
0x004007e5  mov byte [var_1bh], 0x58 ; 'X' ; 88
0x004007e9  mov byte [var_1ah], 0x60 ; '`' ; 96
0x004007ed  mov byte [var_19h], 0x34 ; '4' ; 52
0x004007f1  mov byte [var_18h], 0x74 ; 't' ; 116
0x004007f5  mov byte [var_17h], 0x58 ; 'X' ; 88
0x004007f9  mov byte [var_16h], 0x74 ; 't' ; 116
0x004007fd  mov byte [var_15h], 0x7a ; 'z' ; 122
```
As it turns out, that string is later compared against the input value and only when
they match, the output is *Good game*.
```assembly
0x00400801  mov edi, str.Enter_your_input: ; 0x400954 ; "Enter your input:"
0x00400806  call sym.imp.puts ; int puts(const char *s)
0x0040080b  lea rax, [var_50h]
0x0040080f  mov rsi, rax
0x00400812  mov edi, 0x400966
0x00400817  mov eax, 0
0x0040081c  call sym.imp.__isoc99_scanf ; int scanf(const char *format)
0x00400821  lea rdx, [var_30h] ;                                        Get the address of the hard-coded string
0x00400825  lea rax, [var_50h] ;                                        Get the user's input and save it in rax
0x00400829  mov rsi, rdx ;                                              Copy the hard-coded string rdx to RSI
0x0040082c  mov rdi, rax ;                                              Copy the user's input rax to RDI
0x0040082f  call sym.strcmp_ ;                                          Compare RSI and RDI to be equal
0x00400834  mov dword [var_54h], eax
0x00400837  cmp dword [var_54h], 0 ;                                    Compare the result to zero (equal)
0x0040083b  jne 0x400849 ;                                              If result not zero move to false output
0x0040083d  mov edi, str.Good_game ; 0x400969 ; "Good game"
0x00400842  call sym.imp.puts ; int puts(const char *s)
0x00400847  jmp 0x400853
0x00400849  mov edi, str.Always_dig_deeper ; 0x400973 ; "Always dig deeper"
```
Therefore, we want to enter the string from the hard-coded memory into the input in order
to get the *Good game* output.

Crackme 6
-----------------------------------------------------------------------------------------
**Analyze the binary for the easy password.**

First, we open the `crackme6` file in Ghidra and navigate to the main function. This code
only provides us with the hint that we the password input is used in the `compare_pwd()`
function which then uses the `my_secure_test()` function. Upon having a look at this
function, we find out that the input string is given eight substantial character tests 
that compare all characters in the provided password to a hard-coded sequence of 
characters. By reading the hard-coded char sequence, we thus easily obtain the correct 
password for the guessing game.

Crackme 7
-----------------------------------------------------------------------------------------
**Analyze the binary to get the flag.**

After dynamically running the binary, we find out that there are at least three options
to choose from: Say hello to a name, add two numbers or quit. However, we are interested
whether there are even more options and so we open the binary in Radare2 with
`radare2 -d crackme7` and proceed to analyze the file with `aaa`. Then, we can list the
found functions with `afl` and already discover an interesting `sym.giveFlag` function.
However, upon printing it we can not immediately understand how the flag is generated
and thus move on to `s main` where `pdf` gives us information on how to reach that
function call.
```assembly
0x08048665  cmp eax, 0x7a69 ;                                           Compare the input to 0x7a69 (31337)
0x0804866a  jne 0x8048683 ;                                             If they are not equal move to false
0x0804866c  sub esp, 0xc
0x0804866f  push str.Wow_such_h4x0r_ ; 0x80488bc ; "Wow such h4x0r!"
0x0804867c  call sym.giveFlag ;                                         Otherwise call the sym.giveFlag function
```
So, it becomes clear to us, that instead of entering 1, 2, or 3 in the menu, we want to
enter *31337* which is the decimal for *0x7a69* in order to trigger the flag printing 
function call.

Crackme 8
-----------------------------------------------------------------------------------------
**Analyze the binary and obtain the flag.**

Once again, we first start the binary in our virtual attacking machine in order to find
out that we need to provide a password argument. So, we start `radare2 -d crackme8` to
probe the assembly code for some interesting details about the secret password. Again,
there is a `sym.giveFlag` function which seems a bit confusing to understand. Instead,
we want to understand what the `pdf @ main` function does in order to reach that point.
In here, we can locate the comparison that decides whether to jump to the access granted
block by comparing the input value to the hexadecimal hard-coded value of *0xCAFEF00D*.
```assembly
0x080484e4  cmp eax, 0xcafef00d ;                                       Compare the input value to 0xCAFEF00D
0x080484e9  je 0x8048502 ;                                              If they equal move to the success block
<--snip-->
0x08048502  sub esp, 0xc
0x08048505  push str.Access_granted. ; 0x8048683 ; "Access granted."
0x0804850a  call sym.imp.puts ; int puts(const char *s)
0x0804850f  add esp, 0x10
0x08048512  call sym.giveFlag
```
Since the program won't accept a hexadecimal input, we need to convert this value to a
decimal one first. Note, that `atoi()` is used in the binary to take the input into EAX
as a signed 32-bit integer. So, we can use any of the hexadecimal to integer conversion
tools to find out that the password should be *-889262067* in order to grant access and
print the flag. [^4]

[^1]: https://tryhackme.com/room/reverselfiles
[^2]: https://send-anywhere.com/
[^3]: https://book.rada.re/analysis/code_analysis.html
[^4]: https://www.rapidtables.com/convert/number/hex-to-decimal.html?x=CAFEF00D
