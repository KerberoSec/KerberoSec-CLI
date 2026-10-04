> Đây là một điểm khởi đầu của HTB với các target được tạo ra để làm quen với kỹ thuật pentest và hình thức thi CTF.
### 1. Set up môi trường
##### + máy ảo (Kali Linux).
##### + profile VPN (tải về từ trên HTB): *Bắt buộc để khởi động target machine.*
##### + Vào thư mục Downloads: *tên profile vpn có thể khác*
` sudo openvpn starting_point_hoangdv_ovpn `
##### + Khởi động máy ảo trên HTB.
###### IP: 10.129.210.52
##### + Kiểm tra tình trạng của target. 
` ping 10.129.210.52 `
### 2. Thu thập thông tin target
##### + Sử dụng nmap để kiểm tra các cổng đang mở của target:
` nmap -sV 10.129.210.52  `
###### -sV: kiểm tra phiên bản và tên của ứng dụng 
![image](https://github.com/WildSaul/HTB-starting-point-tier0/assets/155133173/b5b828a4-b73c-41f6-91aa-d40d913057f7)
##### => Port 23: Telnet, một network protocol cho phép truy cập từ xa đến các server và thực hiện lệnh như máy chủ.
##### + Kết nối telnet: 
` telnet 10.129.210.52 `
#####
![image](https://github.com/WildSaul/HTB-starting-point-tier0/assets/155133173/27efe77b-5094-4d96-8d46-1e0e566d7b18)
##### + Telnet yêu cầu login. Theo mặc định, tên user cho login được cấu hình 'admin' 'administrator' và 'root.
##### + Thử 'root' và thành công.

### 3. Khai thác lỗ hổng
##### Sau khi đăng nhập thành công vào telnet với tài khoản root, tiến hành tìm flag:
```
pwd
ls
cat flag.txt
```
