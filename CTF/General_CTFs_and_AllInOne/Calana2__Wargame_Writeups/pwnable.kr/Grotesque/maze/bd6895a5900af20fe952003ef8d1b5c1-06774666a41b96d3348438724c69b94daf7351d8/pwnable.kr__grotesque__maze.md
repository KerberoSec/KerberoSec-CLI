# maze

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/maze.png)

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
```

El reto consiste en completar 20 niveles para poder acceder a una funcion a la que llamaremos `record_name` con un claro buffer overflow:
```C
void record_name(void)

{
  char local_38 [48];
  
  DAT_006020e0 = fopen("record","a+");
  printf("record your name : ");
  gets(local_38);
  fprintf(DAT_006020e0,"PLAYER : %s has PWNED the MAZE\n",local_38);
  fclose(DAT_006020e0);
  return;
}
```

Y tenemos una shell por aqui:

```C
void FUN_004017b4(void)

{
  system("/bin/sh");
  return;
}
```

Intenté durante un tiempo resolverlo con algoritmos de búsqueda pero no resultó muy bien. Resulta que el codigo tiene esta funcion `play`:
```C
undefined8 main(void)

{
  setvbuf(stdout,(char *)0x0,2,0);
  setvbuf(stdin,(char *)0x0,1,0);
  puts("PLEASE BREAK OUT OF THIS MAZE");
  puts("GO TO [] IN ORDER TO EXIT THE MAZE");
  puts("WATCH THE GUARDIANS(^^) OF THE MAZE!");
  puts("BE CAREFUL AND GOOD LUCK, SEE YOU AT 20 \'th LEVEL...");
  puts("PRESS ANY KEY TO START THE GAME");
  getchar();
  clear_count = 1;
  do {
    build_maze();
    play();
    printf("\rlevel %d clear!\n",(ulong)clear_count);
    sleep(1);
    clear_count = clear_count + 1;
  } while (clear_count < 21);
  puts("Congratz! you win!");
  record_name();
  return 0;
}

void play(void)

{
  char key;
  uint __seed;
  int iVar1;
  uint local_10;
  
  do {
    do {
      __seed = rand();
      srand(__seed);
      for (local_10 = 0; local_10 < guard_number; local_1 0 = local_10 + 1) {
        guard_settings(local_10);
      }
      setting_maps();
      iVar1 = player_hit_a_guard();
      if (iVar1 == 0) {
        puts("you are caught!");
                    /* WARNING: Subroutine does not return * /
        exit(0);
      }
      iVar1 = getchar();
      key = (char)iVar1;
      iVar1 = move_player((int)key,(int)player_x,(int)play er_y,0x53);
    } while (iVar1 == 0);
    (&maze)[(long)(int)player_x + (long)(int)player_y * 0 x10] = 0x30;
    if (key == 'd') {
      player_x = player_x + 1;
    }
    else if (key < 'e') {
      if (key == 'a') {
        player_x = player_x + -1;
      }
      else {
LAB_00401166:
        if ((global_count == 0) && (key == 'O')) {
          global_count = 1;
        }
        else {
          if (global_count == 0) {
            global_count = 0;
          }
          if ((global_count == 1) && (key == 'P')) {
            global_count = 2;
          }
          else {
            if (global_count == 1) {
              global_count = 0;
            }
            if ((global_count == 2) && (key == 'E')) {
              global_count = 3;
            }
            else {
              if (global_count == 2) {
                global_count = 0;
              }
              if ((global_count == 3) && (key == 'N')) {
                global_count = 4;
              }
              else {
                if (global_count == 3) {
                  global_count = 0;
                }
                if ((global_count == 4) && (key == 'S')) {
                  global_count = 5;
                }
                else {
                  if (global_count == 4) {
                    global_count = 0;
                  }
                  if ((global_count == 5) && (key == 'E')) {
                    global_count = 6;
                  }
                  else {
                    if (global_count == 5) {
                      global_count = 0;
                    }
                    if ((global_count == 6) && (key == 'S')) {
                      global_count = 7;
                    }
                    else {
                      if (global_count == 6) {
                        global_count = 0;
                      }
                      if ((global_count == 7) && (key == 'A')) {
                        global_count = 8;
                      }
                      else {
                        if (global_count == 7) {
                          global_count = 0;
                        }
                        if ((global_count == 8) && (key == 'M')) {
                          global_count = 9;
                        }
                        else {
                          if (global_count == 8) {
                            global_count = 0;
                          }
                          if ((global_count == 9) && (key == 'I')) {
                            global_count = 10;
                          }
                          else {
                            if (global_count == 9) {
                              global_count = 0;
                            }
                            // mira esto
                            if ((((global_count == 10) && (player_y == 14)) && (player_x == 8)) &&
                               (4 < clear_count)) {
                              sus_byte = 0x30;
                            }
                            else if (global_count == 10) {
                              global_count = 0;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    else if (key == 's') {
      player_y = player_y + '\x01';
    }
    else {
      if (key != 'w') goto LAB_00401166;
      player_y = player_y + -1;
    }
    if ((&maze)[(long)(int)player_x + (long)(int)player_y * 0x10] == 'E') {
      return;
    }
    (&maze)[(long)(int)player_x + (long)(int)player_y * 0 x10] = 0x53;
    printf("player at %d, %d\n",(ulong)(uint)(int)player_x ,(ulong)(uint)(int)player_y);
  } while( true );
}
```

Hay una variable `global_count` que aumenta si introducimos los caracteres `OPENSESAMI` enese orden, y, si de casualidad estamos en esa posicion, un byte en `0x00602218` cambia su valor a 0x30, o sea, '0'. Si depuramos con `gdb` o similar el programa vemos que esto lo que hace es "abrir" un muro en la mazmorra! Esto produce un Out Of Bounds.

El programa escribe '1' en la casilla ocupada actualmente por el jugador y '0' en la casilla anterior, por lo que podemos "pisar" otras variables, y cambiar sus bytes a 0x30. `clear_count` se encuentra en `0x006022441`, a 44 bytes de el byte "del muro". Para llegar alli, sobreescribir uno de sus bytes a 0x30 (48) y asi ganar al completar el nivel 5, nos desplazamos 2 casillas hacia abajo y 12 a la derecha (2*16+12=44) y luego volvemos por el mismo camino a la salida.

`P0cket_protector_prot3ctor_pr0tect0r`