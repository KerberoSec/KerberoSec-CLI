# Picker I
##### Tags: `picoGym Exclusive` `Reverse Engineering` `Python`
### DESCRIPTION
This service can provide you with a random number, but can it do anything else? Connect to the program with netcat: `$ nc saturn.picoctf.net 63462` The program's source code can be downloaded [here](https://artifacts.picoctf.net/c/514/picker-I.py).
> Một series challenge hay liên quan đến đọc hiểu code và gọi hàm để ra được flag. Ý kiến cá nhân mình thì đây giống với 'Binary Exploitation' hơn vì không có nhiều kỹ thuật liên quan đến 'decompile' hay 'disassemble' chương trình thực thi. Thay vào đó là đọc source code và tìm lỗ hổng.
##### Đọc file:
```
...
def win():
  # This line will not work locally unless you create your own 'flag.txt' in
  #   the same directory as this script
  flag = open('flag.txt', 'r').read()
  #flag = flag[:-1]
  flag = flag.strip()
  str_flag = ''
  for c in flag:
    str_flag += str(hex(ord(c))) + ' '
  print(str_flag)  
...
while(True):
  try:
    print('Try entering "getRandomNumber" without the double quotes...')
    user_input = input('==> ')
    eval(user_input + '()')
  except Exception as e:
    print(e)

```
##### Lỗ hổng ở đây chính là lệnh `eval`, cho phép gọi các hàm không chỉ riêng trong chương trình mà còn các hàm được xây dựng sẵn trong python.
##### Khi kết nối với chương trình qua `netcat`, ta chỉ cần gõ `win` là sẽ nhận được một chuỗi ký tự:
```
$ nc saturn.picoctf.net 57059
Try entering "getRandomNumber" without the double quotes...
==> win
0x70 0x69 0x63 0x6f 0x43 0x54 0x46 0x7b 0x34 0x5f 0x64 0x31 0x34 0x6d 0x30 0x6e 0x64 0x5f 0x31 0x6e 0x5f 0x37 0x68 0x33 0x5f 0x72 0x30 0x75 0x67 0x68 0x5f 0x36 0x65 0x30 0x34 0x34 0x34 0x30 0x64 0x7d 
Try entering "getRandomNumber" without the double quotes...
==>           
```
##### Sử dụng converter online [này](https://www.rapidtables.com/convert/number/hex-to-ascii.html) với `From:Hexdecimal`, `To:Text`, `Character encoding:UTF-16 big edian` => Lấy flag thành công!
