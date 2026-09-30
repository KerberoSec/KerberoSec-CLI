# Logical_SEESAW

## Problem

We have an innovative seesaw!

## Solution

* `problem.py`を読む
  * やってることは以下
    1. flag文字列を `utf-8` でencodeし、そのバイト列をlong型の数字に変換( `bytes_to_long` )
    2. 上記 `flag` と同じ長さの二進数の `key` を生成する
    3. `flag` をbitごとに見て、ある一定の確率で `key` との論理積を取った数に上書きする
    4. 3を16回繰り返した結果をそれぞれ保存する
* 16個分の文字列をbitごとに見て登場する数の集合を見る
  * `{1}` の場合 : `flag[i]` は 1
  * `{0}` の場合 : `flag[i]` は 0
  * `{0,1}` の場合 : `flag[i]` は 1
* 上記結果から1.のflagを再現し、逆のコードを書く
  * `print(long_to_bytes(int(''.join(f_true), 2), blocksize=0))`

## Flag

`ctf4b{Sh3_54w_4_SEESAW,_5h3_54id_50}`

* "She saw a seesaw, she said so"

## References

* https://github.com/Legrandin/pycryptodome
