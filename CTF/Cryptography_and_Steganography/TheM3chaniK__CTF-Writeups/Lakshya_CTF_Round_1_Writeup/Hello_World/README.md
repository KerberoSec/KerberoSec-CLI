# 🚀 Hello World
**Category** Reverse Engineering  
**Points:** 250  

## Description
Jaisa dikhta hai waisa hota hai nahi.

Ek compiled binary diya gaya hai jisme ek certain string form mein memory mein embedded hai: lekin direct-readable format mein nahi. Program khud ek standard output call use karta hai jo is constant ko runtime pe reveal karta hai.

Dekhte hain aap kitne ache se binary ki antar-atma tak pahunch paate ho. Bas dhyaan rahe: kuch cheezein encoded mein chipki hui hain, aur shabd kuch aise hain jo turant samajh nahi aayenge... unless you know where to look

## Files / Resources

- `hello.exe`

## Tools Used
* xxd

## 🧠 Analysis

At first we ran the hello.exe program it print "Hello, World!"

```bash
$ ./hello.exe
```
Since the output was generic, we suspected hidden content and dumped the hex using xxd:

```bash
$ xxd ./hello.exe
```

In the hex, we noticed a repeating pattern: each meaningful character appeared after E, suggesting the flag was embedded byte-by-byte with padding.

```bash
00000870: 0000 90c9 c355 89e5 83ec 38c6 45db 4cc6  .....U....8.E.L.
00000880: 45dc 61c6 45dd 6bc6 45de 73c6 45df 68c6  E.a.E.k.E.s.E.h.
00000890: 45e0 79c6 45e1 61c6 45e2 43c6 45e3 54c6  E.y.E.a.E.C.E.T.
000008a0: 45e4 46c6 45e5 7bc6 45e6 68c6 45e7 69c6  E.F.E.{.E.h.E.i.
000008b0: 45e8 64c6 45e9 64c6 45ea 65c6 45eb 6ec6  E.d.E.d.E.e.E.n.
000008c0: 45ec 5fc6 45ed 66c6 45ee 6cc6 45ef 61c6  E._.E.f.E.l.E.a.
000008d0: 45f0 67c6 45f1 5fc6 45f2 68c6 45f3 65c6  E.g.E._.E.h.E.e.
000008e0: 45f4 72c6 45f5 65c6 45f6 7dc6 45f7 008d  E.r.E.e.E.}.E...
```
Extracting characters after each E. value revealed the flag.

## 🏁 Flag

```bash
LakshyaCTF{hidden_flag_here}
```