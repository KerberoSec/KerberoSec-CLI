# Note

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/note.png)

```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

## Mmap feng shui

El programa es cargado con `linux32`:
```C
#include <stdio.h>
#include <unistd.h>

int main(){
        char* args[] = {"/usr/bin/setarch", "linux32", "-R", "./note", 0};
        execve(args[0], args, 0);
        printf("execve failed!. tell admin\n");
        return 0;
}
```

`-R` desactiva el ASLR y el espacio de direcciones de `note` es de 32 bits al ejecutarse.

El programa crea chunks (que luegos podemos editar, leer y eliminar) con `mmap_s`, un wrapper de `mmap`:
```

void create_note(void)

{
  uint **mmap_chunk;
  int idx;
  
  idx = 0;
  while( true ) {
    if (255 < idx) {
      puts("memory sults are fool");
      return;
    }
    if ((&mem_arr_1028)[idx] == (uint **)0x0) break;
    idx = idx + 1;
  }
  mmap_chunk = (uint **)mmap_s(0,0x1000,7,0x22,0x ffffffff,0);
  (&mem_arr_1028)[idx] = mmap_chunk;
  printf("note created. no %d\n [%08x]",idx,mmap_chu nk);
  return;
}
```

Los chunks tienen una extensión de 4096 bytes, y son ejecutables (protections = 7 = PROT_READ | PROT_WRITE | PROT_EXEC). Además conocemos sus direcciones de memoria.

``` C
void * mmap_s(void *addr,size_t length,int prot,uint fl ags,int fd,__off_t offset)

{
  int __fd;
  ssize_t random_int;
  void *pvVar1;
  
  if ((addr == (void *)0x0) && ((flags & 0x10) == 0)) {
    __fd = open("/dev/urandom",0);
    if (__fd == -1) {
                    /* WARNING: Subroutine does not return * /
      exit(-1);
    }
    random_int = read(__fd,&addr,4);
    if (random_int != 4) {
                    /* WARNING: Subroutine does not return * /
      exit(-1);
    }
    close(__fd);
    addr = (void *)((uint)addr & 0x7ffff000 | 0x8000000 0);
    while (pvVar1 = mmap(addr,length,prot,flags | 0x10 ,__fd,offset), pvVar1 == (void *)0xffffffff) {
      addr = (void *)((int)addr + 0x1000);
    }
  }
  else {
    pvVar1 = mmap(addr,length,prot,flags,fd,offset);
  }
  return pvVar1;
}
```

Reserva memoria en una direccion aleatoria pero `addr & 0x7ffff000 | 0x8000000` permite que mantenga la mayor parte de los bytes altos activos:
```
>>> hex(0x7ffff000 | 0x8000000)
'0x7ffff000'
```

Por lo que podemos reservar chunks **muy cerca del stack**. Este es el punto, podemos reservar chunks hasta que tengamos uno que comience por `0x7fff`.

## Stack grooming

```C

void select_menu(void)

{
  char command [1024];
  int select [3];
  
  puts("- Select Menu -");
  puts("1. create note");
  puts("2. write note");
  puts("3. read note");
  puts("4. delete note");
  puts("5. exit");
  __isoc99_scanf(&DAT_08048d0b_%d,select);
  clear_newlines();
  if (select[0] == 3) {
    read_note();
    goto LAB_080489eb;
  }
  if (select[0] < 4) {
    if (select[0] == 1) {
      create_note();
      goto LAB_080489eb;
    }
    if (select[0] == 2) {
      write_note();
      goto LAB_080489eb;
    }
  }
  else {
    if (select[0] == 5) {
      puts("bye");
      return;
    }
    if (select[0] < 5) {
      delete_note();
      goto LAB_080489eb;
    }
    if (select[0] == 201527) {
      puts("welcome to hacker\'s secret menu");
      puts("i\'m sure 1byte overflow will be enough for y ou to pwn this");
      fgets(command,1025,stdin);
      goto LAB_080489eb;
    }
  }
  puts("invalid menu");
LAB_080489eb:
  select_menu();
  return;
}
```

En `select_menu` la funcion no usa un bucle sino que se llama a sí misma recursivamente. Por lo que en cada iteracion el stack crece `1024+3*4+8=1044` bytes aproximadamente. El stack **crece hacia direcciones de memoria menores**.

Podemos llamarla una buena cantidad de veces hasta hacer que el stack se solape con un chunk mmapeado.

## Exploit

- Creamos un primer chunk de mmap y le introducimos shellcode.
- Reservamos un segundo chunk de mmap tan cerca como sea posible del stack. Basta con que comience con `0xfff`.
- Llamamos a `select_menu` un par de veces mas hasta que se solape con el segundo chunk. Es posible un SEGMENTATION FAULT aqui.
- Escribimos en el segundo chunk la direccion del primer chunk tantas veces como podamos. Ahora, con suerte, alguna de las muchas direcciones de retorno a `select_menu` almacenadas en el stack (o las de `main` o `libc_start_main`) contendrá la dirección del primer chunk
- Enviamos '5' al programa para forzar un retorno y obtenemos la shell.

`fy1_mmap_s_st4nds_f0r_mmap_stup1d`