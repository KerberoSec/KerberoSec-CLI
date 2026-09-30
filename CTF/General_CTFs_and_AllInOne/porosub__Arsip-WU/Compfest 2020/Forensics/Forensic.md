# Forensic

## Daftar isi : 
| Forensik  |
| ------------- |
| [Kyu Are](#1-kyu-are-877-pts)|

## 1. Kyu Are (877 pts)
### Soal :  
Kyu Are?
The password for the zip file is: b10b834a845fc4a65cf9b3676

Download link:
https://drive.google.com/file/d/1yD49OIuZ-gXEJ2wd0GTom9apkAegMRmB/view?usp=sharing

### Pembahasan : 
Ekstrak file zip lalu di dalamnya terdapat 9 file avi (audio video interleave) yang berisi qr code. Diasumsikan bahwa kita harus mengekstrak setiap frame dari file avi tersebut lalu decode dengan qr code reader. Tools yang akan digunakan adalah [ffmpeg](https://ffmpeg.org/) untuk mengekstrak tiap frame dan [zbarimg](http://manpages.ubuntu.com/manpages/bionic/man1/zbarimg.1.html) untuk mendecode qr code. 

```bash
#!/bin/bash

mkdir frame

# Mengekstrak setiap frame di dalam file avi
for i in *.avi; do
	ffmpeg -i $i ./frame/$i%03d.png
done

# mendecode frame qr code lalu disimpan di qr-code.txt
zbarimg ./frame/* >> qr-code.txt
# mencari flag {
cat qr-code.txt |grep COMPFEST12{

rm -r frame    
```

<details>
<summary>Tekan untuk melihat flag</summary>
COMPFEST12{kyu4r31337_318bc0}
</details>
