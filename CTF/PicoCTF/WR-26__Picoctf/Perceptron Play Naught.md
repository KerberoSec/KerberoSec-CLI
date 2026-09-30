<img width="1370" height="727" alt="image" src="https://github.com/user-attachments/assets/56300c20-af2f-4e05-a2b8-eca35159a051" />

# WRITEUP: Perceptron Play Naught

```
┌──────────────────────────────────────────────────────────────────────┐
│  Challenge : Perceptron Play Naught                                  │
│  Category  : Artificial Intelligence / AI Foundations I              │
│  Difficulty: Easy                                                    │
│  Author    : LT 'syreal' Jones                                       │
│  Flag      : academy{n4ught_bu7_53p4r4b13_8027b725}                  │
│  Method    : Đọc bảng điểm → nhận diện chiều có cấu trúc → SET tay   │
│  Commands   : 2 (SET + CHECK)                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## MỤC LỤC
1. [Tổng quan: biến vô nghiệm thành có nghiệm](#1-tổng-quan)
2. [Bước 1: Kết nối & đọc giao diện](#2-bước-1--kết-nối--đọc-giao-diện)
3. [Bước 2: Phân tích bảng điểm: chiều y mang cấu trúc](#3-bước-2--phân-tích-bảng-điểm)
4. [Bước 3: Suy ra đường thẳng tối ưu](#4-bước-3--suy-ra-đường-thẳng-tối-ưu)
5. [Bước 4: SET + CHECK nhận flag](#5-bước-4--set--check-nhận-flag)
6. [Flag](#6-flag)
7. [Ý nghĩa toán học: kernel trick thu nhỏ](#7-ý-nghĩa-toán-học-kernel-trick-thu-nhỏ)
8. [Vị trí trong series Perceptron](#8-vị-trí-trong-series-perceptron)

---

## 1. Tổng quan

> The points would be inseparable in just the x-dimension, but each point now
> has a new y-value so the set becomes linearly separable in 2D. Watch the
> ASCII plot update in real time as you tweak the perceptron weights and bias.
> **Separate the labeled points with a single line to earn the flag.**

Khác mọi bài trước trong series: **không phải chọn learning rate để train**: ở đây ta **tự tay đặt `w₁, w₂, b`** qua giao diện netcat cho tới khi đường
thẳng tách đúng toàn bộ điểm. Bài kiểm tra *hiểu hình học*, không phải *chạy
thuật toán*.

Đề cũng tự tiết lộ mấu chốt: x-values "borrowed from the 1D Charlie puzzle"
(không tách được theo x), nhưng **y mới chính là chìa khóa**.

---

## 2. Bước 1: Kết nối & đọc giao diện

```bash
nc aureolin-pixie.cylabacademy.net 57162
```

Giao diện ASCII với các lệnh:

| Lệnh | Chức năng |
|---|---|
| `SHOW` | Vẽ lại graph + bảng điểm |
| `SET w1 w2 b` | Đặt trực tiếp weight/bias |
| `ADJUST dw1 dw2 db` | Cộng offset vào weight hiện tại |
| `POINTS` | Liệt kê điểm + nhãn |
| `CHECK` | Kiểm tra tất cả; in flag nếu hoàn hảo |
| `RESET` | Về init `w=(1,−1), b=0` |

Trạng thái khởi tạo `w=(1,−1), b=0` sai 3/7 điểm (các `x` trên đồ thị).

---

## 3. Bước 2: Phân tích bảng điểm

Bảng điểm từ màn hình đầu:

```
point     label  perceptron  activation
(-4,-1)     0        0          -3
(-1,+2)     1        0          -3
(+0,-1)     0        1           1
(+0,+2)     1        0          -2
(+2,-1)     0        1           3
(+3,+1)     1        1           2
(+4,+2)     1        1           2
```

Sắp xếp lại theo nhãn và nhìn theo TỪNG CHIỀU riêng lẻ:

```
Chiều x:  -4(0)  -1(1)  0(0)  0(1)  2(0)  3(1)  4(1)
             ↑ x=0 chứa cả nhãn 0 lẫn 1 → KHÔNG tách được theo x

Chiều y:  -1(0)  -1(0)  -1(0)   |   +1(1)  +2(1)  +2(1)  +2(1)
             ↑ CẢ 3 điểm class 0 đều ở y=-1
             ↑ CẢ 4 điểm class 1 đều ở y ≥ +1
```

**Phát hiện then chốt:** chiều x là nhiễu (vô nghiệm như đề nói), nhưng
chiều y được thiết kế hoàn hảo: hai lớp nằm trên hai nửa mặt phẳng,
không có điểm nào ở `y = 0`.

---

## 4. Bước 3: Suy ra đường thẳng tối ưu

Muốn `pred(y) = 1 ⟺ y ≥ 1`, chọn weight bỏ hẳn x:

```
w₁ = 0        (x không đóng góp: loại bỏ nhiễu)
w₂ = 1        (activation tỉ lệ thuận với y)
b  = 0        (không cần dịch: không điểm nào nằm ở y=0)

activation = 0·x + 1·y + 0 = y
pred = 1 ⟺ y ≥ 0
```

Kiểm chứng từng điểm trước khi gửi:

| point | y | act=y | pred | label | ✓/✗ |
|---|---|---|---|---|---|
| (-4,-1) | -1 | -1 | 0 | 0 | ✓ |
| (+0,-1) | -1 | -1 | 0 | 0 | ✓ |
| (+2,-1) | -1 | -1 | 0 | 0 | ✓ |
| (-1,+2) | +2 | +2 | 1 | 1 | ✓ |
| (+0,+2) | +2 | +2 | 1 | 1 | ✓ |
| (+4,+2) | +2 | +2 | 1 | 1 | ✓ |
| (+3,+1) | +1 | +1 | 1 | 1 | ✓ |

7/7: đường ngang `y = 0` tách hoàn hảo.

---

## 5. Bước 4: SET + CHECK nhận flag

```
> SET 0 1 0

+4         |
+3         |
+2       1 1       1
+1         |     1
+0 / / / / / / / / /
-1 0       0   0
...
Current weights -> w1: 0, w2: 1, b: 0
→ toàn bộ hiển thị 0/1 đúng (không còn x nào)

> CHECK
Perfect! All points are classified correctly.
academy{n4ught_bu7_53p4r4b13_8027b725}
```

ASCII plot xác nhận: đường `/ / / /` chạy ngang tại y=0, mọi điểm đổi từ `x`
(thất bại) sang `0`/`1` (thành công).

---

## 6. Flag

```
academy{n4ught_bu7_53p4r4b13_8027b725}
```

*(Tên flag chơi chữ: "naught but separable" = "chỉ vậy thôi nhưng mà tách được")*

---

## 7. Ý nghĩa toán học: kernel trick thu nhỏ

Bài này minh họa trực quan một ý tưởng nền tảng của machine learning:

> Dữ liệu **không tách được** ở không gian thấp chiều có thể trở nên tách được
> khi **lift lên không gian cao hơn** có cấu trúc phù hợp.

```
Không gian 1D (chỉ x):     Không gian 2D (x,y):
-4  -1  0  0  2  3  4       các điểm tách sạch bởi y = 0
 0   1  0  1  0  1  1
   ✗ trộn lẫn                        ✅ tách được
```

Đây chính là nguyên lý của **kernel trick** trong SVM:
- XOR/parity không tách được bằng đường thẳng trong không gian gốc
- Nhưng chiếu sang đặc trưng mới (ví dụ `φ(x) = x·y`) thì có thể
- SVM với kernel RBF/poly làm việc này tự động ở không gian cực cao chiều

Trong bài: chiều y được "gắn" thủ công với thông tin đủ tốt (`y = ±1` theo
nhãn) → đường thẳng đơn giản nhất (ngang) giải quyết tất cả.

**So sánh với Hole in Middle:** bài đó thêm chiều dữ liệu nhưng vẫn giữ tính
vô nghiệm (tâm nằm trong bao lồi); bài này thêm chiều một cách *có chủ đích*
để phá vô nghiệm. Hai mặt của cùng một hiện tượng: **chiều cao không gian
không quyết định tính tách được: cấu trúc mới quyết định.**

---

## 8. Vị trí trong series Perceptron

| # | Bài | Kiểu tương tác | Kỹ năng cốt lõi |
|---|---|---|---|
| 1 | Hole in Middle | Web, chọn lr | Nhận dạng bài toán vô nghiệm |
| 2 | Classic 2 Alpha | Web, chọn lr ×5 | Tái sử dụng pipeline |
| 3 | Classic 1 | Web, chọn lr ×5 | Margin & hội tụ |
| 4 | Classic 0 | Web, chọn lr | Tutorial |
| 5 | 3-Bit Parity | Web, chọn lr (3D) | Parity & trần lý thuyết |
| **6** | **Play Naught** | **netcat, SET tay** | **Đọc hình học, suy đường phân cách** |

Play Naught là bài duy nhất **không dùng sweep**: vì tham số cần tìm là
*đường thẳng* (3 số thực) chứ không phải *learning rate* (1 số). Với 3 số
thực tự do, nhìn hình học rồi giải trực tiếp nhanh hơn mọi kiểu tìm kiếm.

Quy trình tổng quát hóa cho dạng này:
1. `POINTS` lấy danh sách đầy đủ
2. Tách từng chiều, tìm chiều có "khoảng trắng" giữa hai lớp
3. Đặt weight chỉ lên đúng chiều đó (`SET 0 1 b`)
4. `CHECK`: flag

---
*Writeup bởi WRET26*
