# Description

This service provides you an encrypted flag. Can you decrypt it with just N & e?
Connect to the program with netcat:
`$ nc verbal-sleep.picoctf.net 51434`
The program's source code can be downloaded here.

# Solution

When you connect with `nc verbal-sleep.picoctf.net 51434` you will get output that looks like this:

```
N: 17537614138261784213928370696328752813986709042120259741743863531969271925248508130709263987579968737098825108090143054462035829031497144145084077726439478
e: 65537
cyphertext: 1862202474168637121872319135644317889384481444154089212360721245109801826108338981069221317033529716486407831083567338102494200390951480362472079543955817
```

It will change every time you run it so whatever script or way you solve it will have to be in a different terminal. This is a script that would work:

```
from Crypto.Util.number import long_to_bytes

N = 17537614138261784213928370696328752813986709042120259741743863531969271925248508130709263987579968737098825108090143054462035829031497144145084077726439478
e = 65537
c = 1862202474168637121872319135644317889384481444154089212360721245109801826108338981069221317033529716486407831083567338102494200390951480362472079543955817
q = N // 2

phi = q - 1
d = pow(e, -1, phi)
m = pow(c, d, N)

print(long_to_bytes(m).decode())
```

Keep in mind to run this script you need to have pycryptodome: `pip install pycryptodome`. After running the script you should get the flag.

Flag: `picoCTF{tw0_1$_pr!m38177...}`