# picoCTF / crypto
## Classic Cipher
### Mod 26
* Solution
  * ROT13やるだけ
  * 自分で組んでも良いし、コマンド叩いても良い
* Flag
  * `picoCTF{next_time_I'll_try_2_rounds_of_rot13_hWqFsgzu}`
  * "Next time I'll try to rounds of rot13"
  * 最後のランダム文字列的なやつは、定期的に出題側が書き換えているっぽいやつ

### 13
* Solution
  * ROT13やるだけ
  * "Mod 26" と被っているのに何故...
* Flag
  * `picoCTF{not_too_bad_of_a_problem}`

### caesar
* Solution
  * シーザー暗号だと思われるので、keyを0-25まで全て試して、それっぽい文字列を探す
* Flag
  * `picoCTF{crossingtherubiconvfhsjkou}`
  * "crossing the rubicon"
    * ユリウス・カエサルはルビコン川を渡って後戻りのできない戦へと踏み出したらしい

### New Caesar
* Solution
  * `new_caesar.py` を見る
    * `b16_encode` でアルファベットを適当に前半16文字に変換
    * `shift` はアルファベット前半16文字に絞ったシーザー暗号的な感じ
  * 簡単なのでdecodeのコードを書いて、keyを26種類総当たりする
  * "redacted" は「編集済み」という意味
* Flag
  * `picoCTF{et_tu?_23217b54456fb10e908b5e87c6e89156}`
  * "et tu ?"
    * "Et tu, Brute?" で「ブルータス、お前もか」という意味のラテン語
  * 最後の `_` 以降は定期的に出題側が書き換えているっぽいやつ

### Easy1
* Solution
  * いわゆるヴィジュネル暗号
    * ヴィジュネル暗号は端的に言うとブロック化したシフト暗号
    * 問題で与えられているような表のcolumnが平文の文字、indexが鍵の文字、valueが暗号文の文字と対応している
    * 具体的な手順は以下
      * 鍵が平文と同じ長さになるように反復させる/削る
      * 平文と鍵のi文字目を見て、表を元に暗号文のi文字目を決定するだけ
  * 文字ごとにシーザー暗号的なことすれば良いだけ
* Flag
  * `picoCTF{CRYPTOISFUN}`

### la cifra de
* Solution
  * いわゆるヴィジュネル暗号 (Vigenère cipher)
    * 最初換字式暗号かと思い、 https://www.quipqiup.com/ に投げていろいろ考えたが全くうまくいかない
    * ルール一つじゃ対応できないあたりで他を当たるべきだった
  * Easy1と違って鍵も分からないので適当にsolverに突っ込む
    * https://www.guballa.de/vigenere-solver
      * `Classic Vigenere` & `English` でやる
    * keyは `flag` らしい
* Flag
  * `picoCTF{b311a50_0r_v1gn3r3_c1ph3ra966878a}`
  * "bellaso or vigenere cipher"

### spelling-quiz
* Solution
  * いわゆる単一換字式暗号
    * 頻度分析による解読方法が知られている
  * 自分でやるのは辛いので、適当なsolverを使うと楽
    * https://www.quipqiup.com/
    * https://www.guballa.de/substitution-solver
* Flag
  * `picoCTF{perhaps_the_dog_jumped_over_was_just_tired}`

### waves over lambda
* Solution
  * 単一換字式暗号
  * "spelling-quiz" 参照
* Flag
  * `frequency_is_c_over_lambda_dnvtfrtayu`
  * `picoCTF{hoge}`の形じゃないんかーい

### Play Nice
* Solution
  * "Playfair" と呼ばれる暗号
  * 暗号表が与えられるので、大人しく復号するだけ
* Reference
  * https://en.wikipedia.org/wiki/Playfair_cipher
* Flag
  * `25a0ea7ff711f17bddefe26a6354b2f3`

## Common Key Crypto
### XtraORdinary
* Solution
  * `encrypt.py` を見る
    * まず `flag` と `key` をbyteごとにxorとって `ctxt` とする
    * `ctxt` と `random_strs` の各要素をランダムにたくさんXORしてそれを最終的な `ctxt1` とする
  * これを踏まえまず、 `random_strs` の各要素を高々１度XOR取ったもの32種類が、 `encrypt(flag, key)` の候補
  * `picoCTF{` から始まるはずなので、上記32種類全てと `picoCTF{` のXORを取ってみると、 `key` の候補が得られる
  * 上記 `key` を `ctxt1` とXOR取って `flag` が出てくる
* Flag
  * `picoCTF{w41t_s0_1_d1dnt_1nv3nt_x0r???}`
  * "wait so I didn't invent xor?"

### Easy Peasy
* Solution
  * いわゆるバーナム暗号、one-time padと呼ばれるタイプの暗号
    * ランダムな0/1からなる十分長い鍵を用意し、それと平文のXorを取るだけというシンプルな暗号
    * one-time padは理論的に解読不可能（暗号文だけ見て秘密鍵を推測したところで平文を原理的に特定できない）が、それは鍵を**再利用しない**場合の話
  * 今回のセットアップでは長さ50000バイトの鍵が用意されていて、何度でも好きな文字を暗号化できるようになっている
  * フラグ文字列は64/2=32バイトなので、(50000-32)バイト分適当な文字列を入力させ、その後暗号化されたflagを入力すれば、元のflagを得る
    * 投げるべき文字が長いので、`telnetlib`を使うか、適宜コマンドラインから流し込む
* Flag
  * `picoCTF{7904ff830f1c5bba8f763707247ba3e1}`
  * 完全にランダムなタイプは焦るね

### Double DES
* Solution
  * Triple DESならぬ、Double DESについての問題
  * "Meet-in-the-middle attack"(中間一致攻撃) と呼ばれる既知平文攻撃が可能
    * ブロック暗号（共通鍵暗号）は安全性を高めるために、2つの異なる鍵を用いて2度暗号化を行うことがある（Double DES / Triple DES）
      * 全探索する場合には `(key1, key2)` を全て試す必要があり、元々の鍵空間の2乗の計算量が必要となり安全性が増すというロジック
    * ただし、既知平文攻撃が可能であると、メモリ使用量が増えるトレードオフはあるが、元の鍵空間の広さの全探索で済んでしまう
    * `c = gj(fi(p))` は `Gj(c) = fi(p)` (`Gj`は`gj`の逆関数)と書けるが、この両辺の鍵`i,j`について全探索をして、一致するかをハッシュテーブルを用いて判定すれば良い
* Flag
  * `9af5126b7bc7f825b3cae0e32bd1acb4`
* Reference
  * https://en.wikipedia.org/wiki/Meet-in-the-middle_attack

## RSA
### Mind your Ps and Qs
* Solution
  * Modulus `n` が小さいため、素因数分解が可能になってしまう
    * やり方はいくつかある
      * http://factordb.com/
        * [未確認] https://pypi.org/project/factordb-pycli/
      * [未確認] https://pypi.org/project/primefac/
      * [未確認] https://github.com/Ganapati/RsaCtfTool
  * `n = p * q` と表せたら、あとは秘密鍵を拡張ユークリッドの互除法で計算するだけ
* Flag
  * `picoCTF{sma11_N_n0_g0od_55304594}`
  * "small N no good"

### miniRSA
* Solution
  * "Low Public Exponent Attack" をやれば良い
  * 変数
    * `m` : Plain Text
    * `c` : Cipher Text
    * `e` : Public Exponent
    * `n` : Modulus
  * `m**e < n` であれば直接二分探索で `m` を探すだけ
    * 実際に見つかる
* Flag
  * `picoCTF{n33d_a_lArg3r_e_606ce004}`
  * "need a large e"

### Mini RSA
* Solution
  * いわゆる "Low Public Exponent Attack" をやれば良い
  * 変数
    * `m` : Plain Text
    * `c` : Cipher Text
    * `e` : Public Exponent
    * `n` : Modulus
  * `m**e < n` であれば直接二分探索で `m` を探すだけだが、今回は「ギリギリ」これが成立しないように平文をpaddingしたと言っている
  * `c` に順次 `n` を足していきながら、 `e`乗根を整数で求められるか試してみれば良い
  * pythonで適当に書いても数分で見つかる
* Flag
  * `picoCTF{e_sh0u1d_b3_lArg3r_7adb35b1}`
  * "e should be larger"

### Triple Secure
* Solution
  * 違う公開鍵のRSAで３回暗号化している
  * ただ、 `n1 = p * q` / `n2 = p * r` / `n3 = q * r` としてしまっているので簡単に各素数が求まっちゃう
    * やり方１
      * `math.isqrt(n1 * n2 * n3)` 
      * https://docs.python.org/ja/3/library/math.html#math.isqrt
    * やり方２
      * `p = math.gcd(n1, n2)`
      * gcdは `O(log min(n1, n2)` なので十分高速
* Flag
  * `picoCTF{1_gu3ss_tr1pl3_rs4_1snt_tr1pl3_s3cur3!!!!!!}`
  * "I guess triple rsa isn't triple secure!"

### college-rowing-team
* Solution
  * いわゆる "Håstad's broadcast attack" の問題
    * 状況としてはpublic exponent `e`を小さい数（今回は３）で固定して、ある平文 `m` を `e` 個の公開鍵で暗号化した暗号文が与えられている
    * 与えられるmodulusを`n1/n2/n3`、対応する暗号文を`c1/c2/c3`とする
      * `m^e ≡ c1 mod n1`
      * `m^e ≡ c2 mod n2`
      * `m^e ≡ c3 mod n3`
    * よって中国剰余定理を使うことで `m^e mod (n1*n2*n3)` が求まる
    * ここで、平文`m`は `m < ni` を満たす（そうでないと平文がtruncateされてしまうので）
    * つまり `m^e = m^3 < n1 * n2 * n3` であり上記CRTで求めた値は `m^e` そのもの
    * よってあとは`e`乗根を二分探索やライブラリで求めれば終わり
  * 今回の設定では、flagとその他の適当な文章3つの合計4つの文字列が、それぞれ3回ずつ暗号化されている
  * 各暗号文がどの平文に対応するかは分からないので、brute-forceに全パターン試す
* Flag
  * `picoCTF{1_gu3ss_p30pl3_p4d_m3ss4g3s_f0r_4_r34s0n}'`
  * "I guess people pad messages for a reason"
* References
  * https://partender810.hatenablog.com/entry/2021/05/19/210459#college-rowing-team-250pt
  * https://en.wikipedia.org/wiki/Coppersmith%27s_attack

### Dachshund Attacks
* Solution
  * いわゆる "Wiener's Attack" の問題
    * 状況としては public exponent `e` が非常に大きく、結果として private exponent `d` が非常に小さくなってしまっている
    * このとき、 `e / n` を連分数展開して近似した有理数を求める計算をしてみると途中で `d` が分母に現れてしまう
    * `d` がわかってしまったら平文を求めるのは一瞬
* Flag
  * `picoCTF{proving_wiener_3878674}`
* References
  * [Wiener's attack 短い秘密鍵のRSA暗号への攻撃]( https://cryptee.blogspot.com/2018/10/rsawieners-attack.html )
  * [Wiener’s Attack を実装した]( https://hackmd.io/@orisano/ryhoUinFe?type=view )
  * [公開鍵暗号: RSA: Wiener's Attack]( https://elliptic-shiho.hatenablog.com/entry/2015/12/18/205804 )
      * これが一番分かりやすい

### b00tl3gRSA2
* Solution
  * いわゆる "Wiener's Attack" の問題
  * "Dachshund Attacks"を参照
* Flag
  * `picoCTF{bad_1d3a5_4783252}`
  * "bad ideas"
    * 大きい `e` を使うのはやめようね

### b00tl3gRSA3
* Solution
  * いわゆる "Multi-prime RSA" と呼ばれる設定の問題
    * 3つ以上の素数から modulus `n` が計算されてしまっている
  * この場合には素因数分解が現実的にできてしまいがちらしい
    * `sympy` の [factorint]( https://docs.sympy.org/latest/modules/ntheory.html#sympy.ntheory.factor_.factorint ) などを使うとちょっと待てば素因数分解できてしまう
    * `gmpy`とかにも似たようなのがあるかも
* Flag
  * `picoCTF{too_many_fact0rs_0731311}`
  * "too many factors"

### rsa-pop-quiz
* Solution
  * RSA暗号に関する細かい問題がたくさん出される
  * 大人しく一問ずつ解いていくだけ
  * 途中で "Low Public Exponent Attack" と思いきやうまくできないやつとかあって面倒だけど、冷静にやってみるだけ
* Flag
  * `picoCTF{wA8_th4t$_ill3aGal..oa2d2239b}`

### No Padding, No Problem
* Solution1
  * `c` は直接は渡せない
  * 今回は `c + n` は渡せちゃう
  * `(c + n)^d ≡ c^d mod n` なので、簡単に平文が手に入る
  * 中の実装が雑
* Solution2
  * `c` は直接は渡せない
  * `2^e * c = (2 * m) ^ e` は渡せる
  * 復号化されて帰ってくるのは `2 * m`
  * よって2の `mod n` での逆元をかければ平文が手に入る
  * https://inaz2.hatenablog.com/entry/2016/01/26/222303
* Solution3
  * いわゆる "LSB decryption oracle attack"
  * 今回のセットアップは任意の暗号文を復号化した結果が返ってくる decryption oracle があるのでSolution1/2が成立した
  * 実は、任意の暗号文を復号化した結果の**偶奇のみ**が分かるだけでも、flagは求められてしまう
    * `n`: modulus、奇数
    * `0 <= x < n` つまり、 `0 <= 2*x < 2*n`
      * `2*x mod n` は
        * `0 <= 2*x < n` の時 `2*x` で必ず偶数
        * `n <= 2*x < 2*n` の時 `2*x - n` で必ず奇数（ `n` が奇数なので）
    * よって逆に、 `2*x mod n` の偶奇で `x` の範囲を絞れる
      * 偶数なら `0 <= x < n/2`
      * 奇数なら `n/2 <= x < n`
  * この性質を踏まえ、二分探索することができる
    * 誤差を防ぐために区間の端点の情報はFractionで持っておく
  * References
    * https://kimiyuki.net/blog/2017/06/24/lsb-leak-attack/
    * https://inaz2.hatenablog.com/entry/2016/11/09/220529
* Flag
  * `picoCTF{m4yb3_Th0se_m3s54g3s_4r3_difurrent_1772735}`
  * "maybe those messages are difurrent"

### It's Not My Fault 1
* Solution1
  * PoW (Proof of Work) パート
    * > Enter a string that starts with "76537" (no quotes) which creates an md5 hash that ends in these six hex digits: d9d3a9
    * 特定の文字列からはじまり、md5でハッシュを取ると特定の文字列で終わるような文字列を探せ、的なメインパートと関係ない問題を解かされる
    * PoWというらしい。 [参考]( https://bitbank.cc/glossary/pow )
    * 指定された文字列に適当な数字を連結して、brute-forceに探す
  * メインパート
    * 以下を満たす `n` と `e` が与えられる
      * `n = p * q`
        * RSAのよくある modulus で、 `p,q` は素数
      * `dp = randint(2, 1<<20)`
      * `dq = randint(2, q-1)`
      * `d = CRT((dp, p-1), (dq, q-1))`
      * `e = inverse(d, (p-1)*(q-1))`
    * `dp * e ≡ 1 mod (p-1)` であることに注目する
      * オイラーの定理より任意の `x` に対し、 `x^{dp * e} ≡ x mod p`
      * `(pow(x, dp*e, p) - x)` は `p` の倍数
      * `(pow(x, dp*e, n) - x)` も大体 `p` の倍数（**要検証**）
    * `dp` は高々 `2^20 ≒ 10^6` なので全探索できる 
    * `x` も適当な数でいくつか試してみる
* Flag
  * `picoCTF{1_c4n'7_b3l13v3_17'5_n07_f4ul7_4774ck!!!}`
  * "I can't believe it's not fault attack!!!"
* References
  * Writeups
    * [#1]( https://miso-24.hatenablog.com/entry/2021/04/13/214713#Its-Not-My-Fault-1 )
    * [#2]( https://github.com/Ethan127/CTF_writeups/tree/main/picoCTF_2021/Cryptography/it's-not-my-fault-2 )
  * Papers
    * [Modulus Fault Attacks Against RSA-CRT Signatures]( https://eprint.iacr.org/2011/388.pdf )
    * [A Polynomial Time Attack on RSA with Private CRT-Exponents Smaller Than N0.073]( https://www.iacr.org/archive/crypto2007/46220388/46220388.pdf )
  * Others
    * [mathoverflow: Attack on CRT-RSA]( https://mathoverflow.net/questions/120160/attack-on-crt-rsa )

### john_pollard
* Solution1
  * とりあえず `cert` を開いてみる
    ```
    -----BEGIN CERTIFICATE-----
    MIIB6zCB1AICMDkwDQYJKoZIhvcNAQECBQAwEjEQMA4GA1UEAxMHUGljb0NURjAe
    (snip)
    -----END CERTIFICATE-----
    ```
  * pycryptodomeの `RSA.import_key` で読み込めそう
  * `{'_n': Integer(4966306421059967), '_e': Integer(65537)}` を得る
  * ヒントによると `picoCTF{p,q}` がフラグとのことなので、あとは因数分解するだけ
    * factordbでもsympyでもなんでもOK
* Solution2
  * `openssl` を使って以下のように modulus　を取得できる
    ```bash
    $ openssl x509 -pubkey -noout -in cert | openssl rsa -pubin -text
    Public-Key: (53 bit)
    Modulus: 4966306421059967 (0x11a4d45212b17f)
    Exponent: 65537 (0x10001)
    writing RSA key
    -----BEGIN PUBLIC KEY-----
    MCIwDQYJKoZIhvcNAQEBBQADEQAwDgIHEaTUUhKxfwIDAQAB
    -----END PUBLIC KEY-----
    ```
    * `openssl x509 -in cert -text -noout`　とやるといろんな情報が出てくる
  * 残りはSolution1と同じ
* Flag
  * `picoCTF{73176001,67867967}`

## Others
### The Numbers
* Solution
  * 画像を見ると明らかにFlagっぽい文字列が数字に変換されて並んでいる
  * CTFに相当しそうな文字列が `3, 20, 6` なので、アルファベットの前から何番目かで変換されてると予想できる。
* Flag
  * `PICOCTF{THENUMBERSMASON}`
  * なぜか全部大文字...

### Pixelated
* Solution
  * 二つの画像を重ねる
  * 重ねる方法はいろいろある(AND/OR/XOR/...)が今回は単純に和をとるだけ
* Flag
  * `picoCTF{d562333d}`
  * 今回のFlagは毎回変わるタイプらしい

### Flags
* Solution
  * 「国際信号旗」とよばれるやつらしい
    * https://en.wikipedia.org/wiki/International_maritime_signal_flags
  * 見つければ勝ちだが、見つけるのが難しかった
  * Google画像検索するときには特徴的な色・模様のものからいろいろ突っ込んで見てみるしかない
* Flag
  * `PICOCTF{F1AG5AND5TUFF}`

### Tapping
* Solution
  * よくあるモールス符号の問題
  * 英語のモールス符号と日本語のやつとで違うので注意
  * 変換のサイトは探せばいろいろある
    * https://morse.ariafloat.com/en/
    * https://morsecode.world/international/translator.html
* Flag
  * `PICOCTF{M0RS3C0D31SFUN2683824610}`
  * "Morse code is fun"

### Mr-Worldwide
* Solution
  * ぱっと見て、緯度と経度っぽい
  * Google検索するとちゃんと土地を示している
  * 適宜都市名を並べる（これが意外と絶妙にわからない...）
    * `Kamigyo Ward, Kyoto`
    * `Odesa`
    * `Dayton, Ohio`
    * `Istanbul`
    * `Abu Dhabi`
    * `Kuala Lumpur`
    * `_`
    * `Addis Ababa`
    * `Loja`
    * `Amsterdam`
    * `Sleepy Hollow, New York`
    * `Kodiak, Alaska`
    * `Alexandria`
* Flag
  * `picoCTF{KODIAK_ALASKA}`
