<img width="787" height="637" alt="image" src="https://github.com/user-attachments/assets/8eb55b08-f358-467e-83a9-16d54f0f331b" />
# Writeup: ChaCha Slide (picoCTF 2025: Cryptography, Hard, 400pt)

## Flag
```
picoCTF{7urn_17_84ck_n0w_a080fb27}
```

## 1. Tổng quan

**Challenge:** "ChaCha Slide": server dùng ChaCha20-Poly1305 để mã hóa 2 message có sẵn, rồi yêu cầu ta gửi 1 bản mã sao cho sau khi giải mã, plaintext chứa chuỗi goal `"But it's only secure if used correctly!"`.

**Lỗ hổng cốt lõi:** `nonce` bị **tái sử dụng** cho cả 2 message (cùng `key`, cùng `nonce`). Điều này phá vỡ **cả confidentiality lẫn integrity** của AEAD.

## 2. Phân tích mã nguồn

```python
key = shasum(shasum(secrets.token_bytes(32) + flag.encode()))   # key cố định, bí mật
nonce = secrets.token_bytes(12)                                  # TÁI SỬ DỤNG cho cả 2 message

def encrypt(message):
    cipher = ChaCha20_Poly1305.new(key=key, nonce=nonce)         # nonce GIỐNG nhau
    ciphertext, tag = cipher.encrypt_and_digest(message)
    return ciphertext + tag + nonce                              # nonce bị lộ (nằm ở đuôi)

def decrypt(message_enc):
    ciphertext = message_enc[:-28]
    tag = message_enc[-28:-12]
    nonce = message_enc[-12:]                                    # nonce do ta chọn
    ...
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)       # verify tag
```

2 điểm mấu chốt:
1. `encrypt()` dùng **cùng `nonce`** cho cả 2 message → keystream và khóa Poly1305 bị lặp.
2. Định dạng bản mã là `ciphertext || tag(16B) || nonce(12B)` → ta biết chính xác `nonce`.

## 3. Kiến thức nền: ChaCha20-Poly1305

- **ChaCha20** là stream cipher: `ciphertext = plaintext XOR keystream(key, nonce, counter)`.
- **Poly1305** là MAC: key một lần `(r, s)` = 32 byte đầu của block ChaCha20 counter=0 (được sinh từ key+nonce).
- Poly1305 tính: `tag = (poly(r, M) + s) mod 2^128`, trong đó `poly(r, M)` là **đa thức bậc L** theo `r` trên trường `GF(2^130 - 5)`, hệ số từ các block 16 byte của `M`.
- Input cho Poly1305 (AEAD, không có AAD): `M = C || pad(C) || le64(len(AAD)) || le64(len(C))`.
- `r` bị **clamp** (một số bit bị ép về 0): `r & 0x0ffffffc0ffffffc0ffffffc0fffffff == r`.

**Vì sao nonce reuse là thảm họa:** cùng nonce → cùng keystream → cùng `(r,s)`. Ta có 2 cặp `(message, tag)` cùng `(r,s)` → khử `s` bằng cách trừ 2 tag, còn lại đa thức theo `r` → giải nghiệm → lấy `r`, suy `s` → giả mạo tag tùy ý.

## 4. Các bước tấn công

### Bước 1: Khôi phục keystream
```python
keystream = bytes(a ^ b for a, b in zip(m1, ct1))   # vì ct1 = m1 XOR keystream
```
→ mã hóa được bất kỳ plaintext nào (miễn ≤ độ dài keystream) mà không cần key.

### Bước 2: Khôi phục khóa Poly1305 (r, s)
Với 2 cặp `(M1, tag1)` và `(M2, tag2)` cùng `(r, s)`:
```
tag1 = poly(r, M1) + s   (mod 2^128)
tag2 = poly(r, M2) + s   (mod 2^128)
=>  poly(r, M1) - poly(r, M2) - (tag1 - tag2) = 0   (mod 2^130 - 5)
```
Đây là đa thức bậc ≤6 theo `r`. Giải nghiệm trên `GF(2^130-5)`, lọc nghiệm thỏa **clamp**, rồi:
```
s = (tag1 - poly(r, M1)) mod 2^128
```

**Lưu ý quan trọng (bẫy):** `tag` được cắt về 128 bit nên giá trị thật của `(acc + s)` có thể là `tag + k·2^128` với `k ∈ {0..4}`. Phải thử **mọi `k`** (vòng lặp `range(tag, p + 2^128, 2^128)`).

### Bước 3: Giả mạo và nộp
```python
target_ct   = bytes(a ^ b for a, b in zip(keystream, goal))
target_tag  = poly1305(merger(b"", target_ct), r, s)   # key = r||s
submission  = target_ct + target_tag + nonce
```

## 5. Khó khăn kỹ thuật (và cách vượt qua)

1. **Sage không có native** (chỉ wrapper docker, kéo image ~1GB mà mạng chậm). Script tham khảo `chacha_poly1305_forgery.py` dùng `sage.all` → không dùng được.
2. **`sympy` bị lỗi** khi `ground_roots()` trên modulus 130-bit (thư viện flint ném `TypeError`).
3. **Giải pháp:** tự cài đặt **tìm nghiệm đa thức trên GF(p)** bằng pure Python:
   - `g = gcd(f, x^p - x)` → tích các nhân tử tuyến tính phân biệt.
   - Tách nhân tử bằng **Cantor-Zassenhaus**: `gcd(g, (x+a)^((p-1)/2) - 1)`.
   - Đa thức bậc ≤6 nên chạy cực nhanh (< 1 giây).

File `polyutil.py` chứa toàn bộ số học đa thức + tìm nghiệm (đã test với nhiều bộ nghiệm).

## 6. Code exploit

- `solve_chacha.py`: hàm `solve(ct1, tag1, ct2, tag2, m1, goal)` trả về `(target_ct, target_tag)`.
- `polyutil.py`: thư viện `GF(2^130-5)`: `roots_of()`, `poly_gcd`, `poly_powmod`...
- `run_remote.py`: nối server (pwntools), parse 2 ciphertext, nộp, in flag.

## 7. Cách nhận diện dạng này (khi gặp lại)

| Dấu hiệu | Kết luận |
|---|---|
| `ChaCha20_Poly1305.new(key, nonce)` với **cùng nonce** cho nhiều message | Keystream + khóa Poly1305 lặp |
| Server **tiết lộ plaintext** (hoặc 2 ciphertext cùng độ dài phần chung) | Khôi phục được keystream |
| Nonce nằm **ở đuôi bản mã** (hoặc cố định) | Biết nonce, dùng lại được |
| Có **≥2 cặp (ciphertext, tag)** cùng nonce | Giải đa thức lấy (r, s) → forge tag |

Cùng kỹ thuật áp dụng cho **AES-GCM nonce reuse** (GCM dùng GHASH thay vì Poly1305: bản chất tương tự: giải đa thức theo khóa auth H).

## 8. Bài học

- **Không bao giờ tái sử dụng nonce** với stream cipher/AEAD. Một lần lặp = mất cả bí mật lẫn toàn vẹn.
- AEAD misuse-resistant (AES-GCM-SIV, ChaCha20-Poly1305-SIV) chống được vì nonce được dẫn xuất từ chính message.
- Với root-finding trên trường hữu hạn lớn, **Cantor-Zassenhaus pure Python** đủ dùng cho đa thức bậc nhỏ: không cần Sage.
