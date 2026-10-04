# Shattered Tablets

We disassemble the `main` function of the binary:

```c
undefined8 main(void)

{
  undefined8 local_48;
  undefined8 local_40;
  undefined8 local_38;
  undefined8 local_30;
  undefined8 local_28;
  undefined8 local_20;
  undefined8 local_18;
  undefined8 local_10;
  
  local_48 = 0;
  local_40 = 0;
  local_38 = 0;
  local_30 = 0;
  local_28 = 0;
  local_20 = 0;
  local_18 = 0;
  local_10 = 0;
  printf("Hmmmm... I think the tablet says: ");
  fgets((char *)&local_48,0x40,stdin);
  if (((((((((local_30._7_1_ == 'p') && (local_48._1_1_ == 'T')) && (local_48._7_1_ == 'k')) &&
          ((local_28._4_1_ == 'd' && (local_40._3_1_ == '4')))) &&
         ((local_38._4_1_ == 'e' && ((local_40._2_1_ == '_' && ((char)local_48 == 'H')))))) &&
        (local_28._2_1_ == 'r')) &&
       ((((local_28._3_1_ == '3' && (local_30._1_1_ == '_')) && (local_48._2_1_ == 'B')) &&
        (((local_30._5_1_ == 'r' && (local_48._3_1_ == '{')) &&
         ((local_30._2_1_ == 'b' && ((local_48._5_1_ == 'r' && (local_40._5_1_ == '4')))))))))) &&
      (((local_30._6_1_ == '3' &&
        (((local_38._3_1_ == 'v' && (local_40._4_1_ == 'p')) && (local_28._1_1_ == '1')))) &&
       (((local_30._3_1_ == '3' && (local_38._1_1_ == 'n')) &&
        (((local_48._4_1_ == 'b' && (((char)local_28 == '4' && (local_40._1_1_ == 'n')))) &&
         ((char)local_38 == ',')))))))) &&
     ((((((((char)local_40 == '3' && (local_48._6_1_ == '0')) && (local_38._7_1_ == 't')) &&
         ((local_40._7_1_ == 't' && ((char)local_30 == '0')))) &&
        ((local_40._6_1_ == 'r' && ((local_28._5_1_ == '}' && (local_38._5_1_ == 'r')))))) &&
       (local_38._6_1_ == '_')) && ((local_38._2_1_ == '3' && (local_30._4_1_ == '_')))))) {
    puts("Yes! That\'s right!");
  }
  else {
    puts("No... not that");
  }
  return 0;
}
```

This is a simple string comparison. Sorting the characters and variables, starting with `local_48` (top of the stack), we get the flag:

`HTB{br0k3n_4p4rt,n3ver_t0_b3_r3p41r3d}`
