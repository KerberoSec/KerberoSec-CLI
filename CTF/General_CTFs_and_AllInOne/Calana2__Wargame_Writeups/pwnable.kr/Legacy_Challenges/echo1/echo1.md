# echo1

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/echo1/echo1.png)

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x400000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No
```

```C

undefined8 main(void)

{
  undefined8 *puVar1;
  EVP_PKEY_CTX *ctx;
  uint local_2c;
  undefined4 local_28;
  undefined4 uStack_24;
  undefined8 local_20;
  undefined8 local_18;
  
  setvbuf(stdout,(char *)0x0,2,0);
  setvbuf(stdin,(char *)0x0,1,0);
  o = (undefined8 *)malloc(0x28);
  o[3] = greetings;
  o[4] = byebye;
  printf("hey, what\'s your name? : ");
  __isoc99_scanf(&DAT_00400bbe,&local_28);
  puVar1 = o;
  *o = CONCAT44(uStack_24,local_28);
  puVar1[1] = local_20;
  puVar1[2] = local_18;
  id = local_28;
  getchar();
  func._0_8_ = echo1;
  func._8_8_ = echo2;
  func._16_8_ = echo3;
  local_2c = 0;
  do {
    while( true ) {
      while( true ) {
        puts("\n- select echo type -");
        puts("- 1. : BOF echo");
        puts("- 2. : FSB echo");
        puts("- 3. : UAF echo");
        puts("- 4. : exit");
        printf("> ");
        ctx = (EVP_PKEY_CTX *)&DAT_00400c18;
        __isoc99_scanf(&DAT_00400c18,&local_2c);
        getchar();
        if (3 < local_2c) break;
        (**(code **)(func + (ulong)(local_2c - 1) * 8))();
      }
      if (local_2c == 4) break;
      puts("invalid menu");
    }
    cleanup(ctx);
    printf("Are you sure you want to exit? (y/n)");
    local_2c = getchar();
  } while (local_2c != 0x79);
  puts("bye");
  return 0;
}
```

Este reto existía junto a echo2 en ese entonces, me imagino que lo eliminaron por ser muy similar a bof.

```C
undefined8 echo1(void)
{
  char local_28 [32];
  
  (**(code **)(o + 0x18))(o);
  get_input(local_28,0x80);
  puts(local_28);
  (**(code **)(o + 0x20))(o);
  return 0;
}
void get_input(char *param_1,int param_2)
{
  fgets(param_1,param_2,stdin);
  return;
}
```

Hay un buffer overflow clásico aquí. El programa no es PIE y el stack es ejecutable. No entiendo por qué writeups antiguos afirmaban que redirigir la ejecución a `id`, que se encuentra en una región de memoria rw- funciona. Tal vez es porque el hardware viejo o en Linux antiguos si el programa no usaba NX entonces no lo forzaba en el resto del programa que no fuese el stack. Por otra parte se puede hacer un ret2libc. Es clave usar `id` como dirección para el comando ejecutado por `system` porque podemos controlar `edi`, no `rdi`.

`H4d_som3_fun_w1th_ech0_ov3rfl0w`
