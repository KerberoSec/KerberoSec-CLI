## findme

[Link to challenge](https://play.picoctf.org/practice/challenge/349)

Write-up:

1. We are told to submit `test:test` as credentials. Attempting it, we get `try username:test and password:test!`

2. Trying `test:test!` and anaylzing the request shows us a `GET /next-page/id=cGljb0NURntwcm94aWVzX2Fs`.
Forwarding it gets us a `GET /next-page/id=bF90aGVfd2F5X2EwZmUwNzRmfQ==`, and forwarding this
gets us a `GET /home`.

3. The second request looks like the end of a b64 string, and decoding it shows us `l_the_way_a0fe074f}`,
which looks like the end of the flag. Decoding the first request gets us the beggining
of the flag: `picoCTF{proxies_al` <br>
Flag: **picoCTF{proxies_all_the_way_a0fe074f}**
