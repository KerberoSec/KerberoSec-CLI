# asm3

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Grotesque/asm3.png)

```C

undefined4 main(void)

{
  uint exit_code;
  __pid_t __pid;
  time_t seed;
  code *__buf;
  ssize_t sVar1;
  uint val_expected;
  undefined4 uVar2;
  long in_FS_OFFSET;
  uint status;
  long canary;
  
  canary = *(long *)(in_FS_OFFSET + 0x28);
  seed = time((time_t *)0x0);
  srand((uint)seed);
  setup_scrambled_protected_pages();
  __printf_chk(1,"Input your shellcode (%d bytes max):\ n",0x1000);
  fflush(stdout);
  __buf = (code *)mmap((void *)0x0,0x1000,7,0x22,-1, 0);
  if (__buf == (code *)0xffffffffffffffff) {
    perror("mmap shellcode");
                    /* WARNING: Subroutine does not return * /
    exit(1);
  }
  sVar1 = read(0,__buf,0x1000);
  if (sVar1 < 1) {
    fwrite("Failed to read shellcode\n",1,0x19,stderr);
                    /* WARNING: Subroutine does not return * /
    exit(1);
  }
  val_expected = 0;
  do {
    __pid = fork();
    if (__pid == 0) {
      set_SIGSEGV_handler();
      sandbox();
      DAT_00104060 = 0;
      (*__buf)(&DAT_00104080,val_expected);
                    /* WARNING: Subroutine does not return * /
      _exit(0xff);
    }
    waitpid(__pid,(int *)&status,0);
    if (('\x01' < (char)(((byte)status & 0x7f) + 1)) || ((stat us & 0x7f) != 0)) {
                    /* END BY SIGNAL */
      write(1,"Failure (crash).\n",0x11);
LAB_00101438:
      uVar2 = 1;
      goto LAB_0010143e;
    }
    exit_code = status >> 8 & 0xff;
    if (99 < exit_code) {
                    /* END BY EXIT CODE HIGHER
                        */
      write(1,"Failure (invalid exit).\n",0x18);
      goto LAB_00101438;
    }
    mprotect((void *)(&DAT_00104080)[(int)exit_code], 0x1000,1);
    if (val_expected != *(byte *)(&DAT_00104080)[(int)e xit_code]) {
      write(1,"Failure (wrong result).\n",0x19);
      goto LAB_00101438;
    }
    val_expected = val_expected + 1;
  } while (val_expected != 100);
  write(1,"Success!\n",9);
  write(1,"flag: this_is_test_flag_get_real_one\n",0x25);
  uVar2 = 0;
LAB_0010143e:
  if (canary == *(long *)(in_FS_OFFSET + 0x28)) {
    return uVar2;
  }
                    /* WARNING: Subroutine does not return * /
  __stack_chk_fail();
}
```

```C

void setup_scrambled_protected_pages(void)

{
  undefined uVar1;
  int r;
  long i;
  undefined *ptr;
  undefined *j;
  long in_FS_OFFSET;
  undefined array [104];
  long canary;
  
  canary = *(long *)(in_FS_OFFSET + 0x28);
  i = 0;
  do {
    array[i] = (char)i;
    i = i + 1;
  } while (i != 100);
  ptr = array + 99;
  do {
    r = rand();
    j = ptr + -1;
    r = r % ((100 - (int)(array + 99)) + (int)ptr);
    uVar1 = *ptr;
    *ptr = array[r];
    array[r] = uVar1;
    ptr = j;
  } while (j != array);
  i = 0;
  do {
    ptr = (undefined *)mmap((void *)0x0,0x1000,3,0x22 ,-1,0);
    (&DAT_00104080)[i] = ptr;
    if (ptr == (undefined *)0xffffffffffffffff) {
      perror("mmap");
                    /* WARNING: Subroutine does not return * /
      exit(1);
    }
    j = array + i;
    i = i + 1;
    *ptr = *j;
    mprotect(ptr,0x1000,0);
  } while (i != 100);
  if (canary == *(long *)(in_FS_OFFSET + 0x28)) {
    return;
  }
                    /* WARNING: Subroutine does not return * /
  __stack_chk_fail();
}
````

```C

void sandbox(void)

{
  undefined8 uVar1;
  
  uVar1 = seccomp_init(0);
  seccomp_rule_add(uVar1,0x7fff0000,0,0);
  seccomp_rule_add(uVar1,0x7fff0000,1,0);
  seccomp_rule_add(uVar1,0x7fff0000,0x3c,0);
  seccomp_rule_add(uVar1,0x7fff0000,5,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xa,0);
  seccomp_rule_add(uVar1,0x7fff0000,9,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xb,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xffffd8b6,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xf,0);
  seccomp_rule_add(uVar1,0x7fff0000,0x83,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xffffd8ba,0);
  seccomp_rule_add(uVar1,0x7fff0000,0xd,0);
  seccomp_load(uVar1);
  return;
}
```

El programa crea un array con enteros del 0-99 y los desorganiza usando Fisher-Yates. Luego mmapea 100 regiones y almacena en cada una un byte correspondiente con el valor en el array.

El objetivo del shellcode, es, dados la direccion de un arreglo de punteros a las regiones mmapeadas y un valor, devolver como exit-code la direccion de la region que posee ese valor.

El programa también cuenta con `seccomp`, limitando las syscalls que se pueden realizar a:
```
    0 → read
    1 → write
    5 → fstat 
    9 → mmap
    10 → mprotect
    11 → munmap
    13 → rt_sigaction
    15 → rt_sigreturn
    0x3c (60) → exit
    0x83 (131) → sigaltstack
```

El shellcode debe iterar sobre las regiones, revisando su valor y devolviendo la dirección que coincida con el valor esperado. En adición, ya que las regiones fueron mapeadas con PROT_NONE, debe usar `mprotect` para cambiar sus permisos por lo menos a PROT_READ:
```asm
BITS 64

; rdi -> ptr_array
; esi -> val

_start:
  ; save values
  mov r8, rdi
  mov r9d, esi
  xor r12, r12     ; idx
  _loop:
    ; mprotect(addr, 1024, PROT_READ)
    mov r10, [r8 + r12*8]
    mov rdi, r10
    mov rsi, 4096
    mov rdx, 1
    mov rax, 10
    syscall

    ; read byte and compare
    mov al, byte [r10]       ; found
    cmp al, r9b              ; found == expected ?
    je _end

    inc r12
    jmp _loop
  _end:
    ; exit(idx)
    mov rdi, r12
    mov rax, 60
    syscall
```

Nota: *Según [la documentación de la arquitectura](https://www.felixcloutier.com/x86/syscall) luego de una syscall los registros RCX y R11 son usados para almacenar la instrucción luego de `syscall` y el registro RFLAGS respectivamente.*

`N1ce_aNd_Cle4ver_4lgor1thm`