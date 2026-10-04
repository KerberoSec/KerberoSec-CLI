## GENERAL / ENCODING
### ASCII
Pythonだと[chr]( https://docs.python.org/ja/3/library/functions.html#chr )と[ord]( https://docs.python.org/ja/3/library/functions.html#ord )で変換できる

### HEX
16進数の文字列をbyte列に変換する方法はいくつかやり方がある

1. PyCryptodomeの[Crypto.Util.number.long_to_bytes]( https://pycryptodome.readthedocs.io/en/latest/src/util/util.html#Crypto.Util.number.long_to_bytes )
    * long_to_bytesのinputは整数なので、[int]( https://docs.python.org/ja/3/library/functions.html#int )かけるなり、`0xff`として整数リテラルで定義しておくなりの対応が必要
2. 標準ライブラリの[bytes.fromhex]( https://docs.python.org/ja/3/library/stdtypes.html#bytes.fromhex )
    * 16進数表示の文字列がinput
3. 自力で[chr]( https://docs.python.org/ja/3/library/functions.html#chr )でやる

### Base64
標準ライブラリの[base64.b64encode]( https://docs.python.org/ja/3/library/base64.html#base64.b64encode )を使うだけ