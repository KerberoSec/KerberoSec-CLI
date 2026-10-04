# Matryoshka dolls
##### Tags: `picoCTF 2021` `Forensics`
### DESCRIPTION
Matryoshka dolls are a set of wooden dolls of decreasing size placed one inside another. What's the final one? Image: [this](https://mercury.picoctf.net/static/1b70cffdd2f05427fff97d13c496963f/dolls.jpg)
##### Đây là một chanllenge liên quan đến kỹ thuật giấu tin (steganography). Trong thử thách này dường như có một file nào đó được giấu bên trong bức ảnh.
##### Sử dụng lệnh `unzip` để unzip các file:
```
$ unzip dolls.jpg                             
Archive:  dolls.jpg
warning [dolls.zip]:  272492 extra bytes at beginning or within zipfile
  (attempting to process anyway)
  inflating: base_images/2_c.jpg

...

$ unzip base_images/4_c.jpg 
Archive:  base_images/4_c.jpg
warning [base_images/4_c.jpg]:  79578 extra bytes at beginning or within zipfile
  (attempting to process anyway)
  inflating: flag.txt  

$ cat flag.txt
picoCTF{bf6acf878dcbd752f4721e41b1b1b66b}
```
##### => Lấy flag thành công!
