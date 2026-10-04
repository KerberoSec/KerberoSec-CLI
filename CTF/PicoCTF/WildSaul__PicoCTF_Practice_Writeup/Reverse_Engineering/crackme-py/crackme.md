# CRACKME-PY
##### Tags: `picoCTF2021`  `Reverse Engineering`
### DESCRIPTION
`crackme.py`
### 1. Hiểu đoạn code:
##### + Nếu chạy chương trình thì nó sẽ là chương trình so sánh 2 số
##### + Trong đoạn code, ta thấy ngay phần đầu là một chuỗi ký tự được nói là *quan trọng* của khách hàng, aka *flag*:
```python
# Hiding this really important number in an obscure piece of code is brilliant!
# AND it's encrypted!
# We want our biggest client to know his information is safe with us.
bezos_cc_secret = "A:4@r%uL`M-^M0c0AbcM-MFE02fh3e4a5N"

# Reference alphabet
alphabet = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ"+ \
            "[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"

def decode_secret(secret):
    """ROT47 decode

    NOTE: encode and decode are the same operation in the ROT cipher family.
    """

```
##### + Như vậy, chuỗi ký tự của biến `bezos_cc_secret` được mã hóa theo ROT47, hay hiểu là xoay 47 ký tự.
##### Đây là biến thể của ROT13: https://vi.wikipedia.org/wiki/ROT13
### 2. Tiến hành dịch ngược: 
```bash
$ echo "A:4@r%uL\`M-^M0c0AbcM-MFE02fh3e4a5N" | tr '!-~' 'P-~!-O'
picoCTF{1|\/|_4_p34|\|ut_a79b6c2d}
```
##### Lưu ý ký tự đặc biệt ` nên có \ trước nó.
