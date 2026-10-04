> Trong target này sẽ tập trung vào việc config lỏng lẻo FTP và quyền login của admin cho website.
### 1. Tìm kiếm thông tin 
###### IP: 10.129.1.15
##### Kiểm tra cổng và dịch vụ:
` sudo nmap -sC -sV 10.129.1.15 `
##### => 21/tcp service ftp: 
###### FTP: protocol tiêu chuẩn để truyền file
##### => 80/tcp service apache: web app
##### + Như ở tier 0, cấu hình lỏng lẻo khi set up ftp sẽ có tài khoản *anonymous* 
```
# ftp 10.129.1.15
Connected to 10.10.129.1.15
220 (vsFTPd 3.0.3)
Name (10.129.1.15:hoang): anonymous
230 Loign successful.
...
ftp>
```
##### + Tiến hành tìm kiếm file trên server ftp:
```
ftp> dir
...
-rw-r--r-- 1 ftp    ftp     33 Jun 08 2021 allowed.userlist
-rw-r--r-- 1 ftp    ftp     62 Apr 20 2021 alllowed.userlist.passwd
226 Directory send OK.
ftp> get allowed.userlist
...
ftp> get allowed.userlist.passwd
```
##### => Kéo được 2 file về máy chủ
##### + Xem thông tin file sẽ thấy được thông tin người dùng và mật khẩu
` cat allowed.userlist ; cat allowed.userlist.passwd `
##### + Thử sử dụng *admin:password* để đăng nhập ftp, nhưng nhận được thông báo *chỉ tài khoản ẩn danh có thể đăng nhập*. Vì vậy ta truy cập vào trang web tìm kiếm trang login để bypass xác thực.
` http://10.129.1.15:80 `
#####
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/6c3239aa-4a1f-490e-a0e0-6c1d530b4ba5)
##### + Sử dụng Wappalyzer, *một extension cho trình duyệt sử dụng để xem các công nghệ, ngôn ngữ được sử dụng để build web*.
##### => Thấy trang web được xây dựng dựa trên PHP và HTML
###### Link wappalyzer: https://www.wappalyzer.com/
##### + Vì truy cập địa chỉ IP chỉ cho ta vào phần trang chủ, bruteforce các thư mục con bằng Gobuster để tìm kiếm trang login:
` gobuster dir --url http://10.129.1.15:80/ --wordlist /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -x php,html `
###### -url: link của website
###### --wordlist: danh sách các từ khóa để bruteforce
###### -x: định dạng của file (trong trường hợp này là html và php để tìm trang login)
###### => tìm thấy login.php, truy cập với địa chỉ:
` http://10.125.1.15/login.php `
##### + Sử dụng tài khoản amdin và mật khẩu tương ứng để đăng nhập: 
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/e051dc2a-3932-4e03-9e01-cbbac6953599)
