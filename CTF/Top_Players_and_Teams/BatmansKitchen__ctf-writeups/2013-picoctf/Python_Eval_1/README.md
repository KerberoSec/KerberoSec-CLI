# Python Eval 1

* Problem:

  A wise master wishes to teach you an ancient art: [Python Eval 1](https://2013.picoctf.com/problems/pyeval/stage1.html).

* Solution:

  Our job is to find the flag in the script task1.py. Since we know `input()` is actually `eval(raw_input())`, we can enter x for whatever value, and enter y with the expression including x.

  For example, we can enter the first value as `0`, and the second value as `(7-x) * 6 / 5`, This will satisfy the if statement, hence we will get the flag

* Answer:

  eval_is_best_thing_evar
