# c0rrupt

# Descripción
We found this [file](https://jupiter.challenges.picoctf.org/static/ab30fcb7d47364b4190a7d3d40edb551/mystery). Recover the flag.
# Pistas
Try fixing the file header
# Solución

```bash
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ file mystery 
mystery: data
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ xxd -g 1 mystery | head
00000000: 89 65 4e 34 0d 0a b0 aa 00 00 00 0d 43 22 44 52  .eN4........C"DR
00000010: 00 00 06 6a 00 00 04 47 08 02 00 00 00 7c 8b ab  ...j...G.....|..
00000020: 78 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00  x....sRGB.......
00000030: 00 04 67 41 4d 41 00 00 b1 8f 0b fc 61 05 00 00  ..gAMA......a...
00000040: 00 09 70 48 59 73 aa 00 16 25 00 00 16 25 01 49  ..pHYs...%...%.I
00000050: 52 24 f0 aa aa ff a5 ab 44 45 54 78 5e ec bd 3f  R$......DETx^..?
00000060: 8e 64 cd 71 bd 2d 8b 20 20 80 90 41 83 02 08 d0  .d.q.-.  ..A....
00000070: f9 ed 40 a0 f3 6e 40 7b 90 23 8f 1e d7 20 8b 3e  ..@..n@{.#... .>
00000080: b7 c1 0d 70 03 74 b5 03 ae 41 6b f8 be a8 fb dc  ...p.t...Ak.....
00000090: 3e 7d 2a 22 33 6f de 5b 55 dd 3d 3d f9 20 91 88  >}*"3o.[U.==. ..
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ cp mystery flag.png 
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ printf '\x89\x50\x4E\x47\x0D\x0A\x1A\x0A' | dd of=flag.png bs=1 seek=0 count=8 conv=notrunc
8+0 records in
8+0 records out
8 bytes copied, 0.000442799 s, 18.1 kB/s
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ printf '\x00\x00\x00\x0D\x49\x48\x44\x52' | dd of=flag.png bs=1 seek=8 count=8 conv=notrunc
8+0 records in
8+0 records out
8 bytes copied, 0.000442691 s, 18.1 kB/s
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ xxd -g 1 flag.png | head
00000000: 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52  .PNG........IHDR
00000010: 00 00 06 6a 00 00 04 47 08 02 00 00 00 7c 8b ab  ...j...G.....|..
00000020: 78 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00  x....sRGB.......
00000030: 00 04 67 41 4d 41 00 00 b1 8f 0b fc 61 05 00 00  ..gAMA......a...
00000040: 00 09 70 48 59 73 aa 00 16 25 00 00 16 25 01 49  ..pHYs...%...%.I
00000050: 52 24 f0 aa aa ff a5 ab 44 45 54 78 5e ec bd 3f  R$......DETx^..?
00000060: 8e 64 cd 71 bd 2d 8b 20 20 80 90 41 83 02 08 d0  .d.q.-.  ..A....
00000070: f9 ed 40 a0 f3 6e 40 7b 90 23 8f 1e d7 20 8b 3e  ..@..n@{.#... .>
00000080: b7 c1 0d 70 03 74 b5 03 ae 41 6b f8 be a8 fb dc  ...p.t...Ak.....
00000090: 3e 7d 2a 22 33 6f de 5b 55 dd 3d 3d f9 20 91 88  >}*"3o.[U.==. ..
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ file flag.png 
flag.png: PNG image data, 1642 x 1095, 8-bit/color RGB, non-interlaced
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ pngcheck flag.png 
zlib warning:  different version (expected 1.2.13, using 1.2.11)

flag.png  CRC error in chunk pHYs (computed 38d82c82, expected 495224f0)
ERROR: flag.png
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ xxd -g 1 -s 0x3e -l $((4+4+9+4)) flag.png 
0000003e: 00 00 00 09 70 48 59 73 aa 00 16 25 00 00 16 25  ....pHYs...%...%
0000004e: 01 49 52 24 f0                                   .IR$.
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ printf '\x00' | dd of=flag.png bs=1 seek=70 count=1 conv=notrunc
1+0 records in
1+0 records out
1 byte copied, 0.000537809 s, 1.9 kB/s
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ pngcheck flag.png                    
zlib warning:  different version (expected 1.2.13, using 1.2.11)

flag.png  invalid chunk length (too large)
ERROR: flag.png
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ xxd -g 1 -s 0x53 -l 8 flag.png 
00000053: aa aa ff a5 ab 44 45 54                          .....DET
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ printf 'IDAT' | dd of=flag.png bs=1 seek=87 count=4 conv=notrunc
4+0 records in
4+0 records out
4 bytes copied, 0.000554235 s, 7.2 kB/s

┌──(kali㉿kali)-[~/Descargas]
└─$ binwalk -R "IDAT" flag.png 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
87            0x57            Raw signature (IDAT)
65544         0x10008         Raw signature (IDAT)
131080        0x20008         Raw signature (IDAT)
196616        0x30008         Raw signature (IDAT)

                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ printf '\x00\x00' | dd of=flag.png bs=1 seek=83 count=2 conv=notrunc
2+0 records in
2+0 records out
2 bytes copied, 0.000496618 s, 4.0 kB/s
                                                                                                                  
┌──(kali㉿kali)-[~/Descargas]
└─$ pngcheck flag.png                                          
zlib warning:  different version (expected 1.2.13, using 1.2.11)

OK: flag.png (1642x1095, 24-bit RGB, non-interlaced, 96.3%).

Al abrir la imagen, podemos leer la siguiente bandera:

picoCTF{c0rrupt10n_1847995}
```

# Bandera
picoCTF{c0rrupt10n_1847995}