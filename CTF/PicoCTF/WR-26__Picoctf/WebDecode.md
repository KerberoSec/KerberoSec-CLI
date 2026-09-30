<img width="1024" height="896" alt="image" src="https://github.com/user-attachments/assets/b49762fc-36b4-4391-b913-f5076f4cfd1c" />

Link lab : https://play.picoctf.org/practice/challenge/427?category=1&page=1&search=

Hints :

(1) Hãy sử dụng công cụ kiểm tra web để xem xét các tệp khác được bao gồm trong trang web.

(2)Cờ có thể được mã hóa hoặc không.

giống như tất cả những lần làm web khác , mở đầu của giải lab web, tôi sẽ mở và sử dụng Burp Suite để giải bài tập .
Chúng ta có thể thấy giao diện trên Burp khi tôi nhập link và xem nguồn trang như sau.

<img width="1919" height="1017" alt="image" src="https://github.com/user-attachments/assets/02e67a28-69b3-4b53-890f-3a9e01492b5a" />

Tôi sẽ nhấn thử tất cả các Funcion có trên trang web này để xem có thể đọc hay tìm kiếm được cơ hội nào để giải bài tập không . 
Bởi gợi ý đã chỉ ra rằng , hãy xem xét tất cả các tệp khác trong trang web , nó có 3 tệp chính tương ứng với biểu tượng "Home" , "About" , và "Contact".
Chúng ta sẽ kiểm tra từng Host  tương ứng với các phần dưới đây . 

<img width="1259" height="152" alt="image" src="https://github.com/user-attachments/assets/d79410cb-0e10-4727-9b95-1e33ad36d772" />
 
Giả sử chúng ta chưa biết gì , chúng ta sẽ kiểm tra bằng cách đọc từng Host một . 
Tuy nhiên ,nên chú ý hơn vào phần Response vì chúng là phần hiển thị những nội dung chúng ta cần chú ý . 
Đầu tiên , với Host có URL là index.html , phần Response hiển thị : 

<img width="1260" height="1014" alt="image" src="https://github.com/user-attachments/assets/071e934c-24ee-4aa7-a120-915c3bd15da5" />

Chúng chưa có nội dung Flag hay đoạn mã ta cần tìm để có thể mã hóa ngược ra flag .

Chúng ta sẽ tiếp tục kiểm tra với phần  Contact 

<img width="1256" height="801" alt="image" src="https://github.com/user-attachments/assets/500c0828-229c-4bad-8291-7477e476b323" />

Rất tiếc là nó vẫn chỉ cho ra những nội dung giới thiệu cơ bản và chưa thể giúp chúng ta đi tiếp . 
Chúng ta cần kiểm tra Host còn lại , nếu nó vẫn chưa thể ra đoạn mã base hay flag thì tôi nghĩ chúng ta cần đi sâu hơn vào từng tệp con bên trong mỗi Host này qua từng view_source tương ứng với mỗi Host . 
Chúng ta sẽ đi tiếp phần còn lại là "About" nhé , hy vọng nó sẽ đưa ta đến kết quả chúng ta mong muốn .

<img width="1919" height="1013" alt="image" src="https://github.com/user-attachments/assets/39cd8272-483d-49af-9c65-c02dc572a2ee" />

Vì bài web này không phải là bài web khó , bởi vậy flag đã rất nhanh có dấu hiệu hiển thị . 
Như những bài trước , những kí tự văn bản dài nối với nhau thành một đoạn text , ta có thể nhìn thấy ngay nó là nội dung đã được base4 . 
Việc cần làm bây giờ là chúng ta sẽ decode xem nó sẽ ra cái gì nhé . 
Như bạn  đã biết hoặc chưa biết , việc decode base64 có rất nhiều cách .
Ví dụ như khi bạn sử dụng Terminal linux , bạn có thể nhập đoạn lệnh sau để decode Base64: echo "<Nội dung đoạn mã cần decode>" | base64 -d .
Nếu bạn muốn thuận tiện ( nếu đã hiểu bản chất và thành thạo việc chuyển đổi mã Decode hay endcode ) , bạn có thể tìm trang [Base64 decode](https://www.base64decode.org/) như tôi đang sử dụng để hướng dẫn các bạn.

Sau khi decode base64 , trang web đã thành công giải mã đoạn code và cho chúng ta flag như hình dưới đây :

<img width="1258" height="715" alt="image" src="https://github.com/user-attachments/assets/97eaff49-c526-439b-bf07-23922675e0f4" />

Như vậy , chúng ta đã giải thành công thêm một bài Ctf Web rồi . 

Dưới đây là đường link bài làm của tôi , các bạn có thể xem và làm theo dễ hiểu : https://www.tiktok.com/@wrvn26/video/7583222118918147335

Cảm ơn tất cả các bạn đã xem bài viết của tôi . Chúc các bạn sẽ hoàn thành được bài tập  . Wish you have all the best !!!!

