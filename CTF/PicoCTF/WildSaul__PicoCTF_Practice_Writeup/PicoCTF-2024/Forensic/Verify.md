# Verify
##### Tags: `Forensics` `browser_webshell_solvable` `checksum` `grep`
### DESCRIPTION
People keep trying to trick my players with imitation flags. I want to make sure they get the real thing! I'm going to provide the SHA-256 hash and a decrypt script to help you know that my flags are legitimate. You can download the challenge files here: [challenge.zip](https://artifacts.picoctf.net/c_rhea/23/challenge.zip)
##### Đầu tiên, sử dụng checksum có trong file `.txt` để so sánh với một đống file trong folder `Files`
```
$ sha256sum files/* | grep b09c99c555e2b39a7e97849181e8996bc6a62501f0149c32447d8e65e205d6d2
```
#### Sau khi được file có hashsum giống, sử dụng script `decrypt.py` với syntax như sau:
```
$ decrypt.py files/<filename>
```
##### => Lấy flag thành công!
