<img width="830" height="660" alt="image" src="https://github.com/user-attachments/assets/7613955d-3a46-42f2-877a-0ff4af01232d" />

# Writeup: MSS_ADVANCE Revenge (picoCTF 2026 · Cryptography · Hard)

> **Flag:** `picoCTF{MSS_Advance_but_we_brought_it_back_and_made_it_harder!!!}`
> 
> **MASTER_KEY khôi phục:** `1d6466f4c437d790ef4ae9ba2c54cf8b406050f8853fb35ba96ad54bcd8edf0b`
> 
> **Solver:** `sol/solve_mss.py`: tự kiểm chứng `chain=PASS eval=PASS` trước khi trả flag

---

## MỤC LỤC
1. [Tổng quan thử thách](#1-tổng-quan-thử-thách)
2. [Phân tích source code từng dòng](#2-phân-tích-source-code-từng-dòng)
3. [Nhận diện cấu trúc toán học](#3-nhận-diện-cấu-trúc-toán-học)
4. [Lý thuyết lattice attack](#4-lý-thuyết-lattice-attack)
5. [Hành trình debug: hai cái bẫy của đề](#5-hành-trình-debug)
6. [Code solver hoàn chỉnh](#6-code-solver-hoàn-chỉnh)
7. [Kết quả chạy thật](#7-kết-quả-chạy-thật)
8. [Bài học phòng thủ](#8-bài-học-phòng-thủ)

---

## 1. Tổng quan thử thách

| | |
|---|---|
| **Category** | Cryptography: Hard |
| **Tác giả** | Cayden (SuperBeetleGamer) Liao |
| **File** | `chall.py`, `output.txt` |
| **Hint chính thức** | *"What are lattices?"* |

Thông điệp của đề: *"Last time we went easy on you."*: phiên bản trước chắc chắn cho đủ cặp `(x, y)` để nội suy Lagrange trực tiếp. Phiên bản **Revenge** cắt giảm số cặp xuống **thấp hơn số ẩn**, khiến đại số tuyến tính cổ điển bế tắc: nhưng bù lại toàn bộ hệ số đa số là **số nhỏ** trong trường **lớn**: mảnh đất kinh điển cho **lattice reduction**.

## 2. Phân tích source code từng dòng

### 2.1 Chuỗi hash sinh hệ số đa thức

```python
p = getPrime(1024)                       # modulus 1024-bit, in ra output

MASTER_KEY = hashlib.sha256(flag).digest()      # 32 byte = khóa AES
coeffs = [bytes_to_long(MASTER_KEY)]            # c0 = int256
for i in range(29):
    co = hashlib.sha256(long_to_bytes(coeffs[-1])).digest()
    coeffs.append(bytes_to_long(co))            # c_{i+1} = SHA256(c_i)
```

- **30 hệ số** `c₀ … c₂₉`, mỗi cái là một output SHA-256 → **đúng 256 bit**, phân bố đều trong `[0, 2²⁵⁶)` (khả năng byte đầu = 0 là 1/256: không ảnh hưởng).
- Quan hệ ràng buộc: `c_{i+1} = int(SHA256(bytes(c_i)))`: đây là **bộ kiểm chứng miễn phí** sau khi khôi phục: sai một bit chỉ cần là cả chuỗi sụp.

### 2.2 Hàm đánh giá đa thức: nơi chứa cái bẫy lớn nhất đề bài

```python
def eval_poly(x, coeffs):
    total = 0
    for i in range(len(coeffs)):
        total *= x          # ← NHÂN TRƯỚC
        total += coeffs[i]  # ← CỘNG SAU
    return total % p
```

Đây là **Horner's method**展开 theo hướng ngược người ta thường viết:

```
total = (((c₀·x + c₁)·x + c₂)… )   ⇒   y = Σᵢ cᵢ · x^(29−i)
```

⚠️ KHÔNG phải `Σ cᵢ·x^i`! Hệ số `c₀` đứng ở **bậc cao nhất**. Việc xây ma trận Vandermonte theo chiều ngược sẽ cho ra một nghiệm *vẫn thỏa mãn mọi phương trình* nhưng *vô nghĩa với chuỗi hash*: chi tiết ở §5.2, đây là bài học đắt giá nhất của challenge này.

### 2.3 Cặp dữ liệu công khai

```python
pairs = []
for i in range(20):                          # ← CHỈ 20 CẶP!
    x = random.randint(0,p)
    y = eval_poly(x, coeffs)
    pairs.append((x,y))
```

20 cặp cho đa thức 30 ẩn. Nội suy Lagrange cần 30: **thiếu 10 phương trình**. Đây là điểm "revenge".

### 2.4 Mã hóa flag

```python
def encrypt_flag(flag):
    iv = b"\x00"*16                          # IV cố định = 0
    cipher = AES.new(MASTER_KEY, AES.MODE_CBC, iv)
    ...
enc_flag = encrypt_flag(flag)                # in kèm IV + ciphertext
```

AES-256-CBC, key = `MASTER_KEY` (32 byte), IV = 0. Khi có được `c₀` là có flag ngay: không cần phá AES.

## 3. Nhận diện cấu trúc toán học

### 3.1 Hệ phương trình mô-đun nhiều ẩn: ít phương trình

Gọi `A` là ma trận 20×30 với `A[j][i] = xⱼ^(29−i) mod p` (hoặc chiều mũ đảo lại: chỉ ảnh hưởng thứ tự ghi). Hệ:

```
A · c ≡ y   (mod p),    c ∈ ℤ³⁰,  0 ≤ cᵢ < 2²⁵⁶,   p ≈ 2¹⁰²⁴
```

### 3.2 Đếm giải: vì sao nghiệm nhỏ là DUY NHẤT

Không gian nghiệm trên `F_p`: tập `S = {c mod p : Ac ≡ y}` có đúng `p^(30−20) = p¹⁰` phần tử (A hạng đầy đủ 20 vì các `xⱼ` đôi một khác nhau). Coi `p¹⁰` điểm này phân bố "ngẫu nhiên đều" trong hộp `[0,p)³⁰`. Số điểm kỳ vọng rơi vào hộp nhỏ `[-B,B]³⁰` với `B = 2²⁵⁷`:

```
E = p¹⁰ · (2B/p)³⁰ = (2B)³⁰ / p²⁰ = 2^(30·258) / 2^(20·1024) = 2^7740 / 2^20480 = 2^(−12740)
```

→ Ngoài nghiệm thật, xác suất tồn tại nghiệm nhỏ khác là `2^(−12740)`: **duy nhất tuyệt đối** về mặt thực hành. Về mặt thông tin: 20·1024 = 20480 bit ràng buộc >> 30·256 = 7680 bit entropy của ẩn.

Nhưng **biết nó tồn tại** ≠ **tìm được**. Tìm nghiệm nhỏ của hệ mô-đun chính là bài toán **modular knapsack / uSVP**: không có thuật toán đa thức nào ngoài lattice reduction.

## 4. Lý thuyết lattice attack

### 4.1 Ý tưởng

Xây một lattice `L ⊂ ℤ⁵¹` sao cho vector nghiệm `(c, 0…0, 1)` là **vector ngắn nhất duy nhất (unique-SVP)**. LLL/BKZ tìm được khi tỉ lệ gap đủ lớn.

### 4.2 Cấu trúc basis (dim 51)

Ma trận basis gồm 51 hàng × 51 cột, chia 3 khối cột: `[identity 30 | weighted-equations 20 | embedding 1]`:

```
hàng i  (i<30) :  [ e_i │ W·(x_j^i)_j │ 0 ]        ← 30 hàng đơn vị × hệ số mũ
hàng j  (j<20) :  [ 0   │ W·p·e_j    │ 0 ]         ← 20 hàng modulus
hàng y         :  [ 0   │ −W·y       │ 1 ]         ← hàng mục tiêu (Kannan embedding)
```

với trọng số `W = 2²⁸⁰`.

Tổ hợp tuyến tính với hệ số nguyên `(c₀,…,c₂₉, t₁,…,t₂₀, 1)`:

- 30 cột đầu cho ra `(c₀,…,c₂₉)`
- 20 cột giữa: `W·(Σᵢ A[j][i]cᵢ) − W·yⱼ + W·p·tⱼ = W·(Ac − y + pt)_j = 0` (chọn `t` là thương nguyên của `Ac−y = −pt`)
- cột cuối: `1`

⟹ vector `(c, 0, 1) ∈ L`, độ dài `‖(c,0,1)‖ ≈ √30 · 2²⁵⁶/√3 ≈ 3.16·2²⁵⁶ ≈ 2^258`.

### 4.3 Định thức và Gaussian Heuristic

Khối ma trận tam giác theo khối:

```
det(L) = det(I₃₀) · det([W·p·I₂₀ 0; −W·y^T 1]) = (W·p)²⁰ = 2^(20·1304) = 2^26080
det(L)^(1/51) = 2^511.4
GH ≈ sqrt(51/2πe) · det^(1/51) ≈ 1.73 · 2^511.4 ≈ 2^512.3
```

Vector ngắn nhất "ngẫu nhiên kỳ vọng" dài ~2^512, còn mục tiêu của ta chỉ ~2^258:

```
gap = λ₂/λ₁ ≈ 2^(512−258) = 2^254
```

Điều kiện LLL giải uSVP: gap ≳ δ^n với root-Hermite δ ≈ 1.02 → δ⁵¹ ≈ 2.9 ≈ 2^1.5. Gap của ta **2^254 ≫ 2^1.5**: dư sức vô cùng, LLL thuần túy là quá đủ (không cần BKZ).

### 4.4 Vai trò của W

`W` phải **lớn hơn chuẩn của phần đầu** (~2^258): mọi vector có thành phần tail ≠ 0 bị phạt tối thiểu ~W = 2^280 > 2^258, đảm bảo nghiệm thật (tail = 0) nghiễm nhiên ngắn nhất. Chọn W quá nhỏ → các vector "rò rỉ" tail có thể thắng; quá lớn làm entries phình (W·p ≈ 2^1304) giảm tốc độ: `2^280` là lựa chọn vừa đẹp.

Ghi chú triển khai: các entry `W·A[j][i]` vốn `< W·p` (vì `A < p`) nên phép `% (W*p)` chỉ là bảo hiểm vô hại.

## 5. Hành trình debug

### 5.1 Bug #1: Đảo dấu khi đọc kết quả LLL

LLL trả về ±v. Bản đầu tiên tôi viết `c = [(−sgn)·v % p ...]` → đúng nghiệm bị đổi thành `p − v` (khổng lồ), filter `0 < v < 2^300` lặng lẽ loại hết → `"no valid solution found"` mà không một dòng log. Bài học: **dump chẩn đoán trước khi kết luận**: một bảng thống kê từng hàng (giá trị cột embedding, số bit max của head, tail) lập tức lộ rõ:

```
row  0: last=  1   maxhead_bits= 256   tailmax_bits=0     ← (c, 0, 1): NGHIỆM!
row  1: last=  0   maxhead_bits=  1    tailmax_bits=281   ← kernel vector nhỏ
row 2+: last=±huge                  ...                     ← noise
```

Row 0: cột embedding đúng bằng ±1, 30 hệ số đầu đúng 256 bit, tail toàn 0: chữ ký không thể nhầm của nghiệm.

### 5.2 Bug #2: Horner: nghiệm đúng của hệ SAI (chiêu thức của đề)

Sau khi sửa dấu: `eval=PASS` (thỏa cả 20 phương trình) nhưng `chain=fail` (chuỗi hash gãy). **Mâu thuẫn logic**: dùng chính nó để suy luận:

1. §3.2 chứng minh nghiệm nhỏ **duy nhất**;
2. Vector khôi phục thỏa hệ tôi xây ⟹ nó **là** nghiệm của hệ đó;
3. Nhưng nó không thỏa chuỗi hash ⟹ **hệ tôi xây ≠ hệ của đề**;
4. Đọc lại `eval_poly`: nhân trước cộng sau → **Horner** → `y = Σ cᵢ·x^(29−i)`;
5. Ma trận của tôi dùng `x^i` ⟹ đang giải cho vector **đảo ngược** `c'ₖ = c₂₉₋ₖ`: và nó thỏa mọi phương trình vì hệ của đề với hệ số đảo cũng chính là hệ của tôi!

Fix: `coeffs = reversed(recovered)`. Ngay lập tức: `chain=PASS`, `sha256(coeffs[0].to_bytes(32,'big'))` khớp khóa AES, giải mã ra flag. Nếu không có cơ chế tự kiểm chứng (chuỗi hash), một nghiệm "đúng hệ nhưng sai thứ tự" sẽ âm thầm cho flag rác: thiết kế verify-first cứu cả buổi tối.

### 5.3 Ghi chú nhỏ khác

- `Crypto.Util.number.long_to_bytes` = big-endian tối thiểu độ dài; tái tạo bằng `n.to_bytes((n.bit_length()+7)//8 or 1, 'big')` để verify chuỗi y hệt server.
- `ast.literal_eval` parse thẳng `output.txt` (int lớn, tuple, list: đều hợp lệ).
- fpylll `IntegerMatrix.from_matrix(list-of-lists)` nhận Python bigint bất kỳ; LLL dim 51 entries ~2^1304 mất **~52 giây**.

## 6. Code solver hoàn chỉnh

```python
#!/usr/bin/env python3
import ast, hashlib, re, sys
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from fpylll import IntegerMatrix, LLL

N_UNK = 30

def load(path):
    txt = open(path).read()
    return {name: ast.literal_eval(re.search(rf"^{name}\s*=\s*(.*)$", txt, re.M).group(1))
            for name in ("p", "pairs", "enc_flag")}

def check_chain(c):                       # c_{i+1} == int(sha256(bytes(c_i)))?
    cur = c[0]
    for i in range(1, N_UNK):
        raw = cur.to_bytes((cur.bit_length() + 7) // 8 or 1, 'big')
        nxt = int.from_bytes(hashlib.sha256(raw).digest(), 'big')
        if nxt != c[i]:
            return False
        cur = nxt
    return True

def main():
    ns   = load("/home/wr/A/reports/CRYP/MSS_ADVANCE Revenge/output (8).txt")
    p, pairs, (iv_hex, ct_hex) = ns["p"], ns["pairs"], ns["enc_flag"]
    m, n = len(pairs), N_UNK
    xs = [x % p for x, _ in pairs]
    y  = [yy % p for _, yy in pairs]

    # ---- lattice: rows [e_i | W*x_j^i | 0], [0 | W*p*e_j | 0], [0 | -W*y | 1]
    W, dim = 1 << 280, n + m + 1                       # 51
    B = [[0] * (dim + 1) for _ in range(dim)]
    for i in range(n):
        B[i][i] = 1
        for j in range(m):
            B[i][n + j] = (W * pow(xs[j], i, p)) % (W * p)
    for j in range(m):
        B[n + j][n + j] = W * p
    for j in range(m):
        B[dim - 1][n + j] = (-W * y[j]) % (W * p)
    B[dim - 1][dim] = 1                                # Kannan embedding

    M = IntegerMatrix.from_matrix(B)
    LLL.reduction(M)                                   # ~52s @ dim 51

    for r in range(dim):
        row = [M[r][k] for k in range(dim + 1)]
        if abs(row[-1]) != 1:
            continue
        sgn = row[-1]
        rev = [sgn * v for v in row[:n]]               # rev[k] = coeffs[29-k] !!
        c = rev[::-1]                                  # HOÁN NGƯỢC theo Horner
        if not all(v >= 0 and v.bit_length() <= 256 for v in c):
            continue                                   # filter nghiệm hợp lệ
        chain_ok = check_chain(c)
        # eval đúng chiều Horner: y = Σ c_k · x^(29-k)
        eval_ok = all(sum(pow(x, n - 1 - k, p) * c[k] for k in range(n)) % p == yy
                      for x, yy in zip(xs, y))
        print(f"[*] row {r}: chain={'PASS' if chain_ok else 'fail'} "
              f"eval={'PASS' if eval_ok else 'fail'}")
        if not (chain_ok and eval_ok):
            continue

        key = c[0].to_bytes(32, 'big')                 # MASTER_KEY
        flag = unpad(AES.new(key, AES.MODE_CBC, bytes.fromhex(iv_hex))
                     .decrypt(bytes.fromhex(ct_hex)), 16)
        print("[+] FLAG:", flag.decode())
        return 0
    print("[-] failed"); return 1

if __name__ == "__main__":
    sys.exit(main())
```

## 7. Kết quả chạy thật

```
$ python3 solve_mss.py
[*] row 0: chain=PASS eval=PASS
[+] FLAG: picoCTF{MSS_Advance_but_we_brought_it_back_and_made_it_harder!!!}
```

Số liệu xác thực từ run:

| Đại lượng | Giá trị |
|---|---|
| `p` (1024-bit prime) | `15023396336481112310256086989120444...847472198826669` |
| Row 0 sau LLL | `last=1`, head ≤ 256 bit, tail = 0 |
| Thời gian LLL (dim 51) | **51.6 s** |
| MASTER_KEY (hex) | `1d6466f4c437d790ef4ae9ba2c54cf8b406050f8853fb35ba96ad54bcd8edf0b` |
| `sha256(flag) == key` | **True** |
| Chuỗi 29 link hash | **True** |

Pipeline tổng quát hóa cho tham số khác: điều kiện khả thi xấp xỉ `m·log₂p > n·log₂B` (bit ràng buộc > bit ẩn) và `gap = det^(1/dim)/‖target‖ ≫ δ^dim`; ở đây 20480 > 7680 và gap 2^254: dư dả cả nghìn lần.

## 8. Bài học phòng thủ

1. **Đa thức bí mật với hệ số có cấu trúc là họa.** Ở đây hệ số "nhỏ" (256-bit) so với modulus (1024-bit) chính là lỗ hổng: nếu hệ số full-size mod p (1024-bit ngẫu nhiên), 20 cặp là an toàn thực sự. Kịch bản tương tự: RSA key nhỏ trong modulo lớn, DSA nonce thiếu entropy, ECDSA bias: tất cả chết bởi cùng một kiểu lattice.
2. **Hash-chain như PRG không cứu được** khi chính chuỗi đó trở thành oracle kiểm chứng: attacker dùng nó để định vị lỗi thứ tự và xác nhận nghiệm.
3. **IV cố định = 0** không phải lỗ hổng trực tiếp ở đây (key là đối tượng tấn công), nhưng là thói quen xấu; IV phải random-per-message.
4. Cho người làm CTF: **luôn xây bộ verify độc lập** (chain check): mâu thuẫn giữa "đáp án đúng hệ" và "đáp án sai chuỗi" là tín hiệu định vị bug nhanh nhất; và nhớ đọc kỹ vòng lặp đánh giá đa thức: Horner đảo chiều mũ so với trực giác.

---
*WRET26.*
