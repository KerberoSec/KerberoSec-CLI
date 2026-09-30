<img width="803" height="710" alt="image" src="https://github.com/user-attachments/assets/2f68ffcb-9f84-436e-a27f-06b1eaa46889" />

# WRITEUP: Perceptron Train Classic 0

```
┌──────────────────────────────────────────────────────────────────────┐
│  Challenge : Perceptron Train Classic 0                              │
│  Category  : Artificial Intelligence / AI Foundations I              │
│  Difficulty: Easy                                                    │
│  Author    : LT 'syreal' Jones                                       │
│  Flag      : academy{perceptron_classic_mode_3ddb3b37}               │
│  Method    : Pipeline chuẩn: lần thứ tư, không cần reverse lại gì   │
│  Requests  : 2 tổng cộng (1 config + 1 submit)                       │
│  Time      : ~60 giây                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## MỤC LỤC
1. [Tổng quan & vai trò trong series](#1-tổng-quan--vai-trò-trong-series)
2. [Phân tích dataset & khác biệt với Classic 1](#2-phân-tích-dataset--khác-biệt-với-classic-1)
3. [Bước 1: Recon config.json](#3-bước-1--recon-configjson)
4. [Bước 2: Sweep trên dải thu hẹp](#4-bước-2--sweep-trên-dải-thu-hẹp)
5. [Bước 3: Submit một phát ăn ngay](#5-bước-3--submit-một-phát-ăn-ngay)
6. [Flag](#6-flag)
7. [Tổng kết trọn bộ 4 bài Perceptron](#7-tổng-kết-trọn-bộ-4-bài-perceptron)
8. [Script solver hoàn chỉnh](#8-script-solver-hoàn-chỉnh)

---

## 1. Tổng quan & vai trò trong series

> This dataset is intentionally **gentle**, so many learning rates still
> converge quickly. Dial in a rate, trigger a run, and the interface will
> animate each step until every point is classified correctly.

Classic 0 là **bài mở đầu về mặt số hiệu nhưng dễ nhất toàn series**: đề bài
tự thừa nhận dataset "gentle" (dịu dàng). Yêu cầu đơn giản nhất:

- Chỉ cần **1 learning rate** đạt **100% accuracy** (không phải 5 như hai bản
  Classic trước)
- Dải lr cũng bị **thu hẹp**: `0.02 → 2.0` thay vì `0.02 → 20.0`

Đây là bài "tutorial thực thụ": nếu người chơi đi theo thứ tự 0 → Alpha → 1,
đây là chỗ học cơ chế; nếu đi ngược như chúng tôi (Hole in Middle → Alpha →
1 → 0), đây là phần thưởng nhẹ nhàng cuối chuỗi.

---

## 2. Phân tích dataset & khác biệt với Classic 1

So sánh trực tiếp `points` của hai bài:

```python
Classic 0 : [(-4,-2,0),(-3,-4,0),(-2,-3,0),(-3,-1,0),(3,4,1),(4,2,1),(2,3,1),(3,1,1)]
Classic 1 : [(-4,-2,0),(-3,-4,0),(-2,-3,0),(-3,-1,0),(3,4,1),(4,2,1),(2,3,1),(3,1,1)]
          # ↑ TƯƠNG ĐỒNG 100%: từng điểm, từng nhãn
```

**Dataset copy nguyên xi từ Classic 1.** Toàn bộ phân tích margin rộng vẫn
đúng giá trị:

```
  y
  4 │                       ⊕(3,4)
  3 │                  ⊕(2,3)
  2 │                            ⊕(4,2)
  1 │                          ⊕(3,1)
  0 └──────────────────────────────────── x
 -1 │      ⊖(-3,-1)
 -2 │   ⊖(-4,-2)
 -3 │         ⊖(-2,-3)
 -4 │      ⊖(-3,-4)
```

Hai cụm tách rời hoàn toàn qua hướng chéo; init `w=(1,−1), b=0` vuông góc
với hướng tách → mọi quỹ đạo update đều nhanh chóng hội tụ.

### Bảng khác biệt thực sự giữa Classic 0 và Classic 1

| Tham số | Classic 1 | **Classic 0** | Ý nghĩa |
|---|---|---|---|
| Dataset | 8 điểm cụm rời | Giống hệt | Margin rộng |
| `lrMin`: `lrMax` | 0.02: 20.0 | **0.02: 2.0** | Cắt bỏ vùng overshoot |
| `successTarget` | 5 | **(không có) = 1** | Chỉ cần 1 rate |
| Bộ đếm server | Có | Không | Submit xong là xong |

Nhận xét thú vị: việc cắt lrMax từ 20 xuống 2 ở đây **không làm mất winner
nào có ý nghĩa**: vì với dataset này dải 2.0-20.0 vốn đã thắng 100% ở
Classic 1. Server chỉ "làm cho đúng luật" của một bài nhập môn.

---

## 3. Bước 1: Recon config.json

```bash
curl -s --max-time 15 \
  "http://aureolin-pixie.cylabacademy.net:64354/config.json" | python3 -m json.tool
```

```json
{
  "points": [
    [-4,-2,0], [-3,-4,0], [-2,-3,0], [-3,-1,0],
    [3,4,1],   [4,2,1],   [2,3,1],   [3,1,1]
  ],
  "maxSteps": 16,
  "lrMin": 0.02,
  "lrMax": 2.0,
  "initialModel": { "weights": [1.0, -1.0], "bias": 0.0, "accuracy": 0.5 }
}
```

Lược đồ quen thuộc: `maxSteps=16`, init chuẩn, thiếu hẳn `successThreshold`
lẫn `successTarget` → mặc định đích = 1 run thành công.

---

## 4. Bước 2: Sweep trên dải thu hẹp

Simulator không đổi gì so với hai bài trước (chỉ dataset + cận lr):

```python
pts = [(-4,-2,0),(-3,-4,0),(-2,-3,0),(-3,-1,0),
       (3,4,1),(4,2,1),(2,3,1),(3,1,1)]

def perfect(lr):
    w = [1.0, -1.0]; b = 0.0
    for k in range(16):
        x, y, lab = pts[k % len(pts)]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        e = lab - pred
        if e:
            w[0] += lr*e*x; w[1] += lr*e*y; b += lr*e
    return all((1 if w[0]*x + w[1]*y + b >= 0 else 0) == lab
               for x, y, lab in pts)

winners, lr = [], 0.02
while lr <= 2.0:
    if perfect(lr):
        winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)
```

Kết quả:

```
[+] 199 winners: [0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09]
```

**199/199 giá trị hợp lệ đều thắng: tỷ lệ 100%**, trọn vẹn nhất quán với
Classic 1 (cùng dataset). Với margin rộng này, kể cả lr=0.02 "rùa bò" vẫn kịp
hội tụ trong 16 bước × 2 epoch.

---

## 5. Bước 3: Submit một phát ăn ngay

Chọn winner đầu tiên `lr=0.02` (giá trị an toàn tuyệt đối):

```bash
curl -s -X POST "http://aureolin-pixie.cylabacademy.net:64354/train" \
     -H "Content-Type: application/json" \
     -d '{"learningRate": 0.02}'
```

Response rút gọn:

```
acc=100%  success=True
FLAG: academy{perceptron_classic_mode_3ddb3b37}
```

---

## 6. Flag

```
academy{perceptron_classic_mode_3ddb3b37}
```

---

## 7. Tổng kết trọn bộ 4 bài Perceptron

Series khép lại với bức tranh thiết kế đề cực rõ nét: **một cơ chế duy nhất,
bốn cấu hình độ khó**:

| Bài | Dải lr | Margin | Ngưỡng đích | Số rate | Tỷ lệ lr thắng |
|---|---|---|---|---|---|
| Hole in Middle | 0.02-20 | ❌ vô nghiệm | ≥ 88.9% | 1 | 97.5% |
| Classic 2 Alpha | 0.02-20 | Hẹp | 100% | 5 | **16%** |
| Classic 1 | 0.02-20 | Rộng | 100% | 5 | 100% |
| **Classic 0** | 0.02-2.0 | Rộng | 100% | 1 | 100% |

### Ba bài học chiến lược xuyên suốt

1. **Reverse server trước khi chơi UI**: toàn bộ logic nằm ở `POST /train`;
   slider/canvas chỉ là da. Hai HTTP call thay cho cả giờ kéo slider.

2. **Diff artifact giữa các phần cùng series**: từ bài thứ hai trở đi,
   `diff app.js cũ mới` + so sánh lược đồ config cho biết ngay phần nào tái
   sử dụng được. Bài 3 và 4 gần như zero effort reverse.

3. **Sweep offline > binary search online**: hint của đề gợi ý binary search,
   nhưng sweep vét trả về *phân bố đầy đủ* các winner:
   - Biết ngay độ khó thật của đề qua tỷ lệ thắng (16% vs 97.5% vs 100%)
   - Đáp ứng mọi biến thể yêu cầu (1 rate, N rate khác nhau, khoảng giá trị…)
   - Tất định 100%, không phụ thuộc may rủi hay float kỳ

### Thời gian tổng kết thúc

| Bài | Thời gian giải | Số request online |
|---|---|---|
| Hole in Middle | ~2 phút | 2 |
| Classic 2 Alpha | ~2 phút | 7 |
| Classic 1 | ~90 giây | 6 |
| **Classic 0** | **~60 giây** | **2** |

---

## 8. Script solver hoàn chỉnh

```python
#!/usr/bin/env python3
"""Perceptron Classic 0 auto-solver: generic cho cả series"""
import json, urllib.request, sys

BASE = sys.argv[1] if len(sys.argv) > 1 else \
       "http://aureolin-pixie.cylabacademy.net:64354"

def get(path):
    with urllib.request.urlopen(BASE + path, timeout=15) as r:
        return json.loads(r.read())

def post(obj):
    req = urllib.request.Request(
        BASE + "/train", data=json.dumps(obj).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

cfg = get("/config.json")
pts   = cfg["points"]
steps = cfg["maxSteps"]
w0    = cfg["initialModel"]["weights"]
b0    = cfg["initialModel"]["bias"]
need  = cfg.get("successTarget", 1)          # Classic 0 không có → 1
thr   = cfg.get("successThreshold")           # Hole in Middle có → dùng

def score(lr):
    """Trả số điểm đúng cuối run."""
    w = list(w0); b = float(b0)
    for k in range(steps):
        x, y, lab = pts[k % len(pts)]
        pred = 1 if w[0]*x + w[1]*y + b >= 0 else 0
        e = lab - pred
        if e:
            w[0] += lr*e*x; w[1] += lr*e*y; b += lr*e
    return sum((1 if w[0]*x + w[1]*y + b >= 0 else 0) == lab
               for x, y, lab in pts)

def is_win(lr):
    n = len(pts)
    acc = score(lr) / n
    return acc == 1.0 if thr is None or thr == 1 else acc >= thr

# Sweep toàn dải
winners, lr = [], cfg["lrMin"]
while lr <= cfg["lrMax"]:
    if is_win(lr):
        winners.append(round(lr, 2))
    lr = round(lr + 0.01, 2)
print(f"[+] {len(winners)} winning rates")

# Submit đủ số rate
for lr in winners[:need]:
    res = post({"learningRate": lr})
    print(f"[*] lr={lr} acc={res['accuracy']*100:.0f}% success={res['success']}")
    if res.get("flag"):
        print("[FLAG]", res["flag"])
        break
```

Script này **chạy được cho cả 4 bài** chỉ bằng cách đổi URL: tham số hóa hết
qua config (`successThreshold`, `successTarget`, `lrMin/lrMax`, dataset).

---
*Writeup bởi WRET26*
