# Triple DES

## Đề bài
```python
from Crypto.Cipher import DES3
from Crypto.Util.Padding import pad

IV = os.urandom(8)
FLAG = ?

def xor(a, b):
    # xor 2 bytestrings, repeating the 2nd one if necessary
    return bytes(x ^ y for x,y in zip(a, b * (1 + len(a) // len(b))))

@chal.route('/triple_des/encrypt/<key>/<plaintext>/')
def encrypt(key, plaintext):
    try:
        key = bytes.fromhex(key)
        plaintext = bytes.fromhex(plaintext)
        plaintext = xor(plaintext, IV)

        cipher = DES3.new(key, DES3.MODE_ECB)
        ciphertext = cipher.encrypt(plaintext)
        ciphertext = xor(ciphertext, IV)

        return {"ciphertext": ciphertext.hex()}

    except ValueError as e:
        return {"error": str(e)}

@chal.route('/triple_des/encrypt_flag/<key>/')
def encrypt_flag(key):
    return encrypt(key, pad(FLAG.encode(), 8).hex())
```

Đề bài sử dụng mô hình 3DES mode ECB với 2 request (1 là encrypt plaintext mình nhập với key mình nhập, 2 là encrypt flag với key mình nhập)

## Cách giải
Mô hình DES hoạt động với 8 bytes thay vì 16 bytes như AES. Chu trình của 3DES là:
- $ct = E_{K3}(D_{K2}(E_{K1}(pt)))$

DES có cách weak key làm cho:
$D(Block) = E(Block)$

Các weak key(8 bytes) có thể kể đến là:
- 0101010101010101
- FEFEFEFEFEFEFEFE
- E0E0E0E0F1F1F1F1
- 1F1F1F1F0E0E0E0E

Ý tưởng: Ta sẽ sử dụng 3DES 2 lần với KEY lần đầu là K1K2K3 với flag, KEY lần sau là K3K2K1 với ciphertext của lần trước, ta sẽ được:

Lần 1: $ciphertext = E_{K3}(D_{K2}(E_{K1}(flag \oplus IV))) \oplus IV$

Lần 2: $E_{K1}(D_{K2}(E_{K3}(ciphertext \oplus IV))) = E_{K1}(D_{K2}(E_{K3}(E_{K3}(D_{K2}(E_{K1}(flag \oplus IV))) \oplus IV \oplus IV))) \oplus IV$  
Vì tất cả đều là weak key nên 
- $D_{K1}(D_{K1}(ct)) = E_{K1}(E_{K1}(ct)) = pt$
- $D_{K1}(D_{K1}(ct)) = E_{K1}(E_{K1}(ct)) = pt$
- $D_{K1}(D_{K1}(ct)) = E_{K1}(E_{K1}(ct)) = pt$ 

Từ đó flag sẽ là kết quả ta thu được sau lần 2.