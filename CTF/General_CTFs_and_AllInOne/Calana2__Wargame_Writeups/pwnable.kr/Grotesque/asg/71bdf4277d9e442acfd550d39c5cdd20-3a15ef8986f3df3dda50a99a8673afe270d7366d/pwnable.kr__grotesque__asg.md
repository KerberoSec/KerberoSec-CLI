# asg

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Grotesque/asg.png)

El programa espera que escribamos shellcode de hasta 1000 bytes para que hagamos un open-read-write a un archivo flag generado dinámicamente. La particularidad está en un filtro que usa Fisher-Yates para seleccionar 128 bytes que conformarán una lista negra:
```C

void main(void)

{
  int var;
  char *file_name_len;
  size_t len;
  ssize_t sc_size;
  long in_FS_OFFSET;
  uint local_d0;
  int sc_idx;
  int f_idx;
  int local_c4;
  int offset;
  int local_bc;
  FILE *FILE;
  undefined8 sc_buf;
  char flag_file_name [136];
  undefined8 local_20;
  
  local_20 = *(undefined8 *)(in_FS_OFFSET + 0x28);
  setvbuf(stdout,(char *)0x0,2,0);
  setvbuf(stdin,(char *)0x0,1,0);
  puts("Welcome to Automatic Shellcode Generation ( ASG) challenge");
  puts("your mission is making an arbitrary-file-readin g shellcode");
  puts("but, can you make this with randomly given set  of bytes?");
  sleep(5);
  getchar();
  local_c4 = open("/dev/urandom",0);
  read(local_c4,&local_d0,4);
  srand(local_d0);
  for (sc_idx = 0; sc_idx < 0x100; sc_idx = sc_idx + 1) {
    filter[sc_idx] = (char)sc_idx;
  }
  shuffle(filter,0x100);
  puts("these are filtered set of bytes:");
  write(1,filter,0x80);
  FILE = popen("./genflag","r");
  if (FILE != (FILE *)0x0) {
    file_name_len = fgets(flag_file_name,0x80,FILE);
    if (file_name_len != (char *)0x0) {
      len = strlen(flag_file_name);
      flag_file_name[len - 1] = '\0';
      printf("flag is inside this file: [%s]\n",flag_file_name );
      sc_buf = (code *)mmap((void *)0x0,0x1000,7,0x22, 0,0);
      memset(sc_buf,0x90,0x1000);
      len = strlen(stub);
      memcpy(sc_buf,stub,len);
      len = strlen(stub);
      var = rand();
      offset = var % 100 + (int)len;
      printf("give me your shellcode: ");
      sc_size = read(0,sc_buf + offset,1000);
      local_bc = (int)sc_size;
      for (sc_idx = 0; sc_idx < local_bc; sc_idx = sc_idx + 1)  {
        for (f_idx = 0; f_idx < 0x80; f_idx = f_idx + 1) {
          if (sc_buf[sc_idx + offset] == (code)filter[f_idx]) {
            puts("caught by filter!");
                    /* WARNING: Subroutine does not return * /
            exit(0);
          }
        }
      }
      sleep(10);
      alarm(10);
      var = shutdown(0,0);
      if (var != 0) {
        puts("shutdown error");
                    /* WARNING: Subroutine does not return * /
        exit(0);
      }
      var = chroot("/home/asg_pwn");
      if (var != 0) {
        puts("chroot error");
                    /* WARNING: Subroutine does not return * /
        exit(0);
      }
      puts("buena suerte!");
      sandbox();
      rand();
      (*sc_buf)();
      return;
    }
  }
  puts("challenge broken. tell admin");
                    /* WARNING: Subroutine does not return * /
  exit(0);
}
```

Nuestro shellcode es insertado a un offset aleatorio entre 0 y 99 bytes, pero igual este espacio es llenado con NOPs antes.

El stub limpia todos los registros (excepto RSP)
```
>>> from pwn import *
>>> context.bits=64
>>> context.arch="amd64"
>>> print(disasm(b'H1\xc0H1\xdbH1\xc9H1\xd2H1\xf6H1\xffH1\xedM1\xc0M1\xc9M1\xd\
2M1\xdbM1\xe4M1\xedM1\xf6M1\xff\x00'))
   0:   48 31 c0                xor    rax, rax
   3:   48 31 db                xor    rbx, rbx
   6:   48 31 c9                xor    rcx, rcx
   9:   48 31 d2                xor    rdx, rdx
   c:   48 31 f6                xor    rsi, rsi
   f:   48 31 ff                xor    rdi, rdi
  12:   48 31 ed                xor    rbp, rbp
  15:   4d 31 c0                xor    r8, r8
  18:   4d 31 c9                xor    r9, r9
  1b:   4d 31 d2                xor    r10, r10
  1e:   4d 31 db                xor    r11, r11
  21:   4d 31 e4                xor    r12, r12
  24:   4d 31 ed                xor    r13, r13
  27:   4d 31 f6                xor    r14, r14
  2a:   4d 31 ff                xor    r15, r15
```

La idea para resolver esto es usar un encoder cuyo stub tenga pocos bytes y pasar el resto del codigo codificado, usando valores de la lista blanca.

Algunas ideas de instrucciones para conformar el stub de este encoder pueden ser `subl $val, offset(%rip)`, `addl $val, offset(%rip)` y `xorl $val, offset(%rip)`.

Los métodos que intenté para poner la flag en el stack generaban un shellcode demasiado largo, al final opté por localizar la ya existente en el stack.

Un buen reto, este definitivamente es más difícil que sus compañeros "ascii"y "asm3".

El exploit que usé tiene una falla y es que el encoder tiene algún problema lógico que produce a veces bytecode malo. Las probabilidades de que se ejecute correctamente todo son del 1% aproximadamente.

`M4nu4lly_m4k1ing_sh31lc0de_is_m0re_fuN`