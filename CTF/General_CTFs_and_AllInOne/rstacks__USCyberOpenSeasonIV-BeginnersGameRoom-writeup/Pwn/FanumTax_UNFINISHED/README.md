# Fanum Tax

## Description

Hello, they call me Theodore Rizzevelt and today you're gonna get mogged. The tiktok rizz party is out of control and only a true sigma can stop the skibidi toilets. Surely a String bean like yourself can't find the flag. Get out of here before I send you back to Ohio.

<code>nc 167.99.118.184 31337</code>

## Attachments

[Dockerfile](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Pwn/FanumTax_UNFINISHED/attachments/Dockerfile)

[fanum_strings](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Pwn/FanumTax_UNFINISHED/attachments/fanum_strings)

## Solution (Unfinished)

- We are given an executable called <code>fanum_strings</code> that I uploaded to the decompiler explorer at
[dogbolt.org](https://dogbolt.org/). The challenge description and the name of this executable hint towards something
about strings, and sure enough, there is a **format string vulnerability** present in the executable.
The program prompts the user for input, then prints that input out with <code>printf()</code> without any
format specifiers.
- Within the executable, there is a function called <code>win()</code>. This function is never explicitly called
by the program, but if we can get it to execute, it will most likely reveal the flag. I ran the
command <code>nm</code> on the executable to expose the memory addresses of various items in the program, and
I was able to determine that the <code>win()</code> function was located at <code>0x401236</code>.
- The next step was to somehow exploit the format string vulnerability to place the <code>win()</code> function's
address on the stack, causing it to be executed and reveal the flag. This is where I got stuck.
By providing "<code>aaaa%p%p%p%p%p%p%p%p</code>" as input to the program, I could see where my input was being
placed on the stack (the <code>%p</code> specifier reveals pointers on the stack) by looking for a bunch of <code>61</code>'s,
which is the hexadecimal code for the character "a." I could not figure out, however, how to get
the address of <code>win()</code> to that location. I also could not figure out how to write the address of <code>win()</code>
as ASCII characters, which seemed to be a necessary step, since the input seemed to be processed as
ASCII text. Multiple characters from the ASCII version of <code>win()</code>'s address are not actual keyboard
characters.
