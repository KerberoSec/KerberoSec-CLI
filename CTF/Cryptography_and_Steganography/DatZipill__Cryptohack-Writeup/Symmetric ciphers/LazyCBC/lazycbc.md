# Lazy CBC

## Đề bài 

```python
from Crypto.Cipher import AES

KEY = ?
FLAG = ?

@chal.route('/lazy_cbc/encrypt/<plaintext>/')
def encrypt(plaintext):
    plaintext = bytes.fromhex(plaintext)
    if len(plaintext) % 16 != 0:
        return {"error": "Data length must be multiple of 16"}

    cipher = AES.new(KEY, AES.MODE_CBC, KEY)
    encrypted = cipher.encrypt(plaintext)

    return {"ciphertext": encrypted.hex()}

@chal.route('/lazy_cbc/get_flag/<key>/')
def get_flag(key):
    key = bytes.fromhex(key)

    if key == KEY:
        return {"plaintext": FLAG.encode().hex()}
    else:
        return {"error": "invalid key"}

@chal.route('/lazy_cbc/receive/<ciphertext>/')
def receive(ciphertext):
    ciphertext = bytes.fromhex(ciphertext)
    if len(ciphertext) % 16 != 0:
        return {"error": "Data length must be multiple of 16"}

    cipher = AES.new(KEY, AES.MODE_CBC, KEY)
    decrypted = cipher.decrypt(ciphertext)

    try:
        decrypted.decode() # ensure plaintext is valid ascii
    except UnicodeDecodeError:
        return {"error": "Invalid plaintext: " + decrypted.hex()}

    return {"success": "Your message has been received"}
```

Đề bài cho 3 request (encrypt, decrypt, get_flag). Tìm ra key để cho vào request get_flag trả về plaintext của flag cần tìm

## Cách giải

Sơ đồ giải mã CBC:
*[Image: Sơ đồ giải mã CBC]*

Ta sẽ gọi các block ciphertext lần lượt là CT1, CT2,... và plaintext là PT1, PT2... 
Theo sơ đồ giải mã CBC, ta thấy:
- $CT1 \oplus D(CT2) = PT2$
- $D(CT1) \oplus IV = PT1$ (ở đây IV theo như code cũng chính là KEY) => $D(CT1) \oplus KEY = PT1$

Ý tưởng: Bước 1, sử dụng khối block gồm 16 bytes đầu (CT1-1) toàn là 0 cho vào request decrypt:
=> $CT1|1 \oplus D(CT2|1) = PT2|1 = D(CT2|1)$

Bước 2, sử dụng CT2|1 làm CT1|2 cho lần decrypt tiếp theo, ta được:
- $D(CT2|1) \oplus KEY = PT2|1 \oplus KEY = PT1|2$

Bước 3, tính $KEY = PT2|1 \oplus PT1|2$ ròi lấy plaintext của FLAG

Ghi chú: CTx|y(CT block thứ x ở bước thứ y)
