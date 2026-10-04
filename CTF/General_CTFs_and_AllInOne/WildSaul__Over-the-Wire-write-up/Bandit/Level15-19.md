# Level 15: 19
### Level 15
###### User: *bandit15* ; Password: *jN2kgmIXJ6fShzhT2avhotn4Zcka6tnt*
```
echo 'jN2kgmIXJ6fShzhT2avhotn4Zcka6tnt' | openssl s_client -ign_eof -connect localhost:30001
```
###### openssl s_client: sử dụng để tạo SSL/TLS connections đến với server
###### -ign_eof: tiếp tục in kết quả kể cả khi gặp end-of-file
###### localhost:30001 lấy key cho lv tiếp theo bằng nộp password của lv hiện tại đến cổng 30001 sử dụng SSL encryption)
##### + Key: `JQttfApK4SeyHwDlI9SXGR50qclOAil1`

### Level 16
###### User: *bandit16* ; Password: *JQttfApK4SeyHwDlI9SXGR50qclOAil1*
```
nmap --script ssl-enum-ciphers -p 31000-32000 localhost
```
##### --script ssl-enum-ciphers: xem port nào sử dụng ssl
##### -p 31000-32000 : port trong khoảng 31000 đến 32000
```
echo ‘key lấy được từ lv15’ | openssl s_client -ign_eof -connect localhost:31790
```
##### + Lấy được RSA PRIVATE KEY
```
cd ../.. ; cd /tmp; mkdir keykey; cd keykey; nano key; copy-paste RSA PRIVATE KEY 
```
###### cả 2 dòng begin và end
```
ssh bandit17@localhost -p 2220 -i key
```

### Level 17
##### Kết nối như level 16:
```
ssh bandit17@localhost -p 2220 -i key
```
```
diff passwords.old passwords.new
```
###### key là line duy nhất trong passwords.new khác biệt với passwords.old
##### + Key: `hga5tuuCLF6fFzUpnagiMN8ssu9LFrdg`

### Level 18
###### User: *bandit18* ; Password: *hga5tuuCLF6fFzUpnagiMN8ssu9LFrdg*
```
ssh bandit18@bandit.labs.overthewire.org -p 2220 bash --noprofile --norc
hoặc
ssh bandit18@bandit.labs.overthewire.org -p 2220 /bin/bash
```
##### Máy target bị mod file bashrc để log out khi log in
```
cat readme
```
##### + Key: `awhqfNnAbc1naukrpqDYcF95h7HoMTrC`

### Level 19
###### User: *bandit19* ; Password: *awhqfNnAbc1naukrpqDYcF95h7HoMTrC*
```
ls -la; whoami
./bandit20-do 
```
###### sử dụng lệnh này sẽ cho phép thực thi lệnh dưới dạng user khác
###### Xem thêm về quyền SUID ở [đây](https://linuxhandbook.com/suid-sgid-sticky-bit/)
```
$ ./bandit20-do whoami 
bandit20
$ ./bandit20-do cat /etc/bandit_pass/bandit20
```
###### xem key cho lv20 ; chỉ user bandit20 và 21 xem được.
##### + Key: `VxCazJaVykI6W36BkBU0mJTCM8rR95XT`
