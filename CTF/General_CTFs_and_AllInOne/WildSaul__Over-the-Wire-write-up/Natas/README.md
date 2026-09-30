# Natas
<img width="960" alt="image" src="https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/eca3c164-db39-4cfb-a10c-2850d01e8fbd">

- Natas là phần nối tiếp của phần Bandit, chủ yếu tập trung vào các khái niệm bảo mật web phía máy chủ cơ bản
- Mỗi level của natas bao gồm một website có địa chỉ http://natasX.natas.labs.overthewire.org , trong đó X là số tương ứng với level. Để truy cập một level, yêu cầu nhập tên user (natasX: X tương ứng với level) và mật khẩu. Mỗi level lại có mật khẩu cho level tiếp theo.
- Ngoài ra, tất cả mật khẩu được lưu trữ trong /etc/natas_webpass/natasX, với X là level hiện tại và level trước đó. (VD: level 4 5 có thể đọc được /etc/natas_webpass/natas5)
