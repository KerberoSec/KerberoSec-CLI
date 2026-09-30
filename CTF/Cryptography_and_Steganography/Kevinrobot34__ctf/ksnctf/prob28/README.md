## ksnctf

### Lo-Tech Cipher60 points
https://ksnctf.sweetduet.info/problem/28

* keywords
  - Crypt, Visual
* 解法
  - Visual Cryptography
  - まず与えられたzipを解凍する
    ```bash
    $ unzip secret.zip
    Archive:  secret.zip
    inflating: share1.png              
    inflating: share2.png   
    $ ls
    secret.zip share1.png share2.png
    ```
  - この二つの画像をXor取ってみる
    - "The last share is hidden in the ZIP"
    - !?!?!?!
  - 試しにfileコマンドする
    ```bash
    $ file secret.zip
    secret.zip: PNG image data, 640 x 480, 8-bit/color RGBA, non-interlaced
    ```
    - 普通のzipなら `test.zip: Zip archive data, at least v2.0 to extract` みたいな感じのはず
    - こいつ自身が画像らしい
  - よく分からんけど、こいつ含めて３枚を読み込んでxor
    - FLAGゲット！