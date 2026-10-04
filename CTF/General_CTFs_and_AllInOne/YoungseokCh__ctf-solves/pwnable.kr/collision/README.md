# Collision
First, `argv[1]` is 20byte string input.
```c
        if(strlen(argv[1]) != 20){
                printf("passcode length should be 20 bytes\n");
                return 0;
        }
```
Second, `check_password(argv[1]) == 0x21DD09EC`.
```c
unsigned long hashcode = 0x21DD09EC;
...
        if(hashcode == check_password( argv[1] )){
                system("/bin/cat flag");
                return 0;
        }
```

`check_password` converts string pointer to int pointer, and `int` type is 4 bytes, so `argv[1]` is interpreted as 20byte int array, which is length 5. `check_password` computes sum of the integer elements and return it.

Now let's make `argv[1]`. `[113626828, 113626824, 113626824, 113626824, 113626824]` is feasible. In hex, it's `[0x6c5cecc, 0x6c5cec8, 0x6c5cec8, 0x6c5cec8, 0x6c5cec8]`.

Since linux uses Little-endian, we should rearrange the byte order properly. I used `p32` function in pwntools to handle it.

```python
from pwn import *

payload1 = p32(0x6c5cecc)
payload2 = p32(0x6c5cec8)

payload = (payload1 + payload2*4)

sh = ssh('col', 'pwnable.kr', password='guest', port=2222)
p = sh.process(['./col',payload])
p.interactive()
```

The flag is `daddy! I just managed to create a hash collision :)`