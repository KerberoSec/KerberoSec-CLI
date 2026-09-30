# chatbot

<img width="274" height="362" alt="chatbot" src="https://github.com/user-attachments/assets/bc052a11-5a99-4961-af17-3366a72c6821" />

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x3fc000)
    RUNPATH:    b'./'
    Stripped:   No
```

### Vulnerabilidad 
El programa tiene una vulnerabilidad en `server_thread`:
```C
void server_thread(void)
{
  char *__idx;
  size_t __n;
  long in_FS_OFFSET;
  int idx;
  undefined8 *g_head_ptr;
  char *cursewords_ptr;
  char log [104];
  undefined8 canary;
  
  canary = *(undefined8 *)(in_FS_OFFSET + 0x28);
  sandbox();
  g_server_win = newwin(0xf,0x28,1,0xc);
  draw_list_window(g_server_win);
  do {
    usleep(100000);
    for (g_head_ptr = g_head; g_head_ptr != (undefined8  *)0x0;
        g_head_ptr = (undefined8 *)*g_head_ptr) {
      idx = 0;
      cursewords_ptr = (char *)cursewords._0_8_;
      while (cursewords_ptr != (char *)0x0) {
        __idx = strstr((char *)g_head_ptr[1],cursewords_pt r);
        if (__idx != (char *)0x0) {
          __n = strlen(*(char **)(nicerwords + (long)idx * 8 ));
          strncpy(__idx,*(char **)(nicerwords + (long)idx *  8),__n);
          sprintf(log,"bad word \'%s\' is replaced to nice w ord \'%s\'\n",cursewords_ptr,
                  *(undefined8 *)(nicerwords + (long)idx * 8));
                    /* desbordamiento de g_buf */
          strcat(g_log,log);
        }
        idx = idx + 1;
        cursewords_ptr = *(char **)(cursewords + (long)i dx * 8);
      }
    }
  } while( true );
}
```

`strcat` no verifica limites y permite escribir más allá de `g_buf`, pudiendo sobreescribir `prompt`.

Si sobreescribimos el LSB de `prompt` con un byte nulo, podemos hacer que
`strlen(prompt)=32` cuando el hilo principal está esperando entrada en `wgetch` dentro de `get_input`.

### write-what-where con prompt
Dado que `_len=2` pero `strlen(prompt)=32` ahora podemos retroceder (borrar) hasta `_dest` que contiene la dirección donde se escribe. Con esto se consigue un write-what-where limitado (sin \x7f\x0a\x00).

Con esta vulnerabilidad podemos:
- Sobreescribir `free@got` con la dirección de `main` y abusar de esto tanto como queramos.
- Sobreescribir `prompt` con la dirección de `strlen@got` u otra entrada de la GOT que ya tenga una dirección de libc resuelta y obtener un leak.
- Sobreescribir `free@got` con la dirección de `scanf` u `printf`, o incluso usar ret2csu para conseguir RCE.

###  write-what-where con scanf
`scanf` toma los varargs así:
1. %1$ -> RSI (el formato es RDI)

2. %2$ -> RDX

3. %3$ -> RCX

4. %4$ -> R8

5. %5$ -> R9

6. %6$ -> El primer valor en el stack (justo encima de la dirección de retorno).

El sexto sería por ejemplo de este backtrace:
```
pwndbg> bt
#0  _IO_vfscanf_internal (s=<optimized out>, format=<optimized out>,
    argptr=argptr@entry=0x7fff89265688, errp=errp@entry=0x0) at vfscanf.c:2458
#1  0x00007fd5188485ef in __isoc99_scanf (format=<optimized out>)
    at isoc99_scanf.c:37
#2  0x0000000000401cca in loop ()
#3  0x0000000000401f74 in main ()
#4  0x0000000000401cca in loop ()
```

Este valor antes del retorno a `loop`:
```
pwndbg> f 2
#2  0x0000000000401cca in loop ()
pwndbg> telescope -r 2
00:0000│-048 0x7fff89265758 : ▸ 0x401cca (loop+332) ◂:  mov rax, qword ptr [rip + 0x20152f]
01:0008│ rsp 0x7fff89265760 : ▸ 0x7fff89265800 
```

Donde 0x7fff89265800 es sobreescrito con `free@got`. Buscamos que índice sería 0x7fff89265800 para sobreescribirlo con `system`:
```
pwndbg> p/d ( (0x7fff89265800 -  0x7fff89265760) / 8 ) + 6
$10 = 26
```

El vigésimo sexto. Luego `_IO_vfscanf` hace lo siguiente:
- Recibe "addr(free)-addr(system)"
- "%6$llu": Encuentra el puntero 0x7fff89265760, lo desreferencia y almacena la dirección de `free@got` en él.
- "%26$llu" Encuentra el puntero 0x7fff8926580, lo desreferencia (ahora apunta a free) y almacena la dirección de `system` en él.

`W4at_a_vuln3raBle_cH4t`
