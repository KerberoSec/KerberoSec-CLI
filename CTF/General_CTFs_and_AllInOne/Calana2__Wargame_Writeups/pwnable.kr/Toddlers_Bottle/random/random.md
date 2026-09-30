# random

![random](https://github.com/user-attachments/assets/5b064b09-f992-4015-8b65-369fa72449bd)

El programa usa `rand()` de `libc`; en Linux `rand()` toma de semilla el valor "1" cuando no se especifica y como es un PRNG es determinista. Como resultado `el primer entero generado por rand() en Linux es siempre 1804289383`

Hacemos XOR con la clave para obtener el valor correcto
```
 python3
Python 3.13.3 (main, Apr 10 2025, 21:38:51) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 1804289383 ^ 0xcafebabe
2708864985
```

```
random@ubuntu:~$ ls -l ./random
-r-xr-sr-x 1 root random_pwn 16232 Apr  5 09:49 ./random
random@ubuntu:~$ ./random
2708864985
Good!
m0mmy_I_can_predict_rand0m_v4lue!
```

`m0mmy_I_can_predict_rand0m_v4lue!`
