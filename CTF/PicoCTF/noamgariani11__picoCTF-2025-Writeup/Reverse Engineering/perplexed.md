# Description

Download the binary here.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/2326718ce11c5c89056a46fce49a5e46ab80e02d551d87744306ae43a4767e06/perplexed`

The downloaded file is an ELF 64-bit LSB executable that when using `chmod +x perplexed` and running it with `./perplexed` it prompts you to enter the password to where when you get it wrong it returns `Wrong :(`.

When putting the executable in Ghidra and looking in the main function (from functions folder in the left side) this is the important part:

```
  local_118[0xff] = '\0';
  printf("Enter the password: ");
  fgets(local_118,0x100,stdin);
  local_c = check(local_118);
  bVar1 = local_c != 1;
  if (bVar1) {
    puts("Correct!! :D");
  }
  else {
    puts("Wrong :(");
  }
  return !bVar1;
}
```

You can see the operations performed when running it locally and it looks like the check function is probably the next good thing to look at based on it having a part in the condition to get to "Correct". By double clicking the check function you can get to it in Ghidra.

```
undefined8 check(char *param_1)

{
  size_t sVar1;
  undefined8 uVar2;
  size_t sVar3;
  char local_58 [36];
  uint local_34;
  uint local_30;
  undefined4 local_2c;
  int local_28;
  uint local_24;
  int local_20;
  int local_1c;
  
  sVar1 = strlen(param_1);
  if (sVar1 == 0x1b) {
    local_58[0] = -0x1f;
    local_58[1] = -0x59;
    local_58[2] = '\x1e';
    local_58[3] = -8;
    local_58[4] = 'u';
    local_58[5] = '#';
    local_58[6] = '{';
    local_58[7] = 'a';
    local_58[8] = -0x47;
    local_58[9] = -99;
    local_58[10] = -4;
    local_58[0xb] = 'Z';
    local_58[0xc] = '[';
    local_58[0xd] = -0x21;
    local_58[0xe] = 'i';
    local_58[0xf] = 0xd2;
    local_58[0x10] = -2;
    local_58[0x11] = '\x1b';
    local_58[0x12] = -0x13;
    local_58[0x13] = -0xc;
    local_58[0x14] = -0x13;
    local_58[0x15] = 'g';
    local_58[0x16] = -0xc;
    local_1c = 0;
    local_20 = 0;
    local_2c = 0;
    for (local_24 = 0; local_24 < 0x17; local_24 = local_24 + 1) {
      for (local_28 = 0; local_28 < 8; local_28 = local_28 + 1) {
        if (local_20 == 0) {
          local_20 = 1;
        }
        local_30 = 1 << (7U - (char)local_28 & 0x1f);
        local_34 = 1 << (7U - (char)local_20 & 0x1f);
        if (0 < (int)((int)param_1[local_1c] & local_34) !=
            0 < (int)((int)local_58[(int)local_24] & local_30)) {
          return 1;
        }
        local_20 = local_20 + 1;
        if (local_20 == 8) {
          local_20 = 0;
          local_1c = local_1c + 1;
        }
        sVar3 = (size_t)local_1c;
        sVar1 = strlen(param_1);
        if (sVar3 == sVar1) {
          return 0;
        }
      }
    }
    uVar2 = 0;
  }
  else {
    uVar2 = 1;
  }
  return uVar2;
}
```

This function checks against local_58 against the input to verify the password is correct. You can see the first if statement checks against the length 0x1B which is 27 then it goes bit by bit to check if the password is the same. To get the password the function needs to be reversed with this script:

```
local_58 = [
    -0x1f, -0x59, 0x1e, -8, ord('u'), ord('#'), ord('{'), ord('a'),
    -0x47, -99, -4, ord('Z'), ord('['), -0x21, ord('i'), 0xd2,
    -2, 0x1b, -0x13, -0xc, -0x13, ord('g'), -0xc
]

flag = ['\0'] * 27
local_20 = 0
local_2c = 0

for local_24 in range(23):
    for local_28 in range(8):
        if local_20 == 0:
            local_20 = 1
        
        local_30 = 1 << (7 - local_28)
        local_34 = 1 << (7 - local_20)
        
        if (local_30 & local_58[local_24]) > 0:
            local_2c |= local_34
        
        local_20 += 1
        
        if local_20 == 8:
            flag.append(chr(local_2c))
            local_20 = 0
            local_2c = 0

print(''.join(flag))
```

To start local_58 is initialized to an array with 23 encoded values. Then the 3 variables that will be used are initialized with the flag using 27 as could be seen in the length check in the check function. 

The variables each have a specific purpose like local_20 tracks the bit position within each reconstructed byte, local_2c temporarily holds the reconstructed byte, local_30 takes individual bits from local_58, local_34 finds the corresponding bit position in the output, and the flag is simply the password.

The first loop that iterates 23 times (amount of encoded values in local_58) and each iteration it processes 8 bits with a second loop that iterates 8 times. As mentioned before local_20 helps track the bit position and it needs to always start with 1 instead of 0 which is what the if statement is for. Most of the script is taken straight from the check function with little modification to make it into a simpler python script. 

The next if statement checks if the bit is set in local_58 and then sets it in local_2c. Then `local_20 += 1` is used to move to the next bit. When local_20 reaches 8 than a full byte was reconstructed and then can be appended to the flag variable and reset the local_20 and local_2c variables for the next iterations.

Flag: `picoCTF{0n3_bi7_4t_a_...}`