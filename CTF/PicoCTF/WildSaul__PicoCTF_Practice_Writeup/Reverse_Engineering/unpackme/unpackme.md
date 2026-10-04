> UNPACKME.PY
##### Tags: `PicoCTF 2022` `Reverse Engineering` `packing`
### DESCRIPTION
Can you get the flag? Reverse engineer this [Python program](https://artifacts.picoctf.net/c/50/unpackme.flag.py).
### Hiểu Code
##### + Đây là một chương trình sử dụng *Fernet* để đóng gói đoạn code thành một chuỗi ký tự được mã hóa và sau đó chạy chương trình:
```python
import base64
from cryptography.fernet import Fernet

payload = b'gAAAAABkzWGWvEp8gLI9AcIn5o-ahDUwkTvM6EwF7YYMZlE-_Gf9rcNYjxIgX4b0ltY6bcxKarib2ds6POclRwCwhsRb1LOXVt4Q3ePtMY4BmHFFZlIHLk05CjwigT7hiI9p3sH9e7Cpk1uO90xbHbuy-mfi3nkmn411aBgwxyWpJvykpkuBIG_nty6zbox3UhbB85TOis0TgM0zG4ht0-GUW4wTq2_5-wkw3kV1ZAisLJHzF-Z9oLMmwFZU0UCAcHaBTGDF5BnVLmUeCGTgzVLSNn6BmB61Yg=='
key_str = 'correctstaplecorrectstaplecorrec'
key_base64 = base64.b64encode(key_str.encode())
f = Fernet(key_base64)
plain = f.decrypt(payload)
exec(plain.decode())
```
##### + Hiểu đơn giản thì các bước để ra được một chương trình python trong file này như sau: sử dụng `key_str` được *base64* để làm key cho Fernet, key này được dùng để giải mã `payload` thành một `plain`, sau đó sử dụng lệnh `exec` để chạy đoạn plain đó.
##### => `plain` chính là source code của chương trình.
##### + Comment dòng exec sử dụng `#` và thêm lệnh `print(plain)`:
```python
import base64
from cryptography.fernet import Fernet

payload = b'gAAAAABkzWGWvEp8gLI9AcIn5o-ahDUwkTvM6EwF7YYMZlE-_Gf9rcNYjxIgX4b0ltY6bcxKarib2ds6POclRwCwhsRb1LOXVt4Q3ePtMY4BmHFFZlIHLk05CjwigT7hiI9p3sH9e7Cpk1uO90xbHbuy-mfi3nkmn411aBgwxyWpJvykpkuBIG_nty6zbox3UhbB85TOis0TgM0zG4ht0-GUW4wTq2_5-wkw3kV1ZAisLJHzF-Z9oLMmwFZU0UCAcHaBTGDF5BnVLmUeCGTgzVLSNn6BmB61Yg=='
key_str = 'correctstaplecorrectstaplecorrec'
key_base64 = base64.b64encode(key_str.encode())
f = Fernet(key_base64)
plain = f.decrypt(payload)
#exec(plain.decode())
print(plain)
```
##### + Chạy chương trình:
```
python3 unpackme.flag.py
b"\npw = input('What\\'s the password? ')\n\nif pw == 'batteryhorse':\n  print('picoCTF{175_chr157m45_85f5d0ac}')\nelse:\n  print('That password is incorrect.')\n\n"
```
##### => Lấy được flag thành công! `picoCTF{175_chr157m45_85f5d0ac}`
