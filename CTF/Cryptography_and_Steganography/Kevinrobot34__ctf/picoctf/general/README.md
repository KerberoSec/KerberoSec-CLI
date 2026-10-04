# General Skills

## Basic
### Obedient Cat
* Solution
  * ファイルをダウンロードするとFlagがあるだけ
* Flag
  * `picoCTF{s4n1ty_v3r1f13d_4a2b35fd}`
  * "sanity verified"
  * 最後のランダム文字列的なやつは、定期的に出題側が書き換えているっぽいやつ

### First Grep
* Solution
  * grepしてみるだけ
* Flag
  * `picoCTF{grep_is_good_to_find_things_f77e0797}`
  * "grep is good to find things"

### plumbing
* Solution
  * netcatしてみるとたくさんなんか表示される
  * pipeでlessしたりgrepしてflagを探せば良いだけ
* Flag
  * `picoCTF{digital_plumb3r_ea8bfec7}`
  * "digital plumber"
  * "plumb"は「配管する」という動詞で、"plumber"は「配管工」という名詞
  * pipeにまつわる問題感を出している

## encoding関係
### Lets Warm Up
* Solution
  ```bash
  $ python -c "print(bytes.fromhex('70'))"
  b'p'
  ```
* Flag
  * `picoCTF{p}`

### Warmed Up
* Solution
  ```bash
  $ python -c "print(0x3D)"
  61
  ```
* Flag
  * `picoCTF{61}`

### 2Warm
* Solution
  ```bash
  $ python -c "print(bin(42))"
  0b101010
  ```
* Flag
  * `picoCTF{101010}`

### Bases
* Solution
  * base64でdecodeするだけ
  * pythonの[標準ライブラリbase64]( https://docs.python.org/ja/3/library/base64.html )を使っても良いし、以下のようにコマンドラインでやっても良い
    ```bash
    $ echo "bDNhcm5fdGgzX3IwcDM1" | base64 -d # cspell: disable-line
    ```
* Flag
  * `picoCTF{l3arn_th3_r0p35}`
  * "learn the ropes"

### Based
* Solution
  * 2進数/8進数/16進数表記で文字列が与えられるので、それぞれ復元してsubmitする
    * 2進数と16進数は分かりやすい
    * 8進数が分かりにくい
      * `141(8)`が`97(10)`で`a`に対応
      * `172(8)`が`122(10)`で`z`に対応
* Flag
  * `picoCTF{learning_about_converting_values_02167de8}`
  * "learning about converting values"

## Network関係
### what's a net cat?
* Solution
  * 以下のようにnetcatコマンドを使うだけ
    ```bash
    $ nc jupiter.challenges.picoctf.org 25103 
    ```
* Flag
  * `picoCTF{nEtCat_Mast3ry_d0c64587}`
  * "netcat mastery"

### Nice netcat...
* Solution
  * netcatで繋ぐと数字の羅列が出てくる
  * 明らかにasciiコードっぽいので、並べて見るだけ
* Flag
  * `picoCTF{g00d_k1tty!_n1c3_k1tty!_3d84edc8}`
  * "good kitty! nice kitty!"

### Magikarp Ground Mission
* Solution
  * sshしてinstanceに入って、置いてあるファイルを見ながらflagを探すだけ
* Flag
  * `picoCTF{xxsh_0ut_0f_\/\/4t3r_540e4e79}`

## Binary関係
### strings it
* Solution
  * 名前の通り、 `strings` コマンドをやってみるだけ
  * 出てくる情報が多いので `grep` かける
    ```bash
    $ strings ./strings | grep CTF
    YzOejwCTF3GVzbdb8PkOKp1cKvAwEUvRSOLLm1yFFETiT
    picoCTF{5tRIng5_1T_d66c7bb7}
    7Oqu9T7p8SAoQcOcQVHM46k1xpt1M6Iu2ag4dw1OFCTFRbv6
    ```
* Flag
  * `picoCTF{5tRIng5_1T_d66c7bb7}`
  * "Strings it"

### Static ain't always noise
