<img width="951" height="911" alt="image" src="https://github.com/user-attachments/assets/3ba6b2ab-7cdb-4efa-9229-4284e50a9426" />

Link lab : http://fickle-tempest.picoctf.net:51986

Hint: nó không kiểm tra mật khẩu của ai khác ngoài Joes?

Bởi nó không kiểm tra mật khẩu của ai khác ngoài Joes, nên có thể càng khiến chúng ta bớt quan tâm hơn những người khác và chỉ tập trung vào đối tượng tên Joe . 
Vậy, sau khi phân tích đề bài và hint , chúng ta sẽ vào Burp Suite để kiểm tra và thử xem có thu thập được thông tin hữu ích gì không nhé .

<img width="1884" height="1027" alt="image" src="https://github.com/user-attachments/assets/963e93e4-143f-4aa4-b909-91408591b2aa" />

Khá đáng tiếc khi không có một chút thông tin nào hữu ích từ đoạn HTML của nó . 
Theo như chúng ta biết về ý nghĩa của Cooki thì Cookie trong web là các tệp tin nhỏ được trình duyệt lưu trữ, có tác dụng nhớ trạng thái đăng nhập, ghi nhớ tùy chọn cá nhân (ngôn ngữ, giao diện).
Vậy ,ta sẽ thử kiểm tra xem phần cookie bên trong có gì đáng thử không nhé . 

<img width="1274" height="731" alt="image" src="https://github.com/user-attachments/assets/6819207e-be36-4b94-b5d1-a00a882e1f00" />

Không có nội dung nào cần tìm cả . Vậy , có lẽ chúng ta đã đi sai đường và bị lừa theo đúng hướng của tác giả . 
Khi không còn gì có thể thử ở login với Joe , chúng ta sẽ thử với bất kì ai . 

Tôi sẽ sử dụng password=fagd với username=gchjk ( ngẫu nhiên ) để kiểm tra thử xem có thể ra cái gì nhé . 

<img width="1059" height="19" alt="image" src="https://github.com/user-attachments/assets/df578083-1aea-4c5c-91b9-7615a686beb9" />

<img width="1896" height="1019" alt="image" src="https://github.com/user-attachments/assets/d1e96295-7357-4eae-8f8a-134af0883357" />

Có lẽ lần này đi đúng hướng rồi,  phần URL đã hiển thị có chữ flag . 

<img width="1255" height="49" alt="image" src="https://github.com/user-attachments/assets/93e386dd-6537-444f-b264-0220a1416a9e" />

Tôi hy vọng bằng việc tìm tòi chúng ta sẽ làm được lab này và tìm ra flag . Nhưng trước hết việc chúng ta cần làm bây giờ đó là thử mọi cách xâm nhập vào sâu nhất có thể .

Chú ý những nội dung của response . Chúng ta chưa thể thấy được những gợi ý khác từ đoạn HTML này .

Chúng ta chú ý phần Request Cookie bên trong Inspector  thấy được bảng nội dung với các biến name và các giá trị . Chúng ta thấy được admin đang false , có lẽ do không đăng nhập đúng Joe nên nó False . 

Chúng ta đang đăng nhập với tài khoản và mật khẩu ngẫu nhiên mà vẫn vào được trang này . 
Tại sao không thử với Admin có giá trị là True để xem nó sẽ như thế nào nếu là True.
Để có thể chỉnh sửa được trên Burp Suite , chúng ta cần chuyển Resquest sang Repeater . 
Sau khi chuyển sang Repeater thành công , chúng ta click vào inspector để tìm kiếm Cookies để hiển thị như bước vừa rồi . 
Sau đó , click chọn biến value của biến name đổi " False" thành " True" . 

<img width="1272" height="978" alt="image" src="https://github.com/user-attachments/assets/e760f1c3-88a9-4959-bbd1-6857a77fd116" />

Khi đã đổi xong , chúng ta sẽ Send lại xem có gì thay đổi phần Response không nhé . 

Khi đổi Value của admin và Send , chú ý đọc từng đoạn một trong mã HTML trong phần response, nội dung flag đã hiển thị ở phần response như ảnh dưới đây :

<img width="1268" height="779" alt="image" src="https://github.com/user-attachments/assets/caa89608-2511-4d7e-aca3-b67256b86113" />

Đến đây là đã thành công tìm được flag . Giờ thì copy flag và nộp là xong nhé .

Cảm ơn tất cả các bạn đã xem bài viết của tôi . Chúc các bạn sẽ hoàn thành được bài tập  . Wish you have all the best !!!!
