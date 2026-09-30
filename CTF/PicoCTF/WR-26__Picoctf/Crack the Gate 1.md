
<img width="946" height="826" alt="image" src="https://github.com/user-attachments/assets/ffc43a67-b441-4a0a-a903-07ebffe57aa6" />

Link : http://amiable-citadel.picoctf.net:63277/

Theo kinh nghiệm ít ỏi của mình , tôi nghĩ rằng những bài web nào cũng nên mở trên Burp Suite Community Edition . 
Và bài này tôi cũng mở trên đó để đọc được tối đa đoạn code mà tôi có thể biết và hiểu 
Chúng ra vào Burp -> Click Proxy -> mở Open browser để sử dụng , lém link bài vào trong ấy

<img width="1919" height="1009" alt="image" src="https://github.com/user-attachments/assets/b2a3da43-3f1b-4878-af68-57541023870c" />

Tiếp theo để nhìn rõ hơn , chúng ta cần xem view-source của nó để đọc xem đoạn code có gợi ý nào có thể sử dụng trong bài không 
Chúng ta thấy :
<img width="1919" height="1021" alt="image" src="https://github.com/user-attachments/assets/971d6862-97a9-4493-9d98-13f584dc5e5c" />

 Đọc lướt qua một đoạn , điều làm chúng ta chú ý đã xuất hiện : 
 
 <img width="726" height="56" alt="image" src="https://github.com/user-attachments/assets/fa81545a-1dc4-41a9-8cf7-576245295b98" />

Theo hint 1 từ đề bài người ta nói " Một mẹo phổ biến là xoay mỗi chữ cái 13 vị trí trong bảng chữ cái." . Vậy  chúng ta cần làm như thế nào để xoay mỗi chữ cái 13 vị trí .
Chúng ta nghĩ ngay đến ''rot13'' . Tôi cũng không chắc rằng nó được nhưng tôi vẫn thử ,và không nằm ngoài mong đợi , nó đã cho chúng ta thấy được một thông tin hữu ích :

<img width="1889" height="931" alt="image" src="https://github.com/user-attachments/assets/8bc3e412-2303-4cfc-ac38-e6e83603adbf" />

Bây giờ chúng ta sẽ quay lại trang Burp đọc request

<img width="1913" height="1005" alt="image" src="https://github.com/user-attachments/assets/be8d50f8-2fca-41d1-9158-9bf37e653cd6" />

Và chuyển nó sang Repeater để chỉnh sửa nội dung trong Pretty để thêm nội dung và điều kiện mình thấy từ việc decode rot13 " X-Dev-Access: yes" vào bất kì đâu để check :

<img width="1919" height="1013" alt="image" src="https://github.com/user-attachments/assets/7ef96bf9-eeba-4f64-bc18-2c4196573733" />

Điều khá buồn là lần thử này đã thất bại và không hiển thị cho chúng ta nội dung chúng ta mong muốn  : <img width="1919" height="1014" alt="image" src="https://github.com/user-attachments/assets/93ed7b64-225c-45e9-857f-1de9b47f7021" />

Vậy , chúng ta sẽ thử tiếp với trường hợp sử dụng dữ kiện đề bài cho " uses to log in: ctf-player@picoctf.org." 
Chúng ta sẽ đăng nhập bằng email : ctf-player@picoctf.org. và một mật khẩu bất kì theo ý muốn . 
Chúng ta có thể thấy được giao diện và đoạn POST như sau : 

<img width="1919" height="1027" alt="image" src="https://github.com/user-attachments/assets/624ffadb-8e94-426f-9ddb-a45dc16928bb" />

Chúng ta sẽ lại gửi request sang Repeater  . Tiếp theo , thêm đoạn " X-Dev-Access: yes" như màn hình  để vào login được bên trong và thấy được cái cần thấy

Chú ý : chuyển sang Hide_non-printble chars để đúng với định dạng rồi mới thêm " X-Dev-Access: yes" 

<img width="1919" height="1015" alt="image" src="https://github.com/user-attachments/assets/2fd21148-d6cc-46db-b6bd-cda1173dda65" />

Sau khi đã chỉnh sửa xong request , chúng ta phải click Send để gửi request sang respone . Sau khoảng thời gian chờ đợi nhanh chóng , rất may chúng ta đã thành công và nhìn thấy nôi dung : 

{"success":true,"email":"ctf-player@picoctf.org","firstName":"pico","lastName":"player","flag":"picoCTF{b*****_f*******_c******}"}

Flag cần tìm của chúng ta đã xuất hiện , việc tiếp theo của chúng ta là sao chép và nộp nha . 

(Note : Lý do là tôi vừa làm vừa chụp rồi ghi lại trên github nên link trong bài các bạn thấy có thể sẽ khác nhau , nhưng không làm ảnh hưởng đến chất lượng nội dung của bài viêt . Các bạn đều có thể làm theo hướng dẫn của tôi để có thể thành công lấy Flag nhé )

Mọi người có thể xem video tôi trình bày theo đường link sau : https://www.tiktok.com/@wrvn26/video/7581105931904224519

Cảm ơn tất cả mọi người đã đọc bài của mình . Chúc các bạn thành công . Wish you have all the best !!!

