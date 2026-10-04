# Starcraft

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/starcraft.png)

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        PIE enabled
```

### Análisis

El programa simula un juego de combate con unidades del mítico Starcraft. Está escrito en C++ y tiene un montón de clases, y por ende, vtables. Es recomendable tomarse un tiempo para analizarlo, renombrar y crear los tipos correspondientes en Ghidra u otro decompilador.

La unidad *Templar* tiene una opción llamada "*arcon warp*", que transforma la unidad en un *Arcon*. De templar->vtable\[2] a la que nombré `templar_select_attack` podemos observar:
```C
undefined8 templar_select_attack(Templar *this,Protoss *adversary)

{
  undefined8 uVar1;
  ostream *poVar2;
  uint attack_option;
  
  if (this->is_player == 0) {
    if ((Templar *)this->attack_vtable == this) {
      poVar2 = std: operator<<((ostream *)&std: cout,
                               "select attack option (0. default, 1. ar con warp, 2. hallucination, 3. psionic strom) "
                              );
      std: ostream: operator<<(poVar2,std: endl<>);
    }
    else {
      poVar2 = std: operator<<((ostream *)&std: cout,"s elect attack option (0. default) ");
      std: ostream: operator<<(poVar2,std: endl<>);
    }
    std: istream: operator>>((istream *)&std: cin,&attac k_option);
    if (attack_option == 1) {
      (**(code **)(*this->attack_vtable + 0x40))(this->at tack_vtable);
    }
    else if (attack_option == 2) {
      (**(code **)(*this->attack_vtable + 0x48))(this->at tack_vtable);
    }
    else {
      if (attack_option != 3) {
        uVar1 = attacking_and_calling_vtable[3]
                          ((Terran_or_Zerg *)this->attack_vtable,( Terran_or_Zerg *)adversary);
        return uVar1;
      }
      (**(code **)(*this->attack_vtable + 0x50))(this->at tack_vtable);
    }
    uVar1 = 0;
  }
  else {
    uVar1 = attacking_and_calling_vtable[3]((Terran_or_Zerg *)this,(Terran_or_Zerg *)adversary);
  }
  return uVar1;
}
```

`attack_vtable` es un puntero a la estructura de esta unidad en particular que se usa para decidir si es un *Templar* o un *Arcon*. La opcion 1 llama a `attack->vtable+0x40` (vtable\[8]), funcion que nombre `arcon_warp`:

```
                                                                   templar_vtable                                                                                     XREF[2]:               set_templar:00103e75(*), 
                                                                                                                                                                                                                 set_templar:00103e79(*)  
                   00306810  82 27 10 00               addr                  ascii_artwork
                                        00 00 00 00
                   00306818  4e 3f 10 00                addr                  FUN_00103f4e
                                        00 00 00 00
                   00306820  f2 3f 10 00 00           addr                  templar_select_attack
                                        00 00 00
                   00306828  8e 3f 10 00                addr                  FUN_00103f8e
                                        00 00 00 00
                   00306830  26 3f 10 00                addr                  FUN_00103f26
                                        00 00 00 00
                   00306838  30 3f 10 00                addr                  FUN_00103f30
                                        00 00 00 00
                   00306840  3a 3f 10 00                addr                  FUN_00103f3a
                                        00 00 00 00
                   00306848  44 3f 10 00                addr                  FUN_00103f44
                                        00 00 00 00
                   00306850  4e 41 10 00                addr                  arcon_warp
                                        00 00 00 00
```

```C
void arcon_warp(Templar *unit)

{
  Templar *new;
  ostream *this;
  
  if ((Templar *)unit->attack_vtable == unit) {
    new = (Templar *)operator.new(0x138);
                    /* try { // try from 00104187 to 0010418b h as its CatchHandler @ 001041da */
    Create_Arcon(new,unit->is_player);
    unit->attack_vtable = (ulong *)new;
    std: string: operator=((string *)&unit->shield,"arcon ");
  }
  else {
    this = std: operator<<((ostream *)&std: cout,"can\'t morph twice");
    std: ostream: operator<<(this,std: endl<>);
  }
  return;
}
```

```C
void Create_Arcon(Templar *arcon,uint is_player)

{
  ostream *this;
  
  FUN_00102bbc(arcon);
  arcon->vtable = (ulong **)&arcon_vtable;
  arcon->is_player = is_player;
  arcon->hp = 10;
  *(undefined4 *)(arcon->padding2 + 8) = 350;
  arcon->weapon = 50;
  arcon->armor = 1;
                    /* try { // try from 00103d5d to 00103d89 h as its CatchHandler @ 00103d8c */
  std: string: operator=((string *)&arcon->shield,"arcon");
  this = std: operator<<((ostream *)&std: cout,"Mas of energy!");
  std: ostream: operator<<(this,std: endl<>);
  return;
}
```

*`Nota: Perdonen algunas inconsistencias en el decompilado como puede ser std: string: operator=((string *)&arcon->shield,"arcon"); en donde deberia ser &arcon->name.`*

Como se puede observar `attack_vtable` fue sustituida por la nueva estructura o clase *Arcon*. Sin embargo nótese en `templar_select_attack` que el lugar a donde apunta `attack_vtable` solo se toma en cuenta para mostrar el menú de opciones. Pero se puede elegir una opción fuera de rango aún siendo un *Arcon*:
```C
   else {
      poVar2 = std: operator<<((ostream *)&std: cout,"s elect attack option (0. default) ");
      std: ostream: operator<<(poVar2,std: endl<>);
    }
    // No hay validaciones aqui
    std: istream: operator>>((istream *)&std: cin,&attac k_option);
    if (attack_option == 1) {
      (**(code **)(*this->attack_vtable + 0x40))(this->at tack_vtable);
    }
    else if (attack_option == 2) {
      (**(code **)(*this->attack_vtable + 0x48))(this->at tack_vtable);
    }
    else {
      if (attack_option != 3) {
        uVar1 = attacking_and_calling_vtable[3]
                          ((Terran_or_Zerg *)this->attack_vtable,( Terran_or_Zerg *)adversary);
        return uVar1;
      }
      (**(code **)(*this->attack_vtable + 0x50))(this->at tack_vtable);
    }
```

### Type Confusion

Esta es una vulnerabilidad de confusión de tipo, donde, por ejemplo, seleccionando la opción 3, el cálculo para encontrar la función a ser invocada es este:
```C
(**(code **)(*this->attack_vtable + 0x50))(this->at tack_vtable);
```

```
   arcon_vtable                                                                                         XREF[2]:               Create_Arcon:00103d0b(*),                                                                                                                                                                                                         Create_Arcon:00103d0f(*)  
   00306890  82 27 10 00               addr                  ascii_artwork
```

```
hex(0x00306890 + 0x50)
'0x3068e0'
```

```
                   ultralisk_vtable                    XREF[2]:               set_ultralisk:00103c41(*), 
                                                                                                                                                                                                                 set_ultralisk:00103c45(*)  
                   003068d0  82 27 10 00               addr                 ascii_artwork
                                        00 00 00 00
                   003068d8  04 32 10 00               addr                 zerg_info
                                        00 00 00 00
                   003068e0  c4 2f 10 00               addr                 zerg_select   <---
                                        00 00 00 00
                   003068e8  b8 30 10 00               addr                 zerg_attack
                                        00 00 00 00
                   003068f0  d0 31 10 00               addr                 burrow
                                        00 00 00 00
```

```
 ./starcraft
select your unit
1. Marin
2. Firebat
3. Ghost
4. Zealot
5. Draon
6. Templar
7. Zergling
8. Hydralisk
9. Ultralisk
6
Khassar' Detemplari...
Stage 1 start!
computer selected....My life for Aiur!

you are templar
computer is zealot

zealot is attacking templar
******* templar(me) *******
   Shield : 12
   HP : 20
   Weapon : 0
   Armor : 0
*************************

select attack option (0. default, 1. arcon warp, 2. hallucination, 3. psionic strom)
1
Mas of energy!
******* zealot(enemy) *******
   Shield : 60
   HP : 60
   Weapon : 8
   Armor : 1
*************************

zealot is attacking arcon
******* arcon(me) *******
   Shield : 342
   HP : 10
   Weapon : 50
   Armor : 1
*************************

select attack option (0. default)
3
select attack option (0. default, 1. burrow)
```

Boom!, acabamos invocando métodos en la vtable de la clase *Hydralisk*. Ahora veremos como explotar esto.

### Libc Leak

Si usamos la opcion 2, invocamos a `zerg_info`:
```C

void zerg_info(Terran_or_Zerg *unit)

{
  int iVar1;
  ostream *poVar2;
  
  if (unit->is_player == 0) {
    poVar2 = std: operator<<((ostream *)&std: cout,"## ##### ");
    poVar2 = std: operator<<(poVar2,(string *)&unit->n ame);
    poVar2 = std: operator<<(poVar2,"(me) #######");
    std: ostream: operator<<(poVar2,std: endl<>);
  }
  else {
    poVar2 = std: operator<<((ostream *)&std: cout,"## ##### ");
    poVar2 = std: operator<<(poVar2,(string *)&unit->n ame);
    poVar2 = std: operator<<(poVar2,"(enemy) ###### #");
    std: ostream: operator<<(poVar2,std: endl<>);
  }
  iVar1 = unit->hp;
  poVar2 = std: operator<<((ostream *)&std: cout,"   H P : ");
  poVar2 = (ostream *)std: ostream: operator<<(poVar 2,iVar1);
  std: ostream: operator<<(poVar2,std: endl<>);
  iVar1 = unit->weapon;
  poVar2 = std: operator<<((ostream *)&std: cout,"   W eapon : ");
  poVar2 = (ostream *)std: ostream: operator<<(poVar 2,iVar1);
  std: ostream: operator<<(poVar2,std: endl<>);
  iVar1 = unit->armor;
  poVar2 = std: operator<<((ostream *)&std: cout,"   Ar mor : ");
  poVar2 = (ostream *)std: ostream: operator<<(poVar 2,iVar1);
  std: ostream: operator<<(poVar2,std: endl<>);
  iVar1 = unit->is_burrowed;
  poVar2 = std: operator<<((ostream *)&std: cout,"   is burrowed : ");
  poVar2 = (ostream *)std: ostream: operator<<(poVar 2,iVar1);
  std: ostream: operator<<(poVar2,std: endl<>);
  iVar1 = *(int *)unit->burrowable;
  poVar2 = std: operator<<((ostream *)&std: cout,"   is burrow-able? : ");
  poVar2 = (ostream *)std: ostream: operator<<(poVar 2,iVar1);
  std: ostream: operator<<(poVar2,std: endl<>);
  poVar2 = std: operator<<((ostream *)&std: cout,"## #######################");
  std: ostream: operator<<(poVar2,std: endl<>);
  return;
}
```

Las propiedades `is_burrowed` y `burrowable` se encuentran bastante lejos de la direccion base de la clase y son contiguas:
```
Class Zerg
0x0	0x8	ulong * *	ulong * *	vtable	
0x8	0x4	int	int	is_player	
0xc	0x4	int	int	hp	
0x10	0x4	int	int	weapon	
0x14	0x4	int	int	armor	
0x18	0x8	string *	string *	name	
0x20	0x108	char[264]	char[264]	padding	
0x128	0x4	int	int	is_burrowed	
0x12c	0x20	char[32]	char[32]	burrowable	
```

```
                   0010335d  48 8b 45 e8               MOV                  RAX,qword ptr [RBP + local_20]
                   00103361  8b 98 28 01               MOV                  EBX,dword ptr [RAX + 0x128]  // is_burrowed
                                        00 00
                   00103367  48 8d 35 15               LEA                    RSI,[s_is_burrowed_:_00105083]                                                      = "   is burrowed : "
                                        1d 00 00
                   0010336e  48 8b 05 fb                MOV                  RAX,qword ptr [->std: cout]                                                                = 00308090
                                        3b 20 00
                   00103375  48 89 c7                     MOV                  unit=>std: cout,RAX                                                                              = ??
                   00103378  e8 63 ed ff ff             CALL                 <EXTERNAL>: std: operator<<                                                           ostream * operator<<(ostream * param
                   0010337d  89 de                          MOV                  ESI,EBX
                    0010337f  48 89 c7                     MOV                  unit,RAX
                   00103382  e8 09 ed ff ff             CALL                 <EXTERNAL>: std: ostream: operator<<                                         undefined operator<<(ostream * this, int
                   00103387  48 8b 15 2a               MOV                  RDX=><EXTERNAL>: std: endl<>,qword ptr [-><EXTERNAL>:     = ??
                                        3c 20 00                                                                                                                                                                 = 003080d8
                   0010338e  48 89 d6                     MOV                  RSI=><EXTERNAL>: std: endl<>,RDX                                                = ??
                   00103391  48 89 c7                     MOV                  unit,RAX
                   00103394  e8 e7 ed ff ff             CALL                 <EXTERNAL>: std: ostream: operator<<                                         undefined operator<<(ostream * this, _fu
                   00103399  48 8b 45 e8               MOV                  RAX,qword ptr [RBP + local_20]
                   0010339d  8b 98 2c 01               MOV                  EBX,dword ptr [RAX + 0x12c]  // burrowable
                                        00 00
```

```
select attack option (0. default)
2
####### arcon(me) #######
   HP : 10
   Weapon : 50
   Armor : 1
   is burrowed : -1021185216
   is burrow-able? : 32708
#########################
```

Hay un leak de una direccion de memoria:
```
pwndbg> pd 1
   0x55555540335d    mov    rax, qword ptr [rbp - 0x18]
 ► 0x555555403361    mov    ebx, dword ptr [rax + 0x128]     EBX, [0x55555561af18] => 0xf7a4c340
pwndbg> regs
 RAX  0x55555561adf0 : ▸ 0x555555606890 (vtable for Arcon+16) : ▸ 0x555555402782 ◂:  push rbp
*RBX  0xf7a4c340
pwndbg> x/gx 0x55555561af18
0x55555561af18: 0x00007ffff7a4c340
pwndbg> x/gx  0x00007ffff7a4c340
0x7ffff7a4c340 <__GI_exit>:     0x000001b908ec8348
pwndbg> vmmap libc
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
             Start                End Perm     Size Offset File (set vmmap-prefer-relpaths on)
    0x555555608000     0x555555629000 rw-p    21000      0 [heap]
►   0x7ffff7a0a000     0x7ffff7a32000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
►   0x7ffff7a32000     0x7ffff7b97000 r-xp   165000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
►   0x7ffff7b97000     0x7ffff7bed000 r--p    56000 18d000 /usr/lib/x86_64-linux-gnu/libc.so.6
►   0x7ffff7bed000     0x7ffff7bf1000 r--p     4000 1e2000 /usr/lib/x86_64-linux-gnu/libc.so.6
►   0x7ffff7bf1000     0x7ffff7bf3000 rw-p     2000 1e6000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7bf3000     0x7ffff7c00000 rw-p     d000      0 [anon_7ffff7bf3]
pwndbg> distance  0x7ffff7a0a000 0x00007ffff7a4c340
0x7ffff7a0a000->0x7ffff7a4c340 is 0x42340 bytes (0x8468 words)
```

El leak es de `exit` en `libc`, los offsets coinciden con mi version de glibc:
```
readelf -a /lib/x86_64-linux-gnu/libc.so.6 | grep exit                                  
0000001e6e88  056800000006 R_X86_64_GLOB_DAT 00000000001e7208 obstack_exit_failure@@GLIBC_2.2.5 + 0
0000001e6fa8  008000000006 R_X86_64_GLOB_DAT 00000000001e72e8 argp_err_exit_status@@GLIBC_2.2.5 + 0
   531: 0000000000042340    26 FUNC    GLOBAL DEFAULT   15 exit@@GLIBC_2.2.5
```

Ahora con este leak solo necesitamos alguna forma de hacer ret2libc.

### ascii_artwork

Habrá notado el lector que `ascii_artwork` aparece como la primera funcion en ser referenciada por las vtables de cada unidad. Veamos que hace:
```C
void ascii_artwork(Templar *unit)

{
  ostream *this;
  
  if ((float)m_level < (float)g_level) {
    this = std: operator<<((ostream *)&std: cout,"input unit ascii artwork : ");
    std: ostream: operator<<(this,std: endl<>);
    FUN_001026f8(std: string: string,300);
    std: operator>>((istream *)&std: cin,unit->padding + 4);
  }
  return;
}
```

```
Class Templar
0x0	0x8	ulong * *	ulong * *	vtable	
0x8	0x4	uint	uint	is_player	
0xc	0x4	uint	uint	hp	
0x10	0x4	uint	uint	weapon	
0x14	0x4	uint	uint	armor	
0x18	0x4	uint	uint	shield	
0x1c	0x104	char[260]	char[264]	padding	
0x124	0x8	ulong *	ulong *	called_address	
0x12c	0x10	char[16]	char[16]	padding2	
0x13c	0x8	ulong *	ulong *	attack_vtable	
```

La funcion escribe hasta 300 bytes a un offset de 0x20 bytes de la clase que lo invoca. Tenga esto en mente.

Cada clase ofrece una posibilidad de "hacer trampa" luego de perder:
```C

undefined8 zerg_attack(Templar *adversary,Terran_o r_Zerg *this)

{
  ostream *poVar1;
  undefined8 uVar2;
  int local_1c [3];
  
  if (*(int *)adversary->padding2 == 0) {
    adversary->hp = adversary->hp + (adversary->arm or - this->weapon);
  }
  if ((int)adversary->hp < 0) {
    poVar1 = std: operator<<((ostream *)&std: cout,(str ing *)&adversary->shield);
    poVar1 = std: operator<<(poVar1," is dead!");
    std: ostream: operator<<(poVar1,std: endl<>);
    if (adversary->is_player == 0) {
      std: operator<<((ostream *)&std: cout,"wanna che at...? (yes:1 / no:0) : ");
      std: istream: operator>>((istream *)&std: cin,local_ 1c);
      if (local_1c[0] != 0) {
        poVar1 = std: operator<<((ostream *)&std: cout," ha! its an exit trap. no ROP for you :P");
        std: ostream: operator<<(poVar1,std: endl<>);
        (*(code *)adversary->called_address)(0x31337);
      }
    }
    uVar2 = 1;
  }
  else {
    uVar2 = 0;
  }
  return uVar2;
}
```

Y casualmente acaban invocando lo que sea que contenga la clase en el offset 0x128, pasandole el parametro 0x31337.

### Explotación

La idea es obtener el leak de `exit` para calcular la direccion base de `libc`, luego llamara a `ascii_artwork` para escribir nuestra direccion en el offest 0x128. Lamentablemente en este vector no podemos controlar parámetros y solo podemos usar un gadget. Usar one_gadget no me resultó porque ninguno cumplía los requisitos necesarios así que la estrategia cambió un poco.

El programa en `main` da otra opcion de "hacer trampas":
```C
      std: operator<<((ostream *)&std: cout,"wanna che at? (yes/no) : ");
      std: operator>>((istream *)&std: cin,input);
      answer = strstr(input,"yes");
      if (answer != (char *)0x0) {
        std: operator<<((ostream *)&std: cout,"your com mand : ");
        std: operator>>((istream *)&std: cin,input);
        (*(code *)*game_state->functions)(game_state,in put);
```

`game_state->functions` apunta a la funcion que llamé `cheat_codes`:
```C

void cheat_codes(new_struct *game_state,char *input )

{
  char *coincidence;
  ostream *poVar1;
  
  coincidence = strstr(input,"show me the money");
  if (coincidence != (char *)0x0) {
    game_state->resources = game_state->resources +  10000;
  }
  coincidence = strstr(input,"black sheep wall");
  if (coincidence != (char *)0x0) {
    poVar1 = std: operator<<((ostream *)&std: cout,"no w I see the map!");
    std: ostream: operator<<(poVar1,std: endl<>);
  }
  coincidence = strstr(input,"there is no cow level");
  if (coincidence != (char *)0x0) {
    poVar1 = std: operator<<((ostream *)&std: cout,"vic tory!");
    std: ostream: operator<<(poVar1,std: endl<>);
  }
  coincidence = strstr(input,"there is no pwnable.kr lev el");
  if ((coincidence != (char *)0x0) && (999999 < (int)ga me_state->resources)) {
    std: operator<<((ostream *)&std: cout,"you cheater! ");
  }
  return;
}
```

En sí esta función no aporta nada, de hecho ni siquiera podemos hacer una coincidencia porque `cin` deja de consumir entrada en el primer espacio.

Sin embargo algo que si se puede notar es que:
```C
char input [72];
```

Y que `cin` NO limita la cantidad de caracteres, o por lo menos eso parece. Lo que nos permite causar un buffer overflow y tener una ROPchain en el stack.

¿De qué nos sirve esto si `main` está protegida por un canario? Bueno, podemos usar un gadget tipo `add rsp, imm; ret` para mover el puntero de pila hacia nuestra entrada en `main`, con lo que podemos hacer un `ret2libc` para invocar `system("/bin/sh")` sin problemas.

`c14ss_typ3_c0nfusion_1s_so0o_CoNfus1nG`