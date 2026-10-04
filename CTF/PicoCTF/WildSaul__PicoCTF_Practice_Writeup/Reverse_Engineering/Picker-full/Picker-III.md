# Picker III
##### Tags: `picoGym Exclusive` `Reverse Engineering` `Python`
### DESCRIPTION
Can you figure out how this program works to get the flag? Connect to the program with netcat: $ nc saturn.picoctf.net 54051 The program's source code can be downloaded [here](https://artifacts.picoctf.net/c/525/picker-III.py).
##### Đọc file:
```
...
def filter_var_name(var_name):
  r = re.search('^[a-zA-Z_][a-zA-Z_0-9]*$', var_name)
  if r:
    return True
  else:
    return False

def read_variable():
  var_name = input('Please enter variable name to read: ')
  if( filter_var_name(var_name) ):
    eval('print('+var_name+')')
  else:
    print('Illegal variable name')

def filter_value(value):
  if ';' in value or '(' in value or ')' in value:
    return False
  else:
    return True

def write_variable():
  var_name = input('Please enter variable name to write: ')
  if( filter_var_name(var_name) ):
    value = input('Please enter new value of variable: ')
    if( filter_value(value) ):
      exec('global '+var_name+'; '+var_name+' = '+value)
    else:
      print('Illegal value')
  else:
    print('Illegal variable name')
...
```
##### Lỗ hổng ở đây chính là chức năng mới của chương trình, cho phép viết và gán giá trị mới cho biến. Điều này khiến các hàm cũng có thể bị viết đè lên chức năng ban đầu.
##### Kết nối với chương trình: 
```
$ nc saturn.picoctf.net 54051 
==> 3
Please enter variable name to write: getRandomNumber
Please enter new value of variable: win
==> 4
0x70 0x69 0x63 0x6f 0x43 0x54 0x46 0x7b 0x37 0x68 0x31 0x35 0x5f 0x31 0x35 0x5f 0x77 0x68 0x34 0x37 0x5f 0x77 0x33 0x5f 0x67 0x33 0x37 0x5f 0x77 0x31 0x37 0x68 0x5f 0x75 0x35 0x33 0x72 0x35 0x5f 0x31 0x6e 0x5f 0x63 0x68 0x34 0x72 0x67 0x33 0x5f 0x61 0x31 0x38 0x36 0x66 0x39 0x61 0x63 0x7d 
```
##### Sử dụng converter online [này](https://www.rapidtables.com/convert/number/hex-to-ascii.html) với `From:Hexdecimal`, `To:Text`, `Character encoding:UTF-16 big edian` => Lấy flag thành công!
