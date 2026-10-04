<img width="797" height="687" alt="image" src="https://github.com/user-attachments/assets/8439d6ef-b7b9-46a4-8503-ced34dfb1193" />

# 🧠 Perceptron Play Alpha: AI Foundations I (picoCTF)

> **Challenge:** "Play with the weights and bias of a 2D perceptron while watching an ASCII plot update in real time. Tune the parameters so that the decision boundary separates all of the labeled points and you will earn the flag."
>
> **Series:** AI Foundations I · **Độ khó:** Easy · **Loại:** Netcat / Simple ML
>
> **Kết nối:**
> ```
> $ nc aureolin-pixie.cylabacademy.net 58797
> ```
>
> **Flag:** `academy{11n34r1y_53p4r4813_6490425d}`

---

## 1. Tổng quan

Đây là một bài **machine learning cơ bản**: một **perceptron 2D** (single-layer perceptron) với 2 trọng số `w1, w2` và 1 bias `b`. Phần mềm vẽ đồ thị ASCII theo thời gian thực. Nhiệm vụ: chỉnh `(w1, w2, b)` sao cho **đường biên quyết định** (`w1·x + w2·y + b = 0`) phân tách đúng **toàn bộ điểm đã gán nhãn**, rồi gõ `CHECK` để nhận flag.

```
+4         |       /
+3         | x   /
+2         |   1
+1         | /   1
+0 - - - - / - - - -
-1       x |
-2 0 0 /   |
-3   /     |
-4 /       |
   -4-3-2-1+0+1+2+3+4

  point    label  perceptron  activation
  ------   -----  ----------  ----------
  (-3,-2)     0        0        -1
  (-1,-1)     0        1        0     ← misclassified (label 0, activation 0)
  (-4,-2)     0        0        -2
  (+3,+1)     1        1        2
  (+2,+2)     1        1        0
  (+1,+3)     1        0        -2    ← misclassified (label 1, activation -2)
```

---

## 2. Nhắc lại lý thuyết Perceptron

Một perceptron đơn giản tính **activation** (giá trị kích hoạt):

```
activation(x, y) = w1·x + w2·y + b
```

Quy tắc phân loại:

```
class = 1  nếu  w1·x + w2·y + b ≥ 0
class = 0  nếu  w1·x + w2·y + b < 0
```

**Đường biên quyết định (decision boundary)** là đường thẳng:

```
w1·x + w2·y + b = 0
```

Trong đồ thị ASCII, ký tự `/` là vị trí gần đúng của đường biên này, `0`/`1` là điểm phân loại đúng, `x` là điểm **phân loại sai**.

---

## 3. Các lệnh trong challenge

| Lệnh | Ý nghĩa |
|---|---|
| `SHOW` | vẽ lại đồ thị ASCII + bảng điểm |
| `SET w1 w2 b` | gán trực tiếp trọng số (hỗ trợ số thực) |
| `ADJUST dw1 dw2 db` | cộng thêm offset vào trọng số hiện tại |
| `POINTS` | liệt kê các điểm huấn luyện kèm nhãn |
| `CHECK` | kiểm tra; in flag khi tất cả điểm đúng |
| `RESET` | về trọng số ban đầu `w1=1, w2=-1, b=0` |
| `HELP` / `EXIT` | trợ giúp / thoát |

---

## 4. Phân tích dữ liệu

Trước tiên gõ `POINTS` (hoặc nhìn bảng trong `SHOW`) để lấy 6 điểm:

```
Label 0:   (-3,-2)   (-1,-1)   (-4,-2)
Label 1:   (+3,+1)   (+2,+2)   (+1,+3)
```

Tính nhanh tổng `x + y` của từng điểm:

| Điểm | label | `x+y` |
|---|---|---|
| (-3,-2) | 0 | **-5** |
| (-1,-1) | 0 | **-2** |
| (-4,-2) | 0 | **-6** |
| (+3,+1) | 1 | **+4** |
| (+2,+2) | 1 | **+4** |
| (+1,+3) | 1 | **+4** |

Nhận xét quan trọng:

- Mọi điểm **label 1** đều có `x + y ≥ 4`
- Mọi điểm **label 0** đều có `x + y ≤ -2`

→ Dữ liệu **linearly separable** với một đường chéo dốc lên `y = -x`. Khoảng trống giữa 2 lớp rất rộng (từ -2 đến +4), nên chỉ cần một đường thẳng **giữa** chúng.

---

## 5. Lời giải

Chọn perceptron:

```
w1 = 1,   w2 = 1,   b = 0
```

Tức ranh giới: `x + y = 0`.

**Kiểm chứng từng điểm:**

| Điểm | activation `x + y` | Kết luận |
|---|---|---|
| (-3,-2) | −3−2 = **−5** | < 0 → class 0 ✅ |
| (-1,-1) | −1−1 = **−2** | < 0 → class 0 ✅ |
| (-4,-2) | −4−2 = **−6** | < 0 → class 0 ✅ |
| (+3,+1) | 3+1 = **+4** | ≥ 0 → class 1 ✅ |
| (+2,+2) | 2+2 = **+4** | ≥ 0 → class 1 ✅ |
| (+1,+3) | 1+3 = **+4** | ≥ 0 → class 1 ✅ |

Tất cả 6/6 điểm đúng → gõ `CHECK`.

### Các lệnh:

```
SET 1 1 0
CHECK
```

### Kết quả:

```
> Perfect! All points are classified correctly.
academy{11n34r1y_53p4r4813_6490425d}
```

> ✅ **Flag:** `academy{11n34r1y_53p4r4813_6490425d}`

---

## 6. Tổng quát hóa (vì sao chọn được b = 0?)

Điều kiện cần thỏa cho **mọi** điểm (activation là hàm tuyến tính trong `w`):

```
Label 1  →  w1·x + w2·y + b ≥ 0
Label 0  →  w1·x + w2·y + b < 0
```

Với lựa chọn `w1 = 1, w2 = 1`:

- Label 1 có `x+y` nhỏ nhất = **4** → cần `4 + b ≥ 0` → `b ≥ -4`
- Label 0 có `x+y` lớn nhất = **-2** → cần `-2 + b < 0` → `b < 2`

→ **Mọi `b ∈ [-4, 2)` đều hợp lệ.** Chọn `b = 0` cho gọn đẹp. (Bạn cũng có thể chọn `b = -1` hoặc `b = 1`.)

**Cách làm tổng quát (tự động hóa):** nếu bài có nhiều điểm, giải hệ bất phương trình tuyến tính hoặc chạy perceptron-learning:

```python
points = [
    # (x, y, label)
    (-3,-2,0), (-1,-1,0), (-4,-2,0),
    (+3,+1,1), (+2,+2,1), (+1,+3,1),
]
w1, w2, b = 1, 1, 0.0
for epoch in range(20):
    err = 0
    for x, y, label in points:
        act = w1*x + w2*y + b
        pred = 1 if act >= 0 else 0
        if pred != label:
            err += 1
            # perceptron update rule
            if label == 1:
                w1 += x; w2 += y; b += 1
            else:
                w1 -= x; w2 -= y; b -= 1
    print(epoch, err, (w1, w2, b))
    if err == 0:
        print(f"OK  SET {w1} {w2} {b}")
        break
```

(Bản chất: perceptron hội tụ nếu dữ liệu linearly separable.)

---

## 7. Script tự động lấy flag

```python
import socket, time

s = socket.create_connection(("aureolin-pixie.cylabacademy.net", 58797), timeout=15)
f = s.makefile('rwb', buffering=0)
time.sleep(1.5)

# đọc banner / HELP
time.sleep(1)
f.read(1)  # flush

f.write(b"SET 1 1 0\n")
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
academy{11n34r1y_53p4r4813_6490425d}
```

---

## 8. Tổng kết

| Bước | Thao tác |
|---|---|
| 1 | `nc aureolin-pixie.cylabacademy.net 58797` |
| 2 | Xem `SHOW` / `POINTS` → 6 điểm, 2 nhãn |
| 3 | Nhận ra label 1 luôn có `x+y ≥ 4`, label 0 luôn có `x+y ≤ -2` |
| 4 | `SET 1 1 0` (đường biên `x+y=0`) |
| 5 | `CHECK` → flag |

**Flag:** `academy{11n34r1y_53p4r4813_6490425d}`

---

## 9. Điểm rút ra (takeaways)

- Perceptron chỉ học được **tập dữ liệu linearly separable** (`x` trong tên flag chính là **11n34r1y = linearly**).
- Kiểm tra phân tách tuyến tính bằng cách xem khoảng trống giữa 2 lớp theo một phép chiếu đơn giản (`x+y`).
- Với bài "Easy" này chỉ cần một đường thẳng, không cần neural network phức tạp.
