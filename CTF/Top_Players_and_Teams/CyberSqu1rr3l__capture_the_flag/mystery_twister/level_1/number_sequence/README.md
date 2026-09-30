```
╔╗╔┬ ┬┌┬┐┌┐ ┌─┐┬─┐  ╔═╗┌─┐┌─┐ ┬ ┬┌─┐┌┐┌┌─┐┌─┐
║║║│ ││││├┴┐├┤ ├┬┘  ╚═╗├┤ │─┼┐│ │├┤ ││││  ├┤ 
╝╚╝└─┘┴ ┴└─┘└─┘┴└─  ╚═╝└─┘└─┘└└─┘└─┘┘└┘└─┘└─┘
```
This sequence is infinite, but you may recognize it after just 13 numbers. What is the
14th number? [^1]

Introduction
-----------------------------------------------------------------------------------------
What is the next number in this sequence? How did you find the solution?
> 1: 2: 4: 6: 10: 12: 16: 18: 22: 28: 30: 36: 40: ?

Solution
-----------------------------------------------------------------------------------------
Given this sequence, we first start by computing all the differences between two numbers
in `number_sequence.py`. This way, the difference sequence is `1 2 2 4 2 4 2 4 6 2 6 4`
without an immediate pattern that we can observe. However, following the repeated pattern
and small jumps with occasional large jumps, e.g. to 6, we suspect the next distance to
be 2. And indeed, by enterting the guessed number, the answer to life, the universe, and
everything, we solve this challenge.

[^1]: https://mysterytwister.org/challenges/level-1/number-sequence
