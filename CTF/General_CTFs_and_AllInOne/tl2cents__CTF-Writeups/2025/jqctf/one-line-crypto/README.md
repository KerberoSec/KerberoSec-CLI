
## 题解

``` python
assert __import__('re').fullmatch(br'flag\{[!-z]{11}\}',flag:=os.getenvb(b'FLAG')) and [is_prime(int(flag.hex(),16)^^int(input('🌌 '))) for _ in range(7^7)]
```

考虑利用 `is_prime` 的侧信道信息恢复 flag。Sage 的 `is_prime` 调用了 [pari](https://pari.math.u-bordeaux.fr/doc.html) 库的 `isprime`, 它采用 Baillie: PSW（BPSW）素性测试，结合了基为 2 的 Miller-Rabin 强伪素性测试和一个 Lucas 伪素性测试。查看源码发现

``` c
long
BPSW_psp(GEN N)
{
  pari_sp av;
  if (typ(N) != t_INT) pari_err_TYPE("BPSW_psp",N);
  if (signe(N) <= 0) return 0;
  if (lgefint(N) == 3) return uisprime(uel(N,2));
  if (!mod2(N)) return 0;
#ifdef LONG_IS_64BIT
  /* 16294579238595022365 = 3*5*7*11*13*17*19*23*29*31*37*41*43*47*53
   *  7145393598349078859 = 59*61*67*71*73*79*83*89*97*101 */
  if (!iu_coprime(N, 16294579238595022365UL) ||
      !iu_coprime(N,  7145393598349078859UL)) return 0;
#else
  /* 4127218095 = 3*5*7*11*13*17*19*23*37
   * 3948078067 = 29*31*41*43*47*53
   * 4269855901 = 59*83*89*97*101
   * 1673450759 = 61*67*71*73*79 */
  if (!iu_coprime(N, 4127218095UL) ||
      !iu_coprime(N, 3948078067UL) ||
      !iu_coprime(N, 1673450759UL) ||
      !iu_coprime(N, 4269855901UL)) return 0;
#endif
  /* no prime divisor < 103 */
  av = avma;
  return gc_long(av, is2psp(N) && islucaspsp(N));
}
```

显然如果输入的 n 不包含小于 103 的素因子才进入真正的随机素性检测函数，因此只要输入 flag^inp 没有小于 103 的素因子，就会真正进入随机的素性检测函数，从而允许 server 端计算 `is_prime` 函数的时间显著大于其他的 cases。本地测试如下

``` python
sage: ss = random_prime(2**136)
sage: time res = [is_prime(103 * ss) for i in range(7^7)]
CPU times: user 7.58 s, sys: 395 μs, total: 7.58 s
Wall time: 7.58 s
sage: time res = [is_prime(101 * ss) for i in range(7^7)]
CPU times: user 641 ms, sys: 30 μs, total: 641 ms
Wall time: 641 ms
```

上述侧信道其实给出了下面的 oracle：

``` python
def server_side_channel_oracle(input_num):
    flag = b"flag{0123qwert45}"
    flag_num = int(flag.hex(), 16)
    pp = input_num ^ flag_num
    for prime in primes_le_103:
        if pp % prime == 0:
            return False
    return True
```

flag 只有 17 字节（136 比特），并且已知格式 flag{XXX}，对于所有小于 103 的素数，它们的乘积大概 128 比特，如果可以恢复出 flag 模这些小素数的剩余类，即可恢复 flag。因此思路如下，我们固定输入的 `num = k * 2^136`，此时 `flag^num = flag + num`。对于每个小素数 p，我们生成若干随机的 `num = k * 2^136`，并且固定 `num % p` 的值（遍历 0, ...,p -1），我们发送足够多这样随机的 num, 此时
  - 如果恰好 `num = - flag % p`，则 server 端永远可以快速响应 `is_prime` 函数。
  - 否则，有极大概率出现 server 端不能快速响应 `is_prime` 函数的情况。
  
因此我们可以逐一恢复 `flag % p` 的值，最终恢复 flag, 本地 proof-of-concept 的实现参考 `local_solver.py`。

## EXP

实际上测试远程的时候发现侧信道相关的参数比较难调，会有一些假阳性情况的出现，对同一个模数用不同参数多跑几次 `exp_cmd.py`，然后在 `get_flag.py` 中本地穷举即可。