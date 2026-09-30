# Tryhackme Reloaded CTF writeup
The CTF is solved by using static analysis with Ghidra
## Level0
The flag can be found by using the Ghidra "defined strings" function after analysis.
![screenshot](https://github.com/kitshinghk-crypto/re_writeups/blob/main/reloaded/level0.png?raw=true)

## Level1
The flag can be found in a function, which checks the input with the correct answer. 
The flag decimal representation of 0x6ad.
```C
void __cdecl FUN_00401410(int input_num)

{
  if (input_num == 0x6ad) {
    printf("Thats ur lucky number !!!");
  }
  else {
    puts("Try again ");
  }
  return;
}
```
## Level2
The flag can be found in the function which check the input with the secret
```c
void __cdecl cmp_secret(char *input)

{
  int is_equal;
  int secret [5];
  
  secret[0] = 0x315f334c;
  secret[1] = 0x30325f73;
  secret[2] = 0x68545f74;
  secret[3] = 0x314c5f33;
  secret[4] = 0x743133;
  is_equal = strcmp((char *)secret,input);
  if (is_equal == 0) {
    puts("Get Ready For L4 ;)");
    printf("%s",secret);
  }
  else {
    printf("In order to advance you have to break your mindset");
  }
  return;
}
```

## Level3
The flag can be found in a function which set the secret
```c
void * __cdecl setSecret(void *s)

{
  undefined4 local_1f;
  undefined4 local_1b;
  undefined2 local_17;
  undefined4 local_14;
  uint i;
  
  local_1f = 0x634d4854;
  local_1b = 0x4c2d6674;
  local_17 = 0x34;
  local_14 = 7;
  i = 0;
  while (i < 10) {
    *(byte *)((int)&local_1f + i) = *(byte *)((int)&local_1f + i) ^ 7;
    i = i + 1;
  }
  FUN_00462c80();
  process_secret(s,(char *)&local_1f);
  FUN_00462cb0();
  return s;
}
```

## Level 4
The flag can be found in the function which encode the secret
```C
undefined4 encodeSecret(void)

{
  undefined4 local_2a;
  undefined4 local_26;
  undefined4 local_22;
  undefined4 local_1e;
  undefined4 local_1a;
  undefined4 local_16;
  undefined2 local_12;
  
  FUN_0040c000();
  local_2a = 0x6e616c41;
  local_26 = 0x72755420;
  local_22 = 0x20676e69;
  local_1e = 0x20736157;
  local_1a = 0x65472061;
  local_16 = 0x7375696e;
  local_12 = 0x65;
  process_secret((char *)&local_2a);
  return 0;
}
```
