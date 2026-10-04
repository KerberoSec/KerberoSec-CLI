## Level2
### Q13.[Stego] 隠されたフラグ
* 画像を開くと左上と右下にモールス信号みたいのがある
* https://morse.ariafloat.com/en/　に打ち込んでdecodeする

### Q15.[Web] Redirect
* リダイレクトのされ方に注目せよと書いてあるので、とりあえずcurlしてHTTPリクエスト・レスポンスを確認する
  ```bash
  $ curl -v http://q15.ctf.cpaw.site  
  ```
* `X-Flag` というヘッダーがなんかある

### Q16.[Network+Forensic] HTTP Traffic
* pcapファイルをwiresharkで開く
  - webページを見ていたらしいので、HTTPのところを見てみる
  - response bodyを眺める
    - htmlの部分をみると、「フラグが欲しかったら下のボタンを押すんだ！！」と書いてある
    - 画像がhtmlの中で読み込まれてることがわかる
      - 画像のresponseを見てみると横浜の夜景
    - ボタンを押すとjavascriptが動くっぽいことがわかる
    - javascriptを眺める
      - `eval(hogehoge)`となってるのでローカル実行環境でやってみる
      - なんか長い文字列が表示される
      - よく見るとこれもjavascript
      - なんかbase64で画像を返してる
      - base64からデコードするサイト( https://rakko.tools/tools/71/ )に貼り付ける
      - フラグ入り画像だ！！！

### Q17.[Recon] Who am I ?
* 「porisuteru」や「スペシャルフォース2」でGoogle検索
* 上記アカウントが何か呟いてないかを探す

### Q18.[Forensic] leaf in forest
* 拡張子のついてない`misc100`というファイルなので、とりあえず `file` してみる
  ```bash
  $ file misc100
  misc100: pcap capture file, microsecond ts (little-endian) - version 0.0 (linktype#1768711542, capture length 1869357413)
  ```
  - なんかpcapファイルらしいけど、`version 0.0`でwiresharkじゃ開けない
* とりあえずファイルをvim開いてみると連続する `lovelive!` の中になんか3連続の大文字などが含まれてる
* pcapファイルなので前後にバイナリ文字も入ってるのでそれは消してみる
* `cat misc100_2 | sed 's/lovelive!//g' | sed 's/[lovelive!]//g' `
  - 初めのsedで`lovelive!`という文字列を削除
  - 次のsedで`lovelive!`の各文字を削除
* 求めるフラグっぽいのが見える！

### Q19.[Misc] Image!
* zipを解答して中を見てみる
  - thumbnailの画像見るとフラグっぽいのがあるけど、微妙に見れない
  - 中をいろいろみると、OpenDocumentとかWordっぽい感じがする
* zipを.docに変更して開いてみると、フラグが！

### Q20.[Crypto] Block Cipher
* 与えられたC言語のファイルを読み解く
  - 第一引数に`flag`文字列を、第二引数に`key`の整数を渡す
  - `flag`を`key`文字ずつのブロックに分割して、ひっくり返して出力する暗号とわかる
    - 例えば`abcd 4`を引数に渡したら、`cpaw{dcba}`を返す的な
  - もう一度このファイルを適用すれば元に戻ることがわかるので以下を実行
    ```bash
    $ gcc crypto100.c
    $ ./a.out ruoYced_ehpigniriks_i_llrg_stae 4
    ```

### Q21.[Reversing] reversing easy!

### Q22.[Web] Baby's SQLi: Stage 1-
* Select文投げてみるだけ

### Q28.[Network] Can you login？
