# Level 12 -> 13

# Descripción
The password for the next level is stored in the file **data.txt**, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work using mkdir. For example: mkdir /tmp/myname123. Then copy the datafile using cp, and rename it using mv (read the manpages!)
# Datos de acceso
bandit12
JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv
# Solución
```bash
bandit12@bandit:~$ ls
data.txt
bandit12@bandit:~$ cat data.txt
00000000: 1f8b 0808 8e0b bf63 0203 6461 7461 322e  .......c..data2.
00000010: 6269 6e00 013c 02c3 fd42 5a68 3931 4159  bin..<...BZh91AY
00000020: 2653 598c b471 f700 0014 ffff fa59 c6c5  &SY..q.......Y..
00000030: af63 cfff af73 ffff bdb7 7c9f b1fb eafa  .c...s....|.....
00000040: bfff fb9f f9fe bdbf ffeb ffef b001 3b2c  ..............;,
00000050: 5900 0341 a064 007a 8003 40d0 6869 a068  Y..A.d.z..@.hi.h
00000060: 3464 007a 81a0 0680 3401 90d0 6800 00d1  4d.z....4...h...
00000070: a0c9 a680 f51e 9a83 27a4 3d4f 4991 0000  ........'.=OI...
00000080: 69a6 803d 4001 9001 a686 8c40 0d00 d3d2  i..=@......@....
00000090: 0d00 0d06 08f5 0323 4034 069e a340 0da8  .......#@4...@..
000000a0: 3d46 83ca 0343 41a0 3400 e9a0 d07a 8680  =F...CA.4....z..
000000b0: 3ca3 d47a 8068 0079 4006 8d0c 8034 d068  <..z.h.y@....4.h
000000c0: d03d 401a 0680 0d00 0683 407a 8680 6834  .=@.......@z..h4
000000d0: 0034 0003 ca64 00b9 6862 e5be 0fc5 ac97  .4...d..hb......
000000e0: 996a 03e6 d176 bda4 7989 5466 5357 2377  .j...v..y.TfSW#w
000000f0: c649 da83 6000 9590 c894 43c6 15af 09a0  .I..`.....C.....
00000100: 70ed 0855 6686 86d9 7adc a308 5356 477f  p..Uf...z...SVG.
00000110: 2824 ad8f 98eb e55a 4b28 0026 2a95 886e  ($.....ZK(.&*..n
00000120: 6b78 104d 82ba d1d4 f2a7 9d01 6a07 8f53  kx.M........j..S
00000130: c4e2 24a3 143a 7ce0 9008 f8db 81d2 ba2f  ..$..:|......../
00000140: 8e88 5b90 ef95 a918 01d3 95ed bd3e 3285  ..[..........>2.
00000150: a187 12d2 b129 508f 26a4 1fe4 e73e da97  .....)P.&....>..
00000160: f29a 13a4 e0d5 7ea0 cd40 1793 d641 d178  ......~..@...A.x
00000170: 6fd4 0289 d833 1bd1 3ca5 0a78 d0e8 67c6  o....3..<..x..g.
00000180: 37ba 9c82 32d3 19b6 90dc e44f a5d9 1c22  7...2......O..."
00000190: 435b 669d d19e 4899 9d51 1be1 8a2c 142d  C[f...H..Q...,.-
000001a0: d6a4 ff56 ae8a 28c6 2061 c16c c905 5e9a  ...V..(. a.l..^.
000001b0: ddcb 94be 229a 6130 1868 1e02 5601 65a3  ....".a0.h..V.e.
000001c0: 8849 052f b5b6 1b37 0485 b971 0f25 0670  .I./...7...q.%.p
000001d0: 5b93 e8a1 4226 0de8 f703 9cb1 014f 42ff  [...B&.......OB.
000001e0: dda4 a30a 58c7 c265 0b8b 8356 48ef b9b0  ....X..e...VH...
000001f0: 1423 0cf9 b192 80b0 a8ec 3bce 60af c828  .#........;.`..(
00000200: 32b3 1e46 4cff 11d1 2a77 7204 7fb8 c6dd  2..FL...*wr.....
00000210: 527d 2095 014c f24d 186b e2ed 03a5 f934  R} ..L.M.k.....4
00000220: 9492 648d 9c54 a06d 67b1 bd47 4219 b587  ..d..T.mg..GB...
00000230: cd2d 2dd7 039c c4a5 167a 455e 022d 8144  .--......zE^.-.D
00000240: cebe 4f05 120d 542a bfbf c5dc 914e 1424  ..O...T*.....N.$
00000250: 232d 1c7d c039 88d1 7d3c 0200 00         #-.}.9..}<...
bandit12@bandit:~$ cat data.txt | xxd -r | zcat | bzcat| zcat| tar xO| tar xO| bzcat | tar xO | zcat
The password is wbWdlBxEir4CaE8LaPhauuOo6pwRmrDw
```
# Comentarios
|cmd| desc|
|-----|----------|
|xxd| revierte el proceso de vaciado hexadecimal|
|zcat| descomprime un archivo gzip|
|bzcat| descomprime archivos|
|tar xO| descomprime un archivo tar|

# Referencias
https://en.wikipedia.org/wiki/Hex_dump