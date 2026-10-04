# wtf

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/wtf.png)
```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    Stripped:   No
```

```C
undefined8 main(void)

{
  undefined buffer [44];
  int len;
  
  __isoc99_scanf(&%d,&len);
  if (0x20 < len) {
    puts("preventing buffer overflow");
    len = 0x20;
  }
  my_fgets(buffer,len);
  return 0;
}
```

El programa comprueba el numero de bytes a escribir pero la variable `len` es un entero con signo, si pasamos un valor negativo acabamos esquivandola.

```C
int my_fgets(long buffer,int len)

{
  bool bVar1;
  int local_24;
  char char;
  int local_c;
  
  local_c = 0;
  local_24 = len;
  while ((bVar1 = local_24 != 0, local_24 = local_24 + -1, bVar1 && (read(0,&char,1), char != '\n'))
        ) {
    *(char *)(local_c + buffer) = char;
    local_c = local_c + 1;
  }
  return local_c;
}
```

Y el bucle de escritura usa una variable `local_24` que contiene la cantidad de bytes a escribir y las disminuye en el bucle. Si `local_24` es negativo acabamos escribiendo en `buffer[-local_24]`. Esto es un OOB que permite sobreescribir la direccion de retorno de `my_fgets`.

```C
void win(void)

{
  system("/bin/cat flag");
  return;
}
```

Con esto seria suficiente para hacer ROP a la funcion `win` y obtener la flag pero en remoto solo podemos interactuar con `win.py`, que tomanuestra entrada y la envia de una vez, por lo que `scanf` lo captura todo.

`scanf` usa `%d`, que no limita la cantidad de caracteres que consume,por lo que internamente usa un buffer de 4096 bytes. Sabiendo esto podemos completar el exploit:

`LIBC_buff3ring_dr1ves_m3_cr4zy`