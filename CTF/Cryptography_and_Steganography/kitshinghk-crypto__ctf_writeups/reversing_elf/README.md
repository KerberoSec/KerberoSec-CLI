# Reversing ELF writeup
The reverse engineering CTF is solved by static analysis using Ghidra. For each task, the part of the decompiled program, in which the flag can be found is shown and explained. The python scripts in this folder produce the flag by simulating the elf.  

## Crackme1
The output of the program is secret XOR 0x41. 
```C
undefined8 main(void)

{
  char local_98 [32];
  undefined4 secret [27];
  uint local_c;
  
  secret[0] = 0x25;
  secret[1] = 0x2b;
  secret[2] = 0x20;
  secret[3] = 0x26;
  secret[4] = 0x3a;
  secret[5] = 0x2d;
  secret[6] = 0x2e;
  secret[7] = 0x33;
  secret[8] = 0x1e;
  secret[9] = 0x33;
  secret[10] = 0x27;
  secret[11] = 0x20;
  secret[12] = 0x33;
  secret[13] = 0x1e;
  secret[14] = 0x2a;
  secret[15] = 0x28;
  secret[16] = 0x2d;
  secret[17] = 0x23;
  secret[18] = 0x1e;
  secret[19] = 0x2e;
  secret[20] = 0x25;
  secret[21] = 0x1e;
  secret[22] = 0x24;
  secret[23] = 0x2b;
  secret[24] = 0x25;
  secret[25] = 0x3c;
  secret[26] = 0xffffffbf;
  memset(local_98,0x41,0x1b);
  local_c = 0;
  while (local_c < 27) {
    local_98[(int)local_c] = (char)secret[(int)local_c] + local_98[(int)local_c];
    local_c = local_c + 1;
  }
  puts(local_98);
  return 0;
}
```

## Crackme2
The output is 0x41 XOR a string which is stored in a location at &INT_080486c0. 
```C
void giveFlag(void)

{
  int i;
  int *puVar1;
  int *puVar2;
  char local_11f [51];
  int local_ec;
  uint j;
  
  i = 0x33;
  puVar1 = &INT_080486c0;
  puVar2 = &local_ec;
  while (i != 0
                    /* copy string */) {
    i = i + -1;
    *puVar2 = *puVar1;
    puVar1 = puVar1 + 1;
    puVar2 = puVar2 + 1;
  }
  memset(local_11f,0x41,0x33);
  j = 0;
  while (j < 0x33) {
    local_11f[j] = (char)(&local_ec)[j] + local_11f[j];
    j = j + 1;
  }
  puts(local_11f);
  return;
}
```

## Crackme3
The flag is the input of the base64 encoded text, ZjByX3kwdXJfNWVjMG5kX2xlNTVvbl91bmJhc2U2NF80bGxfN2gzXzdoMW5nNQ==
The following code shows the logic of base64 encryption used by the program. `crack3.py` reverse the based64 logic to find the plaintext.
```C

int encode_pw(int org_pw,int encode_pw,uint org_pw_len,int const_0)

{
  uint uVar1;
  int k;
  int j;
  uint i;
  uint c;
  
  k = 0;
  uVar1 = org_pw_len % 3;
  if (encode_pw == 0) {
    j = (org_pw_len / 3) * 4;
    if (uVar1 != 0) {
      j = j + 4;
    }
    if (const_0 != 0) {
      j = j + org_pw_len / 0x39;
    }
  }
  else {
    i = 0;
    j = 0;
    while (i < (org_pw_len / 3) * 3) {
      *(char *)(encode_pw + j) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [*(byte *)(org_pw + i) >> 2];
      *(char *)(j + 1 + encode_pw) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [(uint)(*(byte *)(org_pw + 1 + i) >> 4) | (*(byte *)(org_pw + i) & 3) << 4];
      *(char *)(j + 2 + encode_pw) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [(uint)(*(byte *)(i + 2 + org_pw) >> 6) | (*(byte *)(i + 1 + org_pw) & 0xf) * 4];
      *(char *)(j + 3 + encode_pw) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [*(byte *)(i + 2 + org_pw) & 0x3f];
      c = (j - k) + 4;
      if ((c == ((c >> 2) / 0x13) * 0x4c) && (const_0 != 0)) {
        *(undefined *)(encode_pw + 4 + j) = 10;
        j = j + 1;
        k = k + 1;
      }
      i = i + 3;
      j = j + 4;
    }
                    /* org_pw_len %3 =1 */
    if (uVar1 == 1) {
      *(char *)(encode_pw + j) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [(int)(uint)*(byte *)(org_pw + i) >> 2];
      *(char *)(encode_pw + 1 + j) =
           "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
           [(*(byte *)(org_pw + i) & 3) * 0x10];
      *(undefined *)(encode_pw + 2 + j) = 0x3d;
      *(undefined *)(encode_pw + 3 + j) = 0x3d;
      j = j + 4;
    }
    else {
      if (uVar1 == 2) {
        *(char *)(encode_pw + j) =
             "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
             [(int)(uint)*(byte *)(org_pw + i) >> 2];
        *(char *)(encode_pw + 1 + j) =
             "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
             [(int)(uint)*(byte *)(org_pw + 1 + i) >> 4 | (*(byte *)(org_pw + i) & 3) << 4];
        *(char *)(encode_pw + 2 + j) =
             "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
             [(*(byte *)(org_pw + 1 + i) & 0xf) * 4];
        *(undefined *)(encode_pw + 3 + j) = 0x3d;
        j = j + 4;
      }
    }
  }
  return j;
}
```

## Crackme4
The flag is secret (local_28) XOR 0x24.
```C
  //extracted from main() function
  local_28 = 0x7b175614497b5d49;
  local_20 = 0x547b175651474157;
  local_18 = 0x4053;
  local_16 = 0;
  get_pwd(&local_28);
```

```C
void get_pwd(long password)

{
  int i;
  
  i = -1;
  while (i = i + 1, *(char *)(password + i) != '\0') {
    *(byte *)(i + password) = *(byte *)(password + i) ^ 0x24;
  }
  return;
}
```

## Crackme5
The flag is obviously shown in the main() function
```C
  //extract from main()
  local_38 = 'O';
  local_37 = 'f';
  local_36 = 'd';
  local_35 = 'l';
  local_34 = 'D';
  local_33 = 'S';
  local_32 = 'A';
  local_31 = '|';
  local_30 = '3';
  local_2f = 't';
  local_2e = 'X';
  local_2d = 'b';
  local_2c = '3';
  local_2b = '2';
  local_2a = '~';
  local_29 = 'X';
  local_28 = '3';
  local_27 = 't';
  local_26 = 'X';
  local_25 = '@';
  local_24 = 's';
  local_23 = 'X';
  local_22 = '`';
  local_21 = '4';
  local_20 = 't';
  local_1f = 'X';
  local_1e = 't';
  local_1d = 'z';
  puts("Enter your input:");
  __isoc99_scanf("%s",input_string);
  iVar1 = strcmp_(input_string,&local_38,&local_38);
  if (iVar1 == 0) {
    puts("Good game");
  }
  else {
    puts("Always dig deeper");
  }
  ```
  
## Crackme6
The flag is obvious in the my_secure_test function
```C
undefined8 my_secure_test(char *param_1)

{
  undefined8 uVar1;
  
  if ((*param_1 == '\0') || (*param_1 != '1')) {
    uVar1 = 0xffffffff;
  }
  else {
    if ((param_1[1] == '\0') || (param_1[1] != '3')) {
      uVar1 = 0xffffffff;
    }
    else {
      if ((param_1[2] == '\0') || (param_1[2] != '3')) {
        uVar1 = 0xffffffff;
      }
      else {
        if ((param_1[3] == '\0') || (param_1[3] != '7')) {
          uVar1 = 0xffffffff;
        }
        else {
          if ((param_1[4] == '\0') || (param_1[4] != '_')) {
            uVar1 = 0xffffffff;
          }
          else {
            if ((param_1[5] == '\0') || (param_1[5] != 'p')) {
              uVar1 = 0xffffffff;
            }
            else {
              if ((param_1[6] == '\0') || (param_1[6] != 'w')) {
                uVar1 = 0xffffffff;
              }
              else {
                if ((param_1[7] == '\0') || (param_1[7] != 'd')) {
                  uVar1 = 0xffffffff;
                }
                else {
                  if (param_1[8] == '\0') {
                    uVar1 = 0;
                  }
                  else {
                    uVar1 = 0xffffffff;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return uVar1;
}
```

## Crackme7
The giveFlag() function computes the flag and shown. The flag is 0x41 plus a string stored in &DAT_080488e0
```C
void giveFlag(void)

{
  int iVar1;
  undefined4 *puVar2;
  undefined4 *puVar3;
  char flag [34];
  undefined4 secret [34];
  uint i;
  
  iVar1 = 0x22;
  puVar2 = &DAT_080488e0;
  puVar3 = secret;
  while (iVar1 != 0
                    /* copy string
                        */) {
    iVar1 = iVar1 + -1;
    *puVar3 = *puVar2;
    puVar2 = puVar2 + 1;
    puVar3 = puVar3 + 1;
  }
  memset(flag,0x41,0x22);
  i = 0;
  while (i < 0x22) {
    flag[i] = (char)secret[i] + flag[i];
    i = i + 1;
  }
  puts(flag);
  return;
}
```
## Crackme8
The giveFlag() function computes the flag and shown. The flag is 0x41 plus a string stored in &DAT_080486a0
```C
void giveFlag(void)

{
  int iVar1;
  undefined4 *puVar2;
  undefined4 *puVar3;
  char local_14c [60];
  undefined4 local_110 [60];
  uint local_20;
  
  iVar1 = 0x3c;
  puVar2 = &DAT_080486a0;
  puVar3 = local_110;
  while (iVar1 != 0) {
    iVar1 = iVar1 + -1;
    *puVar3 = *puVar2;
    puVar2 = puVar2 + 1;
    puVar3 = puVar3 + 1;
  }
  memset(local_14c,0x41,0x3c);
  local_20 = 0;
  while (local_20 < 0x3c) {
    local_14c[local_20] = (char)local_110[local_20] + local_14c[local_20];
    local_20 = local_20 + 1;
  }
  puts(local_14c);
  return;
}
```
