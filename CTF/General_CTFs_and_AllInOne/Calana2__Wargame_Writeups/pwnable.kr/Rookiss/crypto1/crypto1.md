# crypto1

<img width="136" height="174" alt="crypto1" src="https://github.com/user-attachments/assets/be09fcdc-81e9-435a-8531-eaf4f08e7621" />

## Intro 

El reto implementa un cliente y un servidor RPC que realiza una autenticacion con id y contraseña.

El mensaje que se encripta sigue el formato "{id}-{pw}-{cookie}". Donde pw es sha256sum(id+cookie). La cookie la desconocemos.

Para conseguir la flag debemos usar el id "admin" y la cookie correcta.

Conocemos el texto plano parcialmente, el texto cifrado, el tamaño de bloque y que la clave y el IV son constantes.

## KPA

**Known plaintext attack** se basa en que, como se dijo, la clave e IV no varian y conoemos el tamaño de bloque.    

Lo que hacemos es rellenar un bloque con bytes de tal manera que el ultimo byte sea un byte de la cookie.

Por ejemplo en el formato "{id}-{pw}-{cookie}". Si hacemos `id="-"*13` y pw=`""` entonces el primer bloque luce asi: `"-" * 15 + cookie_byte`.

Podemos entonces hacer `id="-"*15 + guess_byte ` y pw=`""` para que podamos adivinar el byte. 

Intentamos el proceso con cada caracter del alfabeto dado hasta que el texto cifrado de ambos casos coincida.

He de decir que al principio me enredé bastante con los cálculos.

## Exploit
```py
from pwn import *
import string

context.log_level = "error"

def get_ciphertext(id, pw=b""):
        #r = remote("pwnable.kr",9006)
        r = process(["nc","0","9006"])
        r.sendlineafter(b"ID\n",id)
        r.sendlineafter(b"PW\n",pw)
        l = r.recvline().strip().decode()
        r.close()
        c = l[l.find("(")+1:l.find(")")]
        return c

alphabet = string.digits + string.ascii_lowercase + "-_"
cookie=b""

for i in range(29):
    # Some math
    placeholder = b"-"*(13 - i + 16 * ((i+2)//16))
    test_placeholder = b"-"*(15 - i + 16 * ((i+2)//16))
    count = 32 * (i//16 + 1)
    # Get ciphertext
    cipher_1 = get_ciphertext(placeholder)
    # Guess one byte
    for c in alphabet:
        cipher_2 = get_ciphertext(test_placeholder + cookie + c.encode())
        if cipher_1[count-32:count] == cipher_2[count-32:count]:
              cookie += c.encode()
              print("Cookie updated!: ",cookie)
              break

# Win
id = b"admin"
pw = hashlib.sha256(id+cookie).hexdigest().encode()
print("Id: ",id)
print("Password: ",pw)
print("Cookie: ",cookie)

#r = process("pwnable.kr",9006)
r = process(["nc","0","9006"])
r.sendlineafter(b"ID\n",id)
r.sendlineafter(b"PW\n",pw)
r.interactive()
```

#### Nota
- ¿Por qué 29?

Podemos usar un numero grande y añadir una condicional para que se detenga cuando no hallan coincidencias de todas formas pero se puede detectar el tamaño de la cookie por medio del padding:
```py
def look(msg):
    for i in range(0,len(msg),16*2):
        print(f"[{str(i//2).rjust(3,' ')}]: ",msg[i:i+16*2])
    print()

# admin-012345678-
look("cd076555f6240ca5ec2122366875d603057bd9ab34627c657d6db3fa13ea8d0cb67d1f5b21d3e4ef3a23dbeca8b0b422")
# admin-012345678a
# -
look("9953f2ce1895f41cfec4073fb115f9e4b7c81c6995805419bc647573c6f22e5208d7a5acad1524ca47b3552c03cb8f40")
# admin-012345678a
# b-
look("9953f2ce1895f41cfec4073fb115f9e4ed1adbd7ef0b4b4edc9abc32b3cbdffe77e78610b89afc635d06121eea4fa9f8")
# admin-012345678a
# bc-
look("9953f2ce1895f41cfec4073fb115f9e4af44fcf99ded76ed57145b33ef31af243a5a0533001ee2d32d140d549be5bcabf78c367588258f9ed2d485c39f64a346")

# bytes: X-> cadena C->Cookie P->Padding
# XXXXXXXXXXXXXXXX
# XXXXXXCCCCCCCCCC
# CCCCCCCCCCCCCCCC
# CPPPPPPPPPPPPPPP
# cookie=29
```

<img width="445" height="360" alt="2025-08-02-212223_445x360_scrot" src="https://github.com/user-attachments/assets/ca11205a-424c-434a-a239-0153cfe56803" />

Se puede observar como al añadir el ultimo byte en el script aparecen un bloque mas, 1 byte de la cookie desplazado y los otros 15 son padding PKCS#7.

`1mplem3nt4t1on_m1stak3_Br3akes_Crypt0`

