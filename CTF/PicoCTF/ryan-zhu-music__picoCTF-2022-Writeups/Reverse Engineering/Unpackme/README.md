# **Unpackme: 300 pts**

### Key points

- UPX Packing
- Decompiling

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Can you get the flag? Reverse engineer this binary.

We are given a binary. The hint asks: "What is UPX?"

Let's try running the binary.

```console
$ ./unpackme-upx
What's my favourite number? 7
Sorry, that's not it!
```

Hmm, this looks familiar. This seems like a similar program to that in [Bbbbloat](../Bbbbloat/README.md).

Maybe the number is hardcoded in the program again?

---

## Solution

Upon decompiling in Ghidra, we realize the decompilation is messy and not very useful.

The challenge suggests looking into UPX.

UPX is a tool that is used to compress executable files.

Let's verify that this file was compressed with UPX:

```console
$ strings unpackme-upx | grep "UPX"
UPX!@
$Info: This file is packed with the UPX executable packer http://upx.sf.net $
$Id: UPX 3.95 Copyright (C) 1996-2018 the UPX Team. All Rights Reserved. $
UPX!u
UPX!
UPX!
```

Definitely so. Let's try to unpack it then:

```console
$ upx -d unpackme-upx
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2018
UPX 3.95        Markus Oberhumer, Laszlo Molnar & John Reiser   Aug 26th 2018

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
   1002408 <-    379116   37.82%   linux/amd64   unpackme-upx

Unpacked 1 file.
```

Let's open the unpacked file in Ghidra. The decompilation looks much more familiar now. The `main` function is located in the `m` folder.

```c
undefined8 main(void)

{
  long in_FS_OFFSET;
  int iStack68;
  undefined8 uStack64;
  undefined8 uStack56;
  undefined8 uStack48;
  undefined8 uStack40;
  undefined4 uStack32;
  undefined2 uStack28;
  long lStack16;

  lStack16 = *(long *)(in_FS_OFFSET + 0x28);
  uStack56 = 0x4c75257240343a41;
  uStack48 = 0x30623e306b6d4146;
  uStack40 = 0x6865666430486637;
  uStack32 = 0x36636433;
  uStack28 = 0x4e;
  printf(&UNK_004b3004);
  __isoc99_scanf(&UNK_004b3020,&iStack68);
  if (iStack68 == 0xb83cb) {
    uStack64 = rotate_encrypt(0,&uStack56);
    fputs(uStack64,stdout);
    putchar(10);
    free(uStack64);
  }
  else {
    puts(&UNK_004b3023);
  }
  if (lStack16 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return 0;
}
```

This is the line we want:

```c
if (iStack68 == 0xb83cb) {
```

Our input is compared to `0xb83cb`, which is the hexadecimal representation of 754635.

```c
$ ./unpackme-upx
What's my favorite number? 754635
picoCTF{up><_m3_f7w_5769b54e}
```

---

## Flag

> `picoCTF{up><_m3_f7w_5769b54e}`
