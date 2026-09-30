# Level 5
###### User: *natas5* Pass: *Z0NsrtIkJoKALBCLi5eqFfcRN82Au2oD*
##### Sau khi đăng nhập, trang web thông báo rằng chưa log in
##### Inspect trang, kiểm tra phần Storage/Cookies, ta thấy có phần `loggedin = 0`, thay đổi giá trị thành 1, sau đó reload page:
###### Trong giá trị nhị phân, '0' thường đại diện cho không (no) và '1' là có (yes)
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/0381106c-ff1d-4d86-9233-aa49dc9b777d)
#
# Level 6
##### User: *natas6* Pass: *fOIvE0MDtPTgRhqmmvvAOt2EfXR6uQgR*
##### Ở level 6, website yêu cầu nhập một thông tin gì đó, kèm với một đường link ghi `source code`.
##### Kiểm tra source code:
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/511257e5-1d7f-475d-87c2-1412257f1f17)
##### Theo ý hiểu thì đoạn code kiểm tra input, sau đó so sánh với file `/includes/secret.inc`, nếu đúng sẽ hiện ra mật khẩu cho level tiếp theo.
##### Truy cập file trên theo URL, lấy key đúng cho input -> Website sẽ hiện ra mật khẩu đúng cho level 7.

