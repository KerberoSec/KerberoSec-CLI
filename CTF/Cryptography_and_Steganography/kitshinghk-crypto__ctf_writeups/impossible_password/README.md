# Hackthebox Impossible Password CTF writeup
A hex string can be found in the main() function
```C
//extracted from main() function
  local_48 = 0x41;
  local_47 = 0x5d;
  local_46 = 0x4b;
  local_45 = 0x72;
  local_44 = 0x3d;
  local_43 = 0x39;
  local_42 = 0x6b;
  local_41 = 0x30;
  local_40 = 0x3d;
  local_3f = 0x30;
  local_3e = 0x6f;
  local_3d = 0x30;
  local_3c = 0x3b;
  local_3b = 0x6b;
  local_3a = 0x31;
  local_39 = 0x3f;
  local_38 = 0x6b;
  local_37 = 0x38;
  local_36 = 0x31;
  local_35 = 0x74;
```

The flag is computed by encoding the hex string using XOR with 9
```C
void encode_secret(byte *secret)

{
  int i;
  byte *c;
  
  i = 0;
  c = secret;
  while ((*c != 9 && (i < 0x14))) {
                    /* encoded_secret = secret XOR 9 */
    putchar((int)(char)(*c ^ 9));
    c = c + 1;
    i = i + 1;
  }
                    /* print line break */
  putchar(10);
  return;
}
```
