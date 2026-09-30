# <a name="Journey begins"></a>Journey begins

So what do you do when you need some talented people break down some code. Asking would be a bit easy right ? So of course you set up a neat little platform and make a game out of it. Which brings us to [Decompetition v2.0](https://decompetition.io/), lets welcome our new challenge. This CTF is focused around reverse engineering with different programm languages as a base and a direct exchange between the target source binary and your own code via dissambled outputs. Cause we have no clue also no fear to dive in.

# <a name="Baby_c"></a>Baby_c

```assembly
; This is the disassembly you're trying to reproduce.
; It uses Intel syntax (mov dst, src).

main:
  endbr64
  push    rbp
  mov     rbp, rsp
  push    rbx
  sub     rsp, 0x18
  mov     [rbp-0x15], 1
block1:
  mov     rax, [stdin]
  mov     rdi, rax
  call    getc@plt.sec
  mov     [rbp-0x14], eax
  cmp     [rbp-0x14], -1
  je      block7
block2:
  call    __ctype_b_loc@plt.sec
  mov     rax, [rax]
  mov     edx, [rbp-0x14]
  movsxd  rdx, edx
  add     rdx, rdx
  add     rax, rdx
  movzx   eax, [rax]
  movzx   eax, ax
  and     eax, 0x2000
  test    eax, eax
  je      block4
block3:
  mov     rdx, [stdout]
  mov     eax, [rbp-0x14]
  mov     rsi, rdx
  mov     edi, eax
  call    putc@plt.sec
  mov     [rbp-0x15], 1
  jmp     block1
block4:
  cmp     [rbp-0x15], 0
  je      block6
block5:
  mov     rbx, [stdout]
  mov     eax, [rbp-0x14]
  mov     edi, eax
  call    toupper@plt.sec
  mov     rsi, rbx
  mov     edi, eax
  call    putc@plt.sec
  mov     [rbp-0x15], 0
  jmp     block1
block6:
  mov     rbx, [stdout]
  mov     eax, [rbp-0x14]
  mov     edi, eax
  call    tolower@plt.sec
  mov     rsi, rbx
  mov     edi, eax
  call    putc@plt.sec
  jmp     block1
block7:
  mov     eax, 0
  add     rsp, 0x18
  pop     rbx
  pop     rbp
  ret
```

We started with the probably "easy" C challenge base on the name. Our plan was to 

- [ ] Figure out what the binary does
- [ ] Figure out what the different assemble statements would be in conjunction to the behaviour do
- [ ] Figure out how to programm in C

Based on the tip of the maker we uplouded the binary to [binary ninja](https://cloud.binary.ninja) and realized why to stop there. So we went ahead and also used [ghidra](https://ghidra-sre.org/) and [ida](https://hex-rays.com/ida-free/). Which showed us already interesting outputs.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_c_ghidra.png" alt="Ghidra" width="50%" height="50%">

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_c_ninja.png" alt="Binary Ninja" width="50%" height="50%">

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_c_ida.png" alt="IDA" width="50%" height="50%">

As you can see we have slightly 3 different versions when we use the decompiler of each tool. You know what they say more tools = more fun. 
But back to our plan what does the programm do ?
Based on the outputs we have at the start a variable which is set to 1 and an endless loop until the the break signal is sent to the binary, we think. Next observation is that we have a check on \_\_ctype_b_loc() with the value 0x2000 and if that is true it writes out the input it took to stdout or the console. If that is false depending on the first variable it either uses toupper on the input or tolower and set the original variable to 0. 
Cause we were not sure if we should uses imports or not, cause they were already given as the starter code, we decided to use the ida output as base cause it did not need any additional imports:
```C
#include <ctype.h>
#include <stdio.h>
int __cdecl main(int argc, const char **argv, const char **envp)
{
  FILE *v3; // rbx
  int v4; // eax
  int v5; // eax
  char v7; // [rsp+Bh] [rbp-15h]
  int c; // [rsp+Ch] [rbp-14h]

  v7 = 1; // counter variable
  while ( 1 )
  {
    c = getc(stdin);
    if ( c == -1 )
      break;
    if ( ((*__ctype_b_loc())[c] & 0x2000) != 0 ) //no clue what that is 
    {
      putc(c, _bss_start); // based on google search and the other decompiler _bss_start in this case == stdout
      v7 = 1;
    }
    else
    {
      v3 = _bss_start;
      if ( v7 )
      {
        v4 = toupper(c);
        putc(v4, v3);
        v7 = 0;
      }
      else
      {
        v5 = tolower(c);
        putc(v5, v3);
      }
    }
  }
  return 0;
}
```
So after that we were sure its not malicious code so we also just ran the code in our VM and did a little black box testing. Cause some parts were still unclear for us.
After that we saw that whatever input we give if the first character is from an alphabet and its lower case the output would have an upper case and all other characters would be just printed out and if its from an alphabet it would be lower case.
So for example:
```console
└─$ ./baby-c             
hello
Hello
WORLD
World
123bs
123bs
bs123
Bs123
empir0x65
Empir0x65

```
**Disclaimer: Never execute something you don't know or trust. We are usually just stupid and execute everything from CTFs**

- [X] Figure out what the binary does

We were now confident that we know what the programm does so lets dive in and see what we can achive with the nice outputs our dicompilers.
The first thing we did was some clean up of the original code to make it more readable for us, with some comments for you:
```C
#include <ctype.h>
#include <stdio.h>
int main() //int __cdecl main(int argc, const char **argv, const char **envp) no clue why it was there but we don't need any input to start the programm
{
  // FILE *v3; // rbx again no clue why its heres based on the ghidra output for the decompiler the stdout stream is some kind of bit stream which can be declared this way in C we think
  // int v4; // eax not used after clean up
  // int v5; // eax not used after clean up
  char runtime_counter; // char v7; // [rsp+Bh] [rbp-15h] renamed to understand the code better 
  int input_output; // int c; // [rsp+Ch] [rbp-14h] same here

  runtime_counter = 1; // counter variable
  while ( 1 )
  {
    input_output = getc(stdin);
    if ( input_output == -1 )
      break;
    if ( isalpha(input_output) == 0  ) // based on our understanding this would be the check for the character of the input if its part of an alphabet
    {
      putc(input_output, stdout); // _bss_start replaced with stdout
      runtime_counter = 1;
    }
    else
    {
      if ( runtime_counter )
      {
        putc(toupper(input_output), stdout); // made it a one liner to kick out v4 and v5
        runtime_counter = 0;
      }
      else
      {
        putc(tolower(input_output), stdout); // made it a one liner to kick out v4 and v5
      }
    }
  }
  return 0;
}
```
With this code we were already quite near to the searched original code or one of its variations. Only the isalpha check was wrong. Instead of a JNE instruction we had a JE. Also we relaized that our code always make the first character of the input uppercase regardless of its position. 
So probably ((*__ctype_b_loc())[c] & 0x2000) != 0 is the culprit. Based on some googling we found out that 
* 0x2000 is a check if the char is big or small == 0x2000 2 == is a alphabet char and any of the 0 are for upper 1 would be lower [stackoverflow](https://stackoverflow.com/questions/37702434/ctype-b-loc-what-is-its-purpose)
* != 0 check if true or false 0 means false [stackoverflow](https://stackoverflow.com/questions/14267081/difference-between-je-jne-and-jz-jnz)
Not sure if the first observations is right or wrong but it make sense that it is a lookup on a given list. And based on the second finding and this nice instructions manual [intel](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html) we found on page 1000 whatever that JE and JNE in this context means that we would need a check if something is not equal instead of if something is equal. 

- [X] Figure out what the different assemble statements would be in conjunction to the behaviour do

We did it Jonny.

So for testing we did exchanged the isalpha with isdigit but it check 800 instead of 2000 of that list. Until now we have no clue what (*__ctype_b_loc())[c] & 0x2000) was originally the right function but when we just use this we have a 100% Solution:
```C
#include <ctype.h>
#include <stdio.h>

int main() {
  // glhf
  char runtime_counter; // [rsp+Bh] [rbp-15h]
  int input_output; // [rsp+Ch] [rbp-14h]

  runtime_counter = 1;
  while ( 1 )
  {
    input_output = getc(stdin);
    if ( input_output == -1 )
      break;
    if ( ((*__ctype_b_loc())[input_output] & 0x2000) != 0  ) //isalpha(input_output) == 0
    {
      putc(input_output, stdout);
      runtime_counter = 1;
    }
    else
    {
      if ( runtime_counter )
      {
        putc(toupper(input_output), stdout);
        runtime_counter = 0;
      }
      else
      {
        putc(tolower(input_output), stdout);
      }
    }
  }
  return 0;
}
```
Also we saw that with that implementation it also worked for us if the second character is from an alphabet it would not be made to upper case. So no clue what is difference but you cant argue with that

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_c_result.png" alt="Result" width="50%" height="50%">

We did not managed to do the last point on the list 

- [ ] Figure out how to programm in C

But at least we got something which was more than we expected and with this little story we might help a student to understand the pleps a bit better.

# <a name="Baby_rust"></a>Baby_rust

```assembly
; This is the disassembly you're trying to reproduce.
; It uses Intel syntax (mov dst, src).

_ZN6source4mainE:
  sub     rsp, 0x108
  mov     [rsp+0xf6], 0
  mov     [rsp+0xf7], 0
  lea     rdi, [rsp+0x40]
  call    [mem1]
  lea     rdi, [rsp+0x28]
  lea     rsi, [rsp+0x40]
  mov     edx, 1
  call    _ZN4core4iter6traits8iterator8Iterator3nthE
  jmp     block1
block1:
  mov     [rsp+0xf7], 1
  lea     rsi, [mem2]; "what    Someu128Zeromut  <= t..."
  lea     rdi, [rsp+0x60]
  mov     edx, 4
  call    _ZN47_$LT$str$u20$as$u20$alloc..string..ToString$GT$9to_stringE
  jmp     block2
block2:
  mov     [rsp+0xf7], 0
  lea     rdi, [rsp+0x10]
  lea     rsi, [rsp+0x28]
  lea     rdx, [rsp+0x60]
  call    _ZN4core6option15Option$LT$T$GT$9unwrap_orE
  jmp     block3
block3:
  mov     [rsp+0xf6], 1
  mov     [rsp+0xf7], 0
  lea     rdi, [rsp+0x40]
  call    _ZN4core3ptr35drop_in_place$LT$std..env..Args$GT$E
  jmp     block4
block4:
  mov     [rsp+0xf6], 0
  mov     rcx, [rsp+0x20]
  mov     [rsp+0xa0], rcx
  movups  xmm0, [rsp+0x10]
  movaps  [rsp+0x90], xmm0
  lea     rdi, [rsp+0x78]
  lea     rsi, [rsp+0x90]
  call    _ZN6source4stepE
  jmp     block5
block5:
  lea     rax, [rsp+0x78]
  mov     [rsp+0xe8], rax
  mov     rdi, [rsp+0xe8]
  lea     rsi, [_ZN60_$LT$alloc..string..String$u20$as$u20$core..fmt..Display$GT$3fmtE]
  call    _ZN4core3fmt10ArgumentV13newE
  mov     rcx, rax
  mov     rsi, rdx
  mov     [rsp], rsi
  mov     [rsp+8], rcx
  jmp     block6
block6:
  mov     rcx, [rsp]
  mov     rdx, [rsp+8]
  mov     [rsp+0xd8], rdx
  mov     [rsp+0xe0], rcx
  lea     rsi, [mem3]
  lea     rdi, [rsp+0xa8]
  mov     edx, 2
  lea     rcx, [rsp+0xd8]
  mov     r8d, 1
  call    _ZN4core3fmt9Arguments6new_v1E
  jmp     block7
block7:
  mov     rcx, [mem4]
  lea     rdi, [rsp+0xa8]
  call    rcx
  jmp     block8
block8:
  lea     rdi, [rsp+0x78]
  call    _ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$E
  jmp     block9
block9:
  mov     [rsp+0xf6], 0
  add     rsp, 0x108
  ret
block10:
  lea     rdi, [rsp+0x78]
  call    _ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$E
  jmp     block14
block11:
  lea     rdi, [rsp+0x40]
  call    _ZN4core3ptr35drop_in_place$LT$std..env..Args$GT$E
block12:
  mov     rdi, [rsp+0xf8]
  call    _Unwind_Resume@plt
  ud2
block13:
  lea     rdi, [rsp+0x10]
  call    _ZN4core3ptr42drop_in_place$LT$alloc..string..String$GT$E
  jmp     block12
block14:
  test    [rsp+0xf6], 1
  jne     block13
block15:
  jmp     block12
block16:
  lea     rdi, [rsp+0x28]
  call    _ZN4core3ptr70drop_in_place$LT$core..option..Option$LT$alloc..string..String$GT$$GT$E
  jmp     block11
block17:
  test    [rsp+0xf7], 1
  jne     block16
block18:
  jmp     block11
block19:
  mov     rcx, rax
  mov     eax, edx
  mov     [rsp+0xf8], rcx
  mov     [rsp+0x100], eax
  jmp     block11
block20:
  mov     rcx, rax
  mov     eax, edx
  mov     [rsp+0xf8], rcx
  mov     [rsp+0x100], eax
  jmp     block17
block21:
  mov     rcx, rax
  mov     eax, edx
  mov     [rsp+0xf8], rcx
  mov     [rsp+0x100], eax
  jmp     block14
block22:
  mov     rcx, rax
  mov     eax, edx
  mov     [rsp+0xf8], rcx
  mov     [rsp+0x100], eax
  jmp     block10
block23:
  int3
```

The next challenge we tried was the rust one. Btw. this time you needed to do multiple functions, we posted only main. Rust seems to be not the best language to start for reversing. So we loaded the binary again up in the different tools and got really weird outputs, at least for us.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_rust_ghidra.png" alt="Ghidra" width="50%" height="50%">

Based on the result we concluded the following:
* Calls like this core: ptr: drop_in_place<std: env: Args>(local_c8); means that from the library core which has library ptr has function drop_in_place is loaded
* The disassemble did not helped cause we rarely touched rust in the past and you should have a basic understanding of the compiler for this
* Ohh and we have multiple functions to create ;-)
* We still don't have a clue if this programm is safe or not sooo dynamic analysis was not an option __Disclaimer: Never execute something you don't know or trust.__

So from what we recalled back then and the first assemble statements

  mov   \[rsp+0xf6\], 0
  mov   \[rsp+0xf7\], 0

2 variables should be there with value 0 and we have to have a function called step based on the dropdown menu of the webside.
So we came to the clever idea to sneak at least something by doing this:

```rust
// this is a dummy function to get something
fn step(lhs: u32, rhs: u32) -> () { 
  if lhs == 0 {
    println!("fizzbuzz");
  } else {
        println!("{}", rhs);
    }
}

fn main() {
    // Wait a minute, why are you walking backwards?
    let integer_1 = 0; // the two variables we need
    let integer_2 = 0;
    
    step(integer_1, integer_2); // the function call
    
    println!("{}", integer_1); // rust has a clever compiler so we needed to use the integer variables other wise it would be skipped
    println!("{}", integer_2);
}
```
With this we actually got 2% so better than nothing. Wuup Wuup. But yeah better check other Write ups for a complete solution.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/baby_rust_result.png" alt="result" width="50%" height="50%">

# <a name="Blaise"></a>Blaise

```assembly
; This is the disassembly you're trying to reproduce.
; It uses Intel syntax (mov dst, src).

main:
  endbr64
  push    rbp
  mov     rbp, rsp
  sub     rsp, 0x40
  mov     [rbp-0x34], edi
  mov     [rbp-0x40], rsi
  mov     [rbp-0x30], 0
  mov     [rbp-0x28], -1
  cmp     [rbp-0x34], 3
  jne     block2
block1:
  mov     rax, [rbp-0x40]
  add     rax, 8
  mov     rax, [rax]
  mov     rdi, rax
  call    atoll@plt.sec
  mov     [rbp-0x30], rax
  mov     rax, [rbp-0x40]
  add     rax, 0x10
  mov     rax, [rax]
  mov     rdi, rax
  call    atoll@plt.sec
  mov     [rbp-0x28], rax
  jmp     block4
block2:
  cmp     [rbp-0x34], 2
  jne     block4
block3:
  mov     rax, [rbp-0x40]
  add     rax, 8
  mov     rax, [rax]
  mov     rdi, rax
  call    atoll@plt.sec
  mov     [rbp-0x28], rax
block4:
  cmp     [rbp-0x30], 0
  js      block7
block5:
  cmp     [rbp-0x28], 0
  js      block7
block6:
  mov     rax, [rbp-0x30]
  cmp     rax, [rbp-0x28]
  jle     block8
block7:
  lea     rsi, [mem1]; "USAGE: ./blaise (range)"
  lea     rdi, [_ZSt4cerr]
  call    _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_PKc@plt.sec
  mov     rdx, rax
  mov     rax, [_ZSt4endlIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_]
  mov     rsi, rax
  mov     rdi, rdx
  call    _ZNSolsEPFRSoS_E@plt.sec
  mov     edi, 1
  call    exit@plt.sec
block8:
  mov     rax, [rbp-0x30]
  mov     [rbp-0x20], rax
block9:
  mov     rax, [rbp-0x20]
  cmp     rax, [rbp-0x28]
  jg      block14
block10:
  mov     [rbp-0x18], 1
  mov     rax, [rbp-0x20]
  mov     [rbp-0x10], rax
  mov     [rbp-8], 1
block11:
  cmp     [rbp-0x10], 0
  je      block13
block12:
  mov     rax, [rbp-0x18]
  mov     rsi, rax
  lea     rdi, [_ZSt4cout]
  call    _ZNSolsEl@plt.sec
  mov     esi, 9
  mov     rdi, rax
  call    _ZStlsISt11char_traitsIcEERSt13basic_ostreamIcT_ES5_c@plt.sec
  mov     rax, [rbp-0x18]
  imul    rax, [rbp-0x10]
  mov     [rbp-0x18], rax
  mov     rax, [rbp-0x18]
  cqo
  idiv    [rbp-8]
  mov     [rbp-0x18], rax
  sub     [rbp-0x10], 1
  add     [rbp-8], 1
  jmp     block11
block13:
  mov     esi, 1
  lea     rdi, [_ZSt4cout]
  call    _ZNSolsEi@plt.sec
  mov     rdx, rax
  mov     rax, [_ZSt4endlIcSt11char_traitsIcEERSt13basic_ostreamIT_T0_ES6_]
  mov     rsi, rax
  mov     rdi, rdx
  call    _ZNSolsEPFRSoS_E@plt.sec
  add     [rbp-0x20], 1
  jmp     block9
block14:
  mov     eax, 0
  leave
  ret
```

Cause we have no clue about C++ either, we thougt why not. So we started with the same plan as before 

- [ ] Figure out what the binary does
- [ ] Figure out what the different assemble statements would be in conjunction to the behaviour do
- [ ] Figure out how to programm in C++

So we got again our neat little decompiler graph as an example from [binary ninja](https://cloud.binary.ninja).

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/blaise_binary.png" alt="ninja" width="50%" height="50%">

As you can see we have multiple paths within the program. In the first part you can see that we have several checks for the input and an error message if the input is invalid. After that we could see that we had a while loop depending on the range you give as an input. Tough for us to see what happens in detail, but we were certain that we had again non malicous code. So we could jump into the dynamic analysis, by executing the binary.

```console
└─$ ./blaise 0 3 
1
1       1
1       2       1
1       3       3       1
```
As an example valid output you can see that we have the mathematical/schematic tree where the branch below is the sum of the 2 above points in the graph. Google is your friend when you want to know more.

- [X] Figure out what the binary does

Yes we also figured out the error message. So once we had that we started again with the output of [ida](https://hex-rays.com/ida-free/) as our base code:

```cpp
int __cdecl main(int argc, const char **argv, const char **envp)
{
  __int64 v3; // rax
  __int64 v4; // rax
  __int64 v5; // rax
  __int64 v7; // [rsp+10h] [rbp-30h]
  __int64 v8; // [rsp+18h] [rbp-28h]
  __int64 i; // [rsp+20h] [rbp-20h]
  __int64 v10; // [rsp+28h] [rbp-18h]
  __int64 v11; // [rsp+28h] [rbp-18h]
  __int64 v12; // [rsp+30h] [rbp-10h]
  __int64 v13; // [rsp+38h] [rbp-8h]

  v7 = 0LL;
  v8 = -1LL;
  if ( argc == 3 )
  {
    v7 = atoll(argv[1]);
    v8 = atoll(argv[2]);
  }
  else if ( argc == 2 )
  {
    v8 = atoll(argv[1]);
  }
  if ( v7 < 0 || v8 < 0 || v7 > v8 )
  {
    v3 = std::operator<<<std::char_traits<char>>(&std::cerr, "USAGE: ./blaise (range)");
    std::ostream::operator<<(v3, &std::endl<char,std::char_traits<char>>);
    exit(1);
  }
  for ( i = v7; i <= v8; ++i )
  {
    v10 = 1LL;
    v12 = i;
    v13 = 1LL;
    while ( v12 )
    {
      v4 = std::ostream::operator<<(&std::cout, v10);
      std::operator<<<std::char_traits<char>>(v4, 9LL);
      v11 = v12 * v10;
      envp = (const char **)(v11 % v13);
      v10 = v11 / v13;
      --v12;
      ++v13;
    }
    v5 = std::ostream::operator<<(&std::cout, 1LL, envp);
    std::ostream::operator<<(v5, &std::endl<char,std::char_traits<char>>);
  }
  return 0;
}
```

This one was not even runable so we go over it one by one to figure out how to get this running. After multiple times googling everything for that language from *hello world* until specific functions was everything there. P.S: This time we were also certain that importing stuff is intended. So we ended up with this:

```cpp
    /*
   // B
  // L A
 // I S E
*/ //intmain
#include <stdlib.h>  // use atoll
#include <string> // if you want to have fun with strings
#include <iostream> // seems to be necessary if you want to write something on the console and 
#include <system_error> // when you want to use error messages

int main(int argc, const char **argv, const char **envp) //no clue about the inputs its from ida
{
// we kicked out int64 seems that ida decompiler in the cloud uses 64bit systems. Not necessary in this case plus some unused variables left us too after the clean up

int v7; // [rsp+10h] [rbp-30h]
int v8; // [rsp+18h] [rbp-28h]
int i; // [rsp+20h] [rbp-20h]
int v10; // [rsp+28h] [rbp-18h]
int v11; // [rsp+28h] [rbp-18h]
int v12; // [rsp+30h] [rbp-10h]
int v13; // [rsp+38h] [rbp-8h]

  v7 = 0; // whatever the LL long long int is used here we just used ints so a 0 was enough
  v8 = -1;
  if ( argc == 3 ) // the check if you have 2 or less arguements all others gets ignored
  {
    v7 = atoll(argv[1]); // atoll makes actuall integer of our input which is parsed as strings
    v8 = atoll(argv[2]);
  }
  else if ( argc == 2 )
  {
    v8 = atoll(argv[1]);
  }
  if ( v7 < 0 || v8 < 0 || v7 > v8 ) // this check is checking if the first value is smaller then the second and equal or above 0 to ensure that we gave a positiv range 
  {
    std::cerr<< "USAGE: ./blaise (range)"; // we learned that stf::something is the print error message definition of c++
    // also we got rid of the complex streaming function calls from ida. This happens cause most of the stuff is done by the compiler for us
    exit(1);
  }
  for ( i = v7; i <= v8; ++i )
  {
    v10 = 1;
    v12 = i;
    v13 = 1;
    while ( v12 != 0 )
    {
      std::cout<< v10 << "\t" << std::flush; // took a while but we figured out that the spaces in between are tabs so \t for tabs 
      v11 = v12 * v10; // magic for the leafs in the branches of the tree continued over 4 lines. Check google to find the formular
      v10 = v11 / v13;
      v12--;
      v13++;
    }
    std::cout<< 1 << std::endl;
  }
  return 0;
}
```
So we had a running code and our internal tests showed that in small the program we had is working. But we never looked into the disassembly per se. If you never had done something in c++ before its kinda hard to figure the easy stuff like print something ... . So once we had that 3 test cases out of 5 went successful trough for us and in total we had 38% in this challenge. This was more than enough for a crash course in c++ . Unfourtnatly this time we did not really do reverse engineering it was more try and error like a programming exercise, with the difference that we started with a broken code. So like any tutor at unverisity once they have you to teach something and explain why your code is broken. (👍 ͡❛ ͜ʖ ͡❛)👍 love you all my tutors (👍 ͡❛ ͜ʖ ͡❛)👍

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/Decompetition_CTF_2022/img/blaise_result.png" alt="result" width="50%" height="50%">

 Maybe we come once back for it but for now we had enough fun. You can continue from here or check other write ups.

# <a name="Conclusion"></a>Conclusion

It was a really fun experience even though in comparision to other CTFs not many people attended. Or only big teams but who knows. At least we had some fun at we defenitly check out the other write ups to improve our skills. We use this more as an log book not really a write up this time but heh *sharing is caring* (っ ͡❛ ᆽ ͡❛)っ. Hopefully we could help a student to get some insights how the pleps went for the challenge and maybe this will become a better world.
