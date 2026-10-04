# **NSA Backdoor: 500 pts**

### Key points

- Diffie-Hellman
- Smooth numbers
- Pohlig-Hellman algorithm
- Modular exponentiation

---

## **Contents**

- [Overview](#overview)
- [The Paper](#the-paper)
- [The Script](#the-script)
- [Modular Exponentiation](#modular-exponentiation)
- [The Flag](#the-flag)

---

## Overview

### Description

> I heard someone has been sneakily installing backdoors in open-source implementations of Diffie-Hellman... I wonder who it could be... ;)

We are given `gen.py`, the file used to generate `output.txt`, which is given as well. `output.txt` contains the values of `n` and `c` in hexadecimal format.

Looking in `gen.py`, we see smooth primes `p` and `q` are generated, which are then multipled to get `n`. `c` is calculated with `pow(3, FLAG, n)`.

This is a Diffie-Hellman problem: the public modulus is `n` and the public base is `3`. The `FLAG` is Alice's secret key, and `c` is what she sends Bob.

Except here, the public modulus is not prime: it is the product of two smooth primes `p` and `q`. Having solved _Very Smooth_, we know we can easily factor `n`. But what do we do with `p` and `q` after?

---

## The Paper

The challenge hint suggests looking for a paper by a certain Mr. Wong. A quick Google search brings it up: [Paper](https://eprint.iacr.org/2016/644.pdf)

I will be honest, the paper is somewhat confusing for me; I had trouble following some of the steps. I believe Section 5 is the relevant part, with `n = p * q` and `p - 1` and `q - 1` are B-smooth.

The solution is to implement the attack outlined in this section, using Pohlig-Hellman on each of the factors of `p - 1` and `q - 1`, then combining with the Chinese Remainder Theorem. There are many resources online for these two topics, if you would like to look deeper into them.

---

## The Script

At this point, I could attempt to write my own code using the paper. To save time, some further digging around on Google brought up Mr. Wong's [GitHub repo](https://github.com/mimoo/Diffie-Hellman_Backdoor), which contained details and scripts for backdooring Diffie-Hellmann (Thank you Mr. Wong!). The useful code for this challenge was in `/backdoor_generator/backdoor_generator_tests.sage`. I took the relevant part of the code, made some edits, and replaced the values with the challenge values. Upon running it, a key was extracted:

```py
3620831041249707681837526614894534070355285598225483947704567590841907012699590416231948016710515187458091091333255758171595595641033083736309400409643928552525615771016574204069905126628091574921138579736452244193978524346401965227602432958121312546484970793941595446729171796239738120972142110982378127424943566648943536407620764596225821813291776832376735113844664973843090883837692356157669303472000289784070105578708851239130329196576851269845975332237349620983071050002827602934735173409535571381136533487551597603554084684495113710973324043031393001050506093082012789211193458995902872996580045690528376090380
```

I wrote a quick Python script to verify that `pow(3, FLAG, n) == c`, which did in fact return `True`. But this doesn't seem right. It is far too large to be a flag, and converting to Hex then ASCII resulted in a bunch of gibberish. What now?

---

## Modular Exponentiation

If this key works, and the **real** flag works too, then that means there are multiple values of the exponent that are valid. I had a feeling that they must be related in some way, so I began researching.

I ran some small tests on `3^e % n == c`, where n is a product of two small primes (e.g. 5 and 7) and c is constant. I found that for different values of n, there would always exist an arithmetic sequence for possible values of e that yield the same c. For example with `n = 5 x 7 = 35`, values of `e` **12** apart would yield the same c.

```py
pow(3, 2, 35) == 9
pow(3, 14, 35) == 9
pow(3, 26, 35) == 9
pow(3, 2 + 420 * 12, 35) == 9

pow(3, 17, 35) == 33
pow(3, 17 + 84352 * 12, 35) == 33
```

After testing with other values of `n`, I came to the conclusion that the general "period" would be `(p - 1) * (q - 1) / 2`.
(e.g. `(5 - 1) * (7 - 1) / 2 == 12`)

One thing I was not sure about was that while this formula was _almost_ always true, sometimes certain `n` would have periods of `(p - 1) * (q - 1) / 4` (e.g. `65`), sometimes or sometimes simply `(p - 1) * (q - 1)` (e.g. `14`).

After some testing, I found that this challenge was a particular example where `(p - 1) * (q - 1) / 4` was what I needed.

Knowing that the _wrong_ flag is likely too big, I appended to the script, repeatedly subtracting `(p - 1) * (q - 1) / 4` until the flag was printable (it turned out to be once). The full script can be found in [`solve.sage`](solve.sage).

---

## The Flag

> `picoCTF{e032a664}`
