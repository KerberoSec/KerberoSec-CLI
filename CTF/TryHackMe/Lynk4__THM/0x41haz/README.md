# 0x41haz
---
[CHALLENGE-LINK](https://tryhackme.com/r/room/0x41haz)

In this challenge, you are asked to solve a simple reversing solution. Download and analyze the binary to discover the password.

A executable file is provided.

when checking it's file types it gives an error message for os ***unknown arch 0x3e00* (SYSV)**
googling it gives me a solution **you need to patch the sixth byte (0x02) to 0x01.**

**FROM THIS**
---
<img width="1266" alt="Screenshot 2024-03-27 at 8 39 38 PM" src="https://github.com/Lynk4/THM/assets/44930131/f82ce45d-e34e-4837-866d-55558a69b4a4">

---
**TO THIS**

<img width="1271" alt="Screenshot 2024-03-27 at 8 38 51 PM" src="https://github.com/Lynk4/THM/assets/44930131/e1e7fdc0-ee0d-4f94-a260-b61c74098e1c">

---

<img width="1282" alt="Screenshot 2024-03-27 at 8 37 15 PM" src="https://github.com/Lynk4/THM/assets/44930131/5b003ca6-a577-4246-8229-eeb438ae9276">

---

AFTER THAT execute it

<img width="617" alt="Screenshot 2024-03-27 at 8 43 17 PM" src="https://github.com/Lynk4/THM/assets/44930131/3f2b0b8d-4d5a-4a4a-b322-a9fce3ba4bf2">

asking for a password..

### Now open it in radare2 to analyze it...

By analyzing the main function you will get the password:

```

❯ r2 -d ./0x41haz-1640335532346.0x41haz
[0x7f9267b88360]> aaa
[x] Analyze all flags starting with sym. and entry0 (aa)
[x] Analyze function calls (aac)
[x] Analyze len bytes of instructions for references (aar)
[x] Finding and parsing C++ vtables (avrr)
[x] Skipping type matching analysis in debugger mode (aaft)
[x] Propagate noreturn information (aanr)
[x] Use -AA or aaaa to perform additional experimental analysis.
[0x7f9267b88360]> afl
0x55b77e60e080    1 43           entry0
0x55b77e610fe0    1 4124         reloc.__libc_start_main
0x55b77e60e030    1 6            sym.imp.puts
0x55b77e60e040    1 6            sym.imp.strlen
0x55b77e60d000    2 40           loc.imp._ITM_deregisterTMCloneTable
0x55b77e60e050    1 6            sym.imp.gets
0x55b77e60e060    1 6            sym.imp.exit
0x55b77e60e070    1 6            sym.imp.__cxa_finalize
0x55b77e60e165    8 219          main
0x55b77e60e160    5 133  -> 56   entry.init0
0x55b77e60e120    5 57   -> 50   entry.fini0
0x55b77e60e0b0    4 41   -> 34   fcn.55b77e60e0b0
[0x7f9267b88360]> pdf @main
            ; DATA XREF from entry0 @ 0x55b77e60e09d
┌ 219: int main (int argc, char **argv, char **envp);
│           ; var int64_t var_40h @ rbp-0x40
│           ; var int64_t var_16h @ rbp-0x16
│           ; var int64_t var_eh @ rbp-0xe
│           ; var int64_t var_ah @ rbp-0xa
│           ; var int64_t var_8h @ rbp-0x8
│           ; var int64_t var_4h @ rbp-0x4
│           0x55b77e60e165      55             push rbp
│           0x55b77e60e166      4889e5         mov rbp, rsp
│           0x55b77e60e169      4883ec40       sub rsp, 0x40
│           0x55b77e60e16d      48b832404032.  movabs rax, 0x6667243532404032 ; '2@@25$gf'
│           0x55b77e60e177      488945ea       mov qword [var_16h], rax
│           0x55b77e60e17b      c745f2735426.  mov dword [var_eh], 0x40265473 ; 'sT&@'
│           0x55b77e60e182      66c745f64c00   mov word [var_ah], 0x4c ; 'L' ; 76
│           0x55b77e60e188      488d3d790e00.  lea rdi, str._nHey___Can_You_Crackme___n ; 0x55b77e60f008 ; "=======================\nHey , Can You Crackme ?\n======================="
│           0x55b77e60e18f      e89cfeffff     call sym.imp.puts       ; int puts(const char *s)
│           0x55b77e60e194      488d3db50e00.  lea rdi, str.Its_jus_a_simple_binary__n ; 0x55b77e60f050 ; "It's jus a simple binary \n"
│           0x55b77e60e19b      e890feffff     call sym.imp.puts       ; int puts(const char *s)
│           0x55b77e60e1a0      488d3dc40e00.  lea rdi, str.Tell_Me_the_Password_: ; 0x55b77e60f06b ; "Tell Me the Password :"
│           0x55b77e60e1a7      e884feffff     call sym.imp.puts       ; int puts(const char *s)
│           0x55b77e60e1ac      488d45c0       lea rax, [var_40h]
│           0x55b77e60e1b0      4889c7         mov rdi, rax
│           0x55b77e60e1b3      b800000000     mov eax, 0
│           0x55b77e60e1b8      e893feffff     call sym.imp.gets       ; char *gets(char *s)
│           0x55b77e60e1bd      488d45c0       lea rax, [var_40h]
│           0x55b77e60e1c1      4889c7         mov rdi, rax
│           0x55b77e60e1c4      e877feffff     call sym.imp.strlen     ; size_t strlen(const char *s)
│           0x55b77e60e1c9      8945f8         mov dword [var_8h], eax
│           0x55b77e60e1cc      837df80d       cmp dword [var_8h], 0xd
│       ┌─< 0x55b77e60e1d0      7416           je 0x55b77e60e1e8
│       │   0x55b77e60e1d2      488d3daf0e00.  lea rdi, str.Is_it_correct___I_dont_think_so. ; 0x55b77e60f088 ; "Is it correct , I don't think so."
│       │   0x55b77e60e1d9      e852feffff     call sym.imp.puts       ; int puts(const char *s)
│       │   0x55b77e60e1de      bf00000000     mov edi, 0
│       │   0x55b77e60e1e3      e878feffff     call sym.imp.exit
│       └─> 0x55b77e60e1e8      c745fc000000.  mov dword [var_4h], 0
│       ┌─< 0x55b77e60e1ef      eb34           jmp 0x55b77e60e225
│      ┌──> 0x55b77e60e1f1      8b45fc         mov eax, dword [var_4h]
│      ╎│   0x55b77e60e1f4      4898           cdqe
│      ╎│   0x55b77e60e1f6      0fb65405ea     movzx edx, byte [rbp + rax - 0x16]
│      ╎│   0x55b77e60e1fb      8b45fc         mov eax, dword [var_4h]
│      ╎│   0x55b77e60e1fe      4898           cdqe
│      ╎│   0x55b77e60e200      0fb64405c0     movzx eax, byte [rbp + rax - 0x40]
│      ╎│   0x55b77e60e205      38c2           cmp dl, al
│     ┌───< 0x55b77e60e207      7506           jne 0x55b77e60e20f
│     │╎│   0x55b77e60e209      8345fc01       add dword [var_4h], 1
│    ┌────< 0x55b77e60e20d      eb16           jmp 0x55b77e60e225
│    │└───> 0x55b77e60e20f      488d3d940e00.  lea rdi, str.Nope       ; 0x55b77e60f0aa ; "Nope"
│    │ ╎│   0x55b77e60e216      e815feffff     call sym.imp.puts       ; int puts(const char *s)
│    │ ╎│   0x55b77e60e21b      bf00000000     mov edi, 0
│    │ ╎│   0x55b77e60e220      e83bfeffff     call sym.imp.exit
│    │ ╎│   ; CODE XREFS from main @ 0x55b77e60e1ef, 0x55b77e60e20d
│    └──└─> 0x55b77e60e225      8b45fc         mov eax, dword [var_4h]
│      ╎    0x55b77e60e228      3b45f8         cmp eax, dword [var_8h]
│      └──< 0x55b77e60e22b      7cc4           jl 0x55b77e60e1f1
│           0x55b77e60e22d      488d3d7b0e00.  lea rdi, str.Well_Done___ ; 0x55b77e60f0af ; "Well Done !!"
│           0x55b77e60e234      e8f7fdffff     call sym.imp.puts       ; int puts(const char *s)
│           0x55b77e60e239      b800000000     mov eax, 0
│           0x55b77e60e23e      c9             leave
└           0x55b77e60e23f      c3             ret
[0x7f9267b88360]> 
```

---
<img width="1296" alt="Screenshot 2024-03-27 at 8 29 22 PM" src="https://github.com/Lynk4/THM/assets/44930131/1db974e8-d77b-4fbe-98e4-8e9a2b08690b">

---

password:
```
2@@25$gfsT&@L
```

flag:
```
THM{2@@25$gfsT&@L}
```
---

