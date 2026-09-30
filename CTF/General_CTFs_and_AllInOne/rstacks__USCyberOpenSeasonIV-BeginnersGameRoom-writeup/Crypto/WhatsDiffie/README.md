# What's Diffie

## Description

Alice and Bob have been experimenting with a way to send flags back and forth securely. Can you intercept their messages?

<code>nc 0.cloud.chals.io 32820</code>

## Solution

- The title of this challenge hints that Alice and Bob are using [Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange) key exchange.
- We are provided with the values of <code>g</code>, <code>p</code>, <code>a</code>, and <code>b</code> (12, 53, 8, and 67, respectively) after running
the <code>nc</code> command. This allows us to determine the value of the **shared secret** (note the figure on the Wikipedia article), which is 47.
- After entering this value into the interface of the <code>nc</code> command, we are provided with the [encrypted flag](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/WhatsDiffie/diffie.txt) and told that we need to use **XOR** to decrypt it.
- I copied the encrypted text into [CyberChef](https://cyberchef.org/) and added two operations to the recipe: first, "From Hex," and then "XOR" with a key of 47 in decimal.
This yielded the flag.

## Flag

SIVBGR{4_fl4g_fr0m_4l1c3_4nd_b0b}
