<img width="1007" height="807" alt="image" src="https://github.com/user-attachments/assets/6482e47f-47db-490d-9902-2dd673b6e1d6" />

Link lab : http://wily-courier.picoctf.net:51102/

Với mỗi bài lab về Web , chúng ta có một điều kiên quyết phải làm đó là thử nhập bất kì cái gì và xem nguồn trang có sự thay đổi như thế nào . Ở bài tập này , tôi sẽ sử dụng Burt Suite cho việc này . 
Tôi thử nhập nội dung snickerdoodle và check nguồn trang , chúng ta có thể thấy giao diện tôi đang thấy như sau :

<img width="1919" height="1020" alt="image" src="https://github.com/user-attachments/assets/598d61a6-908f-4aa4-84f2-e24b760e0ca2" />

Vì hiện tại tôi vẫn chưa biết mọi thứ sẽ thay đổi như thế nào nếu chúng ta nhập nội dung khác , nên điều tôi cần làm là chú ý vào mỗi chi tiết có thể thấy khi thử nhiều lần với nội dung khác nhau .
Nhưng tôi hoàn toàn không biết được rằng trong "Welcome to my cookie search page. See how much I like different kinds of cookies!" có những gì ngoài "snickerdoodle" do hiển thị trên thanh nội dung . 
Chú ý thêm đề bài , nó có tên là "cookies" , với mọi dữ kiện có thể thấy từ đề bài thì với tôi chúng đều là hint .
Tôi nghĩ rằng bản thân có thể sử dụng thay đổi thông tin từ "Cookie: name=0" bởi nó là thông tin liên quan và mã "name=" có thể thay đổi tùy ý .
Tôi sẽ cho request này chuyển sang Repeater để có thể chỉnh sửa nội dung request mà không ảnh hưởng đên lab . 
Tôi thử với "name=2" và "name=n" số khác đều ra những dòng hiển thị khác nhau , ví dụ như với "name=2" chúng ta có thể thấy dòng bên response hiển thị " I love oatmeal raisin cookies".
Chúng ta thấy như sau : 

<img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/b09bb8af-c54d-4243-8c8b-0add72e2a167" />

Hiện tại bài lab đang hoàn toàn trong phạm vi ý tưởng mà chúng ta nghĩ tới . 
Để có thể thay đổi id của name . chúng ta cần chuyển request sang intruder . 
Khi chuyển sang thành công , chúng ta cần đánh dấu id của name để "Add$" . 
Chúng ta sẽ cho với nội dung bên trong $$ là 10 ví dụ như $10$ (Cookie: name=$10$ để tool lặp và lấy dữ liệu chạy liên tục 10 lần ) . Tiếp đó chọn "payload type" để chọn loại payload "Numbers".
Để chạy xem chi tiết từng nội dung của từng giá trị , phần Number Range chúng ta chọn từ 1 đến 20 và với bước nhảy là 1 để không bị bỏ qua bất kì dữ kiện từ con số nào . 
Hãy nhìn rõ ảnh dưới đây để chỉnh sửa và không bị thiếu nhầm lẫn . 

<img width="1236" height="1004" alt="image" src="https://github.com/user-attachments/assets/c580810c-f9de-49ae-ac3d-cb18e5e4b1e5" />

Tiếp đó chúng ta click "Start attack" để có thể chạy liên tục các id name theo một cột nội dung và từ ấy tìm flag . 
Sau khi chạy thành công , Burp suite sẽ hiển thị bảng giá trị cho chúng ta . Sau khi tìm một lúc lâu tới giá trị payload là 18 thì flag đã được hiển thị ra như hình dưới đây . 

<img width="1225" height="829" alt="image" src="https://github.com/user-attachments/assets/087db1a8-13cb-40c4-878f-55636af450c1" />

Dưới đây là đường link bài làm của tôi , các bạn có thể xem và làm theo dễ hiểu : https://www.tiktok.com/@wrvn26/video/7579900228430482696?lang=vi-VN

Cảm ơn tất cả các bạn đã xem bài viết của tôi . Chúc các bạn sẽ hoàn thành được bài tập  . Wish you have all the best !!!!
