# **Very Smooth: 300 pts**

### Key points

- RSA
- Smooth numbers
- Pollard p-1 algorithm

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Forget safe primes... Here, we like to live life dangerously... >:)

Upon reading `gen.py`, we find that `p` and `q` are generated such that `p - 1` and `q - 1` are [_powersmooth_](https://en.wikipedia.org/wiki/Smooth_number). `n` and `c` are provided in `output.txt`, as expected.

The hint suggests something to do with John Pollard.

---

## Solution

A Google search will bring up [Pollard's p: 1 algorithm](https://en.wikipedia.org/wiki/Pollard%27s_p_%E2%88%92_1_algorithm), used for cases like these.

We can write a script to implement the algorithm, or search up an existing tool. [Primefac](https://pypi.org/project/primefac/) does just what we need, so that is what we will use.

Running `python3 -m primefac n` returns `p` and `q`, which I have stored in `solve.py`.

The rest is regular RSA decryption.

---

## Flag

> `picoCTF{148cbc0f}`
