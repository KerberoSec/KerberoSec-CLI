# [SQL injection: String](https://www.root-me.org/en/Challenges/Web-Server/SQL-injection-String)

Thử SQLi ở thẻ Login thì không bypass được, ta qua thẻ Search để thử. Ở thẻ này có vẻ khả thi hơn vì nó có thực hiện query theo input của ta. Ví dụ:

Đầu tiên, thử với payload đơn giản **1’ or 1=1--** , thì phát hiện nó đã bị SQLi thành công:

Ta thực hiện blind SQL để tìm kiếm thông tin infor của admin để có thể login. Ta thử với payload **1’ union select 1** , thì nhận về lỗi sau:

Có thể biết được server sử dụng SQLite3, từ đó, công việc của ta cần sử dụng cú pháp của SQLite3 để mò ra các table trong database với hi vọng tìm được admin. Nhưng trước tiên, ta cần phải thực hiện dò số cột. Thay payload thành **1’ union select 1,1--** thì có vẻ đã tìm được số cột là 2:

Vì server dùng SQLite3, do vậy, ta cần truy vẫn các table bằng cách tìm trong **sqlite\_master** hoặc **sqlite\_schema.** Thử truy vấn với payload **1’ union select 1,name from sqlite\_master--** ta có:

Tiếp tục, ta blind vào table users *1' union select 1,1 from users--*

Tiếp tục, ta thử query tìm username và password với payload **1' union select username,password from users-- :**

Thử login thì thành công:

- Flag: "****************************"
