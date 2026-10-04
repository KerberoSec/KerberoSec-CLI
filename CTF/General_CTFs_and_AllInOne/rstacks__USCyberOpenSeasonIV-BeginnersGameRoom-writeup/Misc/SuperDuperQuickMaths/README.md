# Super Duper Quick Maths

## Description

Solve my math test and you'll get my flag!

<code>nc 167.99.118.184 31340</code>

## Solution

- We are given 50 simple math problems to solve, but each one must be solved within 3
seconds to get the flag. I'm not that good at mental math, so I wrote a [Python script](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Misc/SuperDuperQuickMaths/quick_maths.py)
to run the provided <code>nc</code> command and evaluate the math problems for me.
- I used the <code>subprocess</code> module to run the <code>nc</code> command with the ability to read and write data. After connecting, I
read from <code>stdout</code> and used <code>eval()</code> to evaluate the math expression. I then sent the results to <code>stdin</code>.
This process repeated until all 50 problems were solved, which revealed the flag.

**Note:** You should avoid using <code>eval()</code> if you are accepting input from an untrustworthy source, as it
is very easy for an attacker to execute malicious code on your machine through this function.

## Flag

SIVBGR{L00kM0m!_ICANDO_m4th}
