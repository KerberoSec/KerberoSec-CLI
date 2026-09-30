# REPITITIONS
##### Tags: `picoCTF 2023` `General Skills` `base64`
### DESCRIPTION
Can you make sense of this file? Download the [file](https://artifacts.picoctf.net/c/473/enc_flag) here.
##### + Trong file `enc_flag` là một chuỗi được mã hóa bằng Base64 nhiều lần, chúng ta có thể sử dụng lệnh:
```
$ echo 'chuỗi được mã hóa bằng base64 lần thứ n' | base64 -d
chuỗi được mã hóa bằng base64 lần thứ (n-1)
$ echo 'chuỗi được mã hóa bằng base64 lần thứ (n-1)' | base 64 -d
chuỗi được mã hóa bằng base64 lần thứ (n-2)
...
picoCTF{base64_n3st3d_dic0d!n8_d0wnl04d3d_dfe803c6}
```
##### + Nhưng như vậy thì không được 'chuyên nghiệp lắm' nên mình sẽ tạo một script bằng python, giải mã đoạn chuỗi cho đến khi chuỗi bắt đầu bằng `pico` thì dừng và in ra chuỗi:
```python
import base64

def decode_base64(encoded_str):
    try:
        decoded_str = base64.b64decode(encoded_str).decode('utf-8')
        return decoded_str
    except Exception as e:
        print(f"Error decoding: {e}")
        return None

def read_encoded_text_from_file(file_path):
    try:
        with open(file_path, 'r') as file:
            return file.read().strip()
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

def main():
    file_path = "/home/hoang/Downloads/enc_flag"
    encoded_text = read_encoded_text_from_file(file_path)

    if encoded_text is not None:
        while not encoded_text.startswith("pico"):
            decoded_text = decode_base64(encoded_text)
            if decoded_text is None:
                break  # Break nếu giải mã k được.
            encoded_text = decoded_text

        print(f"Flag: {encoded_text}")

if __name__ == "__main__":
    main()
```
##### + Chạy chương trình và được flag: `picoCTF{base64_n3st3d_dic0d!n8_d0wnl04d3d_dfe803c6}`
