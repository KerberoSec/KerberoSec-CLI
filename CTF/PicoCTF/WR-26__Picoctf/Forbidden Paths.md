<img width="930" height="840" alt="image" src="https://github.com/user-attachments/assets/82ec8353-7720-44f1-8243-41d3c1f01d1d" />

Link : https://play.picoctf.org/practice/challenge/270?category=1&page=4&search=

## Writeup: Forbidden Paths: picoCTF 2022

* **Danh mục:** Web Exploitation
* **Độ khó:** Medium (Thực tế là mức cơ bản của Directory Traversal)
* **Mục tiêu:** Đọc được nội dung tệp tin chứa cờ (flag).

### I. Phân tích tư duy (Mindset)

Khi đứng trước một bài Web Exploitation, đặc biệt là dạng bài cho phép đọc/tải tệp tin, luồng suy nghĩ của bạn nên đi qua 4 bước sau:

**1. Định vị bản thân và mục tiêu:**
* Đề bài đã hào phóng cho biết ứng dụng web đang nằm ở: `/usr/share/nginx/html/`
* Mục tiêu cần lấy nằm ở tệp: `/flag.txt` (Tức là nằm ngay tại thư mục gốc `/` của hệ điều hành).

**2. Hiểu cơ chế phòng thủ (Bộ lọc/Filter):**

* Đề bài ghi: *"the website is filtering absolute file paths"* (Trang web đang lọc các đường dẫn tệp tuyệt đối).
  
* **Đường dẫn tuyệt đối là gì?** Trong Linux, bất kỳ đường dẫn nào bắt đầu bằng dấu gạch chéo `/` đều là đường dẫn tuyệt đối
  (Nó chỉ định vị trí tệp tính thẳng từ gốc rễ hệ thống). Ví dụ: `/etc/passwd`, `/var/log`, `/flag.txt`.
  
* **Hệ quả:** Nếu bạn nhập trực tiếp `/flag.txt`, trang web sẽ thấy dấu `/` ở đầu,
  nó nhận diện đây là đường dẫn tuyệt đối và sẽ chặn lại ngay lập tức (Not Authorized / File Not Found).

**3. Tìm lỗ hổng (Vulnerability):**

* Trang web cung cấp một ô nhập liệu để đọc tệp (ví dụ: `divine-comedy.txt`).
Điều này chứng tỏ mã nguồn có hàm đọc file dựa trên chuỗi văn bản người dùng nhập vào.

* Nếu hệ thống chỉ chặn **đường dẫn tuyệt đối** (bắt đầu bằng `/`),
 vậy lỗ hổng ở đây là ta có thể sử dụng **đường dẫn tương đối** (bắt đầu bằng dấu chấm `.`).
   Kỹ thuật này gọi là **Directory Traversal** (Duyệt thư mục qua mặt giới hạn).

**4. Lên phương án tấn công (Xây dựng Payload):**

* Để lùi ra thư mục cha (thư mục bên ngoài), ta dùng ký hiệu: `../`
  
* Ta đang ở: `/usr/share/nginx/html/`
  
    * Lùi 1 bước: `../` => Đứng ở `/usr/share/nginx/`
      
    * Lùi 2 bước: `../../` => Đứng ở `/usr/share/`
      
    * Lùi 3 bước: `../../../` => Đứng ở `/usr/`
      
    * Lùi 4 bước: `../../../../` => Đứng ở thư mục gốc `/`
      
* Khi đã đứng ở thư mục gốc `/`, ta chỉ việc gọi tên tệp.
  
* **Payload cuối cùng:** `../../../../flag.txt`

---

### II. Các bước thực hiện (Step-by-step Solution)

**Bước 1: Truy cập vào trang chủ của thử thách.**

Mở đường link được cấp (ví dụ: `http://saturn.picoctf.net:61216/`) trên trình duyệt web. 
Bạn sẽ thấy một giao diện có các gợi ý đọc sách và một ô nhập liệu (Input form).

<img width="928" height="477" alt="image" src="https://github.com/user-attachments/assets/ca5944cd-7ab0-4251-b91b-25d0d9f389ec" />

**Bước 2: Gửi Payload.**

Tuyệt đối **không** nhập payload lên thanh địa chỉ URL của trình duyệt.
Tại sao? Vì các trình duyệt hiện đại (như Chrome, Firefox) có cơ chế tự động chuẩn hóa URL.
Nếu bạn nhập `http://.../../../../../flag.txt`, trình duyệt sẽ tự động xóa các dấu `../` và biến nó thành `http://.../flag.txt` trước khi gửi đi, 
làm bạn đâm đầu vào thẳng bộ lọc của máy chủ.

Thay vào đó, bạn phải đưa payload vào ô nhập văn bản trên trang web.

* Xóa tên sách mặc định trong ô.
  
* Nhập chính xác chuỗi sau:
    **`../../../../flag.txt`**

**Bước 3: Thực thi và nhận kết quả.**

Bấm nút **Read** (hoặc nhấn Enter).

Lúc này, form của trang web sẽ gửi đoạn text nguyên bản `../../../../flag.txt` lên máy chủ. 
Máy chủ nhận được, chạy mã đọc tệp lùi 4 cấp về thư mục gốc và mở tệp `flag.txt`.

**Kết quả:** Màn hình sẽ chuyển hướng và hiển thị nội dung của tệp tin. 

<img width="788" height="232" alt="image" src="https://github.com/user-attachments/assets/6376e084-3dd8-4dd9-ab52-5b0f323667f0" />

Bạn sẽ nhận được chuỗi định dạng: `picoCTF{7h3_p47h_70_5ucc355_e5fe3d4d}`.

Lấy chuỗi này đem đi nộp là hoàn thành thử thách.

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!
