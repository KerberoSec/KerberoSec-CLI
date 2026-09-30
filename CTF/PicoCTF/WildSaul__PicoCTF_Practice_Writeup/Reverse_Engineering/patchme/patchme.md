# PATCHME.PY
##### Tags: `picoCTF 2021` `Reverse Engineering`
### DESCRIPTION
##### Can you get the flag? Run this [Python program](https://artifacts.picoctf.net/c/200/patchme.flag.py) in the same directory as this [encrypted flag](https://artifacts.picoctf.net/c/200/flag.txt.enc).
### Hiểu đoạn code:
##### + Chạy thử file patchme.flag.py:
```
$ chmod +x patchme.flag.py
$ python3 patchme.flag.py
Please enter correct password for flag: exit    
That password is incorrect
```
##### + Như vậy yêu cầu mật khẩu cho flag, ta xem trong đoạn code trong file:
```python
def level_1_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    if( user_pw == "ak98" + \
                   "-=90" + \
                   "adfjhgj321" + \
                   "sleuth9000"):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), "utilitarian")
        print(decryption)
        return
    print("That password is incorrect")
```
##### => Có đoạn kiểm tra mật khẩu và nếu mật khẩu đúng sẽ giải mã flag cho người dùng:
```
$ python3 patchme.flag.py
Please enter correct password for flag: ak98-=90adfjhgj321sleuth9000
Welcome back... your flag, user:
picoCTF{p47ch1ng_l1f3_h4ck_c4a4688b}
```
##### => Lấy flag thành công!
