# x3CTF 2025: notcrypto

Description: "You shouldn't need to call your crypto teammate for this challenge lol."
Files: "spn" linux executable

## Identify the binary
We should first identify what we can about the binary before trying to decompile and work through all the code

Starting off we check information about the binary by running `file` and `strings` to guess what language the source is to assist in how we approach the challenge

```
$ file spn
spn: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=99edb33d421b346c96dbca0bafc6b36f72aa75aa, for GNU/Linux 3.2.0, stripped
```

```
$ strings spn
/lib64/ld-linux-x86-64.so.2
__gmon_start__
_ITM_deregisterTMCloneTable
_ITM_registerTMCloneTable
_ZSt3cin
_ZSt7getlineIcSt11char_traitsIcESaIcEERSt13basic_istreamIT_T0_ES7_RNSt7__cxx1112basic_stringIS4_S5_T1_EES4_
_ZdlPv
_ZSt16__throw_bad_castv
_ZSt21ios_base_library_initv
__gxx_personality_v0
_ZNKSt5ctypeIcE13_M_widen_initEv
_ZNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEE9_M_mutateEmmPKcm
_Unwind_Resume
puts
exit
__libc_start_main
__cxa_finalize
libstdc++.so.6
libm.so.6
libgcc_s.so.1
libc.so.6
GCC_3.0
GLIBCXX_3.4.21
CXXABI_1.3
GLIBCXX_3.4.32
GLIBCXX_3.4.11
GLIBCXX_3.4
GLIBC_2.34
GLIBC_2.2.5
PTE1
...
!       e-0
xxxxxxxxWronk flag methinks.
Correct flag methinks.
...
```

From the `file` and `strings` output, we see its a dynamically linked ELF (linux executable), has short output, and has lines starting with "_Z". Together we can say this is likely a C++ compiled binary. We also see its stripped which makes analysis a bit harder

There is some text that stands out that may give context to what the program does before actually running it. "Wronk flag methinks." and "Correct flag methinks." gives the idea that this may be a flag checker that takes input and validates if the flag is correct or not

Running the program it enters a seemingly hanging state, and if we type something and press enter it tells us "Wronk flag methinks." which indicates our assumption was correct about the overall idea of what this binary does

## Decompile 
Lets open up ghidra and import the binary using the default language (gcc) and open it in the CodeBrowser and use default analyze options

Since its been stripped ghidra puts us at the entry() where we see __libc_start_main. Linux makes it easy to get to main from entry by going to the address passed as argument 1

Now lets break up the main function to be a bit easier to read

The first Decompile section from ghidra is a follows
```c
local_50 = 0;
local_48 = 0;
plVar1 = *(long **)(*(long *)(std::cin + -0x18) + 0x105148);
local_58 = &local_48;

if (plVar1 == (long *)0x0) {
    std::__throw_bad_cast();
}

if (*(char *)(plVar1 + 7) == '\0') {
    std::ctype<char>::_M_widen_init();
    cVar2 = (**(code **)(*plVar1 + 0x30))(plVar1,10);
} else {
    cVar2 = *(char *)((long)plVar1 + 0x43);
}

std::getline<>((istream *)&std::cin,(string *)&local_58,cVar2);
bVar17 = 8;
if ((local_50 & 7) != 0) {
    bVar17 = 8 - ((byte)local_50 & 7);
}
...
```
We may not know everything going on here but we known std: cin is how cpp gets user input, and we also see std: getline<> so we can guess this is how it gets input.

Next up we have this code
```c
...
uVar15 = (uint)bVar17;
do {
    uVar3 = local_50;
    uVar4 = 0xf;
    if (local_58 != &local_48) {
        uVar4 = CONCAT71(uStack_47,local_48);
    }
    uVar7 = local_50 + 1;
    if (uVar4 < uVar7) {
        std::string::_M_mutate((ulong)&local_58,local_50,(char *)0x0,0);
    }
    local_58[uVar3] = bVar17;
    local_58[uVar3 + 1] = 0;
    uVar15 = uVar15 - 1;
    local_50 = uVar7;
} while (uVar15 != 0);
if (uVar7 == 56) {
...
```
This may be hard to read and understand, but we see its modifying a string, and has +1 and -1 a few times, and a do while as long as some variable is not 0. the next if block checks if a value from the do while is equal to 56. This should be the length of our string, so if the string is not 56 characters it wont bother checking the string.

Finally a large block that looks like the core of the checker
```c
...
if (uVar7 == 56) {
    local_38 = local_58;
    uVar4 = 0;
    while( true ) {
        bVar17 = local_58[uVar4];
        bVar12 = local_58[uVar4 + 1];
        bVar10 = local_58[uVar4 + 2];
        bVar5 = local_58[uVar4 + 3];
        bVar9 = local_58[uVar4 + 4];
        bVar11 = local_58[uVar4 + 5];
        bVar18 = local_58[uVar4 + 6];
        bVar6 = local_58[uVar4 + 7];
        iVar14 = 0;
        do {
            uVar16 = (ulong)bVar17;
            uVar7 = (ulong)bVar12;
            uVar8 = (ulong)bVar10;
            uVar3 = (ulong)bVar9;
            bVar13 = (byte)iVar14;
            bVar17 = (&DAT_00104050)[bVar18] ^ bVar13;
            bVar12 = (&DAT_00104050)[uVar16] ^ bVar13;
            bVar10 = (&DAT_00104050)[bVar6] ^ bVar13;
            bVar5 = (&DAT_00104050)[bVar5] ^ bVar13;
            bVar9 = (&DAT_00104050)[uVar7] ^ bVar13;
            bVar11 = (&DAT_00104050)[bVar11] ^ bVar13;
            bVar18 = (&DAT_00104050)[uVar8] ^ bVar13;
            bVar6 = (&DAT_00104050)[uVar3] ^ bVar13;
            iVar14 = iVar14 + 1;
        } while (iVar14 != 0x1000);
        if (((((bVar17 != (&DAT_00102010)[uVar4]) || (bVar12 != (&DAT_00102011)[uVar4])) ||
           (bVar10 != (&DAT_00102012)[uVar4])) ||
          ((bVar5 != (&DAT_00102013)[uVar4] || (bVar9 != (&DAT_00102014)[uVar4])))) ||
         ((bVar11 != (&DAT_00102015)[uVar4] ||
          ((bVar18 != (&DAT_00102016)[uVar4] || (bVar6 != (&DAT_00102017)[uVar4])))))) break;
        uVar4 = uVar4 + 8;
        if (0x37 < uVar4) {
            puts("Correct flag methinks.");
            exit(0);
        }
    }
}
puts("Wronk flag methinks.");
exit(1);
```
Now this looks like a lot, but we see our two strings from earlier to tell us we are in the right place. 

So we know where the core logic for the checker is, now we need to figure out what its doing and what these variables are. For this we will do some debugging with pwndbg

## Debugging
*I will be refering to information that is shown in pwndbg's display while debugging, gef shows similar information but plain gdb will not have this information easily shown*

If we just run pwndbg with out binary we are going to have some trouble locating main like we did in ghidra since it's stripped, and when a binary is loaded into memory, it may have PIE which causes it's base location to be in a "random" spot. We will quickly rebase ghidra after loading the binary to make all the address line up. (I will not be covering how to do that here but our new base address will be 0x555555554000 so addresses will be larger than the ones above)

After rebasing ghidra we find our if statement jumps at 0x55555555548a so we set a break point here and run the program. From the decompile we guessed that the input should be 56 characters so lets check by using a 56 character message. Pwntools has a program you can use to quickly get this with cyclic 56 in pwndbg. If you have pwndbg or gef you should be able to see we end up jumping and moving to a "lea" and "call" to puts

Jumping here would print Wronk flag meaning that our input wasnt the correct length. To fix this we try modifying the input so we dont jump, first by trying to remove one character so we have 55

With 55 characters we no long jump. There is likely an exact reason for this but my guess is when we hit enter it usually sends a newline '\n' character at the end of our input, making 56 letters + '\n' now 57 and failing the check. This is only my guess since every binary is different and may handle data in different ways

Going to the next few instructions we see it move our input and use xor to zero out a value before 8 movzx each with a single byte. Using cyclic 55's string for our input shows they are all 0x61 which is the hex value of "a" and the first 8 characters of our string are all a's. As a check we can alter the first 8 characters and it will show the bytes that we modified in the correct order. Going back to ghidra we can change some value lables to be a bit more readable and understand how the check algorithm works

```c
bVar17 = local_58[uVar4];
bVar12 = local_58[uVar4 + 1];
bVar10 = local_58[uVar4 + 2];
bVar5 = local_58[uVar4 + 3];
bVar9 = local_58[uVar4 + 4];
bVar11 = local_58[uVar4 + 5];
bVar18 = local_58[uVar4 + 6];
bVar6 = local_58[uVar4 + 7];
```

This section is where we just were in our debugger. Each line gets a single byte from our string and stores it in a variable. For instance bVar17 gets the first byte and bVar12 gets the second byte and so on. Renaming our variables will make this more readable and hopefully show where other things stand out.

Something else to note while we are here is how uVar4 was set to 0 right before an infinate while loop. This is essentially acting as a for loop with an iterable variable. We can guess by the fact it started off by getting only 8 bytes out of 56 it would be safe to bet that it iterates of 8 byte chunks/blocks. The reason I take this guess is since 56 even divides by 8 so we should end up with 7 iterations. Knowingthis I will be naming uVar4 chunk since we are going to iterate over the chunks

```c
byte_0 = local_58[chunk];
byte_1 = local_58[chunk + 1];
byte_2 = local_58[chunk + 2];
byte_3 = local_58[chunk + 3];
byte_4 = local_58[chunk + 4];
byte_5 = local_58[chunk + 5];
byte_6 = local_58[chunk + 6];
byte_7 = local_58[chunk + 7];
```

So that takes care of what appears to be a third of this decompile section, what about the rest?

```c
iVar8 = 0;
do {
    uVar10 = (ulong)byte_0;
    uVar5 = (ulong)byte_1;
    uVar6 = (ulong)byte_2;
    uVar3 = (ulong)byte_4;
    bVar7 = (byte)iVar8;
...
    iVar8 = iVar8 + 1;
} while (iVar8 != 0x1000);
```

We have another loop with an iterator, iVar8 and bVar7 which is a copy. Your naming convention may be different, I'm going to set copies to the corresponding byte without an underscore

```c
loop_count = 0;
do {
    byte0 = (ulong)byte_0;
    byte1 = (ulong)byte_1;
    byte2 = (ulong)byte_2;
    byte4 = (ulong)byte_4;
    loopcount = (byte)loop_count;
...
    loop_count = loop_count + 1;
} while (loop_count != 0x1000);
```

With all this renaming done all, the code inside the loop starts to be way more understandable

```c
byte_0 = (&DAT_555555558050)[byte_6] ^ loopcounter;
byte_1 = (&DAT_555555558050)[byte0] ^ loopcounter;
byte_2 = (&DAT_555555558050)[byte_7] ^ loopcounter;
byte_3 = (&DAT_555555558050)[byte_3] ^ loopcounter;
byte_4 = (&DAT_555555558050)[byte1] ^ loopcounter;
byte_5 = (&DAT_555555558050)[byte_5] ^ loopcounter;
byte_6 = (&DAT_555555558050)[byte2] ^ loopcounter;
byte_7 = (&DAT_555555558050)[byte4] ^ loopcounter;
```

There is some constant data, likely a string of array of data, some kind of key. 
Step 1 is using our input as the offset in the data to get a single byte
Step 2, XOR the byte with our loop counter
Step 3, set our byte to the new xor'd value
Step 4, loop for 0x1000 or 4096 times increasing the counter each time

This is our encryption loop, anything after would be considered encrypted data

Last thing to look at is the final if statement
```c
if (((((byte_0 != (&DAT_555555556010)[chunk]) || (byte_1 != (&DAT_555555556011)[chunk])) ||
   (byte_2 != (&DAT_555555556012)[chunk])) ||
  ((byte_3 != (&DAT_555555556013)[chunk] || (byte_4 != (&DAT_555555556014)[chunk])))) ||
 ((byte_5 != (&DAT_555555556015)[chunk] ||
  ((byte_6 != (&DAT_555555556016)[chunk] || (byte_7 != (&DAT_555555556017)[chunk]))))))
break;
chunk = chunk + 8;
if (55 < chunk) {
    puts("Correct flag methinks.");
    exit(0);
}
```

This checks if any of our encrypted bytes are not equal to the encrypted data we expect for that chunk. If any input is different it breaks out of the loop and tells us we have the wrong flag. If we get have all the correct bytes it adds 8 to our chunk, updating our offset to avoid repeating characters, and checks if the chunk is larger than 55 meaning that we checked all bytes of our input

If we use ghidra and view the data at DAT_555555558050 we end up getting a lot of messy data, since there are a lot of bytes that are not ascii printables we would end up extracting the hex bytes instead of the characters. We can extract this data either through ghidra, or from pwndbg. I prefer pwndbg since everything is already loaded into memory so if any modifications were made that we didnt notice, the bytes would be in the same condition as when they are used in the encryption process

We dont exactly know when the key is supposed to end, ghidra can show there is an "end" when there are some some other sections for instnace the .bss section of the binary. we can use this address to estimate where it should end, or list out a bunch of bytes and see if there might be a part that could be an end by running hexdump and an increasing large number. 50, 100, 150, etc

Hexdump 0x555555558050 300 indicates after 300 bytes we get a bunch of null bytes, and at the end also looks like a possible addres, however for our purposes it shouldnt matter if we include the end or the extra null bytes since the offsec shouldnt go past it

## Recreate the Algorithm
With our current understand of the binary and access to the key we should be able to recreate our binary in a language you are more familiar with, in this case python

First we want to get the key setup, taking the hexdump and getting all the hex values into python as an array of ints since they will be the easiest to work with

```py
key = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,0xa0,0x25,0xcb,0xf7,0xff,0x7f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
```

```py
# allows for an array copy
import copy
# group is an array of 8 ints used in the encryption
def encrypt(group:list[int]):
    byte = copy.copy(group)
    tmp = copy.copy(group)

    for i in range(4096):
        tmp[0] = key[byte[6]] ^ i
        tmp[1] = key[byte[0]] ^ i
        tmp[2] = key[byte[7]] ^ i
        tmp[3] = key[byte[3]] ^ i
        tmp[4] = key[byte[1]] ^ i
        tmp[5] = key[byte[5]] ^ i
        tmp[6] = key[byte[2]] ^ i
        tmp[7] = key[byte[4]] ^ i
        for j in range(8):
            byte[j] = tmp[j] % 0x100

    return byte
```

Starting off we make a copy of the group twice. The first is so that we dont alter the group array, the second is to prevent writing a variable and then using it two lines after. If you recall ghidra had a weird spot of copying variables that we ended up with byte0 = byte_0, this is the same thing but the the binary does it more efficiently only allocating a few variables instead of a full copy of the array. 

Next we recreate the encryption loop by getting our byte as an int, using it as the index in data, xor it by loop count, and a snippet at the end to move tmp back to byte while also taking module 0x100. This may seem weird at first but the reason we do this is a single byte is 0xff, and when we are in the spn binary it uses type casts and constraints to do this, while python does not so we add in this constraint.

Now we need to make sure our encryption works. We can do this in a few ways, including using a debugger to break at the end of the encryption loop and check it matches what our python script outputs. 

I will prepare some text to be formatted for our python function since we want an array of ints using the following snippet
```py
start = "abcdefgh" # }
chunk = [ord(char) for char in start]
enc = encrypt(chunk)
```
which outputs `[160, 52, 35, 45, 86, 61, 102, 27]` which can be converted to hex values `a0 34 23 2d 56 3d 66 1b`. 

Now we go back to our debugger and break after the encryption, when the if statement compares our encrypted. the exact break point is going to be on a LEA instruction at 0x55555555555a. We want out input to be the same but it also needs to be 55 characters. Using the 8 bytes using in python plus a bunch of "Z"s for padding it out should be fine.
`abcdefghZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ`

It may be hard to track since our encrypted values are in their own variables, but the first compare is between 0xa0 and 0x16. Since they arent equal it would jump out at jne and fail the check, since we want to see more values we will skip over it by either setting a break point and jumping, or by changing the eflags to pass the compare.

Doing this for each checks shows the full encrypted chunk is a0, 34, 23, 2d, 56, 3d, 66, ab. all the same values our python program gave, indicating our python program works as expected. Now we move on to how to reverse the encryption process and pulling the key out of the binary. 

Starting with the key to make it available for later. Look at the asm insturctions while comparing values we get the value at an address of rcx + rax + index of the byte within the chunk. Using pwndbg's hexdump we can display a dump of this address with `hexdump $rcx+$rax`, note using "$" for referencing a register and no spaces between them. 

```
+0000 0x555555556010  16 2d 79 ca 56 c6 65 e9  e9 16 66 23 09 2d 1b 09  │.-y.V.e.│..f#.-..│
+0010 0x555555556020  1c 09 c6 1c 1f ad e9 da  a0 c6 1a 66 09 ad 81 1c  │........│...f....│
+0020 0x555555556030  80 39 a0 21 09 65 2d 30  f6 57 f6 a2 65 65 21 a2  │.9.!.e-0│.W..ee!.│
+0030 0x555555556040  78 78 78 78 78 78 78 78  57 72 6f 6e 6b 20 66 6c  │xxxxxxxx│Wronk.fl│
```

This is our key, maybe with some extra stuff at the end, but thats alright. Lets go reverse the python encryption so that we can start decrypting the flag.

## Reverse the Algorithm
From a logic view it shouldnt be that bad to reverse each step. If the encryption loop was
 get the byte at the previous byte's offset, xor it it with the loop, and repeat increasing the loop counter Then in theory we should be able to xor our byte with a decresing loop counter, modulo to keep it in bounds, and lookup at what offset this byte or int exists in our data. 
```py
tmp[0] = key.index((byte[6] ^ i) % 0x100 )
```

now this looks promissing, however an issue that arises is when setting the tmp byte, it was in order 0-7 but the offset byte was not, "6,0,7,3,1,5,2,4", this would cause some issues at least in ordering of the bytes if not breaking the decryption fully. to fix this we will just swap the values in tmp and byte, so that we end up with the follwing
```py
tmp[6] = key.index((byte[0] ^ i) % 0x100 )
tmp[0] = key.index((byte[1] ^ i) % 0x100 )
tmp[7] = key.index((byte[2] ^ i) % 0x100 )
...
```

And I added a transfer from tmp to byte with another modulo just to make sure everything is in bounds.

The full function:
```py
def decrypt(chunk:list[int]) -> list[int]:
    byte = copy.copy(chunk)
    tmp = copy.copy(chunk)

    for i in range(0,4096):
        i = 4096-i -1
        # print(i)
        tmp[6] = key.index((byte[0] ^ i) % 0x100 )
        tmp[0] = key.index((byte[1] ^ i) % 0x100 )
        tmp[7] = key.index((byte[2] ^ i) % 0x100 )
        tmp[3] = key.index((byte[3] ^ i) % 0x100 )
        tmp[1] = key.index((byte[4] ^ i) % 0x100 )
        tmp[5] = key.index((byte[5] ^ i) % 0x100 )
        tmp[2] = key.index((byte[6] ^ i) % 0x100 )
        tmp[4] = key.index((byte[7] ^ i) % 0x100 )
        for j in range(8):
            byte[j] = tmp[j] % 0x100

    return byte
```

So now if we test it with our example from earlier "abcdefgh" = [0xa0, 0x34, 0x23, 0x2d, 0x56, 0x3d, 0x66, 0xab] and put the array of ints into our decrypt function we should get the ints for the decrypted bytes. Adding some context to run the function
```py
byte=[0xf6, 0x57, 0xf6, 0xa2, 0x65, 0x65, 0x21, 0xa2,]
byte = decrypt(byte)
string = "".join([chr(x) for x in byte])
print(string)
```

Although not proper, im hardcoding the encrypted bytes before running the function, getting it back, and joining the chr() value to convert from int to printable characters. The working code outputs the expected string abcdefgh.

Now we do the same with the bytes from the encrypted value we pulled out of pwndbg. 
`[0x16, 0x2d, 0x79, 0xca, 0x56, 0xc6, 0x65, 0xe9]`
outputs `x3c{pwnd`

repeat with each 8 bytes set and we get the flag "x3c{pwndbg_and_pwntools_my_belowed_573498532832}"
