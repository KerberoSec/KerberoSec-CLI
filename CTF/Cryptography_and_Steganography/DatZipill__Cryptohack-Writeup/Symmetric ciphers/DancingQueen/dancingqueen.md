# Dancing Queen

## Đề bài
Đề bài cho đoạn code encrypt sau, sử dụng mô hình ChaCha20
```python
#!/usr/bin/env python3

from os import urandom

FLAG = b'crypto{?????????????????????????????}'

def bytes_to_words(b):
    return [int.from_bytes(b[i:i+4], 'little') for i in range(0, len(b), 4)]

def rotate(x, n):
    return ((x << n) & 0xffffffff) | ((x >> (32 - n)) & 0xffffffff)

def word(x):
    return x % (2 ** 32)

def words_to_bytes(w):
    return b''.join([i.to_bytes(4, 'little') for i in w])

def xor(a, b):
    return b''.join([bytes([x ^ y]) for x, y in zip(a, b)])

class ChaCha20:
    def __init__(self):
        self._state = []

    def _inner_block(self, state):
        self._quarter_round(state, 0, 4, 8, 12)
        self._quarter_round(state, 1, 5, 9, 13)
        self._quarter_round(state, 2, 6, 10, 14)
        self._quarter_round(state, 3, 7, 11, 15)
        self._quarter_round(state, 0, 5, 10, 15)
        self._quarter_round(state, 1, 6, 11, 12)
        self._quarter_round(state, 2, 7, 8, 13)
        self._quarter_round(state, 3, 4, 9, 14)

    def _quarter_round(self, x, a, b, c, d):
        x[a] = word(x[a] + x[b]); x[d] ^= x[a]; x[d] = rotate(x[d], 16)
        x[c] = word(x[c] + x[d]); x[b] ^= x[c]; x[b] = rotate(x[b], 12)
        x[a] = word(x[a] + x[b]); x[d] ^= x[a]; x[d] = rotate(x[d], 8)
        x[c] = word(x[c] + x[d]); x[b] ^= x[c]; x[b] = rotate(x[b], 7)
    
    def _setup_state(self, key, iv):
        self._state = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]
        self._state.extend(bytes_to_words(key))
        self._state.append(self._counter)
        self._state.extend(bytes_to_words(iv))

    def decrypt(self, c, key, iv):
        return self.encrypt(c, key, iv)

    def encrypt(self, m, key, iv):
        c = b''
        self._counter = 1

        for i in range(0, len(m), 64):
            self._setup_state(key, iv)
            for j in range(10):
                self._inner_block(self._state)
            c += xor(m[i:i+64], words_to_bytes(self._state))

            self._counter += 1
        
        return c
    

if __name__ == '__main__':
    msg = b'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula.'
    key = urandom(32)
    iv1 = urandom(12)
    iv2 = urandom(12)

    c = ChaCha20()
    msg_enc = c.encrypt(msg, key, iv1)
    flag_enc = c.encrypt(FLAG, key, iv2)

    print(f"iv1 = '{iv1.hex()}'")
    print(f"iv2 = '{iv2.hex()}'")
    print(f"msg_enc = '{msg_enc.hex()}'")
    print(f"flag_enc = '{flag_enc.hex()}'")
```

Cùng với 1 file txt gồm iv1, iv2, msg_enc và flag_enc

## Cách giải
Ta có thể thấy trong đoạn code kia, sau khi state thực hiện hàm inner_block thì ko thay đổi gì (đáng lẽ nên cộng thêm initial state) nên $inner_block(state) = new_state$, việc này được thực hiện 10 lần để tạo ra keystream. Vì vậy nếu ta có thể tạo ra 1 hàm rev_inner_block ta hoàn toàn có thể tìm dần ra được state ban đầu. State ban đầu được tạo ra như sau:
```python
   def _setup_state(self, key, iv):
        self._state = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]
        self._state.extend(bytes_to_words(key))
        self._state.append(self._counter)
        self._state.extend(bytes_to_words(iv))
```
Ở đây state ban đầu là một ma trận 4x4 với mỗi phần tử là 32 bit, 4 phần tử đầu là 32 bit ứng ngẫu nhiên với mỗi phần tử làm tăng tính rối, key khởi tạo là 32 bytes ứng với 8 phần tử tiếp theo, phần tử tiếp theo là counter (ở đây flag chỉ dừng ở counter = 1 nên ta chỉ quan tâm khi counter = 1), 3 phần tử cuối là iv. 

Ta lấy msg xor với msg_enc là sẽ ra keystream, dùng keystream cho vào hàm reverse sẽ ra state ban đầu. Sau đây là 2 hàm reverse để tìm lại state ban đầu:
```python
def _rev_quarter_round(x, a, b, c, d):
    x[b] = rotate(x[b], 32-7);  x[b] ^= x[c]; x[c] = word(x[c] - x[d])
    x[d] = rotate(x[d], 32-8);  x[d] ^= x[a]; x[a] = word(x[a] - x[b])
    x[b] = rotate(x[b], 32-12); x[b] ^= x[c]; x[c] = word(x[c] - x[d])
    x[d] = rotate(x[d], 32-16); x[d] ^= x[a]; x[a] = word(x[a] - x[b])

def _rev_inner_block(state):
    _rev_quarter_round(state, 3, 4, 9, 14)
    _rev_quarter_round(state, 2, 7, 8, 13)
    _rev_quarter_round(state, 1, 6, 11, 12)
    _rev_quarter_round(state, 0, 5, 10, 15)
    _rev_quarter_round(state, 3, 7, 11, 15)
    _rev_quarter_round(state, 2, 6, 10, 14)
    _rev_quarter_round(state, 1, 5, 9, 13)
    _rev_quarter_round(state, 0, 4, 8, 12)
```
Sau khi ta reverse lại được state ban đầu, ta chỉ cần kiểm tra 4 phần tử đầu nếu ứng với 4 phần tử ngẫu nhiên đầu thì là đúng, từ đó ta cũng tìm được key nằm ở vị trí 4 đến 11 (đơn vị đang là word nên 8 word ứng với 32 bytes). Có key ròi ta chỉ việc cho vào hàm decrypt của đề bài là sẽ ra flag. Cái khó ở bài này là phân biệt đơn vị bytes, words hay bits, hexa đang được sử dụng.