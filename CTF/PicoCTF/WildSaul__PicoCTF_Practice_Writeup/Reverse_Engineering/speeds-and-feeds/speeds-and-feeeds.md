# SPEEDS AND FEEDS
##### Tags: `picoCTf 2021` `Reverse Engineering`
### DESCRIPTION
There is something on my shop network running at `nc mercury.picoctf.net 33596`, but I can't tell what it is. Can you?
### Hiểu đoạn code:
##### + Sau khi kết nối sử dụng lệnh `nc mercury.picoctf.net 33596`, thấy màn hình sẽ in ra rất nhiều các chữ số như sau:
```
G17 G21 G40 G90 G64 P0.003 F50
G0Z0.1
G0Z0.1
G0X0.8276Y3.8621
G1Z0.1
G1X0.8276Y-1.9310
G0Z0.1
G0X1.1034Y3.8621
G1Z0.1
G1X1.1034Y-1.9310
G0Z0.1
G0X1.1034Y3.0345
G1Z0.1
G1X1.6552Y3.5862
G1X2.2069Y3.8621
G1X2.7586Y3.8621
G1X3.5862Y3.5862
G1X4.1379Y3.0345
...
```
##### + Tìm hiểu online, thấy đấy là một G-code được sử dụng cho máy cắt CNC.
##### + Đẩy đoạn code trên vào một file:
` nc mercury.picoctf.net 33596 > speeds-feeds.txt `
##### + Tìm một tool online để chạy đoạn code trên: [ncviewer](https://ncviewer.com)
##### + Đẩy file lên và được flag xuất hiện trên màn hình:
<img width="966" alt="image" src="https://github.com/WildSaul/PicoCTF_Practice_Writeup/assets/155133173/9de324b3-d572-47d9-84fe-0efae7455852">

##### => flag: _picoCTF{num3r1cal_c0ntr0l_e7749028}_
