## Level1
### Q1.[Misc] Test Problem
* `cpaw{this_is_Cpaw_CTF}`を提出するだけ
* 基本的にこのように`cpaw{hogefugafoo}`というものを見つけていくことになる

### Q6.[Crypto] Classical Cipher
* Pythonでちょっとシーザー暗号を復号するコード書くだけ

### Q7.[Reversing] Can you execute ?
* `file`コマンド使う
* ELF形式(?)の実行可能ファイルだと分かる
* Ubuntu環境用意して、そこで`chmod +x`して実行してみる
  - alpineだと実行できないこともあるらしい

### Q8.[Misc] Can you open this file ?
* `file`コマンド使う
* よく読むと "Microsoft Office Word"と書いてある
* 拡張子を`.doc`にしてWordで開く

### Q9.[Web] HTML Page
* ソースを表示して、`cpaw`と検索

### Q10.[Forensics] River
* 画像のExif情報を確認すると言う問題
* 確認方法はいくつかある
  - [exiftool]( https://exiftool.org/ )をインストールしてterminalから確認
  - [EXIF確認君]( http://exif-check.org/ )

### Q11.[Network]pcap
* [Wireshark]( https://www.wireshark.org/ )でpcapファイルを眺めるだけ

### Q12.[Crypto] HashHashHash!
* Google先生に「ハッシュ SHA1 復号」と検索すると https://hashtoolkit.com/ などが見つかるので、復号できる
* Hash値と元の文字列は1対多の関係のはずなのに、復号できる雰囲気を醸し出しているのはどういうことなのだろう

### Q14.[PPC] 並べ替えろ!
* Pythonでちょっとソートしてstrとしてconcatするコードを書くだけ
