# First Mark: HackTheBox (Reversing)

**Solución:** `cut_f0r_th3_P1NT` → `HTB{cut_f0r_th3_P1NT}`

---

## 1. Reconocimiento

El ZIP contiene un único fichero, `first-mark.elf`:

```
$ file first-mark.elf
ELF 32-bit LSB executable, UCB RISC-V, soft-float ABI, version 1 (SYSV),
statically linked, stripped
```

RISC-V de 32 bits, bare-metal (sin libc, sin syscalls), *stripped*. Muy pequeño:

| Sección  | Dirección    | Tamaño |
|----------|--------------|--------|
| `.text`   | `0x20000000` | `0x178` |
| `.rodata` | `0x20000178` | `0x0bc` |
| `.bss`    | `0x80000000` | `0x010` |

`.bss` mide exactamente **16 bytes**: ése es el búfer de entrada, y por tanto la
longitud del secreto que hay que encontrar.

`binutils` del sistema no trae soporte RISC-V (`can't disassemble for
architecture UNKNOWN!`), así que desensamblé con Capstone (`CS_ARCH_RISCV`,
`CS_MODE_RISCV32 | CS_MODE_RISCVC`) y `skipdata = True`.

## 2. Estructura del programa

**`_start` (`0x20000000`)**: pone `sp`, pone a cero `.bss` (`0x80000000`: `0x80000010`),
ejecuta un bucle de copia de `.data` que está vacío (`a1 == a2`, la rama se toma
inmediatamente), llama a `main` y hace `j 0` (halt loop).

**`puts` (`0x20000060`)**: salida por UART mapeada en memoria en `0x10000000`:
espera mientras la palabra leída sea negativa (bit de *busy*), escribe el byte, y
al llegar al `\0` emite un `\n`.

**`main` (`0x20000094`)**

```
puts("the stone witnesses. it does not bargain. read the four marks or be cast out.")
check(0x80000000)                                  # búfer de 16 bytes en .bss
puts("ACCEPTED: The First Mark was cut in steel.")
return 0
```

No hay rama de fallo. Si `check` no vuelve, no se imprime nada: literalmente
*"true, or nothing at all"* del enunciado.

**`check` (`0x200000d0`)**: bucle de 16 iteraciones. Los punteros a tabla se
calculan con `auipc`/`addi`:

| Registro | Cálculo                | Dirección    | Offset en `.rodata` |
|----------|------------------------|--------------|---------------------|
| `s2`     | `0x200000f8 + 0xfc`    | `0x200001f4` | `0x7c`: **ROT**    |
| `s3`     | `0x20000100 + 0x104`   | `0x20000204` | `0x8c`: **MUL**    |
| `s4`     | `0x20000108 + 0x10c`   | `0x20000214` | `0x9c`: **TARGET** |

```
ROT    = 03 07 01 05 02 06 04 00 03 07 01 05 02 06 04 00   (permutación de 0..7)
MUL    = 03 02 03 02 05 07 02 03 05 07 02 03 05 07 02 03
TARGET = 11 7a 35 90 7e 88 b0 59 79 7f 56 6a 3a 10 e9 05
```

`a2` se inicializa a `0xA5` antes del bucle: el *state* que menciona la pista.

## 3. Las cuatro runas

Capstone se atasca en cuatro puntos del bucle, exactamente donde el enunciado
avisa (*"common chisels read most of it and stall exactly there"*). Son
instrucciones de los espacios de opcode reservados **custom-0 (`0x0b`)** y
**custom-1 (`0x2b`)**, decodificadas a mano como formato-R:

| Dirección    | Word        | opcode | funct3 | funct7 | rd     | rs1  | rs2  |
|--------------|-------------|--------|--------|--------|--------|------|------|
| `0x20000124` | `00b5050b`  | `0x0b` | 0      | 0      | `a0`   | `a0` | `a1` |
| `0x20000130` | `00b5150b`  | `0x0b` | 1      | 0      | `a0`   | `a0` | `a1` |
| `0x20000134` | `00c5052b`  | `0x2b` | 0      | 0      | `a0`   | `a0` | `a2` |
| `0x20000144` | `02d5002b`  | `0x2b` | 0      | 1      | `zero` | `a0` | `a3` |

Cuerpo del bucle reconstruido:

```c
for (i = 0; i < 16; i++) {
    a0 = input[i];
    a1 = ROT[i] & 7;          // andi a1, a1, 7
    a0 = RUNE1(a0, a1);
    a1 = MUL[i];
    a0 = RUNE2(a0, a1);
    a0 = RUNE3(a0, a2);
    a2 = a0;                  // mv a2, a0  -> el state pasa a ser la salida
    a3 = TARGET[i];
    RUNE4(a0, a3);            // rd = x0, sin resultado -> assert / trap
}
return 0;
```

### Deducción de la semántica

- **Runa 3** viene regalada en el enunciado: `out = a0 ^ state ^ carry`, luego
  `carry = a0_viejo & state`. `carry` empieza en 0, `state` en `0xA5` y pasa a
  ser la salida cada ronda: coincide exactamente con el `mv a2, a0` del código.
- **Runa 4** tiene `rd = x0`: no produce valor. Compara `a0` con `TARGET[i]` y,
  si difieren, aborta (no hay rama de error en ningún sitio). Es el `assert`.
- **Runa 1**: el operando pasa por `andi a1, a1, 7`. Enmascarar a 0-7 sobre bytes
  es la firma de un desplazamiento/rotación de 8 bits. Además `ROT` es una
  permutación completa de 0..7, incluido el 0: coherente con "cantidad de
  rotación", no con un multiplicando.
- **Runa 2**: `MUL` contiene un 2 (par), así que no puede ser multiplicación
  modular mod 256 (2 no es invertible y el verificador debe ser biyectivo).
  Multiplicación en GF(2⁸) sí funciona con cualquier valor no nulo.

Para no quedarme en la conjetura, barrí el espacio de hipótesis: `{rol, ror, xor,
add, sub}` para la runa 1 × `{rol, ror, xor, add, sub, mul, clmul, gf(poly)}` con
los 128 polinomios impares para la runa 2. **Un solo par de los 665 combinados
produce 16 bytes ASCII imprimibles:**

```
(16 imprimibles, 'ror', 'gf1b', b'cut_f0r_th3_P1NT')
(14 imprimibles, 'ror', 'gfbb', b'c]tUgyr_v\xfa\x93SPxKT')
(13 imprimibles, 'ror', 'gf53', b'cgt\xdb\xe1<r_{p{XP=\x0cT')
```

Es decir:

- **Runa 1** = rotación a la derecha de 8 bits (`ROR8`)
- **Runa 2** = multiplicación en GF(2⁸) con el polinomio de AES `0x11b`

También comprobé la ambigüedad del orden de actualización en la runa 3
(`carry = a0_viejo & state_viejo` frente a `& state_nuevo`): sólo la primera
variante da texto imprimible.

## 4. Inversión

Las tres etapas son biyectivas, así que la entrada aceptada es única y se obtiene
invirtiendo hacia atrás.

**Runa 3**: se conoce la salida (`TARGET[i]`), el `state` y el `carry`, luego:

```
in       = TARGET[i] ^ state ^ carry
carry'   = in & state
state'   = TARGET[i]
```

Esto da los valores previos a la mezcla:

```
b4 cf 4e ef cb 76 4e e1 80 06 29 15 44 6a d3 fc
```

**Runas 2 y 1**: al ser sólo un byte, basta con probar los 256 valores posibles
por posición (cada uno tiene exactamente una preimagen).

```
$ python3 solve.py
input   : cut_f0r_th3_P1NT
verified: True
flag    : HTB{cut_f0r_th3_P1NT}
```

La verificación reejecuta el pipeline hacia delante y reproduce `TARGET` byte a
byte:

```
producido: 117a35907e88b059797f566a3a10e905
target   : 117a35907e88b059797f566a3a10e905
```

## 5. Notas

- La cadena `" keep your steel"` al final de `.rodata` mide también exactamente
  16 bytes: es un señuelo para quien intente meter directamente el texto que ve
  en el binario.
- Truco central del reto: los espacios de opcode `custom-0`/`custom-1` de RISC-V
  están reservados por la ISA precisamente para extensiones de proveedor, así que
  un desensamblador correcto *no puede* decodificarlos. Hay que recuperar los
  campos formato-R a mano y deducir la semántica por el contexto (máscaras,
  rangos de las tablas, invertibilidad requerida): *"learn what those four runes
  do from the company they keep"*.

## Ficheros

- `first-mark.elf`: binario del reto
- `solve.py`: solver comentado (extrae tablas del ELF, invierte, verifica)
