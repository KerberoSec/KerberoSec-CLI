# TRANSORMATION
##### Tags : `picoCTF2021`  `Reverse Engineering`
### DESCRIPTION
I wonder what this really is... [enc](./enc) 
''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
### 1. Hiểu đoạn code: 
##### + Tạo 1 script sử dụng code ở phần *Description cho và xem cách hoạt động:
```python
# Example string to encode
flag = "ABCD"

# Encoding using the provided code
encoded_string = ''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])

# Display the results
print("Original String:", flag)
print("Encoded String:", encoded_string)
```
##### + Chạy chương trình sẽ được kết quả như sau: 
```text
Original String: ABCD
Encoded String: 䌴䙹
```
##### + Đoạn code sẽ mã hóa hai chữ liên tiếp thành 1 ký tự mã hóa.
##### + Xem file [enc](./enc), ta sẽ thấy được các đoạn mã hóa tương tự.
### 2. Tạo code dịch ngược:
```python
# Encoded string to decode
encoded_string = "䌴䙹"

# Decoding
decoded_string = ''.join([chr((ord(encoded_string[i]) >> 8) & 0xFF) + chr(ord(encoded_string[i]) & 0xFF) for i in range(0, len(encoded_string))])

# Display the results
print("Encoded String:", encoded_string)
print("Decoded String:", decoded_string)
```
##### + Đảo ngược cần lưu ý ký tự `OxFF` được sử dụng để chia 1 ký tự mã hóa thành 2 ký tự Unicode.
##### + Chạy chương trình:
```text
Encoded String: 灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸彥㜰㍢㐸㙽
Decoded String: picoCTF{16_bits_inst34d_of_8_e703b486}
```
##### + Lấy flag thành công!
