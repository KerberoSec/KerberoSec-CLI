# input2

![input2](https://github.com/user-attachments/assets/556af5d0-1cd6-47a0-9a71-ca9ad78218e7)

#### Stage 1
1. Pasar 99 argumentos
2. El argumento 'A'(65 en decimal) debe contener `\x00`
3. El argumento 'B'(66 en decimal) debe contener `\x20\x0a\x0d`

#### Stage 2
1. Enviar `\x00\x0a\x00\xff` por `stdin` al programa
2. Enviar `\x00\x0a\x02\xff` por `stderr` al programa

#### Stage 3
1. Establecer la variable de entorno `\xde\xad\xbe\xef` con valor `\xca\xfe\xba\xbe`

#### Stage 4
1. Crear un archivo llamado `\x0a` con exactamente 4 bytes `\x00` de contenido

#### Stage 5
1. El argumento 'C'(67 en decimal) debe contener un puerto valido para un socket
2. Conectarnos a este puerto local y enviar `\xde\xad\xbe\xef` por `stdin`

``` python
from pwn import *
import os

args = ["A"]*99
args[64]="\x00"
args[65]="\x20\x0a\x0d"
args[66]="4444"

r,w = os.pipe()
with open("\x0a","wb") as f:
        f.write(b"\x00\x00\x00\x00")
io = process(["/home/input2/input2"]+args,
            stderr=r,
            env={"\xde\xad\xbe\xef":"\xca\xfe\xba\xbe"},
            )
io.sendline(b"\x00\x0a\x00\xff")
os.write(w,b"\x00\x0a\x02\xff")

conn = remote("localhost",4444)
conn.sendline(b"\xde\xad\xbe\xef")

io.interactive()
```

```
nput2@ubuntu:/tmp$ python3 sk.py
sys:1: BytesWarning: Text is not bytes; assuming ISO-8859-1, no guarantees. See https://docs.pwntools.com/#bytes
[+] Starting local process '/home/input2/input2': pid 217953
[+] Opening connection to localhost on port 4444: Done
[*] Switching to interactive mode
Welcome to pwnable.kr
Let's see if you know how to give input to program
Just give me correct inputs then you will get the flag :)
Stage 1 clear!
Stage 2 clear!
Stage 3 clear!
Stage 4 clear!
Stage 5 clear!
Mommy_now_I_know_how_to_pa5s_inputs_in_Linux
```

`Mommy_now_I_know_how_to_pa5s_inputs_in_Linux`

