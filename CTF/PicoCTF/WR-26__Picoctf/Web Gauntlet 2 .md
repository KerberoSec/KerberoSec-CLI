<img width="920" height="793" alt="image" src="https://github.com/user-attachments/assets/12f85c36-ef61-405a-a2a4-38b2b6bfdd76" />

Link : https://play.picoctf.org/practice/challenge/174?category=1&difficulty=2&page=3

Site: http://wily-courier.picoctf.net:60995/

<img width="1666" height="804" alt="image" src="https://github.com/user-attachments/assets/d4d841e0-f7cc-4440-9bbb-9e402008b3df" />

Filter: http://wily-courier.picoctf.net:60995/filter.php

<img width="1047" height="382" alt="image" src="https://github.com/user-attachments/assets/405bf9cc-a4f8-40ad-9682-e478bae6ab3f" />

# Writeup: Web Gauntlet 2 (picoCTF 2021)

**Thông tin cơ bản:**
* **Tên bài:** Web Gauntlet 2
* **Nền tảng:** picoCTF 2021
* **Mảng:** Web Exploitation
* **Mức độ:** Medium

---

## 1. Phân tích mục tiêu
Đề bài yêu cầu chúng ta đăng nhập thành công vào trang web với tư cách là `admin` (`Log in as admin`). Tuy nhiên, đây không phải là một bài SQL Injection (SQLi) thông thường vì trang web đã được trang bị một bộ lọc (filter) rất gắt gao.

Khi truy cập vào đường dẫn `filter.php` mà đề bài gợi ý, chúng ta thấy trang web đã đưa các từ khóa và ký tự sau vào danh sách đen (Blacklist):
> `or`, `and`, `true`, `false`, `union`, `like`, `=`, `>`, `<`, `;`, `--`, `/*`, `*/`, và đặc biệt là từ khóa `admin`.

Dựa vào các bài Web Gauntlet trước đó của picoCTF, hệ quản trị cơ sở dữ liệu (DBMS) được sử dụng ở đây là **SQLite**. Cú pháp xác thực backend giả định sẽ có dạng:
```sql
SELECT * FROM users WHERE username='$username' AND password='$password'
```

---

## 2. Xây dựng Payload (Exploitation)

Nhiệm vụ của chúng ta là chèn mã SQL vào các trường nhập liệu sao cho câu lệnh trả về kết quả Đúng (True) cho tài khoản admin, đồng thời **tuyệt đối không được sử dụng** bất kỳ từ khóa nào trong Blacklist ở trên.

### Vượt qua bộ lọc Username (Bypass 'admin')
Vì chữ `admin` bị cấm cứng, chúng ta không thể gõ trực tiếp tên đăng nhập này vào form. Để qua mặt, ta sẽ tận dụng đặc điểm của SQLite: **Toán tử nối chuỗi `||`** (String Concatenation).
* Chúng ta tách chữ admin ra làm đôi và dùng `||` để nối lại.
* **Payload Username:** `ad'||'min`
* *Tác dụng:* Filter của ứng dụng web (PHP) chỉ tìm chữ `admin` dính liền nên nó sẽ bỏ qua đoạn mã này. Nhưng khi đoạn mã được đưa xuống SQLite, cơ sở dữ liệu sẽ tự động nối `ad` và `min` lại thành chữ `admin` hợp lệ.

### Vượt qua bộ lọc Password
Kỹ thuật kinh điển nhất để qua mặt mật khẩu là biến mệnh đề thành luôn đúng (Ví dụ: `' OR 1=1 --`). Tuy nhiên, bài này đã cấm hoàn toàn `OR`, dấu `=` và cả các dấu comment (`--`, `/*`).
Để thay thế, chúng ta sẽ sử dụng toán tử **`IS NOT`** để tạo ra một logic luôn đúng mà không dính từ khóa cấm.
* **Payload Password:** `a' IS NOT 'b`
* *Tác dụng:* Khi chèn vào, câu lệnh kiểm tra mật khẩu sẽ trở thành: `AND password='a' IS NOT 'b'`. Vì chuỗi `'a'` chắc chắn không giống chuỗi `'b'`, mệnh đề này luôn luôn trả về **True**, giúp hệ thống tin rằng mật khẩu đã nhập là chính xác.

---

## 3. Các bước thực thi (Execution)

**Bước 1:** Truy cập vào trang đích của thử thách tại `http://wily-courier.picoctf.net:52512/`.

**Bước 2:** Nhập các Payload đã thiết kế vào form đăng nhập:
* Ô Username nhập: `ad'||'min`
* Ô Password nhập: `a' IS NOT 'b`

**Bước 3:** Nhấn **Login**. Màn hình sẽ hiển thị thông báo chúc mừng bạn đã đăng nhập thành công (ví dụ: *Congrats! You won!*). Tuy nhiên, Flag vẫn chưa xuất hiện trên màn hình này.

<img width="1363" height="749" alt="image" src="https://github.com/user-attachments/assets/1bc94388-d620-4daa-8e89-042000e4b9fd" />

**Bước 4:** Để lấy Flag, bạn di chuyển chuột lên thanh địa chỉ của trình duyệt, gõ nối thêm `/filter.php` vào sau đường dẫn hiện tại (để nó trở thành `http://wily-courier.picoctf.net:52512/filter.php`) rồi nhấn Enter.

<img width="1274" height="662" alt="image" src="https://github.com/user-attachments/assets/f12a85a7-2cc3-48c3-aeaf-6710e4e6314e" />

**Kết quả:** Mã nguồn PHP của file filter sẽ được hiển thị ra, và **Flag** :  picoCTF{0n3_m0r3_t1m3_85a265ac}

*Hoàn tất thử thách!*

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!

