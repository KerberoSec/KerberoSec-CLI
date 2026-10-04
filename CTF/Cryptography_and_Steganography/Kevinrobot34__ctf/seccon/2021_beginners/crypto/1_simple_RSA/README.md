# simple_RSA

## Problem

Let's encrypt it with RSA!

## Solution

* `problem.py`を読む
  * RSA暗号やってるだけっぽい
  * `assert`が気になる
    * `flag` が375bitで、`n`は2047bit以上あることになってる
    * `((1<<375)**3).bit_length()`とやると1126と出るので、`flag^e < n`と分かる
    * つまり、`mod n`関係ない！！
* 無理やり`c`の（文字通り）3乗根を計算できれば良い
  * `c.bit_length()`は1124
    * brute-forceに1から調べるは当然無理
  * 今回は二分探索する
* `long_to_bytes`かけて`print`すればOK!

## Flag

`ctf4b{0,1,10,11...It's_so_annoying.___I'm_done}`

* "0, 1, 10, 11,... It's so annoying. I'm done."

## References

* [作問者writeup]( https://qiita.com/ushigai_sub/items/8c63fb566f19ac097bc5#beginner-simple_rsa--75points--289solves- )
* [第0回 RSAへのAttack ～RSAってなに～]( https://falconctf.hatenablog.com/entry/2019/09/30/212910 )
* [RSA暗号運用でやってはいけない n のこと #ssmjp]( https://www.slideshare.net/sonickun/rsa-n-ssmjp )
