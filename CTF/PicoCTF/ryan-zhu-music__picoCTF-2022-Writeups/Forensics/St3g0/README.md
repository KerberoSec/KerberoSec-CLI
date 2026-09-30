# **St3g0: 300 pts**

### Key points

- Steganograhy

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Download this image and find the flag.

---

Steganography is usually pretty fun. You never really know what to expect, so you just have to try different things. Let's try some of the more common things that one would typically start with when given a PNG file:

First, open it of course. This one is a simple picture of the picoCTF logo. Nothing hidden visually. Now, the commands:

```console
$ file pico.flag.png
pico.flag.png: PNG image data, 585 x 172, 8-bit/color RGBA, non-interlaced
```

Just a regular PNG image.

```console
$ exiftool pico.flag.png
ExifTool Version Number         : 11.88
File Name                       : pico.flag.png
Directory                       : .
File Size                       : 13 kB
File Modification Date/Time     : 2022:03:15 07:13:10+00:00
File Access Date/Time           : 2022:03:25 20:03:33+00:00
File Inode Change Date/Time     : 2022:03:25 20:03:25+00:00
File Permissions                : rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 585
Image Height                    : 172
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Image Size                      : 585x172
Megapixels                      : 0.101
```

Nothing suspicious here.

```console
$ strings pico.flag.img
IHDR
4JIDATx
8C&_
>Q^}
 J7M
B%oE
.H_D
Hb0*
4mbY
$Fr)
K^4r
...
```

A whole lot of garbage.

```console
$ binwalk pico.flag.png

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 585 x 172, 8-bit/color RGBA, non-interlaced
41            0x29            Zlib compressed data, default compression
```

You may think "hey, there's a compressed file in there!" Actually, all PNG files have Zlib compressed data in them. Let's keep looking:

```console
$ zsteg pico.flag.png
b1,r,lsb,xy         .. text: "~__B>VG?G@"
b1,g,lsb,xy         .. file: dBase III DBT, version number 0, next free block index 3549684369
b1,g,msb,xy         .. file: dBase III DBT, version number 0, next free block index 3418965897
b1,b,lsb,xy         .. file: dBase III DBT, version number 0, next free block index 2623130757
b1,rgb,lsb,xy       .. text: "picoCTF{7h3r3_15_n0_5p00n_a9a181eb}$t3g0"
b1,abgr,lsb,xy      .. text: "E2A5q4E%uSA"
b2,b,lsb,xy         .. text: "AAPAAQTAAA"
b2,b,msb,xy         .. text: "HWUUUUUU"
b3,r,lsb,xy         .. file: gfxboot compiled html help file
b3,b,msb,xy         .. file: StarOffice Gallery theme @\002 H\200\004H\002\004H\200$H\022\004H\200\004\010, 0 objects
b4,r,lsb,xy         .. file: Targa image data (16-273) 65536 x 4097 x 1 +4352 +4369 - 1-bit alpha - right "\021\020\001\001\021\021\001\001\021\021\001"
b4,g,lsb,xy         .. file: 0420 Alliant virtual executable not stripped
b4,b,lsb,xy         .. file: Targa image data - Map 272 x 17 x 16 +257 +272 - 1-bit alpha "\020\001\021\001\021\020\020\001\020\001\020\001"
b4,bgr,lsb,xy       .. file: Targa image data - Map 273 x 272 x 16 +1 +4113 - 1-bit alpha "\020\001\001\001"
b4,rgba,lsb,xy      .. file: Novell LANalyzer capture file
b4,rgba,msb,xy      .. file: Applesoft BASIC program data, first line number 8
b4,abgr,lsb,xy      .. file: Novell LANalyzer capture file
```

Ah, it was stego-ed with [LSB encoding](https://wiki.bi0s.in/forensics/lsb/). That's it, I guess.

---

## Flag

> `picoCTF{7h3r3_15_n0_5p00n_a9a181eb}`
