## Challenge 🧩

Ok, you seem to have found the flag... but have you tried writing the flag back to ctl?

## Solution 🕵️‍♂️

After writing previous flag to ctl we get a [C Program](<src/C1.c>)

*[Image: CTL]*

Analyzing it reveals that it writes unicode characters 0x25a0(Black Square/U+25A0) and 0x25a1(White Square/U+25A1) in a pattern to file.

After rewriting C program in [Python](<src/C1.py>) we can see the flag in ASCII art

[Flag](<src/C1_Flag.txt>)

### References

> `doc.cat-v.org/plan_9/programming/c_programming_in_plan_9` </br>
> `en.wikipedia.org/wiki/Geometric_Shapes_(Unicode_block)`

## Flag 🚩

`FLAG{y0u_t33_F_31Gh7_EVERYWH3r3}`
