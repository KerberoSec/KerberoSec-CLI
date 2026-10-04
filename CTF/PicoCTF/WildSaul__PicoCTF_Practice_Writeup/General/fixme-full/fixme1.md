# fixme1.py
##### Tags: `Beginner picoMini 2022` `General Skills` `Python`
### DESCRIPTION
Fix the syntax error in this Python script to print the flag. [Download Python script](https://artifacts.picoctf.net/c/25/fixme1.py)
##### Một series về sửa các lỗi trong file python để chạy được chương trình, từ đó lấy được flag cho challenge.
```
$ ls -la fixme1.py                     
-rw-r--r-- 1 hoang hoang 837 Feb 28 10:24 fixme1.py
$ chmod +x fixme1.py
$ python fixme1.py
File "/home/hoang/Downloads/fixme1.py", line 20
    print('That is correct! Here\'s your flag: ' + flag)
IndentationError: unexpected indent                 
```
##### + Lỗi này xảy ra khi tab vị trí sai
##### Vào file sử dụng lệnh `nano fixme1.py`, xóa khoảng trắng trước dòng print và chạy lại chương trình:
```
$ python fixme1.py
That is correct! Here's your flag: picoCTF{1nd3nt1ty_cr1515_6a476c8f}
```
##### => Lấy flag thành công!
