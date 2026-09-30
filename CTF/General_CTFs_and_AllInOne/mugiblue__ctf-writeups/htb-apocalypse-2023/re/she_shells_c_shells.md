# She Shells C Shells

We disassemble the binary and see the function `func_flag`:

```c
undefined8 func_flag(void)
{
	[...]

  fgets((char *)&local_118,0x100,stdin);
  for (local_c = 0; local_c < 0x4d; local_c = local_c + 1) {
    *(byte *)((long)&local_118 + (long)(int)local_c) =
         *(byte *)((long)&local_118 + (long)(int)local_c) ^ m1[(int)local_c];
  }
  local_14 = memcmp(&local_118,t,0x4d);
  if (local_14 == 0) {
    for (local_10 = 0; local_10 < 0x4d; local_10 = local_10 + 1) {
      *(byte *)((long)&local_118 + (long)(int)local_10) =
           *(byte *)((long)&local_118 + (long)(int)local_10) ^ m2[(int)local_10];
    }
    printf("Flag: %s\n",&local_118);
    uVar1 = 0;
  }
  else {
    uVar1 = 0xffffffff;
  }
  return uVar1;
}

```

Analyzing this part of the function, we see that each character of the flag (stored in `local_118`) is xored with `m1`, then it is compared with `t`, which should be the expected result.
We conclude that if we `xor` `m1` with `t`, we should get the expected key:

``m1: b'\x2c\x4a\xb7\x99\xa3\xe5\x70\x78\x93\x6e\x97\xd9\x47\x6d\x38\xbd\xff\xbb\x85\x99\x6f\xe1\x4a\xab\x74\xc3\x7b\xa8\xb2\x9f\xd7\xec\xeb\xcd\x63\xb2\x39\x23\xe1\x84\x92\x96\x09\xc6\x99\xf2\x58\xfa\xcb\x6f\x6f\x5e\x1f\xbe\x2b\x13\x8e\xa5\xa9\x99\x93\xab\x8f\x70\x1c\xc0\xc4\x3e\xa6\xfe\x93\x35\x90\xc3\xc9\x10\xe9'``

`xor`

``t:
b'\x6e\x3f\xc3\xb9\xd7\x8d\x15\x58\xe5\x0f\xfb\xac\x22\x4d\x57\xdb\xdf\xcf\xed\xfc\x1c\x84\x6a\xd8\x1c\xa6\x17\xc4\xc1\xbf\xa0\x85\x87\xa1\x43\xd4\x58\x4f\x8d\xa8\xb2\xf2\x7c\xa3\xb9\x86\x37\xda\xbf\x07\x0a\x7e\x73\xdf\x5c\x60\xae\xca\xcf\xb9\xe0\xde\xff\x00\x70\xb9\xe4\x5f\xc8\x9a\xb3\x51\xf5\xae\xa8\x7e\x8d'``

gives the key:

``But the value of these shells will fall, due to the laws of supply and demand``

Which supplied to the program, prints the flag:

``HTB{cr4ck1ng_0p3n_sh3ll5_by_th3_s34_sh0r3}``
