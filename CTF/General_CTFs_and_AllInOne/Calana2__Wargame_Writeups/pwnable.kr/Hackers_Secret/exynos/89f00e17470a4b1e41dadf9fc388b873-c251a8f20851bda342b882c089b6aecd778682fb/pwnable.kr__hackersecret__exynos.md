# exynos

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/exynos.png)

El nombre que recibe es debido a [una vulnerabilidad en los chips Exynos de Samsung](https://xdaforums.com/t/root-security-root-exploit-on-exynos.2048511/#post-35469999) que daba acceso RW a un dispositivo de caracteres llamado `/dev/exynos-mem` que supuestamente era accedido para manejo de gráficos y acabó permitiendo manipular memoria del mismísimo kernel.

Según la man-page de "mem" estos dispositivos mapean la memoria física de la computadora:
```
/dev/mem es un fichero de dispositivo de caracteres que representa a la memoria principal del
       ordenador. Se puede utilizar, por ejemplo, para examinar (e incluso parchear) el sistema.

       En /dev/mem, las direcciones de bytes se interpretan como direcciones físicas de memoria. Las
       referencias a posiciones no existentes producen un error.
```

El exploit está disponible [aquí](https://github.com/FSecureLABS/mercury-modules/blob/master/metall0id/root/exynosmem/exynos-abuse/jni/exynos-abuse.c). En resumen lo que hace es lo siguiente:

- Mapea 0x1000000 bytes del dispositivo y usa el puntero para leer bytes.
- Localiza la cadena "%pK %c %s\n", sustituyendo "K" por " ". [%pK](https://lwn.net/Articles/420403/) es un operador de formato para ocultar los punteros del kernel en espacio de usuario, la cadena de formato completa es la que se usa para mostrar información de los símbolos del kernel en `/proc/kallsyms`.
- Lee la dirección virtual del símbolo `sys_setresuid`, la convierte a una dirección física y sustituye un par de bytes que parecen ser una comparación con la capability `CAP_SETUID` me imagino:
```
>>> print(disasm(bytes.fromhex("F0412DE90050A0E10160A0E10280A0E11E4000EB0\
04050E24700000A0D20A0E17F3DC2E33F30C3E30700A0E30C3093E5F47193E529E2FFEB00\
0050E3")))
   0:   e92d41f0        push    {r4, r5, r6, r7, r8, lr}
   4:   e1a05000        mov     r5, r0
   8:   e1a06001        mov     r6, r1
   c:   e1a08002        mov     r8, r2
  10:   eb00401e        bl      0x10090
  14:   e2504000        subs    r4, r0, #0
  18:   0a000047        beq     0x13c
  1c:   e1a0200d        mov     r2, sp
  20:   e3c23d7f        bic     r3, r2, #8128   @ 0x1fc0
  24:   e3c3303f        bic     r3, r3, #63     @ 0x3f
  28:   e3a00007        mov     r0, #7
  2c:   e593300c        ldr     r3, [r3, #12]
  30:   e59371f4        ldr     r7, [r3, #500]  @ 0x1f4
  34:   ebffe229        bl      0xffff88e0
  38:   e3500000        cmp     r0, #0                          <= sustituye por cmp r0, #1
```
- Usa `usleep` para forzar un cambio de contexto y vaciar la caché. Al parecer algunos dispositivos MIPS y ARM presentan un problema llamado "[Cache Incoherency](https://rstforums.com/forum/topic/110228-why-is-my-perfectly-good-shellcode-not-working/)", en donde los cambios se hacen primero en una "data cache" y no se actualiza la memoria instantáneamente. 
- Ejecuta `setresuid(0,0)` para obtener máximos privilegios.
- Restaura la cadena ""%pK %c %s\n" y la instrucción `cmp r0, #0`.
- Ejecuta una shell.

Dado que en el reto las lecturas/escrituras se hacen por medio del binario `exynos-mem` adapté el código del exploit para interactuar con él, pero hubiese sido más rápido hacerlo a mano.

Las constantes PHYS_OFFSET y PAGE_OFFSET son distintas en el emulador de QEMU. Encontré PHYS_OFFSET usando la shell: `for i in $(seq 0 110; do echo "[OFFSET: $(($i * 0x10000000))" ; ./exynos-mem $((0x10000000 * $i)) 4096 0 | hexdump -C ; done`. En cuanto a PAGE_OFFSET, solo cambié su valor a lo que parece la dirección virtual base del kernel. Según [la documentación](https://www.kernel.org/doc/html/v6.19-rc5/arch/arm/porting.html):
```
PHYS_OFFSET

    Physical start address of the first bank of RAM.
PAGE_OFFSET

    Virtual start address of the first bank of RAM. During the kernel boot phase, virtual address PAGE_OFFSET will be mapped to physical address PHYS_OFFSET, along with any other mappings you supply. This should be the same value as TASK_SIZE.
```

Hasta donde tengo entendido el hecho de que PAGE_OFFSET sea distinto se debe a que [se puede elegir como dividir la memoria RAM del kernel](https://people.kernel.org/linusw/how-the-arm32-kernel-starts) y este parece ser un layout VMSPLIT_2G.

`r3ad_Writ3_kernel_m3mory_as_1_want`

