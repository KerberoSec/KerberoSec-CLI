# Level 3
##### Trong level này, mật khẩu cho level tiếp theo là một ciphertext được mã hóa theo Substitution cipher với các file mã hóa khác nhau nhằm giúp ta phân tích được tần suất xuất hiện của chữ cái, từ đó đưa ra được key chuẩn để lấy mật khẩu.
##### Viết một chương trình tên là `letterCount.py` với mục đích đếm tần suất từ xuất hiện và xếp theo thứ tự giảm dần:
```
$ python letterCount.py
Frequency of 's': 456
Frequency of 'q': 339
Frequency of 'j': 301
Frequency of 'u': 257
Frequency of 'b': 246
Frequency of 'n': 240
Frequency of 'c': 227
Frequency of 'g': 227
Frequency of 'd': 210
Frequency of 'z': 132
Frequency of 'v': 130
Frequency of 'w': 129
Frequency of 'm': 86
Frequency of 'y': 84
Frequency of 't': 75
Frequency of 'x': 71
Frequency of 'k': 67
Frequency of 'e': 64
Frequency of 'l': 60
Frequency of 'a': 55
Frequency of 'f': 28
Frequency of 'i': 19
Frequency of 'o': 12
Frequency of 'h': 4
Frequency of 'r': 4
Frequency of 'p': 2
```
##### Qua tần suất của các từ, ta dựa vào bảng tần suất xuất hiện của các từ Tiếng Anh ở [đây](./https://pi.math.cornell.edu/~mec/2003-2004/cryptography/subs/frequencies.html).
##### Sau một hồi dự đoán ta sẽ được key, và chạy nó cùng với file `krypton4`:
```
$ cat krypton4 | tr "[JDSQBKVIWGYUNCXM]" "[THEAOWLVDNPSRIFU]"
WELLD ONETH ELEVE LFOUR PASSW ORDIS ARUTE
```
-> Pass cho level 3 là `ARUTE`
