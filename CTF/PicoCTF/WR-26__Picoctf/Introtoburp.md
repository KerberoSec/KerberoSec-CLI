<img width="956" height="877" alt="image" src="https://github.com/user-attachments/assets/32abd7f9-8c85-4e78-81ff-53c32be82855" />

link lab : https://play.picoctf.org/practice/challenge/419?category=1&page=1&search=Introtoburp

Hints 

(1) Hãy thử sử dụng Burp Suite để chặn yêu cầu và thu thập flag.

(2) Hãy thử thay đổi cấu trúc yêu cầu, có thể mã phía máy chủ của họ không xử lý tốt các yêu cầu không đúng định dạng.

Hint chỉ ra rằng , chúng ta nên sử dụng Burp Suite  . Bởi vậy , tôi sẽ truy cập link : http://titan.picoctf.net:56827/ bằng Burp. Màn hình hiển thị nội dung đăng ký tài khoản mật khẩu như hình dưới đây . 

<img width="978" height="610" alt="image" src="https://github.com/user-attachments/assets/21ae6487-e27c-4583-ae83-1c2a4f7ada3c" />

Với tính ham tò mò và không ngại thử sức . Lab không yêu cầu thông tin chính xác , bởi vậy tôi sẽ fake thông tin để đăng ký tài khoản . 
Sau khi gửi đi yêu cầu , nó bắt chúng ta phải nhập OTP chính xác , nhưng liệu có thể kiếm OTP chính xác từ đâu khi chúng ta đang ở trạng không phải là những người dùng thật . 
Hãy thử với OTP ảo , xem giao diện hiển thị gì dưới đây nhé . 

<img width="1148" height="325" alt="image" src="https://github.com/user-attachments/assets/522b1e7d-bc8b-4898-aeaf-6370d819f030" />

Khi chúng ta nhập OTP ảo , giao diện báo lỗi . 
Tôi có suy nghĩ rằng , nếu nó báo lỗi chứng tỏ nó sẽ phải kiểm tra một lượt từ dữ liệu bên trong để so sánh với cái mà chúng ta nhập vào .
Vậy có hai luồng ý tưởng như sau : đầu tiên , chúng ta nên tìm  mã OTP khi được gửi từ đâu . thứ hai , chúng ta sẽ nhìn thấy nó bằng cách nào khi mà chúng ta không thấy được từng bước mà nó setup .
Để dừng lại từng quá trình để thực hiện mục tiêu của hai ý tưởng trên , chúng ta sẽ bật Intercept on để nhìn thấy và thực hiện từng bước một . 
Khi điền link và click enter để chạy , nó sẽ dừng lại để chúng ta xem từng bước một . Ở đây vẫn chưa có gì , chúng ta sẽ Forward để tiếp tục chạy . 

Khi giao diện hiển thị trang đăng ký . Chúng ta tiếp tục nhập nội dung chúng ta mong muốn và tiếp tục gửi request . Giao diện hiển thị như sau :

<img width="1919" height="992" alt="image" src="https://github.com/user-attachments/assets/fb559736-f30e-48ea-8ea1-d4df182ce063" />

Tiếp tục là  Forward  , giao diện đã đi đến bước OTP . Chúng ta sẽ tập trung chú ý từng bước một để không bị bỏ lỡ bất kì nội dung cần thiết nào .
 
 <img width="1903" height="1008" alt="image" src="https://github.com/user-attachments/assets/af061c11-5128-4d4e-b2ea-5bd8f2069a3c" />

Nhìn vào Request , chúng ta thấy được đoạn mã :

<img width="465" height="137" alt="image" src="https://github.com/user-attachments/assets/b0eac952-1c3b-4818-b2be-542b84ed041b" />

Tôi nghĩ rằng , nó có thể là mã OTP đã bị mã hóa bằng một cách nào đó .
Vì thế , tôi thử xóa nó đi để xem liệu có thể bỏ qua bước OTP hay có hiển thị nội dung hữu ích nào không .
Chúng ta sẽ thử nó bằng cách chuyển sang Repeater .
Khá tiếc khi nó không hiển thị flag mà ta mong muốn , mà nó hiển thị : 

<img width="993" height="687" alt="image" src="https://github.com/user-attachments/assets/d2d3994b-9a59-44c5-82e5-41d50fad188a" />

Chúng ta vẫn chưa tìm được OTP từ cách này .
Suy nghĩ thêm một chút , chúng ta sẽ thử lại với OTP ngẫu nhiên như ảnh dưới đây . 
Phần request sẽ hiển thị lại OTP mình vừa nhập :

<img width="1919" height="1007" alt="image" src="https://github.com/user-attachments/assets/3eddbc35-d291-470d-8791-e149538fcb40" />

Chúng ta không biết OTP là cái gì cả nên tôi sẽ xóa thẳng tất cả nội dung OTP mà có trong request ( xóa sạch dòng 16)  trong request :

<img width="1919" height="1016" alt="image" src="https://github.com/user-attachments/assets/0070253e-3b90-471d-b329-482fe8a20291" />

Tiếp tục là Forward . 
Sau khi gửi forward này , flag đã hiển thị 

<img width="1920" height="1018" alt="image" src="https://github.com/user-attachments/assets/58272e72-f016-4b68-ae49-be5580f96f57" />

Sau những lần thử gian nan , đến đây chúng ta đã hoàn thành và tìm kiếm được flag để nộp . 

Cảm ơn tất cả các bạn đã xem bài viết của tôi . Chúc các bạn sẽ hoàn thành được bài tập  . Wish you have all the best !!!!

