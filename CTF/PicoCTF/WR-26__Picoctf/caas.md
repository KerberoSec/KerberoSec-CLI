### Thông tin

<img width="991" height="791" alt="image" src="https://github.com/user-attachments/assets/8897a81c-74e7-4be8-9987-e2a50fc48f61" />

Link: https://play.picoctf.org/practice/challenge/202?category=1&page=5&search=

Thể loại: Web Exploitation

Mức độ: Medium

Lỗ hổng khai thác: OS Command Injection (Tiêm mã lệnh hệ điều hành) dẫn đến RCE.

### Phân tích đề bài và mã nguồn
 
Đề bài cung cấp một URL của ứng dụng web và file mã nguồn index.js.
 Ứng dụng này cho phép người dùng in ra một thông điệp thông qua hình ảnh chú bò (cowsay) dựa trên URL.

Kiểm tra file index.js, điểm yếu chí mạng nằm ở đoạn code xử lý route /cowsay/:message:

JavaScript

app.get('/cowsay/:message', (req, res) => {
  exec(`/usr/games/cowsay ${req.params.message}`, {timeout: 5000}, (error, stdout) => {
    if (error) return res.status(500).end();
    res.type('txt').send(stdout).end();
  });
});

Phân tích lỗ hổng:

Ứng dụng sử dụng hàm exec của module child_process để chạy trực tiếp lệnh shell. 
Biến req.params.message (do người dùng kiểm soát) được nối thẳng vào chuỗi lệnh mà không hề qua bất kỳ cơ chế lọc (sanitize) hay kiểm tra nào. 

Điều này cho phép kẻ tấn công sử dụng các ký tự đặc biệt của shell (như ;, &&, |) để chạy thêm các lệnh tùy ý.

### Quá trình khai thác (Exploitation)

Bước 1: Gặp chướng ngại vật (Routing Bypass)

Thông thường, để khai thác RCE, ta có thể dùng payload nối lệnh như ; cat /etc/passwd.
Tuy nhiên, khi truy cập https://caas.mars.picoctf.net/cowsay/hello;cat/etc/passwd, 
ứng dụng trả về lỗi 404: Cannot GET /cowsay/hello;%20cat%20/etc/passwd.

<img width="660" height="154" alt="image" src="https://github.com/user-attachments/assets/99f0aada-fa74-464e-a1b2-271eb530af5c" />

Nguyên nhân: Framework Express.js nhận diện dấu gạch chéo / là ký tự phân tách đường dẫn.
Nó tưởng rằng tôi đang truy cập vào một thư mục sâu hơn chứ không phải đang truyền dữ liệu cho tham số :message.

Bước 2: Thăm dò hệ thống (Reconnaissance)

Để vượt qua giới hạn của Express, payload được gửi đi không được chứa dấu /. 
Tôi quyết định thăm dò thư mục hiện tại bằng lệnh ls (không cần dấu /):

Payload 1: /cowsay/hello;ls

URL hoàn chỉnh: https://caas.mars.picoctf.net/cowsay/hello;ls

<img width="651" height="449" alt="image" src="https://github.com/user-attachments/assets/c3744c5c-f4fa-4c70-ba8a-6597ab8e75e5" />

Kết quả: Dưới hình chú bò, server trả về danh sách các file trong thư mục hiện tại:

Plaintext
Dockerfile
falg.txt
index.js
node_modules
package.json
public

Bước 3: Lấy Flag

Tôi phát hiện một file có tên rất đáng ngờ là falg.txt (cố tình viết sai chính tả từ "flag").
Vì file này nằm ngay trong thư mục hiện tại, tôi có thể dùng lệnh cat để đọc nội dung của nó mà không vi phạm quy tắc"không dùng dấu gạch chéo".

Payload 2: /cowsay/hello;cat falg.txt

(Cần URL Encode khoảng trắng thành %20)

URL hoàn chỉnh: https://caas.mars.picoctf.net/cowsay/hello;cat%20falg.txt

3. Kết quả
4. 
Thực thi payload 2 thành công, ứng dụng trả về nội dung của file falg.txt:

<img width="601" height="287" alt="image" src="https://github.com/user-attachments/assets/e28a18b5-db9b-4ee0-be44-a6b6ab610320" />

Thực hiện khai thác Flag thành công .

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn thành công tìm thấy flag . Wish you have all the best!!!!!!!!!!!
