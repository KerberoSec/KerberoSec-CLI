# Picker II
##### Tags: `picoGym Exclusive` `Reverse Engineering` `Python`
### DESCRIPTION
Can you figure out how this program works to get the flag? Connect to the program with netcat: `$ nc saturn.picoctf.net 63462` The program's source code can be downloaded [here](https://artifacts.picoctf.net/c/522/picker-II.py).
##### Đọc file:
```
...
def filter(user_input):
  if 'win' in user_input:
    return False
  return True

while(True):
  try:
    print('Try entering "getRandomNumber" without the double quotes...')
    user_input = input('==> ')
    eval(user_input + '()')
  except Exception as e:
    print(e)

```
##### Trong chương trình lần này đã có thêm hàm `filter` nhằm tránh cho người dùng gọi hàm `win`.
##### Tuy nhiên, `filter` sẽ chỉ lọc riêng chữ 'win', nên ta có thể khai thác lỗ hổng này kèm với lỗ hổng cho phép gọi hàm thực thi của `eval`:
```
nc saturn.picoctf.net 62249
==> eval('w' + 'i' + 'n')
0x70 0x69 0x63 0x6f 0x43 0x54 0x46 0x7b 0x66 0x31 0x6c 0x37 0x33 0x72 0x35 0x5f 0x66 0x34 0x31 0x6c 0x5f 0x63 0x30 0x64 0x33 0x5f 0x72 0x33 0x66 0x34 0x63 0x37 0x30 0x72 0x5f 0x6d 0x31 0x67 0x68 0x37 0x5f 0x35 0x75 0x63 0x63 0x33 0x33 0x64 0x5f 0x30 0x62 0x35 0x66 0x31 0x31 0x33 0x31 0x7d 
==> exit                        
```
##### Sử dụng converter online [này](https://www.rapidtables.com/convert/number/hex-to-ascii.html) với `From:Hexdecimal`, `To:Text`, `Character encoding:UTF-16 big edian` => Lấy flag thành công!
