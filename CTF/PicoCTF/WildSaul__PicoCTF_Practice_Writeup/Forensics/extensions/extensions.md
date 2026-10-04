# extensions
##### Tags: `picoCTF 2019` `Forensics`
### DESCRIPTION
This is a really weird text file [TXT](https://jupiter.challenges.picoctf.org/static/e7e5d188621ee705ceeb0452525412ef/flag.txt)? Can you find the flag?
##### Một challenge liên quan đến thay đổi định dạng file phù hợp
##### Đầu tiên, kiểm tra loại của file:
```
$ file flag.txt              
flag.txt: PNG image data, 1697 x 608, 8-bit/color RGB, non-interlaced
```
##### Dù là file `.txt` nhưng khi kiểm tra lại trả về kết quả giống với file `.png`.
##### Thay đổi file thành định dạng `.png`
```
$ mv flag.txt > flag.png
```
##### => Vào xem ảnh sẽ hiện flag. Lấy flag thành công!
