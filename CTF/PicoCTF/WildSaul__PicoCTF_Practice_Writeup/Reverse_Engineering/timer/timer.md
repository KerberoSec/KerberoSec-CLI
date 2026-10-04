# timer
##### Tags: `picoCTF2023` `Reverse Engineering` `android`
### DESCRIPTION
You will find the flag after analysing this apk Download [here](https://artifacts.picoctf.net/c/449/timer.apk).
### Hiểu file tải về:
##### + Kiểm tra file:
```
$ file timer.apk
timer.apk: Android package (APK), with zipflinger virtual entry, with APK Signing Block
```
##### + Biết đây là một package Android, được tối ưu nén với `zipflinger` và sử dụng chữ ký số hóa để đảm bảo tính chính xác và xác thực của ứng dụng.
##### + Đối với các file ứng dụng, ta sẽ decomplie file ra để xem source code, qua đó kiểm tra được ứng dụng.
##### + Sử dụng `apktool`
```
  $ apktool d timer.apk
Picked up _JAVA_OPTIONS: -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true
I: Using Apktool 2.7.0-dirty on timer.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: /home/hoang/.local/share/apktool/framework/1.apk
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Baksmaling classes3.dex...
I: Baksmaling classes2.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...

  $ ls

  $ cd timer

  $ ls
AndroidManifest.xml  apktool.yml  kotlin  original  res  smali  smali_classes2  smali_classes3
  
```
##### + flag nằm cuối file apktool.yml
##### => Lấy flag thành công!
