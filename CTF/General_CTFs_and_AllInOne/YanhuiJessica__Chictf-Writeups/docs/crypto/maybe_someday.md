---
title: Crypto: Maybe Someday
description: 2022 | Google CTF | crypto
tags:
    - paillier
    - padding oracle attack
---

## 题目

Leave me your ciphertexts. I will talk to you later.

```bash
maybe-someday.2022.ctfcompetition.com 1337
```

??? note "chall.py"

    ```py
    #!/usr/bin/python3

    from Crypto.Util.number import getPrime as get_prime
    import math
    import random
    import os
    import hashlib

    # Suppose gcd(p, q) = 1. Find x such that
    #   1. 0 <= x < p * q, and
    #   2. x = a (mod p), and
    #   3. x = b (mod q).
    def crt(a, b, p, q):
        return (a*pow(q, -1, p)*q + b*pow(p, -1, q)*p) % (p*q)

    def L(x, n):
        return (x-1) // n

    class Paillier:
        def __init__(self):
            p = get_prime(1024)
            q = get_prime(1024)

            n = p * q
            λ = (p-1) * (q-1) // math.gcd(p-1, q-1) # lcm(p-1, q-1)
            g = random.randint(0, n-1)
            µ = pow(L(pow(g, λ, n**2), n), -1, n)

            self.n = n
            self.λ = λ
            self.g = g
            self.µ = µ

            self.p = p
            self.q = q

        # https://www.rfc-editor.org/rfc/rfc3447#section-7.2.1
        def pad(self, m):
            padding_size = 2048//8 - 3 - len(m)
            
            if padding_size < 8:
                raise Exception('message too long')

            random_padding = b'\0' * padding_size
            while b'\0' in random_padding:
                random_padding = os.urandom(padding_size)

            return b'\x00\x02' + random_padding + b'\x00' + m

        def unpad(self, m):
            if m[:2] != b'\x00\x02':
                raise Exception('decryption error')

            random_padding, m = m[2:].split(b'\x00', 1)

            if len(random_padding) < 8:
                raise Exception('decryption error')

            return m

        def public_key(self):
            return (self.n, self.g)

        def secret_key(self):
            return (self.λ, self.µ)

        def encrypt(self, m):
            g = self.g
            n = self.n

            m = self.pad(m)
            m = int.from_bytes(m, 'big')

            r = random.randint(0, n-1)
            c = pow(g, m, n**2) * pow(r, n, n**2) % n**2

            return c

        def decrypt(self, c):
            λ = self.λ
            µ = self.µ
            n = self.n

            m = L(pow(c, λ, n**2), n) * µ % n
            m = m.to_bytes(2048//8, 'big')

            return self.unpad(m)

        def fast_decrypt(self, c):
            λ = self.λ
            µ = self.µ
            n = self.n
            p = self.p
            q = self.q

            rp = pow(c, λ, p**2)
            rq = pow(c, λ, q**2)
            r = crt(rp, rq, p**2, q**2)
            m = L(r, n) * µ % n
            m = m.to_bytes(2048//8, 'big')

            return self.unpad(m)

    def challenge(p):
        secret = os.urandom(2)
        secret = hashlib.sha512(secret).hexdigest().encode()

        c0 = p.encrypt(secret)
        print(f'{c0 = }')

        # # The secret has 16 bits of entropy.
        # # Hence 16 oracle calls should be sufficient, isn't it?
        # for _ in range(16):
        #     c = int(input())
        #     try:
        #         p.decrypt(c)
        #         print('😀')
        #     except:
        #         print('😡')

        # I decided to make it non-interactive to make this harder.
        # Good news: I'll give you 25% more oracle calls to compensate, anyways.
        cs = [int(input()) for _ in range(20)]
        for c in cs:
            try:
                p.fast_decrypt(c)
                print('😀')
            except:
                print('😡')

        guess = input().encode()

        if guess != secret: raise Exception('incorrect guess!')

    def main():
        with open('/flag.txt', 'r') as f:
        flag = f.read()

        p = Paillier()
        n, g = p.public_key()
        print(f'{n = }')
        print(f'{g = }')

        try:
            # Once is happenstance. Twice is coincidence...
            # Sixteen times is a recovery of the pseudorandom number generator.
            for _ in range(16):
                challenge(p)
                print('💡')
            print(f'🏁 {flag}')
        except:
            print('👋')

    if __name__ == '__main__':
        main()
    ```

## 解题思路

- 需要在限制查询次数且无交互的情况下进行 Padding Oracle 攻击，针对使用 EME-PKCS1-v1_5 方案[^eme-pkcs1]填充的 Paillier 加密系统
- 尽管每轮查询机会仅 $20$ 次，但目标明文只有 $65536$ 种情况，知道 $4$ 个字节以上就可以基本确定，不过考虑到顺序相关的信息无法获得，查询范围可以稍稍扩大一些

    ```py
    secret = os.urandom(2)
    secret = hashlib.sha512(secret).hexdigest().encode()
    ```

- EME-PKCS1-v1_5 是为 RSA 设计的填充方案，也有现成的攻击方法，但对具有加法同态性的 Paillier 来说，Padding Oracle 攻击的实施将更简单一些
    - 关于 Paillier 的加法同态性可参考 [Crypto: P(ai)^3](https://yanhuijessica.github.io/Chictf-Writeups/crypto/paiaiai/#_10)
- 被认为正确的填充满足以下条件

    <table>
        <thead>
            <tr>
                <td>00</td>
                <td>02</td>
                <td>PS</td>
                <td>00</td>
                <td>M</td>
            </tr>
        </thead>
    </table>

    - 第一、二字节为 `\x00\x02`
    - 除第一字节外，存在另一个 `\x00` 字节划分不包含 `\x00` 字节的伪随机字节串 `PS` 以及消息 `M`
    - `PS` 的长度不少于 $8$ 字节

- 因为填充验证并没有对 `PS` 做过多的限制，不包含字节 `\x00` 且长度不少于 $8$ 字节即可。因此可以通过加法消去分隔符 `\x00` 字节，而后枚举消息的各个字节。假设目标明文填充后为 $m$，且 $m+m_0$ 恰好使原分隔符失效。设 $b=2^8,m_1=j\cdot b^i$，若 $j$ 的值与目标明文右数第 $i$ 字节的值相同，则 $m+m_0-m_1$ 将产生新的 `\x00` 字节作为分隔符，使得填充验证能够通过

```py
from hashlib import sha512
from Crypto.Util.number import inverse
import pwn

cnt = 8

hashes = dict()
for b in range(0x10000):
    h = sha512(int.to_bytes(b, 2, 'big')).hexdigest()
    hashes[h[:cnt * 2]] = h

conn = pwn.remote('maybe-someday.2022.ctfcompetition.com', 1337)
n = int(conn.recvline_contains('n = ').decode().split(' ')[-1])
g = int(conn.recvline_contains('g = ').decode().split(' ')[-1])

rm_delim = pow(g, 0xff << 1024, n ** 2)

for _ in range(16):
    c0 = int(conn.recvline_contains('c0 = ').decode().split(' ')[-1])
    c1 = c0 * rm_delim % (n ** 2)
    for i in range(20):
        if i in range(16):
            # 间隔枚举，避免借位的影响
            msg = c1 * inverse(pow(g, int(f"{ord(f'{i:x}'):04x}" * cnt, 16) << (1024 - cnt * 8 * 2 + 8), n ** 2), n ** 2) % n ** 2
        else:
            msg = c1 * inverse(pow(g, int(f"{ord(f'{(i - 16):x}'):04x}" * cnt, 16) << (1024 - cnt * 8 * 2), n ** 2), n ** 2) % n ** 2
        conn.sendline(str(msg))

    res = [0] * 20
    for i in range(20):
        ret = conn.recvline().decode()
        if '😀' in ret:
            res[i] = 1

    ans = []
    for k, v in hashes.items():
        ans.append(v)
        h1, h2 = k[::2], k[1::2]
        for i in range(20):
            if i in range(16):
                if res[i] and f'{i:x}' not in h1:
                    ans = ans[:-1]
                    break
                elif not res[i] and f'{i:x}' in h1:
                    ans = ans[:-1]
                    break
            else:
                if res[i] and f'{(i - 16):x}' not in h2:
                    ans = ans[:-1]
                    break
                elif not res[i] and f'{(i - 16):x}' in h2:
                    ans = ans[:-1]
                    break
    
    conn.sendline(str(ans[0]))
    ret = conn.recvline().decode()
    if '💡' not in ret:
        print(':(')
        break

conn.interactive()
```

### Flag

> CTF{p4dd1n9_or4cl3_w1th_h0mom0rph1c_pr0p3r7y_c0m6in3d_in7o_a_w31rd_m47h_puzz1e}

[^eme-pkcs1]: RFC 3447:  Public-Key Cryptography Standards (PKCS) #1: RSA Cryptography Specifications Version 2.1