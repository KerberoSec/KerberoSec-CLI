# level 8.0

Tenemos un módulo similar a los anteriores, `device_write` acepta shellcode del usuario y lo ejecuta:
```C
ssize_t device_write(file *file,char *buffer,size_t lengt h,loff_t *offset)

{
  long lVar1;
  size_t sVar2;
  
  printk(&DAT_001008f8,file,buffer,length,offset);
  sVar2 = 0x1000;
  if (length < 0x1001) {
    sVar2 = length;
  }
  lVar1 = _copy_from_user(shellcode,buffer,sVar2);
  (*(code *)shellcode)();
  return length - lVar1;
}
```

No podemos interactuar directamente con él, tenemos que hacerlo por medio de otro programa:
```
hacker@vm_kernel-security~level8-0:~$ ls -lh /proc/pwncollege
-rw------- 1 root root 0 Aug  9 20:36 /proc/pwncollege
hacker@vm_kernel-security~level8-0:~$ ls -lh /challenge
total 284K
-rwsr-xr-x 1 root root  17K Jan 28  2025 babykernel_level8.0
-rwsr-xr-x 1 root root 264K Jan 28  2025 babykernel_level8.0.ko
```

El programa de espacio de usuario nos abre un descriptor de archivo para la entrada proc del reto y nos restringe a usar solo la syscall `write` por medio de SECCOMP:
```C

undefined8 main(undefined8 param_1,undefined8 *p aram_2)

{
  uint module_fd;
  int ok;
  void *region;
  ssize_t user_input;
  undefined8 scmp_filter_ctx;
  int SYS_N;
  
  setvbuf(stdin,(char *)0x0,2,0);
  setvbuf(stdout,(char *)0x0,2,0);
  puts("###");
  printf("### Welcome to %s!\n",*param_2);
  puts("###");
  putchar(10);
  puts("You may upload custom shellcode to do whate ver you want.\n");
  puts("For extra security, this challenge will only allow  certain system calls!\n");
  module_fd = open("/proc/pwncollege",2);
  printf("Opened `/proc/pwncollege` on fd %d.\n",(ulon g)module_fd);
  puts("");
  region = mmap((void *)0x31337000,0x1000,7,0x22,0 ,0);
  if (region != (void *)0x31337000) {
                    /* WARNING: Subroutine does not return * /
    __assert_fail("shellcode == (void *)0x31337000","<s tdin>",99,"main");
  }
  printf("Mapped 0x1000 bytes for shellcode at %p!\n", 0x31337000);
  puts("Reading 0x1000 bytes of shellcode from stdin.\ n");
  user_input = read(0,(void *)0x31337000,0x1000);
  puts("This challenge is about to execute the followin g shellcode:\n");
  print_disassembly(0x31337000,(long)(int)user_input) ;
  puts("");
  puts("Restricting system calls (default: allow).\n");
  scmp_filter_ctx = seccomp_init(0x7fff0000);
  for (SYS_N = 0; SYS_N < 0x200; SYS_N = SYS_N + 1) {
    if (SYS_N == 1) {
      printf("Allowing syscall: %s (number %i).\n","write", 1);
    }
    else {
      ok = seccomp_rule_add(scmp_filter_ctx,0,SYS_N,0);
      if (ok != 0) {
                    /* WARNING: Subroutine does not return * /
        __assert_fail("seccomp_rule_add(ctx, SCMP_ACT_ KILL, i, 0) == 0","<stdin>",0x79,"main");
      }
    }
  }
  puts("Executing shellcode!\n");
  ok = seccomp_load(scmp_filter_ctx);
  if (ok != 0) {
                    /* WARNING: Subroutine does not return * /
    __assert_fail("seccomp_load(ctx) == 0","<stdin>",0x7 e,"main");
  }
  (*(code *)0x31337000)();
  puts("### Goodbye!");
  return 0;
}
```

Para ganar debemos insertar nuestro shellcode del kernel para deshabilitar SECCOMP y luego filtrar la flag o invocar una shell. [Este video del módulo](https://www.youtube.com/watch?v=mKzUA3j6myg&source_ve_path=OTY3MTQ&embeds_referring_euri=https%3A%2F%2Fpwn.college%2F) nos muestra como hacerlo para esta versión del kernel.

En el kernel encontramos estas estructuras:
```C
struct task_struct {
#ifdef CONFIG_THREAD_INFO_IN_TASK
    /*
     * For reasons of header soup (see current_thread_info()), this
     * must be the first element of task_struct.
     */
    struct thread_info thread_info;
#endif
//...
}

struct thread_info {
    unsigned long  flags;         /* low level flags */
    u32            status;        /* thread synchronous flags */
};

static bool __emulate_vsyscall ( struct pt_regs *regs, unsigned long address) {
    /*
     * Handle seccomp.  regs->ip must be the original value.
     * See seccomp_send_sigsys and Documentation/userspace-api/seccomp_filter.rst.
     *
     * We could optimize the seccomp disabled case, but performance
     * here doesn't matter.
     */
    regs->orig_ax = syscall_nr;
    regs->ax = -ENOSYS;
    tmp = secure_computing(NULL);
    if ((!tmp && regs->orig_ax != syscall_nr) || regs->ip != address) {
        warn_bad_vsyscall(KERN_DEBUG, regs,
                  "seccomp tried to change syscall nr or ip");
        do_exit(SIGSYS);
    }
    regs->orig_ax = -1;
    if (tmp)
        goto do_ret;  /* skip requested */
}

#ifdef CONFIG_HAVE_ARCH_SECCOMP_FILTER
extern int __secure_computing(const struct seccomp_data *sd);
static inline int secure_computing(const struct seccomp_data *sd)
{
    if (unlikely(test_thread_flag(TIF_SECCOMP)))
        return  __secure_computing(sd);
    return 0;
}
#else
extern void secure_computing_strict(int this_syscall);
#endif
```

Si el proceso tiene un filtro de seccomp activo en algún momento al manejarse una syscall se llama a `secure_computing()` que revisa si la flag `TIF_SECCOMP` está activa en  `task_struct.thread_info.flags`. Para escapar es necesario en espacio de kernel hacer `current_task_struct->thread_info.flag &= (1 << TIF_SECCOMP)`. La dirección de `current_task_struct` se obtiene por medio de `gs+offset`, el offset varía según la versión del kernel. Los hijos del proceso "libre" siguen estando bajo SECCOMP.

No es necesario escalar privilegios porque es un binario SUID. Usé `open`+`sendfile` para filtrar la flag una vez ejecutado el código que deshabilita SECCOMP.

`pwn.college{sV1-iZ57JgqRx2TMCNqaBBb8zHH.ddzM0wCNwYzM5EzW}`

