<img width="1348" height="713" alt="image" src="https://github.com/user-attachments/assets/a4b9f362-6ab4-48ca-971f-7bed542f57b8" />

# WRITEUP: Perceptron Train 3-Bit Parity

```
┌──────────────────────────────────────────────────────────────────────┐
│  Challenge : Perceptron Train 3-Bit Parity                           │
│  Category  : Artificial Intelligence / AI Foundations I              │
│  Difficulty: Easy                                                    │
│  Author    : LT 'syreal' Jones                                       │
│  Flag      : academy{3b1t_p4r1ty_unl34rn4bl3_l1n34rly_2f460071}      │
│  Method    : Nâng simulator lên 3D → sweep vét → phân bố điểm số     │
│  Requests  : 2 tổng cộng (1 config + 1 submit)                       │
│  Time      : ~2 phút                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## MỤC LỤC
1. [Tổng quan: XOR lớn lên 3 chiều](#1-tổng-quan-xor-lớn-lên-3-chiều)
2. [Lý thuyết: vì sao parity vô nghiệm với mặt phẳng](#2-lý-thuyết-vì-sao-parity-vô-nghiệm)
3. [Bước 1: Recon config.json & kiểm tra app.js](#3-bước-1--recon-configjson--kiểm-tra-appjs)
4. [Bước 2: Nâng simulator lên 3D](#4-bước-2--nâng-simulator-lên-3d)
5. [Bước 3: Sweep & PHÂN BỐ ĐIỂM SỐ (điểm nhấn)](#5-bước-3--sweep--phân-bố-điểm-số)
6. [Bước 4: Submit nhận flag](#6-bước-4--submit-nhận-flag)
7. [Flag](#7-flag)
8. [Vị trí trong series Perceptron](#8-vị-trí-trong-series-perceptron)
9. [Script solver GENERIC mọi số chiều](#9-script-solver-generic-mọi-số-chiều)

---

## 1. Tổng quan: XOR lớn lên 3 chiều

> Watch a perceptron learn on **3-bit parity** data... Because parity is not
> linearly separable by one plane, a single perceptron cannot hit 100%
> accuracy. **Reach 75% accuracy** to reveal the flag.

Parity (tính chẵn/lẻ) là dạng bài "kinh điển của sự vô nghiệm":

| Số bit | Hàm | Tên thường gọi | Tách tuyến tính? |
|---|---|---|---|
| 2 | chẵn số bit 1 | **XOR** | ❌ Không |
| 3 | chẵn số bit 1 | **XOR-3 / parity-3** | ❌ Không |

Đây chính là Hole-in-Middle phiên bản toán học "chính chủ": thay vì tự chế
hình vô nghiệm bằng vòng tròn quanh tâm, đề dùng hàm parity: hàm có **chứng
minh lý thuyết** là không thể biểu diễn bằng bất kỳ siêu phẳng nào.

---

## 2. Lý thuyết: vì sao parity vô nghiệm

### 2.1 Cấu trúc dữ liệu

8 đỉnh của khối lập phương `[-2,+2]³`, nhãn theo quy luật:

```
label = 1  nếu  x·y·z > 0   (số lượng tọa độ âm CHẴN)
label = 0  nếu  x·y·z < 0   (số lượng tọa độ âm LẺ)
```

Đối chiếu config:

```
(-2,-2,-2)→0  (-2,-2,+2)→1  (-2,+2,-2)→1  (-2,+2,+2)→0
(+2,-2,-2)→1  (+2,-2,+2)→0  (+2,+2,-2)→0  (+2,+2,+2)→1
```

Kiểm tra: `(-2)(-2)(2)=+8>0→1` ✓ · `(-2)³=-8<0→0` ✓: khớp 100%.

### 2.2 Chứng minh không có mặt phẳng tách được (phản chứng)

Giả sử tồn tại `(w₁,w₂,w₃,b)` sao cho mọi đỉnh đúng phía. Xét cặp đỉnh đối
xứng qua gốc: `v` và `-v` có `act(-v) = -act(v) + b`...

Cách nhìn gọn hơn qua **tính chất đổi dấu từng trục**: parity đổi giá trị
khi đảo MỘT tọa độ bất kỳ, nhưng phép đảo tọa độ `x → -x` chỉ cộng vào
activation một lượng `−2w₁x`. Muốn prediction lật đúng ở cả 4 đỉnh của mỗi
mặt, hệ ràng buộc dẫn đến `w₁ = w₂ = w₃ = 0`, khi đó activation = b hằng số: không thể cho 2 giá trị khác nhau. **Mâu thuẫn. ∎**

### 2.3 Trần 75% đến từ đâu?

Không đạt được 8/8. Vậy tối đa mấy điểm? **Sweep vét toàn bộ 1.999 giá trị lr
cho câu trả lời thực nghiệm dứt khoát** (mục 5): không run nào vượt 6/8.

Trực giác tổ hợp: mặt phẳng chia 8 đỉnh lập phương thành 2 nhóm; muốn "gần
đúng" với parity thì tốt nhất là giữ nguyên 4 đỉnh cùng dấu tích (`(±,±,±)`
tích dương: 4 đỉnh xen kẽ): nhưng 4 đỉnh tích âm còn lại nằm so le giữa
chúng, mặt phẳng nào cũng "ăn nhầm" ít nhất 2 đỉnh → trần 6/8 = 75%, đúng
bằng ngưỡng đề đưa ra. Đề thiết kế ngưỡng ĐÚNG BẰNG trần lý thuyết.

---

## 3. Bước 1: Recon config.json & kiểm tra app.js

```bash
curl -s "http://aureolin-pixie.cylabacademy.net:63630/config.json" | python3 -m json.tool
```

```json
{
  "points": [
    [-2,-2,-2,0], [-2,-2,2,1], [-2,2,-2,1], [-2,2,2,0],
    [2,-2,-2,1],  [2,-2,2,0],  [2,2,-2,0],  [2,2,2,1]
  ],
  "maxSteps": 16,
  "lrMin": 0.02, "lrMax": 20.0,
  "successThreshold": 0.75,
  "dimensions": 3,                    // ← trường mới báo số chiều!
  "initialModel": {
    "weights": [1.0, 1.0, 1.0],       // ← w có 3 thành phần
    "bias": 0.0, "accuracy": 0.25     // init chỉ đúng 2/8
  }
}
```

Kiểm tra nhanh quy tắc dự đoán trong `app.js`:

```js
function perceptronPredict(weights, bias, x, y, z) {   // ← thêm tham số z
  const activation = w1*x + w2*y + w3*z + bias;
  return activation >= 0 ? 1 : 0;                      // ≥0 vẫn là dương
}
```

**Kết luận:** cơ chế y hệt các bài trước, duy nhất mở rộng 2D → 3D:
- Update: `wᵢ ← wᵢ + lr·err·xᵢ` áp dụng cho cả ba thành phần
- Duyệt tuần tự `(step−1) % 8`, log cả bước err=0, 16 bước = đúng 2 epoch

## 4. Bước 2: Nâng simulator lên 3D

Thay đổi so với bản 2D chỉ là **khử cứng số chiều**: viết tổng quát theo
độ dài vector:

```python
pts = [(-2,-2,-2,0),(-2,-2,2,1),(-2,2,-2,1),(-2,2,2,0),
       (2,-2,-2,1),(2,-2,2,0),(2,2,-2,0),(2,2,2,1)]

def score(lr):
    w = [1.0, 1.0, 1.0]          # từ initialModel
    b = 0.0
    for k in range(16):
        *x, lab = pts[k % len(pts)]              # x là vector 3 chiều
        act   = sum(wi*xi for wi, xi in zip(w, x)) + b
        pred  = 1 if act >= 0 else 0             # ≥0 là dương (như cũ)
        e     = lab - pred
        if e:
            w = [wi + lr*e*xi for wi, xi in zip(w, x)]   # update cả 3 wᵢ
            b += lr*e
    return sum((1 if sum(wi*xi for wi, xi in zip(w, p[:-1])) + b >= 0 else 0)
               == p[-1] for p in pts)
```

Ba bất biến xuyên series vẫn giữ nguyên:
1. Thứ tự duyệt tuần tự `(step−1) % len(pts)`
2. Điều kiện biên `activation ≥ 0 → pred 1`
3. Chỉ update khi phân loại sai (`err ≠ 0`)

---

## 5. Bước 3: Sweep & PHÂN BỐ ĐIỂM SỐ

Sweep vét `lr ∈ [0.02, 20.00]` bước 0.01: nhưng lần này **ghi lại toàn bộ
phân bố điểm số**, không chỉ đếm winner:

```python
dist = {}
lr = 0.02
while lr <= 20.0:
    s = score(lr)
    dist[s] = dist.get(s, 0) + 1
    lr = round(lr + 0.01, 2)
```

Kết quả:

```
Phân bố điểm số cuối run trên toàn bộ 1999 giá trị lr:

  6/8 điểm đúng : ██████████████████████████████ 1708 lr  (85.4%)  ← WINNER
  2/8 điểm đúng : ████                             215 lr
  5/8 điểm đúng : █                                52 lr
  3/8 điểm đúng :                                   12 lr
  4/8 điểm đúng :                                   12 lr

→ MAX ACHIEVABLE = 6/8 = 75%  ·  không lr nào đạt 7/8 hay 8/8
```

### Ba phát hiện đáng giá từ phân bố:

1. **75% là trần tuyệt đối**: quét hết mọi learning rate mà không run nào
   chạm 7/8. Đây là bằng chứng thực nghiệm khẳng định lý thuyết mục 2: parity
   không thể vượt ngưỡng này bằng một siêu phẳng, và đề đặt ngưỡng **sát trần**.

2. **Cấu trúc hai chế độ (bimodal)**: hoặc rơi vào cửa sổ tốt 6/8 (85.4%),
   hoặc kẹt ở vùng thấp 2-5/8. Không có dải chuyển động mượt giữa hai vùng.
   Lý do: parity xen kẽ đỉnh hoàn hảo: boundary hoặc "lọt" qua khe xen kẽ
   (ăn được 6), hoặc bị kẹt sai hẳn phía (chỉ ăn 2).

3. **Winner xuất hiện thành các dải rời**: `[0.16-0.18]`, `[0.25-0.28]`,
   `[3.00: ...]`...: mỗi dải ứng một "kiểu hội tụ" khác nhau của quỹ đạo
   update sau 16 bước, không liên tục vì số bước hữu hạn + dữ liệu đối xứng.

Chọn **lr = 0.16**: winner đầu tiên.

---

## 6. Bước 4: Submit nhận flag

```bash
curl -s -X POST "http://aureolin-pixie.cylabacademy.net:63630/train" \
     -H "Content-Type: application/json" \
     -d '{"learningRate": 0.16}' | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('accuracy:', round(d['accuracy']*100,1), '% success:', d['success'])
print('FLAG:', d.get('flag'))"
```

Output:

```
accuracy: 75.0 % success: True
FLAG: academy{3b1t_p4r1ty_unl34rn4bl3_l1n34rly_2f460071}
```

Tên flag tự xác nhận chủ đề: *"3bit parity: unlearnable linearly"*.

---

## 7. Flag

```
academy{3b1t_p4r1ty_unl34rn4bl3_l1n34rly_2f460071}
```

---

## 8. Vị trí trong series Perceptron

| Bài | Số chiều | Tính tách được | Trần điểm | Ngưỡng đề | Tỷ lệ lr thắng |
|---|---|---|---|---|---|
| Hole in Middle | 2 | ❌ | 88.9% | = trần | 97.5% |
| Classic 2 Alpha | 2 | ✅ mép hẹp | 100% | = trần | 16% |
| Classic 1 | 2 | ✅ rộng | 100% | = trần | 100% |
| Classic 0 | 2 | ✅ rộng | 100% | = trần | 100% |
| **3-Bit Parity** | **3** | ❌ (parity) | **75%** | = trần | **85.4%** |

Quy luật nhất quán của cả series: **ngưỡng đích luôn đặt bằng trần lý thuyết
của dataset**. Người chơi không cần may mắn: cần hiểu đúng cơ chế. Khác biệt
duy nhất giữa các bài là *cách tạo ra sự vô nghiệm*:
- Hole in Middle: vô nghiệm hình học (tâm trong bao lồi)
- 3-Bit Parity: vô nghiệm đại số (hàm parity bậc cao hơn siêu phẳng)

Và pipeline giải giống hệt nhau đến từng dòng code, chỉ thay số chiều.

---

## 9. Script solver GENERIC mọi số chiều

Bản nâng cấp cuối cùng: đọc số chiều từ config, chạy cho **mọi bài** trong
series (2D hay 3D, threshold kiểu tỉ lệ hay kiểu đếm):

```python
#!/usr/bin/env python3
"""Perceptron universal auto-solver: mọi số chiều, mọi kiểu đích"""
import json, urllib.request, sys

BASE = sys.argv[1]
def get(p):
    with urllib.request.urlopen(BASE+p, timeout=15) as r: return json.loads(r.read())
def post(o):
    rq = urllib.request.Request(BASE+"/train", data=json.dumps(o).encode(),
         headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(rq, timeout=15) as r: return json.loads(r.read())

cfg   = get("/config.json")
pts   = cfg["points"]                      # mỗi điểm [x..., label]
steps = cfg["maxSteps"]
w     = list(cfg["initialModel"]["weights"])
b0    = float(cfg["initialModel"]["bias"])
need  = cfg.get("successTarget", 1)
thr   = cfg.get("successThreshold")        # None nếu dùng successTarget

def final_correct(lr):
    wv = list(w); b = b0
    for k in range(steps):
        *x, lab = pts[k % len(pts)]
        pred = 1 if sum(a*b_ for a,b_ in zip(wv,x)) + b >= 0 else 0
        e = lab - pred
        if e:
            wv = [a + lr*e*xi for a, xi in zip(wv, x)]
            b += lr*e
    return sum((1 if sum(a*b_ for a,b_ in zip(wv,p[:-1])) + b >= 0 else 0)==p[-1]
               for p in pts)

def is_win(lr):
    acc = final_correct(lr) / len(pts)
    if thr is not None and thr != 1:  return acc >= thr      # kiểu threshold
    return acc == 1.0                                        # kiểu 100%

winners, lr = [], cfg["lrMin"]
while lr <= cfg["lrMax"]:
    if is_win(lr): winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)
print(f"[+] {len(winners)} winners")

for lr in winners[:need]:
    res = post({"learningRate": lr})
    print(f"[*] lr={lr} acc={res['accuracy']*100:.1f}%")
    if res.get("flag"):
        print("[FLAG]", res["flag"]); break
```

Usage:
```bash
python3 solve.py http://host:port/    # hoạt động cho cả 5 bài đã gặp
```

---
*Writeup bởi WRET26 *
