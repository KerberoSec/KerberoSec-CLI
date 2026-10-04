# **Sequences: 400 pts**

### Key points

- Linear Recursion
- Matrixes
- Matrix Diagonalization

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> I wrote this linear recurrence function, can you figure out how to make it run fast enough and get the flag?

A `sequences.py` file is provided. It consists of two functions, `m_func` and `decrypt_flag`. `m_func` is the recurrence function, which in its current state will take forever to run: the challenge is to optimize it.

---

## Solution

### **The _easy_ solution**

Putting `f(0)=1, f(1) = 2, f(2) = 3, f(3) = 4, f(x)=21*f(x-1)+301*f(x-2)-9549*f(x-3)+55692*f(x-4)` into Wolfram Alpha, you will find that Wolfram Alpha actually returns the recurrence solution function for you (in a rearranged form compared to the function below). You can then replace `x` with `20000000` and `mod 10 ** 10000` to get `sol`.

I realized this after I solved the challenge using the "proper" solution.

### **The _"proper"_ solution**

The solution is to use matrix diagonalization to change the recurrence function into a closed-form function, which the hint hints at.

That means instead of requiring the previous 4 terms to calculate the next term, we want to find a function that calculates the *n*th term using only n.

You can follow resources online that outline step-by-step how to use matrix diagonalization on a linear recurrence, if you are interested in the math behind this. Here's the [resource](https://www.math.cmu.edu/~mradclif/teaching/228F16/recurrences.pdf) I used.

If you would like to skip most of the math steps, [Symbolab](https://www.symbolab.com/) has matrix diagonalization functionalities. You may need to convert the linear recurrence function into a matrix first.

Below are the results between steps.

---

**The original function**

`f(x) = 21*f(x - 1) + 301*f(x - 2) - 9549*f(x - 3) + 55692*f(x - 4)`

**In matrix form**

```py
| 21      301     -9549       55692 | | f(x - 1) |
| 1       0       0           0     | | f(x - 2) |
| 0       1       0           0     | | f(x - 3) |
| 0       0       1           0     | | f(x - 4) |
```

The diagonalized matrix is too big to type out, but you should end up with the closed form function below:

```py
f(x) = (760 / 33) * pow(12, x) - (1727 / 68) * pow(13, x) + (253 / 76) * pow(17, x) + (403 / 10659) * pow(-21, x)
```

Replacing x with 20000000 and evaluating f(x), we get `sol`. I calculated this part, including the `% 10 ** 10000)`, using Wolfram Alpha. The result is in `solve.py` which we can pass into the `decrypt_flag()` function to get our flag.

---

## Flag

> `picoCTF{b1g_numb3rs_3956e6c2}`
