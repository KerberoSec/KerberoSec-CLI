# Easy Flag

Catagory | Points | Players solved
---------|--------|---------------
Reverse Engineering | 50 | ???

## Description
???

## Solution

I opened the binary in gdb-peda.

```
siddh@computer:/some/directory$ gdb -q chall2
Reading symbols from chall2...(no debugging symbols found)...done.
gdb-peda$ pdisas main
Dump of assembler code for function main:
   0x0000000000400686 <+0>:                             push   rbp
   0x0000000000400687 <+1>:                             mov    rbp,rsp
   0x000000000040068a <+4>:                             sub    rsp,0x30
   0x000000000040068e <+8>:                             mov    rax,QWORD PTR fs:0x28
   0x0000000000400697 <+17>:                            mov    QWORD PTR [rbp-0x8],rax
   0x000000000040069b <+21>:                            xor    eax,eax
   0x000000000040069d <+23>:                            mov    edi,0x4008c4
   0x00000000004006a2 <+28>:                            call   0x400520 <puts@plt>
   0x00000000004006a7 <+33>:                            lea    rax,[rbp-0x30]
   0x00000000004006ab <+37>:                            mov    rsi,rax
   0x00000000004006ae <+40>:                            mov    edi,0x4008d4
   0x00000000004006b3 <+45>:                            mov    eax,0x0
   0x00000000004006b8 <+50>:                            call   0x400560 <__isoc99_scanf@plt>
   0x00000000004006bd <+55>:                            movzx  eax,BYTE PTR [rbp-0x30]
   0x00000000004006c1 <+59>:                            cmp    al,0x69
   0x00000000004006c3 <+61>:                            jne    0x400816 <main+400>
   0x00000000004006c9 <+67>:                            movzx  eax,BYTE PTR [rbp-0x2f]
   0x00000000004006cd <+71>:                            cmp    al,0x6e
   0x00000000004006cf <+73>:                            jne    0x400816 <main+400>
   0x00000000004006d5 <+79>:                            movzx  eax,BYTE PTR [rbp-0x2e]
   0x00000000004006d9 <+83>:                            cmp    al,0x63
   0x00000000004006db <+85>:                            jne    0x400816 <main+400>
   0x00000000004006e1 <+91>:                            movzx  eax,BYTE PTR [rbp-0x2d]
   0x00000000004006e5 <+95>:                            cmp    al,0x74
   0x00000000004006e7 <+97>:                            jne    0x400816 <main+400>
   0x00000000004006ed <+103>:                           movzx  eax,BYTE PTR [rbp-0x2c]
   0x00000000004006f1 <+107>:                           cmp    al,0x66
   0x00000000004006f3 <+109>:                           jne    0x400816 <main+400>
   0x00000000004006f9 <+115>:                           movzx  eax,BYTE PTR [rbp-0x2b]
   0x00000000004006fd <+119>:                           cmp    al,0x6a
   0x00000000004006ff <+121>:                           jne    0x400816 <main+400>
   0x0000000000400705 <+127>:                           movzx  eax,BYTE PTR [rbp-0x2a]
   0x0000000000400709 <+131>:                           cmp    al,0x7b
   0x000000000040070b <+133>:                           jne    0x400816 <main+400>
   0x0000000000400711 <+139>:                           movzx  eax,BYTE PTR [rbp-0x29]
   0x0000000000400715 <+143>:                           cmp    al,0x64
   0x0000000000400717 <+145>:                           jne    0x400816 <main+400>
   0x000000000040071d <+151>:                           movzx  eax,BYTE PTR [rbp-0x28]
   0x0000000000400721 <+155>:                           cmp    al,0x33
   0x0000000000400723 <+157>:                           jne    0x400816 <main+400>
   0x0000000000400729 <+163>:                           movzx  eax,BYTE PTR [rbp-0x27]
   0x000000000040072d <+167>:                           cmp    al,0x62
   0x000000000040072f <+169>:                           jne    0x400816 <main+400>
   0x0000000000400735 <+175>:                           movzx  eax,BYTE PTR [rbp-0x26]
   0x0000000000400739 <+179>:                           cmp    al,0x75
   0x000000000040073b <+181>:                           jne    0x400816 <main+400>
   0x0000000000400741 <+187>:                           movzx  eax,BYTE PTR [rbp-0x25]
   0x0000000000400745 <+191>:                           cmp    al,0x36
   0x0000000000400747 <+193>:                           jne    0x400816 <main+400>
   0x000000000040074d <+199>:                           movzx  eax,BYTE PTR [rbp-0x24]
   0x0000000000400751 <+203>:                           cmp    al,0x36
   0x0000000000400753 <+205>:                           jne    0x400816 <main+400>
   0x0000000000400759 <+211>:                           movzx  eax,BYTE PTR [rbp-0x23]
   0x000000000040075d <+215>:                           cmp    al,0x33
   0x000000000040075f <+217>:                           jne    0x400816 <main+400>
   0x0000000000400765 <+223>:                           movzx  eax,BYTE PTR [rbp-0x22]
   0x0000000000400769 <+227>:                           cmp    al,0x72
   0x000000000040076b <+229>:                           jne    0x400816 <main+400>
   0x0000000000400771 <+235>:                           movzx  eax,BYTE PTR [rbp-0x21]
   0x0000000000400775 <+239>:                           cmp    al,0x5f
   0x0000000000400777 <+241>:                           jne    0x400816 <main+400>
   0x000000000040077d <+247>:                           movzx  eax,BYTE PTR [rbp-0x20]
   0x0000000000400781 <+251>:                           cmp    al,0x31
   0x0000000000400783 <+253>:                           jne    0x400816 <main+400>
   0x0000000000400789 <+259>:                           movzx  eax,BYTE PTR [rbp-0x1f]
   0x000000000040078d <+263>:                           cmp    al,0x35
   0x000000000040078f <+265>:                           jne    0x400816 <main+400>
   0x0000000000400795 <+271>:                           movzx  eax,BYTE PTR [rbp-0x1e]
   0x0000000000400799 <+275>:                           cmp    al,0x5f
   0x000000000040079b <+277>:                           jne    0x400816 <main+400>
   0x000000000040079d <+279>:                           movzx  eax,BYTE PTR [rbp-0x1d]
   0x00000000004007a1 <+283>:                           cmp    al,0x79
   0x00000000004007a3 <+285>:                           jne    0x400816 <main+400>
   0x00000000004007a5 <+287>:                           movzx  eax,BYTE PTR [rbp-0x1c]
   0x00000000004007a9 <+291>:                           cmp    al,0x30
   0x00000000004007ab <+293>:                           jne    0x400816 <main+400>
   0x00000000004007ad <+295>:                           movzx  eax,BYTE PTR [rbp-0x1b]
   0x00000000004007b1 <+299>:                           cmp    al,0x75
   0x00000000004007b3 <+301>:                           jne    0x400816 <main+400>
   0x00000000004007b5 <+303>:                           movzx  eax,BYTE PTR [rbp-0x1a]
   0x00000000004007b9 <+307>:                           cmp    al,0x72
   0x00000000004007bb <+309>:                           jne    0x400816 <main+400>
   0x00000000004007bd <+311>:                           movzx  eax,BYTE PTR [rbp-0x19]
   0x00000000004007c1 <+315>:                           cmp    al,0x5f
   0x00000000004007c3 <+317>:                           jne    0x400816 <main+400>
   0x00000000004007c5 <+319>:                           movzx  eax,BYTE PTR [rbp-0x18]
   0x00000000004007c9 <+323>:                           cmp    al,0x66
   0x00000000004007cb <+325>:                           jne    0x400816 <main+400>
   0x00000000004007cd <+327>:                           movzx  eax,BYTE PTR [rbp-0x17]
   0x00000000004007d1 <+331>:                           cmp    al,0x72
   0x00000000004007d3 <+333>:                           jne    0x400816 <main+400>
   0x00000000004007d5 <+335>:                           movzx  eax,BYTE PTR [rbp-0x16]
   0x00000000004007d9 <+339>:                           cmp    al,0x31
   0x00000000004007db <+341>:                           jne    0x400816 <main+400>
   0x00000000004007dd <+343>:                           movzx  eax,BYTE PTR [rbp-0x15]
   0x00000000004007e1 <+347>:                           cmp    al,0x33
   0x00000000004007e3 <+349>:                           jne    0x400816 <main+400>
   0x00000000004007e5 <+351>:                           movzx  eax,BYTE PTR [rbp-0x14]
   0x00000000004007e9 <+355>:                           cmp    al,0x6e
   0x00000000004007eb <+357>:                           jne    0x400816 <main+400>
   0x00000000004007ed <+359>:                           movzx  eax,BYTE PTR [rbp-0x13]
   0x00000000004007f1 <+363>:                           cmp    al,0x64
   0x00000000004007f3 <+365>:                           jne    0x400816 <main+400>
   0x00000000004007f5 <+367>:                           movzx  eax,BYTE PTR [rbp-0x12]
   0x00000000004007f9 <+371>:                           cmp    al,0x7d
   0x00000000004007fb <+373>:                           jne    0x400816 <main+400>
   0x00000000004007fd <+375>:                           mov    edi,0x4008d7
   0x0000000000400802 <+380>:                           mov    eax,0x0
   0x0000000000400807 <+385>:                           call   0x400540 <printf@plt>
   0x000000000040080c <+390>:                           mov    edi,0x0
   0x0000000000400811 <+395>:                           call   0x400570 <exit@plt>
   0x0000000000400816 <+400>:                           mov    edi,0x4008e0
   0x000000000040081b <+405>:                           mov    eax,0x0
   0x0000000000400820 <+410>:                           call   0x400540 <printf@plt>
   0x0000000000400825 <+415>:                           mov    eax,0x0
   0x000000000040082a <+420>:                           mov    rdx,QWORD PTR [rbp-0x8]
   0x000000000040082e <+424>:                           xor    rdx,QWORD PTR fs:0x28
   0x0000000000400837 <+433>:                           je     0x40083e <main+440>
   0x0000000000400839 <+435>:                           call   0x400530 <__stack_chk_fail@plt>
   0x000000000040083e <+440>:                           leave
   0x000000000040083f <+441>:                           ret
End of assembler dump.
gdb-peda$
```

Hmm.... The key statements are those `cmp` statements. It's comparing the character to some hex value.

Those hex values turns out to be valid ASCII ones (what do you expect for less points?)! We can convert them to get our flag.

Flag == inctfj{d3bu663r_15_y0ur_fr13nd}
