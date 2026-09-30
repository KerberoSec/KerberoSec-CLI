# tunn3l_v1s10n

# Descripción
We found this [file](https://mercury.picoctf.net/static/01be2b38ba97802285a451b94505ea75/tunn3l_v1s10n). Recover the flag.
# Pistas
Weird that it won't display right...
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ file tunn3l_v1s10n 
tunn3l_v1s10n: data
adalh4ck1ng-picoctf@webshell:~$ xxd -g 1 tunn3l_v1s10n | head
00000000: 42 4d 8e 26 2c 00 00 00 00 00 ba d0 00 00 ba d0  BM.&,...........
00000010: 00 00 6e 04 00 00 32 01 00 00 01 00 18 00 00 00  ..n...2.........
00000020: 00 00 58 26 2c 00 25 16 00 00 25 16 00 00 00 00  ..X&,.%...%.....
00000030: 00 00 00 00 00 00 23 1a 17 27 1e 1b 29 20 1d 2a  ......#..'..) .*
00000040: 21 1e 26 1d 1a 31 28 25 35 2c 29 33 2a 27 38 2f  !.&..1(%5,)3*'8/
00000050: 2c 2f 26 23 33 2a 26 2d 24 20 3b 32 2e 32 29 25  ,/&#3*&-$ ;2.2)%
00000060: 30 27 23 33 2a 26 38 2c 28 36 2b 27 39 2d 2b 2f  0'#3*&8,(6+'9-+/
00000070: 26 23 1d 12 0e 23 17 11 29 16 0e 55 3d 31 97 76  &#...#..)..U=1.v
00000080: 66 8b 66 52 99 6d 56 9e 70 58 9e 6f 54 9c 6f 54  f.fR.mV.pX.oT.oT
00000090: ab 7e 63 ba 8c 6d bd 8a 69 c8 97 71 c1 93 71 c1  .~c..m..i..q..q.
adalh4ck1ng-picoctf@webshell:~$ cp tunn3l_v1s10n tunn3l_v1s10n.bmp

Si abrimos el archivo con la extension bmp, nos aparece un mensaje "notaflag{sorry}"

adalh4ck1ng-picoctf@webshell:~$ cp tunn3l_v1s10n tunn3l_v1s10n.bmp
adalh4ck1ng-picoctf@webshell:~$ exiftool tunn3l_v1s10n.bmp
ExifTool Version Number         : 12.40
File Name                       : tunn3l_v1s10n.bmp
Directory                       : .
File Size                       : 2.8 MiB
File Modification Date/Time     : 2023:03:29 23:35:05+00:00
File Access Date/Time           : 2023:03:29 23:35:05+00:00
File Inode Change Date/Time     : 2023:03:29 23:35:05+00:00
File Permissions                : -rw-rw-r--
File Type                       : BMP
File Type Extension             : bmp
MIME Type                       : image/bmp
BMP Version                     : Unknown (53434)
Image Width                     : 1134
Image Height                    : 306
Planes                          : 1
Bit Depth                       : 24
Compression                     : None
Image Length                    : 2893400
Pixels Per Meter X              : 5669
Pixels Per Meter Y              : 5669
Num Colors                      : Use BitDepth
Num Important Colors            : All
Red Mask                        : 0x27171a23
Green Mask                      : 0x20291b1e
Blue Mask                       : 0x1e212a1d
Alpha Mask                      : 0x311a1d26
Color Space                     : Unknown (,5%()
Rendering Intent                : Unknown (826103054)
Image Size                      : 1134x306
Megapixels                      : 0.347
adalh4ck1ng-picoctf@webshell:~$ stat tunn3l_v1s10n.bmp | grep Size
  Size: 2893454         Blocks: 5656       IO Block: 4096   regular file

adalh4ck1ng-picoctf@webshell:~$ xxd -g 1 tunn3l_v1s10n.bmp | head -1
00000000: 42 4d 8e 26 2c 00 00 00 00 00 36 00 00 00 28 00  BM.&,.....6...(.

adalh4ck1ng-picoctf@webshell:~$ xxd -g 1 tunn3l_v1s10n.bmp | head -2
00000000: 42 4d 8e 26 2c 00 00 00 00 00 36 00 00 00 28 00  BM.&,.....6...(.
00000010: 00 00 6e 04 00 00 52 03 00 00 01 00 18 00 00 00  ..n...R.........

Al abrir la imagen podemos observar la siguiente bandera

flag: picoCTF{qu1t3_a_v13w_2020}
```

# Bandera
"picoCTF{qu1t3_a_v13w_2020}"
