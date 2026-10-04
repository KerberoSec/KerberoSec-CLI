# PW CRACK 2
##### Tags: `Beginner picoMini 2022` `General Skills` `password_cracking`
### DESCRIPTION
Can you crack the password to get the flag? Download the password checker [here](https://artifacts.picoctf.net/c/14/level2.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/14/level2.flag.txt.enc) in the same directory too.
### Hiểu đoạn code:
```python
def level_2_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    if( user_pw == chr(0x34) + chr(0x65) + chr(0x63) + chr(0x39) ):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")
```
##### + Như vậy nếu `user_pw` sẽ bằng với các ký tự ở vị trí tương ứng trong bảng Unicode.
##### + Viết một chương trình python để in ra các ký tự trên:
```python
user_pw = chr(0x34) + chr(0x65) + chr(0x63) + chr(0x39)
print(user_pw)
```
##### + Chạy chương trình trên để được mật khẩu: `4ec9`
##### + Như vậy, lấy flag thành công: `picoCTF{tr45h_51ng1ng_9701e681}`
