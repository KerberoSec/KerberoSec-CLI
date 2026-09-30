# flag

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/flag/flag.jpeg)

```
$ ./flag
I will malloc() and strcpy the flag there. take it.
```

El programa está empaquetado con UPX:
```
$ strings flag| tail
;dl]tpR
c3Rh
2B)=
1\a}
_M]h
Upbrk
makBN
su`"]R
UPX!
UPX!
$ upx -d flag
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2024
UPX 4.2.4       Markus Oberhumer, Laszlo Molnar & John Reiser    May 9th 2024

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
    887219 <-    335288   37.79%   linux/amd64   flag

Unpacked 1 file.
```

Ya desempaquetado hacemos lo que dice para encontrar la flag:
```
[0x00401058]> s main
[0x00401164]> pdf
            ; DATA XREF from entry0 @ 0x401075(r)
/ 61: int main (int argc, char **argv, char **envp);
|           ; var void *var_8h @ rbp-0x8
|           0x00401164      55             push rbp
|           0x00401165      4889e5         mov rbp, rsp
|           0x00401168      4883ec10       sub rsp, 0x10
|           0x0040116c      bf58664900     mov edi, str.I_will_malloc___and_strcpy_the_flag_there._take_it. ; 0x496658 ; "I will malloc() and strcpy the flag there. take it." ; const char *s
|           0x00401171      e80a0f0000     call sym.puts               ; int puts(const char *s)
|           0x00401176      bf64000000     mov edi, 0x64               ; 'd' ; 100 ; size_t size
|           0x0040117b      e850880000     call sym.malloc             ;  void *malloc(size_t size)
|           0x00401180      488945f8       mov qword [var_8h], rax
|           0x00401184      488b15e50e..   mov rdx, qword [obj.flag]   ; [0x6c2070:8]=0x496628 str.UPX...__sounds_like_a_delivery_service_:_ ; "(fI"
|           0x0040118b      488b45f8       mov rax, qword [var_8h]
|           0x0040118f      4889d6         mov rsi, rdx
|           0x00401192      4889c7         mov rdi, rax
|           0x00401195      e886f1ffff     call fcn.00400320
|           0x0040119a      b800000000     mov eax, 0
|           0x0040119f      c9             leave
\           0x004011a0      c3             ret
[0x00401058]> px 48@ 0x0x496628
- offset -  2829 2A2B 2C2D 2E2F 3031 3233 3435 3637  89ABCDEF01234567
0x00496628  5550 582e 2e2e 3f20 736f 756e 6473 206c  UPX...? sounds l
0x00496638  696b 6520 6120 6465 6c69 7665 7279 2073  ike a delivery s
0x00496648  6572 7669 6365 203a 2900 0000 0000 0000  ervice :).......
```

`UPX...? sounds like a delivery service :)`

