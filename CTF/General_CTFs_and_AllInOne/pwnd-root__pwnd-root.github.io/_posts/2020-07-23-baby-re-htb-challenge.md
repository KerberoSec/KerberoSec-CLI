---
title: Baby RE Challenge- HackTheBox
author: pwnd_root
date: 2020-07-23 22:30:00 +0530
excerpt: Note that this is still an active challenge, so it's highly recommended that you try a bit harder before heading inside. 
         Feel free to reach me on my socials for spoiler-free nudges.
categories: [HackTheBox, Challenge]
thumbnail: /assets/img/posts/babyre/info.png
tags: [htb, reversing, strings, ltrace]
---

*[Image: Info]*

The challenge file was downloaded and attempted to be unzipped with the usual password *hackthebox*. However the
compression method seemed to have been unsupported by *unzip*.
```terminal
[pwnd_root@manjaro Reversing]$ unzip Baby_RE.zip 
Archive:  Baby_RE.zip
   skipping: baby                    unsupported compression method 99

```
The file was finally unzipped through the GUI utility, ***Ark***. If you prefer a command line option, the tool 
***p7zip*** can be used. The archive held a single *ELF executable* file named **baby**. It was given executable 
permissions and executed. The binary requested a **key** as shown in the section below.
```terminal
[pwnd_root@manjaro Reversing]$ file baby 
baby: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=25adc53b89f781335a27bf1b81f5c4cb74581022, for GNU/Linux 3.2.0, not stripped
[pwnd_root@manjaro Reversing]$ chmod +x baby
[pwnd_root@manjaro Reversing]$ ./baby 
Insert key: 
```

The key can be recovered through either ***strings*** or ***ltrace*** and both methods are given in the section below.
<br>
**ltrace**
<br>
Using *ltrace* against the binary, revealed a ***strcmp*** is being run with the pattern **"abcde122313"**. This
string was supplied as the key and the flag was retrieved. 
```terminal
[pwnd_root@manjaro Reversing]$ ltrace ./baby 
puts("Insert key: "Insert key: 
)                                                                                         = 13
fgets(
"\n", 20, 0x7fe47d2fc7e0)                                                                              = 0x7fff2a096420
strcmp("\n", "abcde122313\n")                                                                                = -87
puts("Try again later."Try again later.
)                                                                                     = 17
+++ exited (status 0) +++
```
**strings**
<br>
Similar to ltrace, running *strings* against the binary also revealed the key and so the flag can be retrieved with
a similar fashion.
```
[pwnd_root@manjaro Reversing]$ strings ./baby 
/lib64/ld-linux-x86-64.so.2
mgUa
libc.so.6
puts
stdin
fgets
__cxa_finalize
strcmp
__libc_start_main
GLIBC_2.2.5
_ITM_deregisterTMCloneTable
__gmon_start__
_ITM_registerTMCloneTable
u/UH
HTB{B4BYH
_R3V_TH4H
TS_Ef
[]A\A]A^A_
Dont run `strings` on this challenge, that is not the way!!!!
Insert key: 
abcde122313
Try again later.
---SNIP---
```
*[Image: Flag]*

Interestingly, the output of *strings* had also revealed the flag itself, if one were to look closely at the patterns.
```terminal
[pwnd_root@manjaro Reversing]$ strings ./baby 
/lib64/ld-linux-x86-64.so.2
---SNIP---
_ITM_registerTMCloneTable
u/UH
HTB{B4BYH
_R3V_TH4H
TS_Ef
[]A\A]A^A_
---SNIP---
```