<img width="962" height="831" alt="image" src="https://github.com/user-attachments/assets/a509d57e-271a-4fb0-ae98-7eb695e261b5" />

Link:https://play.picoctf.org/practice/challenge/349?category=1&page=4&search=

Hệ điều hành : Window

Công cụ : Burp site , [base64](https://www.base64decode.org/)

Khi click vào link của bài , trang web đưa ta tới trang login có hiển thị :

<img width="1477" height="504" alt="image" src="https://github.com/user-attachments/assets/36c33bfe-aa6a-45ce-aec9-3a6c39133fbf" />

Nội dung đáng chú ý : Help us test this form
username:test and password:test.

Bây giờ tôi sẽ vào burp site để login với username:test and password:test! và chặn request xem có cái gì nữa không nhé :

Nếu chúng ta để ý , khi chạy login vào trong , history trong burp hiển thị những đoạn URL chớp nhoáng . 
Nếu để ý kĩ hơn thì tôi nghĩ nó là mã base64 . 
Bạn có thể nhìn rõ hơn ở dưới đây :

<img width="1919" height="986" alt="image" src="https://github.com/user-attachments/assets/d29de416-2e24-4bb8-9fb1-07ba3dd2e7fc" />

<img width="1913" height="1019" alt="image" src="https://github.com/user-attachments/assets/c2c4aa81-f4bf-4b9d-af0c-e847c1991775" />

Note lại , chúng ta có 2 URL như sau : http://saturn.picoctf.net:56911/next-page/id=cGljb0NURntwcm94aWVzX2Fs , 
http://saturn.picoctf.net:56911/next-page/id=cGljb0NURntwcm94aWVzX2Fs . Chúng ta sẽ loại bỏ thành phần "phụ" để thử base64 nhé . 

Kết quả cuối cùng : cGljb0NURntwcm94aWVzX2FscGljb0NURntwcm94aWVzX2Fs 

Chúng ta sẽ decodebase64 với link tôi gẳn ở trên nhé .
Kết quả hiển thị :

<img width="1455" height="965" alt="image" src="https://github.com/user-attachments/assets/11ff6507-395c-4d76-90f9-7f71fa732672" />

Flag đã được tìm thấy : 

picoCTF{proxies_all_the_way_25bbae9a}

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn hoàn thành flag thành công .Wish you have all the best!!!!!!!
