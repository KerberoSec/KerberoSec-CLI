> Mục tiêu: Appointment là một target chủ yếu tập trung vào **hướng ứng dụng web** (web-application oriented). Trong demo này, tập trung vào sử dụng **SQL Injection** tấn công vào database SQL.
### 1. Thu thập thông tin target
###### IP: 10.129.251.46
##### + Kiểm tra kết nối:
` ping 10.129.251.46 `
##### + Kiểm tra cổng và dịch vụ
` sudo nmap -sC -sV 10.129.251.46 `
###### -sC: thực hiện scan với script mặc định
##### => port 80/tcp: htpt: Apache httpd server version 2.4.38
###### Apache HTTP Server là app dùng để chạy trang web trên cả server vật lý và ảo, thường chạy trên port 80 tcp và 443 tcp
##### + Truy cập trang web với địa chỉ http://10.129.251.46:80
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/40e359a5-3266-4da8-ab71-05e2761fcecf)
##### + Đây là một trang web với giao diện đăng nhập.
### 2. Tấn công
##### + Một số phương pháp tấn công nhằm qua mặt bước xác thực danh tính người dùng:
#### BruteForce Url:
##### + Sử dụng *gobuster*, một tool chuyên dụng để tự động hóa tìm kiếm các thư mục có sẵn dựa trên danh sách cung cấp:
` gobuster dir --url http://10.129.251.46:80/ --wordlist gobusterWord.txt `
###### tải và lấy danh sách: https://github.com/OJ/gobuster
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/578013d7-3005-4d5e-9ca3-6c94a3e40939)
##### => Có các địa chỉ khác nhưng đều hiện code 301: bị chuyển hướng về trang login do chưa xác thực người dùng.
#### BruteForce tên và mật khẩu (thủ công)
###### Chưa cần sử dụng bruteforce tự động vì không phải là mục tiêu của bài này.  
##### + Thử các cặp username:pass phổ biến: *admin:admin; guest:guest; user:user; root:root...*
##### => Không thành công
#### SQL Injection
##### Phần login của trang web có lỗ hổng với lệnh SQL khi lệnh để kiểm tra input của người dùng liên kết trục tiếp với database:
` SELECT * FROM users WHERE username=’admin’ AND password=’admin123321’ `
##### Vì vậy, khi điền vào phần đăng nhập admin' ## ; database sẽ nhận như sau:
` SELECT * FROM users WHERE username=’admin'##’ AND password=’admin123321’ `
###### Theo như quy tắc của SQL, ## có nghĩa là phần phía sau (yêu cầu mật khẩu) sẽ được *comment* lại và không được dùng để xác thực mật khẩu, hay như đoạn code sẽ cho người dùng đăng nhập vào tài khoản admin (nếu có) khi ghi tên đúng.
##### Đăng nhập thành công!
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/afc4a323-3860-4bf5-ab22-5822d4562ac9)
> ***Về phần Brute Force tự động và Kiểm tra xem trang web có SQL injection không bằng BurpSuite sẽ được mình làm sau.
