---
title: Crypto: Weird Programmer
description: 2022 | VishwaCTF | Cryptography
---

## 题目

I bet my friend who is a terrible poet and a really weird programmer that i can solve any encryption he makes in max 3 tries but i may have underestimated him. Can you help me win this bet? 

hint : Try underscore ( _ ) between the words

??? note "poem.txt"

    When you have broken the glass

    and stepped into the eighth circle of hell,

    you will find yourself under the pollux's spell

    and after that you will be able to tell,
    
    All's well that end's well

??? note "Weird_Programmer.txt"

    ```
    {M[m(_o)O!"'&BA@?>~<543Wxwvutsrqponmlkjihgfe#zyx}|{zyrwp6WVUTSRQglejihgfe^$#DCBA@?>=<RW
    VUTMRQJIm0/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYuWmrqpinmlkjc
    )gf_d]#DCBA@?UZYXWPUTSRKoONGLKDh+*)('&%$@?8=<5:9810Tut210/.-,+k#Ghgfedcba`_^
    ]\[ZYXWmlkjonmlkjib(fHdcb[!_X]VzZSRvVOsMLQJONMFEiIHAFE>bB;:?87[|{zyxwvutsrqp
    onmlk)i'&%$#"!~}v<]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('=BA
    :?>=<;:92V05.3,10)Mnmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876
    543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIH
    GFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[Z
    YXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponml
    kjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~
    }|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:98765432
    10/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFED
    CBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWV
    UTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjih
    gfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{z
    yxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.
    -,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@
    ?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSR
    QPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfed
    cba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwv
    utsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*
    )('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<
    ;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPON
    MLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`
    _^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?[ZSXWVUTSRQPONMFjJCHA@d>CBA@?8\}|{zyxwvutsr
    qponmlkji!&%$#"!~w|u;yxqputsrk1oQmle+iha'_dcb[Z~A@?>=<;:9876543210/.-,+*)('=
    <A@?>=<543W7654t210)Mnmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:98
    76543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJ
    IHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\
    [ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqpon
    mlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"
    !~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:987654
    3210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGF
    EDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYX
    WVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkj
    ihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|
    {zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210
    /.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCB
    A@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUT
    SRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgf
    edcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyx
    wvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543210/.-,
    +*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>
    =<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYXWVUTSRQP
    ONMLKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcb
    a`_^]\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?[ZSXWVUTSRQPONMFjJCg*)('&%$#"!~}|{zyxwvut
    srq/.-,+k)"'&}|B"!~`|u;\[ZYXWVUTSRQPONMLKgfe^cba`Y^]Vz=<;:9876543210/.-,+*)(
    '&%$#"!~}|{zyxwvutsrqponmlkjihgf|#"y~}|{zyxwp6WVUTSRQmlkjibg`e^$Ea`Y}]\[Z<XW
    POs6543210/.-,+*)('&%$:?8=6;:9870Tu-2+*NMnmlkjih&%$#"!~}|u;\[ZYXWVUTSRQPONML
    KJIHdcba`Y^]V[TxXWVUTMRQJnHl/.-,+*)('&%$#"!~}|{3816543210)Mnm+*#(!&%$#z@x}v<
    tyr8YXWVUTSRQPONMLKJIHGFEa`_^]V[ZSXQuUTSRQ3INGkKJIHG@?c&%$#"!~}|{zyxwvutsr0/
    .-,+*)(h&}C#"bx>|{tyrqvun4rqjonmle+LKJIHGFEDCBA@?>=<;:9876543210/.-,+*)('&%$
    #"!~}|{zyxwvutsrqponmlkjihgfedcba`|{zyxwvunslk1Rnmlkjiha'HGFEDCBA@?>=<;:9876
    543210/.-,+*)('&%$#"!~}|{zyxwvutsrqpo-,l*)('~%|#"y?`_^]\[ZYXWVUTSRQPONMLKJIH
    GcEa`Y^]V[TSRv9876543210/.-,+*)('=B;@?>=<;:3W7w543,Pqponml$#(!~%$#"!x>_{zyxq
    7XWVUTSingledihgf_%c\aZ~^]?UZYXWPtTMLp3INGk.-,+*)E'=B;:?>=<5Yz876543,Pqponml
    k)('&%$#"!x>_^]yxwvutsrk1RQPONMLKgfedcba`YXW{[ZYXWPUTMqQJImMFKJIHAe('=B;@?>=
    <;4XWV0543210)M-&+*)"Fgfedcba`_^]\[ZYXWVrqSinglkjiha'HGFEDCBA@?>=<;:98765432
    10/.-,+*)('&%$#"!~}|{zyxwvutsrqponmlkjihgfedcba`_^]\[ZYutmrkponmledc)afe^$E[
    Z_^]VzTYRWVONrLQPONGLKDh+*)('&<A@?>=<;:92VC"(_o)o.?]}
    ```

## 解题思路

- 毫无疑问，线索都藏在 `poem.txt` 中 XD 最先注意到的是 `pollux`，然后也顺利地找到了 [Pollux Cipher](https://www.dcode.fr/pollux-cipher)，不过看密文这么多标点符号，显然没有单纯用 Pollux 加密
- 根据 [Difficult Programming Language](../misc/difficult_programming_language.md) 的经验推测应该还使用了 Malbolge，通过搜索得到证实

    > Malbolge is a public domain esoteric programming language invented by Ben Olmstead in 1998, named after **the eighth circle of hell** in Dante's Inferno, the Malebolge.

- 随后直接把代码仍给了 [Malbolge: interpreter online](https://malbolge.doleczek.pl/#)，遇到了 `Invalid char` 的错误，还是根据 [Difficult Programming Language](../misc/difficult_programming_language.md) 的经验，就对着错误位置上手改代码了 🙉 波折地跑出了结果（某次不小心删多了，但运行没有问题，只是输出字符串少了一些）：`AR11J65VQOV3ZXSOTWS7FEGJH84C5BDMGOU5Q86N0LBBRJTH4KJLG41WRVTFYELAQATJIPN4LQXFJWUQCCC12MRXITO3`
- Pollux 解密取得 Flag：`1 T I S W 3 1 R D N 0 T T 0 B 3 W 3 1 R D` => `vishwaCTF{1T_IS_W31RD_N0T_T0_B3_W31RD}`
- 实际上，在 Malbolge 之前，还有一步，就是 Glass ΣΣΣ(Φ ωΦ||¡) 对比 Glass 打印 `Hello World!` 的程序和题目代码，Malbolge 的代码就是由 Glass 程序打印的，前面的操作恰好把 Malbolge 的部分提取出来了 🥳

    ```
    {M[m(_o)O!"Hello World!"(_o)o.?]}
    ```

## 参考资料

- [Glass: Esolang](https://esolangs.org/wiki/Glass)