# <a name="SEETF"></a>SEETF Here we come again

This year we came again across SEETF and tried our best. We only managed to finish one challenge but that way our write up is kinda short.

# <a name="decompile_me"></a>decompile_me

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/SEETF_CTF_2023/img/challenge.png" alt="Babyre" width="50%" height="50%">

As you can see we don't have much context rather than to decompile whatever we get. Within the zip attached to the challenge we have a pyc code file decompile-me.pyc and a textfile output.txt. The output.txt seems to be in some way encrypted when you look plain on it

```console
└─$ cat output.txt        
l6l;t54L6>-"|<@bQJ=m>c~?
```
But when we have closer look at the pyc file we have a bit more luck:

```console
└─$ file decompile-me.pyc                                                                                                                               
decompile-me.pyc: Byte-compiled Python module for CPython 3.7, timestamp-based, .py timestamp: Mon Apr 24 15:58:34 2023 UTC, .py size: 433 bytes
```

It is compiled with Python 3.7 and we knew that kind of every pyc file up to 3.9 can be recovered to source code by some tools. In our case we used an online tool which uses uncompyle6 [toolnb](https://www.toolnb.com/tools-lang-en/pyc.html). With that we already had the source code of the used python script which created the output.txt (*^‿^*) .

```python
# uncompyle6 version 3.5.0
# Python bytecode 3.7 (3394)
# Decompiled from: Python 2.7.5 (default, Nov 16 2020, 22:23:17) 
# [GCC 4.8.5 20150623 (Red Hat 4.8.5-44)]
# Embedded file name: decompile-me.py
# Size of source mod 2**32: 433 bytes
from pwn import xor
with open('flag.txt', 'rb') as (f):
    flag = f.read()
    a = flag[0:len(flag) // 3]
    b = flag[len(flag) // 3:2 * len(flag) // 3]
    c = flag[2 * len(flag) // 3:]
    a = xor(a, int(str(len(flag))[0]) + int(str(len(flag))[1]))
    b = xor(a, b)
    c = xor(b, c)
    a = xor(c, a)
    b = xor(a, b)
    c = xor(b, c)
    c = xor(c, int(str(len(flag))[0]) * int(str(len(flag))[1]))
    enc = a + b + c
with open('output.txt', 'wb') as (f):
    f.write(enc)
```
So our lovely author used [pwntools](http://docs.pwntools.com/en/stable/) to create the output.txt and used lots of xor operations to move the bits around of our flag. So the next step would be to reverse the process to receive the flag. Lovely for us we just asked bing chat/Chatgpt if the machine could do that for us and in fact, it did without any hesitation. We were a bit surprised that it did not asked why we would want to reverse a encryption kind of thing but yeah easy solve for us. So here is the solution script provided from our new team member ༼ԾɷԾ༽:

```python
# Import the xor function from the pwn library
from pwn import xor

# Open the output file in binary mode for reading
with open('output.txt', 'rb') as f:
    # Read the content of the file
    enc = f.read()

# Calculate the length of each part by dividing the total length by 3
n = len(enc) // 3

# Split the content into three parts using slicing
a = enc[:n]
b = enc[n:2*n]
c = enc[2*n:]

# Reverse the operations to obtain the original content
# XOR c with the product of the first two digits of 3*n
c = xor(c, int(str(3*n)[0]) * int(str(3*n)[1]))
# XOR c with b
c = xor(b, c)
# XOR b with a
b = xor(a, b)
# XOR a with c
a = xor(c, a)
# XOR c with b
c = xor(b, c)
# XOR b with a
b = xor(a, b)
# XOR a with the sum of the first two digits of 3*n
a = xor(a, int(str(3*n)[0]) + int(str(3*n)[1]))

# Concatenate the parts to obtain the original flag
flag = a + b + c

# Open a new file in binary mode for writing
with open('flag_recovered.txt', 'wb') as f:
    # Write the recovered flag to the file
    f.write(flag)
```
Which brings us to the flag
```console
└─$ python3 solution.py
└─$ cat flag_recovered.txt  
SEE{s1mP4l_D3c0mp1l3r_XDXD}    
```
With that we had our only challenge and went top 50% so quite some fun. Thanks SEETF team for the challenges.