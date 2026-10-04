<img width="989" height="909" alt="image" src="https://github.com/user-attachments/assets/a3781178-6bad-482c-a115-eadb0e43294f" />

Link lab : http://verbal-sleep.picoctf.net:50085/

Hint : 

(1) Đôi khi, thông tin quan trọng nhất lại nằm ngay trước mắt. Bạn đã kiểm tra tất cả các phần của trang web chưa?

(2) Cookie không chỉ dùng để ăn mà còn được sử dụng trong công nghệ web.

(3)Các trình duyệt web thường có các công cụ giúp bạn kiểm tra nhiều khía cạnh khác nhau của một trang web, bao gồm cả những thứ bạn không thể nhìn thấy trực tiếp.

Trước tiên , tôi sẽ click vào link ngay trên trang trình duyệt để xem đường dẫn sẽ đưa tôi đến đâu . Đường link đưa tôi đến trang đăng nhập như sau :

<img width="1919" height="951" alt="image" src="https://github.com/user-attachments/assets/645201c5-f538-47bb-96be-a0aa9b3d5c66" />

Tôi sẽ thử bắt đầu với việc sử dụng tài khoản mật khẩu ngẫu nhiên để kiểm tra nguồn login của web . Tôi đăng nhập với tài khoản : admin'-- với pass: 123456
Sau khi login và xem trang request của trang login này , màn hình của tôi hiển thị như sau : 

<img width="1688" height="890" alt="image" src="https://github.com/user-attachments/assets/155f1128-5df5-45f7-814b-f85a1b825902" />

Chúng ta nhớ đến gợi ý đầu tiên của đề bài là "cooki" ,vậy dĩ nhiên , "cooki" là lựa chọn hoàn hảo để chúng ta chú tâm vào nó . Tôi sẽ mở trang "kiểm tra" và chọn click "Application" -> "cooki" để xem liệu bên trong có ẩn chứa những dữ kiện nào quan trọng đến đề bài hay không . Các bước như trên đã hiển thị :

<img width="1722" height="955" alt="image" src="https://github.com/user-attachments/assets/43be66b8-3f4e-4cd5-ac1f-2373bc8a7371" />

Sau khi xem qua một lượt bên " cooki " , chúng ta có thể thấy phần " Value" của cooki có những ký tự mã đặc biệt giống như được mã hóa bởi câu lệnh nào đó . Theo kinh nghiệm ít ỏi của mình , tôi nghĩ rằng nó đang ở dạng của Base64. 
<img width="1395" height="639" alt="image" src="https://github.com/user-attachments/assets/ada4fa49-b2a8-4b77-ae77-b5a703e7a681" />

Vì theo lẽ đó , tôi sẽ lựa chọn copy đoạn mã đó để decode Base64 để xem liệu có cái gì hay ho đang chờ chúng ta hay không . 
Và không quá ngạc nhiên khi sau khi tôi decode , flag chúng ta cần tìm đã xuất hiện sau 1 lần decode .

<img width="1178" height="600" alt="image" src="https://github.com/user-attachments/assets/0370948a-d117-42b0-aeb4-6072db42204b" />

Và đó là cách flag đã được tìm thấy , giờ chỉ cần nộp flag là hoàn thành .

Với bài tập kiểu dạng kí tự được mã hóa như thế này , chúng ta hoàn toàn có thể để cho AI dịch mã cho chúng ta sang nội dung . Tuy nhiên , để cho việc học trở nên thú vị hơn , tôi nghĩ chúng ta cần tự nghĩ xem dạng và decode để kiếm tìm flag thuộc về mình.

Dưới đây là đường link bài làm của tôi , các bạn có thể xem và làm theo dễ hiểu : https://www.tiktok.com/@wrvn26/video/7579458591485152520

Cảm ơn tất cả các bạn đã xem bài viết của tôi . Chúc các bạn sẽ hoàn thành được bài tập  . Wish you have all the best !!!!

