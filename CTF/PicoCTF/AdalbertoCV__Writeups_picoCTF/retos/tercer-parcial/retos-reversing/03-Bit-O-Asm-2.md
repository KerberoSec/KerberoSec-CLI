# Bit-O-Asm-2

# Descripción
Can you figure out what is in the `eax` register? Put your answer in the picoCTF flag format: `picoCTF{n}` where `n` is the contents of the `eax` register in the decimal number base. If the answer was `0x11` your flag would be `picoCTF{17}`.Download the assembly dump [here](https://artifacts.picoctf.net/c/510/disassembler-dump0_b.txt).
# Pistas
`PTR`'s or 'pointers', reference a location in memory where values can be stored.
# Solución

```bash
┌──(kali㉿kali)-[~/SegRedySis]
└─$ grep 'mov.*eax' disassembler-dump0_b.txt                    
<+22>:    mov    eax,DWORD PTR [rbp-0x4]
 
┌──(kali㉿kali)-[~/SegRedySis]
└─$ grep '\[rbp-0x4\]' disassembler-dump0_b.txt
<+15>:    mov    DWORD PTR [rbp-0x4],0x9fe1a
<+22>:    mov    eax,DWORD PTR [rbp-0x4]

┌──(kali㉿kali)-[~/SegRedySis]
└─$ grep "eax" disassembler-dump0_b.txt
<+22>:    mov    eax,DWORD PTR [rbp-0x4]

┌──(kali㉿kali)-[~/SegRedySis]
└─$ grep '\[rbp-0x4\]' disassembler-dump0_b.txt

<+15>:    mov    DWORD PTR [rbp-0x4],0x9fe1a
<+22>:    mov    eax,DWORD PTR [rbp-0x4]

┌──(kali㉿kali)-[~/SegRedySis]
└─$ echo $((0x9fe1a))
654874

flag: picoCTF{654874}
```

# Bandera
picoCTF{654874}