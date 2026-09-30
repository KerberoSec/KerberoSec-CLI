# PW CRACK 5
##### Tags: `Beginner picoMini 2022` `General Skills` `password_cracking` `hashing`
### DESCRIPTION
Can you crack the password to get the flag? Download the password checker [here](https://artifacts.picoctf.net/c/33/level5.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/33/level5.flag.txt.enc) and the [hash](https://artifacts.picoctf.net/c/33/level5.hash.bin) in the same directory too. Here's a [dictionary](https://artifacts.picoctf.net/c/33/dictionary.txt) with all possible passwords based on the password conventions we've seen so far.
### Hiểu đoạn code:
##### + Lần này là một danh sách dài được chứa trong file `dictionary.txt`, nếu brute force theo script của PW Crack 4 hoặc 3 thì sẽ rất lâu, nên ta sẽ xem lại source code một lần nữa để tìm ra giải pháp ngắn hơn:
```python
flag_enc = open('level5.flag.txt.enc', 'rb').read()
correct_pw_hash = open('level5.hash.bin', 'rb').read()

def hash_pw(pw_str):
    pw_bytes = bytearray()
    pw_bytes.extend(pw_str.encode())
    m = hashlib.md5()
    m.update(pw_bytes)
    return m.digest()

def level_5_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    user_pw_hash = hash_pw(user_pw)
    
    if( user_pw_hash == correct_pw_hash ):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")

```
##### + Như vậy nếu như mật khẩu ta nhập sau khi hash *Nếu đúng* với `correct_pw_hash` thì sẽ lấy được flag:
##### + Như vậy thay vì thay từng mật khẩu và trả về kết quả khi chương trình *không* in ra "That password is incorrect", ta sẽ so sánh trực tiếp các từ trong danh sách với giá trị hash đúng: 
```python
import hashlib
def hash_pw(pw_str):
    pw_bytes = bytearray()
    pw_bytes.extend(pw_str.encode())
    m = hashlib.md5()
    m.update(pw_bytes)
    return m.digest()
correct_pw_hash = open('level5.hash.bin', 'rb').read()

dictionary = open("dictionary.txt", "r").readlines()
for word in dictionary:
    word = word.strip()
    if hash_pw(word) == correct_pw_hash:
        print(word)
```
##### => Mật khẩu: `eee0`
##### + Flag: `picoCTF{h45h_sl1ng1ng_fffcda23}`
