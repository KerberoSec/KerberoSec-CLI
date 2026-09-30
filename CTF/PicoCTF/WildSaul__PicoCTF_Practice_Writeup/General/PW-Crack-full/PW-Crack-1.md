> PW CRACK 1
##### Tags: 'Beginner picoMini 2022` `General Skills` `password_cracking`
### DESCRIPTION:
Can you crack the password to get the flag? Download the password checker [here](https://artifacts.picoctf.net/c/12/level1.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/12/level1.flag.txt.enc) in the same directory too.
### Hiểu đoạn code:
```python
def level_1_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    if( user_pw == "8713"):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")
```
##### => Như vậy mật khẩu đúng để chạy chương trình giải mã flag: `8713`
##### + Flag: `picoCTF{545h_r1ng1ng_1b2fd683}`
