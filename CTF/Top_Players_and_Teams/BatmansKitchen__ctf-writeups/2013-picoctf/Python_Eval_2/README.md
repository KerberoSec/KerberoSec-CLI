# Python Eval 2

* Problem:

  It is recommended that you complete [Python Eval 1](https://2013.picoctf.com/problems/pyeval/stage1.html) before trying [Python Eval 2](https://2013.picoctf.com/problems/pyeval/stage2.html).

* Solution:

  This one is quite easy. Flag is a field that we can access, however the game asks us to play mastermind. Note that it will print out what we are guessing. We always need to guess five numbers, seperated by commas, since this is using `eval()`, we can guess `flag,1,1,1,1`, and then we will see what the flag is in the result of mastermind.

* Answer:

  i_are_a_pyeval_mastermind
