# ascii

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/ascii.png)

```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

## Stack Pivot

En "ascii easy" tuvimos que hacer ROP con direcciones ascii a partir de un buffer overflow muy basico. En este caso la direccion base del binario no es ascii asi que no podemos usar gadgets de este.

El programa cargó una region de memoria RWX en 0x8000000 donde copia nuestra entrada:
```C
void main(void)

{
  void *rwx_region;
  int input;
  uint idx;
  char *ptr;
  
  rwx_region = mmap((void *)0x80000000,0x1000,7,0x 32,-1,0);
  if (rwx_region != (void *)0x80000000) {
    puts("mmap failed. tell admin");
                    /* WARNING: Subroutine does not return * /
    _exit(1);
  }
  printf("Input text : ");
  idx = 0;
  do {
    if (399 < idx) break;
    ptr = (char *)(idx + 0x80000000);
    input = getchar();
    *ptr = (char)input;
    idx = idx + 1;
    input = is_ascii((int)*ptr);
  } while (input != 0);
  puts("triggering bug...");
  vuln();
  return;
}
```

Nuevamente solo consume hasta que no encuentra un caracter ascii
```C

undefined4 is_ascii(int char)

{
  undefined4 uVar1;
  
  if ((char < 0x20) || (0x7f < char)) {
    uVar1 = 0;
  }
  else {
    uVar1 = 1;
  }
  return uVar1;
}
```

Y el buffer overflow ocurre aqui:
```C
void vuln(void)

{
  char buffer [168];
  
  strcpy(buffer,(char *)0x80000000);
  return;
}
```

En el `leave` de `vuln` la direccion `ebp + 0x30` contiene la direccion de la region de memoria: 
```
38:00e0│+028 0xffffce10 : ▸ 0x80496e0 (__libc_csu_fini) ◂:  push ebx
39:00e4│+02c 0xffffce14 ◂:  0
3a:00e8│+030 0xffffce18 : ▸ 0x80000000 ◂:  push 0x30 /* 0x3458306a;
pwndbg> x/wx $ebp+0x30
0xffffce18:     0x80000000
```

Podemos redirigir la ejecucion hacia nuesro shellcode sobreescribiendo parcialmente `ebp`. Queremos que `ebp=ebp+0x2c` para que en el `ret` de `main` entonces `eip=[ebp+0x30]=0x8000000`:
```
*EBP  0xffa20034 ◂:  0
```
El ultimo nibble de `ebp+0x2c` siempre es 4 y lamentablemente `strcpy` añade un null byte al final de la cadena. Hacer fuerza bruta al ASLR del stack en nuestra condicion nos da una probabilidad de éxito de `1/256*16=1/4096`

##### *Nota: Segun la solucion entendida podiamos haber conseguido una probabilidad del 5-10%.*

## Shellcode Alfanumerico

Fue de gran ayuda el contenido de este blog: https://blackcloud.me/Linux-shellcode-alphanumeric/.

Tomé el shellcode básico de allí y lo modifiqué un poco:
- Pivotee temporalmente el stack a la region de memoria RWX para agregar `int 0x80` en una zona escribible. Esto lo hice porque en el overflow `ecx=0x800000a0` (longitud del buffer local).
- Pivotee de nuevo al stack. Cambie `ecx=NULL` por `ecx={'/bin/sh','-p',NULL}` en la llamada a `execve` porque la explotacion es local en el servidor y el programa tiene el bit SGID activo. Necesitamos invocar una shell con -p para mantener los privilegios.
- Le agregué un jump para redirigir la ejecucion a `int 0x80`.

`ARM_ascii_shellc0d3_might_be_possible!`