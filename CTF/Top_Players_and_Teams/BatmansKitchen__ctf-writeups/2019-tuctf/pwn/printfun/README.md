> I have made an impenetrable password checker. Just try your luck!

Solved by Vanilla

In this challenge, we finally have something other than just an SBBO!  This binary reads your user input into an appropriately-sized buffer on the heap.  It then reads the “password” from /dev/urandom into an appropriately-sized buffer on the heap.  It then prints in a “debug message”, your input, with plain printf (so we control the format string).  It then compares the strings for equality, and gives you the flag if they match.

Because pointers to the buffers are stored on the stack, we can use the standard printf %n exploitation technique to write into the buffers.  I figured it would be easiest to make the strings match by just setting the first four bytes of each to zero, to make both strings empty and hence trivially equal.  This was pretty easy, and makes for one of my shortest exploit scripts ever:

#!/bin/sh
printf '%%6$n%%7$n\n' | nc "$@"
On second thought, it also would have been sufficient to just give a single null byte as my input, and then try ~256 times, because there’s a 1/256 chance that /dev/urandom is going to also start with a null byte.  But whatever, I solved it already.

Flag: TUCTF{wh47'5_4_pr1n7f_l1k3_y0u_d01n6_4_b1n4ry_l1k3_7h15?}

