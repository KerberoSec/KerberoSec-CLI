# elf

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/elf.png)

## Analisis
El reto nos da dos scripts de Python2: 
- `gen.py`: Construye y compila una librerías compartida en C. La librerías contiene de 0 a 10000 funciones 'not_my_flag{i}', una función 'yes_ur_flag' con la flag del reto y de 0 a 10000 funciones 'not_ur_flag'.
- `elf.py`: Carga en memoria `libc.so.6` y con una probabilidad del 10% genera tambien `libflag.so`. Nos permite inspeccionar 32 bytes de memoria a partir de cualquier dirección de memoria del proceso.

## Documentación

Este [documento](http://flint.cs.yale.edu/cs422/doc/ELF_Format.pdf) sirve como referencia para el formato ELF.

La descripción del reto hace referencia al paper ["How the ELF Ruined Christmas"](https://www.usenix.org/system/files/conference/usenixsecurity15/sec15-paper-di-frederico.pdf), que explica como funciona un ataque tipo [ret2dl_resolve](https://syst3mfailure.io/ret2dl_resolve).

Tras leer el documento y ver la conferencia, esta es mi visión de como `_dl_runtime_resolve(link_map, idx)` resuelve un símbolo:
1. Revisa la entrada Elf_Rel en la  sección.rel.plt (representada como PLTREL en .dynamic) con el índice que se le pasa como segundo argumento.
2. Usa el índice contenido en el campo Elf_Rel->r_info para encontrar la entrada correspondiente Elf_Sym en la  sección.dynsym (representada como SYMTAB en .dynamic)
3. Usa el índice contenido en el campo Elf_Sym->st_name para encontrar la cadena que representa el nombre del símbolo, contenida en la  sección.dynstr (representada como STRTAB en .dynamic)
4. Itera sobre las entradas de símbolos en la  sección.dynsym de la librerías que esta resolviendo, hasta que Elf_Sym->st_name contenga un índice a la cadena correcta.
5. Resuelve su dirección de memoria real inspeccionando el contenido de Elf_Sym->st_value en esa entrada.
6. Actualiza la entrada correspondiente en la GOT con esta direccion.

## Solución

Necesitamos filtrar los bytes de la función `yes_ur_flag` y extraer la flag. Para comenzar, en la versión de Ubuntu que usa el contenedor el intérprete de Python no es PIE (me percaté de eso leyendo [un articulo interesante](https://hackernoon.com/python-sandbox-escape-via-a-memory-corruption-bug-19dde4d5fea5)):
```
checksec python2.7
[*] '/home/kalcast/Laboratorio/pwn/kr/elf/python2.7'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    FORTIFY:    Enabled
```

Depende de libc, asi que en su GOT contiene punteros a funciones de la misma:
```
ldd elf/python2.7
        linux-vdso.so.1 (0x00007f6fb117a000)
        libpthread.so.0 => /usr/lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f6fb114d000)
        libc.so.6 => /usr/lib/x86_64-linux-gnu/libc.so.6 (0x00007f6fb0f57000)
        libdl.so.2 => /usr/lib/x86_64-linux-gnu/libdl.so.2 (0x00007f6fb0f52000)
        libutil.so.1 => /usr/lib/x86_64-linux-gnu/libutil.so.1 (0x00007f6fb0f4d000)
        libz.so.1 => /usr/lib/x86_64-linux-gnu/libz.so.1 (0x00007f6fb0f2d000)
        libm.so.6 => /usr/lib/x86_64-linux-gnu/libm.so.6 (0x00007f6fb0e35000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f6fb117c000)
```

Ya teniendo la dirección base de libc, abusamos del hecho de que el loader usa la misma dirección base para aplicar ASLR a las libreríass cargadas por el programa, de tal forma que el offset entre la dirección base de `libc.so` y `libflag.so` es constante.

A pesar de haber hecho el cálculo del desplazamiento mientras depuraba el programa en el contenedor, este offset no era igual al del contenedor en remoto, tuve que aplicar un poco de fuerza bruta. Probando offsets cercanos al del contenedor acabé encontrando contenido de la STRTAB de `libflag.so` y a partir de ahí fui retrocediendo hasta dar con la dirección base de la librerías. Esto fue posible porque si revisamos el Dockerfile (y al conectarnos, en algun momento podremos darnos cuenta por un error) podemos ver que no tiene `flag` dentro, sin embargo no falla la linea `flag = CDLL('/home/elf_pwn/libflag.so')`, por lo que libflag.so no se recompila.

Ahora tenemos la dirección base de libflag.so. La forma correcta de encontrar un símbolo seria simular lo que hace `_dl_runtime_resolve`:
- Buscar el segmento de memoria que contiene la sección .dynamic
- Extraer la dirección de .dynsym
- Iterar sobre las entradas de .dynsym hasta encontrar el st_name que apunte a la cadena correcta

Pero como solo podemos "mirar" 25 veces en memoria y hay miles de símbolos esto queda descartado.

## Punteros a función

Probando a compilar libflag.so varias veces y ver la disposicion de memoria de sus símbolos me demostro que no es posible calcular el offset exacto. Sin embargo, analizando la  sección`.dynamic`:
```
readelf -d libflag.so
Dynamic section at offset 0x19ae18 contains 24 entries:
  Marca      Tipo                         Nombre/Valor
 0x0000000000000001 (NEEDED)             Biblioteca compartida: [libc.so.6]
 0x000000000000000c (INIT)               0xba2d0
 0x000000000000000d (FINI)               0x1024d4
 0x0000000000000019 (INIT_ARRAY)         0x39ae00
 0x000000000000001b (INIT_ARRAYSZ)       8 (bytes)
 0x000000000000001a (FINI_ARRAY)         0x39ae08
 0x000000000000001c (FINI_ARRAYSZ)       8 (bytes)
 0x000000006ffffef5 (GNU_HASH)           0x1f0
 0x0000000000000005 (STRTAB)             0x765d0
 0x0000000000000006 (SYMTAB)             0x1b4f0
 0x000000000000000a (STRSZ)              246387 (bytes)
```

```
0000000000102487 T not_ur_flag7479
000000000010249a T not_ur_flag7480
00000000001024ad T not_ur_flag7481
00000000001024c0 T not_ur_flag7482
00000000001024d4 T _fini
```

La sección dynamic contiene un arreglo de estas estructuras:
```
typedef struct {
    Elf64_Sxword        d_tag
    union {
        Elf64_Xword   d_val
        Elf64_Addr   d_ptr
    } d_un
} Elf64_Dyn
```

Cuando `d_tag` es `DT_FINI`, `d_ptr` contiene un puntero a la función `_fini`. La disposicion de las funciones en memoria quedaría asi:
```
not_my_flagXXX
not_my_flagXXX
not_my_flagXXX
not_my_flagXXX
...
yes_ur_flag
not_ur_flagXXX
not_ur_flagXXX
not_ur_flagXXX
...
_fini
```

Si obtenemos la dirección de memoria de `fini` y conocemos cuantas funciones `not_ur_flag` hay y que tamaño en bytes tienen podemos obtener una dirección cuanto menos aproximada de `yes_ur_flag`.

La entrada `STRSZ` contiene el tamaño de `STRTAB`, si vamos casi al final de `STRTAB` vemos las últimas funciones `not_ur_flag` y podemos obtener su número.

Las funciones `not_ur_flag` ocupan 19 bytes:
```
$ sudo docker cp elf_chall:/home/elf_pwn/libflag.so libflag.so
Successfully copied 2.31MB to /home/kalcast/Laboratorio/pwn/kr/elf/libflag.so
$ nm -nD libflag.so| tail
0000000000102461 T not_ur_flag7477
0000000000102474 T not_ur_flag7478
0000000000102487 T not_ur_flag7479
000000000010249a T not_ur_flag7480
00000000001024ad T not_ur_flag7481
00000000001024c0 T not_ur_flag7482
00000000001024d4 T _fini
000000000039b030 B __bss_start
000000000039b030 D _edata
000000000039b038 B _end
$ python3 -c 'print(0x1024c0 - 0x1024ad)'
19
```

## La solución entendida

El primer parámetro de `_dl_runtime_resolve`, `link_map` es un puntero al inicio de una lista enlazada de estructuras que contienen la dirección base y nombre de todas las libreríass compartidas cargadas por el programa. Se encuentra generalmente en el heap y la segunda entrada de la GOT del programa apunta a esta estructura.

La idea es transitar la lista enlazada hasta encontrar `libflag.so`. Luego usar la  sección`.gnu.hash` (dt_tag `GNU_HASH` en la  sección.dynamic) para resolver el símbolo rápidamente.

No voy a argumentar mas, pero [este recurso](https://flapenguin.me/elf-dt-hash) explica como funciona `DT_HASH` y [este de aqui](https://flapenguin.me/elf-dt-gnu-hash) explica `DT_GNU_HASH` y contienen código de referencia en C para implementar los algoritmos de búsqueda. Por último pwntools cuenta con utilidades para esto, como el objeto `dynelf` con los métodos `lookup` y `_lookup` que implementan las búsquedas.

`by_3xpl0it1ing_of_CouRs3`