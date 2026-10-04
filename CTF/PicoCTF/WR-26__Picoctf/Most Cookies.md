<img width="945" height="811" alt="image" src="https://github.com/user-attachments/assets/194b8366-9415-4558-9ab9-39ae3ba02236" />

Link: https://play.picoctf.org/practice/challenge/177?category=1&page=5&search=

Chuyên mục: Web Exploitation

Lỗ hổng: Flask Session Cookie Forgery (Giả mạo Cookie của Flask)

Mức độ: Trung bình

1. Tổng quan (Reconnaissance)
   
Khi truy cập vào đường dẫn của thử thách, giao diện hiển thị một trang web đơn giản với tiêu đề "Most Cookies" và
 một ô tìm kiếm có gợi ý sẵn chữ snickerdoodle (tên một loại bánh quy).

Sử dụng tính năng Developer Tools (F12) > Application > Cookies trên trình duyệt,
ta phát hiện ứng dụng đang cấp cho người dùng một cookie có tên là session với giá trị định dạng chia làm 3 phần bởi dấu chấm .,
ví dụ:
eyJ2ZXJ5X2F1dGgiOiJzbmlja2VyZG9vZGxlIn0.aebfgw.bBlxdyV7pZdHtfIe1IbQOPok1wM

<img width="1918" height="789" alt="image" src="https://github.com/user-attachments/assets/383580c6-2dca-45b6-8d99-3adf3644d742" />

Định dạng này là đặc trưng tuyệt đối của Python Flask Server.

2. Phân tích Lỗ hổng (Vulnerability Analysis)
   
Khác với nhiều framework web lưu session ở phía server (và chỉ trả về client một chuỗi ID),
Flask mặc định lưu toàn bộ dữ liệu session ở phía client dưới dạng Cookie.

Cấu trúc của một Flask Cookie gồm 3 phần:

Payload: Dữ liệu thực tế được mã hóa Base64.

Timestamp: Thời gian tạo cookie.

Cryptographic Signature (Chữ ký điện tử): Mã băm được tạo ra từ Payload + Timestamp + một biến bí mật trên server gọi là SECRET_KEY.

Thử giải mã đoạn Payload Base64 phần đầu tiên (eyJ2ZXJ5X2F1dGgiOiJzbmlja2VyZG9vZGxlIn0), ta thu được một chuỗi JSON:

JSON

{"very_auth": "snickerdoodle"}

<img width="1211" height="761" alt="image" src="https://github.com/user-attachments/assets/22fffd76-3d20-4034-81ab-10c7dab729e3" />

Mục tiêu: Để chiếm quyền điều khiển hoặc đọc được flag, ta cần thay đổi giá trị "snickerdoodle" thành "admin".

Tuy nhiên, ta không thể tự ý sửa đổi chuỗi JSON này, vì nếu payload thay đổi, chữ ký ở phần 3 sẽ không còn khớp, và server sẽ từ chối cookie.

Để bypass cơ chế này, ta cần tìm ra SECRET_KEY của server để tự ký lại một cookie mới hoàn toàn hợp lệ.

3. Quá trình Khai thác (Exploitation)
   
Bước 1: Tìm SECRET_KEY (Brute-force)

Dựa vào ngữ cảnh bài toán (tiêu đề "Most Cookies"), ta có thể suy luận SECRET_KEY chính là tên của một loại bánh quy.
Sử dụng công cụ flask-unsign trên Kali Linux kết hợp với một danh sách các loại bánh quy phổ biến (wordlist), 
ta tiến hành crack chữ ký của cookie hiện tại:

Bash
flask-unsign --unsign --cookie "eyJ2ZXJ5X2F1dGgiOiJzbmlja2VyZG9vZGxlIn0.aebfgw.bBlxdyV7pZdHtfIe1IbQOPok1wM" --wordlist cookies.txt

Kết quả: Tool nhanh chóng báo đối chiếu thành công và tìm ra Secret Key là: macaron.

Bước 2: Giả mạo Cookie (Session Forgery)

Với SECRET_KEY đã nắm trong tay, ta sử dụng lại flask-unsign để tự tạo ra một session cookie mới, tiêm vào đó payload chứa quyền admin:

Bash
flask-unsign --sign --cookie "{'very_auth': 'admin'}" --secret ' macaron' --legacy

Output nhận được là một chuỗi session mới hợp lệ:

<img width="1122" height="135" alt="image" src="https://github.com/user-attachments/assets/e1900d9c-176f-44cd-ac2a-545d51af91f0" />

eyJ2ZXJ5X2F1dGgiOiJhZG1pbiJ9.aebYWg.LtqJCYHQ6u-ySr7PmSYY2y4Jdjo

Bước 3: Chiếm quyền và Lấy Flag

Quay trở lại trình duyệt, mở tab Cookies, thay thế giá trị của cookie session cũ bằng chuỗi mới vừa tạo ra. Tiến hành tải lại trang (F5).
Lúc này, server đọc cookie, xác thực chữ ký thành công (vì dùng đúng key snickerdoodle), và cấp quyền admin, qua đó trả về chuỗi Flag của thử thách.

Flag: picoCTF{cO0ki3s_yum_f3526545}

<img width="1919" height="738" alt="image" src="https://github.com/user-attachments/assets/3893f279-02e9-4a9a-8b86-7ddda53fd217" />

Lấy chuỗi này đem đi nộp là hoàn thành thử thách.

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!
