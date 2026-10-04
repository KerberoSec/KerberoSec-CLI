
# codemap

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/codemap/codemap.png)

```C
void main(void)

{
  undefined4 *chunk1;
  void *chunk2;
  uint random;
  int i;
  uint malloc_size;
  char *alphabet;
  uint uVar1;
  uint loop_var;
  void *biggest_chunk;
  ulong number_of_chunks;
  uint biggest_size;
  undefined4 local_54;
  uint stack_canary;
  void *local_10;
  undefined *puStack_c;
  undefined4 local_8;
  
  local_8 = 0xffffffff;
  puStack_c = &LAB_0040cb1b;
  local_10 = ExceptionList;
  stack_canary = stack_cookie ^ (uint)&stack0xfffffffc;
  ExceptionList = &local_10;
  FID_conflict:_wprintf("I will make 1000 heap chunks with random size\n",stack_canary);
  FID_conflict:_wprintf("each heap chunk has a random  string\n");
  FID_conflict:_wprintf("press enter to start the memor y allocation\n");
  __fgetchar();
  biggest_size = 0;
  number_of_chunks = 0;
  do {
    srand(number_of_chunks);
    malloc_size = rand();
    chunk1 = (undefined4 *)operator_new(8);
    local_8 = 0;
    if (chunk1 == (undefined4 *)0x0) {
      chunk1 = (undefined4 *)0x0;
    }
    else {
      *chunk1 = RandomNumber::vftable;
      chunk2 = operator_new(8);
      if (chunk2 == (void *)0x0) {
        chunk1[1] = 0;
      }
      else {
        *(int *)((int)chunk2 + 4) = (((int)(malloc_size * 100 00) % 0x539) * 10000 >> 1) + 0x7b;
        chunk1[1] = chunk2;
      }
    }
    local_8 = 0xffffffff;
    malloc_size = (**(code **)*chunk1)();
    malloc_size = malloc_size % 100000;
    chunk2 = _malloc(malloc_size);
    if (0xf < malloc_size) {
      alphabet = "abcdefghijklmnopqrstubwxyzABCDEF GHIJKLMNOPQRSTUVWXYZ1234567890";
      chunk1 = &local_54;
      for (i = 15; i != 0; i = i + -1) {
        *chunk1 = *(undefined4 *)alphabet;
        alphabet = alphabet + 4;
        chunk1 = chunk1 + 1;
      }
      *(undefined2 *)chunk1 = *(undefined2 *)alphabet;
      *(char *)((int)chunk1 + 2) = alphabet[2];
      uVar1 = 0;
      do {
        random = rand();
        loop_var = uVar1 + 1;
        *(undefined *)(uVar1 + (int)chunk2) = *(undefine d *)((int)&local_54 + (int)random % 62);
        uVar1 = loop_var;
      } while (loop_var < 15);
      *(undefined *)((int)chunk2 + 0xf) = 0;
      if (biggest_size < malloc_size) {
        biggest_chunk = chunk2;
        biggest_size = malloc_size;
      }
    }
    number_of_chunks = number_of_chunks + 1;
  } while (number_of_chunks < 1000);
  FID_conflict:_wprintf("the allcated memory size of big gest chunk is %d byte\n",biggest_size);
  FID_conflict:_wprintf("the string inside that chunk is %s\n",biggest_chunk);
  FID_conflict:_wprintf("log in to pwnable.kr and anwer some question to get flag.\n");
  __fgetchar();
  ExceptionList = local_10;
  @__security_check_cookie@4(stack_canary ^ (uint)&s tack0xfffffffc);
  return;
}
```

```
    I will make 1000 heap chunks with random size
    each heap chunk has a random string
    press enter to start the memory allocation

    the allocated memory size of biggest chunk is 99879 byte
    the string inside that chunk is X12nM7yCJcu0x5u
    log in to pwnable.kr and anwer some question to get flag.

```

El programa es un ejecutable de Windows que crea 1000 chunks en el heap con tamaño aleatorio y llena cada uno con una cadena aleatoria de 15 caracteres del alfabeto dado. El generador de números aleatorios es inicializado con `srand(0)` siempre, así que ambos algoritmos aleatorios son deterministas. El servidor ya no está disponible pero supuestamente hacía estas dos preguntas:
- What's inside the 2nd biggest chunk in the heap?
- What's inside the 3rd biggest chunk in the heap?

Aunque supuestamente el reto fue nombrado como una extensión para IDA que desarrolló el creador, yo usé x32dbg en windows para rastrear las llamadas y almacenar las direcciones y tamaños en un log. 

<img width="1361" height="721" alt="codemap1" src="https://github.com/user-attachments/assets/d9758367-55e7-46bf-a7ec-243f2a09f12c" />

<img width="1365" height="718" alt="codemap12" src="https://github.com/user-attachments/assets/5c102a66-c677-43ad-a8d7-df3937c9fb6f" />

Posteriormente usé un script de Python para obtener los valores correctos
```py
sizes = []
with open("codemap.log") as logfile:
    for line in logfile.readlines():
        val = int(line[(line.index("=")+1):].strip(),16)
        if "size" in line:
            sizes.append(val)

sizes.sort(reverse=True)

print(f"Biggest chunk: {hex(sizes[0])}")
print(f"Second biggest chunk: {hex(sizes[1])}")
print(f"Third biggest chunk: {hex(sizes[2])}")
```
```
$ python3 solve.py
Biggest chunk: 0x18627
Second biggest chunk: 0x1855f
Third biggest chunk: 0x1854e
```

Agregué breakpoints condicionales y en el debugger leí el contenido:

<img width="1360" height="722" alt="codemap123" src="https://github.com/user-attachments/assets/fe86d2ed-218e-44b0-96a4-419089c98193" />

Las cadenas que contienen los tres chunks más grandes en orden de mayor a menor son `X12nM7yCJcu0x5u`, `roKBkoIZGMUKrMb` y `2ckbnDUabcsMA2s`.

`select_eax_from_trace_order_by_eax_desc_limit_20`
