# STRINGS IT
##### Tags: `picoCTF 2019` `General Skills`
### DESCRIPTION
Can you find the flag in [file](https://jupiter.challenges.picoctf.org/static/5bd86036f013ac3b9c958499adf3e2e2/strings) without running it?
##### Một bài nữa về kiểm tra file và sử dụng các lệnh để xem nội dung file
```
$file strings
strings: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=047a5079a5f563cd0e540d28f42a37161093ffda, not stripped
$ chmod +x strings
$ ./strings
Maybe try the 'strings' function? Take a look at the man page
```
##### + Khi chạy thử chương trình yêu cầu chạy thử lệnh strings. Có thể xem qua cách sử dụng với lệnh `man strings`
```
Đây là một lệnh để in ra các ký tự đọc được trong một file thực thi (binary file)
```
##### + Sử dụng lệnh `strings` cùng với `grep` để xem thử xem có flag không:
```
$ strings strings | grep pico
picoCTF{5tRIng5_1T_827aee91}
```
##### => Lấy flag thành công!
