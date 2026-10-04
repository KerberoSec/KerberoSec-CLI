# Crypto Python Guide:

## Conversions:

### Integer to ASCII:

```py
chr(int)
```

### ASCII to Integer:

```py
ord(char)
```

### Hex to B64:

```py
import base64

byte_string = bytes.fromhex(data)
final = base64.b64encode(byte_string)
```

### Large Integers to Bytes:

```py
from Crypto.Util.number import long_to_bytes

long_to_bytes(int)
```

### XOR:

```py
from pwn import *

xor(a, b)
```

### Hex to ASCII (No leading 0x):

```py
bytes_object = bytes.fromhex(hex_string)
text_string = bytes_object.decode("ASCII")
```

## Math Principles:

### EGCD:

Finds the greatest common divisor of two numbers, and the coefficients of the Bézout identity (which is the inverse).

### Fermat's Little Theorem:

If p is a prime number, then for any integer a, a^(p-1) ≡ 1 (mod p).

When `p = 3 mod 4`, then `a^((p+1)/4)` is square root of `a` mod `p`.

### Legendre Numbers:

Determines if a number is a quadratic residue:

QR * QR = QR
QR * NR = NR
NR * NR = QR

Therefore, quadratic residues are 1s, and non quadratic residues are -1.

Legendre Symbol: `(a / p) ≡ a(p-1)/2 mod p`. For a given number `pow(a,(p-1)//2,p)` is sufficient to tell if it is a quadratic residue

### Tonellii-Shanks Algorithm:

Used for when `p =  1 mod 4`. For `r^2 = a mod p`, Tonellii-Shanks Algorithm is used to find `r`, which is the quadratic residue. 

```py
from sage.rings.finite_rings.integer_mod import square_root_mod_prime

a = 8479
p = 3053

print(square_root_mod_prime(Mod(a, p), p))
```

### Chinese Remainder Theorem:

Combines linear congruences to find the unique solution to a system of linear congruences.

```py
# x ≡ 2 mod 5
# x ≡ 3 mod 11
# x ≡ 5 mod 17

from sympy.ntheory.modular import crt

print(crt([5, 11, 17], [2, 3, 5]))
```

To solve by hand:

```
x = 5a + 2
5a + 2 = 3 mod 11
5a = 9 mod 11
a = 9 mod 11 
a = 11b + 9

x = 55b + 47
4b + 13 = 5 mod 17
4b = 9 mod 17
b = 15 mod 17 
b = 17c + 15

x = 55(17c + 15) + 47 = 935c + 872
```

