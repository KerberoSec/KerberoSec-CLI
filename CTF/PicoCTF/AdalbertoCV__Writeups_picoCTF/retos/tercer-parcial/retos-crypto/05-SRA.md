# SRA

# Descripción
I just recently learnt about the SRA public key cryptosystem... or wait, was it supposed to be RSA? Hmmm, I should probably check...Connect to the program on our server: `nc saturn.picoctf.net 55004`Download the program: [chal.py](https://artifacts.picoctf.net/c/294/chal.py)
# Pistas
(none)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ cat 
.bash_history    .bashrc          .config/         .lesshst         .profile         .ssh/            README.txt       
.bash_logout     .cache/          .gitconfig       .local/          .python_history  .wget-hsts       chal.py          
adalh4ck1ng-picoctf@webshell:~$ cat chal.py 
from Crypto.Util.number import getPrime, inverse, bytes_to_long
from string import ascii_letters, digits
from random import choice

pride = "".join(choice(ascii_letters + digits) for _ in range(16))
gluttony = getPrime(128)
greed = getPrime(128)
lust = gluttony * greed
sloth = 65537
envy = inverse(sloth, (gluttony - 1) * (greed - 1))

anger = pow(bytes_to_long(pride.encode()), sloth, lust)

print(f"{anger = }")
print(f"{envy = }")

print("vainglory?")
vainglory = input("> ").strip()

if vainglory == pride:
    print("Conquered!")
    with open("/challenge/flag.txt") as f:
        print(f.read())
else:
    print("Hubris!")
adalh4ck1ng-picoctf@webshell:~$ nano solver.py
adalh4ck1ng-picoctf@webshell:~$ cat solver.py 
from Crypto.Util.number import isPrime, long_to_bytes
from string import ascii_letters, digits
from itertools import combinations
from sympy import divisors
from math import log2

anger = int(input("anger = "))
envy = int(input("envy = "))
sloth = 65537

ds = divisors(envy * sloth - 1)
primes = [x + 1 for x in ds if isPrime(x + 1)]
correct_size_primes = [x for x in primes if log2(x) // 1 == 127]

valid_plaintexts = []
charset = ascii_letters + digits
for p, q in combinations(correct_size_primes, 2):
    try:
        s = long_to_bytes(pow(anger, envy, p * q)).decode("ascii")
        if all([c in charset for c in s]):
            valid_plaintexts.append(s)
    except Exception:
        continue

print(valid_plaintexts)

adalh4ck1ng-picoctf@webshell:~$ nc saturn.picoctf.net 50691
anger = 37926411367416189525185441914800909786024356819484221203260876974765889591443
envy = 51734159504318647575943001463450594390112705747079129810910648053485729971473
vainglory?

C:\Users\ADALBERRTO CERRILLO\Downloads>python solver.py
anger = 37926411367416189525185441914800909786024356819484221203260876974765889591443
envy = 51734159504318647575943001463450594390112705747079129810910648053485729971473
['mhcPHB8iR26JCTtt']

> mhcPHB8iR26JCTtt
mhcPHB8iR26JCTtt
Conquered!
picoCTF{7h053_51n5_4r3_n0_m0r3_ba95c657}
```

# Bandera
picoCTF{7h053_51n5_4r3_n0_m0r3_ba95c657}