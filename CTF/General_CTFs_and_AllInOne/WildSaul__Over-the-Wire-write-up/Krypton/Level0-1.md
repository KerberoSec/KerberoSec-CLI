# Level 0
##### Giải mã đoạn chuỗi trang chủ cho để lấy mật khẩu vào level 1:
```
$ echo "S1JZUFRPTklTR1JFQVQ=" | base64 -d
KRYPTONISGREAT
```
-> Pass cho level 1 là `KRYPTONISGREAT`
# Level 1
> user: krypton1    pass: KRYPTONISGREAT
##### Đăng nhập, đọc file README trong `/krypton/krypton1`:
```
...The first level is easy.  The password for level 2 is in the file 
'krypton2'.  It is 'encrypted' using a simple rotation called ROT13...
```
##### Đây là mã hóa `ROT13`. Giải mã file `krypton2`:
```
$ cat krypton2 | tr 'a-zA-Z' 'n-za-mN-ZA-M'
LEVEL TWO PASSWORD ROTTEN
```
-> Pass cho level 2 là `ROTTEN`.

