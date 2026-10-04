# Big Zip
##### Tags: `picoGymExclusive` `General Skills`
### DESCRIPTION
Unzip this archive and find the flag.
[Download zip file](https://artifacts.picoctf.net/c/505/big-zip-files.zip)
##### Một bài nữa về tìm kiếm dữ liệu trong vô vàn file và thư mục.
```
$ unzip big-zin-files.zip
$ find /home/hoang/Downloads/big-zip-files -type f -name '*.txt' -exec grep pico  {} +

/home/hoang/Downloads/big-zip-files/folder_pmbymkjcya/folder_cawigcwvgv/folder_ltdayfmktr/folder_fnpfclfyee/whzxrpivpqld.txt:information on the record will last a billion years. Genes and brains and books encode picoCTF{gr3p_15_m4g1c_ef8790dc}
                                   
```
##### => Lấy flag thành công: `picoCTF{gr3p_15_m4g1c_ef8790dc}`
##### + Giải thích lệnh `-exec grep pico {} +`:
```
-exec: cụ thể lệnh nào được thực thi
grep pico: tìm dòng lệnh nào chứa format 'pico'
{}: 'giữ chỗ cho các file tìm được bởi lệnh find', mỗi file được tìm thấy sẽ thay thế cho {} trong quá trình thực thi lệnh 'grep'
+: nói với lệnh 'find' rằng thực thi lệnh 'grep' với nhiều file tìm thấy nhất có thể thay vì 'grep' từng file một. Có ích khi xử lý số lượng file lớn.
```
