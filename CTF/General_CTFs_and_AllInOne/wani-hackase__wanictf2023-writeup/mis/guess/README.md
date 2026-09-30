---
title: Guess
level: 3
flag: FLAG{How_did_you_know?_10794fcf171f8b2}
writer: Laika
badge: true
---

# Guess

## 問題文

Guess the numbers 🤔

```
nc guess-mis.wanictf.org 50018
```

## 解法

秘密の数列を正しい順序で予測することができればフラグを取得できます。
秘密の数列に対して、指定したインデックスに対応する新たな数列を取得できますが、14回までしかクエリが送れない上に、出力はシャッフルされてしまいます。

簡単のためN=8の場合を考えてみます。

```
index  |000|001|010|011|100|101|110|111|
value  [ 1 | 4 | 2 | 3 | 7 | 0 | 6 | 5 ]
```

まずはインデックスの特定の位のビットが立っている数列を取得します。

```
index  |000|001|010|011|100|101|110|111|
value  [ 1 | 4 | 2 | 3 | 7 | 0 | 6 | 5 ]
0th    [   | 4 |   | 3 |   | 0 |   | 5 ] -> [0, 5, 3, 4]
1st    [   |   | 2 | 3 |   |   | 6 | 5 ] -> [5, 2, 3, 6]
2nd    [   |   |   |   | 7 | 0 | 6 | 5 ] -> [7, 6, 0, 5]
```

ある整数$n$に注目した際に、実は$n$を2進法表記したときのビット列と$n$が数列に含まれているか否かが対応します。例えば、0は0thと2ndの数列に含まれているので、もとの数列の$(101)_2=5$番目に対応することがわかります。
問題ではN=10000ですが、$\log_2(10000) = 13.287.. < 14$ですから、14回のクエリで数列全体を復元することができます。

---

If you can predict the secret sequence in the correct order, you can obtain the flag. You can obtain a new sequence corresponding to the specified index for the secret sequence, but you can only send up to 14 queries, and the output will be shuffled.

Let's consider the case of N=8 for simplicity.

```
index  |000|001|010|011|100|101|110|111|
value  [ 1 | 4 | 2 | 3 | 7 | 0 | 6 | 5 ]
```

First, we obtain the sequences where the bits of certain positions of the index are set.

```
index  |000|001|010|011|100|101|110|111|
value  [ 1 | 4 | 2 | 3 | 7 | 0 | 6 | 5 ]
0th    [   | 4 |   | 3 |   | 0 |   | 5 ] -> [0, 5, 3, 4]
1st    [   |   | 2 | 3 |   |   | 6 | 5 ] -> [5, 2, 3, 6]
2nd    [   |   |   |   | 7 | 0 | 6 | 5 ] -> [7, 6, 0, 5]
```

When we focus on an integer n, the bit sequence of n in binary corresponds to whether n is included in the sequence. For example, since 0 is included in the 0th and 2nd sequences, we know that it corresponds to the 5th element of the original sequence, which is $\(101\)_2=5$.
In the problem, N=10000, but since $\log_2(10000) = 13.287.. < 14$, it is possible to restore the entire sequence with 14 queries.
