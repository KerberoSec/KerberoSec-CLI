# fixme2.py
##### Tags: `Beginner picoMini 2022` `General Skills` `Python`
### DESCRIPTION
Fix the syntax error in this Python script to print the flag. [Download Python script](https://artifacts.picoctf.net/c/6/fixme2.py)
##### Một series về sửa các lỗi trong file python để chạy được chương trình, từ đó lấy được flag cho challenge.
```
$ ls -la fixme2.py
-rw-r--r-- 1 hoang hoang 1029 Feb 28 10:34 fixme2.py

$ chmod +x fixme2.py
                                                                                            
$ python fixme2.py
  File "/home/hoang/Downloads/fixme2.py", line 22
    if flag = "":
       ^^^^^^^^^
SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?
```
##### + Lỗi này xảy ra khi chỉ sử dụng `=` thay vì `==` cho phần if else. Vào file với lệnh `nano` và sửa lại.
```
$ python fixme2.py
That is correct! Here's your flag: picoCTF{3qu4l1ty_n0t_4551gnm3nt_f6a5aefc}
```
##### => Lấy flag thành công!
