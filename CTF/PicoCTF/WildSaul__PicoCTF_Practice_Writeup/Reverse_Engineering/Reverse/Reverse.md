# REVERSE
##### Tags: `picoCTF2023` `Reverse Engineering`
### DESCRIPTION
Try reversing this [file](https://artifacts.picoctf.net/c/274/ret)? Can ya? I forgot the password to this file. Please find it for me?
### Hiểu file tải về:
##### + Kiểm tra file + cấp quyền thực thi cho file:
```
$ file ret
ret: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=7f12d7198b75bd4d9f159e7a45141d4f13836e51, for GNU/Linux 3.2.0, not stripped
$ chmod +x ret
$ ./ret
Enter the password to unlock this file: ...
You entered: ...
Access denied
```
##### + Biết đây là file thực thi, kiểm tra source với hexdump:
```
$ hexdump -C ret | grep -i pico
000011e0  45 f8 31 c0 48 b8 70 69  63 6f 43 54 46 7b 48 ba  |E.1.H.picoCTF{H.|
00002060  20 73 65 65 20 66 6c 61  67 3a 20 70 69 63 6f 43  | see flag: picoC|
$ hexdump -C ret | grep 20
...
00002040  20 25 73 0a 00 00 00 00  50 61 73 73 77 6f 72 64  | %s.....Password|
00002050  20 63 6f 72 72 65 63 74  2c 20 70 6c 65 61 73 65  | correct, please|
00002060  20 73 65 65 20 66 6c 61  67 3a 20 70 69 63 6f 43  | see flag: picoC|
00002070  54 46 7b 33 6c 66 5f 72  33 76 33 72 35 69 6e 67  |TF{3lf_r3v3r5ing|
00002080  5f 73 75 63 63 65 35 35  66 75 6c 5f 66 61 39 63  |_succe55ful_fa9c|
00002090  62 33 62 31 7d 00 41 63  63 65 73 73 20 64 65 6e  |b3b1}.Access den|
000020a0  69 65 64 00 01 1b 03 3b  40 00 00 00 07 00 00 00  |ied....;@.......|
```
##### + Sử dụng số 20 để xem đoạn sau tính từ pico vì tất cả đều nằm liền nhau trên cột địa chỉ `000020xx`.
##### => Lấy flag thành công: `picoCTF{3lf_r3v3r5ing_succe55ful_fa9cb3b1}`
