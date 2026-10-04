<img width="950" height="878" alt="image" src="https://github.com/user-attachments/assets/477a0d46-5404-436c-bdf1-b6d3464822fb" />

#### Thông tin

Link : https://play.picoctf.org/practice/challenge/288?category=1&page=4&search=

Hệ điều hành : Window

Công cụ : Google 

#### Bắt đầu tấn công

Click link : http://saturn.picoctf.net:58086/

Màn hình hiển thị trang Continue as guest , tiếp tục click to Continue as guest . 

Màn hình trả về nội dung lần lượt như sau :

<img width="832" height="339" alt="image" src="https://github.com/user-attachments/assets/ada419e8-0424-46a5-aa1e-f766f5c04816" />

<img width="946" height="272" alt="image" src="https://github.com/user-attachments/assets/546a6f88-8ace-4375-a903-38857b0033a6" />

Đến đây đã xong các bước chỉ dẫn mà web muốn chúng ta hướng đến .

Chú ý dữ kiện : Do you know how to modify cookies?

Với dữ kiện này , chúng ta sẽ kiểm tra xem cookies có gì và thay đổi nó như thế nào.

Tôi sẽ kiểm tra nguồn trang request và vào kiểm tra cooki ( follow to Devtool (F12) -> Application -> Cookies ).
Màn hình hiển thị nội dung như hình dưới đây:

<img width="1715" height="990" alt="image" src="https://github.com/user-attachments/assets/11464f51-d15a-4213-bd1d-8d77d2a9add4" />

Chúng ta chú ý đến Name và value , với name là isAdmin , Value tương ứng là 0 .

Mà dữ kiện hỏi rằng chúng ta  có biết cách chỉnh sửa cookie không? , vậy giá trị cần thay đổi là gì .
Tôi nhìn thấy giá trị Value=0 , tôi chợt nghĩ rằng : Tại sao nó hiển thị 0 mà chúng ta không đổi sang một giá trị nào khác . 

Tôi đã đổi nó với giá trị Value=1 và click lại request . 

Flag tương ứng với bài đã hiển thị như hình ảnh dưới đây :

<img width="1686" height="738" alt="image" src="https://github.com/user-attachments/assets/5d02a19a-e40e-4af3-8e81-e5a67603e1e6" />

Đến đây Flag đã được tìm thấy là : picoCTF{gr4d3_A_c00k13_5d2505be}

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn giải thử thách thành công . Wish you have all the best!!!!!!!!!!!
