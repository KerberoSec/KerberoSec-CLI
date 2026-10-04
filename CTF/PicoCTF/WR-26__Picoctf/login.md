<img width="948" height="724" alt="image" src="https://github.com/user-attachments/assets/09f75f50-2a3c-4655-ab0f-1b7d1c761f24" />

Thông tin
Link :https://play.picoctf.org/practice/challenge/200?category=1&page=5&search=

Hệ điều hành : Window

Công cụ : Google , [base64](https://www.base64decode.org/)

Bắt đầu tấn công
Click link : https://login.mars.picoctf.net/

Màn hình hiển thị trang Login , không hint ,không thông tin để bypass . Tôi thử làm cách thông thường SQL nhưng không thành công .

<img width="1274" height="844" alt="image" src="https://github.com/user-attachments/assets/2f7d95b6-7b2f-4b8c-bc89-93a84dcb1a57" />

Khi không có bất cứ thông tin nào , việc của chúng ta chỉ có thể là đọc sourcecode và đi dần theo từng bước .
Khi đọc sourcecode của web này , thông tin tôi nhận được là :

<img width="560" height="486" alt="image" src="https://github.com/user-attachments/assets/1119bbc0-01e8-4200-9834-6d3bf89072b2" />

Chú ý ''<head>
        <link rel="stylesheet" href="styles.css">
        <script src="index.js"></script>
    </head>''

Chúng ta có file styles.css và index.js là dữ kiện quan trọng để đi tiếp .

Khi tôi đi sâu hơn vào [index](https://login.mars.picoctf.net/index.js) , nội dung hiển thị:

<img width="1914" height="201" alt="image" src="https://github.com/user-attachments/assets/3c232c67-458b-4a68-8b1c-3e3fd84afb99" />

Điều đáng chú ý đã được tôi khoanh đậm . Vì sao nó được tôi chú ý đến ? Bởi vì nó nhìn giống như đoạn thông tin đã được base64 .

Vì vậy tôi đã thử kiểm tra xem nội dung được decode là gì .

<img width="1337" height="778" alt="image" src="https://github.com/user-attachments/assets/d5cfa8fe-b833-4c31-a680-3fcf35100562" />

Flag hiển thị , chúng ta đã hoàn thành mục tiêu .

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!

