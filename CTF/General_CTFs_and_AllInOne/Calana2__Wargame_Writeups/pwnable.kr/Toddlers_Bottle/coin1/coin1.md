# coin1

![coin1](https://github.com/user-attachments/assets/8d65cb1c-f9ae-4ea2-973d-b399fe841ac3)

Es un problema de busqueda binaria (https://es.wikipedia.org/wiki/B%C3%BAsqueda_binaria), este es soluble si log2(N) <= C y tal parece que si:
```
N=507 C=9
N=193 C=8
N=837 C=10
```

```
>>> import math
>>> math.log2(507)
8.985841937003341
>>> math.log2(507)
8.985841937003341
>>> math.log2(193)
7.592457037268081
>>> math.log2(837)
9.709083812550343
```

Implementamos la busqueda binaria en un script de python con pwntools:
``` python
from pwn import *
import time

io = remote("0.0.0.0",9007)

def findCounterfeit(N,C):
    low = 0
    high = N - 1
    for _ in range(C):
        # Si se halla la moneda con menos pesadas enviar pesadas de relleno hasta llegar a C
        if low == high:
            io.sendline(str(low).encode())
            io.recvline()
            break
        mid = (low + high) // 2
        weight_coins = " ".join(str(i) for i in range(low,mid+1))
        io.sendline(weight_coins.encode())
        weight = int(io.recvline().decode().strip())
        expected_weight = 10 * (mid - low + 1)
        if weight < expected_weight:
            high = mid
        else:
            low = mid + 1
    return low

time.sleep(5)
for i in range(100):
	line = io.recvline().decode().strip()
	while not line.startswith("N="):
    		line = io.recvline().decode().strip()
	N = int(line.split("N=")[1].split()[0])
	C = int(line.split("C=")[1].split()[0])

	counterfeit_coin= findCounterfeit(N,C)
	io.sendline(str(counterfeit_coin).encode())
	print(io.recvline().decode())
io.interactive()
```

```
Correct! (95)

Correct! (96)

Correct! (97)

Correct! (98)

Correct! (99)

[*] Switching to interactive mode
Congrats! get your flag
b1naRy_S34rch1Ng_1s_3asy_p3asy
```

`b1naRy_S34rch1Ng_1s_3asy_p3asy`
