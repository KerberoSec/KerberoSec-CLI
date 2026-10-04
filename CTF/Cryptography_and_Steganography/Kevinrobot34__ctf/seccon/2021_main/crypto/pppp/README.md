# [warmup] pppp

## 問題

* description
    > Author: kurenaif
    > Great research on witch has made it possible to split and duplicate messages
* `problem.sage`

    ```python
    from Crypto.Util.number import *
    from flag import flag

    p = getStrongPrime(512)
    q = getStrongPrime(512)
    n = p*q

    mid = len(flag) // 2

    e = 65537

    m1 = int.from_bytes(flag[:mid], byteorder='big')
    m2 = int.from_bytes(flag[mid:], byteorder='big')

    assert m1 < 2**256
    assert m2 < 2**256

    m = [[p,p,p,p], [0,m1,m1,m1], [0,0,m2,m2],[0,0,0,1]]

    # add padding
    for i in range(4):
        for j in range(4):
            m[i][j] *= getPrime(768)

    m = matrix(Zmod(p*q), m)

    c = m^e

    print("n =", n)
    print("e =", e)
    print("c =", list(c))
    ```

## 問題概要

Flagを含んだ上三角行列を作成し、それに対してRSA暗号を適用した問題
