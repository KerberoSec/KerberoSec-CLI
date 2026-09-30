<img width="788" height="692" alt="image" src="https://github.com/user-attachments/assets/29a4fd73-8c09-468a-92e5-c2371bd855ad" />
# 🧮 Perceptron Play 1D Alpha: AI Foundations I (picoCTF)

> **Challenge:** "Play with the weight and bias of a 1D perceptron on a number line. Adjust the parameters until every labeled point is classified correctly and you will earn the flag."
>
> **Series:** AI Foundations I · **Độ khó:** Easy · **Loại:** Netcat / Simple ML
>
> **Kết nối:**
> ```
> $ nc aureolin-pixie.cylabacademy.net 65167
> ```
>
> **Flag:** `academy{0n3_d_thr35h0ld_f458f97b}`

---

## 1. Tổng quan

Đây là phiên bản **1 chiều** của chuỗi challenge "Perceptron Play": một perceptron đơn lớp hoạt động trên **trục số** (number line) với đúng **1 trọng số `w`** và **1 bias `b`**. Nhiệm vụ: chỉnh `(w, b)` sao cho **mọi điểm được gán nhãn** phân loại đúng, rồi gõ `CHECK` để nhận flag.

```
Number line (predictions):
    -4-3-2-1+0+1+2+3+4
     0 . 0 . x . 1 1 1
             ^

  x    label  perceptron  activation
  --   -----  ----------  ----------
  -4      0        0        -4
  -2      0        0        -2
  +0      0        1        0      ← misclassified: label 0 nhưng activation = 0
  +2      1        1        2
  +3      1        1        3
  +4      1        1        4
```

---

## 2. Lý thuyết Perceptron 1D

Với một điểm trên trục số có tọa độ `x`:

```
activation(x) = w·x + b
```

Quy tắc phân loại:

```
class = 1  nếu  w·x + b ≥ 0
class = 0  nếu  w·x + b < 0
```

**Điểm ranh giới (decision boundary)** là nghiệm của `w·x + b = 0`, tức:

```
x_boundary = -b / w
```

Trên trục số, ký hiệu `^` là vị trí boundary, `0`/`1` là điểm đúng, `x` là điểm sai.

---

## 3. Các lệnh

| Lệnh | Ý nghĩa |
|---|---|
| `SHOW` | vẽ lại trục số + bảng điểm |
| `SET w b` | đặt trực tiếp trọng số & bias (số thực OK) |
| `ADJUST dw db` | cộng offset vào `(w, b)` |
| `POINTS` | liệt kê điểm + nhãn |
| `CHECK` | kiểm tra; in flag khi tất cả đúng |
| `RESET` | về `w=1, b=0` |

---

## 4. Phân tích dữ liệu

Từ bảng `POINTS`:

| x | label | yêu cầu |
|---|---|---|
| -4 | 0 | `-4w + b < 0` |
| -2 | 0 | `-2w + b < 0` |
| **0** | **0** | **`b < 0`**  ← quan trọng nhất |
| +2 | 1 | `2w + b ≥ 0` |
| +3 | 1 | `3w + b ≥ 0` |
| +4 | 1 | `4w + b ≥ 0` |

Nhận xét then chốt:

- Tại `x = 0`, activation = `b` → **muốn phân loại `x=0` là class 0 thì phải có `b < 0`**.
- Điểm class 1 thấp nhất là `x = +2` → cần `2w + b ≥ 0` → `w ≥ -b/2 > 0`.
- Dữ liệu **linearly separable**: class 0 nằm trọn bên trái (`x ≤ 0`), class 1 nằm trọn bên phải (`x ≥ 2`).

→ Đường boundary chỉ cần nằm giữa `x = 0` và `x = 2`, ví dụ tại `x = 1`:

```
w = 1, b = -1   →   boundary = -b/w = 1
```

---

## 5. Lời giải

```
SET 1 -1
CHECK
```

**Kiểm chứng từng điểm với `w=1, b=-1`:**

| x | activation `x - 1` | Kết luận |
|---|---|---|
| -4 | -4−1 = **-5** | < 0 → class 0 ✅ |
| -2 | -2−1 = **-3** | < 0 → class 0 ✅ |
| 0 | 0−1 = **-1** | < 0 → class 0 ✅ |
| +2 | 2−1 = **+1** | ≥ 0 → class 1 ✅ |
| +3 | 3−1 = **+2** | ≥ 0 → class 1 ✅ |
| +4 | 4−1 = **+3** | ≥ 0 → class 1 ✅ |

**Kết quả:**

```
> Perfect! All points are classified correctly.
academy{0n3_d_thr35h0ld_f458f97b}
```

> ✅ **Flag:** `academy{0n3_d_thr35h0ld_f458f97b}`

---

## 6. Tổng quát hóa (khoảng giá trị hợp lệ của `w, b`)

Ràng buộc từ dữ liệu:

- Từ `x=0` (label 0): `b < 0`
- Từ `x=+2` (label 1): `2w + b ≥ 0` → `w ≥ -b/2`

Ví dụ các lựa chọn hợp lệ khác:

| `w` | `b` | boundary `-b/w` | Đúng? |
|---|---|---|---|
| 1 | -1 | 1 | ✅ |
| 2 | -1 | 0.5 | ✅ |
| 1 | -0.5 | 0.5 | ✅ |
| 0.5 | -0.5 | 1 | ✅ |

Mọi boundary nằm trong khoảng **`(0, 2]`** đều tách đúng 2 lớp.

**Script perceptron-learning tự tìm `(w, b)`:**

```python
points = [(-4,0), (-2,0), (0,0), (+2,1), (+3,1), (+4,1)]
w, b = 1.0, 0.0
for epoch in range(50):
    err = 0
    for x, label in points:
        act = w*x + b
        pred = 1 if act >= 0 else 0
        if pred != label:
            err += 1
            if label == 1:
                w += x; b += 1
            else:
                w -= x; b -= 1
    if err == 0:
        print(f"OK: SET {w} {b}  (boundary x = {-b/w})")
        break
```

---

## 7. Script tự động lấy flag (`solve.py`)

```python
import socket, time

HOST, PORT = "aureolin-pixie.cylabacademy.net", 65167

s = socket.create_connection((HOST, PORT), timeout=15)
f = s.makefile("rwb", buffering=0)
time.sleep(1.5)

# đọc banner
f.read(1)
time.sleep(0.5)

# boundary tại x = 1:  SET w=1, b=-1
f.write(b"SET 1 -1\n")
time.sleep(0.8)
f.write(b"CHECK\n")
time.sleep(2)

data = b""
s.settimeout(1)
while True:
    try:
        chunk = s.recv(4096)
        if not chunk:
            break
        data += chunk
    except socket.timeout:
        break

print(data.decode(errors="replace"))
s.close()
```

Chạy:

```bash
python3 solve.py
```

Output:

```
Perfect! All points are classified correctly.
academy{0n3_d_thr35h0ld_f458f97b}
```

---

## 8. Tổng kết

| Bước | Thao tác |
|---|---|
| 1 | `nc aureolin-pixie.cylabacademy.net 65167` |
| 2 | Xem `SHOW` / `POINTS` → 6 điểm trên trục số |
| 3 | Nhận ra `x=0` (label 0) buộc `b < 0`; `x=+2` (label 1) buộc `2w+b ≥ 0` |
| 4 | `SET 1 -1` → boundary tại `x = 1` |
| 5 | `CHECK` → flag |

**Flag:** `academy{0n3_d_thr35h0ld_f458f97b}`

---

## 9. Điểm rút ra (takeaways)

- Perceptron 1D chỉ học được tập **linearly separable** trên trục số (một ngưỡng đơn giản).
- Tên flag `0n3_d_thr35h0ld` = **one last threshold**: gợi ý đúng về việc chỉ cần 1 ngưỡng cắt `x ∈ (0, 2]`.
- Để ý điểm `x = 0`: activation đúng bằng `b` → đây là "mốc" nhanh nhất để suy ra dấu của bias.
