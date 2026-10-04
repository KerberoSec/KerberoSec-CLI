## ksnctf

### Basic is secure? 50pt
https://ksnctf.sweetduet.info/problem/8

* keywords
  - Network、Basic認証
* 解法
  - pcapファイルを開いてみる
  - HTTPで通信しているっぽい
  - 初めのHTTP streamを見てみると `401 Authorization Required`
    - レスポンスheaderに `WWW-Authenticate: Basic realm="Secret"`
    - Basic認証が必要であることを示している
  - 次にレスポンスが200のHTMLを見ると `The flag is q8's password.` と書いてある
    - その前のリクエストを見ると `Authorization: Basic ...` がある
    - これがbasic認証の `{username}:{password}` をbase64エンコードしたもの
    - wiresharkであれば直下に `Credentials q8:FLAG_...` と書いてあるのでこれをコピペでもOK
    - もしくは上記Basicの後の文字列を `$ basic -d {...}` としてデコード
