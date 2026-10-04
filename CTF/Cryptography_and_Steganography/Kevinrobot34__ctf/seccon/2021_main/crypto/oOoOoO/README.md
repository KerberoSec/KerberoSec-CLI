# oOoOoO

## 問題

* description
    > Author: kurenaif
    > ONE DAY THE WITCH CAST A SPELL THAT CAPITALIZES ALL THE LETTERS.
    > GET BACK THE LOWERCASE LETTERS FROM THE HINTS LEFT BY THE WITCH.
* problem.py

    ```python
    import random
    import signal

    from Crypto.Util.number import bytes_to_long, getPrime, long_to_bytes
    from flag import flag

    message = b""
    for _ in range(128):
        message += b"o" if random.getrandbits(1) == 1 else b"O"

    M = getPrime(len(message) * 5)
    S = bytes_to_long(message) % M

    print("M =", M)
    print('S =', S)
    print('MESSAGE =', message.upper().decode("utf-8"))

    signal.alarm(600)
    ans = input('message =').strip().encode()

    if ans == message:
        print(flag)
    else:
        print("🧙")
    ```

## 問題概要

`o`と`O`がランダムに128個並んだ文字列が生成される。このバイト列を整数とみなし、適当な大きな素数で割った余りが渡される。
この数から元の文字列を復元できればflagが取得できる。
