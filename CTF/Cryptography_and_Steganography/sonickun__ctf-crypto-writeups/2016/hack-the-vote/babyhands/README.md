# Hack the Vote CTF 2016 : babyhands-300

**Category:** Crypto
**Points:**
**Solves:**
**Description:**

> We think that Trump's right hand man has been sending out flags from his personal computer, but we need to be sure. See if you can make anything out of the traffic we intercepted.  intercepted>    author's irc nick: negasora

## Write-up
RSAのd, n, cのペアが渡され、eの値を求める必要がある。dが大きいとeが相対的に小さくなることを利用して逆Wiener's Attackを行うとeが求まる。

Sageを使うと容易に連分数の計算ができる。

`solver.py`

## Other write-ups and resources

* [Carl Loendahl](https://github.com/grocid/CTF/tree/master/Hack%20the%20vote/2016#babys-hands-300-p)
* [P4 Team](https://github.com/p4-team/ctf/tree/master/2016-11-05-hack-the-vote/hands_crypto_300)
