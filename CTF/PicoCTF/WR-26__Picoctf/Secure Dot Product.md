<img width="815" height="703" alt="image" src="https://github.com/user-attachments/assets/5a95bff0-6560-4074-aa51-74d391db893d" />
# Writeup: Secure Dot Product (picoCTF 2026, Cryptography · Hard)

> **Flag:** `picoCTF{n0t_so_s3cure_.x_w1th_sh@512_cabf48c0}`

> **AES key khôi phục:** `761ed0c65ceb8b10745b61ed58197b649719ad08000c30efe2bdfc22ff482606`

> **Tác giả solution:** OpenHack agent · exploit hoàn chỉnh trong `sol/solve.py`

---

## MỤC LỤC
1. [Tổng quan thử thách](#1-tổng-quan-thử-thách)
2. [Phân tích source code](#2-phân-tích-source-code)
3. [Chuỗi 3 lỗ hổng](#3-chuỗi-3-lỗ-hổng)
4. [Cơ sở toán học của từng bước](#4-cơ-sở-toán-học)
5. [Chi tiết triển khai & các bẫy kỹ thuật](#5-chi tiết-triển-khai)
6. [Code đầy đủ](#6-code-đầy-đủ)
7. [Diễn biến chạy thật](#7-diễn-biến-chạy-thật)
8. [Bài học phòng thủ](#8-bài-học-phòng-thủ)

---

## 1. Tổng quan thử thách

| | |
|---|---|
| **Category** | Cryptography: Hard |
| **Tác giả** | watermelon, Donkey |
| **Server** | `nc lonely-island.picoctf.net <port>` |
| **File** | `remote.py` |

Câu chuyện: intern "vibe code" một dịch vụ *nhân vô hướng bảo mật* dùng chính khóa AES của công ty, và tin rằng phép tính tuyến tính không thể làm lộ khóa. Nhiệm vụ: lấy flag từ bản mã AES-CBC được in ra đầu mỗi kết nối.

Mô hình bài toán ở mức tổng quát:

```
Server giữ vector bí mật K = (k₀,…,k₃₁)   # 32 byte AES key
Client gửi vector v bất kỳ
Server trả về ⟨v, K⟩ = Σ vᵢ·kᵢ            # nếu v "đáng tin"
```

Nếu gửi tự do, chỉ cần **vector đơn vị** `e_j = [0,…,1,…,0]` là trả về ngay `kⱼ`: hết trò chơi sau 32 câu hỏi. Toàn bộ độ khó nằm ở lớp "kiểm tra độ tin cậy" mà server tự đặt ra.

---

## 2. Phân tích source code

### 2.1 Luồng chính (`main`)

```python
flag = read_flag()
key = secrets.token_bytes(KEY_SIZE)          # 32 byte, MỖI KẾT NỐI một key mới
iv, ciphertext = encrypt_flag(flag, key)     # AES-128? không: AES-256 (key 32 B), CBC
print(f"IV: {iv.hex()}"); print(f"Ciphertext: {ciphertext.hex()}")
service = SecureDotProductService(key)
service.run()
```

Điểm quan trọng: **key sinh lại ngẫu nhiên mỗi lần connect**. Không thể gom thông tin về cùng một key qua nhiều phiên → mọi thứ phải giải quyết trong **một kết nối duy nhất** (hoặc retry lấy instance mới khi bất lợi: xem §4.4).

### 2.2 Khởi tạo service

```python
KEY_SIZE = 32
SALT_SIZE = 256                              # ← độ dài salt BIẾT TRƯỚC, cứng trên source!

self.key_vector = [byte for byte in key]     # K dưới dạng list 32 số nguyên 0..255
self.salt = secrets.token_bytes(SALT_SIZE)   # salt bí mật, không bao giờ in ra
self.trusted_vectors = self.generate_trusted_vectors()
```

```python
def generate_trusted_vectors(self):
    for _ in range(5):
        length = random.randint(1, 32)                       # Li ∈ [1,32]
        vector = [random.randint(-2**8, 2**8) for _ in range(length)]
        trusted_vectors.append((vector, self.hash_vector(str(vector))))
    return trusted_vectors
```

5 cặp `(vector, hash)` được **in thẳng cho người chơi**:

```python
for pair in self.trusted_vectors:
    print(pair)          # vd: ([-85, 89, 70], 'cba0efb4adb9…')
```

Đây là "lời mời" duy nhất ta có vào cơ chế hash.

### 2.3 Hàm hash: trái tim của lỗ hổng #1

```python
def hash_vector(self, vector):               # vector là STRING
    vector_encoding = vector[1:-1].encode('latin-1')     # bỏ 1 ký tự ĐẦU và 1 ký tự CUỐI
    return hashlib.sha512(self.salt + vector_encoding).digest().hex()
```

Ba quan sát sống còn:

1. Hash tính trên `salt ‖ input[1:-1]`: ký tự đầu/cuối **không** tham gia hash nhưng (sẽ thấy) **vẫn** tham gia parse.
2. `SALT_SIZE = 256` viết cứng → **độ dài tiền tố bí mật biết trước** → điều kiện cần để length-extension.
3. SHA-512 thuần Merkle-Damgård, output đúng bằng chaining state cuối → state trung gian **khôi phục được từ digest**.

Với trusted vector, chuỗi bị hash là phần giữa của `str(list)`:
`str([-85, 89, 70]) = "[-85, 89, 70]"` → middle `"-85, 89, 70"` (dấu `-`, khoảng cách ` `, dấu phẩy: y nguyên như Python in ra).

### 2.4 Parser: lỗ hổng #2 nằm ở THỨ TỰ

```python
def parse_vector(self, vector):
    sanitized = "".join(c if c in '0123456789,[]' else '' for c in vector)
    parsed = ast.literal_eval(sanitized)      # chỉ chữ số, phẩy, ngoặc vuông
    ...
```

```python
vector_input = input("Enter your vector: ")
vector_input = vector_input.encode().decode('unicode_escape')   # (a) decode escape
vector = self.parse_vector(vector_input)                        # (b) SANITIZE rồi eval
vector_hash = self.hash_vector(vector_input)                    # (c) HASH trên chuỗi GỐC
...
input_hash = input("Enter its salted hash: ")                   # (d) TA TỰ NÊN HASH
if not vector_hash == input_hash: break                         # sai là mất kết nối
dot_product = self.dot_product(vector)
```

Thứ tự xử lý: **decode → (sanitize→parse) song song với (hash)**. Hai đường nhìn hai "chân dung" khác nhau của cùng một input:

| Đường | Nhìn thấy | Bị che |
|---|---|---|
| **hash (c)** | toàn bộ chuỗi sau decode, trừ ký tự đầu/cuối |: |
| **parse (b)** | chỉ `[0-9 , [ ]]` | `-`, khoảng trắng, `\x00`, `\x80`, toàn bộ byte lạ |

Mọi ký tự "lạ" tồn tại trong hash nhưng **biến mất** khỏi phép tính nhân vô hướng. Đây là khe hổng để "nói dối phân biệt": một input, hai cách hiểu.

### 2.5 Dot product: vì sao đáng giành quyền kiểm soát

```python
def dot_product(self, vector):
    return sum(vector_entry * key_entry for vector_entry, key_entry in zip(vector, self.key_vector))
```

`zip` cắt theo vector ngắn hơn → tối đa 32 hệ số. Trả về số nguyên **tự do, có dấu**, chính xác tuyệt đối (không modulo, không nhiễu). Một oracle tuyến tính lý tưởng nếu ta kiểm soát được hệ số.

---

## 3. Chuỗi 3 lỗ hổng

```
[LỖI 1: Length extension SHA-512] ──▶ forge hash cho input TUỲ Ý có đuôi mở rộng
        │
[LỖI 2: Hash trước: sanitize sau] ──▶ padding "vô hình", suffix "sống sót" → chèn HỆ SỐ tùy ý
        │
[LỖI 3: Oracle tuyến tính]         ──▶ one-hot isolate từng byte khóa + giải hệ residual
```

### 3.1 Lỗi 1: Length Extension Attack (LEA)

SHA-512 (như MD5/SHA-1) xây theo Merkle-Damgård:

```
H(m) = Compress*(IV, m ‖ pad(m))
pad(L) = 0x80 ‖ 0x00… ‖ bitlen_128bit(L)      với số zero z sao cho (L + 1 + z + 16) ≡ 0 (mod 128)
                          z = (111 − L mod 128) mod 128
```

Thuộc tính chí mạng: cho trước `H(salt‖M)` **và độ dài** `len(salt‖M)`, ta tính được state bên trong sau khi hấp thụ `salt‖M‖pad(len)`, rồi tiếp tục "nặn" thêm:

```
H(salt‖M‖GLUE‖X) = Compress*( state_from_digest , X ‖ fpad )
```

với `GLUE = pad(len(salt‖M))` (server sẽ hấp thụ nó như một phần message), còn `fpad = pad(TỔNG độ dài)` chứa **bit-length tổng** `(len(salt‖M)+len(GLUE)+len(X))·8`. Vì SHA-512 **không có finalization nào ngoài padding**, digest chính là chaining state → không cần brute-force gì thêm.

Điều kiện vận dụng: biết `len(salt)`: và server **tự tay ghi `SALT_SIZE = 256`** lên source. Không có độ dài này thì LEA chết ngay từ cửa.

### 3.2 Lỗi 2: Một input, hai cách hiểu (hash ≠ eval)

Ta gửi một dòng duy nhất có dạng (sau khi server decode escape):

```
S' = "[" + M + GLUE + X + "]"
```

- **Hash check:** server tính `sha512(salt + S'[1:-1]) = sha512(salt + M + GLUE + X)`: đúng bằng cái ta forge ở §3.1 với `X` là suffix do ta chọn. ✅
- **Parse:** sanitize xóa ký tự đầu/cuối? Không: sanitize chỉ **lọc**, không cắt. Nó giữ lại từ TOÀN BỘ chuỗi:

```
sanitize(S') = "[" + digits(M) + digits(GLUE) + digits(X) + "]"
```

với `digits(·)` = xóa mọi thứ ngoài `[0-9,[]]`.

Hai hiệu ứng kỳ diệu:
- `digits(GLUE) ≈ ∅`: glue gồm `\x80`, hàng chục `\x00` và trường độ dài 16 byte: gần như toàn bộ không thuộc bảng giữ lại → **padding trở nên vô hình với parser**.
- `digits(M)` cố định (ta không đổi được: đó là "giá" phải trả, xem §4.3) nhưng `digits(X)` **hoàn toàn do ta chọn**: chỉ cần X viết bằng chữ số và dấu phẩy.

Ví dụ bằng số liệu thật từ mock run (trusted[0]):

```
in ra màn hình : (-243, -246, -130, 234, …, -231), '78ecdea1aa7d4bc8…'
M              = "-243, -246, -130, 234, …, -231"
input gửi đi   = "[" + M + <130 byte glue> + "]"          (suffix rỗng)
hash server tính: sha512(salt ‖ "-243, …, -231" ‖ GLUE)   = forged ✔
sanitize thành : "[243,246,130,234,…,231]"                ← DẤU TRỪ BIẾN MẤT!
parsed         = [243,246,130,234,…,231]                  = |trusted[0]|
server trả     : 477364                                   = ⟨|trusted[0]|, K⟩
```

Thêm suffix `",1"`:

```
input           = "[" + M + GLUE + ",1]"
parsed          = [243,246,130,234,…,231, 1]
server trả      : 477470
hiệu            : 477470 − 477364 = 106  =  k₂₅     ← một byte khóa lộ trong 1 query
```

### 3.3 Lỗi 3: Đại số tuyến tính kết liễu khóa

Gọi `Aᵢ = [|vᵢ₀|, …, |vᵢ,Lᵢ−1|]` (prefix ép buộc của trusted i, đã qua sanitize) và tail `t`. Mọi query đều cho phương trình **hệ số biết đầy đủ**:

```
⟨Aᵢ ‖ t , K⟩ = r
```

Chiến thuật:
1. **Baseline** mỗi i (`t = ∅`): `bᵢ = Σ_{k<Lᵢ} Aᵢ[k]·k_k`
2. **One-hot** tại vị trí `j ≥ Lᵢ` (`t` toàn 0, số 1 tại `j − Lᵢ`): `r = bᵢ + k_j` ⟹ **`k_j = r − bᵢ`**

Chỉ cần `min(Lᵢ) ≤ j`. Các index `j < min(Lᵢ)` **không bao giờ** xuất hiện ở vùng tail → không isolate trực tiếp được. Nhưng 5 baseline vẫn cung cấp 5 phương trình chứa chúng; thay các `k_j` đã biết vào, còn lại hệ nhỏ `|U| = minL` ẩn: giải **trên ℚ** (Fraction Gaussian elimination), nghiệm phải nguyên trong `[0,255]`.

---

## 4. Cơ sở toán học bổ sung

### 4.1 Byte layout của GLUE (vì sao gần như "vô hình")

Ví dụ `len(M) = 11` → `L = 267`, `z = (111 − 267 mod 128) mod 128 = 100`:

```
GLUE = 80 00 00 … 00 [13 byte 0x00] [00 00 … 08 50]   ← bitlen = 267·8 = 2136 = 0x850
       │   └── 100 byte zero                          └ 16-byte big-endian
       └ \x80
```

Các giá trị byte xuất hiện: `0x80`, `0x00`, và các byte của `8·L`. Trong bảng `[0-9,[]]` chỉ có khoảng `0x30-0x39`. Byte thấp `8L mod 256` rơi vào `0x30..0x39` với xác suất ~10/256 ≈ 4%: khi đó MỘT chữ số "rác" chèn giữa prefix và suffix (ví dụ `"…27" + "0" + ",1"` → token `270`). Ta **không chống lại** hiện tượng này mà **mô phỏng đúng** nó: client tự chạy `sanitize + literal_eval` trên chuỗi decode để suy ra hệ số thật (xem §5.3). Trường hợp xấu nhất (`"…, 0" + "0"` → `00` → `literal_eval` lỗi → server báo *Invalid vector*, không crash) hiếm (~0.4%/vector) → reconnect.

### 4.2 Độ khó của việc forge mà KHÔNG dùng LEA

Chỉ dùng 5 hash gốc, `S'[1:-1]` buộc phải **trùng từng byte** middle của một trusted vector (SHA-512 kháng collision), suy ra parse chỉ cho đúng 5 vector `|vᵢ|`: 5 phương trình / 32 ẩn. LEA là cánh cửa duy nhất mở rộng không gian input.

### 4.3 Vì sao prefix là "giá hardcoded"

State khởi điểm của LEA đến từ digest của một trusted middle cụ thể `Mᵢ` → message phía server bắt buộc bắt đầu bằng `Mᵢ` → các hệ số `k₀…k_{Lᵢ−1}` bị khóa vào `|vᵢ|`. Không có cách loại bỏ (digit không thể bị sanitize xóa). Hệ quả trực tiếp của ràng buộc này: **ranh giới isolate `j ≥ Lᵢ`**.

### 4.4 Xác suất "không giải được": đúng như hint của đề

`Lᵢ ~ Uniform{1..32}`, i.i.d. 5 mẫu:

```
P(minL ≥ m) = ((33 − m)/32)^5
P(minL ≥ 6) = (27/32)^5 ≈ 42.8%        → hệ residual thiếu hạng (5 eq < minL ẩn)
E[minL] ≈ 5.3
```

Khi `minL ≥ 6`, đại số tuyến tính bế tắc thật sự (mọi query đều mang prefix giống nhau trên các cột `< minL`, span ≤ 5 chiều). Giải pháp thực tiễn: **detect → ngắt kết nối → nhận instance mới** (key/ciphertext/vectors đổi hết nhưng ta cũng chưa tốn gì). Câu hint *"it might not always be solvable"* chính là nói về trường hợp này.

---

## 5. Chi tiết triển khai

### 5.1 Giao thức truyền: bẫy `unicode_escape` và UTF-8

Server đọc stdin bằng `input()` (text mode, UTF-8) rồi `.encode().decode('unicode_escape')`:

- Gửi byte thô `0x80` → `UnicodeDecodeError` **crash server**. ❌
- Gửi chuỗi ASCII `"\x80"` (4 ký tự `\`,`x`,`8`,`0`) → decode ra 1 ký tự `U+0080`; `hash_vector` encode `'latin-1'` trả về đúng byte `0x80`. ✅

Hàm encode dây:

```python
def escape_wire(decoded):
    out = bytearray()
    for ch in decoded:
        b = ord(ch)
        if ch == '\\': out += b'\\x5c'
        elif 32 <= b <= 126: out.append(b)          # in được → giữ nguyên
        else: out += b'\\x02x' % b                  # → dạng \xNN
    return bytes(out)
```

### 5.2 SHA-512 thuần Python

`hashlib` không cho "resume" từ state giữa → tự viết compression function (80 vòng, word 64-bit). Hai bài học khi viết:

1. **Không gõ tay 80 hằng số K**: tôi gõ thiếu 2 cái và ăn `IndexError`. Sinh chuẩn từ định nghĩa: `K[i] = floor(frac(p_i^(1/3)) · 2^64)`, `IV[i] = floor(frac(p_i^(1/2)) · 2^64)` bằng integer_nthroot chính xác, rồi assert đối chiếu hashlib.
2. **Bug dịch tuple kinh điển** trong vòng round:
```python
hh,g,f,e,d,c,b,a = g,f,e,d,(d+t1)&M64,c,b,(a+t1+t2)&M64   # SAI: lệch 1 vị trí từ 'e' trở đi
hh,g,f,e,d,c,b,a = g,f,e,(d+t1)&M64,c,b,a,(t1+t2)&M64     # ĐÚNG theo FIPS
```
Test bắt cả hai: so multi-block với hashlib + so extension với `sha512(secret‖M‖appended)` thật.

### 5.3 Mô phỏng parser phía client: nguyên tắc "đừng tin giả định"

Thay vì giả định `coefficients = |trusted| + tail`, client tự chạy **đúng** hàm `sanitize + ast.literal_eval` trên chuỗi decoded để suy ra hàng hệ số của từng query (bắt đúng cả trường hợp chữ số rác từ glue ở §4.1). Đồng thời assert `coeffs_onehot == coeffs_baseline ⊕ e_j`: nếu vi phạm tức có hiểu nhầm mô hình → abort attempt.

### 5.4 Những bug thực tế đã gặp & sửa (dành cho người làm lại)

| Hiện tượng | Nguyên nhân | Fix |
|---|---|---|
| `IndexError: list index out of range` trong round 80 | gõ tay thiếu 2 hằng K | derive từ căn bậc ba nguyên tố |
| digest lệch hoàn toàn trên 1 block | tuple-shift ở dòng cập nhật round | sửa theo FIPS, test `abc` |
| LEA fail dù code "đúng" | nạp GLUE vào stream compress (state đã đứng SAO glue) + quên cộng `extra` vào bytes trả về | stream = `extra ‖ fpad`; trả `glue ‖ extra` |
| Mock treo vô hạn | recv prompt lần 2 trong khi banner đã consume tới prompt đầu | flag `self.first` trong `Session.query` |
| Chạy script redirect file mất toàn bộ log | stdout block-buffer khi pipe | `python3 -u` hoặc flush |

### 5.5 Số lượng query

```
5 baseline + Σ_{j=minL}^{31} 1 one-hot = 5 + (32 − minL)   ≈ 30-36 queries
```
Mỗi query 2 lượt send/recv → chạy mạng thật ~25 giây.

---

## 6. Code đầy đủ

### 6.1 `sha512_ext.py`

```python
import struct

M64 = 0xFFFFFFFFFFFFFFFF

def _iroot(n, k):                     # căn bậc k nguyên chính xác (Newton)
    if n == 0: return 0
    x = 1 << ((n.bit_length() + k - 1)//k + 1)
    while True:
        y = ((k-1)*x + n // x**(k-1)) // k
        if y >= x: break
        x = y
    while x**k > n: x -= 1
    return x

def _primes(count):
    ps, n = [], 2
    while len(ps) < count:
        if all(n % p for p in ps): ps.append(n)
        n += 1
    return ps

def _frac_bits(p, root_order, bits):  # frac(p^(1/k)) lấy bits bit cao nhất
    S = ((bits + 31)//32)*32 * 2
    S -= S % root_order
    r = _iroot(p << (root_order*S), root_order)
    return (r & ((1 << S) - 1)) >> (S - bits)

K  = [_frac_bits(p, 3, 64) for p in _primes(80)]   # hằng số round
IV = [_frac_bits(p, 2, 64) for p in _primes(8)]    # state khởi tạo

def _rotr(x, n): return ((x >> n) | (x << (64 - n))) & M64

def compress(h, block):               # 1 block 128B, h = list 8 u64
    w = list(struct.unpack('>16Q', block))
    for i in range(16, 80):
        s0 = _rotr(w[i-15],1) ^ _rotr(w[i-15],8) ^ (w[i-15] >> 7)
        s1 = _rotr(w[i-2],19) ^ _rotr(w[i-2],61) ^ (w[i-2] >> 6)
        w.append((w[i-16] + s0 + w[i-7] + s1) & M64)
    a,b,c,d,e,f,g,hh = h
    for i in range(80):
        S1  = _rotr(e,14) ^ _rotr(e,18) ^ _rotr(e,41)
        ch  = (e & f) ^ (~e & g)
        t1  = (hh + S1 + ch + K[i] + w[i]) & M64
        S0  = _rotr(a,28) ^ _rotr(a,34) ^ _rotr(a,39)
        maj = (a & b) ^ (a & c) ^ (b & c)
        t2  = (S0 + maj) & M64
        hh,g,f,e,d,c,b,a = g,f,e,(d+t1)&M64,c,b,a,(t1+t2)&M64
    return [(x+y) & M64 for x,y in zip(h,[a,b,c,d,e,f,g,hh])]

def sha512_padding(msg_len):
    z = (111 - msg_len % 128) % 128
    return b'\x80' + b'\x00'*z + (msg_len*8).to_bytes(16,'big')

def sha512_full(data):
    h = list(IV); padded = data + sha512_padding(len(data))
    for off in range(0, len(padded), 128):
        h = compress(h, padded[off:off+128])
    return struct.pack('>8Q', *h)

def length_extend(orig_digest, prefix_len, extra):
    """digest = SHA512(secret‖M), prefix_len = len(secret‖M)
    → (SHA512(secret‖M‖GLUE‖extra), GLUE‖extra)"""
    h = list(struct.unpack('>8Q', orig_digest))
    glue = sha512_padding(prefix_len)
    G = prefix_len + len(glue)                    # ranh giới align 128B
    t = G + len(extra)
    fpad = b'\x80' + b'\x00'*((111 - t % 128) % 128) + (t*8).to_bytes(16,'big')
    stream = extra + fpad                         # bội của 128
    assert len(stream) % 128 == 0
    for off in range(0, len(stream), 128):
        h = compress(h, stream[off:off+128])
    return struct.pack('>8Q', *h), glue + extra
```

### 6.2 `solve.py` (bản rút gọn phần chính, file đầy đủ trong repo)

```python
KEEP = set('0123456789,[]')

def escape_wire(decoded):
    out = bytearray()
    for ch in decoded:
        b = ord(ch)
        if ch == '\\': out += b'\\x5c'
        elif 32 <= b <= 126: out.append(b)
        else: out += b'\\x%02x' % b
    return bytes(out)

def sanitize_parse(decoded):                      # bắt chước y hệt server
    return ast.literal_eval(''.join(c for c in decoded if c in KEEP))

class Session:
    def __init__(self, io):
        blob = io.recvuntil(b'Enter your vector:', timeout=20)
        self.iv = bytes.fromhex(re.search(rb'IV:\s*([0-9a-f]+)', blob).group(1).decode())
        self.ct = bytes.fromhex(re.search(rb'Ciphertext:\s*([0-9a-f]+)', blob).group(1).decode())
        pairs = re.findall(rb'\((\[[^\]]*\]),\s*\'([0-9a-f]{128})\'\)', blob)
        self.vecs    = [ast.literal_eval(p[0].decode()) for p in pairs]
        self.digests = [bytes.fromhex(p[1].decode()) for p in pairs]
        self.mids    = [str(v)[1:-1] for v in self.vecs]
        self.lens    = [len(v) for v in self.vecs]
        self.first   = True

    def query(self, i, tail):
        extra = ('' if not tail else ',' + ','.join(map(str, tail))).encode()
        forged, appended = length_extend(self.digests[i], 256 + len(self.mids[i]), extra)
        decoded = '[' + self.mids[i] + appended.decode('latin-1') + ']'
        if not self.first:                                    # prompt đầu đã consume
            self.io.recvuntil(b'Enter your vector:', timeout=20)
        self.first = False
        self.io.sendline(escape_wire(decoded))
        self.io.recvuntil(b'Enter its salted hash:', timeout=20)
        self.io.sendline(forged.hex().encode())
        self.io.recvuntil(b'The computed dot product is: ', timeout=20)
        val = int(self.io.recvline(timeout=20).strip())
        return sanitize_parse(decoded)[:32], val

def solve_rational(rows, n):
    """Gaussian elimination trên Fraction: nghiệm duy nhất hoặc None."""
    A = [[Fraction(c) for c in row[0]] + [Fraction(row[1])] for row in rows]
    piv_cols, r = [], 0
    for c in range(n):
        p = next((i for i in range(r, len(A)) if A[i][c] != 0), None)
        if p is None: continue
        A[r], A[p] = A[p], A[r]; pv = A[r][c]
        A[r] = [x / pv for x in A[r]]
        for i in range(len(A)):
            if i != r and A[i][c] != 0:
                f = A[i][c]; A[i] = [x - f*y for x,y in zip(A[i], A[r])]
        piv_cols.append(c); r += 1
        if r == len(A): break
    if len(piv_cols) < n: return None
    for i in range(r, len(A)):
        if all(x == 0 for x in A[i][:n]) and A[i][n] != 0: return None
    x = [None]*n
    for i,c in enumerate(piv_cols): x[c] = A[i][n]
    return x

def attempt(io):
    s = Session(io)
    minL = min(s.lens)
    if minL > 5: raise Retry('minL=%d -> reconnect' % minL)

    baselines = [s.query(i, []) for i in range(5)]
    key = [None]*32
    for j in range(minL, 32):
        i = min([t for t in range(5) if s.lens[t] <= j], key=lambda t: s.lens[t])
        coeffs, val = s.query(i, [0]*(j - s.lens[i]) + [1])
        base_c, base_v = baselines[i]
        assert coeffs == base_c + [0]*(j - s.lens[i]) + [1]   # model sanity
        kj = val - base_v
        if not 0 <= kj <= 255: raise Retry('byte out of range')
        key[j] = kj

    unknown = list(range(minL)); rows = []
    for i in range(5):
        co, rhs0 = baselines[i]
        known = sum(co[k]*key[k] for k in range(minL, len(co)))
        rows.append(([co[k] for k in unknown], rhs0 - known))
    sol = solve_rational(rows, len(unknown))
    if sol is None: raise Retry('underdetermined')
    for k,x in zip(unknown, sol):
        if x.denominator != 1 or not 0 <= x <= 255: raise Retry('bad residual')
        key[k] = int(x)

    pt = unpad(AES.new(bytes(key), AES.MODE_CBC, s.iv).decrypt(s.ct), 16)
    return key, pt

def main():
    for att in range(12):                       # retry khi gặp minL > 5 / lỗi tạm thời
        try:
            io = remote(HOST, port, timeout=20)
            key, pt = attempt(io)
            print('[+] key:', bytes(key).hex()); print('[+] FLAG:', pt.decode())
            return
        except Exception as e:
            print('[-]', e); time.sleep(1)
```

---

## 7. Diễn biến chạy thật

### 7.1 Transcript minh họa (mock, số liệu thật)

```
trusted[0] : vec=[-243, -246, -130, 234, …, -231]   len=25
             mid='-243, -246, -130, 234, …, -231'
             digest=78ecdea1aa7d4bc8…

TX1 baseline:
  glue (130B)   : 80 00 00 … 00 || bitlen(16B)
  decoded input : '[-243, -246, …, -231]'
  forged hash   : 08a4d7a89ae91b45…
  sanitized str : '[243,246,130,234,…,231]'        ← dấu '-' bị sanitize nuốt
  server answer : 477364                            = ⟨|trusted[0]|, K⟩

TX2 one-hot j=25 (suffix ",1"):
  coefficients  : […231, 1]
  server answer : 477470
  key[25]       = 477470 − 477364 = 106 ∈ [0,255] ✔

FULL SOLVE (instance khác):
  recovered AES key: 5ca9eb4950b57a2615cf8924926d2ed7a036cf8536f04510170ef899fe0bd1bd
  decrypted flag   : picoCTF{local_mock_flag_for_testing}
```

### 7.2 Live: `lonely-island.picoctf.net:58804`

```
$ python3 solve.py live 58804
[-] attempt 1 failed: min(trusted lens)=6 > 5 -> underdetermined, reconnect
[+] attempt 2 solved in 24.8s
[+] AES key: 761ed0c65ceb8b10745b61ed58197b649719ad08000c30efe2bdfc22ff482606
[+] FLAG: picoCTF{n0t_so_s3cure_.x_w1th_sh@512_cabf48c0}
```

Attempt 1 dính xác suất ~42.8% (`minL = 6`): solver phát hiện, reconnect, thắng ở lượt sau. Toàn bộ từ connect đến flag < 30 giây, gọn trong 1 window 15 phút của instance.

---

## 8. Bài học phòng thủ

1. **Không bao giờ tự chế MAC bằng `SHA-512(secret ‖ msg)`.** Dùng HMAC: thiết kế của HMAC tồn tại chính để triệt tiêu length-extension kể cả khi độ dài key lộ/đoán được.
2. **Canonicalize trước, hash sau.** Kiểm tra tính hợp lệ trên **đúng representation sẽ được evaluate**: hash chuỗi ĐÃ sanitize/normalize, hoặc từ chối mọi ký tự ngoài whitelist ngay từ đầu (reject, đừng "strip cho lành").
3. **Trust boundary:** đừng phát hành cặp `(dữ liệu, MAC)` rồi tin rằng dữ liệu đó "an toàn": attacker được phép tái sử dụng MAC với bất kỳ message nào mà MAC vẫn xác thực được. Ở đây 5 cặp trusted trở thành 5 mồi LEA.
4. **Oracle số học:** trả lời chính xác `Σ vᵢkᵢ` cho input điều khiển được tương đương giao nộp khóa. Nếu bắt buộc, giới hạn cấu trúc input (ví dụ chỉ nhận vector server sinh), thêm noise/rounding, hoặc rate-limit nghiêm ngặt.
5. **Side note triển khai:** `zip()` cắt im lặng, `ast.literal_eval` từ chối số có số 0 dẫn đầu, `unicode_escape` là cổng vào dữ liệu "ma": cả ba đều là nguồn bug bảo mật kinh điển khi mix giữa world nhị phân và world văn bản.

---
*Lưu ý: mọi thử nghiệm trên live service được thực hiện trong khuôn khổ picoCTF (có ủy quyền).*
