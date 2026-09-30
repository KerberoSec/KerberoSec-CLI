# Tangle

This challenge is a x86_64 binary for Linux.

## What's going on

The binary doesn't seem to do anything when launched, so we have to open it in
IDA.

The `main()` is a huge mess and IDA doesn't create the visual CFG.
Fortunately, there's Hex-Rays to the rescue.

```c
signed __int64 __fastcall main(int a1, char **a2, char **a3)
{
  signed int i; // [rsp+18h] [rbp-1B8h]
  unsigned int v5; // [rsp+20h] [rbp-1B0h]
  int v6; // [rsp+24h] [rbp-1ACh]
  char *v7; // [rsp+28h] [rbp-1A8h]

  if ( a1 != 3 )
    return 0xFFFFFFFFLL;
```

This tells us that `tangle` expects 2 arguments on the command line.

After this part, there's a lot of dummy code which checks for `strlen(a2[1])`
multiple times.

Time to copy the decompiled code to `tangle.c` to have a look at it in a decent
editor (AKA NeoVim).

Here's what we did:

1. `:%g/return/d` to remove all the lines with a `return`
2. `:%g/strlen/d` to remove all the lines with a `strlen`

Now this piece of code stands out:

```c
v7 = a2[2];
v6 = 0;
v5 = -1;
while ( v7[v6] )
{
  v5 ^= (unsigned __int8)v7[v6];
  for ( i = 7; i >= 0; --i )
    v5 = (v5 >> 1) ^ -(v5 & 1) & 0xEDB88320;
  ++v6;
}
```

Unlike the other lines of code, this time `a2[2]` is used, which is the second
argument given to `tangle`.
Unfortunately, it's easy to see that that function is unlikely to be breakable
using Z3 since it's a CRC32.
We conclude that this is likely a decoy from the organizers.

At this point, we notice that some lines of code are different from the others
and look like this:

```c
if ( (unsigned __int8)(a2[1][1] - 20) != 50 )
```

This looks like a flag check and the values are taken from the first argument.
Let's check with `grep unsigned tangle.c`:

```
  unsigned int v5; // [rsp+20h] [rbp-1B0h]
  if ( (unsigned __int8)(a2[1][3] + 22) != 93 )
  if ( (unsigned __int8)(a2[1][16] + 73) != 155 )
  if ( (unsigned __int8)(a2[1][26] + 41) != 166 )
  if ( (unsigned __int8)(a2[1][4] + 39) != 97 )
  if ( (unsigned __int8)(a2[1][10] - 91) != 7 )
  if ( (unsigned __int8)(a2[1][13] + 53) != 142 )
  if ( (unsigned __int8)(a2[1][23] + 110) != 221 )
  if ( (unsigned __int8)(a2[1][20] + 35) != 143 )
  if ( (unsigned __int8)(a2[1][19] - 14) != 35 )
  if ( (unsigned __int8)(a2[1][17] - 71) != 28 )
  if ( (unsigned __int8)(a2[1][22] - 3) != 45 )
  if ( (unsigned __int8)(a2[1][15] - 108) != 9 )
  if ( (unsigned __int8)(a2[1][18] - 37) != 67 )
  if ( (unsigned __int8)(a2[1][9] + 70) != 179 )
  if ( (unsigned __int8)(a2[1][1] - 20) != 50 )
  if ( (unsigned __int8)(a2[1][21] + 83) != 183 )
  if ( (unsigned __int8)(a2[1][25] + 18) != 51 )
  if ( (unsigned __int8)(a2[1][14] - 33) != 15 )
  if ( (unsigned __int8)(*a2[1] - 62) != 61 )
    v5 ^= (unsigned __int8)v7[v6];
  if ( (unsigned __int8)(a2[1][24] + 24) != 124 )
  if ( (unsigned __int8)(a2[1][5] + 15) != 97 )
  if ( (unsigned __int8)(a2[1][7] - 56) != 53 )
  if ( (unsigned __int8)(a2[1][6] + 26) != 77 )
  if ( (unsigned __int8)(a2[1][2] - 44) != 32 )
  if ( (unsigned __int8)(a2[1][8] + 33) != 134 )
  if ( (unsigned __int8)(a2[1][11] - 21) != 30 )
  if ( (unsigned __int8)(a2[1][12] + 28) != 142 )
```

Yup, looks like it.

## untangle.py

Let's write a script to filter out the uninteresting lines and parse the
remaining ones:

```python
#!/usr/bin/env python

import itertools
import string

import re

ll = [l.strip() for l in open('tangle.c', 'r')]
ll = filter(lambda x: x.find('unsigned') != -1 and x.find('v5') == -1, ll)

flag = [' '] * 0x50

for l in ll:
    print l
    m = re.search(r'\]\[(\d+)\] ([+-]) (\d+)\) != (\d+)', l)
    if m is None:
        m = re.search(r'()([+-]) (\d+)\) != (\d+)', l)

    i, s, v1, v2 = m.groups()
    if not i:
        i = 0

    i = int(i)
    v1 = int(v1)
    v2 = int(v2)

    if s == '-':
        res = v2 + v1
    else:
        res = v2 - v1

    flag[i] = chr(res)

print ''.join(flag)
```

The script takes the lines of code shown above (filtering the uninteresting ones)
and parses the stuff we care about: position inside the flag, operation
performed on the ASCII value, constant added/subtracted and finally the target
value.

It then inverts the add/subtract operations to find the original value:
`{FLG:R3memb3rY0uRch1ld0od!}`.

