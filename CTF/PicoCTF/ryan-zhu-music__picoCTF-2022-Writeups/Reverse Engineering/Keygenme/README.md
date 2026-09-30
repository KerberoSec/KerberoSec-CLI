# **Keygenme: 400 pts**

### Key points

- Decompiling
- Stack Strings

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Can you get the flag? Reverse engineer this binary.

About as bare as a challenge can be. No hints.

Running the binary, we are asked to enter a key. If the key is incorrect, the program will print `That key is invalid.` We need to enter the correct key so the program will print `That key is valid.`

## Solution

Let's decompile the binary in Ghidra.

Our main function is `FUN_0010148b`.

```c
undefined8 FUN_0010148b(void)

{
  char cVar1;
  long in_FS_OFFSET;
  char local_38 [40];
  long local_10;

  local_10 = *(long *)(in_FS_OFFSET + 0x28);
  printf("Enter your license key: ");
  fgets(local_38,0x25,stdin);
  cVar1 = FUN_00101209(local_38);
  if (cVar1 == '\0') {
    puts("That key is invalid.");
  }
  else {
    puts("That key is valid.");
  }
  if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return 0;
}
```

It looks like `cVar1`, the return value of `FUN_00101209()`, must not be 0. `FUN_00101209()` accepts our input key as an argument. Let's see what `FUN_00101209()` is doing.

The decompiled `FUN_00101209()` is in `keygenme.c`, with some comments I put.

`FUN_00101209()` generates a key (`acStack56`) and compares it to our input. If it matches, 1 is returned, which means our key was valid. So all we have to do is figure out how `acStack56` is generated.

First, the MD5 hash of "picoCTF{br1ng_y0ur_0wn_k3y*" is generated and stored in `local_78`.

Then, "picoCTF{br1ng_y0ur_0wn_k3y*" is copied into the first 27 characters of `acStack56`.

The next 8 characters are assigned the values of 5 different variables. Scrolling up in the program, it appears that 4 of them are undefined! `local_78[0]` is simply the first character in the MD5 hash generated earlier, which turns out to be `4`.

How do we figure out the other 4 characters?

Let's go back to the declaration of `local_78`. It is declared to be a string of 12, but that's not right. An MD5 hash has a length of 32 characters. `local_6c`, `local_66`, `local_5f`, and `local_5e` are defined right below `local_78`. It turns out this has to do with the way the stack strings are [decompiled](https://www.tripwire.com/state-of-security/security-data-protection/ghidra-101-decoding-stack-strings/).

Following the instruction on that article:

Right click `local_78[12]`, and retype (**not rename**) it to `local_78[32]`. Upon doing so, you will see the declarations for `local_6c`, `local_66`, `local_5f`, and `local_5e` have disappeared, and they have been replaced with the corresponding elements in `local_78` in the assignment to `acStack56`.

The last character is `local_ba`, which is declared as `0x7d`, the closing brace `}`.

I wrote a script to do exactly what `FUN_00101209()` does, and then outputs the key, which is our flag.

Entering the key into the binary, we are greeted with `That key is valid.`

---

## Flag

> `picoCTF{br1ng_y0ur_0wn_k3y_9d74d90d}`
