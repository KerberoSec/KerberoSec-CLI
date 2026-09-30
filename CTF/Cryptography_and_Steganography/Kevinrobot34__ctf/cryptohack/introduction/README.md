## introduction
https://cryptohack.org/challenges/introduction/

### Finding Flags
Cryptohackのflagは `crypto{y0ur_f1rst_fl4g}` 的な形をしている

### Great Snakes
Python3でやるのがオススメ的な話が[FAQ]( https://cryptohack.org/faq/#python3 )に書いてある。
特にライブラリーや関連言語が充実しているため。
* [PyCryptodome]( https://github.com/Legrandin/pycryptodome )
* [gmpy2]( https://gmpy2.readthedocs.io/en/latest/ )
* [Sage 9]( https://www.sagemath.org/ )

問題としては大体Python Scriptが与えられているという説明とともに、
Xorの演算と[chr]( https://docs.python.org/ja/3/library/functions.html#chr )を使った例が示されている。

### Network Attacks
ネットを経由していろいろやることもあるよ。
[telnetlib]( https://docs.python.org/ja/3/library/telnetlib.html )という、標準パッケージが便利らしい。