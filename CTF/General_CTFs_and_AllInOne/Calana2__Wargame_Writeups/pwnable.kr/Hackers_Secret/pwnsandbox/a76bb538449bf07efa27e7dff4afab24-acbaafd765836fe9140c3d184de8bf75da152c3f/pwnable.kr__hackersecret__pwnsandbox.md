# pwnsandbox

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/pwnsandbox.jpeg)

```C
void main(void)

{
  uint program_len;
  undefined4 uVar1;
  long in_FS_OFFSET;
  uint i;
  pthread_t local_28;
  long program_ptr;
  undefined8 *arg;
  undefined8 canary;
  
  canary = *(undefined8 *)(in_FS_OFFSET + 0x28);
  setvbuf(stdout,(char *)0x0,2,0);
  setvbuf(stdin,(char *)0x0,1,0);
  puts("Have fun with pwnsandbox :p");
  printf("how big is your program?:");
  program_len = read16_bytes_as_integer();
  printf("your program is consisted with %d command s. give me your program:",(ulong)program_len);
  program_ptr = read_N(program_len);
  arg = (undefined8 *)malloc(0x17);
  *arg = "hello";
  printf("input function argument:");
  uVar1 = read16_bytes_as_integer();
  *(undefined4 *)(arg + 1) = uVar1;
  puts("set disallowed functions...");
  *(undefined *)((long)arg + 0xc) = 0x74;
  *(undefined *)((long)arg + 0xd) = 0x80;
  *(undefined *)((long)arg + 0xe) = 0x91;
  *(undefined8 *)((long)arg + 0xf) = 0;
  pthread_create(&local_28,(pthread_attr_t *)0x0,thre ad_function,arg);
  pthread_detach(local_28);
  create_dispatch_table_256();
  puts("all set. have fun!");
  alarm(60);
  do {
    for (i = 0; i < program_len; i = i + 1) {
      if (((*(char *)(program_ptr + (int)i) != *(char *)((lon g)arg + 0xc)) &&
          (*(char *)(program_ptr + (int)i) != *(char *)((long )arg + 0xd))) &&
         (*(char *)(program_ptr + (int)i) != *(char *)((long) arg + 0xe))) {
        *(undefined8 *)((long)arg + 0xf) =
             *(undefined8 *)(&DAT_00606120 + (long)(int)( uint)*(byte *)(program_ptr + (int)i) * 8);
      }
    }
  } while( true );
}

void thread_function(undefined8 *arg)
{
  do {
    do {
    } while (*(long *)((long)arg + 0xf) == 0);
    (**(code **)((long)arg + 0xf))(*(undefined4 *)(arg +  1),*arg);
  } while( true );
}
```

El programa toma hasta 4096 bytes de entrada del usuario para usarse como opcodes para invocar una lista de funciones en una dispatch table. Hay tres bytes prohibidos que invocan rutinas vulnerables. El programa principal lee el opcode y almacena la dirección de la rutina correcta en `arg + 0xf` y el hilo verifica si hay una dirección válida en `arg + 0xf` para ejecutarla.

Ambos, el programa principal y el hilo, acceden a `arg + 0xf` sin ninguna especie de lock, lo que convierte esto en un [TOCTOU](https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use). Esto por sí solo podría provocar que tal vez se salten ejecuciones de algunas rutinas de ciertos opcodes. Sin embargo, hay algo más importante.

De *Intel® 64 and IA-32 Architectures Software Developer’s Manual Volume 1*:
```
4.1.1 Alignment of Words, Doublewords, Quadwords, and Double Quadwords
Words, doublewords, and quadwords do not need to be aligned in memory on natural boundaries. The natural boundaries for words, double words, and quadwords are even-numbered addresses, addresses evenly divisible by four, and addresses evenly divisible by eight, respectively. However, to improve the performance of programs, data structures (especially stacks) should be aligned on natural boundaries whenever possible. The reason for this is that the processor requires two memory accesses to make an unaligned memory access; aligned accesses require only one memory access. A word or doubleword operand that crosses a 4-byte boundary or a quadword operand that crosses an 8-byte boundary is considered unaligned and requires two separate memory bus cycles for access
...

15.7 MEMORY ALIGNMENT
...
Atomic memory operation in Intel 64 and IA-32 architecture is guaranteed only for a subset of memory operand sizes and alignment scenarios.
```

Dado que `arg = (undefined8 *)malloc(0x17);` y malloc garantiza que `arg` esté alineado a 8 bytes, entonces `arg + 0xf` siempre estará desalineado. Esto provoca que el MOV usado para escrir en `arg + 0xf` NO es atómico, requiere dos accesos, el primero para obtener el LSB (esta arquitectura es little-endian) y el segundo para obtener los 7 MSB (0xf % 8 = 7).

```
Bloque de Memoria A (Dirección Alineada 0x00)      Bloque de Memoria B (Dirección Alineada 0x08)
+----+----+----+----+----+----+----+----+         +----+----+----+----+----+----+----+----+
|0x0 |0x1 |0x2 |0x3 |0x4 |0x5 |0x6 |0x7 |         |0x8 |0x9 |0xA |0xB |0xC |0xD |0xE |0xF |
+----+----+----+----+----+----+----+----+         +----+----+----+----+----+----+----+----+
                                                                                     | LSB|
                                                                                     +----+
                                                                                      |
                                            [ Frontera de alineación / Cache Line ] --+
                                                                                      |
                                                                                   +----+
                                                                                   | MSB| ... (7 bytes)
                                                                                   +----+
                                                  |0x10|0x11|0x12|0x13|0x14|0x15|0x16|0x17|
                                                  +----+----+----+----+----+----+----+----+
                                                  Bloque de Memoria C (Dirección Alineada 0x10)
```

Existe la posibilidad de que suceda esta secuencia de eventos:
1. El hilo principal valida el índice
2. El hilo principal escribe el LSB
3. El hilo principal escribe los 7 MSB
4. El hilo secundario valida addr != NULL
5. El hilo principal valida otro índice
6. El hilo principal escribe el LSB del otro índice
7. El hilo secundario ejecuta la dirección formada por 7 bytes de MSB del puntero obtenido por el primer índice y el LSB del puntero obtenido por el segundo índice.

Explotando esto se puede llamar a la función con el índice 0x74 de la blacklist indirectamente y usar la vulnerabilidad de cadena formateada para ganar control del programa de manera trivial.

`m3ssing_w1th_c4che_l1ne_is_FuN`
