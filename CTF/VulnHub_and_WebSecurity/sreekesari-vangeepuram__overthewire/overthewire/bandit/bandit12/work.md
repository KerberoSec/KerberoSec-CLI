This thing is really obscure right!
![Bandit12](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit12/level12-%3Elevel13.png)

But no worries...

Let's try now.
```
bandit12@bandit:~$ ls
data.txt
bandit12@bandit:~$ mkdir /tmp/0x7001
bandit12@bandit:~$ cp data.txt /tmp/0x7001
bandit12@bandit:~$ cd /tmp/0x7001
bandit12@bandit:/tmp/0x7001$ ls
data.txt
bandit12@bandit:/tmp/0x7001$ cat data.txt 
00000000: 1f8b 0808 0650 b45e 0203 6461 7461 322e  .....P.^..data2.
00000010: 6269 6e00 013d 02c2 fd42 5a68 3931 4159  bin..=...BZh91AY
00000020: 2653 598e 4f1c c800 001e 7fff fbf9 7fda  &SY.O...........
00000030: 9e7f 4f76 9fcf fe7d 3fff f67d abde 5e9f  ..Ov...}?..}..^.
00000040: f3fe 9fbf f6f1 feee bfdf a3ff b001 3b1b  ..............;.
00000050: 5481 a1a0 1ea0 1a34 d0d0 001a 68d3 4683  T......4....h.F.
00000060: 4680 0680 0034 1918 4c4d 190c 4000 0001  F....4..LM..@...
00000070: a000 c87a 81a3 464d a8d3 43c5 1068 0346  ...z..FM..C..h.F
00000080: 8343 40d0 3400 0340 66a6 8068 0cd4 f500  .C@.4..@f..h....
00000090: 69ea 6800 0f50 68f2 4d00 680d 06ca 0190  i.h..Ph.M.h.....
000000a0: 0000 69a1 a1a0 1ea0 194d 340d 1ea1 b280  ..i......M4.....
000000b0: f500 3406 2340 034d 3400 0000 3403 d400  ..4.#@.M4...4...
000000c0: 1a07 a832 3400 f51a 0003 43d4 0068 0d34  ...24.....C..h.4
000000d0: 6868 f51a 3d43 2580 3e58 061a 2c89 6bf3  hh..=C%.>X..,.k.
000000e0: 0163 08ab dc31 91cd 1747 599b e401 0b06  .c...1...GY.....
000000f0: a8b1 7255 a3b2 9cf9 75cc f106 941b 347a  ..rU....u.....4z
00000100: d616 55cc 2ef2 9d46 e7d1 3050 b5fb 76eb  ..U....F..0P..v.
00000110: 01f8 60c1 2201 33f0 0de0 4aa6 ec8c 914f  ..`.".3...J....O
00000120: cf8a aed5 7b52 4270 8d51 6978 c159 8b5a  ....{RBp.Qix.Y.Z
00000130: 2164 fb1f c26a 8d28 b414 e690 bfdd b3e1  !d...j.(........
00000140: f414 2f9e d041 c523 b641 ac08 0c0b 06f5  ../..A.#.A......
00000150: dd64 b862 1158 3f9e 897a 8cae 32b0 1fb7  .d.b.X?..z..2...
00000160: 3c82 af41 20fd 6e7d 0a35 2833 41bd de0c  <..A .n}.5(3A...
00000170: 774f ae52 a1ac 0fb2 8c36 ef58 537b f30a  wO.R.....6.XS{..
00000180: 1510 cab5 cb51 4231 95a4 d045 b95c ea09  .....QB1...E.\..
00000190: 9fa0 4d33 ba43 22c9 b5be d0ea eeb7 ec85  ..M3.C".........
000001a0: 59fc 8bf1 97a0 87a5 0df0 7acd d555 fc11  Y.........z..U..
000001b0: 223f fdc6 2be3 e809 c974 271a 920e acbc  "?..+....t'.....
000001c0: 0de1 f1a6 393f 4cf5 50eb 7942 86c3 3d7a  ....9?L.P.yB..=z
000001d0: fe6d 173f a84c bb4e 742a fc37 7b71 508a  .m.?.L.Nt*.7{qP.
000001e0: a2cc 9cf1 2522 8a77 39f2 716d 34f9 8620  ....%".w9.qm4.. 
000001f0: 4e33 ca36 eec0 cd4b b3e8 48e4 8b91 5bea  N3.6...K..H...[.
00000200: 01bf 7d21 0b64 82c0 3341 3424 e98b 4d7e  ..}!.d..3A4$..M~
00000210: c95c 1b1f cac9 a04a 1988 43b2 6b55 c6a6  .\.....J..C.kU..
00000220: 075c 1eb4 8ecf 5cdf 4653 064e 84da 263d  .\....\.FS.N..&=
00000230: b15b bcea 7109 5c29 c524 3afc d715 4894  .[..q.\).$:...H.
00000240: 7426 072f fc28 ab05 9603 b3fc 5dc9 14e1  t&./.(......]...
00000250: 4242 393c 7320 98f7 681d 3d02 0000       BB9<s ..h.=...
bandit12@bandit:/tmp/0x7001$ mv data.txt data.hexdump
bandit12@bandit:/tmp/0x7001$ ls
data.hexdump
bandit12@bandit:/tmp/0x7001$ xxd -r data.hexdump data2.bin
bandit12@bandit:/tmp/0x7001$ file data2.bin 
data2.bin: gzip compressed data, was "data2.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
bandit12@bandit:/tmp/0x7001$ mv data2.bin data2.gz
bandit12@bandit:/tmp/0x7001$ gunzip data2.gz 
bandit12@bandit:/tmp/0x7001$ ls
data2  data.hexdump
bandit12@bandit:/tmp/0x7001$ cat data2
BZh91AY&SY�O����ڞOv���}?��}��^���������ߣ��;�����4���h�F�F��4LM
                                                              @��z��FM��C�hF�C@�4@f��h
4hh��=C%�>X�,�k���1��GY��                                                             ��i�hPh�Mh
�J�쌑Oϊ��{RBp�Qix�Y�Z!d��j�(�搿ݳ��/��A�#�A�F��0P��v��`�"3�

                                          ��d�bX?��z��2��<��A �n}
5(3A��
      wO�R����6�XS{�
��9?L�P�yB��=z�m?�L�Nt*�7{qP��̜�%"�w9�qm4�� N3�6���K��H䋑[��}!
                                                             d��3A4$�M~�\ɠJ�C�kUƦ\���\�FSN��&=�[��q	\)�$:��H�t&/�(����]��BB9<s bandit12@bandit:/tmp/0x7001$ file data2
data2: bzip2 compressed data, block size = 900k
bandit12@bandit:/tmp/0x7001$ mv data2 data2.bz2
bandit12@bandit:/tmp/0x7001$ bz
bzcat         bzdiff        bzexe         bzgrep        bzip2recover  bzmore        
bzcmp         bzegrep       bzfgrep       bzip2         bzless        
bandit12@bandit:/tmp/0x7001$ bzip2 -d data2.bz2 
bandit12@bandit:/tmp/0x7001$ file data
data2         data.hexdump  
bandit12@bandit:/tmp/0x7001$ file data2
data2: gzip compressed data, was "data4.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
bandit12@bandit:/tmp/0x7001$ mv data2 data2.gz
bandit12@bandit:/tmp/0x7001$ gunzip data2.gz 
bandit12@bandit:/tmp/0x7001$ ls
data2  data.hexdump
bandit12@bandit:/tmp/0x7001$ file data2
data2: POSIX tar archive (GNU)
bandit12@bandit:/tmp/0x7001$ mv data2 data2.tar
bandit12@bandit:/tmp/0x7001$ tar -xvf data2.tar 
data5.bin
bandit12@bandit:/tmp/0x7001$ ls
data2.tar  data5.bin  data.hexdump
bandit12@bandit:/tmp/0x7001$ file data5.bin 
data5.bin: POSIX tar archive (GNU)
bandit12@bandit:/tmp/0x7001$ mv data5.bin data5.tar
bandit12@bandit:/tmp/0x7001$ tar -xvf data5.tar 
data6.bin
bandit12@bandit:/tmp/0x7001$ file data6.bin 
data6.bin: bzip2 compressed data, block size = 900k
bandit12@bandit:/tmp/0x7001$ mv data6.bin data6.bz2
bandit12@bandit:/tmp/0x7001$ bzip2 -d data6.bz2 
bandit12@bandit:/tmp/0x7001$ ls
data2.tar  data5.tar  data6  data.hexdump
bandit12@bandit:/tmp/0x7001$ file data6
data6: POSIX tar archive (GNU)
bandit12@bandit:/tmp/0x7001$ mv data6 data6.tar
bandit12@bandit:/tmp/0x7001$ tar -xvf data6.tar 
data8.bin
bandit12@bandit:/tmp/0x7001$ file data8.bin 
data8.bin: gzip compressed data, was "data9.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix
bandit12@bandit:/tmp/0x7001$ mv data8.bin data8.gz
bandit12@bandit:/tmp/0x7001$ gunzip data8.gz 
bandit12@bandit:/tmp/0x7001$ ls
data2.tar  data5.tar  data6.tar  data8  data.hexdump
bandit12@bandit:/tmp/0x7001$ file data8
data8: ASCII text
bandit12@bandit:/tmp/0x7001$ cat data8
The password is 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL
bandit12@bandit:/tmp/0x7001$
```
Oh gosh!
We did alot.
But what did we do?

From the challenge statement it's clear that the file `data.txt` is consisting hexdump of some anonymous file.
According to their advice we've made a directory as our work-space.

Okay but what're those commands; `hexdump`, `xxd`, `file`, `gunzip`, `bzip2`, `tar` ?!

To explain this challenge simply, it's goal is to let us know more about file [de]compressions!

The file in the home-directory `/home/bandit12/data/txt` consists the hexdump of the an anonymous file.
Then what is hexdump, well there's a better place to learn about that and it's : [https://en.wikipedia.org/wiki/Hex_dump](https://en.wikipedia.org/wiki/Hex_dump).

`xxd` is a famous tool mainly to reverse the hexdump into binary format with the option `<tag -r>` to revert it's state from hexdump -> binary.

The header of the file consists of it's name as `data2.bin`. Search about `file-headers` at Google!
Then we've used the command `file`, which simply determines the type of that file.

Files doesn't need to be the same as it look! What I mean is the relation between the real file-type and its extension-name.
So, `file` is a command which inspects the headers of the file-submitted to it as: `file <path/file-name>`.

`gzip`, `tarball`, `bzip2` are different types to file-compressions. So use manual pages [`man <command-name>`] or simply google'em.

So, to decompress these type of compressed-files we use the commands: `gunzip`, `tar`, `bzip2` with specific options to get our desired output.

That's it!

This looks a bit obscure, but it's okay, there's alot to learn ahead!

So, hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL` to log into the remote-machine as `bandit13`.

**Warning: Please, first try Level 13 -> Level 14! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
