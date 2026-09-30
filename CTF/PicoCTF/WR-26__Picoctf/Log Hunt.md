<img width="963" height="800" alt="image" src="https://github.com/user-attachments/assets/823b83b5-96ee-4492-b71f-35a835fe70ab" />

Link lab :https://play.picoctf.org/practice/challenge/527?page=1&search=hunt

Hints:

(1) Bạn có thể sử dụng lệnh grep để lọc chỉ những dòng khớp với nội dung nhật ký.

(2) Một số dòng bị trùng lặp; hãy bỏ qua các dòng thừa.

Với bài này , tôi sẽ hướng dẫn với hai cách giải chi tiết .

Cách đầu tiên, làm bài trên bất kì hệ điều hành nào (tôi sẽ sử dụng trên Win).

Với đề bài đã cho chúng ta file chứa dữ liệu của flag . Bước đầu tiên đó là tải về , sau đó mở ra. Chúng ta được màn hình hiển thị như hình ảnh dưới đây .

<img width="880" height="738" alt="image" src="https://github.com/user-attachments/assets/b6e325ad-91d8-42fe-af54-c5ad7ce5d425" />

Trong bước tiếp theo chúng ta có 2 cách để triển khai ,
đó là : tìm từng dòng hiển thị dữ liệu từ flag và ghép chúng lại với nhau nếu cần .
Cách 2 , sử dụng Ctrl+F để tìm dữ liệu với từ khóa của tôi

Với cách tìm từng dòng hiển thị dữ liệu từ flag và ghép chúng lại với nhau nếu cần tôi thấy rằng nó là cách dễ làm , tuy nhiên rất mất thời gian . 
Bởi vậy tôi sẽ tìm dữ liệu với từ khóa FLAG.
Ta có thể thấy màn hình sẽ hiển thị như sau :

<img width="781" height="625" alt="image" src="https://github.com/user-attachments/assets/71376c89-6c6f-4da2-b932-92733346bcd1" />

Tương tự với các lần click tiếp theo , chúng ta được dữ liệu lần lượt là : 
INFO FLAGPART: picoCTF{***_  ; INFO FLAGPART: y******_  ; INFO FLAGPART: s*****_; INFO FLAGPART: c*****} .

Theo dữ liệu đã được tìm thấy và sử dụng Hint từ đề bài "một số dòng bị trùng lặp; hãy bỏ qua các dòng thừa" . 
Tôi sắp xếp dữ liệu như đúng với trình tự đã được tìm kiếm . 
Flag đã hiển thị : picoCTF{***_y*****_s****_c*****}.

Đến với cách giải thứ 2, chúng ta giải bài trên Terminal Linux . Ở đây, tôi sẽ dùng Kali .

Sau đi tải xong file từ Picoctf , chúng ta sẽ không mở file như thông thường . 
Bây giờ , chúng ta sẽ kiểm tra xem file chúng ta đã tải về đang ở đâu bằng cách mở phần đã tải và  "Show in Folder " của file này . 
Như vậy , chúng ta đã tìm thấy địa chỉ và đi đến địa chỉ file đang ở  ( File của tôi ở Download).

Tiếp tục quá trình , ta click chuột phải và chọn " Open Terminal Here " .
Sau đó , ls xem đã có đúng file mình tải và xem rõ chi tiết tên của file . 
Khi thấy tên file đã đúng với mình cần tìm . Sử dụng câu lệnh grep -i "flag" ./server.log .

Giải thích thêm về câu lệnh grep :
"grep" là một công cụ dòng lệnh mạnh mẽ dùng để tìm kiếm các dòng văn bản khớp với một mẫu (pattern) cụ thể.

Ý nghĩa và Công dụng chính
Tìm kiếm văn bản: grep quét qua các tệp tin hoặc dữ liệu đầu vào để tìm các chuỗi ký tự hoặc mẫu mong muốn.
Lọc dữ liệu: Khi kết hợp với các lệnh khác qua đường ống (pipe |), 
grep giúp lọc bỏ những thông tin không cần thiết và chỉ giữ lại những dòng quan trọng.

Sử dụng Biểu thức chính quy (Regex):
Điểm mạnh nhất của grep là khả năng tìm kiếm theo các mẫu phức tạp (như tìm địa chỉ email, số điện thoại,
hoặc các từ bắt đầu bằng một ký tự nhất định) thay vì chỉ tìm từ khóa cố định.

Chúng ta có các lệnh grep và ví dụ cơ bản như sau :

(+) grep "apple" file.txt	: Tìm và in ra tất cả các dòng chứa từ "apple" trong tệp file.txt.

(+) grep -i "apple" file.txt	: Tìm không phân biệt chữ hoa hay chữ thường (Ví dụ: Apple, APPLE đều khớp).

(+) grep -r "error" /var/log/	Tìm kiếm từ "error" trong tất cả các tệp thuộc thư mục log (tìm kiếm đệ quy).

Ở đây , tôi sẽ dùng tùy chọn -i (ignore-case), nó sẽ khớp cả "flag", "FLAG", "Flag",... 

Câu lệnh tôi sử dụng là : grep -i "flag" ./server.log

Sau khi hiển thị các nội dung liên quan đến từ khóa ấy .
Ta sẽ làm như ở cách đầu tiên đã làm là lấy những dữ liệu quan trọng và không quên bỏ khi nó lặp lại.
Sắp xếp theo đúng thứ tự mà đã cho sẵn từ dữ liệu bên trong tệp .

Dưới đây là mẫu lệnh và màn hình hiển thị Terminal trên máy của tôi . 
                                                                                                         
┌──(wr㉿kali)-[~/Downloads]
└─$ ls                
 a.out               challenge.zip   flag                  process-subject       template_mem.c
 baitap.txt          drop-in         flag.c                server.log            test.sh
'challenge(1).zip'  'drop-in (2)'    home                  synchro-subject
'challenge(2).zip'  'drop-in (3)'    level1.flag.txt.enc   synchro-subject.tgz
                                                                                                         
┌──(wr㉿kali)-[~/Downloads]
└─$ grep -i "flag" ./server.log

[1990-08-09 10:00:10] INFO FLAGPART: picoCTF{us3_

[1990-08-09 10:02:55] INFO FLAGPART: y0urlinux_

[1990-08-09 10:05:54] INFO FLAGPART: sk1lls_

[1990-08-09 10:05:55] INFO FLAGPART: sk1lls_

[1990-08-09 10:10:54] INFO FLAGPART: cedfa5fb}

[1990-08-09 10:10:58] INFO FLAGPART: cedfa5fb}

[1990-08-09 10:11:06] INFO FLAGPART: cedfa5fb}

[1990-08-09 11:04:27] INFO FLAGPART: picoCTF{us3_

[1990-08-09 11:04:29] INFO FLAGPART: picoCTF{us3_

[1990-08-09 11:04:37] INFO FLAGPART: picoCTF{us3_

[1990-08-09 11:09:16] INFO FLAGPART: y0urlinux_

[1990-08-09 11:09:19] INFO FLAGPART: y0urlinux_

[1990-08-09 11:12:40] INFO FLAGPART: sk1lls_

[1990-08-09 11:12:45] INFO FLAGPART: sk1lls_

[1990-08-09 11:16:58] INFO FLAGPART: cedfa5fb}

[1990-08-09 11:16:59] INFO FLAGPART: cedfa5fb}

[1990-08-09 11:17:00] INFO FLAGPART: cedfa5fb}

[1990-08-09 12:19:23] INFO FLAGPART: picoCTF{us3_

[1990-08-09 12:19:29] INFO FLAGPART: picoCTF{us3_

[1990-08-09 12:19:32] INFO FLAGPART: picoCTF{us3_

[1990-08-09 12:23:43] INFO FLAGPART: y0urlinux_

[1990-08-09 12:23:45] INFO FLAGPART: y0urlinux_

[1990-08-09 12:23:53] INFO FLAGPART: y0urlinux_

[1990-08-09 12:25:32] INFO FLAGPART: sk1lls_

[1990-08-09 12:28:45] INFO FLAGPART: cedfa5fb}

[1990-08-09 12:28:49] INFO FLAGPART: cedfa5fb}

[1990-08-09 12:28:52] INFO FLAGPART: cedfa5fb}

                                                                                                         
┌──(wr㉿kali)-[~/Downloads]

└─$ 

Đến đây tôi đã thành công tìm ra Flag của bài .

Cảm ơn tất cả các bạn đã đọc bài của tôi . Chúc các bạn thành công . Wish you have all the best !!!

