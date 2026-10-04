# Logon Zero

## Đề bài
```python
#!/usr/bin/env python3

from Crypto.Cipher import AES
from Crypto.Util.number import bytes_to_long
from os import urandom
from utils import listener

FLAG = "crypto{???????????????????????????????}"

class CFB8:
    def __init__(self, key):
        self.key = key

    def encrypt(self, plaintext):
        IV = urandom(16)
        cipher = AES.new(self.key, AES.MODE_ECB)
        ct = b''
        state = IV
        for i in range(len(plaintext)):
            b = cipher.encrypt(state)[0]
            c = b ^ plaintext[i]
            ct += bytes([c])
            state = state[1:] + bytes([c])
        return IV + ct

    def decrypt(self, ciphertext):
        IV = ciphertext[:16]
        ct = ciphertext[16:]
        cipher = AES.new(self.key, AES.MODE_ECB)
        pt = b''
        state = IV
        for i in range(len(ct)):
            b = cipher.encrypt(state)[0]
            c = b ^ ct[i]
            pt += bytes([c])
            state = state[1:] + bytes([ct[i]])
        return pt

class Challenge():
    def __init__(self):
        self.before_input = "Please authenticate to this Domain Controller to proceed\n"
        self.password = urandom(20)
        self.password_length = len(self.password)
        self.cipher = CFB8(urandom(16))

    def challenge(self, your_input):
        if your_input['option'] == 'authenticate':
            if 'password' not in your_input:
                return {'msg': 'No password provided.'}
            your_password = your_input['password']
            if your_password.encode() == self.password:
                self.exit = True
                return {'msg': 'Welcome admin, flag: ' + FLAG}
            else:
                return {'msg': 'Wrong password.'}

        if your_input['option'] == 'reset_connection':
            self.cipher = CFB8(urandom(16))
            return {'msg': 'Connection has been reset.'}

        if your_input['option'] == 'reset_password':
            if 'token' not in your_input:
                return {'msg': 'No token provided.'}
            token_ct = bytes.fromhex(your_input['token'])
            if len(token_ct) < 28:
                return {'msg': 'New password should be at least 8-characters long.'}

            token = self.cipher.decrypt(token_ct)
            new_password = token[:-4]
            self.password_length = bytes_to_long(token[-4:])
            self.password = new_password[:self.password_length]
            return {'msg': 'Password has been correctly reset.'}

import builtins; builtins.Challenge = Challenge # hack to enable challenge to be run locally, see https://cryptohack.org/faq/#listener
listener.start_server(port=13399)
```

Đề bài cho 1 server gồm 3 chức năng(authenticate, reset connection, reset password). Người dùng cần nhập đúng mật khẩu để lấy được flag.

## Cách giải
Điểm yếu của bài này nằm ở cách mã hóa CDB8 ở hàm 
```python
    def decrypt(self, ciphertext):
        IV = ciphertext[:16]
        ct = ciphertext[16:]
        cipher = AES.new(self.key, AES.MODE_ECB)
        pt = b''
        state = IV
        for i in range(len(ct)):
            b = cipher.encrypt(state)[0]
            c = b ^ ct[i]
            pt += bytes([c])
            state = state[1:] + bytes([ct[i]])
        return pt
```

Ta thấy rằng state sẽ lấy 16 bytes đầu, ct lấy các bytes còn lại. Sau khi decrypt và trả về pt(pt có độ dài bằng độ dài ct ở hàm decrypt) cho token, 4 bytes token cuối xác định độ dài mật khẩu. Vì vậy, mục đích của ta là làm sao cho 4 bytes cuối toàn 0 để độ dài mật khẩu là 0 => password = "".

Điều gì sẽ xảy ra nếu ta nhập vào ciphertext của decrypt toàn bytes 0? Lúc đó state sẽ là 16 bytes 0, ct toàn bytes 0. Sau khi encrypt và cập nhật lại state bằng ct[i] thì state vẫn toàn là bytes 0. Điều đó làm cho ký tự trong pt sẽ toàn là ký tự k. Vì vậy độ lớn 4 bytes cuối của pt có 1/(2^8) sẽ là 0. Ta chỉ cần reset_connection thay đổi key đến bao giờ làm cho độ dài mật khẩu là 0.

Đoạn code đáp án:
```python
from Crypto.Util.number import *
from pwn import *
import json

host = 'socket.cryptohack.org'
post = 13399
io = remote(host, post)

def sendjson(data):
    io.sendline(json.dumps(data).encode())
    return json.loads(io.readline().decode())

print(io.recvline().decode())

payload = '00' * 28
json_repass = {
    'option': 'reset_password',
    'token': payload
}

while 1:
    data = sendjson(json_repass)
    json_test = {
        'option': 'authenticate',
        'password': ''
    }
    data = sendjson(json_test)
    if 'crypto' in data['msg']:
        print(data['msg'])
        break
    json_recon = {
        'option': 'reset_connection'
    }
    data = sendjson(json_recon)

io.close()
```